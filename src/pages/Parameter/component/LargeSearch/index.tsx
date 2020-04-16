import React, { PureComponent } from 'react';
import { Row, Col, Input, Divider } from 'antd';

const Search = Input.Search;

export interface LargeSearchProps {
  placeholder?: string;
  value: string;
  change: (value: string) => void; // 条件change事件
  search: () => void;
}

class LargeSearch extends PureComponent<LargeSearchProps, any> {
  render() {
    const { placeholder = '请输入', value, change, search } = this.props;

    return (
      <Row style={{ marginBottom: 40 }}>
        <Col offset={6} span={12}>
          <Search
            value={value}
            placeholder={placeholder}
            size="large"
            enterButton="搜索"
            onChange={e => change(e.target.value)}
            onSearch={search}
          />
        </Col>
      </Row>
    )
  }
};

export default LargeSearch;
