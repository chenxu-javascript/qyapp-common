/* jshint node: true */
'use strict';

var path = require('path');

var Funnel = require('broccoli-funnel');
var Concat = require('broccoli-concat');
var Merge = require('broccoli-merge-trees');
var ThemeColor = require('./lib/theme-color');
var log = require('broccoli-stew').log;

module.exports = {
  name: 'boss-qyapp-common',
  options: {
    babel: {
      plugins: ['transform-decorators-legacy', 'transform-object-rest-spread']
    }
  },
  init: function(app) {
    this._super.init && this._super.init.apply(this, arguments);

    this.options = this.options || {};
    this.options.babel = this.options.babel || {};
    this.options.babel.optional = this.options.babel.optional || [];

    if (this.options.babel.optional.indexOf('es7.decorators') === -1) {
      this.options.babel.optional.push('es7.decorators');
    }

    this.treeForMethods['addon-styles'] = 'treeForThemeColor';
    this.treeForThemeColor = this.treeForThemeColor.bind(this);

  },
  included: function(app) {

    this._super.included.apply(this, arguments);

    while (typeof app.import !== 'function' && app.app) {
      app = app.app;
    }
    app.import('./../node_modules/framework7/dist/framework7.esm.bundle.js');
    app.import('./../node_modules/framework7/dist/framework7.less');
    app.import('vendor/framework7/plugins/toast/toast.js');
    app.import('vendor/framework7/plugins/toast/toast.css');
    app.import('vendor/wxjssdk/jweixin-1.1.0.js');

    this.appConfig = app.project.config(app.env);
    this.addonConfig = this.appConfig['boss-qyapp-common'] || {};

    return app;
  },

  treeForThemeColor: function(tree) {
    tree = this.processComponentStyles(tree);
    return tree;
  },

  treeForStyles: function(tree) {
    tree = new Funnel(path.resolve(__dirname, 'addon', 'styles'), {
      destDir: 'boss-qyapp-common'
    });
    tree = this.processComponentStyles(tree);
    return this._super.treeForStyles.call(this, tree);
  },

  processComponentStyles: function(tree) {

    var themeTree = new ThemeColor(tree, {
      themeColor: this.addonConfig.themeColor || '#FF6900',
      annotation: 'ThemeColor (generate themeColor)'
    });

    tree = new Merge([tree, themeTree].filter(Boolean), {
      overwrite: true,
      annotation: 'Merge (theme-color merge namespacedStyles with style manafest)'
    });

    return tree;
  },
};
