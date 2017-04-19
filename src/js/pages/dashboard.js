import serviceModule from '../modules/service/services';
import trackDirectiveModule from '../modules/directive/trackDirectives';
let dashboardModule = angular.module('dashboardModule', ['serviceModule', 'trackDirectiveModule', 'ngSanitize']);
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
    dashboardCtrl.$inject = ['$scope', '$interval', '$sce', "oauth", "$timeout"];
    function dashboardCtrl($scope, $interval, $sce, oauth, $timeout) {
        $timeout(function() {
            $scope.nickname = "马云";
            if ($('#loadingBox')) {
                $('#loadingBox').hide();
            }
        });
        $timeout(function(){
            $scope.loginMessage = 'hello,<br><b>今天我们去哪里？</b>';
        },1000)


        /* oauth.callJudgeLogin(function(userInfo) {
          $scope.nickname = userInfo.nick_name;
      });*/
    }
}
