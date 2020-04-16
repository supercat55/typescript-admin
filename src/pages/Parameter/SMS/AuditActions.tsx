import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Form, Input, Select, Spin, Button, Tooltip, Icon } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import PageWrapper from '@/components/PageWrapper';
import FooterToolbar from '@/components/FooterToolbar';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { formItemLayout } from '@/utils/config';
import { SMS_TEMP_TYPES } from '@/utils/const';

const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  allFeeTypeList: any[]
}

interface IState {
  mode: string;
  id: string;
}

@connect(({ loading, sms }) => ({
  pageLoading: loading.models['sms'],
  smsFeeTypeList: sms.smsFeeTypeList,
}))
class SMSAuditActionsPage extends PureComponent<IProps, IState> {
  state = {
    mode: 'detail',
    id: this.props.match.params && this.props.match.params.id,
  }

  componentDidMount() {
    const urlParams = GetPageQuery();
    const mode = urlParams.mode ? urlParams.mode : '';

    this.setState({ mode }, this.init)
  }

  init = async() => {
    const { id, mode } = this.state;
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'sms/getSMSTemplateDetail',
      payload: { templateId: id }
    })

    if (result) {
      this.handleFullBaseInfo(result);
      this.handleGetFeeTypeList(result['merchantId'])
    }
  }

  handleGetFeeTypeList = async(merchantId) => {
    const { dispatch } = this.props;

    await dispatch({
      type: 'sms/getSMSFeeTypeList',
      payload: { merchantId }
    })
  }

  handleFullBaseInfo = result => {
    const { form } = this.props;

    Object.keys(form.getFieldsValue()).forEach(key => {
      let obj = {};
      obj[key] = result[key];
      form.setFieldsValue(obj);
    });
  }

  handleSubmit = (status) => {
    const { id } = this.state;
    const { form, dispatch } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { auditingRemark } = values;

      const params = {
        templateId: id,
        status
      }

      if (auditingRemark) {
        params['auditingRemark'] = auditingRemark
      }

      dispatch({
        type: 'sms/auditSMSTemplate',
        payload: params
      })
    })
  }


  handleCancel = () => {
    router.goBack();
  }

  render() {
    const { mode } = this.state;
    const { pageLoading, form: { getFieldDecorator }, smsFeeTypeList } = this.props;
    const feeTypeList = [{ id: '1', feeName: '通用'}].concat(smsFeeTypeList);
    // form set必须要先已存在的值
    getFieldDecorator('merchantId', { initialValue: '' });

    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '短信模板')}
        showBack
        customBreadcrumbmap={[
          { name: '参数管理', url: '' },
          { name: '短信模板管理', url: '/parameter/sms' },
          { name: GetPageTitleByMode(mode, '短信模板') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form {...formItemLayout}>
            <FormItem label={'模板序号'}>
              {getFieldDecorator('templateId')(
                <Input disabled/>
              )}
            </FormItem>
            <FormItem label={'发布范围'}>
              {getFieldDecorator('merchantName')(
                <Input disabled/>
              )}
            </FormItem>
            <FormItem label={'短信模板类型'}>
              {getFieldDecorator('templateType')(
                <Select disabled>
                  {SMS_TEMP_TYPES.map(item => (
                    <Option key={item.value} value={item.value}>{item.label}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label={'费用类型'}>
              {getFieldDecorator('feeTypeId')(
                <Select disabled>
                  {feeTypeList.map(item => (
                    <Option key={item.id} value={item.id}>{item.feeName}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label={'短信模板内容'}>
              {getFieldDecorator('templateContent')(
                <TextArea rows={4} disabled/>
              )}
              <Tooltip placement="top" title={'字数超过70个汉字可能分成多条短信发送'}>
                <Icon type="info-circle" theme='filled' style={{ position: 'absolute', right: '-30px', top: '-50px', fontSize: '14px', color: '#1890FF' }}/>
              </Tooltip>
            </FormItem>
            {
              mode === 'detail' &&
              <FormItem label={'状态'}>
                {getFieldDecorator('isValidDesc')(
                  <Input disabled/>
                )}
              </FormItem>
            }
            <FormItem label={'创建人'}>
              {getFieldDecorator('userName')(
                <Input disabled/>
              )}
            </FormItem>
            <FormItem label={'创建时间'}>
              {getFieldDecorator('createTime')(
                <Input disabled/>
              )}
            </FormItem>
            <FormItem label={"审核意见"}>
              {getFieldDecorator('auditingRemark')(
                <TextArea rows={4} disabled={mode === 'detail'} placeholder="请输入..."/>
              )}
            </FormItem>
            {
              mode === 'detail' &&
              <Fragment>
                 <FormItem label={'审核人'}>
                  {getFieldDecorator('auditingUserName')(
                    <Input disabled/>
                  )}
                </FormItem>
                <FormItem label={'审核时间'}>
                  {getFieldDecorator('auditingTime')(
                    <Input disabled/>
                  )}
                </FormItem>
              </Fragment>
            }
          </Form>  
          <FooterToolbar>
            {mode !== 'detail' && <Button type="primary" onClick={() => this.handleSubmit(2)}>通过</Button>}
            {mode !== 'detail' && <Button onClick={() => this.handleSubmit(3)}>驳回</Button>}
            <Button onClick={this.handleCancel}>{mode === 'audit' ? '取消' : '返回'}</Button>
          </FooterToolbar>
        </Spin>
      </PageWrapper>
    )
  }
};

export default Form.create()(SMSAuditActionsPage);
