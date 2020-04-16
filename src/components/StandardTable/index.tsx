import React from 'react';
import { Table } from 'antd';

class StandardTable extends React.PureComponent<any, any> {
  handleTableChange = (pagination: any, filters: any, sorter: any) => {
    const { onChange } = this.props;

    onChange && onChange(pagination, filters, sorter);
  }

  render() {
    const { rowKey, pagination, ...rest } = this.props;

    return (
      <Table
        rowKey={rowKey || 'key'}
        {...rest}
        onChange={this.handleTableChange}
        pagination={
          pagination ? 
          {...pagination,
            showTotal: total => <span style={{ color: 'red' }}>总共{total}条数据</span>
          } : false
        }
      />
    );
  }
}

export default StandardTable;
