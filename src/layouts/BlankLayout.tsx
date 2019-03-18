import React, { PureComponent, Dispatch } from 'react';
import { LocaleProvider, Layout } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import { connect } from 'dva';

const { Header, Content } = Layout;

export interface BasicLayoutProps {
  dispatch: Dispatch<any>;
}

@connect(({ menu  }) => ({

}))
class BlankLayout extends PureComponent {
  public render() {
    const { children } = this.props;

    const layout = (
      <Layout>
        {children}
      </Layout>
    )
  
    return (
      <LocaleProvider locale={zh_CN}>
        <Layout style={{ minHeight: '100vh' }}>
          <Content>
          {layout}
          </Content>
        </Layout>
      </LocaleProvider>
    );
  }
};

export default BlankLayout
