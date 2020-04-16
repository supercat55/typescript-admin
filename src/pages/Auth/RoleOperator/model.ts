import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryAuthRoleOperatorList, 
  queryAuthRoleDetail,
  sendValidateRoleName,
  sendCreateAuthRole,
  sendEditAuthRole,
  sendToggleAuthRoleStatus
} from '@/services/auth';
import { IS_VALID_DESC, IS_VALID_BADGE, ROLE_PROPERTY_TYPES_DESC } from '@/utils/const';

export interface StateType {
  roleList: any[];
  roleTotal: number;
}

export interface AuthRoleOperatorModelType {
  namespace: string;
  state: StateType;
  effects: {
    getAuthRoleOperatorList: Effect;
    getAuthRoleOperatorDetail: Effect;
    validateRoleOperatorName: Effect;
    createAuthRoleOperator: Effect;
    editAuthRoleOperator: Effect;
    toggleAuthRoleOperatorStatus: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
  };
}

const Model: AuthRoleOperatorModelType =  {
  namespace: 'authRoleOperator',

  state: {
    roleList: [],
    roleTotal: 0,
  },

  effects: {
    *getAuthRoleOperatorList({ payload }, { call, put }) {
      let response = yield call(queryAuthRoleOperatorList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getAuthRoleOperatorDetail({ payload }, { call }) {
      let response = yield call(queryAuthRoleDetail, payload);
      
      if (response && response.code === 200) {
        return response.data;
      }  
    },
    *validateRoleOperatorName({ payload }, { call }) {
      let response = yield call(sendValidateRoleName, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *createAuthRoleOperator({ payload }, { call, put }) {
      let response = yield call(sendCreateAuthRole, payload);
      
      if (response && response.code === 200) {
        message.success('创建角色成功');
        
        yield put(routerRedux.goBack());
      }  
    },
    *editAuthRoleOperator({ payload }, { call, put }) {
      let response = yield call(sendEditAuthRole, payload);
      
      if (response && response.code === 200) {
        message.success('更新角色成功');
        
        yield put(routerRedux.goBack());
      }  
    },
    *toggleAuthRoleOperatorStatus({ payload }, { call }) {
      let response = yield call(sendToggleAuthRoleStatus, payload);
      
      if (response && response.code === 200) {
        message.success(Number(payload.status) === 0 ? '启用账号成功' : '停用角色成功');
        
        return true;
      }  
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        roleList: convertList(payload.list),
        roleTotal: payload.total,
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
      propertyDesc: ROLE_PROPERTY_TYPES_DESC[item.attribute],
      createTime: moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss')
    }
  })
}
