export default [
  {
    path: '/login',
    component: '../layouts/LoginLayout',
    routes: [
      { path: '/login', redirect: '/login/index' },
      { path: '/login/index', component: './Login/Login'},
      {
        path: '/login/find-password',
        name: '找回密码',
        component: './Login/FindPassword'
      },
      {
        path: '/login/reset-password/:id',
        name: '找回密码',
        component: './Login/ResetPassword'
      },
    ]
  },
  {
    path: '/print',
    component: './Print'
  },
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      { path: '/', redirect: '/home' },
      {
        path: '/home',
        hideInMenu: true,
        component: './Home/index'
      },
      {
        path: '/import-result',
        name: '文件导入查询',
        component: './Home/ImportResult',
        hideInMenu: true,
      },

      {
        path: '/parameter',
        name: '参数管理',
        icon: 'dashboard',
        key: '10',
        routes: [
          {
            path: '/parameter/icon-template',
            name: '子应用模版管理',
            component: './Parameter/IconTemplate/List',
            key: '10-1',
          },
          {
            path: '/parameter/icon-template/create',
            name: '新增子应用模版',
            component: './Parameter/IconTemplate/Actions',
            hideInMenu: true,
          },
          {
            path: '/parameter/icon-template/actions/:id',
            name: '操作子应用模版',
            component: './Parameter/IconTemplate/Actions',
            hideInMenu: true,
          },
          {
            path: '/parameter/icon-template/inventory',
            name: '子应用库存',
            component: './Parameter/IconTemplate/Inventory',
            hideInMenu: true,
          },
          {
            path: '/parameter/home-config',
            name: '首页配置',
            component: './Parameter/HomeConfig/List',
            key: '10-2',
          },
          {
            path: '/parameter/home-config/create',
            name: '新增首页配置',
            component: './Parameter/HomeConfig/Actions',
            hideInMenu: true,
          },
          {
            path: '/parameter/home-config/actions/:id',
            name: '操作首页配置',
            component: './Parameter/HomeConfig/Actions',
            hideInMenu: true,
          },
          {
            path: '/parameter/customer-channel',
            name: '客户渠道配置',
            component: './Parameter/CustomerChannel/List',
            key: '10-3',
          },
          {
            path: '/parameter/customer-channel/create',
            name: '新增客户渠道配置',
            component: './Parameter/CustomerChannel/Actions',
            hideInMenu: true,
          },
          {
            path: '/parameter/customer-channel/actions/:id',
            name: '操作客户渠道配置',
            component: './Parameter/CustomerChannel/Actions',
            hideInMenu: true,
          },
          {
            path: '/parameter/scroll-banner',
            name: '滚动banner模板',
            component: './Parameter/Banner/ScrollList',
            key: '10-4',
          },
          {
            path: '/parameter/scroll-banner/create',
            name: '新增滚动banner模板',
            component: './Parameter/Banner/ScrollActions',
            hideInMenu: true,
          },
          {
            path: '/parameter/scroll-banner/actions/:id',
            name: '操作滚动banner模板',
            component: './Parameter/Banner/ScrollActions',
            hideInMenu: true,
          },
          {
            path: '/parameter/advertisement',
            name: '广告位模板',
            component: './Parameter/Advertisement/List',
            key: '10-5',
          },
          {
            path: '/parameter/advertisement/create',
            name: '新增广告位模板',
            component: './Parameter/Advertisement/Actions',
            hideInMenu: true,
          },
          {
            path: '/parameter/advertisement/edit/:id',
            name: '编辑广告位模板',
            component: './Parameter/Advertisement/Actions',
            hideInMenu: true,
          },
          {
            path: '/parameter/advertisement/detail/:id',
            name: '广告位模板详情',
            component: './Parameter/Advertisement/Detail',
            hideInMenu: true,
          },
          {
            path: '/parameter/bottom-banner',
            name: '底部banner模板',
            component: './Parameter/Banner/BottomList',
            key: '10-6',
          },
          {
            path: '/parameter/bottom-banner/create',
            name: '新增底部banner模板',
            component: './Parameter/Banner/BottomActions',
            hideInMenu: true,
          },
          {
            path: '/parameter/bottom-banner/actions/:id',
            name: '操作底部banner模板',
            component: './Parameter/Banner/BottomActions',
            hideInMenu: true,
          },
          {
            path: '/parameter/sms',
            name: '短信模板管理',
            component: './Parameter/SMS/ManageList',
            key: '10-7',
          },
          {
            path: '/parameter/sms/create',
            name: '新增短信模板',
            component: './Parameter/SMS/ManageActions',
            hideInMenu: true,
          },
          {
            path: '/parameter/sms/actions/:id',
            name: '操作短信模板',
            component: './Parameter/SMS/ManageActions',
            hideInMenu: true,
          },
          {
            path: '/parameter/sms-audit',
            name: '短信模板审核',
            component: './Parameter/SMS/AuditList',
            key: '10-8',
          },
          {
            path: '/parameter/sms-audit/detail/:id',
            name: '短信模板审核详情',
            component: './Parameter/SMS/AuditActions',
            hideInMenu: true,
          },
          {
            path: '/parameter/sms-audit/audit/:id',
            name: '审核短信模板',
            component: './Parameter/SMS/AuditActions',
            hideInMenu: true,
          },
        ]
      },


      {
        path: '/merchant',
        name: '商户管理',
        icon: 'shop',
        key: '2',
        routes: [
          {
            path: '/merchant/manage',
            name: '商户信息管理',
            component: './Merchant/Manage',
            key: '2-1',
            keepAlive: true,
          },
          {
            path: '/merchant/audit',
            name: '商户信息审核',
            component: './Merchant/Audit',
            key: '2-2',
            keepAlive: true,
          },
          {
            path: '/merchant/manage/actions/:id?',
            name: '操作商户信息',
            component: './Merchant/Actions',
            hideInMenu: true,
          },
        ]
      },

      {
        path: '/auth',
        name: '角色权限管理',
        icon: 'team',
        key: '1',
        routes: [
          {
            path: '/auth/merchant',
            name: '商户管理员账号',
            component: './Auth/Merchant/List',
            key: '1-1',
          },
          {
            path: '/auth/merchant/actions/:id?',
            name: '操作商户管理员账号',
            component: './Auth/Merchant/Actions',
            hideInMenu: true,
          },
          {
            path: '/auth/role-operator',
            name: '角色权限(操作员)',
            component: './Auth/RoleOperator/List',
            key: '1-2',
          },
          {
            path: '/auth/role-operator/actions/:id?',
            name: '操作角色权限(操作员)',
            component: './Auth/RoleOperator/Actions',
            hideInMenu: true,
          },
          {
            path: '/auth/merchant-operator',
            name: '商户操作员账号',
            component: './Auth/MerchantOperator/List',
            key: '1-3',
          },
          {
            path: '/auth/merchant-operator/actions/:id?',
            name: '操作商户操作员账号',
            component: './Auth/MerchantOperator/Actions',
            hideInMenu: true,
          },
          {
            path: '/auth/organization',
            name: '组织结构表',
            component: './Auth/Organization',
            key: '1-4',
          },
          {
            path: '/auth/role',
            name: '角色与权限',
            component: './Auth/Role/List',
            key: '1-5',
            keepAlive: true,
          },
          {
            path: '/auth/role/actions/:id?',
            name: '操作角色',
            component: './Auth/Role/Actions',
            hideInMenu: true,
          },
          {
            path: '/auth/operation',
            name: '运营账号',
            component: './Auth/Operation/List',
            key: '1-6',
          },
          {
            path: '/auth/operation/actions/:id?',
            name: '操作运营账号',
            component: './Auth/Operation/Actions',
            hideInMenu: true,
          },
        ]
      },

      {
        path: '/info',
        name: '信息管理',
        icon: 'home',
        key: '6',
        routes: [
          {
            path: '/info/community',
            name: '小区管理',
            component: './Info/Community/List',
            key: '6-1'
          },
          {
            path: '/info/community/create',
            name: '新增小区',
            component: './Info/Community/Actions',
            hideInMenu: true
          },
          {
            path: '/info/community/actions/:id',
            name: '操作小区',
            component: './Info/Community/Actions',
            hideInMenu: true
          },
          {
            path: '/info/house',
            name: '房屋管理',
            component: './Info/House/List',
            key: '6-2'
          },
          {
            path: '/info/house/create',
            name: '新增房屋',
            component: './Info/House/Actions',
            hideInMenu: true
          },
          {
            path: '/info/house/batch-create',
            name: '批量添加房屋',
            component: './Info/House/BatchCreate',
            hideInMenu: true,
          },
          {
            path: '/info/house/actions/:id',
            name: '操作房屋',
            component: './Info/House/Actions',
            hideInMenu: true
          },
          {
            path: '/info/resident',
            name: '住户管理',
            component: './Info/Resident/List',
            key: '6-3'
          },
          {
            path: '/info/resident/create',
            name: '新增住户',
            component: './Info/Resident/Actions',
            hideInMenu: true
          },
          {
            path: '/info/resident/batch-create',
            name: '批量添加住户',
            component: './Info/Resident/BatchCreate',
            hideInMenu: true,
          },
          {
            path: '/info/resident/actions/:id',
            name: '操作住户',
            component: './Info/Resident/Actions',
            hideInMenu: true
          },
        ]
      },

      {
        path: '/payment',
        name: '缴费管理',
        icon: 'bank',
        key: '3',
        routes: [
          {
            path: '/payment/mode',
            name: '支付模式管理',
            component: './Payment/Mode/List',
            key: '3-1',
          },
          {
            path: '/payment/mode/create',
            name: '新增支付模式',
            component: './Payment/Mode/Actions',
            hideInMenu: true,
          },
          {
            path: '/payment/mode/actions/:id',
            name: '操作支付模式',
            component: './Payment/Mode/Actions',
            hideInMenu: true,
          },
          {
            path: '/payment/fee-type',
            name: '费用类型管理',
            component: './Payment/FeeType/List',
            key: '3-2',
          },
          {
            path: '/payment/call',
            name: '催缴管理',
            component: './Payment/Call/List',
            key: '3-3',
          },
          {
            path: '/payment/call/create',
            name: '催缴',
            component: './Payment/Call/Create',
            hideInMenu: true,
          },
          {
            path: '/payment/call/detail/:id',
            name: '催缴详情',
            component: './Payment/Call/Detail',
            hideInMenu: true,
          },
        ]
      },

      {
        path: '/bill',
        name: '账单管理',
        icon: 'table',
        key: '4',
        routes: [
          {
            path: '/bill/detail',
            name: '账单明细管理',
            component: './Bill/Detail/List',
            key: '4-1',
          },
          {
            path: '/bill/detail/actions/:id',
            name: '操作账单明细',
            component: './Bill/Detail/Actions',
            hideInMenu: true,
          },
          {
            path: '/bill/detail/single-create',
            name: '单个添加',
            component: './Bill/Detail/SingleCreate',
            hideInMenu: true,
          },
          {
            path: '/bill/detail/batch-create',
            name: '批量添加',
            component: './Bill/Detail/BatchCreate',
            hideInMenu: true,
          },
          {
            path: '/bill/detail/temp-create',
            name: '调用模板生成账单',
            component: './Bill/Detail/TempCreate',
            hideInMenu: true,
          },
          {
            path: '/bill/detail/temp-edit/:id',
            name: '调用模板生成账单',
            component: './Bill/Detail/TempCreate',
            hideInMenu: true,
          },
          {
            path: '/bill/template',
            name: '计费账单模版',
            component: './Bill/Template/List',
            key: '4-2',
          },
          {
            path: '/bill/template/log/:id',
            name: '调用日志',
            component: './Bill/Template/Log',
            hideInMenu: true,
          },
          {
            path: '/bill/on-site',
            name: '现场缴费',
            component: './Bill/OnSite/List',
            key: '4-4',
          },
          {
            path: '/bill/print',
            name: '单据打印',
            component: './Bill/Print/List',
            key: '4-5',
          },
          {
            path: '/bill/print/detail/:id',
            name: '查看',
            component: './Bill/Print/Detail',
            hideInMenu: true,
          },
        ]
      },

      {
        path: '/order',
        name: '订单管理',
        icon: 'profile',
        key: '5',
        routes: [
          {
            path: '/order/pay',
            name: '支付订单管理',
            component: './Order/PayList',
            key: '5-1',
          },
          {
            path: '/order/pay/detail/:id',
            name: '支付订单详情',
            component: './Order/PayDetail',
            hideInMenu: true,
          },
          {
            path: '/order/business',
            name: '业务订单管理',
            component: './Order/BusinessList',
            key: '5-2',
          },
          {
            path: '/order/business/detail/:id',
            name: '业务订单详情',
            component: './Order/BusinessDetail',
            hideInMenu: true,
          },
        ]
      },
      

      {
        path: '/property',
        name: '物业服务管理',
        icon: 'warning',
        key: '7',
        routes: [
          {
            path: '/property/maintain',
            name: '报事报修',
            component: './Property/Maintain/List',
            key: '7-2',
          },
          {
            path: '/property/maintain/detail/:id',
            name: '报事报修详情',
            component: './Property/Maintain/Detail',
            hideInMenu: true
          },
          {
            path: '/property/station',
            name: '岗位管理',
            component: './Property/Station/List',
            key: '7-3',
          },
          {
            path: '/property/employee',
            name: '员工管理',
            component: './Property/Employee/List',
            key: '7-4',
          },
          {
            path: '/property/employee/create',
            name: '新增员工',
            component: './Property/Employee/Actions',
            hideInMenu: true
          },
          {
            path: '/property/employee/actions/:id',
            name: '操作员工',
            component: './Property/Employee/Actions',
            hideInMenu: true
          },
          {
            path: '/property/access',
            name: '出入记录管理',
            component: './Property/Access/List',
            key: '7-5',
          },
          {
            path: '/property/access/actions/:id?',
            name: '操作出入记录',
            component: './Property/Access/Actions',
            hideInMenu: true
          },
        ]
      },

      {
        path: 'message',
        name: '消息管理',
        icon: 'message',
        key: '11',
        routes: [
          {
            path: '/message/notice',
            name: '社区公告管理',
            component: './Message/NoticeList',
            key: '11-1',
          },
          {
            path: '/message/notice/create',
            name: '新增社区公告',
            component: './Message/NoticeActions',
            hideInMenu: true
          },
          {
            path: '/message/notice/actions/:id',
            name: '操作社区公告',
            component: './Message/NoticeActions',
            hideInMenu: true
          }
        ]
      },

      {
        path: '/report',
        name: '报表管理',
        icon: 'line-chart',
        key: '8',
        routes: [
          {
            path: '/report/reconciliation',
            name: '对账报表',
            component: './Report/ReconciliationList',
            key: '8-1',
          },
          {
            path: '/report/settlement',
            name: '商户结算表',
            component: './Report/SettlementList',
            key: '8-2',
          },
          {
            path: '/report/community-collection',
            name: '社区收缴率报表',
            component: './Report/CommunityCollectionList',
            key: '8-3',
          },
          {
            path: '/report/merchant-collection',
            name: '商户收缴率报表',
            component: './Report/MerchantCollectionList',
            key: '8-4',
          },
          {
            path: '/report/community-code-collection',
            name: '社区码收款报表',
            component: './Report/CommunityCodeCollectionList',
            key: '8-5',
          },
          {
            path: '/report/community-code-collection/detail/:id',
            name: '社区码收款报表详情',
            component: './Report/CommunityCodeCollectionDetail',
            hideInMenu: true,
          }
        ]
      },

      {
        path: '/operate',
        name: '运营数据',
        icon: 'api',
        key: '10',
        routes: [
          {
            path: '/operate/reconciliation',
            name: '对账情况',
            component: './Operate/ReconciliationList',
            key: '9-2',
          },
          {
            path: '/operate/reconciliation/detail/:id',
            name: '对账情况详情',
            component: './Operate/ReconciliationDetail',
            hideInMenu: true,
          }
        ]
      },

      {
        component: '404'
      }
    ]
  },
  {
    component: '404'
  }
]
