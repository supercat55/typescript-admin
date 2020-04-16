import React, { Component } from 'react';
import styles from './index.scss';

export interface FooterToolbarProps {
  extra?: React.ReactNode;
}

export interface FooterToolbarState {
  width: string;
}

class FooterToolbar extends Component<FooterToolbarProps, FooterToolbarState> {
  state = {
    width: '100%',
  };

  componentDidMount() {
    window.addEventListener('resize', this.resizeFooterToolbar);
    this.resizeFooterToolbar();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeFooterToolbar);
  }

  resizeFooterToolbar = () => {
    const sider = document.querySelector('.ant-layout-sider');
    if (sider == null) {
      return;
    }

    const width = `calc(100% - ${sider['style'].width})`;
    const { width: stateWidth } = this.state;
    if (stateWidth !== width) {
      this.setState({ width });
    }
  }

  render() {
    const { children, extra, ...restProps } = this.props;
    const { width } = this.state;

    return (
      <div className={styles.toolbar} style={{ width }} {...restProps}>
        <div className={styles.left}>{extra}</div>
        <div className={styles.right}>{children}</div>
      </div>
    );
  }
};

export default FooterToolbar;
