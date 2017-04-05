export default function($timeout){
    return {
        restrict: 'E',
        scope:{
            selectedId:'@'
        },
        replace:true,
        template:"<div ng-transclude></div>",
        transclude:true,
        link: function(scope, elem, attrs) {
            let topSearch = $(elem).find('#topSearch'),
                buttonGroup = $(elem).find('#buttonGroup'),
                dataTable = $(elem).find('#dataTable'),
                tableDetail = $(elem).find('#tableDetail'),
                buttonGroupHeight,
                topSearchHeight,
                grid,tableHeight,
                topHeight;

            topSearchHeight = topSearch.outerHeight();
            $timeout(function(){
                if(buttonGroup && buttonGroup.find('.ui.button').length>0){
                    buttonGroupHeight = buttonGroup.outerHeight();
                }else{
                    topSearch.addClass('noPadding');
                    if(buttonGroup) buttonGroup.remove();
                    buttonGroupHeight = 0;
                }

                grid = dataTable.find('#grid');
                topHeight = topSearchHeight+buttonGroupHeight; //这个是顶部搜索的高度和按钮组的高度之和
              
                tableHeight = $(elem).height() - topHeight; //设置表格占据的高度
                dataTable.find('#grid').height(tableHeight);
                dataTable.height(tableHeight);
                $(window).on('resize',function(){
                    let newHeight = $(elem).height()-topHeight;
                    dataTable.height(newHeight);
                    dataTable.find('.main_grid').height(newHeight);
                })

                if(tableDetail.length){
                    scope.$watch('selectedId', function(newVal, oldVal, scope) {
                        if (oldVal != newVal) {
                            if (tableDetail.hasClass('showActive')) {
                                return;
                            }
                            tableHeight = tableHeight - 300;
                            dataTable.height(tableHeight);
                            $('#grid').height(tableHeight);
                            tableDetail.addClass('showActive');
                        }
                    });
                }
            });


        }
    }
};