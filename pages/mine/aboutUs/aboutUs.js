// pages/mine/aboutUs/aboutUs.js
var Bmob = require("../../../utils/Bmob-1.6.3.min.js");
var that;
Page({

  /**
   * Page initial data
   */
  data: {
    bmobUserInfo: null
  },
  // 处理反馈的表单信息
  feedback: function(e) {
    let content = e.detail.value.content;
    if (content == '' || content == null) return;
    let query = Bmob.Query('feed_back');
    query.set('content', content);
    query.save().then(res => {
      let userIdPointer = Bmob.Pointer('_User');
      let pointerUserId = userIdPointer.set(that.data.bmobUserInfo.objectId);
      query.get(res.objectId).then(res1 => {
        res1.set('userId', pointerUserId);
        res1.save();
        // 返回上个页面
        wx.navigateBack({
          delta: 1
        })
      });
    }).catch();
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {
    that = this;
    that.setData({
      bmobUserInfo: wx.getStorageSync('bmobUserInfo')
    });
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function() {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function() {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function() {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function() {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function() {

  }
})