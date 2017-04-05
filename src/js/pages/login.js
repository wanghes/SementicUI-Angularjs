import serviceModule from '../modules/service/services';

let loginModule = angular.module('loginModule',[
    'serviceModule',
    'ngCookies'
]);

export default function login(){
    loginModule.controller('loginCtrl',loginCtrl);
    loginCtrl.$inject = ['$scope','users','$cookies'];
    function loginCtrl($scope, users,$cookies){
         $scope.loginInfo = {
            name:'',
            password : ''
        };

        $scope.submit= function(){
            users.login.query($scope.loginInfo, function(result){
                if(result && result[0].id==1){
                    window.parent.location.pathname='/';
                }else{
                    alert("获取数据失败");
                }
            });
        }
    }
}