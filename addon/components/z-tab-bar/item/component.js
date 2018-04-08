import Ember from 'ember';
import { on, observes } from 'ember-computed-decorators';
import TabBar from '../component';
import layout from './template';

// const { run: { debounce } } = Ember;

export default Ember.Component.extend({
  layout,
  tagName: 'a',
  classNames: 'tab-link',
  classNameBindings: ['active'],
  attributeBindings: ['href'],
  activable: true,
  active: false,
  tabBar: null,

  @observes('active')
  activeChanged() {
    let active = this.get('active');
    if (active) {
      this.click();
    }
  },

  click() {
    // debounce(this, this.handleClick, 10);
    if (!this.get('activable')) {
      return;
    }
    let tabBar = this.get('tabBar');
    tabBar.activeItem(this);
    let { onActive } = this.attrs;
    if (onActive) {
      onActive(this, tabBar);
    }
  },

  // handleClick() {
  //
  // },

  @on('didInsertElement')
  domInsert() {
    let tabBar = this.nearestOfType(TabBar);
    this.set('tabBar', tabBar);
    tabBar.addItem(this);
  },

  @on('willDestroyElement')
  domRemove() {
    let tabBar = this.get('tabBar');
    if (tabBar) {
      tabBar.removeItem(this);
    }
  }
});
