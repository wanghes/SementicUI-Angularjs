export default function(module) {
    module.directive('uiTopSearch', directive);
    directive.$inject = ['$timeout', 'pNotify'];
    function directive($timeout, pNotify){
        return {
            restrict:'E',
            replace: true,
            template:`
            <div id="topSearch" class="top_search" >
                <div class="showed_search clearfix">
                    <div class="box box-left mini_box">
                        <button class="ui mini primary button search-btn" ng-disabled="btnDisabled" ng-click="openSearchModal()">
                        <i class="search icon"></i>显示搜索条件</button>
                    </div>
                    <ui-top-search-form></ui-top-search-form>
                    <ui-searched-items></ui-searched-items>
                </div>
            </div>`,
            transclude:true,
            scope:{
                searchKeys:'=',
                searchModalId:"@",
                searchColumnNum:"@"
            },
            controller:function($scope){
                let originSearchKeysFields = $scope.searchKeys && angular.copy($scope.searchKeys.fields);
                this.searchColumnNum = $scope.searchColumnNum;
                this.searchModalId = $scope.searchModalId;
                this.searchKeys = $scope.searchKeys;
                /*
                 * 打开顶部搜索栏
                 */
                this.openSearchModal = function(){
                    $('#'+$scope.searchModalId).sidebar({
                        closable: true,
                        scrollLock: true,
                        transition: 'overlay',
                        duration:100,
                        onHidden:function(){
                            /*
                             * 如果$scope.searchKeys.operateFunction为function则在遮罩隐藏的时候调用它
                             */
                            if(angular.isFunction($scope.searchKeys.operateFunction)){
                                 $scope.searchKeys.operateFunction();
                            }
                        }
                    });
                    $('#'+$scope.searchModalId).sidebar('show');
                }

                /*
                 * 关闭顶部搜索栏
                 */
                this.closeSearchModal = function(){
                    $('#'+$scope.searchModalId).sidebar('hide');
                }

                /*
                 * 重置搜索栏的数据
                 */
                this.resetSearchModal = function(){
                    $scope.$broadcast('to-child');
                    angular.forEach(originSearchKeysFields, function(item, key){
                        let fields = $scope.searchKeys.fields;
                        fields[key].value=item.value;
                        fields[key].text=item.text;
                        if (fields[key]['city']) {
                            fields[key]['city'] = '';
                            if (fields[key]['level']==1) {
                                $('#'+$scope.searchModalId+' .province_node').val('');
                            }
                        }

                        //DOM清空时间控件中的value值
                        if(fields[key]['type'] == 'timePicker'){
                            $('#'+$scope.searchModalId + ' input[data-type="timePicker"]').val(fields[key].text).change();
                        }
                        //DOM清空地区控件中的value值
                        if(fields[key]['type']=='area'){
                            let province = $('#'+$scope.searchModalId+' select[name="province"]'),
                                city = $('#'+$scope.searchModalId+' select[name="city"]'),
                                area = $('#'+$scope.searchModalId+' select[name="area"]');

                            if(!!province){
                                province.val('');
                            }
                            if(!!city){
                                city.val('');
                            }
                            if(!!area){
                                area.val('');
                            }
                        }
                    });

                    this.closeSearchModal();
                };
            },
            link:function(scope, elem, attrs, ctrl){
                scope.openSearchModal = function(){
                    ctrl.openSearchModal();
                }

                if(!scope.searchKeys || angular.equals({}, scope.searchKeys)) {
                    scope.btnDisabled = true;
                }else{
                    scope.btnDisabled = false;
                }
            }
        }
    }
};
