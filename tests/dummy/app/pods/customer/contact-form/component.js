import Ember from 'ember';
import { bsToast, bsGetJSON, bsBack } from 'boss-qyapp-common/models/utils';
import { changeset } from 'boss-qyapp-common/utils/decorators';

export default Ember.Component.extend({
  isView: false,
  model: {},

  @changeset('model') changeset: null,

  actions: {
    async save() {
      let customer_id = this.get('customer_id');
      let changeset = this.get('changeset');
      changeset.set('customer_id', customer_id);
      changeset.save();

      let result = await bsGetJSON('/sell/membership-act-createCustomerContact', this.get('model'), 'post');
      if (result.state) {
        bsToast('保存成功！');
        let { onContactSaved } = this.attrs;
        if (onContactSaved) {
          this.set('isView', true);
          onContactSaved(result.data);
        }
      }
    },
    cancel() {
      let changeset = this.get('changeset');
      changeset.rollback();
      this.set('isView', true);
      bsBack();
      // this.set('popup', null);
    },
    edit() {
      this.set('isView', false);
    }
  }
});
