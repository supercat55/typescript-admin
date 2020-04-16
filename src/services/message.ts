import request from '@/utils/request';

export interface MessageNoticeActionsType {
  noticeTitle: string;
  noticeType: string;
  pushScope: string;
  pushTime: number;
  noticeContent: string;
  communityIdList?: string[];
  id?: string;
}

/**
 * 获取社区公告列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryNoticeList(params) {
  return request('/api/v1/coreservice/notice/list', { params });
};


/**
 * 获取社区公告详情
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryNoticeDetail(params) {
  return request('/api/v1/coreservice/notice/detail', { params });
};

/**
 * 新增社区公告
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendCreateNotice(params) {
  return request('/api/v1/coreservice/notice/add', {
    method: 'POST',
    data: params
  })
};

/**
 * 编辑社区公告
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendEditNotice(params) {
  return request('/api/v1/coreservice/notice/edit', {
    method: 'POST',
    data: params
  })
};

/**
 * 下架社区公告
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function sendUnderNotice(params) {
  return request('/api/v1/coreservice/notice/under', {
    method: 'POST',
    data: params
  })
};

