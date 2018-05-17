import utilsModule from './utils';
import cityJson from './cityJson';
import pNotifyFactory from './pNotify';
import './constants';

let serviceModule = angular.module('serviceModule', [
    'ngResource',
    'utilsModule',
    "pNotifyModule",
    'constantsModule'
]);


serviceModule.config(['$httpProvider', '$qProvider', function($httpProvider, $qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
    $httpProvider.interceptors.push('handleRequest');
}]).run(($rootScope, $timeout) => {
     $timeout(function(){
        if($('#loadingBox', parent.document)){
            $('#loadingBox', parent.document).hide();
        }
    }, 1000);
});;


/***************
*** 请求接口拦截器 ***
***************/
serviceModule.factory('handleRequest', handleRequestFunc);
handleRequestFunc.$inject = ['$q', "$timeout", "BASE_URL", "$rootScope", "pNotify"];
function handleRequestFunc($q, $timeout, BASE_URL, $rootScope, pNotify) {
    var handleRequest = {
        request: function(config) {
            return $q.resolve(config);
        },
        response: function(response) {
            let href = window.parent.location.href;
            let index = href.indexOf('?');

            let lastHref;
            if(index != -1) {
                lastHref = encodeURIComponent(href.slice(0, index));
            } else {
                lastHref = encodeURIComponent(href);
            }

            if (response.status == 200) {
                if(response.data.code==9001){
                    window.parent.location.href = BASE_URL + "/web/logout?redirect_uri=" +lastHref;
                }else if(response.data.code==3){
                    pNotify.show(response.data.message,'error');
                }else if(response.data.code==2){
                    pNotify.show(response.data.message,'error');
                }else if(response.data.code==23000){
                    pNotify.show(response.data.message,'error');
                } else if(response.data.code==1) {
                    //pNotify.show("数据获取成功！", "success");
                }
            }else if(response.status == 503){
                throw new Error('服务器错误');
                window.parent.location.href = BASE_URL + "/web/login?redirect_uri=" + lastHref;
            }else if(response.status == 403){
                pNotify.show("友情提示您未开通此项功能，请联系管理员为您开通！","error");
            }else if(response.status == 404){
                pNotify.show("很遗憾未找到此页面！","error");
            }
            return $q.resolve(response);
        }
    };
    return handleRequest;
}

/***************
*** 用户认证 ***
***************/
serviceModule.factory('oauth', oauthFunc);
oauthFunc.$inject = ['$resource', 'utils', 'APPID', 'BASE_URL', '$timeout', 'pNotify'];
function oauthFunc($resource, utils, APPID, BASE_URL, $timeout, pNotify) {
    const URL_CODE = utils.getUrlCode();
    const API_TOKEN = utils.getApiToken();

    return {
        appId:APPID,
        apiToken: API_TOKEN,
        urlCode: URL_CODE,
        requestParamsHeaders: {
            method: 'get',
            headers: {
                "Accept": "application/json",
                "Content-Type": 'application/json',
                "apitoken": API_TOKEN
            },
            params: {
                //app_id: APPID
            },
            isArray: false
        },
        judgeLogin: $resource(`${BASE_URL}/oauth/token`, {}, {
            checkLogin: {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    "Content-Type": "application/json",
                    "apitoken": API_TOKEN
                }
            }
        }),
        userLogout: function() {
            let href = window.parent.location.href;
            let index = href.indexOf('?');
            let lastHref = encodeURIComponent(href.slice(0,index));
            utils.deleteApiToken();
            window.parent.location.href = BASE_URL + "/web/logout?redirect_uri=" +lastHref
        },
        callJudgeLogin: function(cb) {
            let href = window.parent.location.href;
            let index = href.indexOf('?');
            let lastHref = encodeURIComponent(href.slice(0,index));

            this.judgeLogin.checkLogin({ code: URL_CODE }, function(result) {
                console.log("用户认证信息CODE:\"" + result.code + "\"");
                if (result.code == 0) {
                    $('#mainLoading', parent.document).hide();
                    if(result.data.api_token!=API_TOKEN || !API_TOKEN){
                         utils.setApiToken(result.data.api_token);
                    }
                    let userInfo = result.data.userInfo;
                    cb(userInfo);
                }else if(result.code == 3){
                    pNotify.show(result.message, 'error');
                    window.parent.document.getElementById('messageRecieveBox').innerHTML = $('.ui-pnotify')[0].outerHTML;
                    window.parent.document.getElementById('messageRecieveBox').style.display = "flex";
                     $timeout(function(){
                         window.parent.location.href = BASE_URL + "/web/logout?redirect_uri=" +lastHref;
                     },2000)

                }
            });
        }
    }
}

