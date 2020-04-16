import { Reducer } from 'redux';
import { Effect } from 'dva';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryStationList,
  sendCreateStation,
  sendEditStation,
  sendStopStation
} from '@/services/property';
import { STATION_TYPES_DESC, IS_VALID_DESC, IS_VALID_BADGE } from '@/utils/const';

export interface StateType {
  stationList: any[];
  stationTotal: number;
}

export interface StationModelType {
  namespace: string;
  state: StateType;
  effects: {
    getStationList: Effect;
    createStation: Effect;
    editStation: Effect;
    stopStation: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
  }
}

const Model: StationModelType =  {
  namespace: 'station',

  state: {
    stationList: [],
    stationTotal: 0,
  },

  effects: {
    *getStationList({ payload }, { call, put }) {
      let response = yield call(queryStationList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *createStation({ payload },{ call }){
      const response = yield call(sendCreateStation, payload)

      if (response && response.code === 200) {
        message.success('新增岗位成功');

        return true;
      }
    },
    *editStation({ payload },{ call }){
      const response = yield call(sendEditStation, payload)

      if (response && response.code === 200) {
        message.success('编辑岗位成功');

        return true;
      }
    },
    *stopStation({ payload },{ call }){
      const response = yield call(sendStopStation, payload)

      if (response && response.code === 200) {
        message.success('停用岗位成功');

        return true;
      }
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        stationList: convertList(payload.stationList),
        stationTotal: payload.total,
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
      houseInfos: `${item.buildingNo}-${item.unitNo}-${item.accountNo}`,
      typeDesc: STATION_TYPES_DESC[item.stationType],
      statusDesc: IS_VALID_DESC[item.isValid],
      statusBrdge: IS_VALID_BADGE[item.isValid],
      createTime: item.createTime ? moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss') : '',
  }
}

