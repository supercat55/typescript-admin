import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryBindMerchantList,
  queryAuthMerchantList, 
  queryAuthMerchantDetail,
  sendValidateAccount,
  sendCreateAuthMerchant,
  sendEditAuthMerchant,
  sendResetAuthMerchantPwd,
  sendDisableAuthMerchant
} from '@/services/auth';
import { IS_VALID_DESC, IS_VALID_BADGE } from '@/utils/const';

export interface StateType {
  merchantList: any[];
  merchantTotal: number;
  bindMerchantList: any[];
}

export interface AuthOperationModelType {
  namespace: string;
  state: StateType;
  effects: {
    getBindMerchantList: Effect;
    getAuthMerchantList: Effect;
    getAuthMerchantDetail: Effect;
    validateAccount: Effect;
    createAuthMerchant: Effect;
    editAuthMerchant: Effect;
    resetAuthMerchantPwd: Effect;
    disableAuthMerchant: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
    saveBindList: Reducer<StateType>;
  };
}

const Model: AuthOperationModelType =  {
  namespace: 'authMerchant',

  state: {
    merchantList: [],
    merchantTotal: 0,
    bindMerchantList: [],
  },

  effects: {
    *getBindMerchantList({ payload }, { call, put }) {
      let response = yield call(queryBindMerchantList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveBindList',
          payload: response.data
        })
      }  
    },
    *getAuthMerchantList({ payload }, { call, put }) {
      let response = yield call(queryAuthMerchantList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getAuthMerchantDetail({ payload }, { call }) {
      let response = yield call(queryAuthMerchantDetail, payload);
      
      if (response && response.code === 200) {
        return response.data;
      }  
    },
    *validateAccount({ payload }, { call, put }) {
      let response = yield call(sendValidateAccount, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *createAuthMerchant({ payload }, { call }) {
      let response = yield call(sendCreateAuthMerchant, payload);
      
      if (response && response.code === 200) {
        message.success('创建商户管理员成功');
        
        return response.data;
      }  
    },
    *editAuthMerchant({ payload }, { call, put }) {
      let response = yield call(sendEditAuthMerchant, payload);
      
      if (response && response.code === 200) {
        message.success('编辑商户管理员成功');
        
        yield put(routerRedux.goBack());
      }  
    },
    *resetAuthMerchantPwd({ payload }, { call }) {
      let response = yield call(sendResetAuthMerchantPwd, payload);
      
      if (response && response.code === 200) {
        message.success('重置密码成功');
        
        return true;
      }  
    },
    *disableAuthMerchant({ payload }, { call }) {
      let response = yield call(sendDisableAuthMerchant, payload);
      
      if (response && response.code === 200) {
        message.success('停用账号成功');
        
        return true;
      }  
    },
  },

  reducers: {
    saveBindList(state, { payload }) {
      return {
        ...state,
        bindMerchantList: payload,
      };
    },
    saveList(state, { payload }) {
      return {
        ...state,
        merchantList: convertList(payload.list),
        merchantTotal: payload.total,
      };
    },
  }
};


export default Model;


const convertList = list => {
  return list.map(item => {
    return {
      ...item,
      statusDesc: IS_VALID_DESC[item.status],
      statusBrdge: IS_VALID_BADGE[item.status],
      createTime: moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss')
    }
  })
}
