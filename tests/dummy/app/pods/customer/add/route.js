import Ember from 'ember';
import { bsGetJSON } from 'boss-qyapp-common/models/utils';

export default Ember.Route.extend({
  requestParams() {
    return bsGetJSON('/sell/membership-act-getcreateparams').then(r => {
      if (r.state) {
        return r.data;
      }
    });
  },

  requestProducts() {
    return bsGetJSON('/sell/membership-act-getProduct').then(r => {
      if (r.state) {
        return r.data;
      }
    });
  },
  model() {
    return Ember.RSVP.hash({
      createParams: this.requestParams(),
      products: this.requestProducts()
    });
  }
});
