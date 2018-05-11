export default function($timeout){
    return {
        restrict:'E',
        replace:true,
        template:`<div id="tableIntro" class="table_intro" ng-transclude>

                </div>`,
        transclude:true,
        scope:{
             
        },
        controller:function($scope,$element){

          
        },
        link:function(scope,elem,attrs,ctrl){

        }
    }
}

