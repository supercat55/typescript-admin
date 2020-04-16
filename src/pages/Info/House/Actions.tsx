import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Form, Card, Row, Col, Input, Select, Spin, Button, DatePicker, InputNumber, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import moment from 'moment';
import { StateType } from './model';
import { HouseActionsType } from '@/services/info';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import FooterToolbar from '@/components/FooterToolbar';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { HOUSE_TYPES, HOUSE_CHECK_IN_STATUS, HOUSE_RENT_TYPES, GENDER_TYPES, IDENTITY_TYPES } from '@/utils/const';
import { GetUserBaseInfo } from '@/utils/cache';
import REGEX from '@/utils/regex';

const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  allCommunityListByMerchant: any[];
}

interface IState {
  mode: string;
  id: string;
  ownerPageNum: number;
  billPageNum: number;
  pageSize: number;
}

@connect(({ loading, global, house }) => ({
  pageLoading: loading.models['house'],
  houseOwnerList: house.houseOwnerList,
  houseOwnerTotal: house.houseOwnerTotal,
  houseBillList: house.houseBillList,
  houseBillTotal: house.houseBillTotal,
  allCommunityListByMerchant: global.allCommunityListByMerchant,
}))
class HouseActionsPage extends PureComponent<IProps, IState> {
  state = {
    mode: 'create',
    id: this.props.match.params && this.props.match.params.id,
    pageSize: 10,
    ownerPageNum: 1,
    billPageNum: 1,
  }

  private residentColumns = [
    { title: '住户名称', dataIndex: 'ownerName', key: 'ownerName' },
    { title: '联系方式', dataIndex: 'ownerPhone', key: 'ownerPhone' },
    { title: '小区名称', dataIndex: 'communityName', key: 'communityName' },
    { title: '楼/单元/户号', dataIndex: 'houseInfos', key: 'houseInfos' },
    { title: '关系标签', dataIndex: 'relationshipDesc', key: 'relationshipDesc' },
    { title: '创建人', dataIndex: 'userName', key: 'userName' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  ]

  private billColumns = [
    { title: '账单编号', dataIndex: 'billNum', key: 'billNum', },
    { title: '账单名称', dataIndex: 'billName', key: 'billName' },
    { title: '缴费地址', dataIndex: 'address', key: 'address' },
    { title: '账单金额', dataIndex: 'billAmount', key: 'billAmount' },
    { title: '待缴金额', dataIndex: 'unpaidAmount', key: 'unpaidAmount' },
    { title: '滞纳金', dataIndex: 'overdueAmount', key: 'overdueAmount' },
    { title: '支付手机号', dataIndex: 'payPhone', key: 'payPhone' },
    { title: '支付方式', dataIndex: 'payTypeName', key: 'payTypeName' },
    { title: '账单销账时间', dataIndex: 'cancelTime', key: 'cancelTime' },
    { title: '账单状态', dataIndex: 'statusDesc', key: 'statusDesc' },
  ]

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
    
    if (mode === 'detail') {
      this.handleOwnerSearchList();
      this.handleBillSearchList();
    }

    if (mode !== 'create' && id) {
      let result = await dispatch({
        type: 'house/getHouseDetail',
        payload: { houseId: id }
      })
  
      if (result) {
        this.handleFullBaseInfo(result);
      }
    }
  }

  handleOwnerSearchList = () => {
    const { dispatch } = this.props;
    const { id, ownerPageNum, pageSize } = this.state;

    const params = {
      houseId: id,
      pageNum: ownerPageNum,
      pageSize
    };

    dispatch({
      type: 'house/getHouseList',
      payload: params
    })
  }

  handleBillSearchList = () => {
    const { dispatch } = this.props;
    const { id, billPageNum, pageSize } = this.state;

    const params = {
      houseId: id,
      pageNum: billPageNum,
      pageSize
    };

    dispatch({
      type: 'house/getHouseBillList',
      payload: params
    })
  }

