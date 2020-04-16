import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Input, InputNumber, Select, Steps, DatePicker, Button, message, Divider, Spin } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import { isEmpty } from 'lodash'
import { stringify } from 'qs';
import { StateType } from './model';
import { CreateBatchBillType } from '@/services/bill';
import PageWrapper from '@/components/PageWrapper';
import ImportPreview from '@/components/ImportPreview';
import FooterToolbar from '@/components/FooterToolbar';
import { formItemHorizontalLayout, submitFormLayout } from '@/utils/config';
import styles from './index.scss';

const FormItem = Form.Item;
const { Option } = Select;
const { Step } = Steps;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  submitLoading: boolean;
  allFeeTypeList: any[];
}

interface IState {
  currentStep: number;
  currentCommunityName: string;
  currentPushTime: string;
  billInfo: any;
  dataSource: any[];
  importData: any[];
  fileName: string;
}

@connect(({ loading, global }) => ({
  allFeeTypeList: global.allFeeTypeList,
  pageLoading: loading.models['billDetail'],
}))
class BatchCreateBillPage extends PureComponent<IProps, IState> {
  state = {
    currentStep: 0,
    currentCommunityName: '',
    currentPushTime: '',
    billInfo: {},
    dataSource: [],
    importData: [],
    fileName: ''
  }

  componentDidMount() {
    this.init();
  }

  init = async() => {
    const { dispatch } = this.props;

    await dispatch({
      type: 'global/getAllFeeTypeList'
    })
  }

  handleDownloadTemplate = () => {
    window.open('https://wanjia.sh1a.qingstor.com/model/账单导入模板.xls');
  }
  
  @Bind()
  @Debounce(500)
  async handleSearchCommunity(value) {
    if (!value) return;

    const { dispatch } = this.props;
    
    let result: any = await dispatch({
      type: 'global/getAllCommunityListByName',
      payload: { 
        communityName: value,
        type: 'allList' 
      }
    })

    this.setState({
      dataSource: result
    })
  }

  // importPreview传回数据
  handleSyncImportData = (importData, fileName) => {
    this.setState({
      importData,
      fileName
    })
  }

  // 检验第一步信息
  handleValidateStep1 = () => {
    const { dataSource } = this.state;
    const { form } = this.props;

    form.validateFields((err, values) => {
      if (err) return;

      const { communityId, pushTime } = values;
      let currentCommunityName = '';

      if (dataSource.length && communityId) {
        for(let i in dataSource) {
          if (dataSource[i].id === communityId) {
            currentCommunityName = dataSource[i].communityName
            break;
          }
        }
      }
      this.setState({
        billInfo: values,
        currentStep: 1,
        currentCommunityName,
        currentPushTime: moment(pushTime).format('YYYY-MM-DD')
      })
    })
  }

  // 第二步返回第一步
  handlePrev = () => {
    this.setState({
      currentStep: 0,
      currentCommunityName: '',
      currentPushTime: '',
      billInfo: {},
      dataSource: [],
      importData: [],
      fileName: ''
    })
  }
  
  // 第二步提交
  handleSubmit = async() => {
    const { dispatch } = this.props;
    const { billInfo, importData, fileName } = this.state;
    
    if (isEmpty(billInfo)) {
      message.warn('请先输入需要导入的账单明细');
      this.handlePrev();
      return;
    }
    if (!importData.length) {
      message.warn('请上传需要导入的账单模板');
      return;
    }

    const params:CreateBatchBillType = {
      billName: billInfo['billName'],
      communityId: billInfo['communityId'],
      feeTypeId: billInfo['feeTypeId'],
      pushTime: moment(billInfo['pushTime']).startOf('day').unix() * 1000,
      data: importData,
      fileName
    }

    if (billInfo['lateFeeTime']) {
      params['lateFeeTime'] = moment(billInfo['lateFeeTime']).unix() * 1000
    }
    if (billInfo['overdueTime']) {
      params['overdueTime'] = moment(billInfo['overdueTime']).unix() * 1000
    }
    if (billInfo['feeRate']) {
      params['feeRate'] = billInfo['feeRate']
    }

    let result = await dispatch({
      type: 'billDetail/createBatchBill',
      payload: params
    })
    
    if (result) {
      message.success('已上传，正在处理中');

      router.push({
        pathname: '/import-result',
        search: stringify({ fileType: 3 })
      })
    }
  }

