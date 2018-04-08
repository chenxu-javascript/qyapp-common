import Ember from 'ember';
import { scheduleOnce, cancel, next, debounce } from 'ember-runloop';
import { isEmpty } from 'ember-utils';
import { assert } from 'ember-metal/utils';
import { A as emberArray } from 'ember-array/utils';
import { addListener, removeListener } from 'ember-metal/events';
import computed from 'ember-computed';
import jQuery from 'jquery';
import layout from './template';

export default Ember.Component.extend({
  layout,
  classNames: 'navbar tabbar tabbar-labels bs-tabbar links-with-follower',
  _items: [],
  innerCls: '',

  init() {
    this._super(...arguments);
    this.set('_items', []);

    this.router = Ember.getOwner(this).lookup('router:main');

    addListener(this.router, 'willTransition', this, this._queueMoveFollower);
  },
  addItem(item) {
    let _items = this.get('_items');
    _items.push(item);
  },
  removeItem(item) {
    let _items = this.get('_items');
    _items.removeObject(item);
  },
  activeItem(item) {
    if (item.isDestroyed) {
      return;
    }
    let _items = this.get('_items');
    _items.map(i => {
      Ember.set(i, 'active', i === item);
    });
    this._queueMoveFollower();
  },

  itemChanged: Ember.observer('_items.@each.active', function() {
    debounce(this, this.activeCurrentItem, 10);
  }),

  activeCurrentItem() {
    let _items = this.get('_items') || [];
    let item = _items.find(i => i.active && !i.isDestroyed);
    if (item) {
      this.activeItem(item);
    }
  },

  tagName: 'nav',

  /**
   * Tag name to use for the element wrapping the provided links.
   *
   * @property containerTagName
   * @type {String}
   * @default 'ul'
   */
  containerTagName: 'ul',

  /**
   * Tag name to use for the follower. It is expected to match items passed
   * in via the block.
   *
   * @property linkTagName
   * @type {String}
   * @default 'a'
   */
  linkTagName: 'a',

  /**
   * The selector used to consider a link active.
   *
   * @property activeSelector
   * @type {String}
   * @default 'li.active'
   */
  activeSelector: 'a.active:not(a.ember-transitioning-out), a.ember-transitioning-in',

  /**
   * The duration used to animate the follower link.
   *
   * @property followerAnimationDuration
   * @type {Number}
   * @default 150
   */
  followerAnimationDuration: computed({
    get() {
      return 150;
    }
  }),

  /**
   * Where to position the follower. Not yet used.
   *
   * @property followerPosition
   * @type {String}
   * @default 'bottom'
   */
  followerPosition: 'bottom', // TODO: support top, bottom, both

  didInsertElement() {
    this._super(...arguments);

    this._assertChildrenMatchSelector();
    // this._ensureCorrectInitialPosition();
    this.$('.navbar-inner')
    .one('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', () => {
      this._ensureCorrectInitialPosition();
    });

    this._onResizeHandler = () => {
      debounce(this, this._moveFollower, false, 20);
    };
    this._installResizeListener();
  },

  willDestroy() {
    this._super(...arguments);

    removeListener(this.router, 'willTransition', this, this._queueMoveFollower);
    cancel(this.nextRun);
    this.router = null;

    this._uninstallResizeListener();
  },

  /**
   * Ensures the position of the follower is correct.
   *
   * @private
   */
  _ensureCorrectInitialPosition() {
    this._ensureCorrectPositionOnNextRun();
    this._ensureCorrectPositionOnWindowLoad();
  },

  /**
   * Ensures the position of the follower on the next run.
   *
   * @private
   */
  _ensureCorrectPositionOnNextRun() {
    this.nextRun = next(this, this._moveFollower, false);
  },

  /**
   * Ensures the initial position of the follower is correct, even if font or
   * image assets are slow to load.
   *
   * @private
   */
  _ensureCorrectPositionOnWindowLoad() {
    window.onload = () => this._moveFollower(false);
  },

  /**
   * Adds event listener to update the follower after a browser resize
   *
   * @private
   */
  _installResizeListener() {
    window.addEventListener('resize', this._onResizeHandler);
  },

  /**
   * Removes event listener to update the follower after a browser resize
   *
   * @private
   */
  _uninstallResizeListener() {
    window.removeEventListener('resize', this._onResizeHandler);
  },

  /**
   * Asserts that children passed in via block match the provided childSelector
   * property.
   *
   * @private
   */
  _assertChildrenMatchSelector() {
    let containerTagName = this.get('containerTagName');
    let linkTagName = this.get('linkTagName');
    let children = emberArray(this.$(`${containerTagName}`).children().toArray());
    let childrenMatch = children.every((c) => jQuery(c).is(linkTagName));

    assert('children in block must match the \'linkTagName\' property', childrenMatch);
  },

  /**
   * Queues moving of a follower.
   * @private
   */
  _queueMoveFollower() {
    scheduleOnce('afterRender', this, this._moveFollower);
  },

  /**
   * Moves and resizes the link follower to match the currently active link.
   *
   * @param  {Boolean} animate=true If the follower should animate
   * @private
   */
  _moveFollower(animate=true) {
    let width = 0;
    let left = 0;

    let activeLink = this._activeLink();
    if (activeLink) {
      width = this._widthOfActiveLink();
      left = this._leftPositionOfActiveLink();
      left = left + this._marginLeftOfActiveLink();
    }
    let shouldHideFollower = isEmpty(width) || isEmpty(left);

    this._hideFollower(shouldHideFollower);
    this._animateFollower(animate, { width, left });
  },

  /**
   * Shows or hides the follower link.
   *
   * @param  {Boolean} shouldHideFollower=true If the follower should animate
   * @private
   */
  _hideFollower(shouldHideFollower=true) {
    let follower = this.$('.link-follower');
    if (!follower) {
      return;
    }

    if (shouldHideFollower) {
      follower.hide();

      Ember.warn('No active link found. Hiding follower', false, {
        id: 'ember-debug.links-with-follower-no-active'
      });
    } else {
      follower.show();
    }
  },

  /**
   * Animates a follower to its final width / position.
   *
   * @param  {Boolean} animate=true If the follower should animate or not
   * @param  {Object} options={} The animated properties, left and width, passed to jQuery's css method
   * @private
   */
  _animateFollower(animate=true, options={}) {
    let follower = this.$('.link-follower');
    if (!follower) {
      return;
    }
    let duration = (animate) ? this.get('followerAnimationDuration') : 0;
    let { left, width } = options;
    let css = {
      transform: `translate3d(${left}px, 0px, 0px)`,
      transitionDuration: `${duration}ms`,
      width
    };

    follower.css(css);
  },

  /**
   * Gets the width of the active link.
   *
   * @return {Number} The width including margins/padding
   * @private
   */
  _widthOfActiveLink() {
    let activeLink = this._activeLink();

    return activeLink.outerWidth();
  },

  /**
   * Gets the left position of the active link.
   *
   * @return {Number} The left position or 0 if it cannot be determined
   * @private
   */
  _leftPositionOfActiveLink() {
    let activeLink = this._activeLink();
    let offset = activeLink.position() || { left: 0 };

    return offset.left;
  },

  _marginLeftOfActiveLink() {
    let activeLink = this._activeLink();
    let marginLeft = activeLink.css('marginLeft');

    return parseInt(marginLeft);
  },

  /**
   * Gets the active link based on `activeSelector`.
   *
   * @return {Object} The results of the jQuery selector
   * @private
   */
  _activeLink() {
    let activeSelector = this.get('activeSelector');
    return this.$(activeSelector);
  }
});
