export default function(module) {
    module.directive('uiPopupContent', directive);
    directive.$inject = ['$timeout', 'pNotify', 'services'];
    function directive($timeout, pNotify, services) {
        return {
            restrict: 'E',
            replace: true,
            template: `<div class="ui-grid-cell-contents">{{ showedMessage }}</div>`,
            scope:{
                model: "="
            },
            link:function(scope, elem, attrs){
                let field = attrs['field'];
                let position = attrs['position']
                let text = scope.model[field];
                let title = '提示信息';
                scope.showedMessage = text;
                scope.$watch('model', function(val, oldVal){
                    if(val!=oldVal){
                        text = scope.model[field];
                        scope.showedMessage = text;
                         $(elem).popup({
                            title   : title,
                            content : scope.showedMessage,
                            transition: 'vertical flip',
                            offset:0,
                            distanceAway: 20,
                             position: position
                        });
                    }
                }, true);

                $(elem).popup({
                    title   :  title,
                    content : scope.showedMessage,
                    transition: 'vertical flip',
                    offset:0,
                    distanceAway: 20,
                    movePopup: true,
                    position: position
                });
            }
        }
    }
};
