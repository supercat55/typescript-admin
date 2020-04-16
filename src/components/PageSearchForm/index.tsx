import React, { Component } from 'react';
import { FormComponentProps } from 'antd/lib/form';
import styles from './index.scss';
import { Button, Form, Row, Col, Icon, Select, Input, DatePicker, AutoComplete, message, Skeleton } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;

interface FieldNamesType {
  value?: string;
  label?: string;
  children?: string;
}

interface fieldsType {
  decorator: string; // 描述及对应的key值
  label: string; // 展示名称
  initialValue?: any; // 初始值 
  required?: boolean; // 是否展示 * 和必选项
  message?: string; // 错误提示语
  disable?: boolean; // 是否禁用
  source?: any[]; // slect 下拉数据
  placeholder?: string; // placeholder
  fieldNames?: FieldNamesType;
  dataSource?: any[];
}

interface PageSearchFormProps extends FormComponentProps {
  fields: fieldsType[]; 
  loading?: boolean; // 搜索条件列表loading
  buttonLoading?: boolean; // 查询按钮loading
  showAll?: boolean; // 展示所有筛选条件
  extraButton?: React.ReactNode; // 额外的按钮
  change?: (decorator: string, value: any) => void; // 条件change事件
  search: (values: object) => void; // 查询按钮事件
  reset?: () => void; // 重置按钮事件
}

interface PageSearchFormState {
  readonly expand: boolean;
}

function getFilledFieldNames(item) {
  var fieldNames = item.fieldNames || {};
  var names = {
    label: fieldNames.label || 'label',
    value: fieldNames.value || 'value'
  };
  return names;
}

class PageSearchForm extends Component<PageSearchFormProps, PageSearchFormState> {
  readonly state: PageSearchFormState = {
    expand: false
  }

  public handleSearch = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (err) {
        message.warn('提交失败，请检查是否有必填项尚未填写', 1);
        return;
      }

      console.log('Received values of form: ', values);
      
      this.props.search(values);
    });
  }

  public handleReset = (e) => {
    this.props.form.resetFields();

    this.handleSearch(e);

    this.props.reset && this.props.reset();
  }

  public handleToggle = () => {
    const { expand } = this.state;

    this.setState({ expand: !expand });
  }

  public renderFormType = item => {
    const { change } = this.props;
    const names = getFilledFieldNames(item);

    switch (item.type) {
      case 'input':
        return (
          <Input placeholder={item.placeholder} />
        );
      case 'select':
        return (
          <Select 
            loading={item.loading} 
            placeholder={item.placeholder} 
            disabled={item.disable}
            onChange={(value) => { change && change(item.decorator, value)}}
          >
            {item.source.map((optionItem, index) => (
              <Option value={optionItem[names.value]} key={index}>{optionItem[names.label]}</Option>
            ))}
          </Select>
        ); 
      case 'date':
        return (
          <RangePicker
            style={{ width: '100%' }}
            showTime={item.showTime ? { format: 'HH:mm' } : null}
            // showTime={{ defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')] }}
            placeholder={['开始时间', '结束时间']}
          />
        );
      case 'time':
        return (
          <DatePicker 
            style={{ width: '100%' }}
          />
        )
      case 'search':
        const options = item.dataSource.map(d => <Option key={d[names.value]}>{d[names.label]}</Option>);
        
        return (
          <Select 
            allowClear
            showSearch
            showArrow={false}
            defaultActiveFirstOption={false}
            filterOption={false}
            placeholder={item.placeholder}
            onSearch={(value) => { change && change(item.decorator, value)}}
          >
            {options}   
          </Select>
        );
      case 'autoComplete':
        return (
          <AutoComplete
            allowClear
            dataSource={item.dataSource}
            placeholder={item.placeholder}
            onSearch={(value) => { change && change(item.decorator, value)}}
          />
        )
      default:
        break;
    }
  }

  public renderFields = () => {
    const { form: { getFieldDecorator }, fields, showAll } = this.props;
    const count = showAll ? fields.length : this.state.expand ? fields.length : 3;

    return fields.map((item, index) => (
      <Col span={8} key={item.decorator} style={{ display: index < count ? 'block' : 'none' }}>
        <FormItem label={item.label}>
          {getFieldDecorator(`${item.decorator}`, {
            initialValue: item.initialValue,
            rules: [{
              required: item.required,
              message: item.message,
            }],
          })(
            this.renderFormType(item)
          )}
        </FormItem>
      </Col>
    ));
  }

  public render() {
    const { expand } = this.state;
    const { fields, loading, buttonLoading, showAll, extraButton } = this.props;

    return (
        <div className={styles.tableListForm}>
          <Skeleton
            loading={loading}
            title={false}
            active
            paragraph={{ rows: 3 }}
            avatar={{ size: 'large', shape: 'circle' }}
          >
            <Form onSubmit={this.handleSearch}>
              <Row gutter={24} type="flex" justify="start">
                {fields && this.renderFields()}
              </Row>
              <Row type="flex" justify="end">
                <Col>
                  <Button type="primary" htmlType="submit" disabled={buttonLoading}>查询</Button>
                  <Button style={{ marginLeft: 8 }} disabled={buttonLoading} onClick={this.handleReset}>
                    重置
                  </Button>
                  {extraButton && extraButton}
                  {
                    fields && fields.length > 3 && !showAll ? (
                      <span className={styles.toggle} onClick={this.handleToggle}>
                        {expand ? '收缩' : '展开'}
                        <Icon type={expand ? 'up' : 'down'} />
                      </span>
                    )  : null
                  }
                </Col>
              </Row>
            </Form>
          </Skeleton>
        </div>
    )
  }

};

export default Form.create<PageSearchFormProps>()(PageSearchForm);
