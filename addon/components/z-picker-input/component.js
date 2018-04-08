import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  tagName: '',
  placeholder: '',
  inputCls: '',
  showPicker: false,
  getAddrUrl: '/unit/getaddress',
  pickerName: 'z-city-picker',

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
    picked(displayValues) {
      this.set('value', displayValues.join(' '));
      let { onConfirm } = this.attrs;
      if (onConfirm) {
        onConfirm(...arguments);
      }
    }
  }
});
