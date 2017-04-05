let pNotify = angular.module('pNotifyModule', []);
pNotify.factory("pNotify",function(){
    var factory = {};
    factory.stack_topleft = {
        "dir1": "down",
        "dir2": "left",
        "firstpos1": 66,
        "firstpos2": 36
    };
    factory.show = function(message,type){
        let config = {
            title:'消息提示',
            text: "线索关闭成功",
            delay: 1000,
            type: 'success',
            stack: factory.stack_topleft
        };
        let mergeConfig = angular.extend(config,{type:type,text:message});
        new PNotify(mergeConfig);
    };
    return factory;
})

export default pNotify;