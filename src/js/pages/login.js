import serviceModule from '../modules/service/services';
import utilsModule from '../modules/service/utils';

let loginModule = angular.module('loginModule',[
    'serviceModule',
    'utilsModule'
]);

export default function login(){
    loginModule.controller('loginCtrl',loginCtrl);
    loginCtrl.$inject = ['$scope', 'services', 'utils', '$timeout'];
    function loginCtrl($scope, services, utils, $timeout){
        $scope.loginInfo = {
            name:'',
            password : ''
        };

        $timeout(function() {
            if ($('#loadingBox')) {
                $('#loadingBox').hide();
            }
        });

        $scope.submit= function(){
            window.parent.location.pathname='/';
        }
    }
}
