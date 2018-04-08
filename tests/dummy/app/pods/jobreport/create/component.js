import Ember from 'ember';
import { showPage4Prop, queryParams } from 'boss-qyapp-common/utils/decorators';
import { bsGetJSON, bsWait } from 'dummy/models/utils';
import Report from 'dummy/models/report';
import computed, { on } from 'ember-computed-decorators';

const { setProperties } = Ember;

export default Ember.Component.extend({
  classNames: 'pages navbar-through toolbar-through',
  detailComp: null,
  showList: true,

  @queryParams() type: null,
  @queryParams() ttype: null,
  @queryParams() report_id: null,
  @queryParams() create: null,
  @queryParams() create2: null,
  @queryParams() detail: null,
  @queryParams() report_date: null,
  @queryParams('visitors') showVisitor: null,

  @on('didInsertElement')
  async domInsert() {
    if (window.f7app) {
      window.f7app.refreshApp();
    }
    let type = this.get('type');
    if (type == 'day') {
      let report_date = this.get('report_date');
      this.send('editReport', { report_date, type: 'day', ttype: 'day' });
    }
  },

  @computed('type')
  dataPage(type) {
    return type == 'day'? 'notindex': 'index';
  },
  @computed('type')
  dataCache(type) {
    return type == 'day'? 'cached': '';
  },

  @showPage4Prop('editor-report', 'create')
  showShowEditor(create) {
    return create;
  },
  @showPage4Prop('editor-report-next', 'create2')
  showShowEditorNext(create2) {
    return create2;
  },

  @showPage4Prop('report-detail', 'detail')
  showShowDetail(detail) {
    return detail;
  },

  async requestReport(data) {
    let result = await bsGetJSON('/report/detail', data);
    setProperties(result.data, data);
    return Report.create(result.data);
  },

  reloadDetail() {
    let detailComp = this.get('detailComp');
    if (detailComp) {
      detailComp.reload();
    }
  },

  async reloadList() {
    this.set('showList', false);
    await bsWait();
    this.set('showList', true);
  },

  actions: {
    async editReport(data) {
      let report = await this.requestReport(data);
      if (data.report_date) {
        this.set('report_date', data.report_date);
      }
      this.set('report_id', report.report_id || '');
      this.set('report', report);
      this.set('ttype', data.ttype);
      if (report.plan || report.summary) {
        this.set('detail', 1);
        this.set('create', null);
      } else {
        this.set('detail', null);
        this.set('create', 1);
      }
    },
    async saved() {
      if (this.get('type') == 'day' && !this.get('detail')) {
        this.set('detail', 1);
      } else {
        this.reloadDetail();
        this.reloadList();
        window.history.back();
      }
    },
    async cancel() {
      let oldHref = location.href;
      window.history.back();
      await bsWait(100);
      let href = location.href;
      if (href == oldHref) {
        wx.closeWindow();
      }
    },
    saved2() {
      this.reloadList();
      this.reloadDetail();
      window.history.back();
    },
    cancel2() {
      window.history.back();
    }
  }
});
