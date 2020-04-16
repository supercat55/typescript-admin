import request from '@/utils/request';

export interface AuthMerchantActionsType {
  merchantId: string;
  accountNum: string;
  name: string;
  roleId: string;
  phoneNum?: number;
  email?: string;
  id?: string;
}
export interface AuthOperationActionsType {
  accountNum: string;
  organizeId: string;
  name: string;
  roleId: string;
  phoneNum?: number;
  email?: string;
  id?: string;
}

export interface AuthRoleActionsType {
  roleName: string;
  roleAttribute: string | number;
  originalModulesIds: string;
  modulesIds: string;
  id?: string
}

/**
 * 检查账号id、手机号是否重名
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendValidateAccount(params) {
  return request('/api/v1/coreservice/user/check', {
    method: 'POST',
    data: params
  })
};

/**
|--------------------------------------------------
|  角色权限-商户管理员账号
|--------------------------------------------------
*/

/**
 * 获取可绑定商户列表
 *
 * @export
 * @returns
 */
export async function queryBindMerchantList() {
  return request('/api/v1/coreservice/merchant/information/find')
}

/**
 * 获取角色权限-商户管理员账号列表
 *
 * @export
 * @returns
 */
export async function queryAuthMerchantList(params) {
  return request('/api/v1/coreservice/authority/merchantManage/list', { params })
};

/**
 * 获取角色权限-商户管理员账号详情
 *
 * @export
 * @returns
 */
export async function queryAuthMerchantDetail(params) {
  return request('/api/v1/coreservice/authority/merchantManage/detail', { params })
};

/**
 * 新增商户管理员账号
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateAuthMerchant(params) {
  return request('/api/v1/coreservice/authority/merchantManage', {
    method: 'POST',
    data: params
  })
};

/**
 * 编辑商户管理员账号
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditAuthMerchant(params) {
  return request('/api/v1/coreservice/authority/merchantManage', {
    method: 'PUT',
    data: params
  })
};

/**
 * 重置商户管理员密码
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendResetAuthMerchantPwd(params) {
  return request('/api/v1/coreservice/user/resetPassword', {
    method: 'PUT',
    data: params
  })
};


/**
 * 停用商户管理员账号
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendDisableAuthMerchant(params) {
  return request('/api/v1/coreservice/authority/merchantManage/cancel', {
    method: 'PUT',
    data: params
  })
};
/**
|--------------------------------------------------
|  角色权限-组织结构表
|--------------------------------------------------
*/

/**
 * 获取角色权限-组织结构列表
 *
 * @export
 * @returns
 */
export async function queryAuthOrganizationList(params) {
  return request('/api/v1/coreservice/authority/organize/list', { params })
};

/**
 * 新增角色组织
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateAuthOrganization(params) {
  return request('/api/v1/coreservice/authority/organize', {
    method: 'POST',
    data: params
  })
};

/**
|--------------------------------------------------
|  角色权限-运营管理账号
|--------------------------------------------------
*/

/**
 * 获取角色权限-运营列表
 *
 * @export
 * @returns
 */
export async function queryAuthOperationList(params) {
  return request('/api/v1/coreservice/authority/operation/list', { params })
};

/**
 * 获取角色权限-运营详情
 *
 * @export
 * @returns
 */
export async function queryAuthOperationDetail(params) {
  return request('/api/v1/coreservice/authority/operation/detail', { params })
};


/**
 * 新增运营账号
 *
 * @export
 * @param {AuthOperationActionsType} params
 * @returns
 */
export async function sendCreateAuthOperation(params: AuthOperationActionsType) {
  return request('/api/v1/coreservice/authority/operation', {
    method: 'POST',
    data: params
  })
};

/**
 * 编辑运营账号
 *
 * @export
 * @param {AuthOperationActionsType} params
 * @returns
 */
export async function sendEditAuthOperation(params: AuthOperationActionsType) {
  return request('/api/v1/coreservice/authority/operation', {
    method: 'PUT',
    data: params
  })
};


/**
 * 重置运营账号密码
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendResetAuthOperationPwd(params) {
  return request('/api/v1/coreservice/user/resetPassword', {
    method: 'PUT',
    data: params
  })
};


/**
 * 停用运营账号
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendDisableAuthOperation(params) {
  return request('/api/v1/coreservice/authority/operation/cancel', {
    method: 'PUT',
    data: params
  })
};


/**
|--------------------------------------------------
|  角色权限-角色与权限
|--------------------------------------------------
*/

/**
 * 获取权限角色列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAuthRoleList(params) {
  return request('/api/v1/coreservice/authority/role/list', { params })
};

/**
 * 获取权限角色详情
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAuthRoleDetail(params) {
  return request('/api/v1/coreservice/authority/role/detail', { params })
};

/**
 * 检查角色名是否重名
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendValidateRoleName(params) {
  return request('/api/v1/coreservice/authority/role/check', {
    method: 'POST',
    data: params
  })
};

/**
 * 新增角色
 *
 * @export
 * @param {AuthOperationActionsType} params
 * @returns
 */
export async function sendCreateAuthRole(params: AuthRoleActionsType) {
  return request('/api/v1/coreservice/authority/role', {
    method: 'POST',
    data: params
  })
};

/**
 * 编辑角色
 *
 * @export
 * @param {AuthOperationActionsType} params
 * @returns
 */
export async function sendEditAuthRole(params: AuthRoleActionsType) {
  return request('/api/v1/coreservice/authority/role', {
    method: 'PUT',
    data: params
  })
};

/**
 * 启用、停用角色
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendToggleAuthRoleStatus(params) {
  return request('/api/v1/coreservice/authority/role/updateStatus', {
    method: 'PUT',
    data: params
  })
};

/**
 * 获取权限操作员角色列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAuthRoleOperatorList(params) {
  return request('/api/v1/coreservice/authority/role/listRoleMerchant', { params })
};

/**
 * 获取商户操作员列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryMerchantOperatorList(params) {
  return request('/api/v1/coreservice/authority/merchantOperation/list', { params })
};

/**
 * 获取商户操作员详情
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryMerchantOperatorDetail(params) {
  return request('/api/v1/coreservice/authority/merchantOperation/detail', { params })
};

/**
 * 新增商户操作员账号
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateMerchantOperator(params) {
  return request('/api/v1/coreservice/authority/merchantOperation', {
    method: 'POST',
    data: params
  })
};

/**
 * 编辑商户操作员账号
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditMerchantOperator(params) {
  return request('/api/v1/coreservice/authority/merchantOperation', {
    method: 'PUT',
    data: params
  })
};

/**
 * 停用商户操作员账号
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendDisableAuthMerchantOperator(params) {
  return request('/api/v1/coreservice/authority/merchantOperation/cancel', {
    method: 'PUT',
    data: params
  })
};
