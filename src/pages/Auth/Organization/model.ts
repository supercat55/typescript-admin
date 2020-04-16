import { Reducer } from 'redux';
import { Effect } from 'dva';
import { message } from 'antd';
import moment from 'moment';
import { queryAuthOrganizationList, sendCreateAuthOrganization } from '@/services/auth';
import { ORGANIZ_PROPERTY_TYPES_DESC } from '@/utils/const';

export interface StateType {
  organizationList: any[];
  organizationTotal: number;
}

export interface AuthOrganizationModelType {
  namespace: string;
  state: StateType;
  effects: {
    getAuthOrganizationList: Effect;
    createAuthOrganization: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
  };
}

const Model: AuthOrganizationModelType =  {
  namespace: 'authOrganization',

  state: {
    organizationList: [],
    organizationTotal: 0,
  },

  effects: {
    *getAuthOrganizationList({ payload }, { call, put }) {
      let response = yield call(queryAuthOrganizationList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *createAuthOrganization({ payload }, { call }) {
      let response = yield call(sendCreateAuthOrganization, payload);
      
      if (response && response.code === 200) {
        message.success('创建组织成功');

        return true;
      }  
    }
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        organizationList: convertList(payload.list),
        organizationTotal: payload.total,
      };
    },
  }
};


export default Model;


const convertList = list => {
  return list.map(item => {
    return {
      ...item,
      propertyDesc: ORGANIZ_PROPERTY_TYPES_DESC[item.attribute],
      createTime: moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss')
    }
  })
}
