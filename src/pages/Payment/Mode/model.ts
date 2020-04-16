import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryPaymentModeList, 
  queryPaymentModeDetail,
  queryUnusedFeeTypeList,
  sendCreatePaymentMode,
  sendEditPaymentMode,
  sendDeletePaymentMode
} from '@/services/payment';
import { IS_VALID_DESC, IS_VALID_BADGE, PAYMENT_MODE_TYPES_DESC } from '@/utils/const';

export interface StateType {
  modeList: any[];
  modeTotal: number;
  unusedFeeTypeList: any[]
}

export interface PaymentModeModelType {
  namespace: string;
  state: StateType;
  effects: {
    getPaymentModeList: Effect;
    getPaymentModeDetail: Effect;
    getUnusedFeeTypeList: Effect;
    createPaymentMode: Effect;
    editPaymentMode: Effect;
    deletePaymentMode: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
    saveUnusedFeeTypeList: Reducer<StateType>;
    concatFeeTypeList: Reducer<StateType>;
  };
}

const Model: PaymentModeModelType =  {
  namespace: 'paymentMode',

  state: {
    modeList: [],
    modeTotal: 0,
    unusedFeeTypeList: []
  },

  effects: {
    *getPaymentModeList({ payload }, { call, put }) {
      let response = yield call(queryPaymentModeList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getPaymentModeDetail({ payload }, { call }) {
      let response = yield call(queryPaymentModeDetail, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *getUnusedFeeTypeList(_, { call, put }) {
      let response = yield call(queryUnusedFeeTypeList);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveUnusedFeeTypeList',
          payload: response.data
        })
      }  
    },
    *createPaymentMode({ payload }, { call, put }) {
      let response = yield call(sendCreatePaymentMode, payload);
      
      if (response && response.code === 200) {
        message.success('新增支付模式成功');
        
        yield put(routerRedux.goBack());
      }  
    },
    *editPaymentMode({ payload }, { call, put }) {
      let response = yield call(sendEditPaymentMode, payload);
      
      if (response && response.code === 200) {
        message.success('编辑支付模式成功');
        
        yield put(routerRedux.goBack());
      }  
    },
    *deletePaymentMode({ payload }, { call }) {
      let response = yield call(sendDeletePaymentMode, payload);
      
      if (response && response.code === 200) {
        message.success('删除成功');
        
        return true;
      }  
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        modeList: convertList(payload.list),
        modeTotal: payload.total,
      };
    },
    saveUnusedFeeTypeList(state, { payload }) {
      return {
        ...state,
        unusedFeeTypeList: payload,
      };
    },
    concatFeeTypeList(state, { payload }) {
      return {
        ...state,
        unusedFeeTypeList: state.unusedFeeTypeList.concat(payload),
      };
    },
  }
};


export default Model;


const convertList = list => {
  return list.map(item => {
    return {
      ...item,
      modeDesc: PAYMENT_MODE_TYPES_DESC[item.mode],
      statusDesc: IS_VALID_DESC[item.isValid],
      statusBrdge: IS_VALID_BADGE[item.isValid],
      createTime: moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss')
    }
  })
}
