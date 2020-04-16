import { Reducer } from 'redux';
import { Effect } from 'dva';
import moment from 'moment';
import { 
  queryReconciliationReportList,
  queryMerchantSettlementList,
  queryCommunityCollectionList,
  queryMerchantCollectionList,
  queryCommunityCodeCollectionList,
  queryCommunityCodeCollectionDetail
} from '@/services/report';

export interface StateType {
  reconciliationList: any[];
  reconciliationTotal: number;
  settlementList: any[];
  settlementTotal: number;
  communityCollectionList: any[];
  communityCollectionTotal: number;
  merchantCollectionList: any[];
  merchantCollectionTotal: number;
  communityCodeCollectionList: any[];
  communityCodeCollectionTotal: number;
  communityCodeCollectionDetail: any[];
}

export interface ReportModelType {
  namespace: string;
  state: StateType;
  effects: {
    getReconciliationReportList: Effect;
    getMerchantSettlementList: Effect;
    getCommunityCollectionList: Effect;
    getMerchantCollectionList: Effect;
    getCommunityCodeCollectionList: Effect;
    getCommunityCodeCollectionDetail: Effect;
  };
  reducers: {
    saveReconciliationList: Reducer<StateType>;
    saveSettlementList: Reducer<StateType>;
    saveCommunityCollectionList: Reducer<StateType>;
    saveMerchantCollectionList: Reducer<StateType>;
    saveCommunityCodeCollectionList: Reducer<StateType>;
    saveCommunityCodeCollectionDetail: Reducer<StateType>;
  };
}

const Model: ReportModelType =  {
  namespace: 'report',

  state: {
    reconciliationList: [],
    reconciliationTotal: 0,
    settlementList: [],
    settlementTotal: 0,
    communityCollectionList: [],
    communityCollectionTotal: 0,
    merchantCollectionList: [],
    merchantCollectionTotal: 0,
    communityCodeCollectionList: [],
    communityCodeCollectionTotal: 0,
    communityCodeCollectionDetail: [],
  },

  effects: {
    *getReconciliationReportList({ payload }, { call, put }) {
      const response = yield call(queryReconciliationReportList, payload);

      if (response && response.code === 200) {
        yield put({
          type: 'saveReconciliationList',
          payload: response.data,
        })
      }
    },
    *getMerchantSettlementList({ payload }, { call, put }) {
      const response = yield call(queryMerchantSettlementList, payload);

      if (response && response.code === 200) {
        yield put({
          type: 'saveSettlementList',
          payload: response.data,
        })
      }
    },
    *getCommunityCollectionList({ payload }, { call, put }) {
      const response = yield call(queryCommunityCollectionList, payload);

      if (response && response.code === 200) {
        yield put({
          type: 'saveCommunityCollectionList',
          payload: response.data,
        })
      }
    },
    *getMerchantCollectionList({ payload }, { call, put }) {
      const response = yield call(queryMerchantCollectionList, payload);

      if (response && response.code === 200) {
        yield put({
          type: 'saveMerchantCollectionList',
          payload: response.data,
        })
      }
    },
    *getCommunityCodeCollectionList({ payload }, { call, put }) {
      const response = yield call(queryCommunityCodeCollectionList, payload);

      if (response && response.code === 200) {
        yield put({
          type: 'saveCommunityCodeCollectionList',
          payload: response.data,
        })
      }
    },
    *getCommunityCodeCollectionDetail({ payload }, { call, put }) {
      const response = yield call(queryCommunityCodeCollectionDetail, payload);

      if (response && response.code === 200) {
        yield put({
          type: 'saveCommunityCodeCollectionDetail',
          payload: response.data,
        })
      }
    },
  },

  reducers: {
    saveReconciliationList(state, { payload }) {
      return {
        ...state,
        reconciliationList: convertList(payload.walletBills),
        reconciliationTotal: payload.total
      }
    },
    saveSettlementList(state, { payload }) {
      return {
        ...state,
        settlementList: payload.feeSettlements,
        settlementTotal: payload.total
      }
    },
    saveCommunityCollectionList(state, { payload }) {
      return {
        ...state,
        communityCollectionList: convertCollectionList(payload.list),
        communityCollectionTotal: payload.total
      }
    },
    saveMerchantCollectionList(state, { payload }) {
      return {
        ...state,
        merchantCollectionList: convertCollectionList(payload.list),
        merchantCollectionTotal: payload.total
      }
    },
    saveCommunityCodeCollectionList(state, { payload }) {
      return {
        ...state,
        communityCodeCollectionList: payload.qRCodes,
        communityCodeCollectionTotal: payload.total
      }
    },
    saveCommunityCodeCollectionDetail(state, { payload }) {
      return {
        ...state,
        communityCodeCollectionDetail: convertCollectionDetailList(payload.orderList),
      }
    },
  }
};

const convertList = list => {
  return list.map(item => {
    return {
      ...item,
      transactionDate: moment(new Date(item.transactionDate)).format('YYYY-MM-DD HH:mm:ss'),
    }
  })
};

const convertCollectionList = list => {
  return list.map(item => {
    return {
      ...item,
      amount: item.amount ? item.amount / 100 : 0,
      disAmount: item.disAmount ? item.disAmount / 100 : 0,
      onLineAmount: item.onLineAmount ? item.onLineAmount / 100 : 0,
      underLineAmount: item.underLineAmount ? item.underLineAmount / 100 : 0,
      refundAmount: item.refundAmount ? item.refundAmount / 100 : 0,
      arrearsAmount: item.arrearsAmount ? item.arrearsAmount / 100 : 0,
      collectionRate: item.collectionRate ? item.collectionRate + '%' : 0,
    }
  })
};

const convertCollectionDetailList = list => {
  return list.map(item => {
    return {
      ...item,
      amount: item.amount ? item.amount / 100 : 0,
      disAmount: item.disAmount ? item.disAmount / 100 : 0,
      orderDatetime: item.orderDatetime ? moment(new Date(item.orderDatetime)).format('YYYY-MM-DD HH:mm:ss') : '-',
      paymentTime: item.paymentTime ? moment(new Date(item.paymentTime)).format('YYYY-MM-DD HH:mm:ss') : '-',
    }
  })
};

export default Model;
