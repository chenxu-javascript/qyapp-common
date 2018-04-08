import Ember from 'ember';
import computed, { on } from 'ember-computed-decorators';
import layout from './template';

const { guidFor } = Ember;

export default Ember.Component.extend({
  layout,
  tagName: 'li',
  label: '标题',
  contentCls: '',
  inputCls: '',
  labelCls: '',
  isSmartSelect: false,

  @computed('isSmartSelect')
  openIn(isSmartSelect) {
    return isSmartSelect? 'picker': undefined;
  },

  @computed('isSmartSelect')
  smartCls(isSmartSelect) {
    return isSmartSelect? 'smart-select item-link' : '';
  },

  @computed()
  contentId() {
    let guid = guidFor(this);
    return `z-formitem-content-${guid}`;
  },

  @on('didInsertElement')
  domInsert() {
    let app = window.f7app;
    let isSmartSelect = this.get('isSmartSelect');
    if (app && isSmartSelect) {
      app.initSmartSelects(this.$('.smart-select'));
    }
  },
  actions: {
    showtiped(e) {
      let { onshowtips } = this.attrs;
      onshowtips(e);
      e.stopPropagation();
    }
  }
});
