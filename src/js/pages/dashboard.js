import serviceModule from '../modules/service/services';
import trackDirectiveModule from '../modules/directive/trackDirectives';
let dashboardModule = angular.module('dashboardModule', [
    'serviceModule',
    'ui.grid',
    'trackDirectiveModule'
]);

export default function dashboard() {
    dashboardModule.controller('dashboardCtrl', dashboardCtrl);
    dashboardCtrl.$inject = ['$scope', 'i18nService', '$interval', "oauth", "$timeout"];
    function dashboardCtrl($scope, i18nService, $interval, oauth, $timeout) {
        $timeout(function() {
            $scope.nickname = "王海松";
            if ($('#loadingBox')) {
                $('#loadingBox').hide();
            }
        })


        /*      oauth.callJudgeLogin(function(userInfo) {
                  $scope.nickname = userInfo.nick_name;
              });*/
    }
}
