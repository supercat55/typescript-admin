import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { Button } from 'antd';
import moment from 'moment';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { Debounce, Bind } from 'lodash-decorators';
import { StateType } from './model';
import { DEFAULT_ALL_TYPE, DISPLAY_MODE_TYPES } from '@/utils/const';
import { GetUserBaseInfo, GetGlobalToken } from '@/utils/cache';
import { spliceDownloadUrl } from '@/utils/utils';
import { EXPORT_STATEMENT_REPORT_LIST } from '@/utils/url';

interface IProps extends StateType {
  dispatch: Dispatch<AnyAction>;
  tableLoading: boolean;
  globalPageSubMenu: any;
  allOrganizationList: any[];
  allFeeTypeList: any[];
}

interface IState {
  pageNum: number;
  pageSize: number;
  searchFormItems: any[];
  searchFormValues: {
    merchantName: string;
    merchantNo: number | string;
    orgId: string | number;
    showType: number;
    payTime: any[];
    communityName: string;
    feeTypeId: number | string; 
  },
  selectedRowKeys: string[];
  selectedRow: any[];
}

const initStartTime = moment().subtract(3, 'months');
const initEndTime = moment().endOf('day');

@connect(({ menu, loading, report, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  settlementList: report.settlementList,
  settlementTotal: report.settlementTotal,
  tableLoading: loading.models['report'],
  allOrganizationList: global.allOrganizationList,
  allFeeTypeList: global.allFeeTypeList,
}))
class SettlementList extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [],
    searchFormValues: {
      merchantName: '',
      merchantNo: '',
      orgId: -1,
      showType: 3,
      payTime: [initStartTime, initEndTime],
      communityName: '',
      feeTypeId: -1
    },
    selectedRowKeys: [],
    selectedRow: []
  }

  private ref: any
  
  private columns = [
    { title: '交易日期', dataIndex: 'paymentTime', key: 'paymentTime', width: 170, fixed: 'left' },
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName' },
    { title: '商户号', dataIndex: 'merchantNum', key: 'merchantNum' },
    { title: '小区名称', dataIndex: 'communityName', key: 'communityName' },
    { title: '费用类型', dataIndex: 'feeTypeName', key: 'feeTypeName' },
    { title: '结算账户名称', dataIndex: 'settlementAccountName', key: 'settlementAccountName' },
    { title: '结算账户号', dataIndex: 'settlementAccountNumber', key: 'settlementAccountNumber' },
    { title: '开户行名称', dataIndex: 'settlementAccountBank', key: 'settlementAccountBank' },
    { title: '订单金额', dataIndex: 'amount', key: 'amount' },
    { title: '优惠总额', dataIndex: 'disAmount', key: 'disAmount' },
    { title: '结算金额', dataIndex: 'receiptAmount', key: 'receiptAmount' },
  ]

  componentDidMount() {
    this.initializeForm();
    this.handleSearchList();
  }

  initializeForm = async() => {
    const { loginType } = GetUserBaseInfo();
    const { dispatch } = this.props;

    await dispatch({
      type: 'global/getAllFeeTypeList'
    })

    if (loginType === 'operation') {
      await dispatch({
        type: 'global/getAllOrganizationList'
      })
    }
    this.renderFormItems();
  }

  renderFormItems = () => {
    const { loginType } = GetUserBaseInfo();
    const { allOrganizationList, allFeeTypeList } = this.props;

    let searchFormItems = [];

    if (loginType === 'operation') {
      searchFormItems = [
        { label: '商户名称', type: 'input', decorator: 'merchantName', placeholder: '请输入商户名称' },
        { label: '商户号', type: 'input', decorator: 'merchantNo', placeholder: '请输入商户号' },
        { 
          label: '所属组织', 
          type: 'select', 
          decorator:'orgId', 
          initialValue: -1, 
          fieldNames: { label: 'name', value: 'id' },
          source: [{ name: '全部', id: -1 }].concat(allOrganizationList) 
        },
        { label: '展示模式', type: 'select', decorator:'showType', initialValue: 3, source: DISPLAY_MODE_TYPES },
        { label: '交易日期', type: 'date', decorator: 'payTime', initialValue: [initStartTime, initEndTime], required: true, message: '请选择交易日期范围' },
        { 
          label: '小区名称', 
          type: 'autoComplete',
          decorator: 'communityName', 
          placeholder: '请输入搜索的小区名称', 
          dataSource: [], 
        },
        { 
          label: '费用类型', 
          type: 'select', 
          decorator: 'feeTypeId', 
          initialValue: -1, 
          fieldNames: { label: 'feeName', value: 'id' },
          source: [{ feeName: '全部', id: -1 }].concat(allFeeTypeList) 
        },
      ]
    } else {
      searchFormItems = [
        { label: '展示模式', type: 'select', decorator:'showType', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(DISPLAY_MODE_TYPES) },
        { label: '交易日期', type: 'date', decorator: 'payTime', initialValue: [initStartTime, initEndTime], required: true, message: '请选择交易日期范围' },
        { 
          label: '小区名称', 
          type: 'autoComplete',
          decorator: 'communityName', 
          placeholder: '请输入搜索的小区名称', 
          dataSource: [], 
        },
        { 
          label: '费用类型', 
          type: 'select', 
          decorator: 'feeTypeId', 
          initialValue: -1, 
          fieldNames: { label: 'feeName', value: 'id' },
          source: [{ feeName: '全部', id: -1 }].concat(allFeeTypeList) 
        },
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
    const { pageNum, pageSize, searchFormValues: { merchantName, merchantNo, orgId, showType, payTime, communityName, feeTypeId } } = this.state;

    const params = {
      pageNum,
      pageSize,
      showType,
      payTimeStart: payTime[0].startOf('day').unix() * 1000,
      payTimeEnd: payTime[1].endOf('day').unix() * 1000,
    };

    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (merchantNo) {
      params['merchantNo'] = merchantNo
    }
    if (orgId !== -1) {
      params['orgId'] = orgId
    }
    if (communityName) {
      params['communityName'] = communityName
    }
    if (feeTypeId !== -1) {
      params['feeTypeId'] = feeTypeId
    }

    dispatch({
      type: 'report/getMerchantSettlementList',
      payload: params
    })
  }


  handleExport = () => {
    const { searchFormValues: { merchantName, merchantNo, orgId, showType, payTime, communityName, feeTypeId } } = this.state;
    const url = EXPORT_STATEMENT_REPORT_LIST;

    const params = {
      token: GetGlobalToken(),
      showType,
      payTimeStart: payTime[0].startOf('day').unix() * 1000,
      payTimeEnd: payTime[1].endOf('day').unix() * 1000,
    };

    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (merchantNo) {
      params['merchantNo'] = merchantNo
    }
    if (orgId !== -1) {
      params['orgId'] = orgId
    }
    if (communityName) {
      params['communityName'] = communityName
    }
    if (feeTypeId !== -1) {
      params['feeTypeId'] = feeTypeId
    }

    const exportUrl = spliceDownloadUrl(url, params);
    window.open(exportUrl);
  }

  handleRowSelectionChange = (selectedRowKeys, selectedRow) => {
    this.setState({
      selectedRowKeys, 
      selectedRow
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
    const { pageNum, pageSize, searchFormItems } = this.state;
    const { settlementList, settlementTotal, tableLoading, globalPageSubMenu } = this.props;

    const pagination = {
      total: settlementTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='商户结算表'>
        {
          globalPageSubMenu.MERCHANT_SETTLEMENT_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            change={this.handleSearchFormChange}
            ref={node => (this.ref = node)}
            extraButton={
              globalPageSubMenu.MERCHANT_SETTLEMENT_EXPORT &&
              (<Button style={{ marginLeft: 8 }} onClick={this.handleExport}>
                导出
              </Button>)}
          />
        }
        <StandardTable
          rowKey={(record, index) => index}
          columns={this.columns}
          dataSource={settlementList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
          scroll={{ x: 1700 }}
        />

      </PageWrapper>
    )
  }
};


export default SettlementList
