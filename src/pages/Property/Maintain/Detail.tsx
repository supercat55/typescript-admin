import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Row, Col, Descriptions, Button, Input, Select, Modal, message, Divider } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import PageWrapper from '@/components/PageWrapper';
import FooterToolbar from '@/components/FooterToolbar';
import PageLoading from '@/components/PageLoading';
import { GetUserBaseInfo } from '@/utils/cache';
import { formItemLayout } from '@/utils/config';
import { StateType } from './model';

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  allMaintainStationList: any[];
  allMaintainEmployeeListByStation: any[];
}

interface IState {
  id: string;
  assignVisible: boolean;
  confirmVisible: boolean;
}

@connect(({ loading, maintain, global }) => ({
  maintainDetail: maintain.maintainDetail,
  allMaintainStationList: global.allMaintainStationList,
  allMaintainEmployeeListByStation: global.allMaintainEmployeeListByStation,
  pageLoading: loading.effects['maintain/getMaintainDetail'],
}))
class MaintailDetail extends PureComponent<IProps, IState> {
  state: IState = {
    id: this.props.match.params && this.props.match.params.id,
    assignVisible: false,
    confirmVisible: false,
  }

  componentDidMount() {
    this.init();

    this.handleSearchDetail();
  }

  init = async() => {
    const { dispatch } = this.props;

    await dispatch({
      type: 'global/getAllMaintainStationList',
      payload: {
        pageNum: 1,
        pageSize: 100,
        stationType: 2,
        isValid: 1
      }
    })
  }

  handleSearchDetail = async() => {
    const { dispatch } = this.props;
    const { id } = this.state;

    dispatch({
      type: 'maintain/getMaintainDetail',
      payload: { id }
    })
  }

  handleStationChange = value => {
    const { dispatch, maintainDetail } = this.props;

    dispatch({
      type: 'global/getAllMaintainEmployeeListByStation',
      payload: { 
        stationId: value,
        communityId: maintainDetail.communityId,
        isValid: 1
      }
    })
  }

  handleAssignModalOk = () => {
    const { id } = this.state;
    const { form, dispatch } = this.props;
    
    form.validateFields(async(err, values) => {
      if (err) return;

      let result = await dispatch({
        type: 'maintain/assginEmployee',
        payload: {
          id,
          fixUserId: values.fixUserId
        }
      })

      if (result) {
        message.success('指派员工成功');
        this.handleAssignModalCancel();
        this.handleSearchDetail();
      }
    })
  }

  handleAssignModalCancel = () => {
    this.setState({
      assignVisible: false
    })
  }

  handleCompletedModalOk = () => {
    const { id } = this.state;
    const { form, dispatch } = this.props;
    
    form.validateFields(async(err, values) => {
      if (err) return;

      let result = await dispatch({
        type: 'maintain/completedMaintain',
        payload: {
          id,
          handleContent: values.handleContent
        }
      })

      if (result) {
        message.success('确认完成成功');
        this.handleCompletedModalCancel();
        this.handleSearchDetail();
      }
    })
  }

  handleCompletedModalCancel = () => {
    this.setState({
      confirmVisible: false,
    })
  }

  handleCancel = () => {
    router.goBack();
  }

