import Ember from 'ember';
import moment from 'moment';

export default Ember.Controller.extend({
  queryParams: ['type', 'ttype', 'report_id', 'visitors', 'create', 'detail', 'create2', 'report_date'],
  type: null,
  report_id: null,
  create: null,
  create2: null,
  detail: null,
  report_date: moment().format('YYYY-MM-DD')
});
