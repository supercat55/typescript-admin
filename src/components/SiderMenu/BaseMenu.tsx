import React, { PureComponent } from 'react';
import H from 'history';
import { Menu, Icon } from 'antd';
import { MenuMode } from 'antd/es/menu';
import Link from 'umi/link';
import { IsUrl } from '@/utils/utils';
import { urlToList } from '@/utils/pathTools';
import { getFlatMenuKeys, getMenuMatches } from './SiderMenuUtils';

import styles from './index.scss';

const SubMenu = Menu.SubMenu;

export interface BaseMenuProps {
  mode?: MenuMode,
  theme?: any;
  menuData: any[];
  location: H.Location;
  openKeys?: any[];
  collapsed: boolean;
  handleOpenChange?: (openKeys: any[]) => void;
}

const getIcon = (icon: string) => {
  if (typeof icon === 'string') {
    if (IsUrl(icon)) {
      return <Icon component={() => <img src={icon} alt="icon" className={styles.icon} />} />;
    }
    if (icon.startsWith('icon-')) {
      return Icon.createFromIconfontCN({ scriptUrl: './' });
    }
    return <Icon type={icon} />;
  }

  return icon;
};

class BaseMenu extends PureComponent<BaseMenuProps, any> {
  conversionPath = (path: string) => {
    if (path && path.indexOf('http') === 0) {
      return path;
    }
    return `/${path || ''}`.replace(/\/+/g, '/');
  };

  getSubMenuOrItem = (item: any) => {
    if (item.children && item.children.some((child: { name: any; }) => child.name)) {
      const { name } = item;
      
      return (
        <SubMenu
          title={
            item.icon ? (
              <span>
                {getIcon(item.icon)}
                <span>{name}</span>
              </span>
            ) : name
          }
          key={item.path}
        >
          {this.getNavMenuItems(item.children)}
        </SubMenu>
      )
    }
    return <Menu.Item key={item.path}>{this.getMenuItemPath(item)}</Menu.Item>
  }

  getMenuItemPath = (item: any) => {
    const { location } = this.props;
    const { name, path, target } = item;
    const itemPath = this.conversionPath(path);
    const icon = item.icon ? getIcon(item.icon) : '';

    if (/^https?:\/\//.test(itemPath)) {
      return (
        <a href={itemPath} target={target}>
          {item.icon ? icon : ''}
          <span>{name}</span>
        </a>
      );
    }

    return (
      <Link
        to={itemPath}
        target={target}
        replace={itemPath === location.pathname}
      >
        {icon}
        <span>{name}</span>
      </Link>
    )
  }

  getNavMenuItems = (menuData: any[]) => {
    if (!menuData || !menuData.length) {
      return [];
    }
    
    return menuData
      .filter(item => item.name)
      .map(item => this.getSubMenuOrItem(item))
      .filter(item => item)
  }
  
  getSelectedMenuKeys = (pathname: string) => {
    const { menuData } = this.props;
    const flatMenuKeys = getFlatMenuKeys(menuData);

    return urlToList(pathname).map(itemPath => getMenuMatches(flatMenuKeys, itemPath).pop());
  }

  render() {
    const { mode, theme, menuData = [], location, openKeys, collapsed, handleOpenChange } = this.props;

    let selectedKeys = this.getSelectedMenuKeys(location.pathname).filter(item => item);

    if (!selectedKeys.length && openKeys) {
      selectedKeys = [openKeys[openKeys.length - 1]];
    }
    let props = {};
    if (openKeys && !collapsed) {
      props = {
        openKeys: openKeys.length === 0 ? [...selectedKeys] : openKeys,
      };
    }

    return (
      <Menu
        mode={mode}
        theme={theme}
        selectedKeys={selectedKeys}
        onOpenChange={handleOpenChange}
        {...props}
      >
        {this.getNavMenuItems(menuData)}
      </Menu>
    )
  }
};

export default BaseMenu;
