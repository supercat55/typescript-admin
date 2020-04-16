import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Decimal } from 'decimal.js';
import moment from 'moment';
import { Form, Input, InputNumber, Select, Spin, DatePicker, Button, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import { CreateBillType } from '@/services/bill';
import PageWrapper from '@/components/PageWrapper';
import BillAddress from '../component/BillAddress';
import { formItemLayout, submitFormLayout } from '@/utils/config';

const FormItem = Form.Item;
const { Option } = Select;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  submitLoading: boolean;
  allFeeTypeList: any[];
}

interface IState {
  visible: boolean;
}

@connect(({ menu, loading, global }) => ({
  allFeeTypeList: global.allFeeTypeList,
  pageLoading: loading.models['billDetail'],
}))
class CreateBillPage extends PureComponent<IProps, IState> {
  state = {
    visible: false
  }

  componentDidMount() {
    this.init();
  }

  init = async() => {
    const { dispatch } = this.props;

    await dispatch({
      type: 'global/getAllFeeTypeList'
    })
  }

  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { houseId, feeTypeId, billName, pushTime, billAmount, paidAmount, showDescribtion, overdueTime, lateFeeTime, feeRate } = values;

      const params: CreateBillType = {
        houseId,
        feeTypeId,
        billName,
        billAmount: new Decimal(billAmount).mul(100),
        pushTime: pushTime.startOf('day').unix() * 1000,
      }

      if (paidAmount) {
        params['paidAmount'] = new Decimal(paidAmount).mul(100);
      }
      if (showDescribtion) {
        params['showDescribtion'] = showDescribtion;
      }
      if (overdueTime) {
        params['overdueTime'] = overdueTime.unix() * 1000;
      }
      if (lateFeeTime) {
        params['lateFeeTime'] = lateFeeTime.unix() * 1000;;
      }
      if (feeRate) {
        params['feeRate'] = feeRate;
      }

      if (paidAmount > billAmount) {
        message.info('已缴金额不能大于账单金额');
        return;
      }
      if (moment(overdueTime).isAfter(lateFeeTime)) {
        message.info('滞纳金生成日不能小于账单逾期开始日');
        return;
      }

      dispatch({
        type: 'billDetail/createSingleBill',
        payload: params
      })
    })
  }

  handleCancel = () => {
    router.goBack();
  }

   // 选择房屋modal确认事件
   handleModalOk = (selectedRowKeys, selectedRow) => {

    this.props.form.setFieldsValue({
      houseId: selectedRow[0].id,
      paymentAddress: selectedRow[0].address
    })

    this.handleModalCancel();
  }

  // 选择房屋modal取消事件
  handleModalCancel = () => {
    this.setState({
      visible: false
    })
  }

  render() {
    const { visible } = this.state;
    const { pageLoading, form: { getFieldDecorator }, allFeeTypeList } = this.props;
    getFieldDecorator('houseId', { initialValue: '' })

    return (
      <PageWrapper 
        title='单个添加'
        showBack
        customBreadcrumbmap={[
          { name: '账单管理', url: '' },
          { name: '账单明细管理', url: '/bill/detail' },
          { name: '单个添加' },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form {...formItemLayout} onSubmit={this.handleSubmit}>
            <FormItem label={'缴费地址'}>
              {getFieldDecorator('paymentAddress',{
                rules: [
                  { required: true, message: '请输入缴费地址' },
                ]
              })(
                <Input placeholder="请输入缴费地址" onClick={() => this.setState({ visible: true })} autoComplete="off"/>
              )}
            </FormItem>
            <FormItem label={'费用类型'}>
              {getFieldDecorator('feeTypeId',{
                rules: [
                  { required: true, message: '请选择费用类型' },
                ]
              })(
                <Select placeholder="请选择费用类型">
                  {allFeeTypeList.map(item => (
                    <Option value={item.id} key={item.id}>{item.feeName}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label={'账单名称'}>
              {getFieldDecorator('billName',{
                rules: [
                  { required: true, message: '请输入账单名称' },
                ]
              })(
                <Input placeholder='请输入账单名称'/>
              )}
            </FormItem>
            <FormItem label={'账单金额'}>
              {getFieldDecorator('billAmount', {
                rules: [
                  { required: true, message: '请输入账单金额' },
                ]
              })(
                <InputNumber placeholder="最小精确到分" precision={2} style={{ width: '100%' }}/>
              )}
            </FormItem>
            <FormItem label={'已缴金额'}>
              {getFieldDecorator('paidAmount')(
                <InputNumber placeholder="最小精确到分" precision={2} style={{ width: '100%' }}/>
              )}
            </FormItem>
            <FormItem label={'展示说明'}>
              {getFieldDecorator('showDescribtion', {
                rules: [{ max: 30, message: '不能超过30个字' }]
              })(
                <Input placeholder="不超过30个字"/>
              )}
            </FormItem>
            <FormItem label={'账单推送日'}>
              {getFieldDecorator('pushTime',{
                rules: [{ required: true, message: '请选择账单推送日期' }]
              })(
                <DatePicker placeholder="请选择账单推送日" style={{ width: '100%' }}/>
              )}
            </FormItem>
            <FormItem label={'账单逾期开始日'}>
              {getFieldDecorator('overdueTime')(
                <DatePicker placeholder="请选择账单逾期开始日" style={{ width: '100%' }}/>
              )}
            </FormItem>
            <FormItem label={'滞纳金生成日'}>
              {getFieldDecorator('lateFeeTime')(
                <DatePicker placeholder="请选择滞纳金生成日" style={{ width: '100%' }}/>
              )}
            </FormItem>
            <FormItem label={'滞纳金日累计为未缴金额的万分之'}>
              {getFieldDecorator('feeRate')(
                <InputNumber min={1} placeholder="请输入滞纳金利率（整数）" precision={0} style={{ width: '100%' }}/>
              )}
            </FormItem>
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button type="primary" htmlType="submit">提交</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleCancel}>
                返回
              </Button>
            </FormItem>
          </Form>

          <BillAddress 
            visible={visible}
            onConfirm={this.handleModalOk}
            onCancel={this.handleModalCancel}
          />
        </Spin>
      </PageWrapper>
    )
  }
};

export default Form.create()(CreateBillPage);
