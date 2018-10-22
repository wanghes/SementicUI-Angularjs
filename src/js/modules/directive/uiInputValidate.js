export default function(module) {
    module.directive('inputValidate', directive);
    directive.$inject = ['$timeout', 'pNotify', 'services'];
    function directive($timeout, pNotify, services){
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elem, attrs, ngModel) {
                ngModel.$parsers.push(function(value) {
                    if (value.length < 10) {
                        ngModel.$setValidity('input', true);
                        return value.toUpperCase();
                    } else {
                        ngModel.$setValidity('input', false);
                        pNotify.show('不能超过10个字符','error');
                        return undefined;
                    }
                });
            }
        }
    }
};
