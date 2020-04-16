import React from 'react';
import { Result, Button } from 'antd';
import router from 'umi/router';

export default () => (
  <Result
    status="404"
    title="404"
    subTitle="抱歉，你访问的页面不存在。"
    extra={<Button type="primary" onClick={() => {router.push('/home')}}>返回首页</Button>}
  />
);
