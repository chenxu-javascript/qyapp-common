import Ember from 'ember';

var isUndefined = function(value) {
  return value === 'undefined' || Object.prototype.toString.call(value) === '[object Function]' || (value.hash != null);
};

export default Ember.Helper.helper(function([str, limit, append]) {
  if (str === null || typeof str === 'undefined') {
    return str;
  }
  if (isUndefined(append)) {
    append = '';
  }
  var sanitized = str.replace(/(<([^>]+)>)/g, '');
  if (sanitized.length > limit) {
    return sanitized.substr(0, limit - append.length) + append;
  } else {
    return sanitized;
  }
});
