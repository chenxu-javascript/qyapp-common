import Ember from 'ember';
import { on } from 'ember-computed-decorators';
import { bsCheck } from 'boss-qyapp-common/models/utils';
import layout from './template';

export default Ember.Component.extend({
  layout,
  classNames: ['swiper-container'],
  showPagination: true,

  @on('didInsertElement')
  async domInsert() {
    await bsCheck(() => window.f7app);
    let f7app = window.f7app;
    let swiper = f7app.swiper('.swiper-container', {
      pagination: '.swiper-pagination'
    });
    this.set('swiper', swiper);
  }
});
