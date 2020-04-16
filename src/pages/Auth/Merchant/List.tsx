import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Form, Button, Badge, Modal, Input, Popconfirm } from 'antd'; 
import { FormComponentProps } from 'antd/lib/form';
import { connect } from 'dva';
import router from 'umi/router';
import { stringify } from 'qs';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
import { DEFAULT_ALL_TYPE, COMMON_STATUS_TYPES } from '@/utils/const';
import { formItemLayout } from '@/utils/config';

const FormItem = Form.Item;
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
    status: string | number;
    condition: string;
  },
  current: any;
  resetPwdModalVisible: boolean;
}

@connect(({ menu, authMerchant, loading }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  merchantList: authMerchant.merchantList,
  merchantTotal: authMerchant.merchantTotal,
  tableLoading: loading.effects['authMerchant/getAuthMerchantList'],
}))
class AuthMerchantPage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [
      { label: '状态', type: 'select', decorator: 'status', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(COMMON_STATUS_TYPES) },
      { label: '搜索', type: 'input', decorator: 'condition', placeholder: '商户名/商户号/姓名/账号ID' },
    ],
    searchFormValues: {
      status: -1,
      condition: ''
    },
    current: {},
    resetPwdModalVisible: false
  }

  private ref: any

  private columns = [
    { title: '商户号', dataIndex: 'merchantNum', key: 'merchantNum' },
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName' },
    { title: '账号ID', dataIndex: 'accountNum', key: 'accountNum' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '状态',dataIndex: 'statusDesc', key: 'statusDesc',
      render: (text, record) => <Badge status={record.statusBrdge} text={text}/>
    },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
    {
      title: '操作', width: 280, fixed: 'right',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        if (Number(record.status) === 0) {
          return (
            <div className='table-actions'>
              {globalPageSubMenu.CHECK_AUTH_MERCHANT_DETAIL && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
            </div>
          )
        } else {
          return (
            <div className='table-actions'>
              {globalPageSubMenu.RESET_AUTH_MERCHANT_PWD && <span onClick={() => this.handleActions('reset', record)}>重置密码</span>}
              {globalPageSubMenu.AUTH_MERCHANT_CREATE_OR_EDIT && <span onClick={() => this.handleActions('edit', record)}>编辑</span>}
              {
                globalPageSubMenu.TOOGLE_AUTH_MERCHANT_STATUS &&
                <Popconfirm
                  title="是否确认停用此账号？"
                  okText="确定"
                  cancelText="取消"
                  onConfirm={() => this.handleActions('disable', record)}
                  onCancel={() => console.log('取消停用账号')}
                >
                  <span>停用</span>
                </Popconfirm>
              }
              {globalPageSubMenu.CHECK_AUTH_MERCHANT_DETAIL && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
            </div>
          )
        }
      }
    }
  ]

  componentDidMount() {
    this.handleSearchList();
  }

  handleSearchList = () => {
    const { dispatch } = this.props;
    const { pageNum, pageSize, searchFormValues: { status, condition } } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (status !== -1) {
      params['status'] = status
    }
    if (condition) {
      params['condition'] = condition
    }

    dispatch({
      type: 'authMerchant/getAuthMerchantList',
      payload: params
    })
  }

  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        router.push({
          pathname: '/auth/merchant/actions',
          search: stringify({ mode })
        })
        break;
      case 'detail':
      case 'edit':
        router.push({
          pathname: `/auth/merchant/actions/${info.id}`,
          search: stringify({ mode })
        })
        break;
      case 'reset':
        this.setState({
          current: info,
          resetPwdModalVisible: true
        })
        break;
      case 'disable':
        this.handleDisableItem(info);
        break;
      default:
        break;
    }
  }

  handleResetConfirm = () => {
    const { form, dispatch } = this.props;
    const { current } = this.state;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { initialPassword } = values;

      let result = await dispatch({
        type: 'authMerchant/resetAuthMerchantPwd',
        payload: {
          initialPassword,
          accountNum: current.accountNum
        }
      })

      if (result) {
        this.handleSearchList();
        this.handleResetCancel();
      }
    })
  }

  handleResetCancel = () => {
    this.setState({
      current: {},
      resetPwdModalVisible: false
    })
  }

  handleDisableItem = async({ id }) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'authMerchant/disableAuthMerchant',
      payload: { id }
    })

    if (result) {
      this.handleSearchList();
      this.handleResetCancel();
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
    const { pageNum, pageSize, searchFormItems, resetPwdModalVisible } = this.state;
    const { merchantList, merchantTotal, tableLoading, globalPageSubMenu, form: { getFieldDecorator }  } = this.props;
    const pagination = {
      total: merchantTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='商户管理员账号'>
        {
          globalPageSubMenu.AUTH_MERCHANT_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
          />
        }
        { 
          globalPageSubMenu.AUTH_MERCHANT_CREATE_OR_EDIT &&
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
          dataSource={merchantList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
          scroll={{ x: 1500 }}
        />

        <Modal
          title="重置密码"
          destroyOnClose
          maskClosable={false}
          visible={resetPwdModalVisible}
          okText={'提交'}
          cancelText={'取消'}
          onOk={this.handleResetConfirm}
          onCancel={this.handleResetCancel}
        >
          <Form {...formItemLayout}>
            <FormItem label={'新密码'}>
              {getFieldDecorator('initialPassword',{
                getValueFromEvent: (event) => event.target.value.trim(),
                rules: [
                  { required: true, message: '重置密码不能为空' },
                  { max: 6, message: '重置密码不能超过6位' },
                ]
              })(
                <Input placeholder="请输入6位密码" autoComplete="off"/>
              )}
            </FormItem>
          </Form>
        </Modal>
      </PageWrapper>
    )
  }
};

export default Form.create()(AuthMerchantPage)

