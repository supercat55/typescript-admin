import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { Form, Row, Col, Button, Input, Radio, Upload, message, Spin } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import moment from 'moment';
import router from 'umi/router';
import { formItemHorizontalLayout } from '@/utils/config';
import { GetPageQuery } from '@/utils/utils';
import { StateType } from './model';
import REGEX from '@/utils/regex';
import styles from './index.scss';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  allBillList: any[]
}

interface IState {
  id: string;
  chapterImage: string;
  pageSize: number;
}

@connect(({ loading, print }) => ({
  printList: print.printList,
  pageLoading: loading.models['print'],
}))
class PrintPage extends PureComponent<IProps, IState> {
  state: IState = {
    id: this.props.match.params && this.props.match.params.id,
    chapterImage: null,
    pageSize: 7
  }

  componentWillUnmount() {
    const { dispatch } = this.props;

    dispatch({
      type: 'print/saveList',
      payload: []
    })
  }

  handleSearchList = () => {
    const { dispatch } = this.props;
    const { pageSize } = this.state;

    const urlParams = GetPageQuery();
    const type = urlParams.type ? urlParams.type : 'house';
    const houseIds = urlParams.houseIds;
    const billIds = urlParams.billIds;
    const feeTypeId = urlParams.feeTypeId;
    const billStatus = urlParams.billStatus;
    const billCreateTimeStart = urlParams.billCreateTimeStart;
    const billCreateTimeEnd = urlParams.billCreateTimeEnd;
    const billWriteOffTimeStart = urlParams.billWriteOffTimeStart;
    const billWriteOffTimeEnd = urlParams.billWriteOffTimeEnd;
    const params = {
      pageSize,
    };
    if (feeTypeId) {
      params['feeTypeId'] = feeTypeId
    }
    if (billStatus) {
      params['billStatus'] = billStatus
    }
    if (billCreateTimeStart) {
      params['billCreateTimeStart'] = billCreateTimeStart
    }
    if (billCreateTimeEnd) {
      params['billCreateTimeEnd'] = billCreateTimeEnd
    }
    if (billWriteOffTimeStart) {
      params['billWriteOffTimeStart'] = billWriteOffTimeStart
    }
    if (billWriteOffTimeEnd) {
      params['billWriteOffTimeEnd'] = billWriteOffTimeEnd
    }

    if (type === 'house') {
      dispatch({
        type: 'print/getPrintListForHouse',
        payload: {
          ...params,
          houseIds: Array.isArray(houseIds) ? houseIds : [houseIds]
        }
      }) 
    } else {
      dispatch({
        type: 'print/getPrintListForBill',
        payload: {
          pageSize,
          billIds: Array.isArray(billIds) ? billIds : [billIds]
        }
      }) 
    }
  }

  handleBeforeUpload = file => {
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!REGEX.PHOTO_TYPES.test(file.name)) {
      message.warning('上传的图片格式不正确');
      return false
    }
    if (!isLt2M) {
      message.error('请上传小于2M的图片');
      return false
    }

