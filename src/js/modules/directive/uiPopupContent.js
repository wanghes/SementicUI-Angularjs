export default function(){
    return {
        restrict:'E',
        replace:true,
        template:`<div class="ui-grid-cell-contents">{{showedMessage}}</div>`,
        scope:{
            model: "="
        },
        link:function(scope,elem,attrs){
            let info = scope.$eval(attrs['text']);
            let text = scope.model[info.field];
            let title = info.title;
            scope.showedMessage = text;
            scope.$watch('model',function(val,oldVal){
                if(val!=oldVal){
                    text = scope.model[info.field];
                    scope.showedMessage = text;
                     $(elem).popup({
                        title   : title,
                        content : scope.showedMessage,
                        transition: 'vertical flip'
                    });
                }
            },true);

            $(elem).popup({
                title   : title,
                content : scope.showedMessage,
                transition: 'vertical flip'
            });
        }
    }
}