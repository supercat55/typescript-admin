import request from '@/utils/request';

/**
|--------------------------------------------------
|  报表管理
|--------------------------------------------------
*/

/**
 * 获取账报表列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryReconciliationReportList(params) {
  return request('/api/v1/coreservice/reportForm/walletBill/walletBillList', { params })
};

/**
 * 获取商户结算表列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryMerchantSettlementList(params) {
  return request('/api/v1/coreservice/reportForm/feeSettlement/feeSettlementList', { params })
};

/**
 * 获取社区收缴率报表列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryCommunityCollectionList(params) {
  return request('/api/v1/coreservice/reportForm/CCRate/community', { params })
};

/**
 * 获取商户收缴率报表列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryMerchantCollectionList(params) {
  return request('/api/v1/coreservice/reportForm/merchantCollectionRate', { params })
};

/**
 * 获取社区码收款报表列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryCommunityCodeCollectionList(params) {
  return request('/api/v1/coreservice/reportForm/QRCode/qRCodeList', { params })
};

/**
 * 获取社区码收款报表详情
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryCommunityCodeCollectionDetail(params) {
  return request('/api/v1/coreservice/reportForm/QRCode/qRCodeDetail', { params })
};
