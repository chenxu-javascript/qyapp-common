import Ember from 'ember';
import { queryParams } from 'boss-qyapp-common/utils/decorators';
import { on } from 'ember-computed-decorators';
import { bsGetJSON, bsToast, bsWait, bsConfirm, bsCheck, bsTip, bsSetTitle, bsBack }
  from 'boss-qyapp-common/models/utils';

export default Ember.Component.extend({
  tab: 'follow',
  loadUserPopup: false,

  @queryParams() customer_id: null,
  @queryParams() popup: null,

  closeModal() {
    window.f7app && f7app.closeModal();
  },

  popupChanged: Ember.observer('popup', async function() {
    let popup = this.get('popup');
    if (popup) {
      await bsCheck(() => window.f7app);
      f7app.popup(popup);
    } else {
      this.closeModal();
    }
  }),

  doFollow() {
    // console.log('follow');
    let customer_id = this.get('customer_id');
    this.router.transitionTo('follow', { queryParams: { customer_id }});
  },
  async doTransfer() {
    this.set('loadUserPopup', true);
    await bsWait();
    this.set('popup', '#customer-transfer-popup');
  },
  async doGiveup() {
    await bsConfirm('客户放弃后将进入放弃库，可能被其他人认领，确定放弃该客户？');
    let customer_id = this.get('customer_id');
    let result = await bsGetJSON('/sell/membership-act-giveup', { customer_id }, 'POST');
    if (result.state) {
      bsToast('操作成功!');
      await bsWait(2000);
      location.reload();
    }
  },
  async requestHead() {
    let customer_id = this.get('customer_id');
    let result = await bsGetJSON('/sell/membership-act-getDetail', { customer_id });
    if (result) {
      return result.data;
    }
  },

  @on('didInsertElement')
  async domInsert() {
    bsSetTitle('客户详情');
    let data = await this.requestHead();
    this.set('model', data);
  },
  actions: {
    userSelected(user) {
      this.set('transferUser', user);
    },
    async doTransfer() {
      let user_id = this.get('transferUser.user_id');
      let customer_id = this.get('customer_id');
      if (!user_id) {
        return bsTip('请选择要转移到的销售顾问');
      }

      let user_name = this.get('transferUser.user_name');
      await bsConfirm(`转移后该客户将由${user_name}负责， 确认转移？`);
      let result = await bsGetJSON('/sell/membership-act-changeAgent1', { customer_id, user_id }, 'POST');
      if (result.state) {
        // this.set('popup', null);
        bsBack();
        bsToast('转移成功');
        await bsWait(2000);
        location.reload();
      }
    },
    addContact() {
      this.set('popup', 'popupcontact');
    },
    showOps() {
      let self = this;
      let buttons = [[{
        text: '写跟进',
        onClick() {
          self.doFollow();
        }
      }, {
        text: '转移给他人',
        onClick() {
          self.doTransfer();
        }
      }, {
        text: '放弃该用户',
        onClick() {
          self.doGiveup();
        }
      }], [{
        text: '取消'
      }]];
      f7app.actions(buttons);
    }
  }
});
