export default function(module) {
    module.directive('uiTableIntro', directive);
    directive.$inject = ['$timeout', 'pNotify'];
    function directive($timeout, pNotify){
        return {
            restrict:'E',
            replace: true,
            template:`
            <div id="tableIntro" class="table_intro" ng-transclude>

            </div>`,
            transclude: true,
            scope:{

            },
            controller:function($scope, $element){


            },
            link:function(scope,elem,attrs,ctrl){

            }
        }
    }
};

