import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Form, Button, Popconfirm, Input, Badge, Modal, Select } from 'antd'; 
import { FormComponentProps } from 'antd/lib/form';
import { connect } from 'dva';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import PageSearchForm from '@/components/PageSearchForm';
import { StateType } from './model';
import { GetUserBaseInfo } from '@/utils/cache';
import { formItemLayout } from '@/utils/config';
import { DEFAULT_ALL_TYPE, COMMON_STATUS_TYPES, STATION_TYPES } from '@/utils/const';

const FormItem = Form.Item;
const Option = Select.Option;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  tableLoading: boolean;
  globalPageSubMenu: any;
}

interface IState {
  pageNum: number;
  pageSize: number;
  searchFormItems: any[];
  searchFormValues: {
    merchantName: string;
    isValid: number;
    stationType: number;
    stationName: string;
  },
  visible: boolean;
  current: any;
}

@connect(({ menu, station, loading }) => ({
  globalPageSubMenu: menu.globalPageSubMenu,
  stationList: station.stationList,
  stationTotal: station.stationTotal,
  tableLoading: loading.effects['station/getStationList'],
}))
class StationListPage extends PureComponent<IProps, IState> {
  state: IState = {
    pageNum: 1,
    pageSize: 10,
    searchFormItems: [],
    searchFormValues: {
      merchantName: '',
      isValid: -1,
      stationType: -1,
      stationName: '',
    },
    visible: false,
    current: {}
  }

  private ref: any

  private columns = [
    { title: '所属商户', dataIndex: 'merchantName', key: 'merchantName' },
    { title: '岗位名称', dataIndex: 'stationName', key: 'stationName' },
    { title: '岗位类型', dataIndex: 'typeDesc', key: 'typeDesc' },
    { title: '状态',dataIndex: 'statusDesc', key: 'statusDesc',
      render: (text, record) => <Badge status={record.statusBrdge} text={text}/>
    },
    { title: '创建人', dataIndex: 'userName', key: 'userName' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
    {
      title: '操作',
      render: (_, record) => {
        const { globalPageSubMenu } = this.props;

        if (record.isValid === 0 ) return null;

        return (
          <div className='table-actions'>
            {globalPageSubMenu. STATION_CREATE_OR_EDIT && <span onClick={() => this.handleActions('edit', record)}>编辑</span>}
            {
              globalPageSubMenu. TOGGELE_STATION_STATUS &&
              <Popconfirm
                title="停用后不可恢复，该岗位信息将失效，确认停用？"
                okText="确定"
                cancelText="取消"
                onConfirm={() => this.handleActions('stop', record)}
                onCancel={() => console.log('取消停用岗位')}
              >
                <span>停用</span>
              </Popconfirm>
            }
          </div>
        )
      }
    }
  ]

  componentDidMount() {
    this.renderFormItems();
    this.handleSearchList();
  }

  renderFormItems = () => {
    const { loginType } = GetUserBaseInfo();

    let searchFormItems = [
      { label: '状态', type: 'select', decorator: 'isValid', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(COMMON_STATUS_TYPES) },
      { label: '岗位类型', type: 'select', decorator: 'stationType', initialValue: -1, source: DEFAULT_ALL_TYPE.concat(STATION_TYPES) },
      { label: '岗位名称', type: 'input', decorator: 'stationName', placeholder: '请输入搜索的岗位名称' },
    ]

    if (loginType === 'operation') {
      searchFormItems.unshift( { label: '绑定商户', type: 'input', decorator: 'merchantName', placeholder: '请输入搜索的商户名称' } as any)
    }

    this.setState({ searchFormItems })
  }

  handleSearchList = () => {
    const { dispatch } = this.props;
    const { pageNum, pageSize, searchFormValues: { merchantName, isValid, stationType, stationName } } = this.state;

    const params = {
      pageNum,
      pageSize
    };

    if (merchantName) {
      params['merchantName'] = merchantName
    }
    if (isValid !== -1) {
      params['isValid'] = isValid
    }
    if (stationType !== -1) {
      params['stationType'] = stationType
    }
    if (stationName) {
      params['stationName'] = stationName
    }

    dispatch({
      type: 'station/getStationList',
      payload: params
    })
  }

  handleActions = (mode, info) => {
    switch (mode) {
      case 'create':
        this.setState({
          visible: true,
          current: {},
        })
        break;
      case 'edit':
        this.setState({
          visible: true,
          current: info,
        })
        break;
      case 'stop':
        this.handleStopItem(info);
        break;
      default:
        break;
    }
  }

  handleStopItem = async({ id }) => {
    const { dispatch } = this.props;

    let result = await dispatch({
      type: 'station/stopStation',
      payload: { stationId: id }
    });

    if (result) {
      this.handleSearchList()
    }
  }

  handleModalOk = () => {
    const { current } = this.state;
    const { form, dispatch } = this.props;

    form.validateFields(async(err, values) => {
      if (err) return;

      const { stationType, stationName } = values;
      let result;

      const params = {
        stationType,
        stationName
      }

      if (current['id']) {
        params['id'] = current['id'];

        result = await dispatch({
          type: 'station/editStation',
          payload: params
        })
      } else {
        result = await dispatch({
          type: 'station/createStation',
          payload: params
        })
      }
      if (result) {
        this.handleSearchList();
        this.handleModalCancel();
      }
    })
  }

  handleModalCancel = () => {
    this.setState({
      visible: false,
      current: {}
    });
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
    const { pageNum, pageSize, searchFormItems, visible, current } = this.state;
    const { stationList, stationTotal, tableLoading, globalPageSubMenu, form: { getFieldDecorator } } = this.props;
    const { merchantName } = GetUserBaseInfo();

    const pagination = {
      total: stationTotal,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper title='岗位管理'>
        {
          globalPageSubMenu.STATION_SEARCH &&
          <PageSearchForm 
            fields={searchFormItems} 
            search={this.handleFilterSearch}
            ref={node => (this.ref = node)}
          />
        }
        { 
          globalPageSubMenu.STATION_CREATE_OR_EDIT &&
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
          rowKey={'id'}
          columns={this.columns}
          dataSource={stationList}
          loading={tableLoading}
          pagination={pagination}
          onChange={this.handleTabelChange}
        />

        <Modal
          title={current ? '编辑岗位' : '添加岗位'}
          destroyOnClose
          visible={visible}
          confirmLoading={tableLoading}
          onOk={this.handleModalOk}
          onCancel={this.handleModalCancel}
        >
          <Form {...formItemLayout}>
            <FormItem label={'所属商户'}>
              <Input disabled value={merchantName}/>
            </FormItem>
            <FormItem label={'岗位类型'}>
              {getFieldDecorator('stationType', {
                initialValue: current.stationType,
                rules: [
                  { required: true, message: '请选择岗位类型' },
                ]
              })(
                <Select placeholder="请选择岗位类型">
                  {STATION_TYPES.map(item => (
                    <Option value={item.value} key={item.value}>{item.label}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label={'岗位名称'}>
              {getFieldDecorator('stationName', {
                initialValue: current.stationName,
                rules: [
                  { required: true, message: '请输入岗位名称' },
                  { max: 6, message: '岗位名称不能超过6个字'},
                  { whitespace: false }
                ]
              })(
                <Input placeholder="请输入岗位名称，不可多于6个字"/>
              )}
            </FormItem>
          </Form>
        </Modal>
      </PageWrapper>
    )
  }
};

export default Form.create()(StationListPage)

