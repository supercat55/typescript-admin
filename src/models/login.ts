import { routerRedux } from 'dva/router';
import { queryUserLogin, queryAdminLogin, queryUpdateToken } from '@/services/login';
import { IDENTITU_TYPE } from '@/utils/const';
import { 
  SetIdentityType, 
  SetGlobalToken,
  SetPropertyInfo,
  SetGardenInfo,
  SetCompanyInfo
} from '@/utils/cache';
import { message } from 'antd';

export default {
  namespace: 'login',

  state: {
    
  },

  effects: {
    *userLogin({ payload }, { call, put } ) {
      let response = yield call(queryUserLogin, payload);

      if (response && Number(response.code) === 200) {
        const { login_type } = payload;
        const { user_info, property_list = [], garden_list = [], company_list = [] } = JSON.parse(response.data)

        SetGlobalToken(user_info.token)
        // 园区登录
        if (login_type === '1') {
          // 园区超级管理员身份
          if (property_list.length === 1 && garden_list.length === 0) {
            let temp = property_list[0];

            temp && savePropertyInfo(temp);

            yield put({
              type: 'updateToken',
              payload: {
                token: user_info.token,
                role_id: temp.role_id,
                property_id: temp.id,
              },
              pathname: '/garden'
            })
          } 
          // 园区普通管理员身份
          else if(property_list.length === 0 && garden_list.length === 1) {
            let temp = garden_list[0];

            temp && saveGardenInfo(temp);
          } 
          // 园区端混合身份
          else if(property_list.length > 1 || garden_list.length > 1) {

          }
        } 
        // 企业登录
        else if(login_type === '2') {
          // 企业管理员
          if (company_list.length === 1) {
            let temp = company_list[0];

            temp && saveCompanyInfo(temp);
          }
          // 多个企业身份管理员
          else if(company_list.length > 1) {

          }
        }
      }
    },
    *adminLogin({ payload }, { call, put } ) {
      let response = yield call(queryAdminLogin, payload);

      if (response && response.code === 200) {
        const token = response.data && response.data.user_info ? response.data.user_info.token : '';

        if (token) {
          let identity: number = IDENTITU_TYPE['admin'];

          SetIdentityType(identity);
  
          SetGlobalToken(token); 

          yield put(
            routerRedux.push({
              pathname: '/property',
            })
          )
        } else {
          message.error('缺少token');
        }
      }
    },
    *updateToken({ payload, pathname }, { call, put }) {
      let response = yield call(queryUpdateToken, payload);

      if (response && Number(response.code) === 200) {
        
        yield put(
          routerRedux.push({
            pathname
          })
        )
      }
    }
  },
  
  reducers: {
    saveUserIdentity(state, action) {


      return {
        ...state
      }
    }
  }
};

const savePropertyInfo = temp => {
  let identity: number = IDENTITU_TYPE['rootManager'];

  let propertyInfo = {
    id: temp.id,
    name: temp.property_name,
    mobile: temp.phone_num,
    logoUrl: temp.logoUrl,
    status: parseInt(temp.is_valid),
    roleId: temp.role_id
  }

  SetPropertyInfo(propertyInfo);
  SetIdentityType(identity);
};


const saveGardenInfo = temp => {
  let identity: number = IDENTITU_TYPE['gardenManager'];

  let propertyInfo = {
    id: temp.id,
    name: temp.property_name,
    address: [temp.province, temp.city, temp.area],
    addressDetail: temp.street,
    addressDesc: temp.province + temp.area + temp.street,
    status: parseInt(temp.is_valid),
    propertyId: temp.property_id,
    doorKey: temp.zj_park_id
  }

  SetGardenInfo(propertyInfo);
  SetIdentityType(identity);
};

const saveCompanyInfo = temp => {
  let identity: number = IDENTITU_TYPE['companyManager'];

  let propertyInfo = {
    id: temp.id,
    name: temp.property_name,
    address: [temp.province, temp.city, temp.area],
    addressDetail: temp.street,
    addressDesc: temp.province + temp.area + temp.street,
    status: parseInt(temp.is_valid),
    propertyId: temp.property_id,
    doorKey: temp.zj_park_id
  }

  SetCompanyInfo(propertyInfo);
  SetIdentityType(identity);
}
