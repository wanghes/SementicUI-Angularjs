export default function(module) {
    module.directive('uiTopSearchForm', directive);
    directive.$inject = ['$timeout', 'pNotify'];
    function directive($timeout, pNotify) {
        return {
            restrict: 'E',
            require: '^uiTopSearch',
            priority:1000,
            template: `
            <div class="ui top sidebar top_modal" id="{{ parentSearchModalId }}">
                <form class="ui mini form selfForm search_form" id="selfForm">
                    <div class="fields five" ng-repeat="vals in items">
                        <div class="field" ng-repeat="item in vals">
                            <label>{{ item.label }}</label>
                            <div ng-switch="item.type">
                                <div ng-switch-when="dropdown">
                                    <ui-dropdown model="item"></ui-dropdown>
                                </div>
                                <div ng-switch-when="dropdowns">
                                    <ui-dropdown model="item"></ui-dropdown>
                                </div>
                                <div ng-switch-when="datePicker">
                                    <ui-date-range model="item"></ui-date-range>
                                </div>
                                <div ng-switch-when="input">
                                    <input type="text" ng-model="item.value" />
                                </div>
                                <div ng-switch-when="area">
                                    <ui-city selected="item.value" level="{{ item.level }}"></ui-city>
                                </div>
                                <!--<div ng-switch-default>
                                    <h1>切换</h1>
                                    <p>选择不同选项显示对应的值。</p>
                                </div>-->
                            </div>
                        </div>
                    </div>

                    <div class="fields five">
                        <div class="field">
                            <label>&nbsp;</label>
                            <button class="ui mini primary button" ng-click="closeSearchModal()">搜索</button>
                            <button class="ui mini reset button" ng-click="resetSearchModal()">重置</button>
                        </div>
                    </div>
                </form>
            </div>`,
            replace: true,
            scope:false,
            link: function(scope, elem, attrs, parentCtrl) {
                scope.closeSearchModal = function(){
                    parentCtrl.closeSearchModal();
                };
                scope.$on('to-child',function(){
                    console.log("搜索重置后的表单内容：\n");
                    //console.log(scope.searchKeys.fields);
                });

                scope.resetSearchModal = function(){
                    parentCtrl.resetSearchModal();
                };
                scope.openSearchModal = function(){
                    parentCtrl.openSearchModal();
                };
                scope.parentSearchModalId = parentCtrl.searchModalId;
                scope.parentSearchColumnNum = parentCtrl.searchColumnNum;

                scope.makeSplitArr = function(fields, splitNum) {
                    let keysArr = Object.keys(fields);
                    let arr = [[]], idx = 0;
                    let len = keysArr.length;

                    for (let i = 0; i < len; i++) {
                        if(i%splitNum==0 && i!=0){
                            arr.push([]);
                        }
                    }
                    keysArr.forEach(function(item,index){
                        fields[item]['ID'] = item;
                        if(index%splitNum==0 && index!=0){
                            idx++;
                        }
                        arr[idx].push(fields[item]);
                    });
                    return arr;
                };

                $timeout(function(){
                    if(parentCtrl.searchKeys != null && !angular.equals({}, parentCtrl.searchKeys)) {
                        scope.items = scope.makeSplitArr(parentCtrl.searchKeys.fields,scope.parentSearchColumnNum);
                    }
                });
            }
        }
    }
};




