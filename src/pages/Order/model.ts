import { Reducer } from 'redux';
import { Effect } from 'dva';
import moment from 'moment';
import { 
  queryPayOrderList, 
  queryPayOrderDetail, 
  queryBusinessOrderList, 
  queryBusinessOrderDetail, 
  sendOrderRefund,
  sendRefreshRefundStatus 
} from '@/services/order';
// import Utils from '@/utils/utils';
import { ORDER_REFUND_STATUS_DESC, ORDER_PAY_STATUS_DESC } from '@/utils/const';

export interface StateType {
  payOrderList: any[];
  payOrderTotal: number;
  businessOrderList: any[];
  businessOrderTotal: number;
  businessOrderDetail: any;
}

export interface OrderModelType {
  namespace: string;
  state: StateType;
  effects: {
    getPayOrderList: Effect;
    getPayOrderDetail: Effect;
    getBusinessOrderList: Effect;
    getBusinessOrderDetail: Effect;
    orderRefund: Effect;
    refreshRefundStatus: Effect;
  };
  reducers: {
    savePayOrderList: Reducer<StateType>;
    savePayOrderDetail: Reducer<StateType>;
    saveBusinessOrderList: Reducer<StateType>;
    saveBusinessOrderDetail: Reducer<StateType>;
  };
}

const Model: OrderModelType =  {
  namespace: 'order',

  state: {
    payOrderList: [],
    payOrderTotal: 0,
    businessOrderList: [],
    businessOrderTotal: 0,
    businessOrderDetail: null
  },

  effects: {
    *getPayOrderList({ payload }, { call, put }) {
      const response = yield call(queryPayOrderList, payload);

      if (response && response.code === 200) {
        yield put({
          type: 'savePayOrderList',
          payload: response.data,
        })
      }
    },
    *getPayOrderDetail({ payload }, { call }) {
      const response = yield call(queryPayOrderDetail, payload);

      if (response && response.code === 200) {
        return response.data
      }
    },
    *getBusinessOrderList({ payload }, { call, put }) {
      const response = yield call(queryBusinessOrderList, payload);

      if (response && response.code === 200) {
        yield put({
          type: 'saveBusinessOrderList',
          payload: response.data,
        })
      }
    },
    *getBusinessOrderDetail({ payload }, { call }) {
      const response = yield call(queryBusinessOrderDetail, payload);

      if (response && response.code === 200) {
        return response.data
      }
    },
    *orderRefund({ payload }, { call }) {
      const response = yield call(sendOrderRefund, payload);

      if (response && response.code === 200) {
        return true
      }
    },
    *refreshRefundStatus({ payload }, { call }) {
      const response = yield call(sendRefreshRefundStatus, payload);

      if (response && response.code === 200) {
        return true
      }
    },
  },

  reducers: {
    savePayOrderList(state, { payload }) {
      return {
        ...state,
        payOrderList: convertList(payload.orderList),
        payOrderTotal: payload.total
      }
    },
    savePayOrderDetail(state, { payload }) {
      return {
        ...state,
        payOrderDetail: convertOrderDetail(payload)
      }
    },
    saveBusinessOrderList(state, { payload }) {
      return {
        ...state,
        businessOrderList: convertList(payload.serviceOrderList),
        businessOrderTotal: payload.total
      }
    },
    saveBusinessOrderDetail(state, { payload }) {
      return {
        ...state,
        businessOrderDetail: convertOrderDetail(payload)
      }
    },
  }
};

const convertList = list => {
  return list.map(item => {
    return {
      ...item,
      createTime: moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss'),
      amount: item.amount ? item.amount / 100 : 0,
      disAmount: item.disAmount ? item.disAmount / 100 : 0,
      receiptAmount: item.receiptAmount ? item.receiptAmount / 100 : 0,
      orderDatetime: item.orderDatetime ? moment(new Date(item.orderDatetime)).format('YYYY-MM-DD HH:mm:ss') : '',
      paymentTime: item.paymentTime ? moment(new Date(item.paymentTime)).format('YYYY-MM-DD HH:mm:ss') : '',
      returnStatusDesc: ORDER_REFUND_STATUS_DESC[item.returnStatus],
      payStatusDesc: ORDER_PAY_STATUS_DESC[item.payStatus],
    }
  })
};

const convertOrderDetail = info => {
  return {
    ...info,
    createTime: moment(new Date(info.createTime)).format('YYYY-MM-DD HH:mm:ss'),
    // amount: Utils.NumberFormatAmount(info.amount),
    paymentTime: info.paymentTime ? moment(new Date(info.paymentTime)).format('YYYY-MM-DD HH:mm:ss') : '',
    // payStatusDesc: PAY_STATUS_DESC[info.payStatus],
  }
};

export default Model;
