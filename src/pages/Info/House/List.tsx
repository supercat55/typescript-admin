import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Button, Popconfirm, Dropdown, Menu, Alert, message } from 'antd'; 
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
import { QRCODE_LINK } from '@/utils/config';
import { spliceDownloadUrl } from '@/utils/utils';
import { DEFAULT_ALL_TYPE, HOUSE_TYPES } from '@/utils/const';
import { DOWNLOAD_QRCODE, EXPORT_HOUSE_DATA } from '@/utils/url';

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
    communityName: string;
    houseType: number;
    buildingNo: string;
    unitNo: string;
    accountNo: string;
    queryName: string;
    houseNo: string;
  },
  selectedRowKeys: any[]
}

@connect(({ menu, house, loading, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  allOrganizationList: global.allOrganizationList,
  houseList: house.houseList,
  houseTotal: house.houseTotal,
  tableLoading: loading.effects['house/getHouseList'],
}))
class HouseListPage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [],
    searchFormValues: {
      merchantName: '',
      communityName: '',
      houseType: -1,
      buildingNo: '',
      unitNo: '',
      accountNo: '',
      queryName: '',
      houseNo: '',
    },
    selectedRowKeys: []
  }

  private ref: any

  private columns = [
    { title: '小区名称', dataIndex: 'communityName', key: 'communityName' },
    { title: '楼/单元/户号', dataIndex: 'houseInfos', key: 'houseInfos' },
    { title: '房屋唯一编号', dataIndex: 'houseNo', key: 'houseNo' },
    { title: '业主名称', dataIndex: 'ownerName', key: 'ownerName' },
    { title: '联系方式', dataIndex: 'ownerPhone', key: 'ownerPhone' },
    { title: '房屋类型', dataIndex: 'typeDesc', key: 'typeDesc' },
    { title: '创建人', dataIndex: 'userName', key: 'userName' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
    {
      title: '操作', width: 200, fixed: 'right',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        return (
          <div className='table-actions'>
            {globalPageSubMenu.HOUSE_CREATE_OR_EDIT && <span onClick={() => this.handleActions('edit', record)}>编辑</span>}
            {globalPageSubMenu.CHECK_HOUSE_DETAIL && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
            {
              globalPageSubMenu.TOGGELE_HOUSE_STATUS && 
              <Popconfirm
                title='你确定删除此房屋吗？'
                okText="确定"
                cancelText="取消"
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
    this.renderFormItems();
    this.handleSearchList();
  }

  renderFormItems = () => {
    const { loginType } = GetUserBaseInfo();

    let searchFormItems = [
      { 
        label: '小区名称', 
        type: 'autoComplete',
        decorator: 'communityName', 
        placeholder: '请输入搜索的小区名称', 
        dataSource: [], 
      },
      { label: '房屋类型', type: 'select', decorator: 'houseType', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(HOUSE_TYPES) },
      { label: '楼', type: 'input', decorator: 'buildingNo', placeholder: '请输入搜索的楼' },
      { label: '单元', type: 'input', decorator: 'unitNo', placeholder: '请输入搜索的单元' },
      { label: '户号', type: 'input', decorator: 'accountNo', placeholder: '请输入搜索的户号' },
      { label: '业主信息', type: 'input', decorator: 'queryName', placeholder: '请输入业主姓名/手机号' },
      { label: '房屋唯一编号', type: 'input', decorator: 'houseNo', placeholder: '请输入房屋唯一编号' },
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
    const { pageNum, pageSize, searchFormValues: { merchantName, communityName, houseType, buildingNo, unitNo, accountNo, queryName, houseNo } } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (communityName) {
      params['communityName'] = communityName
    }
    if (houseType !== -1) {
      params['houseType'] = houseType
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
    if (queryName) {
      params['queryName'] = queryName
    } 
    if (houseNo) {
      params['houseNo'] = houseNo
    }

    dispatch({
      type: 'house/getHouseList',
      payload: params
    })
  }

  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        router.push({
          pathname: '/info/house/create',
          search: stringify({ mode })
        })
        break;
      case 'batch-create':
        router.push({
          pathname: '/info/house/batch-create',
        })
        break;
      case 'detail':
      case 'edit':
        router.push({
          pathname: `/info/house/actions/${info.id}`,
          search: stringify({ mode })
        })
        break;
      case 'delete':
        this.handleDeleteItem(info);
        break;
      case 'export':
        this.handleExport();
        break;
      case 'houseQrcode':
        this.handleDownloadHouseQrCode();
        break;
      case 'importResult':
        router.push({
          pathname: '/import-result',
          search: stringify({ fileType: 1 })
        })
        break;
      default:
        break;
    }
  }

  handleDeleteItem = async({ id }) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'house/deleteHouse',
      payload: { houseId: id }
    });

    if (result) {
      this.handleSearchList()
    }
  }

  // 批量下载房屋二维码
  handleDownloadHouseQrCode = () => {
    const { selectedRowKeys } = this.state;
    const { receiptCode } = GetUserBaseInfo();

    if (!selectedRowKeys.length) {
      message.info('请勾选需要下载二维码的房屋');
      return
    }

    if (!receiptCode) {
      message.info('此商户未选择收款码对应场景编号，请联系运营！');
      return;
    }

    const url = DOWNLOAD_QRCODE;
    const params = {
      ids: selectedRowKeys.join(','),
      codeUrl: QRCODE_LINK,
      token: GetGlobalToken(),
      qrType: 2
    };

    const downloadUrl = spliceDownloadUrl(url, params);
    window.open(downloadUrl);
  }

  // 导出
  handleExport = () => {
    const { searchFormValues: { merchantName, communityName, houseType, buildingNo, unitNo, accountNo, queryName, houseNo } } = this.state;
    const url = EXPORT_HOUSE_DATA;

    const params = {
      token: GetGlobalToken(),
    };

    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (communityName) {
      params['communityName'] = communityName
    }
    if (houseType !== -1) {
      params['houseType'] = houseType
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
    if (queryName) {
      params['queryName'] = queryName
    } 
    if (houseNo) {
      params['houseNo'] = houseNo
    }

    const exportUrl = spliceDownloadUrl(url, params);
    window.open(exportUrl);
  }

  handleFilterSearch = values => {
    this.setState({
      searchFormValues: values,
      pageNum: 1
    }, this.handleSearchList)
  }

  handleRowSelectionChange = (selectedRowKeys, selectedRows) => {
    this.setState({ 
      selectedRowKeys,
    })
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
    const { houseList, houseTotal, tableLoading, globalPageSubMenu } = this.props;
    const pagination = {
      total: houseTotal,
      current: pageNum,
      pageSize,
    };

    const rowSelection = globalPageSubMenu.DOWNLOAD_HOUSE_QRCODE ?
    {
      selectedRowKeys,
      onChange: this.handleRowSelectionChange,
    } : null

    return (
      <PageWrapper title='房屋管理'>
        {
          globalPageSubMenu.HOUSE_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            change={this.handleSearchFormChange}
            ref={node => (this.ref = node)}
            extraButton={
              globalPageSubMenu.HOUSE_EXPORT &&
              (<Button style={{ marginLeft: 8 }} onClick={() => this.handleActions('export', null)}>
                导出
              </Button>)}
          />
        }
        <div className='table-operation-btns'>
          {
            globalPageSubMenu.HOUSE_CREATE_OR_EDIT ?
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item>
                    <span onClick={() => this.handleActions('create', null)}>单个添加</span>
                  </Menu.Item>
                  <Menu.Item>
                    <span onClick={() => this.handleActions('batch-create', null)}>批量添加</span>
                  </Menu.Item>
                </Menu>
              }
            >
              <Button type="primary" icon="plus">添加</Button>
            </Dropdown> : null
          }
          { 
            globalPageSubMenu.DOWNLOAD_HOUSE_QRCODE &&
            <Button onClick={() => this.handleActions('houseQrcode', null)}>
              下载房屋二维码
            </Button>
          }
          {
            globalPageSubMenu.HOUSE_CREATE_OR_EDIT &&
            <Button onClick={() => this.handleActions('importResult', null)}>
              文件导入查询
            </Button>
          }
        </div>
        {
          globalPageSubMenu.DOWNLOAD_HOUSE_QRCODE &&
          <Alert 
            type="info"
            message={(
              <div>
                <span>已选择{selectedRowKeys.length}个房屋</span>
                <a style={{ marginLeft: '24px' }} onClick={() => this.setState({ selectedRowKeys: [] })}>清空</a>
              </div>
            )}
          />
        }
        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={houseList}
          loading={tableLoading}
          pagination={pagination}
          rowSelection={rowSelection}
          onChange={this.handleTabelChange}
          scroll={{ x: 1500 }}
        />
      </PageWrapper>
    )
  }
};

export default HouseListPage

