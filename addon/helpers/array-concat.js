import Ember from 'ember';

export default Ember.Helper.helper(function([attr=[], sperate]) {
  return attr.join(sperate);
});
