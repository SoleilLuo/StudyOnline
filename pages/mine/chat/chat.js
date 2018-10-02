var Bmob = require("../../../utils/Bmob-1.6.3.min.js");
var Util = require("../../../utils/util.js");
var that;
var app = getApp();
Page({
  data: {
    message: [],
    inputMsg: "",
    scrollTop: 0,
    weChatUserInfo: null,
    bmobUserInfo: null,
    newMessageUpdatedTime: null
  },
  onLoad: function(options) {
    that = this;
    that.setData({
      bmobUserInfo: wx.getStorageSync('bmobUserInfo'),
      weChatUserInfo: wx.getStorageSync('weChatUserInfo')
    });
    //console.log(that.data.bmobUserInfo);
    //console.log(that.data.weChatUserInfo);
    let chatInfo = JSON.parse(options.chatInfo);
    //console.log(chatInfo);
    //let message = wx.getStorageSync('message');
    let top = chatInfo.length * 100;
    that.setData({
      message: chatInfo,
      scrollTop: top
    });
    // that.setData({
    //   newMessageUpdatedTime: that.data.message[that.data.message.length - 1].updatedAt || null
    // })

  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
    // 监听消息，一秒刷新一次
    // if (that.data.newMessageUpdatedTime != null)
    //   setInterval(function() {
    //     that.reflashMessage();
    //   }, 1000);
  },
  onUnload: function() {
    if (that.data.message.length > 0)
      wx.setStorageSync('lastMessage', that.data.message[that.data.message.length - 1]);
  },

  inputMsg: function(e) {
    that.setData({
      inputMsg: e.detail.value
    })
  },
  sendMessage: function(e) {
    that.setData({
      inputMsg: e.detail.value.input
    })
    // let that = that;
    if (that.data.inputMsg != "") {
      // 把消息上传到服务器
      let query = Bmob.Query('chat');
      query.set('message', that.data.inputMsg);
      query.save().then(res => {
        query.get(res.objectId).then(res1 => {
          // 设置用户关联对象
          let userIdPointer = Bmob.Pointer('_User');
          let pointerUserId = userIdPointer.set(that.data.bmobUserInfo.objectId);
          res1.set('userId', pointerUserId);
          res1.save().then(res2 => {
            query.get(res.objectId).then(res2 => {
              // 发送信息
              that.setMessage(res2);
              that.setData({
                scrollTop: that.data.scrollTop + 300
              })
            }).catch();
          });

        }).catch();
      }).catch();
    }
  },
  setMessage: function(msg) {
    let msgList = that.data.message;
    msgList.push(msg);
    that.setData({
      message: msgList,
      inputMsg: "",
    })
  },
  // 定时1秒刷新，看是否有新的通知
  reflashMessage: function() {
    let queryNewMessage = Bmob.Query('chat');
    queryNewMessage.equalTo('createdAt', '>', that.data.newMessageUpdatedTime);
    queryNewMessage.order('-createdAt');
    queryNewMessage.find().then(resNewMessages => {
      if (resNewMessages.length > 0) {
        resNewMessages.forEach(item => {
          that.data.message.push(item);
        });
        that.setData({
          message: that.data.message
        });
      }
    }).catch();
  }
})