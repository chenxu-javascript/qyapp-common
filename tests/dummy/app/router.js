import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('follow');
  this.route('shortcut');
  this.route('dashboard');
  this.route('appoint');
  this.route('remind');
  this.route('customer', function() {
    this.route('add');
    this.route('list');
    this.route('detail');
    this.route('search');
  });

  this.route('jobreport', function() {
    this.route('statistic');
    this.route('create');
    this.route('view', { path: '/v' });
  });
});


export default Router;
