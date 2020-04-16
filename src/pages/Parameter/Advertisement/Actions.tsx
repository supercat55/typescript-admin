import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Row, Col, Form, Input, Result, Spin, Button, Upload, message, Radio, Select, Steps, Icon } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import PageWrapper from '@/components/PageWrapper';
import { Debounce, Bind } from 'lodash-decorators';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { formItemLayout, submitFormLayout, MAX_UPLOAD_SIZE } from '@/utils/config';
import { BANNER_LINK_TYPES } from '@/utils/const';
import REGEX from '@/utils/regex';
import styles from './index.scss';

const FormItem = Form.Item;
const Option = Select.Option;
const Step = Steps.Step;
const RadioGroup = Radio.Group;

export const UPLOAD_SIZE = {
  1: '建议尺寸：690 X 276 px',
  2: '建议尺寸：330 X 276 px',
  3: '建议尺寸：344 X 130 px'
};

export const ADV_TYPE = {
  1: '样式一（1张广告位图片）',
  2: '样式二（2张广告位图片）',
  3: '样式三（3张广告位图片）'
};

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  submitLoading: boolean;
}

interface IState {
  mode: string;
  id: string;
  uploadLoading: boolean;
  currentStep: number;
  formData: any
}

@connect(({ loading }) => ({
  pageLoading: loading.models['advertisement'],
}))
class AdvertisementTemplateActions extends PureComponent<IProps, IState> {
  state = {
    mode: 'create',
    id: this.props.match.params && this.props.match.params.id,
    uploadLoading: false,
    currentStep: 0,
    formData: {
      name: '',
      abStyle: 1,
    }
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

    if (id && mode === 'edit') {
      const result = await dispatch({
        type: 'advertisement/getAdvertisementDetail',
        payload: { id }
      })

      this.handleFullBaseInfo(result)
    }
  }

  handleFullBaseInfo = result => {
    const { form } = this.props;
    const { list } = result;
    const newBannerList = list.map(item => ({...item}))
    
    const newDetail = {
      bannerList: newBannerList,
      name: result.templateName
    }
    const detail = Object.assign(newDetail, result)

    Object.keys(form.getFieldsValue()).forEach(key => {
      let obj = {};
      obj[key] = detail[key];
      form.setFieldsValue(obj);
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { id, mode, formData } = this.state;
    const { form, dispatch } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { list } = values;

      const params = {
        abStyle: formData.abStyle,
        name: formData.name,
        list,
      }

      let result;

      if (id && mode === 'edit') {
        params['id'] = id;

        result = await dispatch({
          type: 'advertisement/editAdvertisement',
          payload: params
        });
      } else {
        result = await dispatch({
          type: 'advertisement/createAdvertisement',
          payload: params
        })
      }

      if (result) {
        this.setState({
          currentStep: 2
        })
      }
    })
  }

  handleAddBannerItem = () => {
    const { form: { getFieldValue, setFieldsValue } } = this.props;

    const bannerList = getFieldValue('bannerList');
    const newBannerList = bannerList.map(item => ({ ...item }));
    const id = `NEW_BANNER_${this.index++}`;

    newBannerList.push({ id, linkType: 0 });

    setFieldsValue({ bannerList: newBannerList })
  }

  handleItemLinkTypeChange = (value, index) => {
    const { form: { getFieldValue, setFieldsValue } } = this.props;

    const bannerList = getFieldValue('bannerList');
    const newBannerList = bannerList.map(item => ({ ...item }));
    newBannerList[index].linkType = value;

    setFieldsValue({ bannerList: newBannerList })
  }

  handleBeforeUpload = file => {
    const { name, size } = file

    if (!REGEX.PHOTO_TYPES.test(name)) {
      message.warning('上传的图片格式不正确');
      return false
    }
    if (size >= MAX_UPLOAD_SIZE) {
      message.warning('上传的图片大于1M')
      return false
    }

    return true
  }

  handleUploadChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ uploadLoading: true });
      return;
    }
    if (info.file.status === 'done') {
      this.setState({ uploadLoading: false });
    }
  }

  @Bind()
  @Debounce(500)
  async handleValidateTempName(rule, value, next) {
    const { mode, id } = this.state;
    const { dispatch, form: { setFields } } = this.props;

    if (value) {
      const params = {
        name: value
      }

      if (mode === 'edit' && id) {
        params['id'] = id
      }

      let result = await dispatch({
        type: 'advertisement/checkCheckAdvertisementName',
        payload: params
      })

      if (Number(result) !== 0) {
        setFields({
          name: {
            value,
            errors: [new Error('该模板名称已存在')],
          }
        })
        return;
      }
    }

    next()
  }

  handleValidateStep1 = () => {
    const { mode } = this.state;
    const { form: { validateFields, getFieldValue, setFieldsValue } } = this.props;

    const bannerList = getFieldValue('bannerList');

    validateFields((err, values) => {
      if (err) return;

      const { abStyle } = values;

      // 如果是新增根据样式循环生产展示列表数组
      if (mode === 'create') {
        for (let i = 0; i < abStyle; i++) {
          this.handleAddBannerItem()
        }
      // 编辑状态下，下一步时，判断详情的abStyle是否和手动选择abStyle一致，一致使用默认详情list 不一致则清空后根据手动选择来循环
      } else {
        if (bannerList.length !== abStyle) {
          setFieldsValue({ bannerList: [] });

          for (let i = 0; i < abStyle; i++) {
            this.handleAddBannerItem()
          }
        }
      }

      this.setState({
        currentStep: 1,
        formData: values
      })
    })
  }

  handlePrevStep1 = () => {
    const { formData } = this.state;
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ bannerList: [], ...formData })

    this.setState({
      currentStep: 0,
    })
  }

  handleCancel = () => {
    router.goBack();
  }

  // upload组件value转换
  normFile = ({ file }, index) => {
    const { form: { getFieldValue, setFieldsValue } } = this.props;
    if (Array.isArray(file)) {
      return null;
    }

    if (file && file.response && file.response.code === 200) {
      const bannerList = getFieldValue('bannerList');
      const newBannerList = bannerList.map(item => ({ ...item }));
      newBannerList[index].url = file.response.data;

      setFieldsValue({ bannerList: newBannerList })

      return file.response.data
    }

    return null;
  }

  renderStep1 = () => {
    const { formData } = this.state;
    const { form: { getFieldDecorator } } = this.props;

    return (
      <Form {...formItemLayout}>
        <FormItem label={'模版名称'}>
          {getFieldDecorator('name', {
            initialValue: formData.name,
            rules: [
              { required: true, message: '模版名称不能为空' },
              { max: 8, message: '不可超过8个字' },
              { validator: this.handleValidateTempName }
            ]
          })(
            <Input placeholder="不可超过8个字" autoComplete="off"/>
          )}
        </FormItem>
        <FormItem label={'选择样式'}>
          {getFieldDecorator('abStyle', {
            initialValue: formData.abStyle ? formData.abStyle : 1,
          })(
            <RadioGroup className={styles.radioGroup}>
              <div className={styles.radioItem}>
                <Radio value={1}>样式一</Radio>
                <img src="http://wanjia.sh1a.qingstor.com/126e875f1eb940ff8334220db8ffe3f5.jpg"/>
              </div>
              <div className={styles.radioItem}>
                <Radio value={2}>样式二</Radio>
                <img src="http://wanjia.sh1a.qingstor.com/c7ffd92ae84647d88e66ab63695fcf7a.jpg"/>
              </div>
              <div className={styles.radioItem}>
                <Radio value={3}>样式三</Radio>
                <img src="http://wanjia.sh1a.qingstor.com/be0199de515142d7a25f7fbbba564434.jpg"/>
              </div>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem {...submitFormLayout}>
          <Button type="primary" onClick={this.handleValidateStep1}>
            下一步
          </Button>
        </FormItem>
      </Form>
    )
  }

  renderStep2 = () => {
    const { uploadLoading, formData: { abStyle } } = this.state;
    const { form: { getFieldDecorator, getFieldValue }, pageLoading } = this.props;
    const bannerList = getFieldValue('bannerList');

    return (
      <Form onSubmit={this.handleSubmit}>
        <Fragment>
          <div className={`${abStyle === 1 ? styles.one : abStyle === 2 ? styles.two : styles.three}`}>
            {
              bannerList.map((item, index) => (
              <FormItem label={`图片${index + 1}`} key={item.id}>
                {getFieldDecorator(`list[${index}].url`, {
                  initialValue: item.url,
                  // valuePropName: 'fileList',
                  getValueFromEvent: (file) => this.normFile(file, index),
                  rules: [{ required: true, message: '请上传图片' }]
                })(
                  <Upload
                    listType="picture-card"
                    className={`ad-upload-item-${index + 1}`}
                    action={'/api/v1/coreservice/common/uploadPicture'}
                    name={'uploadPicture'}
                    showUploadList={false}
                    beforeUpload={this.handleBeforeUpload}
                    onChange={this.handleUploadChange}
                  >
                    {
                      !uploadLoading && item.url ? 
                      (<img src={item.url} className={`ad-upload-image-${index + 1}`}/>) : 
                      <div>
                        <p className="ant-upload-drag-icon">
                          <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">点击上传图片</p>
                        <p className="ant-upload-text">
                          {
                            abStyle > 2 ? index > 0 ?
                            UPLOAD_SIZE[3] : UPLOAD_SIZE[2] : UPLOAD_SIZE[abStyle]
                          }
                        </p>
                        <p className="ant-upload-hint">图片不得超过 2 MB</p>
                      </div>
                    }
                  </Upload>
                )}
              </FormItem>
              ))
            }
          </div>
          {
            bannerList.map((item, index) => (
              <Row type="flex" justify="space-between"  key={item.id}>
                <Col span={2}>
                  <FormItem>
                    {getFieldDecorator(`list[${index}].linkType`, {
                      initialValue: item.linkType === undefined ? 0 : item.linkType
                    })(
                      <Select style={{ width: '100px' }} onChange={value => this.handleItemLinkTypeChange(value, index)}>
                        {BANNER_LINK_TYPES.map(item => (
                          <Option value={item.value} key={item.value}>{item.label}</Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={21}>
                  <FormItem>
                    {getFieldDecorator(`list[${index}].linkUrl`, {
                      initialValue: item.linkUrl ? item.linkUrl : '',
                      rules: [{ required: item.linkType !== 0, message: '请输入链接地址' }]
                    })(
                      <Input placeholder="请输入链接地址" addonBefore={<span>{`链接${index + 1}`}</span>}/>
                    )}
                  </FormItem>
                </Col>
              </Row>
            ))
          }
        </Fragment>
        <FormItem {...submitFormLayout}>
          <Button type="primary" onClick={this.handleSubmit} style={{ marginLeft: 8 }} loading={pageLoading}>
            提交
          </Button>
          <Button onClick={this.handlePrevStep1} style={{ marginLeft: 8 }}>
            上一步
          </Button>
        </FormItem>
      </Form>
    )
  }

  renderStep3 = () => {
    const { mode, formData } = this.state;

    return (
      <Result
        status="success"
        title={mode === 'create' ? '新增广告位成功' : '编辑广告位成功'}
        subTitle={
          <div className={styles.result}>
            <p>模板名称：{formData.name}</p>
            <p>广告位样式：{ADV_TYPE[formData.abStyle]}</p>
          </div>}
        extra={<Button key="buy" type="primary" onClick={this.handleCancel}>完成</Button>}
      />
    )
  }
  render() {
    const { mode, currentStep } = this.state;
    const { pageLoading, form: { getFieldDecorator } } = this.props;
    getFieldDecorator('bannerList', { initialValue: [] })

    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '广告位模版')}
        showBack
        customBreadcrumbmap={[
          { name: '参数管理', url: '' },
          { name: '广告位模版管理', url: '/parameter/advertisement' },
          { name: GetPageTitleByMode(mode, '广告位模版') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <div className={styles.container}>
            <Steps current={currentStep}>
              <Step title="模版信息" />
              <Step title="上传图片" />
              <Step title="完成" />
            </Steps>
            <div className={styles.content}>
              {
                currentStep === 0 ? this.renderStep1() : currentStep === 1 ? this.renderStep2() : this.renderStep3()
              }
            </div>
          </div>
        </Spin>
      </PageWrapper>
    )
  }
};

export default Form.create()(AdvertisementTemplateActions);
