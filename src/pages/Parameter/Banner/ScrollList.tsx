import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Button } from 'antd'; 
import { connect } from 'dva';
import router from 'umi/router';
import { stringify } from 'qs';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import LargeSearch from '../component/LargeSearch';
import { StateType } from './model';

interface IProps extends StateType {
  dispatch: Dispatch<AnyAction>;
  tableLoading: boolean;
  globalPageSubMenu: any;
}

interface IState {
  pageNum: number;
  pageSize: number;
  name: string;
}

@connect(({ menu, loading, banner }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  scrollBannerList: banner.scrollBannerList,
  scrollBannerTotal: banner.scrollBannerTotal,
  tableLoading: loading.effects['banner/getScrollBannerList'],
}))
class ScrollBannerTemplateList extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    name: ''
  }
  
  private columns = [
    { title: '模版名称', dataIndex: 'templateName', key: 'templateName' },
    { title: '创建人', dataIndex: 'userName', key: 'userName' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
    { title: '操作',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        return (
          <div className='table-actions'>
            {globalPageSubMenu.SCROLL_BANNER_CREATE_OR_EDIT && <span onClick={() => this.handleActions('edit', record)}>编辑</span>}
            {globalPageSubMenu.CHECK_SCROLL_BANNER_DETAIL && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
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
    const { pageNum, pageSize, name } = this.state;

    const params = {
      pageNum,
      pageSize,
      bannerType: 1
    };

    if (name) {
      params['name'] = name
    }

    dispatch({
      type: 'banner/getScrollBannerList',
      payload: params
    })
  }
  
  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
      case 'default':
        router.push({
          pathname: '/parameter/scroll-banner/create',
          search: stringify({ mode })
        })
        break;
      case 'edit':
      case 'detail':
        router.push({
          pathname: `/parameter/scroll-banner/actions/${info.id}`,
          search: stringify({ mode })
        })
        break;
      default:
        break;
    }
  }

  handleSearchChange = value => {
    this.setState({
      name: value
    })
  }

  handleFilterSearch = () => {
    this.setState({
      pageNum: 1
    }, this.handleSearchList)
  }
  
  handleTabelChange = pagination => {
    const { name } = this.state;

    this.setState({
      name,
      pageNum: pagination.current
    }, this.handleSearchList)
  }

  render() {
    const { pageNum, pageSize, name } = this.state;
    const { scrollBannerList, scrollBannerTotal, tableLoading, globalPageSubMenu } = this.props;
    const pagination = {
      total: scrollBannerTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='滚动banner模板管理'>
        {
          globalPageSubMenu.SCROLL_BANNER_SEARCH &&
          <LargeSearch
            placeholder='请输入模板名称'
            value={name}
            change={this.handleSearchChange}
            search={this.handleFilterSearch}
          />
        }

        <div className='table-operation-btns'>
          { 
            globalPageSubMenu.SCROLL_BANNER_CREATE_OR_EDIT &&
            <Button 
              type='primary'
              icon='plus'
              onClick={() => this.handleActions('create', null)}
            >
              添加
            </Button>
          }
          { 
            globalPageSubMenu.SCROLL_BANNER_DEFAULT &&
            <Button onClick={() => this.handleActions('default', null)}>
              默认模版
            </Button>
          }
        </div>

        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={scrollBannerList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
        />
      </PageWrapper>
    )
  }
};


export default ScrollBannerTemplateList
