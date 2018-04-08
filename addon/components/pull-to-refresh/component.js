import Ember from 'ember';
import { on } from 'ember-computed-decorators';
import layout from './template';

export default Ember.Component.extend({
  layout,
  action: 'pulltofresh',
  classNames: ['pull-to-refresh-layer'],

  @on('didInsertElement')
  async domInserted() {
    var ptrContent = this.$().closest('.pull-to-refresh-content');
    ptrContent.on('refresh', () => {
      this.sendAction();
    });
  },

  @on('willDestroyElement')
  domDestroy() {
    if (window.f7app) {
      var ptrContent = this.$().closest('.pull-to-refresh-content');
      window.f7app.destroyPullToRefresh(ptrContent);
    }
  }
});
