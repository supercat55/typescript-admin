import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { message } from 'antd';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { GetPageQuery } from '@/utils/utils';
import { DEFAULT_ALL_TYPE ,IMPORT_STATUS } from '@/utils/const';

interface IProps {
  dispatch: Dispatch<AnyAction>;
  tableLoading: boolean;
  importResultList: any[];
  importResultTotal: number;
}

interface IState {
  pageNum: number;
  pageSize: number;
  searchFormItems: any[];
  searchFormValues: {
    fileName: string;
    status: string | number
  },
  fileType: number;
}

@connect(({ loading, global }) => ({
  importResultList: global.importResultList,
  importResultTotal: global.importResultTotal,
  tableLoading: loading.effects['global/queryImportResultList'],
}))
class ImportResultPage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [
      { label: '文件名查询', type: 'input', decorator: 'fileName', placeholder: '请输入搜索的文件名' },
      { label: '状态', type: 'select', decorator: 'status', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(IMPORT_STATUS) }
    ],
    searchFormValues: {
      fileName: '',
      status: -1,
    },
    fileType: -1,
  }

  private ref: any
  
  private columns = [
    { title: '商户', dataIndex: 'merchantName', key: 'merchantName' },
    { title: '小区名称', dataIndex: 'communityName', key: 'communityName' },
    { title: '文件名', dataIndex: 'fileName', key: 'fileName' },
    { title: '导入日期', dataIndex: 'exportTime', key: 'exportTime' },
    { title: '创建人', dataIndex: 'userName', key: 'userName' },
    { title: '状态', dataIndex: 'statusDesc', key: 'statusDesc' },
    { title: '操作',
      render: (_, record) => (
        <div className='table-actions'>
          <span onClick={() => this.handleCheckInfo(record)}>查看</span>
        </div>
      )
    }
  ]

  componentDidMount() {
    const urlParams = GetPageQuery();
    const fileType = urlParams.fileType ? urlParams.fileType : -1;

    this.setState({ fileType }, this.handleSearchList)
  }

  handleSearchList = () => {
    const { dispatch } = this.props;
    const { pageNum, pageSize, searchFormValues: { fileName, status }, fileType } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (fileName) {
      params['fileName'] = fileName
    }
    if (status !== -1) {
      params['status'] = status;
    }
    if (fileType !== -1) {
      params['fileType'] = fileType;
    }

    dispatch({
      type: 'global/getImportResultList',
      payload: params
    })
  }
  
  handleCheckInfo = info => {
    if (info.status === 2) {
      message.success(info.remark);
    } else if (info.status === 3){
      message.error(info.remark);
    }
  }

  handleFilterSearch = values => {
    this.setState({
      searchFormValues: values,
      pageNum: 1
    }, this.handleSearchList)
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
    const { importResultList, importResultTotal, tableLoading } = this.props;

    const pagination = {
      total: importResultTotal,
      current: pageNum,
      pageSize,
    };


    return (
      <PageWrapper title='文件导入查询' showBack>
        <PageSearchForm 
          fields={searchFormItems} 
          search={this.handleFilterSearch}
          ref={node => (this.ref = node)}
        />

        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={importResultList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
        />
      </PageWrapper>
    )
  }
};


export default ImportResultPage
