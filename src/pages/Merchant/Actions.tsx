import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import moment from 'moment';
import { connect } from 'dva';
import { Form, Card, Row, Col, Input, Select, Spin, Switch, Button, Cascader, InputNumber } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import { cloneDeep } from 'lodash';
import PageWrapper from '@/components/PageWrapper';
import FooterToolbar from '@/components/FooterToolbar';
import TableForm from './TableForm';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { MERCHANT_TYPES, MERCHANT_BUSINESS_TYPES } from '@/utils/const';
import REGEX from '@/utils/regex';

const CityData = require('@/utils/city.json');

const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;
interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  submitLoading: boolean;
  payCodeList: any[];
  allOrganizationList: any[];
}

interface IState {
  mode: string;
  id: string;
}

@connect(({ merchant, loading, global }) => ({
  allOrganizationList: global.allOrganizationList,
  sceneAppIdList: merchant.sceneAppIdList,
  payCodeList: global.payCodeList,
  pageLoading: loading.models['merchant'],
}))
class MerchantActionsPage extends PureComponent<IProps, IState> {
  state = {
    mode: 'create',
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
    let result;

    await dispatch({
      type: 'global/getAllOrganizationList'
    })

    await dispatch({
      type: 'merchant/getSceneAppIdList'
    })

    await dispatch({
      type: 'global/getPaycodeList',
    })
    
    if (mode === 'audit' || mode === 'auditDetail') {
      result = await dispatch({
        type: 'merchant/getMerchantAuditDetail',
        payload: { id }
      })
    } else if (mode === 'detail' || mode === 'edit'){
      result = await dispatch({
        type: 'merchant/getMerchantInformationDetail',
        payload: { id }
      })
    }

    if (result) {
      this.handleFullBaseInfo(result);
    }
  }

  handleFullBaseInfo = result => {
    const { form } = this.props;
    const { province = '', city = '', area = '', list = [] } = result;

    const newDetail = {
      address: [province, city, area],
      sendMessages: Boolean(Number(result.sendMessages)),
      sendPush: Boolean(Number(result.sendPush)),
      // isRoleauthority注意和新增有大小写区别
      isRoleauthority: Boolean(Number(result.isRoleauthority)),
      auditTime: result.auditTime ? moment(new Date(result.auditTime)).format('YYYY-MM-DD HH:mm:ss') : '-'
    }
    
    const baseInfo = Object.assign(result, newDetail)

    Object.keys(form.getFieldsValue()).forEach(key => {
      let obj = {};
      obj[key] = baseInfo[key];
      form.setFieldsValue(obj);
    });
  }

  handleFeeTableChange = value => {
    const { form } = this.props;

    form.setFieldsValue({
      feeList: value
    });
  }

  // type 1:不通过 2:通过
  handleAudit = type => {
    const { id } = this.state;
    const { dispatch, form } = this.props;
    const auditOpinion = form.getFieldValue('auditOpinion');

    const params = {
      id,
      auditStatus: type
    }

    if (auditOpinion) {
      params['auditOpinion'] = auditOpinion
    }

    dispatch({
      type: 'merchant/auditMerchant',
      payload: params
    })
  }

