export default function(module) {
    module.directive('uiDropdown', directive);
    directive.$inject = ['$timeout'];
    function directive($timeout) {
        return {
            restrict: 'E',
            priority: 9999,
            template:`
            <div class="ui search selection dropdown {{ model.multi ? 'multiple': '' }}" id="searchItem_{{ model.ID }}">
                <input name="modelValue" type="hidden" ng-value="model.value" />
                <i class="dropdown icon"></i>
                <div class="default text" ng-bind="model.text || model.defaultText"></div>
                <div class="menu">
                    <div class="item" ng-repeat="key in dropdownList"
                    data-value="{{key[model.selectValue]||key.value}}">{{key[model.showName]||key.name}}</div>
                </div>
            </div>
            `,
            replace: false,
            transclude: false,
            scope: {
                model:'='
            },
            link: function(scope, elem, attrs) {
                var defaultVal = scope.model.defaultText;

                $timeout(function(){
                    let dropdownConfig = {
                        fields:{
                            name : scope.model.showName || "name",   // displayed dropdown text
                            value : scope.model.selectValue || "value"
                        },
                        direction:'downward',
                        fullTextSearch:true,
                        transition:'slide down',
                        forceSelection: false,//禁止默认选中最后一个
                        onChange: function(value, text, $selectedItem) {
                            scope.model.value = value;
                            if(!scope.model.multi){
                                scope.model.text = text;
                            }
                        },
                        //只能配合多选时候使用onAdd
                        onAdd:function(addedValue, addedText, $addedChoice){
                            if(scope.model.text){
                                if(scope.model.text=="全部"){
                                    scope.model.text = addedText;
                                }else{
                                    scope.model.text += ','+ addedText
                                }
                            }else{
                                scope.model.text = addedText;
                            }

                            let newText = scope.model.text.split(',');
                            newText = scope.array_unique(newText);
                            scope.model.text = newText.join(',');
                        },
                        //只能配合多选时候使用onRemove
                        onRemove:function(removedValue, removedText, $removedChoice){
                            let text = scope.model.text.split(',');
                            let arr = text.filter(function(item){
                                return item!=removedText;
                            });

                            scope.model.text = arr.join(',');
                        },
                        onLabelRemove:function(value){
                            //console.log('onLabelRemove:'+value);
                        },
                        onLabelSelect:function($selectedLabels){
                            //console.log('selectedLabels:'+$selectedLabels)
                        }
                    };

                    if(scope.model.asyncFetchDataFunc && angular.isFunction(scope.model.asyncFetchDataFunc)){
                        dropdownConfig = angular.extend(dropdownConfig, {
                            apiSettings:{
                                responseAsync:function(setting,callback){
                                    scope.model.asyncFetchDataFunc(function(data) {
                                        //再次focus后要清除menu中项，重新生成完整的列表
                                        $(elem).find(`#searchItem_${scope.model.ID}.ui.dropdown .menu`).html('');
                                        callback({
                                            success:true,
                                            results: data
                                        });
                                        scope.deleteNonExistValues(data, scope.model.value);
                                    });
                                }
                            }
                        });
                    }

                    //初始化dropdown
                    $(elem).find(`#searchItem_${scope.model.ID}.ui.dropdown`).dropdown(dropdownConfig);
                })

                if(scope.model.data && scope.model.data.length>0){
                    scope.dropdownList = scope.model.data;
                }else if(scope.model.func){
                    scope.$watch('model.data',function(toVal,fromVal){
                        scope.dropdownList =  toVal;
                    })
                    scope.model.func();
                }

                //父级控制器emit【reset】,
                scope.$on('to-child', function(e, d) {
                    $(elem).find('.ui.dropdown').dropdown('clear');
                    $(elem).find('.ui.dropdown .default_text').addClass('default').text(defaultVal);
                });

                scope.array_unique = function(ar){
                    var m,n=[],o= {};
                    for (var i=0;(m= ar[i])!==undefined;i++){
                        if (!o[m]){
                            n.push(m);o[m]=true;
                        }
                    }
                   return n;
                }

                //寻找请求中的数据是否已经被删除，删除的话将自动删除选中的标签
                scope.deleteNonExistValues = function(data,value){
                    angular.forEach(data,function(item){
                        if(value.indexOf(item.id)<0){
                            $('a[data-value="'+item.id+'"] i').trigger('click'); //触发删除按钮
                        }
                    })
                };
            }
        };
    }

};
