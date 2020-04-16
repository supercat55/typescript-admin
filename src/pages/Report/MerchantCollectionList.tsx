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
import { GetUserBaseInfo, GetGlobalToken } from '@/utils/cache';
import { spliceDownloadUrl } from '@/utils/utils';
import { EXPORT_COMMUNITY_COLLECTION } from '@/utils/url';

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
    organizeId: string | number;
    createTime: any[];
    writeOffTime: any;
    communityName: string;
  },
}

 //从2018年11月16号0点0分（1542297600000）开始统计数据，初始时间默认为 1542297600000
 const maxTime = Math.max(moment('00:00:00', 'HH:mm:ss').subtract(3, 'months').valueOf(), 1542297600000);
 const initStartTime = moment(moment.unix(maxTime / 1000))

 const maxEndTime = Math.max(moment().valueOf(), 1542297600000);
 const initEndTime = moment(moment.unix(maxEndTime / 1000));

 const initDeadline = moment().subtract(1, 'days');

@connect(({ menu, loading, report, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  merchantCollectionList: report.merchantCollectionList,
  merchantCollectionTotal: report.merchantCollectionTotal,
  tableLoading: loading.models['report'],
  allOrganizationList: global.allOrganizationList,
}))
class MerchantCollectionList extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [],
    searchFormValues: {
      merchantName: '',
      merchantNo: '',
      organizeId: -1,
      createTime: [initStartTime, initEndTime],
      writeOffTime: initDeadline,
      communityName: '',
    },
  }

  private ref: any
  
  private columns = [
    { title: '所属组织', dataIndex: 'orgName', key: 'orgName' },
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName' },
    { title: '商户号', dataIndex: 'merchantNum', key: 'merchantNum' },
    { title: '小区名称', dataIndex: 'communityName', key: 'communityName' },
    { title: '账单金额', dataIndex: 'amount', key: 'amount' },
    { title: '线上实收', dataIndex: 'onLineAmount', key: 'onLineAmount' },
    { title: '线下实收', dataIndex: 'underLineAmount', key: 'underLineAmount' },
    { title: '退款', dataIndex: 'refundAmount', key: 'refundAmount' },
    { title: '欠款', dataIndex: 'arrearsAmount', key: 'arrearsAmount' },
    { title: '收缴率', dataIndex: 'collectionRate', key: 'collectionRate', width: 180, fixed: 'right', },
  ]

  componentDidMount() {
    this.initializeForm();
    this.handleSearchList();
  }

  initializeForm = async() => {
    const { loginType } = GetUserBaseInfo();
    const { dispatch } = this.props;

    if (loginType === 'operation') {
      await dispatch({
        type: 'global/getAllOrganizationList'
      })
    }
    this.renderFormItems();
  }

  renderFormItems = () => {
    const { loginType } = GetUserBaseInfo();
    const { allOrganizationList } = this.props;

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
        { 
          label: '小区名称', 
          type: 'autoComplete',
          decorator: 'communityName', 
          placeholder: '请输入搜索的小区名称', 
          dataSource: [], 
        },
        { label: '账单创建时间', type: 'date', decorator: 'createTime', initialValue: [initStartTime, initEndTime], required: true, message: '请选择交易日期范围' },
        { label: '截止时间', type: 'time', decorator: 'writeOffTime', initialValue: initDeadline, required: true, message: '请选择截止时间' },
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
        { label: '账单创建时间', type: 'date', decorator: 'createTime', initialValue: [initStartTime, initEndTime], required: true, message: '请选择交易日期范围' },
        { label: '截止时间', type: 'time', decorator: 'writeOffTime', initialValue: initDeadline, required: true, message: '请选择截止时间' },
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
    const { pageNum, pageSize, searchFormValues: { merchantName, merchantNo, organizeId, communityName, createTime, writeOffTime } } = this.state;

    const params = {
      pageNum,
      pageSize,
      billCreateTimeStart: createTime[0].startOf('day').unix() * 1000,
      billCreateTimeEnd: createTime[1].endOf('day').unix() * 1000,
      writeOffTime: writeOffTime.endOf('day').unix() * 1000
    };

    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (merchantNo) {
      params['merchantNo'] = merchantNo
    }
    if (organizeId !== -1) {
      params['organizeId'] = organizeId
    }
    if (communityName) {
      params['communityName'] = communityName
    }

    dispatch({
      type: 'report/getMerchantCollectionList',
      payload: params
    })
  }

  handleExport = () => {
    const { searchFormValues: { merchantName, merchantNo, organizeId, communityName, createTime, writeOffTime } } = this.state;
    const url = EXPORT_COMMUNITY_COLLECTION;

    const params = {
      token: GetGlobalToken(),
      billCreateTimeStart: createTime[0].startOf('day').unix() * 1000,
      billCreateTimeEnd: createTime[1].endOf('day').unix() * 1000,
      writeOffTime: writeOffTime.endOf('day').unix() * 1000
    };

    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (merchantNo) {
      params['merchantNo'] = merchantNo
    }
    if (organizeId !== -1) {
      params['organizeId'] = organizeId
    }
    if (communityName) {
      params['communityName'] = communityName
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
    const { merchantCollectionList, merchantCollectionTotal, tableLoading, globalPageSubMenu } = this.props;

    const pagination = {
      total: merchantCollectionTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='商户收缴率报表'>
        {
          globalPageSubMenu.MERCHANT_COLLECTION_SEARCH_OR_EXPORT &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            change={this.handleSearchFormChange}
            ref={node => (this.ref = node)}
            extraButton={
              <Button style={{ marginLeft: 8 }} onClick={this.handleExport}>
                导出
              </Button>}
          />
        }
        <StandardTable
          rowKey={(record, index) => index}
          columns={this.columns}
          dataSource={merchantCollectionList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
          scroll={{ x: 1500 }}
        />

      </PageWrapper>
    )
  }
};


export default MerchantCollectionList
