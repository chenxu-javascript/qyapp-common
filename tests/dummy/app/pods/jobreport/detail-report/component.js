import Ember from 'ember';
import computed, { on, observes } from 'ember-computed-decorators';
import { showPage4Prop } from 'boss-qyapp-common/utils/decorators';
import { bsGetJSON, bsTip } from 'dummy/models/utils';
import Report from 'dummy/models/report';

const { setProperties } = Ember;

export default Ember.Component.extend({
  commentPage: 1,
  limit: 10,
  commentContent: '',
  comments: [],
  canEdit: false,
  type: 'day',
  user_id: '',

  onChangePage: Ember.K,

  @computed('user')
  title(user) {
    return `${user.user_name}`+`${user.type}`;
  },
  @showPage4Prop('report-visitor', 'showVisitor')
  showShowVisitor(showVisitor) {
    return showVisitor;
  },



  async loadReport(params) {
    let report_id = this.get('report_id');
    let user_id = this.get('user_id');
    let report_date = this.get('report.report_date');
    let type = this.get('report.type') || this.get('type');

    if (report_id) {
      params = { report_id, user_id };
    } else {
      params = { report_date, type, user_id };
    }

    this.set('isLoading', true);
    let result = await bsGetJSON('/report/detail', params);
    this.set('isLoading', false);
    if (result.data) {
      setProperties(result.data, params);
      let report = this.get('report');
      if (report) {
        setProperties(report, result.data);
      } else {
        result.data.type = type;
        this.set('report', Report.create(result.data));
      }
    }
  },

  @on('didInsertEelment')
  domInsert() {
    let report = this.get('report');
    if (!report) {
      this.loadReport();
    }
  },

  async requestVisitors(report_id) {
    let result = await bsGetJSON('/report/queryViewLog', { report_id });
    if (result.state) {
      this.set('visitors', result.data.list);
    }
  },
  async requestComments(report_id) {
    report_id = report_id || this.get('report.report_id');
    let page = this.get('commentPage');
    let limit = this.get('limit');
    let result = await bsGetJSON('/report/queryComment', { report_id, page, limit });
    if (result.state) {
      return result.data;
    }
  },

  async loadInitialComments() {
    this.set('page', 1);
    let comments = await this.requestComments();
    if (comments) {
      this.set('comments', comments.list);
      this.set('commentPagebar', comments.pagebar);
    }
  },

  @computed('comments.[]', 'commentPagebar.total')
  hasMore(comments=[], total=0) {
    return total > comments.length;
  },

  @observes('report_id')
  idChanged() {
    let report_id = this.get('report_id');
    if (report_id) {
      this.loadReport();
    }
  },

  @observes('report.report_id')
  async reportIdChanged() {
    let report_id = this.get('report.report_id');
    if (report_id) {
      this.requestVisitors(report_id);
      this.loadInitialComments();
    }
  },

  actions: {
    reload() {
      this.loadReport();
    },
    gotoVisitorPage() {
      this.set('showVisitor', true);
    },
    async pubComment() {
      let content = this.get('commentContent');
      let report_id = this.get('report.report_id');
      let result = await bsGetJSON('/report/comment', { content, report_id }, 'post');
      if (result.state) {
        bsTip('评论成功');
        this.set('commentContent', '');
        this.loadInitialComments();
      }
    },
    editSummary() {
      if (this.get('canEdit')) {
        this.set('create2', 1);
      }
    },
    editPlan() {
      if (this.get('canEdit')) {
        this.set('create', 1);
      }
    },
    async loadMore() {
      this.incrementProperty('commentPage');
      let data = await this.requestComments();
      if (data) {
        let comments = this.get('comments');
        comments.pushObjects(data.list);
        this.set('commentPagebar', data.pagebar);
      }
    }
  }
});
