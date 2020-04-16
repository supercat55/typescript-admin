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
import { DEFAULT_ALL_TYPE, COMMON_STATUS_TYPES, CUSTOMER_CHANNEL_TYPES } from '@/utils/const';

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
    channelType: number;
    channelState: number;
    condition: string;
  },
}

@connect(({ menu, customerChannel, loading }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  customerChannelList: customerChannel.customerChannelList,
  customerChannelTotal: customerChannel.customerChannelTotal,
  tableLoading: loading.effects['customerChannel/getCustomerChannelList'],
}))
class CustomerChannelPage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [
      { label: '渠道类型', type: 'select', decorator: 'channelType', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(CUSTOMER_CHANNEL_TYPES) },
      { label: '渠道状态', type: 'select', decorator: 'channelState', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(COMMON_STATUS_TYPES) },
      { label: '搜索', type: 'input', decorator: 'condition', placeholder: '请输入通联appid/来源场景名称' },
    ],
    searchFormValues: {
      channelType: -1,
      channelState: -1,
      condition: '',
    },
  }

  private ref: any

  private columns = [
    { title: '通联appid', dataIndex: 'appId', key: 'appId' },
    { title: '渠道类型', dataIndex: 'channelTypeDesc', key: 'channelTypeDesc' },
    { title: '来源场景名称', dataIndex: 'sourceName', key: 'sourceName' },
    { title: '渠道推荐人手机号', dataIndex: 'channelRefereePhone', key: 'channelRefereePhone' },
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
              record.channelState === 1 && globalPageSubMenu. CUSTOMER_CHANNEL_CREATE_OR_EDIT && 
              <span onClick={() => this.handleActions('edit', record)}>编辑</span>
            }
            {
              globalPageSubMenu.TOGGELE_CUSTOMER_CHANNEL_STATUS &&
              <Popconfirm
                title={record.channelState === 0 ? '是否确认启用此渠道？' : '是否确认停用此渠道？'}
                okText="确定"
                cancelText="取消"
                onConfirm={() => this.handleActions('toggle', record)}
                onCancel={() => console.log('取消停用')}
              >
                <span>{record.channelState === 0 ? '启用' : '停用'}</span>
              </Popconfirm>
            }
            {
              globalPageSubMenu. CHECK_CUSTOMER_CHANNEL_DETAIL && 
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
    const { pageNum, pageSize, searchFormValues: { channelType, channelState, condition } } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (channelType !== -1) {
      params['channelType'] = channelType
    }
    if (channelState !== -1) {
      params['channelState'] = channelState
    }
    if (condition) {
      params['condition'] = condition
    }

    dispatch({
      type: 'customerChannel/getCustomerChannelList',
      payload: params
    })
  }

  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        router.push({
          pathname: '/parameter/customer-channel/create',
          search: stringify({ mode })
        })
        break;
      case 'detail':
      case 'edit':
        router.push({
          pathname: `/parameter/customer-channel/actions/${info.id}`,
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

  handleToggleItem = async({ id, channelState }) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'customerChannel/toggleCustomerChannelStatus',
      payload: { 
        id,
        channelState: channelState === 1 ? 0 : 1
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
    const { customerChannelList, customerChannelTotal, tableLoading, globalPageSubMenu } = this.props;

    const pagination = {
      total: customerChannelTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='客户渠道配置'>
        {
          globalPageSubMenu.CUSTOMER_CHANNEL_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
          />
        }
        { 
          globalPageSubMenu.CUSTOMER_CHANNEL_CREATE_OR_EDIT &&
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
          dataSource={customerChannelList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
        />
      </PageWrapper>
    )
  }
};

export default CustomerChannelPage

