import request from '@/utils/request';

/**
 * 获取运营数据对账情况列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryOperateReconciliationList(params) {
  return request('/api/v1/coreservice/reconciliation', { params })
};

/**
 * 获取运营数据对账情况详情
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryOperateReconciliationDetail(params) {
  return request('/api/v1/coreservice/reconciliation/detail', { params })
};

/**
 * 重新对账
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendAgainReconciliation(params) {
  return request('/api/v1/coreservice/reconciliation/againRecon', { params })
};

/**
 * 获取运营数据对账情况详情处理情况
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryOperateReconciliationHandleDetail(params) {
  return request('/api/v1/coreservice/reconciliation/reconHandleDetail', { params })
};

/**
 * 处理运营数据对账情况
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendUpdateOperateReconciliation(params) {
  return request('/api/v1/coreservice/reconciliation', { 
    method: 'PUT',
    data: params
  })
};
