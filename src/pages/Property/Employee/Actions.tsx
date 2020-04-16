import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { connect } from 'dva';
import { Form, Input, Select, Spin, Button, Switch, Upload, Icon, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import { EmployeeActionsType } from '@/services/property';
import StandardTable from '@/components/StandardTable';
import PageWrapper from '@/components/PageWrapper';
import FooterToolbar from '@/components/FooterToolbar';
import SearchCommunityModal from '@/components/SearchCommunityModal';
import { GetPageQuery, GetPageTitleByMode } from '@/utils/utils';
import { formItemLayout, MAX_UPLOAD_SIZE } from '@/utils/config';
import { GetUserBaseInfo } from '@/utils/cache';
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
  uploadLoading: boolean;
  visible: boolean;
}

@connect(({ loading, global }) => ({
  pageLoading: loading.models['employee'],
  allValidStationList: global.allValidStationList,
}))
class EmployeeActionsPage extends PureComponent<IProps, IState> {
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
      type: 'global/getAllStationListByValid'
    })

    if (mode !== 'create' && id) {
      let result = await dispatch({
        type: 'employee/getEmployeeDetail',
        payload: { employeeId: id }
      })
  
      if (result) {
        this.handleFullBaseInfo(result);
      }
    }
  }

  handleFullBaseInfo = result => {
    const { form } = this.props;
    const { employee, communitys } = result;

    const newCommunityIds = [];
    communitys.map(item => {
      newCommunityIds.push(item.communityId);
    })

    const newDetail = {
      communityTableList: communitys,
      communityIds: newCommunityIds,
      isShow: employee.isShow === 1 ? true : false
    }

    const detail = Object.assign(employee, newDetail);

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

      const { 
        communityIds,
        stationId,
        employeeName,
        employeePhone,
        jobNo,
        picsUrl,
        remark,
        isShow,
        serviceTime,
        servicePhone,
      } = values;

      const params: EmployeeActionsType = {
        communityIds: communityIds.join(','),
        stationId,
        employeeName,
        employeePhone,
        isShow: isShow ? 1 : 0
      }

      if (jobNo) {
        params['jobNo'] = jobNo;
      }
      if (picsUrl) {
        params['picsUrl'] = picsUrl;
      }
      if (remark) {
        params['remark'] = remark;
      }
      if (serviceTime) {
        params['serviceTime'] = serviceTime;
      }
      if (servicePhone) {
        params['servicePhone'] = servicePhone;
      }

      if (mode === 'edit' && id) {
        params['id'] = id;

        dispatch({
          type: 'employee/editEmployee',
          payload: params
        })
        return
      }
      dispatch({
        type: 'employee/createEmployee',
        payload: params
      })
    })
  }

  handleSubCommunityCheck = (rule, value, next) => {
    if (value.length <= 0) {
      next('请关联社区')
    }

    next();
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

  handleCommunityModalOk = (selectedRowKeys, selectedRows) => {
    this.props.form.setFieldsValue({
      communityIds: selectedRowKeys,
      communityTableList: selectedRows
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

  renderCommunityTableList = list => (
    <StandardTable
      rowKey='id'
      pagination={false}
      columns={this.communityColumns}
      dataSource={list}
    />
  )

  render() {
    const { mode, uploadLoading, visible } = this.state;
    const { pageLoading, form: { getFieldDecorator, getFieldValue }, allValidStationList } = this.props;
    
    const { merchantName } = GetUserBaseInfo();
    // form set必须要先已存在的值
    getFieldDecorator('merchantName', { initialValue: '' });
    const currentMerchant = getFieldValue('merchantName') ? getFieldValue('merchantName') : merchantName;
    const isShow = getFieldValue('isShow');
    getFieldDecorator('communityTableList', { initialValue: [] });
    const communityTableList = getFieldValue('communityTableList');
    const image = getFieldValue('picsUrl') ? getFieldValue('picsUrl') : '';

    return (
      <PageWrapper 
        title={GetPageTitleByMode(mode, '员工')}
        showBack
        customBreadcrumbmap={[
          { name: '物业服务管理', url: '' },
          { name: '员工管理', url: '/property/employee' },
          { name: GetPageTitleByMode(mode, '员工') },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Form {...formItemLayout}>
            <FormItem label={'绑定商户'}>
              <Input value={currentMerchant} disabled/>
            </FormItem>
            <FormItem label={'岗位名称'}>
              {getFieldDecorator('stationId', {
                rules: [{ required: true, message: '请选择岗位' }]
              })(
                <Select placeholder="请选择岗位" disabled={mode === 'detail'}>
                  {
                    allValidStationList.map(item => (
                      <Option key={item.id} value={item.id}>{item.stationName}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label={'员工姓名'}>
              {getFieldDecorator('employeeName', {
                rules: [{ required: true, message: '请输入员工姓名' }]
              })(
                <Input placeholder='请输入住户姓名' disabled={mode === 'detail'}/>
              )}
            </FormItem>
            <FormItem label={'员工手机号'}>
              {getFieldDecorator('employeePhone', {
                rules: [
                  { pattern: REGEX.MOBILE, message: '请输入正确格式手机号' },
                  { required: true, message: '请输入住户手机号' }
                ]
              })(
                <Input placeholder='请输入员工手机号' disabled={mode === 'detail'}/>
              )}
            </FormItem>
            <FormItem label={'员工工号'}>
              {getFieldDecorator('jobNo')(
                <Input placeholder='请输入员工工号' disabled={mode === 'detail'}/>
              )}
            </FormItem>
            <FormItem label={'员工照片'}>
              {getFieldDecorator('picsUrl', {
                // valuePropName: 'fileList',
                getValueFromEvent: this.normFile,
              })
              (
                <Upload
                  listType="picture-card"
                  action={'/api/v1/coreservice/common/uploadPicture'}
                  name={'uploadPicture'}
                  showUploadList={false}
                  beforeUpload={this.handleBeforeUpload}
                  onChange={this.handleUploadChange}
                  disabled={mode === 'detail'}
                >
                  {
                    !uploadLoading && image ? 
                    (<img src={image} style={{ width: '100px', height: '100px' }}/>) : 
                    <Icon type={uploadLoading ? 'loading' : 'plus'} />
                  }
                </Upload>
              )}
            </FormItem>
            <FormItem label={'职责描述'}>
              {getFieldDecorator('remark', {
                rules: [
                  { max: 20, message: '不得超过20字' },
                ]
              })(
                <Input placeholder='请输入职责描述，不超过20字' disabled={mode === 'detail'}/>
              )}
            </FormItem>
            <FormItem label='向住户展示'>
              {getFieldDecorator('isShow', {
                valuePropName: 'checked'
              })(
                <Switch disabled={mode === 'detail'} checkedChildren="开" unCheckedChildren="关"/>
              )}
            </FormItem>
            <FormItem label='服务时间'>
              {getFieldDecorator('serviceTime', {
                rules: [{ required: isShow, message: '请输入服务时间' }]
              })(
                <Input placeholder='请输入服务时间'  disabled={mode === 'detail'}/>
              )}
            </FormItem>
            <FormItem label={'服务电话'}>
              {getFieldDecorator('serviceNumber')(
                <Input placeholder='请输入服务电话' disabled={mode === 'detail'}/>
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

export default Form.create()(EmployeeActionsPage);
