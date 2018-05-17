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
            let start_date,end_date;
            scope.model.value = ["",""];
            function setInitDate(day) {
                let start, end, startTime, endTime;
                end = new Date().getTime();
                start = end - 3600 * 24 * day * 1000;
                startTime = new Date(start);
                startTime = startTime.getFullYear() + '-' + ('00' + (startTime.getMonth() + 1)).slice(-2) + '-' + ('00' + startTime.getDate()).slice(-2);
                endTime = new Date(end);
                endTime = endTime.getFullYear() + '-' + ('00' + (endTime.getMonth() + 1)).slice(-2) + '-' + ('00' + endTime.getDate()).slice(-2);
                start_date = startTime;
                end_date = endTime;
            }

            if(scope.model.ranges){
                setInitDate(scope.model.ranges);
            }else{
                scope.model.value[0] = start_date = "";
                scope.model.value[1] = end_date = "";
            }


            $timeout(function(){
                scope.$watch("model.text",(newVal) => {
                    if(!newVal){
                        scope.model.value = ["",""]
                    }
                })

                scope.model.value[0] = start_date ? start_date + " 00:00:00" : '';
                scope.model.value[1] = end_date ? end_date + " 23:59:59" : "";
                if(!scope.model.value[0] && scope.model.value[1]){
                    scope.model.text = "";
                }else{
                    scope.model.text = `${start_date} 至 ${end_date}`;
                }



                var dateRange = new pickerDateRange(scope.model.id, {
                    aRecent7Days : 'aRecent7DaysDemo3', //最近7天
                    isTodayValid : true,
                    startDate : start_date,
                    endDate : end_date,
                    needCompare : true,
                    isSingleDay : false,
                    shortOpr : false,
                    defaultText : ' 至 ',
                    theme : 'gri',
                    success : function(obj) {
                        scope.model.value = [obj.startDate + " 00:00:00", obj.endDate + " 23:59:59"];
                        $('#'+scope.model.id).val(`${obj.startDate} 至 ${obj.endDate}`);
                        scope.model.text = `${obj.startDate} 至 ${obj.endDate}`;
                    }
                });
            });

        }
    };
};

