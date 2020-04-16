import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Form, Input, Spin, Tree, Icon, Button, Modal, Row, Col } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import PageWrapper from '@/components/PageWrapper';
import { AuthRoleActionsType } from '@/services/auth';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { formItemLayout, submitFormLayout } from '@/utils/config';
import { Debounce, Bind } from 'lodash-decorators';
import { uniq, cloneDeep } from 'lodash';
import styles from './index.scss';

const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  submitLoading: boolean;
  globalPageSubMenu: any;
  moduleListByRoleType: any[];
}

interface IState {
  mode: string;
  id: string;
  visible: boolean;
  checkedKeys: string[];
  checkedTreeData: any[];
}

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

@connect(({ menu, loading, authRoleOperator, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  moduleListByRoleType: global.moduleListByRoleType,
  pageLoading: loading.models['authRoleOperator'],
}))
class AuthRoleOperatorActionsPage extends PureComponent<IProps, IState> {
  state = {
    mode: 'create',
    id: this.props.match.params && this.props.match.params.id,
    visible: false,
    checkedKeys: [],
    checkedTreeData: []
  }

  componentDidMount() {
    const urlParams = GetPageQuery();
    const mode = urlParams.mode ? urlParams.mode : '';

    this.setState({ mode }, this.init)
  }

  init = async() => {
    const { id, mode } = this.state;
    const { dispatch } = this.props;

    if (id && mode !== 'create') {
      let result = await dispatch({
        type: 'authRoleOperator/getAuthRoleOperatorDetail',
        payload: { id }
      })

      this.handleFullBaseInfo(result)
    } else {
      this.handleGetModuleList();
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
    const { originalModulesIds, modulesIds } = detail;

    Object.keys(form.getFieldsValue()).forEach(key => {
      let obj = {};
      obj[key] = detail[key];
      form.setFieldsValue(obj);
    });

    let moduleList = await this.handleGetModuleList();

    this.setState({
      checkedKeys: originalModulesIds.split(','),
      checkedTreeData: getTreeDataByKeys(moduleList, modulesIds.split(',')),
    })
  }

  @Bind()
  @Debounce(500)
  async handleValidateRoleName(rule, value, next) {
    const { mode } = this.state;
    const { dispatch, form: { setFields } } = this.props;

    if (value && mode === 'create') {
      let result = await dispatch({
        type: 'authRoleOperator/validateRoleOperatorName',
        payload: {
          roleName: value
        }
      })

      if (Number(result) === 0) {
        setFields({
          roleName: {
            value,
            errors: [new Error('角色名称重复')],
          }
        })
        return;
      }
    }

    next()
  }

  handleRolePropertyTypeChange = () => {
    this.setState({
      checkedKeys: [],
      checkedTreeData: [],
    }, this.handleGetModuleList)
  }

  handleSubmit = e => {
    e.preventDefault();
    const { id, mode, checkedKeys } = this.state;
    const { form, dispatch } = this.props;

    form.validateFields((err, values) => {
      if (err) return;

      const { roleName } = values;

      const params: AuthRoleActionsType = {
        roleName,
        roleAttribute: 2, //默认为操作员角色
        originalModulesIds: checkedKeys.join(','),
        modulesIds: getParentKeys(checkedKeys).join(',')
      };

      if (id && mode === 'edit') {
        params['id'] = id;

        dispatch({
          type: 'authRoleOperator/editAuthRoleOperator',
          payload: params
        });

        return;
      }

      dispatch({
        type: 'authRoleOperator/createAuthRoleOperator',
        payload: params
      });
    })
  }

  handleCancel = () => {
    router.goBack();
  }

  handleAuthConfigCheck = (rule, value, next) => {
    const { checkedKeys } = this.state;

    if (checkedKeys.length <= 0) {
      next('请为角色配置权限')
    }

    next();
  }

  handleModalTreeCheck = checkedKeys => {
    this.setState({
      checkedKeys
    })
  }
  
  handleModalConfirm = () => {
    const { checkedKeys } = this.state;
    const { moduleListByRoleType } = this.props;

    const allKeys = getParentKeys(checkedKeys);
    const checkedTreeData = getTreeDataByKeys(moduleListByRoleType, allKeys);

    this.setState({
      checkedTreeData,
      visible: false
    })
  }

  handleModalCancel = () => {
    this.setState({ visible: false })
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

  render() {
    const { mode, visible, checkedKeys, checkedTreeData } = this.state;
    const { pageLoading, moduleListByRoleType, form: { getFieldDecorator } } = this.props;

    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '角色')}
        showBack
        customBreadcrumbmap={[
          { name: '角色权限管理', url: '' },
          { name: '操作角色权限(操作员)', url: '/auth/role-operator' },
          { name: GetPageTitleByMode(mode, '角色') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form {...formItemLayout} onSubmit={this.handleSubmit}>
            <FormItem label={'角色名称'} hasFeedback>
              {getFieldDecorator('roleName',{
                getValueFromEvent: (event) => event.target.value.trim(),
                rules: [
                  { required: true, message: '请输入角色名称' },
                  { max: 10, message: '角色名称不能超过10个字' },
                  { validator: this.handleValidateRoleName }
                ]
              })(
                <Input disabled={mode === 'detail'} placeholder="不超过10个字" autoComplete="off"/>
              )}
            </FormItem>
            <FormItem label={'权限配置'}>
              {getFieldDecorator('treeList', {
                rules: [
                  { required: true, validator: this.handleAuthConfigCheck }
                ]
              })(
                <Button disabled={mode === 'detail' || pageLoading} type="dashed" onClick={() => this.setState({ visible: true })}>设置配置</Button>
              )}
            </FormItem>
            {
              checkedTreeData && checkedTreeData.length ?
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
              {
                mode !== 'detail' &&
                <Button type="primary" htmlType="submit">提交</Button>
              }
              <Button style={{ marginLeft: 8 }} onClick={this.handleCancel}>
                返回
              </Button>
            </FormItem>
          </Form>

          <Modal
            width={738}
            title="权限配置"
            destroyOnClose
            maskClosable={false}
            visible={visible}
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
                  checkedKeys={checkedKeys}
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

export default Form.create()(AuthRoleOperatorActionsPage);