/***************
*** 服务器接口处理 ***
***************/
serviceModule.factory('services', servicesFunc);
servicesFunc.$inject = ['$resource', 'utils', 'APPID', 'BASE_URL', 'HOST', 'oauth'];
function servicesFunc($resource, utils, APPID, BASE_URL, HOST, oauth) {
    let middleParams = angular.copy(oauth.requestParamsHeaders); //深拷贝
    return {
        city: cityJson,
        baseUrl: BASE_URL,
        dashboard:$resource(`${BASE_URL}/dashboard`,{},{
            query:{...middleParams, method:'get' },
            post: {...middleParams, method:'post' }
        }),
        posts:$resource(`${BASE_URL}/api/posts`,{}, {
            query: middleParams
        }),
        users:$resource(`${BASE_URL}/api/user/:id`, {}, {
            delete: angular.extend(angular.copy(middleParams), {
                method: 'delete',
                params: angular.extend({ id: "@id" }, angular.copy(middleParams).params)
            }),
            edit: angular.extend(angular.copy(middleParams), {
                method: 'put',
                params: angular.extend({ id: "@id" }, angular.extend(middleParams).params),
            })
        }),
        roles: $resource(`${BASE_URL}/api/role/:id`, {}, {
            delete: angular.extend(angular.copy(middleParams), {
                method: 'delete',
                params: angular.extend({ id: "@id" },  angular.extend(middleParams).params),
            }),
            edit: angular.extend(angular.copy(middleParams), {
                method: 'put',
                params: angular.extend({ id: "@id" },  angular.extend(middleParams).params),
            })
        }),
        order: $resource(`${BASE_URL}/api/order/:id`, {}, {
            delete: angular.extend(angular.copy(middleParams), {
                method: 'delete',
                params:angular.extend({ id: "@id" }, angular.copy(middleParams).params)
            })
        }),
        orderFollowClue: $resource(`${BASE_URL}/api/orderFollow`, {}, {
            query: angular.extend(angular.copy(middleParams),{
                method:"get",
                params:angular.extend({ order_id: "@order_id" }, angular.copy(middleParams).params)
            }),
        }),

        template: $resource(`${BASE_URL}/api/template/:id`, {}, {
            edit: angular.extend(angular.copy(middleParams), {
                method: 'put',
                params: angular.extend({ id: "@id" }, angular.copy(middleParams).params)
            }),
            delete: angular.extend(angular.copy(middleParams), {
                method: 'delete',
                params: angular.extend({ id: "@id" }, angular.copy(middleParams).params)
            })
        }),
        templateQueryOne:$resource(`${BASE_URL}/api/template`, {}, {
            query: angular.extend(angular.copy(middleParams), {
                method: 'get',
                params: angular.extend({ id: "@id" }, angular.copy(middleParams).params)
            })
        }),
        fileInfo: $resource(`${BASE_URL}/api/template/upload`, {}, {
            upload: angular.extend(angular.copy(middleParams), {
                method: 'post',
                headers: angular.extend(angular.copy(middleParams).headers,{
                    "Content-Type": undefined //文件上传的文件类型 不在在使用json格式 需要设置 undefined
                }),
                transformRequest: angular.identity
            })
        }),
        collections: $resource(`${BASE_URL}/api/collector/:id`, {}, {
            edit: angular.extend(angular.copy(middleParams), {
                method: 'put',
                params: angular.extend({ id: "@id" }, angular.extend(middleParams).params),
            }),
            delete: angular.extend(angular.copy(middleParams), {
                method: 'delete',
                params: angular.extend({ id: "@id" }, angular.copy(middleParams).params)
            })
        }),
        property: $resource(`${BASE_URL}/api/profiles/getByPid`, {}, {
            query: angular.extend(angular.copy(middleParams), {
                method: 'get',
                params: angular.extend({pid: "@pid"},angular.copy(middleParams).params)
            }),
        }),
        propertyOperate: $resource(`${BASE_URL}/api/profiles/:id`, {}, {
            query: angular.extend(angular.copy(middleParams), {
                method: 'get',
                params: angular.extend({id: "@id"},angular.copy(middleParams).params)
            }),
            edit: angular.extend(angular.copy(middleParams), {
                method: 'put',
                params: angular.extend({ id: "@id" }, angular.extend(middleParams).params),
            }),
            delete: angular.extend(angular.copy(middleParams), {
                method: 'delete',
                params: angular.extend({ id: "@id" }, angular.copy(middleParams).params)
            })
        }),
        dispatch: $resource(`${BASE_URL}/api/dispatchConfig/:id`, {}, {
            update: angular.extend(angular.copy(middleParams), {
                method: 'put',
                params:angular.extend({ id: "@id" }, angular.copy(middleParams).params)
            }),
            delete:angular.extend(angular.copy(middleParams), {
                method: 'delete',
                params:angular.extend({ id: "@id" }, angular.copy(middleParams).params)
            }),
            queryOne:angular.extend(angular.copy(middleParams), {
                method: 'get',
                params:angular.extend({ id: "@id" }, angular.copy(middleParams).params)
            })
        }),
        resources: $resource(`${BASE_URL}/api/sources/:id`, {}, {
            delete: angular.extend(angular.copy(middleParams), {
                method: 'delete',
                params: angular.extend({ id: "@id" }, angular.copy(middleParams).params)
            }),
            edit: angular.extend(angular.copy(middleParams), {
                method: 'put',
                params: angular.extend({ id: "@id" }, angular.copy(middleParams).params)
            })
        })
    }
}

export default serviceModule;
