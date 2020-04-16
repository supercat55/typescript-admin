import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Form, Button, Badge, Popconfirm } from 'antd'; 
import { connect } from 'dva';
import router from 'umi/router';
import { stringify } from 'qs';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
import { DEFAULT_ALL_TYPE, COMMON_STATUS_TYPES, MERCHANT_BUSINESS_TYPES, MERCHANT_TYPES } from '@/utils/const';
import { GetGlobalToken } from '@/utils/cache';
import { spliceDownloadUrl } from '@/utils/utils';
import { MERCHANT_INFORMATION_EXPORT } from '@/utils/url';

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
    businessBusinessType: number;
    businessState: number;
    condition: string;
    orgId: string | number;
    merchantType: number;
  },
}

@connect(({ menu, merchant, loading, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  allOrganizationList: global.allOrganizationList,
  merchantInformationList: merchant.merchantInformationList,
  merchantInformationTotal: merchant.merchantInformationTotal,
  tableLoading: loading.effects['merchant/getMerchantInformationList'],
}))
class MerchantInformationPage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [],
    searchFormValues: {
      businessBusinessType: -1,
      businessState: -1,
      condition: '',
      orgId: -1,
      merchantType: -1,
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
    { title: '商户状态',dataIndex: 'statusDesc', key: 'statusDesc',
      render: (text, record) => <Badge status={record.statusBrdge} text={text}/>
    },
    {
      title: '操作', fixed: 'right' as 'right', width: 180,
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        const comp = () => (
          <Fragment>
            {globalPageSubMenu.MERCHANT_CREATE_OR_EDIT && <span onClick={() => this.handleActions('edit', record)}>编辑</span>}
            {/* {globalPageSubMenu.UPDATE_MERCHANT && <span onClick={() => this.handleActions('update', record)}>更新</span>} */}
            {globalPageSubMenu.MERCHANT_CREATE_OR_EDIT && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
          </Fragment>
        )

        switch (Number(record.auditStatus)) {
          case 0:
            return (
              <div className='table-actions'>
                {globalPageSubMenu.MERCHANT_CREATE_OR_EDIT && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
              </div>
            )
          // case 1:
          //   return (
          //     <div className='table-actions'>
          //       {comp()}
          //     </div>
          //   )
          default:
            const flag = Number(record.businessState) === 1; // true为启用状态

            return (
              <div className='table-actions'>
                {comp()}
                {
                  globalPageSubMenu.TOOGLE_MERCHANT_STATUS &&
                  <Popconfirm
                    title={flag ? '是否确认停用此商户？' : '是否确认启用此商户？'}
                    okText="确定"
                    cancelText="取消"
                    onConfirm={() => this.handleActions('toggle', record)}
                  >
                    <span>
                      {flag ? '停用' : '启用'}
                    </span>
                  </Popconfirm>
                }
              </div>
            )
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
      type: 'global/getAllOrganizationList'
    })

    this.renderFormItems();
  }

  renderFormItems = () => {
    const { allOrganizationList } = this.props;

    let searchFormItems = [
      { label: '商户业务类型', type: 'select', decorator:'businessBusinessType', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(MERCHANT_BUSINESS_TYPES) },
      { label: '商户状态', type: 'select', decorator:'businessState', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(COMMON_STATUS_TYPES) },
      { label: '搜索', type: 'input', decorator:'condition', placeholder: '请输入商户号/商户名称/手机号/集团商户号' },
      { 
        label: '所属组织', 
        type: 'select', 
        decorator:'orgId', 
        initialValue: -1, 
        fieldNames: { label: 'name', value: 'id' },
        source: [{ name: '全部', id: -1 }].concat(allOrganizationList) 
      },
      { label: '商户类型', type: 'select', decorator:'merchantType', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(MERCHANT_TYPES) },
    ]

    this.setState({ searchFormItems })
  }

  handleSearchList = () => {
    const { dispatch } = this.props;
    const { pageNum, pageSize, searchFormValues: { businessBusinessType, businessState, condition, orgId, merchantType } } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (businessBusinessType !== -1) {
      params['businessBusinessType'] = businessBusinessType
    }
    if (businessState !== -1) {
      params['businessState'] = businessState
    }
    if (condition) {
      params['condition'] = condition
    }
    if (orgId !== -1) {
      params['orgId'] = orgId
    }
    if (merchantType !== -1) {
      params['merchantType'] = merchantType
    }

    dispatch({
      type: 'merchant/getMerchantInformationList',
      payload: params
    })
  }

  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        router.push({
          pathname: `/merchant/manage/actions`,
          search: stringify({ mode })
        })
        break;
      case 'detail':
      case 'edit':
        router.push({
          pathname: `/merchant/manage/actions/${info.id}`,
          search: stringify({ mode })
        })
        break;
      case 'update':
        this.handleUpdateItem(info);
        break;
      case 'toggle':
        this.handleToggleItemStatus(info);
        break;
      case 'export':
        this.handleExport();
        break;
      default:
        break;
    }
  }

  handleExport = () => {
    const { searchFormValues: { businessBusinessType, businessState, condition, orgId, merchantType } } = this.state;
    const url = MERCHANT_INFORMATION_EXPORT;

    const params = {
      token: GetGlobalToken(),
    };

    if (businessBusinessType !== -1) {
      params['businessBusinessType'] = businessBusinessType
    }
    if (businessState !== -1) {
      params['businessState'] = businessState
    }
    if (condition) {
      params['condition'] = condition
    }
    if (orgId !== -1) {
      params['orgId'] = orgId
    }
    if (merchantType !== -1) {
      params['merchantType'] = merchantType
    }

    const exportUrl = spliceDownloadUrl(url, params);
    window.open(exportUrl);
  }

  handleUpdateItem = async({ id, merchantNum }) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'merchant/updateMerchantInformation',
      payload: { id, merchantNum }
    });

    if (result) {
      this.handleSearchList()
    }
  }

  handleToggleItemStatus = async({ id, businessState }) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'merchant/toggleMerchantInformationStatus',
      payload: { 
        id,
        businessState: Number(businessState) === 0 ? 1 : 0
      }
    });

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

  render() {
    const { pageNum, pageSize, searchFormItems } = this.state;
    const { merchantInformationList, merchantInformationTotal, tableLoading, globalPageSubMenu  } = this.props;
    const pagination = {
      total: merchantInformationTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='商户信息管理'>
        {
          globalPageSubMenu.MERCHANT_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
            extraButton={
              globalPageSubMenu.MERCHANT_EXPORT &&
              (<Button style={{ marginLeft: 8 }} onClick={() => this.handleActions('export', null)}>
                导出
              </Button>)}
          />
        }
        { 
          globalPageSubMenu.MERCHANT_CREATE_OR_EDIT &&
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
          dataSource={merchantInformationList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
          scroll={{ x: 1500 }}
        />
      </PageWrapper>
    )
  }
};

export default MerchantInformationPage

