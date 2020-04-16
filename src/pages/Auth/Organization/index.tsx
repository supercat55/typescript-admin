import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Form, Input, Select, Button, Modal } from 'antd'; 
import { FormComponentProps } from 'antd/lib/form';
import { connect } from 'dva';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
import { DEFAULT_ALL_TYPE, ORGANIZ_PROPERTY_TYPES } from '@/utils/const';
import { formItemHorizontalLayout } from '@/utils/config';

const FormItem = Form.Item;
const Option = Select.Option;
interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  tableLoading: boolean;
  submitLoading: boolean;
  globalPageSubMenu: any;
}

interface IState {
  pageNum: number;
  pageSize: number;
  createModalVisible: boolean;
  searchFormItems: any[];
  searchFormValues: {
    organizeName: string;
    organizeAttribute: string | number
  }
}

@connect(({ menu, authOrganization, loading }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  organizationList: authOrganization.organizationList,
  organizationTotal: authOrganization.organizationTotal,
  tableLoading: loading.effects['authOrganization/getAuthOrganizationList'],
  submitLoading: loading.effects['authOrganization/createAuthOrganization'],
}))
class OrganizationChartPage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    createModalVisible: false,
    searchFormItems: [
      { label: '组织名称', type: 'input', decorator:'organizeName', placeholder: '请输入搜索的组织名称' },
      { label: '组织属性', type: 'select', decorator:'organizeAttribute', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(ORGANIZ_PROPERTY_TYPES) },
    ],
    searchFormValues: {
      organizeName: '',
      organizeAttribute: -1
    }
  }

  private ref: any

  private columns = [
    { title: '组织名称', dataIndex: 'name', key: 'name' },
    { title: '组织属性', dataIndex: 'propertyDesc', key: 'propertyDesc' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  ]

  componentDidMount() {
    this.handleSearchList();
  }

  handleSearchList = () => {
    const { dispatch } = this.props;
    const { pageNum, pageSize, searchFormValues: { organizeName, organizeAttribute } } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (organizeName) {
      params['organizeName'] = organizeName
    }
    if (organizeAttribute !== -1) {
      params['organizeAttribute'] = organizeAttribute
    }

    dispatch({
      type: 'authOrganization/getAuthOrganizationList',
      payload: params
    })
  }

  handleCreateConfirm = () => {
    const { form, dispatch } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return

      const { organizeName, organizeAttribute } = values;

      let result = await dispatch({
        type: 'authOrganization/createAuthOrganization',
        payload: {
          organizeName,
          organizeAttribute
        }
      })

      if (result) {
        this.handleSearchList();
        this.handleCreateCancel();
      }
    })
  }

  handleCreateCancel = () => {
    this.setState({
      createModalVisible: false
    })
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
    const { pageNum, pageSize, createModalVisible, searchFormItems } = this.state;
    const { organizationList, organizationTotal, tableLoading, submitLoading, form: { getFieldDecorator }, globalPageSubMenu } = this.props;
    const pagination = {
      total: organizationTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='组织结构表'>
        {
          globalPageSubMenu.AUTH_ORG_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
          />
        }
        { 
          globalPageSubMenu.AUTH_ORG_CREATE_OR_EDIT &&
          <Button 
            type='primary'
            icon='plus'
            style={{ marginBottom: '30px' }} 
            onClick={() => this.setState({ createModalVisible: true })}
          >
            添加
          </Button>
        }
        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={organizationList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
        />

        <Modal 
          title="新增组织" 
          maskClosable={false}
          destroyOnClose
          visible={createModalVisible}
          okText={'提交'}
          cancelText={'取消'}
          confirmLoading={submitLoading}
          onOk={this.handleCreateConfirm}
          onCancel={this.handleCreateCancel}
        >
          <Form {...formItemHorizontalLayout}>
            <FormItem label={'组织名称'}>
              {getFieldDecorator('organizeName', {
                rules: [
                  { required: true, message: '组织名称不能为空' },
                  { max: 10, message: '组织名称不能超过10个字' },
                ]
              })(
                <Input placeholder="请输入组织名称，不超过10个字符"/>
              )}
            </FormItem>
            <FormItem label={'组织属性'}>
              {getFieldDecorator('organizeAttribute', {
                rules: [
                  { required: true, message: '请选择组织属性' },
                ]
              })(
                <Select placeholder="请选择组织属性">
                  {ORGANIZ_PROPERTY_TYPES.map(item => (
                    <Option value={item.value} key={item.value}>{item.label}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Form>
        </Modal>
      </PageWrapper>
    )
  }
};

export default Form.create()(OrganizationChartPage)

