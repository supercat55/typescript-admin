import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import moment from 'moment';
import { Decimal } from 'decimal.js';
import { uniqBy } from 'lodash';
import { Form, Row, Col, InputNumber, Select, Spin, Radio, DatePicker, Button, message, Tooltip, Icon, Popconfirm } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import { convertAllHouseList } from '@/models/global';
import { CreateBillByTempType } from '@/services/bill';
import StandardTable from '@/components/StandardTable';
import PageWrapper from '@/components/PageWrapper';
import FooterToolbar from '@/components/FooterToolbar';
import BillAddress from '../component/BillAddress';
import BillTempModal, { BillTemplateModalProps } from '../component/BillTempModal';
import { formItemLayout } from '@/utils/config';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const { RangePicker, MonthPicker } = DatePicker;

interface IProps extends StateType, FormComponentProps, BillTemplateModalProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  submitLoading: boolean;
  allFeeTypeList: any[];
}

interface IState {
  id: string;
  houseVisible: boolean;
  tempVisible: boolean;
}

@connect(({ billDetail, loading }) => ({
  billTempList: billDetail.billTempList,
  pageLoading: loading.models['billDetail'],
}))
class TempCreateBillPage extends PureComponent<IProps, IState> {
  state = {
    id: this.props.match.params && this.props.match.params.id,
    houseVisible: false,
    tempVisible: false
  }

  private columns = [
    { title: '缴费地址 ', dataIndex: 'address', key: 'address'},
    { title: '房屋唯一编号 ', dataIndex: 'houseNo', key: 'houseNo' },
    { title: '生效时间 ', dataIndex: 'startTime', key: 'startTime' },
    { title: '失效时间 ', dataIndex: 'endTime', key: 'endTime' },
    { title: '操作',
      render: (text, record, index) => (
        <div className='table-actions'>
          <Popconfirm
            title="你确定删除此缴费地址吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={() => this.handleRemoveHouseItem(index)}
          >
            <span>移除</span>
          </Popconfirm>
        </div>
      )
    },
  ]

  componentDidMount() {
    this.init();
  }

  init = async() => {
    const { dispatch } = this.props;
    const { id } = this.state;

    await this.handleGetTemplateList();

    if (id) {
      let result = await dispatch({
        type: 'billDetail/getTemplateBillDetail',
        payload: { id }
      })

      if (result) {
        this.handleFullBaseInfo(result);
      }
    }
  }

  handleFullBaseInfo = result => {
    const { form } = this.props;
    const { isAuto, houseList } = result;

    const newDetail = {
      pushTime: moment(result.pushTime),
      overdueTime: result.overdueTime ? moment(result.overdueTime) : undefined,
      lateFeeTime: result.lateFeeTime ? moment(result.lateFeeTime) : undefined,
      houseTableList: convertAllHouseList(houseList)
    }

    if (isAuto === 0) {
      newDetail['billTime'] = [moment(result.startTime), moment(result.endTime)]
    } else {
      newDetail['monthTime'] = moment(result.startTime)
    }
    
    const baseInfo = Object.assign(result, newDetail)

    Object.keys(form.getFieldsValue()).forEach(key => {
      let obj = {};
      obj[key] = baseInfo[key];
      form.setFieldsValue(obj);
    });
  }

  handleGetTemplateList = async() => {
    const { dispatch } = this.props;

    await dispatch({
      type: 'billDetail/getBillTemplateList',
      payload: { pageNum: 1, pageSize: 100 }
    })
  }

  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { billModelId, isAuto, billTime, monthTime, period, pushTime, overdueTime, lateFeeTime, feeRate, houseTableList } = values;
      let houseIds = [];

      for (let i in houseTableList) {
        houseIds.push(houseTableList[i].id)
      }

      const params: CreateBillByTempType = {
        billModelId,
        isAuto,
        period,
        pushTime: pushTime.startOf('day').unix() * 1000,
        houseIds
      }
      
      if (isAuto === 0) {
        const startTime = billTime[0].startOf('month').unix() * 1000;
        const endTime = billTime[1].endOf('month').unix() * 1000;

        if (!this.handleValidatePeriod(startTime, endTime, period)) return;

        params['startTime'] = startTime;
        params['endTime'] = endTime;

      } else {
        params['startTime'] = monthTime.startOf('month').unix() * 1000;
      }

      if (overdueTime) {
        params['overdueTime'] = overdueTime.unix() * 1000;
      }
      if (lateFeeTime) {
        params['lateFeeTime'] = lateFeeTime.unix() * 1000;;
      }
      if (feeRate) {
        params['feeRate'] = feeRate;
      }
      if (!houseIds.length) {
        message.info('请选择房屋');
        return;
      }

      if (moment(overdueTime).isBefore(lateFeeTime)) {
        message.info('滞纳金生成日不能小于账单逾期开始日');
        return;
      }

