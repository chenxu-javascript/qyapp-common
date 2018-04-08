import Ember from 'ember';
import computed, { on, observes } from 'ember-computed-decorators';
import { bsGetJSON, bsSetTitle } from 'boss-qyapp-common/models/utils';

export default Ember.Component.extend({
  page: 1,
  limit: 20,
  keyword: '',

  async requestData() {
    let page = this.get('page');
    let limit = this.get('limit');
    let keyword = this.get('keyword');

    this.set('isloading', true);
    let result = await bsGetJSON('/sell/membership-act-queryList', { page, limit, keyword });
    this.set('isloading', false);
    if (result.state) {
      return result.data;
    }
  },

  @computed('model.list.[]', 'model.pagebar.total')
  hasMore(list=[], total=0) {
    return total > list.length;
  },

  @on('didInsertElement')
  domInsert() {
    bsSetTitle('搜索客户');
    this.initialLoad();
  },
  async initialLoad() {
    this.set('page', 1);
    this.set('model.list', []);
    this.set('model.pagebar', {});
    let data = await this.requestData();
    this.set('model.list', data.list);
    this.set('model.pagebar', data.pagebar);
  },

  @observes('keyword')
  async doSearch() {
    this.initialLoad();
  },

  actions: {
    async loadMore() {
      this.incrementProperty('page');
      let data = await this.requestData();
      if (data) {
        let list = this.get('model.list');
        list.pushObjects(data.list);
        this.set('model.pagebar', data.pagebar);
      }
    },
    showDetail(customer) {
      let { customer_id } = customer;
      this.router.transitionTo('customer.detail', { queryParams: { customer_id }});
    },
    search() {
      this.set('keyword', this.get('model.keyword'));
    }
  }
});
