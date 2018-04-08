import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  classNames: ['button', 'button-big', 'z-row-btn'],
  classNameBindings: ['active'],
  tagName: 'a',
  active: false
});
