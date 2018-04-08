import Ember from 'ember';

let isDev = location.origin.indexOf('http://localhost') == 0 ||
            location.origin.indexOf('http://172.') == 0 ||
            location.origin.indexOf('http://169.') == 0;

export var ZBJConfig = {

  // API_HOST: isDev? 'http://app.qy.dev.zbjdev.com' : location.origin,
  // API_HOST: isDev? 'http://bossweixin.t2.zbjdev.com' : location.origin,
  API_HOST: isDev? 'http://sell.qy.zbjdev.com' : location.origin,
  isDev
};
let _ = {
  isUndefined(o) {
    return typeof o == 'undefined';
  },
  cloneDeep(o) {
    return Ember.$.extend(o, true);
  }
};

export var bsPromise = function(data, time) {
  return new Ember.RSVP.Promise(function(resolve) {
    if (time) {
      Ember.run.later(function() {
        resolve(data);
      }, time || 1);
    } else {
      resolve(data);
    }
  });
};
export var bsWait = function(time) {
  return bsPromise(null, time);
};

export var bsConfirm = function(msg) {
  if (window.f7app) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      window.f7app.confirm(msg, '', resolve, reject);
    });
  }
  return bsPromise();
};
export var bsPrompt = function(msg) {
  if (window.f7app) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      window.f7app.prompt(msg, '', resolve, reject);
      setTimeout(() => {
        $('.modal-in .modal-text-input').focus();
      }, 100);
    });
  }
  return bsPromise();
};

export var bsBack = async function() {
  let oldHref = location.href;
  window.history.back();
  await bsPromise(null, 100); // 等待100ms
  let href = location.href;
  if (href == oldHref) {
    wx.closeWindow();
  }
};

let bsTipModal = null;
export var bsTip = function(msg, title='') {
  if (window.f7app) {
    if (bsTipModal) {
      return;
    }
    return new Ember.RSVP.Promise(function(resolve) {
      bsTipModal = window.f7app.alert(msg || 'error', title, function() {
        bsTipModal = null;
        resolve();
      });
    });
  } else {
    alert(msg || 'error', '系统提示');
    return bsPromise();
  }
};
export var bsToast = function(msg) {
  if (window.f7app && window.f7app.f7toast) {
    window.f7app.f7toast.show(msg);
  } else {
    alert(msg);
  }
};

export var BsCache = {
  CACHE_URLS: [
    '/corp/department/act/GetDepartmentList'
  ],
  cache: {},
  shouldCache(url) {
    if (url.indexOf(ZBJConfig.API_HOST) === 0) {
      url = url.substr(ZBJConfig.API_HOST.length);
    }
    for (var i = 0; i < this.CACHE_URLS.length; i++) {
      if (url.indexOf(this.CACHE_URLS[i]) === 0) {
        return true;
      }
    }
    return false;
  },
  encodeKey(url, params) {
    if (typeof params == 'string') {
      return url + '__params__' + params;
    }
    return url + '__params__' + $.param(params);
  },
  saveCache(url, params, data) {
    var cacheKey = this.encodeKey(url, params);
    this.cache[cacheKey] = data;
  },
  removeCache(url, params) {
    var cacheKey = this.encodeKey(url, params);
    delete this.cache[cacheKey];
  },
  getCache(url, params) {
    var cacheKey = this.encodeKey(url, params);
    return this.cache[cacheKey];
  }
};


var APP = Ember;
var bsAddReqToken = function(url) {
  if (!APP.REQ_TOKEN) {
    return url;
  }
  if (url.indexOf('?') === -1) {
    return url + '?token=' + APP.REQ_TOKEN;
  } else {
    return url + '&token=' + APP.REQ_TOKEN;
  }
};

