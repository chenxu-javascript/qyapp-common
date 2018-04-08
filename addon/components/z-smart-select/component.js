import Ember from 'ember';
import layout from './template';
import { debounce } from 'ember-run-decorators';

export default Ember.Component.extend({
  layout,
  tagName: 'a',
  show: false,
  classNames: ['item-link', 'smart-select'],
  attributeBindings: [
    'href',
    'dataPageTitle:data-page-title',
    'dataBackText:data-back-text',
    'dataOpenIn:data-open-in',
    'dataPickercls:data-pickercls',
    'dataBackOnSelect:data-back-on-select',
    'dataPickerHeight:data-picker-height'
  ],
  dataPickercls: 'no-bottom-bar',
  dataPageTitle: '选择',
  dataBackText: '返回',
  dataOpenIn: 'picker',
  dataBackOnSelect: 'true',
  dataPickerHeight: '8rem',

  click() {
    this.set('modalshow', true);
    this.initPopup();
  },

  @debounce(300)
  initPopup() {
    let dataOpenIn = this.get('dataOpenIn');
    let $popup = $(`.smart-select-${dataOpenIn}`);
    $popup.on('close', () => {
      Ember.run.later(() => {
        if (this.get('modalshow')) {
          history.back();
        }
      });
    });
  }
});
