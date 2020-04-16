import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Form, Row, Col, Input, Select, Spin, Button, Popconfirm, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import { uniqBy } from 'lodash';
import StandardTable from '@/components/StandardTable';
import PageWrapper from '@/components/PageWrapper';
import FooterToolbar from '@/components/FooterToolbar';
import SearchChannelMerchantModal from '@/components/SearchChannelMerchantModal';
import SearchCommunityModal from '@/components/SearchCommunityModal';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { formItemLayout } from '@/utils/config';
import { CUSTOMER_CHANNEL_TYPES, CUSTOMER_CHANNEL_SCOPE } from '@/utils/const';
import REGEX from '@/utils/regex';

const FormItem = Form.Item;
const Option = Select.Option;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  allValidStationList: any[];
}

interface IState {
  mode: string;
  id: string;
  merchantVisible: boolean;
  communityVisible: boolean;
}

@connect(({ loading }) => ({
  pageLoading: loading.models['customerChannel'],
}))
class CustomerChannelActionsPage extends PureComponent<IProps, IState> {
  state = {
    mode: 'create',
    id: this.props.match.params && this.props.match.params.id,
    merchantVisible: false,
    communityVisible: false,
  }

  private communityColumns = [
    { title: '小区名称', dataIndex: 'communityName', key: 'communityName' },
    { title: '所在省市', dataIndex: 'address', key: 'address', 
      render: (_, record) => (
        <span>{record.province + record.city}</span>
      )
    },
    { title: '操作', 
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

  private detailCommunityColumns = [
    { title: '小区名称', dataIndex: 'communityName', key: 'communityName' },
    { title: '所在省市', dataIndex: 'address', key: 'address', 
      render: (_, record) => (
        <span>{record.province + record.city}</span>
      )
    },
  ]

  private merchantColumns = [
    { title: '商户编号', dataIndex: 'merchantNum', key: 'communityName' },
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName' },
    { title: '操作', width: 100,
      render: (text, record, index) =>
        (
          <div className='table-actions'>
            <Popconfirm
              title="你确定删除此商户吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => this.handleRemoveMerchantItem(index)}
            >
              <span>移除</span>
            </Popconfirm>
          </div>
        )
      }
  ]

  private detailMerchantColumns = [
    { title: '商户编号', dataIndex: 'merchantNum', key: 'communityName' },
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName' },
  ]
  
  componentDidMount() {
    const urlParams = GetPageQuery();
    const mode = urlParams.mode ? urlParams.mode : '';

    this.setState({ mode }, this.init)
  }

  init = async() => {
    const { id, mode } = this.state;
    const { dispatch } = this.props;

    if (mode !== 'create' && id) {
      let result = await dispatch({
        type: 'customerChannel/getCustomerChannelDetail',
        payload: { id }
      })
  
      if (result) {
        this.handleFullBaseInfo(result);
      }
    }
  }

  handleFullBaseInfo = result => {
    const { form } = this.props;
    const { list } = result;

    let newDetail = {
      merchantTableList: [],
      communityTableList: []
    };

    if (result.channelScope === 0) {
      newDetail['merchantTableList'] = list;

    } else if (result.channelScope === 1) {
      let tableList = [];

      for (let i in list) {
        let item = list[i];
        tableList.push({
          ...item,
          id: item.communityId,
        });
      }
      newDetail['communityTableList'] = tableList
    }

    const detail = Object.assign(result, newDetail);
    
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

      const { appId, channelType, sourceName, channelRefereePhone, wechatPublicId, wechatSecretkey, remarks, channelScope, communityTableList, merchantTableList } = values;

      const params = {
        appId,
        channelType,
        sourceName,
        channelRefereePhone,
        channelScope
      }

      let list = [];

      if (channelScope === 0) {
        if (!merchantTableList.length) {
          message.error('请选择商户');
          return;
        }

        for (let i in merchantTableList) {
          let item = merchantTableList[i];
  
          list.push({
            merchantNum: item.merchantNum,
            merchantName: item.merchantName
          });
        }

        params['list'] = list;
      } else if (channelScope === 1) {
        if (!communityTableList.length) {
          message.error('请选择小区');
          return;
        }

        for (let i in communityTableList) {
          let item = communityTableList[i];
  
          list.push({
            communityId: item.id,
            communityName: item.communityName
          });
        }
        params['list'] = list;
      }

      if (wechatPublicId) {
        params['wechatPublicId'] = wechatPublicId;
      }
      if (wechatSecretkey) {
        params['wechatSecretkey'] = wechatSecretkey;
      }
      if (remarks) {
        params['remarks'] = remarks;
      }
      
      if (mode === 'edit' && id) {
        params['id'] = id;

        dispatch({
          type: 'customerChannel/editCustomerChannel',
          payload: params
        })
        return
      }
      dispatch({
        type: 'customerChannel/createCustomerChannel',
        payload: params
      })
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

  // 移除商户列表某一项
  handleRemoveMerchantItem = index => {
    const { form: { getFieldValue, setFieldsValue } } = this.props;
    const merchantTableList = getFieldValue('merchantTableList');
    const dataSource = merchantTableList.map(item => ({...item}))

    dataSource.splice(index, 1);

    setFieldsValue({ merchantTableList: dataSource })
  }

  handleShowModal = scope => {
    if (scope === 0) {
      this.setState({
        merchantVisible: true
      })
    } else if (scope === 1) {
      this.setState({
        communityVisible: true
      })
    }
  }

  handleCommunityModalOk = (selectedRowKeys, selectedRows) => {
    const { form } = this.props;
    const communityTableList = form.getFieldValue('communityTableList');
    
    const newTableList = communityTableList.concat(selectedRows);

    form.setFieldsValue({
      communityTableList: uniqBy(newTableList, 'id'),
      merchantTableList: []
    })

    this.handleCommunityModalCancel();
  }

  handleCommunityModalCancel = () => {
    this.setState({
      communityVisible: false
    })
  }

  handleMerchantModalOk = (selectedRowKeys, selectedRows) => {
    const { form } = this.props;
    const merchantTableList = form.getFieldValue('merchantTableList');
    
    const newTableList = merchantTableList.concat(selectedRows);

    form.setFieldsValue({
      merchantTableList: uniqBy(newTableList, 'merchantNum'),
      communityTableList: []
    })

    this.handleMerchantModalCancel();
  }

  handleMerchantModalCancel = () => {
    this.setState({
      merchantVisible: false
    })
  }

  handleCancel = () => {
    router.goBack();
  }

  renderCommunityTableList = list => (
    <StandardTable
      rowKey={record => record.id || record.communityId}
      pagination={false}
      columns={this.state.mode === 'detail' ? this.detailCommunityColumns : this.communityColumns}
      dataSource={list}
      bordered
    />
  )

  renderMerchantTableList = list => (
    <StandardTable
      rowKey={'merchantNum'}
      pagination={false}
      columns={this.state.mode === 'detail' ? this.detailMerchantColumns : this.merchantColumns}
      dataSource={list}
      bordered
    />
  )

  render() {
    const { mode, merchantVisible, communityVisible } = this.state;
    const { pageLoading, form: { getFieldDecorator, getFieldValue } } = this.props;

    getFieldDecorator('communityTableList', { initialValue: [] });
    const communityTableList = getFieldValue('communityTableList');
    getFieldDecorator('merchantTableList', { initialValue: [] });
    const merchantTableList = getFieldValue('merchantTableList');

    const channelType = getFieldValue('channelType') !== undefined ? getFieldValue('channelType') : 0;
    const channelScope = getFieldValue('channelScope') !== undefined ? getFieldValue('channelScope') : 2;

    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '客户渠道配置')}
        showBack
        customBreadcrumbmap={[
          { name: '参数管理', url: '' },
          { name: '首页配置', url: '/parameter/customer-channel' },
          { name: GetPageTitleByMode(mode, '客户渠道配置') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form {...formItemLayout}>
            <FormItem label={'通联appid'}>
              {getFieldDecorator('appId', {
                rules: [{ required: true, message: '请输入通联appId' }]
              })(
                <Input placeholder='请输入通联appId' disabled={mode === 'detail'}/>
              )}
            </FormItem>
            <FormItem label={'渠道类型'}>
              {getFieldDecorator('channelType',{
                initialValue: 0,
                rules: [{ required: true }]
              })(
                <Select placeholder="请选择渠道类型" disabled={mode === 'detail'}>
                  {
                    CUSTOMER_CHANNEL_TYPES.map(item => (
                      <Option key={item.value} value={item.value}>{item.label}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label={'来源场景名称'}>
              {getFieldDecorator('sourceName', {
                rules: [{ required: true, message: '请输入来源场景名称' }]
              })(
                <Input placeholder='请输入来源场景名称' disabled={mode === 'detail'}/>
              )}
            </FormItem>
            <FormItem label={'渠道推荐人手机号'}>
              {getFieldDecorator('channelRefereePhone', {
                rules: [
                  { required: true, message: '请输入渠道推荐人手机号' },
                  { pattern: REGEX.MOBILE, message: '手机号格式不正确' }
                ]
              })(
                <Input placeholder='请输入渠道推荐人手机号' disabled={mode === 'detail'}/>
              )}
            </FormItem>
            {
              channelType === 0 ?
              <Fragment>
                <FormItem label={'微信公众号Id'}>
                  {getFieldDecorator('wechatPublicId', {
                    rules: [{ required: true, message: '请输入微信公众号Id' }]
                  })(
                    <Input placeholder='请输入微信公众号Id' disabled={mode === 'detail'}/>
                  )}
                </FormItem>
                <FormItem label={'微信secretkey'}>
                  {getFieldDecorator('wechatSecretkey', {
                    rules: [{ required: true, message: '请输入微信secretkey' }]
                  })(
                    <Input placeholder='请输入微信secretkey' disabled={mode === 'detail'}/>
                  )}
                </FormItem>
              </Fragment> : null
            }
            <FormItem label={'备注'}>
              {getFieldDecorator('remarks')(
                <Input placeholder='请输入备注' disabled={mode === 'detail'}/>
              )}
            </FormItem>
            <FormItem label={'渠道范围'}>
              <Row gutter={24}>
                <Col span={16}>
                  {getFieldDecorator('channelScope', {
                    initialValue: 2,
                    rules: [
                      { required: true, message: '请选择渠道范围' },
                    ]
                  })(
                    <Select placeholder="请选择渠道范围" disabled={mode === 'detail'}>
                      {CUSTOMER_CHANNEL_SCOPE.map(item => (
                        <Option key={item.value} value={item.value}>{item.label}</Option>
                      ))}
                    </Select>
                  )}
                </Col>
                {
                  channelScope !== 2 ?
                  <Col span={8}>
                    <Button type="dashed" disabled={mode === 'detail'} onClick={() => this.handleShowModal(channelScope)}>添加</Button>
                  </Col> : null
                }
              </Row>
            </FormItem>
            {
              communityTableList.length ?
              <FormItem label={'关联社区'}>
                {this.renderCommunityTableList(communityTableList)}
              </FormItem> : null
            }
            {
              merchantTableList.length ?
              <FormItem label={'关联商户'}>
                {this.renderMerchantTableList(merchantTableList)}
              </FormItem> : null
            }
          </Form>  
          <FooterToolbar>
            {mode !== 'detail' && <Button type="primary" onClick={this.handleSubmit}>提交</Button>}
            <Button onClick={this.handleCancel}>{mode === 'edit' ? '取消' : '返回'}</Button>
          </FooterToolbar>

          <SearchChannelMerchantModal
            visible={merchantVisible}
            multiple
            onConfirm={this.handleMerchantModalOk}
            onCancel={this.handleMerchantModalCancel}
          />

          <SearchCommunityModal
            multiple
            visible={communityVisible}
            onConfirm={this.handleCommunityModalOk}
            onCancel={this.handleCommunityModalCancel}
          />
        </Spin>
      </PageWrapper>
    )
  }
};

export default Form.create()(CustomerChannelActionsPage);
