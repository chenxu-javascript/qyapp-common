import Ember from 'ember';
import WxjsapiMixin from 'dummy/mixins/wxjsapi';
import { on } from 'ember-computed-decorators';
import { bsSetTitle } from 'dummy/models/utils';

export default Ember.Component.extend(WxjsapiMixin, {
  suite_id: 'tj38e9f0e99b0236bc',
  defaultDept: { group_id: 1 },

  @on('didInsertElement')
  setTitle() {
    bsSetTitle('工作报告');
  }
});
