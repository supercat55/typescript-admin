export default [
  {
    path: '/login',
    component: '../layouts/LoginLayout',
    routes: [
      { path: '/login', redirect: '/login/user' },
      { path: '/login/user', component: './Login/UserLogin' },
      { path: '/login/admin', component: './Login/AdminLogin' },
    ]
  }
];