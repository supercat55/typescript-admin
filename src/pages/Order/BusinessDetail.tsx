import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Spin, Card, Row, Col, Input, Select, Button, DatePicker } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import moment from 'moment';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import FooterToolbar from '@/components/FooterToolbar';
import { StateType } from './model';
import { ORDER_PAY_STATUS, ORDER_PAY_STATUS_DESC, ORDER_REFUND_STATUS, BILL_STATUS_DESC } from '@/utils/const';

const FormItem = Form.Item;
const Option = Select.Option;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
}

interface IState {
  id: string;
  billList: any[];
  ordersList: any[];
}

@connect(({ loading, order }) => ({
  pageLoading: loading.effects['order/getBusinessOrderDetail'],
}))
class PaymentCallDetailPage extends PureComponent<IProps, IState> {
  state: IState = {
    id: this.props.match.params && this.props.match.params.id,
    billList: [],
    ordersList: []
  }

  private billColumns = [
    { title: '账单编号', dataIndex: 'billNo', key: 'billNo' },
    { title: '小区名称', dataIndex: 'communityName', key: 'communityName' },
    { title: '楼号', dataIndex: 'buildingNo', key: 'buildingNo' },
    { title: '单元号', dataIndex: 'unitNo', key: 'unitNo' },
    { title: '户号', dataIndex: 'accountNo', key: 'accountNo' },
    { title: '账单金额', dataIndex: 'billAmount', key: 'billAmount',
      render: text => <span>{text ? text / 10 : 0}</span>
    },
    { title: '已缴金额', dataIndex: 'paidAmount', key: 'paidAmount',
      render: text => <span>{text ? text / 10 : 0}</span> 
    },
    { title: '待缴金额', dataIndex: 'unpaidAmount', key: 'unpaidAmount',
      render: text => <span>{text ? text / 10 : 0}</span>
    },
    { title: '滞纳金', dataIndex: 'overdueAmount', key: 'overdueAmount',
      render: text => <span>{text ? text / 10 : 0}</span>
    },
    { title: '业务订单数量', dataIndex: 'serviceOrderNum', key: 'serviceOrderNum' },
    { title: '账单状态', dataIndex: 'status', key: 'status',
      render: text => <span>{text ? BILL_STATUS_DESC[text] : ''}</span>
    },
  ]

  private ordersColumns = [
    { title: '业务订单编号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '业务订单金额', dataIndex: 'amount', key: 'amount',
      render: text => <span>{text ? text / 10 : 0}</span>
    },
    { title: '订单创建时间', dataIndex: 'orderDatetime', key: 'orderDatetime',
      render: text => <span>{text ? moment(text).format('YYY-MM-DD HH:mm:ss') : ''}</span>  
    },
    { title: '订单支付时间', dataIndex: 'paymentTime', key: 'paymentTime',
      render: text => <span>{text ? moment(text).format('YYY-MM-DD HH:mm:ss') : ''}</span>
    },
    { title: '支付方式', dataIndex: 'payTypeName', key: 'payTypeName' },
    { title: '支付手机号', dataIndex: 'payPhone', key: 'payPhone' },
    { title: '账单状态', dataIndex: 'payStatus', key: 'payStatus',
      render: text => <span>{text >= 0 ? ORDER_PAY_STATUS_DESC[text] : ''}</span>
    },
  ]

  componentDidMount() {
    this.handleSearchDetail();
  }

  handleSearchDetail = async() => {
    const { dispatch } = this.props;
    const { id } = this.state;

    let result = await dispatch({
      type: 'order/getBusinessOrderDetail',
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
    const { serviceOrder, bill = {}, orders = [] } = result;

    const newOrderDetail = {
      amount: serviceOrder.amount ? serviceOrder.amount / 100 : 0,
      orderDatetime: serviceOrder.orderDatetime ? moment(serviceOrder.orderDatetime) : null,
      paymentTime: serviceOrder.paymentTime ? moment(serviceOrder.paymentTime) : null,
      refundAmount: serviceOrder.refundAmount ? serviceOrder.refundAmount / 100 : 0,
    }
    
    const baseInfo = Object.assign(serviceOrder, newOrderDetail)

    Object.keys(form.getFieldsValue()).forEach(key => {
      let obj = {};
      obj[key] = baseInfo[key];
      form.setFieldsValue(obj);
    });

    this.setState({
      billList: [bill],
      ordersList: orders,
    })
  }

  handleCancel = () => {
    router.goBack();
  }

  render() {
    const { billList, ordersList } = this.state;
    const { pageLoading, form: { getFieldDecorator } } = this.props;

    return (
      <PageWrapper 
        title='查看业务订单'
        showBack
        customBreadcrumbmap={[
          { name: '订单管理', url: '' },
          { name: '业务订单管理', url: '/order/business' },
          { name: '查看业务订单' },
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
                <FormItem label={'业务订单编号'}>
                  {getFieldDecorator('orderNo')(
                    <Input disabled/>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={'业务订单金额'}>
                  {getFieldDecorator('amount')(
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
                <FormItem label={'支付订单编号'}>
                  {getFieldDecorator('payOrderNo')(
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
                <FormItem label={'退款状态'}>
                  {getFieldDecorator('returnStatus')(
                    <Select disabled  style={{ width: '100%' }}>
                      {ORDER_REFUND_STATUS.map(item => (
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

          <Card title={'关联账单明细'} bordered={false}>
            <StandardTable
              rowKey={'id'}
              columns={this.billColumns}
              dataSource={billList}
              pagination={false}           
            />
          </Card>

          <Card title='关联账单的业务订单' bordered={false}>
            <StandardTable
              rowKey={'id'}
              columns={this.ordersColumns}
              dataSource={ordersList}
              pagination={false}           
            />
          </Card>

          <FooterToolbar>
            <Button onClick={this.handleCancel}>返回</Button>
          </FooterToolbar>
        </Spin>
      </PageWrapper>
    )
  }
};


export default Form.create()(PaymentCallDetailPage)
