import React, { PureComponent, Suspense } from 'react';
import { Layout } from 'antd';
import Link from 'umi/link';
import PageLoading from '../PageLoading';
import { BaseMenuProps } from './BaseMenu';
import { getDefaultCollapsedSubMenus } from './SiderMenuUtils';

const BaseMenu = React.lazy(() => import('./BaseMenu'));
import styles from './index.scss';

const { Sider } = Layout;

interface SiderMenuProps extends BaseMenuProps {
  logo: string
}

interface SiderMenuState {
  readonly openKeys: any[];
}

class SideMenu extends PureComponent<SiderMenuProps, SiderMenuState> {
  constructor(props: SiderMenuProps) {
    super(props);
    this.state = {
      openKeys: getDefaultCollapsedSubMenus(props),
    };
  }

  static getDerivedStateFromProps(props: any, state: { pathname: any; }) {
    const { pathname } = state;
    if (props.location.pathname !== pathname) {
      return {
        pathname: props.location.pathname,
        openKeys: getDefaultCollapsedSubMenus(props),
      };
    }
    return null;
  }

  isMainMenu = (key: any) => {
    const { menuData } = this.props;
    return menuData.some(item => {
      if (key) {
        return item.key === key || item.path === key;
      }
      return false;
    });
  };

  handleOpenChange = (openKeys: any[]) => {
    const moreThanOne = openKeys.filter(openKey => this.isMainMenu(openKey)).length > 1;
    this.setState({
      openKeys: moreThanOne ? [openKeys.pop()] : [...openKeys],
    });
  };

  render() {
    const { openKeys } = this.state;
    const { menuData, logo, collapsed } = this.props;
    const defaultProps = collapsed ? {} : { openKeys };

    return (
      <Sider
        className={styles.slider}
        width={200}
        collapsed={collapsed}
      >
        <div className={styles.logo} id="logo">
          <Link to="/">
            <img src={logo} alt="logo" />
          </Link>
        </div>
        <Suspense fallback={<PageLoading/>}>
          <BaseMenu
            {...this.props}
            mode={'inline'}
            theme='dark'
            menuData={menuData}
            {...defaultProps}
            handleOpenChange={this.handleOpenChange}
          />
        </Suspense>
      </Sider>
    )
  }
};

export default SideMenu;

