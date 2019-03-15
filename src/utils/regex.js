export default {
  MOBILE: /^(13|14|15|16|17|18|19)\d{9}$/,
  EMAIL: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
  PASSWORD: /^[a-zA-Z\d_]{6,20}$/,
  CAPTCHA: /^[a-zA-Z\d_]{4}$/,
  VCODE: /^\d{4}$/,
  PHOTO_TYPES: /(gif|jpe?g|png|GIF|JPG|PNG)$/,
  CREDIT_NUM: /^[0-9A-Z]{18}$/,
  HOUSE_ONLY_NO: /^[a-zA-Z\d_/\\-]{1,20}$/,
  POSITIVE_INGETER: /^([1-9]\d*|[0]{1,1})$/,
  POSITIVE_FLOAT: /^[0-9]+.?[0-9]*$/,
};
