import request from '@/utils/request';


/**
 * 获取商户信息列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryMerchantInformationList(params) {
  return request('/api/v1/coreservice/merchant/information', { params })
};

/**
 * 获取商户审核列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryMerchantAuditList(params) {
  return request('/api/v1/coreservice/merchant/auditing/list', { params })
};

/**
 * 获取商户信息详情
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryMerchantInformationDetail(params) {
  return request('/api/v1/coreservice/merchant/information/detail', { params })
};

/**
 * 获取商户审核信息详情
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryMerchantAuditDetail(params) {
  return request('/api/v1/coreservice/merchant/auditing/detail', { params })
};

/**
 * 检查商户号是否存在
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCheckMerchantNum(params) {
  return request('/api/v1/coreservice/merchant/information/checkMecNum', { params })
};

/**
 * 获取通联商户信息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAllInPayMerchantInfo(params) {
  return request('/api/v1/coreservice/merchant/information/addMerchant', {
    method: 'POST',
    data: params
  })
};

/**
 * 获取收款码对应场景编号
 *
 * @export
 * @returns
 */
export async function querySceneAppIdList() {
  return request('/api/v1/coreservice/merchant/information/getAppId')
};

/**
 * 新增商户信息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateMerchantInformation(params) {
  return request('/api/v1/coreservice/merchant/information/preserve', {
    method: 'POST',
    data: params
  })
};

/**
 * 编辑商户信息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditMerchantInformation(params) {
  return request('/api/v1/coreservice/merchant/auditing/edit', {
    method: 'POST',
    data: params
  })
};

/**
 * 更新商户信息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendUpdateMerchantInformation(params) {
  return request('/api/v1/coreservice/merchant/information/renew', {
    method: 'PUT',
    data: params
  })
};

/**
 * 改变商户信息状态(启用/停用)
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendToggleMerchantInformationStatus(params) {
  return request('/api/v1/coreservice/merchant/information/changeState', {
    method: 'PUT',
    data: params
  })
};


/**
 * 审核商户
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendAuditMerchant(params) {
  return request('/api/v1/coreservice/merchant/auditing/auditing', {
    method: 'POST',
    data: params
  })
};

// /**
//  * 获取商户手续费配置列表
//  *
//  * @export
//  * @param {*} params
//  * @returns
//  */
// export async function queryMerchantFeeList(params) {
//   return request('/api/v1/coreservice/merchant/information/feeList', { params })
// };

// /**
//  * 新增商户手续费配置
//  *
//  * @export
//  * @param {*} params
//  * @returns
//  */
// export async function sendCreateMerchantFee(params) {
//   return request('/api/v1/coreservice/merchant/information/feeAdd', {
//     method: 'POST',
//     data: params
//   })
// };

// /**
//  * 删除商户手续费配置
//  *
//  * @export
//  * @param {*} params
//  * @returns
//  */
// export async function sendDeleteMerchantFee(params) {
//   return request('/api/v1/coreservice/merchant/information', {
//     method: 'DELETE',
//     data: params
//   })
// }
