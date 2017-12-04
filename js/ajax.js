var ajaxUrl = 'http://120.77.245.43:8001/webapp';
var ajax = function(ajaxData,callback,encrypt) {
	//判断网络
	if(window.plus && plus.networkinfo.getCurrentType() === plus.networkinfo.CONNECTION_NONE) {
		plus.nativeUI.toast('似乎已断开与互联网的连接', {
			verticalAlign: 'top'
		});
		return;
	}
	//数据处理
	var state = app.getState();
	var commurl = 'http://120.77.245.43:8001/webapp/';
	var encrypt = encrypt || false;
	var dataJSON = ajaxData.data || '';
	if(encrypt){
		//需要加密 此时需要将传递过来的obj加密后再发起请求
		var getPassword = document.getElementById("getPassword");
		if(!state.data){
//			plus.nativeUI.toast('亲，请登录哟！');
			return false;
		}
		var key = state.data.key;
		dataJSON.userId = state.data.id;
		dataJSON.timestamp = Date.parse(new Date());
		//取出key相加后返回
		var hashStr = encryptAdd(dataJSON);
		//处理数据结束
		var sortStr = sortArr(hashStr);
		var hash = CryptoJS.HmacSHA1(sortStr,key);
		//前端使用HmacSHA1加密必须先将hash输出到input中才能获取正常值
		getPassword.value = hash;
		dataJSON.token=getPassword.value;
	}
	var types = ajaxData.type || 'get'; 
	var url = ajaxData.url || ''; 
		mui.ajax(commurl+url,{
		data: dataJSON,
		dataType: 'json', //服务器返回json格式数据
		type: types, //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
//		headers: {
//			'Content-Type': 'application/json'
//		},
		success: function(data) {
			 callback(data);
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(type)
			var errObj = {};
			errObj.success = 'err';
			errObj.err = type;
			callback(errObj);
		}
	});
};
//取出obj中的值，并且相加
var encryptAdd = function(dataObj){
	var dataStr = '';
	for(var key in dataObj){
		dataStr+=dataObj[key];
   } 
	return dataStr;
}
//对相加后的值排序
var sortArr = function(data){
	var len = data.length;
	var str = data;
	var tempArr = [];
	for (var i = 0; i < len; i++) {
	  tempArr.push(str.charAt(i));
	}
	tempArr = tempArr.sort();
	str = tempArr.join('');
	return str;
}

/**
 * 格式化时间的辅助类，将一个时间转换成x小时前、y天前等
 */
var dateUtils = {
	UNITS: {
		'年': 31557600000,
		'月': 2629800000,
		'天': 86400000,
		'小时': 3600000,
		'分钟': 60000,
		'秒': 1000
	},
	humanize: function(milliseconds) {
		var humanize = '';
		mui.each(this.UNITS, function(unit, value) {
			if(milliseconds >= value) {
				humanize = Math.floor(milliseconds / value) + unit + '前';
				return false;
			}
			return true;
		});
		return humanize || '刚刚';
	},
	format: function(dateStr) {
		var date = this.parse(dateStr)
		var diff = Date.now() - date.getTime();
		if(diff < this.UNITS['天']) {
			return this.humanize(diff);
		}

		var _format = function(number) {
			return(number < 10 ? ('0' + number) : number);
		};
		return date.getFullYear() + '/' + _format(date.getMonth() + 1) + '/' + _format(date.getDay()) + '-' + _format(date.getHours()) + ':' + _format(date.getMinutes());
	},
	parse: function(str) { //将"yyyy-mm-dd HH:MM:ss"格式的字符串，转化为一个Date对象
		var a = str.split(/[^0-9]/);
		return new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
	}
};
