import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { Button } from 'antd';
import router from 'umi/router';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
import { GetGlobalToken } from '@/utils/cache';
import { spliceDownloadUrl } from '@/utils/utils';
import { EXPORT_CODE_REPORT_LIST } from '@/utils/url';

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
    communityName: string;
    payerName: string;
    payTime: any[];
  },
}

@connect(({ menu, loading, report, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  communityCodeCollectionList: report.communityCodeCollectionList,
  communityCodeCollectionTotal: report.communityCodeCollectionTotal,
  tableLoading: loading.models['report'],
  allOrganizationList: global.allOrganizationList,
}))
class CommunityCollectionList extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [
      { label: '商户名称', type: 'input', decorator:'merchantName', placeholder: '请输入商户名称' },
      { label: '搜索', type: 'input', decorator:'merchantNo', placeholder: '请输入完整商户号/收款码ID' },
      { label: '社区名称', type: 'input', decorator:'communityName', placeholder: '请输入社区名称' },
      { label: '收款员名称', type: 'input', decorator:'payerName', placeholder: '请输入收款员名称' },
      { label: '订单支付时间', type: 'date', decorator: 'payTime', initialValue: [] },
    ],
    searchFormValues: {
      merchantName: '',
      merchantNo: '',
      communityName: '',
      payerName: '',
      payTime: [],
    },
  }

  private ref: any
  
  private columns = [
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName' },
    { title: '商户号', dataIndex: 'merchantNum', key: 'merchantNum' },
    { title: '所属组织', dataIndex: 'orgName', key: 'orgName' },
    { title: '社区名称', dataIndex: 'communityName', key: 'communityName' },
    { title: '收款员名称', dataIndex: 'payeeName', key: 'payeeName' },
    { title: '收款码ID', dataIndex: 'id', key: 'id' },
    { title: '支付订单数', dataIndex: 'count', key: 'count' },
    { title: '支付订单总额', dataIndex: 'amount', key: 'amount' },
    { title: '优惠总额', dataIndex: 'disAmount', key: 'disAmount' },
    { title: '操作', fixed: 'right' as 'right', width: 80,
      render: (text, record) => {
        const { globalPageSubMenu } = this.props;

        return (
          <div className={'table-actions'}>
            {
              globalPageSubMenu.CHECK_COMMUNITY_CODE_COLLECTION_DEATIL && 
              <span onClick={() => this.handleToDetail(record)}>查看</span>
            }
          </div>
        )
      }
    }
  ]

  componentDidMount() {
    this.handleSearchList();
  }

  handleSearchList = () => {
    const { dispatch } = this.props;
    const { pageNum, pageSize, searchFormValues: { merchantName, merchantNo, communityName, payerName, payTime } } = this.state;

    const params = {
      pageNum,
      pageSize,
    };

    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (merchantNo) {
      params['merchantNo'] = merchantNo
    }
    if (communityName) {
      params['communityName'] = communityName
    }
    if (payerName) {
      params['payerName'] = payerName
    }
    if (payTime && payTime.length) {
      params['payTimeStart'] = payTime[0].startOf('day').unix() * 1000
      params['payTimeEnd'] = payTime[1].endOf('day').unix() * 1000
    }

    dispatch({
      type: 'report/getCommunityCodeCollectionList',
      payload: params
    })
  }
  
  handleExport = () => {
    const {  searchFormValues: { merchantName, merchantNo, communityName, payerName, payTime } } = this.state;
    const url = EXPORT_CODE_REPORT_LIST;

    const params = {
      token: GetGlobalToken(),
    };

    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (merchantNo) {
      params['merchantNo'] = merchantNo
    }
    if (communityName) {
      params['communityName'] = communityName
    }
    if (payerName) {
      params['payerName'] = payerName
    }
    if (payTime && payTime.length) {
      params['payTimeStart'] = payTime[0].startOf('day').unix() * 1000
      params['payTimeEnd'] = payTime[1].endOf('day').unix() * 1000
    }

    const exportUrl = spliceDownloadUrl(url, params);
    window.open(exportUrl);
  }

  handleToDetail = ({ id }) => {
    router.push(`/report/community-code-collection/detail/${id}`)
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
    const { communityCodeCollectionList, communityCodeCollectionTotal, tableLoading, globalPageSubMenu } = this.props;

    const pagination = {
      total: communityCodeCollectionTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='社区码收款报表'>
        {
          globalPageSubMenu.COMMUNITY_CODE_COLLECTION_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
            extraButton={
              globalPageSubMenu.COMMUNITY_CODE_COLLECTION_EXPORT &&
              (<Button style={{ marginLeft: 8 }} onClick={this.handleExport}>
                导出
              </Button>)}
          />
        }
        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={communityCodeCollectionList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
          scroll={{ x: 1400 }}
        />

      </PageWrapper>
    )
  }
};


export default CommunityCollectionList
