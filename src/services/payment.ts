import request from '@/utils/request';


/**
|--------------------------------------------------
|  缴费管理-支付模式管理
|--------------------------------------------------
*/

/**
 * 获取支付模式列表
 *
 * @export
 * @returns
 */
export async function queryPaymentModeList(params) {
  return request('/api/v1/coreservice/pay/payMode/list', { params })
};

/**
 * 获取支付模式详情
 *
 * @export
 * @returns
 */
export async function queryPaymentModeDetail(params) {
  return request('/api/v1/coreservice/pay/payMode', { params })
};

/**
 * 获取未使用支付模式列表
 *
 * @export
 * @returns
 */
export async function queryUnusedFeeTypeList() {
  return request('/api/v1/coreservice/pay/feeType/unset')
};

/**
 * 新增支付模式
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreatePaymentMode(params) {
  return request('/api/v1/coreservice/pay/payMode', {
    method: 'POST',
    data: params
  })
};

/**
 * 编辑支付模式
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditPaymentMode(params) {
  return request('/api/v1/coreservice/pay/payMode', {
    method: 'PUT',
    data: params
  })
};

/**
 * 删除支付模式
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendDeletePaymentMode(params) {
  return request('/api/v1/coreservice/pay/payMode', {
    method: 'DELETE',
    data: params
  })
};


/**
|--------------------------------------------------
|  缴费管理-费用类型管理
|--------------------------------------------------
*/

/**
 * 获取费用类型列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryFeeTypeList(params) {
  return request('/api/v1/coreservice/pay/feeType/list', { params })
};

/**
 * 获取费用类型icon列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryFeeTypeIcons() {
  return request('/api/v1/coreservice/pay/feeType/icons')
};

/**
 * 检查费用类型名称是否重复
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCheckFeeTypeName(params) {
  return request('/api/v1/coreservice/pay/feeType/checkFeeTypeName', { params })
};

/**
 * 删除支付模式
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateFeeType(params) {
  return request('/api/v1/coreservice/pay/feeType', {
    method: 'POST',
    data: params
  })
};


/**
|--------------------------------------------------
|  缴费管理-催缴管理
|--------------------------------------------------
*/


/**
 * 获取账单催缴列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryBillCallList(params) {
  return request('/api/v1/coreservice/bill/call/list', { params })
};

/**
 * 获取账单催缴详情
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryBillCallDetail(params) {
  return request('/api/v1/coreservice/bill/call/detail', { params })
};

/**
 * 催缴账单
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCallBill(params) {
  return request('/api/v1/coreservice/bill/call/add', {
    method: 'POST',
    data: params
  })
}
