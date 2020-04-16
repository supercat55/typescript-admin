import React, { Component, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Modal, Form, Row, Col, Input, Select, Table } from 'antd';
import { connect } from 'dva';
import { formItemHorizontalLayout } from '@/utils/config';
import { Debounce, Bind } from 'lodash-decorators'

const FormItem = Form.Item;
const Option = Select.Option;

export interface SearchMerchantModalProps {
  dispatch?: Dispatch<AnyAction>;
  title?: string;
  visible?: boolean;
  multiple?: boolean;
  relationType?: number;
  childMerchant?: boolean;
  allOrganizationList?: any[];
  allMerchantList?: any[];
  onConfirm: (rowKey: any[], row: any[]) => void;
  onCancel: () => void;
  tableLoading?: boolean;
}

interface IState {
  orgId: string;
  name: string;
  selectedRow: any[];
  selectedRowKeys: string[];
  [index: string]: any;
}

@connect(({ loading, global }) => ({
  allOrganizationList: global.allOrganizationList,
  allMerchantList: global.allMerchantList,
  tableLoading: loading.effects['global/getAllMerchantList'],
}))
class SearchMerchantModal extends Component<SearchMerchantModalProps, IState> {
  state = {
    orgId: undefined,
    name: '',
    selectedRow: [],
    selectedRowKeys: []
  }

  columns = [
    { title: '商户号', dataIndex: 'merchantNum', key: 'merchantNum' },
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName' },
    { title: '所属组织', dataIndex: 'orgName', key: 'orgName' }
  ]

  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({
      type: 'global/getAllOrganizationList'
    })

    this.handleSearchList();
  }
  
  @Bind()
  @Debounce(500)
  handleSearchList() {
    const { orgId, name } = this.state;
    const { dispatch, relationType, childMerchant } = this.props;

    let params = {};

    if (orgId) {
      params['orgId'] = orgId
    }
    if (name) {
      params['name'] = name
    }
    if (relationType) {
      params['relationType'] = relationType
    }
    if (childMerchant) {
      params['type'] = 'childMerchant';
    }
    dispatch({
      type: 'global/getAllMerchantList',
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
    const { orgId, name } = this.state;
    const { visible, title = '选择商户', multiple, allOrganizationList, allMerchantList, tableLoading } = this.props;
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
                <FormItem label="所属组织">
                  <Select
                    value={orgId}
                    placeholder="请选择所属组织"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={value => this.handleFormChang(value, 'orgId')}
                  >
                    {allOrganizationList.map((item, index) => (
                      <Option key={index} value={item.id}>{item.name}</Option>
                    ))}
                  </Select>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="搜索">
                <Input
                  autoComplete="off"
                  placeholder="输入商户名称/商户号"
                  value={name}
                  onChange={e => this.handleFormChang(e.target.value, 'name')}
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
            dataSource={allMerchantList}
            loading={tableLoading}
          />
        </Fragment>
      </Modal>
    )
  }
};

export default SearchMerchantModal
