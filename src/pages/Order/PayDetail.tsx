import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Spin, Card, Row, Col, Input, Select, Button, DatePicker, Modal } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import moment from 'moment';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import FooterToolbar from '@/components/FooterToolbar';
import { StateType } from './model';
import { ORDER_PAY_STATUS, ORDER_REFUND_STATUS_DESC } from '@/utils/const';

const FormItem = Form.Item;
const Option = Select.Option;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
}

interface IState {
  id: string;
  orderNo: string;
  serviceOrderList: any[];
  returnResultList: any[];
}

@connect(({ loading, order }) => ({
  pageLoading: loading.effects['order/getPayOrderDetail'],
}))
class PayOrderDetailPage extends PureComponent<IProps, IState> {
  state: IState = {
    id: this.props.match.params && this.props.match.params.id,
    orderNo: '',
    serviceOrderList: [],
    returnResultList: []
  }

  private serviceOrderColumns = [
    { title: '子订单编号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '子订单金额', dataIndex: 'amount', key: 'amount',
      render: text => <span>{text ? text / 100 : 0}</span>
    },
    { title: '账单编号', dataIndex: 'billNo', key: 'billNo' },
    { title: '账单名称', dataIndex: 'billName', key: 'billName' },
    { title: '费用类型', dataIndex: 'feeTypeName', key: 'feeTypeName' },
    {
      titile: '操作',
      render: (_, record) => (
        <div className='table-actions'>
          <span onClick={() => this.handleToBusinessDetail(record)}>查看</span>
        </div>
      )
    }
  ]

  private refundColumns = [
    { title: '退款申请时间', dataIndex: 'returnApplyTime', key: 'returnApplyTime',
      render: text => <span>{text ? moment(text).format('YYY-MM-DD HH:mm:ss') : ''}</span>
    },
    { title: '退款状态', dataIndex: 'returnStatus', key: 'returnStatus',
      render: text => <span>{text >= 0 ? ORDER_REFUND_STATUS_DESC[text] : ''}</span>
    },
  ]

  componentDidMount() {
    this.handleSearchDetail();
  }

  handleSearchDetail = async() => {
    const { dispatch } = this.props;
    const { id } = this.state;

    let result = await dispatch({
      type: 'order/getPayOrderDetail',
      payload: {
        orderId: id
      }
    })

    if (result) {
      this.handleFullBaseInfo(result);
    }
  }

  handleFullBaseInfo = result => {
    const { form } = this.props;
    const { orderDetail, returnResultList = [], serviceOrderList = [] } = result;

    const newOrderDetail = {
      amount: orderDetail.amount ? orderDetail.amount / 100 : 0,
      disAmount: orderDetail.disAmount ? orderDetail.disAmount / 100 : 0,
      receiptAmount: orderDetail.receiptAmount ? orderDetail.receiptAmount / 100 : 0,
      orderDatetime: orderDetail.orderDatetime ? moment(orderDetail.orderDatetime) : null,
      paymentTime: orderDetail.paymentTime ? moment(orderDetail.paymentTime) : null,
      refundAmount: orderDetail.refundAmount ? orderDetail.refundAmount / 100 : 0,
    }
    
    const baseInfo = Object.assign(orderDetail, newOrderDetail)

    Object.keys(form.getFieldsValue()).forEach(key => {
      let obj = {};
      obj[key] = baseInfo[key];
      form.setFieldsValue(obj);
    });

    this.setState({
      orderNo: orderDetail.orderNo,
      serviceOrderList,
      returnResultList,
    })
  }

  handleToBusinessDetail = ({ id }) => {
    router.push(`/order/business/detail/${id}`)
  }

  handleRefreshRefund = async() => {
    const { dispatch } = this.props;
    const { orderNo } = this.state;

    let result = await dispatch({
      type: 'order/refreshRefundStatus',
      payload: {
        orderId: orderNo
      }
    })

    if (result) {
      this.handleSearchDetail();
    }
  }
  

  handleCancel = () => {
    router.goBack();
  }

  render() {
    const { serviceOrderList, returnResultList } = this.state;
    const { pageLoading, form: { getFieldDecorator } } = this.props;

    return (
      <PageWrapper 
        title='查看支付订单'
        showBack
        customBreadcrumbmap={[
          { name: '订单管理', url: '' },
          { name: '支付订单管理', url: '/order/pay' },
          { name: '查看支付订单' },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Card title={'基本信息'} bordered={false}>
            <Row gutter={40}>
              <Col span={8}>
                <FormItem label={'商户名称'}>
                  {getFieldDecorator('merchantName')(
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
                <FormItem label={'房屋地址'}>
                  {getFieldDecorator('houseAddress')(
                    <Input disabled/>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={'订单编号'}>
                  {getFieldDecorator('orderNo')(
                    <Input disabled/>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={'订单金额'}>
                  {getFieldDecorator('amount')(
                    <Input disabled/>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={'优惠金额'}>
                  {getFieldDecorator('disAmount')(
                    <Input disabled/>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={'支付金额'}>
                  {getFieldDecorator('receiptAmount')(
                    <Input disabled/>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={'订单创建时间'}>
                  {getFieldDecorator('orderDatetime')(
                    <DatePicker disabled style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" placeholder='无'/>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={'订单支付时间'}>
                  {getFieldDecorator('paymentTime')(
                    <DatePicker disabled style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" placeholder='无'/>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={'来源场景'}>
                  {getFieldDecorator('sourceScene')(
                    <Input disabled/>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={'支付方式'}>
                  {getFieldDecorator('payTypeName')(
                    <Input disabled/>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={'支付手机号'}>
                  {getFieldDecorator('payPhone')(
                    <Input disabled/>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={'订单状态'}>
                  {getFieldDecorator('payStatus')(
                    <Select disabled  style={{ width: '100%' }}>
                      {ORDER_PAY_STATUS.map(item => (
                        <Option value={item.value} key={item.value}>{item.label}</Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={'退款金额'}>
                  {getFieldDecorator('refundAmount')(
                    <Input disabled/>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Card>

          <Card title={'业务订单'} bordered={false}>
            <StandardTable
              rowKey={'id'}
              columns={this.serviceOrderColumns}
              dataSource={serviceOrderList}
              pagination={false}           
            />
          </Card>

          {
            returnResultList.length ?
            <Card 
              title={
                <div>
                  <span style={{ marginRight: '20px'}}>退款进度明细</span>
                  <Button onClick={this.handleRefreshRefund}>刷新</Button>
                </div>
              } 
              bordered={false}
            >
              <StandardTable
                rowKey={'id'}
                columns={this.refundColumns}
                dataSource={returnResultList}
                pagination={false}           
              />
            </Card> : null
          }
          <FooterToolbar>
            <Button onClick={this.handleCancel}>返回</Button>
          </FooterToolbar>
        </Spin>
      </PageWrapper>
    )
  }
};


export default Form.create()(PayOrderDetailPage)
