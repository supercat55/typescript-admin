export default [
  {
    path: '/login',
    component: '../layouts/LoginLayout',
    routes: [
      { path: '/login', redirect: '/login/user' },
      { path: '/login/user', component: './Login/UserLogin' },
      { path: '/login/admin', component: './Login/AdminLogin' },
    ]
  },
  {
    path: '/garden',
    component: '../layouts/BlankLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      { path: '/garden', redirect: '/garden/list' },
      { path: '/garden/list', component: './Garden/List' },
    ]
  },
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      { path: '/', redirect: '/app/overview' },
      { path: '/app/overview', component: './Home/Overview' },
      { path: '/property', redirect: '/property/list' },
      { path: '/property/list', component: './Property/List' },
    ]
  },
];