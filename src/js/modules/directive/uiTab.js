export default function(){
    return {
        restrict:'E',
        require:'?^tabBox',
        scope:{
            selectedId:'='
        },
        link:function(scope,elem,attrs,tabBoxCtrl){
           var menu = $(elem).find('.ui.menu .item');
            menu.tab({
                ignoreFirstLoad:false,
                onLoad:function(tab,parameterArray,history){
                    tabBoxCtrl.initLoading();
                }
            });

            tabBoxCtrl.setTabFirstNode(menu.eq(0));
        }
    };
};
