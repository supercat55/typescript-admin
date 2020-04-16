import { Reducer } from 'redux';
import { Effect } from 'dva';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryBillTemplateList,
  queryBillTemplateDetail,
  sendCheckTemplateName,
  sendCreateTemplate,
  sendEditTemplate,
  sendDisableTemplate,
  queryBillLogList,
  queryBillIntervalDetail,
  queryBillList,
  sendStopBillTemp
} from '@/services/bill';
import { IS_VALID_DESC, IS_VALID_BADGE, CHARGE_MODE_TYPES_DESC, BILL_LOG_BADGE_STATUS, BILL_LOG_STATUS_DESC, BILL_PERIOD_DESC } from '@/utils/const';

export interface StateType {
  billTempList: any[];
  billTempTotal: number;
  billLogList: any[];
  billLogTotal: number;
  billIntervalDetail: any[];
  billLogRecordList: any[];
  billLogRecordTotal: number;
}

export interface BillTemplateModelType {
  namespace: string;
  state: StateType;
  effects: {
    getBillTemplateList: Effect;
    getBillTemplateDetail: Effect;
    checkTemplateName: Effect;
    createTemplate: Effect;
    editTemplate: Effect;
    disableTemplate: Effect;
    getBillLogList: Effect;
    getBillIntervalDetail: Effect; 
    getBillLogRecordList: Effect; 
    stopBillTemp: Effect; 
  };
  reducers: {
    saveList: Reducer<StateType>;
    saveLogList: Reducer<StateType>;
    saveBillIntervalDetail: Reducer<StateType>;
    saveBillLogRecord: Reducer<StateType>;
  };
}

const Model: BillTemplateModelType =  {
  namespace: 'billTemplate',

  state: {
    billTempList: [],
    billTempTotal: 0,
    billLogList: [],
    billLogTotal: 0,
    billIntervalDetail: [],
    billLogRecordList: [],
    billLogRecordTotal: 0
  },

  effects: {
    *getBillTemplateList({ payload }, { call, put }) {
      let response = yield call(queryBillTemplateList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getBillTemplateDetail({ payload }, { call }) {
      let response = yield call(queryBillTemplateDetail, payload);
      
      if (response && response.code === 200) {
        return response.data
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
    *editTemplate({ payload }, { call }) {
      let response = yield call(sendEditTemplate, payload);
      
      if (response && response.code === 200) {
        message.success('编辑计费模板成功');

        return true
      }  
    },
    *disableTemplate({ payload }, { call }) {
      let response = yield call(sendDisableTemplate, payload);
      
      if (response && response.code === 200) {
        message.success('停用计费模板成功');

        return true
      }  
    },
    *getBillLogList({ payload }, { call, put }) {
      let response = yield call(queryBillLogList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveLogList',
          payload: response.data
        })
      }  
    },
    *getBillIntervalDetail({ payload }, { call, put }) {
      let response = yield call(queryBillIntervalDetail, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveBillIntervalDetail',
          payload: response.data
        })
      }  
    },
    *getBillLogRecordList({ payload }, { call, put }) {
      let response = yield call(queryBillList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveBillLogRecord',
          payload: response.data
        })
      }  
    },
    *stopBillTemp({ payload }, { call }) {
      let response = yield call(sendStopBillTemp, payload);
      
      if (response && response.code === 200) {
        message.success('该模版停用成功');

        return true
      }  
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        billTempList: convertList(payload.list),
        billTempTotal: payload.total,
      };
    },
    saveLogList(state, { payload }) {
      return {
        ...state,
        billLogList: convertLogList(payload.list),
        billLogTotal: payload.total,
      };
    },
    saveBillIntervalDetail(state, { payload }) {
      return {
        ...state,
        billIntervalDetail: convertBillInterval(payload.houseList),
      };
    },
    saveBillLogRecord(state, { payload }) {
      return {
        ...state,
        billLogRecordList: convertBillRecordList(payload.list),
        billLogRecordTotal: payload.total,
      };
    },
  }
};


export default Model;


const convertList = list => {
  return list.map(item => {
    return {
      ...item,
      isValidDesc: IS_VALID_DESC[item.isValid],
      isValidBrdge: IS_VALID_BADGE[item.isValid],
      chargeModeDesc: item.chargeMode ? CHARGE_MODE_TYPES_DESC[item.chargeMode] : '-',
      createTime: moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss'),
      pushTime: moment(new Date(item.pushTime)).format('YYYY-MM-DD HH:mm:ss'),
      writeOffTime: moment(new Date(item.writeOffTime)).format('YYYY-MM-DD HH:mm:ss'),
    }
  })
}

const convertLogList = list => {
  return list.map(item => {
    return {
      ...item,
      statusDesc: BILL_LOG_STATUS_DESC[item.isValid],
      statusBrdge: BILL_LOG_BADGE_STATUS[item.isValid],
      isAuto: item.isAuto == 1 ? '是' : '否',
      pushTime: item.pushTime ? moment(new Date(item.pushTime)).format('YYYY-MM-DD') : '',
      lateFeeTime: item.lateFeeTime ? moment(new Date(item.lateFeeTime)).format('YYYY-MM-DD') : '',
      overdueTime: item.overdueTime ? moment(new Date(item.overdueTime)).format('YYYY-MM-DD') : '',
      billInterval: item.isAuto == 1 ?
        `${moment(new Date(item.startTime)).format('YYYY-MM-DD')}起` :
        `${moment(new Date(item.startTime)).format('YYYY-MM-DD')} ~ ${moment(new Date(item.endTime)).format('YYYY-MM-DD')}`,
      periodDesc: item.period ? BILL_PERIOD_DESC[item.period] : '无'
    }
  })
}

const convertBillInterval = list => {
  return list.map(item => {
    return {
      ...item,
      address: `${item.communityName}${item.buildingNo}-${item.unitNo}-${item.accountNo}`,
      startTime: item.startTime ? moment(item.startTime).format('YYYY-MM-DD HH:mm:ss') : '-',
      endTime: item.endTime ? moment(item.endTime).format('YYYY-MM-DD HH:mm:ss') : '-',
    }
  })
}

const convertBillRecordList = list => {
  return list.map(item => {
    return {
      ...item,
      address: item.communityName ? `${item.communityName}${item.buildingNo}-${item.unitNo}-${item.accountNo}` : '房屋已删除',
      billAmount: item.billAmount ? item.billAmount / 100 : 0,
      paidAmount: item.paidAmount ? item.paidAmount / 100 : 0,
    }
  })
}
