import Ember from 'ember';
import computed, { on } from 'ember-computed-decorators';
import { bsGetJSON, bsBack } from 'boss-qyapp-common/models/utils';

export default Ember.Component.extend({
  page: 1,
  limit: 20,

  @computed('currentContact')
  isView(currentContact) {
    return !!currentContact;
  },
  @computed('currentContact')
  formModal(currentContact) {
    return currentContact || {};
  },
  async requestData() {
    let page = this.get('page');
    let limit = this.get('limit');
    let customer_id = this.get('customer_id');

    this.set('isloading', true);
    let result = await bsGetJSON('/sell/membership-act-getCustomerContactList', { page, limit, customer_id });
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
    this.initialLoad();
  },
  async initialLoad() {
    this.set('page', 1);
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
    },
    addContact() {
      this.set('currentContact', null);
      this.set('isView', false);
      this.set('popup', '#customer-add-popup');
    },
    onContactSaved() {
      // this.set('popup', null);
      bsBack();
      this.initialLoad();
    },
    showContactDetail(contact) {
      this.set('currentContact', contact);
      this.set('popup', '#customer-add-popup');
    }
  }
});
