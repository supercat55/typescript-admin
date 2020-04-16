import { Reducer } from 'redux';
import { Effect } from 'dva';
import moment from 'moment';
import { 
  queryAdvertisementList,
  queryAdvertisementDetail,
  sendCheckAdvertisementName,
  sendCreateAdvertisement,
  sendEditAdvertisement,
} from '@/services/parameter';

export interface StateType {
  advertisementList: any[];
  advertisementTotal: number;
}

export interface AdvertisementModelType {
  namespace: string;
  state: StateType;
  effects: {
    getAdvertisementList: Effect;
    getAdvertisementDetail: Effect;
    checkCheckAdvertisementName: Effect;
    createAdvertisement: Effect;
    editAdvertisement: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
  };
}

const Model: AdvertisementModelType =  {
  namespace: 'advertisement',

  state: {
    advertisementList: [],
    advertisementTotal: 0,
  },

  effects: {
    *getAdvertisementList({ payload }, { call, put }) {
      let response = yield call(queryAdvertisementList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getAdvertisementDetail({ payload }, { call }) {
      let response = yield call(queryAdvertisementDetail, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *checkCheckAdvertisementName({ payload }, { call }) {
      let response = yield call(sendCheckAdvertisementName, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *createAdvertisement({ payload }, { call }) {
      let response = yield call(sendCreateAdvertisement, payload);
      
      if (response && response.code === 200) {
        return true
      }  
    },
    *editAdvertisement({ payload }, { call }) {
      let response = yield call(sendEditAdvertisement, payload);
      
      if (response && response.code === 200) {
        return true
      }  
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        advertisementList: convertList(payload.list),
        advertisementTotal: payload.total,
      };
    },
  }
};


export default Model;

const convertList = list => {
  return list.map(item => {
    return {
      ...item,
      createTime: moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss'),
    }
  })
}