export var bsGetJSON = function(url, params, type) {
  type = type || 'GET';

  type = type.toUpperCase();
  var shouldCache = BsCache.shouldCache(url);

  if ((typeof params === 'object') && (params !== null)) {
    params = JSON.parse(JSON.stringify(params));
  }

  Ember.$.ajaxSetup({
    xhrFields: {
      withCredentials: !!ZBJConfig.withCredentials
    }
  });

  function handleRequestError(data) {
    if (data && data.token) {
      APP.REQ_TOKEN = data.token;
    }
    if (data && data.is_redirect && !ZBJConfig.isDev) {
      let char = data.redirect_url.indexOf('?') == -1 ? '?' : '&';
      location = data.redirect_url + char + 'back_url=' + encodeURIComponent(location.href);
    } else if (data && !data.state) { // error
      bsTip(data.data || data.msg || 'error');
    }
    if (!data.state) {
      BsCache.removeCache(url, params);
    } else if (shouldCache) {
      // 复制一份数据，防止业务对数据进行修改后从缓存中取出的是修改后的数据
      var cachedData = _.cloneDeep(data);
      data.cachedData = cachedData;
    }
    return data;
  }
  params = params || {};

  if (ZBJConfig.isDev) {
    if (typeof params == 'string') {
      params += '&isAjax=1';
    } else {
      params.isAjax = 1;
    }
  }
  if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
    url = ZBJConfig.API_HOST + url;
  }

  if (url.indexOf('/misc/Searchboss2') !== -1 || url.indexOf('http://boss.jr') !== -1||
   url.indexOf('https://boss.jr') !== -1) {
    Ember.$.ajaxSetup({
      xhrFields: {
        withCredentials: true
      }
    });
  }

  if (shouldCache) {
    var cache = BsCache.getCache(url, params);
    if (cache) {
      return cache.then(function(data) {
        // 返回缓存的原始数据
        if (data.cachedData) {
          return _.cloneDeep(data.cachedData);
        }
        return data;
      });
    }
  }

  var promise = null;

  var urlAddToken = url;
  if (type == 'GET') {
    urlAddToken = bsAddReqToken(url)
    promise = Ember.$.getJSON(urlAddToken, params);
  } else {
    if (typeof params === 'string') {
      params = params + '&token=' + APP.REQ_TOKEN;
    } else {
      params.token=APP.REQ_TOKEN;
    }
    promise = Ember.$.post(urlAddToken, params, null, 'json');
  }

  promise = new Ember.RSVP.Promise(function(resolve, reject) {
    promise.then(handleRequestError).done(resolve).fail(reject);
  });

  if (shouldCache) {
    BsCache.saveCache(url, params, promise);
  }
  return promise;
};


/**
 * 当满足条件时执行函数，函数最多只会执行一次，超时后还没有满足条件则函数不会执行
 * @param {} fn 要执行的函数
 * @param {} cod  要满足的条件
 * @param {} name
 */
export var bsRunWhen = function(fn, cod, name) {
  name = name || '';

  if (cod()) {
    fn();
    return;
  }

  var i = 0;
  var interval = setInterval(function() {
    i++;
    if (i > 500) {
      clearInterval(interval);
    } else if (cod()) {
      fn();
      clearInterval(interval);
    }
  }, 30);
};

export var bsCheck = function(cod) {
  return new Ember.RSVP.Promise(function(resolve, reject) {
    bsRunWhen(resolve, cod, 'bsCheck', reject);
  });
};



export var bsElementIsScrolledIntoView = function(elem, container) {
  container = container || window;
  var $elem = $(elem);
  var $window = $(container);

  if ($elem.length == 0) {
    return false;
  }

  var docViewTop = $window.scrollTop();
  var docViewBottom = docViewTop + $window.height();

  var elemTop = $elem.offset().top;
  if ($window.offset()) {
    elemTop -= $window.offset().top;
  }
  var elemBottom = elemTop + $elem.height();

  return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom));
};


let loaded = [];
let loading = [];

