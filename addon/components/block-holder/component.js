import Ember from 'ember';
import computed from 'ember-computed-decorators';
import layout from './template';

export default Ember.Component.extend({
  layout,
  height: null,
  width: null,
  classNames: ['minh100', 'all-center-parent', 'w100p'],
  attributeBindings: ['style'],
  text: '',

  @computed('width', 'height')
  style(width, height) {
    let style = '';
    if (width) {
      style += `width:${width};`;
    }
    if (height) {
      style += `height:${height};`;
    }
    return style;
  }
});
