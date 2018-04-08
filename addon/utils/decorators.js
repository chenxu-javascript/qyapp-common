import Ember from 'ember';
import Changeset from 'ember-changeset';
import { bsPromise, bsCheck } from '../models/utils';

const { observer, computed } = Ember;

export function queryParams(paramsName) {
  return (target, key, desc) => {
    paramsName = paramsName || key;
    return {
      ...desc,
      initializer() {
        return Ember.computed.alias(`_z_controller.${paramsName}`);
      }
    };
  };
}

export function showPage4Prop(pageName, prop) {
  return function(target, key, descriptor) {
    let func = descriptor.value;
    descriptor.value = Ember.on('didInsertElement', observer.call(null, prop, async function() {
      await bsPromise();
      let f7app = window.f7app;
      let propVal = this.get(prop);
      let shouldLoad = func.call(this, propVal);

      let page = $(`.page[data-page=${pageName}]`);
      if (shouldLoad === 0 || page.length == 0) {
        return;
      }
      await bsCheck(() => window.f7app);
      f7app.f7view.refreshPages();
      if (!shouldLoad) {
        f7app.f7view.router.back({});
      } else {
        f7app.f7view.router.load({ pageName });
      }
    }));
  };
}

export function changeset(prop) {
  return function(target, key, desc) {
    return {
      ...desc,
      initializer() {
        return computed.call(null, prop, function() {
          return new Changeset(this.get(prop));
        });
      }
    };
  };
}
