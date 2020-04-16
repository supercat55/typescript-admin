import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Button, Popconfirm, Dropdown, Menu } from 'antd'; 
import { connect } from 'dva';
import router from 'umi/router';
import { stringify } from 'qs';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
import { DEFAULT_ALL_TYPE, RESIDENT_RELATION_TYPES } from '@/utils/const';
import { GetUserBaseInfo, GetGlobalToken } from '@/utils/cache';
import { spliceDownloadUrl } from '@/utils/utils';
import { EXPORT_RESIDENT_DATA } from '@/utils/url';

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
    isOwner: number;
    buildingNo: string;
    unitNo: string;
    accountNo: string;
    queryName: string;
  },
}

@connect(({ menu, resident, loading, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  allOrganizationList: global.allOrganizationList,
  residentList: resident.residentList,
  residentTotal: resident.residentTotal,
  tableLoading: loading.effects['resident/getResidentList'],
}))
class ResidentListPage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [],
    searchFormValues: {
      merchantName: '',
      communityName: '',
      isOwner: -1,
      buildingNo: '',
      unitNo: '',
      accountNo: '',
      queryName: '',
    },
  }

  private ref: any

  private columns = [
    { title: '住户名称', dataIndex: 'ownerName', key: 'ownerName' },
    { title: '联系方式', dataIndex: 'ownerPhone', key: 'ownerPhone' },
    { title: '小区名称', dataIndex: 'communityName', key: 'communityName' },
    { title: '楼/单元/户号', dataIndex: 'houseInfos', key: 'houseInfos' },
    { title: '关系标签', dataIndex: 'relationshipDesc', key: 'relationshipDesc' },
    { title: '创建人', dataIndex: 'userName', key: 'userName' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
    {
      title: '操作',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        return (
          <div className='table-actions'>
            {globalPageSubMenu.RESIDENT_CREATE_OR_EDIT && <span onClick={() => this.handleActions('edit', record)}>编辑</span>}
            {globalPageSubMenu.CHECK_RESIDENT_DETAIL && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
            {
              globalPageSubMenu.TOGGELE_RESIDENT_STATUS && 
              <Popconfirm
                title='你确定删除此住户吗？'
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
      { label: '关系标签', type: 'select', decorator: 'isOwner', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(RESIDENT_RELATION_TYPES) },
      { label: '楼', type: 'input', decorator: 'buildingNo', placeholder: '请输入搜索的楼' },
      { label: '单元', type: 'input', decorator: 'unitNo', placeholder: '请输入搜索的单元' },
      { label: '户号', type: 'input', decorator: 'accountNo', placeholder: '请输入搜索的户号' },
      { label: '业主信息', type: 'input', decorator: 'queryName', placeholder: '请输入业主姓名/手机号' },
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
    const { pageNum, pageSize, searchFormValues: { merchantName, communityName, isOwner, buildingNo, unitNo, accountNo, queryName } } = this.state;

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
    if (isOwner !== -1) {
      params['isOwner'] = isOwner
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

    dispatch({
      type: 'resident/getResidentList',
      payload: params
    })
  }

  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        router.push({
          pathname: '/info/resident/create',
          search: stringify({ mode })
        })
        break;
      case 'batch-create':
        router.push({
          pathname: '/info/resident/batch-create',
        })
        break;
      case 'detail':
      case 'edit':
        router.push({
          pathname: `/info/resident/actions/${info.id}`,
          search: stringify({ mode })
        })
        break;
      case 'delete':
        this.handleDeleteItem(info);
        break;
      case 'export':
        this.handleExport();
        break;
      case 'importResult':
        router.push({
          pathname: '/import-result',
          search: stringify({ fileType: 2 })
        })
        break;
      default:
        break;
    }
  }

  handleDeleteItem = async({ id }) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'resident/deleteResident',
      payload: { ownerInfoId: id }
    });

    if (result) {
      this.handleSearchList()
    }
  }

  handleExport = () => {
    const { searchFormValues: { merchantName, communityName, isOwner, buildingNo, unitNo, accountNo, queryName } } = this.state;
    const url = EXPORT_RESIDENT_DATA;

    const params = {
      token: GetGlobalToken(),
    };

    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (communityName) {
      params['communityName'] = communityName
    }
    if (isOwner !== -1) {
      params['isOwner'] = isOwner
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

    const exportUrl = spliceDownloadUrl(url, params);
    window.open(exportUrl);
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
    const { residentList, residentTotal, tableLoading, globalPageSubMenu } = this.props;
    const pagination = {
      total: residentTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='住户管理'>
        {
          globalPageSubMenu.RESIDENT_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            change={this.handleSearchFormChange}
            ref={node => (this.ref = node)}
            extraButton={
              globalPageSubMenu.RESIDENT_EXPORT &&
              (<Button style={{ marginLeft: 8 }} onClick={() => this.handleActions('export', null)}>
                导出
              </Button>)}
          />
        }
        {
          globalPageSubMenu.RESIDENT_CREATE_OR_EDIT &&
          <div className='table-operation-btns'>
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
            </Dropdown>
            <Button onClick={() => this.handleActions('importResult', null)}>
              文件导入查询
            </Button>
          </div>
        }
        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={residentList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
        />
      </PageWrapper>
    )
  }
};

export default ResidentListPage

