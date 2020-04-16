import { Reducer } from 'redux';
import { Effect } from 'dva';
import { queryPrintHouseList } from '@/services/bill';

export interface StateType {
  printHouseList: any[];
  printHouseTotal: number;
}

export interface BillPrintModelType {
  namespace: string;
  state: StateType;
  effects: {
    getPrintHouseList: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
  };
}

const Model: BillPrintModelType =  {
  namespace: 'billPrint',

  state: {
    printHouseList: [],
    printHouseTotal: 0,
  },

  effects: {
    *getPrintHouseList({ payload }, { call, put }) {
      let response = yield call(queryPrintHouseList, payload);
      
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
        printHouseList: payload.list,
        printHouseTotal: payload.total,
      };
    },
  }
};


export default Model;
