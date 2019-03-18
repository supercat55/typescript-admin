import React, { PureComponent, Suspense } from 'react';
import { Layout } from 'antd';
import Link from 'umi/link';
import styles from './index.scss';
import PageLoading from '../PageLoading';
import { title } from '../../defaultSettings';

const BaseMenu = React.lazy(() => import('./BaseMenu'));

const { Sider } = Layout;

interface SiderMenuProps {
  menuData: any[];
  collapsed: boolean;
}

class SiderMenu extends PureComponent<SiderMenuProps> {
  render() {
    const { collapsed } = this.props;

    return (
      <Sider 
        width={256}
        collapsed={collapsed}
        className={styles.slider}
      >
        <div className={styles.logo} id="logo">
          <Link to="/">
            {/* <img src={logo} alt="logo" /> */}
            <h1>{title}</h1>
          </Link>
        </div>
        <Suspense fallback={<PageLoading />}>
          <BaseMenu 
            mode={'inline'} 
            theme='dark' 
            {...this.props}
          />
        </Suspense>
      </Sider>
    );
  }
};

export default SiderMenu;
