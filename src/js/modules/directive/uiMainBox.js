export default function(module){
    module.directive('mainBox', directive);
    directive.$inject = ['$timeout'];
    function directive($timeout){
        return {
            restrict: 'E',
            scope:{
                selectedId:'@',
                noTable:"@",
                selfStyle:"@"
            },
            replace:true,
            template:"<div ng-transclude></div>",
            transclude:true,
            link: function(scope, elem, attrs) {
                let topSearch = $(elem).find('#topSearch'),
                    buttonGroup = $(elem).find('#buttonGroup'),
                    dataTable = $(elem).find('#dataTable'),
                    tableDetail = $(elem).find('#tableDetail'),
                    tableIntro = $(elem).find('#tableIntro'),
                    buttonGroupHeight,
                    tableIntroHeight =0,
                    topSearchHeight,
                    grid,tableHeight,
                    topHeight;

                if(scope.noTable){ //若果是不代表格直接显示磨人的内容
                    $(elem).css({"padding":"65px 15px 15px"})
                    return;
                }

                if(scope.selfStyle){
                    $(elem).css({"padding":"50px 15px 15px","overflow":"auto"});
                    return;
                }

                topSearchHeight = topSearch.outerHeight();
                $timeout(function(){
                    if(buttonGroup && buttonGroup.find('.ui.button').length>0){
                        buttonGroupHeight = buttonGroup.outerHeight();
                    }else{
                        topSearch.addClass('noPadding');
                        if(buttonGroup) buttonGroup.remove();
                        buttonGroupHeight = 0;

                    }

                    if(tableIntro){
                        tableIntroHeight = tableIntro.outerHeight();
                    }



                    grid = dataTable.find('#grid');
                    topHeight = topSearchHeight+buttonGroupHeight+tableIntroHeight; //这个是顶部搜索的高度和按钮组的高度之和

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
    }
};
