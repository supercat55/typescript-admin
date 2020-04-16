import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Button, Badge, Popconfirm, message, Modal } from 'antd'; 
import { FormComponentProps } from 'antd/lib/form';
import { connect } from 'dva';
import router from 'umi/router';
import { stringify } from 'qs';
import { Decimal } from 'decimal.js';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import BillTempModal, { BillTemplateModalProps } from '../component/BillTempModal';
import { DEFAULT_ALL_TYPE, BILL_LOG_STATUS } from '@/utils/const';
import { StateType } from './model';

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  tableLoading: boolean;
  allFeeTypeList: any[];
}

interface IState {
  id: string;
  pageNum: number;
  pageSize: number;
  searchFormItems: any[];
  searchFormValues: {
    merchantName: string;
    billAutoNum: string;
    billModelName: string;
    status: number;
  },
  intervalVisible: boolean;
  recordVisible: boolean;
  recordPageNum: number;
  currentId: string;
}

@connect(({ loading, billTemplate, global }) => ({
  billLogList: billTemplate.billLogList,
  billLogTotal: billTemplate.billLogTotal,
  billIntervalDetail: billTemplate.billIntervalDetail,
  billLogRecordList: billTemplate.billLogRecordList,
  billLogRecordTotal: billTemplate.billLogRecordTotal,
  tableLoading: loading.models['billTemplate'],
  allFeeTypeList: global.allFeeTypeList,
}))
class BillLogList extends PureComponent<IProps, IState> {
  state: IState = {
    id: this.props.match.params && this.props.match.params.id,
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [
      { label: '商户名称', type: 'input', decorator: 'merchantName', placeholder: '请输入商户名称' },
      { label: '规则编号', type: 'input', decorator: 'billAutoNum', placeholder: '请输入规则编号' },
      { label: '计费模版名称', type: 'input', decorator: 'billModelName', placeholder: '请输入计费模版名称' },
      { label: '状态', type: 'select', decorator: 'status', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(BILL_LOG_STATUS) },
    ],
    searchFormValues: {
      merchantName: '',
      billAutoNum: '',
      billModelName: '',
      status: -1,
    },
    intervalVisible: false,
    recordVisible: false,
    recordPageNum: 1,
    currentId: '',
  }

  private ref: any
  
  private columns = [
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName' },
    { title: '规则编号', dataIndex: 'billAutoNum', key: 'billAutoNum' },
    { title: '计费模版名称', dataIndex: 'billModelName', key: 'billModelName' },
    { title: '是否持续生成账单', dataIndex: 'isAuto', key: 'isAuto' },
    { title: '账单生成区间', dataIndex: 'billInterval', key: 'billInterval' },
    { title: '生成周期', dataIndex: 'periodDesc', key: 'periodDesc' },
    { title: '账单推送日', dataIndex: 'pushTime', key: 'pushTime' },
    { title: '账单逾期日', dataIndex: 'overdueTime', key: 'overdueTime' },
    { title: '滞纳金生成日', dataIndex: 'lateFeeTime', key: 'lateFeeTime' },
    { title: '滞纳金比例', dataIndex: 'feeRate', key: 'feeRate',
      render: text => (
        <span>{text ? '万分之' + text : '无'}</span>
      )
    },
    { title: '状态',dataIndex: 'statusDesc', key: 'statusDesc',
      render: (text, record) => <Badge status={record.statusBrdge} text={text}/>
    },
    { title: '账单范围', key: 'action', width: 100, fixed: 'right',
      render: (text, record) => (
        <div className="table-actions">
          <span onClick={() => this.handleActions('intervalDetail', record)}>查看</span>
        </div>
      )
    },
    {
      title: '操作', width: 200, fixed: 'right',
      render: (_, record) => {
        if (record.status === 1) {
          return (
            <div className="table-actions">
              <span onClick={() => this.handleActions('generateRecord', record)}>生成记录</span>
              <span onClick={() => this.handleActions('again', record)}>再次调用</span>
            </div>
          )
        } else if (record.status === 2) {
          return (
            <div className="table-actions">
              <span onClick={() => this.handleActions('intervalDetail', record)}>生成记录</span>
              <Popconfirm
                title="是否停用此计费模版？"
                okText="确定"
                cancelText="取消"
                onConfirm={() => this.handleActions('stop', record)}
              >
                <span>停止调用</span>
              </Popconfirm>
            </div>
          )
        }
      }
    }
  ]

  intervalColumns = [
    { title: '缴费地址', dataIndex: 'address', key: 'address' },
    { title: '房屋唯一编号', dataIndex: 'houseNo', key: 'houseNo' },
    { title: '生效时间', dataIndex: 'startTime', key: 'startTime' },
    { title: '失效时间', dataIndex: 'endTime', key: 'endTime' },
  ]

