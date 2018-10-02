//app.js
var Bmob = require("utils/Bmob-1.6.3.min.js");
Bmob.initialize("3eeb1d0259acebe7e6c59cca256abc09", "af45d2753696c632a96b38ed81170340");
// var bmobSocketIo;
App({


  onLaunch: function() {
    // bmobSocketIo = new Bmob.Socket();
    // this.updateListenerSignRecord();
  },
  globalData: {
    // 微信用户信息
    /**
     * avatarUrl:"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTI50Mzniaib2icGquJEQ481rjFAzicIfz4Zwpxtv2PPH1JVj2HXicnzNWicc1DVJshc6UvOwq1iceA0pUBvQ/132"
    city:"Baise"
    country:"China"
    gender:1
    language:"zh_CN"
    nickName:"NullPointerException"
    province:"Guangxi"
     */
    userInfo: null,
    // 小程序用户信息
    currentUser: null,
    // 密码加密加盐
    hexMd5Salt:'hanxue',
  },
  setGlobalData: function(data) {
    this.globalData = data;
  }
})