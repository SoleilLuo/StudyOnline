//wx-drawer
var Bmob = require("../../utils/Bmob-1.6.3.min.js");
var Util = require("../../utils/util.js");
var that;

var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    weChatUserInfo: null,
    bmobUserInfo: null,
    // 当前菜单索引
    menuIndex: 0,
    // 轮播图对应视频信息
    vedioData: [],
    // 轮播图对应图片地址
    vedioImgUrls: [],
    // 菜单选项
    selectedScrollItems: ['签到', '课堂测试', '模拟测试', '课堂提问', '答问记录'],
    // 菜单选项隐藏和显示标志
    selectedScrollItemsHiddenSign: [false, true, true, true, true],
    // 菜单选项首次加载完成标志
    selectedScrollItemsLoadingComplete: [true, false, false, false, false],
    // 有没有最新课堂测试的标志
    haveLateTestOnline:true,
    // 有没有最新模拟测试的标志
    haveLateTestsimulate: true,
    // 课堂测试选择题题目信息列表
    onlineTestChooseItems: null,
    // 模拟测试选择题题目信息列表
    simulateTestChooseItems: null,
    // 课堂测试试题系列
    onlineTestSeries: null,
    // 模拟测试试题系列
    simulateTestSeries: null,
    // 模拟主观题题目信息列表
    onlineTestSelfQuestionItems: null,
    // 模拟主观题题目信息列表
    simulateTestSelfQuestionItems: null,
    // 模拟主观题答题图片路径列表
    simulateAnswerImgPaths: [],
    // 主观题答题图片路径列表
    answerImgPaths: [],
    // 签到记录列表
    mSignRecord: [],
    // 签到次数
    signNumer: null,
    // 签到标记
    signFlag: null
  },
  // 模拟测试提交的表单数据
  formSubmitsimulate:function(e){
    var value = e.detail.value;
    for (var keyname in value) {
      if (value[keyname] == "") {
        wx.showToast({
          title: '还有题没答噢~',
          duration: 3000
        });
        return;
      }
    }
    //poiID User表Pointer对象
    var pointer = Bmob.Pointer('_User');
    var poiID = pointer.set(app.globalData.currentUser.objectId);
    var query = Bmob.Query('submit_record')
    //userId 字段名称关联用户表 ，类型Pointer
    query.equalTo("userId", "==", poiID);
    query.equalTo("series", "==", this.data.simulateTestSeries);
    query.equalTo("type", "==", '模拟测试');
    query.find().then(res => {
      if (res.length > 0) {
        wx.showToast({
          title: '您已提交过啦~',
          duration: 2000
        });
        return;
      } else {
        that.uploadAnswersInfo(value,'模拟测试');
      }
    });
  },
  // 课堂测试提交的表单数据
  formSubmit: function(e) {
    var value = e.detail.value;
    for (var keyname in value) {
      if (value[keyname] == "") {
        wx.showToast({
          title: '还有题没答噢~',
          duration: 3000
        });
        return;
      }
    }
    //poiID User表Pointer对象
    var pointer = Bmob.Pointer('_User');
    var poiID = pointer.set(app.globalData.currentUser.objectId);
    var query = Bmob.Query('submit_record')
    //userId 字段名称关联用户表 ，类型Pointer
    query.equalTo("userId", "==", poiID);
    query.equalTo("series", "==", this.data.onlineTestSeries);
    query.equalTo("type", "==", '课堂测试');
    query.find().then(res => {
      if (res.length > 0) {
        wx.showToast({
          title: '您已提交过啦~',
          duration: 2000
        });
        return;
      } else {
        that.uploadAnswersInfo(value,'课堂测试');
      }
    });

  },
  /**
   * 上传所有答案信息
   * value是表单提交上来的信息
   */
  uploadAnswersInfo: function(value,testType) {
    // 显示加载loading
    wx.showToast({
      title: '提交中...',
      icon: 'loading',
      duration: 1000
    });
    // 上传题目结果列表
    var allUploadSuccess = [];
    // 选择题索引
    var chooseItemIndex = 0;
    // 主观题索引
    var subjectiveItemIndex = 0;
    // 遍历submit提交的数据
    for (var keyname in value)
      if (value[keyname] != "") {
        //console.log(value.keyname);
        // 判断是否是单选题
        var data = {};
        if (keyname.indexOf('choose-radio-group') != -1) {
          data = {
            userId: app.globalData.currentUser.objectId,
            
            file: null,
            answer: value[keyname]
          }
          if(testType == '课堂测试'){
            data.chooseItemId = that.data.onlineTestChooseItems[chooseItemIndex].objectId;
          }
          else{
            data.chooseItemId = that.data.simulateTestChooseItems[chooseItemIndex].objectId;
          }
          allUploadSuccess[chooseItemIndex + subjectiveItemIndex] = that.uploadAItemAnswersInfo(data, 'choose');
          chooseItemIndex++;
        } else {
          var fileName = null;
          if (testType == '课堂测试') {
            if (that.data.answerImgPaths[subjectiveItemIndex] != null) fileName = that.data.answerImgPaths[subjectiveItemIndex].file;
          }
          else {
            if (that.data.simulateAnswerImgPaths[subjectiveItemIndex] != null) fileName = that.data.simulateAnswerImgPaths[subjectiveItemIndex].file;
          }
          data = {
            userId: app.globalData.currentUser.objectId,
            file: fileName,
            answer: value[keyname]
          }
          if (testType == '课堂测试') {
            data.subjectItemId = that.data.onlineTestSelfQuestionItems[subjectiveItemIndex].objectId;
          }
          else {
            data.subjectItemId = that.data.simulateTestSelfQuestionItems[subjectiveItemIndex].objectId;
          }
          allUploadSuccess[chooseItemIndex + subjectiveItemIndex] = that.uploadAItemAnswersInfo(data, 'subjective');
          subjectiveItemIndex++;
        }
      }
    // 定时监听所有返回结果
    var checkResult = setInterval(function() {
      if (testType == '课堂测试') {
        if (allUploadSuccess.length == that.data.onlineTestChooseItems.length + that.data.onlineTestSelfQuestionItems.length) {
          var allUploadSuccessFlag = true;
          for (var i = 0; i < allUploadSuccess.length; i++) {
            if (allUploadSuccess[i] == false) {
              allUploadSuccessFlag = false;
              if (i > that.data.onlineTestChooseItems.length)
                wx.showToast({
                  title: '第' + (i + 1) + '选择题上传失败',
                  duration: 1000
                });
              else {
                wx.showToast({
                  title: '第' + (i + 1 - that.data.onlineTestChooseItems.length) + '主观题上传失败',
                  duration: 1000
                });
              }
            }
          }
          // 清除定时器
          clearInterval(checkResult);
          wx.hideToast();
          // 所有题目都成功提交
          if (allUploadSuccessFlag) {
            // 上传提交记录
            var query = Bmob.Query('submit_record');
            query.set("type", '课堂测试');
            query.set('series', that.data.onlineTestSeries.series);
            query.set('numberNo', that.data.onlineTestSeries.numberNo);
            query.save().then(res => {
              query.get(res.objectId).then(res1 => {
                var pointer = Bmob.Pointer('_User');
                var poiID = pointer.set(app.globalData.currentUser.objectId);
                res1.set('userId', poiID);
                res1.save();
                // 显示加载logo
                wx.showToast({
                  title: '提交成功',
                  duration: 3000
                });
              }).catch(err => { });
            }).catch(err => { });
          }
        } else {
          wx.showToast({
            title: '提交中...',
            icon: 'loading',
            duration: 1000
          });
        }
      }else{
        if (allUploadSuccess.length == that.data.simulateTestChooseItems.length + that.data.simulateTestSelfQuestionItems.length) {
          var allUploadSuccessFlag = true;
          for (var i = 0; i < allUploadSuccess.length; i++) {
            if (allUploadSuccess[i] == false) {
              allUploadSuccessFlag = false;
              if (i > that.data.simulateTestChooseItems.length)
                wx.showToast({
                  title: '第' + (i + 1) + '选择题上传失败',
                  duration: 1000
                });
              else {
                wx.showToast({
                  title: '第' + (i + 1 - that.data.simulateTestChooseItems.length) + '主观题上传失败',
                  duration: 1000
                });
              }
            }
          }
          // 清除定时器
          clearInterval(checkResult);
          wx.hideToast();
          // 所有题目都成功提交
          if (allUploadSuccessFlag) {
            // 上传提交记录
            var query = Bmob.Query('submit_record');
            query.set("type", '模拟测试');
            query.set('series', that.data.simulateTestSeries.series);
            query.set('numberNo', that.data.simulateTestSeries.numberNo);
            query.save().then(res => {
              query.get(res.objectId).then(res1 => {
                var pointer = Bmob.Pointer('_User');
                var poiID = pointer.set(app.globalData.currentUser.objectId);
                res1.set('userId', poiID);
                res1.save();
                // 显示加载logo
                wx.showToast({
                  title: '提交成功',
                  duration: 3000
                });
              }).catch(err => { });
            }).catch(err => { });
          }
        } else {
          wx.showToast({
            title: '提交中...',
            icon: 'loading',
            duration: 1000
          });
        }
      }
    }, 1000);
  },
  /**
   * 上传单个题信息
   * value是题目信息
   * itemType是题目类型
   */
  uploadAItemAnswersInfo: function(value, itemType) {
    var query = Bmob.Query('choose_item_submit');
    query.set("answer", value.answer);
    if (value.file != null)
      query.set("subjectiveImg", value.file);
    // 先保存answer和上传成功的图片信息
    query.save().then(res => {
      query.get(res.objectId).then(res1 => {
        // 保存关联对象
        // 设置用户关联对象
        var userIdPointer = Bmob.Pointer('_User');
        var pointerUserId = userIdPointer.set(value.userId);
        res1.set('userId', pointerUserId);
        if (itemType == 'choose') {
          // 设置选择题关联对象
          var chooseItemIdPointer = Bmob.Pointer('choose_item'); //关联字段
          var pointerIdChooseItemId = chooseItemIdPointer.set(value.chooseItemId);
          res1.set('chooseItemId', pointerIdChooseItemId);
          // 设置后保存
          res1.save();
        } else {
          // 设置主观题关联对象
          var subjectItemIdPointer = Bmob.Pointer('subjective_item'); //关联字段
          var pointerIdSubjectItemId = subjectItemIdPointer.set(value.subjectItemId);
          res1.set('subjectiveItemId', pointerIdSubjectItemId);
          res1.save();
        }
        return true;
      });
    }).catch(err => {
      wx.showToast({
        title: '上传失败',
        duration: 2000
      });
      return false;
    });

  },
  swiperItemClick: function(e) {
    var vedioSeries = new Array();
    var index = 0;
    // 判断是同一个系列课程
    for (var i = 0; i < this.data.vedioData.length; i++) {
      if (this.data.vedioData[i].series == this.data.vedioImgUrls[e.currentTarget.id].series) {
        vedioSeries[index++] = this.data.vedioData[i];
      }
    }
    // 把vedioSeries传给视频播放页面
    wx.navigateTo({
      url: '../vedioPlayer/vedioPlayer?vedioSeries=' + JSON.stringify(vedioSeries),
    });
  },
  // 横向滑动菜单
  scrollMenuClick: function(e) {
    //console.log(e);
    // 隐藏其他页面并显示当前点击的菜单页面
    for (var i = 0; i < this.data.selectedScrollItemsHiddenSign.length; i++) {
      if (i == e.currentTarget.id) this.data.selectedScrollItemsHiddenSign[i] = false;
      else this.data.selectedScrollItemsHiddenSign[i] = true;
    }

    this.setData({
      menuIndex: e.currentTarget.id,
      selectedScrollItemsHiddenSign: this.data.selectedScrollItemsHiddenSign
    });

    // 显示加载logo
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    });

    // 选中第一个菜单
    if (e.currentTarget.id == 0) {
      if (that.data.selectedScrollItemsLoadingComplete[e.currentTarget.id]) {
        wx.hideToast();
        return;
      }

    } // 选中第二个菜单，加载课堂测试题
    else if (e.currentTarget.id == 1) {
      if (that.data.selectedScrollItemsLoadingComplete[e.currentTarget.id]) {
        wx.hideToast();
        return;
      }
      that.getPracticeItemsInfo(e.currentTarget.id, '课堂测试');
    }
    // 选中第三个菜单
    else if (e.currentTarget.id == 2) {
      if (that.data.selectedScrollItemsLoadingComplete[e.currentTarget.id]) {
        wx.hideToast();
        return;
      }
      that.getPracticeItemsInfo(e.currentTarget.id, '模拟测试');
    }
    // 选中第四个菜单
    else if (e.currentTarget.id == 3) {
      setTimeout(function() {
        wx.hideToast()
      }, 3000);
    }
    // 选中最后一个菜单
    else {
      setTimeout(function() {
        wx.hideToast()
      }, 3000);
    }
  },

  // 获得当前用户的签到记录
  getSignRecord: function() {
    wx.showToast({
      title: '更新签到记录',
      icon: 'loading',
      duration: 10000
    });

    // 1、查询老师的ID
    var queryTeacher = Bmob.Query('_User');
    queryTeacher.equalTo("userType", '==', 1);
    queryTeacher.find().then(resTeacher => {
      var teacher = resTeacher[0];
      // 2、查询老师的签到记录
      var queryTeacherSignRecord = Bmob.Query('sign_record');
      queryTeacherSignRecord.order("-numberNo");
      var teacherPointer = Bmob.Pointer('_User')
      var teacherPointId = teacherPointer.set(teacher.objectId);
      queryTeacherSignRecord.equalTo("userId", '==', teacherPointId);
      queryTeacherSignRecord.find().then(resTeacherSignRecord => {
        // 老师无签到记录，学生肯定也没有签到记录
        if (resTeacherSignRecord.length == 0) {
          wx.hideToast();
          return;
        }
        // 签到记录
        var signRecord = [];
        // 如果是老师用户，直接显示
        if (app.globalData.currentUser.userType == 1) {
          for (var i = 0; i < resTeacherSignRecord.length; i++) {
            signRecord[i] = {
              date: resTeacherSignRecord[i].createdAt.split(' ')[0],
              numberNo: resTeacherSignRecord[i].numberNo,
              signFlag: true
            }
          }
          wx.hideToast();
          //把记录保存并渲染界面
          that.setData({
            mSignRecord: signRecord
          });
        }
        // 如果是学生用户
        else {
          // 3、查询学生签到记录
          var queryStudentSignRecord = Bmob.Query('sign_record');
          queryStudentSignRecord.order("-numberNo");
          var pointer = Bmob.Pointer('_User');
          var poiID = pointer.set(app.globalData.currentUser.objectId);
          queryStudentSignRecord.equalTo("userId", '==', poiID);
          queryStudentSignRecord.find().then(resStudentSignRecord => {
            //console.log(resStudentSignRecord);
            // 学生的签到记录和老师的一样，说明学生每次都完成签到
            if (resStudentSignRecord.length == resTeacherSignRecord.length) {
              for (var i = 0; i < resStudentSignRecord.length; i++) {
                signRecord[i] = {
                  date: resTeacherSignRecord[i].createdAt.split(' ')[0],
                  numberNo: resTeacherSignRecord[i].numberNo,
                  signFlag: true
                }
              }
            }
            // 学生少签到则以老师签到为准
            else {
              for (var i = 0; i < resTeacherSignRecord.length; i++) {
                var flag = false;
                // 老师的签到在学生的签到表中，说明学生签到了
                if (that.isNumberNoInStudentSignRecord(resTeacherSignRecord[i].numberNo, resStudentSignRecord) == true) {
                  flag = true;
                }
                // 提示有最新签到
                if (i == resTeacherSignRecord.length - 1) {
                  that.setData({
                    signFlag: flag,
                    signNumber: i + 1
                  });
                }
                signRecord[i] = {
                  date: resTeacherSignRecord[i].createdAt.split(' ')[0],
                  numberNo: resTeacherSignRecord[i].numberNo,
                  signFlag: flag
                }
              }
            }
            wx.hideToast();
            //把记录保存并渲染界面
            that.setData({
              mSignRecord: signRecord
            });
            // 不再刷新
            that.data.selectedScrollItemsLoadingComplete[0] = true;
            that.setData({
              selectedScrollItemsLoadingComplete: that.data.selectedScrollItemsLoadingComplete
            });
          }).catch(err => {});
        }
      }).catch(err => {});
    }).catch(err => {});


  },
  /* 判断老师的签到记录中的一个NumberNo是否在学生的签到记录中
    resStudentSignRecord是签到表查询时返回的json格式
  */
  isNumberNoInStudentSignRecord: function(signRecordNumberNo, resStudentSignRecord) {
    for (var i = 0; i < resStudentSignRecord.length; i++)
      if (resStudentSignRecord[i].numberNo == signRecordNumberNo) return true;
    return false;
  },
  // 签到
  sign: function() {
    // 发起签到
    // 1、先上传当前自己的定位经纬度
    // 2、学生查询老师的最后一次签到记录，如果发现签到记录signComplete为false说明有新的签到
    // 3、得到签到的第几次课
    // 4、系统获得学生的定位经纬度
    // 5、判断两点经纬度转换成距离是否在100米以内，如果是则可以签到否则不能签到

    // 签到完成
    // 1、老师端选择结束签到
    // 2、老师更新最后一次签到signComplete为true


    wx.showToast({
      title: '正在获取位置信息..',
      icon: 'loading',
      duration: 10000
    });
    // 1、获取位置
    wx.getLocation({
      type: 'wgs84',
      success: function(resLocation) {
        // 2、设置当前用户的经纬度信息
        var queryUser = Bmob.Query('_User');
        queryUser.get(app.globalData.currentUser.objectId).then(resUser => {
          var point = Bmob.GeoPoint({
            latitude: resLocation.latitude,
            longitude: resLocation.longitude
          })
          resUser.set('location', point);
          resUser.save();
          //3、查询签到表老师最近一次签到
          var queryTeacher = Bmob.Query('_User');
          queryTeacher.equalTo("userType", '==', 1);
          queryTeacher.find().then(resTeacher => {
            var teacher = resTeacher[0];
            var teacherPointer = Bmob.Pointer('_User')
            var teacherPoiID = teacherPointer.set(teacher.objectId)
            var teacherQuerySign = Bmob.Query('sign_record');
            //userId 字段名称关联用户表 ，类型Pointer
            teacherQuerySign.equalTo("userId", "==", teacherPoiID);
            teacherQuerySign.order("-numberNo");
            teacherQuerySign.limit(1);
            teacherQuerySign.find().then(resTeacherSign => {
              wx.hideToast();
              // 如果没有记录，说明学生当前不用签到，老师可以发起签到
              if (resTeacherSign.length == 0) {
                // 如果当前用户是老师
                if (app.globalData.currentUser.userType == 1) {
                  wx.showModal({
                    title: '提示',
                    content: '您确定发起签到吗',
                    success: function(resModal) {
                      if (resModal.confirm) {
                        wx.showToast({
                          title: '发起中..',
                          icon: 'loading',
                          duration: 10000
                        });
                        teacherQuerySign.set('numberNo', 1);
                        teacherQuerySign.set('signComplete', false);
                        teacherQuerySign.save().then(resTeacherSignSave => {
                          teacherQuerySign.get(resTeacherSignSave.objectId).then(resSignSaveUser => {
                            var userIdPointer = Bmob.Pointer('_User');
                            var pointerUserId = userIdPointer.set(app.globalData.currentUser.objectId);
                            resSignSaveUser.set('userId', pointerUserId);
                            resSignSaveUser.save();
                            // 签到结束刷新签到记录
                            that.getSignRecord();
                            wx.hideToast();
                          });
                        }).catch(err => {
                          console.log(err)
                        });
                      }
                    }
                  });
                }
                // 如果是学生
                else {
                  wx.showToast({
                    title: '当前无需签到~',
                    duration: 2500
                  });
                  return;
                }
              }
              //有签到记录
              else {
                var teacherSignRecordItem = resTeacherSign[0];
                if (app.globalData.currentUser.userType == 1) {
                  wx.hideToast();
                  wx.showModal({
                    title: '提示',
                    content: '您确定发起签到吗',
                    success: function(resModal) {
                      if (resModal.confirm) {
                        wx.showToast({
                          title: '发起中..',
                          icon: 'loading',
                          duration: 10000
                        });
                        teacherQuerySign.set('numberNo', teacherSignRecordItem.numberNo + 1);
                        teacherQuerySign.set('signComplete', false);
                        teacherQuerySign.save().then(resTeacherSignSave => {
                          teacherQuerySign.get(resTeacherSignSave.objectId).then(resSignSaveUser => {
                            var userIdPointer = Bmob.Pointer('_User');
                            var pointerUserId = userIdPointer.set(app.globalData.currentUser.objectId);
                            resSignSaveUser.set('userId', pointerUserId);
                            resSignSaveUser.save();
                            // 签到结束刷新签到记录
                            that.getSignRecord();
                            wx.hideToast();
                          });
                        }).catch(err => {
                          console.log(err)
                        });
                      }
                    }
                  })
                }
                // 如果是学生
                else {
                  // 如果最后一次签到已经结束则提示最近一次签到结束
                  if (teacherSignRecordItem.signComplete == true) {
                    wx.showToast({
                      title: '最新签到已结束~',
                      duration: 2500
                    });
                    return;
                  } else {
                    wx.showToast({
                      title: '查询是否签到中..',
                      icon: 'loading',
                      duration: 10000
                    });
                    // 查询是不是已经签到过了
                    var queryHaveSign = Bmob.Query('sign_record');
                    var pointerHaveSign = Bmob.Pointer('_User')
                    var poiIDHaveSign = pointerHaveSign.set(app.globalData.currentUser.objectId);
                    queryHaveSign.equalTo("userId", '==', poiIDHaveSign);
                    queryHaveSign.equalTo("numberNo", '==', teacherSignRecordItem.numberNo);
                    queryHaveSign.find().then(resHaveSign => {
                      wx.hideToast();
                      // 如果最新一次课已经签到
                      if (resHaveSign.length > 0) {
                        wx.showToast({
                          title: '您已签到过了~',
                          duration: 2500
                        });
                        return;
                      }
                      // 如果最新一次课没有签到
                      else {
                        wx.showToast({
                          title: '获取老师位置中..',
                          icon: 'loading',
                          duration: 10000
                        });
                        // 判断和老师端的距离，小于100米才能签到
                        var teacherLocation = teacher.location;
                        var distance = Util.getDistance(resLocation.latitude, resLocation.longitude, teacherLocation.latitude, teacherLocation.longitude);
                        //距离老师签到点100米内可以签到否则不能
                        if (distance < 100) {
                          teacherQuerySign.set('numberNo', teacherSignRecordItem.numberNo);
                          teacherQuerySign.set('signComplete', false);
                          teacherQuerySign.save().then(resTeacherSignSave => {
                            teacherQuerySign.get(resTeacherSignSave.objectId).then(resSignSaveUser => {
                              var userIdPointer = Bmob.Pointer('_User');
                              var pointerUserId = userIdPointer.set(app.globalData.currentUser.objectId);
                              resSignSaveUser.set('userId', pointerUserId);
                              resSignSaveUser.save();
                              // 签到结束刷新签到记录
                              that.getSignRecord();
                              wx.hideToast();
                              wx.showToast({
                                title: '恭喜你完成签到啦~',
                                duration: 2500
                              });
                            });
                          }).catch(err => {
                            console.log(err)
                          });
                        } else {
                          wx.hideToast();
                          wx.showToast({
                            title: '您距离老师太远啦~',
                            duration: 2500
                          });
                          return;
                        }
                      }
                    }).catch(err => {});
                  }
                }
              }
            }).catch(err => {});
          }).catch(err => {});
        });
      }
    });
  },
  // 监听签到更新
  updateListenerSignRecordChange: function() {
    var query = Bmob.Query('sign_record');
    query.order('-numberNo');
    query.limit(1);
    query.find().then(res => {
      console.log(res);
    }).catch(err => {});
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    that.setData({
      bmobUserInfo: wx.getStorageSync('bmobUserInfo'),
      weChatUserInfo: wx.getStorageSync('weChatUserInfo')
    });
    // 加载视频轮播信息
    that.getVedioInfo();
    // 加载签到列表
    that.getSignRecord();

  },
  //获得轮播的视频信息
  getVedioInfo: function() {
    wx.showToast({
      title: '正在加载...',
      icon: 'loading',
      duration: 10000
    })
    let query = Bmob.Query('course_vedio');
    query.find().then(res => {
      var imgUrls = new Array();
      for (var i = 0; i < res.length; i++) {
        if (res[i].thumbnail != null && imgUrls.indexOf(res[i].series) == -1)
          imgUrls[i] = res[i];
      }
      wx.hideToast();
      that.setData({
        vedioData: res,
        vedioImgUrls: imgUrls
      });
    });
  },
  /**
   * 获得课堂测试答题信息
   * id为scroll-view menu中已经加载完成的index
   * testType为测试类型，可以是课堂测试、模拟测试或者其他，以服务器中的数据为参照
   */
  getPracticeItemsInfo: function(id, testType) {
    // 1、查询老师的id
    // 2、查询submit_record表老师的最新提交信息
    // 3、查询老师的最新提交信息numberNo + 1 即为最新的测试
    let queryTeacher = Bmob.Query('_User');
    queryTeacher.equalTo('userType','==',1);
    queryTeacher.find().then(resTeacher=>{
      let teacher = resTeacher[0];
      let queryTeacherSubmitRecord = Bmob.Query('submit_record');
      queryTeacherSubmitRecord.order('-numberNo');
      queryTeacherSubmitRecord.limit(3);
      queryTeacherSubmitRecord.equalTo('type', '==', testType);
      queryTeacherSubmitRecord.find().then(resTeacherSubmitRecord=>{
        // 如果老师收卷过，得到最新的numberNo
        if(resTeacherSubmitRecord.length>0){
          let lateNumberNo = resTeacherSubmitRecord[0].numberNo;
          // 用lateNumberNo + 1去查询最新的测试
          let query_choose = Bmob.Query('choose_item');
          query_choose.order('number_id');
          query_choose.equalTo("type", "==", testType);
          query_choose.equalTo('numberNo', '==', lateNumberNo + 1);
          query_choose.find().then(res => {
            // 没有最新的测试
            if(res.length == 0){
              wx.hideToast();
              if (testType == '课堂测试')
                that.setData({
                  haveLateTestOnline: false
                });
              else that.setData({
                haveLateTestsimulate: false
              });
              return;
            }
            if (res.length > 0) {
              if (testType == '课堂测试') that.setData({
                onlineTestSeries: {
                  series:res[0].series,
                  numberNo:res[0].numberNo
                }
              });
              else that.setData({
                simulateTestSeries: {
                  series: res[0].series,
                  numberNo: res[0].numberNo
                }
              });
            }
            var choose_items = new Array();
            for (var i = 0; i < res.length; i++) {
              choose_items[i] = {
                objectId: res[i].objectId,
                number_id: res[i].number_id,
                title: res[i].title,
                chooseItems: [{
                  name: 'a',
                  value: res[i].choose_item_a
                },
                {
                  name: 'b',
                  value: res[i].choose_item_b
                },
                {
                  name: 'c',
                  value: res[i].choose_item_c
                },
                {
                  name: 'd',
                  value: res[i].choose_item_d
                }
                ]
              }
            }
            let query_subjective = Bmob.Query('subjective_item');
            query_subjective.order('number_id');
            query_subjective.equalTo("type", "==", testType);
            query_subjective.equalTo('numberNo', '==', lateNumberNo + 1);
            query_subjective.find().then(res_subjective => {
              var subjective_items = new Array();
              for (var i = 0; i < res_subjective.length; i++) {
                subjective_items[i] = {
                  objectId: res_subjective[i].objectId,
                  number_id: res_subjective[i].number_id,
                  title: res_subjective[i].title
                };
              }
              that.data.selectedScrollItemsLoadingComplete[id] = true;
              that.setData({
                selectedScrollItemsLoadingComplete: that.data.selectedScrollItemsLoadingComplete
              });
              if (testType == '课堂测试') that.setData({
                onlineTestChooseItems: choose_items,
                onlineTestSelfQuestionItems: subjective_items
              });
              else that.setData({
                simulateTestChooseItems: choose_items,
                simulateTestSelfQuestionItems: subjective_items
              });
              wx.hideToast();
            }).catch(err => {
              wx.hideToast();
              //console.log(err.msg);
              wx.showToast({
                title: '加载出错',
                duration: 2000
              });
            });
          }).catch(err => {
            wx.hideToast();
            console.log(err);
            wx.showToast({
              title: '加载出错',
              duration: 2000
            });
          });
        }else{
          // 直接查询第一次测试
          let query_choose = Bmob.Query('choose_item');
          query_choose.order('number_id');
          query_choose.equalTo("type", "==", testType);
          query_choose.equalTo('numberNo', '==', 1);
          query_choose.find().then(res => {
            // 没有最新的测试
            if (res.length == 0) {
              wx.hideToast();
              if (testType == '课堂测试')
              that.setData({
                haveLateTestOnline: false
              });
              else that.setData({
                haveLateTestsimulate: false
              });
              return;
            }
            if (res.length > 0) {
              if (testType == '课堂测试') that.setData({
                onlineTestSeries: res[0].series
              });
              else that.setData({
                simulateTestSeries: res[0].series
              });
            }
            var choose_items = new Array();
            for (var i = 0; i < res.length; i++) {
              choose_items[i] = {
                objectId: res[i].objectId,
                number_id: res[i].number_id,
                title: res[i].title,
                chooseItems: [{
                  name: 'a',
                  value: res[i].choose_item_a
                },
                {
                  name: 'b',
                  value: res[i].choose_item_b
                },
                {
                  name: 'c',
                  value: res[i].choose_item_c
                },
                {
                  name: 'd',
                  value: res[i].choose_item_d
                }
                ]
              }
            }
            let query_subjective = Bmob.Query('subjective_item');
            query_subjective.order('number_id');
            query_subjective.equalTo("type", "==", testType);
            query_subjective.equalTo('numberNo', '==', 1);
            query_subjective.find().then(res_subjective => {
              var subjective_items = new Array();
              for (var i = 0; i < res_subjective.length; i++) {
                subjective_items[i] = {
                  objectId: res_subjective[i].objectId,
                  number_id: res_subjective[i].number_id,
                  title: res_subjective[i].title
                };
              }
              that.data.selectedScrollItemsLoadingComplete[id] = true;
              that.setData({
                selectedScrollItemsLoadingComplete: that.data.selectedScrollItemsLoadingComplete
              });
              if (testType == '课堂测试') that.setData({
                onlineTestChooseItems: choose_items,
                onlineTestSelfQuestionItems: subjective_items
              });
              else that.setData({
                simulateTestChooseItems: choose_items,
                simulateTestSelfQuestionItems: subjective_items
              });
              wx.hideToast();
            }).catch(err => {
              wx.hideToast();
              wx.showToast({
                title: '加载出错',
                duration: 2000
              });
            });
          }).catch(err => {
            wx.hideToast();
            console.log(err);
            wx.showToast({
              title: '加载出错',
              duration: 2000
            });
          });
        }
      });
    });
    
  },
  // 模拟测试主观题选择答题拍照或者图片
  chooseAnswerImagesimulate:function(e){
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original'], // 指定是原图
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        // 如果该题已经上传答题图片则先删除原先的图片
        var currentAnswerImgPathsItem = that.data.simulateAnswerImgPaths[e.currentTarget.id];
        if (currentAnswerImgPathsItem != null) {
          // 传入string是单个文件删除，传入array是批量删除
          var del = Bmob.File();
          del.destroy([currentAnswerImgPathsItem.file.url]).then(res1 => {
            that.uploadAnswerImg(e.currentTarget.id, res.tempFilePaths[0]);
          }).catch(err => {
            console.log(err);
            wx.showToast({
              title: '图片上传失败',
              duration: 2000
            })
          })
        } else {
          that.uploadAnswerImg(e.currentTarget.id, res.tempFilePaths[0],'模拟测试');
        }
      }
    });
  },
  // 课堂测试主观题选择答题拍照或者图片
  chooseAnswerImage: function(e) {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original'], // 指定是原图
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        // 如果该题已经上传答题图片则先删除原先的图片
        var currentAnswerImgPathsItem = that.data.answerImgPaths[e.currentTarget.id];
        if (currentAnswerImgPathsItem != null) {
          // 传入string是单个文件删除，传入array是批量删除
          var del = Bmob.File();
          del.destroy([currentAnswerImgPathsItem.file.url]).then(res1 => {
            that.uploadAnswerImg(e.currentTarget.id, res.tempFilePaths[0]);
          }).catch(err => {
            console.log(err);
            wx.showToast({
              title: '图片上传失败',
              duration: 2000
            })
          })
        } else {
          that.uploadAnswerImg(e.currentTarget.id, res.tempFilePaths[0],'课堂测试');
        }
      }
    });
  },
  uploadAnswerImg: function (pathId, pathImg, itemType) {
    // 上传选中的图片
    var file = Bmob.File('subjectImg.jpg', pathImg);
    wx.showToast({
      title: '正在上传',
      icon: 'loading',
      duration: 10000
    });
    file.save().then(res => {
      wx.hideToast();
      wx.showToast({
        title: '图片上传成功',
        duration: 2000
      })
      if(itemType == '课堂测试'){
      that.data.answerImgPaths[pathId] = {
        path: pathImg,
        file: res[0]
      };
      that.setData({
        answerImgPaths: that.data.answerImgPaths
      });
      }
      else{
        that.data.simulateAnswerImgPaths[pathId] = {
          path: pathImg,
          file: res[0]
        };
        that.setData({
          simulateAnswerImgPaths: that.data.simulateAnswerImgPaths
        });
      }
    }).catch(err => {
      console.log(err);
      wx.showToast({
        title: '图片上传失败',
        duration: 2000
      })
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})