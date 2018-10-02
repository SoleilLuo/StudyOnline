// pages/test/detail/detail.js

var Bmob = require("../../../utils/Bmob-1.6.3.min.js");
var Util = require("../../../utils/util.js");
var that;
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bmobUserInfo: null,
    chooseItemArray: [],
    chooseType: null,
    chooseSeries: null,
    error_answers: [],
    correct_answers: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;

    // 获得题目信息
    var items = Util.sortArrayObject(JSON.parse(options.ChooseItems), 'number_id');

    var choose_items = new Array();
    for (var i = 0; i < items.length; i++) {
      if (i == 0) {
        that.setData({
          chooseType: items[0].type,
          chooseSeries: items[0].series
        });
      }
      choose_items[i] = {
        objectId: items[i].objectId,
        number_id: items[i].number_id,
        title: items[i].title,
        answer: items[i].answer,
        complain: items[i].complain,
        chooseItems: [{
            name: 'a',
            value: items[i].choose_item_a
          },
          {
            name: 'b',
            value: items[i].choose_item_b
          },
          {
            name: 'c',
            value: items[i].choose_item_c
          },
          {
            name: 'd',
            value: items[i].choose_item_d
          }
        ]
      }
    }
    that.setData({
      chooseItemArray: choose_items,
      bmobUserInfo: wx.getStorageSync('bmobUserInfo')
    });
  },
  formSubmit: function(e) {
    let answers = e.detail.value;
    for (var keyname in answers) {
      if (answers[keyname] == "") {
        wx.showToast({
          title: '还有题没答噢~',
          duration: 3000
        });
        return;
      }
    }
    let index = 0;
    let error_answers = [];
    let correct_answers = [];
    for (var answer in answers) {
      if (answers[answer] != that.data.chooseItemArray[index].answer) {
        error_answers.unshift({
          userId: that.data.bmobUserInfo.objectId,
          choose_item_id: that.data.chooseItemArray[index].objectId,
          answer: answers[answer],
          number_id: that.data.chooseItemArray[index].number_id,
          complain: that.data.chooseItemArray[index].complain,
          result: false
        });
      } else {
        correct_answers.unshift({
          userId: that.data.bmobUserInfo.objectId,
          choose_item_id: that.data.chooseItemArray[index].objectId,
          answer: answers[answer],
          number_id: that.data.chooseItemArray[index].number_id,
          complain: that.data.chooseItemArray[index].complain,
          result: true
        });
      }
      index += 1;
    }
    that.setData({
      error_answers: error_answers,
      correct_answers: correct_answers
    });
    // 开始上传题目
    that.deleteItems(that.data.correct_answers, that.data.error_answers);
  },
  /**
   * 把答对的题目从错误表删除再上传错误的题目
   * correct_answers是答对的题目
   * error_answers是答错的题目
   */
  deleteItems: function(correct_answers, error_answers) {
    wx.showToast({
      title: '提交中...',
      icon: 'loading',
      duration: 10000
    });
    let answers = correct_answers.concat(error_answers);

    answers.forEach((answer, index) => {
      //console.log(index);
      let query = Bmob.Query('test_error_item');
      // 设置用户关联对象
      let userIdPointer = Bmob.Pointer('_User');
      let pointerUserId = userIdPointer.set(answer.userId);
      // 设置选择题关联对象
      let chooseItemIdPointer = Bmob.Pointer('choose_item'); //关联字段
      let pointerIdChooseItemId = chooseItemIdPointer.set(answer.choose_item_id);
      query.equalTo('userId', '==', pointerUserId);
      query.equalTo('choose_item_id', '==', pointerIdChooseItemId);
      query.find().then(res => {
        if (res.length > 0)
          res.destroyAll().then(res1 => {
            //console.log(answers.length);
            if (index == answers.length - 1) {
              //console.log('if' + index);
              // 全部删除相同的题目后上传新的题目
              that.uploadItems(correct_answers, error_answers);
            }
          }).catch(err => {
            wx.hideToast();
            wx.showToast({
              title: '提交失败',
              duration: 2500
            })
          })
        else {
          if (index == answers.length - 1) {
            // 全部删除相同的题目后上传新的题目
            that.uploadItems(correct_answers, error_answers);
          }
        }
      }).catch(err => {
        wx.hideToast();
        //console.log(err);
        wx.showToast({
          title: '提交失败',
          duration: 2500
        })
      });
    });
  },
  //上传答题信息
  uploadItems: function(correct_answers, error_answers) {
    var answers = correct_answers.concat(error_answers);
    let query = Bmob.Query('test_error_item');
    answers.forEach((answer, index) => {
      query.set('answer', answer.answer);
      query.set('result', answer.result);
      query.save().then(res => {
        query.get(res.objectId).then(res1 => {
          // 设置用户关联对象
          var userIdPointer = Bmob.Pointer('_User');
          var pointerUserId = userIdPointer.set(answer.userId);
          res1.set('userId', pointerUserId);
          // 设置选择题关联对象
          var chooseItemIdPointer = Bmob.Pointer('choose_item'); //关联字段
          var pointerIdChooseItemId = chooseItemIdPointer.set(answer.choose_item_id);
          res1.set('choose_item_id', pointerIdChooseItemId);
          res1.save();
          // 如果到数组的最后一个
          if (index == answers.length - 1) {
            wx.hideToast();
            wx.showToast({
              title: '提交成功...',
              duration: 2500
            });
            setTimeout(function() {
              var mAnswers = Util.sortArrayObject(answers, 'number_id');

              // 结束当前页面转到
              wx.redirectTo({
                url: '../answer/answer?mAnswers=' + JSON.stringify({
                  chooseType: that.data.chooseType,
                  chooseSeries: that.data.chooseSeries,
                  chooseItemArray: that.data.chooseItemArray,
                  answers: mAnswers
                })
              });
            }, 2500);
          }
        }).catch();
      }).catch();

    });
  }
})