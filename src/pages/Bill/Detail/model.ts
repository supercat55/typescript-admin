import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryBillList, 
  queryBillDetail,
  queryBillTemplateList,
  sendCreateSingleBill,
  sendCreateBatchBill,
  sendEditBill,
  queryTemplateBillDetail,
  sendCreateTemplateBill,
  sendCheckTemplateName,
  sendCreateTemplate,
  sendToggleBillStatus,
  sendRecordBillRefund
} from '@/services/bill';
import { BILL_STATUS_DESC } from '@/utils/const';

export interface StateType {
  billList: any[];
  billTotal: number;
  billTempList: any[];
}

export interface BillDetailModelType {
  namespace: string;
  state: StateType;
  effects: {
    getBillList: Effect;
    getBillDetail: Effect;
    getBillTemplateList: Effect;
    createSingleBill: Effect;
    createBatchBill: Effect;
    getTemplateBillDetail: Effect;
    createTemplateBill: Effect;
    editBill: Effect;
    toggleBillStatus: Effect;
    recordBillRefund: Effect;
    checkTemplateName: Effect;
    createTemplate: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
    saveTempList: Reducer<StateType>;
  };
}

const Model: BillDetailModelType =  {
  namespace: 'billDetail',

  state: {
    billList: [],
    billTotal: 0,
    billTempList: [],
  },

  effects: {
    *getBillList({ payload }, { call, put }) {
      let response = yield call(queryBillList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getBillDetail({ payload }, { call }) {
      let response = yield call(queryBillDetail, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *getBillTemplateList({ payload }, { call, put }) {
      let response = yield call(queryBillTemplateList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveTempList',
          payload: response.data
        })
      }  
    },
    *createSingleBill({ payload }, { call, put }) {
      let response = yield call(sendCreateSingleBill, payload);
      
      if (response && response.code === 200) {
        message.success('新增账单成功');

        yield put(routerRedux.goBack())
      }  
    },
    *createBatchBill({ payload }, { call }) {
      let response = yield call(sendCreateBatchBill, payload);
      
      if (response && response.code === 200) {
        return true
      }  
    },
    *getTemplateBillDetail({ payload }, { call }) {
      let response = yield call(queryTemplateBillDetail, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *createTemplateBill({ payload }, { call, put }) {
      let response = yield call(sendCreateTemplateBill, payload);
      
      if (response && response.code === 200) {
        message.success('新增账单成功');

        yield put(routerRedux.goBack())
      }  
    },
    *editBill({ payload }, { call, put }) {
      let response = yield call(sendEditBill, payload);
      
      if (response && response.code === 200) {
        message.success('更新账单成功');

        yield put(routerRedux.goBack())
      }  
    },
    *checkTemplateName({ payload }, { call }) {
      let response = yield call(sendCheckTemplateName, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *createTemplate({ payload }, { call }) {
      let response = yield call(sendCreateTemplate, payload);
      
      if (response && response.code === 200) {
        message.success('新增计费模板成功');

        return true
      }  
    },
    *toggleBillStatus({ payload }, { call }) {
      let response = yield call(sendToggleBillStatus, payload);
      
      if (response && response.code === 200) {
        return true
      }  
    },
    *recordBillRefund({ payload }, { call }) {
      let response = yield call(sendRecordBillRefund, payload);
      
      if (response && response.code === 200) {
        return true
      }  
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        billList: convertList(payload.list),
        billTotal: payload.total,
      };
    },
    saveTempList(state, { payload }) {
      return {
        ...state,
        billTempList: payload.list,
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
      address: item.communityName ? `${item.communityName}${item.buildingNo}-${item.unitNo}-${item.accountNo}` : '房屋已删除',
      statusDesc: item.status ? BILL_STATUS_DESC[item.status] : '待推送',
      createTime: moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss'),
      pushTime: moment(new Date(item.pushTime)).format('YYYY-MM-DD'),
      writeOffTime: item.writeOffTime ? moment(new Date(item.writeOffTime)).format('YYYY-MM-DD HH:mm:ss') : '',
    }
  })
}