  recordColumns = [
    { title: '账单编号', dataIndex: 'billNum', key: 'billNum' },
    { title: '账单名称', dataIndex: 'billName', key: 'billName' },
    { title: '缴费地址', dataIndex: 'address', key: 'address' },
    { title: '账单金额', dataIndex: 'billAmount', key: 'billAmount' },
    { title: '实收金额', dataIndex: 'paidAmount', key: 'paidAmount' },
  ]

  componentDidMount() {
    this.handleSearchList();
  }
  
  handleSearchList = () => {
    const { dispatch } = this.props;
    const { id, pageNum, pageSize, searchFormValues: { merchantName, billAutoNum, billModelName, status } } = this.state;

    const params = {
      billModelId: id,
      pageNum,
      pageSize
    };

    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (billAutoNum) {
      params['billAutoNum'] = billAutoNum
    }
    if (billModelName) {
      params['billModelName'] = billModelName
    }
    if (status !== -1) {
      params['status'] = status
    }

    dispatch({
      type: 'billTemplate/getBillLogList',
      payload: params
    })
  }

  // 查询账单范围列表
  handleSearchRecordList = async() => {
    const { dispatch } = this.props;
    const { currentId, recordPageNum, pageSize } = this.state;

    await dispatch({
      type: 'billTemplate/getBillLogRecordList',
      payload: { 
        autoId: currentId, 
        pageNum: recordPageNum,
        pageSize
      }
    })
  }
  
  handleActions = (mode, info) => {
    switch (mode) {
      case 'intervalDetail':
        this.handleCheckBillItemInterval(info);
        break;
      case 'generateRecord':
        this.handleGetItemGenerateRecord(info);
        break;
      case 'again':
        router.push(`/bill/detail/temp-edit/${info.id}`);
        break;
      case 'stop':
        this.handleStopItem(info);
        break;
      default:
        break;
    }
  }

  // 查看item账单范围点击事件
  handleCheckBillItemInterval = async({ id }) => {
    const { dispatch } = this.props;

    await dispatch({
      type: 'billTemplate/getBillIntervalDetail',
      payload: { id }
    })

    this.setState({
      intervalVisible: true
    })
  }

  // 生成记录item点击事件
  handleGetItemGenerateRecord = async({ id }) => {
    this.setState({
      currentId: id,
      recordVisible: true
    }, this.handleSearchRecordList)
  }

  // 停止调用item
  handleStopItem = async({ id }) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'billTemplate/stopBillTemp',
      payload: { 
        id,
        status: 1
      }
    })

    if (result) {
      this.handleSearchList()
    }
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

  handleRecordTabelChange = pagination => {
    this.setState({
      recordPageNum: pagination.current
    }, this.handleSearchRecordList)
  }

  render() {
    const { pageNum, pageSize, searchFormItems, intervalVisible, recordVisible, recordPageNum } = this.state;
    const { billLogList, billLogTotal, tableLoading, billIntervalDetail, billLogRecordList, billLogRecordTotal } = this.props;
    const pagination = {
      total: billLogTotal,
      current: pageNum,
      pageSize,
    };

    const recordPagination = {
      total: billLogRecordTotal,
      current: recordPageNum,
      pageSize,
    }

    return (
      <PageWrapper 
        title={'调用日志'}
        showBack
        customBreadcrumbmap={[
          { name: '账单管理', url: '' },
          { name: '计费账单模版', url: '/bill/template' },
          { name: '调用日志'},
        ]}
      >
        <PageSearchForm 
          fields={searchFormItems} 
          search={this.handleFilterSearch}
          ref={node => (this.ref = node)}
        />

        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={billLogList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
          scroll={{ x: 1500 }}
        />


        <Modal
          title='账单范围'
          width={1000}
          visible={intervalVisible}
          closable={false}
          footer={[
            <Button type="primary" key="back" onClick={() => this.setState({ intervalVisible: false })}>确定</Button>,
          ]}
        >
          <StandardTable
            rowKey={'id'}
            columns={this.intervalColumns}
            dataSource={billIntervalDetail}
            pagination={false}
            bordered
          />
        </Modal>

        <Modal
          title='账单范围'
          width={1000}
          visible={recordVisible}
          closable={false}
          footer={[
            <Button type="primary" key="back" onClick={() => this.setState({ recordVisible: false, currentId: '', recordPageNum: 1 })}>确定</Button>,
          ]}
        >
          <StandardTable
            rowKey={'id'}
            loading={tableLoading}
            columns={this.recordColumns}
            dataSource={billLogRecordList}
            pagination={recordPagination}
            onChange={this.handleRecordTabelChange}
          />
        </Modal>
      </PageWrapper>
    )
  }
};


export default BillLogList
