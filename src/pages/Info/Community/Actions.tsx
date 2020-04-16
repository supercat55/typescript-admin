import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Form, Card, Row, Col, Input, Select, Spin, Tabs, Switch, Button, Cascader, InputNumber, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import { CommunityActionsType } from '@/services/info';
import PageWrapper from '@/components/PageWrapper';
import FooterToolbar from '@/components/FooterToolbar';
import SearchMerchantModal from '@/components/SearchMerchantModal';
import TableForm from './TableForm';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { COMMUNITY_TYPES, COMMUNITY_VALID_TYPES } from '@/utils/const';
import { GetUserBaseInfo } from '@/utils/cache';
import REGEX from '@/utils/regex';

const CityData = require('@/utils/city.json');
const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;
const TabPane = Tabs.TabPane;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
}

interface IState {
  mode: string;
  id: string;
  activeKey: string;
  merchantModalVisible: boolean;
}

@connect(({ loading }) => ({
  pageLoading: loading.models['community'],
}))
class CommunityActionsPage extends PureComponent<IProps, IState> {
  state = {
    mode: 'create',
    id: this.props.match.params && this.props.match.params.id,
    activeKey: null,
    merchantModalVisible: false
  }

  index = 0;

  componentDidMount() {
    const urlParams = GetPageQuery();
    const mode = urlParams.mode ? urlParams.mode : '';

    this.setState({ mode }, this.init)
  }

  init = async() => {
    const { id, mode } = this.state;
    const { dispatch } = this.props;
    const { loginType, merchantType } = GetUserBaseInfo();
    
    if (mode !== 'create' && id) {
      let result = await dispatch({
        type: 'community/getCommunityDetail',
        payload: { communityId: id }
      })
  
      if (result) {
        this.handleFullBaseInfo(result);
      }
    } else {
      if (loginType === 'merchant' && merchantType !== 2) {
        this.handleAddMerchant();
      }
    }
  }

  handleFullBaseInfo = result => {
    const { form } = this.props;
    const { address, community, communityServices } = result;
    const newCommunityServices = communityServices.map(item => ({...item}))
    const { province, city, area, street, longItude, latItude } = address
    const cityInfo = [province, city, area];

    const addressObj = {
      address: cityInfo,
      ...address,
      merchantList: newCommunityServices,
    }

    const detail = Object.assign(addressObj, community)

    this.setState({
      activeKey: communityServices && communityServices.length ? communityServices[0].id : null
    })

    Object.keys(form.getFieldsValue()).forEach(key => {
      let obj = {};
      obj[key] = detail[key];
      form.setFieldsValue(obj);
    });
  }

