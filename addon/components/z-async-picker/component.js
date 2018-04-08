import Ember from 'ember';
import moment from 'moment';
import computed, { on, observes } from 'ember-computed-decorators';
import { debounce } from 'ember-run-decorators';
import { bsCheck, bsWait, bsGetJSON } from 'boss-qyapp-common/models/utils';
import layout from './template';

const { String: { w } } = Ember;
const COL_WIDTH = 200;

export default Ember.Component.extend({
  layout,
  mode: 'level1',
  url: '/unit/getaddress',
  displayValues: '',

  @debounce(100)
  async data1Changed(picker, pid) {
    let self = this;
    let mode = self.get('mode');

    this.set('data3', { values: [''], displayValues: [''], width: COL_WIDTH });

    if (self && pid && mode !== 'level1') {
      let data = await self.requestAsyncData(pid);
      self.set('data2', data);
      self.get('picker').updateValue();
    }
  },
  @debounce(100)
  async data2Changed(picker, pid) {
    let self = this;
    let mode = self.get('mode');
    if (self && pid && mode == 'level3') {
      let data3 = await self.requestAsyncData(pid);
      self.set('data3', data3);
    }
  },

  init() {
    this._super(...arguments);
    let elId = this.get('elementId');
    this.set('pickerId', `date-picker-${elId}`);
    this.set('containerId', `date-picker-container-${elId}`);

    this.set('data1', {
      values: [''],
      displayValues: [''],
      width: COL_WIDTH,
      onChange: this.data1Changed.bind(this)
    });

    this.set('data2', {
      values: [''],
      displayValues: [''],
      width: COL_WIDTH,
      onChange: this.data2Changed.bind(this)
    });
    this.set('data3', { values: [''], displayValues: [''], width: COL_WIDTH });
  },

  @on('didInsertElement')
  async domInsert() {
    let data = await this.requestAsyncData();
    this.set('data1', data);
    this.syncValues();
  },

  async syncValues() {
    let picker = this.get('picker');
    if (picker) {
      picker.setValue(this.get('displayValues'));
    }
    await bsWait(300);
    this.get('picker').updateValue();
  },

  async requestAsyncData(pid='') {
    this.set('isloading', true);
    let result = await bsGetJSON(this.get('url'), { pid });
    this.set('isloading', false);
    if (result.state) {
      let values = result.data.mapBy('id');
      let displayValues = result.data.mapBy('name');
      return { values, displayValues };
    }
  },

  @computed('containerId')
  modalSelector(containerId='picker-global') {
    return `#${containerId}`;
  },

  @computed('mode')
  cols(mode) {
    let divider = {
      divider: true,
      content: '｜'
    };
    let { data1, data2, data3 } = this.getProperties(w('data1 data2 data3'));
    if (mode == 'level3') {
      return [data1, divider, data2, divider, data3];
    } else if (mode == 'level2') {
      return [data1, divider, data2];
    } else if (mode == 'level1') {
      return [data1];
    }
  },

  @on('willDestroyElement')
  domRemoved() {
    this.closePicker();
  },

  _handlePickChange(picker, values, displayValues) {
    this.set('values', values);
    this.set('displayValues', displayValues);
  },

  willInsertElement() {
    let containerId = this.get('containerId');
    $(`<div class="picker-modal date-picker-container" id="${containerId}"></div>`).appendTo('body');
  },
  willDestroyElement() {
    let modalSelector = this.get('modalSelector');
    Ember.$(modalSelector).remove();
  },

  @observes('data1')
  updateCol1() {
    let picker = this.get('picker');
    let data1 = this.get('data1');
    if (picker && picker.cols && picker.cols[0]) {
      picker.cols[0].replaceValues(data1.values, data1.displayValues);
    }
  },
  @observes('data2')
  updateCol2() {
    let picker = this.get('picker');
    let data2 = this.get('data2');
    if (picker && picker.cols && picker.cols[2]) {
      picker.cols[2].replaceValues(data2.values, data2.displayValues);
    }
  },
  @observes('data3')
  updateCol3() {
    let picker = this.get('picker');
    let data3 = this.get('data3');
    if (picker && picker.cols && picker.cols[4]) {
      picker.cols[4].replaceValues(data3.values, data3.displayValues);
    }
  },

  @observes('mode')
  @on('didInsertElement')
  async initPicker() {
    await bsCheck(() => window.f7app);
    let f7app = window.f7app;

    let modal = this.get('modal');
    let modalOpened = this.get('modalOpened');
    if (!(modal && !modalOpened)) {
      modal = f7app.pickerModal(this.get('modalSelector'));
      this.set('modal', modal);
      this.set('modalOpened', true);
    }

    let pickerId = this.get('pickerId');
    await bsWait();

    let cols = this.get('cols');
    let container = '#' + pickerId;
    let self = this;

    let picker = this.get('picker');
    if (picker) {
      picker.destroy();
      $(container).empty();
    }
    picker = f7app.picker({
      container,
      toolbar: false,
      rotateEffect: false,
      cols,
      updateValuesOnTouchmove: true,

      value: this.get('displayValues'),
      onChange(/* picker, values, displayValues*/) {
        self._handlePickChange(...arguments);
      }

    });
    this.set('picker', picker);
  },


  closePicker() {
    let f7app = window.f7app;
    f7app.closeModal(this.get('modalSelector'));
    this.set('modalOpened', false);
  },
  openPicker() {
    window.f7app.pickerModal(this.get('modalSelector'));
  },

  actions: {
    async confirm() {
      let { onValidate, onConfirm } = this.attrs;
      if (onValidate && onValidate(...arguments)) {
        this.closePicker();
      } else {
        this.closePicker();
      }
      if (onConfirm) {
        onConfirm(this.get('displayValues'), this.get('values'));
      }
    },
    async cancel() {
      this.closePicker();
      let { onCancel } = this.attrs;
      if (onCancel) {
        onCancel();
      }
    },
    async setToNow() {
      this.set('isSetToNow', true);
      this.set('value', moment());
    }
  }
});
