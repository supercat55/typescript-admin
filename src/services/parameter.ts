import request from '@/utils/request';

/**
|--------------------------------------------------
|  参数管理-子应用模版管理
|--------------------------------------------------
*/

/**
 * 获取子应用模版列表
 *
 * @export
 * @param {*} params
 * @returns userInfo
 */
export async function queryIconTemplateList(params) {
  return request('/api/v1/coreservice/icon/template/list', { params })
};

/**
 * 获取子应用模版详情
 *
 * @export
 * @param {*} params
 * @returns userInfo
 */
export async function queryIconTemplateDetail(params) {
  return request('/api/v1/coreservice/icon/template/detail', { params })
};

/**
 * 获取默认子应用模版详情
 *
 * @export
 * @param {*} params
 * @returns userInfo
 */
export async function queryDefaultIconTemplateDetail(params) {
  return request('/api/v1/coreservice/icon/template/defaultTemplateDetail', { params })
};

/**
 * 检查icon名称是否重复
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCheckIconTemplateName(params) {
  return request('/api/v1/coreservice/icon/template/iconTempName', { params })
}

/**
 * 新增子应用模板
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateIconTemplate(params) {
  return request('/api/v1/coreservice/icon/template', { 
    method: 'POST',
    data: params
  })
}

/**
 * 编辑子应用模板
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditIconTemplate(params) {
  return request('/api/v1/coreservice/icon/template', { 
    method: 'PUT',
    data: params
  })
}

/**
 * 编辑子应用默认模板
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditDefaultIconTemplate(params) {
  return request('/api/v1/coreservice/icon/template/defaultTemplateEdit', { 
    method: 'POST',
    data: params
  })
};

/**
 * 获取单个子应用详情
 *
 * @export
 * @param {*} params
 * @returns userInfo
 */
export async function queryIconDetail(params) {
  return request('/api/v1/coreservice/icon/icon/detail', { params })
};

/**
 * 新增子应用模板
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateIcon(params) {
  return request('/api/v1/coreservice/icon/icon', { 
    method: 'POST',
    data: params
  })
}

/**
 * 编辑子应用模板
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditIcon(params) {
  return request('/api/v1/coreservice/icon/icon', { 
    method: 'PUT',
    data: params
  })
}


/**
|--------------------------------------------------
|  参数管理-首页配置
|--------------------------------------------------
*/

/**
 * 获取首页配置列表
 *
 * @export
 * @param {*} params
 * @returns 
 */
export async function queryHomeConfigList(params) {
  return request('/api/v1/coreservice/configure', { params })
};

/**
 * 获取首页配置详情
 *
 * @export
 * @param {*} params
 * @returns 
 */
export async function queryHomeConfigDetail(params) {
  return request('/api/v1/coreservice/configure/detail', { params })
};

/**
 * 获取首页配置子应用模板列表
 *
 * @export
 * @param {*} params
 * @returns 
 */
export async function queryHomeConfigIconList() {
  return request('/api/v1/coreservice/configure/configureIcon')
};

/**
 * 获取首页配置滚动banner模板列表
 *
 * @export
 * @param {*} params
 * @returns 
 */
export async function queryHomeConfigScrollBannerList() {
  return request('/api/v1/coreservice/configure/configureBanner')
};

/**
 * 获取首页配置广告位模板列表
 *
 * @export
 * @param {*} params
 * @returns 
 */
export async function queryHomeConfigAdvertisementList() {
  return request('/api/v1/coreservice//configure/configureAdvertisement')
};

/**
 * 获取首页配置底部banner模板列表
 *
 * @export
 * @param {*} params
 * @returns 
 */
export async function queryHomeConfigBottomBannerList() {
  return request('/api/v1/coreservice/configure/configureBottomBanner')
};

/**
 * 新增首页配置
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateHomeConfig(params) {
  return request('/api/v1/coreservice/configure/addConfigure', { 
    method: 'POST',
    data: params
  })
}

/**
 * 编辑首页配置
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditHomeConfig(params) {
  return request('/api/v1/coreservice/configure', { 
    method: 'PUT',
    data: params
  })
};

/**
 * 启用、停用首页配置
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendToggleHomeConfigStatus(params) {
  return request('/api/v1/coreservice/configure/change', {
    method: 'PUT',
    data: params
  })
};


/**
|--------------------------------------------------
|  参数管理-客户渠道配置
|--------------------------------------------------
*/

/**
 * 获取客户渠道配置列表
 *
 * @export
 * @param {*} params
 * @returns 
 */
export async function queryCustomerChannelList(params) {
  return request('/api/v1/coreservice/channel/management', { params })
};

/**
 * 获取客户渠道配置详情
 *
 * @export
 * @param {*} params
 * @returns 
 */
export async function queryCustomerChannelDetail(params) {
  return request('/api/v1/coreservice/channel/management/detail', { params })
};

