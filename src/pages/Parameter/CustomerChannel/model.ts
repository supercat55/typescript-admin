import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryCustomerChannelList,
  queryCustomerChannelDetail,
  sendCreateCustomerChannel,
  sendEditCustomerChannel,
  sendToggleCustomerChannelStatus
} from '@/services/parameter';
import { CUSTOMER_CHANNEL_TYPES_DESC, IS_VALID_DESC, IS_VALID_BADGE } from '@/utils/const';

export interface StateType {
  customerChannelList: any[];
  customerChannelTotal: number;
}

export interface CustomerChannelModelType {
  namespace: string;
  state: StateType;
  effects: {
    getCustomerChannelList: Effect;
    getCustomerChannelDetail: Effect;
    createCustomerChannel: Effect;
    editCustomerChannel: Effect;
    toggleCustomerChannelStatus: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
  }
}

const Model: CustomerChannelModelType =  {
  namespace: 'customerChannel',

  state: {
    customerChannelList: [],
    customerChannelTotal: 0,
  },

  effects: {
    *getCustomerChannelList({ payload },{ call, put }){
      const response = yield call(queryCustomerChannelList, payload)

      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }
    },
    *getCustomerChannelDetail({ payload },{ call }){
      const response = yield call(queryCustomerChannelDetail, payload)

      if (response && response.code === 200) {
        return response.data
      }
    },
    *createCustomerChannel({ payload }, { call, put }) {
      let response = yield call(sendCreateCustomerChannel, payload);
      
      if (response && response.code === 200) {
        message.success('新增客户渠道配置成功');

        yield put(routerRedux.goBack());
      }  
    },
    *editCustomerChannel({ payload }, { call, put }) {
      let response = yield call(sendEditCustomerChannel, payload);
      
      if (response && response.code === 200) {
        message.success('编辑客户渠道配置成功');

        yield put(routerRedux.goBack());
      }  
    },
    *toggleCustomerChannelStatus({ payload },{ call }){
      const response = yield call(sendToggleCustomerChannelStatus, payload)

      if (response && response.code === 200) {
        message.success('修改客户渠道配置状态成功');

        return true
      }
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        customerChannelList: convertList(payload.list),
        customerChannelTotal: payload.total,
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
      statusDesc: IS_VALID_DESC[item.channelState],
      statusBrdge: IS_VALID_BADGE[item.channelState],
      channelTypeDesc: CUSTOMER_CHANNEL_TYPES_DESC[item.channelType],
  }
}

