import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Button, Badge, Popconfirm, message } from 'antd'; 
import { connect } from 'dva';
import router from 'umi/router';
import { Decimal } from 'decimal.js';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import BillTempModal from '../component/BillTempModal';
import { DEFAULT_ALL_TYPE, CHARGE_MODE_TYPES, COMMON_STATUS_TYPES } from '@/utils/const';
import { StateType } from './model';

interface IProps extends StateType {
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
    modelName: string;
    feeTypeId: string | number;
    isValid: number;
    chargeMode: number;
  },
  visible: boolean;
  current: any;
  mode: string;
}

@connect(({ menu, loading, billTemplate, global }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  billTempList: billTemplate.billTempList,
  billTempTotal: billTemplate.billTempTotal,
  tableLoading: loading.models['billTemplate'],
  allFeeTypeList: global.allFeeTypeList,
}))
class BillTemplateList extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [],
    searchFormValues: {
      merchantName: '',
      modelName: '',
      feeTypeId: -1,
      isValid: -1,
      chargeMode: -1,
    },
    visible: false,
    current: {},
    mode: 'create',
  }

  private ref: any
  
  private columns = [
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName' },
    { title: '模版名称', dataIndex: 'modelName', key: 'modelName' },
    { title: '费用类型', dataIndex: 'feeTypeName', key: 'feeTypeName' },
    { title: '计费模式', dataIndex: 'chargeModeDesc', key: 'chargeModeDesc' },
    { title: '模板状态',dataIndex: 'isValidDesc', key: 'isValidDesc',
      render: (text, record) => <Badge status={record.isValidBrdge} text={text}/>
    },
    { title: '创建人', dataIndex: 'name', key: 'name' },
    { title: '操作',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        let comp = () => (
          <Fragment>
            {globalPageSubMenu.BILL_TEMP_CREATE_OR_EDIT && <span onClick={() => this.handleActions('edit', record)}>编辑</span>}
            {
              globalPageSubMenu.TOGGELE_BILL_TEMP_STATUS && 
              <Popconfirm
                title="是否停止调用计费模版？"
                okText="确定"
                cancelText="取消"
                onConfirm={() => this.handleActions('disable', record)}
              >
                <span>停用</span>
              </Popconfirm>
            }
          </Fragment>
        )
        return (
          <div className='table-actions'>
            {record.isValid === 1 && comp()}
            {globalPageSubMenu.CHECK_BILL_TEMP_DETAIL && <span onClick={() => this.handleActions('detail', record)}>查看</span>}
            {globalPageSubMenu.BILL_TEMP_CALL_LOG && <span onClick={() => this.handleActions('log', record)}>调用日志</span>}
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
      { label: '模版名称', type: 'input', decorator: 'modelName', placeholder: '请输入模版名称' },
      { 
        label: '费用类型', 
        type: 'select', 
        decorator: 'feeTypeId', 
        initialValue: -1, 
        fieldNames: { label: 'feeName', value: 'id' },
        source: [{ feeName: '全部', id: -1 }].concat(allFeeTypeList) 
      },
      { label: '计费模式', type: 'select', decorator: 'chargeMode', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(CHARGE_MODE_TYPES) },
      { label: '状态', type: 'select', decorator: 'isValid', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(COMMON_STATUS_TYPES) },
    ]

    this.setState({ searchFormItems })
  }

  handleSearchList = () => {
    const { dispatch } = this.props;
    const { pageNum, pageSize, searchFormValues: { merchantName, modelName, feeTypeId, isValid, chargeMode } } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (modelName) {
      params['modelName'] = modelName
    }
    if (feeTypeId !== -1) {
      params['feeTypeId'] = feeTypeId
    }
    if (isValid !== -1) {
      params['isValid'] = isValid
    }
    if (chargeMode !== -1) {
      params['payMode'] = chargeMode
    }

    dispatch({
      type: 'billTemplate/getBillTemplateList',
      payload: params
    })
  }
  
  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        this.setState({ 
          mode,
          current: {},
          visible: true
        });
        break;
      case 'edit':
      case 'detail':
        this.handleGetTempDetail(info.id, mode);
        break;
      case 'disable':
        this.handleDisableItem(info);
        break;
      case 'log':
        router.push(`/bill/template/log/${info.id}`)
      default:
        break;
    }
  }

  handleGetTempDetail = async(id, mode) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'billTemplate/getBillTemplateDetail',
      payload: { id }
    })
    if (result) {
      this.setState({
        mode,
        current: result,
        visible: true
      })
    }
  }

  handleDisableItem = async({ id }) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'billTemplate/disableTemplate',
      payload: { 
        id, 
        isValid: 0 
      }
    })
    if (result) {
      this.handleSearchList()
    }
  }

  // 计费模板modal确认事件
  handleTempModalOk = async(values) => {
    const { current, mode } = this.state;
    const { dispatch } = this.props;
    const { modelName, feeTypeId, chargeMode, areaType, rule, totalPrice, unitPrice } = values

    const params = {
      modelName,
      feeTypeId,
      chargeMode,
      rule
    }
    if (chargeMode === 1) {
      params['totalPrice'] = new Decimal(totalPrice).mul(100);
    } else {
      params['unitPrice'] = new Decimal(unitPrice).mul(100);
      params['areaType'] = areaType;
    }

    const checkParams = {
      modelName
    }

    if (current && current.id) {
      checkParams['id'] = current.id
    }

    let checkResult = await dispatch({
      type: 'billTemplate/checkTemplateName',
      payload: checkParams
    })
    
    if (Number(checkResult) === 0) {
      if (mode === 'create') {
        let result = await dispatch({
          type: 'billTemplate/createTemplate',
          payload: params
        })
  
        if (result) {
          this.handleSearchList();
          this.handleTempModalCancel();
        }
      } else {
        params['id'] = current.id;
        let result = await dispatch({
          type: 'billTemplate/editTemplate',
          payload: params
        })
  
        if (result) {
          this.handleSearchList();
          this.handleTempModalCancel();
        }
      }

    } else {
      message.error('模板名称已存在');
    }
  }

  // 计费模板modal取消事件
  handleTempModalCancel = () => {
    this.setState({
      visible: false
    })
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
    const { pageNum, pageSize, searchFormItems, visible, current, mode } = this.state;
    const { billTempList, billTempTotal, tableLoading, globalPageSubMenu } = this.props;
    const pagination = {
      total: billTempTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='计费账单模版'>
        {
          globalPageSubMenu.BILL_TEMP_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
          />
        }

        { 
          globalPageSubMenu.BILL_TEMP_CREATE_OR_EDIT &&
          <Button 
            type='primary'
            icon='plus'
            style={{ marginBottom: '30px' }} 
            onClick={() => this.handleActions('create', null)}
          >
            添加计费模版
          </Button>
        }

        <StandardTable
          rowKey={'id'}
          columns={this.columns}
          dataSource={billTempList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
        />

        {
          visible ?
          <BillTempModal
            visible={visible}
            mode={mode}
            defaultDtail={current}
            onConfirm={this.handleTempModalOk}
            onCancel={this.handleTempModalCancel}
          /> : null
        }
      </PageWrapper>
    )
  }
};


export default BillTemplateList
