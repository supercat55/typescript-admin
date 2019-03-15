import React, { PureComponent, useState } from 'react';
import { FormComponentProps } from 'antd/lib/form';
import { connect } from 'dva';
import { Form, Icon, Input, Button, Tabs, Card } from 'antd';
import styles from './index.scss'

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

// interface CustomFormProps extends FormComponentProps {
//   // username: string;
// }
interface LoginState {
  activeKey: string
}


@connect(({  }) => ({
}))
class UserLogin extends PureComponent<FormComponentProps, LoginState> {
  constructor(props: FormComponentProps) {
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

  public render() {
    const { form: { getFieldDecorator } } = this.props;
    const tabBarStyle: any = {
      textAlign: 'center',
      border: 'none'
    }

    return (
      <div className={styles.login}>
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
              rules: [{ required: true, message: '请输入账号!' }],
            })(
              <Input prefix={<Icon type="user" style={{ fontSize: '16px', color: 'rgba(0, 0, 0, .25)' }} />}  size="large" placeholder="请输入账号名称" />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: '请输入登录密码!' }],
            })(
              <Input type="password" prefix={<Icon type="lock" style={{ fontSize: '16px', color: 'rgba(0, 0, 0, .25)' }} />}  size="large" placeholder="请输入登录密码" />
            )}
          </FormItem>
          <Button size="large" type="primary" htmlType="submit" className={styles.loginBtn}>
            登录
          </Button>
        </Form>
      </div>
    )
  }
}

export default Form.create()(UserLogin);