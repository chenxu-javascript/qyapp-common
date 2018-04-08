import Ember from 'ember';
import computed, { alias } from 'ember-computed-decorators';

const DefaultFace = 'https://dn-zbj-boss.qbox.me/@/default/2016-10-13/57ff32c58d92b.png';

export default Ember.Object.extend({
  user_pingyin: '',
  @alias('avatar') user_face: null,
  init() {
    this._super(...arguments);
    let user_face = this.get('user_face');
    if (!user_face) {
      this.set('user_face', DefaultFace);
    }
  },

  @computed('state')
  stateText(state) {
    let map = {
      '1': '已关注',
      '2': '已禁用',
      '4': '未关注'
    };
    return map[state];
  },

  @computed('type')
  isAddNew(type) {
    return !!type;
  }
});
