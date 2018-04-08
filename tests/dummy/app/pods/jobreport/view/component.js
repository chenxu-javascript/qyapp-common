import Ember from 'ember';
import { on, observes } from 'ember-computed-decorators';
import { showPage4Prop, queryParams } from 'boss-qyapp-common/utils/decorators';

export default Ember.Component.extend({
  classNames: 'pages navbar-through toolbar-through',
  group_id: 1,
  type: 'day',

  @queryParams() ttype: null,
  @queryParams() user_id: null,
  @queryParams() report_id: null,
  @queryParams('visitor') showVisitor: null,

  @showPage4Prop('report-detail', 'report_id')
  showShowReport(report_id) {
    return report_id;
  },
  @showPage4Prop('report-list', 'user_id')
  showShowReportList(user_id) {
    return user_id !== null;
  },

  @observes('ttype')
  ttypeChanged() {
    let ttype = this.get('ttype');
    if (ttype) {
      this.set('type', ttype);
    }
  },

  @on('didInsertElement')
  async domImsert() {
    if (window.f7app) {
      window.f7app.refreshApp();
    }
  },

  actions: {
    showReport(report={}) {
      this.set('report_id', report.report_id);
    },
    userSelect(user) {
      this.set('user_id', user.user_id);
    }
  }

});
