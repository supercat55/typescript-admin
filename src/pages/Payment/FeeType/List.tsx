import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Form, Button, Modal, Input, Radio, message } from 'antd'; 
import { connect } from 'dva';
import { FormComponentProps } from 'antd/lib/form';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import { StateType } from './model';
import styles from './index.scss'

const FormItem = Form.Item;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  tableLoading: boolean;
  globalPageSubMenu: any;
  allFeeTypeList: any[];
}

interface IState {
  pageNum: number;
  pageSize: number;
  visible: boolean;
}

@connect(({ menu, loading, paymentFeeType }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  feeTypeList: paymentFeeType.feeTypeList,
  feeTypeTotal: paymentFeeType.feeTypeTotal,
  iconList: paymentFeeType.iconList,
  tableLoading: loading.effects['paymentFeeType/getFeeTypeList'],
}))
class FeeTypePage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    visible: false
  }
  
  private columns = [
    { title: '绑定商户', dataIndex: 'merchantName', key: 'merchantName' },
    { title: '费用类型', dataIndex: 'feeName', key: 'feeName' },
    { title: '展示图标', dataIndex: 'iconUrl', key: 'iconUrl',
      render: text => (
        <img src={text} style={{ width: 30, height: 30 }}/>
      ) 
    },
    { title: '创建人', dataIndex: 'name', key: 'name' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  ]

  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({
      type: 'paymentFeeType/getFeeTypeIconList'
    })

    this.handleSearchList();
  }

  handleSearchList = () => {
    const { dispatch } = this.props;
    const { pageNum, pageSize } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    dispatch({
      type: 'paymentFeeType/getFeeTypeList',
      payload: params
    })
  }
  
  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        this.setState({ visible: true })
        break;
      default:
        break;
    }
  }

  handleModalOk = () => {
    const { dispatch, form } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;
      
      const { feeName, icon } = values;

      let checkResult = await dispatch({
        type: 'paymentFeeType/checkFeeTypeName',
        payload: { feeName }
      })
      
      if (checkResult['count'] === 0) {
        let result = await dispatch({
          type: 'paymentFeeType/createFeeType',
          payload: { 
            feeName,
            iconId: icon.id,
            iconUrl: icon.url
          }
        })

        if (result) {
          this.handleSearchList();
          this.handleModalCancel();
        }
      } else {
        message.warn('费用类型名重复，请重新输入');
      }
    })
  }

  handleModalCancel = () => {
    this.setState({
      visible: false
    })
  }
  
  handleTabelChange = pagination => {
    this.setState({
      pageNum: pagination.current
    }, this.handleSearchList)
  }

  render() {
    const { pageNum, pageSize, visible } = this.state;
    const { feeTypeList, feeTypeTotal, iconList, tableLoading, globalPageSubMenu, form: { getFieldDecorator } } = this.props;
    const pagination = {
      total: feeTypeTotal,
      current: pageNum,
      pageSize,
    };

    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 14 },
    };

    return (
      <PageWrapper title='费用类型管理'>
        { 
          globalPageSubMenu.PAYMENT_FEE_TYPE_CREATE_OR_EDIT &&
          <Button 
            type='primary'
            icon='plus'
            style={{ marginBottom: '30px' }} 
            onClick={() => this.handleActions('create', null)}
          >
            添加费用类型
          </Button>
        }

        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={feeTypeList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
        />

        <Modal
          visible={visible}
          width={650}
          destroyOnClose
          title='新增费用类型'
          okText='提交'
          cancelText='取消'
          onOk={this.handleModalOk}
          onCancel={this.handleModalCancel}
        >
          <Form className={styles.modalContent}>
            <FormItem label="费用类型" style={{ textAlign: 'left' }} {...formItemLayout}>
              {getFieldDecorator('feeName', {
                rules: [
                  { required: true, message: '请输入费用类型' },
                  { max: 10, message: '费用类型名称不能超过10个字' }
                ]
              })(
                <Input placeholder="不超过10个字"/>
              )}
            </FormItem>
            <div>展示图标 （此图标将在缴费账单中展示给用户看）</div>
            <FormItem label="费用类型">
              {getFieldDecorator('icon', {
                rules: [
                  { required: true, message: '请选择费用类型展示图标' },
                ]
              })(
                <Radio.Group>
                  {
                    iconList.map(item => (
                      <Radio key={item.id} value={item}>
                        <img src={item.url}/>
                        <span className={styles.text}>{`（含义：${item.name}）`}</span>
                      </Radio>
                    ))
                  }
                </Radio.Group>,
              )}
            </FormItem>
          </Form>
        </Modal>
      </PageWrapper>
    )
  }
};


export default Form.create()(FeeTypePage)
