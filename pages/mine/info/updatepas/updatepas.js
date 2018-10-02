// pages/mine/info/updatepas/updatepas.js
var Bmob = require("../../../../utils/Bmob-1.6.3.min.js");
var Util = require("../../../../utils/util.js");
var md5 = require("../../../../utils/md5.js");
import WxValidate from '../../../../utils/WxValidate.js';
var wxValidate = "";
var that;
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bmobUserInfo: null
  },
  updatePasswordSubmit:function(e){
    //验证form表单格式是否合法
    var rules = {
      oldPassword: {
        required: true,
        
      },
      newPassword: {
        required: true,
        minlength: 8,
        
      },
      newPasswordAgain: {
        required: true,
        minlength: 8,
      }
    };
    var message = {
      oldPassword: {
        required: '旧密码不能为空',
      },
      newPassword: {
        required: '新密码不能为空',
        minlength: '新密码长度8-16位',
      },
      newPasswordAgain: {
        required: '确认密码不能为空',
        minlength: '确认密码长度8-16位',
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
    // 再次验证密码
    var oldPassword = e.detail.value.oldPassword;
    var newPassword = e.detail.value.newPassword;
    var newPasswordAgain = e.detail.value.newPasswordAgain;
    if (!Util.checkPassword(newPassword)){
      wx.showToast({
        title: '密码为字母数字组合',
        icon: 'success',
        duration: 3000
      });
      return;
    }
    if (!Util.checkPassword(newPasswordAgain)) {
      wx.showToast({
        title: '密码为字母数字组合',
        icon: 'success',
        duration: 3000
      });
      return;
    }
    if (newPassword != newPasswordAgain){
      wx.showToast({
        title: '再次密码不一致',
        icon: 'success',
        duration: 3000
      });
      return;
    }
    // 验证数据完成更新密码
    let objectId = that.data.bmobUserInfo.objectId;
    let data = {
      oldPassword: md5.hexMD5(app.globalData.hexMd5Salt + oldPassword),
      newPassword: md5.hexMD5(app.globalData.hexMd5Salt + newPassword)
    }
    wx.showToast({
      title: '正在更新...',
      icon:'loading',
      duration:10000
    })
    Bmob.updateUserPassword(objectId, data).then(res => {
      if(res.msg == 'ok'){
        wx.hideToast();
        wx.showToast({
          title: '密码修改成功',
          icon: 'loading',
          duration: 2500
        });
        // 结束当前页面返回上一页面
        wx.navigateBack({
          delta: 1
        })
      }
    }).catch(err => {
      console.log(err)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({
      bmobUserInfo:wx.getStorageSync('bmobUserInfo')
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})