import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Button, Popconfirm, Badge } from 'antd'; 
import { FormComponentProps } from 'antd/lib/form';
import { connect } from 'dva';
import router from 'umi/router';
import { stringify } from 'qs';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
import { DEFAULT_ALL_TYPE, COMMON_STATUS_TYPES } from '@/utils/const';

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  tableLoading: boolean;
  globalPageSubMenu: any;
}

interface IState {
  pageNum: number;
  pageSize: number;
  searchFormItems: any[];
  searchFormValues: {
    conState: number;
    condition: string;
  },
}

@connect(({ menu, homeConfig, loading }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  homeConfigList: homeConfig.homeConfigList,
  homeConfigTotal: homeConfig.homeConfigTotal,
  tableLoading: loading.effects['homeConfig/getHomeConfigList'],
}))
class HomeConfigPage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [
      { label: '状态', type: 'select', decorator: 'conState', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(COMMON_STATUS_TYPES) },
      { label: '搜索', type: 'input', decorator: 'condition', placeholder: '搜索模版名称/小区名称' },
    ],
    searchFormValues: {
      conState: -1,
      condition: '',
    },
  }

  private ref: any

  private columns = [
    { title: '配置名称', dataIndex: 'conName', key: 'conName' },
    { title: '子应用模版名称', dataIndex: 'iconTempName', key: 'iconTempName' },
    { title: '滚动banner模板名称', dataIndex: 'bannerTempName', key: 'bannerTempName' },
    { title: '广告位模板名称', dataIndex: 'advertisementTempName', key: 'advertisementTempName' },
    { title: '底部banner模板名称', dataIndex: 'bottomBannerTempName', key: 'bottomBannerTempName' },
    { title: '状态',dataIndex: 'statusDesc', key: 'statusDesc',
      render: (text, record) => <Badge status={record.statusBrdge} text={text}/>
    },
    {
      title: '操作',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        return (
          <div className='table-actions'>
            {
              record.conState === 1 && globalPageSubMenu. HOME_CONFIG_CREATE_OR_EDIT && 
              <span onClick={() => this.handleActions('edit', record)}>编辑</span>
            }
            {
              globalPageSubMenu.TOGGELE_HOME_CONFIG_STATUS &&
              <Popconfirm
                title={record.conState === 0 ? '是否确认启用此配置？' : '是否确认停用此配置'}
                okText="确定"
                cancelText="取消"
                onConfirm={() => this.handleActions('toggle', record)}
                onCancel={() => console.log('取消停用')}
              >
                <span>{record.conState === 0 ? '启用' : '停用'}</span>
              </Popconfirm>
            }
            {
              globalPageSubMenu. CHECK_HOME_CONFIG_DETAIL && 
              <span onClick={() => this.handleActions('detail', record)}>查看</span>
            }
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
    const { pageNum, pageSize, searchFormValues: { conState, condition } } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (conState !== -1) {
      params['conState'] = conState + ''
    }
    if (condition) {
      params['condition'] = condition
    }

    dispatch({
      type: 'homeConfig/getHomeConfigList',
      payload: params
    })
  }

  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        router.push({
          pathname: '/parameter/home-config/create',
          search: stringify({ mode })
        })
        break;
      case 'detail':
      case 'edit':
        router.push({
          pathname: `/parameter/home-config/actions/${info.id}`,
          search: stringify({ mode })
        })
        break;
      case 'toggle':
        this.handleToggleItem(info);
        break;
      default:
        break;
    }
  }

  handleToggleItem = async({ id, conState }) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'homeConfig/toggleHomeConfigStatus',
      payload: { 
        id,
        conState: conState === 1 ? 0 : 1
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
    const { homeConfigList, homeConfigTotal, tableLoading, globalPageSubMenu } = this.props;

    const pagination = {
      total: homeConfigTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='首页配置'>
        {
          globalPageSubMenu.HOME_CONFIG_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
          />
        }
        { 
          globalPageSubMenu.HOME_CONFIG_CREATE_OR_EDIT &&
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
          dataSource={homeConfigList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
        />
      </PageWrapper>
    )
  }
};

export default HomeConfigPage

