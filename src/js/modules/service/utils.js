let utilsModule = angular.module('utilsModule', ['ngCookies']);
utilsModule.factory("utils",['$cookies',function($cookies){
    return {
        commonApiFunction:function(http, configData, successCallback, errorCallback){
            var url = "http://test.zqx.chinawayltd.com/inside.php";
            var config = {
                t:'json',
                m:'',
                f:''
            };
            var conf = angular.extend(config, configData.config);
            var data = configData.data ? configData.data : {};
            http({
                method: configData.method,
                url: url,
                data: data,
                params:conf,
                headers:{
                    'Accept': 'application/json',
                    "Content-Type":"application/x-www-form-urlencoded;charset=utf-8"
                },
                transformRequest:function(data){
                    return $.param(data)
                },
                withCredentials:true,
                timeout:10000,
                cache:true
            }).then(function(response) {
                if (response.status == 200) {
                    if(response.data.code==403){
                        window.parent.location.href="/login.html";
                        return;
                    }
                    successCallback(response.data);
                }
            }, function(response) {
                if(errorCallback){
                    errorCallback(response);
                }else{
                    console.log(response);
                }
            });
        },
        serializeData:function(data){
            if (!angular.isObject(data)) {
                return ((data == null) ? "" : data.toString());
            }
            var buffer = [];
            for (var name in data) {
                if (!data.hasOwnProperty(name)) {
                    continue;
                }
                var value = data[name];
                buffer.push(
                    encodeURIComponent(name) +
                    "=" +
                    encodeURIComponent((value == null) ? "" : value)
                );
            }
            var source = buffer
                .join("&")
                .replace(/%20/g, "+");
            return (source);
        },
        throttle:function(func, wait, options) {
            var context, args, result;
            var timeout = null;
            var previous = 0;
            if (!options) options = {};
            var later = function() {
              previous = options.leading === false ? 0 : new Date().getTime();
              timeout = null;
              result = func.apply(context, args);
              if (!timeout) context = args = null;
            };
            return function() {
              var now = new Date().getTime();
              if (!previous && options.leading === false) previous = now;
              // 计算剩余时间
              var remaining = wait - (now - previous);
              context = this;
              args = arguments;
              // 当到达wait指定的时间间隔，则调用func函数
              // 精彩之处：按理来说remaining <= 0已经足够证明已经到达wait的时间间隔，但这里还考虑到假如客户端修改了系统时间则马上执行func函数。
              if (remaining <= 0 || remaining > wait) {
                // 由于setTimeout存在最小时间精度问题，因此会存在到达wait的时间间隔，但之前设置的setTimeout操作还没被执行，因此为保险起见，这里先清理setTimeout操作
                if (timeout) {
                  clearTimeout(timeout);
                  timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
              } else if (!timeout && options.trailing !== false) {
                // options.trailing=true时，延时执行func函数
                timeout = setTimeout(later, remaining);
              }
              return result;
            };
        },
        getUrlParam:function(name){
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.parent.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
        },
        getUrlCode:function(){
            let urlCode = this.getUrlParam("code");
            $cookies.put('code',urlCode);
            return $cookies.get('code');
        },
        getApiToken:function(){
            return $cookies.get("api_token");
        },
        setApiToken:function(api_token){
            $cookies.put("api_token",api_token);
        },
        deleteApiToken:function(){
            $cookies.put("api_token",'');
        },
        localStorage:{
          set : function(key, value){
              if( this.get(key) !== null )
                  this.remove(key);
              localStorage.setItem(key, value);
          },
          get : function(key){
              var v = localStorage.getItem(key);
              return v === undefined ? null : v;
          },
          remove : function(key){ localStorage.removeItem(key); },
          clear : function(){ localStorage.clear(); },
          each : function(fn){
              var n = localStorage.length, i = 0, fn = fn || function(){}, key;
              for(; i<n; i++){
                  key = localStorage.key(i);
                  if( fn.call(this, key, this.get(key)) === false )
                      break;
                  //如果内容被删除，则总长度和索引都同步减少
                  if( localStorage.length < n ){
                      n --;
                      i --;
                  }
              }
          }
       }
    }
}]);

export default utilsModule;
