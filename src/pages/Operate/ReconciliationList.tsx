import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { Badge, message } from 'antd';
import router from 'umi/router';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';

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
    time: any[];
  },
}

@connect(({ menu, loading, operate, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  reconciliationList: operate.reconciliationList,
  reconciliationTotal: operate.reconciliationTotal,
  tableLoading: loading.models['operate'],
  allOrganizationList: global.allOrganizationList,
}))
class CommunityCollectionList extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [
      { label: '交易日期', type: 'date', decorator: 'time', initialValue: [] },
    ],
    searchFormValues: {
      time: [],
    },
  }

  private ref: any
  
  private columns = [
    { title: '交易日期', dataIndex: 'date', key: 'date'},
    { title: '对账笔数', dataIndex: 'levelingNumber', key: 'levelingNumber' },
    { title: '对平金额', dataIndex: 'levelingAmount', key: 'levelingAmount' },
    { title: '未对平笔数', dataIndex: 'notLevelingNumber', key: 'notLevelingNumber' },
    { title: '未对平金额', dataIndex: 'notLevelingAmount', key: 'notLevelingAmount' },
    { title: '状态',dataIndex: 'stateDesc', key: 'stateDesc',
      render: (text, record) => <Badge status={record.stateBrdge} text={text}/>
    },
    { title: '操作',
      render: (text, record) => {
        const { globalPageSubMenu } = this.props;

        if (record.state === 0) {
          return (
            <div className={'table-actions'}>
              {
                globalPageSubMenu.CHECK_OPERATE_RECONCILIATION_DETAIL && 
                <span onClick={() => this.handleActions('detail', record)}>查看</span>
              }
              {
                globalPageSubMenu.RENEW_OPERATE_RECONCILIATION && 
                <span onClick={() => this.handleActions('renew', record)}>重新对账</span>
              }
            </div>
          )
        } else {
          if (record.notLevelingNumber !== 0) {
            return (
              <div className={'table-actions'}>
                {
                  globalPageSubMenu.RENEW_OPERATE_RECONCILIATION && 
                  <span onClick={() => this.handleActions('renew', record)}>重新对账</span>
                }
              </div>
            )
          }
        }
      }
    }
  ]

  componentDidMount() {
    this.handleSearchList();
  }

  handleSearchList = () => {
    const { dispatch } = this.props;
    const { pageNum, pageSize, searchFormValues: { time} } = this.state;

    const params = {
      pageNum,
      pageSize,
    };

    if (time && time.length) {
      params['startTime'] = time[0].startOf('day').unix() * 1000
      params['endTime'] = time[1].endOf('day').unix() * 1000
    }

    dispatch({
      type: 'operate/getOperateReconciliationList',
      payload: params
    })
  }
  
  handleActions = (mode, info) => {
    switch (mode) {
      case 'detail':
        router.push(`/operate/reconciliation/detail/${info.transactionDate}`)   
        break;
      case 'renew':
        this.handleRenewItem(info);
        break;
      default:
        break;
    }
  }

  handleRenewItem = async(info) => {
    const { dispatch } = this.props;
     
    let result = await dispatch({
      type: 'operate/againReconciliation',
      payload: { 
        id: info.id,
        transactionDate: info.transactionDate  
      }
    })

    if (result) {
      message.success('对账成功');

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

  render() {
    const { pageNum, pageSize, searchFormItems } = this.state;
    const { reconciliationList, reconciliationTotal, tableLoading, globalPageSubMenu } = this.props;

    const pagination = {
      total: reconciliationTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='对账情况'>
        {
          globalPageSubMenu.OPERATE_RECONCILIATION_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
          />
        }
        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={reconciliationList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
        />

      </PageWrapper>
    )
  }
};


export default CommunityCollectionList
