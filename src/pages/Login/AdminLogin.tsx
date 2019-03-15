import React, { PureComponent, Dispatch } from 'react';
import { FormComponentProps } from 'antd/lib/form';
import { connect } from 'dva';
import { Form, Icon, Input, Button, Card } from 'antd';
import debounce from 'lodash/debounce';
import styles from './index.scss'

const FormItem = Form.Item;

interface CustomFormProps extends FormComponentProps {
  dispatch: Dispatch<any>
  loading: boolean
}

interface LoginParams {
  user_name: string
  password: number
}
@connect(({ loading }) => ({
  loading: loading.effects['login/adminLogin']
}))
class AdminLogin extends PureComponent<CustomFormProps, any> {
  constructor(props: CustomFormProps) {
    super(props)
  }

  public handleSubmit = debounce((event) => {
    event.persist();
    const { form: { validateFields }, dispatch } = this.props;

    validateFields((err, value) => {
      if(err) return;
      const { account, password } = value;

      const params: LoginParams = {
        user_name: account,
        password
      }

      dispatch({
        type: 'login/adminLogin',
        payload: params
      })
    })

  }, 500)

  public render() {
    const { form: { getFieldDecorator }, loading } = this.props;

    return (
      <div className={styles.login} onSubmit={this.handleSubmit}>
        <Card>
          <Form>
            <FormItem>
              {getFieldDecorator('account', { 
                getValueFromEvent: (event) => event.target.value.trim(),
                rules: [{ required: true, message: '请输入账号'}], 
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

export default Form.create()(AdminLogin);
