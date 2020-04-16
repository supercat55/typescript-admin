import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Form, Row, Col, Input, Upload, Select, Spin, Button, Tooltip, Icon, DatePicker, Popconfirm, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import BraftEditor from 'braft-editor';
import { ContentUtils } from 'braft-utils';
import moment from 'moment';
import { uniqBy } from 'lodash';
import { StateType } from './model';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import FooterToolbar from '@/components/FooterToolbar';
import { MessageNoticeActionsType } from '@/services/message';
import SearchCommunityModal from '@/components/SearchCommunityModal';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { formItemLayout } from '@/utils/config';
import { MESSAGE_NOTICE_TYPES, RELEASE_RANGE } from '@/utils/const';
import 'braft-editor/dist/index.css'

const FormItem = Form.Item;
const { Option } = Select;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  submitLoading: boolean;
}

interface IState {
  mode: string;
  id: string;
  communityModalVisible: boolean;
}

@connect(({ loading }) => ({
  pageLoading: loading.models['message'],
}))
class NoticeActionsPage extends PureComponent<IProps, IState> {
  state = {
    mode: 'create',
    id: this.props.match.params && this.props.match.params.id,
    communityModalVisible: false,
  }

  componentDidMount() {
    const urlParams = GetPageQuery();
    const mode = urlParams.mode ? urlParams.mode : '';

    this.setState({ mode }, this.init)
  }

  init = async() => {
    const { id, mode } = this.state;
    const { dispatch } = this.props;

    if (id && mode !== 'create') {
      let result = await dispatch({
        type: 'message/getNoticeDetail',
        payload: { noticeId: id }
      })
      this.handleFullBaseInfo(result)
    }
  }

  handleFullBaseInfo = result => {
    const { form } = this.props;

    const newDetail = {
      pushTime: moment(result.pushTime),
      communityTableList: result.communityList,
      content: BraftEditor.createEditorState(result.noticeContent),
    }

    const detail = Object.assign(result, newDetail);

    Object.keys(form.getFieldsValue()).forEach(key => {
      let obj = {};
      obj[key] = detail[key];
      form.setFieldsValue(obj);
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { id, mode } = this.state;
    const { form, dispatch } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      const {
        noticeTitle,
        noticeType,
        pushTime,
        content,
        pushScope,
        communityIdList,
      } = values

      let communityIds = [];

      const params: MessageNoticeActionsType = {
        noticeTitle,
        noticeType,
        pushTime: pushTime.unix() * 1000,
        noticeContent: content.toHTML(),
        pushScope,
      }

      if (pushScope === 2) {
        if (communityIdList.length === 0) {
          message.error('请选择发布小区');
          return;
        }

        for(let i in communityIdList) {
          communityIds.push(communityIdList[i].id)
        }
        params['communityIdList'] = communityIds;
      }

      if (id && mode === 'edit') {
        params['noticeId'] = id;

        dispatch({
          type: 'message/editNotice',
          payload: params
        });

        return;
      }

      dispatch({
        type: 'message/createNotice',
        payload: params
      })
    })
  }

  // 选择小区modal确认事件
  handleCommunityModalOk = (selectedRowKeys, selectedRows) => {
    const { form } = this.props;
    const communityTableList = form.getFieldValue('communityTableList');
    
    const newTableList = communityTableList.concat(selectedRows);

    this.props.form.setFieldsValue({
      communityTableList: uniqBy(newTableList, 'id')
    })

    this.handleCommunityModalCancel();
  }

  handleCommunityModalCancel = () => {
    this.setState({
      communityModalVisible: false
    })
  }

  // 移除小区列表某一项
  handleRemoveCommuntiyItem = index => {
    const { form: { getFieldValue, setFieldsValue } } = this.props;
    const communityTableList = getFieldValue('communityTableList');
    const dataSource = communityTableList.map(item => ({...item}))

    dataSource.splice(index, 1);

    setFieldsValue({ communityTableList: dataSource })
  }

  handleCancel = () => {
    router.goBack();
  }


  handleEditorUpload = async(param) => {
    const { dispatch, form: { getFieldValue, setFieldsValue } } = this.props;
    const content = BraftEditor.createEditorState(getFieldValue('content'));

    if (!param.file) {
      return false
    }
    let result = await dispatch({
      type: 'global/upload',
      payload: param.file
    })

    const newContent = ContentUtils.insertMedias(content, [{
      type: 'IMAGE',
      url: result
    }])

    setFieldsValue({ content: newContent })
  }

