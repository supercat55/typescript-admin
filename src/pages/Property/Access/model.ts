import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryAccessList, 
  queryAccessDetail,
  sendCreateAccess,
  sendDeleteAccess,
} from '@/services/access';
import { queryHouseInfoByCommunity } from '@/services/info';
import { RESIDENT_RELATION_TYPES_DESC, ACCESS_TYPES_DESC } from '@/utils/const';

export interface StateType {
  accessList: any[];
  accessTotal: number;
  accessDetail: any;
  houseInfoCascader: any[];
}

export interface AccessModelType {
  namespace: string;
  state: StateType;
  effects: {
    getAccessList: Effect;
    getAccessDetail: Effect;
    createAccess: Effect;
    deleteAccess: Effect;
    getHouseInfoOptions: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
    saveHouseInfoByCommunity: Reducer<StateType>;
  }
}

const Model: AccessModelType =  {
  namespace: 'access',

  state: {
    accessList: [],
    accessTotal: 0,
    accessDetail: null,
    houseInfoCascader: [],
  },

  effects: {
    *getAccessList({ payload }, { call, put }) {
      let response = yield call(queryAccessList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getAccessDetail({ payload }, { call }) {
      const response = yield call(queryAccessDetail, payload);

      if (response && response.code === 200) {
        return response.data
      }
    },
    *createAccess({ payload }, { call, put }) {
      const response = yield call(sendCreateAccess, payload);

      if (response && response.code === 200) {
        message.success('新增登记成功');

        yield put(routerRedux.push('/property/access'))
      }
    },
    *deleteAccess({ payload }, { call }) {
      const response = yield call(sendDeleteAccess, payload);

      if (response && response.code === 200) {
        message.success('删除登记记录成功');
        return true
      }
    },
    *getHouseInfoOptions({ payload }, { call, put }) {
      const response = yield call(queryHouseInfoByCommunity, payload);

      if (response && response.code === 200) {
        yield put({
          type: 'saveHouseInfoByCommunity',
          payload: response.data,
        })
      }
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        accessList: convertList(payload.list),
        accessTotal: payload.total,
      };
    },
    saveHouseInfoByCommunity(state, { payload }) {
      return {
        ...state,
        houseInfoCascader: convertHouseInfoOptions(payload)
      }
    },
  }
};


export default Model;


const convertList = list => {
  return list.map(item => {
    return convertItem(item)
  })
};

const convertItem = item => {
  return {
    ...item,
      houseInfos: `${item.communityName}${item.buildingNo}-${item.unitNo}-${item.accountNo}`,
      isOwnerDesc: RESIDENT_RELATION_TYPES_DESC[item.isOwner],
      accessTypeDesc: ACCESS_TYPES_DESC[item.accessType],
      accessTime: item.accessTime ? moment(new Date(item.accessTime)).format('YYYY-MM-DD HH:mm:ss') : '',
  }
}

const convertHouseInfoOptions = list => {
  let houseInfoOptions = [];

  for (let a in list) {
    let buildOptions = list[a];
    let build = {
        value: buildOptions.buildingNo,
        label: buildOptions.buildingNo,
        children: []
    };

    if (buildOptions.childs && buildOptions.childs.length > 0) {
      for (let b in buildOptions.childs) {
        let unitOptions = buildOptions.childs[b];
        let unit = {
          value: unitOptions.unitNo,
          label: unitOptions.unitNo,
          children: []
        };

        if (unitOptions.childs && unitOptions.childs.length > 0) {
          for (let c in unitOptions.childs) {
            let houseOptions = unitOptions.childs[c];
            let house = {
              value: houseOptions.houseId,
              label: houseOptions.accountNo,
            }

            unit.children.push(house);
          }
        }

        build.children.push(unit);
      }
    }

    houseInfoOptions.push(build);
  }

  return houseInfoOptions;
}
