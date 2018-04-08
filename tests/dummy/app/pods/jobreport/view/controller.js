import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['user_id', 'report_id', 'visitor', 'ttype'],
  user_id: null
});
