import request from '@/utils/request';
import URL from '@/utils/url';

export async function queryGardenList(params) {
  let url = URL.GARDEN_LIST

  return request(url, { paramStr: JSON.stringify(params)})
};
