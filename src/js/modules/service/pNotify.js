let pNotify = angular.module('pNotifyModule', []);
pNotify.factory("pNotify",
    function(){
        var factory = {};
        factory.stack_topleft = {
            "dir1": "down",
            "dir2": "left",
            "firstpos1": 66,
            "firstpos2": 36
        };
        factory.show = function(message,type,delay){
            let config = {
                title:'消息提示',
                text: "线索关闭成功",
                delay: 1000,
                type: 'success',
                stack: factory.stack_topleft
            };
            let mergeConfig = angular.extend(config,{type:type,text:message,delay:delay||1000});
            new PNotify(mergeConfig);
        };

        return factory;
    }
)

pNotify.factory("confirmTip", ['$compile','$document','$rootScope',
    function($compile,$document,$rootScope){
        var factory = {};

        factory.show = function(options){
            var extend = angular.extend,
            options = extend({
                scope: null,
                controller: null,
                msg:"",
                confirmId:"",
                onDeny:angular.noop,
                onApprove:angular.noop,
                size:"mini",
                title: '确认消息',
                ok: '是',
                no: '否',
                appendTo: $document[0].body
            }, options || {});

            var scope = options.scope || $rootScope.$new();
            let html = `<div class="ui ${options.size} basic confirm modal" id="${options.confirmId}">
                <div class="ui icon header">
                   ${options.title}
                </div>
                <div class="content">
                  <p>${options.msg}</p>
                </div>
                <div class="actions">
                  <div class="ui red cancel inverted button">
                    <i class="remove icon"></i>${options.no}
                  </div>
                  <div class="ui green ok inverted button">
                    <i class="checkmark icon"></i>${options.ok}
                  </div>
                </div>
              </div>`;

            var element = angular.element(html);
            if (options.appendTo) {
                if(angular.element(`#${options.confirmId}`)){
                    angular.element(`#${options.confirmId}`).remove();
                }
                angular.element(options.appendTo).append(element);
            }
            $compile(element)(scope);

            let node =  $(`.confirm#${options.confirmId}`);

            node.modal({
                closable  : false,
                duration:150,
                allowMultiple: true,
                onDeny(){ //取消逻辑回调函数
                    options.onDeny();
                },
                onApprove(){ //确定逻辑回调函数
                     options.onApprove();
                }
            });

            node.modal('show');
            return;

        }
        return factory;
    }
])



export default pNotify;
