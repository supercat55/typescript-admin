import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Button, Popconfirm, Alert, message } from 'antd'; 
import { connect } from 'dva';
import router from 'umi/router';
import { stringify } from 'qs';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
import { GetUserBaseInfo, GetGlobalToken } from '@/utils/cache';
import { QRCODE_LINK, ACCESS_QRCODE_LINK } from '@/utils/config';
import { spliceDownloadUrl } from '@/utils/utils';
import { DEFAULT_ALL_TYPE, COMMUNITY_TYPES } from '@/utils/const';
import { DOWNLOAD_QRCODE, DOWNLOAD_HOUSE_QRCODE, EXPORT_COMMUNITY_DATA } from '@/utils/url';

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
    merchantName: string;
    communityType: number;
    communityName: string;
  },
  selectedRowKeys: any[]
}

@connect(({ menu, community, loading, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  allOrganizationList: global.allOrganizationList,
  communityList: community.communityList,
  communityTotal: community.communityTotal,
  tableLoading: loading.effects['community/getCommunityList'],
}))
class CommunityListPage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [],
    searchFormValues: {
      merchantName: '',
      communityType: -1,
      communityName: '',
    },
    selectedRowKeys: []
  }

  private ref: any

  private columns = [
    { title: '小区名称', dataIndex: 'communityName', key: 'communityName' },
    { title: '小区类型', dataIndex: 'typeDesc', key: 'typeDesc' },
    { title: '所在城市', dataIndex: 'province', key: 'province' },
    { title: '创建人', dataIndex: 'userName', key: 'userName' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
    {
      title: '操作',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;
        const { loginType } = GetUserBaseInfo();

        return (
          <div className='table-actions'>
            {globalPageSubMenu.COMMUNITY_CREATE_OR_EDIT && <span onClick={() => this.handleActions('edit', record)}>编辑</span>}
            {globalPageSubMenu.CHECK_COMMUNITY_DETAIL && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
            {
              globalPageSubMenu.TOGGELE_COMMUNITY_STATUS && 
              <Popconfirm
                title='你确定删除此小区吗？'
                okText="确定"
                cancelText="取消"
                onConfirm={() => this.handleActions('delete', record)}
              >
                <span>删除</span>
              </Popconfirm>
            }
            {
              loginType === 'merchant' && record.houseCount !== 0 &&
              <span onClick={() => this.handleActions('houseQrcode', record)}>下载房屋二维码</span>
            }
          </div>
        )
      }
    }
  ]

  componentDidMount() {
    this.renderFormItems();
    this.handleSearchList();
  }

  renderFormItems = () => {
    const { loginType } = GetUserBaseInfo();

    let searchFormItems = [
      { label: '小区类型', type: 'select', decorator: 'communityType', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(COMMUNITY_TYPES) },
      { 
        label: '小区名称', 
        type: 'autoComplete',
        decorator: 'communityName', 
        placeholder: '请输入搜索的小区名称', 
        dataSource: [], 
      },
    ]

    if (loginType === 'operation') {
      searchFormItems.unshift( { label: '绑定商户', type: 'input', decorator: 'merchantName', placeholder: '请输入搜索的商户名称' } as any)
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
    const { pageNum, pageSize, searchFormValues: { merchantName, communityType, communityName } } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (communityType !== -1) {
      params['communityType'] = communityType
    }
    if (communityName) {
      params['communityName'] = communityName
    }

    dispatch({
      type: 'community/getCommunityList',
      payload: params
    })
  }

  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        router.push({
          pathname: '/info/community/create',
          search: stringify({ mode })
        })
        break;
      case 'detail':
      case 'edit':
        router.push({
          pathname: `/info/community/actions/${info.id}`,
          search: stringify({ mode })
        })
        break;
      case 'delete':
        this.handleDeleteItem(info);
        break;
      case 'houseQrcode':
        this.handleDownloadAllHouseQrCode(info);
        break;
      case 'communityQrcode':
        this.handleDownloadCommunityQrCode();
        break;
      case 'cashierQrcode':
        this.handleDownloadCashierQrCode();
        break;
      case 'accessQrcode':
        this.handleDownloadAccessQrCode();
        break;
      case 'export':
        this.handleExport();
        break;
      default:
        break;
    }
  }

  // 删除房屋
  handleDeleteItem = async({ id }) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'community/deleteCommunity',
      payload: { communityId: id }
    });

    if (result) {
      this.handleSearchList()
    }
  }

  // 下载小区小所有房屋二维码
  handleDownloadAllHouseQrCode = ({ id }) => {
    const url = DOWNLOAD_HOUSE_QRCODE;
    const params = {
      codeUrl: QRCODE_LINK,
      token: GetGlobalToken(),
      communityId: id
    };

    const downloadUrl = spliceDownloadUrl(url, params);
    window.open(downloadUrl);
  }

  // 批量下载小区二维码
  handleDownloadCommunityQrCode = () => {
    const { selectedRowKeys } = this.state;
    if (!selectedRowKeys.length) {
      message.info('请勾选需要下载二维码的小区');
      return
    }

    const url = DOWNLOAD_QRCODE;
    const params = {
      ids: selectedRowKeys.join(','),
      codeUrl: QRCODE_LINK,
      token: GetGlobalToken(),
      qrType: 1
    };

    const downloadUrl = spliceDownloadUrl(url, params);
    window.open(downloadUrl);
  }

  // 批量下载收款员二维码
  handleDownloadCashierQrCode = async() => {
    const { selectedRowKeys } = this.state;
    const { dispatch } = this.props;

    if (!selectedRowKeys.length) {
      message.info('请勾选需要下载二维码的小区');
      return
    }

    let ids = selectedRowKeys.join(',');
    const url = DOWNLOAD_QRCODE;

    let result: any = await dispatch({
      type: 'community/checkCashierByCommunity',
      payload: { communityIds: ids }
    });

    if (result === 1) {
      const params = {
        ids,
        codeUrl: QRCODE_LINK,
        token: GetGlobalToken(),
        qrType: 3
      };
  
      const downloadUrl = spliceDownloadUrl(url, params);
      window.open(downloadUrl);
    } else {
      message.info('您选择的小区没有收款员');
    }
  }

  handleDownloadAccessQrCode = async() => {
    const { selectedRowKeys } = this.state;
    if (!selectedRowKeys.length) {
      message.info('请勾选需要下载二维码的小区');
      return
    }

    const url = DOWNLOAD_QRCODE;
    const params = {
      ids: selectedRowKeys.join(','),
      codeUrl: ACCESS_QRCODE_LINK,
      token: GetGlobalToken(),
      qrType: 5
    };

    const downloadUrl = spliceDownloadUrl(url, params);
    window.open(downloadUrl);
  }

  // 导出
  handleExport = () => {
    const { searchFormValues: { merchantName, communityType, communityName } } = this.state;
    const url = EXPORT_COMMUNITY_DATA;

    const params = {
      token: GetGlobalToken(),
    };

    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (communityType !== -1) {
      params['communityType'] = communityType
    }
    if (communityName) {
      params['communityName'] = communityName
    }

    const exportUrl = spliceDownloadUrl(url, params);
    window.open(exportUrl);
  }

  handleRowSelectionChange = (selectedRowKeys, selectedRows) => {
    this.setState({ 
      selectedRowKeys,
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
    const { communityList, communityTotal, tableLoading, globalPageSubMenu } = this.props;
    const { loginType } = GetUserBaseInfo();

    const pagination = {
      total: communityTotal,
      current: pageNum,
      pageSize,
    };
    const rowSelection = globalPageSubMenu.DOWNLOAD_COMMUNITY_QRCODE || globalPageSubMenu.DOWNLOAD_COMMUNITY_CASHIER_QRCODE ?
      {
        selectedRowKeys,
        onChange: this.handleRowSelectionChange,
      } : null

    return (
      <PageWrapper title='小区管理'>
        {
          globalPageSubMenu.COMMUNITY_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
            change={this.handleSearchFormChange}
            extraButton={
              globalPageSubMenu.COMMUNITY_EXPORT && loginType === 'operation' &&
              (<Button style={{ marginLeft: 8 }} onClick={() => this.handleActions('export', null)}>
                导出
              </Button>)}
          />
        }
        <div className='table-operation-btns'>
          { 
            globalPageSubMenu.COMMUNITY_CREATE_OR_EDIT &&
            <Button 
              type='primary'
              icon='plus'
              onClick={() => this.handleActions('create', null)}
            >
              添加
            </Button>
          }
          { 
            globalPageSubMenu.DOWNLOAD_COMMUNITY_QRCODE &&
            <Button onClick={() => this.handleActions('communityQrcode', null)}>
              下载小区二维码
            </Button>
          }
          { 
            globalPageSubMenu.DOWNLOAD_COMMUNITY_CASHIER_QRCODE &&
            <Button onClick={() => this.handleActions('cashierQrcode', null)}>
              下载收款员二维码
            </Button>
          }
          {
            globalPageSubMenu.DOWNLOAD_ACCESS_QRCODE && 
            <Button onClick={() => this.handleActions('accessQrcode', null)}>
              下载出入登记码
            </Button>
          }
        </div>
        {
          globalPageSubMenu.DOWNLOAD_COMMUNITY_QRCODE || globalPageSubMenu.DOWNLOAD_COMMUNITY_CASHIER_QRCODE ?
          <Alert 
            type="info"
            message={(
              <div>
                <span>已选择{selectedRowKeys.length}个小区</span>
                <a style={{ marginLeft: '24px' }} onClick={() => this.setState({ selectedRowKeys: [] })}>清空</a>
              </div>
            )}
          /> : null
        }
        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={communityList}
          loading={tableLoading}
          pagination={pagination}
          rowSelection={rowSelection}
          onChange={this.handleTabelChange}
        />
      </PageWrapper>
    )
  }
};

export default CommunityListPage

