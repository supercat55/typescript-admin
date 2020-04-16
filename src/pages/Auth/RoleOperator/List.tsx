import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Button, Badge, Popconfirm } from 'antd'; 
import { connect } from 'dva';
import router from 'umi/router';
import { stringify } from 'qs';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
import { DEFAULT_ALL_TYPE, COMMON_STATUS_TYPES, ROLE_PROPERTY_TYPES } from '@/utils/const';

interface IProps extends StateType {
  dispatch: Dispatch<AnyAction>;
  tableLoading: boolean;
  globalPageSubMenu: any;
}

interface IState {
  pageNum: number;
  pageSize: number;
  searchFormItems: any[];
  searchFormValues: {
    merchantName: string;
    status: string | number;
    roleName: string;
  },
}

@connect(({ menu, authRoleOperator, loading }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  roleList: authRoleOperator.roleList,
  roleTotal: authRoleOperator.roleTotal,
  tableLoading: loading.effects['authRoleOperator/getAuthRoleOperatorList'],
}))
class AuthRoleOperatorPage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [
      { label: '商户名称', type: 'input', decorator: 'merchantName', placeholder: '搜索商户名称' },
      { label: '状态', type: 'select', decorator: 'status', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(COMMON_STATUS_TYPES) },
      { label: '角色名称', type: 'input', decorator: 'roleName', placeholder: '搜索角色名称' },
    ],
    searchFormValues: {
      merchantName: '',
      status: -1,
      roleName: ''
    },
  }

  private ref: any

  private columns = [
    { title: '商户号', dataIndex: 'merchantNum', key: 'merchantNum' },
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName' },
    { title: '角色名称', dataIndex: 'name', key: 'name' },
    { title: '状态',dataIndex: 'statusDesc', key: 'statusDesc',
      render: (text, record) => <Badge status={record.statusBrdge} text={text}/>
    },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
    {
      title: '操作',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;
        const status = Number(record.status);

        return (
          <div className='table-actions'>
            {
              globalPageSubMenu.ROLE_OPERATOR_CREATE_OR_EDIT && status === 1 &&
              <span onClick={() => this.handleActions('edit', record)}>编辑</span>}
            {
              globalPageSubMenu.TOOGLE_ROLE_OPERATOR_STATUS &&
              <Popconfirm
                title={status === 0 ? "是否确认启用此角色？" : '是否确认停用此角色？'}
                okText='确定'
                cancelText='取消'
                onConfirm={() => this.handleActions('toggle', record)}
                onCancel={() => console.log('取消启用角色')}
              >
                <span>{status === 0 ? '启用' : '停用'}</span>
              </Popconfirm>
            }
            {globalPageSubMenu.CHECK_ROLE_OPERATOR_DETAIL && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
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
    const { pageNum, pageSize, searchFormValues: { merchantName, status, roleName } } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (status !== -1) {
      params['status'] = status
    }
    if (roleName) {
      params['roleName'] = roleName
    }

    dispatch({
      type: 'authRoleOperator/getAuthRoleOperatorList',
      payload: params
    })
  }

  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        router.push({
          pathname: '/auth/role-operator/actions',
          search: stringify({ mode })
        })
        break;
      case 'detail':
      case 'edit':
        router.push({
          pathname: `/auth/role-operator/actions/${info.id}`,
          search: stringify({ mode })
        })
        break;
      case 'toggle':
        this.handleToggleItemStatus(info);
        break;
      default:
        break;
    }
  }

  handleToggleItemStatus = async(info) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'authRoleOperator/toggleAuthRoleOperatorStatus',
      payload: { 
        id: info.id,
        status: Number(info.status) === 0 ? 1 : 0
      }
    })

    if (result) {
      this.handleSearchList();
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
    const { roleList, roleTotal, tableLoading, globalPageSubMenu  } = this.props;
    const pagination = {
      total: roleTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='角色权限(操作员)'>
        {
          globalPageSubMenu.ROLE_OPERATOR_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
          />
        }
        { 
          globalPageSubMenu.ROLE_OPERATOR_CREATE_OR_EDIT &&
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
          dataSource={roleList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
          // scroll={{ x: 1500 }}
        />
      </PageWrapper>
    )
  }
};

export default AuthRoleOperatorPage

