import React from 'react';
import styles from './LoginLayout.scss';

const LoginLayout: React.FC = props => {
  return (
    <div className={styles.container}>
        <div className={styles.content}>
          {props.children}
        </div>
      </div>
  );
};

export default LoginLayout;
