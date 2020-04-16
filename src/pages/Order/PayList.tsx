import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { message, Modal, InputNumber, Button } from 'antd';
import moment from 'moment';
import { Decimal } from 'decimal.js';
import router from 'umi/router';
import { Debounce, Bind } from 'lodash-decorators';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
import { DEFAULT_ALL_TYPE, ORDER_PAY_STATUS, ORDER_REFUND_STATUS } from '@/utils/const';
import { GetUserBaseInfo, GetGlobalToken } from '@/utils/cache';
import { spliceDownloadUrl } from '@/utils/utils';
import { EXPORT_ORDER_PAYMENT_LIST } from '@/utils/url';

interface IProps extends StateType {
  dispatch: Dispatch<AnyAction>;
  tableLoading: boolean;
  globalPageSubMenu: any;
  allPayCodeList: any[];
  allOrganizationList: any[];
  allSourceSceneList: any[];
}

interface IState {
  pageNum: number;
  pageSize: number;
  searchFormItems: any[];
  searchFormValues: {
    orgId: string | number;
    condition: string;
    communityName: string;
    orderNo: string | number;
    payStatus: number;
    createTime: any[];
    payTime: any[];
    payPhone: string | number;
    payType: string | number;
    returnStatus: string | number;
    sourceScene: string | number;
  },
  visible: boolean;
  refundItemDetail: any;
  refundOrderList: any[];
  refundAmountTotal: number;
}

const initStartTime = moment().startOf('day').subtract(6, 'months');
const initEndTime = moment().startOf('day');

