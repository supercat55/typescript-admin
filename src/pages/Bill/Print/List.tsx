import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Button, Alert, message } from 'antd'; 
import { connect } from 'dva';
import router from 'umi/router';
import { stringify } from 'qs';
import { Debounce, Bind } from 'lodash-decorators';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
import { DEFAULT_ALL_TYPE, BILL_PRINT_STATUS } from '@/utils/const';
import styles from './index.scss';

interface IProps extends StateType {
  dispatch: Dispatch<AnyAction>;
  tableLoading: boolean;
  globalPageSubMenu: any;
  allFeeTypeList: any[];
}

interface IState {
  pageNum: number;
  pageSize: number;
  searchFormItems: any[];
  searchFormValues: {
    communityName: string;
    feeTypeId: string | number;
    billStatus: number;
    buildingNo: string | number;
    unitNo: string | number;
    accountNo: string | number;
    createTime: any[];
    writeOffTime: any[];
  },
  selectedRowKeys: string[];
}

@connect(({ menu, loading, billPrint, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  printHouseList: billPrint.printHouseList,
  printHouseTotal: billPrint.printHouseTotal,
  tableLoading: loading.models['billPrint'],
  allFeeTypeList: global.allFeeTypeList,
}))
class BillPrintList extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 100,
    searchFormItems: [],
    searchFormValues: {
      communityName: '',
      feeTypeId: -1,
      billStatus: -1,
      buildingNo: '',
      unitNo: '',
      accountNo: '',
      createTime: [],
      writeOffTime: []
    },
    selectedRowKeys: [],
  }

  private ref: any
  
  private columns = [
    { title: '小区名称', dataIndex: 'communityName', key: 'communityName' },
    { title: '楼号', dataIndex: 'buildingNo', key: 'buildingNo' },
    { title: '单元号', dataIndex: 'unitNo', key: 'unitNo' },
    { title: '户号', dataIndex: 'accountNo', key: 'accountNo' },
    { title: '业主姓名', dataIndex: 'ownerName', key: 'ownerName' },
    { title: '业主电话 ', dataIndex: 'ownerPhone', key: 'ownerPhone' },
    { title: '打印详情',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        return (
          <div className='table-actions'>
            {globalPageSubMenu.CHECK_BILL_PRINT_DETAIL && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
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
    const { dispatch } = this.props;

    await dispatch({
      type: 'global/getAllFeeTypeList'
    })

    this.renderFormItems();
  }

  renderFormItems = () => {
    const { allFeeTypeList } = this.props;

    let searchFormItems = [
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
      { label: '账单状态', type: 'select', decorator: 'billStatus', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(BILL_PRINT_STATUS) },
      { label: '楼号', type: 'input', decorator: 'buildingNo', placeholder: '请输入楼号' },
      { label: '单元号', type: 'input', decorator: 'unitNo', placeholder: '请输入单元号' },
      { label: '户号', type: 'input', decorator: 'accountNo', placeholder: '请输入户号' },
      { label: '生成时间', type: 'date', decorator: 'createTime', initialValue: [] },
      { label: '销账时间', type: 'date', decorator: 'writeOffTime', initialValue: [] },
    ]

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
    const { pageNum, pageSize, searchFormValues: { communityName, feeTypeId, billStatus, buildingNo, unitNo, accountNo, createTime, writeOffTime } } = this.state;

    const params = {
      pageNum,
      pageSize,
    };

    if (communityName) {
      params['communityName'] = communityName
    }
    if (feeTypeId !== -1) {
      params['feeTypeId'] = feeTypeId
    }
    if (billStatus !== -1) {
      params['billStatus'] = billStatus
    }
    if (buildingNo) {
      params['buildingNo'] = buildingNo
    }
    if (unitNo) {
      params['unitNo'] = unitNo
    }
    if (accountNo) {
      params['accountNo'] = accountNo
    }
    if (createTime && createTime.length) {
      params['billCreateTimeStart'] = createTime[0].startOf('day').unix() * 1000;
      params['billCreateTimeEnd'] = createTime[1].endOf('day').unix() * 1000;
    }
    if (writeOffTime && writeOffTime.length) {
      params['billWriteOffTimeStart'] = writeOffTime[0].startOf('day').unix() * 1000;
      params['billWriteOffTimeEnd'] = writeOffTime[1].endOf('day').unix() * 1000;
    }

    dispatch({
      type: 'billPrint/getPrintHouseList',
      payload: params
    })
  }
  
  handleActions = (mode, info) => {
    switch (mode) {
      case 'detail':
        router.push({
          pathname: `/bill/print/detail/${info.id}`,
        })
        break;
      case 'print':
        this.handleToPrint();
        break;
      default:
        break;
    }
  }

  handleToPrint = () => {
    const { selectedRowKeys, searchFormValues: { feeTypeId, billStatus, createTime, writeOffTime } } = this.state;
    if (!selectedRowKeys.length) {
      message.error('请勾选打印的账单');
      return;
    }
    const params = {
      houseIds: selectedRowKeys
    };

    if (feeTypeId !== -1) {
      params['feeTypeId'] = feeTypeId
    }
    if (billStatus !== -1) {
      params['billStatus'] = billStatus
    }
    if (createTime && createTime.length) {
      params['billCreateTimeStart'] = createTime[0].startOf('day').unix() * 1000;
      params['billCreateTimeEnd'] = createTime[1].endOf('day').unix() * 1000;
    }
    if (writeOffTime && writeOffTime.length) {
      params['billWriteOffTimeStart'] = writeOffTime[0].startOf('day').unix() * 1000;
      params['billWriteOffTimeEnd'] = writeOffTime[1].endOf('day').unix() * 1000;
    }

    router.push({
      pathname: '/print',
      search: stringify(params, { indices: false })
    })
  }

  handleRowSelectionChange = selectedRowKeys => {
    this.setState({ 
      selectedRowKeys,
    })
  }

  handleClearSelected = () => {
    this.setState({ 
      selectedRowKeys: [],
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
    const { pageNum, pageSize, searchFormItems, selectedRowKeys } = this.state;
    const { printHouseList, printHouseTotal, tableLoading, globalPageSubMenu } = this.props;

    const pagination = {
      total: printHouseTotal,
      current: pageNum,
      pageSize,
    };
    const rowSelection =  {
      selectedRowKeys,
      onChange: this.handleRowSelectionChange,
    }

    return (
      <PageWrapper title='单据打印'>
        {
          globalPageSubMenu.BILL_PRINT_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            change={this.handleSearchFormChange}
            ref={node => (this.ref = node)}
            extraButton={
              globalPageSubMenu.BILL_PRINT &&
              (<Button style={{ marginLeft: 8 }} onClick={() => this.handleActions('print', null)}>
                单据打印
              </Button>)}
          />
        }
        <Alert 
          type="info"
          message={(
            <div className={styles.alertContainer}>
              <span>已选择{selectedRowKeys.length}个小区</span>
              <span className={styles.clear} onClick={this.handleClearSelected}>清空</span>
            </div>
          )}
        />
        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={printHouseList}
          loading={tableLoading}
          pagination={pagination}
          rowSelection={rowSelection}
          onChange={this.handleTabelChange}
        />

      </PageWrapper>
    )
  }
};


export default BillPrintList
