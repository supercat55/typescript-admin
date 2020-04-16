import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Badge, Button, Input, Modal, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { isEmpty } from 'lodash';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import FooterToolbar from '@/components/FooterToolbar';
import PageLoading from '@/components/PageLoading';
import { StateType } from './model';

const FormItem = Form.Item;
const { TextArea } = Input;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
}

interface IState {
  id: string;
  pageNum: number;
  pageSize: number;
  visible: boolean;
  itemId: string;
  current: any;
}

@connect(({ loading, operate }) => ({
  reconciliationDetail: operate.reconciliationDetail,
  pageLoading: loading.effects['operate/getOperateReconciliationDetail'],
}))
class CommunityCodeCollectionDetail extends PureComponent<IProps, IState> {
  state: IState = {
    id: this.props.match.params && this.props.match.params.id,
    pageNum: 1,
    pageSize: 10,
    visible: false,
    itemId: '',
    current: {},
  }

  private columns = [
    { title: '交易日期', dataIndex: 'transactionDate', key: 'transactionDate'},
    { title: '商户号', dataIndex: 'merchantNum', key: 'merchantNum' },
    { title: '社区系统订单号', dataIndex: 'orderCommunitySystemNumber', key: 'orderCommunitySystemNumber' },
    { title: '社区系统订单金额', dataIndex: 'orderCommunitySystemMoney', key: 'orderCommunitySystemMoney' },
    { title: '支付系统订单号', dataIndex: 'payNo', key: 'payNo' },
    { title: '支付系统流水号', dataIndex: 'payFlowNumber', key: 'payFlowNumber' },
    { title: '支付系统订单金额', dataIndex: 'payOrderAmount', key: 'payOrderAmount' },
    { title: '对账状态', dataIndex: 'stateDesc', key: 'stateDesc',
      render: (text, record) => <Badge status={record.stateBrdge} text={text}/>
    },
    { title: '操作', width: 200, fixed: 'right', 
      render: (text, record) => (
        record.reconciliationState == 0 ? 
        (
          <div className='table-actions'>
            <span onClick={() => this.handleActions('handle', record)}>处理</span>
          </div>
        ) :
        (
          <div className='table-actions'>
            <span onClick={() => this.handleActions('detail', record)}>查看</span>
          </div>
        )
      )
    }
  ]

  componentDidMount() {
    this.handleSearchDetail();
  }

  handleSearchDetail = async() => {
    const { dispatch } = this.props;
    const { id, pageNum, pageSize } = this.state;

    dispatch({
      type: 'operate/getOperateReconciliationDetail',
      payload: {
        transactionDate: id,
        pageNum,
        pageSize
      }
    })
  }

  handleActions = (mode, info) => {
    switch (mode) {
      case 'handle':
        this.setState({
          visible: true,
          itemId: info.id
        })
        break;
      case 'detail':
        this.handleCheckItemDetail(info);
        break;
      default:
        break;
    }
  }

  handleCheckItemDetail = async(info) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'operate/getOperateReconciliationHandleDetail',
      payload: { id: info.id }
    })
    
    this.setState({
      current: result,
      itemId: info.id,
      visible: true
    })
  }

  handleModalOk = () => {
    const { form, dispatch } = this.props;
    const { itemId } = this.state;

    form.validateFields(async(err, values) => {
      if (err) return;

      let result = await dispatch({
        type: 'operate/updateOperateReconciliation',
        payload: { 
          id: itemId,
          processingContent: values.processingContent
        }
      })

      if (result) {
        message.success('更新对账情况成功');

        this.handleModalCancel();
        this.handleSearchDetail();
      }
    })
  }

  handleModalCancel = () => {
    this.setState({
      visible: false,
      current: {}
    })
  }

  handleCancel = () => {
    router.goBack();
  }

  handleTabelChange = pagination => {
    this.setState({
      pageNum: pagination.current
    }, this.handleSearchDetail)
  }

  render() {
    const { pageNum, pageSize, visible, current } = this.state;
    const { pageLoading, reconciliationDetail, form: { getFieldDecorator } } = this.props;
    if (!reconciliationDetail || pageLoading) return <PageLoading/>
    
    const pagination = {
      total: reconciliationDetail.total,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper 
        title='详情'
        showBack
        customBreadcrumbmap={[
          { name: '运营数据', url: '' },
          { name: '对账情况', url: '/operate/reconciliation' },
          { name: '详情' },
        ]}
      >
        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={reconciliationDetail.list}
          pagination={pagination}
          onChange={this.handleTabelChange}
          scroll={{ x: 1500 }}
        />
        <FooterToolbar>
          <Button onClick={this.handleCancel}>返回</Button>
        </FooterToolbar>

        <Modal
          title={current ? '查看原因' : '处理原因'}
          visible={visible}
          destroyOnClose
          onOk={this.handleModalOk}
          onCancel={this.handleModalCancel}
        >
          <Form>
            <FormItem label={'请填写处理原因、方式等信息'}>
              {getFieldDecorator('processingContent', {
                initialValue: current.processingContent,
                rules: [{
                  required: true,
                  message: '请填写处理原因、方式等信息'
                }]
              })(
                <TextArea disabled={!isEmpty(current)} rows={4} placeholder="请填写处理原因、方式等信息"/>
              )}
            </FormItem>
            {
              !isEmpty(current) ?
              (
                <FormItem label={'处理人姓名'}>
                  {getFieldDecorator('processingUserName', {
                    initialValue: current.processingContent,
                    rules: [{ required: true }]
                  })(
                    <Input disabled placeholder="处理人姓名"/>
                  )}
                </FormItem>
              ) : null
            }
          </Form>
        </Modal>
      </PageWrapper>
    )
  }
};


export default Form.create()(CommunityCodeCollectionDetail)
