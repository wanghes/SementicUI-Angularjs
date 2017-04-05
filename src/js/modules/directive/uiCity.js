export default function($timeout,pNotify,services){
    return {
        restrict:'E',
        template:`<div style="display:flex;" class="area_check">
                    <select class="ui dropdown province_node" name="province" ng-model="province" ng-change="selectProvince(province)">
                        <option value="" disabled selected>请选择省份</option>
                        <option ng-repeat="province in provinces" value="{{province}}">{{province.name}}</option>
                    <select>
                    <select  ng-if="level>=2" class="ui dropdown city_node" name="city" ng-model="city" ng-change="selectCity(city)">
                        <option value="" disabled selected>请选择城市</option>
                        <option ng-repeat="thisCity in citys"  value="{{'{*name*:*'+thisCity.name+'*,*code*:*'+thisCity.code+'*}'}}">{{thisCity.name}}</option>
                    <select>
                    <select  ng-if="level==3" class="ui dropdown area_node" name="area" ng-model="area" ng-change="selectArea(area)">
                        <option value="" disabled selected>请选择区县</option>
                        <option ng-repeat="thisArea in areas"  value="{{'{*name*:*'+thisArea.name+'*,*code*:*'+thisArea.code+'*}'}}">{{thisArea.name}}</option>
                    <select>
                </div>`,
        scope:{
            selectedProvince:"="
        },
        controller:function($scope){
            $scope.$on('clearCitys',function($event,wrapID){
                 $scope.reset(wrapID);
            })
            $scope.reset =  function(wrapID){
                $timeout(function(){
                    $('#'+wrapID+' .area_check .province_node').val('').trigger('change');
                    $('#'+wrapID+' .area_check .city_node').val('').trigger('change');
                    $('#'+wrapID+' .area_check .area_node').val('').trigger('change');
                })   
            }
        },
        link:function(scope,elem,attrs,ctrl){
            scope.level = attrs['level'];
            scope.provinces = [];
            scope.citys = [];
            scope.city = '';
            scope.areas = [];
            scope.area = '';
            //添加省份的信息到遍历的ng-repeat列表中[一边情况下单选省份的需求会多一些]
            angular.forEach(services.city,function(item){
                scope.provinces.push({name:item.name,code:item.code});
            });

            scope.selectProvince = function(province){
                if(!province){ 
                    return;
                }
                scope.selectedProvince = `[${province}]`;
                scope.area = '';
                scope.city = '';
                scope.areas = [];
                scope.citys = [];
                if(!!province && scope.level>=2){
                    scope.showCitys(province);
                }
            };

            scope.showCitys = function(province){    
                let provinceCode = scope.$eval(province).code; 
                angular.forEach(services.city, function(item) {
                    if (item.code == provinceCode) {
                        scope.citys = item.sub
                    }
                })
            };

            scope.selectCity = function(city){
                if(!scope.selectedProvince.length) return;   
                let generArr = scope.selectedProvince ? JSON.parse(scope.selectedProvince) :[];
                scope.area = '';
                scope.areas = [];
                if(!!city && scope.level==3){
                    city = city.replace(/\*/g,'"');
                    scope.city = city;
                    let jsonCity = angular.fromJson(city);
                    if(generArr.length==3){
                        generArr = [generArr[0]];
                        generArr.push(jsonCity);
                    }else if(generArr.length==2){
                        generArr.pop();
                        generArr[1] = jsonCity;
                    }else{
                        generArr.length = 2;
                        generArr[1] = jsonCity;
                    }
                    let json = angular.toJson(generArr);
                    scope.selectedProvince = json;
                    scope.showAreas(city);
                }
            };

            scope.showAreas = function(city){
                let cityCode = scope.$eval(city).code; 
                if(!scope.citys) return;
                angular.forEach(scope.citys, function(item) {
                    if (item.code == cityCode) {
                        scope.areas = item.sub
                    }
                })
            };

            scope.selectArea = function(area){
                if(!scope.selectedProvince.length) return;   
                let generArr = scope.selectedProvince ? JSON.parse(scope.selectedProvince):[];
                if(!!area){
                    area = area.replace(/\*/g,'"');
                    scope.area = area;
                    let jsonArea = angular.fromJson(area);
                    if(generArr.length==3){
                        generArr.pop();
                        generArr.push(jsonArea);
                    }else if(generArr.length==2){
                        generArr.length = 3;
                        generArr[2] = jsonArea;
                    }
                
                    let json = angular.toJson(generArr);
                    scope.selectedProvince = json;
                   // console.log(scope.selectedProvince);
                } 
            }


        }
    }
}

