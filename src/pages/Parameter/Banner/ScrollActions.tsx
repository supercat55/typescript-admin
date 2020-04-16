import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Row, Col, Form, Input, Divider, Spin, Button, Upload, message, Icon, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import PageWrapper from '@/components/PageWrapper';
import FooterToolbar from '@/components/FooterToolbar';
import { Debounce, Bind } from 'lodash-decorators';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { formItemLayout, MAX_UPLOAD_SIZE } from '@/utils/config';
import { BANNER_LINK_TYPES } from '@/utils/const';
import REGEX from '@/utils/regex';
import styles from './index.scss';

const FormItem = Form.Item;
const Option = Select.Option;

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
}

@connect(({ loading, global }) => ({
  pageLoading: loading.models['banner'],
}))
class ScrollBannerTemplateActions extends PureComponent<IProps, IState> {
  state = {
    mode: 'create',
    id: this.props.match.params && this.props.match.params.id,
    uploadLoading: false
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

    if (mode === 'default') {
      const result = await dispatch({
        type: 'banner/getDefaultBannerDetail',
        payload: { templateType: 1, bannerType: 1 }
      })

      this.handleFullBaseInfo(result)
    } else if (id && mode !== 'create') {
      const result = await dispatch({
        type: 'banner/getBannerDetail',
        payload: { id }
      })

      this.handleFullBaseInfo(result)
    } else {
      this.handleAddBannerItem();
    }
  }

  handleFullBaseInfo = result => {
    const { mode } = this.state;
    const { form } = this.props;
    const { id = '', list } = result;
    const newBannerList = list.map(item => ({...item}))
    
    const newDetail = {
      bannerList: newBannerList,
    }
    const detail = Object.assign(newDetail, result)

    Object.keys(form.getFieldsValue()).forEach(key => {
      let obj = {};
      obj[key] = detail[key];
      form.setFieldsValue(obj);
    });

    if (mode === 'default' && id) {
      this.setState({
        id
      })
    }
  }

  @Bind()
  @Debounce(500)
  async handleValidateIconName(rule, value, next) {
    const { mode, id } = this.state;
    const { dispatch, form: { setFields } } = this.props;

    if (value) {
      const params = {
        bannerType: 1,
        bannerName: value
      }

      if (mode === 'edit' && id) {
        params['id'] = id
      }

      let result = await dispatch({
        type: 'banner/checkCheckBannerName',
        payload: params
      })

      if (Number(result) === 1) {
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

  handleSubmit = e => {
    e.preventDefault();
    const { id, mode } = this.state;
    const { form, dispatch } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { name, list } = values;

      const params = {
        bannerType: 1,
        name,
        list,
      }

      if (id && mode === 'edit') {
        params['id'] = id;

        dispatch({
          type: 'banner/editBanner',
          payload: params
        });

      } else if (id && mode === 'default') {
        params['id'] = id;

        dispatch({
          type: 'banner/editDefaultBanner',
          payload: params
        });
        
      } else if (mode === 'create') {
        dispatch({
          type: 'banner/createBanner',
          payload: params
        })
      }
    })
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

  handleRemoveBannerItem = ({ id }) => {
    const { form: { getFieldValue, setFieldsValue } } = this.props;

    const bannerList = getFieldValue('bannerList');
    const newBannerList = bannerList.map(item => ({ ...item }));

    if (bannerList.length <= 1) {
      message.info('请添加至少一个banner');
      return;
    }
    const filterMerchantList = newBannerList.filter(item => item.id !== id)
      
    setFieldsValue({  bannerList: filterMerchantList });
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

  render() {
    const { mode, uploadLoading } = this.state;
    const { pageLoading, form: { getFieldDecorator, getFieldValue } } = this.props;
    getFieldDecorator('bannerList', { initialValue: [] })
    const bannerList = getFieldValue('bannerList');

    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '滚动banner模版')}
        showBack
        customBreadcrumbmap={[
          { name: '参数管理', url: '' },
          { name: '滚动banner模版管理', url: '/parameter/scroll-banner' },
          { name: GetPageTitleByMode(mode, '滚动banner模版') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form {...formItemLayout} onSubmit={this.handleSubmit}>
            <FormItem label={'模版名称'} hasFeedback>
              {getFieldDecorator('name', {
                initialValue: mode != 'default' ? '' : '默认模版',
                rules: [
                  { required: true, message: '请输入模版名称' },
                  { validator: mode === 'default' ? null : this.handleValidateIconName }
                ]
              })(
                <Input disabled={mode ==='detail' || mode ==='default'} placeholder="不可超过8个字" autoComplete="off"/>
              )}
            </FormItem>
            {
              bannerList.map((item, index) => (
                <Fragment key={item.id}>
                  <Divider/>
                  {
                    mode !== 'detail' &&
                    <Row type="flex" justify="end">
                      <Col span={8}>
                        <Button onClick={() => this.handleRemoveBannerItem(item)}>移除</Button>
                      </Col>
                    </Row>
                  }
                  <FormItem label={`图片${index + 1}`}>
                    {getFieldDecorator(`list[${index}].url`, {
                      initialValue: item.url,
                      // valuePropName: 'fileList',
                      getValueFromEvent: (file) => this.normFile(file, index),
                      rules: [{ required: true, message: '请上传图片' }]
                    })(
                      <Upload
                        listType="picture-card"
                        className={styles.upload}
                        action={'/api/v1/coreservice/common/uploadPicture'}
                        name={'uploadPicture'}
                        showUploadList={false}
                        beforeUpload={this.handleBeforeUpload}
                        onChange={this.handleUploadChange}
                        disabled={mode === 'detail'}
                      >
                        {
                          !uploadLoading && item.url ? 
                          (<img src={item.url} style={{ width: '100%' }}/>) : 
                          <div>
                            <p className="ant-upload-drag-icon">
                              <Icon type="inbox" />
                            </p>
                            <p className="ant-upload-text">点击上传图片</p>
                            <p className="ant-upload-hint">支持扩展名：.jpg，.png  建议尺寸：690 x 130 px  图片不得超过 1 MB</p>
                          </div>
                        }
                      </Upload>
                    )}
                  </FormItem>
                  <Row  type="flex" justify="start">
                    <Col span={2} offset={8}>
                      <FormItem>
                        {getFieldDecorator(`list[${index}].linkType`, {
                          initialValue: item.linkType === undefined ? 0 : item.linkType
                        })(
                          <Select style={{ width: '100px' }} onChange={value => this.handleItemLinkTypeChange(value, index)}  disabled={mode === 'detail'}>
                            {BANNER_LINK_TYPES.map(item => (
                              <Option value={item.value} key={item.value}>{item.label}</Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={14}>
                      <FormItem>
                        {getFieldDecorator(`list[${index}].linkUrl`, {
                          initialValue: item.linkUrl ? item.linkUrl : '',
                          rules: [{ required: item.linkType !== 0, message: '请输入链接地址' }]
                        })(
                          <Input placeholder="请输入链接地址" disabled={mode === 'detail'}/>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </Fragment>
              ))
            }
            {
              mode !== 'detail' &&
              <Button
                style={{ width: '100%', marginTop: 16, marginBottom: 50 }}
                type="dashed"
                icon="plus"
                onClick={this.handleAddBannerItem}
              >
                添加banner
              </Button>
            }
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

export default Form.create()(ScrollBannerTemplateActions);
