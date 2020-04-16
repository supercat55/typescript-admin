import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { message, Button } from 'antd';
import moment from 'moment';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
import { GetUserBaseInfo } from '@/utils/cache';
import { spliceDownloadUrl } from '@/utils/utils';

interface IProps extends StateType {
  dispatch: Dispatch<AnyAction>;
  tableLoading: boolean;
  globalPageSubMenu: any;
  allOrganizationList: any[];
}

interface IState {
  pageNum: number;
  pageSize: number;
  searchFormItems: any[];
  searchFormValues: {
    merchantName: string;
    merchantNo: number | string;
    orgId: string | number;
    payTime: any[];
   
  },
  selectedRowKeys: string[];
  selectedRow: any[];
}

const initStartTime = moment().subtract(3, 'months');
const initEndTime = moment().endOf('day');

@connect(({ menu, loading, report, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  reconciliationList: report.reconciliationList,
  reconciliationTotal: report.reconciliationTotal,
  tableLoading: loading.models['report'],
  allOrganizationList: global.allOrganizationList,
}))
class ReconciliationList extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [],
    searchFormValues: {
      merchantName: '',
      merchantNo: '',
      orgId: -1,
      payTime: [initStartTime, initEndTime],
    },
    selectedRowKeys: [],
    selectedRow: []
  }

  private ref: any
  
  private columns = [
    { title: '交易日期', dataIndex: 'transactionDate', key: 'transactionDate' },
    { title: '商户号', dataIndex: 'merchantNum', key: 'merchantNum' },
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName'},
    { title: '对账文件名称', dataIndex: 'walletBillName', key: 'walletBillName' },
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
        { label: '交易日期', type: 'date', decorator: 'payTime', initialValue: [initStartTime, initEndTime] },
      ]
    } else {
      searchFormItems = [
        { label: '交易日期', type: 'date', decorator: 'payTime', initialValue: [initStartTime, initEndTime] },
      ]
    }

    this.setState({ searchFormItems })
  }

  handleSearchList = () => {
    const { dispatch } = this.props;
    const { pageNum, pageSize, searchFormValues: { merchantName, merchantNo, orgId, payTime } } = this.state;

    const params = {
      pageNum,
      pageSize,
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

    if (!payTime.length) {
      message.warn('请选择交易日期范围');
      return;
    }

    dispatch({
      type: 'report/getReconciliationReportList',
      payload: params
    })
  }
  
  handleReportDownload = () => {
    const { selectedRow } = this.state;

    if (!selectedRow.length) {
      message.warn('请选择需要下载的文件');
      return;
    }

    let list = [];

    for (let i in selectedRow) {
      let item = selectedRow[i]
      list.push(`${item.merchantNum}|${moment(item.transactionDate).format('YYYYMMDD')}`)
    }
    
    const url = spliceDownloadUrl('/api/v1/coreservice/reportForm/walletBill/export', { info: list.join(',') })
    
    window.open(url)
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
    const { pageNum, pageSize, searchFormItems, selectedRowKeys, selectedRow } = this.state;
    const { reconciliationList, reconciliationTotal, tableLoading, globalPageSubMenu } = this.props;

    const pagination = {
      total: reconciliationTotal,
      current: pageNum,
      pageSize,
    };

    const rowSelection =  {
      selectedRowKeys,
      onChange: this.handleRowSelectionChange,
      getCheckboxProps: record => {
        return {
          disabled: record.walletBillName === '无'
        }
      }
    }

    return (
      <PageWrapper title='对账报表'>
        {
          globalPageSubMenu.RECONCILIATION_REPORT_ORDER_SEARCH&&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
          />
        }
        { 
          globalPageSubMenu.RECONCILIATION_REPORT_ORDER_DOWNLOAD &&
          <Button 
            type='primary'
            style={{ marginBottom: '30px' }} 
            onClick={this.handleReportDownload}
          >
            合并下载
          </Button>
        }
        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={reconciliationList}
          loading={tableLoading}
          pagination={pagination}
          rowSelection={rowSelection}
          onChange={this.handleTabelChange}
        />

      </PageWrapper>
    )
  }
};


export default ReconciliationList
