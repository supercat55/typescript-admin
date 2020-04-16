import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryMerchantInformationList, 
  queryMerchantAuditList,
  queryMerchantInformationDetail,
  sendCheckMerchantNum,
  queryAllInPayMerchantInfo,
  querySceneAppIdList,
  sendCreateMerchantInformation,
  sendEditMerchantInformation,
  sendUpdateMerchantInformation,
  sendToggleMerchantInformationStatus,
  // queryMerchantFeeList,
  // sendCreateMerchantFee,
  // sendDeleteMerchantFee,
  queryMerchantAuditDetail,
  sendAuditMerchant,
} from '@/services/merchant';
import { IS_VALID_DESC, IS_VALID_BADGE, MERCHAN_TYPE_DESC, MERCHANT_BUSINESS_TYPES_DESC, MERCHAN_AUDIT_STATUS_DESC } from '@/utils/const';

export interface StateType {
  merchantInformationList: any[];
  merchantInformationTotal: number;
  merchantAuditList: any[];
  merchantAuditTotal: number;
  sceneAppIdList: any[];
  merchantFeeList: any[];
}

export interface MerchantModelType {
  namespace: string;
  state: StateType;
  effects: {
    getMerchantInformationList: Effect; // 获取商户信息列表
    getMerchantAuditList: Effect; // 获取商户审核列表
    getMerchantInformationDetail: Effect; // 获取商户信息详情
    getMerchantAuditDetail: Effect; // 获取商户审核详情
    getAllInPayMerchantInfo: Effect; // 根据通联商户号获取通联商户信息
    checkMerchantNum: Effect;  // 检查商户号是否存在
    getSceneAppIdList: Effect; // 获取收款码对应场景编号
    createMerchantInformation: Effect; // 新增商户信息
    editMerchantInformation: Effect; // 编辑商户信息
    updateMerchantInformation: Effect; // 更新商户信息审核状态
    toggleMerchantInformationStatus: Effect; // 更改商户启用、停用状态
    auditMerchant: Effect; // 审核商户
    // getMerchantFeeList: Effect; // 获取商户信息下手续费配置列表
    // createMerchantFee: Effect; // 新增商户信息下手续费配置
    // deleteMerchantFee: Effect; // 删除商户信息下手续费配置
  };
  reducers: {
    saveList: Reducer<StateType>;
    saveAuditList: Reducer<StateType>;
    saveSceneAppIdList: Reducer<StateType>;
    saveMerchantFeeList: Reducer<StateType>;
  };
}

const Model: MerchantModelType =  {
  namespace: 'merchant',

  state: {
    merchantInformationList: [],
    merchantInformationTotal: 0,
    merchantAuditList: [],
    merchantAuditTotal: 0,
    sceneAppIdList: [],
    merchantFeeList: []
  },

  effects: {
    *getMerchantInformationList({ payload }, { call, put }) {
      let response = yield call(queryMerchantInformationList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getMerchantAuditList({ payload }, { call, put }) {
      let response = yield call(queryMerchantAuditList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveAuditList',
          payload: response.data
        })
      }  
    },
    *getMerchantInformationDetail({ payload }, { call }) {
      let response = yield call(queryMerchantInformationDetail, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *getAllInPayMerchantInfo({ payload }, { call }) {
      let response = yield call(queryAllInPayMerchantInfo, payload);
      
      if (response && response.code === 200) {
        return response.data;
      }  
    },
    *checkMerchantNum({ payload }, { call, put }) {
      let response = yield call(sendCheckMerchantNum, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *getSceneAppIdList({ payload }, { call, put }) {
      let response = yield call(querySceneAppIdList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveSceneAppIdList',
          payload: response.data
        })
      }  
    },
    *createMerchantInformation({ payload }, { call, put }) {
      let response = yield call(sendCreateMerchantInformation, payload);
      
      if (response && response.code === 200) {
        message.success('商户已提交审核');
        
        yield put(routerRedux.goBack())
      }  
    },
    *editMerchantInformation({ payload }, { call, put }) {
      let response = yield call(sendEditMerchantInformation, payload);
      
      if (response && response.code === 200) {
        message.success('商户已提交审核');
        
        yield put(routerRedux.goBack())
      }  
    },
    *updateMerchantInformation({ payload }, { call }) {
      let response = yield call(sendUpdateMerchantInformation, payload);
      
      if (response && response.code === 200) {
        message.success('更新成功');
        
        return true;
      }  
    },
    *toggleMerchantInformationStatus({ payload }, { call }) {
      let response = yield call(sendToggleMerchantInformationStatus, payload);
      
      if (response && response.code === 200) {
        message.success(payload.businessState === 0 ? '停用成功' : '启用成功');
        
        return true;
      }  
    },
    *auditMerchant({ payload }, { call, put }) {
      let response = yield call(sendAuditMerchant, payload);
      
      if (response && response.code === 200) {
        message.success('审核成功');
        
        yield put(routerRedux.goBack())
      }  
    },
    // *getMerchantFeeList({ payload }, { call, put }) {
    //   let response = yield call(queryMerchantFeeList, payload);
      
    //   if (response && response.code === 200) {
    //     yield put({
    //       type: 'saveMerchantFeeList',
    //       payload: response.data
    //     })
    //   }  
    // },
    // *createMerchantFee({ payload }, { call }) {
    //   let response = yield call(sendCreateMerchantFee, payload);
      
    //   if (response && response.code === 200) {
    //     message.success('新增手续费成功');

    //     return true
    //   }  
    // },
    // *deleteMerchantFee({ payload }, { call }) {
    //   let response = yield call(sendDeleteMerchantFee, payload);

    //   if (response && response.code === 200) {
    //     message.success('删除手续费成功');

    //     return true
    //   } 
    // },
    *getMerchantAuditDetail({ payload }, { call }) {
      let response = yield call(queryMerchantAuditDetail, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        merchantInformationList: convertList(payload.list),
        merchantInformationTotal: payload.total,
      };
    },
    saveAuditList(state, { payload }) {
      return {
        ...state,
        merchantAuditList: convertList(payload.list),
        merchantAuditTotal: payload.total,
      };
    },
    saveSceneAppIdList(state, { payload }) {
      return {
        ...state,
        sceneAppIdList: payload.list,
      };
    },
    saveMerchantFeeList(state, { payload }) {
      return {
        ...state,
        merchantFeeList: payload.list,
      };
    },
  }
};


export default Model;


const convertList = list => {
  return list.map(item => {
    return {
      ...item,
      typeDesc: MERCHAN_TYPE_DESC[item.merchantType],
      businessType: MERCHANT_BUSINESS_TYPES_DESC[item.businessBusinessType],
      statusDesc: IS_VALID_DESC[item.businessState],
      statusBrdge: IS_VALID_BADGE[item.businessState],
      auditStatusDesc: MERCHAN_AUDIT_STATUS_DESC[item.auditStatus],
      address: item.province && item.city ? `${item.province}${item.city}` : '',
      createTime: item.createTime ? moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss') : '-',
      auditTime: item.auditTime ? moment(new Date(item.auditTime)).format('YYYY-MM-DD HH:mm:ss') : '-',
    }
  })
}
