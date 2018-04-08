import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  classNames: 'toolbar toolbar-bottom',
  to: 'main-view',
  renderInPlace: true
});
