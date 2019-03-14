export default {
  plugins: [
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: true,
        dybamicImport: false,
        title: '建行后台',
        dll: false,
        hardSource: false,
        routes: {
          exclude: [],
        }
      }
    ]
  ],
  hash: true,
  publicPath: './',
  history: 'hash',
  proxy: {
    '/api': {
      target: '',
      changeOrigin: true
    }
  }
}