  handleFullBaseInfo = result => {
    const { form } = this.props;
    const { house, ownerInfo } = result;

    const newDetail = {
      startTime: house.startTime ? moment(house.startTime) : null,
      endTime: house.endTime ? moment(house.endTime) : null,
      houseType: house.houseType && house.houseType >= 0 ? house.houseType : undefined,
      checkinStatus: house.checkinStatus && house.checkinStatus >= 0 ? house.checkinStatus : undefined,
      leaseStatus: house.leaseStatus && house.leaseStatus >= 0 ? house.leaseStatus : undefined,
      remark: house.remark ? house.remark : null,
    }

    const detail = Object.assign(house, ownerInfo, newDetail);

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
        buildingNo,
        unitNo,
        accountNo,
        houseNo,
        startTime,
        endTime,
        houseType,
        checkinStatus,
        leaseStatus,
        ownerName,
        ownerPhone,
        sex,
        cardType,
        cardId,

        builtArea,
        useingArea,
        publicArea,
        otherArea,
        floor,
        renovation,
        estateNo,
        buildType,
        orientation,
        remark,
      } = values;

      const params: HouseActionsType = {
        merchantId,
        communityId,
        buildingNo,
        unitNo,
        accountNo,
      }

      if (houseNo) {
        params['houseNo'] = houseNo;
      }
      if (startTime) {
        params['startTime'] = startTime.unix() * 1000;
      }
      if (endTime) {
        params['endTime'] = endTime.unix() * 1000;
      }
      if (houseType >= 0) {
        params['houseType'] = houseType;
      }
      if (checkinStatus >= 0) {
        params['checkinStatus'] = checkinStatus;
      }
      if (leaseStatus) {
        params['leaseStatus'] = leaseStatus;
      }
      if (ownerName) {
        params['ownerName'] = ownerName;
      }
      if (ownerPhone) {
        params['ownerPhone'] = ownerPhone;
      }
      if (sex >= 0) {
        params['sex'] = sex;
      }
      if (cardType >= 0) {
        params['cardType'] = cardType;
      }
      if (cardId) {
        params['cardId'] = cardId;
      }
      if (builtArea) {
        params['builtArea'] = builtArea;
      }
      if (useingArea) {
        params['useingArea'] = useingArea;
      }
      if (publicArea) {
        params['publicArea'] = publicArea;
      }
      if (otherArea) {
        params['otherArea'] = otherArea;
      }
      if (floor) {
        params['floor'] = floor;
      }
      if (renovation) {
        params['renovation'] = renovation;
      }
      if (estateNo) {
        params['estateNo'] = estateNo;
      }
      if (buildType) {
        params['buildType'] = buildType;
      }
      if (orientation) {
        params['orientation'] = orientation;
      }
      if (remark) {
        params['remark'] = remark;
      }

