import Ember from 'ember';

export default Ember.Mixin.create({
  initPreviewImages() {
    var allimgs = $('.content-block img');
    var allimgsDom = allimgs.get();
    var urls = allimgsDom.map(function(o) {
      return $(o).attr('src');
    });

    allimgs.click(function() {
      wx.previewImage({
        current: $(this).attr('src'),
        urls
      });
    });
  }
});
