import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryResidentList, 
  queryResidentDetail,
  queryHouseInfoByCommunity,
  sendCreateResident,
  sendBatchCreateResident,
  sendEditResident,
  sendDeleteResident
} from '@/services/info';
import { RESIDENT_RELATION_TYPES_DESC } from '@/utils/const';

export interface StateType {
  residentList: any[];
  residentTotal: number;
  houseInfoCascader: any[];
}

export interface ResidentModelType {
  namespace: string;
  state: StateType;
  effects: {
    getResidentList: Effect;
    getResidentDetail: Effect;
    getHouseInfoOptions: Effect;
    createResident: Effect;
    createBatchResident: Effect;
    editResident: Effect;
    deleteResident: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
    saveHouseInfoByCommunity: Reducer<StateType>;
  }
}

const Model: ResidentModelType =  {
  namespace: 'resident',

  state: {
    residentList: [],
    residentTotal: 0,
    houseInfoCascader: []
  },

  effects: {
    *getResidentList({ payload }, { call, put }) {
      let response = yield call(queryResidentList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getResidentDetail({ payload }, { call }) {
      const response = yield call(queryResidentDetail, payload);

      if (response && response.code === 200) {
        return response.data
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
    *createResident({ payload }, { call, put }) {
      const response = yield call(sendCreateResident, payload);

      if (response && response.code === 200) {
        message.success('新增住户成功');

        yield put(routerRedux.push('/info/resident'))
      }
    },
    *createBatchResident({ payload }, { call }) {
      const response = yield call(sendBatchCreateResident, payload);

      if (response && response.code === 200) {
        return true
      }
    },
    *editResident({ payload }, { call, put }) {
      const response = yield call(sendEditResident, payload);

      if (response && response.code === 200) {
        message.success('编辑住户成功');

        yield put(routerRedux.push('/info/resident'))
      }
    },
    *deleteResident({ payload }, { call }) {
      const response = yield call(sendDeleteResident, payload);

      if (response && response.code === 200) {
        message.success('删除住户成功');

        return true
      }
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        residentList: convertList(payload.houseList),
        residentTotal: payload.total,
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
    return {
      ...item,
      houseInfos: `${item.buildingNo}-${item.unitNo}-${item.accountNo}`,
      relationshipDesc: item.isOwner >= 0 ? RESIDENT_RELATION_TYPES_DESC[item.isOwner] : '',
      createTime: moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss'),
    }
  })
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
              value: houseOptions.accountNo,
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

