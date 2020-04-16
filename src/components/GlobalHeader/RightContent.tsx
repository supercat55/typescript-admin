import React, { PureComponent } from 'react';
import { Menu, Dropdown, Icon, Avatar } from 'antd';
import styles from './index.scss';
import { SelectParam } from 'antd/es/menu';

export interface GlobalHeaderRightProps {
  baseUserInfo: any;
  currentOrganizeName: string;
  currentName: string;
  onMenuClick: (param: SelectParam) => void;
  onMenuMerchantClick: (param: any) => void;
}

class GlobalHeaderRight extends PureComponent<GlobalHeaderRightProps, any> {
  renderSwitchMenu = list => {
    const { onMenuMerchantClick } = this.props;

    return (
      <Menu onClick={onMenuMerchantClick}>
        {list.map(item => (
          <Menu.Item key={item.merchantId}>{item.merchantName}</Menu.Item>
        ))}
      </Menu>
    )
  }

  render() {
    const { baseUserInfo, currentOrganizeName, currentName, onMenuClick } = this.props;
    const { loginType, listMerchant } = baseUserInfo;

    const menu = (
      <Menu onClick={onMenuClick}>
        <Menu.Item key="mdify">
          <Icon type="edit" />
          <span>修改密码</span>
        </Menu.Item>
        <Menu.Item key="logout">
          <Icon type="logout" />
          <span>退出登录</span>
        </Menu.Item>
      </Menu>
    );

    return (
      <div className={styles.right}>
        {
          loginType === 'merchant' && listMerchant && listMerchant.length ?
          <Dropdown
            trigger={['click', 'hover']}
            overlay={this.renderSwitchMenu(listMerchant)}
          >
            <span className={styles.name}>
              {currentOrganizeName}
              <Icon type="down" />
            </span>
          </Dropdown> :
          <span className={styles.name}>{currentOrganizeName}</span>
        }
        <Dropdown overlay={menu}  trigger={['click', 'hover']}>
          <span className={`${styles.action} ${styles.account}`}>
            {/* <span className={styles.name}>{currentOrganizeName}</span> */}
            <Avatar icon="user" size="small"/>
            <span className={styles.name}>{currentName}</span>
          </span>
        </Dropdown>
      </div>
    );
  }
}

export default GlobalHeaderRight;
