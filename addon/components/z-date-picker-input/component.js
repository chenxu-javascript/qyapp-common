import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  tagName: '',
  placeholder: '',
  inputCls: '',
  showPicker: false,

  init() {
    this._super(...arguments);
  },

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
