import Ember from 'ember';
import { on, observes } from 'ember-computed-decorators';
import layout from './template';

export default Ember.Component.extend({
  layout,
  forView: false,
  classNames: ['list-block', 'z-form'],
  classNameBindings: ['forView'],

  @on('didInsertElement')
  @observes('forView')
  domInsert() {
    let forView = this.get('forView');
    this.$(':input').each((i, div) => {
      div = $(div);
      if (forView) {
        let placeHolder = div.data('placeholder') || div.attr('placeholder');
        let readonly = div.data('readonly') || div.attr('readonly') || null;
        div.data('placeholder', placeHolder)
            .data('readonly', readonly)
            .prop('readonly', 'readonly').attr('placeholder', ' ');
      } else {
        let placeHolder = div.data('placeholder') || div.attr('placeholder');
        let readonly = div.data('readonly');
        div.prop('readonly', readonly).attr('placeholder', placeHolder);
      }
    });
  }
});
