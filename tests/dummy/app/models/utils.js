import {
  default as Util,
  ZBJConfig,
  bsPromise,
  bsWait,
  bsConfirm,
  bsBack,
  bsTip,
  bsToast,
  bsGetJSON,
  bsCheck,
  bsRunWhen,
  bsElementIsScrolledIntoView,
  bsLoad,
  bsGetToken,
  bsSetTitle,
  bsSetupRem
} from 'boss-qyapp-common/models/utils';

if (ZBJConfig.isDev) {
  ZBJConfig.API_HOST = 'http://app.qy.dev.zbjdev.com';
}

export  {
  ZBJConfig,
  bsPromise,
  bsWait,
  bsConfirm,
  bsBack,
  bsTip,
  bsToast,
  bsGetJSON,
  bsCheck,
  bsRunWhen,
  bsElementIsScrolledIntoView,
  bsLoad,
  bsGetToken,
  bsSetTitle,
  bsSetupRem
};

export default Util;
