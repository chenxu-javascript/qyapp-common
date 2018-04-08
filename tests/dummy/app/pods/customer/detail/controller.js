import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['customer_id', 'popup'],
  customer_id: null,
  popup: null
});
