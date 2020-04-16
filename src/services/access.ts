import request from '@/utils/request';

export interface AccessActionsType {
  ownerName: string;
  ownerPhone: string;
  isOwner: string;
  cardId?: string | number;
  accessType: number;
  communityId: string;
  houseId: string;
  carNumber?: string;
  reason: string;
  province?: string;
  city?: string;
  area?: string;
  temperature?: string;
  symptom: string;
  accessTime: number;
  operatorName: string;
}

/**
 * 获取出入记录列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAccessList(params) {
  return request('/api/v1/coreservice/access/list', { params })
};

/**
 * 获取出入记录详情
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAccessDetail(params) {
  return request('/api/v1/coreservice/access/detail', { params })
};

/**
 * 添加出入记录
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateAccess(params) {
  return request('/api/v1/coreservice/access/add', { 
    method: 'POST',
    data: params
  })
};

/**
 * 删除出入记录
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendDeleteAccess(params) {
  console.log(params, 'params');
  return request('/api/v1/coreservice/access/del', { 
    method: 'POST',
    data: params
  })
};
