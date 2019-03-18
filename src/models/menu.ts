import memoizeOne from 'memoize-one';
import isEqual from 'lodash/isEqual';
import { queryModulesList } from '@/services/menu';
import Item from 'antd/lib/list/Item';

export default {
  namespace: 'menu',

  state: {
    menuData: [],
  },

  effects: {
    *getMenuData({ payload }, { call, put }) {
      let response = yield call(queryModulesList);

      if (response && Number(response.code) === 200) {
        yield put({
          type: 'save',
          payload: response.data
        })
      }
    }
  },

  reducers: {
    save(state: any, action: any) {
      return {
        ...state,
        menuData: filterMenuData(JSON.parse(action.payload))
      };
    },
  },
};

function getSubMenu(item, subModules) {
  return subModules.filter(child => child.parent_id === item.id)
}

function filterMenuData(menuData) {
  if(!menuData) return [];

  const { mainModules = [], subModules = [] } = menuData;

  return mainModules.map(item => {
    return {
      ...item,
      children: getSubMenu(item, subModules)
    }
  }).filter(i => i)
}
