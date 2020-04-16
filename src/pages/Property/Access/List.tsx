import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Button, Popconfirm, notification } from 'antd'; 
import { connect } from 'dva';
import router from 'umi/router';
import { stringify } from 'qs';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
import { GetGlobalToken } from '@/utils/cache';
import { DEFAULT_ALL_TYPE, ACCESS_TYPES } from '@/utils/const';
import { spliceDownloadUrl } from '@/utils/utils';
import { EXPORT_ACCESS_LIST } from '@/utils/url';

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
    communityName: string;
    condition: string;
    accessType: number;
    buildingNo: string;
    unitNo: string;
    accountNo: string;
    time: any[];
  },
}

let timer = null;

@connect(({ menu, access, loading }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  accessList: access.accessList,
  accessTotal: access.accessTotal,
  tableLoading: loading.effects['access/getAccessList'],
}))
class AccessListPage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [
      { 
        label: '小区名称', 
        type: 'autoComplete',
        decorator: 'communityName', 
        placeholder: '请输入搜索的小区名称', 
        dataSource: [], 
      },
      { label: '搜索', type: 'input', decorator: 'condition', placeholder: '请输入业主名称或手机号' },
      { label: '类型', type: 'select', decorator: 'accessType', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(ACCESS_TYPES) },
      { label: '楼', type: 'input', decorator: 'buildingNo', placeholder: '请输入搜索的楼' },
      { label: '单元', type: 'input', decorator: 'unitNo', placeholder: '请输入搜索的单元' },
      { label: '户号', type: 'input', decorator: 'accountNo', placeholder: '请输入搜索的户号' },
      { label: '登记时间', type: 'date', decorator: 'time', initialValue: [], showTime: false },
    ],
    searchFormValues: {
      communityName: '',
      condition: '',
      accessType: -1,
      buildingNo: '',
      unitNo: '',
      accountNo: '',
      time: [],
    },
  }

  private ref: any

  private columns = [
    { title: '姓名', dataIndex: 'ownerName', key: 'ownerName' },
    { title: '手机号', dataIndex: 'ownerPhone', key: 'ownerPhone' },
    { title: '身份', dataIndex: 'isOwnerDesc', key: 'isOwnerDesc' },
    { title: '房屋信息', dataIndex: 'houseInfos', key: 'houseInfos' },
    { title: '登记时间', dataIndex: 'accessTime', key: 'accessTime' },
    { title: '出入类型', dataIndex: 'accessTypeDesc', key: 'accessTypeDesc' },
    {
      title: '操作',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        return (
          <div className='table-actions'>
             <span onClick={() => this.handleActions('detail', record)}>查看</span>
            { globalPageSubMenu.DELETE_ACCESS ? 
              <Popconfirm
                title="你确定删除此出入记录吗？"
                okText="确定"
                cancelText="取消"
                onConfirm={() => this.handleActions('delete', record)}
              >
                <span>删除</span>
              </Popconfirm> : null
            }
          </div>
        )
      }
    }
  ]

  componentDidMount() {
    this.handleSearchList();
    this.handleGetUnReadAccess();
  }

  componentWillUnmount() {
    clearInterval(timer)
  }

  handleGetUnReadAccess = () => {
    const { dispatch } = this.props;

    timer = setInterval(async() => {
      let result: any = await dispatch({
        type: 'global/getUnReadAccessRecord',
      });

      if (result === 1) {
        notification.warning({
          message: '新消息',
          description: '有新的小区出入记录了，请点击查看',
          onClick: () => {
            this.setState({
              pageNum: 1
            }, this.handleSearchList)
          }
        })
      }
    }, 5000)
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
    const { pageNum, pageSize, searchFormValues: { communityName, condition, accessType, buildingNo, unitNo, accountNo, time } } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (communityName) {
      params['communityName'] = communityName
    }
    if (condition) {
      params['condition'] = condition
    }
    if (accessType !== -1) {
      params['accessType'] = accessType
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
    if (time && time.length) {
      params['accessTimeStart'] = time[0].startOf('day').unix() * 1000
      params['accessTimeEnd'] = time[1].endOf('day').unix() * 1000
    }

    dispatch({
      type: 'access/getAccessList',
      payload: params
    })
  }

  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        router.push({
          pathname: '/property/access/actions',
          search: stringify({ mode })
        })
        break;
      case 'detail':
        router.push({
          pathname: `/property/access/actions/${info.id}`,
          search: stringify({ mode })
        })
        break;
      case 'delete':
        this.handleDeleteItem(info);
        break;
      case 'export':
        this.handleExport();
        break;
      default:
        break;
    }
  }

  handleDeleteItem = async({ id }) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'access/deleteAccess',
      payload: { id }
    })

    if (result) {
      this.handleSearchList();
    }
  }

  handleExport = () => {
    const { searchFormValues: { communityName, condition, accessType, buildingNo, unitNo, accountNo } } = this.state;
    const url = EXPORT_ACCESS_LIST;

    const params = {
      token: GetGlobalToken(),
    };

    if (communityName) {
      params['communityName'] = communityName
    }
    if (condition) {
      params['condition'] = condition
    }
    if (accessType !== -1) {
      params['accessType'] = accessType
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
    const { accessList, accessTotal, tableLoading, globalPageSubMenu } = this.props;
    
    const pagination = {
      total: accessTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='出入记录管理'>
        {
          globalPageSubMenu.ACCESS_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            change={this.handleSearchFormChange}
            ref={node => (this.ref = node)}
            extraButton={
              globalPageSubMenu.ACCESS_EXPORT ? 
              <Button style={{ marginLeft: 8 }} onClick={() => this.handleActions('export', null)}>
                导出
              </Button> : null
            }
          />
        }
        {
          globalPageSubMenu.CREATE_ACCESS &&
          <div className='table-operation-btns'>
            <Button 
              type='primary'
              icon='plus'
              onClick={() => this.handleActions('create', null)}
            >
              添加
            </Button>
          </div>
        }
        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={accessList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
        />
      </PageWrapper>
    )
  }
};

export default AccessListPage

