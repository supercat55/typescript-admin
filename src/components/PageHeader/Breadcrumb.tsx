import React, { PureComponent, createElement } from 'react';
import { Breadcrumb } from 'antd';
import Link from 'umi/link';
import pathToRegexp from 'path-to-regexp';
import { urlToList } from '@/utils/pathTools';
import styles from './index.scss';

export interface BreadcrumbViewProps {
  breadcrumbNameMap?: object;
  breadcrumbList?: Array<{ title: React.ReactNode; href?: string }>;
  breadcrumbSeparator?: React.ReactNode;
  linkElement?: React.ReactNode;
  itemRender?: (menuItem) => React.ReactNode;
  routes?: any[];
  params?: object;
  location?: any;
  customBreadcrumbmap?: any[]
}

export const getBreadcrumb = (breadcrumbNameMap, url) => {
  let breadcrumb = breadcrumbNameMap[url];
  if (!breadcrumb) {
    Object.keys(breadcrumbNameMap).forEach(item => {
      if (pathToRegexp(item).test(url)) {
        breadcrumb = breadcrumbNameMap[item];
      }
    });
  }
  return breadcrumb || {};
};

class BreadcrumbView extends PureComponent<BreadcrumbViewProps, any> {
  conversionFromLocation = (routerLocation, breadcrumbNameMap) => {
    const { breadcrumbSeparator, itemRender, linkElement = 'a' } = this.props;
    
    const pathSnippets = urlToList(routerLocation.pathname);
    const extraBreadcrumbItems = pathSnippets.map((url, index) => {
      const currentBreadcrumb = getBreadcrumb(breadcrumbNameMap, url);

      // const isLinkable = index !== pathSnippets.length - 1 && currentBreadcrumb.component;

      const name = itemRender ? itemRender(currentBreadcrumb) : currentBreadcrumb.name;
      
      return currentBreadcrumb.name ? (
        <Breadcrumb.Item key={url}>
          {createElement(
            'span',
            { [linkElement === 'a' ? 'href' : 'to']: url },
            name
          )}
        </Breadcrumb.Item>
      ) : null;
    })
    
    return (
      <Breadcrumb className={styles.breadcrumb} separator={breadcrumbSeparator}>
        {extraBreadcrumbItems}
      </Breadcrumb>
    );
  }

  /**
   * 渲染Breadcrumb 子节点
   */
  itemRender = (route, params, routes, paths) => {
    const { linkElement = 'a' } = this.props;
    const last = routes.indexOf(route) === routes.length - 1;

    return last || route.component ? (
      <span>{route.breadcrumbName}</span>
    ) : (
      React.createElement(
        linkElement as any,
        {
          href: paths.join('/') || '/',
          to: paths.join('/') || '/'
        },
        route.breadcrumbName
      )
    );
  };

  
  render() {
    const {
      breadcrumbSeparator,
      routes,
      params,
      breadcrumbNameMap,
      location,
      customBreadcrumbmap,
    } = this.props;
    // 如果传入自定义面包屑导航
    if (customBreadcrumbmap && customBreadcrumbmap.length) {
      return (
        <Breadcrumb className={styles.breadcrumb} separator={breadcrumbSeparator}>
          {
            customBreadcrumbmap.map((item, index) => {
              const isLinkable = index !== customBreadcrumbmap.length - 1 && item.url;
              return (
                <Breadcrumb.Item key={index}>
                  {isLinkable ?  <Link to={item.url}>{item.name}</Link>
                  : item.name}
                </Breadcrumb.Item>
              )
            })
          }
          
        </Breadcrumb>
      )
    }

    // 如果传入 routes 和 params 属性
    if (routes && params) {
      return (
        <Breadcrumb
          className={styles.breadcrumb}
          routes={routes.filter((route) => route.breadcrumbName)}
          params={params}
          itemRender={this.itemRender}
          separator={breadcrumbSeparator}
        />
      );
    }

    // 根据 location 生成 面包屑
    if (location && location.pathname) {
      return this.conversionFromLocation(location, breadcrumbNameMap);
    }

    return null;
  }
};


export default BreadcrumbView;
