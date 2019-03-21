import React, { PureComponent } from 'react';
import { Menu, Dropdown, Icon, Avatar } from 'antd';
// import { GetAccountInfo } from '@/utils/cache';
import styles from './index.scss';

class GlobalHeaderRight extends PureComponent {
  render() {
    // const { onMenuClick } = this.props;
      
    const menu = (
      <Menu onClick={() => {}}>
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
        <Dropdown overlay={menu}>
          <span className={`${styles.action} ${styles.account}`}>
            <Avatar icon="user" size="small"/>
            {/* <span className={styles.name}>{GetAccountInfo().nickName}</span> */}
          </span>
        </Dropdown>
      </div>
    );
  }
}

export default GlobalHeaderRight;
