import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    ttype: {
      replace: true
    }
  },
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.setProperties({
        report_id: null,
        create: null,
        create2: null,
        detail: null,
        report: null
      });
    }
  }
});
