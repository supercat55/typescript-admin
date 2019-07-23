import pageRoutes from './router.config';

export default {
  plugins: [
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: true,
        dynamicImport: false,
        title: 'ts-demo',
        dll: false,
        hardSource: false,
        routes: {
          exclude: [],
        }
      }
    ]
  ],
  routes: pageRoutes,
  hash: true,
  publicPath: './',
  // history: 'hash',
  proxy: {
    '/pms': {
      target: 'http://xxx.xxx.com',
      changeOrigin: true
    }
  }
};
