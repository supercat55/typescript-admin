import fetch from 'dva/fetch';
import { notification } from 'antd';
import router from 'umi/router';
import { Utils } from './utils';
// import { SetGlobalToken, GetGlobalToken, RemoveAllStorage } from './cache';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const errortext = codeMessage[response.status] || response.message;
  notification.error({
    message: `请求错误 ${response.status}: ${response.url}`,
    description: errortext,
  });
  const error = new Error(errortext);

  error.name = response.code;
  error.response = response;
  throw error;
};

const checkResult = response => {
  const contentType = response.headers.get('Content-Type');
  if (contentType  && contentType.match(/application\/json/i)) {
    response.clone().json()
      .then(content => {
        const code = Number(content.code);
        if(code !== 200) {
          switch(code) {
          case 103:
            notification.error({
              message: `${code}: ${response.url}`,
              description: content.message,
            });

            // RemoveAllStorage();
            router.push('/login');
            break;
          default:
            notification.error({
              message: `${code}`,
              description: content.message,
            });
            break;
          }
        }
      });
  }
  return response;
};

export default function request(url, option) {
  let _url = '';

  const defaultOptions = {
    credentials: 'include',
  };

  let options = {
    ...option
  };

  const newOptions = { ...defaultOptions, ...options };
  
  switch(newOptions.method) {
  case 'POST':
  case 'PUT':
  case 'DELETE':
    _url = url;
    if (!(newOptions.body instanceof FormData)) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        ...newOptions.headers,
      };
    } else {
      newOptions.headers = {
        Accept: 'application/json',

        ...options.headers,
      };
    }

    newOptions.body = Utils.JsonToUrl(options.body);

    break;
  case 'IMAGE':
    _url = `${url}${!options ? '' : '?' + Utils.ObjectToUrl({ params: JSON.stringify(options.params)})}`;

    newOptions.method = 'GET';
    break;
  default:
    _url = `${url}${Utils.IsEmptyObject(options) ? '' : '?' + Utils.ObjectToUrl(options)}`;
    break;
  }

  return fetch(_url, newOptions)
    .then(checkStatus)
    .then(response => checkResult(response))
    .then(response => {
      if (options.method === 'DELETE' || response.status === 204) {
        return response.text();
      } else if(options.method === 'IMAGE') {
        return response.blob();
      }

      return response.json();
    })
    .catch(e => {
      const status = e.name;
      if (status === 403) {
        router.push('/exception/403');
        return;
      }
      if (status <= 504 && status >= 500) {
        router.push('/exception/500');
        return;
      }
      if (status >= 404 && status < 422) {
        router.push('/exception/404');
      }
    });
}