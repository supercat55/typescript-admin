import { Reducer } from 'redux';
import { Effect } from 'dva';
import { queryPrintListForHouseId, queryPrintListForBillId } from '@/services/global';

export interface StateType {
  printList: any[];
}

export interface PrintModelType {
  namespace: string;
  state: StateType;
  effects: {
    getPrintListForHouse: Effect;
    getPrintListForBill: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
  };
}

const Model: PrintModelType =  {
  namespace: 'print',

  state: {
    printList: [],
  },

  effects: {
    *getPrintListForHouse({ payload }, { call, put }) {
      let response = yield call(queryPrintListForHouseId, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getPrintListForBill({ payload }, { call, put }) {
      let response = yield call(queryPrintListForBillId, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        printList: payload
      };
    },
  }
};


export default Model;
