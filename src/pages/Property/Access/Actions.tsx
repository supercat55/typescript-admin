import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import moment from 'moment';
import { connect } from 'dva';
import { Form, Input, Select, Spin, Tooltip, Icon, Button, Cascader, InputNumber, DatePicker } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import { AccessActionsType } from '@/services/access';
import PageWrapper from '@/components/PageWrapper';
import FooterToolbar from '@/components/FooterToolbar';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { formItemLayout } from '@/utils/config';
import { RESIDENT_RELATION_TYPES, ACCESS_TYPES } from '@/utils/const';
import REGEX from '@/utils/regex';

const CityData = require('@/utils/city.json');

const FormItem = Form.Item;
const { Option } = Select;

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

@connect(({ menu, loading, global, access }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  pageLoading: loading.models['access'],
  houseInfoCascader: access.houseInfoCascader,
  allCommunityListByMerchant: global.allCommunityListByMerchant,
}))
class AccessActionsPage extends PureComponent<IProps, IState> {
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

    if (id && mode !== 'create') {
      let result = await dispatch({
        type: 'access/getAccessDetail',
        payload: { id }
      })

      if (result) {
        this.handleCommunityChange(result['communityId']);
        this.handleFullBaseInfo(result)
      }
    }
  }

  handleFullBaseInfo = detail => {
    const { form } = this.props;
    const { province, city, area, buildingNo, unitNo, houseId } = detail;

    const newObj = {
      address: [province, city, area],
      houseInfos: [buildingNo, unitNo, houseId],
      accessTime: detail.accessTime ? moment(detail.accessTime) : null  
    }
    const newDetail = Object.assign(detail, newObj)
    
    Object.keys(form.getFieldsValue()).forEach(key => {
      let obj = {};
      obj[key] = newDetail[key];
      form.setFieldsValue(obj);
    });
  }

  handleCommunityChange = value => {
    const { dispatch }  = this.props
    
    dispatch({
      type: 'access/getHouseInfoOptions',
      payload: {
        communityId: value
      }
    })
  }

  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { 
        ownerName,
        ownerPhone,
        isOwner,
        cardId,
        accessType,
        communityId,
        houseInfos,
        carNumber,
        reason,
        address,
        temperature,
        symptom,
        accessTime,
        operatorName,
      } = values;

      const params: AccessActionsType = {
        ownerName,
        ownerPhone,
        isOwner,
        accessType,
        communityId,
        houseId: houseInfos[2],
        reason,
        symptom,
        accessTime: accessTime.unix() * 1000,
        operatorName,
      }

      if (cardId) {
        params['cardId'] = cardId;
      }
      if (carNumber) {
        params['carNumber'] = carNumber;
      }
      if (address && address.length) {
        params['province'] = address[0];
        params['city'] = address[1];
        params['area'] = address[2];
      }
      if (temperature) {
        params['temperature'] = temperature;
      }

      dispatch({
        type: 'access/createAccess',
        payload: params
      })
    })
  }

  handleCancel = () => {
    router.goBack();
  }

  render() {
    const { mode } = this.state;
    const { pageLoading, form: { getFieldValue, getFieldDecorator }, allCommunityListByMerchant, houseInfoCascader } = this.props;
    const communityId = getFieldValue('communityId');

    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '出入记录')}
        showBack
        customBreadcrumbmap={[
          { name: '物业服务管理', url: '' },
          { name: '出入记录管理', url: '/property/access' },
          { name: GetPageTitleByMode(mode, '出入记录') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form {...formItemLayout} onSubmit={this.handleSubmit}>
            <FormItem label={'姓名'}>
              {getFieldDecorator('ownerName',{
                rules: [
                  { required: true, message: '姓名不能为空' },
                  { max: 10, message: '姓名不能超过10个字' }
                ]
              })(
                <Input disabled={mode !== 'create'} placeholder="请输入姓名" autoComplete="off"/>
              )}
            </FormItem>
            <FormItem label={'手机号'}>
              {getFieldDecorator('ownerPhone', {
                getValueFromEvent: (event) => event.target.value.trim(),
                rules: [
                  { required: true, message: '手机号不能为空' },
                  { pattern: REGEX.MOBILE, message: '手机号格式不正确' },
                ]
              })(
                <Input disabled={mode === 'detail'} placeholder="请输入手机号" autoComplete="off"/>
              )}
            </FormItem>
            <FormItem label={'身份'}>
              {getFieldDecorator('isOwner', {
                rules: [
                  { required: true, message: '请选择身份' }
                ]
              })(
                <Select placeholder="请选择身份" disabled={mode === 'detail'}>
                  {RESIDENT_RELATION_TYPES.map(item => (
                    <Option key={item.value} value={item.value}>{item.label}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label={'身份证号'}>
              {getFieldDecorator('cardId')(
                <Input disabled={mode !== 'create'} placeholder="请输入身份证号" autoComplete="off"/>
              )}
            </FormItem>
            <FormItem label={'出入类型'}>
              {getFieldDecorator('accessType', {
                rules: [
                  { required: true, message: '请选择出入类型' }
                ]
              })(
                <Select placeholder="请选择出入类型" disabled={mode !== 'create'}>
                  {ACCESS_TYPES.map(item => (
                    <Option key={item.value} value={item.value}>{item.label}</Option>
                  ))}
                </Select>
              )}
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
            <FormItem label={'车牌号码'}>
              {getFieldDecorator('carNumber')(
                <Input disabled={mode !== 'create'} placeholder="请输入车牌号码" autoComplete="off"/>
              )}
            </FormItem>
            <FormItem label={'出入原因'}>
              {getFieldDecorator('reason',{
                rules: [
                  { required: true, message: '出入原因不能为空' },
                ]
              })(
                <Input disabled={mode !== 'create'} placeholder="请输入出入原因" autoComplete="off"/>
              )}
            </FormItem>
            <FormItem label={'来源/目的省市'}>
              {getFieldDecorator('address')(
                <Cascader 
                  options={CityData} 
                  disabled={mode !== 'create'}
                  placeholder="请选择小区省/市/区" 
                  fieldNames={{ label: 'name', value: 'name' }}
                />
              )}
            </FormItem>
            <FormItem label={'体温(摄氏度)'}>
              {getFieldDecorator('temperature')(
                <InputNumber 
                  min={0}
                  placeholder='请输入体温'
                  style={{ width: '100%' }}
                  disabled={mode !== 'create'}
                />
              )}
            </FormItem>
            <FormItem label={'症状'}>
              {getFieldDecorator('symptom', {
                rules: [{ required: true, message: '请输入症状' }]
              })(
                <Input disabled={mode !== 'create'} placeholder="请输入症状" autoComplete="off"/>
              )}
            </FormItem>
            <FormItem label={'出入登记时间'}>
              {getFieldDecorator('accessTime', {
                rules: [{ required: true, message: '请选择出入登记时间' }]
              })(
                <DatePicker style={{ width: '100%' }} showTime disabled={mode !== 'create'} placeholder="请选择出入登记时间"/>
              )}
            </FormItem>
            <FormItem label={'记录人姓名'}>
              {getFieldDecorator('operatorName',{
                rules: [
                  { required: true, message: '记录人姓名不能为空' },
                  { max: 10, message: '记录人姓名姓名不能超过10个字' }
                ]
              })(
                <Input disabled={mode !== 'create'} placeholder="请输入记录人姓名" autoComplete="off"/>
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

export default Form.create()(AccessActionsPage);
