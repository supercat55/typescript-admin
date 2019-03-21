import React, { PureComponent } from 'react';
import { Icon } from 'antd';
// import Link from 'umi/link';
import debounce from 'lodash/debounce';
import styles from './index.scss';
import RightContent from './RightContent';

export interface GlobalHeaderProps {
  collapsed: boolean;
  onCollapse: (type: boolean) => void
}

export default class GlobalHeader extends PureComponent<GlobalHeaderProps, any> {
  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }

  triggerResizeEvent = debounce(() => {
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }, 500)

  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    onCollapse(!collapsed);
    this.triggerResizeEvent();
  };

  render() {
    const { collapsed } = this.props;

    return (
      <div className={styles.header}>
        <span className={styles.trigger} onClick={this.toggle}>
          <Icon type={collapsed ? 'menu-unfold' : 'menu-fold'} />
        </span>
        <RightContent {...this.props} />
      </div>
    );
  }
};

