
export const DEFAULT_ALL_TYPE = [
  { label: '全部', value: -1 },
];

export const COMMON_STATUS_TYPES = [
  { value: 0, label: '无效' },
  { value: 1, label: '有效' }
];

export const IS_VALID_DESC = {
  0: '无效',
  1: '有效',
};

export const IS_VALID_BADGE = {
  0: 'error',
  1: 'processing',
}

export const IMPORT_STATUS = [
  { value: 1, label: '处理中' },
  { value: 2, label: '导入成功' },
  { value: 3, label: '导入失败' },
];

export const IMPORT_STATUS_DESC = {
  1: '处理中',
  2: '导入成功',
  3: '导入失败',
};

export const ORGANIZ_PROPERTY_TYPES = [
  { value: 0, label: '总公司' },
  { value: 1, label: '分公司' },
];

export const ORGANIZ_PROPERTY_TYPES_DESC = {
  0: '总公司',
  1: '分公司'
};

export const ROLE_PROPERTY_TYPES = [
  { value: 0, label: '运营角色' },
  { value: 1, label: '商户管理员角色' },
];

export const ROLE_PROPERTY_TYPES_DESC = {
  0: '运营角色',
  1: '商户管理角色'
};

export const MERCHANT_TYPES = [
  { value: 1, label: '普通商户' },
  { value: 2, label: '集团商户' },
  { value: 3, label: '子商户' },
];

export const MERCHAN_TYPE_DESC = {
  1 : '普通商户',
  2 : '集团商户',
  3 : '子商户',
};

export const MERCHAN_AUDIT_STATUS = [
  { value: 0, label: '待审核' },
  { value: 1, label: '审核不通过' },
  { value: 2, label: '审核通过' },
];

export const MERCHAN_AUDIT_STATUS_DESC = {
  0 : '待审核',
  1 : '审核不通过',
  2 : '审核通过',
};

export const MERCHANT_BUSINESS_TYPES = [
  { value: 0, label: '物业管理类' },
  { value: 1, label: '行政机构' },
  { value: 2, label: '公缴类' },
  { value: 3, label: '商超百货' },
];

export const MERCHANT_BUSINESS_TYPES_DESC = {
  0: '物业管理类',
  1: '行政机构',
  2: '公缴类',
  3: '商超百货'
};

export const MERCHANT_FEE_METHOD_TYPES = [
  { value: 0, label: '固定' },
  { value: 1, label: '百分比' },
];

export const MERCHANT_FEE_METHOD_TYPES_DESC = {
  0: '固定',
  1: '百分比',
};

export const PAYMENT_MODE_TYPES = [
  { value: 1, label: '拆分支付' },
  { value: 2, label: '合并支付' }
];

export const PAYMENT_MODE_TYPES_DESC = {
  1: '拆分支付',
  2: '合并支付'
};

export const CALL_BILL_STATUS_DESC = {
  1: '催缴中',
  2: '催缴完成',
};

export const CALL_BILL_STATUS = [
  { value: 1, label: '待支付' },
  { value: 4, label: '部分支付' },
];

export const BILL_STATUS = [
  { value: 0, label: '待推送' },
  { value: 1, label: '待支付' },
  { value: 2, label: '支付完成' },
  { value: 3, label: '已撤销' },
  { value: 4, label: '部分支付' },
  { value: 5, label: '支付成功，销账处理中' },
];

export const BILL_STATUS_DESC = {
  0: '待推送',
  1: '待支付',
  2: '支付完成',
  3: '已撤销',
  4: '部分支付',
  5: '支付成功，销账处理中'
};

export const BILL_PRINT_STATUS = [
  { value: 0, label: '待推送' },
  { value: 1, label: '待支付' },
  { value: 2, label: '支付完成' },
  { value: 4, label: '部分支付' },
  { value: 5, label: '支付成功，销账处理中' },
];

export const BILL_OVERDUN_STATUS = [
  { value: 0, label: '未逾期' },
  { value: 1, label: '逾期' },
]

export const CHARGE_MODE_TYPES = [
  { value: 1, label: '总价计费' },
  { value: 2, label: '月单价计费' },
  { value: 3, label: '日单价计费' },
];

