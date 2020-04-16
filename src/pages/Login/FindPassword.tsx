import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { FormComponentProps } from 'antd/lib/form';
import { Form, Icon, Input, Button, Divider, Tooltip, message } from 'antd';
import { connect } from 'dva';
import { StateType } from '@/models/login';
import router from 'umi/router';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import { formItemLayout, submitFormLayout } from '@/utils/config';
import REGEX from '@/utils/regex';
import styles from './Login.scss';

const FormItem = Form.Item;

interface LoginProps extends FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  loading: boolean;
  userLogin: StateType
}

@connect(({ login, loading }) => ({
  userLogin: login,
  loading: loading.models['login'],
}))
class FindPasswordPage extends PureComponent<LoginProps, any> {
  state = {
    vcodeBtnDesc: '发送验证码',
    disabled: false
  }
  timer = null

  componentDidMount() {
    this.stopCountDown();
    this.handleGetCaptchaKey()
  }

  componentWillUnmount() {
    this.stopCountDown();
  }

  handleGetCaptchaKey = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'login/getCaptchaKey',
    })
  }

  handleSendVcode = async() => {
    const { form: { getFieldValue }, dispatch, userLogin: { captchaKey } } = this.props;
    const phoneNum = getFieldValue('phoneNum')
    const code = getFieldValue('code');

    if (!phoneNum) {
      message.warn('请输入手机号');
      return;
    }
    if (!REGEX.MOBILE.test(phoneNum)) {
      message.warn('手机号格式不正确');
      return;
    }
    if (!code) {
      message.warn('请输入图形验证码');
      return;
    }

    let validateResult = await dispatch({
      type: 'login/validateCaptch',
      payload: {
        code,
        id: captchaKey
      }
    })

    if (validateResult) {
      let result = await dispatch({
        type: 'login/sendVcode',
        payload: { phoneNum }
      })

      if (result) {
        message.success('发送验证码成功');

        this.setState({
          disabled: true
        }, this.startCountDown)
      }
    }
  }

  startCountDown = () => {
    let count = 60;

    this.timer = setInterval(() => {
      if (count <= 0) {
        this.stopCountDown();
      } else {
        this.setState({
          vcodeBtnDesc: `${--count}秒`
        });
      }
    }, 1000);
  }

  stopCountDown = () => {
    this.setState({
      disabled: false,
      vcodeBtnDesc: '发送验证码',
    });
    this.timer = null;
  }

  @Bind()
  @Debounce(500)
  handleFreshCaptcha() {
    this.handleGetCaptchaKey();
  }

  handleSubmit = (e: any) => {
    e.persist();
    const { form, dispatch } = this.props;

    form.validateFields((err, values) => {
      if(err) return;
      const { phoneNum, codeMessage } = values;

      const params = {
        phoneNum,
        codeMessage
      }

      dispatch({
        type: 'login/findPassword',
        payload: params
      })
    })
  }

  handleCancel = () => {
    router.goBack();
  }

  render() {
    const { vcodeBtnDesc, disabled } = this.state;
    const { form: { getFieldDecorator }, userLogin, loading } = this.props;
    const { captchaImage } = userLogin;

    return (
      <div onSubmit={this.handleSubmit} style={{ width: 800 }}>
        <h2 style={{ textAlign: 'center' }}>找回登录密码</h2>
        <Divider/>
        <Form {...formItemLayout} hideRequiredMark>
          <FormItem label='用户手机号'>
            {
              getFieldDecorator('phoneNum', {
                getValueFromEvent: event => event.target.value.trim(),
                rules: [
                  { required: true, message: '请输入手机号' },
                  { pattern: REGEX.MOBILE, message: '手机号格式不正确' }
                ], 
              })(
                <Input 
                  size="large"
                  placeholder="请输入手机号"
                />
              )}
          </FormItem>
          <FormItem label='图片验证码'>
            {
              getFieldDecorator('code', {
                getValueFromEvent: event => event.target.value.trim(),
                rules: [{ required: true, message: '请输入验证码' }],
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
          <FormItem label='短信验证码'>
            {
              getFieldDecorator('codeMessage', {
                getValueFromEvent: event => event.target.value.trim(),
                rules: [{ required: true, message: '请输入短信验证码' }],
              })(
                <div className={styles.captcha} style={{ position: 'relative' }}>
                  <Input size="large" placeholder="请输入短信验证码" />
                  <Button 
                    disabled={disabled}
                    className={styles.captchaImage} 
                    onClick={this.handleSendVcode}
                  >
                    {vcodeBtnDesc}
                  </Button>
                  <Tooltip placement="top" title={'如果1分钟没有收到短信验证码，请重新获取验证码！'}>
                    <Icon type="info-circle" theme="filled" style={{ position: 'absolute', right: '-40px', fontSize: '14px', color: '#1890FF' }}/>
                  </Tooltip>
                </div>
              )
            }
          </FormItem>
         <FormItem {...submitFormLayout}>
          <Button 
            size="large" 
            type="primary" 
            htmlType="submit" 
            loading={loading}
          >
            下一步
          </Button>
          <Button size="large" style={{ marginLeft: 8 }} onClick={this.handleCancel}>
            取 消
          </Button>
         </FormItem>
        </Form>
      </div>
    )
  }
};

export default Form.create()(FindPasswordPage);

