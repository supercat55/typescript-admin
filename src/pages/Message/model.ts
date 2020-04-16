import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import { message } from 'antd';
import { 
  queryNoticeList,
  queryNoticeDetail, 
  sendCreateNotice,
  sendEditNotice,
  sendUnderNotice
} from '@/services/message';
import { MESSAGE_NOTICE_TYPES_DESC, MESSAGE_NOTICE_STATUS_DESC } from '@/utils/const';

export interface StateType {
  noticeList: any[];
  noticeTotal: number;
  reconciliationDetail: any;
}

export interface MessageModelType {
  namespace: string;
  state: StateType;
  effects: {
    getNoticeList: Effect;
    getNoticeDetail: Effect;
    createNotice: Effect;
    editNotice: Effect;
    underNotic: Effect;
  };
  reducers: {
    saveNoticeList: Reducer<StateType>;
    saveReconciliationDetail: Reducer<StateType>;
  };
}

const Model: MessageModelType =  {
  namespace: 'message',

  state: {
    noticeList: [],
    noticeTotal: 0,
    reconciliationDetail: null
  },

  effects: {
    *getNoticeList({ payload }, { call, put }) {
      const response = yield call(queryNoticeList, payload);

      if (response && response.code === 200) {
        yield put({
          type: 'saveNoticeList',
          payload: response.data,
        })
      }
    },
    *getNoticeDetail({ payload }, { call }) {
      const response = yield call(queryNoticeDetail, payload);

      if (response && response.code === 200) {
        return response.data
      }
    },
    *createNotice({ payload }, { call, put }) {
      const response = yield call(sendCreateNotice, payload);

      if (response && response.code === 200) {
        message.success('新增公告成功');

        yield put(routerRedux.push('/message/notice'));
      }
    },
    *editNotice({ payload }, { call, put }) {
      const response = yield call(sendEditNotice, payload);

      if (response && response.code === 200) {
        message.success('编辑公告成功');

        yield put(routerRedux.push('/message/notice'));
      }
    },
    *underNotic({ payload, callback }, { call }) {
      const response = yield call(sendUnderNotice, payload);

      if (response && response.code === 200) {
        return true
      }
    }
  },

  reducers: {
    saveNoticeList(state, { payload }) {
      return {
        ...state,
        noticeList: convertList(payload.list),
        noticeTotal: payload.total
      }
    },
    saveReconciliationDetail(state, { payload }) {
      return {
        ...state,
        reconciliationDetail: convertDetial(payload)
      }
    },
  }
};

const convertList = list => {
  return list.map(item => {
    return {
      ...item,
      typeDesc: MESSAGE_NOTICE_TYPES_DESC[item.noticeType],
      statusDesc: MESSAGE_NOTICE_STATUS_DESC[item.status],
      listTitle: item.noticeTitle.length > 20 ? item.noticeTitle.substring(0, 20) + '...' : item.noticeTitle,
      pushTime: item.pushTime ? moment(new Date(item.pushTime)).format('YYYY-MM-DD HH:mm:ss') : '',
      createTime: item.createTime ? moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss') : '',
      underTime: item.underTime ? moment(new Date(item.underTime)).format('YYYY-MM-DD HH:mm:ss') : '',
    }
  })
};

const convertDetial = data => {
  let list =  data.list.map(item => {
    return {
      ...item,
      date: moment(new Date(item.transactionDate)).format('YYYY-MM-DD'),
      orderCommunitySystemMoney: item.orderCommunitySystemMoney ? item.orderCommunitySystemMoney / 100 : 0,
      notLevelingAmount: item.notLevelingAmount ? item.notLevelingAmount / 100 : 0,
      stateDesc: item.reconciliationState === 0 ? '未对平未处理' : '未对平已处理',
      stateBrdge: item.reconciliationState === 0 ? 'default' : 'error',
    }
  })

  return {
    total: data.total,
    list
  }
};

export default Model;
