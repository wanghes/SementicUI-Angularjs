let utilsModule = angular.module('utilsModule', ['ngCookies']);
utilsModule.factory("utils", utilsModuleFunc);
utilsModuleFunc.$inject = ['$cookies',"$http","$rootScope"];
function utilsModuleFunc($cookies, $http, $rootScope){
    return {
        commonApiFunction: function(configData, successCallback, errorCallback) {
            const url = "**********************";
            let api = configData.api;
            let data = configData.data ? configData.data : {};
            $http({
                method: configData.method,
                url: url+api,
                data,
                headers:{
                    'Accept': 'application/json',
                    "Content-Type":"application/x-www-form-urlencoded;charset=utf-8"
                },
                transformRequest(data) {
                    return $.param(data)
                },
                withCredentials:false,
                timeout:10000,
                cache:true
            }).then((response) => {
                if (response.status == 200) {
                    if(response.data.code==403){
                        window.parent.location.href="/login.html";
                        return;
                    }
                    successCallback(response.data);
                }
            }, (response) => {
                if(errorCallback){
                    errorCallback(response);
                }else{
                    console.log("打印错误输出：" + response);
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
                buffer.push( encodeURIComponent(name) + "=" + encodeURIComponent((value == null) ? "" : value));
            }
            var source = buffer.join("&").replace(/%20/g, "+");
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
        debounce :function(func, wait, immediate) {
            // immediate默认为false
            var timeout, args, context, timestamp, result;
            var later = function() {
                // 当wait指定的时间间隔期间多次调用_.debounce返回的函数，则会不断更新timestamp的值，导致last < wait && last >= 0一直为true，从而不断启动新的计时器延时执行func
                var last = new Date().getTime() - timestamp;
                if (last < wait && last >= 0) {
                    timeout = setTimeout(later, wait - last);
                } else {
                    timeout = null;
                    if (!immediate) {
                        result = func.apply(context, args);
                        if (!timeout) context = args = null;
                    }
                }
            };

            return function() {
                context = this;
                args = arguments;
                timestamp = new Date().getTime();
                // 第一次调用该方法时，且immediate为true，则调用func函数
                var callNow = immediate && !timeout;
                // 在wait指定的时间间隔内首次调用该方法，则启动计时器定时调用func函数
                if (!timeout) timeout = setTimeout(later, wait);
                if (callNow) {
                    result = func.apply(context, args);
                    context = args = null;
                }
                return result;
            };
        },
        getUrlParam:function(name){
            const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            const r = window.parent.location.search.substr(1).match(reg);
            if (r != null) {
                return unescape(r[2]);
            }
            return null;
        },
        getUrlCode() {
            const urlCode = this.getUrlParam("code");
            $cookies.put('code', urlCode);
            return $cookies.get('code');
        },
        getApiToken() {
            return $cookies.get("token");
        },
        setApiToken(api_token) {
            $cookies.put("token", api_token);
        },
        deleteApiToken() {
            $cookies.put("token",'');
        },
        getConfigMenu() {
            return $cookies.get("configMenu");
        },
        setConfigMenu(configMenu) {
            $cookies.put("configMenu", configMenu);
        },
        deleteConfigMenu() {
            $cookies.put("configMenu", '');
        },
        getMemberPositionId() {
            return $cookies.get("member_position_id");
        },
        setMemberPositionId(member_position_id) {
            $cookies.put("member_position_id", member_position_id);
        },
        deleteMemberPositionId() {
            $cookies.put("member_position_id",'');
        },
        getUserLevel() {
            return $cookies.get("userLevel");
        },
        setUserLevel(userLevel) {
            $cookies.put("userLevel", userLevel);
        },
        deleteUserLevel() {
            $cookies.put("userLevel", '');
        },
        cookie: {
            set(key, value) {
                $cookies.put(key, value, {path: '/'});
            },
            get(key) {
                return $cookies.get(key, {path: '/'});
            },
            setObject(key, value) {
                $cookies.putObject(key, value, {path: '/'});
            },
            getObject(key) {
                return JSON.parse($cookies.get(key, {path: '/'}));
            },
            remove(key) {
                $cookies.remove(key, {path: '/'});
            }
        },
        localStorage:{
            set(key, value){
                if (this.get(key) !== null ) {
                    this.remove(key);
                }
                localStorage.setItem(key, value);
            },
            get(key) {
              let value = localStorage.getItem(key);
              return value === undefined ? null : value;
            },
            remove(key) {
                localStorage.removeItem(key);
            },
            clear() {
                localStorage.clear();
            },
            each(fnc) {
                let len = localStorage.length;
                let fn = fnc || function(){};
                let key;
                for (let i = 0; i < len; i++) {
                    key = localStorage.key(i);
                    if ( fn.call(this, key, this.get(key)) === false )
                        break;
                    //如果内容被删除，则总长度和索引都同步减少
                    if( localStorage.length < len ){
                        len--;
                        i--;
                    }
                }
            }
        }
    }
}

export default utilsModule;
