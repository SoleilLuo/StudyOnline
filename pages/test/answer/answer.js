// pages/test/answer/answer.js

var Bmob = require("../../../utils/Bmob-1.6.3.min.js");
var Util = require("../../../utils/util.js");
var that;
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    mAnswers:null,
    correctAnswerCount:null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({mAnswers:JSON.parse(options.mAnswers)});
    let correctCount = 0;
    that.data.mAnswers.answers.forEach((item)=>{
      if (item.result) correctCount += 1;
    });
    that.setData({ correctAnswerCount: correctCount});
  }
})