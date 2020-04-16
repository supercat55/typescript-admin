import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Form, Input, Select, Spin, Button, Popconfirm } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { uniqBy, map } from 'lodash';
import { StateType } from './model';
import StandardTable from '@/components/StandardTable';
import PageWrapper from '@/components/PageWrapper';
import FooterToolbar from '@/components/FooterToolbar';
import SearchCommunityModal from '@/components/SearchCommunityModal';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { formItemLayout } from '@/utils/config';

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
  uploadLoading: boolean;
  visible: boolean;
}

@connect(({ loading, homeConfig }) => ({
  pageLoading: loading.models['homeConfig'],
  iconList: homeConfig.iconList,
  advertisementList: homeConfig.advertisementList,
  scrollBannerList: homeConfig.scrollBannerList,
  bottomBannerList: homeConfig.bottomBannerList,
}))
class HomeConfigActionsPage extends PureComponent<IProps, IState> {
  state = {
    mode: 'create',
    id: this.props.match.params && this.props.match.params.id,
    uploadLoading: false,
    visible: false
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
  
  componentDidMount() {
    const urlParams = GetPageQuery();
    const mode = urlParams.mode ? urlParams.mode : '';

    this.setState({ mode }, this.init)
  }

  init = async() => {
    const { id, mode } = this.state;
    const { dispatch } = this.props;

    await dispatch({
      type: 'homeConfig/getHomeConfigAllTemplate'
    })

    if (mode !== 'create' && id) {
      let result = await dispatch({
        type: 'homeConfig/getHomeConfigDetail',
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

    const communityList = [];
    const newCommunityIds = [];

    for (let i in list) {
      let item = list[i];
      communityList.push({
        ...item,
        id: item.communityId,
      });
    }
    list.map(item => {
      newCommunityIds.push(item.communityId);
    })

    const newDetail = {
      communityTableList: communityList,
      communityIds: newCommunityIds,
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

      const { conName, iconTempId, bannerTempId, advertisementTempId, bottomBannerTempId, communityTableList } = values;
      let communityList = [];

      for (let i in communityTableList) {
        let item = communityTableList[i];

        communityList.push({
          communityId: item.id,
          communityName: item.communityName
        });
      }

      const params = {
        conName,
        list: communityList
      }

      if (iconTempId) {
        params['iconTempId'] = iconTempId;
      }
      if (bannerTempId) {
        params['bannerTempId'] = bannerTempId;
      }
      if (advertisementTempId) {
        params['advertisementTempId'] = advertisementTempId;
      }
      if (bottomBannerTempId) {
        params['bottomBannerTempId'] = bottomBannerTempId;
      }
      
      if (mode === 'edit' && id) {
        params['id'] = id;

        dispatch({
          type: 'homeConfig/editHomeConfig',
          payload: params
        })
        return
      }
      dispatch({
        type: 'homeConfig/createHomeConfig',
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

  handleSubCommunityCheck = (rule, value, next) => {
    if (value.length <= 0) {
      next('请关联社区')
    }

    next();
  }

  handleCommunityModalOk = (selectedRowKeys, selectedRows) => {
    const { form } = this.props;
    const communityTableList = form.getFieldValue('communityTableList');
    
    const newTableList = communityTableList.concat(selectedRows);
    const unqiList = uniqBy(newTableList, 'id');

    form.setFieldsValue({
      communityIds: map(unqiList, 'id'),
      communityTableList: unqiList
    })

    this.handleCommunityModalCancel();
  }

  handleCommunityModalCancel = () => {
    this.setState({
      visible: false
    })
  }

  handleCancel = () => {
    router.goBack();
  }

  renderCommunityTableList = list => (
    <StandardTable
      rowKey={'id'}
      pagination={false}
      columns={this.state.mode === 'detail' ? this.detailCommunityColumns : this.communityColumns}
      dataSource={list}
    />
  )

  render() {
    const { mode, visible } = this.state;
    const { pageLoading, form: { getFieldDecorator, getFieldValue }, iconList, advertisementList, scrollBannerList, bottomBannerList } = this.props;

    getFieldDecorator('communityTableList', { initialValue: [] });
    const communityTableList = getFieldValue('communityTableList');

    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '首页配置')}
        showBack
        customBreadcrumbmap={[
          { name: '参数管理', url: '' },
          { name: '首页配置', url: '/parameter/home-config' },
          { name: GetPageTitleByMode(mode, '首页配置') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form {...formItemLayout}>
            <FormItem label={'配置名称'}>
              {getFieldDecorator('conName', {
                rules: [{ required: true, message: '请输入配置名称' }]
              })(
                <Input placeholder='请输入配置名称' disabled={mode === 'detail'}/>
              )}
            </FormItem>
            <FormItem label={'子应用模版'}>
              {getFieldDecorator('iconTempId')(
                <Select placeholder="请选择子应用模版" disabled={mode === 'detail'}>
                  {
                    iconList.map(item => (
                      <Option key={item.id} value={item.id}>{item.templateName}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label={'滚动banner模版'}>
              {getFieldDecorator('bannerTempId')(
                <Select placeholder="请选择滚动banner模版" disabled={mode === 'detail'}>
                  {
                    scrollBannerList.map(item => (
                      <Option key={item.id} value={item.id}>{item.templateName}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label={'广告位模版'}>
              {getFieldDecorator('advertisementTempId')(
                <Select placeholder="请选择广告位模版" disabled={mode === 'detail'}>
                  {
                    advertisementList.map(item => (
                      <Option key={item.id} value={item.id}>{item.templateName}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label={'底部banner模版'}>
              {getFieldDecorator('bottomBannerTempId')(
                <Select placeholder="请选择底部banner模版" disabled={mode === 'detail'}>
                  {
                    bottomBannerList.map(item => (
                      <Option key={item.id} value={item.id}>{item.templateName}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label={'选择社区'}>
              {getFieldDecorator('communityIds', {
                initialValue: [],
                rules: [
                  { required: true, validator: (rule, value, callback) => this.handleSubCommunityCheck(rule, value, callback) }
                ]
              })(
                <Button type="dashed" disabled={mode === 'detail'} onClick={() => this.setState({ visible: true })}>设置社区</Button>
              )}
            </FormItem>
            {
              communityTableList.length ?
              <FormItem label={'关联社区'}>
                {this.renderCommunityTableList(communityTableList)}
              </FormItem> : null
            }
          </Form>  
          <FooterToolbar>
            {mode !== 'detail' && <Button type="primary" onClick={this.handleSubmit}>提交</Button>}
            <Button onClick={this.handleCancel}>{mode === 'edit' ? '取消' : '返回'}</Button>
          </FooterToolbar>

          <SearchCommunityModal
            multiple
            visible={visible}
            onConfirm={this.handleCommunityModalOk}
            onCancel={this.handleCommunityModalCancel}
          />
        </Spin>
      </PageWrapper>
    )
  }
};

export default Form.create()(HomeConfigActionsPage);
