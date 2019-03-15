import pageRoutes from './router.config';

export default {
  plugins: [
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: true,
        dynamicImport: false,
        title: '建行后台',
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
    '/api': {
      target: '',
      changeOrigin: true
    }
  }
};