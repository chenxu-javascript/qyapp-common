import Ember from 'ember';

export function readPath([array, item]/* , hash*/) {
  return array.indexOf(item) !== -1;
}

export default Ember.Helper.helper(readPath);
