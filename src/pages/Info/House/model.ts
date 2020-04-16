import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryHouseList, 
  queryHouseDetail,
  sendCreateHouse,
  sendBatchCreateHouse,
  sendEditHouse,
  sendDeleteHouse,
  queryHouseOwnerList,
  queryHouseBillList
} from '@/services/info';
import { HOUSE_TYPES_DESC, BILL_STATUS_DESC, RESIDENT_RELATION_TYPES_DESC } from '@/utils/const';

export interface StateType {
  houseList: any[];
  houseTotal: number;
  houseOwnerList: any[];
  houseOwnerTotal: number;
  houseBillList: any[];
  houseBillTotal: number;
}

export interface HouseModelType {
  namespace: string;
  state: StateType;
  effects: {
    getHouseList: Effect;
    getHouseDetail: Effect;
    createHouse: Effect;
    createBatchHouse: Effect;
    editHouse: Effect;
    deleteHouse: Effect;
    getHouseOwnerList: Effect;
    getHouseBillList: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
    saveOwnerList: Reducer<StateType>;
    saveBillList: Reducer<StateType>;
  }
}

const Model: HouseModelType =  {
  namespace: 'house',

  state: {
    houseList: [],
    houseTotal: 0,
    houseOwnerList: [],
    houseOwnerTotal: 0,
    houseBillList: [],
    houseBillTotal: 0,
  },

  effects: {
    *getHouseList({ payload }, { call, put }) {
      let response = yield call(queryHouseList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getHouseDetail({ payload }, { call }) {
      const response = yield call(queryHouseDetail, payload);

      if (response && response.code === 200) {
        return response.data
      }
    },
    *createHouse({ payload }, { call, put }) {
      const response = yield call(sendCreateHouse, payload);

      if (response && response.code === 200) {
        message.success('新增房屋成功');

        yield put(routerRedux.push('/info/house'))
      }
    },
    *createBatchHouse({ payload }, { call }) {
      const response = yield call(sendBatchCreateHouse, payload);

      if (response && response.code === 200) {
        return true
      }
    },
    *editHouse({ payload }, { call, put }) {
      const response = yield call(sendEditHouse, payload);

      if (response && response.code === 200) {
        message.success('编辑房屋成功');

        yield put(routerRedux.push('/info/house'))
      }
    },
    *deleteHouse({ payload }, { call }) {
      const response = yield call(sendDeleteHouse, payload);

      if (response && response.code === 200) {
        message.success('删除房屋成功');

        return true
      }
    },
    *getHouseOwnerList({ payload }, { call, put }) {
      let response = yield call(queryHouseOwnerList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveOwnerList',
          payload: response.data
        })
      }  
    },
    *getHouseBillList({ payload }, { call, put }) {
      let response = yield call(queryHouseBillList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveBillList',
          payload: response.data
        })
      }  
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        houseList: convertList(payload.houseList),
        houseTotal: payload.total,
      };
    },
    saveOwnerList(state, { payload }) {
      return {
        ...state,
        houseOwnerList: convertOwnerList(payload.houseList),
        houseOwnerTotal: payload.total,
      };
    },
    saveBillList(state, { payload }) {
      return {
        ...state,
        houseBillList: convertBillList(payload.list),
        houseBillTotal: payload.total,
      };
    },
  }
};


export default Model;


const convertList = list => {
  return list.map(item => {
    return {
      ...item,
      houseInfos: `${item.buildingNo}-${item.unitNo}-${item.accountNo}`,
      typeDesc: HOUSE_TYPES_DESC[item.houseType],
      createTime: moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss'),
    }
  })
}

const convertOwnerList = list => {
  return list.map(item => {
    return {
      ...item,
      houseInfos: `${item.buildingNo}-${item.unitNo}-${item.accountNo}`,
      relationshipDesc: item.isOwner ? RESIDENT_RELATION_TYPES_DESC[item.isOwner] : '',
      createTime: item.createTime ? moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss') : '',
    }
  })
}

const convertBillList = list => {
  return list.map(item => {
    return {
      ...item,
      address: item.communityName ? `${item.communityName}${item.buildingNo}-${item.unitNo}-${item.accountNo}` : '',
      billAmount: item.billAmount ? item.billAmount / 100 : 0,
      unpaidAmount: item.unpaidAmount ? item.unpaidAmount / 100 : 0,
      overdueAmount: item.overdueAmount ? item.overdueAmount / 100 : 0,
      statusDesc: item.status ? BILL_STATUS_DESC[item.status] : '待推送',
      cancelTime: item.cancelTime ? moment(new Date(item.cancelTime)).format('YYYY-MM-DD HH:mm:ss') : '',
    }
  })
}
