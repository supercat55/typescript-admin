import React, { Component, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { isEqual, isEmpty } from 'lodash';
import { Form, Input, InputNumber, Select, Modal, Button } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { connect } from 'dva';
import { formItemLayout } from '@/utils/config';
import { CHARGE_MODE_TYPES, AREA_TYPES, AMOUNT_ACCURACY } from '@/utils/const';
import { GetPageTitleByMode } from '@/utils/utils';
import REGEX from '@/utils/regex';

const FormItem = Form.Item;
const Option = Select.Option;

export interface BillTemplateModalProps extends FormComponentProps {
  dispatch?: Dispatch<AnyAction>;
  visible: boolean;
  mode: string;
  defaultDtail?: string; 
  allFeeTypeList?: any[];
  onConfirm?: (values: any) => void;
  onCancel?: () => void;
}

@connect(({ menu, loading, global }) => ({
  allFeeTypeList: global.allFeeTypeList,
}))
class BillTemplateModal extends Component<BillTemplateModalProps, any> {
  constructor(props) {
    super(props)

    this.state = {
      defaultDtail: props.defaultDtail ? props.defaultDtail : {},
      mode: props.mode ? props.mode : 'create',
    }
  }

  // //判断修改后的value和form组件传入的value是否一样
  // static getDerivedStateFromProps(nextProps, preState) {
  //   if (isEqual(nextProps.defaultDtail, preState.defaultDtail) && isEqual(nextProps.mode, preState.mode)) {
  //     return null;
  //   }

  //   return {
  //     defaultDtail: nextProps.defaultDtail,
  //     mode: nextProps.mode,
  //   }
  // }

  componentDidMount() {
    this.init();
  }

  init = async() => {
    const { defaultDtail } = this.state;
    const { dispatch } = this.props;

    await dispatch({
      type: 'global/getAllFeeTypeList'
    })

    if (!isEmpty(defaultDtail)) {
      this.handleFullBaseInfo(defaultDtail);
    }
  }
  handleFullBaseInfo = result => {
    const { form } = this.props;

    Object.keys(form.getFieldsValue()).forEach(key => {
      let obj = {};
      obj[key] = result[key];
      form.setFieldsValue(obj);
    });
  }

  handleOk = () => {
    const { form: { validateFields }, onConfirm } = this.props;

    validateFields((err, values) => {
      if (err) return;

      onConfirm(values);
    })
  }

  handleCancel = () => {
    this.props.onCancel();
  }

  render() {
    const { mode } = this.state;
    const { visible, form: { getFieldDecorator, getFieldValue }, allFeeTypeList } = this.props
    const chargeMode = getFieldValue('chargeMode') !== undefined ? getFieldValue('chargeMode') : 1;

    const footer = mode === 'detail' ? 
    [(
      <Button key="back" onClick={this.handleCancel}>
        返回
      </Button> 
    )] : 
    [(
      <Fragment>
        <Button key="back" onClick={this.handleCancel}>
          取消
        </Button>
        <Button key="submit" type="primary" onClick={this.handleOk}>
          确定
        </Button>
      </Fragment>
    )]

    const areaTypeSelector = getFieldDecorator('areaType', { initialValue: 1 })
    (
      <Select disabled={mode === 'detail'}>
        {AREA_TYPES.map(item => (
          <Option value={item.value} key={item.value}>{item.label}</Option>
        ))}
      </Select>
    )

    return (
      <Modal
        width={1000}
        visible={visible}
        title={GetPageTitleByMode(mode, '计费模版')}
        destroyOnClose
        closable={false}
        maskClosable={false}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        footer={footer}
      >
        <Form {...formItemLayout}>
          <FormItem label={'模版名称'}>
            {getFieldDecorator('modelName', {
              rules: [
                { required: true, message: '计费模版名称不能为空' },
                { max: 10, message: '不可超过10个字' }
              ]
            })(
              <Input placeholder="不可超过10个字" disabled={mode === 'detail'}/>
            )}
          </FormItem>
          <FormItem label={'费用类型'}>
            {getFieldDecorator('feeTypeId',{
              rules: [
                { required: true, message: '请选择费用类型' },
              ]
            })(
              <Select placeholder="请选择费用类型" disabled={mode === 'detail'}>
                {allFeeTypeList.map(item => (
                  <Option value={item.id} key={item.id}>{item.feeName}</Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem label={'计费模式'}>
            {getFieldDecorator('chargeMode',{
              initialValue: 1,
              rules: [
                { required: true, message: '请选择计费模式' },
              ]
            })(
              <Select placeholder="请选择计费模式" disabled={mode === 'detail'}>
                {CHARGE_MODE_TYPES.map(item => (
                  <Option value={item.value} key={item.value}>{item.label}</Option>
                ))}
              </Select>
            )}
          </FormItem>
          {
            chargeMode === 1 ?
            <FormItem label={'计费公式'}>
              {getFieldDecorator('totalPrice', {
                rules: [
                  { required: true, message: '总价不能为空' },
                ]
              })(
                <InputNumber placeholder="请输入总价" min={0} style={{ width: '100%' }} disabled={mode === 'detail'}/>
              )}
            </FormItem> : 
            <FormItem label={'计费公式'}>
              {getFieldDecorator('unitPrice', {
                rules: [
                  { required: true, message: '单价不能为空' },
                  { pattern: REGEX.POSITIVE_FLOAT, message: '单价必须为数字' }
                ]
              })(
                <Input style={{ width: '100%' }} addonBefore={areaTypeSelector} placeholder={chargeMode === 2 ? '请输入月单价' : '请输入日单价'} disabled={mode === 'detail'}/>
              )}
            </FormItem>
          }     
          <FormItem label={'精确程度'}>
            {getFieldDecorator('rule',{
              initialValue: 1,
              rules: [
                { required: true, message: '请选择精确程度' },
              ]
            })(
              <Select placeholder="请选择精确程度" disabled={mode === 'detail'}>
                {AMOUNT_ACCURACY.map(item => (
                  <Option value={item.value} key={item.value}>{item.label}</Option>
                ))}
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
};

export default Form.create<BillTemplateModalProps>()(BillTemplateModal);