      dispatch({
        type: 'billDetail/createTemplateBill',
        payload: params
      })
    })
  }

  /** 判断账单生产区间和生成周期是否一致 */
  handleValidatePeriod = (startDate, endDate, period) => {
    let startTime = new Date(startDate);
    let endTime = new Date(endDate);
    let startMonth = new Date(startTime).getMonth();
    let endMonth = new Date(endTime).getMonth();
    let intervalMonth = (endTime.getFullYear() * 12 + endMonth) - (startTime.getFullYear() * 12 + startMonth) + 1;
    
    if (intervalMonth % period !== 0) {
      message.warning('请根据生成周期选择正确的生成区间', 1);

      return false;
    }

    return true
  }

  handleCancel = () => {
    router.goBack();
  }

  // 计费模板modal确认事件
  handleTempModalOk = async(values) => {
    const { dispatch } = this.props;
    const { modelName, feeTypeId, chargeMode, areaType, rule, totalPrice, unitPrice } = values

    const params = {
      modelName,
      feeTypeId,
      chargeMode,
      rule
    }
    if (chargeMode === 1) {
      params['totalPrice'] = new Decimal(totalPrice).mul(100);
    } else {
      params['unitPrice'] = new Decimal(unitPrice).mul(100);
      params['areaType'] = areaType;
    }

    let checkResult = await dispatch({
      type: 'billDetail/checkTemplateName',
      payload: { modelName }
    })
    
    if (Number(checkResult) === 0) {
      let result = await dispatch({
        type: 'billDetail/createTemplate',
        payload: params
      })

      if (result) {
        this.handleGetTemplateList();
        this.handleTempModalCancel();
      }

    } else {
      message.error('模板名称已存在');
    }
  }

  // 计费模板modal取消事件
  handleTempModalCancel = () => {
    this.setState({
      tempVisible: false
    })
  }

   // 选择房屋modal确认事件 (拼接之前已选中去重)
   handleHouseModalOk = (selectedRowKeys, selectedRows) => {
    const { form } = this.props;
    const houseTableList = form.getFieldValue('houseTableList');
    
    const newTableList = houseTableList.concat(selectedRows);

    form.setFieldsValue({
      houseTableList: uniqBy(newTableList, 'id')
    })

    this.handleHouseModalCancel();
  }

  // 选择房屋modal取消事件
  handleHouseModalCancel = () => {
    this.setState({
      houseVisible: false
    })
  }

  // 移除房屋列表某一项
  handleRemoveHouseItem = index => {
    const { form: { getFieldValue, setFieldsValue } } = this.props;
    const houseTableList = getFieldValue('houseTableList');
    const dataSource = houseTableList.map(item => ({...item}))

    dataSource.splice(index, 1);

    setFieldsValue({ houseTableList: dataSource })
  }

  // 清空房屋列表数据
  handleEmptyHouseTableList = () => {
    const { form: { setFieldsValue } } = this.props;

    setFieldsValue({ houseTableList: [] })
  }

  render() {
    const { houseVisible, tempVisible } = this.state;
    const { pageLoading, form: { getFieldDecorator, getFieldValue }, billTempList } = this.props;
    getFieldDecorator('houseTableList', { initialValue: [] });
    const houseTableList = getFieldValue('houseTableList');
    const isAuto = getFieldValue('isAuto') !== undefined ? getFieldValue('isAuto') : 0;

    const radioStyle = {
      display: 'block',
      height: '40px',
      lineHeight: '40px',
    };

    return (
      <PageWrapper 
        title='调用模板生成账单'
        showBack
        customBreadcrumbmap={[
          { name: '账单管理', url: '' },
          { name: '账单明细管理', url: '/bill/detail' },
          { name: '调用模板生成账单' },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form {...formItemLayout} onSubmit={this.handleSubmit}>
            <FormItem label={'调用模板名称'}>
              <Row gutter={24}>
                <Col span={16}>
                  {getFieldDecorator('billModelId',{
                    rules: [
                      { required: true, message: '请选择模板' },
                    ]
                  })(
                    <Select placeholder="请选择费用类型">
                      {billTempList.map(item => (
                        <Option value={item.id} key={item.id}>{item.modelName}</Option>
                      ))}
                    </Select>
                  )}
                </Col>
                <Col span={8}>
                  <Button type="dashed" onClick={() => this.setState({ tempVisible: true })}>新增计费模板</Button>
                </Col>
              </Row>
            </FormItem>
            <FormItem label={'是否根据该规则持续生成账单'}>
              <Row gutter={24}>
                <Col span={12}>
                  {getFieldDecorator('isAuto', {
                    initialValue: 0,
                    rules: [{ required: true }]
                  })(
                    <RadioGroup>
                      <Radio value={0} style={{ marginRight: '30px' }}>否</Radio>
                      <Radio value={1}>是</Radio>
                    </RadioGroup>
                  )}
                </Col>
                <Col span={8}>
                  <Tooltip placement="top" title={'若选择是，不用选择结束日期，将持续生成账单;   若选择否，选择开始日期和结束日期，只生成此区间内月份账单'}>
                    <Icon type="info-circle" theme='filled' style={{ fontSize: '14px', color: '#1890FF' }}/>
                  </Tooltip>
                </Col>
              </Row>
            </FormItem>
            {
              isAuto === 0 ?
              <FormItem label={'账单生成区间'}>
                {getFieldDecorator('billTime',{
                  rules: [{ required: true, message: '请选择账单生成区间' }]
                })(
                  <RangePicker
                    format="YYYY-MM"
                    style={{ width: '100%' }}
                    mode={['month', 'month']}
                    placeholder={['开始月份', '结束月份']}
                    onPanelChange={(value, mode) => {
                      const { form } = this.props;
                      const { setFieldsValue, getFieldValue } = form;
                      let billTime = getFieldValue('billTime') ? getFieldValue('billTime') : [];

                      billTime = value;

                      setFieldsValue({
                        billTime
                      });
                    }}
                  />
                )}
              </FormItem> :
              <FormItem label={'账单生成起始月份'}>
                {getFieldDecorator('monthTime',{
                  rules: [
                    { required: true, message: '请选择账单生成区间' },
                  ]
                })(
                  <MonthPicker
                    style={{ width: '100%' }}
                    placeholder="请选择账单生成起始月份"
                  />
                )}
              </FormItem>
            }
            <FormItem label={'生成周期'} {...formItemLayout}>
              {getFieldDecorator('period', {
                rules: [
                  { required: true, message: '请选择生成个周期' }
                ]
              })(
                <RadioGroup>
                  <Radio value={1} style={radioStyle}>按单月生成1次</Radio>
                  <Radio value={2} style={radioStyle}>按双月生成1次</Radio>
                  <Radio value={3} style={radioStyle}>按3个月生成1次</Radio>
                  <Radio value={6} style={radioStyle}>按6个月生成1次</Radio>
                  <Radio value={12} style={radioStyle}>按12个月生成1次</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label={'账单推送时间'}>
              <Row gutter={24}>
                <Col span={16}>
                  {getFieldDecorator('pushTime', {
                    rules: [
                      { required: true, message: '请选择账单推送时间' }
                    ]
                  })(
                    <DatePicker style={{ width: '100%' }} />
                  )}
                </Col>
                <Col span={8}>
                  <Tooltip placement="top" title={'若不持续生成账单，则直接在该推送日推送所有账单；  若持续生成账单，则该推送日为首个账单推送日，之后将根据账单区间与周期定期推送'}>
                    <Icon type="info-circle" theme='filled' style={{ fontSize: '14px', color: '#1890FF' }}/>
                  </Tooltip>
                </Col>
              </Row>
            </FormItem>
            <FormItem label={'账单逾期时间'}>
              {getFieldDecorator('lateFeeTime')(
                <DatePicker style={{ width: '100%' }} />
              )}
            </FormItem>
            <FormItem label={'账单生成滞纳金时间'}>
              {getFieldDecorator('overdueTime')(
                <DatePicker placeholder="请选择账单逾期开始日" style={{ width: '100%' }}/>
              )}
            </FormItem>
            <FormItem label={'滞纳金日累计为未缴金额的万分之'}>
              {getFieldDecorator('feeRate')(
                <InputNumber min={1} placeholder="请输入滞纳金利率（整数）" precision={0} style={{ width: '100%' }}/>
              )}
            </FormItem>
            <FormItem label={'房屋范围'}>
              <Button type="dashed" onClick={() => this.setState({ houseVisible: true })} style={{ marginRight: 24 }}>添加房屋</Button>
              <Button type="dashed" onClick={this.handleEmptyHouseTableList}>清空以下数据</Button>
            </FormItem>
          </Form> 
          
          <StandardTable
            rowKey={'id'}
            columns={this.columns}
            dataSource={houseTableList}
            pagination={false}
            scroll={{ x: 500 }}
          />
        </Spin>
        <FooterToolbar>
          <Button onClick={this.handleCancel}>取消</Button>
          <Button type="primary" onClick={this.handleSubmit}>保存</Button>
        </FooterToolbar>


        <BillTempModal
          mode='create'
          visible={tempVisible}
          onConfirm={this.handleTempModalOk}
          onCancel={this.handleTempModalCancel}
        />
        <BillAddress 
          multiple
          visible={houseVisible}
          onConfirm={this.handleHouseModalOk}
          onCancel={this.handleHouseModalCancel}
        />
      </PageWrapper>
    )
  }
};

export default Form.create()(TempCreateBillPage);
