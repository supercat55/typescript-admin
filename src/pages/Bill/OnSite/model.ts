import { Reducer } from 'redux';
import { Effect } from 'dva';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryBillPayList,
  sendBillPay
} from '@/services/bill';
import { BILL_STATUS_DESC } from '@/utils/const';

export interface StateType {
  billPayList: any[];
  billPayTotal: number;
}

export interface BillOnSiteModelType {
  namespace: string;
  state: StateType;
  effects: {
    getBillPayList: Effect;
    billPay: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
  };
}

const Model: BillOnSiteModelType =  {
  namespace: 'billOnSite',

  state: {
    billPayList: [],
    billPayTotal: 0,
  },

  effects: {
    *getBillPayList({ payload }, { call, put }) {
      let response = yield call(queryBillPayList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *billPay({ payload }, { call }) {
      let response = yield call(sendBillPay, payload);
      
      if (response && response.code === 200) {
        return true
      }  
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        billPayList: convertList(payload.list),
        billPayTotal: payload.total,
      };
    },
  }
};


export default Model;


const convertList = list => {
  return list.map(item => {
    return {
      ...item,
      billAmount: item.billAmount ? item.billAmount / 100 : 0,
      paidAmount: item.paidAmount ? item.paidAmount / 100 : 0,
      unpaidAmount: item.unpaidAmount ? item.unpaidAmount / 100 : 0,
      overdueAmount: item.overdueAmount ? item.overdueAmount / 100 : 0,
      address: item.communityName ? `${item.communityName}${item.buildingNo}-${item.unitNo}-${item.accountNo}` : '房屋已删除',
      statusDesc: item.status ? BILL_STATUS_DESC[item.status] : '待推送',
    }
  })
}
