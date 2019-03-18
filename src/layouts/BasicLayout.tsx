import React, { PureComponent, Dispatch } from 'react';
import { LocaleProvider, Layout } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import { connect } from 'dva';
import SiderMenu from '@/components/SiderMenu/SiderMenu';

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

  public render() {
    const { children, menuData } = this.props;
    console.log(menuData, 'menuData');

    const layout = (
      <Layout>
        <SiderMenu menuData={menuData} {...this.props}/>
        <Layout style={{ minHeight: '100vh' }}>
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
