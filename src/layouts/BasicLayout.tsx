import React, { PureComponent, Dispatch } from 'react';
import { LocaleProvider, Layout } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import { connect } from 'dva';
import SiderMenu from '@/components/SiderMenu/SiderMenu';
import GlobalHeader from '@/components/GlobalHeader';

const { Header, Content } = Layout;

export interface BasicLayoutProps {
  dispatch: Dispatch<any>;
  menuData: any[];
  collapsed: boolean;
}

@connect(({ menu }) => ({
  menuData: menu.menuData,
}))
class BasicLayout extends PureComponent<BasicLayoutProps, {}> {
  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({
      type: 'menu/getMenuData'
    })
  }

  public handleMenuCollapse = collapsed => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };

  public render() {
    const { children, menuData, collapsed } = this.props;

    const layout = (
      <Layout>
        <SiderMenu menuData={menuData} {...this.props}/>
        <Layout style={{ minHeight: '100vh' }}>
          <Header style={{ padding: 0 }}>
            <GlobalHeader
              collapsed={collapsed}
              onCollapse={this.handleMenuCollapse}
              // onMenuClick={this.handleMenuClick}
            />
          </Header>
          <Content>
            {children}
          </Content>
        </Layout>
      </Layout>
    )
  
    return (
      <LocaleProvider locale={zh_CN}>
        {layout}
      </LocaleProvider>
    );
  }
};

export default BasicLayout
