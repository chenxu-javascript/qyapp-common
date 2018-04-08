import Ember from 'ember';
import { bsGetJSON, bsWait } from 'dummy/models/utils';
import computed, { equal, observes, on } from 'ember-computed-decorators';
import Report from 'dummy/models/report';

export default Ember.Component.extend({
  // classNames: ['page'],
  // cached: true,
  // dataPage: 'report-list',
  // attributeBindings: ['dataPage:data-page'],
  // classNameBindings: ['cached'],
  tab: 'day',
  showList: true,
  page: 1,
  limit: 10,

  onSelect: Ember.K,

  @equal('tab', 'day') tabIsDay: false,
  @equal('tab', 'weekly') tabIsWeek: false,
  @equal('tab', 'month') tabIsMonth: false,

  @observes('tab')
  async reloadList() {
    this.set('showList', false);
    await bsWait();
    this.set('showList', true);
  },

  @observes('user_id', 'tab')
  userChanged() {
    this.initalLoad();
  },

  @computed('model.report_list.[]', 'model.pagebar.total')
  hasMore(list=[], total=0) {
    return total > list.length;
  },

  async initalLoad() {
    this.set('page', 1);
    let data = await this.requestList();
    this.set('model', data);
  },

  async requestList() {
    let user_id = this.get('user_id');
    let type = this.get('tab');
    let page = this.get('page');
    let limit = this.get('limit');

    if (user_id === undefined || user_id === null || this.get('isLoading')) {
      return;
    }
    this.set('isLoading', true);
    let result = await bsGetJSON('/report/queryReport', { user_id, type, page, limit });
    this.set('isLoading', false);
    result.data.report_list = (result.data.report_list || []).map(r => {
      r.type = type;
      return Report.create(r);
    });
    return result.data;
  },

  @on('didInsertElement')
  domInsert() {
    this.initalLoad();
  },

  actions: {
    async loadMore() {
      this.incrementProperty('page');
      let data = await this.requestList();
      if (data) {
        let data = await this.requestList();
        let list = this.get('model.report_list');
        list.pushObjects(data.report_list);
        this.set('model.pagebar', data.pagebar);
      }
    }
  }
});
