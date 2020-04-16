import { Reducer } from 'redux';
import { Effect } from 'dva';
import { delay } from 'dva/saga';
import moment from 'moment';
import { 
  uploadFile,
  queryUserBaseInformation, 
  queryAllOrganizationList, 
  queryAllMerchantList,
  queryAllChannelMerchantList, 
  queryAllChildMerchantList,
  queryAllCommunityListByAddress,
  queryAllCommunityListByName,
  queryAllCommunityListByMerchantId,
  queryAuthRoleListByAttribute,
  queryAuthModuleListByRoleType,
  queryPayCodeList,
  queryAllPayCodeList,
  queryAllFeeTypeList,
  queryAllBillList,
  queryAllHouseList,
  queryImportResultList,
  queryAllSourceSceneList,
  queryAllMaintainStationList,
  queryAllMaintainEmployeeListByStation,
  queryAllStationListByValid,
  queryAllIconTemplateList,
  queryUnReadAccessRecord
} from '@/services/global';
import { SetUserBaseInfo, GetUserBaseInfo } from '@/utils/cache';
import { CALL_BILL_STATUS_DESC, IMPORT_STATUS_DESC } from '@/utils/const';
export interface StateType {
  collapsed: boolean;
  changePasswordVisible: boolean;
  baseUserInfo: any;
  
  allOrganizationList: any[];
  allMerchantList: any[];
  allCommunityListByAddress: any[];
  allCommunityListByMerchant: any[];
  roleListByAttribute: any[];
  moduleListByRoleType: any[];
  payCodeList: any[];
  allPayCodeList: any[];
  allFeeTypeList: any[];
  allBillList: any[];
  allBillTotal: number;
  allHouseList: any[];
  allHouseTotal: number;
  importResultList: any[];
  importResultTotal: number;
  allSourceSceneList: any[];
  allMaintainStationList: any[];
  allMaintainEmployeeListByStation: any[];
  allValidStationList: any[];
  allIconTemplateList: any[];
  allChannelMerchantList: any[]
}

export interface GlobalModelType {
  namespace: string;
  state: StateType;
  effects: {
    upload: Effect; // 上传图片
    getLngLatByAddress: Effect; // 根据地址描述获取经纬度
    getUserBaseInformation: Effect; //获取登录账号基本信息
    getAllOrganizationList: Effect; //获取所有机构列表
    getAllMerchantList: Effect; // 获取所有商户列表
    getAllChannerMerchantList: Effect; // 获取客户渠道配置商户列表
    getAllCommunityListByAddress: Effect; // 根据地址获取所有小区列表
    getAllCommunityListByName:  Effect; // 根据名称获取所有小区列表
    getAllCommunityListByMerchantId: Effect; // 根据商户获取所有小区列表
    getAuthRoleListByAttribute: Effect; // 根据角色属性获取角色列表
    getRoleModuleListByRoleType: Effect; // 根据角色类型获取角色权限列表
    getPaycodeList: Effect; // 根据商户号获取支付方式列表
    getAllPayCodeList: Effect; // 获取所有支付方式列表
    getAllFeeTypeList: Effect; // 获取所有费用类型列表
    getAllBillList: Effect; // 获取所有账单列表
    getAllHouseList: Effect; // 获取房屋列表
    getImportResultList: Effect; // 获取导入结果列表
    getAllSourceSceneList: Effect; // 获取来源场景列表
    getAllMaintainStationList: Effect; // 获取可以维修的岗位列表
    getAllMaintainEmployeeListByStation: Effect; // 获取可以维修的员工列表
    getAllStationListByValid: Effect; // 获取可有效岗位列表
    getAllIconTemplateList: Effect; // 获取所有icon子应用列表
    getUnReadAccessRecord: Effect; // 获取未读出入登记消息
  };
  reducers: {
    changeLayoutCollapsed: Reducer<StateType>; // 侧边栏展开关闭
    changePasswordModalVisible: Reducer<StateType>; // 修改密码弹框显示、隐藏
    saveBaseUserInfo: Reducer<StateType>;
    
    saveCaptchaInfo: Reducer<StateType>;
    saveAllOrganizationList: Reducer<StateType>;
    saveAllMerchantList: Reducer<StateType>;
    saveAllCommunityListByAddress: Reducer<StateType>;
    saveAllCommunityListByMerchant: Reducer<StateType>;
    saveRoleListByAttribute: Reducer<StateType>;
    saveAuthModuleListByRoleType: Reducer<StateType>;
    savePayCodeList: Reducer<StateType>;
    saveAllPayCodeList: Reducer<StateType>;
    saveAllFeeTypeList: Reducer<StateType>;
    saveAllBillList: Reducer<StateType>;
    saveAllHouseList: Reducer<StateType>;
    saveImportResultList: Reducer<StateType>;
    saveAllSourceSceneList: Reducer<StateType>;
    saveAllMaintainStationList: Reducer<StateType>;
    saveAllMaintainEmployeeListByStation: Reducer<StateType>;
    saveAllStationListByValid: Reducer<StateType>;
    saveAllIconTemplateList: Reducer<StateType>;
    saveAllChannelMerchantList: Reducer<StateType>;
  };
}

