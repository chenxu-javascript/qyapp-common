import Ember from 'ember';
import computed from 'ember-computed-decorators';
import moment from 'moment';

export default Ember.Object.extend({
  @computed('type')
  dateFormat(type) {
    let map = {
      day: 'YYYY-MM-DD',
      weekly: 'YYYY-MM-DD',
      month: 'YYYY-MM'
    };
    return map[type];
  },

  @computed('type')
  titleFormat(type) {
    let map = {
      day: 'YYYY年MM月DD日',
      weekly: 'YYYY年第W周',
      month: 'YYYY年MM月'
    };
    return map[type];
  },

  @computed('dateFormat', 'titleFormat', 'report_date')
  reportDateTitle(dateFormat, titleFormat, report_date) {
    report_date = report_date.replace(/~.*/, '');
    return moment(report_date, dateFormat).format(titleFormat);
  },

  @computed('type', 'reportDateTitle', 'titleFormat')
  nextDateTitle(type, reportDateTitle, titleFormat) {
    return moment(reportDateTitle, titleFormat).add(1, type.replace(/ly$/, '')).format(titleFormat);
  },

  @computed('dateFormat', 'report_date')
  nextReportDate(dateFormat, report_date) {
    let type = this.get('type');
    let m = moment(report_date, dateFormat).add(1, type.replace(/ly$/, ''));
    if (type == 'weekly') {
      return `${m.format(dateFormat)}~${m.add(7, 'day').format(dateFormat)}`;
    } else {
      return m.format(dateFormat);
    }
  }
});
