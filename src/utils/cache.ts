import { SetSessionStorage, GetSessionStorage, RemoveSessionStorage, RemoveAllSessionStorage } from './storage/session';
import { SetLocalStorage, GetLocalStorage, RemoveLocalStorage, RemoveAllLocalStorage } from './storage/local';

// token
export const SetGlobalToken = (token: string) => SetSessionStorage('globalToken', token);
export const GetGlobalToken= () => GetSessionStorage('globalToken');
export const RemoveGlobalToken = () => RemoveSessionStorage('globalToken');


// userInfo
export const SetAccountInfo = (info: any) => SetLocalStorage('accountInfo', info);
export const GetAccountInfo= () => GetLocalStorage('accountInfo');
export const RemoveAccountInfo = () => RemoveLocalStorage('accountInfo');
