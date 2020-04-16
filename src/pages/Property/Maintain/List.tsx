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
import { GetUserBaseInfo, GetGlobalToken } from '@/utils/cache';
import { DEFAULT_ALL_TYPE, MAINTAIN_TYPES, MAINTAIN_STATUS } from '@/utils/const';
import { spliceDownloadUrl } from '@/utils/utils';
import { EXPORT_MAINTAIN_LIST } from '@/utils/url';

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
    status: number;
    type: number;
    time: any[];
    condition: string;
  },
}

@connect(({ menu, maintain, loading }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  maintainList: maintain.maintainList,
  maintainTotal: maintain.maintainTotal,
  tableLoading: loading.effects['maintain/getMaintainList'],
}))
class MaintainListPage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [],
    searchFormValues: {
      merchantName: '',
      communityName: '',
      status: -1,
      type: -1,
      time: [],
      condition: '',
    },
  }

  private ref: any

  private columns = [
    { title: '工单号', dataIndex: 'repairNum', key: 'repairNum' },
    { title: '报修人/报事人', dataIndex: 'repairUserName', key: 'repairUserName' },
    { title: '电话', dataIndex: 'repairPhone', key: 'repairPhone' },
    { title: '小区名称', dataIndex: 'communityName', key: 'communityName' },
    { title: '类型', dataIndex: 'typeDesc', key: 'typeDesc' },
    { title: '报事报修时间', dataIndex: 'repairTime', key: 'repairTime' },
    { title: '处理员工', dataIndex: 'fixUserName', key: 'fixUserName' },
    { title: '状态', dataIndex: 'statusDesc', key: 'statusDesc', width: 100, fixed: 'right', },
    {
      title: '操作', width: 80, fixed: 'right',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        return (
          <div className='table-actions'>
            {
              (globalPageSubMenu.MACINTAIL_ALL_OPERATION || globalPageSubMenu.MACINTAIL_ALL_MERCHANT) 
              && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
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
      { label: '状态', type: 'select', decorator: 'status', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(MAINTAIN_STATUS) },
      { label: '类型', type: 'select', decorator: 'type', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(MAINTAIN_TYPES) },
      { label: '报事报修时间', type: 'date', decorator: 'time', initialValue: [] },
      { label: '搜索', type: 'input', decorator: 'condition', placeholder: '报事人/报修人/报修电话/工单号' },
    ]

    if (loginType === 'operation') {
      searchFormItems.unshift( { label: '处理商户', type: 'input', decorator: 'merchantName', placeholder: '请输入处理商户名称' } as any)
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
    const { pageNum, pageSize, searchFormValues: { merchantName, communityName, status, type, time, condition } } = this.state;

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
    if (status !== -1) {
      params['status'] = status
    }
    if (type !== -1) {
      params['type'] = type
    }
    if (time && time.length) {
      params['startTime'] = time[0].startOf('day').unix() * 1000
      params['endTime'] = time[1].endOf('day').unix() * 1000
    }
    if (condition) {
      params['condition'] = condition
    }

    dispatch({
      type: 'maintain/getMaintainList',
      payload: params
    })
  }

  handleActions = (mode, info) => {
    switch (mode) {
      case 'detail':
        router.push({
          pathname: `/property/maintain/detail/${info.id}`,
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
    const { searchFormValues: { merchantName, communityName, status, type, time, condition } } = this.state;
    const url = EXPORT_MAINTAIN_LIST;

    const params = {
      token: GetGlobalToken(),
    };

    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (communityName) {
      params['communityName'] = communityName
    }
    if (status !== -1) {
      params['status'] = status
    }
    if (type !== -1) {
      params['type'] = type
    }
    if (time && time.length) {
      params['startTime'] = time[0].startOf('day').unix() * 1000
      params['endTime'] = time[1].endOf('day').unix() * 1000
    }
    if (condition) {
      params['condition'] = condition
    }

    const exportUrl = spliceDownloadUrl(url, params);
    window.open(exportUrl);
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
    const { maintainList, maintainTotal, tableLoading, globalPageSubMenu } = this.props;
    
    const pagination = {
      total: maintainTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='报事报修'>
        {
          (globalPageSubMenu.MACINTAIL_ALL_OPERATION || globalPageSubMenu.MACINTAIL_ALL_MERCHANT) &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            change={this.handleSearchFormChange}
            ref={node => (this.ref = node)}
            extraButton={
              <Button style={{ marginLeft: 8 }} onClick={() => this.handleActions('export', null)}>
                导出
              </Button>}
          />
        }
        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={maintainList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
          scroll={{ x: 1500 }}
        />
      </PageWrapper>
    )
  }
};

export default MaintainListPage

