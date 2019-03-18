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


// identityType
export const SetIdentityType = (identityType: any) => SetSessionStorage('identityType', identityType);
export const GetIdentityType= () => GetSessionStorage('identityType');
export const RemoveIdentityType = () => RemoveSessionStorage('identityType');

// propertyInfo (超级管理员信息)
export const SetPropertyInfo = (propertyInfo: any) => SetSessionStorage('propertyInfo', propertyInfo);
export const GetPropertyInfo= () => GetSessionStorage('propertyInfo');
export const RemovePropertyInfo = () => RemoveSessionStorage('propertyInfo');

// propertyInfo (园区管理员信息)
export const SetGardenInfo = (gardenInfo: any) => SetSessionStorage('gardenInfo', gardenInfo);
export const GetGardenInfo= () => GetSessionStorage('gardenInfo');
export const RemoveGardenInfo = () => RemoveSessionStorage('gardenInfo');

// propertyInfo (企业管理员信息)
export const SetCompanyInfo = (companyInfo: any) => SetSessionStorage('companyInfo', companyInfo);
export const GetCompanyInfo= () => GetSessionStorage('companyInfo');
export const RemoveCompanyInfo = () => RemoveSessionStorage('companyInfo');
