export default function($timeout){
    return {
        restrict:'E',
        replace:true,
        template:`<div id="buttonGroup" class="button_group mini_box">
                    <button ng-repeat="button in buttons" id="{{button.id}}" class="ui mini {{button.className}} button"
                    ng-click="openModal(button.action)" data-func="{{button.func}}">
                    <i class="icon {{button.icon}}"></i>{{button.name}}</button>
                </div>`,
        scope:{
             buttons:'='
        },
        controller:function($scope, $element){
            this.openModal = function(action){
                if(!action){
                    return;
                }
                if(angular.isObject(action)){
                    if(action.open=='sidebar'){
                        if(!action.id){
                            throw new Error('没有定义相应的打开modal的ID!');
                            return;
                        }

                       $(action.id).sidebar({
                            transition:action.transition ? action.transition : 'push'
                       }).sidebar('show');
                    }else if(action.open=='modal'){
                        if(!action.id){
                            throw new Error('没有定义相应的打开modal的ID!');
                            return;
                        }
                        $(action.id).modal({
                            autofocus:false,
                            context:"body",
                            closable:false,
                            duration:200,
                            inverted: false,
                            transition:action.transition ? action.transition : "scale",
                            onApprove:function($element){
                            }
                        }).modal('show');
                    }else if(action.open=='template'){

                    }

                    if(action.operateFunctions){
                        action.operateFunctions.open();
                    }
                }else if(angular.isFunction(action)){
                    action();
                }
            };
        },
        link:function(scope,elem,attrs,ctrl){
            scope.openModal = function(action){
                ctrl.openModal(action);
            }
            //调用端可以没有按钮设置
            if(!!scope.buttons){
                $timeout(function(){
                    scope.$watch('buttons',function(newButtons){
                        newButtons.forEach(function(item){
                            if(item.disabled){
                                $('#'+item.id).attr('disabled',"disabled");
                            }else{
                                $('#'+item.id).removeAttr('disabled');
                            }
                        });
                    },true);
                },500);
            }

        }
    }
}

