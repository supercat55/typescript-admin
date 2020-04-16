import { Reducer } from 'redux';
import { Effect } from 'dva';
import moment from 'moment';
import { 
  queryMaintainList, 
  queryMaintainDetail,
  sendCompletedMaintain,
  sendMaintainAssginEmployee,
} from '@/services/property';
import { MAINTAIN_TYPES_DESC, MAINTAIN_STATUS_DESC } from '@/utils/const';

export interface StateType {
  maintainList: any[];
  maintainTotal: number;
  maintainDetail: any;
}

export interface MaintainModelType {
  namespace: string;
  state: StateType;
  effects: {
    getMaintainList: Effect;
    getMaintainDetail: Effect;
    completedMaintain: Effect;
    assginEmployee: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
    saveDetail: Reducer<StateType>;
  }
}

const Model: MaintainModelType =  {
  namespace: 'maintain',

  state: {
    maintainList: [],
    maintainTotal: 0,
    maintainDetail: null
  },

  effects: {
    *getMaintainList({ payload }, { call, put }) {
      let response = yield call(queryMaintainList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getMaintainDetail({ payload }, { call, put }) {
      const response = yield call(queryMaintainDetail, payload);

      if (response && response.code === 200) {
        yield put({
          type: 'saveDetail',
          payload: response.data
        })
      }
    },
    *completedMaintain({ payload }, { call }) {
      const response = yield call(sendCompletedMaintain, payload);

      if (response && response.code === 200) {
        return true
      }
    },
    *assginEmployee({ payload }, { call }) {
      const response = yield call(sendMaintainAssginEmployee, payload);

      if (response && response.code === 200) {
        return true
      }
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        maintainList: convertList(payload.list),
        maintainTotal: payload.total,
      };
    },
    saveDetail(state, { payload }) {
      return {
        ...state,
        maintainDetail: convertItem(payload),
      };
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
      houseInfos: `${item.buildingNo}-${item.unitNo}-${item.accountNo}`,
      typeDesc: MAINTAIN_TYPES_DESC[item.type],
      statusDesc: MAINTAIN_STATUS_DESC[item.status],
      repairTime: item.repairTime ? moment(new Date(item.repairTime)).format('YYYY-MM-DD HH:mm:ss') : '',
      completeTime: item.completeTime ? moment(new Date(item.completeTime)).format('YYYY-MM-DD HH:mm:ss') : '',
      repairImages: item.repairPics ? item.repairPics.split(',') : []
  }
}

