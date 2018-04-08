import Ember from 'ember';
import computed, { on } from 'ember-computed-decorators';
import { bsGetJSON } from 'boss-qyapp-common/models/utils';
import FollowRecord from 'dummy/models/follow-record';

const { set, get } = Ember;

export default Ember.Component.extend({
  page: 1,
  limit: 20,
  async requestData() {
    let page = this.get('page');
    let limit = this.get('limit');
    let customer_id = this.get('customer_id');

    this.set('isloading', true);
    let result = await bsGetJSON('/sell/membership-act-followlist', { page, limit, customer_id });
    this.set('isloading', false);
    if (result.state) {
      result.data.list = result.data.list.map(d => FollowRecord.create(d));
      let lastRecord = null;
      result.data.list.map(record => {
        if (lastRecord) {
          set(record, 'showGroup', get(record, 'groupName') != get(lastRecord, 'groupName'));
        } else {
          set(record, 'showGroup', true);
        }
        lastRecord = record;
      });
      return result.data;
    }
  },

  @computed('model.list.[]', 'model.pagebar.total')
  hasMore(list=[], total=0) {
    return total > list.length;
  },

  @on('didInsertElement')
  async domInsert() {
    let data = await this.requestData();
    this.set('model', data);
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
    }
  }
});