  handleSubmit = () => {
    const { mode, id } = this.state;
    const { form, dispatch } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { 
        communityName,
        communityType,
        isValite,
        address,
        street,
        longItude,
        latItude,
        housesTotal,
        greenSpace,
        overGroundParkingTotal,
        overGroundParkingSells,
        overGroundParkingLeases,
        underGroundParkingTotal,
        underGroundParkingSells,
        underGroundParkingLeases,
        communityServices
      } = values;

      let serviceList = [];

      const params: CommunityActionsType = {
        communityName,
        communityType,
        isValite,
        province: address[0],
        city: address[1],
        area: address[2],
        street,
        communityServices
      }

      if (longItude) {
        params['longItude'] = longItude
      }
      if (latItude) {
        params['latItude'] = latItude
      }
      if (housesTotal) {
        params['housesTotal'] = housesTotal
      }
      if (greenSpace) {
        params['greenSpace'] = greenSpace
      }
      if (overGroundParkingTotal) {
        params['overGroundParkingTotal'] = overGroundParkingTotal
      }
      if (overGroundParkingSells) {
        params['overGroundParkingSells'] = overGroundParkingSells
      }
      if (overGroundParkingLeases) {
        params['overGroundParkingLeases'] = overGroundParkingLeases
      }
      if (underGroundParkingTotal) {
        params['underGroundParkingTotal'] = underGroundParkingTotal
      }
      if (underGroundParkingSells) {
        params['underGroundParkingSells'] = underGroundParkingSells
      }
      if (underGroundParkingLeases) {
        params['underGroundParkingLeases'] = underGroundParkingLeases
      }
      if (communityServices && communityServices.length) {
        for (let i in communityServices) {
          let item = communityServices[i];
          let merchantItem = {
            merchantId: item.merchantId,
            isSend: item.isSend ? 1 : 0,
            isSendWarn: item.isSendWarn ? 1 : 0,
            responsibleName: item.responsibleName,
            responsiblePhone: item.responsiblePhone,
            responsibleCard: item.responsibleCard,
            areaPhone: item.areaPhone
          }
          if (mode === 'edit' && item.id) {
            merchantItem['id'] = item.id
          }

          if (item.remark) {
            merchantItem['remark'] = item.remark
          }
          if (item.financeName) {
            merchantItem['financeName'] = item.financeName
          }
          if (item.financePhone) {
            merchantItem['financePhone'] = item.financePhone
          }
          if (item.financeCard) {
            merchantItem['financeCard'] = item.financeCard
          }
          if (item.payees && item.payees.length) {
            let payeesItem = [];

            for (let j in item.payees) {
              let result = {
                payeeName: item.payees[j].payeeName,
                payeePhone: item.payees[j].payeePhone,
                isMessage: item.payees[j].isMessage ? 1 : 0,
              }

              // 编辑下收款员存在id并且id不是新增时按照规律给的id
              if (mode === 'edit' && item.payees[j].id && item.payees[j].id.indexOf('NEW_TEMP_ID') === -1) {
                result['payeeId'] = item.payees[j].id;
                result['id'] = item.payees[j].id
              }
              payeesItem.push(result)
            }

            merchantItem['payees'] = payeesItem
          }

          serviceList.push(merchantItem);
        }

        params['communityServices'] = serviceList
      }

      if (mode === 'edit' && id) {
        params['id'] = id;

        dispatch({
          type: 'community/editCommunity',
          payload: params
        })
        return
      }
      dispatch({
        type: 'community/createCommunity',
        payload: params
      })
    })
  }

  // 选择商户modal确认事件
  handleMerchantModalOk = (selectedRowKeys, selectedRow) => {
    const { activeKey } = this.state;
    const { form: { getFieldValue, setFieldsValue } } = this.props;
    const { merchantName, id } = selectedRow[0];

    const merchantList = getFieldValue('merchantList');
    const communityServices = getFieldValue('communityServices');
    const newCommunityServices = communityServices.map(item => ({ ...item }));
    
    const flag = newCommunityServices.some(item => item.merchantId === id);

    if (flag) {
      message.warn("该商户已添加", 1);
      return;
    }

    // 查找communityServices 所在Index
    for (let i in merchantList) {
      if (merchantList[i].id === activeKey) {
        newCommunityServices[i].merchantName = merchantName;
        newCommunityServices[i].merchantId = id;
      }
    }

    setFieldsValue({ 
      communityServices: newCommunityServices 
    })
    this.handleMerchantModalCancel();
  }

  // 选择商户modal取消事件
  handleMerchantModalCancel = () => {
    this.setState({
      merchantModalVisible: false
    })
  }

  // 业务信息新增商户
  handleAddMerchant = () => {
    const { form: { getFieldValue, setFieldsValue } } = this.props;

    const merchantList = getFieldValue('merchantList');
    const newMerchantList = merchantList.map(item => ({ ...item }));
    const activeKey = `NEW_MERCHANT_${this.index++}`;

    this.setState({
      activeKey
    });

    newMerchantList.push({ 
      id: activeKey,
    });

    setFieldsValue({ merchantList: newMerchantList })
  }

  handleTabChange = activeKey => {
    this.setState({ activeKey });
  }

  handleTabRemove = (targetKey, action) => {
    const { form: { getFieldValue, setFieldsValue } } = this.props;

    const merchantList = getFieldValue('merchantList');
    const newMerchantList = merchantList.map(item => ({ ...item }));

    if (action === 'remove') {
      const filterMerchantList = newMerchantList.filter(item => item.id !== targetKey)
      
      setFieldsValue({
        merchantList: filterMerchantList
      });

      if (filterMerchantList.length) {
        this.setState({
          activeKey: filterMerchantList[0].id
        })
      }
    }
  }

  // 根据省市区和详细地址获取经纬度
  handleAddressChange = async(type, value) => {
    const { dispatch, form: { getFieldValue, setFieldsValue } } = this.props;
    const address = getFieldValue('address');

    if (address && address.length > 0 && type === 'street' && value) {
      let str = `${address.join('')}${value}`;

      let result = await dispatch({
        type: 'global/getLngLatByAddress',
        payload: str
      })

      if (result) {
        setFieldsValue({
          longItude: result['lng'],
          latItude: result['lat'],
        })
      }
    }
  }

  handleCancel = () => {
    router.goBack();
  }

  /**
   * antd form组件如果要使用数组对象做双向绑定时，需要单独一个数组作为遍历渲染，另一个存储数据值，
   * 否则会报错，因为当初始化时空数组并不知道要绑定的是那一项的value
   * 
   * 参考文档 https://ant.design/components/form-cn/#components-form-demo-dynamic-form-item （动态增减表单项）
   */
  render() {
    const { mode, activeKey, merchantModalVisible } = this.state;
    const { pageLoading, form: { getFieldDecorator, getFieldValue } } = this.props;
    console.log(pageLoading);
    const { loginType, merchantType } = GetUserBaseInfo();
    getFieldDecorator('merchantList', { initialValue: [] })
    const merchantList = getFieldValue('merchantList');

    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '小区')}
        showBack
        customBreadcrumbmap={[
          { name: '信息管理', url: '' },
          { name: '小区管理', url: '/info/community' },
          { name: GetPageTitleByMode(mode, '小区') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form>
            <Card title={'小区基本信息'} bordered={false}>
              <Row gutter={40}>
                <Col span={8}>
                  <FormItem label={'小区名称'}>
                    {getFieldDecorator('communityName', {
                      rules: [{ required: true, message: '小区名称不能为空' }]
                    })(
                      <Input placeholder="请输入小区名称" disabled={mode === 'detail'}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'小区类型'}>
                    {getFieldDecorator('communityType', {
                      rules: [{ required: true, message: '请选择小区类型' }]
                    })(
                      <Select placeholder="请输入小区类型" disabled={mode === 'detail'}>
                        {
                          COMMUNITY_TYPES.map(item => (
                            <Option key={item.value} value={item.value}>{item.label}</Option>
                          ))
                        }
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'是否验证'}>
                    {getFieldDecorator('isValite', {
                      initialValue: 0,
                      rules: [{ required: true, message: '请选择验证类型' }]
                    })(
                      <Select placeholder="请输入小区类型" disabled={mode === 'detail'}>
                        {
                          COMMUNITY_VALID_TYPES.map(item => (
                            <Option key={item.value} value={item.value}>{item.label}</Option>
                          ))
                        }
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label={'省/市/区'}>
                    {getFieldDecorator('address', {
                      rules: [{ required: true, message: '请选择小区所在省/市/区' }]
                    })(
                      <Cascader 
                        options={CityData} 
                        disabled={mode === 'detail'}
                        placeholder="请选择小区省/市/区" 
                        fieldNames={{ label: 'name', value: 'name' }}
                        onChange={value => this.handleAddressChange('address', value)}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label={'详细地址'}>
                    {getFieldDecorator('street', {
                      rules: [{ required: true, message: '小区详细地址不能为空' }]
                    })(
                      <TextArea 
                        rows={2} 
                        placeholder="请输入小区详细地址" 
                        disabled={mode === 'detail'}
                        onChange={e => this.handleAddressChange('street', e.target.value)}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label={'经度'}>
                    {getFieldDecorator('longItude')(
                      <Input disabled placeholder="根据小区地址自动得出经度"/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label={'纬度'}>
                    {getFieldDecorator('latItude')(
                      <Input disabled placeholder="根据小区地址自动得出纬度"/>
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem label={'房屋总数'}>
                    {getFieldDecorator('housesTotal')(
                      <InputNumber 
                        min={0}
                        precision={0}
                        placeholder='请输入房屋总数(套)'
                        style={{ width: '100%' }}
                        disabled={mode === 'detail'}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem label={'绿化面积(m²)'}>
                    {getFieldDecorator('greenSpace')(
                      <InputNumber 
                        min={0}
                        placeholder='请输入绿化面积'
                        style={{ width: '100%' }}
                        disabled={mode === 'detail'}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem label={'地上车位总数(个)'}>
                    {getFieldDecorator('overGroundParkingTotal')(
                      <InputNumber 
                        min={0}
                        precision={0}
                        placeholder='请输入地上车位总数'
                        style={{ width: '100%' }}
                        disabled={mode === 'detail'}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem label={'地上车位出售数(个)'}>
                    {getFieldDecorator('overGroundParkingSells')(
                      <InputNumber 
                        min={0}
                        precision={0}
                        placeholder='请输入地上车位出售数'
                        style={{ width: '100%' }}
                        disabled={mode === 'detail'}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem label={'地上车位出租数(个)'}>
                    {getFieldDecorator('overGroundParkingLeases')(
                      <InputNumber 
                        min={0}
                        precision={0}
                        placeholder='请输入地上车位出租数'
                        style={{ width: '100%' }}
                        disabled={mode === 'detail'}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem label={'地下车库总数(个)'}>
                    {getFieldDecorator('underGroundParkingTotal')(
                      <InputNumber 
                        min={0}
                        precision={0}
                        placeholder='请输入地下车库总数'
                        style={{ width: '100%' }}
                        disabled={mode === 'detail'}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem label={'地下车库出售数(个)'}>
                    {getFieldDecorator('underGroundParkingSells')(
                      <InputNumber 
                        min={0}
                        precision={0}
                        placeholder='请输入地下车库出售数'
                        style={{ width: '100%' }}
                        disabled={mode === 'detail'}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem label={'地下车库出租数(个)'}>
                    {getFieldDecorator('underGroundParkingLeases')(
                      <InputNumber 
                        min={0}
                        precision={0}
                        placeholder='请输入地下车库出租数'
                        style={{ width: '100%' }}
                        disabled={mode === 'detail'}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Card>

            <Card title='业务信息' bordered={false}>
              {
                mode !== 'detail' && (loginType === "operation" || merchantType === 2) ?
                <Button style={{ marginBottom: '20px' }} onClick={this.handleAddMerchant}>添加商户</Button> : null
              }
              { merchantList.length ?
                <Tabs
                  hideAdd
                  type="editable-card"
                  activeKey={activeKey}
                  tabBarStyle={{ marginBottom: '20px' }} 
                  onChange={this.handleTabChange}
                  onEdit={this.handleTabRemove}
                >
                  {
                    merchantList.map((item, index) => (
                      <TabPane tab={`商户${index + 1}`} key={item.id} closable={mode !== 'detail' && loginType === 'operation' || merchantType === 2}>
                        <FormItem style={{ display: 'none' }}>
                          {getFieldDecorator(`communityServices[${index}].id`, {
                            initialValue: item.id
                          })(
                            <Input/>
                          )}
                        </FormItem>
                        <FormItem style={{ display: 'none' }}>
                          {getFieldDecorator(`communityServices[${index}].merchantId`, {
                            initialValue: item.merchantId
                          })(
                            <Input/>
                          )}
                        </FormItem>
                        <Row gutter={24}>
                          <Col span={8}>
                            <FormItem label='绑定商户'>
                              {getFieldDecorator(`communityServices[${index}].merchantName`, {
                                initialValue: item.merchantName,
                                rules: [{ required: true, message: '请输入绑定商户' }],
                              })(
                                <Input
                                  readOnly
                                  placeholder="点击搜索绑定商户"
                                  disabled={mode === 'detail'}
                                  onClick={() =>
                                    this.setState({
                                      merchantModalVisible: true
                                    })
                                  }
                                />
                              )}
                            </FormItem>
                          </Col>
                          <Col span={8}>
                            <FormItem label='是否支持发送账单短信'>
                              {getFieldDecorator(`communityServices[${index}].isSend`, {
                                initialValue: item.isSend === undefined ? true : item.isSendWarn === 1 ? true : false,
                                rules: [{ required: true }],
                                valuePropName: 'checked'
                              })(
                                <Switch
                                  disabled
                                  checkedChildren="开"
                                  unCheckedChildren="关"
                                />
                              )}
                            </FormItem>
                          </Col>
                          <Col span={8}>
                            <FormItem label='是否发送账单提醒短信'>
                              {getFieldDecorator(`communityServices[${index}].isSendWarn`, {
                                initialValue: item.isSendWarn === undefined ? true : item.isSendWarn === 1 ? true : false,
                                rules: [{ required: true }],
                                valuePropName: 'checked'
                              })(
                                <Switch
                                  disabled={mode === 'detail'}
                                  checkedChildren="开"
                                  unCheckedChildren="关"
                                />
                              )}
                            </FormItem>
                          </Col>
                          <Col span={8}>
                            <FormItem label='总负责人姓名'>
                              {getFieldDecorator(`communityServices[${index}].responsibleName`, {
                                initialValue: item.responsibleName,
                                rules: [
                                  { required: true, message: '请输入总负责人姓名' },
                                  { pattern: REGEX.NAME, message: '请输入正确姓名' }
                                ],
                              })(
                                <Input placeholder='请输入总负责人姓名' disabled={mode === 'detail'}/>
                              )}
                            </FormItem>
                          </Col>
                          <Col span={8}>
                            <FormItem label='总负责人电话'>
                              {getFieldDecorator(`communityServices[${index}].responsiblePhone`, {
                                initialValue: item.responsiblePhone,
                                rules: [
                                  { required: true, message: '请输入总负责人电话' },
                                  { pattern: REGEX.MOBILE, message: '手机号格式错误' }
                                ],
                              })(
                                <Input placeholder='请输入总负责人电话' disabled={mode === 'detail'}/>
                              )}
                            </FormItem>
                          </Col>
                          <Col span={8}>
                            <FormItem label='总负责人身份证'>
                              {getFieldDecorator(`communityServices[${index}].responsibleCard`, {
                                initialValue: item.responsibleCard,
                                rules: [
                                  { required: true, message: '请输入总负责人身份证' },
                                  { pattern: REGEX.IDENTITY_CARD, message: '请输入正确格式身份证' }
                                ],
                              })(
                                <Input placeholder='请输入总负责人身份证' disabled={mode === 'detail'}/>
                              )}
                            </FormItem>
                          </Col>
                          <Col span={8}>
                            <FormItem label='小区服务电话'>
                              {getFieldDecorator(`communityServices[${index}].areaPhone`, {
                                initialValue: item.areaPhone,
                                rules: [
                                  { required: true, message: '请输入小区服务电话' },
                                ],
                              })(
                                <Input placeholder='请输入小区服务电话' disabled={mode === 'detail'}/>
                              )}
                            </FormItem>
                          </Col>
                          <Col span={16}>
                            <FormItem label="备注">
                              {getFieldDecorator(`communityServices[${index}].remark`, {
                                initialValue: item.remark,
                              })(
                                <TextArea placeholder='请输入备注' rows={2} disabled={mode === 'detail'}/>
                              )}
                            </FormItem>
                          </Col>
                          <Col span={8}>
                            <FormItem label='财务负责人姓名'>
                              {getFieldDecorator(`communityServices[${index}].financeName`, {
                                initialValue: item.financeName,
                                rules: [
                                  { pattern: REGEX.NAME, message: '请输入正确姓名' }
                                ],
                              })(
                                <Input placeholder='请输入财务负责人姓名' disabled={mode === 'detail'}/>
                              )}
                            </FormItem>
                          </Col>
                          <Col span={8}>
                            <FormItem label='财务负责人电话'>
                              {getFieldDecorator(`communityServices[${index}].financePhone`, {
                                initialValue: item.financePhone,
                                rules: [
                                  { pattern: REGEX.MOBILE, message: '手机号格式错误' }
                                ],
                              })(
                                <Input placeholder='请输入财务负责人电话' disabled={mode === 'detail'}/>
                              )}
                            </FormItem>
                          </Col>
                          <Col span={8}>
                            <FormItem label='财务负责人身份证'>
                              {getFieldDecorator(`communityServices[${index}].financeCard`, {
                                initialValue: item.financeCard,
                                rules: [
                                  { pattern: REGEX.IDENTITY_CARD, message: '请输入正确格式身份证' }
                                ],
                              })(
                                <Input placeholder='请输入财务负责人身份证' disabled={mode === 'detail'}/>
                              )}
                            </FormItem>
                          </Col>
                        </Row>
                        <Card title='收款员'>
                          {getFieldDecorator(`communityServices[${index}].payees`, {
                            initialValue: item.payees ? item.payees : [],
                          })(<TableForm disabled={mode === 'detail'}/>)}
                        </Card>
                      </TabPane>
                    ))
                  }
                </Tabs> : null
              }
            </Card>
          </Form>       

          <SearchMerchantModal 
            visible={merchantModalVisible}
            onConfirm={this.handleMerchantModalOk}
            onCancel={this.handleMerchantModalCancel}
          />   

          <FooterToolbar>
            {mode !== 'detail' && <Button type="primary" onClick={this.handleSubmit}>提交</Button>}
            <Button onClick={this.handleCancel}>{mode === 'edit' ? '取消' : '返回'}</Button>
          </FooterToolbar>
        </Spin>
      </PageWrapper>
    )
  }
};

export default Form.create()(CommunityActionsPage);
