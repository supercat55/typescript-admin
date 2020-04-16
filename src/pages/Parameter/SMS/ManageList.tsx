import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Button, Popconfirm, Badge, message } from 'antd'; 
import { FormComponentProps } from 'antd/lib/form';
import { connect } from 'dva';
import router from 'umi/router';
import { stringify } from 'qs';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
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
    feeTypeId: string | number;
    templateType: number;
    isValid: number;
    status: number;
    time: any[]
  },
}

@connect(({ menu, sms, loading, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  allFeeTypeList: global.allFeeTypeList,
  smsList: sms.smsList,
  smsTotal: sms.smsTotal,
  tableLoading: loading.effects['sms/getSMSTemplateList'],
}))
class SMSManageListPage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [],
    searchFormValues: {
      merchantName: '',
      merchantNo: '',
      feeTypeId: -1,
      templateType: -1,
      isValid: -1,
      status: -1,
      time: []
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
    { title: '审核状态',dataIndex: 'statusDesc', key: 'statusDesc', width: 120, fixed: 'right'},
    {
      title: '操作', width: 180, fixed: 'right',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        return (
          <div className='table-actions'>
            {
              globalPageSubMenu. CHECK_SMS_DETAIL && 
              <span onClick={() => this.handleActions('detail', record)}>查看</span>
            }
            {
              globalPageSubMenu. SMS_CREATE_OR_EDIT && record.status === 3 && 
              <span onClick={() => this.handleActions('edit', record)}>编辑</span>
            }
            {
              globalPageSubMenu.TOGGELE_SMS_STATUS && record.status === 2 &&
              <Popconfirm
                title={record.isValid === 0 ? '是否确认启用此模板？' : '是否确认停用此模板？'}
                okText="确定"
                cancelText="取消"
                onConfirm={() => this.handleActions('toggle', record)}
                onCancel={() => console.log('取消停用')}
              >
                <span>{record.isValid === 0 ? '启用' : '停用'}</span>
              </Popconfirm>
            }
          </div>
        )
      }
    }
  ]

  componentDidMount() {
    this.initializeForm();
    this.handleSearchList();
  }


  initializeForm = async() => {
    const { dispatch } = this.props;

    await dispatch({
      type: 'global/getAllFeeTypeList'
    })

    this.renderFormItems();
  }

  renderFormItems = () => {
    const { allFeeTypeList } = this.props;

    let searchFormItems = [
      { label: '商户名称', type: 'input', decorator: 'merchantName', placeholder: '请输入商户名称' },
      { label: '商户号', type: 'input', decorator: 'merchantNo', placeholder: '请输入商户号' },
      { 
        label: '费用类型', 
        type: 'select', 
        decorator: 'feeTypeId', 
        initialValue: -1, 
        fieldNames: { label: 'feeName', value: 'id' },
        source: [{ feeName: '全部', id: -1 }].concat(allFeeTypeList) 
      },
      { label: '短信模板类型', type: 'select', decorator: 'templateType', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(SMS_TEMP_TYPES) },
      { label: '状态', type: 'select', decorator: 'isValid', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(COMMON_STATUS_TYPES) },
      { label: '审核状态', type: 'select', decorator: 'status', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(SMS_AUDIT_STATUS) },
      { label: '审核时间', type: 'date', decorator: 'time', initialValue: [] },
    ]

    this.setState({ searchFormItems })
  }

  handleSearchList = () => {
    const { dispatch } = this.props;
    const { pageNum, pageSize, searchFormValues: { merchantName, merchantNo, feeTypeId, templateType, isValid, status, time } } = this.state;

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
    if (feeTypeId !== -1) {
      params['feeTypeId'] = feeTypeId
    }
    if (templateType !== -1) {
      params['templateType'] = templateType
    }
    if (isValid !== -1) {
      params['isValid'] = isValid
    }
    if (status !== -1) {
      params['status'] = status
    }
    if (time && time.length) {
      params['auditingTimeStart'] = time[0].startOf('day').unix() * 1000;
      params['auditingTimeEnd'] = time[1].endOf('day').unix() * 1000;
    }

    dispatch({
      type: 'sms/getSMSTemplateList',
      payload: params
    })
  }

  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        router.push({
          pathname: '/parameter/sms/create',
          search: stringify({ mode })
        })
        break;
      case 'detail':
      case 'edit':
        router.push({
          pathname: `/parameter/sms/actions/${info.templateId}`,
          search: stringify({ mode })
        })
        break;
      case 'toggle':
        this.handleToggleItem(info);
        break;
      default:
        break;
    }
  }

  handleToggleItem = async({ templateId, isValid }) => {
    const { dispatch } = this.props;
    let result;

    if (isValid === 0) {
      result = await dispatch({
        type: 'sms/startSMSTemplate',
        payload: { templateId }
      });
    } else {
      result = await dispatch({
        type: 'sms/disableSMSTemplate',
        payload: { templateId }
      });
    }

    if (result) {
      message.success(isValid === 0 ? '启用模板成功' : '停用模板成功');

      this.handleSearchList()
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
      <PageWrapper title='短信模板管理'>
        {
          globalPageSubMenu.SMS_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
          />
        }
        { 
          globalPageSubMenu.SMS_CREATE_OR_EDIT &&
          <Button 
            type='primary'
            icon='plus'
            style={{ marginBottom: '30px' }} 
            onClick={() => this.handleActions('create', null)}
          >
            添加
          </Button>
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

export default SMSManageListPage

