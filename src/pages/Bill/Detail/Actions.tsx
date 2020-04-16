import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import moment from 'moment';
import { Decimal } from 'decimal.js';
import { connect } from 'dva';
import { Form, Card, Row, Col, Input, Select, Spin, DatePicker, Button, InputNumber } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import StandardTable from '@/components/StandardTable';
import PageWrapper from '@/components/PageWrapper';
import FooterToolbar from '@/components/FooterToolbar';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { BILL_STATUS, BILL_OVERDUN_STATUS } from '@/utils/const';

const FormItem = Form.Item;
const Option = Select.Option;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  submitLoading: boolean;
}

interface IState {
  mode: string;
  id: string;
  overdueList: any[];
  orderList: any[];
  refundList: any[];
}

@connect(({ loading }) => ({
  pageLoading: loading.models['billDetail'],
}))
class BillDetailActionsPage extends PureComponent<IProps, IState> {
  state = {
    mode: 'detail',
    id: this.props.match.params && this.props.match.params.id,
    overdueList: [],
    orderList: [],
    refundList: [],
  }

  lateFeeLogColumns = [
    { title: '日期', dataIndex: 'createTime', key: 'createTime', width: '50%',
      render: text => (
        <span>{text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : ''}</span>
      )
    },
    { title: '滞纳金金额', dataIndex: 'amount', key: 'amount', width: '50%',
      render: text => (
        <span>{text ? '￥ ' + (text / 100) : ''}</span>
      )
    }
  ]

  paymentDetailsColumns = [
    { title: '业务订单编号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '业务订单金额', dataIndex: 'amount', key: 'amount',
      render: text => (<span>{text ? '￥ ' + (text / 100) : 0}</span>)
    },
    { title: '支付人信息', dataIndex: 'payPhone', key: 'payPhone' },
    { title: '支付方式', dataIndex: 'payTypeName', key: 'payTypeName' },
    { title: '来源场景', dataIndex: 'sourceScene', key: 'sourceScene' },
    { title: '支付时间', dataIndex: 'paymentTime', key: 'paymentTime',
      render: text => (<span>{text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : ''}</span>)
    },
    { title: '缴费备注', dataIndex: 'remarks', key: 'remarks' },
    { title: '支付订单号', dataIndex: 'payOrderNo', key: 'payOrderNo' },
  ]

  refundColumns = [
    { title: '记录时间', dataIndex: 'createTime', key: 'createTime',
      render: text => (
        <span>{text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : ''}</span>
      )
    },
    { title: '退款金额', dataIndex: 'amount', key: 'amount',
      render: text => (
        <span>{text ? '￥ ' + (text / 100) : ''}</span>
      )
    },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
  ]

  componentDidMount() {
    const urlParams = GetPageQuery();
    const mode = urlParams.mode ? urlParams.mode : '';

    this.setState({ mode }, this.init)
  }

