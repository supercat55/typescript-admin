import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryBannerList,
  queryBannerDetail,
  queryDefaultBannerDetail,
  sendCheckBannerName,
  sendCreateBanner,
  sendEditBanner,
  sendEditDefaultBanner,
} from '@/services/parameter';

export interface StateType {
  scrollBannerList: any[];
  scrollBannerTotal: number;
  bottomBannerList: any[];
  bottomBannerTotal: number;
}

export interface BannerModelType {
  namespace: string;
  state: StateType;
  effects: {
    getScrollBannerList: Effect;
    getBottomBannerList: Effect;
    getBannerDetail: Effect;
    getDefaultBannerDetail: Effect;
    checkCheckBannerName: Effect;
    createBanner: Effect;
    editBanner: Effect;
    editDefaultBanner: Effect;
  };
  reducers: {
    saveScrollList: Reducer<StateType>;
    saveBottomList: Reducer<StateType>;
  };
}

const Model: BannerModelType =  {
  namespace: 'banner',

  state: {
    scrollBannerList: [],
    scrollBannerTotal: 0,
    bottomBannerList: [],
    bottomBannerTotal: 0,
  },

  effects: {
    *getScrollBannerList({ payload }, { call, put }) {
      let response = yield call(queryBannerList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveScrollList',
          payload: response.data
        })
      }  
    },
    *getBottomBannerList({ payload }, { call, put }) {
      let response = yield call(queryBannerList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveBottomList',
          payload: response.data
        })
      }  
    },
    *getBannerDetail({ payload }, { call }) {
      let response = yield call(queryBannerDetail, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *getDefaultBannerDetail({ payload }, { call }) {
      let response = yield call(queryDefaultBannerDetail, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *checkCheckBannerName({ payload }, { call }) {
      let response = yield call(sendCheckBannerName, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *createBanner({ payload }, { call, put }) {
      let response = yield call(sendCreateBanner, payload);
      
      if (response && response.code === 200) {
        message.success('新增banner模版成功');

        yield put(routerRedux.goBack());
      }  
    },
    *editBanner({ payload }, { call, put }) {
      let response = yield call(sendEditBanner, payload);
      
      if (response && response.code === 200) {
        message.success('编辑banner模版成功');

        yield put(routerRedux.goBack());
      }  
    },
    *editDefaultBanner({ payload }, { call, put }) {
      let response = yield call(sendEditDefaultBanner, payload);
      
      if (response && response.code === 200) {
        message.success('编辑默认banner模版成功');

        yield put(routerRedux.goBack());
      }  
    },
  },

  reducers: {
    saveScrollList(state, { payload }) {
      return {
        ...state,
        scrollBannerList: convertList(payload.list),
        scrollBannerTotal: payload.total,
      };
    },
    saveBottomList(state, { payload }) {
      return {
        ...state,
        bottomBannerList: convertList(payload.list),
        bottomBannerTotal: payload.total,
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
