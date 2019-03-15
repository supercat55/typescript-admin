import { parse, stringify } from 'qs';

class Utils {
  public static IsUrl(path: string): boolean {
    const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
    
    return reg.test(path)
  }

  public static IsEmptyObject(obj: object): boolean {
    if (!obj) return;

    let isEmpty = true;

    for (let i in obj) {
      isEmpty = false;
      break;
    }

    return isEmpty;
  }

  public static ObjectToUrl(obj: string): string {
    return Object.keys(obj).map(key => {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
        return key + '=' + encodeURIComponent(obj[key]);
      }
    }).join('&'); 
  }

  public static MergeObject(objArr: any[]): object {
    return objArr ? Object.assign({}, ...objArr) : {};
  }

  public static GetPageQuery(): string {
    return parse(window.location.href.split('?')[1]);
  }

  public static JsonToUrl = (json: { [x: string]: string; }) => {
    if (!json) throw new Error('json对象未定义或为空');
  
    return Object.keys(json).map((key, index) => {
      if (json[key] !== null && json[key] !== undefined && json[key] !== '') {
        return key + '=' + encodeURIComponent(json[key]);
      }
    }).join('&');
  };
}

export { Utils };
