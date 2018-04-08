import Ember from 'ember';
import { observes } from 'ember-computed-decorators';
import { bsGetJSON, bsTip } from 'dummy/models/utils';

const { setProperties } = Ember;

export default Ember.Component.extend({

  async requestDetail(params) {
    let result = await bsGetJSON('/report/detail', params);
    return result.data;
  },

  @observes('report.nextReportDate')
  async nextDateChanged() {
    let type = this.get('report.type');
    let report_date = this.get('report.nextReportDate');
    let nextReport = await this.requestDetail({ type, report_date });
    this.set('nextReport', nextReport);
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
        plan_report_id: this.get('nextReport.report_id'),
        plan: this.get('nextReport.plan'),
        plan_report_date: this.get('report.nextReportDate'),

        summary_report_date: report.summary_report_date || report.report_date,
        summary_report_id: this.get('report.report_id')
      });

      let result = await bsGetJSON('/report/create', report, 'post');
      if (result.state) {
        // setProperties(report, result.data);
        await bsTip('保存成功');
        let { onSaved } = this.attrs;
        if (onSaved) {
          onSaved(result.data);
        }
      }
    }
  }
});
