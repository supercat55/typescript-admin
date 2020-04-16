import { Reducer } from 'redux';
import { Effect } from 'dva';
import memoizeOne from 'memoize-one';
import { uniq, isEqual } from 'lodash';
import { queryModulesList } from '@/services/global';
import { SetModulesList, GetModulesList } from '@/utils/cache';
import { pageSubMenu } from '@/utils/config';

export interface StateType {
  menuData: any[]
  breadcrumbNameMap: any;
  globalPageSubMenu: any;
}

export interface MenuModelType {
  namespace: string;
  state: StateType;
  effects: {
    getGlobalMenuDate: Effect
  };
  reducers: {
    save: Reducer<StateType>;
  };
}

let menuKeys = []

const Model: MenuModelType =  {
  namespace: 'menu',

  state: {
    menuData: [],
    breadcrumbNameMap: {},
    globalPageSubMenu: {}
  },

  effects: {
    *getGlobalMenuDate({ payload }, { call, put }) {
      const { routes } = payload;
      let modulesData = [];

      if (GetModulesList()) {
        modulesData = GetModulesList()
      } else {
        let response = yield call(queryModulesList)
        
        if (response && response.code === 200) {
          SetModulesList(response.data);

          modulesData = response.data
        }
      }

      menuKeys = convertModulesListIds(modulesData);
      const menuData = filterMenuData(memoizeOneFormatter(routes));
      const breadcrumbNameMap = memoizeOneGetBreadcrumbNameMap(menuData);
      const globalPageSubMenu = getGlobalPageSubMenu();


      yield put({
        type: 'save',
        payload: { menuData, breadcrumbNameMap, globalPageSubMenu }
      });

      return menuKeys;
    }
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  }
};


export default Model;

const getGlobalPageSubMenu = () => {
  let IS_SHOW_PAGESUBMENU = {};

  Object.keys(pageSubMenu).forEach(item => {
    IS_SHOW_PAGESUBMENU[item] = menuKeys.includes(pageSubMenu[item])
  })

  return IS_SHOW_PAGESUBMENU
}

const convertModulesListIds = modules => {
  let result = [];

  for (let i in modules) {
    let firstMenu = modules[i];

    result.push(firstMenu.id);

    if (firstMenu.parentModules && firstMenu.parentModules.length > 0) {
      for (let j in firstMenu.parentModules) {
        let secondMenu = firstMenu.parentModules[j];

        result.push(secondMenu.id);

        if (secondMenu.subModules && secondMenu.subModules.length > 0) {
          for (let k in secondMenu.subModules) {
            result.push(secondMenu.subModules[k].id)
          }
        }
      }
    }
  }

  return uniq(result);
}

const formatter = (data) => {
  return data.map(item => {
    if (!item.name || !item.path) {
      return null;
    }

    const result = {
      ...item,
      name: item.name
    };
  
    if (item.routes) {
      const children = formatter(item.routes);
      result.children = children;
    }
    delete result.routes;
  
    return result;
  })
    .filter(item => item);
};

/**
 * 获取面包屑映射
 * @param {Object} menuData 菜单配置
 */
const getBreadcrumbNameMap = menuData => {
  const routerMap = {};

  const flattenMenuData = data => {
    data.forEach(menuItem => {
      if (menuItem.children) {
        flattenMenuData(menuItem.children);
      }
      // Reduce memory usage
      routerMap[menuItem.path] = menuItem;
    });
  }
  flattenMenuData(menuData);
  return routerMap;
};

// 判断是否有一个子项被选中，则父级也被选中
const checkChildrenInAuthority = parent => {
  if (menuKeys.includes(parent.key)) return true;
  if (!parent.children) return false;
  return parent.children.some(item => menuKeys.includes(item.key));
};

const filterMenuData = menuData => {
  if(!menuData) return [];

  return menuData
    .filter(item => {
      return item.name && !item.hideInMenu && checkChildrenInAuthority(item);
    })
    .map(item => getSubMenu(item))
    .filter(item => item);
};

const getSubMenu = item => {
  if (item.children && !item.hideChildrenInMenu && item.children.some(child => child.name)) {
    return {
      ...item,
      children: filterMenuData(item.children)
    };
  }
  return item;
};

const memoizeOneFormatter = memoizeOne(formatter, isEqual);
const memoizeOneGetBreadcrumbNameMap = memoizeOne(getBreadcrumbNameMap, isEqual);
