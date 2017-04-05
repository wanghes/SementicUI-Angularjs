export default function(){
  return {
    restrict: 'E',
    require: '^uiGrid',
    template: `<div class="ui active inverted dimmer" ng-show="grid.rows.length == 0" id="gridLoading">
                    <div class="ui medium text loader">正在加载数据...</div>
               </div>`,
    link: function ($scope, $elm, $attrs, uiGridCtrl) {
            $scope.grid = uiGridCtrl.grid;
            /**
             * [description]
             * 监听父级广播的hideloading事件来进行隐藏
             */
            $scope.$on('hideloading',() => {
               $elm.hide();
            })
    }
  }
}