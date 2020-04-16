import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Form, Input, Select, Button, Modal, List, Card, Icon, Avatar, Upload, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import PageWrapper from '@/components/PageWrapper';
import FooterToolbar from '@/components/FooterToolbar';
import { formItemLayout, MAX_UPLOAD_SIZE } from '@/utils/config';
import REGEX from '@/utils/regex';
import styles from './index.scss';

const FormItem = Form.Item;
const Option = Select.Option;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  submitLoading: boolean;
  allIconTemplateList: any[];
}

interface IState {
  visible: boolean;
  current: any;
  uploadLoading: boolean;
}

@connect(({ loading, global }) => ({
  pageLoading: loading.models['iconTemplate'],
  allIconTemplateList: global.allIconTemplateList
}))
class IconTemplateInventory extends PureComponent<IProps, IState> {
  state = {
    visible: false,
    current: {},
    uploadLoading: false,
  }

  componentDidMount() {
    this.handleSearchList()
  }

  handleSearchList = async() => {
    const { dispatch } = this.props;

    dispatch({
      type: 'global/getAllIconTemplateList'
    })
  }

  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        this.setState({
          current: {},
          visible: true
        })
        break;
      case 'edit':
        this.handleEditItem(info);
        break;
      default:
        break;
    }
  }

  handleEditItem = async({ iconId }) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'iconTemplate/getIconDetail',
      payload: { id: iconId }
    })

    this.setState({
      current: result['icon'],
      visible: true
    })
  }

  handleModalOk = e => {
    e.preventDefault();
    const { current } = this.state;
    const { form, dispatch } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { name, linkType, linkUrl, url } = values;
      let result;

      const params = {
        name,
        linkType,
        linkUrl,
        url
      }

      if (current['id']) {
        params['id'] = current['id'];

        result = await dispatch({
          type: 'iconTemplate/editIcon',
          payload: params
        })
      } else {
        result = await dispatch({
          type: 'iconTemplate/createIcon',
          payload: params
        })
      }
      if (result) {
        this.handleSearchList();
        this.handleModalCancel();
      }
    })
  }

  handleModalCancel = () => {
    this.setState({
      visible: false,
      current: {}
    });
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

  handleCancel = () => {
    router.goBack();
  }

  // upload组件value转换
  normFile = ({ file }) => {
    if (Array.isArray(file)) {
      return null;
    }

    if (file && file.response && file.response.code === 200) {
      return file.response.data
    }

    return null;
  }

  renderItem = item => {
    const customLabel = (
      <span className={styles.transferItem}>
        <span>{item.name}</span>
        <img src={item.url}/>
      </span>
    );

    return {
      label: customLabel, // for displayed item
      value: item.iconId, // for title and filter matching
    };
  }

  render() {
    const { visible, current, uploadLoading } = this.state;
    const { pageLoading, form: { getFieldDecorator, getFieldValue }, allIconTemplateList } = this.props;
    const image = getFieldValue('url') ? getFieldValue('url') : current['url'];

    const prefixSelector = getFieldDecorator('linkType', {
      initialValue: current ? current['linkType'] : 1,
    })(
      <Select style={{ width: '100px' }}>
        <Option value={1}>外部链接</Option>
        <Option value={0}>OTO链接</Option>
      </Select>
    )
    return (
      <PageWrapper 
        title={'子应用库存'}
        showBack
        customBreadcrumbmap={[
          { name: '参数管理', url: '' },
          { name: '子应用模版管理', url: '/parameter/icon-template' },
          { name: '子应用库存' },
        ]}
      >
        <List
          loading={pageLoading}
          dataSource={['', ...allIconTemplateList]}
          grid={{ gutter: 24, lg: 3, md: 3, sm: 2, xs: 1 }}
          renderItem={item => item ? (
            <List.Item>
              <Card bodyStyle={{ height: 200 }} hoverable actions={[<a key='edit' onClick={() => this.handleActions('edit', item)}>编辑</a>]}>
                <Card.Meta 
                  avatar={<Avatar shape="square" size="large" src={item.url} />}
                  title={item.name}
                  description={item.linkUrl}
                />
              </Card>
            </List.Item>
          ) : (
            <List.Item>
              <Button type="dashed" className={styles.newButton} onClick={() => this.handleActions('create', null)}>
                <Icon type="plus" /> 新增子应用
              </Button>
            </List.Item>
          )}
        />

        <Modal
          width={800}
          title={current ? '编辑子应用' : '添加子应用'}
          visible={visible}
          destroyOnClose
          confirmLoading={pageLoading}
          onOk={this.handleModalOk}
          onCancel={this.handleModalCancel}
        >
          <Form {...formItemLayout}>
            <FormItem label={'子应用名称'} hasFeedback>
              {getFieldDecorator('name', {
                initialValue: current['name'],
                rules: [
                  { required: true, message: '请输入子应用名称' },
                  { max: 8, message: '不可超过8个字' },
                ]
              })(
                <Input placeholder="不可超过8个字"/>
              )}
            </FormItem>
            <FormItem label={'子应用名称'}>
              {getFieldDecorator('linkUrl', {
                initialValue: current['linkUrl'],
                rules: [
                  { required: true, message: '请输入子应用链接' },
                ]
              })(
                <Input addonBefore={prefixSelector} placeholder="请输入子应用链接"/>
              )}
            </FormItem>
            <FormItem label={'子应用图片'} extra="建议尺寸：60x60px，图片只能为jpg、png格式，图片大小不得超过2MB" >
              {getFieldDecorator('url', {
                initialValue: current['url'],
                // valuePropName: 'fileList',
                getValueFromEvent: this.normFile,
                rules: [{ required: true, message: '子应用图片不能为空' }]
              })
              (
                <Upload
                  listType="picture-card"
                  action={'/api/v1/coreservice/common/uploadPicture'}
                  name={'uploadPicture'}
                  showUploadList={false}
                  beforeUpload={this.handleBeforeUpload}
                  onChange={this.handleUploadChange}
                >
                  {
                    !uploadLoading && image ? 
                    (<img src={image} style={{ width: '100px', height: '100px' }}/>) : 
                    <Icon type={uploadLoading ? 'loading' : 'plus'} />
                  }
                </Upload>
              )}
            </FormItem>
          </Form>
        </Modal>
        <FooterToolbar>
          <Button type="primary" onClick={this.handleCancel}>返回</Button>
        </FooterToolbar>
      </PageWrapper>
    )
  }
};

export default Form.create()(IconTemplateInventory);
