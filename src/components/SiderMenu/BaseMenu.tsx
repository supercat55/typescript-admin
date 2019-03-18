
import React, { PureComponent, Fragment } from 'react';
import { Menu, Icon } from 'antd';
import { MenuMode, MenuTheme } from 'antd/es/menu';
import Link from 'umi/link';

const SubMenu = Menu.SubMenu;

import styles from './index.scss';

interface BaseMenuProps {
  mode?: MenuMode;
  theme?: MenuTheme;
  menuData: any[]
}

class BaseMenu extends PureComponent<BaseMenuProps, any> {
  private getNavMenuItems = menuData => {
    if (!menuData) {
      return [];
    }
    
    return menuData.map(menu => {
      if (menu.children.length) {
        return (
          <SubMenu key={menu.id} title={<span><Icon type="appstore" /><span>{menu.modules_name}</span></span>}>
            {
              menu.children.map(sub => (
                <Menu.Item key={sub.id}>{sub.modules_name}</Menu.Item>
              ))
            }
          </SubMenu>
        )
      }
      else {
        return (
          <Menu.Item key={menu.id}>
            <Icon type="desktop" />
            <span>{menu.modules_name}</span>
          </Menu.Item>
        )
      }
    })
  }

  render() {
    const { mode, theme, menuData } = this.props;

    return (
      <Menu
        mode={mode}
        theme={theme}
      >
        {this.getNavMenuItems(menuData)}
      </Menu>
    );
  }
}

export default BaseMenu;