const Model: GlobalModelType =  {
  namespace: 'global',

  state: {
    collapsed: false,
    changePasswordVisible: false,
    baseUserInfo: GetUserBaseInfo() ? GetUserBaseInfo() : {},

    allOrganizationList: [],
    allMerchantList: [],
    allCommunityListByAddress: [],
    allCommunityListByMerchant: [],
    roleListByAttribute: [],
    moduleListByRoleType: [],
    payCodeList: [],
    allPayCodeList: [],
    allFeeTypeList: [],
    allBillList: [],
    allBillTotal: 0,
    allHouseList: [],
    allHouseTotal: 0,
    importResultList: [],
    importResultTotal: 0,
    allSourceSceneList: [],
    allMaintainStationList: [],
    allMaintainEmployeeListByStation: [],
    allValidStationList: [],
    allIconTemplateList: [],
    allChannelMerchantList: []
  },

  effects: {
    *upload({ payload }, { call }) {
      const response = yield call(uploadFile, payload);

      if (response && response.code === 200) {
        return response.data;
      }
    },
    *getLngLatByAddress({ payload }) {
      if (!window['geocoder']) return;
      if (!payload) return;

      return new Promise((resolve, reject) => {
        window['geocoder'].getLocation(payload, (status, result) => {
          if (status === 'complete' && result.geocodes.length) {
            const lnglat = result.geocodes[0].location;

            const lat = lnglat.lat;
            const lng = lnglat.lng;

            resolve({ lat, lng })
          } else {
            reject(result)
          }
      });
      })
    },
    *getUserBaseInformation(_, { call, put }) {
      if (!GetUserBaseInfo()) {
        let response = yield call(queryUserBaseInformation);
      
        if (response && response.code === 200) {
          yield SetUserBaseInfo(response.data);
          
          yield put({
            type: 'saveBaseUserInfo',
            payload: response.data
          })
        }  
      }
    },
    *getAllOrganizationList({ payload }, { call, put }) {
      let response = yield call(queryAllOrganizationList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveAllOrganizationList',
          payload: response.data
        })
      } 
    },
    *getAllMerchantList({ payload }, { call, put }) {
      let url;
      if (payload.type && payload.type === 'childMerchant') {
        url = queryAllChildMerchantList
       
        delete payload.type
      } else {
        url = queryAllMerchantList
      }
      let response = yield call(url, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveAllMerchantList',
          payload: response.data
        })
      } 
    },
    *getAllChannerMerchantList(_, { call, put }) {
      let params = { pageNum: 1, pageSize: 100 };
      let response = yield call(queryAllChannelMerchantList, params);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveAllChannelMerchantList',
          payload: response.data
        })
      } 
    },
    *getAllCommunityListByAddress({ payload }, { call, put }) {
      let response = yield call(queryAllCommunityListByAddress, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveAllCommunityListByAddress',
          payload: response.data
        })
      } 
    },
    *getAllCommunityListByName({ payload }, { call }) {
      let response = yield call(queryAllCommunityListByName, payload);
      
      if (response && response.code === 200) {
        // 获取整个小区列表（包含id），另外获取的是只有小区名称的数组
        if (payload.type && payload.type === 'allList') {
          return response.data
        }
        return convertCommunityListByName(response.data)
      } 
    },
    *getAllCommunityListByMerchantId({ payload }, { call, put }) {
      let response = yield call(queryAllCommunityListByMerchantId, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveAllCommunityListByMerchant',
          payload: response.data
        })
      } 
    },
    *getAuthRoleListByAttribute({ payload }, { call, put }) {
      let response = yield call(queryAuthRoleListByAttribute, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveRoleListByAttribute',
          payload: response.data
        })
      } 
    },
    *getRoleModuleListByRoleType({ payload }, { call, put }) {
      let response = yield call(queryAuthModuleListByRoleType, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveAuthModuleListByRoleType',
          payload: response.data
        })

        return convertModuleListByRoleType(response.data);
      } 
    },
    *getPaycodeList({ payload }, { call, put }) {
      let response = yield call(queryPayCodeList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'savePayCodeList',
          payload: response.data
        })
      } 
    },
    *getAllPayCodeList({ payload }, { call, put }) {
      let response = yield call(queryAllPayCodeList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveAllPayCodeList',
          payload: response.data
        })
      } 
    },
    *getAllFeeTypeList(_, { call, put }) {
      let params = { pageNum: 1, pageSize: 100 };
      let response = yield call(queryAllFeeTypeList, params);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveAllFeeTypeList',
          payload: response.data
        })
      } 
    },
    *getAllBillList({ payload }, { call, put }) {
      let response = yield call(queryAllBillList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveAllBillList',
          payload: response.data
        })
      } 
    },
    *getAllHouseList({ payload }, { call, put }) {
      let response = yield call(queryAllHouseList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveAllHouseList',
          payload: response.data
        })
      } 
    },
    *getImportResultList({ payload }, { call, put }) {
      let response = yield call(queryImportResultList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveImportResultList',
          payload: response.data
        })
      } 
    },
    *getAllSourceSceneList({ payload }, { call, put }) {
      let response = yield call(queryAllSourceSceneList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveAllSourceSceneList',
          payload: response.data
        })
      } 
    },
    *getAllMaintainStationList({ payload }, { call, put }) {
      let response = yield call(queryAllMaintainStationList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveAllMaintainStationList',
          payload: response.data
        })
      } 
    },
    *getAllMaintainEmployeeListByStation({ payload }, { call, put }) {
      let response = yield call(queryAllMaintainEmployeeListByStation, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveAllMaintainEmployeeListByStation',
          payload: response.data
        })
      } 
    },
    *getAllStationListByValid({ payload }, { call, put }) {
      let response = yield call(queryAllStationListByValid, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveAllStationListByValid',
          payload: response.data
        })
      } 
    },
    *getAllIconTemplateList({ payload }, { call, put }) {
      let response = yield call(queryAllIconTemplateList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveAllIconTemplateList',
          payload: response.data
        })
      } 
    },
    *getUnReadAccessRecord({ payload }, { call, put }) {
      let response = yield call(queryUnReadAccessRecord, payload);
      
      if (response && response.code === 200) {
        return response.data;
      } 
    },
  },

  reducers: {
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    changePasswordModalVisible(state, { payload }) {
      return {
        ...state,
        changePasswordVisible: payload
      }
    },
    saveBaseUserInfo(state, { payload }) {
      return {
        ...state,
        baseUserInfo: payload
      }
    },
    saveCaptchaInfo(state, { payload }) {
      return {
        ...state,
        captchaKey: payload.captchaKey,
        captchaImage: payload.captchaImage,
      };
    },
    saveAllOrganizationList(state, { payload }) {
      return {
        ...state,
        allOrganizationList: payload,
      };
    },
    saveAllMerchantList(state, { payload }) {
      return {
        ...state,
        allMerchantList: payload,
      };
    },
    saveAllChannelMerchantList(state, { payload }) {
      return {
        ...state,
        allChannelMerchantList: payload.list,
      };
    },
    saveAllCommunityListByAddress(state, { payload }) {
      return {
        ...state,
        allCommunityListByAddress: payload,
      };
    },
    saveAllCommunityListByMerchant(state, { payload }) {
      return {
        ...state,
        allCommunityListByMerchant: payload,
      };
    },
    saveRoleListByAttribute(state, { payload }) {
      return {
        ...state,
        roleListByAttribute: payload
      };
    },
    saveAuthModuleListByRoleType(state, { payload }) {
      return {
        ...state,
        moduleListByRoleType: convertModuleListByRoleType(payload)
      };
    },
    savePayCodeList(state, { payload }) {
      return {
        ...state,
        payCodeList: payload.payCode
      };
    },
    saveAllPayCodeList(state, { payload }) {
      return {
        ...state,
        allPayCodeList: payload
      };
    },
    saveAllFeeTypeList(state, { payload }) {
      return {
        ...state,
        allFeeTypeList: payload.list
      };
    },
    saveAllBillList(state, { payload }) {
      return {
        ...state,
        allBillList: convertAllBillList(payload.list),
        allBillTotal: payload.total
      };
    },
    saveAllHouseList(state, { payload }) {
      return {
        ...state,
        allHouseList: convertAllHouseList(payload.houseList),
        allHouseTotal: payload.total
      };
    },
    saveImportResultList(state, { payload }) {
      return {
        ...state,
        importResultList: convertImportResultList(payload.list),
        importResultTotal: payload.total
      };
    },
    saveAllSourceSceneList(state, { payload }) {
      return {
        ...state,
        allSourceSceneList: payload
      };
    },
    saveAllMaintainStationList(state, { payload }) {
      return {
        ...state,
        allMaintainStationList: payload.stationList
      };
    },
    saveAllMaintainEmployeeListByStation(state, { payload }) {
      return {
        ...state,
        allMaintainEmployeeListByStation: payload
      };
    },
    saveAllStationListByValid(state, { payload }) {
      return {
        ...state,
        allValidStationList: payload
      };
    },
    saveAllIconTemplateList(state, { payload }) {
      return {
        ...state,
        allIconTemplateList: payload
      };
    },
  }
};


