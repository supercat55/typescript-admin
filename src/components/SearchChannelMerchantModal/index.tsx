import React, { Component, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Modal, Form, Row, Col, Input, Table } from 'antd';
import { connect } from 'dva';
import { formItemHorizontalLayout } from '@/utils/config';
import { Debounce, Bind } from 'lodash-decorators'

const FormItem = Form.Item;

export interface SearchMerchantModalProps {
  dispatch?: Dispatch<AnyAction>;
  title?: string;
  visible?: boolean;
  multiple?: boolean;
  allChannelMerchantList?: any[];
  onConfirm: (rowKey: any[], row: any[]) => void;
  onCancel: () => void;
  tableLoading?: boolean;
}

interface IState {
  condition: string;
  selectedRow: any[];
  selectedRowKeys: string[];
  [index: string]: any;
}

@connect(({ loading, global }) => ({
  allChannelMerchantList: global.allChannelMerchantList,
  tableLoading: loading.effects['global/getAllChannerMerchantList'],
}))
class SearchChannelMerchantModal extends Component<SearchMerchantModalProps, IState> {
  state = {
    condition: '',
    selectedRow: [],
    selectedRowKeys: []
  }

  columns = [
    { title: '商户号', dataIndex: 'merchantNum', key: 'merchantNum' },
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName' },
  ]

  componentDidMount() {
    this.handleSearchList();
  }
  
  @Bind()
  @Debounce(500)
  handleSearchList() {
    const { condition } = this.state;
    const { dispatch } = this.props;

    let params = {};

    if (condition) {
      params['condition'] = condition
    }
    dispatch({
      type: 'global/getAllChannerMerchantList',
      payload: params
    })
  }

  handleFormChang = (value, type) => {
    this.setState({
      [type]: value
    }, this.handleSearchList)
  }

  handleRowSelectionChange = (selectedRowKeys, selectedRow) => {
    this.setState({
      selectedRowKeys,
      selectedRow
    })
  }

  handleOk = () => {
    const { selectedRowKeys, selectedRow } = this.state;
    const { onConfirm } = this.props;

    onConfirm(selectedRowKeys, selectedRow);
  }

  handleCancel = () => {
    this.props.onCancel();
  }

  render() {
    const { condition } = this.state;
    const { visible, title = '选择商户', multiple, allChannelMerchantList, tableLoading } = this.props;
    const rowSelection = {
      type: multiple ? 'checkbox' as 'checkbox' : 'radio'  as 'radio',
      onChange: this.handleRowSelectionChange,
    }

    return (
      <Modal
        title={title}
        visible={visible}
        width={800}
        destroyOnClose
        maskClosable={false}
        okText={'确认'}
        cancelText={'取消'}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Fragment>
          <Form {...formItemHorizontalLayout}>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem label="搜索">
                  <Input
                    autoComplete="off"
                    placeholder="输入商户名称/商户号"
                    value={condition}
                    onChange={e => this.handleFormChang(e.target.value, 'condition')}
                  />
                </FormItem>
              </Col>
            </Row>
          </Form>
          <Table
            rowKey='id'
            style={{ marginTop: '24px' }}
            scroll={{ y: 400 }}
            pagination={false}
            rowSelection={rowSelection}
            columns={this.columns}
            dataSource={allChannelMerchantList}
            loading={tableLoading}
          />
        </Fragment>
      </Modal>
    )
  }
};

export default SearchChannelMerchantModal