export const CHARGE_MODE_TYPES_DESC = {
  1 : '总价计费',
  2 : '月单价计费',
  3 : '日单价计费',
};

export const AMOUNT_ACCURACY = [
  { value: 1, label: '分' },
  { value: 2, label: '角' },
  { value: 3, label: '元' },
];

export const AREA_TYPES = [
  { value: 1, label: '使用面积' },
  { value: 2, label: '建筑面积' },
  { value: 3, label: '其他面积' },
];

export const ORDER_PAY_SOURCE = [
  { value: 1, label: '通联钱包APP' },
  { value: 2, label: '通联钱包公众号' },
];

export const ORDER_PAY_SOURCE_DESC = {
  1: '通联钱包APP',
  2: '通联钱包公众号',
};

export const BILL_LOG_STATUS = [
  { value: 1, label : '生成完毕'},
  { value: 2, label : '持续生成中'},
  { value: 3, label : '已失效'}
]

export const BILL_LOG_STATUS_DESC = {
  1 : '生成完毕',
  2 : '持续生成中',
  3 : '已失效'
}

export const BILL_LOG_BADGE_STATUS = {
  1 : 'processing',
  2 : 'warning',
  3 : 'default'
};

export const BILL_PERIOD_DESC = {
  1 : '按单月生成1次',
  2 : '按双月生成1次',
  3 : '按3个月生成1次',
  6 : '按6个月生成1次',
  12 : '按12个月生成1次',
};

export const ORDER_REFUND_STATUS = [
  { value: 0, label: '未退款' },
  { value: 1, label: '退款处理中' },
  { value: 2, label: '退款失败' },
  { value: 3, label: '退款成功' },
]

export const ORDER_REFUND_STATUS_DESC = {
  0: '未退款',
  1: '退款处理中',
  2: '退款失败',
  3: '退款成功',
};

export const ORDER_PAY_STATUS = [
  { value: 0, label: '未支付' },
  { value: 1, label: '支付成功' },
  // { value: 2, label: '已退款' },
  // { value: 3, label: '支付成功不可退款' },
  { value: 4, label: '交易关闭' },
  { value: 5, label: '支付成功，销账处理中' }
];

export const ORDER_PAY_STATUS_DESC = {
  0: '未支付',
  1: '支付成功',
  // 2: '已退款',
  // 3: '支付成功不可退款',
  4: '交易关闭',
  5: '支付成功，销账处理中',
};

export const COMMUNITY_TYPES = [
  { value: 1, label: '普通住宅' },
  { value: 2, label: '商用住宅' },
  { value: 3, label: '购物商城' },
  { value: 4, label: '办公大厦' },
  { value: 5, label: '工业园区' },
  { value: 6, label: '白领公寓' },
  { value: 7, label: '居委会' },
  { value: 8, label: '其他' },
];

export const COMMUNITY_TYPES_DESC = {
  1: '普通住宅',
  2: '商用住宅',
  3: '购物商城',
  4: '办公大厦',
  5: '工业园区',
  6: '白领公寓',
  7: '居委会',
  8: '其他',
};

export const COMMUNITY_VALID_TYPES = [
  { value: 0, label: '无需认证' },
  { value: 1, label: '姓名证件号认证' },
];

export const DISPLAY_MODE_TYPES = [
  { value: 1, label: '按社区' },
  { value: 2, label: '按费用类型' },
  { value: 3, label: '按社区与费用类型' },
];

export const HOUSE_TYPES = [
  // { value: 1, label: '未绑定' },
  { value: 2, label: '自住' },
  { value: 3, label: '租赁' },
  { value: 4, label: '公建' },
  { value: 5, label: '居民' },
  { value: 6, label: '商业' },
  { value: 7, label: '办公' },
];

export const HOUSE_TYPES_DESC = {
  1: '未绑定',
  2: '自住',
  3: '租赁',
  4: '公建',
  5: '居民',
  6: '商业',
  7: '办公',
};

export const HOUSE_CHECK_IN_STATUS = [
  { value: 1, label: '待售' },
  { value: 2, label: '未入住' },
  { value: 3, label: '已入住' },
  { value: 4, label: '已托管' },
];