export default Model;


const convertModuleListByRoleType = data => {
  if (!data) return [];

  const toParse = arr => {
    arr.forEach(item => {
      if ((item.parentModules || item.subModules) && (Array.isArray(item.parentModules) || Array.isArray(item.subModules))) {
        item['children'] = item.parentModules || item.subModules
        toParse(item['children'])
      }
      delete item.parentModules;
      delete item.subModules;
    })
    return arr
  }

  return toParse(data);
}

const convertCommunityListByName = list => {
  let data = [];

  for (let i in list) {
    data.push(list[i].communityName)
  }

  return Array.from(new Set(data));
}

const convertAllBillList = list => {
  return list.map(item => {
    return {
      ...item,
      billAmount: item.billAmount ? item.billAmount / 100 : 0,
      paidAmount: item.paidAmount ? item.paidAmount / 100 : 0,
      unpaidAmount: item.unpaidAmount ? item.unpaidAmount / 100 : 0,
      address: item.communityName ? `${item.communityName}  ${item.buildingNo}-${item.unitNo}-${item.accountNo}` : '房屋已删除',
      statusDesc: item.status ? CALL_BILL_STATUS_DESC[item.status] : '待推送',
      createTime: moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss'),
      writeOffTime: item.writeOffTime ? moment(new Date(item.writeOffTime)).format('YYYY-MM-DD HH:mm:ss') : '',
    }
  })
};

export const convertAllHouseList = list => {
  return list.map(item => {
    return {
      ...item,
      address: `${item.communityName}  ${item.buildingNo}-${item.unitNo}-${item.accountNo}`,
      startTime: item.startTime ? moment(new Date(item.startTime)).format('YYYY-MM-DD HH:mm:ss') : '',
      endTime: item.endTime ? moment(new Date(item.endTime)).format('YYYY-MM-DD HH:mm:ss') : ''
    }
  })
};

const convertImportResultList = list => {
  return list.map(item => {
    return {
      ...item,
      exportTime: moment(new Date(item.exportTime)).format('YYYY-MM-DD HH:mm:ss'),
      statusDesc: IMPORT_STATUS_DESC[item.status]
    }
  })
};