  init = async() => {
    const { id } = this.state;
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'billDetail/getBillDetail',
      payload: { id }
    })

    if (result) {
      this.handleFullBaseInfo(result);
    }
  }

  handleFullBaseInfo = result => {
    const { form } = this.props;
    const { payAddress = {}, overdueList = [], orderList = [], refundList = [] } = result;

    const newDetail = {
      billAmount: result.billAmount / 100,
      paidAmount: result.paidAmount / 100,
      unpaidAmount: result.unpaidAmount / 100,
      actualAmount: result.actualAmount / 100,
      address: `${payAddress.communityName}${payAddress.buildingNo}-${payAddress.unitNo}-${payAddress.accountNo}`,
      createTime: result.createTime ? moment(result.createTime) : null,
      overdueTime: result.overdueTime ? moment(result.overdueTime) : null,
      overdueAmount: result.overdueAmount / 100,
      pushTime: result.pushTime ? moment(result.pushTime) : null,
      cancelTime: result.cancelTime ? moment(result.cancelTime): null,
      writeOffTime: result.writeOffTime ? moment(result.writeOffTime): null,
    }
    
    const baseInfo = Object.assign(result, newDetail)

    Object.keys(form.getFieldsValue()).forEach(key => {
      let obj = {};
      obj[key] = baseInfo[key];
      form.setFieldsValue(obj);
    });

    this.setState({
      overdueList,
      orderList,
      refundList
    })
  }

  handleSubmit = () => {
    const { id } = this.state;
    const { form, dispatch } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { unpaidAmount, billName, modifyDescribtion, pushTime, showDescribtion } = values;

      const params = {
        id,
        unpaidAmount: new Decimal(unpaidAmount).mul(100),
        billName,
        modifyDescribtion,
        pushTime: pushTime.startOf('day').unix() * 1000,
        showDescribtion,
      }

      dispatch({
        type: 'billDetail/editBill',
        payload: params
      })
    })
  }

  handleCancel = () => {
    router.goBack();
  }

  render() {
    const { mode, overdueList, orderList, refundList } = this.state;
    const { pageLoading, form: { getFieldDecorator } } = this.props;

    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '账单明细')}
        showBack
        customBreadcrumbmap={[
          { name: '账单管理', url: '' },
          { name: '账单明细管理', url: '/bill/detail' },
          { name: GetPageTitleByMode(mode, '账单明细') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form hideRequiredMark>
            <Card title={'账单信息'} bordered={false}>
              <Row gutter={40}>
                <Col span={8}>
                  <FormItem label={'账单号'}>
                    {getFieldDecorator('billNum')(
                      <Input disabled/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'商户号'}>
                    {getFieldDecorator('merchantId')(
                      <Input disabled/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'账单金额'}>
                    {getFieldDecorator('billAmount')(
                      <Input disabled/>
                  )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'账单状态'}>
                    {getFieldDecorator('status')(
                      <Select disabled>
                        {BILL_STATUS.map(item => (
                          <Option value={item.value} key={item.value}>{item.label}</Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'已缴金额'}>
                    {getFieldDecorator('paidAmount')(
                      <Input disabled/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'待缴金额'}>
                    {getFieldDecorator('unpaidAmount', {
                      rules: [{ required: true, message: '请输入代缴金额' }]
                    })(
                      <InputNumber disabled={mode === 'detail'} min={0} precision={2} style={{ width: '100%' }}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'账单名称'}>
                    {getFieldDecorator('billName', {
                      rules: [{ required: true, message: '请输入账单名称' }]
                    })(
                      <Input disabled={mode === 'detail'}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'费用类型'}>
                    {getFieldDecorator('feeTypeName')(
                      <Input disabled/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'待缴金额修改人'}>
                    {getFieldDecorator('modifyName')(
                      <Input disabled/>
                    )}
                  </FormItem>
                </Col>
                <Col span={16}>
                  <FormItem label={'待缴金额修改说明'}>
                    {getFieldDecorator('modifyDescribtion', {
                      initialValue: ''
                    })(
                      <Input disabled={mode === 'detail'} placeholder='请输入待缴金额修改说明'/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'缴费地址'}>
                    {getFieldDecorator('address')(
                      <Input disabled/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'账单生成时间'}>
                    {getFieldDecorator('createTime')(
                      <DatePicker disabled style={{ width: '100%' }} format="YYYY-MM-DD"/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'业主姓名'}>
                    {getFieldDecorator('ownerName')(
                      <Input disabled/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'业主电话'}>
                    {getFieldDecorator('ownerPhone')(
                      <Input disabled/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'账单逾期日'}>
                    {getFieldDecorator('overdueTime')(
                      <DatePicker disabled style={{ width: '100%' }}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'逾期天数'}>
                    {getFieldDecorator('overdueDays')(
                      <Input disabled/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'逾期状态'}>
                    {getFieldDecorator('isOverdue')(
                      <Select disabled>
                        {BILL_OVERDUN_STATUS.map(item => (
                          <Option value={item.value} key={item.value}>{item.label}</Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'滞纳金'}>
                    {getFieldDecorator('overdueFine')(
                      <Input disabled/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'账单推送日'}>
                    {getFieldDecorator('pushTime', {
                      rules: [{ required: true, message: '请选择账单推送日 '}]
                    })(
                      <DatePicker disabled={mode === 'detail'} style={{ width: '100%' }} format="YYYY-MM-DD" />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'账单撤销时间'}>
                    {getFieldDecorator('writeOffTime')(
                      <DatePicker disabled style={{ width: '100%' }} />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'规则编号'}>
                    {getFieldDecorator('billAutoNum')(
                      <Input disabled/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'展示说明'}>
                    {getFieldDecorator('showDescribtion', {
                      initialValue: ''
                    })(
                      <Input disabled={mode === 'detail'} placeholder='请输入'/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'撤销说明'}>
                    {getFieldDecorator('cancelDescribtion')(
                      <Input disabled/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'撤销人'}>
                    {getFieldDecorator('cancelName')(
                      <Input disabled/>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Card>

            <Card title={'滞纳金日志'} bordered={false}>
              <StandardTable
                rowKey={'id'}
                columns={this.lateFeeLogColumns}
                dataSource={overdueList}
                pagination={false}           
              />
            </Card>
                    
            <Card title={'支付明细'} bordered={false}>
              <StandardTable
                rowKey={'id'}
                columns={this.paymentDetailsColumns}
                dataSource={orderList}
                pagination={false}           
              />
            </Card>

            <Card title={'退款记录'} bordered={false}>
              <StandardTable
                rowKey={'id'}
                columns={this.refundColumns}
                dataSource={refundList}
                pagination={false}           
              />
            </Card>
          </Form>          
          <FooterToolbar>
            {mode === 'edit' && <Button type="primary" onClick={this.handleSubmit}>提交</Button>}
            <Button onClick={this.handleCancel}>{mode === 'edit' ? '取消' : '返回'}</Button>
          </FooterToolbar>
        </Spin>
      </PageWrapper>
    )
  }
};

export default Form.create()(BillDetailActionsPage);
