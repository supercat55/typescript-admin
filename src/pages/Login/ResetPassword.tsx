import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { FormComponentProps } from 'antd/lib/form';
import { Form, Input, Button, Divider, message } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import { formItemLayout, submitFormLayout } from '@/utils/config';
import REGEX from '@/utils/regex';

const FormItem = Form.Item;

interface LoginProps extends FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  loading: boolean;
}

@connect(({ loading }) => ({
  loading: loading.models['login'],
}))
class ResetPasswordPage extends PureComponent<LoginProps, any> {
  state = {
    id: this.props.match.params && this.props.match.params.id,
  }

  handleSubmit = (e: any) => {
    e.persist();
    const { id } = this.state;
    const { form, dispatch } = this.props;

    form.validateFields((err, values) => {
      if(err) return;
      const { password, secondPassword } = values;

      if (password !== secondPassword) {
        message.error('两次密码输入不一致');
        return;
      }

      const params = {
        password,
        userId: id
      }

      dispatch({
        type: 'login/restPassword',
        payload: params
      })
    })
  }

  handleCancel = () => {
    router.replace('/login');
  }

  render() {
    const { form: { getFieldDecorator }, loading } = this.props;

    return (
      <div onSubmit={this.handleSubmit} style={{ width: 800 }}>
        <h2 style={{ textAlign: 'center' }}>重置密码</h2>
        <Divider/>
        <Form {...formItemLayout} hideRequiredMark>
        <FormItem label="新密码">
            {getFieldDecorator('password', {
              rules: [
                {
                  required: true,
                  message: '请输入新密码',
                },
                {
                  pattern: REGEX.PASSWORD,
                  message: '密码格式不正确'
                }
              ],
            })(
              <Input.Password size="large" placeholder='请输入新密码'/>
            )}
          </FormItem>
          <FormItem label="确认密码">
            {getFieldDecorator('secondPassword', {
              rules: [
                {
                  required: true,
                  message: '请输入新密码',
                },
                {
                  pattern: REGEX.PASSWORD,
                  message: '密码格式不正确'
                }
              ],
            })(
              <Input.Password size="large" placeholder='至少6位字母或数字'/>
            )}
          </FormItem>
         <FormItem {...submitFormLayout}>
          <Button 
            size="large" 
            type="primary" 
            htmlType="submit" 
            loading={loading}
          >
            确定
          </Button>
          <Button size="large" style={{ marginLeft: 8 }} onClick={this.handleCancel}>
            取消
          </Button>
         </FormItem>
        </Form>
      </div>
    )
  }
};

export default Form.create()(ResetPasswordPage);

