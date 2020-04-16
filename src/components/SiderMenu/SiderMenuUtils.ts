import pathToRegexp from 'path-to-regexp';
import { urlToList } from '@/utils/pathTools'

export const getFlatMenuKeys = (menuData: any[]) => {
  let keys: any[] = [];
  menuData.forEach(item => {
    keys.push(item.path);
    if (item.children) {
      keys = keys.concat(getFlatMenuKeys(item.children));
    }
  });
  return keys;
};

export const getMenuMatches = (flatMenuKeys: any[], path: string) =>
  flatMenuKeys.filter(item => {
    if (item) {
      return pathToRegexp(item).test(path);
    }
    return false;
  });

  /**
 * 获得菜单子节点
 * @memberof SiderMenu
 */
export const getDefaultCollapsedSubMenus = (props: { location: { pathname: any; }; menuData: any; }) => {
  const {
    location: { pathname },
    menuData,
  } = props;
  const flatMenuKeys = getFlatMenuKeys(menuData);

  return urlToList(pathname)
    .map(item => getMenuMatches(flatMenuKeys, item)[0])
    .filter(item => item);
};