  render() {
    const { assignVisible, confirmVisible } = this.state;
    const { pageLoading, maintainDetail, form: { getFieldDecorator, getFieldValue }, allMaintainStationList, allMaintainEmployeeListByStation } = this.props;
    const { loginType } = GetUserBaseInfo();
    if (!maintainDetail || pageLoading) return <PageLoading/>
    const stationId = getFieldValue('stationId');

    return (
      <PageWrapper 
        title='详情'
        showBack
        customBreadcrumbmap={[
          { name: '物业服务管理', url: '' },
          { name: '报事报修', url: '/property/maintain' },
          { name: '详情' },
        ]}
      >
        <Descriptions title='工单信息'>
          <Descriptions.Item label='工单单号'>{maintainDetail.repairNum}</Descriptions.Item>
          <Descriptions.Item label='报修状态'>{maintainDetail.statusDesc}</Descriptions.Item>
          {
            maintainDetail.status !== 0 &&
            <Descriptions.Item label='派工人'>{maintainDetail.handleUserName}</Descriptions.Item>
          }
          {
            maintainDetail.status !== 0 &&
            <Descriptions.Item label='处理商户'>{maintainDetail.merchantName}</Descriptions.Item>
          }
          {
            maintainDetail.status !== 0 &&
            <Descriptions.Item label='指派给'>{maintainDetail.fixUserName}</Descriptions.Item>
          }
          {
            maintainDetail.status === 2 &&
            <Descriptions.Item label='处理结果'>{maintainDetail.handleContent}</Descriptions.Item>
          }
           {
            maintainDetail.status === 2 &&
            <Descriptions.Item label='完成时间'>{maintainDetail.completeTime}</Descriptions.Item>
          }
        </Descriptions>
        <Divider/>
        <Descriptions title='报修信息'>
          <Descriptions.Item label='报修人'>{maintainDetail.repairUserName}</Descriptions.Item>
          <Descriptions.Item label='手机号'>{maintainDetail.repairPhone}</Descriptions.Item>
          <Descriptions.Item label='报修时间'>{maintainDetail.repairTime}</Descriptions.Item>
          <Descriptions.Item label='联系人姓名'>{maintainDetail.contactName}</Descriptions.Item>
          <Descriptions.Item label='联系人手机号'>{maintainDetail.contactPhone}</Descriptions.Item>
        </Descriptions>
        <Divider/>
        <Descriptions>
          <Descriptions.Item label='小区名称'>{maintainDetail.communityName}</Descriptions.Item>
          <Descriptions.Item label='类型'>{maintainDetail.typeDesc}</Descriptions.Item>
          <Descriptions.Item label='报修位置'>{maintainDetail.spot}</Descriptions.Item>
        </Descriptions>
        <Descriptions>
          <Descriptions.Item label='报修内容'>{maintainDetail.repairContent}</Descriptions.Item>
        </Descriptions>
        <Row type="flex" justify="space-between">
          {
            maintainDetail.repairImages.length ?
            maintainDetail.repairImages.map((item, index) => (
              <Col key={index}>
                <img src={item} alt="" style={{ width: 280 }}/>
              </Col>
            )) : null
          }
        </Row>
        <FooterToolbar>
          <Button onClick={this.handleCancel}>返回</Button>
          {
            maintainDetail.status === 0 && loginType !== 'operation' ?
            <Button type="primary" onClick={() => this.setState({ assignVisible: true })}>指派员工</Button> : null
          }
          {
            maintainDetail.status === 2 || loginType === 'operation' ? null :
            <Button type="primary" onClick={() => this.setState({ confirmVisible: true })}>确认完成</Button>
          }
        </FooterToolbar>
        
        {
          assignVisible &&
          (
            <Modal
              title="指派员工" 
              visible={assignVisible}
              onOk={this.handleAssignModalOk}
              onCancel={this.handleAssignModalCancel}
            >
              <Form {...formItemLayout}>
                <FormItem label={'岗位名称'}>
                  {getFieldDecorator('stationId', {
                    rules: [{
                      required: true,
                      message: '请选择指派员工岗位'
                    }]
                  })(
                    <Select placeholder='请选择指派员工岗位' onChange={(value) => this.handleStationChange(value)}>
                      {
                        allMaintainStationList.map(item => (
                          <Option key={item.id} value={item.id}>{item.stationName}</Option>
                        ))
                      }
                    </Select>
                  )}
                </FormItem>
                <FormItem label={'处理员工'}>
                  {getFieldDecorator('fixUserId', {
                    rules: [{
                      required: true,
                      message: '请选择处理员工'
                    }]
                  })(
                    <Select placeholder='请选择处理员工' disabled={!stationId} loading={pageLoading}>
                      {
                        allMaintainEmployeeListByStation.map(item => (
                          <Option key={item.id} value={item.id}>{item.employeeName}</Option>
                        ))
                      }
                    </Select>
                  )}
                </FormItem>
              </Form>
            </Modal>
          )
        }

        {
          confirmVisible && 
          (
            <Modal
              title={'确认完成'}
              visible={confirmVisible}
              destroyOnClose
              onOk={this.handleCompletedModalOk}
              onCancel={this.handleCompletedModalCancel}
            >
              <Form>
                <FormItem label={'请填写处理结果，报修人会及时得到反馈（不超过200字'}>
                  {getFieldDecorator('handleContent', {
                    rules: [{
                      required: true,
                      message: '请填写处理结果'
                    }]
                  })(
                    <TextArea rows={4} placeholder="请填写处理结果"/>
                  )}
                </FormItem>
              </Form>
            </Modal>
          )
        }
      </PageWrapper>
    )
  }
};


export default Form.create()(MaintailDetail)
