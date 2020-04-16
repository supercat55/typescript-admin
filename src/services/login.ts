import request from '@/utils/request';

export interface LoginParamsType {
  userName: string;
  password: string | number;
  code: string;
  id: string;
}

/**
 * 登录
 *
 * @export
 * @param {*} params
 * @returns userInfo
 */
export async function sendLogin(params: LoginParamsType) {
  return request('/api/v1/coreservice/login', {
    method: 'POST',
    data: params,
    getResponse: true
  })
};

/**
 * 退出登录
 *
 * @export
 * @returns
 */
export async function sendeLogout() {
  return request('/api/v1/coreservice/login', {
    method: 'DELETE'
  })
}

/**
 * 登录
 *
 * @export
 * @param {*} params
 * @returns userInfo
 */
export async function sendChangeMerchant(params) {
  return request('/api/v1/coreservice/login/changeMerchant', {
    method: 'PUT',
    data: params,
    getResponse: true
  })
};

/**
 * 图形验证码key
 *
 * @export
 * @returns
 */
export async function queryCaptchKey() {
  return request('/api/v1/coreservice/imageValidate/getImageKey', {
    method: 'POST',
  });
};

/**
 *
 * 图形验证码图片
 * @export
 * @param {*} parmas
 * @returns
 */
export async function queryCaptchImage(params) {
  return request.get('/api/v1/coreservice/imageValidate/getStreamVerify', {
    responseType: 'blob',
    params,
  })
};

/**
 * 验证图形验证码
 *
 * @export
 * @returns
 */
export async function sendValidateCaptch(params) {
  return request('/api/v1/coreservice/imageValidate/validate', {
    method: 'POST',
    data: params
  });
};

/**
 * 修改密码
 * @param params 
 */
export async function sendChangePassword(params) {
  return request('/api/v1/coreservice/login/updatePwd', {
    method: 'PUT',
    data: params
  })
};

/**
 * 发送短信验证码
 * @param params 
 */
export async function sendSMSCode(params) {
  return request('/api/v1/coreservice/sms/send', {
    method: 'POST',
    data: params
  })
};

/**
 * 找回密码
 * @param params 
 */
export async function sendFindPassword(params) {
  return request('/api/v1/coreservice/login/forgetPwd', {
    method: 'POST',
    data: params
  })
};

/**
 * 重置密码
 * @param params 
 */
export async function sendResetPassword(params) {
  return request('/api/v1/coreservice/login/resetPwd', {
    method: 'PUT',
    data: params
  })
};
