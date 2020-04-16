import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryCommunityList, 
  queryCommunityDetail,
  sendCreateCommunity,
  sendEditCommunity,
  sendDeleteCommunity,
  sendCheckCashierByCommunity
} from '@/services/info';
import { COMMUNITY_TYPES_DESC } from '@/utils/const';

export interface StateType {
  communityList: any[];
  communityTotal: number;
}

export interface CommunityModelType {
  namespace: string;
  state: StateType;
  effects: {
    getCommunityList: Effect;
    getCommunityDetail: Effect;
    createCommunity: Effect;
    editCommunity: Effect;
    deleteCommunity: Effect;
    checkCashierByCommunity: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
  }
}

const Model: CommunityModelType =  {
  namespace: 'community',

  state: {
    communityList: [],
    communityTotal: 0,
  },

  effects: {
    *getCommunityList({ payload }, { call, put }) {
      let response = yield call(queryCommunityList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getCommunityDetail({ payload }, { call }) {
      const response = yield call(queryCommunityDetail, payload);

      if (response && response.code === 200) {
        return response.data
      }
    },
    *createCommunity({ payload }, { call, put }) {
      const response = yield call(sendCreateCommunity, payload);

      if (response && response.code === 200) {
        message.success('新增小区成功');

        yield put(routerRedux.push('/info/community'))
      }
    },
    *editCommunity({ payload }, { call, put }) {
      const response = yield call(sendEditCommunity, payload);

      if (response && response.code === 200) {
        message.success('编辑小区成功');

        yield put(routerRedux.push('/info/community'))
      }
    },
    *deleteCommunity({ payload }, { call }) {
      const response = yield call(sendDeleteCommunity, payload);

      if (response && response.code === 200) {
        message.success('删除小区成功');

        return true
      }
    },
    *checkCashierByCommunity({ payload }, { call }) {
      const response = yield call(sendCheckCashierByCommunity, payload);

      if (response && response.code === 200) {

        return response.data
      }
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        communityList: convertList(payload.communityList),
        communityTotal: payload.total,
      };
    },
  }
};


export default Model;


const convertList = list => {
  return list.map(item => {
    return {
      ...item,
      typeDesc: COMMUNITY_TYPES_DESC[item.communityType],
      createTime: moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss'),
    }
  })
}
