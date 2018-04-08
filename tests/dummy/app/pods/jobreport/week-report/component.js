import Ember from 'ember';
import moment from 'moment';
import computed, { alias, observes, on } from 'ember-computed-decorators';
import { bsGetJSON } from 'dummy/models/utils';

const weeks = function(month) {
  month = moment(month, 'YYYY-MM');

  var first = month.day() == 0 ? 6 : month.day() - 1;
  var day = 7 - first;

  var last = month.daysInMonth();
  var count = (last - day) / 7;

  var weeks = [];
  weeks.push([(1), (day)]);
  for (var i = 0; i < count; i++) {
    weeks.push([(day + 1), (Math.min(day += 7, last))]);
  }
  return weeks;
};
export default Ember.Component.extend({
  curMoment: moment(),
  completedWeeks: [],

  @computed('curMoment', '_date')
  date(curMoment, date) {
    if (date) {
      return moment(date, 'YYYY-MM').format('YYYY年MM月');
    }
    return curMoment.format('YYYY年MM月');
  },

  async requestReport(report_date) {
    let type = 'weekly';
    let user_id = 10;
    let result = await bsGetJSON('/report/detail', { user_id, type, report_date });
    if (result.state) {
      return result.data;
    }
  },

  @computed('date')
  weeks(date) {
    let ws = weeks(date);
    let ws2 = ws.map(w => {
      let start = moment(date, 'YYYY-MM').date(w[0]).startOf('week');
      let end = moment(date, 'YYYY-MM').date(w[1]).endOf('week');
      let isSelfWeek = moment().isSame(start, 'week');
      return {
        start_full: start.format('YYYY-MM-DD'),
        end_full: end.format('YYYY-MM-DD'),
        start: start.format('MM-DD'),
        end: end.format('MM-DD'),
        weekNum: isSelfWeek? '本周' : start.format('第W周'),
        type: 'weekly',
        report_date_display: `${start.format('YYYY年第W周')}`,
        report_date: `${start.format('YYYY-MM-DD')}~${end.format('YYYY-MM-DD')}`
      };
    });
    return ws2;
  },

  @alias('weeks.firstObject.start_full') min_date: null,
  @alias('weeks.lastObject.end_full') max_date: null,

  @on('didInsertElement')
  @observes('date')
  async domInsert() {
    let min_date = this.get('min_date');
    let max_date = this.get('max_date');
    let result = await bsGetJSON(`/report/queryOverview?min_date=${min_date}&max_date=${max_date}&type=weekly`);
    this.set('completedWeeks', result.data || []);
  },

  actions: {
    prevMonth() {
      let curMoment = this.get('curMoment');
      curMoment.subtract(1, 'months');
      this.set('_date', curMoment.format('YYYY-MM'));
    },
    nextMonth() {
      let curMoment = this.get('curMoment');
      curMoment.add(1, 'months');
      this.set('_date', curMoment.format('YYYY-MM'));
    }
  }
});
