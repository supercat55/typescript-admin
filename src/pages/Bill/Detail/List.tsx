import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Form, Modal, Input, InputNumber, Row, Col, Button, Dropdown, Menu, message } from 'antd'; 
import { FormComponentProps } from 'antd/lib/form';
import { connect } from 'dva';
import router from 'umi/router';
import moment from 'moment';
import { stringify } from 'qs';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { GetUserBaseInfo, GetGlobalToken } from '@/utils/cache';
import { formItemHorizontalLayout } from '@/utils/config';
import { DEFAULT_ALL_TYPE, BILL_STATUS } from '@/utils/const';
import { spliceDownloadUrl } from '@/utils/utils';
import { EXPORT_BILL_DATA } from '@/utils/url';
import { StateType } from './model';

const FormItem = Form.Item;
const TextArea = Input.TextArea;
const Confirm = Modal.confirm;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  tableLoading: boolean;
  globalPageSubMenu: any;
  allFeeTypeList: any[];
  allPayCodeList: any[];
  allSourceSceneList: any[];
}

interface IState {
  pageNum: number;
  pageSize: number;
  searchFormItems: any[];
  searchFormValues: {
    condition: string;
    communityName: string;
    buildingNo: string | number;
    unitNo: string | number;
    accountNo: string | number;
    houseNo: string | number;
    feeTypeId: string | number;
    createTime: any[];
    writeOffTime: any[];
    status: number;
    payMode: number;
    billName: string;
    merchantName: string;
    sourceScene:  string | number;
  },
  batchType: string;
  isBatch: boolean;
  selectedRowKeys: string[];
  cancelVisible: boolean;
  recordVisible: boolean;
  current: any;
}

const initStartTime = moment().startOf('day').subtract(6, 'months');
const initEndTime = moment().startOf('day');

