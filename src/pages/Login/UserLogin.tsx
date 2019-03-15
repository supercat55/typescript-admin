import React, { PureComponent, useState, Dispatch } from 'react';
import { FormComponentProps } from 'antd/lib/form';
import { connect } from 'dva';
import { Form, Icon, Input, Button, Tabs, Card } from 'antd';
import debounce from 'lodash/debounce';
import REGEX from '@/utils/regex';
import styles from './index.scss'

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

interface CustomFormProps extends FormComponentProps {
  dispatch: Dispatch<any>
  loading: boolean
}

interface LoginState {
  activeKey: string
}

interface LoginParams {
  login_type: string
  user_name: string
  password: number
}
@connect(({ loading }) => ({
  loading: loading.effects['login/userLogin']
}))
class UserLogin extends PureComponent<CustomFormProps, LoginState> {
  constructor(props: CustomFormProps) {
    super(props)

    this.state = {
      activeKey: '1'
    }
  }

  public handleChangeLoginType = (value: string) => {
    this.setState({
      activeKey: value
    })
  }

  public handleSubmit = debounce((event) => {
    event.persist();
    const { activeKey } = this.state;
    const { form: { validateFields }, dispatch } = this.props;

    validateFields((err, value) => {
      if(err) return;
      const { account, password } = value;

      const params: LoginParams = {
        login_type: activeKey,
        user_name: account,
        password
      }

      dispatch({
        type: 'login/userLogin',
        payload: params
      })
    })

  }, 500)

  public handleAccountCheck = (rule: any, value: number, callback: any) => {
    if (!REGEX.MOBILE.test(value)) {
      callback('请输入正确手机号');

      return;
    }

    callback(rule.message);
  }

  public render() {
    const { form: { getFieldDecorator }, loading } = this.props;
    const tabBarStyle: any = {
      textAlign: 'center',
      border: 'none',
      marginBottom: '24px'
    }

    return (
      <div className={styles.login} onSubmit={this.handleSubmit}>
        <Card>
          <Tabs 
            defaultActiveKey="1" 
            tabBarStyle={tabBarStyle}
            onChange={this.handleChangeLoginType}
          >
            <TabPane tab="园区登录" key="1"/>
            <TabPane tab="企业登录" key="2"/>
          </Tabs> 
          <Form>
            <FormItem>
              {getFieldDecorator('account', { 
                getValueFromEvent: (event) => event.target.value.trim(),
                rules: [{ required: true, validator: (rule, value, callback) => this.handleAccountCheck(rule, value, callback) }], 
              })(
                <Input prefix={<Icon type="user" style={{ fontSize: '16px', color: 'rgba(0, 0, 0, .25)' }} />}  size="large" placeholder="请输入账号名称" />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('password', {
                getValueFromEvent: (event) => event.target.value.trim(),
                rules: [{ required: true, message: '请输入登录密码!' }],
              })(
                <Input type="password" prefix={<Icon type="lock" style={{ fontSize: '16px', color: 'rgba(0, 0, 0, .25)' }} />}  size="large" placeholder="请输入登录密码" />
              )}
            </FormItem>
            <span className={styles.forgot}>不知道密码？</span>
            <Button 
              size="large" 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className={styles.loginBtn}
            >
              登录
            </Button>
          </Form>
        </Card>
      </div>
    )
  }
}

export default Form.create()(UserLogin);
