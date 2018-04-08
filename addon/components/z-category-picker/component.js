import AsyncPicker from '../z-async-picker/component';
import layout from '../z-async-picker/template';

export default AsyncPicker.extend({
  layout,
  mode: 'level3',
  url: '/unit/getcategoryall'
});
