export default function(){
    return {
        restrict:'E',
        replace:false,
        template:`<div id="topSearch" class="top_search" >
            <div class="showed_search clearfix">
                <div class="box box-left mini_box">
                    <button class="ui mini primary button search-btn" ng-disabled="btnDisabled" ng-click="openSearchModal()">
                    <i class="search icon"></i>显示搜索条件</button>
                </div>
                <div ng-transclude></div>
            </div>
        </div>`,
        transclude:true,
        scope:{
            searchKeys:'=',
            searchModalId:"@",
            searchColumnNum:"@",
            searchData:"=searchData"
        },
        controller:function($scope){
            let originSearchKeysFields = angular.copy($scope.searchKeys.fields);
            this.searchColumnNum = $scope.searchColumnNum;
            this.searchModalId = $scope.searchModalId;
            /*
             * 打开顶部搜索栏
             */
            this.openSearchModal = function(){
                $('#'+$scope.searchModalId).sidebar({
                    closable: true,
                    scrollLock: true,
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
                angular.forEach(originSearchKeysFields,function(item,key){
                    let fields = $scope.searchKeys.fields;
                    fields[key].value=item.value;
                    fields[key].text=item.text;
                    if(fields[key]['city']){
                        fields[key]['city'] = '';
                        if(fields[key]['level']==1){
                            $('#'+$scope.searchModalId+' .province_node').val('')
                        }
                    }

                    //DOM清空时间控件中的value值
                    if(fields[key]['type']=='timePicker'){
                        $('#'+$scope.searchModalId+' input[data-type="timePicker"]').val(fields[key].text).change();
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

                /*if($('#TimeArea')){
                     $('#TimeArea').val('').change();
                }*/
                this.closeSearchModal();
            };
        },
        link:function(scope,elem,attrs,ctrl){
            //console.log(scope.searchColumnNum);
            scope.openSearchModal = function(){
                ctrl.openSearchModal();
            }

            if(scope.searchKeys==null || angular.equals({}, scope.searchKeys)) {
                scope.btnDisabled = true;
            }else{
                scope.btnDisabled = false;
            }
        }
    }
}

/* */
