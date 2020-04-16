import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Input, InputNumber, Select, message, Popconfirm } from 'antd';
import { MERCHANT_FEE_METHOD_TYPES, MERCHANT_FEE_METHOD_TYPES_DESC } from '@/utils/const';
import { isEqual, cloneDeep } from 'lodash';

const Option = Select.Option;

export interface TabelFormProps {
  payCodeList: any[];
  disabled: boolean;
  onChange: (param: any) => void;
}

export interface TabelFormState {
  data: any[];
  value: any[];
}

class TableForm extends PureComponent<TabelFormProps, TabelFormState> {
  index = 0;

  constructor(props) {
    super(props)

    this.state = {
      data: props.value ? props.value : [],
      value: props.value,
    }
  }

  //判断修改后的value和form组件传入的value是否一样
  static getDerivedStateFromProps(nextProps, preState) {
    if (isEqual(nextProps.value, preState.value)) {
      return null;
    }

    return {
      data: nextProps.value,
      value: nextProps.value,
    }
  }
  
  // 查找id所在行
  getRowById = (id, newDate) => {
    const { data } = this.state;
    return (newDate || data).filter(item => item.id === id)[0];
  }

  // 新增结算手续费
  handleAddNewReceiverItem = () => {
    const  { data } = this.state;
    const newData = data.map(item => ({...item}));
    
    newData.push({
      id: `NEW_TEMP_ID_${this.index}`,
      formalities: 1,
      editable: true
    });
    
    this.index += 1;

    this.setState({ data: newData })
  }

  handleFieldChange = (value, fieldName, id, index) => {
    const { payCodeList } = this.props;
    const { data } = this.state;

    if (fieldName === 'paymentMethod') {
      for (let i in payCodeList) {
        if (payCodeList[i].name === value) {
          data[index].paymentCode = payCodeList[i].code
        }
      }
    }
    if (fieldName === 'formalities') {
      data[index].fixedCost = '';
      data[index].percentageCost = '';
    }

    const newData = data.map(item => ({...item}));
    const target = this.getRowById(id, newData);

    if (target) {
      target[fieldName] = value;
      this.setState({ data: newData });
    }
  }

  toggleEditable = id => {
    const { onChange } = this.props;
    const  { data } = this.state;
    const newData = data.map(item => ({...item}));
    const target = this.getRowById(id, newData) || {};

    target.editable = !target.editable;
    this.setState({ data: newData });
    onChange(newData);
  }

  saveRow = id => {
    const  { data } = this.state;
    const newData = data.map(item => ({...item}));
    const target = this.getRowById(id, newData) || {};

    if (!target.paymentMethod) {
      message.error('请选择支付方式');
      return;
    }
    if (target.formalities == 1) {
      if (!target.percentageCost) {
        message.error('请输入手续费百分比');
        return;
      }
    } else {
      if (!target.fixedCost) {
        message.error('请输入固定手续费');
        return;
      }
    }

    const newData2 = cloneDeep(newData).filter(item => item.id !== target.id).filter(item => !item.editable);
    const result = newData2.filter(item => Number(item.paymentCode) === Number(target.paymentCode));
    if (result.length) {
      message.error('支付方式不能重复，请重新选择');
      return;
    }
    
    this.toggleEditable(id);
  }

  remove = id => {
    const { data } = this.state;
    const { onChange } = this.props;
    const newData = data.filter(item => item.id !== id);
    this.setState({ data: newData });
    onChange(newData)
  }

  render() {
    const { data } = this.state;
    const { payCodeList, disabled } = this.props;

    const columns = [
      {
        title: '支付方式', dataIndex: 'paymentMethod', key: 'paymentMethod', width: '25%',
        render: (text, record, index) => {
          if (record.editable) {
            return (
              <Select 
                style={{ width: '100%' }} 
                placeholder={'请选择支付方式'}
                onChange={value => this.handleFieldChange(value, 'paymentMethod', record.id, index)}
                value={text}
              >
                {payCodeList.map(item => (
                  <Option key={item.id} value={item.name}>{item.name}</Option>
                ))}
              </Select>
            )
          } 
          return (<span>{text}</span>)
        }
      },
      {
        title: '支付码', dataIndex: 'paymentCode', key: 'paymentCode', width: '15%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input value={text} disabled />
            )
          } 
          return (
            <span>{text}</span>
          )
        }
      },
      {
        title: '手续费方式', dataIndex: 'formalities', key: 'formalities', width: '15%',
        render: (text, record, index) => {
          if (record.editable) {
            return (
              <Select 
                defaultValue={1} 
                style={{ width: '100%' }} 
                placeholder={'请选择支付方式'}
                onChange={value => this.handleFieldChange(value, 'formalities', record.id, index)}
              >
                {MERCHANT_FEE_METHOD_TYPES.map(item => (
                  <Option key={item.value} value={item.value}>{item.label}</Option>
                ))}
              </Select>
            )
          }
          return (
            <span>{MERCHANT_FEE_METHOD_TYPES_DESC[text]}</span>
          )
        }
      },
      {
        title: '固定', dataIndex: 'fixedCost', key: 'fixedCost', width: '15%',
        render: (text, record, index) => {
          if (record.editable) {
            return (
              <InputNumber
                style={{ width: '100%' }} 
                value={text}
                autoFocus
                placeholder="请输入"
                disabled={record['formalities'] === 1}
                onChange={value => this.handleFieldChange(value, 'fixedCost', record.id, index)}
              />
            );
          }
          return (
            <span>{text ? `${Number(text).toFixed(2)}` : '-'}</span>
          )
        },
      },
      {
        title: '百分比', dataIndex: 'percentageCost', key: 'percentageCost', width: '15%',
        render: (text, record, index) => {
          if (record.editable) {
            return (
              <InputNumber
                style={{ width: '100%' }} 
                value={text}
                autoFocus
                placeholder="请输入"
                formatter={value => `${value}%`} 
                parser={value => value.replace('%', '')}
                disabled={record['formalities'] === 0}
                onChange={value => this.handleFieldChange(value, 'percentageCost', record.id, index)}
              />
            );
          } 
          return (
            <span>{text ? text + '%' : '-'}</span>
          )
        },
      },
      {
        title: '操作', width: '15%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <div className='table-actions'>
                <span onClick={() => this.saveRow(record.id)}>保存</span>
                <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.id)}>
                  <span>删除</span>
                </Popconfirm>
              </div>
            )
          }
          return (
            <div className='table-actions'>
              <span onClick={() => this.toggleEditable(record.id)}>编辑</span>
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.id)}>
                <span>删除</span>
              </Popconfirm>
            </div>
          )
        }

      }
    ]

    if (disabled) {
      columns.pop();
    }
    return (
      <Fragment>
        <Table
          rowKey={'id'}
          columns={columns}
          dataSource={data}
          pagination={false}
        />
        { 
          !disabled &&
          <Button
            style={{ width: '100%', marginTop: 16, marginBottom: 50 }}
            type="dashed"
            icon="plus"
            onClick={this.handleAddNewReceiverItem}
          >
            新增结算手续费
          </Button>
        }
      </Fragment>
    )
  }
};

export default TableForm;
