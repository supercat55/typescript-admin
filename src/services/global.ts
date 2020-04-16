import request from '@/utils/request';

/**
 * 上传图片
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function uploadFile(params) {
  return request('/api/v1/coreservice/common/uploadPicture', {
    method: 'UPLOAD',
    body: params
  })
};
/**
 * 获取用户基本信息
 *
 * @export
 * @returns
 */
export async function queryUserBaseInformation() {
  return request('/api/v1/coreservice/login/baseInformation')
};

/**
 * 获取用户侧边栏列表
 *
 * @export
 * @returns
 */
export async function queryModulesList() {
  return request('/api/v1/coreservice/authority/modules/list')
};

/**
 * 获取全部机构列表
 *
 * @export
 * @returns
 */
export async function queryAllOrganizationList() {
  return request('/api/v1/coreservice/community/basic/orgList')
};

/**
 * 获取所有商户列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAllMerchantList(params) {
  return request('/api/v1/coreservice/community/basic/merchantByName', { params })
}

/**
 * 获取所有渠道配置商户列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAllChannelMerchantList(params) {
  return request('/api/v1/coreservice/merchant/information', { params })
}

/**
 * 根据地址获取所有小区列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAllCommunityListByAddress(params) {
  return request('/api/v1/coreservice/community/basic/selectCommunityList', { params })
}

/**
 * 根据名称获取所有小区列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAllCommunityListByName(params) {
  return request('/api/v1/coreservice/community/basic/queryCommunityByName', { params })
}

/**
 * 根据商户获取所有小区列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAllCommunityListByMerchantId(params) {
  return request('/api/v1/coreservice/community/basic/getCommunityByMerchantId', { params })
}

/**
 * 获取所有子商户列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAllChildMerchantList(params) {
  return request('/api/v1/coreservice/merchant/information/findMerchant', { params })
}

/**
 * 根据角色属性获取角色列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAuthRoleListByAttribute(params) {
  return request('/api/v1/coreservice/authority/role/listSelected', { params })
};

/**
 * 根据角色类型获取角色权限列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAuthModuleListByRoleType(params) {
  return request('/api/v1/coreservice/authority/modules/listByRole', { params })
};

/**
 * 获取支付方式列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryPayCodeList(params) {
  return request('/api/v1/coreservice/merchant/information/feeCode', { params })
};

/**
 * 获取所有支付方式列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAllPayCodeList(params) {
  return request('/api/v1/coreservice/pay/payCode/list', { params })
};

/**
 * 获取所有费用类型列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAllFeeTypeList(params) {
  return request('/api/v1/coreservice/pay/feeType/list', { params })
};

/**
 * 获取账单列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAllBillList(params) {
  return request('/api/v1/coreservice/bill/bill/list', { params })
};

/**
 * 获取房屋列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAllHouseList(params) {
  return request('/api/v1/coreservice/community/house/houseList', { params })
}

/**
 * 导入结果列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryImportResultList(params) {
  return request('/api/v1/coreservice/batch/list', { params })
}

/**
 * 获取所有来源场景列表
 *
 * @export
 * @returns
 */
export async function queryAllSourceSceneList() {
  return request('/api/v1/coreservice/order/metadata/sourceSceneList')
};

/**
 * 根据房屋获取打印列表
 *
 * @export
 * @returns
 */
export async function queryPrintListForHouseId(params) {
  return request('/api/v1/coreservice/bill/printing/list', { 
    method: 'POST',
    data: params
  })
};

/**
 * 根据账单获取打印列表
 *
 * @export
 * @returns
 */
export async function queryPrintListForBillId(params) {
  return request('/api/v1/coreservice/bill/printing/xcList', { 
    method: 'POST',
    data: params
  })
};

/**
 * 获取所有可以维修的岗位列表
 *
 * @export
 * @returns
 */
export async function queryAllMaintainStationList(params) {
  return request('/api/v1/coreservice/property/station/stationList', { params })
};

/**
 * 根据岗位id获取所有可以维修的员工列表
 *
 * @export
 * @returns
 */
export async function queryAllMaintainEmployeeListByStation(params) {
  return request('/api/v1/coreservice/property/employee/repairToEmp', { params })
};

/**
 * 获取所有有效岗位列表
 *
 * @export
 * @returns
 */
export async function queryAllStationListByValid(params) {
  return request('/api/v1/coreservice/property/station/stationPublic', { params })
};

/**
 * 获取所有子应用icon列表
 *
 * @export
 * @returns
 */
export async function queryAllIconTemplateList() {
  return request('/api/v1/coreservice/icon/template/allIcon')
};

/**
 * 获取出入登记未读消息提醒
 *
 * @export
 * @returns
 */
export async function queryUnReadAccessRecord() {
  return request('/api/v1/coreservice/access/getUnRead')
};
