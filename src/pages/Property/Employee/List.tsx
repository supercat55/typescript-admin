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
import { GetUserBaseInfo } from '@/utils/cache';
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
    merchantName: string;
    isValid: number;
    condition: string;
  },
}

@connect(({ menu, employee, loading }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  employeeList: employee.employeeList,
  employeeTotal: employee.employeeTotal,
  tableLoading: loading.effects['employee/getEmployeeList'],
}))
class EmployeeListPage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [],
    searchFormValues: {
      merchantName: '',
      isValid: -1,
      condition: '',
    },
  }

  private ref: any

  private columns = [
    { title: '所属商户', dataIndex: 'merchantName', key: 'merchantName' },
    { title: '姓名', dataIndex: 'employeeName', key: 'employeeName' },
    { title: '手机号', dataIndex: 'employeePhone', key: 'employeePhone' },
    { title: '工号', dataIndex: 'jobNo', key: 'jobNo' },
    { title: '服务时间', dataIndex: 'serviceTime', key: 'serviceTime' },
    { title: '状态',dataIndex: 'statusDesc', key: 'statusDesc',
      render: (text, record) => <Badge status={record.statusBrdge} text={text}/>
    },
    { title: '创建人', dataIndex: 'userName', key: 'userName' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
    {
      title: '操作', width: 200, fixed: 'right',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        return (
          <div className='table-actions'>
            {
              record.isValid === 1 && globalPageSubMenu. EMPLOYEE_CREATE_OR_EDIT && 
              <span onClick={() => this.handleActions('edit', record)}>编辑</span>
            }
            {
              globalPageSubMenu. TOGGELE_EMPLOYEE_STATUS &&
              <Popconfirm
                title={record.isValid === 0 ? '是否确认启用此员工？' : '是否确认停用此员工？'}
                okText="确定"
                cancelText="取消"
                onConfirm={() => this.handleActions('toggle', record)}
                onCancel={() => console.log('取消停用岗位')}
              >
                <span>{record.isValid === 0 ? '启用' : '停用'}</span>
              </Popconfirm>
            }
            {
              globalPageSubMenu. CHECK_EMPLOYEE_DETAIL && 
              <span onClick={() => this.handleActions('detail', record)}>查看</span>
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
      { label: '状态', type: 'select', decorator: 'isValid', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(COMMON_STATUS_TYPES) },
      { label: '搜索', type: 'input', decorator: 'condition', placeholder: '搜索员工姓名/工号/手机号' },
    ]

    if (loginType === 'operation') {
      searchFormItems.unshift( { label: '绑定商户', type: 'input', decorator: 'merchantName', placeholder: '请输入搜索的商户名称' } as any)
    }

    this.setState({ searchFormItems })
  }

  handleSearchList = () => {
    const { dispatch } = this.props;
    const { pageNum, pageSize, searchFormValues: { merchantName, isValid, condition } } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (isValid !== -1) {
      params['isValid'] = isValid
    }
    if (condition) {
      params['condition'] = condition
    }

    dispatch({
      type: 'employee/getEmployeeList',
      payload: params
    })
  }

  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        router.push({
          pathname: '/property/employee/create',
          search: stringify({ mode })
        })
        break;
      case 'detail':
      case 'edit':
        router.push({
          pathname: `/property/employee/actions/${info.id}`,
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

  handleToggleItem = async({ id, isValid }) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'employee/toggleEmployeeStatus',
      payload: { 
        employeeId: id,
        isValid: isValid === 1 ? 0 : 1
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
    const { employeeList, employeeTotal, tableLoading, globalPageSubMenu } = this.props;

    const pagination = {
      total: employeeTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='员工管理'>
        {
          globalPageSubMenu.EMPLOYEE_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
          />
        }
        { 
          globalPageSubMenu.EMPLOYEE_CREATE_OR_EDIT &&
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
          dataSource={employeeList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
          scroll={{ x: 1700 }}
        />
      </PageWrapper>
    )
  }
};

export default EmployeeListPage

