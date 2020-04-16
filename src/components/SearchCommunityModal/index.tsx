import React, { Component, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Modal, Form, Row, Col, Input, Table, Cascader } from 'antd';
import { connect } from 'dva';
import { formItemHorizontalLayout } from '@/utils/config';
import { Debounce, Bind } from 'lodash-decorators'

const CityData = require('@/utils/city.json');

const FormItem = Form.Item;

export interface SearchMerchantModalProps {
  dispatch?: Dispatch<AnyAction>;
  title?: string;
  visible?: boolean;
  multiple?: boolean;
  allCommunityListByAddress?: any[];
  onConfirm: (rowKey: any[], row: any[]) => void;
  onCancel: () => void;
  tableLoading?: boolean;
}

interface IState {
  address: any[];
  condition: string;
  selectedRow: any[];
  selectedRowKeys: string[];
  [index: string]: any;
}

@connect(({ loading, global }) => ({
  allCommunityListByAddress: global.allCommunityListByAddress,
  tableLoading: loading.effects['global/getAllCommunityListByAddress'],
}))
class SearchCommunityModal extends Component<SearchMerchantModalProps, IState> {
  state = {
    address: [],
    condition: '',
    selectedRow: [],
    selectedRowKeys: []
  }

  columns = [
    { title: '小区名称', dataIndex: 'communityName', key: 'communityName' },
    { title: '所在省市',
      render: (_, record) => (
        <span>{`${record.province}-${record.city}-${record.area}`}</span>
      )
    },
  ]

  componentDidMount() {
    this.handleSearchList();
  }
  
  @Bind()
  @Debounce(500)
  handleSearchList() {
    const { address, condition } = this.state;
    const { dispatch } = this.props;

    let params = {};

    if (address) {
      params['province'] = address[0];
      params['city'] = address[1];
      params['area'] = address[2];
    }
    if (condition) {
      params['condition'] = condition
    }
    dispatch({
      type: 'global/getAllCommunityListByAddress',
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
    const { address, condition } = this.state;
    const { visible, title = '选择小区', multiple, allCommunityListByAddress, tableLoading } = this.props;
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
                <FormItem label="省/市/区">
                  <Cascader 
                    value={address}
                    options={CityData} 
                    placeholder="请选择小区省/市/区" 
                    onChange={(value) => this.handleFormChang(value, 'address')}
                    fieldNames={{ label: 'name', value: 'name' }}
                  />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="搜索">
                <Input
                  autoComplete="off"
                  placeholder="输入小区名称"
                  value={condition}
                  onChange={e => this.handleFormChang(e.target.value, 'condition')}
                />
              </FormItem>
            </Col>
            {/* <Col span={12}>
              <FormItem label="创建机构">
                <Input
                  autoComplete="off"
                  placeholder="输入商户名称/组织名称"
                  value={condition1}
                  onChange={e => this.handleFormChang(e.target.value, 'condition1')}
                />
              </FormItem>
            </Col> */}
          </Row>
          </Form>
          <Table
            rowKey='id'
            style={{ marginTop: '24px' }}
            scroll={{ y: 400 }}
            pagination={false}
            rowSelection={rowSelection}
            columns={this.columns}
            dataSource={allCommunityListByAddress}
            loading={tableLoading}
          />
        </Fragment>
      </Modal>
    )
  }
};

export default SearchCommunityModal
