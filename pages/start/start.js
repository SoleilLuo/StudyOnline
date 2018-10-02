//login.js
var Bmob = require("../../utils/Bmob-1.6.3.min.js");
var md5 = require("../../utils/md5.js");
import WxValidate from '../../utils/WxValidate.js';
var wxValidate = "";
var that;
//获取应用实例
var app = getApp();
Page({

  data: {
    remind: '加载中',
    angle: 0,
    userInfo: null
  },

  loginInfoSubmit: function(e) {

    //验证form表单格式是否合法
    const rules = {
      student_id: {
        required: true,
        minlength: 10
      },
      password: {
        required: true,
      }
    };
    const message = {
      student_id: {
        required: '请输入学号',
        minlength: '学号长度10-11位'
      },
      password: {
        required: '请输入密码',
      }
    };
    // 获得验证实例
    wxValidate = new WxValidate(rules, message);

    if (!wxValidate.checkForm(e)) {
      var error = wxValidate.errorList[0]
      //提示信息
      console.log(error);
      wx.showToast({
        title: error.msg,
        icon: 'success',
        duration: 3000
      });
      return false;
    }
    wx.removeStorageSync('weChatUserInfo');
    wx.showToast({
      title: '正在登录...',
      icon: 'loading',
      duration: 1000
    });

    // 设定定时器，直到获得到用户信息才执行登录逻辑
    var loginResult = setInterval(function() {

      if (that.data.userInfo == null) {
        wx.showToast({
          title: '正在登录...',
          icon: 'loading',
          duration: 1000
        });
      } else {
        // 把微信用户信息缓存到本地
        wx.setStorageSync('weChatUserInfo', that.data.userInfo);
        wx.showToast({
          title: '正在登录...',
          icon: 'loading',
          duration: 10000
        });
        // 登录实现
        Bmob.User.login(e.detail.value.student_id, md5.hexMD5(app.globalData.hexMd5Salt + e.detail.value.password)).then(res => {
          // 清除定时器
          clearInterval(loginResult);
          //wx.hideToast();
          wx.removeStorageSync('bmobUserInfo');
          
          if (app.globalData.currentUser == null ) {
            var query = Bmob.Query('_User');
            query.get(res.objectId).then(resUser => {
              //console.log(resUser);
              // 把bmob用户信息缓存到本地
              wx.setStorageSync('bmobUserInfo', resUser);
              resUser.set('avatarUrl', that.data.userInfo.avatarUrl);
              resUser.save();
              wx.hideToast();
              // 重定向到主页，携带userInfo
              wx.switchTab({
                url: "../main/main",
                success: function() {
                  app.setGlobalData({
                    userInfo: wx.getStorageSync('weChatUserInfo'),
                    currentUser: wx.getStorageSync('bmobUserInfo')
                  });
                }
              });
            }).catch(err => {
              console.log(err)
            })
          }

          // 重定向到主页，携带userInfo
          // wx.switchTab({
          //   url: "../main/main", success: function () {
          //     app.setGlobalData({ userInfo: that.data.userInfo });
          //   }
          // });
        }).catch(err => {
          // 清除定时器
          clearInterval(loginResult);
          wx.hideToast();
          wx.showToast({
            title: '账号或密码错误',
            duration: 3000
          });
        });
      }
    }, 1000);


  },
  onLoad: function() {
    that = this;
    
  },
  //获取微信信息
  getUserInfo: function(e) {
    that.setData({
      userInfo: e.detail.userInfo
    });

  },
  onShow: function() {

  },
  onReady: function() {
    setTimeout(function() {
      that.setData({
        remind: ''
      });
    }, 1000);
    wx.onAccelerometerChange(function(res) {
      var angle = -(res.x * 30).toFixed(1);
      if (angle > 14) {
        angle = 14;
      } else if (angle < -14) {
        angle = -14;
      }
      if (that.data.angle !== angle) {
        that.setData({
          angle: angle
        });
      }
    });
  },
});