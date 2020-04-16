import React, { Component } from 'react';
import { Form, Input, Modal, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import REGEX from '@/utils/regex';

const FormItem = Form.Item;

export interface ChangePassWordProps extends FormComponentProps {
  visible: boolean;
  submitLoading: boolean;
  modalOk: (params: any) => void;
  cancel: () => void;
}

class ChangePassWordView extends Component<ChangePassWordProps, any> {
  handleSubmit = () => {
    const { form, modalOk } = this.props;

    form.validateFields((err, values) => {
      if (err) {
        message.warn('提交失败，请检查是否有必填项尚未填写');
        return;
      }

      const { originalPassword, password } = values;

      modalOk({
        originalPassword,
        password
      });
    });
  }

  render() {
    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };

    const { visible, form, cancel, submitLoading } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Modal 
        visible={visible}
        title="修改密码"
        destroyOnClose
        okText={'确定'}
        cancelText={'取消'}
        onCancel={cancel}
        onOk={this.handleSubmit}
        confirmLoading={submitLoading}
      >
        <Form hideRequiredMark onSubmit={this.handleSubmit}>
          <FormItem label="原始密码" {...formLayout}>
            {getFieldDecorator('originalPassword', {
              rules: [
                {
                  required: true,
                  message: '请输入原始密码',
                },
                {
                  pattern: REGEX.PASSWORD,
                  message: '原始密码格式不正确'
                }
              ],
            })(
              <Input.Password placeholder='请输入原始密码'/>
            )}
          </FormItem>
          <FormItem label="确认密码" {...formLayout}>
            {getFieldDecorator('password', {
              rules: [
                {
                  required: true,
                  message: '请输入新密码',
                },
                {
                  pattern: REGEX.PASSWORD,
                  message: '新密码格式不正确'
                }
              ],
            })(
              <Input.Password placeholder='请输入修改密码'/>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create<ChangePassWordProps>()(ChangePassWordView);
