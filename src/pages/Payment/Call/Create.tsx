import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Button, Popconfirm, Alert, message } from 'antd'; 
import { connect } from 'dva';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import { DEFAULT_ALL_TYPE, CALL_BILL_STATUS } from '@/utils/const';


interface IProps extends StateType {
  dispatch: Dispatch<AnyAction>;
  tableLoading: boolean;
  allFeeTypeList: any[];
  allBillList: any[];
  allBillTotal: number;
}

interface IState {
  pageNum: number;
  pageSize: number;
  searchFormItems: any[];
  searchFormValues: {
    communityName: string;
    billName: string;
    status: number;
    feeTypeId: string | number;
    buildingNo: string | number;
    unitNo: string | number;
    accountNo: string | number;
    houseNo: string | number;
    condition: string;
    time: any[]
  }
}

@connect(({ loading, global }) => ({
  allBillList: global.allBillList,
  allBillTotal: global.allBillTotal,
  allFeeTypeList: global.allFeeTypeList,
  tableLoading: loading.effects['global/getAllBillList'],
}))
class CreatePaymentCallPage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [],
    searchFormValues: {
      communityName: '',
      billName: '',
      status: -1,
      feeTypeId: -1,
      buildingNo: '',
      unitNo: '',
      accountNo: '',
      houseNo: '',
      condition: '',
      time: [],
    }
  }

  private ref: any
  
  private columns = [
    { title: '账单名称', dataIndex: 'billName', key: 'billName' },
    { title: '缴费地址', dataIndex: 'address', key: 'address' },
    { title: '账单金额', dataIndex: 'billAmount', key: 'billAmount' },
    { title: '待缴金额', dataIndex: 'unpaidAmount', key: 'unpaidAmount' },
    { title: '催缴次数', dataIndex: 'callTimes', key: 'callTimes' },
    { title: '账单编号', dataIndex: 'billNum', key: 'billNum' },
    { title: '账单生成时间', dataIndex: 'createTime', key: 'createTime' },
    { title: '账单状态', dataIndex: 'statusDesc', key: 'statusDesc' },
    { title: '房主姓名', dataIndex: 'ownerName', key: 'ownerName' },
    { title: '房主电话', dataIndex: 'ownerPhone', key: 'ownerPhone' },
  ]

  componentDidMount() {
    this.initializeForm();
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
        required: true, 
        message: '请输入小区名称',
      },
      { label: '账单名称', type: 'input', decorator: 'billName', placeholder: '请输入账单名称' },
      { label: '账单状态', type: 'select', decorator: 'status', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(CALL_BILL_STATUS) },
      { 
        label: '费用类型', 
        type: 'select', 
        decorator: 'feeTypeId', 
        initialValue: -1, 
        fieldNames: { label: 'feeName', value: 'id' },
        source: [{ feeName: '全部', id: -1 }].concat(allFeeTypeList) 
      },
      { label: '楼号', type: 'input', decorator: 'buildingNo', placeholder: '请输入楼号' },
      { label: '单元号', type: 'input', decorator: 'unitNo', placeholder: '请输入单元号' },
      { label: '户号', type: 'input', decorator: 'accountNo', placeholder: '请输入户号' },
      { label: '房屋唯一编号', type: 'input', decorator: 'houseNo', placeholder: '请输入房屋唯一编号' },
      { label: '账单生成时间', type: 'date', decorator: 'time', initialValue: [] },
      { label: '账单编号', type: 'input', decorator: 'condition', placeholder: '请输入账单编号' },
    ]

    this.setState({ searchFormItems })
  }


  handleSearchList = () => {
    const { dispatch } = this.props;
    const { pageNum, pageSize, searchFormValues: { communityName, billName, status, feeTypeId, buildingNo, unitNo, accountNo, houseNo, condition, time } } = this.state;

    const params = {
      pageNum,
      pageSize,
      communityName,
      isCall: 1,
      status: []
    };

    if (billName) {
      params['billName'] = billName;
    }
    if (feeTypeId !== -1) {
      params['feeTypeId'] = feeTypeId;
    }
    if (buildingNo) {
      params['buildingNo'] = buildingNo;
    }
    if (unitNo) {
      params['unitNo'] = unitNo;
    }
    if (accountNo) {
      params['accountNo'] = accountNo;
    }
    if (houseNo) {
      params['houseNo'] = houseNo;
    }
    if (condition) {
      params['condition'] = condition;
    }
    if (status === -1) {
      for (let i in CALL_BILL_STATUS) {
        params['status'].push(CALL_BILL_STATUS[i].value)
      }
    } else {
      params['status'] = [status]
    }
    if (time && time.length) {
      params['createTimeStart'] = time[0].startOf('day').unix() * 1000;
      params['createTimeEnd'] = time[1].endOf('day').unix() * 1000;
    }

    dispatch({
      type: 'global/getAllBillList',
      payload: params
    })
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
    const newFrmItems = searchFormItems.map(item => ({ ...item }));
    
    let result = await dispatch({
      type: 'global/getAllCommunityListByName',
      payload: { communityName: name }
    })

    if (result && result['length']) {
      newFrmItems[0].dataSource = result;

      this.setState({
        searchFormItems: newFrmItems
      })
    }
  }
  
  handleCallBill = () => {
    const { dispatch, allBillList } = this.props;
    const { searchFormValues: { communityName, billName, status, feeTypeId, buildingNo, unitNo, accountNo, houseNo, condition, time } } = this.state;
    if (!communityName) {
      message.error('请查询小区名称催缴')
      return;
    }
    if (!allBillList.length) {
      message.error('请查询符合条件账单后催缴')
      return;
    }
    
    const params = {
      communityName,
      status: []
    };

    if (billName) {
      params['billName'] = billName;
    }
    if (feeTypeId !== -1) {
      params['feeTypeId'] = feeTypeId;
    }
    if (buildingNo) {
      params['buildingNo'] = buildingNo;
    }
    if (unitNo) {
      params['unitNo'] = unitNo;
    }
    if (accountNo) {
      params['accountNo'] = accountNo;
    }
    if (houseNo) {
      params['houseNo'] = houseNo;
    }
    if (condition) {
      params['condition'] = condition;
    }
    if (status === -1) {
      for (let i in CALL_BILL_STATUS) {
        params['status'].push(CALL_BILL_STATUS[i].value)
      }
    } else {
      params['status'] = [status]
    }
    if (time && time.length) {
      params['createTimeStart'] = time[0].startOf('day').unix() * 1000;
      params['createTimeEnd'] = time[1].endOf('day').unix() * 1000;
    }

    dispatch({
      type: 'paymentCall/callBill',
      payload: params
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
    const { allBillList, allBillTotal, tableLoading } = this.props;
    const pagination = {
      total: allBillTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper 
        title='催缴'
        showBack
        customBreadcrumbmap={[
          { name: '缴费管理', url: '' },
          { name: '催缴管理', url: '/payment/call' },
          { name: '催缴' },
        ]}
      >
        <PageSearchForm 
          fields={searchFormItems} 
          showAll
          search={this.handleFilterSearch}
          ref={node => (this.ref = node)}
          change={this.handleSearchFormChange}
        />

        <Popconfirm
          title="是否确认催缴？"
          okText="确定" 
          cancelText="取消"
          onConfirm={this.handleCallBill} 
          onCancel={() => console.log('取消')}
        >
          <Button type="primary">催缴</Button>
        </Popconfirm>

        <Alert 
          message="每个账单的催缴次数上限为4次，超过催缴次数限制的账单将不被成功催缴" 
          type="info" 
          showIcon 
          style={{ marginTop: 20 }}
        />
        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={allBillList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
        />
      </PageWrapper>
    )
  }
};


export default CreatePaymentCallPage
