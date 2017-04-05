import utilsModule from './utils';
import cityJson from './cityJson';
import pNotifyFactory from './pNotify';

let serviceModule = angular.module('serviceModule', ['ngResource', 'utilsModule',"pNotifyModule"]);
let href = window.parent.location.href;
serviceModule.value('APPID', '6f7cec50-d249-11e6-a54f-5fe21197bf57');
if(href.indexOf('huoyunren') == -1){
    serviceModule.value('BASE_URL', 'http://sot.chinawayltd.com:8080');
} else {
    serviceModule.value('BASE_URL', 'http://zqx.huoyunren.com/sot');
}

serviceModule.config(['$httpProvider', '$qProvider', function ($httpProvider,$qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
    $httpProvider.interceptors.push('timestampMarker');
}]);

serviceModule.factory('timestampMarker', ['$q', "$timeout", "BASE_URL", "$rootScope","pNotify",
    function($q, $timeout, BASE_URL, $rootScope, pNotify) {
        var timestampMarker = {
            request: function(config) {
                //$rootScope.pageLoading = true;
                return $q.resolve(config);
            },
            response: function(response) {
                //$rootScope.pageLoading = false;
                $timeout(function(){
                    if($('#loadingBox')){
                        $('#loadingBox').hide();
                    }
                },1200);

                let href = window.parent.location.href;
                let index = href.indexOf('?');
                let lastHref;
                if(index != -1) {
                    lastHref = encodeURIComponent(href.slice(0,index));
                } else {
                    lastHref = encodeURIComponent(href);
                }

                if (response.status == 200) {
                    if(response.data.code==9001){
                        window.parent.location.href = BASE_URL + "/web/logout?redirect_uri=" +lastHref;
                    }else if(response.data.code==3){

                    }else if(response.data.code==2){
                        pNotify.show(response.data.message,'error');
                    }else if(response.data.code==23000){
                        pNotify.show(response.data.message,'error');
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
        return timestampMarker;
    }
]);

/***
用户认证
***/
serviceModule.factory('oauth', ['$resource', 'urlCode', 'APPID', 'BASE_URL',"$timeout",'pNotify',
    function($resource, urlCode, APPID, BASE_URL,$timeout,pNotify) {
        const URL_CODE = urlCode.getUrlCode();
        const API_TOKEN = urlCode.getApiToken();

        return {
            appId:APPID,
            apiToken: API_TOKEN,
            urlCode: URL_CODE,
            requestParamsHeaders: {
                method: 'get',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "apitoken": API_TOKEN
                },
                params: {
                    app_id: APPID
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
                urlCode.deleteApiToken();
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
                             urlCode.setApiToken(result.data.api_token);
                        }
                        let userInfo = result.data.userInfo;
                        cb(userInfo);
                    }else if(result.code == 3){
                        pNotify.show(result.message,'error');
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
]);

serviceModule.factory('services',['$resource', 'BASE_URL', 'oauth',
    function($resource, BASE_URL, oauth){
        let middleParams = angular.copy(oauth.requestParamsHeaders);
        return {
            city:cityJson,
            baseUrl: BASE_URL,
            formUrl: BASE_URL + "/api/template",
            templateURL: BASE_URL + "/",
            dashboard:$resource(`${BASE_URL}/dashboard`,{},{
                query: angular.extend(middleParams, {
                    method: 'get'
                }),
                post: angular.extend(middleParams, {
                    method: 'post'
                })
            }),
            users:$resource(`${BASE_URL}/api/user/:id`, {}, {
                query: angular.extend(angular.copy(middleParams), {
                    method: 'get'
                }),
                delete: angular.extend(angular.copy(middleParams), {
                    method: 'delete',
                    params: angular.extend({ id: "@id" }, angular.copy(middleParams).params)
                }),
                post: angular.extend(angular.copy(middleParams), {
                    method: 'post'
                }),
                edit: angular.extend(angular.copy(middleParams), {
                    method: 'put',
                    params: angular.extend({ id: "@id" }, angular.extend(middleParams).params),
                })
            }),
            assignRolesForUser: $resource(`${BASE_URL}/api/user/assignRolesForUser`, {}, { //分配角色
                post: angular.extend(angular.copy(middleParams), {
                    method: 'post'
                })
            }),
            getSourcesByRoleId: $resource(`${BASE_URL}/api/role/getSourcesByRoleId`, {}, { //分配角色
                query: angular.extend(angular.copy(middleParams), {
                    method: 'get'
                })
            }),
            roles: $resource(`${BASE_URL}/api/role/:id`, {}, {
                query: angular.extend(angular.copy(middleParams), {
                    method: 'get'
                }),
                delete: angular.extend(angular.copy(middleParams), {
                    method: 'delete',
                    params: angular.extend({ id: "@id" },  angular.extend(middleParams).params),
                }),
                post: angular.extend(angular.copy(middleParams), {
                    method: 'post'
                }),
                edit: angular.extend(angular.copy(middleParams), {
                    method: 'put',
                    params: angular.extend({ id: "@id" },  angular.extend(middleParams).params),
                })
            }),
            assignSourcesForRole: $resource(`${BASE_URL}/api/role/assignSourcesForRole`, {}, {
                assign: angular.extend(angular.copy(middleParams), {
                    method: 'post'
                })
            }),
            order: $resource(`${BASE_URL}/api/order/:id`, {}, {
                query: angular.extend(angular.copy(middleParams), {
                    method: 'get'
                }),
                doAddClue: angular.extend(angular.copy(middleParams), {
                    method: 'post'
                }),
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
                closeClue: angular.extend(angular.copy(middleParams),{
                    method:"post"
                })

            }),
            orderFollow: $resource(`${BASE_URL}/api/orderFollow/transfer_add`, {}, {
                save: angular.extend(angular.copy(middleParams),{
                    method:"post"
                })
            }),
            template: $resource(`${BASE_URL}/api/template/:id`, {}, {
                query: angular.extend(angular.copy(middleParams), {
                    method: 'get'
                }),
                edit: angular.extend(angular.copy(middleParams), {
                    method: 'put',
                    params: angular.extend({ id: "@id" }, angular.copy(middleParams).params)
                }),
                save: angular.extend(angular.copy(middleParams), {
                    method: 'post'
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
            fetchTemplate: $resource(`${BASE_URL}/api/template/getTplUrl`, {}, {
                query: angular.extend(angular.copy(middleParams), {
                    method: 'post'
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
                query: angular.extend(angular.copy(middleParams), {
                    method: 'get'
                }),
                post: angular.extend(angular.copy(middleParams), {
                    method: 'post'
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
                post: angular.extend(angular.copy(middleParams), {
                    method: 'post'
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
                query: angular.extend(angular.copy(middleParams), {
                    method: 'get'
                }),
                save: angular.extend(angular.copy(middleParams), {
                    method: 'post'
                }),
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
            dispatchNotifyType:$resource(`${BASE_URL}/api/dispatchConfig/notifyType`, {}, {
                query: angular.extend(angular.copy(middleParams), {
                    method: 'get'
                }),
            }),
            dispatchConditionType:$resource(`${BASE_URL}/api/dispatchConfig/conditionType`, {}, {
                query: angular.extend(angular.copy(middleParams), {
                    method: 'get'
                }),
            }),
            dispatchOperateFlagType:$resource(`${BASE_URL}/api/dispatchConfig/operateFlagType`, {}, {
                query: angular.extend(angular.copy(middleParams), {
                    method: 'get'
                }),
            }),
            resources: $resource(`${BASE_URL}/api/sources/:id`, {}, {
                query: angular.extend(angular.copy(middleParams), {
                    method: 'get'
                }),
                delete: angular.extend(angular.copy(middleParams), {
                    method: 'delete',
                    params: angular.extend({ id: "@id" }, angular.copy(middleParams).params)
                }),
                post: angular.extend(angular.copy(middleParams), {
                    method: 'post'
                }),
                edit: angular.extend(angular.copy(middleParams), {
                    method: 'put',
                    params: angular.extend({ id: "@id" }, angular.copy(middleParams).params)
                })
            }),
            resourcesPid: $resource(`${BASE_URL}/api/sources/`, {}, {
                query: angular.extend(angular.copy(middleParams), {
                    method: 'get'
                })
            }),
            logs:$resource(`${BASE_URL}/api/systemLog`, {}, {
                query: angular.extend(angular.copy(middleParams), {
                    method: 'get'
                }),
            }),
            system:$resource(`${BASE_URL}/api/system`, {}, {
                query: angular.extend(angular.copy(middleParams), {
                    method: 'get'
                }),
            }),
            dingUser:$resource(`${BASE_URL}/api/user/selectUser`, {}, {
                query: angular.extend(angular.copy(middleParams), {
                    method: 'get'
                }),
            }),
            selectUserForAd:$resource(`${BASE_URL}/api/user/selectUserForAd`, {}, {
                query: angular.extend(angular.copy(middleParams), {
                    method: 'get'
                }),
            }),
            operator:$resource(`${BASE_URL}/api/operator/getOperatorList`, {}, {
                query: angular.extend(angular.copy(middleParams), {
                    method: 'get'
                }),
            })
        }
    }
]);

export default serviceModule;