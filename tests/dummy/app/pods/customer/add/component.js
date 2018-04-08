/* eslint no-unused-vars:[0]*/
import Ember from 'ember';
import { bsGetJSON, bsTip, bsBack, bsSetTitle } from 'boss-qyapp-common/models/utils';
import { queryParams } from 'boss-qyapp-common/utils/decorators';
import { on, observes } from 'ember-computed-decorators';

export default Ember.Component.extend({
  customerName: '',
  contactName: '',
  contactPhone: '',
  consultant: '',
  tip: '',
  fillAll: false,
  step: 1,
  createParams: '',
  isView: false,

  @queryParams() customer_id: null,

  @on('init')
  @observes('customer_id')
  async setup() {
    this.set('step', 1);
    this.set('isView', false);
    let customer_id = this.get('customer_id');
    if (customer_id) {
      bsSetTitle('客户详情');
      this.set('step', 3);
      this.set('isView', true);
      this.set('isloading', true);
      let detail = await this.requestDetail();
      let createParams = this.get('model.createParams');
      let products = this.get('model.products');
      this.set('model', detail);
      this.set('model.createParams', createParams);
      this.set('model.products', products);
      this.set('isloading', false);
    } else {
      bsSetTitle('新增客户');
    }
  },

  async requestDetail() {
    let customer_id = this.get('customer_id');
    let result = await bsGetJSON('/sell/membership-act-getDetail', { customer_id });
    if (result) {
      return result.data;
    }
  },

  actions: {
    edit() {
      this.set('isView', false);
    },
    async submit() {
      let data = {
        customer_name: this.get('model.customer_name'),
        contact: this.get('model.contact'),
        phone: this.get('model.phone')
      };
      await bsGetJSON('/sell/membership-act-check', data, 'POST').then(r => {
        if (r.state) {
          this.set('consultant', r.data.consultant);
          if (r.data.consultant) {
            return bsTip(`客户已被绑定，销售顾问：${r.data.consultant}`);
          }
          this.set('step', 2);
          this.set('tip', '恭喜，该客户暂无销售顾问跟进，你可以继续新增客户了！');
        }
      });
    },
    next() {
      this.set('fillAll', true);
      this.set('tip', '');
      this.set('step', 3);

    },
    goback() {
      this.set('step', 1);
    },

    cancel() {
      bsBack();
    },
    async save() {
      let model = this.get('model');
      let { createParams, products, ...params } = model;
      let result = await bsGetJSON('/sell/membership-act-create', params, 'post');
      if (result.state) {
        await bsTip('保存成功');
        bsBack();
      }
    },
    openProductPicker() {
      let containerId = this.get('productsPicker.containerId');
      window.f7app.pickerModal(`#${containerId}`);
    },
    onComplete() {
      let containerId = this.get('productsPicker.containerId');
      window.f7app.closeModal(`#${containerId}`);
    },
    cityPicked(displayValues, values) {
      this.set('cityDisplayValues', displayValues.join(' '));
      this.set('model.province_id', values[0]);
      this.set('model.city_id', values[1]);
    },
    categoryPicked(displayValues, values) {
      this.set('categoryDisplayValues', displayValues.join(' '));
      this.set('model.category1_id', values[0]);
      this.set('model.category2_id', values[1]);
      this.set('model.category_id', values[2]);
    },
    onSelect(result) {
      $('.product-id').val(result.name + ' / ' + result.amount);
      this.set('model.product_id', result.id);
    }
  }

});
