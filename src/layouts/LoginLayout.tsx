import * as React from 'react';
import styles from './LoginLayout.scss'
import logo from '@/assets/logo.png'

const LoginLayout: React.FC = props => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <i className={styles.logo}>
            <img src={logo} alt=""/>
          </i>
        </div>
        {props.children}
      </div>
    </div>
  )
}

export default LoginLayout;
