import { IConfig } from 'umi-types';
import pageRoutes from './router.config';

const { APP_ENV } = process.env;

// ref: https://umijs.org/config/
const config: IConfig =  {
  treeShaking: true,
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: true,
      dynamicImport: { webpackChunkName: true },
      title: 'new-wanjia-backend',
      dll: false,
      
      routes: {
        exclude: [
          /models\//,
          /services\//,
          /model\.(t|j)sx?$/,
          /service\.(t|j)sx?$/,
          /components\//,
        ],
      },
    }],
    [ 'umi-plugin-cache-route', {} ]
  ],
  routes: pageRoutes,
  ignoreMomentLocale: true,
  hash: true,
  define: { 'process.env.APP_ENV': APP_ENV },
  publicPath: './',
  history: 'hash',
  // theme: {
  //   'disabled-color': '#000'
  // },
  proxy: {
    '/api': {
      target: 'https://b.pmssaas.com',
      // target: 'http://192.168.20.114:8080',
      changeOrigin: true,
    },
  },
}

export default config;
