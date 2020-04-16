import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import { 
  queryHomeConfigList,
  queryHomeConfigDetail,
  queryHomeConfigIconList,
  queryHomeConfigScrollBannerList,
  queryHomeConfigAdvertisementList,
  queryHomeConfigBottomBannerList,
  sendCreateHomeConfig,
  sendEditHomeConfig,
  sendToggleHomeConfigStatus
} from '@/services/parameter';
import { IS_VALID_DESC, IS_VALID_BADGE } from '@/utils/const';

export interface StateType {
  homeConfigList: any[];
  homeConfigTotal: number;

  iconList: any[];
  advertisementList: any[];
  scrollBannerList: any[];
  bottomBannerList: any[];
}

export interface HomeConfigModelType {
  namespace: string;
  state: StateType;
  effects: {
    getHomeConfigList: Effect;
    getHomeConfigDetail: Effect;
    getHomeConfigAllTemplate: Effect;
    createHomeConfig: Effect;
    editHomeConfig: Effect;
    toggleHomeConfigStatus: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
    saveHomeConfigAllTemplate: Reducer<StateType>;
  }
}

const Model: HomeConfigModelType =  {
  namespace: 'homeConfig',

  state: {
    homeConfigList: [],
    homeConfigTotal: 0,
    iconList: [],
    advertisementList: [],
    scrollBannerList: [],
    bottomBannerList: []
  },

  effects: {
    *getHomeConfigList({ payload },{ call, put }){
      const response = yield call(queryHomeConfigList, payload)

      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }
    },
    *getHomeConfigDetail({ payload },{ call }){
      const response = yield call(queryHomeConfigDetail, payload)

      if (response && response.code === 200) {
        return response.data
      }
    },
    *getHomeConfigAllTemplate(_,{ call, put }){
      const [iconResponse, scrollBannerResponse, advertisementResponse, bottomBannerResponse] = yield [
        call(queryHomeConfigIconList),
        call(queryHomeConfigScrollBannerList),
        call(queryHomeConfigAdvertisementList),
        call(queryHomeConfigBottomBannerList),
      ]

      let result = {
        iconList: [],
        advertisementList: [],
        scrollBannerList: [],
        bottomBannerList: []
      }
      if (iconResponse && iconResponse.code === 200) {
        result.iconList = iconResponse.data.list;
      }
      if (scrollBannerResponse && scrollBannerResponse.code === 200) {
        result.scrollBannerList = scrollBannerResponse.data.list;
      }
      if (advertisementResponse && advertisementResponse.code === 200) {
        result.advertisementList = advertisementResponse.data.list;
      }
      if (bottomBannerResponse && bottomBannerResponse.code === 200) {
        result.bottomBannerList = bottomBannerResponse.data.list;
      }

      yield put({
        type: 'saveHomeConfigAllTemplate',
        payload: result
      })
    },
    *createHomeConfig({ payload }, { call, put }) {
      let response = yield call(sendCreateHomeConfig, payload);
      
      if (response && response.code === 200) {
        message.success('新增首页配置成功');

        yield put(routerRedux.goBack());
      }  
    },
    *editHomeConfig({ payload }, { call, put }) {
      let response = yield call(sendEditHomeConfig, payload);
      
      if (response && response.code === 200) {
        message.success('编辑首页配置成功');

        yield put(routerRedux.goBack());
      }  
    },
    *toggleHomeConfigStatus({ payload },{ call }){
      const response = yield call(sendToggleHomeConfigStatus, payload)

      if (response && response.code === 200) {
        message.success('修改首页配置状态成功');

        return true
      }
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        homeConfigList: convertList(payload.list),
        homeConfigTotal: payload.total,
      };
    },
    saveHomeConfigAllTemplate(state, { payload }) {
      return {
        ...state,
        ...payload,
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
      statusDesc: IS_VALID_DESC[item.conState],
      statusBrdge: IS_VALID_BADGE[item.conState],
  }
}

