import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Form, Input, Select, Spin, Tooltip, Icon, Button, Modal } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import PageWrapper from '@/components/PageWrapper';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { formItemLayout, submitFormLayout } from '@/utils/config';
import { ORGANIZ_PROPERTY_TYPES_DESC } from '@/utils/const';
import { AuthMerchantActionsType } from '@/services/auth';
import { Debounce, Bind } from 'lodash-decorators';
import REGEX from '@/utils/regex';

import styles from './index.scss';

const FormItem = Form.Item;
const { Option } = Select;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  submitLoading: boolean;
  globalPageSubMenu: any;
  roleListByAttribute: any[]
}

interface IState {
  mode: string;
  id: string;
  visible: boolean;
  userId: string;
}

@connect(({ menu, loading, authMerchant, global }) => ({
  bindMerchantList: authMerchant.bindMerchantList,
  globalPageSubMenu: menu.globalPageSubMenu,
  roleListByAttribute: global.roleListByAttribute,
  pageLoading: loading.models['authMerchant'],
}))
class AuthMerchantActionsPage extends PureComponent<IProps, IState> {
  state = {
    mode: 'create',
    id: this.props.match.params && this.props.match.params.id,
    visible: false,
    userId: ''
  }

  componentDidMount() {
    const urlParams = GetPageQuery();
    const mode = urlParams.mode ? urlParams.mode : '';

    this.setState({ mode }, this.init)
  }

  init = async() => {
    const { id, mode } = this.state;
    const { dispatch } = this.props;

    await dispatch({
      type: 'authMerchant/getBindMerchantList'
    });

    await dispatch({
      type: 'global/getAuthRoleListByAttribute',
      payload: { roleAttribute: 1 }
    })

    if (id && mode !== 'create') {
      let result = await dispatch({
        type: 'authMerchant/getAuthMerchantDetail',
        payload: { id }
      })

      this.handleFullBaseInfo(result)
    }
  }

  handleFullBaseInfo = detail => {
    const { form } = this.props;

    Object.keys(form.getFieldsValue()).forEach(key => {
      let obj = {};
      obj[key] = detail[key];
      form.setFieldsValue(obj);
    });

    this.setState({
      userId: detail.userId
    })
  }

  @Bind()
  @Debounce(500)
  async handleValidateAccountNum(rule, value, next) {
    const { mode } = this.state;
    const { dispatch, form: { setFields } } = this.props;

    if (value && mode === 'create') {
      let result = await dispatch({
        type: 'authMerchant/validateAccount',
        payload: {
          accountNum: value
        }
      })

      if (Number(result) === 0) {
        setFields({
          accountNum: {
            value,
            errors: [new Error('账号ID重复')],
          }
        })
        return;
      }
    }

    next()
  }

  @Bind()
  @Debounce(500)
  async handleValidatePhone(rule, value, next) {
    const { mode, userId } = this.state;
    const { dispatch, form: { setFields } } = this.props;

    if (value) {
      const params = {
        phoneNum: value
      }

      if (mode === 'edit' && userId) {
        params['userId'] = userId
      }
      let result = await dispatch({
        type: 'authMerchant/validateAccount',
        payload: params
      })

      if (Number(result) === 0) {
        setFields({
          phoneNum: {
            value,
            errors: [new Error('登录手机号重复')],
          }
        })
        return;
      }
    }

    next()
  }

