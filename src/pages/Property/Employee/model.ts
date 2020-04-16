import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryEmployeeList,
  queryEmployeeDetail,
  sendCreateEmployee,
  sendEditEmployee,
  sendToggleEmployeeStatus,
} from '@/services/property';
import { STATION_TYPES_DESC, IS_VALID_DESC, IS_VALID_BADGE } from '@/utils/const';

export interface StateType {
  employeeList: any[];
  employeeTotal: number;
}

export interface EmployeeModelType {
  namespace: string;
  state: StateType;
  effects: {
    getEmployeeList: Effect;
    getEmployeeDetail: Effect;
    createEmployee: Effect;
    editEmployee: Effect;
    toggleEmployeeStatus: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
  }
}

const Model: EmployeeModelType =  {
  namespace: 'employee',

  state: {
    employeeList: [],
    employeeTotal: 0,
  },

  effects: {
    *getEmployeeList({ payload },{ call, put }){
      const response = yield call(queryEmployeeList, payload)

      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }
    },
    *getEmployeeDetail({ payload },{ call }){
      const response = yield call(queryEmployeeDetail, payload)

      if (response && response.code === 200) {
        return response.data
      }
    },
    *createEmployee({ payload },{ call, put }){
      const response = yield call(sendCreateEmployee, payload)

      if (response && response.code === 200) {
        message.success('新增员工成功');

        yield put(routerRedux.push('/property/employee'))
      }
    },
    *editEmployee({ payload },{ call, put }){
      const response = yield call(sendEditEmployee, payload)

      if (response && response.code === 200) {
        message.success('编辑员工成功');

        yield put(routerRedux.push('/property/employee'))
      }
    },
    *toggleEmployeeStatus({ payload },{ call }){
      const response = yield call(sendToggleEmployeeStatus, payload)

      if (response && response.code === 200) {
        message.success('修改员工状态成功');

        return true
      }
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        employeeList: convertList(payload.employeeList),
        employeeTotal: payload.total,
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

