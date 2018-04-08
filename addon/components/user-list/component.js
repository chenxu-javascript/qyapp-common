import Ember from 'ember';
import computed, { on, observes } from 'ember-computed-decorators';
import { debounce } from 'ember-run-decorators';
import { bsGetJSON } from 'boss-qyapp-common/models/utils';
import User from 'boss-qyapp-common/models/user';
import layout from './template';

const { K, set, run: { debounce: _debounce, later } } = Ember;

export default Ember.Component.extend({
  layout,
  model: {},
  page: 1,
  limit: 20,
  kw: '',
  forSelect: false,
  multipleSelect: false,
  searchbar: true,
  onSelect: K,
  selectedUser: [],

  pageCls: 'page',
  contentCls: 'page-content',

  searchPlaceholder: '输入姓名 / 姓名拼音 / 手机号搜索',
  url: '/user/getUserList',
  group_id: 1,
  is_fetch: 0,

  cached: true,
  dataPage: 'search-list',
  classNameBindings: ['cached'],

  @on('didInsertElement')
  @observes('group_id')
  initialLoad() {
    this.loadInitialUser();
  },

  @debounce(100)
  async loadInitialUser() {
    this.set('page', 1);
    let data = await this.requestMembers();
    if (data) {
      this.set('model.mumbers', data.list);
      this.set('model.pagebar', data.pagebar);
    }
  },

  @on('init')
  @observes('kw')
  async loadKwData() {
    let kw = this.get('kw');
    _debounce(this, this.loadInitialUser, 100);
    this.set('model.keyword', kw);
  },

  async requestMembers() {
    let group_id = this.get('group_id');
    let department_id = group_id;
    let keyword = this.get('kw');
    let is_fetch = this.get('is_fetch');
    if (!group_id && !keyword) {
      // return;
    }
    let page = this.get('page');
    let limit = this.get('limit');
    this.set('isloading', true);
    let data = await bsGetJSON(this.get('url'), { group_id, department_id, page, limit, keyword, is_fetch });
    this.set('isloading', false);
    this.set('model.deptLoading', false);
    if (data.state) {
      data.data.list = (data.data.list || []).map(u => User.create(u));
      return data.data;
    }
  },

  @computed('model.mumbers.[]', 'model.pagebar.total')
  hasMore(mumbers=[], total=0) {
    return total > mumbers.length;
  },

  setCheckedToSelectedUsers() {
    let forSelect = this.get('forSelect');
    if (!forSelect) {
      return;
    }
    let contactsData = this.get('contactsData');
    let selectedUser = this.get('selectedUser') || [];
    for (let data of contactsData) {
      for (let d of data.contacts) {
        let prop = d.user_id ? 'user_id': 'account';
        set(d, 'checked', !!selectedUser.findBy(prop, d[prop]));
      }
    }
  },

  @observes('selectedUser.[]')
  selectedUserChanged() {
    this.setCheckedToSelectedUsers();
  },

  @computed('model.mumbers.[]')
  contactsData(mumbers=[]) {
    let temp = [];
    let result = mumbers.sort(function(a, b) {
      if (a.user_pingyin > b.user_pingyin) {
        return 1;
      } else if (a.user_pingyin < b.user_pingyin) {
        return -1;
      }
      if (a.account > b.account) {
        return 1;
      } else if (a.account < b.account) {
        return -1;
      }
      return 0;
    });
    let letters = result.map((o) => o.user_pingyin.substr(0, 1).toUpperCase());
    letters = letters.uniq();
    letters.map((o) => {
      let obj = { letter: o };
      obj.contacts = result.filter((r) => o == r.user_pingyin.substr(0, 1).toUpperCase());
      temp.push(obj);
    });
    later(() => {
      this.setCheckedToSelectedUsers();
    });
    return temp;
  },

  actions: {
    selectUser(user, evt) {
      let { onUserCheck=K, onUserUncheck=K } = this.attrs;
      let checked = evt.target.checked;
      later(() => {
        if (checked) {
          onUserCheck(user);
        } else {
          set(user, 'checked', false);
          onUserUncheck(user);
        }
      });
    },
    userSelecte(user) {
      let { onSelect } = this.attrs;
      if (onSelect) {
        onSelect(user);
      }
    },
    search() {
      this.set('kw', this.get('model.keyword') || null);
    },
    async loadMore() {
      this.incrementProperty('page');
      let data = await this.requestMembers();
      if (data) {
        let mumbers = this.get('model.mumbers');
        mumbers.pushObjects(data.list);
        this.set('model.pagebar', data.pagebar);
      }
    }
  }
});
