import request from '@/utils/request';

/**
 * 获取支付订单列表
 *
 * @export
 * @param {*} params
 * @returns userInfo
 */
export async function queryPayOrderList(params) {
  return request('/api/v1/coreservice/order/metadata/orderList', { params })
};

/**
 * 获取支付订单详情
 *
 * @export
 * @param {*} params
 * @returns userInfo
 */
export async function queryPayOrderDetail(params) {
  return request('/api/v1/coreservice/order/metadata/orderDetail', { params })
};

/**
 * 获取业务订单列表
 *
 * @export
 * @param {*} params
 * @returns userInfo
 */
export async function queryBusinessOrderList(params) {
  return request('/api/v1/coreservice/order/metadata/serviceOrderList', { params })
};

/**
 * 获取业务订单详情
 *
 * @export
 * @param {*} params
 * @returns userInfo
 */
export async function queryBusinessOrderDetail(params) {
  return request('/api/v1/coreservice/order/metadata/serviceOrderDetail', { params })
};

/**
 * 订单退款
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendOrderRefund(params) {
  return request('/api/v1/coreservice/order/refund/apply', { 
    method: 'POST',
    data: params
  })
}

/**
 * 刷新订单退款状态
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendRefreshRefundStatus(params) {
  return request('/api/v1/coreservice/order/refund/query', { params })
}
