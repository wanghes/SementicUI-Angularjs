export default function(module){
    module.directive('uiPageLoading', directive);
    directive.$inject = ['$timeout'];
    function directive($timeout) {
        return {
            restrict: 'E',
            replace: true,
            priority: 9999,
            template: `
            <div class="ui active inverted dimmer" ng-show="loadStatus">
                <div class="ui medium text loader">正在加载数据...</div>
            </div>`,
            scope:{
                loadStatus: '='
            },
            link:function(scope, elem, attrs) {
            }
        }
    }
}
