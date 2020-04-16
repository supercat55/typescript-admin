import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Form, Select, Steps, Button, message, Divider, Spin } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { stringify } from 'qs';
import { StateType } from './model';
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
  allCommunityListByMerchant: any[];
}

interface IState {
  currentStep: number;
  currentCommunityId: string;
  currentCommunityName: string;
  importData: any[];
  fileName: string;
}

@connect(({ loading, global }) => ({
  allCommunityListByMerchant: global.allCommunityListByMerchant,
  pageLoading: loading.effects['global/getAllCommunityListByMerchantId'],
}))
class BatchCreateHousePage extends PureComponent<IProps, IState> {
  state = {
    currentStep: 0,
    currentCommunityId: '',
    currentCommunityName: '',
    importData: [],
    fileName: ''
  }

  componentDidMount() {
    this.init();
  }

  init = async() => {
    const { dispatch } = this.props;

    await dispatch({
      type: 'global/getAllCommunityListByMerchantId'
    })
  }

  handleDownloadTemplate = () => {
    window.open('https://wanjia.sh1a.qingstor.com/model/房屋导入模板.xls');
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
    const { form, allCommunityListByMerchant } = this.props;

    form.validateFields((err, values) => {
      if (err) return;

      const { communityId } = values;
      let currentCommunityName = '';

      if (allCommunityListByMerchant.length && communityId) {
        for(let i in allCommunityListByMerchant) {
          if (allCommunityListByMerchant[i].id === communityId) {
            currentCommunityName = allCommunityListByMerchant[i].communityName
            break;
          }
        }
      }
      this.setState({
        currentCommunityId: communityId,
        currentStep: 1,
        currentCommunityName,
      })
    })
  }

  // 第二步返回第一步
  handlePrev = () => {
    this.setState({
      currentStep: 0,
      currentCommunityId: '',
      currentCommunityName: '',
      importData: [],
      fileName: ''
    })
  }
  
  // 第二步提交
  handleSubmit = async() => {
    const { dispatch } = this.props;
    const { currentCommunityId, importData, fileName } = this.state;

    if (!importData.length) {
      message.warn('请上传需要导入的账单模板');
      return;
    }

    const params = {
      communityId: currentCommunityId,
      data: importData,
      fileName
    }

    let result = await dispatch({
      type: 'house/createBatchHouse',
      payload: params
    })
    
    if (result) {
      message.success('已上传，正在处理中');

      router.push({
        pathname: '/import-result',
        search: stringify({ fileType: 1 })
      })
    }
  }

  handleCancel = () => {
    router.goBack();
  }

  renderStep1 = () => {
    const { form: { getFieldDecorator }, allCommunityListByMerchant } = this.props;

    return (
      <Form {...formItemHorizontalLayout}>
        <FormItem label={'所属小区'}>
          {getFieldDecorator('communityId', {
            rules: [{ required: true, message: '请选择所属小区' }]
          })(
            <Select placeholder="请输入所属小区">
              {
                allCommunityListByMerchant.map(item => (
                  <Option key={item.id} value={item.id}>{item.communityName}</Option>
                ))
              }
            </Select>
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
    const { currentStep, currentCommunityName } = this.state;
    const { pageLoading } = this.props;

    return (
      <PageWrapper 
        title='批量添加'
        showBack
        customBreadcrumbmap={[
          { name: '信息管理', url: '' },
          { name: '房屋管理', url: '/info/house' },
          { name: '批量添加' },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <div className={styles.top}>
            <span>{currentCommunityName}</span>
            <Button onClick={this.handleDownloadTemplate}>下载模板</Button>
          </div>
          <Divider/>
          <div className={styles.container}>
            <Steps current={currentStep} size="small">
              <Step title="选择小区" />
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

export default Form.create()(BatchCreateHousePage);