  renderCommunityTableList = list => {
    const { mode } = this.state;
    let columns = [];

    if (mode === 'detail') {
      columns = [
        { title: '小区名称', dataIndex: 'communityName', key: 'communityName' },
        { title: '所在省市', dataIndex: 'address', key: 'address', 
          render: (_, record) => (
            <span>{`${record.province}-${record.city}-${record.area}`}</span>
          )
        },
      ]
    } else {
      columns = [
        { title: '小区名称', dataIndex: 'communityName', key: 'communityName' },
        { title: '所在省市', dataIndex: 'address', key: 'address', 
          render: (_, record) => (
            <span>{`${record.province}-${record.city}-${record.area}`}</span>
          )
        },
        { title: '操作', key: 'actions', width: '33.33%' , 
          render: (text, record, index) =>
            (
              <div className='table-actions'>
                <Popconfirm
                  title="你确定删除此小区地址吗？"
                  okText="确定"
                  cancelText="取消"
                  onConfirm={() => this.handleRemoveCommuntiyItem(index)}
                >
                  <span>移除</span>
                </Popconfirm>
              </div>
            )
          }
        ]
    }

    return (
      <StandardTable
        rowKey='id'
        pagination={false}
        columns={columns}
        dataSource={list}
        bordered
        scroll={{ y: 432 }}
      />
    )
  }

  render() {
    const { mode, communityModalVisible } = this.state;
    const { pageLoading, form: { getFieldDecorator, getFieldValue } } = this.props;
    getFieldDecorator('communityTableList', { initialValue: [] });
    const communityTableList = getFieldValue('communityTableList');
    const pushScope = getFieldValue('pushScope');
    
    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '社区公告')}
        showBack
        customBreadcrumbmap={[
          { name: '消息管理', url: '' },
          { name: '社区公告管理', url: '/message/notice' },
          { name: GetPageTitleByMode(mode, '社区公告') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form {...formItemLayout} onSubmit={this.handleSubmit}>
            <FormItem label={'公告主题'}>
              {getFieldDecorator('noticeTitle', {
                getValueFromEvent: (event) => event.target.value.trim(),
                rules: [
                  { max: 40, message: '标题不能大于40字' },
                  { required: true, message: '请输入公告主题' }
                ]
              })(
                <Input placeholder='请输入公告主题（最多输入40个汉字）' disabled={mode === 'detail'}/>
              )}
              <Tooltip placement="top" title={'主题将向业主展示，请尽量限制字数'}>
                <Icon type="info-circle" style={{ position: 'absolute', right: '-30px', top: '4px', fontSize: '14px', color: '#1890FF' }}/>
              </Tooltip>
            </FormItem>
            <FormItem label={'公告类别'}>
              {getFieldDecorator('noticeType', {
                initialValue: 1,
                rules: [{ required: true, message: '请选择公告主题' }]
              })(
                <Select placeholder="请选择公告主题" disabled={mode === 'detail'}>
                  {MESSAGE_NOTICE_TYPES.map(item => (
                    <Option key={item.value} value={item.value}>{item.label}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label={'发布时间'}>
              {getFieldDecorator('pushTime', {
                rules: [{ required: true, message: '请选择发布时间' }]
              })(
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD HH:mm:ss" 
                  placeholder="请选择日期"
                  disabled={mode === 'detail'}
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="公告内容">
              {getFieldDecorator('content', {
                validateTrigger: 'onBlur',
                rules: [{ required: true, message: '请输入正文内容' }],
              })(
                <BraftEditor 
                  readOnly={mode === 'detail'}
                  style={{ border: '1px solid #D9D9D9', borderRadius: '4px' }}
                  // controls={['bold', 'italic', 'underline', 'text-color', 'separator', 'link', 'separator']} 
                  extendControls={[
                    { 
                      key: 'antd-uploader',
                      type: 'component',
                      component: (
                        <Upload
                          accept="image/*"
                          showUploadList={false}
                          customRequest={this.handleEditorUpload}
                        >
                          <button type="button" className="control-item button upload-button" data-title="插入图片">
                            <Icon type="picture" theme="filled" />
                          </button>
                        </Upload>
                      )
                    }]
                  }
                />
              )}
            </FormItem>
            <FormItem label={'发布范围'}>
              <Row gutter={8}>
                <Col span={20}>
                  {getFieldDecorator('pushScope', {
                    initialValue: 1,
                    rules: [{ required: true, message: '请选择发布范围' }]
                  })(
                    <Select placeholder="请选择公告主题" disabled={mode === 'detail'}>
                      {RELEASE_RANGE.map(item => (
                        <Option key={item.value} value={item.value}>{item.label}</Option>
                      ))}
                    </Select>
                  )}
                </Col>
                <Col span={4}>
                  {
                    pushScope === 2 && 
                    <Button disabled={mode === 'detail'} type="dashed" onClick={() => this.setState({ communityModalVisible: true })}>添加</Button>
                  }
                </Col>
              </Row>
            </FormItem>
            {
              communityTableList.length && pushScope === 2 ?
              (
                <Row gutter={24}>
                  <Col span={12} offset={7}>
                    {this.renderCommunityTableList(communityTableList)}
                  </Col>
                </Row>
              ) : null
            }
          </Form>
          <FooterToolbar>
            {mode !== 'detail' && <Button type="primary" onClick={this.handleSubmit}>提交</Button>}
            <Button onClick={this.handleCancel}>{mode === 'detail' ? '返回' : '取消'}</Button>
          </FooterToolbar>

          <SearchCommunityModal
            multiple
            visible={communityModalVisible}
            onConfirm={this.handleCommunityModalOk}
            onCancel={this.handleCommunityModalCancel}
          />
        </Spin>
      </PageWrapper>
    )
  }
};

export default Form.create()(NoticeActionsPage);
