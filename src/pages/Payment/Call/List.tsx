import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Button } from 'antd'; 
import { connect } from 'dva';
import router from 'umi/router';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
import { GetGlobalToken } from '@/utils/cache';
import { spliceDownloadUrl } from '@/utils/utils';
import { EXPORT_CALL_BILL_DATA } from '@/utils/url';

interface IProps extends StateType {
  dispatch: Dispatch<AnyAction>;
  tableLoading: boolean;
  globalPageSubMenu: any;
}

interface IState {
  pageNum: number;
  pageSize: number;
  searchFormItems: any[];
  searchFormValues: {
    condition?: string;
    time: any[]
  }
}

@connect(({ menu, loading, paymentCall }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  billCallList: paymentCall.billCallList,
  billCallTotal: paymentCall.billCallTotal,
  tableLoading: loading.effects['paymentCall/getBillCallList'],
}))
class PaymentModeList extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [
      { label: '搜索', type: 'input', decorator: 'condition', placeholder: '商户名/商户号/姓名/账号ID' },
      { label: '催缴时间', type: 'date', decorator: 'time', initialValue: [] },
    ],
    searchFormValues: {
      condition: '',
      time: [],
    }
  }

  private ref: any
  
  private columns = [
    { title: '商户号', dataIndex: 'merchantId', key: 'merchantId' },
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName' },
    { title: '催缴时间', dataIndex: 'callTime', key: 'callTime' },
    { title: '催缴人', dataIndex: 'userName', key: 'userName' },
    { title: '催缴条数', dataIndex: 'callCount', key: 'callCount' },
    { title: '催缴状态', dataIndex: 'statusDesc', key: 'statusDesc' },
    { title: '操作',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        return (
          <div className='table-actions'>
            {globalPageSubMenu.CHECK_PAYMENT_CALL_DETAIL && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
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
    const { pageNum, pageSize, searchFormValues: { condition, time } } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (condition) {
      params['condition'] = condition
    }
    if (time && time.length) {
      params['callTimeStart'] = time[0].startOf('day').unix() * 1000;
      params['callTimeEnd'] = time[1].endOf('day').unix() * 1000;
    }

    dispatch({
      type: 'paymentCall/getBillCallList',
      payload: params
    })
  }
  
  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        router.push({
          pathname: '/payment/call/create',
        })
        break;
      case 'detail':
        router.push({
          pathname: `/payment/call/detail/${info.callId}`,
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
    const { searchFormValues: { condition, time } } = this.state;
    const url = EXPORT_CALL_BILL_DATA;

    const params = {
      token: GetGlobalToken(),
    };

    if (condition) {
      params['condition'] = condition
    }
    if (time && time.length) {
      params['callTimeStart'] = time[0].startOf('day').unix() * 1000;
      params['callTimeEnd'] = time[1].endOf('day').unix() * 1000;
    }

    const exportUrl = spliceDownloadUrl(url, params);
    window.open(exportUrl);
  }

  handleDeleteItem = async({ id }) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'paymentCall/deletePaymentMode',
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
    const { billCallList, billCallTotal, tableLoading, globalPageSubMenu } = this.props;
    const pagination = {
      total: billCallTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='催缴管理'>
        {
          globalPageSubMenu.PAYMENT_CALL_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
            extraButton={
              globalPageSubMenu.PAYMENT_CALL_EXPORT &&
              (<Button style={{ marginLeft: 8 }} onClick={() => this.handleActions('export', null)}>
                导出
              </Button>)}
          />
        }

        { 
          globalPageSubMenu.PAYMENT_CALL_CREATE &&
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
          rowKey={'callId'}
          columns={this.columns}
          dataSource={billCallList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
        />
      </PageWrapper>
    )
  }
};


export default PaymentModeList
