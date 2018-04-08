import Ember from 'ember';
import moment from 'moment';
import { bsWait } from 'dummy/models/utils';
import { showPage4Prop, queryParams } from 'boss-qyapp-common/utils/decorators';
import computed, { on, equal, observes, oneWay } from 'ember-computed-decorators';

export default Ember.Component.extend({
  classNames: 'pages navbar-through toolbar-through',
  defaultDept: { department_id: 1 },
  // report_date: '',
  showDept: true,
  showPicker: false,
  currentMoment: null,
  @oneWay('currentMoment') curMnt: null,

  @computed('currentMoment', 'dateFormat')
  report_date(m, fromat) {
    let tabIsWeek = this.get('tabIsWeek');
    if (tabIsWeek) {
      let f = 'YYYY-MM-DD';
      return [m.startOf('week').format(f), m.endOf('week').format(f)].join('~');
    } else {
      return m.format(fromat);
    }
  },
  @computed('currentMoment', 'dateDisplayFormat')
  report_date_display(m, fromat) {
    return m.format(fromat);
  },

  tab: 'day',
  @equal('tab', 'day') tabIsDay: false,
  @equal('tab', 'weekly') tabIsWeek: false,
  @equal('tab', 'month') tabIsMonth: false,

  @computed('tab')
  dateMode(tab) {
    let mode = 'day';
    if (tab == 'weekly') {
      mode = 'week';
    }
    if (tab == 'month') {
      mode = 'month';
    }
    return mode;
  },

  @computed('tab', 'report_date')
  deptUrl(tab) {
    let report_date = this.get('report_date');
    return `/report/count?report_date=${report_date}&type=${tab}`;
  },
  @computed('tab', 'report_date')
  userUrl(tab) {
    let report_date = this.get('report_date');
    return `/report/queryNotCompletedUser?report_date=${report_date}&type=${tab}`;
  },

  @computed('tab')
  dateFormat(tab) {
    let format = 'YYYY-MM-DD';
    if (tab == 'weekly') {
      format = 'YYYY-W';
    } else if (tab == 'month') {
      format = 'YYYY-MM';
    }
    return format;
  },
  @computed('tab')
  dateDisplayFormat(tab) {
    let format = 'YYYY年MM月DD日';
    if (tab == 'weekly') {
      format = 'YYYY年第W周';
    } else if (tab == 'month') {
      format = 'YYYY年MM月';
    }
    return format;
  },

  @on('init')
  @observes('dateFormat')
  tabChanged() {
    this.set('currentMoment', moment());
    this.set('showPicker', false);
  },

  @queryParams() group_id: null,
  @queryParams() user_id: null,
  @queryParams('visitor') showVisitor: null,

  @showPage4Prop('search-list', 'group_id')
  shouldShow(group_id) {
    return group_id;
  },

  @showPage4Prop('report-detail', 'user_id')
  shouldShow2(user_id) {
    return user_id;
  },

  @observes('report_date')
  async reloadDept() {
    this.set('showDept', false);
    await bsWait(300);
    this.set('showDept', true);
  },

  actions: {
    showDeptReport(dept) {
      this.set('group_id', dept.group_id);
    },
    userSelect(user) {
      this.set('user_id', user.user_id);
    },
    datePicked(date) {
      let m = moment(date.join('-'), this.get('dateFormat'));
      this.set('currentMoment', m);
      this.set('showPicker', false);
    }
  }
});
