// pages/vedioPlayer.js
var Bmob = require("../../utils/Bmob-1.6.3.min.js");
var that;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    vedioItemSrc:null,
    course_series:null,
    vedioSeries:[]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var series = JSON.parse(options.vedioSeries);
    this.setData({ vedioItemSrc: series[0].vedio.url,course_series: series[0].series,vedioSeries : series});
  },
  vedioChooseClick:function(e){
    this.setData({ vedioItemSrc: this.data.vedioSeries[e.target.id].vedio.url});
  }
})