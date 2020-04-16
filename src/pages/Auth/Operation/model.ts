import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryAuthOperationList, 
  queryAuthOperationDetail,
  queryAuthOrganizationList, 
  sendValidateAccount,
  sendCreateAuthOperation,
  sendEditAuthOperation,
  sendResetAuthOperationPwd,
  sendDisableAuthOperation
} from '@/services/auth';
import { IS_VALID_DESC, IS_VALID_BADGE } from '@/utils/const';

export interface StateType {
  operationList: any[];
  operationTotal: number;
  allOrganizationOptions: any[];
}

export interface AuthOperationModelType {
  namespace: string;
  state: StateType;
  effects: {
    getAuthOperationList: Effect;
    getAuthOperationDetail: Effect;
    getOrganizationOptions: Effect;
    validateAccount: Effect;
    createAuthOperation: Effect;
    editAuthOperation: Effect;
    resetAuthOperationPwd: Effect;
    disableAuthOperation: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
    saveOrgList: Reducer<StateType>;
  };
}

const Model: AuthOperationModelType =  {
  namespace: 'authOperation',

  state: {
    operationList: [],
    operationTotal: 0,
    allOrganizationOptions: []
  },

  effects: {
    *getAuthOperationList({ payload }, { call, put }) {
      let response = yield call(queryAuthOperationList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getAuthOperationDetail({ payload }, { call }) {
      let response = yield call(queryAuthOperationDetail, payload);
      
      if (response && response.code === 200) {
        return response.data;
      }  
    },
    *getOrganizationOptions({ payload }, { call, put }) {
      let response = yield call(queryAuthOrganizationList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveOrgList',
          payload: response.data
        })
      }  
    },
    *validateAccount({ payload }, { call }) {
      let response = yield call(sendValidateAccount, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *createAuthOperation({ payload }, { call }) {
      let response = yield call(sendCreateAuthOperation, payload);
      
      if (response && response.code === 200) {
        message.success('创建账号成功');
        
        return response.data;
      }  
    },
    *editAuthOperation({ payload }, { call, put }) {
      let response = yield call(sendEditAuthOperation, payload);
      
      if (response && response.code === 200) {
        message.success('编辑账号成功');
        
        yield put(routerRedux.goBack());
      }  
    },
    *resetAuthOperationPwd({ payload }, { call }) {
      let response = yield call(sendResetAuthOperationPwd, payload);
      
      if (response && response.code === 200) {
        message.success('重置密码成功');
        
        return true;
      }  
    },
    *disableAuthOperation({ payload }, { call }) {
      let response = yield call(sendDisableAuthOperation, payload);
      
      if (response && response.code === 200) {
        message.success('停用账号成功');
        
        return true;
      }  
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        operationList: convertList(payload.list),
        operationTotal: payload.total,
      };
    },
    saveOrgList(state, { payload }) {
      return {
        ...state,
        allOrganizationOptions: payload.list
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
