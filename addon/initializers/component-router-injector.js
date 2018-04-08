import Ember from 'ember';

Ember.Component.reopen({
  _z_controller: {},
  modalshow: Ember.computed.alias('appController.modalshow'),
  selfCls: Ember.computed('classNames.[]', function() {
    return this.get('classNames.lastObject');
  })
});

export function initialize(application) {
  application.inject('component', 'router', 'router:main');
  application.inject('component', 'appController', 'controller:application');
}

export default {
  name: 'component-router-injector',
  initialize
};
