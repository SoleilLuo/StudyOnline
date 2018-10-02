var Bmob = require("../../utils/Bmob-1.6.3.min.js");
var Util = require("../../utils/util.js");
var that;
var app = getApp();
Page({
  data: {
    weChatUserInfo: null,
    bmobUserInfo: null,
    // 错题信息
    errorInfo: {},
    // 测试记录
    testRecordInfo: {},
    // 课堂问答记录
    answerRecordInfo: {},
    // 通知信息
    chatInfo: {
      newMessageCount: 0,
      path: null
    },
    // 课堂提问
    questionInfo:{
      path:'./named/named'
    }
  },
  // 课堂提问
  classQuestion: function() {
    // 弹出从底部弹出菜单

  },
  // // 结束签到
  // endSign: function() {
  //   // 确定结束最新一次签到吗？点击确定即结束
    
  // },
  // 课堂测试收卷
  classTestEnd: function() {
    // 确定结束本次课堂测试吗？点击确定即结束
    // 查询主观表最新测试是否有老师，如果有,提示已经收卷，没有则写入
    wx.showModal({
      title: '课堂测试收卷提示',
      content: '您确定要收卷吗',
      success: function (resModal) {
        if (resModal.confirm) {
          wx.showToast({
            title: '收卷中...',
            icon: 'loading',
            duration: 10000
          })
          let queryNumberNo = Bmob.Query('subjective_item');
          queryNumberNo.equalTo('type','==','课堂测试');
          queryNumberNo.order('-numberNo');
          queryNumberNo.limit(3);
          queryNumberNo.find().then(resNumberNo=>{
            if (resNumberNo.length==0){
              wx.hideToast();
              wx.showToast({
                title: '还没有发布课堂测试噢',
                duration:2500
              })
              return;
            }
            // 得到最新的第几次测试
            let numberNo = resNumberNo[0].numberNo;
            // 去查询submit_record表是是否有这次测试的记录
            let querySubmitRecord = Bmob.Query('submit_record');
            querySubmitRecord.equalTo('type', '==', '课堂测试');
            querySubmitRecord.equalTo('numberNo','==',numberNo);
            let userIdPointer = Bmob.Pointer('_User');
            let pointerUserId = userIdPointer.set(that.data.bmobUserInfo.objectId);
            querySubmitRecord.equalTo('userId', '==', pointerUserId);
            querySubmitRecord.find().then(resSubmitRecord=>{
              // 如果找到说明已经完成收卷
              if(resSubmitRecord.length>0){
                wx.hideToast()
                wx.showToast({
                  title: '您已经收卷过了...',
                  duration:2500
                })
              }
              else{
                // 没有找到说明要提交个新的记录已经完成收卷
                let newQuerySubmitRecord = Bmob.Query('submit_record');
                newQuerySubmitRecord.set('numberNo',numberNo);
                newQuerySubmitRecord.set('type','课堂测试');
                newQuerySubmitRecord.save().then(resNewQuerySubmitRecord=>{
                  newQuerySubmitRecord.get(resNewQuerySubmitRecord.objectId).then(resGetNewQuerySubmitRecord=>{
                    resGetNewQuerySubmitRecord.set('userId', pointerUserId);
                    resGetNewQuerySubmitRecord.save();
                    wx.hideToast()
                  });
                });
              }
            });
          });
        }
      }
    })
  },
  // 模拟测试收卷
  modelTestEnd: function() {
    // 确定结束本次模拟测试吗？点击确定即结束
    // 确定结束本次课堂测试吗？点击确定即结束
    // 查询主观表最新测试是否有老师，如果有,提示已经收卷，没有则写入
    wx.showModal({
      title: '课堂测试收卷提示',
      content: '您确定要收卷吗',
      success: function (resModal) {
        if (resModal.confirm) {
          wx.showToast({
            title: '收卷中...',
            icon: 'loading',
            duration: 10000
          })
          let queryNumberNo = Bmob.Query('subjective_item');
          queryNumberNo.equalTo('type', '==', '模拟测试');
          queryNumberNo.order('-numberNo');
          queryNumberNo.limit(3);
          queryNumberNo.find().then(resNumberNo => {
            if (resNumberNo.length == 0) {
              wx.hideToast();
              wx.showToast({
                title: '还没有发布模拟测试噢',
                duration: 2500
              })
              return;
            }
            // 得到最新的第几次测试
            let numberNo = resNumberNo[0].numberNo;
            // 去查询submit_record表是是否有这次测试的记录
            let querySubmitRecord = Bmob.Query('submit_record');
            querySubmitRecord.equalTo('type', '==', '模拟测试');
            querySubmitRecord.equalTo('numberNo', '==', numberNo);
            let userIdPointer = Bmob.Pointer('_User');
            let pointerUserId = userIdPointer.set(that.data.bmobUserInfo.objectId);
            querySubmitRecord.equalTo('userId', '==', pointerUserId);
            querySubmitRecord.find().then(resSubmitRecord => {
              // 如果找到说明已经完成收卷
              if (resSubmitRecord.length > 0) {
                wx.hideToast()
                wx.showToast({
                  title: '您已经收卷过了...',
                  duration: 2500
                })
              }
              else {
                // 没有找到说明要提交个新的记录已经完成收卷
                let newQuerySubmitRecord = Bmob.Query('submit_record');
                newQuerySubmitRecord.set('numberNo', numberNo);
                newQuerySubmitRecord.set('type', '模拟测试');
                newQuerySubmitRecord.save().then(resNewQuerySubmitRecord => {
                  newQuerySubmitRecord.get(resNewQuerySubmitRecord.objectId).then(resGetNewQuerySubmitRecord => {
                    resGetNewQuerySubmitRecord.set('userId', pointerUserId);
                    resGetNewQuerySubmitRecord.save();
                    wx.hideToast()
                  });
                });
              }
            });
          });
        }
      }
    })
  },

  // 获得通知信息，只有老师端才能发通知，学生端只能查看
  getChatInfo: function() {
    wx.showToast({
      title: '正在加载...',
      icon: 'loading',
      duration: 10000
    })
    // 只有老师账号才能发起通知
    // 查找表的最新一条数据
    let queryNewMessageCount = Bmob.Query('chat');
    let message = wx.getStorageSync('lastMessage');
    // 有缓存消息
    if (message != null || message != undefined) {
      queryNewMessageCount.equalTo('createdAt', '>', message.updatedAt);
    }
    //queryNewMessageCount.order('-createdAt');
    queryNewMessageCount.count().then(resNewMessageCount => {
      let queryNewMessage = Bmob.Query('chat');
      queryNewMessage.include('userId', '_User');
      queryNewMessage.order('createdAt');
      queryNewMessage.find().then(resNewMessage => {
        wx.hideToast();
        that.setData({
          chatInfo: {
            newMessageCount: resNewMessageCount,
            path: './chat/chat?chatInfo=' + JSON.stringify(resNewMessage)
          }
        });
      }).catch();
    }).catch();
    // let queryMyMessages = Bmob.Query('chat');
    // // queryMyMessages.include('userId', '_User');
    // // 设置用户关联对象
    // let userIdPointer = Bmob.Pointer('_User');
    // let pointerUserId = userIdPointer.set(that.data.bmobUserInfo.objectId);
    // queryMyMessages.equalTo('userId', '==', pointerUserId);
    // queryMyMessages.order('-createdAt');
    // queryMyMessages.find().then(resMyMessages => {
    //   let newMessageCount = 0;
    //   //console.log(resMyMessages);
    //   // 如果自己发过消息
    //   if (resMyMessages.length > 0) {
    //     // 找到最后一条消息的时间
    //     // 查找列表中是否有比自己最后一条消息更新的消息
    //     let queryNewMessage = Bmob.Query('chat');
    //     queryNewMessage.equalTo('createdAt', '>', resMyMessages[0].updatedAt);
    //     queryNewMessage.order('-createdAt');
    //     queryNewMessage.find().then(resNewMessage => {
    //       //console.log(resNewMessage);
    //       newMessageCount = resNewMessage.length;
    //       // 查找表中所有消息
    //       let queryAllMessage = Bmob.Query('chat');
    //       queryAllMessage.find().then(resAllMessage => {
    //         wx.hideToast();
    //         that.setData({
    //           chatInfo: {
    //             newMessageCount: newMessageCount,
    //             path: './chat/chat?chatInfo=' + JSON.stringify(resAllMessage)
    //           }
    //         });
    //       }).catch();

    //     }).catch();
    //   }
    //   // 如果自己打开过通知窗口，记录上次最后一条消息
    //   else {
    //     // 查看聊天缓存是否有消息
    //     let message = wx.getStorageSync('lastMessage');
    //     // 有缓存消息
    //     if (messages.length > 0) {
    //       // 找到最后一条消息的时间
    //       // 查找列表中是否有比最后一条消息更新的消息
    //       let queryNewMessage = Bmob.Query('chat');
    //       queryNewMessage.equalTo('createdAt', '>', message.updatedAt);
    //       queryNewMessage.order('-createdAt');
    //       queryNewMessage.find().then(resNewMessage => {
    //         newMessageCount = resNewMessage.length;
    //         // 查找表中所有消息
    //         let queryAllMessage = Bmob.Query('chat');
    //         queryAllMessage.find().then(resAllMessage => {
    //           wx.hideToast();
    //           that.setData({
    //             chatInfo: {
    //               newMessageCount: newMessageCount,
    //               path: './chat/chat?chatInfo=' + JSON.stringify(resAllMessage)
    //             }
    //           });
    //         }).catch();
    //       }).catch();
    //     }
    //     // 没有缓存消息
    //     else {
    //       // 直接查找所有消息
    //       let queryAllMessage = Bmob.Query('chat');
    //       queryAllMessage.find().then(resAllMessage => {
    //         wx.hideToast();
    //         that.setData({
    //           chatInfo: {
    //             newMessageCount: resAllMessage.length,
    //             path: './chat/chat?chatInfo=' + JSON.stringify(resAllMessage)
    //           }
    //         });
    //       }).catch();
    //     }
    //   }
    // }).catch();
  },
  // 获得错题列表
  getErrorCount: function() {
    wx.showToast({
      title: '正在加载...',
      icon: 'loading',
      duration: 10000
    })
    let query = Bmob.Query('test_error_item');
    query.include('choose_item_id', 'choose_item');
    query.find().then(res => {
      let errorArray = [];
      let errorCount = 0;
      res.forEach((item, index) => {
        if (item.userId.objectId == that.data.bmobUserInfo.objectId) {
          if (!item.result) {
            errorCount += 1;
            errorArray.unshift(item);
          }
        }
      });
      wx.hideToast();
      that.setData({
        errorInfo: {
          errorPath: './errorTest/errorTest?error=' + JSON.stringify(errorArray),
          errorCount: errorCount
        }
      });
    }).catch();
  },
  // 获得测试记录
  getTestRecord: function() {
    wx.showToast({
      title: '正在加载...',
      icon: 'loading',
      duration: 10000
    });
    let query = Bmob.Query('submit_record');
    let userIdPointer = Bmob.Pointer('_User');
    let pointerUserId = userIdPointer.set(that.data.bmobUserInfo.objectId);
    query.equalTo('userId', '==', pointerUserId);
    query.find().then(res => {
      wx.hideToast();
      that.setData({
        testRecordInfo: {
          testRecordCount: res.length,
          testRecordPath: './testRecord/testRecord?testRecordInfo=' + JSON.stringify(res)
        }
      });
    }).catch();
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    that = this;
    //that.getErrorCount();
    that.setData({
      bmobUserInfo: wx.getStorageSync('bmobUserInfo'),
      weChatUserInfo: wx.getStorageSync('weChatUserInfo')
    });
  },
  onReady: function() {
    // // 页面渲染完成

  },
  onShow: function() {
    // 页面显示
    that.getChatInfo();
    // 当前用户是学生
    if (that.data.bmobUserInfo.userType == 0) {
      that.getErrorCount();
      that.getTestRecord();
    }
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭
  }
})