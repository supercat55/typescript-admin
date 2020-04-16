import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Form, InputNumber, Select, Spin, Button } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import PageWrapper from '@/components/PageWrapper';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { formItemLayout, submitFormLayout } from '@/utils/config';
import { PAYMENT_MODE_TYPES } from '@/utils/const';

const FormItem = Form.Item;
const { Option } = Select;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  submitLoading: boolean;
}

interface IState {
  mode: string;
  id: string;
  visible: boolean;
}

@connect(({ loading, paymentMode }) => ({
  pageLoading: loading.models['paymentMode'],
  unusedFeeTypeList: paymentMode.unusedFeeTypeList
}))
class PaymentModeActionsPage extends PureComponent<IProps, IState> {
  state = {
    mode: 'create',
    id: this.props.match.params && this.props.match.params.id,
    visible: false,
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
      type: 'paymentMode/getUnusedFeeTypeList'
    })

    if (id && mode !== 'create') {
      let result = await dispatch({
        type: 'paymentMode/getPaymentModeDetail',
        payload: { id }
      })
      this.handleFullBaseInfo(result)
    }
  }

  handleFullBaseInfo = result => {
    const { form, dispatch } = this.props;

    dispatch({
      type: 'paymentMode/concatFeeTypeList',
      payload: result.list
    })

    form.setFieldsValue({ paymentMode: result.mode })

    const detail = {
      feeTypeIds: [],
    }
    
    for(let i in result.list) {
      let item = result.list[i];

      detail.feeTypeIds.push(item.id)
    }

    if (result.mode === 1) {
      detail['minFee'] = result.minFee / 100;
      detail['maxTimes'] = result.maxTimes
    }

    form.setFieldsValue(detail)
  }

  handleSubmit = e => {
    e.preventDefault();
    const { id, mode } = this.state;
    const { form, dispatch } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { paymentMode, feeTypeIds, minFee, maxTimes } = values;

      const params = {
        mode: paymentMode,
        feeTypeIds,
      }

      if (minFee) {
        params['minFee'] = minFee * 100;
      }
      if (maxTimes) {
        params['maxTimes'] = maxTimes;
      }

      if (id && mode === 'edit') {
        params['id'] = id

        dispatch({
          type: 'paymentMode/editPaymentMode',
          payload: params
        });
        
        return;
      }

      await dispatch({
        type: 'paymentMode/createPaymentMode',
        payload: params
      })
    })
  }

  handleCancel = () => {
    router.goBack();
  }

  render() {
    const { mode } = this.state;
    const { pageLoading, form: { getFieldDecorator, getFieldValue }, unusedFeeTypeList } = this.props;
    const paymentMode = getFieldValue('paymentMode') === undefined ? 2 : getFieldValue('paymentMode');
    
    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '支付模式')}
        showBack
        customBreadcrumbmap={[
          { name: '角色权限管理', url: '' },
          { name: '运营账号', url: '/payment/mode' },
          { name: GetPageTitleByMode(mode, '支付模式') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form {...formItemLayout} onSubmit={this.handleSubmit}>
            <FormItem label={'支付模式'}>
              {getFieldDecorator('paymentMode', {
                initialValue: 2,
                rules: [
                  { required: true, message: '请选择支付模式' },
                ]
              })(
                <Select 
                  placeholder='请选择支付模式'
                  disabled={mode === 'detail'}
                >
                  {PAYMENT_MODE_TYPES.map(item => (
                    <Option value={item.value} key={item.value}>{item.label}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label={'支付模式'}>
              {getFieldDecorator('feeTypeIds', {
                rules: [
                  { required: true, message: '请选择支付模式' },
                ]
              })(
                <Select 
                  mode="multiple"
                  placeholder='请选择至少一个费用类型'
                  disabled={mode === 'detail'}
                >
                  {unusedFeeTypeList.map(item => (
                    <Option value={item.id} key={item.id}>{item.feeName}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
            {
              paymentMode !== 2 ?
              (
                <Fragment>
                  <FormItem label='首次最低支付金额'>
                    {getFieldDecorator('minFee', {
                      rules: [
                        { required: true, message: '请输入最低支付金额' }
                      ],
                    })(
                      <InputNumber min={1} precision={2} placeholder="可输入至小数点后两位" disabled={mode == 'detail'} style={{ width: '100%' }}/>
                    )}
                  </FormItem>
                  <FormItem label='最大拆分笔数'>
                    {getFieldDecorator('maxTimes', {
                      rules: [
                        { required: true, message: '请选择拆分笔数' }
                      ],
                    })(
                      <InputNumber min={2} precision={0} placeholder="请输入拆分笔数" disabled={mode == 'detail'} style={{ width: '100%' }}/>
                    )}
                  </FormItem>
                </Fragment>
              ) : null
            }
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

export default Form.create()(PaymentModeActionsPage);
