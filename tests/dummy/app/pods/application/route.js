import Ember from 'ember';
import moment from 'moment';
import { bsGetToken } from 'boss-qyapp-common/models/utils';

export default Ember.Route.extend({
  beforeModel() {
    moment.locale('zh-cn');
  },
  async model() {
    await bsGetToken();
    return {};
  },
  afterModel() {
    $('body>.preload').remove();
    // this.router.transitionTo('customer.list');
  }
});
