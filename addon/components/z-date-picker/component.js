import Ember from 'ember';
import moment from 'moment';
import computed, { on, alias, observes } from 'ember-computed-decorators';
import { bsCheck, bsWait } from 'boss-qyapp-common/models/utils';
import layout from './template';

const { get, String: { w } } = Ember;

const numbers = (count=0, start=1) => {
  const padStart = (s='') => (s.length == 1 ? '0'+s: s);
  let values = Array(parseInt(count)).fill(0).map((o, i) => padStart(String(i+start)));
  return { values };
};

export default Ember.Component.extend({
  layout,
  value: moment(),
  @alias('value') currentDate: '',
  mode: 'day',
  currentDatde: '',
  modalshow: undefined,

  @computed('containerId')
  modalSelector(containerId='picker-global') {
    return `#${containerId}`;
  },

  init() {
    this._super(...arguments);
    let elId = this.get('elementId');
    this.set('pickerId', `date-picker-${elId}`);
    this.set('containerId', `date-picker-container-${elId}`);

    let m = this.get('value');
    if (!m) {
      m = moment();
      this.set('value', m);
    }
  },

  @on('didInsertElement')
  initPickerEvent() {
    let modalshow = this.get('modalshow');
    if (modalshow === undefined) {
      return;
    }
    let modalSelector = this.get('modalSelector');
    let $modal = Ember.$(modalSelector);
    $modal.on('close', () => {
      Ember.run.later(() => {
        if (this.get('modalshow')) {
          history.back();
        }
      });
    });
    $modal.on('open', () => {
      this.set('modalshow', true);
    });
  },

  @on('init')
  @observes('value')
  mntChanged() {
    let m = this.get('value');
    let values = m.format('YYYY-MM-DD HH:mm').split(/[\-: ]/);
    this.set('year', values[0]);
    this.set('month', values[1]);
    this.set('day', values[2]);
    this.set('hour', values[3]);
    this.set('minute', values[4]);

    let mode = this.get('mode');
    let picker = this.get('picker');
    if (!picker) {
      return;
    }
    // let cols = picker.cols;
    let days = this.get('days');
    let isSetToNow = this.get('isSetToNow');

    if ((mode == 'day' || mode == 'time') && picker.cols[4] &&
      days.values !== picker.cols[4].values
    ) {
      let col = picker.cols[4];
      let values = days.values;
      let displayValues = days.displayValues;
      col.destroyEvents();
      col.values = values;
      col.displayValues = displayValues;
      var newItemsHTML = picker.columnHTML(col, true);
      col.wrapper.html(newItemsHTML);
      col.items = col.wrapper.find('.picker-item');
      col.calcSize();
      col.initEvents();

      if (!isSetToNow) {
        let oldValue = this.get('day');
        if (!values.includes(oldValue)) {
          let newValue = get(values, 'lastObject');
          col.setValue(newValue, 0, true);
        } else {
          col.setValue(oldValue, 0, true);
        }
      }
      col.initEvents();
    }
    if (isSetToNow) {
      picker.setValue(this.get('displayValues'));
      this.set('isSetToNow', false);
    }
  },

  /* 列定义 */
  years: numbers(16, 2010),
  months: numbers(12),

  @computed('year', 'month')
  days(year, month) {
    if (!year || !month) {
      return numbers(0);
    }
    let mnt = moment([year, month].join('-'));
    let daysCount = mnt.daysInMonth();
    let values = numbers(daysCount).values;
    let displayValues = values.map(d => {
      let weekDay = mnt.date(parseInt(d)).format('dd');
      return `${d} 周${weekDay}`;
    });
    return { values, displayValues };
  },
  @computed('year')
  weeks(year) {
    let m = moment([year]).endOf('year');
    let count = m.format('w');

    let values = numbers(count).values;
    let displayValues = values.map(d => `第${d}周`);
    return { values, displayValues };
  },
  hours: numbers(24, 0),
  minutes: numbers(60, 0),

  @computed('mode')
  nowText(mode) {
    let maps = {
      year: '本年',
      month: '本月',
      day: '今天',
      week: '本周',
      time: '今天'
    };
    return maps[mode];
  },
  @computed('mode')
  displayFormat(mode) {
    let maps = {
      year: 'YYYY年',
      month: 'YYYY年MM月',
      day: 'YYYY年MM月DD日',
      week: 'YYYY年第W周',
      time: 'YYYY-MM-DD ddd HH:mm'
    };
    return maps[mode];
  },

  @computed('value', 'mode')
  displayValues(m, mode='day') {
    let maps = {
      year: 'YYYY',
      month: 'YYYY-MM',
      day: 'YYYY-MM-DD',
      week: 'YYYY-W',
      time: 'YYYY-MM-DD HH:mm'
    };
    return m.format(maps[mode]).split(/[\-: ]/);
  },

  @computed('mode')
  headers(mode) {
    let maps = {
      year: '年份',
      month: '年份 月份',
      day: '年份 月份 日&nbsp;星期',
      week: '年份 周',
      time: '年份 月份 日&nbsp;星期 小时 分'
    };
    return w(maps[mode]);
  },

  @computed('mode')
  cols(mode) {
    let divider = {
      divider: true,
      content: '｜'
    };
    if (mode == 'day') {
      let { years, months, days } = this.getProperties(w('years months days'));
      return [years, divider, months, divider, days];
    } else if (mode == 'month') {
      let { years, months } = this.getProperties(w('years months'));
      return [years, divider, months];
    } else if (mode == 'year') {
      let { years } = this.getProperties(w('years'));
      return [years];
    } else if (mode == 'week') {
      let { years, weeks } = this.getProperties(w('years weeks'));
      return [years, divider, weeks];
    } else if (mode == 'time') {
      let { years, months, days, hours, minutes } = this.getProperties(w('years months days hours minutes'));
      return [years, divider, months, divider, days, divider, hours, divider, minutes];
    }
  },

  @on('willDestroyElement')
  domRemoved() {
    this.closePicker();
  },
  @on('didDestroyElement')
  domDestroy() {
    Ember.$('.picker-modal-closing').removeClass('picker-modal-closing');
  },

  _handlePickChange(picker, values /* , displayValues*/) {
    let mode = this.get('mode');
    if (mode === 'week') {
      this.set('value', moment(values.join('-'), 'YYYY-W'));
    } else {
      let [year, month, day] = values;
      let mnt = moment([year, month].join('-'));
      let daysCount = mnt.daysInMonth();
      if (day > daysCount) {
        values[2] = daysCount;
      }
      this.set('value', moment(values.join('-'), 'YYYY-MM-DD HH:mm'));
    }
  },

  willInsertElement() {
    let containerId = this.get('containerId');
    $(`<div class="picker-modal date-picker-container" id="${containerId}"></div>`).appendTo('body');
  },
  willDestroyElement() {
    let modalSelector = this.get('modalSelector');
    Ember.$(modalSelector).remove();
  },

  @observes('mode')
  @on('didInsertElement')
  async domInsert() {
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
    f7app.closeModal(this.get('modalSelector'), false);
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
        let modalSelector = this.get('modalSelector');
        let $modal = Ember.$(modalSelector);
        $modal.one('closed', () => {
          onConfirm(this.get('displayValues'), this.get('value'));
        });
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
