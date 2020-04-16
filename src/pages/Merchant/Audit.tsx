import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import router from 'umi/router';
import { stringify } from 'qs';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
import { DEFAULT_ALL_TYPE, MERCHAN_AUDIT_STATUS, MERCHANT_BUSINESS_TYPES } from '@/utils/const';

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
    businessBusinessType: number;
    auditStatus: number;
    merchantNum: string;
    time: any[];
  },
}

@connect(({ menu, merchant, loading, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  merchantAuditList: merchant.merchantAuditList,
  merchantAuditTotal: merchant.merchantAuditTotal,
  tableLoading: loading.effects['merchant/getMerchantAuditList'],
}))
class MerchantAuditPage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [
      { label: '商户业务类型', type: 'select', decorator: 'businessBusinessType', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(MERCHANT_BUSINESS_TYPES) },
      { label: '审核状态', type: 'select', decorator: 'auditStatus', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(MERCHAN_AUDIT_STATUS) },
      { label: '商户号', type: 'input', decorator: 'merchantNum', placeholder: '请输入商户号' },
      { label: '审核时间', type: 'date', decorator: 'time', initialValue: [] },
    ],
    searchFormValues: {
      businessBusinessType: -1,
      auditStatus: -1,
      merchantNum: '',
      time: []
    },
  }

  private ref: any

  private columns = [
    { title: '商户号', dataIndex: 'merchantNum', key: 'merchantNum' },
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName' },
    { title: '所属组织', dataIndex: 'expandingOrganization', key: 'expandingOrganization' },
    { title: '商户类型', dataIndex: 'typeDesc', key: 'typeDesc' },
    { title: '商户业务类型', dataIndex: 'businessType', key: 'businessType' },
    { title: '集团商户号', dataIndex: 'superiorMerchantNum', key: 'superiorMerchantNum' },
    { title: '所在省市', dataIndex: 'address', key: 'address' },
    { title: '拓展人手机号', dataIndex: 'expandingWalletPhone', key: 'expandingWalletPhone' },
    { title: '审核状态',dataIndex: 'auditStatusDesc', key: 'auditStatusDesc' },
    { title: '创建人', dataIndex: 'userName', key: 'userName' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
    { title: '审核人', dataIndex: 'auditName', key: 'auditName' },
    { title: '审核时间', dataIndex: 'auditTime', key: 'auditTime' },
    {
      title: '操作', fixed: 'right' as 'right', width: 80,
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        if (Number(record.auditStatus) === 0) {
          return (
            <div className='table-actions'>
              {globalPageSubMenu.AUDIT_MERCHANT_AUDIT && <span onClick={() => this.handleActions('audit', record)}>审核</span>}
            </div>
          )
        } else {
          return (
            <div className='table-actions'>
              {globalPageSubMenu.CHECK_MERCHANT_AUDIT_DETAIL && <span onClick={() => this.handleActions('auditDetail', record)}>查看</span>}
            </div>
          )
        }
      }
    }
  ]

  componentDidMount() {
    this.handleSearchList();
  }

  handleSearchList = () => {
    const { dispatch } = this.props;
    const { pageNum, pageSize, searchFormValues: { businessBusinessType, auditStatus, merchantNum, time } } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (businessBusinessType !== -1) {
      params['businessBusinessType'] = businessBusinessType
    }
    if (auditStatus !== -1) {
      params['auditStatus'] = auditStatus
    }
    if (merchantNum) {
      params['merchantNum'] = merchantNum
    }
    if (time && time.length) {
      params['auditCreateTime'] = time[0].startOf('day').unix() * 1000;
      params['auditEndTime'] = time[1].endOf('day').unix() * 1000;
    }

    dispatch({
      type: 'merchant/getMerchantAuditList',
      payload: params
    })
  }

  handleActions = (mode, info) => {
    switch (mode) {
      case 'audit':
      case 'auditDetail':
        router.push({
          pathname: `/merchant/manage/actions/${info.id}`,
          search: stringify({ mode })
        })
        break;
      default:
        break;
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
    const { merchantAuditList, merchantAuditTotal, tableLoading, globalPageSubMenu  } = this.props;
    const pagination = {
      total: merchantAuditTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='商户信息审核'>
        {
          globalPageSubMenu.MERCHANT_AUDIT_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
          />
        }
        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={merchantAuditList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
          scroll={{ x: 1500 }}
        />
      </PageWrapper>
    )
  }
};

export default MerchantAuditPage

