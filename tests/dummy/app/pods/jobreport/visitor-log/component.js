import Ember from 'ember';
import { observes } from 'ember-computed-decorators';
import { bsGetJSON } from 'dummy/models/utils';

export default Ember.Component.extend({
  classNames: ['page'],
  cached: true,
  dataPage: 'report-visitor',
  attributeBindings: ['dataPage:data-page'],
  classNameBindings: ['cached'],

  page: 1,
  limit: 10,

  async requestVisitors() {
    let report_id = this.get('report_id');
    if (report_id) {
      let page = this.get('page');
      let limit = this.get('limit');
      let result = await bsGetJSON('/report/queryViewLog', { report_id, page, limit });
      if (result.state) {
        this.set('visitors', result.data.list);
        this.set('pagebar', result.data.pagebar);
      }
    }
  },

  @observes('report_id')
  reportIdChanged() {
    this.requestVisitors();
  }
});
