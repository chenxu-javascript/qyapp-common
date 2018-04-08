import Ember from 'ember';
import { bsPromise } from 'boss-qyapp-common/models/utils';
import layout from './template';

export default Ember.Component.extend({
  layout,
  classNames: 'toolbar h44',
  text: '返 回',
  actions: {
    async back() {
      if (this.attrs.onBack) {
        this.attrs.onBack();
      } else {
        let oldHref = location.href;
        window.history.back();
        await bsPromise(null, 100); // 等待100ms
        let href = location.href;
        if (href == oldHref) {
          wx.closeWindow();
        }
      }
    }
  }
});
