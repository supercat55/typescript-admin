import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Form, Input, Select, Spin, Button, Cascader, Radio } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import moment from 'moment';
import { StateType } from './model';
import { ResidentActionsType } from '@/services/info';
import PageWrapper from '@/components/PageWrapper';
import FooterToolbar from '@/components/FooterToolbar';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { formItemLayout } from '@/utils/config';
import { GENDER_TYPES, RESIDENT_RELATION_TYPES, IDENTITY_TYPES } from '@/utils/const';
import { GetUserBaseInfo } from '@/utils/cache';
import REGEX from '@/utils/regex';

const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;
const RadioGroup = Radio.Group;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  allCommunityListByMerchant: any[];
}

interface IState {
  mode: string;
  id: string;
}

@connect(({ loading, global, resident }) => ({
  pageLoading: loading.models['resident'],
  houseInfoCascader: resident.houseInfoCascader,
  allCommunityListByMerchant: global.allCommunityListByMerchant,
}))
class ResidentActionsPage extends PureComponent<IProps, IState> {
  state = {
    mode: 'create',
    id: this.props.match.params && this.props.match.params.id,
  }

  componentDidMount() {
    const urlParams = GetPageQuery();
    const mode = urlParams.mode ? urlParams.mode : '';

    this.setState({ mode }, this.init)
  }

  init = async() => {
    const { id, mode } = this.state;
    const { dispatch } = this.props;

    await dispatch({
      type: 'global/getAllCommunityListByMerchantId'
    })

    if (mode !== 'create' && id) {
      let result = await dispatch({
        type: 'resident/getResidentDetail',
        payload: { ownerInfoId: id }
      })
  
      if (result) {
        this.handleFullBaseInfo(result);
        this.handleCommunityChange(result['ownerInfo']['communityId']);
      }
    }
  }

  handleFullBaseInfo = result => {
    const { form } = this.props;
    const { ownerInfo } = result;

    const newDetail = {
      houseInfos: [ownerInfo.buildingNo, ownerInfo.unitNo, ownerInfo.accountNo]
    }

    const detail = Object.assign(ownerInfo, newDetail);

    Object.keys(form.getFieldsValue()).forEach(key => {
      let obj = {};
      obj[key] = detail[key];
      form.setFieldsValue(obj);
    });
  }

  handleSubmit = () => {
    const { mode, id } = this.state;
    const { form, dispatch } = this.props;
    const { merchantId } = GetUserBaseInfo();

    form.validateFields(async(err, values) => {
      if (err) return;

      const { 
        communityId,
        houseInfos,
        ownerName,
        ownerPhone,
        isOwner,
        sex,
        cardType,
        cardId,
        workUnit,
        postalAddress,
        nationality,
        houseRegister,
        remark,
      } = values;

      const params: ResidentActionsType = {
        merchantId,
        communityId,
        buildingNo: houseInfos[0],
        unitNo: houseInfos[1],
        accountNo: houseInfos[2],
        ownerName,
        ownerPhone,
        isOwner,
        sex
      }

      if (cardType >= 0) {
        params['cardType'] = cardType;
      }
      if (cardId) {
        params['cardId'] = cardId;
      }
      if (workUnit) {
        params['workUnit'] = workUnit;
      }
      if (postalAddress) {
        params['postalAddress'] = postalAddress;
      }
      if (nationality) {
        params['nationality'] = nationality;
      }
      if (houseRegister) {
        params['houseRegister'] = houseRegister;
      }
      if (remark) {
        params['remark'] = remark;
      }

      if (mode === 'edit' && id) {
        params['id'] = id;

        dispatch({
          type: 'resident/editResident',
          payload: params
        })
        return
      }
      dispatch({
        type: 'resident/createResident',
        payload: params
      })
    })
  }

  handleCommunityChange = async(value) => {
    const { dispatch }  = this.props
    
    dispatch({
      type: 'resident/getHouseInfoOptions',
      payload: {
        communityId: value
      }
    })
  }

  handleCancel = () => {
    router.goBack();
  }

