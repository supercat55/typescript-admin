import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Form, Input, Select, Spin, Tooltip, Icon, Button, Modal, Table, Col, Row, Tree } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import PageWrapper from '@/components/PageWrapper';
import SearchMerchantModal from '@/components/SearchMerchantModal';
import SearchCommunityModal from '@/components/SearchCommunityModal';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { GetUserBaseInfo } from '@/utils/cache';
import { formItemLayout, submitFormLayout } from '@/utils/config';
import { AuthMerchantActionsType } from '@/services/auth';
import { Debounce, Bind } from 'lodash-decorators';
import { uniq, cloneDeep } from 'lodash';
import REGEX from '@/utils/regex';

import styles from './index.scss';

const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;
const { Option } = Select;


// 根据子项获取父级key
const getParentKeys = keys => {
  let parentKeys = [];

  for (let i in keys) {
    let item = keys[i];
     // 如果2层如（1-1）存在，就给parentKeys中添加 (1)
     if (item.indexOf('-') !== -1) {
      parentKeys.push(item.split('-')[0]);
    }
    // 如果3层如（1-1-1）存在，就给parentKeys中添加 (1-1)
    if (item.split('-').length - 1 === 2) {
        parentKeys.push(item.split('-')[0] + '-' + item.split('-')[1]);
    }
  }

  let result = uniq(keys.concat(parentKeys));

  return result;
}

// 根据key获取展示的列表内容
const getTreeDataByKeys = (treeData, keys) => {
  const allTreeData = cloneDeep(treeData);

  const filterList = list => {
    let result = [];

    for(let i in list) {
      let item = list[i]
      if (keys.includes(item.id)) {
        if (item.children && Array.isArray(item.children)) {
          item.children = filterList(item.children)
        }
        result.push(item)
      }
    }

    return result;
  }

  return filterList(allTreeData);
}

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  submitLoading: boolean;
  globalPageSubMenu: any;
  roleListByAttribute: any[]
  moduleListByRoleType: any[]
}

interface IState {
  merchantName: string;
  mode: string;
  id: string;
  userId: string;
  merchantModalVisible: boolean;
  merchantTableList: any[];
  communityModalVisible: boolean;
  communityTableList: any[];
  authModalVisible: boolean;
  authCheckedKeys: any[];
  checkedTreeData: any[];
}

@connect(({ menu, loading, authMerchantOperator, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  roleListByAttribute: global.roleListByAttribute,
  moduleListByRoleType: global.moduleListByRoleType,
  pageLoading: loading.models['authMerchantOperator'],
}))
class AuthMerchantOperatorActionsPage extends PureComponent<IProps, IState> {
  state = {
    merchantName: GetUserBaseInfo().merchantName ? GetUserBaseInfo().merchantName : '',
    mode: 'create',
    id: this.props.match.params && this.props.match.params.id,
    userId: '',
    merchantModalVisible: false,
    merchantTableList: [],
    communityModalVisible: false,
    communityTableList: [],
    authModalVisible: false,
    authCheckedKeys: [],
    checkedTreeData: []
  }

  merchantTableColumn = [
    { title: '商户号', dataIndex: 'id', key: 'id' },
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName' },
  ]

  communityableColumn = [
    { title: '小区名称', dataIndex: 'communityName', key: 'communityName' },
    { title: '所在省/市/区',
      render: (_, record) => (
        <span>{`${record.province}-${record.city}-${record.area}`}</span>
      )
    }
  ]

  componentDidMount() {
    const urlParams = GetPageQuery();
    const mode = urlParams.mode ? urlParams.mode : '';

    this.setState({ mode }, this.init)
  }

  init = async() => {
    const { id, mode } = this.state;
    const { dispatch } = this.props;
    const baseInfo = GetUserBaseInfo();
    const { operationRole, merchantId = '', merchantType = '' } = baseInfo;

    if (operationRole !== 0) {
      await dispatch({
        type: 'global/getAuthRoleListByAttribute',
        payload: { 
          roleAttribute: 2,
          merchantId,
          merchantType
        }
      })
    } else {
      this.handleGetModuleList();
    }

    if (id && mode !== 'create') {
      let result = await dispatch({
        type: 'authMerchantOperator/getAuthMerchantOperatorDetail',
        payload: { id }
      })

      this.handleFullBaseInfo(result)
    }
  }

  handleGetModuleList = async() => {
    const { dispatch } = this.props;

    let moduleList = await dispatch({
      type: 'global/getRoleModuleListByRoleType',
      payload: {
        type: 'merchant'
      }
    })

    return moduleList;
  }

