import Ember from 'ember';
import moment from 'moment';
import computed, { on, observes } from 'ember-computed-decorators';
import { bsGetJSON } from 'dummy/models/utils';
import Report from 'dummy/models/report';

const { setProperties } = Ember;

const chunk = function(arr, chunkSize) {
  var groups = [], i;
  for (i = 0; i < arr.length; i += chunkSize) {
    groups.push(arr.slice(i, i + chunkSize));
  }
  return groups;
};

export default Ember.Component.extend({
  year: moment().format('YYYY'),
  completedMonths: [],

  months: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],

  async requestReport(report_date) {
    let type = 'month';
    let user_id = 10;
    let result = await bsGetJSON('/report/detail', { user_id, type, report_date });
    if (result.state) {
      let report = this.get('defaultReport');
      report.plan_report_date = report_date;
      report.summary_report_date = report_date;
      if (result.data) {
        setProperties(report, result.data);
        return report;
      }
      return report;
    }
  },

  @computed()
  defaultReport() {
    return {
      type: 'month',
      plan_report_id: '',
      plan: '',
      plan_report_date: '',
      summary_report_id: '',
      summary: '',
      summary_report_date: ''
    };
  },

  @computed('months', 'year')
  monthData(months, year) {
    months = months.map(month => (Report.create({
      type: 'month',
      report_date: [year, month].join('-'),
      month
    })));
    return chunk(months, 3);
  },

  @on('didInsertElement')
  @observes('year')
  async domInsert() {
    let year = this.get('year');
    let result = await bsGetJSON(`/report/queryOverview?min_date=${year}-01&max_date=${year}-12&type=month`);
    this.set('completedMonths', result.data || []);
  },

  actions: {
    nextYear() {
      this.set('year', this.get('year')*1+1);
    },
    prevYear() {
      this.set('year', this.get('year')*1-1);
    }
  }
});
