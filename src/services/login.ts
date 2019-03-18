import request from '@/utils/request';
import URL from '@/utils/url';

/**
 * 企业 / 园区用户登录
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryUserLogin(params) {
  let url = URL.USER_LOGIN

  return request(url, {
    method: 'POST',
    body: {
      paramStr: JSON.stringify(params)
    }
  })
};

export async function queryAdminLogin(params) {
  let url = URL.ADMIN_LOGIN

  return request(url, {
    method: 'POST',
    body: {
      paramStr: JSON.stringify(params)
    }
  })
};

export async function queryUpdateToken(params) {
  let url = URL.UPDATE_TOKEN

  return request(url, {
    method: 'POST',
    body: {
      paramStr: JSON.stringify(params)
    }
  })
}
