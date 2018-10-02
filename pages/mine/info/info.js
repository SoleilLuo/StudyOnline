// pages/mine/info.js
var Bmob = require("../../../utils/Bmob-1.6.3.min.js");
var Util = require("../../../utils/util.js");
var that;
var app = getApp();
Page({

  data: {
    // 是否显示弹窗
    showModalStatus: false,
    // 弹窗描述
    desc: null,
    descList: {
      'school': '学校',
      'college': '学院',
      'name': '姓名',
      'major': '专业',
      'class': '班级',
      'mobilePhoneNumber': '手机号',
      'email': '邮箱'
    },
    weChatUserInfo: null,
    bmobUserInfo: null,
    date: '1988-08-08',

  },
  onLoad: function() {
    that = this;
    that.setData({
      weChatUserInfo: wx.getStorageSync('weChatUserInfo'),
      bmobUserInfo: wx.getStorageSync('bmobUserInfo')
    });
  },
  bindDateChange: function(e) {
    wx.showToast({
      title: '更新中...',
      icon: 'loading',
      duration: 10000
    });
    var query = Bmob.Query('_User');
    query.get(that.data.bmobUserInfo.objectId).then(res => {
      res.set('birthday', e.detail.value);
      res.save();
      wx.hideToast();
      //更新bombuser缓存
      that.data.bmobUserInfo['birthday'] = e.detail.value;
      that.setData({
        bmobUserInfo: that.data.bmobUserInfo
      });
      // 把bmob用户信息缓存到本地
      wx.setStorageSync('bmobUserInfo', that.data.bmobUserInfo);
      app.setGlobalData({
        currentUser: wx.getStorageSync('bmobUserInfo')
      });
    }).catch(err => {
      console.log(err)
    })

  },

  powerDrawer: function(e) {
    // 弹窗效果
    if (e.type == 'tap') {
      // 更新title
      for (var key in this.data.descList) {
        if (key == e.currentTarget.id) {
          this.setData({
            desc: this.data.descList[key]
          });
          break;
        }
      }
      // 显示弹窗
      var currentStatu = e.currentTarget.dataset.statu;
      this.util(currentStatu);
    }
    // 如果是提交上来的更改信息
    if (e.type == 'submit') {
      // 做数据更改操作
      var value = e.detail.value.inputText;
      // 验证手机号的合法性
      if (that.data.desc == '手机号') {
        if (!Util.checkMobile(value)) {
          wx.showToast({
            title: '手机号格式错误~',
            duration: 2500
          });
          return;
        }
      }
      // 验证手机号的合法性
      if (that.data.desc == '邮箱') {
        if (!Util.checkEmail(value)) {
          wx.showToast({
            title: '邮箱格式错误~',
            duration: 2500
          });
          return;
        }
      }
      // 上传value值
      for (var key in this.data.descList) {
        if (that.data.descList[key] == that.data.desc) {
          wx.showToast({
            title: '更新中...',
            icon: 'loading',
            duration: 10000
          });
          var query = Bmob.Query('_User');
          //query.set('objectId',) //需要修改的objectId
          query.get(that.data.bmobUserInfo.objectId).then(res => {
            res.set(key, value);
            res.save();
            wx.hideToast();
            //更新bombuser缓存
            that.data.bmobUserInfo[key] = value;
            that.setData({
              bmobUserInfo: that.data.bmobUserInfo
            });
            // 把bmob用户信息缓存到本地
            wx.setStorageSync('bmobUserInfo', that.data.bmobUserInfo);
            app.setGlobalData({
              currentUser: wx.getStorageSync('bmobUserInfo')
            });
          }).catch(err => {
            console.log(err)
          })
          break;
        }
      }
    }
  },
  util: function(currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 200, //动画时长
      timingFunction: "linear", //线性
      delay: 0 //0则不延迟
    });
    // 第2步：这个动画实例赋给当前的动画实例
    this.animation = animation;
    // 第3步：执行第一组动画
    animation.opacity(0).rotateX(-100).step();
    // 第4步：导出动画对象赋给数据对象储存
    this.setData({
      animationData: animation.export()
    })
    // 第5步：设置定时器到指定时候后，执行第二组动画
    setTimeout(function() {
      // 执行第二组动画
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象
      this.setData({
        animationData: animation
      })
      //关闭
      if (currentStatu == "close") {
        this.setData({
          showModalStatus: false
        });
      }
    }.bind(this), 200)
    // 显示
    if (currentStatu == "open") {
      this.setData({
        showModalStatus: true
      });
    }
  },
  // 退出登录
  logout: function() {
    wx.showModal({
      title: '退出登录',
      content: '您确定要退出登录吗',
      success: function(resModal) {
        if (resModal.confirm) {
          app.setGlobalData({
            userInfo: null,
            currentUser: null
          });
          wx.clearStorageSync();
          Bmob.User.logout();
          wx.redirectTo({
            url: '../../start/start'
          })
        }
      }
    })

  }

})