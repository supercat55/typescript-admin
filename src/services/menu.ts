import request from '@/utils/request';
import URL from '@/utils/url';
import { SetIdentityType, GetGlobalToken } from '@/utils/cache';

/**
 * 获取modules菜单
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryModulesList() {
  let url = URL.MODULES_LIST
  const params = {
    token: GetGlobalToken()
  }

  return request(url, { paramStr: JSON.stringify(params)})
};
