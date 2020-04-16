import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryAuthRoleList, 
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

export interface AuthRoleModelType {
  namespace: string;
  state: StateType;
  effects: {
    getAuthRoleList: Effect;
    getAuthRoleDetail: Effect;
    validateRoleName: Effect;
    createAuthRole: Effect;
    editAuthRole: Effect;
    toggleAuthRoleStatus: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
  };
}

const Model: AuthRoleModelType =  {
  namespace: 'authRole',

  state: {
    roleList: [],
    roleTotal: 0,
  },

  effects: {
    *getAuthRoleList({ payload }, { call, put }) {
      let response = yield call(queryAuthRoleList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getAuthRoleDetail({ payload }, { call }) {
      let response = yield call(queryAuthRoleDetail, payload);
      
      if (response && response.code === 200) {
        return response.data;
      }  
    },
    *validateRoleName({ payload }, { call }) {
      let response = yield call(sendValidateRoleName, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *createAuthRole({ payload }, { call, put }) {
      let response = yield call(sendCreateAuthRole, payload);
      
      if (response && response.code === 200) {
        message.success('创建角色成功');
        
        yield put(routerRedux.goBack());
      }  
    },
    *editAuthRole({ payload }, { call, put }) {
      let response = yield call(sendEditAuthRole, payload);
      
      if (response && response.code === 200) {
        message.success('更新角色成功');
        
        yield put(routerRedux.goBack());
      }  
    },
    *toggleAuthRoleStatus({ payload }, { call }) {
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