      if (mode === 'edit' && id) {
        params['id'] = id;

        dispatch({
          type: 'house/editHouse',
          payload: params
        })
        return
      }
      dispatch({
        type: 'house/createHouse',
        payload: params
      })
    })
  }

  handleCancel = () => {
    router.goBack();
  }

  handleOwnerTabelChange = pagination => {
    this.setState({
      ownerPageNum: pagination.current
    }, this.handleOwnerSearchList)
  }

  handleBillTabelChange = pagination => {
    this.setState({
      billPageNum: pagination.current
    }, this.handleBillSearchList)
  }

  render() {
    const { mode, pageSize, ownerPageNum, billPageNum } = this.state;
    const { pageLoading, form: { getFieldDecorator, getFieldValue }, allCommunityListByMerchant, houseOwnerList, houseOwnerTotal, houseBillList, houseBillTotal } = this.props;
    
    const { merchantName } = GetUserBaseInfo();
    // form set必须要先已存在的值
    getFieldDecorator('merchantName', { initialValue: '' });
    const currentMerchant = getFieldValue('merchantName') ? getFieldValue('merchantName') : merchantName;
    const ownerPagination = {
      total: houseOwnerTotal,
      current: ownerPageNum,
      pageSize,
    };
    const billPagination = {
      total: houseBillTotal,
      current: billPageNum,
      pageSize,
    };
    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '房屋')}
        showBack
        customBreadcrumbmap={[
          { name: '信息管理', url: '' },
          { name: '房屋管理', url: '/info/house' },
          { name: GetPageTitleByMode(mode, '房屋') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form>
            <Card title={'基本信息'} bordered={false}>
              <Row gutter={40}>
                <Col span={8}>
                  <FormItem label={'绑定商户'}>
                    <Input value={currentMerchant} disabled/>
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'所属小区'}>
                    {getFieldDecorator('communityId', {
                      rules: [{ required: true, message: '请选择所属小区' }]
                    })(
                      <Select placeholder="请输入所属小区" disabled={mode === 'detail'}>
                        {
                          allCommunityListByMerchant.map(item => (
                            <Option key={item.id} value={item.id}>{item.communityName}</Option>
                          ))
                        }
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'楼号'}>
                    {getFieldDecorator('buildingNo', {
                      rules: [{ required: true, message: '请输入楼号' }]
                    })(
                      <Input placeholder='请输入楼号' disabled={mode === 'detail'}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'单元号'}>
                    {getFieldDecorator('unitNo', {
                      rules: [{ required: true, message: '请输入单元号' }]
                    })(
                      <Input placeholder='请输入单元号' disabled={mode === 'detail'}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'户号'}>
                    {getFieldDecorator('accountNo', {
                      rules: [{ required: true, message: '请输入户号/室号' }]
                    })(
                      <Input placeholder='请输入户号/室号' disabled={mode === 'detail'}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'房屋唯一编号'}>
                    {getFieldDecorator('houseNo', {
                      rules: [{ max: 20, message: '最多可输入20位数字' }]
                    })(
                      <Input placeholder='请输入房屋唯一编号' disabled={mode === 'detail'}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'生效时间'}>
                    {getFieldDecorator('startTime')(
                      <DatePicker style={{ width: '100%' }} disabled={mode === 'detail'} format="YYYY-MM-DD" placeholder="请选择生效时间"/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'失效时间'}>
                    {getFieldDecorator('endTime')(
                      <DatePicker style={{ width: '100%' }} disabled={mode === 'detail'} format="YYYY-MM-DD" placeholder="请选择生效时间"/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'房屋类型'}>
                    {getFieldDecorator('houseType')(
                      <Select placeholder="请选择房屋类型" disabled={mode === 'detail'}>
                        {
                          HOUSE_TYPES.map(item => (
                            <Option key={item.value} value={item.value}>{item.label}</Option>
                          ))
                        }
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'入住状态'}>
                    {getFieldDecorator('checkinStatus')(
                      <Select placeholder="请选择入住状态" disabled={mode === 'detail'}>
                        {
                          HOUSE_CHECK_IN_STATUS.map(item => (
                            <Option key={item.value} value={item.value}>{item.label}</Option>
                          ))
                        }
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'租赁状态'}>
                    {getFieldDecorator('leaseStatus')(
                      <Select placeholder="请选择租赁状态" disabled={mode === 'detail'}>
                        {
                          HOUSE_RENT_TYPES.map(item => (
                            <Option key={item.value} value={item.value}>{item.label}</Option>
                          ))
                        }
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'业主姓名'}>
                    {getFieldDecorator('ownerName')(
                      <Input placeholder='请输入业主姓名' disabled={mode === 'detail'}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'业主电话'}>
                    {getFieldDecorator('ownerPhone', {
                      rules: [{ pattern: REGEX.MOBILE, message: '请输入正确格式电话' }]
                    })(
                      <Input placeholder='请输入业主电话' disabled={mode === 'detail'}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'性别'}>
                    {getFieldDecorator('sex')(
                      <Select placeholder="请选择性别" disabled={mode === 'detail'}>
                       {
                         GENDER_TYPES.map(item => (
                           <Option key={item.value} value={item.value}>{item.label}</Option>
                         ))
                       }
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'证件类型'}>
                    {getFieldDecorator('cardType')(
                      <Select placeholder="请选择证件类型" disabled={mode === 'detail'}>
                       {
                         IDENTITY_TYPES.map(item => (
                           <Option key={item.value} value={item.value}>{item.label}</Option>
                         ))
                       }
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'证件号码'}>
                    {getFieldDecorator('cardId')(
                      <Input placeholder='请输入证件号码' disabled={mode === 'detail'}/>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Card>
            
            <Card title='房屋信息' bordered>
              <Row gutter={40}>
                <Col span={8}>
                  <FormItem label={'建筑面积(m²)'}>
                    {getFieldDecorator('builtArea')(
                      <InputNumber 
                        min={0}
                        placeholder='请输入建筑面积'
                        style={{ width: '100%' }}
                        disabled={mode === 'detail'}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'使用面积(m²)'}>
                    {getFieldDecorator('useingArea')(
                      <InputNumber 
                        min={0}
                        placeholder='请输入使用面积'
                        style={{ width: '100%' }}
                        disabled={mode === 'detail'}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'公摊面积(m²)'}>
                    {getFieldDecorator('publicArea')(
                      <InputNumber 
                        min={0}
                        placeholder='请输入公摊面积'
                        style={{ width: '100%' }}
                        disabled={mode === 'detail'}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'其他面积(m²)'}>
                    {getFieldDecorator('otherArea')(
                      <InputNumber 
                        min={0}
                        placeholder='请输入其他面积'
                        style={{ width: '100%' }}
                        disabled={mode === 'detail'}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'楼层'}>
                    {getFieldDecorator('floor')(
                      <Input placeholder='请输入房屋楼层' disabled={mode === 'detail'}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'装修情况'}>
                    {getFieldDecorator('renovation')(
                      <Input placeholder='请输入房屋装修情况' disabled={mode === 'detail'}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'房产证编号'}>
                    {getFieldDecorator('estateNo')(
                      <Input placeholder='请输入房产证编号' disabled={mode === 'detail'}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'户型'}>
                    {getFieldDecorator('buildType')(
                      <Input placeholder='请输入房屋户型' disabled={mode === 'detail'}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={'朝向'}>
                    {getFieldDecorator('orientation')(
                      <Input placeholder='请输入房屋朝向' disabled={mode === 'detail'}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem label={'备注'}>
                    {getFieldDecorator('remark')(
                      <TextArea 
                        rows={3}
                        placeholder='请输入备注内容' 
                        disabled={mode === 'detail'}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Card>
          </Form>      
          
          {
            mode === 'detail' ?
            <Fragment>
              <Card title='住户信息' bordered style={{ marginTop: 20 }}>
                <StandardTable
                  rowKey={'id'}
                  columns={this.residentColumns}
                  dataSource={houseOwnerList}
                  pagination={ownerPagination}
                  onChange={this.handleOwnerTabelChange}
                />
              </Card>
              <Card title='账单信息' bordered style={{ marginTop: 20 }}>
                <StandardTable
                  rowKey={'id'}
                  columns={this.billColumns}
                  dataSource={houseBillList}
                  pagination={billPagination}
                  onChange={this.handleBillTabelChange}
                />
              </Card>
            </Fragment> : null
          }
          <FooterToolbar>
            {mode !== 'detail' && <Button type="primary" onClick={this.handleSubmit}>提交</Button>}
            <Button onClick={this.handleCancel}>{mode === 'edit' ? '取消' : '返回'}</Button>
          </FooterToolbar>
        </Spin>
      </PageWrapper>
    )
  }
};

export default Form.create()(HouseActionsPage);
