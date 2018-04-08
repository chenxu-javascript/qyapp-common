import Ember from 'ember';
import { bsGetJSON, bsTip } from 'dummy/models/utils';
import Report from 'dummy/models/report';
import { on } from 'ember-computed-decorators';

const { setProperties } = Ember;

export default Ember.Component.extend({
  async requestReport(data) {
    if (data.type == 'week') {
      data.type = 'weekly';
    }
    let result = await bsGetJSON('/report/detail', data);
    setProperties(result.data, data);
    return Report.create(result.data);
  },

  @on('didInsertElement')
  async domInsert() {
    let report = this.get('report');
    if (!report) {
      let type = this.get('type');
      let report_date = this.get('report_date');
      report = await this.requestReport({ type, report_date });
      this.set('report_id', report.report_id || null);
      this.set('report', report);
    }
  },
  actions: {
    cancel() {
      // this.set('report_id', null);
      let { onCancel } = this.attrs;
      if (onCancel) {
        onCancel();
      }
    },
    async save() {
      let report = this.get('report');

      setProperties(report, {
        plan_report_id: this.get('report.report_id'),
        plan_report_date: report.report_date || report.plan_report_date,
        summary_report_date: report.summary_report_date || report.report_date,
        summary_report_id: this.get('report.report_id')
      });

      let result = await bsGetJSON('/report/create', report, 'post');
      if (result.state) {
        result.data.report_id = result.data.report_id || result.data.plan_report_id || result.data.summary_report_id;
        setProperties(report, result.data);
        await bsTip('保存成功');
        let { onSaved } = this.attrs;
        if (onSaved) {
          onSaved(result.data);
        }
      }
    },
    toReportList(ttype) {
      this.router.transitionTo('jobreport.view', { queryParams: { user_id: '', ttype }});
    }
  }
});
