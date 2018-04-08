/* globals wx:true */
import Ember from 'ember';
import { bsGetJSON, ZBJConfig } from 'dummy/models/utils';

let isInit = false;

export default Ember.Mixin.create({
  suite_id: '',
  wxConfig(data) {
    wx.config({
      debug: ZBJConfig.isDev, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: data.appid, // 必填，公众号的唯一标识
      timestamp: data.timestamp, // 必填，生成签名的时间戳
      nonceStr: data.noncestr, // 必填，生成签名的随机串
      signature: data.signature, // 必填，签名，见附录1
      jsApiList: [ // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        'previewImage',
        'chooseImage',
        'uploadImage',
        'closeWindow',
        'scanQRCode',
        'openEnterpriseChat',
        'startSearchBeacons',
        'stopSearchBeacons',
        'getLocation',
        'onSearchBeacons'
      ]
    });
  },
  initJsapi: async function() {
    if (isInit || ZBJConfig.isDev) {
      return;
    }
    isInit = true;
    let url = location.href.replace(/#.*/, '');
    let suite_id = this.get('suite_id');
    let result = await bsGetJSON('/index/GetJSApiSignature', { url, suite_id });
    this.wxConfig(result.data);
  }.on('init')
});
