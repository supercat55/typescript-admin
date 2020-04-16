import React, { Component, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Modal, Table, message } from 'antd';
import { connect } from 'dva';
import PageSearchForm from '@/components/PageSearchForm';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';

export interface SearchMerchantModalProps {
  dispatch?: Dispatch<AnyAction>;
  title?: string;
  visible?: boolean;
  multiple?: boolean;
  allHouseList?: any[];
  allHouseTotal?: number;
  onConfirm: (rowKey: any[], row: any[]) => void;
  onCancel: () => void;
  tableLoading?: boolean;
}

interface IState {
  pageNum: number;
  pageSize: number;
  searchFormItems: any[];
  searchFormValues: {
    communityName: string;
    queryName: string;
    buildingNo: string | number;
    unitNo: string | number;
    accountNo: string | number;
    houseNo: string | number;
  }
  selectedRow: any[];
  selectedRowKeys: string[];
}

@connect(({ loading, global }) => ({
  allHouseList: global.allHouseList,
  allHouseTotal: global.allHouseTotal,
  tableLoading: loading.effects['global/getAllHouseList'],
}))
class BillAddressModal extends Component<SearchMerchantModalProps, IState> {
  state = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [
      { 
        label: '小区名称', 
        type: 'autoComplete',
        decorator: 'communityName', 
        placeholder: '请输入搜索的小区名称', 
        dataSource: [], 
      },
      { label: '搜索', type: 'input', decorator: 'queryName', placeholder: '请输入业主姓名/手机号' },
      { label: '楼号', type: 'input', decorator: 'buildingNo', placeholder: '请输入楼号' },
      { label: '单元号', type: 'input', decorator: 'unitNo', placeholder: '请输入单元号' },
      { label: '户号', type: 'input', decorator: 'accountNo', placeholder: '请输入户号' },
      { label: '房屋唯一编号', type: 'input', decorator: 'houseNo', placeholder: '请输入房屋唯一编号' }
    ],
    searchFormValues: {
      communityName: '',
      queryName: '',
      buildingNo: '',
      unitNo: '',
      accountNo: '',
      houseNo: '',
    },
    selectedRow: [],
    selectedRowKeys: []
  }

  ref: any

  columns = [
    { title: '缴费地址', dataIndex: 'address', key: 'address' },
    { title: '房屋唯一编号 ', dataIndex: 'houseNo', key: 'houseNo' },
    { title: '业主名称 ', dataIndex: 'ownerName', key: 'ownerName' },
    { title: '业主电话 ', dataIndex: 'ownerPhone', key: 'ownerPhone' },
  ]

  componentDidMount() {
    this.handleSearchList();
  }
  
  handleSearchList() {
    const { dispatch } = this.props;
    const { pageNum, pageSize, searchFormValues: { communityName, queryName, buildingNo, unitNo, accountNo, houseNo } } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (communityName) {
      params['communityName'] = communityName;
    }
    if (queryName) {
      params['queryName'] = queryName;
    }
    if (buildingNo) {
      params['buildingNo'] = buildingNo;
    }
    if (unitNo) {
      params['unitNo'] = unitNo;
    }
    if (accountNo) {
      params['accountNo'] = accountNo;
    }
    if (houseNo) {
      params['houseNo'] = houseNo;
    }

    dispatch({
      type: 'global/getAllHouseList',
      payload: params
    })
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

    if (selectedRow.length === 0) {
      message.warning('请选择缴费地址');
      return;
    }

    onConfirm(selectedRowKeys, selectedRow);
  }

  handleCancel = () => {
    this.props.onCancel();
  }

  handleFilterSearch = values => {
    this.setState({
      searchFormValues: values,
      pageNum: 1
    }, this.handleSearchList)
  }

  @Bind()
  @Debounce(500)
  handleSearchFormChange(decorator, value) {
    if (decorator === 'communityName' && value) {
      this.handleSearchCommunityOptions(value)
    }
  }

  handleSearchCommunityOptions = async(name) => {
    const { dispatch } = this.props;
    const { searchFormItems } = this.state;
    const newFrmItems = searchFormItems.map(item => ({ ...item })) as any;
    
    let result = await dispatch({
      type: 'global/getAllCommunityListByName',
      payload: { communityName: name }
    })

    if (result && result['length']) {
      newFrmItems[0].dataSource = result;

      this.setState({
        searchFormItems: newFrmItems
      })
    }
  }

  handleTabelChange = pagination => {
    const { searchFormValues } = this.state;

    this.ref && this.ref.setFieldsValue(searchFormValues);

    this.setState({
      pageNum: pagination.current
    }, this.handleSearchList)
  }

  render() {
    const { pageNum, pageSize, searchFormItems } = this.state;
    const { visible, title = '选择缴费地址', multiple, allHouseList, allHouseTotal, tableLoading } = this.props;
    const pagination = {
      total: allHouseTotal,
      current: pageNum,
      pageSize,
    };
    const rowSelection = {
      type: multiple ? 'checkbox' as 'checkbox' : 'radio'  as 'radio',
      onChange: this.handleRowSelectionChange,
    }

    return (
      <Modal
        title={title}
        visible={visible}
        width={850}
        destroyOnClose
        maskClosable={false}
        okText={'确认'}
        cancelText={'取消'}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Fragment>
          <PageSearchForm
            showAll
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
            change={this.handleSearchFormChange}
          />
          <Table
            rowKey='id'
            style={{ marginTop: '24px' }}
            scroll={{ y: 400 }}
            rowSelection={rowSelection}
            columns={this.columns}
            dataSource={allHouseList}
            loading={tableLoading}
            pagination={pagination}
            onChange={this.handleTabelChange}
          />
        </Fragment>
      </Modal>
    )
  }
};

export default BillAddressModal
