import request from '@/utils/request';
import URL from '@/utils/url';

interface GardenLisyParams {
  token: string;
  garden_name?: string;
}

export async function queryGardenList(params: GardenLisyParams) {
  let url = URL.GARDEN_LIST

  return request(url, { paramStr: JSON.stringify(params)})
};
