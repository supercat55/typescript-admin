import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryFeeTypeList,
  queryFeeTypeIcons,
  sendCheckFeeTypeName,
  sendCreateFeeType
} from '@/services/payment';

export interface StateType {
  feeTypeList: any[];
  feeTypeTotal: number;
  iconList: any[];
}

export interface PaymentFeeTypeModelType {
  namespace: string;
  state: StateType;
  effects: {
    getFeeTypeList: Effect;
    getFeeTypeIconList: Effect;
    checkFeeTypeName: Effect;
    createFeeType: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
    saveIconList: Reducer<StateType>;
  };
}

const Model: PaymentFeeTypeModelType =  {
  namespace: 'paymentFeeType',

  state: {
    feeTypeList: [],
    feeTypeTotal: 0,
    iconList: []
  },

  effects: {
    *getFeeTypeList({ payload }, { call, put }) {
      let response = yield call(queryFeeTypeList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getFeeTypeIconList({ payload }, { call, put }) {
      let response = yield call(queryFeeTypeIcons, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveIconList',
          payload: response.data
        })
      }  
    },
    *checkFeeTypeName({ payload }, { call }) {
      let response = yield call(sendCheckFeeTypeName, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *createFeeType({ payload }, { call, put }) {
      let response = yield call(sendCreateFeeType, payload);
      
      if (response && response.code === 200) {
        message.success('新增费用类型成功');
        
        return true;
      }  
    },
  
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        feeTypeList: convertList(payload.list),
        feeTypeTotal: payload.total,
      };
    },
    saveIconList(state, { payload }) {
      return {
        ...state,
        iconList: payload
      };
    },
  }
};


export default Model;


const convertList = list => {
  return list.map(item => {
    return {
      ...item,
      createTime: moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss')
    }
  })
}
