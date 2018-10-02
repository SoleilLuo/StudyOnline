var Bmob = require("../../utils/Bmob-1.6.3.min.js");
var Util = require("../../utils/util.js");
var that;
var app = getApp();

Page({

  data: {
    grids: [{
        name: '概述',
        path: "./detail/detail",
        chapter: "第一章",
        num: 0
      },
      {
        name: '物理层',
        path: "./detail/detail",
        chapter: "第二章",
        num: 0
      },
      {
        name: '数据链路层',
        path: "./detail/detail",
        chapter: "第三章",
        num: 0
      },
      {
        name: '网络层',
        path: "./detail/detail",
        chapter: "第四章",
        num: 0
      },
      {
        name: '运输层',
        path: "./detail/detail",
        chapter: "第五章",
        num: 0
      },
      {
        name: '应用层',
        path: "./detail/detail",
        chapter: "第六章",
        num: 0
      },
      {
        name: '网络安全',
        path: "./detail/detail",
        chapter: "第七章",
        num: 0
      },
      {
        name: '音视频服务',
        path: "./detail/detail",
        chapter: "第八章",
        num: 0
      },
      {
        name: '无线移动网络',
        path: "./detail/detail",
        chapter: "第九章",
        num: 0
      },
      {
        name: '下一代因特网',
        path: "./detail/detail",
        chapter: "第十章",
        num: 0
      }
    ],
    weChatUserInfo: null,
    bmobUserInfo: null,
    testChooseItems: {},
    answerInfo: {}
  },
  onLoad: function() {
    that = this;
    that.setData({
      weChatUserInfo: wx.getStorageSync('weChatUserInfo'),
      bmobUserInfo: wx.getStorageSync('bmobUserInfo')
    });
    //console.log(that.data.bmobUserInfo);
    that.getTestChooseItems();
  },
  onShow: function() {
    that.getAnswerInfo();
  },
  // 获得排名信息
  getAnswerInfo: function() {
    wx.showToast({
      title: '加载中..',
      icon: 'loading',
      duration: 10000
    })
    let query = Bmob.Query('test_error_item');
    query.find().then(res => {
      let userArray = [];
      let correctCount = 0;
      res.forEach((item, index) => {
        if (item.userId.objectId == that.data.bmobUserInfo.objectId) {
          if (item.result) correctCount += 1;
          userArray.unshift(item);
        }
      });
      wx.hideToast();
      that.setData({
        answerInfo: {
          correctCount: correctCount,
          itemCount: userArray.length,
          correctE: (correctCount / userArray.length).toFixed(2)
        }
      });
    }).catch();
  },
  getTestChooseItems: function() {
    wx.showToast({
      title: '加载中..',
      icon: 'loading',
      duration: 10000
    })
    let query = Bmob.Query('choose_item');
    // 过滤掉课堂测试和模拟测试题目
    query.equalTo("type", "!=", "课堂测试");
    query.equalTo("type", "!=", "模拟测试");
    query.find().then(res => {
      //console.log(res);
      for (var i = 0; i < that.data.grids.length; i++) {
        let chapterChooseItems = []
        for (var j = 0; j < res.length; j++) {
          if (that.data.grids[i].chapter == res[j].series) {
            chapterChooseItems.unshift(res[j]);
          }
        }
        that.data.testChooseItems[that.data.grids[i].chapter] = chapterChooseItems;
        that.data.grids[i].num = chapterChooseItems.length;
        that.data.grids[i].path += '?ChooseItems=' + JSON.stringify(chapterChooseItems);
      }
      that.setData({
        grids: that.data.grids,
        testChooseItems: that.data.testChooseItems
      });
      //获得答题结果信息
      that.getAnswerInfo();
    });
  }
})