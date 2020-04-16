import request from '@/utils/request';

// 新增单个账单
export interface CreateBillType {
  houseId: string;
  feeTypeId: string;
  billName: string;
  pushTime: number;
  billAmount: any;
  paidAmount?: any;
  showDescribtion?: string;
  overdueTime?: number;
  lateFeeTime?: number;
  feeRate?: number;
}

// 批量新增账单
export interface CreateBatchBillType {
  communityId: string;
  feeTypeId: string;
  billName: string;
  pushTime: number;
  data: any[];
  fileName: string;
  overdueTime?: number;
  lateFeeTime?: number;
  feeRate?: number;
}

// 调用模板生成账单
export interface CreateBillByTempType {
  billModelId: string;
  startTime?: number;
  isAuto: string;
  period: number;
  houseIds: string[];
  pushTime: number;
  endTime?: number;
  overdueTime?: number;
  lateFeeTime?: number;
  feeRate?: number;
}

/**
|--------------------------------------------------
|  账单管理-账单明细管理
|--------------------------------------------------
*/


/**
 * 获取账单明细列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryBillList(params) {
  return request('/api/v1/coreservice/bill/bill/list', { params })
};

/**
 * 获取账单明细详情
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryBillDetail(params) {
  return request('/api/v1/coreservice/bill/bill', { params })
};

/**
 * 单个添加账单
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateSingleBill(params) {
  return request('/api/v1/coreservice/bill/bill', { 
    method: 'POST',
    data: params
  })
};

/**
 * 导入批量添加账单
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateBatchBill(params) {
  return request('/api/v1/coreservice/bill/bill/import', { 
    method: 'POST',
    data: params
  })
};

/**
 * 编辑账单
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditBill(params) {
  return request('/api/v1/coreservice/bill/bill', { 
    method: 'Put',
    data: params
  })
}

/**
 * 修改账单状态
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendToggleBillStatus(params) {
  return request('/api/v1/coreservice/bill/bill', { 
    method: 'DELETE',
    data: params
  })
}

/**
 * 记录账单退款
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendRecordBillRefund(params) {
  return request('/api/v1/coreservice/bill/bill/refund', { 
    method: 'POST',
    data: params
  })
}

/**
 * 模板账单详情
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryTemplateBillDetail(params) {
  return request('/api/v1/coreservice/bill/bill/auto', { params })
}

/**
 * 模板生成账单
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateTemplateBill(params) {
  return request('/api/v1/coreservice/bill/bill/auto', { 
    method: 'POST',
    data: params
  })
}

/**
|--------------------------------------------------
|  账单管理-计费模板管理
|--------------------------------------------------
*/

/**
 * 获取计费模板列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryBillTemplateList(params) {
  return request('/api/v1/coreservice/bill/billModel/list', { params })
};

/**
 * 获取计费模板详情
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryBillTemplateDetail(params) {
  return request('/api/v1/coreservice/bill/billModel', { params })
};

/**
 * 检查计费模板名称是否重名
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCheckTemplateName(params) {
  return request('/api/v1/coreservice/bill/billModel/checkModelName', { params })
}

/**
 * 新增计费模板
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateTemplate(params) {
  return request('/api/v1/coreservice/bill/billModel', { 
    method: 'POST',
    data: params
  })
}

/**
 * 编辑计费模板
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditTemplate(params) {
  return request('/api/v1/coreservice/bill/billModel', { 
    method: 'PUT',
    data: params
  })
}

/**
 * 停用计费模板
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendDisableTemplate(params) {
  return request('/api/v1/coreservice/bill/billModel', { 
    method: 'DELETE',
    data: params
  })
}

/**
 * 获取计费模板日志列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryBillLogList(params) {
  return request('/api/v1/coreservice/bill/bill/auto/list', { params })
};

/**
 * 获取账单范围
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryBillIntervalDetail(params) {
  return request('/api/v1/coreservice/bill/bill/auto', { params })
};

/**
 * 停止调用
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendStopBillTemp(params) {
  return request('/api/v1/coreservice/bill/bill/auto', { 
    method: 'DELETE',
    data: params
  })
};

/**
|--------------------------------------------------
|  账单管理-现场缴费
|--------------------------------------------------
*/

/**
 * 获取账单支付列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryBillPayList(params) {
  return request('/api/v1/coreservice/bill/bill/paylist', { params })
};

/**
 * 账单缴费
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendBillPay(params) {
  return request('/api/v1/coreservice/bill/bill/pay', { 
    method: 'PUT',
    data: params
  })
};

/**
|--------------------------------------------------
|  账单管理-现场缴费
|--------------------------------------------------
*/

/**
 * 获取单据打印房屋列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryPrintHouseList(params) {
  return request('/api/v1/coreservice/bill/printing/houseList', { params })
};
