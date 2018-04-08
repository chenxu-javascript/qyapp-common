import Ember from 'ember';
import { observes, on } from 'ember-computed-decorators';
import { debounce } from 'ember-run-decorators';
import { queryParams } from 'boss-qyapp-common/utils/decorators';
import { bsGetJSON, bsSetTitle } from 'boss-qyapp-common/models/utils';

const { set, String: { w } } = Ember;

export default Ember.Component.extend({
  tab: 2,
  page: 1,
  limit: 20,
  keyword: '',

  @queryParams() highsea: false,

  @observes('highsea')
  highseaChanged() {
    let highsea = this.get('highsea');
    this.set('tab', highsea? '6': '2');
  },

  @on('init')
  @observes('tab')
  async requestData() {
    bsSetTitle('客户列表');
    this.set('page', 1);
    this.set('sort', '');
    this.set('filterData', {});
    this.set('keyword', '');
    this.set('list', []);
    this.set('pagebar', {});
    this.set('isloading', true);
    this.requestList();

    let stage = this.get('tab');
    let result = await bsGetJSON('/sell/membership-act-queryListParams', { stage });
    if (result.state) {
      this.set('queryVars', result.data);
    }
  },

  @observes('sort', 'filterData')
  observesFunc() {
    this.requestList();
  },

  @debounce(100)
  async requestList() {
    let params = this.getProperties(w('page limit keyword tab sort'));
    let filterData = this.get('filterData');
    params.stage = params.tab;
    for (let name in filterData) {
      if (filterData.hasOwnProperty(name)) {
        params[name] = filterData[name];
      }
    }
    this.set('isloading', true);
    let result = await bsGetJSON('/sell/membership-act-queryList', params);
    this.set('isloading', false);
    if (result.state) {
      this.set('list', result.data.list);
      this.set('pagebar', result.data.pagebar);
    }
  },

  actions: {
    toggleFilter(data) {
      set(data, 'active', !data.active);
    },
    applyFilter() {
      let filters = this.get('queryVars.filters');
      let filterData = {};
      filters.map(f => {
        filterData[f.key] = f.data.filterBy('active', true).map(f => f.id).join();
      });
      this.set('filterData', filterData);
    },
    showDetail(customer) {
      let { customer_id } = customer;
      this.router.transitionTo('customer.detail', { queryParams: { customer_id }});
    },
    async claim(customer) {
      let { customer_id, customer_name } = customer;
      let self = this;

      let result = await bsGetJSON('/sell/membership-act-claim', { customer_id }, 'post');
      if (result.state) {
        window.f7app.modal({
          title: '',
          text: `恭喜！你成功领取到客户 ${customer_name}`,
          buttons: [{
            text: '继续领取',
            onClick() {
              self.requestData();
            }
          }, {
            text: '查看详情',
            onClick() {
              self.router.transitionTo('customer.detail', { queryParams: { customer_id }});
            }
          }]
        });
      }

    }
  }
});
