import Ember from 'ember';
import computed from 'ember-computed-decorators';
import moment from 'moment';

export default Ember.Object.extend({
  @computed('create_time')
  groupName(create_time) {
    return moment(create_time).format('YYYY-MM-DD dddd');
  }
});
