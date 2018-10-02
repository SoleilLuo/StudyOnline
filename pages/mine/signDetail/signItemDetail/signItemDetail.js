// pages/mine/signDetail/signItemDetail/signItemDetail.js
var Bmob = require("../../../../utils/Bmob-1.6.3.min.js");
var Util = require("../../../../utils/util.js");
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
    // 当前签到
    signItemInfo:null,
    // // 所有学生
    // allStudents:null,
    // 所有参加签到的学生
    allSignedStudents:null,
    signedListLength:null,
    bmobUserInfo:null
  },
  // 滑动切换tab 
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  //点击tab切换 
  swichNav: function (e) {
    if (this.data.currentTab === e.target.dataset.current) {
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
    that.setData({
      signItemInfo: JSON.parse(options.signItemInfo),
      bmobUserInfo: wx.getStorageSync('bmobUserInfo')
    });
    wx.setNavigationBarTitle({
      title: '第' + that.data.signItemInfo.numberNo+'次签到详情',
    });
    // 获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    that.getAllStudents();
    //console.log(signItemInfo)
  },
  // 获得所有学生的信息列表
  getAllStudents:function(){
    wx.showToast({
      title: '加载中...',
      icon:'loading',
      duration:10000
    })
    let queryStudent = Bmob.Query('_User');
    queryStudent.equalTo('userType','==',0);
    queryStudent.find().then(resStudent=>{
      let querySign = Bmob.Query('sign_record');
      querySign.equalTo('numberNo','==',that.data.signItemInfo.numberNo);
      let userIdPointer = Bmob.Pointer('_User');
      let pointerUserId = userIdPointer.set(that.data.bmobUserInfo.objectId);
      // 不查找老师
      querySign.equalTo('userId', '!=', pointerUserId);
      querySign.include('userId','_User');
      querySign.find().then(resSign=>{
        let allStudents = [];
        resStudent.forEach((studentItem)=>{
          let isSigned = false;
          // 验证该学生是否在签到表中
          resSign.forEach((signItem) => {
            if (signItem.userId.objectId == studentItem.objectId)
              isSigned = true;
          });
          if (isSigned)
          allStudents.push({
            studentId: studentItem.username,
            name: studentItem.name,
            major: studentItem.major,
            gender: studentItem.gender,
            signed: true
          });
          else 
            allStudents.push({
              studentId: studentItem.username,
              name: studentItem.name,
              major: studentItem.major,
              gender: studentItem.gender,
              signed: false
            });
        });
        that.setData({
          allSignedStudents:allStudents,
          signedListLength: resSign.length
        });
        wx.hideToast();
      });
    });
  },
  // 结束签到
  sendCompleteSign:function(){
    wx.showModal({
      title: '结束签到提示',
      content: '您确定要结束本次签到吗',
      success: function (resModal) {
        if (resModal.confirm) {
          wx.showToast({
            title: '结束签到中...',
            icon: 'loading',
            duration: 10000
          })
          let query = Bmob.Query('sign_record');
          let userIdPointer = Bmob.Pointer('_User');
          let pointerUserId = userIdPointer.set(that.data.bmobUserInfo.objectId);
          query.equalTo('userId', '==', pointerUserId);
          query.equalTo('numberNo', '==', that.data.signItemInfo.numberNo);
          // query.order('-numberNo');
          // query.limit(3);//只查询最新的三条记录
          query.find().then(res => {
            query.get(res[0].objectId).then(res1 => {
              wx.hideToast();
              if (res1.signComplete == false) {
                res1.set('signComplete', true);
                res1.save();
                wx.showToast({
                  title: '已结束本次签到',
                  duration: 3000
                })
              }
              else {
                wx.showToast({
                  title: '本次签到已结束',
                  duration: 3000
                })
              }
            });
          });
        }
      }
    })
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