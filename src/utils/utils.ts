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

  public static MergeObject(objArr: any[]): object {
    return objArr ? Object.assign({}, ...objArr) : {};
  }

  public static GetPageQuery(): string {
    return parse(window.location.href.split('?')[1]);
  }
}

export { Utils };