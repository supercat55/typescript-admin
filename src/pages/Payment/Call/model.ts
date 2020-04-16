import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryBillCallList, 
  queryBillCallDetail,
  sendCallBill,
} from '@/services/payment';
import { CALL_BILL_STATUS_DESC } from '@/utils/const';

export interface StateType {
  billCallList: any[];
  billCallTotal: number;
  billCallDetail: any;
}

export interface PaymentCallModelType {
  namespace: string;
  state: StateType;
  effects: {
    getBillCallList: Effect;
    getBillCallDetail: Effect;
    callBill: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
    saveDetail: Reducer<StateType>;
  };
}

const Model: PaymentCallModelType =  {
  namespace: 'paymentCall',

  state: {
    billCallList: [],
    billCallTotal: 0,
    billCallDetail: {}
  },

  effects: {
    *getBillCallList({ payload }, { call, put }) {
      let response = yield call(queryBillCallList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getBillCallDetail({ payload }, { call, put }) {
      let response = yield call(queryBillCallDetail, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveDetail',
          payload: response.data
        })
      }  
    },
    *callBill({ payload }, { call, put }) {
      let response = yield call(sendCallBill, payload);
      
      if (response && response.code === 200) {
        message.success('催缴发送成功');

        yield put(routerRedux.goBack())
      }  
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        billCallList: convertList(payload.list),
        billCallTotal: payload.total,
      };
    },
    saveDetail(state, { payload }) {
      return {
        ...state,
        billCallDetail: convertDetail(payload),
      };
    },
  }
};


export default Model;


const convertList = list => {
  return list.map(item => {
    return {
      ...item,
      callTime: moment(new Date(item.callTime)).format('YYYY-MM-DD HH:mm:ss'),
      statusDesc: CALL_BILL_STATUS_DESC[item.status]
    }
  })
}

const convertDetail = detail => {
  return {
    ...detail,
    list: detail.billJson.list && detail.billJson.list.length ? convertBillList(detail.billJson.list) : [],
    total: detail.billJson.total
  }
};

const convertBillList = list => {
  return list.map(item => {
    return {
      ...item,
      billAmount: item.billAmount ? item.billAmount / 100 : 0,
      paidAmount: item.paidAmount ? item.paidAmount / 100 : 0,
      unpaidAmount: item.unpaidAmount ? item.unpaidAmount / 100 : 0,
      address: item.communityName ? `${item.communityName}${item.buildingNo}-${item.unitNo}-${item.accountNo}` : '房屋已删除',
      statusDesc: item.status ? CALL_BILL_STATUS_DESC[item.status] : '待推送',
      createTime: moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss')
    }
  })
} 
