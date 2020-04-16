import { Reducer } from 'redux';
import { Effect } from 'dva';
import moment from 'moment';
import { 
  queryOperateReconciliationList,
  queryOperateReconciliationDetail,
  sendAgainReconciliation,
  queryOperateReconciliationHandleDetail,
  sendUpdateOperateReconciliation
} from '@/services/operate';
import { OPERATE_RECONCILIATION_STATE_DESC, OPERATE_RECONCILIATION_STATE_BADGE } from '@/utils/const';

export interface StateType {
  reconciliationList: any[];
  reconciliationTotal: number;
  reconciliationDetail: any;
}

export interface OperateModelType {
  namespace: string;
  state: StateType;
  effects: {
    getOperateReconciliationList: Effect;
    getOperateReconciliationDetail: Effect;
    againReconciliation: Effect;
    getOperateReconciliationHandleDetail: Effect;
    updateOperateReconciliation: Effect;
  };
  reducers: {
    saveReconciliationList: Reducer<StateType>;
    saveReconciliationDetail: Reducer<StateType>;
  };
}

const Model: OperateModelType =  {
  namespace: 'operate',

  state: {
    reconciliationList: [],
    reconciliationTotal: 0,
    reconciliationDetail: null
  },

  effects: {
    *getOperateReconciliationList({ payload }, { call, put }) {
      const response = yield call(queryOperateReconciliationList, payload);

      if (response && response.code === 200) {
        yield put({
          type: 'saveReconciliationList',
          payload: response.data,
        })
      }
    },
    *getOperateReconciliationDetail({ payload }, { call, put }) {
      const response = yield call(queryOperateReconciliationDetail, payload);

      if (response && response.code === 200) {
        yield put({
          type: 'saveReconciliationDetail',
          payload: response.data,
        })
      }
    },
    *againReconciliation({ payload }, { call }) {
      const response = yield call(sendAgainReconciliation, payload);

      if (response && response.code === 200) {
        return true;
      }
    },
    *getOperateReconciliationHandleDetail({ payload }, { call }) {
      const response = yield call(queryOperateReconciliationHandleDetail, payload);

      if (response && response.code === 200) {
        return response.data
      }
    },
    *updateOperateReconciliation({ payload }, { call }) {
      const response = yield call(sendUpdateOperateReconciliation, payload);

      if (response && response.code === 200) {
        return true
      }
    }
  },

  reducers: {
    saveReconciliationList(state, { payload }) {
      return {
        ...state,
        reconciliationList: convertList(payload.list),
        reconciliationTotal: payload.total
      }
    },
    saveReconciliationDetail(state, { payload }) {
      return {
        ...state,
        reconciliationDetail: convertDetial(payload)
      }
    },
  }
};

const convertList = list => {
  return list.map(item => {
    return {
      ...item,
      date: moment(new Date(item.transactionDate)).format('YYYY-MM-DD'),
      levelingAmount: item.levelingAmount ? item.levelingAmount / 100 : 0,
      notLevelingAmount: item.notLevelingAmount ? item.notLevelingAmount / 100 : 0,
      stateDesc: OPERATE_RECONCILIATION_STATE_DESC[item.state],
      stateBrdge: OPERATE_RECONCILIATION_STATE_BADGE[item.state],
    }
  })
};

const convertDetial = data => {
  let list =  data.list.map(item => {
    return {
      ...item,
      date: moment(new Date(item.transactionDate)).format('YYYY-MM-DD'),
      orderCommunitySystemMoney: item.orderCommunitySystemMoney ? item.orderCommunitySystemMoney / 100 : 0,
      notLevelingAmount: item.notLevelingAmount ? item.notLevelingAmount / 100 : 0,
      stateDesc: item.reconciliationState === 0 ? '未对平未处理' : '未对平已处理',
      stateBrdge: item.reconciliationState === 0 ? 'default' : 'error',
    }
  })

  return {
    total: data.total,
    list
  }
};

export default Model;