export const HOUSE_RENT_TYPES = [
  { value: 1, label: '待出租' },
  { value: 2, label: '已预订' },
  { value: 3, label: '已出租' },
];

export const GENDER_TYPES = [
  { value: 1, label: '男' },
  { value: 0, label: '女' },
];

export const IDENTITY_TYPES = [
  { value: 1, label: '身份证' },
  { value: 2, label: '居住证' },
  { value: 3, label: '签证' },
  { value: 4, label: '护照' },
  { value: 5, label: '户口本' },
  { value: 6, label: '台胞证' },
];

export const RESIDENT_RELATION_TYPES = [
  { value: 0, label: '业主' },
  // { value: 1, label: '房主' },
  { value: 2, label: '租户' },
  { value: 3, label: '亲朋' },
  { value: 4, label: '其他' },
]

export const RESIDENT_RELATION_TYPES_DESC = {
  0: '业主',
  1: '房主',
  2: '租户',
  3: '亲朋',
  4: '其他'
};

export const MAINTAIN_TYPES = [
  { value: 0, label: '报事' },
  { value: 1, label: '报修' },
];

export const MAINTAIN_TYPES_DESC = {
  0: '报事',
  1: '报修',
};

export const MAINTAIN_STATUS = [
  { value: 0, label: '待处理' },
  { value: 1, label: '处理中' },
  { value: 2, label: '已处理' },
];

export const MAINTAIN_STATUS_DESC = {
  0: '待处理',
  1: '处理中', 
  2: '已处理',
};

export const STATION_TYPES = [
  { value: 1, label: '普通岗位' },
  { value: 2, label: '接单' },
  { value: 3, label: '派工' },
];

export const STATION_TYPES_DESC = {
  1: '普通岗位',
  2: '接单',
  3: '派工'
};

export const OPERATE_RECONCILIATION_STATE_DESC = {
  0: '未对平',
  1: '已对平'
};

export const OPERATE_RECONCILIATION_STATE_BADGE = {
  0: 'error',
  1: 'default',
};

export const CUSTOMER_CHANNEL_TYPES = [
  { value: 0, label: '公众号' },
  { value: 1, label: 'app' },
];

export const CUSTOMER_CHANNEL_TYPES_DESC = {
  0: '公众号',
  1: 'app'
};

export const CUSTOMER_CHANNEL_SCOPE = [
  { value: 0, label: '商户' },
  { value: 1, label: '小区' },
  { value: 2, label: '所有商户' },
];

export const BANNER_LINK_TYPES = [
  { value: 0, label: '无链接' },
  { value: 1, label: '内部链接' },
  { value: 2, label: '外部链接' },
];

export const SMS_TEMP_TYPES = [
  { value: 1, label: '账单提醒模板' },
  { value: 2, label: '账单催缴模板' },
];

export const SMS_TEMP_TYPES_DESC = {
  1: '账单提醒模板',
  2: '账单催缴模板',
};

export const SMS_AUDIT_STATUS = [
  { value: 1, label: '待审核' },
  { value: 2, label: '审核通过' },
  { value: 3, label: '审核未通过' },
];

export const SMS_AUDIT_STATUS_DESC = {
  1: '待审核',
  2: '审核通过',
  3: '审核未通过',
};

export const MESSAGE_NOTICE_TYPES = [
  { value: 1, label: '社区通知' },
  { value: 2, label: '时事资讯' },
];

export const MESSAGE_NOTICE_TYPES_DESC = {
  1: '社区通知',
  2: '时事资讯',
};

export const MESSAGE_NOTICE_STATUS = [
  { value: 1, label: '待生效' },
  { value: 2, label: '发布中' },
  { value: 3, label: '已下架' },
];

export const MESSAGE_NOTICE_STATUS_DESC = {
  1: '待生效',
  2: '发布中',
  3: '已下架',
};

export const RELEASE_RANGE = [
  { value: 1, label: '全部小区' },
  { value: 2, label: '部分小区' },
];

export const ACCESS_TYPES = [
  { value: 1, label: '进入小区' },
  { value: 2, label: '离开小区' },
];

export const ACCESS_TYPES_DESC = {
  1: '进入小区',
  2: '离开小区',
};
