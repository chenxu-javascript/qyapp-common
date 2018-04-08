import Ember from 'ember';
import { on, observes } from 'ember-computed-decorators';
import { bsCheck } from 'boss-qyapp-common/models/utils';
import layout from './template';
import { debounce } from 'ember-run-decorators';

export default Ember.Component.extend({
  layout,
  tagName: 'form',
  keyword: '',
  classNames: ['searchbar'],
  placeholder: '输入关键字',
  cancelText: '取消',
  searchText: '搜索',
  onFocusIn: Ember.K,
  onFocusOut: Ember.K,
  autoSearch: false, // 自动搜索，用户输入时就搜索，不需要点搜索按钮

  @debounce(500)
  search() {
    let { onSearch } = this.attrs;
    if (onSearch) {
      let keyword = this.get('keyword');
      onSearch(keyword);
    }
    let autoSearch = this.get('autoSearch');
    if (!autoSearch) {
      this.$('input').blur();
    }
  },

  @observes('keyword')
  keywordChanged() {
    let autoSearch = this.get('autoSearch');
    if (autoSearch) {
      this.search();
    }
  },

  @on('didInsertElement')
  async initSearchbar() {
    await bsCheck(() => !!window.f7app);
    let searchbar = window.f7app.searchbar('.searchbar', {
      searchList: '.list-block-search',
      searchIn: '.item-title'
    });
    let $searchbar = this.$();
    $searchbar.on('clear', () => {
      this.search();
    });
    this.set('searchbar', searchbar);
  },

  actions: {
    search() {
      this.search();
    },
    focusOut() {
      let { onFocusOut } = this.attrs;
      if (onFocusOut) {
        onFocusOut();
      }
      let autoSearch = this.get('autoSearch');
      let keyword = this.get('keyword');
      if (!keyword && autoSearch) {
        let searchbar = this.get('searchbar');
        searchbar.disable();
      }
    }
  }
});
