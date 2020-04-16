import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  querySMSTemplateList,
  querySMSFeeTypeList,
  querySMSTemplateDetail,
  sendCreateSMSTemplate,
  sendEditSMSTemplate,
  sendStartSMSTemplate,
  sendDisableSMSTemplate,
  sendAuditSMSTemplate
} from '@/services/parameter';
import { IS_VALID_DESC, IS_VALID_BADGE, SMS_TEMP_TYPES_DESC, SMS_AUDIT_STATUS_DESC } from '@/utils/const';

export interface StateType {
  smsList: any[];
  smsTotal: number;
  smsFeeTypeList: any[];
}

export interface SMSTemplateModelType {
  namespace: string;
  state: StateType;
  effects: {
    getSMSTemplateList: Effect;
    getSMSFeeTypeList: Effect;
    getSMSTemplateDetail: Effect;
    createSMSTemplate: Effect;
    editSMSTemplate: Effect;
    startSMSTemplate: Effect;
    disableSMSTemplate: Effect;
    auditSMSTemplate: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
    saveFeeTypeList: Reducer<StateType>;
  }
}

const Model: SMSTemplateModelType =  {
  namespace: 'sms',

  state: {
    smsList: [],
    smsTotal: 0,

    smsFeeTypeList: []
  },

  effects: {
    *getSMSTemplateList({ payload },{ call, put }){
      const response = yield call(querySMSTemplateList, payload)

      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }
    },
    *getSMSFeeTypeList({ payload },{ call, put }){
      const response = yield call(querySMSFeeTypeList, payload)

      if (response && response.code === 200) {
        yield put({
          type: 'saveFeeTypeList',
          payload: response.data
        })
      }
    },
    *getSMSTemplateDetail({ payload },{ call }){
      const response = yield call(querySMSTemplateDetail, payload)

      if (response && response.code === 200) {
        return convertItem(response.data)
      }
    },
    *createSMSTemplate({ payload }, { call, put }) {
      let response = yield call(sendCreateSMSTemplate, payload);
      
      if (response && response.code === 200) {
        message.success('申请已提交，请提醒审核人员审核后生效');

        yield put(routerRedux.goBack());
      }  
    },
    *editSMSTemplate({ payload }, { call, put }) {
      let response = yield call(sendEditSMSTemplate, payload);
      
      if (response && response.code === 200) {
        message.success('申请已提交，请提醒审核人员审核后生效');

        yield put(routerRedux.goBack());
      }  
    },
    *startSMSTemplate({ payload }, { call }) {
      let response = yield call(sendStartSMSTemplate, payload);
      
      if (response && response.code === 200) {
        return true
      }  
    },
    *disableSMSTemplate({ payload }, { call }) {
      let response = yield call(sendDisableSMSTemplate, payload);
      
      if (response && response.code === 200) {
        return true
      }  
    },
    *auditSMSTemplate({ payload }, { call, put }) {
      let response = yield call(sendAuditSMSTemplate, payload);
      
      if (response && response.code === 200) {
        message.success(payload.status === 2 ? '审核已通过' : '审核已驳回');

        yield put(routerRedux.goBack());
      }  
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        smsList: convertList(payload.list),
        smsTotal: payload.total,
      };
    },
    saveFeeTypeList(state, { payload }) {
      return {
        ...state,
        smsFeeTypeList: payload
      };
    },
  }
};


export default Model;


const convertList = list => {
  return list.map(item => {
    return convertItem(item)
  })
};

const convertItem = item => {
  return {
    ...item,
      templateTypeDesc: SMS_TEMP_TYPES_DESC[item.templateType],
      feeTypeName: item.feeTypeName ? item.feeTypeName : '通用',
      isValidDesc: IS_VALID_DESC[item.isValid],
      isValidBrdge: IS_VALID_BADGE[item.isValid],
      statusDesc: SMS_AUDIT_STATUS_DESC[item.status],
      createTime: item.createTime ? moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss') : '',
      auditingTime: item.auditingTime ? moment(new Date(item.auditingTime)).format('YYYY-MM-DD HH:mm:ss') : '',
  }
}