@connect(({ menu, loading, order, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  payOrderList: order.payOrderList,
  payOrderTotal: order.payOrderTotal,
  tableLoading: loading.models['order'],
  allPayCodeList: global.allPayCodeList,
  allOrganizationList: global.allOrganizationList,
  allSourceSceneList: global.allSourceSceneList,
}))
class BusinessOrderDetail extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [],
    searchFormValues: {
      orgId: -1,
      condition: '',
      communityName: '',
      orderNo: '',
      payStatus: -1,
      createTime: [initStartTime, initEndTime],
      payTime: [],
      payPhone: '',
      payType: -1,
      returnStatus: -1,
      sourceScene: -1,
    },
    visible: false,
    refundItemDetail: {},
    refundOrderList: [],
    refundAmountTotal: 0
  }

  private ref: any
  
  private columns = [
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName'},
    { title: '订单编号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '订单金额', dataIndex: 'amount', key: 'amount' },
    { title: '优惠金额', dataIndex: 'disAmount', key: 'disAmount' },
    { title: '支付金额', dataIndex: 'receiptAmount', key: 'receiptAmount' },
    { title: '房屋地址', dataIndex: 'houseAddress', key: 'houseAddress' },
    { title: '订单创建时间', dataIndex: 'orderDatetime', key: 'orderDatetime' },
    { title: '订单支付时间', dataIndex: 'paymentTime', key: 'paymentTime' },
    { title: '来源场景', dataIndex: 'sourceScene', key: 'sourceScene' },
    { title: '支付方式', dataIndex: 'payTypeName', key: 'payTypeName' },
    { title: '支付手机号', dataIndex: 'payPhone', key: 'payPhone' },
    { title: '退款状态', dataIndex: 'returnStatusDesc', key: 'returnStatusDesc', fixed: 'right', width: 100 },
    { title: '订单状态', dataIndex: 'payStatusDesc', key: 'payStatusDesc', fixed: 'right', width: 100 },
    { title: '操作', width: 180, fixed: 'right',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        return (
          <div className='table-actions'>
            {globalPageSubMenu.CHECK_PAY_ORDER_DETAIL && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
            {
              globalPageSubMenu.PAY_ORDER_REFUND && (record.returnStatus == 0 || record.returnStatus == 2) && (record.payStatus === 1 || record.payStatus === 5) ?
              <span onClick={() => this.handleActions('refund', record)}>退款申请</span> : null
            }
          </div>
        )
      }
    }
  ]

  private refundColumns = [
    { title: '业务订单号 ', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '费用类型 ', dataIndex: 'feeTypeName', key: 'feeTypeName' },
    { title: '账单名称 ', dataIndex: 'billName', key: 'billName' },
    { title: '订单金额 ', dataIndex: 'amount', key: 'amount',
      render: text => <span>{text / 100}</span>
    },
    {
      title: '退款金额 ',
      dataIndex: 'refundAmount',
      key: 'refundAmount',
      render: (text, record, index) => {
        return (
          <InputNumber
            min={0}
            value={record.refundAmount}
            formatter={value => `¥ ${value}`}
            onChange={value => this.handleRefundAmountChange(value, index)}
          />
        );
      },
    },
  ]

  componentDidMount() {
    this.initializeForm();
    this.handleSearchList();
  }

  initializeForm = async() => {
    const { loginType } = GetUserBaseInfo();
    const { dispatch } = this.props;

    await dispatch({
      type: 'global/getAllPayCodeList',
      payload: { type: 1 }
    })

    if (loginType === 'operation') {
      await dispatch({
        type: 'global/getAllOrganizationList'
      })

      await dispatch({
        type: 'global/getAllSourceSceneList'
      })
    }
    this.renderFormItems();
  }

  renderFormItems = () => {
    const { loginType } = GetUserBaseInfo();
    const { allPayCodeList, allOrganizationList, allSourceSceneList } = this.props;

    let searchFormItems = [];

    if (loginType === 'operation') {
      searchFormItems = [
        { 
          label: '所属组织', 
          type: 'select', 
          decorator:'orgId', 
          initialValue: -1, 
          fieldNames: { label: 'name', value: 'id' },
          source: [{ name: '全部', id: -1 }].concat(allOrganizationList) 
        },
        { label: '商户搜索', type: 'input', decorator: 'condition', placeholder: '请输入商户号/商户名称' },
        { 
          label: '小区名称', 
          type: 'autoComplete',
          decorator: 'communityName', 
          placeholder: '请输入搜索的小区名称', 
          dataSource: [], 
        },
        { label: '订单编号', type: 'input', decorator: 'orderNo', placeholder: '输入完整订单编号搜索' },
        { label: '订单状态', type: 'select', decorator: 'payStatus', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(ORDER_PAY_STATUS) },
        { label: '创建时间', type: 'date', decorator: 'createTime', initialValue: [initStartTime, initEndTime] },
        { label: '支付时间', type: 'date', decorator: 'payTime', initialValue: [] },
        { label: '支付手机号', type: 'input', decorator: 'payPhone', placeholder: '请输入需要查询的支付手机号' },
        { 
          label: '支付方式', 
          type: 'select', 
          decorator: 'payType', 
          initialValue: -1, 
          fieldNames: { label: 'name', value: 'code' },
          source: [{ name: '全部', code: -1 }].concat(allPayCodeList) 
        },
        { label: '退款状态', type: 'select', decorator: 'returnStatus', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(ORDER_REFUND_STATUS) },
        { 
          label: '来源场景', 
          type: 'select', 
          decorator: 'sourceScene', 
          initialValue: -1, 
          fieldNames: { label: 'sourceName', value: 'id' },
          source: [{ sourceName: '全部', id: -1 }].concat(allSourceSceneList) 
        }
      ]
    } else {
      searchFormItems = [
        { 
          label: '小区名称', 
          type: 'autoComplete',
          decorator: 'communityName', 
          placeholder: '请输入搜索的小区名称', 
          dataSource: [], 
        },
        { label: '订单编号', type: 'input', decorator: 'orderNo', placeholder: '输入完整订单编号搜索' },
        { label: '订单状态', type: 'select', decorator: 'payStatus', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(ORDER_PAY_STATUS) },
        { label: '创建时间', type: 'date', decorator: 'createTime', initialValue: [initStartTime, initEndTime] },
        { label: '支付时间', type: 'date', decorator: 'payTime', initialValue: [] },
        { label: '支付手机号', type: 'input', decorator: 'payPhone', placeholder: '请输入需要查询的支付手机号' },
        { 
          label: '支付方式', 
          type: 'select', 
          decorator: 'payType', 
          initialValue: -1, 
          fieldNames: { label: 'name', value: 'code' },
          source: [{ name: '全部', code: -1 }].concat(allPayCodeList) 
        },
        { label: '退款状态', type: 'select', decorator: 'returnStatus', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(ORDER_REFUND_STATUS) },
      ]
    }

    this.setState({ searchFormItems })
  }

  @Bind()
  @Debounce(500)
  handleSearchFormChange(decorator, value) {
    if (decorator === 'communityName' && value) {
      this.handleSearchCommunityOptions(value)
    }
  }

  handleSearchCommunityOptions = async(name) => {
    const { dispatch } = this.props;
    const { searchFormItems } = this.state;
    const newFrmItems = searchFormItems.map(item => ({ ...item })) as any;
    
    let result = await dispatch({
      type: 'global/getAllCommunityListByName',
      payload: { communityName: name }
    })

    if (result && result['length']) {
      for(let i in newFrmItems) {
        if (newFrmItems[i].decorator === 'communityName') {
          newFrmItems[i].dataSource = result;
        }
      }

      this.setState({
        searchFormItems: newFrmItems
      })
    }
  }

  handleSearchList = () => {
    const { dispatch } = this.props;
    const { pageNum, pageSize, searchFormValues: { orgId, condition, communityName, orderNo, payStatus, createTime, payTime, payPhone, payType, returnStatus, sourceScene } } = this.state;

    const params = {
      pageNum,
      pageSize,
    };

    if (orgId !== -1) {
      params['orgId'] = orgId
    }
    if (communityName) {
      params['communityName'] = communityName
    }
    if (condition) {
      params['condition'] = condition
    }
    if (orderNo) {
      params['orderNo'] = orderNo
    }
    if (payStatus !== -1) {
      params['payStatus'] = payStatus
    }
    if (createTime && createTime.length) {
      params['createTimeStart'] = createTime[0].startOf('day').unix() * 1000;
      params['createTimeEnd'] = createTime[1].endOf('day').unix() * 1000;
    }
    if (payTime && payTime.length) {
      params['payTimeStart'] = payTime[0].startOf('day').unix() * 1000;
      params['payTimeEnd'] = payTime[1].endOf('day').unix() * 1000;
    }
    if (payPhone) {
      params['payPhone'] = payPhone
    }
    if (payType !== -1) {
      params['payType'] = payType
    }
    if (returnStatus !== -1) {
      params['returnStatus'] = returnStatus
    }
    if (sourceScene !== -1) {
      params['sourceScene'] = sourceScene
    }

    // if (payPhone && !REGEX.MOBILE.test(payPhone)) {
    //   message.warning("请输入正确手机号码")
    //   return;
    // }

    if (!createTime.length) {
      message.warn('请选择账单生成时间范围', 1);
      return;
    }

    let interval = 24 * 60 * 60 * 1000 * 186

    if ((params['createTimeEnd'] - params['createTimeStart']) > interval) {
      message.warn('账单生成时间范围不能超过6个月', 1);
      return;
    }

    dispatch({
      type: 'order/getPayOrderList',
      payload: params
    })
  }
  
  handleActions = (mode, info) => {
    switch (mode) {
      case 'detail':
        router.push({
          pathname: `/order/pay/detail/${info.id}`,
        })
        break;
      case 'refund':
        this.handleItemRefund(info);
        break;
      case 'export':
        this.handleExport();
        break;
      default:
        break;
    }
  }

  handleExport = () => {
    const { searchFormValues: { orgId, condition, communityName, orderNo, payStatus, createTime, payTime, payPhone, payType, returnStatus, sourceScene } } = this.state;
    const url = EXPORT_ORDER_PAYMENT_LIST;

    const params = {
      token: GetGlobalToken(),
    };

    if (orgId !== -1) {
      params['orgId'] = orgId
    }
    if (communityName) {
      params['communityName'] = communityName
    }
    if (condition) {
      params['condition'] = condition
    }
    if (orderNo) {
      params['orderNo'] = orderNo
    }
    if (payStatus !== -1) {
      params['payStatus'] = payStatus
    }
    if (createTime && createTime.length) {
      params['createTimeStart'] = createTime[0].startOf('day').unix() * 1000;
      params['createTimeEnd'] = createTime[1].endOf('day').unix() * 1000;
    }
    if (payTime && payTime.length) {
      params['payTimeStart'] = payTime[0].startOf('day').unix() * 1000;
      params['payTimeEnd'] = payTime[1].endOf('day').unix() * 1000;
    }
    if (payPhone) {
      params['payPhone'] = payPhone
    }
    if (payType !== -1) {
      params['payType'] = payType
    }
    if (returnStatus !== -1) {
      params['returnStatus'] = returnStatus
    }
    if (sourceScene !== -1) {
      params['sourceScene'] = sourceScene
    }

    // if (payPhone && !REGEX.MOBILE.test(payPhone)) {
    //   message.warning("请输入正确手机号码")
    //   return;
    // }

    if (!createTime.length) {
      message.warn('请选择账单生成时间范围', 1);
      return;
    }

    let interval = 24 * 60 * 60 * 1000 * 186

    if ((params['createTimeEnd'] - params['createTimeStart']) > interval) {
      message.warn('账单生成时间范围不能超过6个月', 1);
      return;
    }

    const exportUrl = spliceDownloadUrl(url, params);
    window.open(exportUrl);
  }

  handleItemRefund = async({ id }) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'order/getPayOrderDetail',
      payload: {
        orderId: id
      }
    })

    if (result) {
      this.setState({
        visible: true,
        refundItemDetail: result,
        refundOrderList: result['serviceOrderList']
      })
    }
  }

  // 申请退款订单item 退款金额changge事件
  handleRefundAmountChange = (value, index) => {
    const { refundOrderList } = this.state;
    const newData = refundOrderList.map(item => ({...item}));
    const amount = newData[index].amount / 100;

    if (value > amount) {
      newData[index].refundAmount = amount;
    } else {
      newData[index].refundAmount = value;
    }

    this.setState({
      refundOrderList: newData
    }, this.handleSetRefundAmountTotal)
  }

  // 计算所有退款总金额
  handleSetRefundAmountTotal = () => {
    const { refundOrderList } = this.state;
    let total = 0;

    for(let i in refundOrderList) {
      let itemRefundAmount = refundOrderList[i].refundAmount ? refundOrderList[i].refundAmount : 0;

      total += itemRefundAmount
    }
    if (isNaN(total)) {
      total = 0
    };

    this.setState({
      refundAmountTotal: parseFloat(new Decimal(total).toFixed(2))
    })
  }

  // 申请退款modal确定事件
  handleRefundModalOk = async() => {
    const { dispatch } = this.props;
    const { refundItemDetail: { orderDetail }, refundAmountTotal, refundOrderList } = this.state;

    const refundAmount = parseFloat(new Decimal(refundAmountTotal * 100).toFixed(2));
    const list = [];
    if (refundAmount <= 0) {
      message.error('缺少退款订单金额');
      return;
    }

    for (let i in refundOrderList) {
      let item = refundOrderList[i];

      list.push({
        serviceOrderId: item.id,
        refundAmount: item.refundAmount ? parseFloat(new Decimal(item.refundAmount * 100).toFixed(2)) : 0
      })
    }

    const params = {
      orderId: orderDetail.id,
      refundAmount,
      list
    }

    let result = await dispatch({
      type: 'order/orderRefund',
      payload: params
    })

    if (result) {
      message.success('退款申请成功');

      this.handleSearchList();
      this.handleRefundModalCancel();
    }
  }

  // 申请退款modal取消事件
  handleRefundModalCancel = () => {
    this.setState({
      visible: false,
      refundItemDetail: {}
    })
  }

  handleFilterSearch = values => {
    this.setState({
      searchFormValues: values,
      pageNum: 1
    }, this.handleSearchList)
  }
  
  handleTabelChange = pagination => {
    const { searchFormValues } = this.state;

    this.ref && this.ref.setFieldsValue(searchFormValues);

    this.setState({
      pageNum: pagination.current
    }, this.handleSearchList)
  }

  render() {
    const { pageNum, pageSize, searchFormItems, visible, refundAmountTotal, refundItemDetail: { orderDetail = {} }, refundOrderList } = this.state;
    const { payOrderList, payOrderTotal, tableLoading, globalPageSubMenu } = this.props;

    const pagination = {
      total: payOrderTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='支付订单管理'>
        {
          globalPageSubMenu.PAY_ORDER_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            change={this.handleSearchFormChange}
            ref={node => (this.ref = node)}
            extraButton={
              globalPageSubMenu.PAY_ORDER_EXPORT &&
              (<Button style={{ marginLeft: 8 }} onClick={() => this.handleActions('export', null)}>
                导出
              </Button>)}
          />
        }
        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={payOrderList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
          scroll={{ x: 2000 }}
        />

        <Modal
          title={
            <div>
              <span>支付订单号：</span>
              <strong>{orderDetail.orderNo}</strong>
              <span style={{ marginLeft: 50 }}>订单金额：</span>
              <strong>{orderDetail.amount / 100}</strong>
            </div>
          }
          width={970}
          visible={visible}
          onOk={this.handleRefundModalOk}
          onCancel={this.handleRefundModalCancel}
          destroyOnClose
        >
          <StandardTable
            rowKey={'id'}
            columns={this.refundColumns}
            dataSource={refundOrderList}
            pagination={false}           
          />
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            请确认金额：<strong>{refundAmountTotal}</strong>
          </div>
        </Modal>
      </PageWrapper>
    )
  }
};


export default BusinessOrderDetail
