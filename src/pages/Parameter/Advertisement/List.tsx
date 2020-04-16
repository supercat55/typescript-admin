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

@connect(({ menu, loading, advertisement }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  advertisementList: advertisement.advertisementList,
  advertisementTotal: advertisement.advertisementTotal,
  tableLoading: loading.effects['advertisement/getAdvertisementList'],
}))
class AdvertisementTemplateList extends PureComponent<IProps, IState> {
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
            {globalPageSubMenu.ADVERTISEMENT_CREATE_OR_EDIT && <span onClick={() => this.handleActions('edit', record)}>编辑</span>}
            {globalPageSubMenu.CHECK_ADVERTISEMENT_DETAIL && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
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
    };

    if (name) {
      params['name'] = name
    }

    dispatch({
      type: 'advertisement/getAdvertisementList',
      payload: params
    })
  }
  
  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        router.push({
          pathname: '/parameter/advertisement/create',
          search: stringify({ mode })
        })
        break;
      case 'edit':
        router.push({
          pathname: `/parameter/advertisement/edit/${info.id}`,
          search: stringify({ mode })
        })
        break;
      case 'detail':
        router.push({
          pathname: `/parameter/advertisement/detail/${info.id}`,
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
    const { advertisementList, advertisementTotal, tableLoading, globalPageSubMenu } = this.props;
    const pagination = {
      total: advertisementTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='广告位模板管理'>
        {
          globalPageSubMenu.ADVERTISEMENT_SEARCH &&
          <LargeSearch
            placeholder='请输入模板名称'
            value={name}
            change={this.handleSearchChange}
            search={this.handleFilterSearch}
          />
        }

        { 
          globalPageSubMenu.ADVERTISEMENT_CREATE_OR_EDIT &&
          <Button 
            type='primary'
            icon='plus'
            onClick={() => this.handleActions('create', null)}
            style={{ marginBottom: 20 }}
          >
            添加
          </Button>
        }

        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={advertisementList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
        />
      </PageWrapper>
    )
  }
};


export default AdvertisementTemplateList
