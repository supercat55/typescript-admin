import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { message, Button } from 'antd';
import moment from 'moment';
import router from 'umi/router';
import { Debounce, Bind } from 'lodash-decorators';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
import { DEFAULT_ALL_TYPE, ORDER_PAY_STATUS } from '@/utils/const';
import { GetUserBaseInfo, GetGlobalToken } from '@/utils/cache';
import { spliceDownloadUrl } from '@/utils/utils';
import { EXPORT_ORDER_BUSINESS_LIST } from '@/utils/url';

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
    sourceScene: string | number;
    billNo: string | number;
    billName: string;
    payOrderNo: string;
  },
  selectedRowKeys: string[];
}

const initStartTime = moment().startOf('day').subtract(6, 'months');
const initEndTime = moment().startOf('day');

@connect(({ menu, loading, order, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  businessOrderList: order.businessOrderList,
  businessOrderTotal: order.businessOrderTotal,
  tableLoading: loading.models['order'],
  allPayCodeList: global.allPayCodeList,
  allOrganizationList: global.allOrganizationList,
  allSourceSceneList: global.allSourceSceneList,
}))
class BusinessOrderList extends PureComponent<IProps, IState> {
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
      sourceScene: -1,
      billNo: '',
      billName: '',
      payOrderNo: ''
    },
    selectedRowKeys: [],
  }

  private ref: any
  
  private columns = [
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName'},
    { title: '账单名称', dataIndex: 'billName', key: 'billName' },
    { title: '账单编号', dataIndex: 'billNo', key: 'billNo' },
    { title: '业务订单编号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '业务订单金额', dataIndex: 'amount', key: 'amount' },
    { title: '房屋地址', dataIndex: 'houseAddress', key: 'houseAddress'},
    { title: '支付订单号', dataIndex: 'payOrderNo', key: 'payOrderNo' },
    { title: '订单创建时间', dataIndex: 'orderDatetime', key: 'orderDatetime' },
    { title: '订单支付时间', dataIndex: 'paymentTime', key: 'paymentTime' },
    { title: '来源场景', dataIndex: 'sourceScene', key: 'sourceScene' },
    { title: '支付方式', dataIndex: 'payTypeName', key: 'payTypeName' },
    { title: '支付手机号', dataIndex: 'payPhone', key: 'payPhone' },
    { title: '订单状态', dataIndex: 'payStatusDesc', key: 'payStatusDesc', fixed: 'right', width: 100 },
    { title: '操作', width: 180, fixed: 'right',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        return (
          <div className='table-actions'>
            {globalPageSubMenu.CHECK_BUSINESS_ORDER_DETAIL && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
          </div>
        )
      }
    }
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
        { label: '订单创建时间', type: 'date', decorator: 'createTime', initialValue: [initStartTime, initEndTime] },
        { label: '订单支付时间', type: 'date', decorator: 'payTime', initialValue: [] },
        { label: '支付手机号', type: 'input', decorator: 'payPhone', placeholder: '请输入需要查询的支付手机号' },
        { 
          label: '支付方式', 
          type: 'select', 
          decorator: 'payType', 
          initialValue: -1, 
          fieldNames: { label: 'name', value: 'code' },
          source: [{ name: '全部', code: -1 }].concat(allPayCodeList) 
        },
        { 
          label: '来源场景', 
          type: 'select', 
          decorator: 'sourceScene', 
          initialValue: -1, 
          fieldNames: { label: 'sourceName', value: 'id' },
          source: [{ sourceName: '全部', id: -1 }].concat(allSourceSceneList) 
        },
        { label: '账单编号', type: 'input', decorator: 'billNo', placeholder: '请输入完整账单编号搜索' },,
        { label: '账单名称', type: 'input', decorator: 'billName', placeholder: '请输入账单名称' },,
        { label: '支付订单号', type: 'input', decorator: 'payOrderNo', placeholder: '请输入完整的支付订单号' },
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
        { label: '订单创建时间', type: 'date', decorator: 'createTime', initialValue: [initStartTime, initEndTime] },
        { label: '订单支付时间', type: 'date', decorator: 'payTime', initialValue: [] },
        { label: '支付手机号', type: 'input', decorator: 'payPhone', placeholder: '请输入需要查询的支付手机号' },
        { 
          label: '支付方式', 
          type: 'select', 
          decorator: 'payType', 
          initialValue: -1, 
          fieldNames: { label: 'name', value: 'code' },
          source: [{ name: '全部', code: -1 }].concat(allPayCodeList) 
        },
        // { 
        //   label: '来源场景', 
        //   type: 'select', 
        //   decorator: 'sourceScene', 
        //   initialValue: -1, 
        //   fieldNames: { label: 'sourceName', value: 'id' },
        //   source: [{ sourceName: '全部', id: -1 }].concat(allSourceSceneList) 
        // },
        { label: '账单编号', type: 'input', decorator: 'billNo', placeholder: '请输入完整账单编号搜索' },,
        { label: '账单名称', type: 'input', decorator: 'billName', placeholder: '请输入账单名称' },,
        { label: '支付订单号', type: 'input', decorator: 'payOrderNo', placeholder: '请输入完整的支付订单号' },
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
    const { pageNum, pageSize, searchFormValues: { orgId, condition, communityName, orderNo, payStatus, createTime, payTime, payPhone, payType, sourceScene, billNo, billName, payOrderNo } } = this.state;

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
    if (sourceScene !== -1) {
      params['sourceScene'] = sourceScene
    }
    if (billNo) {
      params['billNo'] = billNo
    }
    if (billName) {
      params['billName'] = billName
    }
    if (payOrderNo) {
      params['payOrderNo'] = payOrderNo
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
      type: 'order/getBusinessOrderList',
      payload: params
    })
  }
  
  handleActions = (mode, info) => {
    switch (mode) {
      case 'detail':
        router.push({
          pathname: `/order/business/detail/${info.id}`,
        })
        break;
      case 'export':
        this.handleExport();
        break;
      default:
        break;
    }
  }

  handleExport = () => {
    const { searchFormValues: { orgId, condition, communityName, orderNo, payStatus, createTime, payTime, payPhone, payType, sourceScene, billNo, billName, payOrderNo } } = this.state;
    const url = EXPORT_ORDER_BUSINESS_LIST;

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
    if (sourceScene !== -1) {
      params['sourceScene'] = sourceScene
    }
    if (billNo) {
      params['billNo'] = billNo
    }
    if (billName) {
      params['billName'] = billName
    }
    if (payOrderNo) {
      params['payOrderNo'] = payOrderNo
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
    const { pageNum, pageSize, searchFormItems } = this.state;
    const { businessOrderList, businessOrderTotal, tableLoading, globalPageSubMenu } = this.props;

    const pagination = {
      total: businessOrderTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='业务订单管理'>
        {
          globalPageSubMenu.BUSINESS_ORDER_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            change={this.handleSearchFormChange}
            ref={node => (this.ref = node)}
            extraButton={
              globalPageSubMenu.BUSINESS_ORDER_EXPORT &&
              (<Button style={{ marginLeft: 8 }} onClick={() => this.handleActions('export', null)}>
                导出
              </Button>)}
          />
        }
        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={businessOrderList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
          scroll={{ x: 2000 }}
        />

      </PageWrapper>
    )
  }
};


export default BusinessOrderList
