export default function(pNotify) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attrs, ngModel) {
            ngModel.$parsers.push(function(value) {
                if (value.length < 10) {
                    ngModel.$setValidity('oneToTen', true);
                    return value.toUpperCase();
                } else {
                    ngModel.$setValidity('oneToTen', false);
                    PNotify.show('Check me out! I\'m a notice.','error');
                    return undefined;
                }
            });
        }
    }
}
