import * as React from 'react';
import styles from './LoginLayout.scss'

const LoginLayout: React.FC = props => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          {/* 大通会议室后台管理系统 */}
        </div>
        { props.children }
      </div>
    </div>
  )
}

export default LoginLayout