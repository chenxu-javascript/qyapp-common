'use strict';

var Plugin = require('broccoli-plugin');
var fs = require('fs');
var Promise = require('rsvp').Promise;
var path = require('path');

module.exports = IncludeAll;

IncludeAll.prototype = Object.create(Plugin.prototype);
IncludeAll.prototype.constructor = IncludeAll;
function IncludeAll(inputNode, options) {
  options = options || {};
  Plugin.call(this, [inputNode], {
    annotation: options.annotation,
    persistentOutput: true
  });

  this.themeColor = options.themeColor;
}

IncludeAll.prototype.build = function() {
  var srcDir = this.inputPaths[0];

  return Promise.resolve()
    .then(this.importPods.bind(this, srcDir));
};

IncludeAll.prototype.importPods = function(srcDir) {
  fs.writeFileSync(path.join(this.outputPath, 'theme-color.less'), "@themeColor:"+this.themeColor+";");
  return true;
}
