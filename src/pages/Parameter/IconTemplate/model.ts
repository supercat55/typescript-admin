import { Reducer } from 'redux';
import { Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import moment from 'moment';
import { 
  queryIconTemplateList,
  queryIconTemplateDetail,
  queryDefaultIconTemplateDetail,
  sendCheckIconTemplateName,
  sendCreateIconTemplate,
  sendEditIconTemplate,
  sendEditDefaultIconTemplate,
  queryIconDetail,
  sendCreateIcon,
  sendEditIcon
} from '@/services/parameter';

export interface StateType {
  iconList: any[];
  iconTotal: number;
}

export interface IconTemplateModelType {
  namespace: string;
  state: StateType;
  effects: {
    getIconTemplateList: Effect;
    getIconTemplateDetail: Effect;
    getDefaultIconTemplateDetail: Effect;
    checkIconTemplateName: Effect;
    createIconTemplate: Effect;
    editIconTemplate: Effect;
    editDefaultIconTemplate: Effect;
    getIconDetail: Effect;
    createIcon: Effect;
    editIcon: Effect;
  };
  reducers: {
    saveList: Reducer<StateType>;
  };
}

const Model: IconTemplateModelType =  {
  namespace: 'iconTemplate',

  state: {
    iconList: [],
    iconTotal: 0,
  },

  effects: {
    *getIconTemplateList({ payload }, { call, put }) {
      let response = yield call(queryIconTemplateList, payload);
      
      if (response && response.code === 200) {
        yield put({
          type: 'saveList',
          payload: response.data
        })
      }  
    },
    *getIconTemplateDetail({ payload }, { call }) {
      let response = yield call(queryIconTemplateDetail, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *getDefaultIconTemplateDetail({ payload }, { call }) {
      let response = yield call(queryDefaultIconTemplateDetail, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *checkIconTemplateName({ payload }, { call }) {
      let response = yield call(sendCheckIconTemplateName, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *createIconTemplate({ payload }, { call, put }) {
      let response = yield call(sendCreateIconTemplate, payload);
      
      if (response && response.code === 200) {
        message.success('新增应用模版成功');

        yield put(routerRedux.goBack());
      }  
    },
    *editIconTemplate({ payload }, { call, put }) {
      let response = yield call(sendEditIconTemplate, payload);
      
      if (response && response.code === 200) {
        message.success('编辑子应用模版成功');

        yield put(routerRedux.goBack());
      }  
    },
    *editDefaultIconTemplate({ payload }, { call, put }) {
      let response = yield call(sendEditDefaultIconTemplate, payload);
      
      if (response && response.code === 200) {
        message.success('编辑默认子应用模版成功');

        yield put(routerRedux.goBack());
      }  
    },
    *getIconDetail({ payload }, { call }) {
      let response = yield call(queryIconDetail, payload);
      
      if (response && response.code === 200) {
        return response.data
      }  
    },
    *createIcon({ payload }, { call }) {
      let response = yield call(sendCreateIcon, payload);
      
      if (response && response.code === 200) {
        message.success('新增icon信息成功');

        return true
      }  
    },
    *editIcon({ payload }, { call }) {
      let response = yield call(sendEditIcon, payload);
      
      if (response && response.code === 200) {
        message.success('编辑icon信息成功');

        return true
      }  
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        iconList: convertList(payload.list),
        iconTotal: payload.total,
      };
    },
  }
};


export default Model;


const convertList = list => {
  return list.map(item => {
    return {
      ...item,
      createTime: moment(new Date(item.createTime)).format('YYYY-MM-DD HH:mm:ss'),
    }
  })
}
