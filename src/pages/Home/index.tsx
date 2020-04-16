import React from 'react';
import styles from './index.scss';
import { GetUserBaseInfo } from '@/utils/cache';

const HomePage: React.FC = props => {
  const maxHeight = window.innerHeight;
  const baseInfo = GetUserBaseInfo();
  const { loginType, organizeName, merchantName, merchantNum, merchantType } = baseInfo;
  let title;
  let desc;

  if (loginType === 'operation') {
      title = `${organizeName}`;
  } else if (loginType === 'merchant') {
      title = `商户名称: ${merchantName}`;
      desc = `商户号：${merchantNum}`;
  }

  return (
    <div className={styles.container}  style={{ height: `${maxHeight - 174}px` }}>
      <img src="http://wanjia.sh1a.qingstor.com/fedef52f38314500b43d9c1fcc6fc21f.png" alt=""/>
      <p className={styles.title}>{title}</p>
      {desc && <p className={styles.desc}>{desc}</p>}
    </div>
  );
};

export default HomePage;
