const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function obj2uri(obj) {
  return Object.keys(obj).map(function (k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
  }).join('&');
}


//字符串转换为时间戳
function getDateTimeStamp(dateStr) {
  return Date.parse(dateStr.replace(/-/gi, "/"));
}
//格式化时间
function getDateDiff(dateStr) {
  var publishTime = getDateTimeStamp(dateStr) / 1000,
    d_seconds,
    d_minutes,
    d_hours,
    d_days,
    timeNow = parseInt(new Date().getTime() / 1000),
    d,

    date = new Date(publishTime * 1000),
    Y = date.getFullYear(),
    M = date.getMonth() + 1,
    D = date.getDate(),
    H = date.getHours(),
    m = date.getMinutes(),
    s = date.getSeconds();
  //小于10的在前面补0
  if (M < 10) {
    M = '0' + M;
  }
  if (D < 10) {
    D = '0' + D;
  }
  if (H < 10) {
    H = '0' + H;
  }
  if (m < 10) {
    m = '0' + m;
  }
  if (s < 10) {
    s = '0' + s;
  }

  d = timeNow - publishTime;
  d_days = parseInt(d / 86400);
  d_hours = parseInt(d / 3600);
  d_minutes = parseInt(d / 60);
  d_seconds = parseInt(d);

  if (d_days > 0 && d_days < 3) {
    return d_days + '天前';
  } else if (d_days <= 0 && d_hours > 0) {
    return d_hours + '小时前';
  } else if (d_hours <= 0 && d_minutes > 0) {
    return d_minutes + '分钟前';
  } else if (d_seconds < 60) {
    if (d_seconds <= 0) {
      return '刚刚';
    } else {
      return d_seconds + '秒前';
    }
  } else if (d_days >= 3 && d_days < 30) {
    return M + '-' + D + ' ' + H + ':' + m;
  } else if (d_days >= 30) {
    return Y + '-' + M + '-' + D + ' ' + H + ':' + m;
  }
}
/**
 * newDate:new Date()
 */
function formatYearMonthDay(newDate){
  let myddy = newDate.getDay();
  let weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  let dateStr = formatTime(newDate);
  let parts = dateStr.split(' ');
  let ymd = parts[0].split('-');
  let hms = parts[1].split(':');
  return ymd[0] + '年' + ymd[1] + '月' + ymd[2] + '日 ' + weekdays[myddy] +' '+hms[0]+'时'+hms[1]+'分';
}
function buttonClicked(self) {
  self.setData({
    buttonClicked: true
  })
  setTimeout(function () {
    self.setData({
      buttonClicked: false
    })
  }, 500)
}
function getData() {
  wx.request({
    url: 'http://vzan.com/f/s-1',
    data: {},
    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    success: function (res) {
      // success
    },
    fail: function () {
      // fail
    },
    complete: function () {
      // complete
    }
  })
}

// 举报
function tipOff(user) {
  console.info("举报");
}

//计算两经纬度之间的距离，返回单位米
function getDistance(lat1, lng1, lat2, lng2) {
  lat1 = lat1 || 0;
  lng1 = lng1 || 0;
  lat2 = lat2 || 0;
  lng2 = lng2 || 0;
  var rad1 = lat1 * Math.PI / 180.0;
  var rad2 = lat2 * Math.PI / 180.0;
  var a = rad1 - rad2;
  var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  var r = 6378137;
  return (r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)))).toFixed(0);
}
// 验证手机号
function checkMobile(sMobile) {
  if (!(/^1[3|5][0-9]\d{4,8}$/.test(sMobile)))
    return false;
  return true;
}
// 验证邮箱
function checkEmail(sEmail){
  var emailReg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
  if (!emailReg.test(sEmail))
    return false;
  return true;
}
// 验证密码为字母和数字组合
function checkPassword(sPassword) {
  var passwordReg = /^(?!([a-zA-Z]+|\d+)$)[a-zA-Z\d]{8,16}$/;
  if (!passwordReg.test(sPassword))
    return false;
  return true;
}
// 根据数组对象的某个属性排序
function sortArrayObject(array,attribute){
  var compare = function (prop) {
    return function (obj1, obj2) {
      var val1 = obj1[prop];
      var val2 = obj2[prop];
      if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
        val1 = Number(val1);
        val2 = Number(val2);
      }
      if (val1 < val2) {
        return -1;
      } else if (val1 > val2) {
        return 1;
      } else {
        return 0;
      }
    }
  }
  return array.sort(compare(attribute))
}

// 暴露方法
module.exports = {
  formatTime: formatTime,
  getDateDiff: getDateDiff,
  formatYearMonthDay: formatYearMonthDay,
  buttonClicked: buttonClicked,
  tipOff: tipOff,
  getDistance: getDistance,
  checkMobile: checkMobile,
  checkEmail: checkEmail,
  checkPassword: checkPassword,
  sortArrayObject:sortArrayObject
}