@connect(({ menu, loading, billDetail, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  billList: billDetail.billList,
  billTotal: billDetail.billTotal,
  tableLoading: loading.models['billDetail'],
  allFeeTypeList: global.allFeeTypeList,
  allPayCodeList: global.allPayCodeList,
  allSourceSceneList: global.allSourceSceneList,
}))
class BillDetailList extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [],
    searchFormValues: {
      condition: '',
      communityName: '',
      buildingNo: '',
      unitNo: '',
      accountNo: '',
      houseNo: '',
      feeTypeId: -1,
      createTime: [initStartTime, initEndTime],
      writeOffTime: [],
      status: -1,
      payMode: -1,
      billName: '',
      merchantName: '',
      sourceScene: -1,
    },
    batchType: '',
    isBatch: false,
    selectedRowKeys: [],
    cancelVisible: false,
    recordVisible: false,
    current: {}
  }

  private ref: any
  
  private columns = [
    { title: '账单名称', dataIndex: 'billName', key: 'billName' },
    { title: '缴费地址', dataIndex: 'address', key: 'address' },
    { title: '账单金额', dataIndex: 'billAmount', key: 'billAmount', width: 100 },
    { title: '待缴金额', dataIndex: 'unpaidAmount', key: 'unpaidAmount', width: 100 },
    { title: '滞纳金', dataIndex: 'overdueAmount', key: 'overdueAmount', width: 100 },
    { title: '催缴次数', dataIndex: 'callTimes', key: 'callTimes', width: 100 },
    { title: '支付手机号', dataIndex: 'payPhone', key: 'payPhone' },
    { title: '支付方式', dataIndex: 'payTypeName', key: 'payTypeName' },
    { title: '账单推送日', dataIndex: 'pushTime', key: 'pushTime' },
    { title: '账单销账时间', dataIndex: 'writeOffTime', key: 'writeOffTime' },
    { title: '账单编号', dataIndex: 'billNum', key: 'billNum', width: 200, fixed: 'right' },
    { title: '账单状态', dataIndex: 'statusDesc', key: 'statusDesc', width: 100, fixed: 'right' },
    { title: '操作', width: 160, fixed: 'right',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        switch (Number(record.status)) {
          case 0:
          case 1:
            return (
              <div className='table-actions'>
                {globalPageSubMenu.BILL_CREATE_OR_EDIT && <span onClick={() => this.handleActions('edit', record)}>编辑</span>}
                {globalPageSubMenu.CHECK_BILL_DETAIL && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
              </div>
            )
          case 2:
          case 4:
            return (
              <div className='table-actions'>
                {globalPageSubMenu.BILL_RECORD_REFUND && <span onClick={() => this.handleActions('record', record)}>记录退款</span>}
                {globalPageSubMenu.CHECK_BILL_DETAIL && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
              </div>
            )
          case 3:
            return (
              <div className='table-actions'>
                {globalPageSubMenu.CHECK_BILL_DETAIL && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
              </div>
            )
          default:
            break;
        }
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

    await dispatch({
      type: 'global/getAllPayCodeList'
    })

    await dispatch({
      type: 'global/getAllSourceSceneList'
    })

    this.renderFormItems();
  }

  renderFormItems = () => {
    const { loginType } = GetUserBaseInfo();
    const { allFeeTypeList, allPayCodeList, allSourceSceneList } = this.props;

    let searchFormItems = [
      { label: '搜索', type: 'input', decorator: 'condition', placeholder: '商户名/商户号/姓名/账号ID' },
      { 
        label: '小区名称', 
        type: 'autoComplete',
        decorator: 'communityName', 
        placeholder: '请输入搜索的小区名称', 
        dataSource: [], 
      },
      { label: '生成时间', type: 'date', decorator: 'createTime', initialValue: [initStartTime, initEndTime] },
      { label: '楼号', type: 'input', decorator: 'buildingNo', placeholder: '请输入楼号' },
      { label: '单元号', type: 'input', decorator: 'unitNo', placeholder: '请输入单元号' },
      { label: '户号', type: 'input', decorator: 'accountNo', placeholder: '请输入户号' },
      { label: '房屋唯一编号', type: 'input', decorator: 'houseNo', placeholder: '请输入房屋唯一编号' },
      { 
        label: '费用类型', 
        type: 'select', 
        decorator: 'feeTypeId', 
        initialValue: -1, 
        fieldNames: { label: 'feeName', value: 'id' },
        source: [{ feeName: '全部', id: -1 }].concat(allFeeTypeList) 
      },
      { label: '销账时间', type: 'date', decorator: 'writeOffTime', initialValue: [] },
      { label: '账单状态', type: 'select', decorator: 'status', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(BILL_STATUS) },
      { 
        label: '支付方式', 
        type: 'select', 
        decorator: 'payMode', 
        initialValue: -1, 
        fieldNames: { label: 'name', value: 'code' },
        source: [{ name: '全部', code: -1 }].concat(allPayCodeList) 
      },
      { label: '账单名称', type: 'input', decorator: 'billName', placeholder: '请输入账单名称' },
    ]

    if (loginType === 'operation') {
      searchFormItems.unshift( { label: '商户名称', type: 'input', decorator: 'merchantName', placeholder: '请输入商户名称' } as any)
      searchFormItems.push( { 
        label: '来源场景', 
        type: 'select', 
        decorator:'sourceScene', 
        initialValue: -1, 
        fieldNames: { label: 'sourceName', value: 'id' },
        source: [{ sourceName: '全部', id: -1 }].concat(allSourceSceneList) 
      } as any)
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
    const { 
      pageNum, 
      pageSize, 
      searchFormValues: { 
        condition, 
        communityName,
        buildingNo,
        unitNo,
        accountNo,
        houseNo,
        feeTypeId,
        createTime,
        writeOffTime,
        status,
        payMode,
        billName,
        merchantName,
        sourceScene
      } 
    } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (condition) {
      params['condition'] = condition
    }
    if (communityName) {
      params['communityName'] = communityName
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
    if (feeTypeId !== -1) {
      params['feeTypeId'] = feeTypeId
    }
    if (createTime && createTime.length) {
      params['createTimeStart'] = createTime[0].startOf('day').unix() * 1000;
      params['createTimeEnd'] = createTime[1].endOf('day').unix() * 1000;
    }
    if (writeOffTime && writeOffTime.length) {
      params['writeOffTimeStart'] = writeOffTime[0].startOf('day').unix() * 1000;
      params['writeOffTimeEnd'] = writeOffTime[1].endOf('day').unix() * 1000;
    }
    if (status !== -1) {
      params['status'] = [status]
    }
    if (payMode !== -1) {
      params['payMode'] = [payMode]
    }
    if (billName) {
      params['billName'] = billName
    }
    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (sourceScene !== -1) {
      params['sourceScene'] = sourceScene
    }

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
      type: 'billDetail/getBillList',
      payload: params
    })
  }
  
  handleActions = (mode, info) => {
    switch (mode) {
      case 'edit':
      case 'detail':
        router.push({
          pathname: `/bill/detail/actions/${info.id}`,
          search: stringify({ mode })
        })
        break;
      case 'single-create':
        router.push({
          pathname: '/bill/detail/single-create',
        })
        break;
      case 'batch-create':
        router.push({
          pathname: '/bill/detail/batch-create',
        })
        break;
      case 'template-create':
        router.push({
          pathname: '/bill/detail/temp-create',
        })
        break;
      case 'recover':
        this.handleRecoverBill();
        break;
      case 'undo':
        this.handleUndoBill();
        break;
      case 'record':
        this.setState({
          recordVisible: true,
          current: info
        })
      case 'importResult':
        router.push({
          pathname: '/import-result',
          search: stringify({ fileType: 3 })
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
    const { 
      searchFormValues: { 
        condition, 
        communityName,
        buildingNo,
        unitNo,
        accountNo,
        houseNo,
        feeTypeId,
        createTime,
        writeOffTime,
        status,
        payMode,
        billName,
        merchantName,
        sourceScene
      }  
    } = this.state;
    const url = EXPORT_BILL_DATA;

    const params = {
      token: GetGlobalToken(),
    };

    if (condition) {
      params['condition'] = condition
    }
    if (communityName) {
      params['communityName'] = communityName
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
    if (feeTypeId !== -1) {
      params['feeTypeId'] = feeTypeId
    }
    if (createTime && createTime.length) {
      params['createTimeStart'] = createTime[0].startOf('day').unix() * 1000;
      params['createTimeEnd'] = createTime[1].endOf('day').unix() * 1000;
    }
    if (writeOffTime && writeOffTime.length) {
      params['writeOffTimeStart'] = writeOffTime[0].startOf('day').unix() * 1000;
      params['writeOffTimeEnd'] = writeOffTime[1].endOf('day').unix() * 1000;
    }
    if (status !== -1) {
      params['status'] = [status]
    }
    if (payMode !== -1) {
      params['payMode'] = [payMode]
    }
    if (billName) {
      params['billName'] = billName
    }
    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (sourceScene !== -1) {
      params['sourceScene'] = sourceScene
    }

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

  // 确认恢复账单事件
  handleRecoverBill = () => {
    const { dispatch } = this.props;
    const { selectedRowKeys } = this.state;

    if (!selectedRowKeys.length) {
      message.info('请勾选要恢复的账单')
      this.setState({
        batchType: '',
        isBatch: false
      });

      return;
    } 

    Confirm({
      title: '是否确认恢复已勾选的账单？',
      onOk: async() => {
        let result = await dispatch({
          type: 'billDetail/toggleBillStatus',
          payload: {
            ids: selectedRowKeys,
            status: 0
          }
        })

        if (result) {
          message.success('恢复账单成功');

          this.handleResetBatch();
          this.handleSearchList();
        }
      }
    })
  }

  // 确认撤销账单事件
  handleUndoBill = () => {
    const { selectedRowKeys } = this.state;

    if (!selectedRowKeys.length) {
      message.info('请勾选要撤销的账单')
      this.setState({
        batchType: '',
        isBatch: false
      });

      return;
    } 

    this.setState({ cancelVisible: true })
  }

  // 撤销账单弹框确认事件
  handleCancelModalOk = () => {
    const { selectedRowKeys } = this.state;
    const { dispatch, form } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      let result = await dispatch({
        type: 'billDetail/toggleBillStatus',
        payload: {
          ids: selectedRowKeys,
          status: 3,
          cancelDescribtion: values.cancelDescribtion
        }
      })

      if (result) {
        message.success('撤销账单成功');

        this.handleResetBatch();
        this.handleSearchList();
      }
    })
  }

  handleCancelModalCancel = () => {
    this.setState({
      selectedRowKeys: [],
      batchType: '',
      isBatch: false,
      cancelVisible: false
    })
  }

  // 记录退款弹框确认事件
  handleRecordModalOk = () => {
    const { current } = this.state;
    const { dispatch, form } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { amount, remark } = values;

      const params = {
        id: current.id,
        amount,
      }
      if (remark) {
        params['remark'] = remark
      }
      let result = await dispatch({
        type: 'billDetail/recordBillRefund',
        payload: params
      })

      if (result) {
        message.success('记录退款成功');

        this.handleRecordModalCancel();
        this.handleSearchList();
      }
    })
  }

  handleRecordModalCancel = () => {
    this.setState({
      recordVisible: false,
      current: {}
    });
  } 
  /**
   * 批量恢复/批量撤销点击
   */
  handleBatch = batchType => {
    this.setState({
      batchType,
      isBatch: true
    });
  }

  handleResetBatch = () => {
    this.setState({
      selectedRowKeys: [],
      batchType: '',
      isBatch: false,
      cancelVisible: false
    })
  }

  handleRowSelectionChange = selectedRowKeys => {
    this.setState({ selectedRowKeys })
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
    const { pageNum, pageSize, searchFormItems, batchType, isBatch, selectedRowKeys, cancelVisible, recordVisible } = this.state;
    const { billList, billTotal, tableLoading, globalPageSubMenu, form: { getFieldDecorator } } = this.props;
    const pagination = {
      total: billTotal,
      current: pageNum,
      pageSize,
    };
    const rowSelection = !isBatch ? null :
      {
        selectedRowKeys,
        onChange: this.handleRowSelectionChange,
        getCheckboxProps: record => {
          if (batchType === 'recover') {
            return {
              disabled: record.status !== 3
            }
          } else {
            return {
              disabled: record.status !== 1 && record.status !== 0
            }
          }
        }
      }

    return (
      <PageWrapper title='账单明细管理'>
        {
          globalPageSubMenu.BILL_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
            change={this.handleSearchFormChange}
            extraButton={
              globalPageSubMenu.BILL_EXPORT &&
              (<Button style={{ marginLeft: 8 }} onClick={() => this.handleActions('export', null)}>
                导出
              </Button>)}
          />
        }

        <Row type="flex" justify="start" style={{ marginBottom: 20 }} gutter={10}>
          {
            globalPageSubMenu.BILL_CREATE_OR_EDIT ? 
            <Col>
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item>
                      <span onClick={() => this.handleActions('single-create', null)}>单个添加</span>
                    </Menu.Item>
                    {
                      globalPageSubMenu.BILL_BATCH_CREATE && 
                      <Menu.Item>
                        <span onClick={() => this.handleActions('batch-create', null)}>批量添加</span>
                      </Menu.Item>
                    }
                  </Menu>
                }
              >
                <Button type="primary" icon="plus">添加</Button>
              </Dropdown>
            </Col> : null
          }

          {
            globalPageSubMenu.CALL_TEMP_CREATE_BILL && 
            <Col>
              <Button onClick={() => this.handleActions('template-create', null)}>调用模板生成账单</Button>
            </Col>
          }
          {
            globalPageSubMenu.TOGGELE_BILL_STATUS && 
            <Fragment>
              <Col>
                {
                  batchType === 'recover' ?
                  <Button type="primary" loading={tableLoading} onClick={() => this.handleActions('recover', null)}>确定恢复</Button> :
                  <Button disabled={isBatch} onClick={() => this.handleBatch('recover')}>恢复账单</Button>
                }
              </Col>
              <Col>
                {
                  batchType === 'undo' ?
                  <Button type="primary" loading={tableLoading} onClick={() => this.handleActions('undo', null)}>确定撤销</Button> :
                  <Button disabled={isBatch} onClick={() => this.handleBatch('undo')}>撤销账单</Button>
                }
              </Col>
            </Fragment>
          }
          <Col>
            {globalPageSubMenu.BILL_IMPORT && <Button onClick={() => this.handleActions('importResult', null)}>文件导入查询</Button>}
          </Col>
        </Row>

        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={billList}
          loading={tableLoading}
          rowSelection={rowSelection}
          pagination={pagination}
          onChange={this.handleTabelChange}
          scroll={{ x: 2000 }}
        />

        <Modal
          title='撤销账单'
          destroyOnClose
          visible={cancelVisible}
          onOk={this.handleCancelModalOk}
          onCancel={this.handleCancelModalCancel}
        >
          {
            // 其他Form校验会监听这个modal内容，造成错误
            cancelVisible ?
            <Form>
              <FormItem label={'撤销原因'}>
                {getFieldDecorator('cancelDescribtion', {
                  rules: [{ required: true, message: '请输入撤销原因' }]
                })(
                  <TextArea placeholder='请输入撤销原因'/>
                )}
              </FormItem>
            </Form> : null
          }
        </Modal>

        <Modal
          width={600}
          title='记录退款'
          destroyOnClose
          visible={recordVisible}
          onOk={this.handleRecordModalOk}
          onCancel={this.handleRecordModalCancel}
        >
         {
            recordVisible ?
            <Form {...formItemHorizontalLayout}>
              <FormItem label={'退款金额'}>
                {getFieldDecorator('amount', {
                  rules: [{ required: true, message: '请输入撤销原因' }]
                })(
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0.01}
                    precision={2}
                    placeholder="输入退款金额"
                  />
                )}
              </FormItem>
              <FormItem label={'备注'}>
                {getFieldDecorator('remark')(
                  <TextArea placeholder='请输入备注' rows={4}/>
                )}
              </FormItem>
            </Form> : null
         }
        </Modal>
      </PageWrapper>
    )
  }
};


export default Form.create()(BillDetailList)