var Loader = Ember.Object.extend({
  lazyLoadFiles() {
    return [];
  },
  _endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  },
  _isJsFile(file) {
    return this._endsWith(file, '.js');
  },
  _isCssFile(file) {
    return this._endsWith(file, '.css');
  },
  _getScript(url) {
    return Ember.$.ajax({
      url,
      dataType: 'script',
      cache: true
    });
  },
  _doLoad(path) {
    var filePath = path;
    var self = this;
    if (!loaded[filePath]) {
      if (this._isJsFile(filePath)) {
        if (loading[filePath]) {
          return loading[filePath];
        }
        var loadPromise = self._getScript(filePath).then(function() { // getScript is in jQuery
          loaded[filePath] = true;
          loading[filePath] = null;
          return true;
        });
        loading[filePath] = loadPromise;
        return loadPromise;
      } else if (this._isCssFile(filePath)) {
        $('<link/>', {
          rel: 'stylesheet',
          type: 'text/css',
          href: filePath
        }).appendTo('head');
        loaded[filePath] = true;
        return bsPromise(true);
      }
    } else {
      return bsPromise(true);
    }
  },
  beforeModel() {
    var files = this.lazyLoadFiles() || [];
    var self = this;

    var promises = {};
    if (files && files.length > 0) {
      files.map(function(o, i) {
        promises[String(i)] = self._doLoad(o);
      });
      return Ember.RSVP.hash(promises);
    }
    return true;
  },

  bsLoad(files) {
    var self = this;
    if ($.isArray(files) && files.length > 0) {
      var promises = files.map(function(o) {
        return self.bsLoad(o);
      });
      return Ember.RSVP.all(promises);
    }
    if (typeof files === 'string') {
      return self._doLoad(files);
    }
    return bsPromise();
  }

});


var loader = new Loader();
export var bsLoad = function(files) {
  if ($.isArray(files) && files.length > 0) {
    var promises = files.map(function(o) {
      return bsLoad(o);
    });
    return Ember.RSVP.all(promises);
  }
  if (typeof files == 'string') {
    return loader._doLoad(files);
  }
  return bsPromise();
};

window.bsLoad = bsLoad;

export var bsGetToken = async function(tokenurl) {
  tokenurl = tokenurl || '/index/gettoken';
  let result = await bsGetJSON(tokenurl);
  if (result.state && result.data && result.data.token) {
    APP.REQ_TOKEN = result.data.token;
  }
};

export var bsSetTitle = function(pagename) {
  var hash = location.hash;
  if (!hash) {
    var matches = location.search.match(/path=([^&]*)/);
    if (matches) {
      location.hash = '#' + (matches[1]).replace(/__/g, '&'); // 后端传过来的path，如果有参数，是以'__'分隔的
    }
  }
  if (pagename) {
    document.title = pagename;
    var $iframe = $('<iframe style="display:none;" src="https://cms.zbjimg.com/boss/task/icon_2.png"></iframe>');
    $iframe.on('load', function() {
      setTimeout(function() {
        $iframe.off('load').remove();
      }, 0);
    }).appendTo($('body'));
  }
};


export var bsSetupRem = function() {
  try {
    var docEl = document.documentElement,
      resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
      recalc = function() {
        var clientWidth = docEl.clientWidth;
        if (!clientWidth) return;
        if (clientWidth>=750) {
          docEl.style.fontSize = '100px';
        } else {
          docEl.style.fontSize = 100 * (clientWidth / 750) + 'px';
        }
      };

    if (document.addEventListener) {
      window.addEventListener(resizeEvt, recalc, false);
      document.addEventListener('DOMContentLoaded', recalc, false);
    }
  } catch (e) {
    //
  }
};

var Utils = {
  ZBJConfig,
  bsPromise,
  bsWait,
  bsConfirm,
  bsBack,
  bsTip,
  bsToast,
  bsGetJSON,
  bsCheck,
  bsRunWhen,
  bsElementIsScrolledIntoView,
  bsLoad,
  bsGetToken,
  bsSetTitle,
  bsSetupRem
};
export default Utils;
