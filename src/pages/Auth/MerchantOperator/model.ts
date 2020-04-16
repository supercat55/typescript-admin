import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryMerchantOperatorList, 
  queryMerchantOperatorDetail,
  sendValidateAccount,
  sendCreateMerchantOperator,
  sendEditMerchantOperator,
  sendResetAuthMerchantPwd,
  sendDisableAuthMerchantOperator
} from '@/services/auth';
import { IS_VALID_DESC, IS_VALID_BADGE } from '@/utils/const';

export interface StateType {
  merchantList: any[];
  merchantTotal: number;
}

export interface AuthMerchantOperatorModelType {
  namespace: string;
  state: StateType;
  effects: {
    getMerchantOperatorList: Effect;
    getAuthMerchantOperatorDetail: Effect;
    validateAccount: Effect;
    createAuthMerchantOperator: Effect;
    editAuthMerchantOperator: Effect;
    resetAuthMerchantPwd: Effect;
    disableAuthMerchantOperator: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
    saveBindList: Reducer<StateType>;
  };
}

const Model: AuthMerchantOperatorModelType =  {
  namespace: 'authMerchantOperator',

  state: {
    merchantList: [],
    merchantTotal: 0,
  },

  effects: {
    *getMerchantOperatorList({ payload }, { call, put }) {
      let response = yield call(queryMerchantOperatorList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getAuthMerchantOperatorDetail({ payload }, { call }) {
      let response = yield call(queryMerchantOperatorDetail, payload);
      
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
    *createAuthMerchantOperator({ payload }, { call }) {
      let response = yield call(sendCreateMerchantOperator, payload);
      
      if (response && response.code === 200) {
        message.success('创建商户管理员成功');
        
        return response.data;
      }  
    },
    *editAuthMerchantOperator({ payload }, { call, put }) {
      let response = yield call(sendEditMerchantOperator, payload);
      
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
    *disableAuthMerchantOperator({ payload }, { call }) {
      let response = yield call(sendDisableAuthMerchantOperator, payload);
      
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
