import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { Button, message, Popconfirm } from 'antd';
import router from 'umi/router';
import { stringify } from 'qs';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import { GetUserBaseInfo } from '@/utils/cache';
import { DEFAULT_ALL_TYPE, MESSAGE_NOTICE_STATUS, MESSAGE_NOTICE_TYPES } from '@/utils/const';
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
    condition: string;
    communityId: string;
    status: number;
    noticeTitle: string;
    noticeType: number;
    time: any[];
  },
}

@connect(({ menu, loading, message, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  noticeList: message.noticeList,
  noticeTotal: message.noticeTotal,
  tableLoading: loading.models['message'],
  allOrganizationList: global.allOrganizationList,
}))
class NoticeList extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [
      { label: '交易日期', type: 'date', decorator: 'time', initialValue: [] },
    ],
    searchFormValues: {
      condition: '',
      communityId: '',
      status: -1,
      noticeTitle: '',
      noticeType: -1,
      time: [],
    },
  }

  private ref: any
  
  private columns = [
    { title: '发布方', dataIndex: 'name', key: 'name' },
    { title: '公告编号', dataIndex: 'noticeNo', key: 'noticeNo' },
    { title: '公告类别', dataIndex: 'typeDesc', key: 'typeDesc' },
    { title: '公告主题', dataIndex: 'listTitle', key: 'listTitle' },
    { title: '发布开始时间', dataIndex: 'pushTime', key: 'pushTime' },
    { title: '发布结束时间', dataIndex: 'underTime', key: 'underTime' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
    { title: '创建人', dataIndex: 'userName', key: 'userName' },
    { title: '状态', dataIndex: 'statusDesc', key: 'statusDesc' },
    { title: '操作', width: 180, fixed: 'right',
      render: (text, record) => {
        const { globalPageSubMenu } = this.props;

        if (record.status === 1 || record.status === 2) {
          return (
            <div className={'table-actions'}>
              {
                globalPageSubMenu.CHECK_NOTICE_DETAIL && 
                <span onClick={() => this.handleActions('detail', record)}>查看</span>
              }
              {
                globalPageSubMenu.CHECK_NOTICE_DETAIL && record.isSelf === 1 &&
                <span onClick={() => this.handleActions('edit', record)}>编辑</span>
              }
              {
                globalPageSubMenu.NOTICE_UNDER && 
                <Popconfirm
                  title="下架后不可再发布，是否确认下架？"
                  okText="确定"
                  cancelText="取消"
                  onConfirm={() => this.handleActions('under', record)}
                >
                  <span>下架</span>
                </Popconfirm>
              }
            </div>
          )
        } else {
          return (
            <div className={'table-actions'}>
              {
                 globalPageSubMenu.CHECK_NOTICE_DETAIL && 
                 <span onClick={() => this.handleActions('detail', record)}>查看</span>
              }
            </div>
          )
        }
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
        type: 'search',
        decorator: 'communityId', 
        placeholder: '请输入搜索的小区名称', 
        dataSource: [], 
        fieldNames: { label: 'communityName', value: 'id' },
      },
      { label: '公告状态', type: 'select', decorator: 'status', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(MESSAGE_NOTICE_STATUS) },
      { label: '公告主题', type: 'input', decorator: 'noticeTitle', placeholder: '请输入公告主题' },
      { label: '公告类别', type: 'select', decorator: 'noticeType', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(MESSAGE_NOTICE_TYPES) },
      { label: '创建时间', type: 'date', decorator: 'time', initialValue: [] },
    ]

    if (loginType === 'operation') {
      searchFormItems.unshift( { label: '发布方', type: 'input', decorator: 'condition', placeholder: '请输入搜索的发布方名称' } as any)
    }

    this.setState({ searchFormItems })
  }

  @Bind()
  @Debounce(500)
  handleSearchFormChange(decorator, value) {
    if (decorator === 'communityId' && value) {
      this.handleSearchCommunityOptions(value)
    }
  }

  handleSearchCommunityOptions = async(name) => {
    const { dispatch } = this.props;
    const { searchFormItems } = this.state;
    const newFrmItems = searchFormItems.map(item => ({ ...item })) as any;
    
    let result = await dispatch({
      type: 'global/getAllCommunityListByName',
      payload: { 
        communityName: name,
        type: 'allList' 
      }
    })

    if (result && result['length']) {
      for(let i in newFrmItems) {
        if (newFrmItems[i].decorator === 'communityId') {
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
    const { pageNum, pageSize, searchFormValues: { condition, communityId, status, noticeTitle, noticeType, time } } = this.state;

    const params = {
      pageNum,
      pageSize,
    };

    if (condition) {
      params['condition'] = condition;
    }
    if (communityId) {
      params['communityId'] = communityId;
    }
    if (status !== -1) {
      params['status'] = status;
    }
    if (noticeTitle) {
      params['noticeTitle'] = noticeTitle;
    }
    if (noticeType !== -1) {
      params['noticeType'] = noticeType;
    }
    if (time && time.length) {
      params['startTime'] = time[0].startOf('day').unix() * 1000
      params['endTime'] = time[1].endOf('day').unix() * 1000
    }

    dispatch({
      type: 'message/getNoticeList',
      payload: params
    })
  }
  
  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        router.push({
          pathname: '/message/notice/create',
          search: stringify({ mode })
        })
        break;
      case 'detail':
      case 'edit':
        router.push({
          pathname: `/message/notice/actions/${info.noticeId}`,
          search: stringify({ mode })
        })
        break;
      case 'under':
        this.handleUnderNotice(info.noticeId)
        break;
      default:
        break;
    }
  }

  handleUnderNotice = async(noticeId) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'message/underNotic',
      payload: { noticeId },
    })

    if (result) {
      message.success('公告下架成功');

      this.handleSearchList();
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
    const { noticeList, noticeTotal, tableLoading, globalPageSubMenu } = this.props;

    const pagination = {
      total: noticeTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='社区公告管理'>
        <PageSearchForm 
          fields={searchFormItems} 
          search={this.handleFilterSearch}
          ref={node => (this.ref = node)}
          change={this.handleSearchFormChange}
        />

        { 
          globalPageSubMenu.NOTICE_CREATE_OR_EDIT &&
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
          rowKey={'noticeId'}
          columns={this.columns}
          dataSource={noticeList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
          scroll={{ x: 1500 }}
        />

      </PageWrapper>
    )
  }
};


export default NoticeList
