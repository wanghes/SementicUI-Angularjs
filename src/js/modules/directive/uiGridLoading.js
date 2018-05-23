export default function(module) {
    module.directive('uiGridLoading', directive);
    directive.$inject = ['$timeout', 'pNotify', '$interval'];
    function directive($timeout, pNotify, $interval) {
        return {
            restrict: 'E',
            require: '^uiGrid',
            template: `<div class="ui active inverted dimmer" ng-show="gridLoading" style="background:rgba(255, 255, 255, .9)">
                            <div class="ui small text loader">正在加载数据...</div>
                       </div>`,
            link: function ($scope, $elm, $attrs, uiGridCtrl) {
                /*
                let inter =  $interval(() => {
                    let totalItems = uiGridCtrl.uiGrid.totalItems
                    if (totalItems > 0) {
                        $interval.cancel(inter);
                        $elm.hide();
                    }
                }, 500);

                $scope.$on('gridLoadingStart',function(){
                    $elm.show();
                    let inter2 =  $interval(() => {
                        let totalItems = uiGridCtrl.uiGrid.totalItems
                        if (totalItems > 0) {
                            $interval.cancel(inter2);
                            $elm.hide();
                        }
                    }, 500);
                });
                */
            }
        }
    }
};
