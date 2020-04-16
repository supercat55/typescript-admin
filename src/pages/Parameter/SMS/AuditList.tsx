import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Badge, message } from 'antd'; 
import { FormComponentProps } from 'antd/lib/form';
import { connect } from 'dva';
import router from 'umi/router';
import { stringify } from 'qs';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
import { GetUserBaseInfo } from '@/utils/cache';
import { DEFAULT_ALL_TYPE, COMMON_STATUS_TYPES, SMS_TEMP_TYPES, SMS_AUDIT_STATUS } from '@/utils/const';

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  tableLoading: boolean;
  globalPageSubMenu: any;
  allFeeTypeList: any[];
}

interface IState {
  pageNum: number;
  pageSize: number;
  searchFormItems: any[];
  searchFormValues: {
    merchantName: string;
    merchantNo: string;
    status: number;
  },
}

@connect(({ menu, sms, loading, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  allFeeTypeList: global.allFeeTypeList,
  smsList: sms.smsList,
  smsTotal: sms.smsTotal,
  tableLoading: loading.effects['sms/getSMSTemplateList'],
}))
class SMSAuditListPage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [
      { label: '商户名称', type: 'input', decorator: 'merchantName', placeholder: '请输入商户名称' },
      { label: '商户号', type: 'input', decorator: 'merchantNo', placeholder: '请输入商户号' },
      { label: '审核状态', type: 'select', decorator: 'status', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(SMS_AUDIT_STATUS) },
    ],
    searchFormValues: {
      merchantName: '',
      merchantNo: '',
      status: -1,
    },
  }

  private ref: any

  private columns = [
    { title: '编号', dataIndex: 'templateId', key: 'templateId' },
    { title: '商户号', dataIndex: 'merchantId', key: 'merchantId' },
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName' },
    { title: '短信模板类型', dataIndex: 'templateTypeDesc', key: 'templateTypeDesc' },
    { title: '费用类型', dataIndex: 'feeTypeName', key: 'feeTypeName' },
    { title: '状态', dataIndex: 'isValidDesc', key: 'isValidDesc',
      render: (text, record) => <Badge status={record.isValidBrdge} text={text}/>
    },
    { title: '创建人', dataIndex: 'userName', key: 'userName' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
    { title: '审核人', dataIndex: 'auditingUserName', key: 'auditingUserName' },
    { title: '审核时间', dataIndex: 'auditingTime', key: 'auditingTime' },
    { title: '审核状态',dataIndex: 'statusDesc', key: 'statusDesc', width: 120, fixed: 'right' },
    {
      title: '操作', width: 180, fixed: 'right',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;
        const { attribute } = GetUserBaseInfo();

        return (
          <div className='table-actions'>
            {
              globalPageSubMenu.CHECK_SMS_AUDIT_DETAIL && 
              <span onClick={() => this.handleActions('detail', record)}>查看</span>
            }
            {
              globalPageSubMenu.SMS_AUDIT && attribute === 0 && record.status === 1 && 
              <span onClick={() => this.handleActions('audit', record)}>审核</span>
            }
          </div>
        )
      }
    }
  ]

  componentDidMount() {
    this.handleSearchList();
  }

  handleSearchList = () => {
    const { dispatch } = this.props;
    const { pageNum, pageSize, searchFormValues: { merchantName, merchantNo, status } } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (merchantNo) {
      params['merchantNo'] = merchantNo
    }
    if (status !== -1) {
      params['status'] = status
    }

    dispatch({
      type: 'sms/getSMSTemplateList',
      payload: params
    })
  }

  handleActions = (mode, info) => {
    switch (mode) {
      case 'detail':
      case 'audit':
        router.push({
          pathname: `/parameter/sms-audit/detail/${info.templateId}`,
          search: stringify({ mode })
        })
        break;
      default:
        break;
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
    const { smsList, smsTotal, tableLoading, globalPageSubMenu } = this.props;

    const pagination = {
      total: smsTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='短信模板审核'>
        {
          globalPageSubMenu.SMS_AUDIT_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
          />
        }

        <StandardTable
          rowKey={'templateId'}
          columns={this.columns}
          dataSource={smsList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
          scroll={{ x: 1500 }}
        />
      </PageWrapper>
    )
  }
};

export default SMSAuditListPage

