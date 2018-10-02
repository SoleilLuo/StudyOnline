// pages/mine/named/named.js
// pages/mine/testRecord/testRecord.js
var Bmob = require("../../../utils/Bmob-1.6.3.min.js");
var Util = require("../../../utils/util.js");

var that;
Page({

  /**
   * Page initial data
   */
  data: {
    //页面配置 
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    currentTab: 0,
    // 学生信息列表
    studentsInfo:null,
    questionAnswers:null
  },
  // 滑动切换tab 
  bindChange: function (e) {
    that.setData({ currentTab: e.detail.current });
  },
  //点击tab切换 
  swichNav: function (e) {
    if (e.target.dataset.current == 3) that.getQuestionAnswers();
    if (that.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    that = this;
    // 获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    that.getUserInfo();
  },
  // 获得问答记录信息
  getQuestionAnswers:function(){
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 10000
    })
    let query = Bmob.Query('question_record');
    query.include('userId','_User');
    query.order('-numberNo');
    query.find().then(res => {
      wx.hideToast()
      that.setData({
        questionAnswers:res
      })
    });
  },
  // 获得所有学生信息
  getUserInfo:function(){
    wx.showToast({
      title: '加载中...',
      icon:'loading',
      duration:10000
    })
    let query = Bmob.Query('_User');
    query.equalTo('userType','==',0);
    query.find().then(res=>{
      wx.hideToast()
      that.setData({
        studentsInfo:res
      });
      console.log(that.data.studentsInfo);
    });

  },
  // 点击学生item
  clickStudent:function(e){
    let studentId = e.currentTarget.id;
    that.data.studentsInfo.forEach((item)=>{
      if(item.objectId == studentId){
        wx.showModal({
          title: '指定提示',
          content: '您确定要让'+item.name+'同学回答吗',
          success: function (resModal) {
            if (resModal.confirm) {
              that.saveAnItem(item,'主动指定')
            }
          }
        })
      }
    });
  },
  // 随机发起问答
  sendQuestion:function(e){
    let rangeId = Math.floor(that.data.studentsInfo.length * Math.random());
    wx.showModal({
      title: '随机指定提示',
      content: '您确定要发起随机指定同学回答吗',
      success: function (resModal) {
        if (resModal.confirm) {
          that.saveAnItem(that.data.studentsInfo[rangeId],'随机指定')
        }
      }
    })
  },
  // 发起抢答
  sendQuiclQuestion:function(){
    wx.showModal({
      title: '发起抢答提示',
      content: '您确定要发起抢答吗',
      success: function (resModal) {
        if (resModal.confirm) {
          that.saveAnItem(null, '抢答指定')
        }
      }
    })
  },
  /**
   * item为学生list的item，如果传入null说明是在发起一个抢答
   * questionType为问答类型
   */
  saveAnItem:function(item,questionType){
    wx.showToast({
      title: '指定中...',
      icon:'loading',
      duration:10000
    })
    let query = Bmob.Query('question_record');
    query.order('-numberNo');
    query.limit(1);
    query.find().then(res => {
      if (res.length == 0) {
        query.set('numberNo', 1);
        query.set('type', questionType);
        query.set('complete', false);
        query.save().then(resItem => {
          query.get(resItem.objectId).then(resSaveItem => {
            let userIdPointer = Bmob.Pointer('_User');
            let pointerUserId = userIdPointer.set(item.objectId);
            resSaveItem.set('userId', pointerUserId);
            resSaveItem.save();
            wx.hideToast();
            wx.showToast({
              title: '指定到' + item.name,
              duration: 2000
            })
          });
        });
      } else {
        query.set('numberNo', res[0].numberNo + 1);
        query.set('type', questionType);
        query.set('complete', false);
        query.save().then(resItem => {
          query.get(resItem.objectId).then(resSaveItem => {
            wx.hideToast();
            if(item!=null){
              let userIdPointer = Bmob.Pointer('_User');
              let pointerUserId = userIdPointer.set(item.objectId);
              resSaveItem.set('userId', pointerUserId);
              resSaveItem.save();
              wx.showToast({
                title: '指定到' + item.name,
                duration: 2000
              })
            }
            else{
              wx.showToast({
                title: '已发起抢答',
                duration: 2000
              })
            }           
          });
        });
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