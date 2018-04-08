import Ember from 'ember';
import { on } from 'ember-computed-decorators';
import layout from './template';

export default Ember.Component.extend({
  layout,
  label: '时间',
  placeholder: '',
  showPicker: false,
  itemCls: '',
  mode: 'day',

  actions: {
    async triggerPicker() {
      let picker = this.get('picker');
      let isClosing = $('body').hasClass('picker-modal-closing');
      if (isClosing) {
        return;
      }
      if (picker) {
        picker.openPicker();
        this.set('showPicker', true);
      } else {
        this.set('showPicker', true);
      }
    },
    datePicked(values, mnt) {
      let { onDateSelected } = this.attrs;
      if (onDateSelected) {
        onDateSelected(values, mnt);
      }
    }
  }
});