  handleSubmit = () => {
    const { mode, id } = this.state;
    const { form, dispatch } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { 
        businessRegistrationName,
        merchantName,
        merchantNum,
        address,
        street,
        mcc,
        superiorMerchantNum,
        merchantType,
        expandingName,
        expandingWalletPhone,
        orgId,
        businessBusinessType, 
        receiptCodeNumber, 
        sendMessages, 
        sendPush, 
        isRoleauthority,
        settlementAccountNumber,
        settlementAccountName,
        settlementAccountBank,
        settlementAccountOpenNumber,
        feeList
      } = values;

      const params = {
        businessRegistrationName,
        merchantName,
        merchantNum,
        province: address[0],
        city: address[1],
        area: address[2],
        street,
        merchantType,
        expandingName,
        expandingWalletPhone,
        orgId,
        businessBusinessType: businessBusinessType,
        sendMessages: Number(sendMessages),
        sendPush: Number(sendPush),
        isRoleauthority: Number(isRoleauthority)
      }
      if (mcc) {
        params['mcc'] = mcc
      }
      if (superiorMerchantNum) {
        params['superiorMerchantNum'] = superiorMerchantNum
      }
      if (receiptCodeNumber) {
        params['receiptCodeNumber'] = receiptCodeNumber
      }
      if (settlementAccountNumber) {
        params['settlementAccountNumber'] = settlementAccountNumber
      }
      if (settlementAccountName) {
        params['settlementAccountName'] = settlementAccountName
      }
      if (settlementAccountBank) {
        params['settlementAccountBank'] = settlementAccountBank
      }
      if (settlementAccountOpenNumber) {
        params['settlementAccountOpenNumber'] = settlementAccountOpenNumber
      }
      if (feeList.length) {
        const newData = cloneDeep(feeList);
        let list = newData.map(item => {
          delete item.id;
          delete item.editable;
          item.fixedCost = item.fixedCost ? Number(item.fixedCost).toFixed(2) : '0.00';
          item.percentageCost = item.percentageCost ? Number(item.percentageCost).toFixed(2) : '0.00';
          return item;
        })
        params['feeList'] = list
      }

      if (mode === 'edit') {
        params['id'] = id;

        dispatch({
          type: 'merchant/editMerchantInformation',
          payload: params
        })
      } else {
        dispatch({
          type: 'merchant/createMerchantInformation',
          payload: params
        })
      }
    })
  }

  handleCancel = () => {
    router.goBack();
  }

  render() {
    const { mode } = this.state;
    const { pageLoading, form: { getFieldDecorator }, allOrganizationList, sceneAppIdList, payCodeList } = this.props;
    const disabled = mode !== 'create';
    
    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '商户信息')}
        showBack
        customBreadcrumbmap={[
          { name: '商户管理', url: '' },
          { name: '商户信息管理', url: '/merchant/manage' },
          { name: GetPageTitleByMode(mode, '商户信息') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form>
            <Card title={'业务信息'} bordered={false}>
              <Row gutter={40}>
                <Col span={8}>
                  <FormItem label={'工商注册名称'}>
                    {getFieldDecorator('businessRegistrationName', {
                      rules: [{ required: true, message: '请输入工商注册名称' }]
                    })(
                      <Input placeholder='请输入工商注册名称' disabled={disabled}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'商户名称'}>
                    {getFieldDecorator('merchantName', {
                      rules: [{ required: true, message: '请输入商户名称' }]
                    })(
                      <Input placeholder='请输入商户名称' disabled={disabled}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'商户编号'}>
                    {getFieldDecorator('merchantNum', {
                      rules: [
                        { required: true, message: '请输入商户编号' },
                        { min: 5, message: '商户编号不能小于5位' },
                        { max: 20, message: '商户编号不能大于20位' }
                      ]
                    })(
                      <Input placeholder='请输入商户编号' style={{ width: '100%' }} type='number' disabled={disabled}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'企业所在省市'}>
                    {getFieldDecorator('address', {
                      rules: [{ required: true, message: '请选择小区省/市/区' }]
                    })(
                      <Cascader 
                        disabled={mode !== 'create' && mode !== 'edit'}
                        options={CityData}
                        placeholder='请选择小区省/市/区' 
                        fieldNames={{ label: 'name', value: 'name' }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'企业所在地址'}>
                    {getFieldDecorator('street', {
                      rules: [{ required: true, message: '请输入企业所在地址' }]
                    })(
                      <Input placeholder='请输入企业所在地址' disabled={mode !== 'create' && mode !== 'edit'}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'MCC'}>
                    {getFieldDecorator('mcc')(
                      <Input placeholder='请输入mcc' disabled={disabled}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'上级集团商户号'}>
                    {getFieldDecorator('superiorMerchantNum')(
                      <Input placeholder='请输入上级集团商户号' disabled={disabled}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'商户类型'}>
                    {getFieldDecorator('merchantType', {
                      rules: [{ required: true, message: '请输入工商注册名称' }]
                    })(
                      <Select placeholder='请选择商户类型' disabled={disabled}>
                        {
                          MERCHANT_TYPES.map(item => (
                            <Option key={item.value} value={item.value}>{item.label}</Option>
                          ))
                        }
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'拓展人姓名'}>
                    {getFieldDecorator('expandingName', {
                      rules: [{ required: true, message: '请输入拓展人姓名' }]
                    })(
                      <Input placeholder='请输入拓展人姓名' disabled={disabled}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'拓展人通联钱包手机号'}>
                    {getFieldDecorator('expandingWalletPhone', {
                      rules: [
                        { required: true, message: '请输入拓展人通联钱包手机号' },
                        { pattern: REGEX.MOBILE, message: '手机号格式不正确' },
                      ]
                    })(
                      <Input placeholder='请输入拓展人通联钱包手机号' disabled={disabled}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'所属组织'}>
                    {getFieldDecorator('orgId', {
                      rules: [{ required: true, message: '请选择所属组织' }]
                    })(
                      <Select placeholder='请选择所属组织' disabled={disabled}>
                        {
                          allOrganizationList.map(item => (
                            <Option key={item.id} value={item.id}>{item.name}</Option>
                          ))
                        }
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'商户业务类型'}>
                    {getFieldDecorator('businessBusinessType', {
                      rules: [
                        { required: true, message: '请选择商户业务类型' }
                      ]
                    })(
                      <Select placeholder="请选择商户业务类型" disabled={mode !== 'create' && mode !== 'edit'}>
                        {MERCHANT_BUSINESS_TYPES.map(item => (
                          <Option value={item.value} key={item.value}>{item.label}</Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'收款码对应场景编号'}>
                    {getFieldDecorator('receiptCodeNumber')(
                      <Select placeholder='请选择收款码对应场景编号' disabled={mode !== 'create' && mode !== 'edit'}>
                        {sceneAppIdList.map(item => (
                          <Option value={item.id} key={item.id}>{item.sourceName}</Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'是否支持发送短信'}>
                    {getFieldDecorator('sendMessages', {
                      valuePropName: 'checked',
                      initialValue: true
                    })(
                      <Switch checkedChildren="开" unCheckedChildren="关" disabled={mode !== 'create' && mode !== 'edit'}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'是否支持通联钱包推送'}>
                    {getFieldDecorator('sendPush', {
                      valuePropName: 'checked',
                      initialValue: true
                    })(
                      <Switch checkedChildren="开" unCheckedChildren="关" disabled={mode !== 'create' && mode !== 'edit'}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'是否需要建角色权限'}>
                    {getFieldDecorator('isRoleauthority', {
                      valuePropName: 'checked',
                      initialValue: true
                    })(
                      <Switch checkedChildren="开" unCheckedChildren="关" disabled={mode !== 'create' && mode !== 'edit'}/>
                    )}
                  </FormItem>
                </Col>
              </Row>
             </Card>

             <Card title={'结算信息'} bordered={false}>
              <Row gutter={40}>
                <Col span={12}>
                  <FormItem label="结算账户号">
                    {getFieldDecorator('settlementAccountNumber')(
                      <Input placeholder='请输入结算账户号' disabled={disabled}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="结算账户名称">
                    {getFieldDecorator('settlementAccountName')(
                      <Input placeholder='请输入结算账户名称' disabled={disabled}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="结算账户所属银行">
                    {getFieldDecorator('settlementAccountBank')(
                      <Input placeholder='请输入结算账户所属银行' disabled={disabled}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="结算账户开户行行号">
                    {getFieldDecorator('settlementAccountOpenNumber')(
                      <Input placeholder='请输入结算账户所属银行' disabled={disabled}/>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Card>
            {
              mode !== 'audit' && mode !== 'auditDetail' ?
              <Card title='结算手续费配置'>
                <FormItem>
                  {getFieldDecorator('feeList', {
                    initialValue: []
                  })(
                    <TableForm
                      disabled={mode !== 'edit' && mode !== 'create'}
                      payCodeList={payCodeList}
                      onChange={this.handleFeeTableChange}
                    />
                  )}
                </FormItem>
              </Card> : null
            }
            {
              mode === 'auditDetail' &&
              <Card title='审核商户' bordered={false}>
                <Row gutter={40}>
                  <Col span={12}>
                    <FormItem label={'审核人'}>
                      {getFieldDecorator('auditUserName')(
                        <Input disabled/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label={'审核时间'}>
                      {getFieldDecorator('auditTime')(
                        <Input disabled/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label={'审核意见'}>
                      {getFieldDecorator('auditOpinion')(
                        <TextArea rows={4} disabled/>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Card>
            }
            {
              mode === 'audit' &&
              <Card title='审核商户' bordered={false}>
                <Row>
                  <Col span={12}>
                    <FormItem label={'审核意见'}>
                      {getFieldDecorator('auditOpinion')(
                        <TextArea rows={4} placeholder="请输入" />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={6}>
                    <Button type="primary" onClick={() => this.handleAudit(2)} style={{marginRight: '8px'}}>审核通过</Button>
                    <Button onClick={() => this.handleAudit(1)}>审核不通过</Button>
                  </Col>
                </Row>
              </Card>
            }
          </Form>          
          <FooterToolbar>
            {mode === 'create' || mode === 'edit' ? <Button type="primary" onClick={this.handleSubmit}>提交</Button> : null}
            <Button onClick={this.handleCancel}>{mode === 'create' || mode === 'edit' ? '取消' : '返回'}</Button>
          </FooterToolbar>
        </Spin>
      </PageWrapper>
    )
  }
};

export default Form.create()(MerchantActionsPage);