  handleSubmit = e => {
    e.preventDefault();
    const { id, mode } = this.state;
    const { form, dispatch } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { merchantId, accountNum, name, roleId, phoneNum, email } = values;

      const params: AuthMerchantActionsType = {
        merchantId,
        accountNum,
        name,
        roleId
      }

      if (phoneNum) {
        params['phoneNum'] = phoneNum.trim();
      }
      if (email) {
        params['email'] = email;
      }

      if (id && mode === 'edit') {
        params['id'] = id

        dispatch({
          type: 'authMerchant/editAuthMerchant',
          payload: params
        });
        
        return;
      }

      let result = await dispatch({
        type: 'authMerchant/createAuthMerchant',
        payload: params
      })

      if (result) {
        Modal.success({
          width: 658,
          title: '新增成功',
          content: (
            <div className={styles['modal-container']}>
              <p className={styles['sub-title']}>以下信息将用于相关人员的账号登录，请妥善保存。</p>
              <div className={styles['account-info']}>
                <div className={styles['account-info-item']}>
                  <span className={styles['account-info-label']}>账号ID：</span>
                  <span className={styles['account-info-desc']}>{result['accountNum']}</span>
                </div>
                <div className={styles['account-info-item']}>
                  <span className={styles['account-info-label']}>初始密码：</span>
                  <span className={styles['account-info-desc']}>{result['initialPassword']}</span>
                </div>
              </div>
            </div>
          ),
          onOk: this.handleCancel
        });
      }
    })
  }

  handleCancel = () => {
    router.goBack();
  }

  render() {
    const { mode } = this.state;
    const { bindMerchantList, roleListByAttribute, pageLoading, form: { getFieldDecorator } } = this.props;

    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '运营账号')}
        showBack
        customBreadcrumbmap={[
          { name: '角色权限管理', url: '' },
          { name: '运营账号', url: '/auth/operation' },
          { name: GetPageTitleByMode(mode, '运营账号') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form {...formItemLayout} onSubmit={this.handleSubmit}>
            <FormItem label={'绑定商户'}>
              {getFieldDecorator('merchantId', {
                rules: [{ required: true, message: '请选择绑定商户' }]
              })(
                <Select 
                  placeholder="请选择绑定商户" 
                  showSearch
                  optionFilterProp="children"
                  disabled={mode === 'detail'}
                >
                  {bindMerchantList.map(item => (
                    <Option value={item.id} key={item.id}>{item.merchantName}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label={'账号ID'} hasFeedback>
              {getFieldDecorator('accountNum',{
                getValueFromEvent: (event) => event.target.value.trim(),
                rules: [
                  { required: true, message: '账号ID不能为空' },
                  { max: 20, message: '账号ID不能超过20个字' },
                  { validator: this.handleValidateAccountNum }
                ]
              })(
                <Input disabled={mode !== 'create'} placeholder="请输入账号ID" autoComplete="off"/>
              )}
            </FormItem>
            <FormItem label={'姓名'}>
              {getFieldDecorator('name', {
                getValueFromEvent: (event) => event.target.value.trim(),
                rules: [
                  { required: true, message: '账号姓名不能为空' },
                  { max: 10, message: '账号姓名不能超过10个字' }
                ]
              })(
                <Input disabled={mode === 'detail'} placeholder="不超过10个字" autoComplete="off"/>
              )}
            </FormItem>
            <FormItem label={'账号角色'}>
              {getFieldDecorator('roleId', {
                rules: [{ required: true, message: '请选择角色' }]
              })(
                <Select 
                  placeholder="请选择角色" 
                  showSearch
                  optionFilterProp="children"
                  disabled={mode === 'detail'}
                >
                  {roleListByAttribute.map(item => (
                    <Option value={item.id} key={item.id}>{item.name}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label={'登录手机号'}>
              <div style={{ position: 'relative' }} >
                {getFieldDecorator('phoneNum', {
                  getValueFromEvent: (event) => event.target.value.trim(),
                  rules: [
                    { pattern: REGEX.MOBILE, message: '手机号格式不正确' },
                    { validator: this.handleValidatePhone }
                  ]
                })(
                  <Input disabled={mode === 'detail'} placeholder="填写后可作为登录账号" autoComplete="off"/>
                )}
                <Tooltip placement="top" title={'手机号将用于接收登录密码和登录。建议填写，否则忘记密码后无法自主找回！'}>
                  <Icon type="info-circle" theme="filled" style={{ position: 'absolute', top: '13px' ,right: '-40px', fontSize: '14px', color: '#1890FF' }}/>
                </Tooltip>
              </div>
            </FormItem>
            <FormItem label={'邮箱'}>
              {getFieldDecorator('email', {
                getValueFromEvent: (event) => event.target.value.trim(),
                rules: [
                  { pattern: REGEX.EMAIL, message: '邮箱格式不正确' },
                ]
              })(
                <Input disabled={mode === 'detail'} placeholder="请输入邮箱" autoComplete="off"/>
              )}
            </FormItem>
            <FormItem label={'初始密码'}>
              {getFieldDecorator('initialPassword')(
                <Input disabled placeholder="提交后可查看初始密码"/>
              )}
            </FormItem>
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              {mode !== 'detail' && <Button type="primary" htmlType="submit">提交</Button>}
              <Button style={{ marginLeft: 8 }} onClick={this.handleCancel}>
                返回
              </Button>
            </FormItem>
          </Form>
        </Spin>
      </PageWrapper>
    )
  }
};

export default Form.create()(AuthMerchantActionsPage);
