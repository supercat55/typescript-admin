import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Button, Badge, Popconfirm } from 'antd'; 
import { connect } from 'dva';
import router from 'umi/router';
import { stringify } from 'qs';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { DEFAULT_ALL_TYPE, PAYMENT_MODE_TYPES, COMMON_STATUS_TYPES } from '@/utils/const';
import { GetUserBaseInfo } from '@/utils/cache';
import { StateType } from './model';

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
    mode: number;
    isValid: number;
    feeTypeId: string | number;
    condition?: string;
  }
}

@connect(({ menu, loading, paymentMode, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  modeList: paymentMode.modeList,
  modeTotal: paymentMode.modeTotal,
  allFeeTypeList: global.allFeeTypeList,
  tableLoading: loading.effects['paymentMode/getPaymentModeList'],
}))
class PaymentModeList extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [],
    searchFormValues: {
      mode: -1,
      isValid: -1,
      feeTypeId: '',
      condition: ''
    }
  }

  private ref: any
  
  private columns = [
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName' },
    { title: '支付模式', dataIndex: 'modeDesc', key: 'modeDesc' },
    { title: '首次最低支付金额', dataIndex: 'minFee', key: 'minFee',
      render: text => (
        <span>{text ? (text / 100).toFixed(2) : ''}</span>
      ) 
    },
    { title: '最大拆分笔数', dataIndex: 'maxTimes', key: 'maxTimes' },
    { title: '状态',dataIndex: 'statusDesc', key: 'statusDesc',
      render: (text, record) => <Badge status={record.statusBrdge} text={text}/>
    },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
    { title: '操作',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;
        const { isValid } = record;

        return (
          <div className='table-actions'>
            {globalPageSubMenu.PAYMENT_MODE_CREATE_OR_EDIT && <span onClick={() => this.handleActions('edit', record)}>编辑</span>}
            {globalPageSubMenu.CHECK_PAYMENT_MODE_DETAIL && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
            {
              globalPageSubMenu.DELETE_PAYMENT_MODE &&
              <Popconfirm
                title='是否确认删除此支付模式？'
                okText='确定'
                cancelText='取消'
                onConfirm={() => this.handleActions('delete', record)}
              >
                <span>删除</span>
              </Popconfirm>
            }
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
    const { loginType } = GetUserBaseInfo();
    const { allFeeTypeList } = this.props;

    let searchFormItems = [
      { label: '支付模式', type: 'select', decorator: 'mode', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(PAYMENT_MODE_TYPES) },
      { label: '状态', type: 'select', decorator: 'isValid', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(COMMON_STATUS_TYPES) },
      { 
        label: '费用类型', 
        type: 'select', 
        decorator: 'feeTypeId', 
        initialValue: -1, 
        fieldNames: { label: 'feeName', value: 'id' },
        source: [{ feeName: '全部', id: -1 }].concat(allFeeTypeList) 
      },
    ]

    if (loginType === 'operation') {
      searchFormItems.unshift( { label: '搜索', type: 'input', decorator: 'condition', placeholder: '商户名/商户号/姓名/账号ID' } as any)
    }

    this.setState({ searchFormItems })
  }

  handleSearchList = () => {
    const { dispatch } = this.props;
    const { pageNum, pageSize, searchFormValues: { mode, isValid, feeTypeId, condition } } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (mode !== -1) {
      params['mode'] = mode
    }
    if (isValid !== -1) {
      params['isValid'] = isValid
    }
    if (feeTypeId !== -1 ) {
      params['feeTypeId'] = feeTypeId
    }
    if (condition) {
      params['condition'] = condition
    }

    dispatch({
      type: 'paymentMode/getPaymentModeList',
      payload: params
    })
  }
  
  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        router.push({
          pathname: '/payment/mode/create',
          search: stringify({ mode })
        })
        break;
      case 'detail':
      case 'edit':
        router.push({
          pathname: `/payment/mode/actions/${info.id}`,
          search: stringify({ mode })
        })
        break;
      case 'delete':
        this.handleDeleteItem(info);
      default:
        break;
    }
  }

  handleDeleteItem = async({ id }) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'paymentMode/deletePaymentMode',
      payload: {
        id,
        isValid: 0
      }
    })

    if (result) {
      this.handleSearchList();
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

  render() {
    const { pageNum, pageSize, searchFormItems } = this.state;
    const { modeList, modeTotal, tableLoading, globalPageSubMenu } = this.props;
    const pagination = {
      total: modeTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='支付模式管理'>
        {
          globalPageSubMenu.PAYMENT_MODE_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
          />
        }

        { 
          globalPageSubMenu.PAYMENT_MODE_CREATE_OR_EDIT &&
          <Button 
            type='primary'
            icon='plus'
            style={{ marginBottom: '30px' }} 
            onClick={() => this.handleActions('create', null)}
          >
            添加
          </Button>
        }

        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={modeList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
        />
      </PageWrapper>
    )
  }
};


export default PaymentModeList
