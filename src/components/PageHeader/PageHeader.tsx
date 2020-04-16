import React, { PureComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Skeleton, Tabs } from 'antd';
import BreadcrumbView, { BreadcrumbViewProps } from './Breadcrumb';
import styles from './index.scss';

const { TabPane } = Tabs;

export interface PageHeaderProps extends BreadcrumbViewProps {
  hiddenBreadcrumb?: boolean;
  showBack?: boolean;
  loading?: boolean;
  title: string;
  content?: React.ReactNode;
  tabList?: any[];
  onTabChange?: (param: any) => void;
}

class PageHeader extends PureComponent<PageHeaderProps & RouteComponentProps, any> {
  handleBack = () => {
    this.props.history.goBack();
  }

  onChange = key => {
    const { onTabChange } = this.props;
    if (onTabChange) {
      onTabChange(key);
    }
  };

  render() {
    const { hiddenBreadcrumb, showBack, loading = false, title, content, tabList } = this.props;
    
    return (
      <div className={styles.pageHeader}>
        <Skeleton
          active
          loading={loading}
          title={false}
          paragraph={{ rows: 2 }}
          avatar={{ size: 'large', shape: 'circle' }}
        >
          <div className={styles.top}>
            {hiddenBreadcrumb ? null : <BreadcrumbView {...this.props} />}
            {showBack ? <span className={styles.back} onClick={this.handleBack}>返回</span> : null}
          </div>
          <div className={styles.row}>
            <div className={styles.detail}>
              <h1 className={styles.title}>{title}</h1>
            </div>
            {content && <div className={styles.content}>{content}</div>}
          </div>
          {tabList && tabList.length ? (
            <Tabs
              className={styles.tabs}
              onChange={this.onChange}
            >
              {tabList.map(item => (
                <TabPane tab={item.tab} key={item.key} />
              ))}
            </Tabs>
          ) : null}
        </Skeleton>
      </div>
    )
  }
};

export default withRouter(PageHeader);
