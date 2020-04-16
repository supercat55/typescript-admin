import request from '@/utils/request';

interface communityServiceType {
  merchantId: string;
  isSend: number;
  isSendWarn: number;
  responsibleName: string;
  responsiblePhone: number;
  responsibleCard: string | number;
  areaPhone: string | number;
  remark?: string;
  financeName?: string;
  financePhone?: number;
  financeCard?: string | number;
  payees: payeesType[];
}

interface payeesType {
  payeeName: string;
  payeePhone: number;
  isMessage: number;
}

export interface CommunityActionsType {
  id?: string;
  communityName: string;
  communityType: number;
  isValite: number;
  province: string;
  city: string;
  area: string;
  street: string;
  longItude?: number;
  latItude?: number;
  housesTotal?: number;
  greenSpace?: number;
  overGroundParkingTotal?: number;
  overGroundParkingSells?: number;
  overGroundParkingLeases?: number;
  underGroundParkingTotal?: number;
  underGroundParkingSells?: number;
  underGroundParkingLeases?: number;
  communityServices: communityServiceType[];
}

export interface HouseActionsType {
  id?: string;
  merchantId: string;
  communityId: string;
  buildingNo: string | number;
  unitNo: string | number;
  accountNo: string | number;
  houseNo?: string;
  startTime?: number;
  endTime?: number;
  houseType?: number;
  checkinStatus?: number;
  leaseStatus?: number;
  ownerName?: string;
  ownerPhone?: number;
  sex?: number;
  cardType?: number;
  cardId?: string | number;

  builtArea?: number;
  useingArea?: number;
  publicArea?: number;
  otherArea?: number;
  floor?: number;
  renovation?: number;
  estateNo?: string | number;
  buildType?: string;
  orientation?: string;
  remark?: string;
};

export interface ResidentActionsType {
  id?: string;
  merchantId: string;
  communityId: string;
  buildingNo: string | number;
  unitNo: string | number;
  accountNo: string | number;
  ownerName: string;
  ownerPhone: number;
  isOwner: number;
  sex?: number;
  cardType?: number;
  cardId?: string | number;
  workUnit?: string;
  postalAddress?: string;
  nationality?: string;
  houseRegister?: string;
  remark?: string;
}

/**
|--------------------------------------------------
|  信息管理-小区管理
|--------------------------------------------------
*/

/**
 * 获取小区列表
 *
 * @export
 * @param {*} params
 */
export async function queryCommunityList(params) {
  return request('/api/v1/coreservice/community/basic/communityList', { params });
};

/**
 * 获取小区详情
 *
 * @export
 * @param {*} params
 */
export async function queryCommunityDetail(params) {
  return request('/api/v1/coreservice/community/basic/communitydetail', { params });
};

/**
 * 新增小区
 *
 * @export
 * @param {CommunityActionsType} params
 * @returns
 */
export async function sendCreateCommunity(params: CommunityActionsType) {
  return request('/api/v1/coreservice/community/basic/addCommunitys', {
    method: 'POST',
    data: params
  });
};

/**
 * 编辑小区
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditCommunity(params: CommunityActionsType) {
  return request('/api/v1/coreservice/community/basic/modifyCommunitys', {
    method: 'POST',
    data: params
  });
};

/**
 * 删除小区
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendDeleteCommunity(params) {
  return request('/api/v1/coreservice/community/basic/delCommunity', {
    method: 'DELETE',
    data: params
  });
};

/**
 * 检查小区是否包含收款员
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCheckCashierByCommunity(params) {
  return request('/api/v1/coreservice/reportForm/QRCode/checkPayeer', { params });
};

/**
|--------------------------------------------------
|  信息管理-房屋管理
|--------------------------------------------------
*/

/**
 * 获取房屋列表
 *
 * @export
 * @param {*} params
 */
export async function queryHouseList(params) {
  return request('/api/v1/coreservice/community/house/houseList', { params });
};

/**
 * 获取房屋详情
 *
 * @export
 * @param {*} params
 */
export async function queryHouseDetail(params) {
  return request('/api/v1/coreservice/community/house/housedetail', { params });
};

/**
 * 获取房屋住户列表
 *
 * @export
 * @param {*} params
 */
export async function queryHouseOwnerList(params) {
  return request('/api/v1/coreservice/community/owner/ownerList', { params });
};

/**
 * 获取房屋账单列表
 *
 * @export
 * @param {*} params
 */
export async function queryHouseBillList(params) {
  return request('/api/v1/coreservice/bill/bill/list', { params });
};

/**
 * 新增房屋
 *
 * @export
 * @param {CommunityActionsType} params
 * @returns
 */
export async function sendCreateHouse(params: HouseActionsType) {
  return request('/api/v1/coreservice/community/house/addHouse', {
    method: 'POST',
    data: params
  });
};

/**
 * 批量新增房屋
 *
 * @export
 * @param {CommunityActionsType} params
 * @returns
 */
export async function sendBatchCreateHouse(params) {
  return request('/api/v1/coreservice/community/house/saveUploadExcelData2base', {
    method: 'POST',
    data: params
  });
};

/**
 * 编辑房屋
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditHouse(params: HouseActionsType) {
  return request('/api/v1/coreservice/community/house/modifyHouse', {
    method: 'POST',
    data: params
  });
};

/**
 * 删除房屋
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendDeleteHouse(params) {
  return request('/api/v1/coreservice/community/house/delHouse', {
    method: 'DELETE',
    data: params
  });
};

/**
|--------------------------------------------------
|  信息管理-住户管理
|--------------------------------------------------
*/

/**
 * 获取住户列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryResidentList(params) {
  return request('/api/v1/coreservice/community/owner/ownerList', { params });
};

/**
 * 获取住户详情
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryResidentDetail(params) {
  return request('/api/v1/coreservice/community/owner/ownerdetail', { params });
};

/**
 * 根据小区id获取楼号、单元号、户号信息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryHouseInfoByCommunity(params) {
  return request('/api/v1/coreservice/community/house/getHouseAndBuildNo', { params });
}

/**
 * 添加住户
 *
 * @export
 * @param {*} params
 */
export async function sendCreateResident(params: ResidentActionsType) {
  return request('/api/v1/coreservice/community/owner/addOwnerInfo', {
    method: 'POST',
    data: params
  })
};


/**
 * 批量新增房屋
 *
 * @export
 * @param {CommunityActionsType} params
 * @returns
 */
export async function sendBatchCreateResident(params) {
  return request('/api/v1/coreservice/community/owner/importOwnerInfos', {
    method: 'POST',
    data: params
  });
};

/**
 * 编辑住户
 *
 * @export
 * @param {*} params
 */
export async function sendEditResident(params: ResidentActionsType) {
  return request('/api/v1/coreservice/community/owner/modifyOwnerInfo', {
    method: 'POST',
    data: params
  })
};

/**
 * 删除住户
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendDeleteResident(params) {
  return request('/api/v1/coreservice/community/owner/delOwnerInfoById', {
    method: 'DELETE',
    data: params
  });
};
