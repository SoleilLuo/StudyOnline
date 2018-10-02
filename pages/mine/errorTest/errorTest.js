// pages/mine/errorTest/errorTest.js
var Bmob = require("../../../utils/Bmob-1.6.3.min.js");
var Util = require("../../../utils/util.js");
var that;
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    grids: [{
        name: '概述',
        path: "../../test/detail/detail",
        chapter: "第一章",
        num: 0
      },
      {
        name: '物理层',
        path: "../../test/detail/detail",
        chapter: "第二章",
        num: 0
      },
      {
        name: '数据链路层',
        path: "../../test/detail/detail",
        chapter: "第三章",
        num: 0
      },
      {
        name: '网络层',
        path: "../../test/detail/detail",
        chapter: "第四章",
        num: 0
      },
      {
        name: '运输层',
        path: "../../test/detail/detail",
        chapter: "第五章",
        num: 0
      },
      {
        name: '应用层',
        path: "../../test/detail/detail",
        chapter: "第六章",
        num: 0
      },
      {
        name: '网络安全',
        path: "../../test/detail/detail",
        chapter: "第七章",
        num: 0
      },
      {
        name: '音视频服务',
        path: "../../test/detail/detail",
        chapter: "第八章",
        num: 0
      },
      {
        name: '无线移动网络',
        path: "../../test/detail/detail",
        chapter: "第九章",
        num: 0
      },
      {
        name: '下一代因特网',
        path: "../../test/detail/detail",
        chapter: "第十章",
        num: 0
      }
    ],
    weChatUserInfo: null,
    bmobUserInfo: null,
    error: null,
    errorChooseItems: [],
    answerInfo: {}
  },
  getErrorTestChooseItems: function() {
    let res = that.data.error;
    // 解析
    for (var i = 0; i < that.data.grids.length; i++) {
      let chapterChooseItems = []
      for (var j = 0; j < res.length; j++) {
        if (that.data.grids[i].chapter == res[j].choose_item_id.series) {
          chapterChooseItems.unshift(res[j].choose_item_id);
        }
      }
      that.data.errorChooseItems[that.data.grids[i].chapter] = chapterChooseItems;
      that.data.grids[i].num = chapterChooseItems.length;
      that.data.grids[i].path += '?ChooseItems=' + JSON.stringify(chapterChooseItems);
    }
    that.setData({
      grids: that.data.grids,
      errorChooseItems: that.data.errorChooseItems
    });

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    that.setData({
      error: JSON.parse(options.error),
      weChatUserInfo: wx.getStorageSync('weChatUserInfo'),
      bmobUserInfo: wx.getStorageSync('bmobUserInfo')
    });
    that.getErrorTestChooseItems();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})