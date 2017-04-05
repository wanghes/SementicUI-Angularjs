export default function($timeout){
    return {
        restrict:'E',
        replace:true,
        template:`<input type="text" class="normal_input" data-type="timePicker" id="{{model.id}}" placeholder="{{model.defaultText}}" ng-model="model.text">`,
        transclude:true,
        scope:{
            model:'='
        },
        link:function(scope,elem,attrs){
            $timeout(function(){
                var dateRange = new pickerDateRange(scope.model.id, {
                    aRecent7Days : 'aRecent7DaysDemo3', //最近7天
                    isTodayValid : true,
                    startDate : scope.model.value[0] ? scope.model.value[0]: "",
                    endDate : scope.model.value[1] ? scope.model.value[1]: "",
                    needCompare : true,
                    isSingleDay : false,
                    shortOpr : false,
                    defaultText : ' 至 ',
                    theme : 'ta',
                    success : function(obj) {
                        scope.model.value = [obj.startDate,obj.endDate];
                        $('#'+scope.model.id).val(`${obj.startDate} 至 ${obj.endDate}`);
                        scope.model.text = `${obj.startDate} 至 ${obj.endDate}`;
                    }
                });
            });

        }
    };
};