/**
 * 新增客户渠道配置
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateCustomerChannel(params) {
  return request('/api/v1/coreservice/channel/management', { 
    method: 'POST',
    data: params
  })
}

/**
 * 编辑客户渠道配置
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditCustomerChannel(params) {
  return request('/api/v1/coreservice/channel/management', { 
    method: 'PUT',
    data: params
  })
};

/**
 * 启用、停用客户渠道配置
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendToggleCustomerChannelStatus(params) {
  return request('/api/v1/coreservice/channel/management/change', {
    method: 'PUT',
    data: params
  })
};

/**
|--------------------------------------------------
|  参数管理-滚动banner、底部banner模板管理
|--------------------------------------------------
*/

/**
 * 获取滚动banner、底部banner列表
 *
 * @export
 * @param {*} params
 * @returns 
 */
export async function queryBannerList(params) {
  return request('/api/v1/coreservice/banner', { params })
};

/**
 * 获取滚动banner、底部banner详情
 *
 * @export
 * @param {*} params
 * @returns 
 */
export async function queryBannerDetail(params) {
  return request('/api/v1/coreservice/banner/detail', { params })
};

/**
 * 获取默认滚动banner、底部banner详情
 *
 * @export
 * @param {*} params
 * @returns userInfo
 */
export async function queryDefaultBannerDetail(params) {
  return request('/api/v1/coreservice/banner/defaultBannerDetail', { params })
};

/**
 * 检查滚动banner、底部banner名称是否重复
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCheckBannerName(params) {
  return request('/api/v1/coreservice/banner/bannerName', { params })
};

/**
 * 新增滚动banner、底部banner
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateBanner(params) {
  return request('/api/v1/coreservice/banner', { 
    method: 'POST',
    data: params
  })
};

/**
 * 编辑滚动banner、底部banner
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditBanner(params) {
  return request('/api/v1/coreservice/banner', { 
    method: 'PUT',
    data: params
  })
};

/**
 * 编辑滚动banner、底部banner默认模板
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditDefaultBanner(params) {
  return request('/api/v1/coreservice/banner/defaultBannerAdd', { 
    method: 'POST',
    data: params
  })
};

/**
|--------------------------------------------------
|  参数管理-广告位模板管理
|--------------------------------------------------
*/

/**
 * 获取广告位模板列表
 *
 * @export
 * @param {*} params
 * @returns 
 */
export async function queryAdvertisementList(params) {
  return request('/api/v1/coreservice/advertisement', { params })
};

/**
 * 获取广告位模板详情
 *
 * @export
 * @param {*} params
 * @returns 
 */
export async function queryAdvertisementDetail(params) {
  return request('/api/v1/coreservice/advertisement/detail', { params })
};

/**
 * 检查广告位模板是否重复
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCheckAdvertisementName(params) {
  return request('/api/v1/coreservice/advertisement/advertisementName', { params })
};

/**
 * 新增广告位模板
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateAdvertisement(params) {
  return request('/api/v1/coreservice/advertisement', { 
    method: 'POST',
    data: params
  })
};

/**
 * 编辑广告位模板
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditAdvertisement(params) {
  return request('/api/v1/coreservice/advertisement', { 
    method: 'PUT',
    data: params
  })
};

/**
|--------------------------------------------------
|  参数管理-短信模板管理
|--------------------------------------------------
*/

/**
 * 获取短信模板列表
 *
 * @export
 * @param {*} params
 * @returns 
 */
export async function querySMSTemplateList(params) {
  return request('/api/v1/coreservice/smstemplate/list', { params })
};

/**
 * 获取短信模板详情
 *
 * @export
 * @param {*} params
 * @returns 
 */
export async function querySMSTemplateDetail(params) {
  return request('/api/v1/coreservice/smstemplate/detail', { params })
};

/**
 * 获取短信模板费用列表
 *
 * @export
 * @param {*} params
 * @returns 
 */
export async function querySMSFeeTypeList(params) {
  return request('/api/v1/coreservice/smstemplate/feeTypeList', { params })
};

/**
 * 新增短信模板
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateSMSTemplate(params) {
  return request('/api/v1/coreservice/smstemplate/add', { 
    method: 'POST',
    data: params
  })
};

/**
 * 编辑短信模板
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditSMSTemplate(params) {
  return request('/api/v1/coreservice/smstemplate/edit', { 
    method: 'POST',
    data: params
  })
};

/**
 * 启用短信模板
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendStartSMSTemplate(params) {
  return request('/api/v1/coreservice/smstemplate/using', {
    method: 'POST',
    data: params
  })
};

/**
 * 停用短信模板
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendDisableSMSTemplate(params) {
  return request('/api/v1/coreservice/smstemplate/block', {
    method: 'POST',
    data: params
  })
};

/**
 * 审核短信模板
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendAuditSMSTemplate(params) {
  return request('/api/v1/coreservice/smstemplate/auditing', {
    method: 'POST',
    data: params
  })
};
