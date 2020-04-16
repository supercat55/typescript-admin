import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Form, Input, Select, Spin, Button, Tooltip, Icon } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import PageWrapper from '@/components/PageWrapper';
import FooterToolbar from '@/components/FooterToolbar';
import SearchMerchantModal from '@/components/SearchMerchantModal';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { formItemLayout } from '@/utils/config';
import { SMS_TEMP_TYPES } from '@/utils/const';

const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  allFeeTypeList: any[]
}

interface IState {
  mode: string;
  id: string;
  fieldList: string[];
  visible: boolean;
}

@connect(({ loading, sms }) => ({
  pageLoading: loading.models['sms'],
  smsFeeTypeList: sms.smsFeeTypeList,
}))
class SMSActionsPage extends PureComponent<IProps, IState> {
  state = {
    mode: 'create',
    id: this.props.match.params && this.props.match.params.id,
    fieldList: ['小区名称', '楼号', '单元号', '户号', '账单名称', '账单金额', '待缴金额', '来源场景', '费用类型', '房屋唯一编号', '小区服务电话'],
    visible: false
  }

  private ref;


  componentDidMount() {
    const urlParams = GetPageQuery();
    const mode = urlParams.mode ? urlParams.mode : '';

    this.setState({ mode }, this.init)
  }

  init = async() => {
    const { id, mode } = this.state;
    const { dispatch } = this.props;

    if (mode !== 'create' && id) {
      let result = await dispatch({
        type: 'sms/getSMSTemplateDetail',
        payload: { templateId: id }
      })
  
      if (result) {
        this.handleFullBaseInfo(result);
        this.handleGetFeeTypeList(result['merchantId'])
      }
    }
  }

  handleGetFeeTypeList = async(merchantId) => {
    const { dispatch } = this.props;

    await dispatch({
      type: 'sms/getSMSFeeTypeList',
      payload: { merchantId }
    })
  }

  handleFullBaseInfo = result => {
    const { form } = this.props;

    Object.keys(form.getFieldsValue()).forEach(key => {
      let obj = {};
      obj[key] = result[key];
      form.setFieldsValue(obj);
    });
  }

  handleSubmit = () => {
    const { mode, id } = this.state;
    const { form, dispatch } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { merchantId, templateType, feeTypeId, templateContent } = values;

      const params = {
        merchantId,
        templateType,
        feeTypeId,
        templateContent
      }

      if (mode === 'edit' && id) {
        params['templateId'] = id;

        dispatch({
          type: 'sms/editSMSTemplate',
          payload: params
        })
        return
      }
      dispatch({
        type: 'sms/createSMSTemplate',
        payload: params
      })
    })
  }

  // 选择商户modal确认事件
  handleMerchantModalOk = (selectedRowKeys, selectedRow) => {
    const { form: { setFieldsValue } } = this.props;
    const { merchantName, id } = selectedRow[0];

    setFieldsValue({ 
      merchantId: id,
      merchantName
    })
    this.handleGetFeeTypeList(id);
    this.handleMerchantModalCancel();
  }

  // 选择商户modal取消事件
  handleMerchantModalCancel = () => {
    this.setState({
      visible: false
    })
  }

  handleFieldClick = value => {
    const { getFieldValue, setFieldsValue } = this.props.form;
    let content = getFieldValue('templateContent') || '';

    setFieldsValue({
      templateContent: `${content}#${value}#`
    })

    this.ref.focus();
  }

  handleCancel = () => {
    router.goBack();
  }

  render() {
    const { mode, visible, fieldList } = this.state;
    const { pageLoading, form: { getFieldDecorator }, smsFeeTypeList } = this.props;
    const feeTypeList = [{ id: '1', feeName: '通用'}].concat(smsFeeTypeList);
    // form set必须要先已存在的值
    getFieldDecorator('merchantId', { initialValue: '' });

    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '短信模板')}
        showBack
        customBreadcrumbmap={[
          { name: '参数管理', url: '' },
          { name: '短信模板管理', url: '/parameter/sms-audit' },
          { name: GetPageTitleByMode(mode, '短信模板') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form {...formItemLayout}>
            {
              mode === 'detail' &&
              <FormItem label={'模板序号'}>
                {getFieldDecorator('templateId')(
                  <Input disabled/>
                )}
              </FormItem>
            }
            <FormItem label={'发布范围'}>
              {getFieldDecorator('merchantName', {
                rules: [{ required: true, message: '请选择发布范围' }]
              })(
                <Input
                  readOnly
                  placeholder="点击搜索绑定商户"
                  disabled={mode === 'detail'}
                  onClick={() =>
                    this.setState({
                      visible: true
                    })
                  }
                />
              )}
            </FormItem>
            <FormItem label={'短信模板类型'}>
              {getFieldDecorator('templateType', {
                rules: [{ required: true, message: '请选择短信模板类型' }]
              })(
                <Select placeholder="请选择短信模板类型" disabled={mode === 'detail'}>
                  {SMS_TEMP_TYPES.map(item => (
                    <Option key={item.value} value={item.value}>{item.label}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label={'费用类型'}>
              {getFieldDecorator('feeTypeId', {
                initialValue: '1',
                rules: [{ required: true, message: '请选择费用类型' }]
              })(
                <Select placeholder="请选择费用类型" disabled={mode === 'detail'}>
                  {feeTypeList.map(item => (
                    <Option key={item.id} value={item.id}>{item.feeName}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label={'短信模板内容'}>
              {getFieldDecorator('templateContent', {
                rules: [{ required: true, message: '请输入短信模板内容' }]
              })(
                <TextArea rows={4} disabled={mode === 'detail'} placeholder="请输入..." ref={node => this.ref = node}/>
              )}
              <Tooltip placement="top" title={'字数超过70个汉字可能分成多条短信发送'}>
                <Icon type="info-circle" theme='filled' style={{ position: 'absolute', right: '-30px', top: '-50px', fontSize: '14px', color: '#1890FF' }}/>
              </Tooltip>
            </FormItem>
            {
              mode !== 'detail' &&
              <FormItem label={'选择字段带入正文'}>
                {getFieldDecorator('field')(
                  <div>
                    {
                      fieldList.map(item => (
                        <Button 
                          type="dashed" 
                          key={item} 
                          style={{ margin: '0 22px 10px 0'}}
                          onClick={() => this.handleFieldClick(item)}
                        >
                          {item}
                        </Button>
                      ))
                    }
                  </div>
                )}
              </FormItem>
            }
          </Form>  
          <FooterToolbar>
            {mode !== 'detail' && <Button type="primary" onClick={this.handleSubmit}>提交</Button>}
            <Button onClick={this.handleCancel}>{mode === 'edit' ? '取消' : '返回'}</Button>
          </FooterToolbar>

          <SearchMerchantModal
            visible={visible}          
            childMerchant
            onConfirm={this.handleMerchantModalOk}
            onCancel={this.handleMerchantModalCancel}
          />
        </Spin>
      </PageWrapper>
    )
  }
};

export default Form.create()(SMSActionsPage);