    return true
  }

  handleUploadChange = info => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      if (info.file.response.code === 200) {
        message.error('上传成功');
        this.setState({
          chapterImage: info.file.response.data
        })
      } else {
        message.error(info.file.response.message);
      }
    }
    if (status === 'error') {
      message.error('图片上传出错');
    }
  }

  handlePreview = () => {
    const { form } = this.props;

    form.validateFields((err, values) => {
      if (err) return;

      const { printFormat } = values;

      let pageSize =  printFormat === 'default' ? 7 : 6

      this.setState({
        pageSize,
      }, this.handleSearchList)
    })
  }

  handlePrint = () => {
    const { form } = this.props;

    form.validateFields(err => {
      if (err) return;

      window.print();
    })
  }

  handleBack = () => {
    router.goBack();
  }

  renderFilter = () => {
    const { form: { getFieldDecorator }, printList } = this.props;
    const uploadLayout = {
      style: { width: '100%' },
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };

    return (
      <div className={styles.header}>
        <Form {...formItemHorizontalLayout}>
          <Row>
            <Col span={6}>
              <FormItem label={'打印规格'}>
                {getFieldDecorator('printFormat', {
                  initialValue: 'default',
                })(
                  <RadioGroup>
                    <Radio value={'default'} style={{ display: 'inline-block' }}>A4</Radio>
                    <Radio value={'middle'} style={{ display: 'inline-block' }}>210*114mm</Radio>
                    <Radio value={'small'} style={{ display: 'inline-block' }}>241*95mm</Radio>
                  </RadioGroup>
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={'标题'}>
                {getFieldDecorator('title', {
                  getValueFromEvent: (event) => event.target.value.trim(),
                  rules: [
                    { max: 20, message: '大于20个字长度' },
                    { required: true, message: '请输入标题' }
                  ]
                })(
                  <Input placeholder="请输入标题"/>
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={'财务主管'}>
                {getFieldDecorator('treasurer', {
                  getValueFromEvent: (event) => event.target.value.trim(),
                  rules: [
                    { max: 4, message: '大于4个字长度' }
                  ]
                })(
                  <Input placeholder="请输入"/>
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={'记账'}>
                {getFieldDecorator('chargeAccount', {
                  getValueFromEvent: (event) => event.target.value.trim(),
                  rules: [
                    { max: 4, message: '大于4个字长度' }
                  ]
                })(
                  <Input placeholder="请输入"/>
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={'审核'}>
                {getFieldDecorator('audit', {
                  getValueFromEvent: (event) => event.target.value.trim(),
                  rules: [
                    { max: 4, message: '大于4个字长度' }
                  ]
                })(
                  <Input placeholder="请输入"/>
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={'出纳'}>
                {getFieldDecorator('cashier', {
                  getValueFromEvent: (event) => event.target.value.trim(),
                  rules: [
                    { max: 4, message: '大于4个字长度' }
                  ]
                })(
                  <Input placeholder="请输入"/>
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={'制单'}>
                {getFieldDecorator('voucher', {
                  getValueFromEvent: (event) => event.target.value.trim(),
                  rules: [
                    { max: 4, message: '大于4个字长度' }
                  ]
                })(
                  <Input placeholder="请输入"/>
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={'银行账户名称'}>
                {getFieldDecorator('bankAccountName', {
                  getValueFromEvent: (event) => event.target.value.trim(),
                  rules: [
                    { max: 30, message: '大于4个字长度' }
                  ]
                })(
                  <Input placeholder="请输入"/>
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={'银行账户号'}>
                {getFieldDecorator('bankAccountNo', {
                  getValueFromEvent: (event) => event.target.value.trim(),
                  rules: [
                    { max: 12, message: '大于4个字长度' }
                  ]
                })(
                  <Input placeholder="请输入"/>
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={'上传电子章'} {...uploadLayout}>
                <Upload 
                  action={'/api/v1/coreservice/common/uploadPicture'}
                  name={'uploadPicture'}
                  accept='.gif, .jpe, .jpeg, .png, .GIF, .JPG, .PNG'
                  showUploadList={false}
                  beforeUpload={this.handleBeforeUpload}
                  onChange={this.handleUploadChange}
                >
                  <span className={styles.uploadBtn}>
                  上传电子章图片
                  </span>
                  <span className={styles.uploadTips}>仅支持PNG格式（小于2M）</span>
                </Upload>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <Row type="flex" justify="end">
          <Col>
            <Button type="primary" onClick={this.handlePreview}>确认预览</Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handlePrint} disabled={!printList.length}>打印</Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleBack}>取消</Button>
          </Col>
        </Row>
      </div>
    )
  }

  renderTableItem = (item, index) => {
    const { form: { getFieldValue }} = this.props;
    const { chapterImage } = this.state;
    const printFormat = getFieldValue('printFormat');
    
    const title = getFieldValue('title');

    return (
      <div className={`${styles.content} ${styles[printFormat]}`} key={index}>
        <div className={styles.subInfo}>
          <div className={styles.firstRow}>
            <span className={styles.title}>{title}</span>
            <span className={styles.no}>{item.dayinNo}</span>
          </div>
          <div className={styles.secondRow}>
            <span>收费单位：{item.merchantName}</span>
            <span>缴费地址：{item.billAddress}</span>
          </div>
          <div className={styles.secondRow}>
            <span>业主姓名：{item.ownerName}</span>
            <span>使用面积：{item.useingArea}平方米</span>
            <span>打印时间：{moment().format('YYYY-MM-DD HH:mm:ss')}</span>
          </div>
        </div>
        {
          item.billList.length ? 
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '30%'}}>缴费名称</th>
                <th style={{ width: '19%'}}>缴费信息</th>
                <th style={{ width: '10%'}}>应收金额</th>
                <th style={{ width: '8%'}}>滞纳金</th>
                <th style={{ width: '10%'}}>待收金额</th>
                <th style={{ width: '23%'}}>说明</th>
              </tr>
            </thead>
            <tbody>
              {
                item.billList.map(item => (
                  <tr key={item.id}>
                    <td>{item.billName}</td>
                    <td>{item.writeOffTime ? moment(item.writeOffTime).format('YYYY-MM-DD') + ' ' : ''}{item.payTypeName}</td>
                    <td>{item.billAmount / 100}</td>
                    <td>{item.overdueAmount / 100}</td>
                    <td>{item.unpaidAmount / 100}</td>
                    <td>{item.showDescribtion}</td>
                  </tr>
                ))
              }
              <tr style={{ backgroundColor: '#fafafa' }}>
                <td colSpan={2}>合计</td>
                <td>{item.billAmountTotal / 100}</td>
                <td>{item.overdueAmountTotal / 100}</td>
                <td>{item.unpaidAmountTotal / 100}</td>
                <td/>
              </tr>
            </tbody>
          </table> : null
        }
        <div className={styles.subInfo}>
          <div className={styles.secondRow}> 
            {getFieldValue('treasurer') ? <span>财务主管：{getFieldValue('treasurer')}</span> : null}
            {getFieldValue('chargeAccount') ? <span >记账：{getFieldValue('chargeAccount')}</span> : null}
            {getFieldValue('audit') ? <span>审核：{getFieldValue('audit')}</span> : null}
            {getFieldValue('cashier') ? <span>出纳：{getFieldValue('cashier')}</span> : null}
            {getFieldValue('voucher') ? <span>制单：{getFieldValue('voucher')}</span> : null}
          </div>
          <div>
            {getFieldValue('bankAccountName') ? <span>收费单位账户信息：{getFieldValue('bankAccountName')}</span> : null}
            {getFieldValue('openBankName') ? <span>（开户行：{getFieldValue('openBankName')}）</span> : null}
            {getFieldValue('bankAccountNo') ? <span> 银行账户号：{getFieldValue('bankAccountNo')}</span> : null}
          </div>
          {
            chapterImage ? 
            <img src={chapterImage} className={styles.chapterImage}/> : null
          }
        </div>
      </div>
    )
  }

  render() {
    const { printList, pageLoading } = this.props;

    return (
      <div className={styles.container}>
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          {this.renderFilter()}

          {
            printList.length ?
            printList.map((item, index) => this.renderTableItem(item, index)) : null
          }
        </Spin>
      </div>
    )
  }
};


export default Form.create()(PrintPage)