  render() {
    const { mode } = this.state;
    const { pageLoading, form: { getFieldDecorator, getFieldValue }, allCommunityListByMerchant, houseInfoCascader } = this.props;
    
    const { merchantName } = GetUserBaseInfo();
    // form set必须要先已存在的值
    getFieldDecorator('merchantName', { initialValue: '' });
    const currentMerchant = getFieldValue('merchantName') ? getFieldValue('merchantName') : merchantName;
    const communityId = getFieldValue('communityId');

    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '住户')}
        showBack
        customBreadcrumbmap={[
          { name: '信息管理', url: '' },
          { name: '住户管理', url: '/info/resident' },
          { name: GetPageTitleByMode(mode, '住户') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form {...formItemLayout}>
            <FormItem label={'绑定商户'}>
              <Input value={currentMerchant} disabled/>
            </FormItem>
            <FormItem label={'所属小区'}>
              {getFieldDecorator('communityId', {
                rules: [{ required: true, message: '请选择所属小区' }]
              })(
                <Select 
                  placeholder="请输入所属小区" 
                  disabled={mode === 'detail'}
                  onChange={value => this.handleCommunityChange(value)}
                >
                  {
                    allCommunityListByMerchant.map(item => (
                      <Option key={item.id} value={item.id}>{item.communityName}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label={'楼/单元/户号'}>
              {getFieldDecorator('houseInfos', {
                rules: [{ required: true, message: '请选择楼/单元/户号' }]
              })(
                <Cascader 
                  disabled={!communityId || mode === 'detail'}
                  placeholder='请选择楼/单元/户号'
                  options={houseInfoCascader}
                />
              )}
            </FormItem>
            <FormItem label={'住户姓名'}>
              {getFieldDecorator('ownerName', {
                rules: [{ required: true, message: '请输入住户姓名' }]
              })(
                <Input placeholder='请输入住户姓名' disabled={mode === 'detail'}/>
              )}
            </FormItem>
            <FormItem label={'住户手机号'}>
              {getFieldDecorator('ownerPhone', {
                rules: [
                  { pattern: REGEX.MOBILE, message: '请输入正确格式手机号' },
                  { required: true, message: '请输入住户手机号' }
                ]
              })(
                <Input placeholder='请输入住户手机号' disabled={mode === 'detail'}/>
              )}
            </FormItem>
            <FormItem label={'关系标签'}>
              {getFieldDecorator('isOwner', {
                rules: [
                  { required: true, message: '请选择关系标签' }
                ]
              })(
                <Select placeholder="请选择关系标签" disabled={mode === 'detail'}>
                  {RESIDENT_RELATION_TYPES.map(item => (
                    <Option key={item.value} value={item.value}>{item.label}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label='性别'>
              {getFieldDecorator('sex', {
                initialValue: 1
              })(
                <RadioGroup disabled={mode === 'detail'}>
                  {GENDER_TYPES.map((item, index) => (
                    <Radio value={item.value} key={index}>{item.label}</Radio>
                  ))}
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label='证件类型'>
              {getFieldDecorator('cardType')(
                <Select placeholder="请选择证件类型" disabled={mode === 'detail'}>
                  {IDENTITY_TYPES.map(item => (
                    <Option key={item.value} value={item.value}>{item.label}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label='证件号码'>
              {getFieldDecorator('cardId')(
                <Input placeholder='请输入证件号码'  disabled={mode === 'detail'}/>
              )}
            </FormItem>
            <FormItem label='工作单位'>
              {getFieldDecorator('workUnit')(
                <Input placeholder='请输入工作单位' disabled={mode === 'detail'} />
              )}
            </FormItem>
            <FormItem label='通讯地址'>
              {getFieldDecorator('postalAddress')(
                <Input placeholder='请输入通讯地址' disabled={mode === 'detail'} />
              )}
            </FormItem>
            <FormItem label='国籍'>
              {getFieldDecorator('nationality')(
                <Input placeholder='请输入国籍' disabled={mode === 'detail'} />
              )}
            </FormItem>
            <FormItem label='户籍'>
              {getFieldDecorator('houseRegister')(
                <Input placeholder='请输入户籍' disabled={mode === 'detail'} />
              )}
            </FormItem>
            <FormItem label='备注'>
              {getFieldDecorator('remark')(
                <TextArea placeholder='请输入备注' disabled={mode === 'detail'} />
              )}
            </FormItem>
          </Form>  
          <FooterToolbar>
            {mode !== 'detail' && <Button type="primary" onClick={this.handleSubmit}>提交</Button>}
            <Button onClick={this.handleCancel}>{mode === 'edit' ? '取消' : '返回'}</Button>
          </FooterToolbar>
        </Spin>
      </PageWrapper>
    )
  }
};

export default Form.create()(ResidentActionsPage);
