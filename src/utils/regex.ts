export default {
  MOBILE: /^(13|14|15|16|17|18|19)\d{9}$/,
  EMAIL: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
  PASSWORD: /^[a-zA-Z\d_]{6,20}$/,
  VCODE: /^\d{4,6}$/,
  PHOTO_TYPES: /(gif|jpe?g|png|GIF|JPG|PNG)$/,
  FILE_TYPES: /(xls|xlsx)$/,
  SPECIAL_SYMBOL: /^[A-Za-z0-9\u4e00-\u9fa5]+$/,
  LETTER_AND_NUM: /^[A-Za-z0-9]+$/,
  POSITIVE_FLOAT: /^[0-9]+.?[0-9]*$/,
  POSITIVE_INGETER: /^([1-9]\d*|[0]{1,1})$/,
  IDENTITY_CARD: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
  NAME: /^[\u4e00-\u9fa5]{2,4}$/,
};
