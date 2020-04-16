import React, { Component, Fragment } from 'react';
import { Card } from 'antd';
import MenuContext from '@/layouts/MenuContext';
import PageHeader, { PageHeaderProps } from '@/components/PageHeader/PageHeader';
import styles from './index.scss';

export interface PageWrapperProps extends PageHeaderProps{
  wrapperClassName?: string;
}

class PageWrapper extends Component<PageWrapperProps, any> {
  render() {
    const { wrapperClassName, children, loading, title, ...restProps } = this.props;
    
    return (
      <div className={wrapperClassName}>
       <MenuContext.Consumer>
        {value => (
          <Fragment>
            <PageHeader loading={loading} title={title} {...value} {...restProps}/>
          </Fragment>
        )}
       </MenuContext.Consumer>
       <div className={styles.content}>
          <Card bordered={false}>
            {children}
          </Card>
        </div>
      </div>
    )
  }
}


export default PageWrapper;

