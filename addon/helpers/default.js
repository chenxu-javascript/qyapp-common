import Ember from 'ember';

export default Ember.Helper.helper(function([a, b, c, d, e]) {
  return a || b || c || d || e;
});
