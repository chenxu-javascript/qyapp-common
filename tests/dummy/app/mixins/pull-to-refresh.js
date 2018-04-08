import Ember from 'ember';
import { bsPromise } from 'dummy/models/utils';
export default Ember.Mixin.create({
  handlePullToRefresh() {
    return bsPromise();
  },
  actions: {
    pulltofresh() {
      var f7app = window.f7app;
      this.handlePullToRefresh().then(function() {
        f7app.pullToRefreshDone();
      });
    }
  }
});
