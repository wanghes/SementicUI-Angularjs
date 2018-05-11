import serviceModule from '../modules/service/services';
import utilsModule from '../modules/service/utils';
import trackDirectiveModule from '../modules/directive/trackDirectives';

let dashboardModule = angular.module('dashboardModule', [
    'serviceModule',
    'utilsModule',
    'trackDirectiveModule',
    'ngSanitize'
]);

dashboardModule.filter('to_trusted', [
    '$sce',
    function($sce) {
        return function(text) {
            return $sce.trustAsHtml(text);
        }
    }
]);
export default function dashboard() {
    dashboardModule.controller('dashboardCtrl', dashboardCtrl);
    dashboardCtrl.$inject = ['$scope', '$interval', '$sce', "oauth", "$timeout", "utils", 'services'];
    function dashboardCtrl($scope, $interval, $sce, oauth, $timeout, utils, services) {
        utils.localStorage.set('role', `{
            name:"金三胖"
        }`);
        utils.cookie.setObject('role', {
            name: "金三胖",
            sex:1,
            age:32
        });
        $timeout(function() {
            $scope.nickname = "金三胖";
            if ($('#loadingBox')) {
                $('#loadingBox').hide();
            }
        });
        $timeout(function(){
            $scope.loginMessage = '<br><b>今天我们去哪里？</b>';
        }, 1000);



        /*oauth.callJudgeLogin(function(userInfo) {
            $scope.nickname = userInfo.nick_name;
        });*/
    }
}
