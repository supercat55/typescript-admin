import React, { Component } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { ConfigProvider, Layout, Modal, message, notification } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { connect } from 'dva';
import router from 'umi/router';
import H from 'history';
import Context from './MenuContext';
import SiderMenu from '@/components/SiderMenu/SiderMenu';
import GlobalHeader from '@/components/GlobalHeader/GlobalHeader';
import ChangePassWord from '@/components/ChangePassword';
import { GetUserBaseInfo, GetAccountInfo, RemoveModulesList, RemoveUserBaseInfo } from '@/utils/cache';
import { StateType } from '@/models/menu';

moment.locale('zh-cn');

const { Header, Content, Footer } = Layout;

export interface BasicLayoutProps extends StateType {
  route: {
    routes: any[]
  },
  dispatch: Dispatch<AnyAction>;
  location: H.Location;
  collapsed: boolean;
  changePasswordVisible: boolean;
  changePassWordLoading: boolean;
  baseUserInfo: any;
}

let timer = null;
@connect(({ menu, loading, global }: any) => ({
  menuData: menu.menuData,
  globalPageSubMenu: menu.globalPageSubMenu,
  breadcrumbNameMap: menu.breadcrumbNameMap,
  collapsed: global.collapsed,
  changePasswordVisible: global.changePasswordVisible,
  baseUserInfo: global.baseUserInfo,
  changePassWordLoading: loading.effects['login/changePassword'],
}))
class BasicLayout extends Component<BasicLayoutProps, any> {
  public componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    clearInterval(timer)
  }

  public init = async() => {
    const { dispatch, route: { routes } } = this.props;

    dispatch({
      type: 'global/getUserBaseInformation',
    });

    let menuKeys = await dispatch({
      type: 'menu/getGlobalMenuDate',
      payload: { routes },
    })

    this.handleGetUnReadAccess(menuKeys);
  }

  handleGetMenuData = () => {
    const { dispatch, route: { routes } } = this.props;

    dispatch({
      type: 'menu/getMenuData',
      payload: { routes },
    });
  }

  handleMenuCollapse = collapsed => {
    const { dispatch } = this.props;

    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  }

  handleGetUnReadAccess = menuKeys => {
    console.log(menuKeys, 'menuKeys');
    timer = setInterval(async() => {
      const { dispatch, location } = this.props;

      if (menuKeys.includes('7-5') && location.pathname !== '/property/access') {
        let result: any = await dispatch({
          type: 'global/getUnReadAccessRecord',
        });
  
        if (result === 1) {
          notification.warning({
            message: '新消息',
            description: '有新的小区出入记录了，请点击查看',
            duration: 2,
            onClick: () => {
              // clearInterval(timer)
              router.push('/property/access')
            }
          })
        }
      }
    }, 5000)
  }

  handleMerchantMenuClick = async({ key }) => {
    const { baseUserInfo, dispatch } = this.props;
    const { merchantId } = baseUserInfo

    if (merchantId === key) {
      message.info('您已在当前商户');
      return;
    }

    let result = await dispatch({
      type: 'login/changeMerchant',
      payload: { merchantId: key }
    })

    if (result) {
      message.success('切换商户成功');

      RemoveUserBaseInfo();
      RemoveModulesList();

      this.init();

      router.replace('/home')
    }
  }

  handleMenuClick = ({ key }) => {
    const { dispatch } = this.props;

    if (key === 'logout') {
      Modal.confirm({
        title: '确认退出该账号吗？',
        okType: 'primary',
        onOk: () => {
          dispatch({
            type: 'login/logout',
          });
        }
      })
    }
    else if (key === 'mdify') {
      dispatch({
        type: 'global/changePasswordModalVisible',
        payload: true
      })
    }
  }

  handlePasswordModalOk = ({ originalPassword, password }) => {
    const { dispatch } = this.props;

    const params = {
      userId: GetAccountInfo().userId,
      originalPassword,
      password
    } 

    dispatch({
      type: 'login/changePassword',
      payload: params
    });
  }

  handlePasswordModalCancel = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'global/changePasswordModalVisible',
      payload: false
    });
  }
  
  getContext() {
    const { location, breadcrumbNameMap } = this.props;
    
    return {
      location,
      breadcrumbNameMap,
    };
  }

  render() {
    const { children, menuData, collapsed, changePasswordVisible, changePassWordLoading, baseUserInfo } = this.props;
    
    const baseInfo = baseUserInfo ? baseUserInfo : GetUserBaseInfo();

    const logo = 'http://wanjia.sh1a.qingstor.com/allinpay-logo.png';
    const currentOrganizeName = baseInfo.loginType === 'merchant' ? baseInfo.merchantName : baseInfo.organizeName;
    const currentName = baseInfo.fullName;
    
    const layout = (
      <Layout>
        <SiderMenu menuData={menuData} logo={logo} {...this.props}/>
        <Layout style={{ minHeight: '100vh' }}>
          <Header style={{ padding: 0, overflow: 'hidden' }}>
            <GlobalHeader
              currentOrganizeName={currentOrganizeName}
              currentName={currentName}
              collapsed={collapsed} 
              onCollapse={this.handleMenuCollapse}
              onMenuClick={this.handleMenuClick}
              onMenuMerchantClick={this.handleMerchantMenuClick}
              {...this.props}
            />
          </Header>
          <Content>
            {children}
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            <div>copyright 2018-2019 通联支付网络服务股份有限公司 版权所有</div>
          </Footer>
        </Layout>
        <ChangePassWord
          visible={changePasswordVisible}
          modalOk={this.handlePasswordModalOk}
          cancel={this.handlePasswordModalCancel} 
          submitLoading={changePassWordLoading}
        />
      </Layout>
    )

    return (
      <ConfigProvider locale={zh_CN}>
        <Context.Provider value={this.getContext()}>
          {layout}
        </Context.Provider>
      </ConfigProvider>
    )  
  }
};

export default BasicLayout;