  handleFullBaseInfo = async(detail) => {
    const { form } = this.props;
    const { merchantType } = GetUserBaseInfo();

    const { originalModulesIds, modulesIds = [], owners = [], merchantName } = detail;
    let associatedRowKeys = [];

    if (owners && owners.length) {
      for (let i in owners) {
        associatedRowKeys.push(owners[i].id)
      }
    }

    Object.keys(form.getFieldsValue()).forEach(key => {
      let obj = {};
      obj[key] = detail[key];
      form.setFieldsValue(obj);
    });

    let moduleList = await this.handleGetModuleList();

    this.setState({
      authCheckedKeys: originalModulesIds && originalModulesIds.length ? originalModulesIds.split(',') : [],
      checkedTreeData: getTreeDataByKeys(moduleList, modulesIds && modulesIds.length ? modulesIds.split(',') : []),
      userId: detail.userId,
      merchantName
    })

    if (merchantType === 2) {
      this.setState({
        merchantTableList: owners
      })
      form.setFieldsValue({ associatedRowKeys })
    } else if (merchantType === 1 || merchantType === 3) {
      this.setState({
        communityTableList: owners
      })
      form.setFieldsValue({ associatedRowKeys })
    }
  }

  @Bind()
  @Debounce(500)
  async handleValidateAccountNum(rule, value, next) {
    const { mode } = this.state;
    const { dispatch, form: { setFields } } = this.props;

    if (value && mode === 'create') {
      let result = await dispatch({
        type: 'authMerchantOperator/validateAccount',
        payload: {
          accountNum: value
        }
      })

      if (Number(result) === 0) {
        setFields({
          accountNum: {
            value,
            errors: [new Error('账号ID重复')],
          }
        })
        return;
      }
    }

    next()
  }

  @Bind()
  @Debounce(500)
  async handleValidatePhone(rule, value, next) {
    const { mode, userId } = this.state;
    const { dispatch, form: { setFields } } = this.props;

    if (value) {
      const params = {
        phoneNum: value
      }

      if (mode === 'edit' && userId) {
        params['userId'] = userId
      }
      let result = await dispatch({
        type: 'authMerchantOperator/validateAccount',
        payload: params
      })

      if (Number(result) === 0) {
        setFields({
          phoneNum: {
            value,
            errors: [new Error('登录手机号重复')],
          }
        })
        return;
      }
    }

    next()
  }

  handleAuthConfigCheck = (rule, value, next) => {
    const { authCheckedKeys } = this.state;

    if (authCheckedKeys.length <= 0) {
      next('请为角色配置权限')
    }

    next();
  }

  // 选择商户modal确认事件
  handleMerchantModalOk = (selectedRowKeys, selectedRow) => {
    this.props.form.setFieldsValue({
      associatedRowKeys: selectedRowKeys
    })

    this.setState({
      merchantTableList: selectedRow,
    }, this.handleMerchantModalCancel)
  }

  // 选择商户modal取消事件
  handleMerchantModalCancel = () => {
    this.setState({
      merchantModalVisible: false
    })
  }

  // 选择小区modal确认事件
  handleCommunityModalOk = (selectedRowKeys, selectedRow) => {
    this.props.form.setFieldsValue({
      associatedRowKeys: selectedRowKeys
    })

    this.setState({
      communityTableList: selectedRow,
    }, this.handleCommunityModalCancel)
  }

  // 选择小区modal取消事件
  handleCommunityModalCancel = () => {
    this.setState({
      communityModalVisible: false
    })
  }

  // 权限tree选择事件
  handleModalTreeCheck = checkedKeys => {
    this.setState({
      authCheckedKeys: checkedKeys
    })
  }

  // 权限tree modal确认事件
  handleModalConfirm = () => {
    const { authCheckedKeys } = this.state;
    const { moduleListByRoleType } = this.props;

    const allKeys = getParentKeys(authCheckedKeys);
    const checkedTreeData = getTreeDataByKeys(moduleListByRoleType, allKeys);

    this.setState({
      checkedTreeData,
      authModalVisible: false
    })
  }

  // 权限tree modal取消事件
  handleModalCancel = () => {
    this.setState({ authModalVisible: false })
  }

