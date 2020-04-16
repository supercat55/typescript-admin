import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Row, Col, Form, Input, Transfer, Spin, Button } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import PageWrapper from '@/components/PageWrapper';
import { Debounce, Bind } from 'lodash-decorators';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { formItemLayout, submitFormLayout } from '@/utils/config';
import styles from './index.scss';

const FormItem = Form.Item;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  submitLoading: boolean;
  allIconTemplateList: any[];
}

interface IState {
  mode: string;
  id: string;
  iconList: any[];
}

@connect(({ loading, global }) => ({
  pageLoading: loading.models['iconTemplate'],
  allIconTemplateList: global.allIconTemplateList
}))
class IconTemplateActions extends PureComponent<IProps, IState> {
  state = {
    mode: 'create',
    id: this.props.match.params && this.props.match.params.id,
    iconList: []
  }

  componentDidMount() {
    const urlParams = GetPageQuery();
    const mode = urlParams.mode ? urlParams.mode : '';

    this.setState({ mode }, this.init)
  }

  init = async() => {
    const { id, mode } = this.state;
    const { dispatch } = this.props;
    let result;

    await dispatch({
      type: 'global/getAllIconTemplateList'
    })

    if (mode === 'default') {
      const result = await dispatch({
        type: 'iconTemplate/getDefaultIconTemplateDetail',
        payload: { templateType: 1 }
      })

      this.handleFullBaseInfo(result)
    } else if (id && mode !== 'create') {
      const result = await dispatch({
        type: 'iconTemplate/getIconTemplateDetail',
        payload: { id }
      })

      this.handleFullBaseInfo(result)
    }
  }

  handleFullBaseInfo = result => {
    const { mode } = this.state;
    const { form } = this.props;
    const { id = '', name, iconList } = result;
    let iconIds = [];

    for (let i in iconList) {
      iconIds.push(iconList[i].iconId)
    }
    const detail = {
      name,
      iconIds
    }
    
    form.setFieldsValue(detail)

    this.setState({
      iconList
    })

    if (mode === 'default' && id) {
      this.setState({
        id
      })
    }
  }

  @Bind()
  @Debounce(500)
  async handleValidateIconName(rule, value, next) {
    const { mode, id } = this.state;
    const { dispatch, form: { setFields } } = this.props;

    if (value) {
      const params = {
        iconTempName: value
      }

      if (mode === 'edit' && id) {
        params['id'] = id
      }

      let result = await dispatch({
        type: 'iconTemplate/checkIconTemplateName',
        payload: params
      })

      if (Number(result) === 1) {
        setFields({
          name: {
            value,
            errors: [new Error('模板名称不可重复')],
          }
        })
        return;
      }
    }

    next()
  }

  handleSubmit = e => {
    e.preventDefault();
    const { id, mode } = this.state;
    const { form, dispatch } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { name, iconIds } = values;

      const params = {
        name,
        iconIds: iconIds.join(','),
      }

      if (id && mode === 'edit') {
        params['id'] = id;

        dispatch({
          type: 'iconTemplate/editIconTemplate',
          payload: params
        });

      } else if (id && mode === 'default') {
        params['id'] = id;

        dispatch({
          type: 'iconTemplate/editDefaultIconTemplate',
          payload: params
        });
        
      } else if (mode === 'create') {
        dispatch({
          type: 'iconTemplate/createIconTemplate',
          payload: params
        })
      }
    })
  }

  handleCancel = () => {
    router.goBack();
  }

  renderItem = item => {
    const customLabel = (
      <span className={styles.transferItem}>
        <span>{item.name}</span>
        <img src={item.url}/>
      </span>
    );

    return {
      label: customLabel, // for displayed item
      value: item.iconId, // for title and filter matching
    };
  }

  render() {
    const { mode, iconList } = this.state;
    const { pageLoading, form: { getFieldDecorator, getFieldValue }, allIconTemplateList } = this.props;
    const iconIds = getFieldValue('iconIds') ? getFieldValue('iconIds') : [];
    
    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '子应用模版')}
        showBack
        customBreadcrumbmap={[
          { name: '参数管理', url: '' },
          { name: '子应用模版管理', url: '/parameter/icon-template' },
          { name: GetPageTitleByMode(mode, '子应用模版') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form {...formItemLayout} onSubmit={this.handleSubmit}>
            <FormItem label={'模版名称'} hasFeedback>
              {getFieldDecorator('name', {
                initialValue: mode != 'default' ? '' : '默认模版',
                rules: [
                  { required: true, message: '请输入模版名称' },
                  { max: 8, message: '不可超过8个字' },
                  { validator: mode === 'default' ? null : this.handleValidateIconName }
                ]
              })(
                <Input disabled={mode ==='detail' || mode ==='default'} placeholder="不可超过8个字" autoComplete="off"/>
              )}
            </FormItem>
            {
              mode !== 'detail' ?
              (
                <FormItem label={'选择子应用'}>
                  {getFieldDecorator('iconIds', {
                    rules: [
                      { required: true, message: '请选择子应用' },
                    ]
                  })(
                    <Transfer
                      rowKey={record => record.iconId}
                      titles={['子应用库存', '已选列表']}
                      listStyle={{ height: 500 }}
                      dataSource={allIconTemplateList}
                      render={this.renderItem}
                      targetKeys={iconIds}
                    />
                  )}
                </FormItem>
              ) :
              (
                <Row>
                  <Col offset={4} span={16}>
                    <div className={styles.appContent}>
                      {
                        iconList.map(item => (
                          <div className={styles.item} key={item.id}>
                            <img src={item.url}/>
                            <span>{item.iconName}</span>
                          </div>
                        ))
                      }
                    </div>
                  </Col>
                </Row>
              )
            }
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              {mode !== 'detail' && <Button type="primary" htmlType="submit">提交</Button>}
              <Button style={{ marginLeft: 8 }} onClick={this.handleCancel}>
                返回
              </Button>
            </FormItem>
          </Form>
        </Spin>
      </PageWrapper>
    )
  }
};

export default Form.create()(IconTemplateActions);
