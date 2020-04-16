import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Input, Switch, Select, message, Popconfirm, Divider } from 'antd';
import isEqual from 'lodash/isEqual';
import REGEX from '@/utils/regex';

export interface TabelFormProps {
  onChange?: (param: any) => void;
  disabled: boolean;
}

export interface TabelFormState {
  loading: boolean;
  data: any[];
  value: any[];
}

class CommunityTableForm extends PureComponent<TabelFormProps, TabelFormState> {
  index = 0;
  clickedCancel = false;
  cacheOriginData = {};

  constructor(props) {
    super(props)

    this.state = {
      data: props.value,
      loading: false,
      value: props.value,
    }
  }

  // 判断修改后的value和form组件传入的value是否一样
  static getDerivedStateFromProps(nextProps, preState) {
    if (isEqual(nextProps.value, preState.value)) {
      return null;
    }
    return {
      data: nextProps.value,
      value: nextProps.value
    }
  }

  getRowById = (id, newDate) => {
    const { data } = this.state;
    return (newDate || data).filter(item => item.id === id)[0];
  }

  handleAddNewCashierItem = () => {
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));

    newData.push({
      id: `NEW_TEMP_ID_${this.index}`,
      editable: true,
      isNew: true,
      isMessage: true
    });
    this.index += 1;
    this.setState({ data: newData });
  }

  saveRow = (e, id) => {
    e.persist();

    setTimeout(() => {
      if (this.clickedCancel) {
        this.clickedCancel = false;
        return;
      }
      const target = this.getRowById(id, null) || {};

      if (!target.payeeName || !target.payeePhone) {
        message.error('请填写完整收款人信息');
        e.target.focus();
        return;
      }
      if (!REGEX.MOBILE.test(target.payeePhone)) {
        message.error('收款人手机号不正确');
        e.target.focus();
        return;
      }

      delete target.isNew;
      this.toggleEditable(e, id)

      const { data } = this.state;
      const { onChange } = this.props;
      onChange(data);
    })
  }

  toggleEditable = (e, id) => {
    e.preventDefault();
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowById(id, newData);

    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[id] = { ...target };
      }
      target.editable = !target.editable;
      this.setState({ data: newData });
    }
  }

  cancel = (e, id) => {
    this.clickedCancel = true;
    e.preventDefault();
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowById(id, newData);


    if (this.cacheOriginData[id]) {
      Object.assign(target, this.cacheOriginData[id]);
      delete this.cacheOriginData[id];
    }

    target.editable = false;
    this.setState({ data: newData });
    this.clickedCancel = false;
  }

  remove = id => {
    const { data } = this.state;
    const { onChange } = this.props;
    const newData = data.filter(item => item.id !== id);

    this.setState({ data: newData });
    onChange(newData);
  }

  handleFieldChange = (value, fieldName, id) => {
    const { data } = this.state;
    const newData = data.map(item => ({...item}));
    const target = this.getRowById(id, newData);
    if (target) {
      target[fieldName] = value;
      this.setState({ data: newData })
    }
  }

  render() {
    const { disabled } = this.props;
    const { data, loading } = this.state;

    const columns = [
      {
        title: '姓名', dataIndex: 'payeeName', key: 'payeeName', width: '25%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input 
                value={text} 
                placeholder="请输入收款员姓名" 
                onChange={e => this.handleFieldChange(e.target.value, 'payeeName', record.id)}
              />
            )
          }
          return text
        }
      },
      {
        title: '手机号', dataIndex: 'payeePhone', key: 'payeePhone', width: '25%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input 
                value={text} 
                placeholder="请输入收款员手机号"
                onChange={e => this.handleFieldChange(e.target.value, 'payeePhone', record.id)}
              />
            )
          }
          return text
        }
      },
      {
        title: '是否接收缴费成功短信', dataIndex: 'isMessage', key: 'isMessage', width: '25%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Switch 
                checkedChildren="开"
                unCheckedChildren="关"
                checked={text} 
                onChange={value => this.handleFieldChange(value, 'isMessage', record.id)}
              />
            )
          }
          return (
            <Switch 
              disabled
              checkedChildren="开"
              unCheckedChildren="关"
              checked={text} 
            />
          )
        }
      },
      {
        title: '操作', width: '25%',
        render: (_, record) => {
          if (!!record.editable && loading) return null;
          if (record.editable) {
            if (record.isNew) {
              return (
                <div className='table-actions'>
                  <span onClick={e => this.saveRow(e, record.id)}>添加</span>
                  <Divider type='vertical' />
                  <span onClick={e => this.remove(record.id)}>删除</span>
                </div>
              )
            } 
            return (
              <div className='table-actions'>
                <span onClick={e => this.saveRow(e, record.id)}>保存</span>
                <Divider type='vertical' />
                <span onClick={e => this.cancel(e, record.id)}>取消</span>
              </div>
            )
          }
          return (
            <div className='table-actions'>
              <span onClick={e => this.toggleEditable(e, record.id)}>编辑</span>
              <Divider type='vertical' />
              <Popconfirm title="你确定删除此收款员吗？删除后，该小区二维码将无法使用" onConfirm={() => this.remove(record.id)}>
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
          loading={loading}
          locale={{ emptyText: '暂无数据' }}
        />
        {
          !disabled &&
          <Button
            style={{ width: '100%', marginTop: 16, marginBottom: 50 }}
            type="dashed"
            icon="plus"
            onClick={this.handleAddNewCashierItem}
          >
            新增成员
          </Button>
        }
      </Fragment>
    )
  }
};

export default CommunityTableForm;