  handleSubmit = e => {
    e.preventDefault();
    const { id, mode, authCheckedKeys } = this.state;
    const { form, dispatch } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { accountNum, name, roleId, phoneNum, email, associatedRowKeys = [] } = values;

      const params = {
        accountNum,
        name,
        originalModulesIds: authCheckedKeys.join(','),
        modulesIds: getParentKeys(authCheckedKeys).join(',')
      }

      if (roleId) {
        params['roleId'] = roleId;
      }
      if (phoneNum) {
        params['phoneNum'] = phoneNum.trim();
      }
      if (email) {
        params['email'] = email;
      }
      if (associatedRowKeys.length) {
        params['ownerIds'] = associatedRowKeys.join(',');
      }

      if (id && mode === 'edit') {
        params['id'] = id

        dispatch({
          type: 'authMerchantOperator/editAuthMerchantOperator',
          payload: params
        });
        
        return;
      }

      let result = await dispatch({
        type: 'authMerchantOperator/createAuthMerchantOperator',
        payload: params
      })

      if (result) {
        Modal.success({
          width: 658,
          title: '新增成功',
          content: (
            <div className={styles['result-modal-container']}>
              <p className={styles['sub-title']}>以下信息将用于相关人员的账号登录，请妥善保存。</p>
              <div className={styles['account-info']}>
                <div className={styles['account-info-item']}>
                  <span className={styles['account-info-label']}>账号ID：</span>
                  <span className={styles['account-info-desc']}>{result['accountNum']}</span>
                </div>
                <div className={styles['account-info-item']}>
                  <span className={styles['account-info-label']}>初始密码：</span>
                  <span className={styles['account-info-desc']}>{result['initialPassword']}</span>
                </div>
              </div>
            </div>
          ),
          onOk: this.handleCancel
        });
      }
    })
  }

  renderTreeNodes = data => data.map((item) => {
    if (item.children) {
      return (
        <TreeNode title={item.modulesName} key={item.id} dataRef={item}>
          {this.renderTreeNodes(item.children)}
        </TreeNode>
      );
    }

    return <TreeNode title={item.modulesName} key={item.id}/>;
  })

  handleCancel = () => {
    router.goBack();
  }

  render() {
    const { mode, merchantModalVisible, merchantTableList, authModalVisible, authCheckedKeys, checkedTreeData, communityModalVisible, communityTableList, merchantName } = this.state;
    const { roleListByAttribute, pageLoading, form: { getFieldDecorator }, moduleListByRoleType } = this.props;
    const { merchantType, operationRole } = GetUserBaseInfo();

    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '运营账号')}
        showBack
        customBreadcrumbmap={[
          { name: '角色权限管理', url: '' },
          { name: '运营账号', url: '/auth/operation' },
          { name: GetPageTitleByMode(mode, '运营账号') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form {...formItemLayout} onSubmit={this.handleSubmit}>
            <FormItem label={'绑定商户'}>
              <Input disabled value={merchantName} />
            </FormItem>
            <FormItem label={'账号ID'} hasFeedback>
              {getFieldDecorator('accountNum',{
                getValueFromEvent: (event) => event.target.value.trim(),
                rules: [
                  { required: true, message: '账号ID不能为空' },
                  { max: 20, message: '账号ID不能超过20个字' },
                  { validator: this.handleValidateAccountNum }
                ]
              })(
                <Input disabled={mode !== 'create'} placeholder="请输入账号ID" autoComplete="off"/>
              )}
            </FormItem>
            <FormItem label={'姓名'}>
              {getFieldDecorator('name', {
                getValueFromEvent: (event) => event.target.value.trim(),
                rules: [
                  { required: true, message: '账号姓名不能为空' },
                  { max: 10, message: '账号姓名不能超过10个字' }
                ]
              })(
                <Input disabled={mode === 'detail'} placeholder="不超过10个字" autoComplete="off"/>
              )}
            </FormItem>
            {
              operationRole !== 0 &&
              <FormItem label={'账号角色'}>
                {getFieldDecorator('roleId', {
                  rules: [{ required: true, message: '请选择角色' }]
                })(
                  <Select 
                    placeholder="请选择角色" 
                    showSearch
                    optionFilterProp="children"
                    disabled={mode === 'detail'}
                  >
                    {roleListByAttribute.map(item => (
                      <Option value={item.id} key={item.id}>{item.name}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            }
            <FormItem label={'登录手机号'}>
              <div style={{ position: 'relative' }} >
                {getFieldDecorator('phoneNum', {
                  getValueFromEvent: (event) => event.target.value.trim(),
                  rules: [
                    { pattern: REGEX.MOBILE, message: '手机号格式不正确' },
                    { validator: this.handleValidatePhone }
                  ]
                })(
                  <Input disabled={mode === 'detail'} placeholder="填写后可作为登录账号" autoComplete="off"/>
                )}
                <Tooltip placement="top" title={'手机号将用于接收登录密码和登录。建议填写，否则忘记密码后无法自主找回！'}>
                  <Icon type="info-circle" theme="filled" style={{ position: 'absolute', top: '13px' ,right: '-40px', fontSize: '14px', color: '#1890FF' }}/>
                </Tooltip>
              </div>
            </FormItem>
            <FormItem label={'邮箱'}>
              {getFieldDecorator('email', {
                getValueFromEvent: (event) => event.target.value.trim(),
                rules: [
                  { pattern: REGEX.EMAIL, message: '邮箱格式不正确' },
                ]
              })(
                <Input disabled={mode === 'detail'} placeholder="请输入邮箱" autoComplete="off"/>
              )}
            </FormItem>
            <FormItem label={'初始密码'}>
              {getFieldDecorator('initialPassword')(
                <Input disabled placeholder="提交后可查看初始密码"/>
              )}
            </FormItem>
            {
              merchantType === 2 &&
              <FormItem label={'关联子商户'}>
                {getFieldDecorator('associatedRowKeys', {
                  initialValue: [],
                  rules: [
                    { required: true, message: '请关联商户' }
                  ]
                })(
                  <Button disabled={mode === 'detail'} type="dashed" onClick={() => this.setState({ merchantModalVisible: true })}>设置子商户</Button>
                )}
              </FormItem>
            }
            {
              merchantTableList.length ?
              (
                <Row gutter={24}>
                  <Col span={12} offset={7}>
                    <Table
                      rowKey="id"
                      pagination={false}
                      style={{ marginBottom: 20 }}
                      columns={this.merchantTableColumn}
                      dataSource={merchantTableList}
                    />
                  </Col>
                </Row>
              ) : null
            }
            {
              (merchantType === 1 || merchantType == 3) &&
              <FormItem label={'关联社区'}>
                {getFieldDecorator('associatedRowKeys', {
                  initialValue: [],
                  rules: [
                    { required: true, message: '请关联社区' }
                  ]
                })(
                  <Button disabled={mode === 'detail'} type="dashed" onClick={() => this.setState({ communityModalVisible: true })}>设置社区</Button>
                )}
              </FormItem>
            }

            {
              communityTableList.length ?
              (
                <Row gutter={24}>
                  <Col span={12} offset={7}>
                    <Table
                      rowKey="id"
                      style={{ marginBottom: 20 }}
                      pagination={false}
                      columns={this.communityableColumn}
                      dataSource={communityTableList}
                    />
                  </Col>
                </Row>
              ) : null
            }
            {
              operationRole === 0 &&
              <FormItem label={'权限配置'}>
                {getFieldDecorator('treeList', {
                  rules: [
                    { required: true, validator: this.handleAuthConfigCheck }
                  ]
                })(
                  <Button disabled={mode === 'detail' || pageLoading} type="dashed" onClick={() => this.setState({ authModalVisible: true })}>设置配置</Button>
                )}
              </FormItem>
            }
            {
              checkedTreeData.length ?
              (
                <Row gutter={24}>
                  <Col span={6} offset={7}>
                    <FormItem>
                      <Tree defaultExpandParent>{this.renderTreeNodes(checkedTreeData)}</Tree>
                    </FormItem>
                  </Col>
                </Row>
              )
              : null
            }
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              {mode !== 'detail' && <Button type="primary" htmlType="submit">提交</Button>}
              <Button style={{ marginLeft: 8 }} onClick={this.handleCancel}>
                返回
              </Button>
            </FormItem>
          </Form>

          <SearchMerchantModal 
            relationType={3}
            visible={merchantModalVisible}
            multiple
            onConfirm={this.handleMerchantModalOk}
            onCancel={this.handleMerchantModalCancel}
          />

          <SearchCommunityModal
            multiple
            visible={communityModalVisible}
            onConfirm={this.handleCommunityModalOk}
            onCancel={this.handleCommunityModalCancel}
          />
          <Modal
            width={738}
            title="权限配置"
            destroyOnClose
            maskClosable={false}
            visible={authModalVisible}
            okText={'确认'}
            cancelText={'取消'}
            onOk={this.handleModalConfirm}
            onCancel={this.handleModalCancel}
          >
            <div className={styles['modal-container']}>
              <div className={styles.title}>
                <Icon type="exclamation-circle" style={{ marginRight: 5 }}/>
                勾选的模块为后台侧边栏管理模块
              </div>
              <div className={styles.content}>
                <Tree
                  checkable
                  defaultExpandAll={false}
                  checkedKeys={authCheckedKeys}
                  onCheck={this.handleModalTreeCheck}
                >
                  {this.renderTreeNodes(moduleListByRoleType)}
                </Tree>
              </div>
            </div>
          </Modal>
          
        </Spin>
      </PageWrapper>
    )
  }
};

export default Form.create()(AuthMerchantOperatorActionsPage);
