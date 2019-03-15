import { routerRedux } from 'dva/router';
import { queryUserLogin, queryAdminLogin } from '@/services/login';
import { IDENTITU_TYPE } from '@/utils/const';

export default {
  namespace: 'login',

  state: {
    
  },

  effects: {
    *userLogin({ payload }, { call, put } ) {
      let response = yield call(queryUserLogin, payload);
      console.log('1');
      if (response && response.code === 200) {
        console.log('object');
      }
    },
    *adminLogin({ payload }, { call, put } ) {
      let response = yield call(queryAdminLogin, payload);

      if (response && response.code === 200) {
        // let identity: IDENTITU_TYPE = IDENTITU_TYPE['admin']

        // console.log(identity);
      }
    }
  }
};
