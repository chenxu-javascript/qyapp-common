import Ember from 'ember';
import computed from 'ember-computed-decorators';

export default Ember.Component.extend({
  items: [],
  selectedItem: '',
  keyword: '',
  searchResult: [],
  completeAction: '',
  isSearch: false,

  @computed('containerId')
  modalSelector(containerId='picker-global') {
    return `#${containerId}`;
  },

  @computed('items', 'searchResult', 'keyword', 'isSearch')
  item2Show(items, searchResult, kw, isSearch) {
    if (!kw.length) {
      this.set('isSearch', false);
    }
    return isSearch && kw.length ? searchResult : items;
  },

  init() {
    this._super(...arguments);
    let elId = this.get('elementId');
    this.set('pickerId', `picker-product-${elId}`);
    this.set('containerId', `container-product-${elId}`);
  },

  willInsertElement() {
    let containerId = this.get('containerId');
    $(`<div class="picker-modal date-picker-container" id="${containerId}"></div>`).appendTo('body');
  },
  willDestroyElement() {
    let containerId = this.get('containerId');
    Ember.$(`#${containerId}`).remove();
  },
  closePicker() {
    let f7app = window.f7app;
    f7app.closeModal(this.get('modalSelector'));
    this.set('modalOpened', false);
  },

  actions: {
    select(item) {
      let selectedItem = this.get('selectedItem'),
        onSelect = this.attrs.onSelect;
      if (selectedItem) {
        Ember.set(selectedItem, 'selected', false);
      }
      Ember.set(item, 'selected', true);
      this.set('selectedItem', item);
      if (onSelect) {
        onSelect(item);
      }
    },
    goSearch() {
      this.set('showSearch', true);
    },
    search() {
      let items = this.get('items'),
        kw = this.get('keyword'),
        result = items.filter(i => i.name.includes(kw));
      this.set('searchResult', result);
      this.set('isSearch', true);
    },
    ok() {
      let completeAction = this.get('completeAction'),
        selected = this.get('selectedItem');
      this.closePicker();
      if (completeAction) {
        completeAction(selected);
      }
    }
  }
});
