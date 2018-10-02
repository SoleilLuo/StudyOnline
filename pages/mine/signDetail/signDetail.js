// pages/mine/signDetail/signDetail.js
var Bmob = require("../../../utils/Bmob-1.6.3.min.js");
var Util = require("../../../utils/util.js");
var that;
Page({

  /**
   * Page initial data
   */
  data: {
    dateTime:null,
    bmobUserInfo: null,
    signList:null
  },


  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    that = this;
    //console.log(Util.getDateDiff(Util.formatTime(new Date())));
    that.setData({
      dateTime: Util.formatYearMonthDay(new Date()),
      bmobUserInfo: wx.getStorageSync('bmobUserInfo')
    });
    that.getMySignList();
  },
  getMySignList:function(){
    wx.showToast({
      title: '加载中...',
      icon:'loading',
      duration:10000
    })
    let query = Bmob.Query('sign_record');
    let userIdPointer = Bmob.Pointer('_User');
    let pointerUserId = userIdPointer.set(that.data.bmobUserInfo.objectId);
    query.equalTo('userId','==',pointerUserId);
    query.order('-numberNo');
    query.find().then(res=>{
      wx.hideToast()
      that.setData({
        signList:res
      });
    });
  },
  // list item点击事件
  clickSignItem:function(e){
    let id = e.currentTarget.id;
    that.data.signList.forEach((item)=>{
      if(item.objectId == id){
        wx.navigateTo({
          url: './signItemDetail/signItemDetail?signItemInfo='+JSON.stringify(item)
        })
      }
    });
  },
  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})