import { Reducer } from 'redux';
import { routerRedux } from 'dva/router';
import { delay } from 'dva/saga';
import { Effect } from 'dva';
import { message } from 'antd';
import { 
  sendLogin, 
  sendeLogout, 
  sendChangeMerchant,
  queryCaptchKey, 
  queryCaptchImage, 
  sendValidateCaptch, 
  sendChangePassword,
  sendFindPassword, 
  sendResetPassword,
  sendSMSCode 
} from '@/services/login';
import { BlobToBase64 } from '@/utils/utils';
import { SetGlobalToken, SetAccountInfo, RemoveAllStorage } from '@/utils/cache';

export interface StateType {
  captchaKey?: string;
  captchaImage?: string;
}

export interface LoginModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
    logout: Effect;
    changeMerchant: Effect;
    getCaptchaKey: Effect;
    getCaptchaImage: Effect;
    validateCaptch: Effect;
    sendVcode: Effect;
    changePassword: Effect;
    findPassword: Effect;
    restPassword: Effect;
  };
  reducers: {
    saveCaptchaInfo: Reducer<StateType>;
  };
}

const Model: LoginModelType =  {
  namespace: 'login',

  state: {
    captchaKey: '',
    captchaImage: null,
  },

  effects: {
    *login({ payload }, { call, put }) {
      let result = yield call(sendLogin, payload);
      
      const { response, data } = result

      if (data && data.code === 200) {
        SetAccountInfo(data.data);
        
        const { loginCount } = data.data;

        if (loginCount === 0) {
          message.success('登陆成功，由于您首次登录，请先重置登录密码');
          
          yield put(routerRedux.replace(`/login/reset-password/${data.data.userId}`));
        } else {
          if (response.headers.get('token')) {
            SetGlobalToken(response.headers.get('token'));
          }
          
          message.success('登录成功');
          
          yield delay(1000);
          
          yield put(routerRedux.replace('/home'));
        }
      }
    },
    *logout({ payload }, { call, put }) {
      let response = yield call(sendeLogout, payload);

      if (response && response.code === 200) {
        message.success('登出成功');

        RemoveAllStorage();
        
        yield put(routerRedux.replace('/login'));
      }
    },
    *changeMerchant({ payload }, { call }) {
      let result = yield call(sendChangeMerchant, payload);

      const { response, data } = result

      if (data && data.code === 200) {
        if (response.headers.get('token')) {
          SetGlobalToken(response.headers.get('token'));
        }
        yield delay(1000);
        
        return true
      }
    },
    *getCaptchaKey(_, { call, put }) {
      const response = yield call(queryCaptchKey);

      if (response && response.code === 200) {
        yield put({
          type: 'getCaptchaImage',
          payload: {
            id: response.data,
          }
        });
      }
    },
    *getCaptchaImage({ payload }, { call, put }) {
      const response = yield call(queryCaptchImage, payload);
      const captchaImage = yield BlobToBase64(response);

      yield put({
        type: 'saveCaptchaInfo',
        payload: {
          captchaKey: payload.id,
          captchaImage
        }
      });
    },
    *validateCaptch({ payload }, { call }) {
      const response = yield call(sendValidateCaptch, payload);

      if (response && response.code === 200) {
        return true
      }
    },
    *sendVcode({ payload }, { call }) {
      const response = yield call(sendSMSCode, payload);

      if (response && response.code === 200) {
        return true
      }
    },
    *changePassword({ payload }, { call, put }) {
      let response = yield call(sendChangePassword, payload);

      if (response && response.code === 200) {
        
        message.success('修改密码成功');
        
        RemoveAllStorage();

        yield put({
          type: 'global/changePasswordModalVisible',
          payload: false
        });

        yield put(routerRedux.replace('/login'));
      }
    },
    *findPassword({ payload }, { call, put }) {
      let response = yield call(sendFindPassword, payload);

      if (response && response.code === 200) {
        message.success('验证用户成功，请输入新密码');
        SetAccountInfo(response.data);

        yield delay(1000);
          
        yield put(routerRedux.replace('/home'));
      }
    },
    *restPassword({ payload }, { call, put }) {
      let response = yield call(sendResetPassword, payload);

      if (response && response.code === 200) {
        message.success('重置密码成功');

        RemoveAllStorage();
        
        yield put(routerRedux.replace('/login'));
      }
    },
  },

  reducers: {
    saveCaptchaInfo(state, { payload }) {
      return {
        ...state,
        captchaKey: payload.captchaKey,
        captchaImage: payload.captchaImage,
      };
    }
  }
};


export default Model