  handleCancel = () => {
    router.goBack();
  }

  renderStep1 = () => {
    const { dataSource } = this.state;
    const { form: { getFieldDecorator }, allFeeTypeList } = this.props;

    return (
      <Form {...formItemHorizontalLayout}>
        <FormItem label={'小区名称'}>
          {getFieldDecorator('communityId',{
            rules: [
              { required: true, message: '请选择小区' },
            ]
          })(
            <Select 
              allowClear
              showSearch
              showArrow={false}
              defaultActiveFirstOption={false}
              filterOption={false}
              placeholder='请选择小区'
              onSearch={this.handleSearchCommunity}
            >
              {dataSource.map(item => <Option key={item.id}>{item.communityName}</Option>)}   
            </Select>
          )}
          <span style={{ position: 'absolute', width: '180px', lineHeight: '18px', right: '-200px', fontSize: '14px', color: '#1890FF' }}>请输入内容，并选择系统匹配的小区名称</span>
        </FormItem>
        <FormItem label={'费用类型'}>
          {getFieldDecorator('feeTypeId',{
            rules: [
              { required: true, message: '请选择费用类型' },
            ]
          })(
            <Select placeholder="请选择费用类型">
              {allFeeTypeList.map(item => (
                <Option value={item.id} key={item.id}>{item.feeName}</Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem label={'账单名称'}>
          {getFieldDecorator('billName',{
            rules: [
              { required: true, message: '请输入账单名称' },
            ]
          })(
            <Input placeholder='请输入账单名称'/>
          )}
        </FormItem>
        <FormItem label={'账单推送日'}>
          {getFieldDecorator('pushTime',{
            rules: [{ required: true, message: '请选择账单推送日期' }]
          })(
            <DatePicker placeholder="请选择账单推送日" style={{ width: '100%' }}/>
          )}
        </FormItem>
        <FormItem label={'账单逾期开始日'}>
          {getFieldDecorator('overdueTime')(
            <DatePicker placeholder="请选择账单逾期开始日" style={{ width: '100%' }}/>
          )}
        </FormItem>
        <FormItem label={'滞纳金生成日'}>
          {getFieldDecorator('lateFeeTime')(
            <DatePicker placeholder="请选择滞纳金生成日" style={{ width: '100%' }}/>
          )}
        </FormItem>
        <FormItem label={'滞纳金日累计为未缴金额的万分之'}>
          {getFieldDecorator('feeRate')(
            <InputNumber min={1} placeholder="请输入滞纳金利率（整数）" precision={0} style={{ width: '100%' }}/>
          )}
        </FormItem>
        <FormItem {...submitFormLayout}>
          <Button onClick={this.handleCancel} style={{ marginRight: 15 }}>
            取消
          </Button>
          <Button type="primary" onClick={this.handleValidateStep1}>
            下一步
          </Button>
        </FormItem>
      </Form>
    )
  }

  renderStep2 = () => {
    return (
      <Fragment>
        <ImportPreview syncImportData={this.handleSyncImportData}/>
        <FooterToolbar>
          <Button onClick={this.handlePrev}>
            上一步
          </Button>
          <Button type="primary" onClick={this.handleSubmit}>
            提交
          </Button>
        </FooterToolbar>
      </Fragment>
    )
  }

  render() {
    const { currentStep, currentCommunityName, currentPushTime } = this.state;
    const { pageLoading } = this.props;

    return (
      <PageWrapper 
        title='批量添加'
        showBack
        customBreadcrumbmap={[
          { name: '账单管理', url: '' },
          { name: '账单明细管理', url: '/bill/detail' },
          { name: '批量添加' },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <div className={styles.top}>
            <span>
              {`${currentCommunityName}  ${currentPushTime}`}
            </span>
            <Button onClick={this.handleDownloadTemplate}>下载模板</Button>
          </div>
          <Divider/>
          <div className={styles.container}>
            <Steps current={currentStep} size="small">
              <Step title="填写账单信息" />
              <Step title="上传文件" />
            </Steps>
            <div className={styles.content}>
              {
                currentStep === 0 ?
                this.renderStep1() :
                this.renderStep2()
              }
            </div>
          </div>
        </Spin>
      </PageWrapper>
    )
  }
};

export default Form.create()(BatchCreateBillPage);
