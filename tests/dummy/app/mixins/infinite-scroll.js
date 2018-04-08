import Ember from 'ember';
import { bsPromise } from 'dummy/models/utils';

export default Ember.Mixin.create({
  scrollLoading: false,

  /* inifinite scroll */
  scrollList: Ember.computed.alias('list'),
  scrollTotal: Ember.computed.alias('pagebar.total'),


  maxItems: Ember.computed.alias('scrollTotal'),
  dataLength: function() {
    return this.get('list.length') || 0;
  }.property('scrollList.[]'),
  scrollHideProloader: function() {
    var result = false;
    var maxItems = this.get('maxItems');
    var list = this.get('list');

    if (this.get('dataLength') >= maxItems || (!list || list.length === 0)) {
      result = true;
    }
    return result;
  }.property('dataLength', 'maxItems', 'scrollList', 'scrollList.[]'),

  scrollLoadNextPageData() {
    if (this.get('scrollLoading')) {
      return bsPromise();
    }
    this.set('scrollLoading', true);

    return this.loadNextPageData().then(() => {
      this.set('scrollLoading', false);
    });
  },

  actions: {
    infiniteScroll() {
      var scrollLoading = this.get('scrollLoading');
      var maxItems = this.get('maxItems') || 0;
      var lastIndex = this.get('dataLength');

      if (scrollLoading || lastIndex >= maxItems) {
        return;
      }

      this.scrollLoadNextPageData();
    }
  }
});
