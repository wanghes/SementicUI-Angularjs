export default function($timeout,pNotify){
    return {
        restrict:'E',
        template:`<div class="{{direction}} fields" ng-cloak>
                    <div class="field" ng-repeat="radio in radios track by $index" ng-click="updateSelection($event,radio.value)">
				      	<div class="ui radio checkbox {{radio.checkStatusString}}">
				        	<input type="radio" value="{{radio.value}}"  
                             name="{{name}}" tabindex="0" class="hidden">
				        	<label>{{radio.label}}</label>
				      	</div>
				    </div>
                </div>`,
        scope:{
        	direction:"@", //grouped 或者 inline
            radios:"=",
            name:"@",
            selectedRadio:"="
        },
        controller:function($scope){
           
        },
        link:function(scope,elem,attrs,ngModelCtrl){

        	if(!scope.direction){
        		scope.direction = "inline"
        	}

            scope.updateSelection = function($event, value){ 
                var checkbox = $event.target; 
                scope.selectedRadio = value
            } 

        	$timeout(()=>{

                scope.$watch("selectedRadio",function(newVal,oldVal){

                    if(!scope.radios) return;
                    scope.radios = scope.radios.map((item)=>{
                        if(scope.selectedRadio && scope.selectedRadio==item.value){
                            item.checkStatusString = "checked";
                        }else{
                            item.checkStatusString = "";
                        }
                        return item;
                    });
                });

    			$('.ui.radio.checkbox').checkbox();

        	},0)
        	
        }
    }
}