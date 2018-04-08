import Ember from 'ember';
import { bsGetJSON } from 'boss-qyapp-common/models/utils';
import layout from './template';

const { on, get, set, setProperties } = Ember;

export default Ember.Component.extend({
  layout,
  lazyload: true,
  url: '/weekly/getteamlist',
  loadAllData: false,
  allData: [],
  itemsUrl: '',
  showIconTip: false,
  showUserCount: false,
  showSelfGroup: true,
  showSelfGroupField: '',

  queryIdName: 'id',
  parentIdName: 'pid',
  deptIdField: 'group_id',
  deptNameField: 'name',

  init() {
    this._super(...arguments);
    let dept = this.get('dept');
    set(dept, 'isLoading', true);
  },

  domInserted: on('didInsertElement', async function() {
    let dept = this.get('dept');
    let showSelfGroup = this.get('showSelfGroup');
    let showSelfGroupField = this.get('showSelfGroupField');
    let queryIdName = this.get('queryIdName');
    let deptIdField = this.get('deptIdField');
    let deptNameField = this.get('deptNameField');
    let loadAllData = this.get('loadAllData');
    let parentIdName = this.get('parentIdName');


    let data = await bsGetJSON(this.get('url'), { [queryIdName]: dept[deptIdField] });

    if (loadAllData && data.data) {
      let oldData = data.data;
      data.data = data.data.filter(d => get(d, parentIdName) == dept[deptIdField]);
      if (data.data.length == 0) {
        data.data = oldData.filter((d) => {
          return !oldData.findBy('id', d.pid);
        });
      }
      data.data.map(d => {
        d.has_children = !!oldData.find(dd => get(dd, parentIdName) == d[deptIdField]);
      });
    }

    // showSelfGroup === false的时候除第一级外其它级需要在下级树第一项显示本事业部
    if (showSelfGroup === false || get(dept, deptIdField) == 1) {
      let itemsUrl = this.get('itemsUrl');
      if (itemsUrl) {
        data.data.map(d => d.has_children = true);
        let items = await bsGetJSON(itemsUrl, { [queryIdName]: dept[deptIdField] });
        items.data.map(i => {
          i[deptNameField] = i.user_name + ' (未填写)';
          i[deptIdField] = i.user_id;
          i.has_children = false;
          i.is_item = true;
        });
        data.data = data.data.concat(items.data);
      }

      this.set('depts', data.data);
    } else if (showSelfGroupField && !get(dept, showSelfGroupField)) {
      this.set('depts', data.data);
    } else {
      let deptSelf = $.extend({}, dept);
      deptSelf.has_children = false;
      deptSelf.dataLoaded = false;
      deptSelf.isLoading = false;
      this.set('depts', [deptSelf, ...data.data]);
    }
    setProperties(dept, { isLoading: false, selected: true });
  }),
  actions: {
    deptClick(dept) {
      if (dept.has_children) {
        if (dept.selected) {
          set(dept, 'selected', false);
        } else if (dept.dataLoaded) {
          set(dept, 'selected', true);
        } else {
          setProperties(dept, { isLoading: true, dataLoaded: true });
        }
      } else if (this.attrs.onDeptSelect) {
        this.attrs.onDeptSelect(dept);
      }
    }
  }
});
