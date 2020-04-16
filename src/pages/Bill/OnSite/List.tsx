import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Form, Row, Col, Button, Alert, message, Modal, Input, Select, Switch, InputNumber } from 'antd'; 
import { FormComponentProps } from 'antd/lib/form';
import { connect } from 'dva';
import router from 'umi/router';
import { stringify } from 'qs';
import { Decimal } from 'decimal.js';
import { Debounce, Bind } from 'lodash-decorators';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import BillTempModal, { BillTemplateModalProps } from '../component/BillTempModal';
import { formItemHorizontalLayout } from '@/utils/config';
import { StateType } from './model';
import styles from './index.scss';

const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  tableLoading: boolean;
  globalPageSubMenu: any;
  allFeeTypeList: any[];
  allPayCodeList: any[];
}

interface IState {
  pageNum: number;
  pageSize: number;
  searchFormItems: any[];
  searchFormValues: {
    communityName: string;
    feeTypeId: string | number;
    condition: string;
    condition1: string;
    buildingNo: string | number;
    unitNo: string | number;
    accountNo: string | number;
    houseNo: string | number;
  },
  selectedRowKeys: string[];
  selectedRows: any[];
  visible: boolean;
}

@connect(({ menu, loading, billOnSite, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  billPayList: billOnSite.billPayList,
  billPayTotal: billOnSite.billPayTotal,
  tableLoading: loading.models['billOnSite'],
  allFeeTypeList: global.allFeeTypeList,
  allPayCodeList: global.allPayCodeList,
}))
class BillOnSiteList extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [],
    searchFormValues: {
      communityName: '',
      feeTypeId: -1,
      condition: '',
      condition1: '',
      buildingNo: '',
      unitNo: '',
      accountNo: '',
      houseNo: '',
    },
    selectedRowKeys: [],
    selectedRows: [],
    visible: false,
  }

  private ref: any
  
  private columns = [
    { title: '账单名称', dataIndex: 'billName', key: 'billName' },
    { title: '缴费地址', dataIndex: 'address', key: 'address' },
    { title: '房屋唯一编号', dataIndex: 'houseNo', key: 'houseNo' },
    { title: '业主名称', dataIndex: 'ownerName', key: 'ownerName' },
    { title: '账单金额', dataIndex: 'billAmount', key: 'billAmount' },
    { title: '已缴金额', dataIndex: 'paidAmount', key: 'paidAmount' },
    { title: '待缴金额', dataIndex: 'unpaidAmount', key: 'unpaidAmount' },
    { title: '滞纳金', dataIndex: 'overdueAmount', key: 'overdueAmount' },
    { title: '操作',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        return (
          <div className='table-actions'>
            {globalPageSubMenu.CHECK_ONSITE_PAYMENT_DETAIL && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
          </div>
        )
      }
    }
  ]

  private paymentColumns = [
    { title: '账单名称', dataIndex: 'billName', key: 'billName' },
    { title: '费用名称', dataIndex: 'feeName', key: 'feeName' },
    { title: '滞纳金', dataIndex: 'overdueAmount', key: 'overdueAmount',
      render: text => (
        <span>{text ? '¥ ' + text.toFixed(2) : ''}</span>
      )
    },
    { title: '缴费地址', dataIndex: 'address', key: 'address' },
    { title: '应收金额', dataIndex: 'unpaidAmount', key: 'unpaidAmount',
      render: text => (
        <span>{text ? '¥ ' + text.toFixed(2) : ''}</span>
      )
    },
    { title: '实收金额', width: 150, dataIndex: 'paidAmount', key: 'paidAmount',
      render: (text, record, index) => (
        <InputNumber
          formatter={value => `¥ ${value}`}
          min={0.01}
          defaultValue={record.unpaidAmount}
          precision={2}
          step={0.01}
          onChange={value => this.handlePaymentItemAmountChange(value, index)}
        />
      )
    },
    { title: '是否销账', dataIndex: 'isWriteOff', key: 'isWriteOff',
      render: (text, record, index) => (
        <Switch 
          checked={text === 1} 
          disabled={record.paidAmount >= record.unpaidAmount} 
          defaultChecked={true} 
          checkedChildren="是" 
          unCheckedChildren="否" 
          onChange={checked => this.handlePaymentItemWriteOffChange(checked, index)} 
        />
      )
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

    await dispatch({
      type: 'global/getAllPayCodeList',
      payload: { type: 2 }
    })
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
      { label: '账单搜索', type: 'input', decorator: 'condition', placeholder: '请输入账单名称/账单编号' },
      { label: '业主搜索', type: 'input', decorator: 'condition1', placeholder: '请输入业主姓名/业主电话' },
      { label: '楼号', type: 'input', decorator: 'buildingNo', placeholder: '请输入楼号' },
      { label: '单元号', type: 'input', decorator: 'unitNo', placeholder: '请输入单元号' },
      { label: '户号', type: 'input', decorator: 'accountNo', placeholder: '请输入户号' },
      { label: '房屋唯一编号', type: 'input', decorator: 'houseNo', placeholder: '请输入房屋唯一编号' },
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
    const { pageNum, pageSize, searchFormValues: { communityName, feeTypeId, condition, condition1, buildingNo, unitNo, accountNo, houseNo } } = this.state;

    const params = {
      pageNum,
      pageSize,
      status: [1, 4]
    };

    if (communityName) {
      params['communityName'] = communityName
    }
    if (feeTypeId !== -1) {
      params['feeTypeId'] = feeTypeId
    }
    if (condition) {
      params['condition'] = condition
    }
    if (condition1) {
      params['condition1'] = condition1
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
    if (houseNo) {
      params['houseNo'] = houseNo
    }

    dispatch({
      type: 'billOnSite/getBillPayList',
      payload: params
    })
  }
  
  handleActions = (mode, info) => {
    const { selectedRowKeys } = this.state;
    switch (mode) {
      case 'detail':
        router.push({
          pathname: `/bill/detail/actions/${info.id}`,
          search: stringify({ mode: 'detail' })
        })
        break;
      case 'payment':
        this.handleClickBatchPaymentButton();
        break;
      default:
        break;
    }
  }

  // 给要批量缴费的账单添加默认值（实收金额为应收金额，默认是销账为1）
  handleClickBatchPaymentButton = () => {
    const { selectedRows } = this.state;

    if (!selectedRows.length) {
      message.warning('请先选择需要缴费的账单');
      return
    }

    let newData = selectedRows.map(item => ({
      ...item,
      paidAmount: item.unpaidAmount,
      isWriteOff: 1
    }));


    this.setState({ 
      selectedRows: newData,
      visible: true 
    });
  }

  handleRowSelectionChange = (selectedRowKeys, selectedRows) => {
    this.setState({ 
      selectedRowKeys,
      selectedRows
    })
  }

  handleClearSelected = () => {
    this.setState({ 
      selectedRowKeys: [],
      selectedRows: []
    })
  }

  // 批量缴费账单item 实收金额change事件
  handlePaymentItemAmountChange = (value, index) => {
    const { selectedRows } = this.state;
    const newData = selectedRows.map(item => ({...item}));

    newData[index].paidAmount = value;

    this.setState({
      selectedRows: newData
    })
  }

  // 批量缴费账单item 是否缴费checked修改事件
  handlePaymentItemWriteOffChange = (checked, index) => {
    const { selectedRows } = this.state;
    const newData = selectedRows.map(item => ({...item}));

    newData[index].isWriteOff = checked ? 1 : 0

    this.setState({
      selectedRows: newData
    })
  }

  // 批量缴费确认事件
  handlePaymentModalOk = () => {
    const { dispatch, form } = this.props;
    const { selectedRows } = this.state;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { payName, payMode, remark } = values;

      let billList = [];
      selectedRows.forEach(item => {
        let obj = {
          payName,
          payMode,
          id: item.id,
          isWriteOff: item.isWriteOff,
          paidAmount: parseFloat(new Decimal(item.paidAmount * 100).toFixed(2))
        }

        if (remark) {
          obj['remark'] = remark
        }

        billList.push(obj)
      })

      let result = await dispatch({
        type: 'billOnSite/billPay',
        payload: {
          billList
        }
      })

      if (result) {
        this.handlePaymentModalCancel();

        Modal.confirm({
          title: '缴费成功，是否打印单据？',
          okText: '打印',
          cancelText: '取消',
          onOk: () => this.handlePrintOk(),
          onCancel: () => this.handlePrintCancel()
        })
      }
    })
  }

  // 批量缴费取消事件
  handlePaymentModalCancel = () => {
    this.setState({
      visible: false
    })
  }

  handlePrintOk = () => {
    const { selectedRowKeys } = this.state;

    router.push({
      pathname: '/print',
      search: stringify({
        billIds: selectedRowKeys,
        type: 'onsite'
      })
    })
  }

  handlePrintCancel = () => {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    }, this.handleSearchList);
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
    const { pageNum, pageSize, searchFormItems, selectedRowKeys, selectedRows, visible } = this.state;
    const { billPayList, billPayTotal, tableLoading, globalPageSubMenu, form: { getFieldDecorator }, allPayCodeList } = this.props;
    const pagination = {
      total: billPayTotal,
      current: pageNum,
      pageSize,
    };
    const rowSelection =  {
      selectedRowKeys,
      onChange: this.handleRowSelectionChange,
    }

    return (
      <PageWrapper title='现场缴费'>
        {
          globalPageSubMenu.ONSITE_PAYMENT_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
          />
        }

        { 
          globalPageSubMenu.ONSITE_BATCH_PAYMENT &&
          <Button 
            type='primary'
            icon='plus'
            style={{ marginBottom: '30px' }} 
            onClick={() => this.handleActions('payment', null)}
          >
            批量缴费
          </Button>
        }
        <Alert 
          type="info"
          message={(
            <div className={styles.alertContainer}>
              <span>已选择{selectedRowKeys.length}笔账单</span>
              <span className={styles.clear} onClick={this.handleClearSelected}>清空</span>
            </div>
          )}
        />
        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={billPayList}
          loading={tableLoading}
          pagination={pagination}
          rowSelection={rowSelection}
          onChange={this.handleTabelChange}
        />

        <Modal
          width={1000}
          title="现场缴费"
          maskClosable={false}
          visible={visible}
          okText={'缴费'}
          cancelText={'取消'}
          onOk={this.handlePaymentModalOk}
          onCancel={this.handlePaymentModalCancel}
        >
          <Fragment>
            <StandardTable
              rowKey={'id'}
              columns={this.paymentColumns}
              dataSource={selectedRows}
              pagination={false}
              scroll={{ y: 400 }}
            />
            <Row style={{ marginTop: 24 }}>
              <Col span={12} offset={6}>
                <Form {...formItemHorizontalLayout}>
                  <FormItem label={'缴费人'}>
                    {getFieldDecorator('payName')(
                      <Input placeholder="请选择缴费人"/>
                    )}
                  </FormItem>
                  <FormItem label={'支付方式'}>
                    {getFieldDecorator('payMode', {
                      rules: [{ required: true, message: '请选择支付方式' }]
                    })(
                      <Select placeholder="请选择支付方式">
                        {allPayCodeList.map(item => (
                          <Option value={item.code} key={item.code}>{item.name}</Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                  <FormItem label={'备注'}>
                    {getFieldDecorator('remark')(
                      <TextArea autoSize={{ minRows: 2, maxRows: 6 }} placeholder="请输入备注"/>
                    )}
                  </FormItem>
                </Form>
              </Col>
            </Row>
          </Fragment>
        </Modal>
      </PageWrapper>
    )
  }
};


export default Form.create()(BillOnSiteList)
