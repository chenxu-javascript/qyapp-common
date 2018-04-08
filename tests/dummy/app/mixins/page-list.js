import Ember from 'ember';
import WxjsapiMixin from 'dummy/mixins/wxjsapi';
import PreviewimageMixin from 'dummy/mixins/previewimage';
import { bsGetJSON, bsPromise } from 'boss-qyapp-common/model/utils';

export default Ember.Mixin.create(WxjsapiMixin, PreviewimageMixin, {
  isRefreshing: false,
  scrollLoading: false,
  topicIsLoading: false,
  listUrl: '',
  detailUrl: '',
  requestLists(params) {
    bsGetJSON(this.get('listUrl'), params).then((data) => {
      this.set('pageloading', false);
      if (data.state == 1) {
        this.set('model.items', data.data.items);
        this.set('model.pagebar', data.data.pagebar);
      }
    });
  },
  refreshListData() {
    let params = { page: 1, limit: 20 };

    if (this.get('isRefreshing')) {
      return bsPromise({});
    }

    this.set('isRefreshing', true);
    return bsGetJSON(this.get('listUrl'), params).then((result) => {
      this.set('isRefreshing', false);
      if (result.state == 1) {
        this.set('query.page', 1);
        this.set('model.items', result.data.items);
        this.set('model.pagebar', result.data.pagebar);
        Ember.run.later(() => {
          if (result.data.items.length < result.data.pagebar.total) {
            this.set('hideScrollProloader', false);
          }
        });
      }
      return result.data;
    });
  },
  loadNextPageData() {
    let query = this.get('query'),
      list = this.get('model.items');

    Ember.set(query, 'page', parseInt(query.page) + 1);

    return bsGetJSON(this.get('listUrl'), query).then((result) => {
      if (result.state == 1) {
        list.pushObjects(result.data.items);
        this.set('model.pagebar', result.data.pagebar);
      }
      return result.data.items;
    });
  },
  parseDetail(detail) {
    return detail;
  },
  loadListTopic(topic_id) {
    if (this.get('topicIsLoading')) {
      return bsPromise({});
    }

    this.set('topicIsLoading', true);
    return bsGetJSON(this.get('detailUrl'), { kl_id: topic_id, is_read: 1 }).then((data) => {
      this.set('topicIsLoading', false);
      if (data.state == 1) {
        this.set('topic', this.parseDetail(data.data));
        Ember.run.later(() => {
          this.initPreviewImages();
        });
      }
      return data;
    });
  }
});
