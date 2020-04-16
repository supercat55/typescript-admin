import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import Link from 'umi/link';
import { FormComponentProps } from 'antd/lib/form';
import { Form, Icon, Input, Button } from 'antd';
import { connect } from 'dva';
import { StateType } from '@/models/login';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import { LoginParamsType } from '@/services/login';
import styles from './Login.scss';

const FormItem = Form.Item;

interface LoginProps extends FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  loading: boolean;
  userLogin: StateType
}

@connect(({ login, loading }) => ({
  userLogin: login,
  loading: loading.effects['login/login'],
}))
class LoginPage extends PureComponent<LoginProps, any> {
  componentDidMount() {
    this.handleGetCaptchaKey()
  }

  handleGetCaptchaKey = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'login/getCaptchaKey',
    })
  }

  @Bind()
  @Debounce(500)
  handleFreshCaptcha() {
    this.handleGetCaptchaKey();
  }

  handleSubmit = (e: any) => {
    e.persist();
    const { form, dispatch, userLogin: { captchaKey } } = this.props;

    form.validateFields((err, values) => {
      if(err) return;
      const { userName, password, code } = values;

      const params: LoginParamsType = {
        userName,
        password,
        code,
        id: captchaKey
      }

      dispatch({
        type: 'login/login',
        payload: params
      })
    })
  }

  handleForgotPassword = () => {
    console.log('忘记密码')
  }

  render() {
    const { form: { getFieldDecorator }, userLogin, loading } = this.props;
    const { captchaImage } = userLogin;

    return (
      <div className={styles.container} onSubmit={this.handleSubmit}>
        <Form>
          <FormItem>
            {
              getFieldDecorator('userName', {
                getValueFromEvent: event => event.target.value.trim(),
                rules: [{ required: true, message: '请输入登录用户名' }], 
              })(
                <Input 
                  size="large"
                  prefix={<Icon type="user" style={{ fontSize: '16px', color: 'rgba(0, 0, 0, .25)' }} />} 
                  placeholder="请输入用户编号/手机号"
                />
              )}
          </FormItem>
          <FormItem>
            {
              getFieldDecorator('password', {
                getValueFromEvent: event => event.target.value.trim(),
                rules: [{ required: true, message: '请输入登录密码' }],
              })(
                <Input 
                  type="password" 
                  prefix={<Icon type="lock" style={{ fontSize: '16px', color: 'rgba(0, 0, 0, .25)' }} />}  
                  size="large" 
                  placeholder="请输入登录密码" 
                />
              )
            }
          </FormItem>
          <FormItem>
            {
              getFieldDecorator('code', {
                getValueFromEvent: event => event.target.value.trim(),
                rules: [{ required: true, message: '请输入验证码!' }],
              })(
                <div className={styles.captcha}>
                  <Input size="large" placeholder="请输入验证码" />
                  <img 
                    src={captchaImage} 
                    className={styles.captchaImage}
                    onClick={this.handleFreshCaptcha}
                  />
                </div>
              )
            }
          </FormItem>
          <Link className={styles.forgot} to='/login/find-password'>忘记密码</Link>
          {/* <span className={styles.forgot}>忘记密码</span> */}
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
        <div className={styles.browserPrompt}>
          <div>为了更好的用户体验，建议您使用谷歌或火狐浏览器进入  「 社区服务平台 」。可点击这里下载 </div>
          <div className={styles.browserItem}>
            <a className={styles.btn} href="https://www.google.cn/chrome/" target="_Blank">
              <img src="http://wanjia.sh1a.qingstor.com/chrome-logo.png" alt="谷歌浏览器"/>
              </a>
            <a className={`${styles.btn} ${styles.otherBtn}`} href="http://www.firefox.com.cn/" target="_Blank">
              <img src="http://wanjia.sh1a.qingstor.com/firefox-logo.png" alt="火狐浏览器"/>
            </a>
          </div>
        </div>
      </div>
    )
  }
};

export default Form.create()(LoginPage);

