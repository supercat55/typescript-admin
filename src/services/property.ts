import request from '@/utils/request';

export interface EmployeeActionsType {
  id?: string;
  communityIds: string;
  stationId: string;
  employeeName: string;
  employeePhone: number;
  jobNo?: string;
  picsUrl?: string;
  remark?: string;
  isShow?: number;
  serviceTime?: string;
  servicePhone?: string;
}

/**
|--------------------------------------------------
|  物业服务管理-报事报修管理
|--------------------------------------------------
*/

/**
 * 获取报事报修列表
 *
 * @export
 * @param {*} params
 */
export async function queryMaintainList(params) {
  return request('/api/v1/coreservice/property/repair/list', { params });
};

/**
 * 获取报事报修详情
 *
 * @export
 * @param {*} params
 */
export async function queryMaintainDetail(params) {
  return request('/api/v1/coreservice/property/repair/detail', { params });
};

/**
 * 确认报事报修完成
 *
 * @export
 * @param {*} params
 */
export async function sendCompletedMaintain(params) {
  return request('/api//v1/coreservice/property/repair/handle', {
    method: 'PUT',
    data: params
  })
};

/**
 * 报事报修指派员工
 *
 * @export
 * @param {*} params
 */
export async function sendMaintainAssginEmployee(params) {
  return request('/api/v1/coreservice/property/repair/assign', {
    method: 'PUT',
    data: params
  })
};

/**
|--------------------------------------------------
|  物业服务管理-岗位管理
|--------------------------------------------------
*/

/**
 * 获取岗位列表
 *
 * @export
 * @param {*} params
 * @returns userInfo
 */
export async function queryStationList(params) {
  return request('/api/v1/coreservice/property/station/stationList', { params })
};


/**
 * 新增岗位
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateStation(params) {
  return request('/api/v1/coreservice/property/station/addStation', {
    method: 'POST',
    data: params
  })
};

/**
 * 修改岗位
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditStation(params) {
  return request('/api/v1/coreservice/property/station/modifyStation', {
    method: 'POST',
    data: params
  })
};

/**
 * 停用岗位
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendStopStation(params) {
  return request('/api/v1/coreservice/property/station/delStation', {
    method: 'DELETE',
    data: params
  })
};

/**
|--------------------------------------------------
|  物业服务管理-员工管理
|--------------------------------------------------
*/

/**
 * 获取员工列表
 *
 * @export
 * @param {*} params
 * @returns userInfo
 */
export async function queryEmployeeList(params) {
  return request('/api/v1/coreservice/property/employee/employeeList', { params })
};

/**
 * 获取员工详情
 *
 * @export
 * @param {*} params
 * @returns userInfo
 */
export async function queryEmployeeDetail(params) {
  return request('/api/v1/coreservice/property/employee/employeeDetail', { params })
};

/**
 * 新增员工
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateEmployee(params) {
  return request('/api/v1/coreservice/property/employee/addEmployee', {
    method: 'POST',
    data: params
  })
};

/**
 * 修改员工
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditEmployee(params) {
  return request('/api/v1/coreservice/property/employee/modifyEmployee', {
    method: 'POST',
    data: params
  })
};

/**
 * 启用、停用员工
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendToggleEmployeeStatus(params) {
  return request('/api/v1/coreservice/property/employee/updateEmployeeValid', {
    method: 'DELETE',
    data: params
  })
};
