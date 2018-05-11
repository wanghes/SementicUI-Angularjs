export default function($timeout,pNotify,services){
    return {
        restrict:'E',
        template:`
        <div style="display:flex;" class="area_check">
            <select
                ng-model="province"
                class="ui dropdown province_node"
                name="province"
                ng-change="selectProvince(province)"
                ng-options="provinceItem as provinceItem.name for provinceItem in provinces"
            >
                <option value="" disabled selected>{{ province ? province.name : "请选择省份" }}</option>
            </select>
            <select
                ng-if="level>=2"
                ng-model="city"
                class="ui dropdown city_node"
                name="city"
                ng-change="selectCity(city)"
                ng-options="cityItem as cityItem.name for cityItem in citys"
            >
                <option value="" disabled selected>{{ city ? city.name : "请选择城市" }}</option>
            </select>
            <select
                ng-if="level==3"
                ng-model="area"
                class="ui dropdown area_node"
                name="area"
                ng-change="selectArea(area)"
                ng-options="areaItem as areaItem.name for areaItem in areas"
            >
                <option value="" disabled selected>{{ area ? area.name : "请选择区县" }}</option>
            </select>
        </div>
        `,
        scope:{
            selected:"="
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
            scope.provinces = [];
            scope.citys = [];
            scope.areas = [];
            scope.level = attrs['level'];

            scope.$watch("selected",function(newVal, oldVal){
                if(!scope.selected){
                    scope.province = "";
                    scope.city = '';
                    scope.area = '';
                }else{

                    let province = services.city.filter((item) => {
                        return item.code == scope.selected[0].code
                    });

                    let temp_province = province.pop(), temp_city, temp_area;
                    scope.province = temp_province;

                    if(scope.selected.length == 1) return;

                    if(scope.level >= 2){
                        let { sub } = temp_province;
                        let city = sub.filter((item) => {
                            return item.code == scope.selected[1].code
                        });
                        temp_city = city.pop();
                        scope.city = temp_city;
                        scope.citys = sub;
                    }

                    if(scope.selected.length == 2) return;

                    if(scope.level == 3){
                        let { sub } = temp_city;

                        let area = sub.filter((item) => {
                            return item.code == scope.selected[2].code
                        });
                        temp_area = area.pop();
                        scope.area = temp_area
                        scope.areas = sub;
                    }
                }
            })


            //添加省份的信息到遍历的ng-repeat列表中[一般情况下单选省份的需求会多一些]
            angular.forEach(services.city,function(item){
                let {name,code,sub} = item;
                scope.provinces.push({name,code,sub});
            });

            scope.selectProvince = function(province){
                if(!province){
                    return;
                }

                let { name, code, sub } = province;
                let province_stick  =  {
                    name,
                    code
                };

                scope.province = province_stick;

                scope.selected = [{
                    name,
                    code
                }];

                scope.area = '';
                scope.city = '';
                scope.areas = [];
                scope.citys = [];
                if(!!province && scope.level >= 2){
                    scope.showCitys(sub);
                }
            };

            scope.showCitys = function(cities) {
                scope.citys = cities;
            };

            scope.selectCity = function(city) {
                if(!city) return;
                if(scope.selected && !scope.selected.length) return;

                let { name, code, sub } = city;

                let city_stick = {
                    name,
                    code
                }
                scope.city = city_stick;
                scope.area = '';
                scope.areas = [];

                let selected_length = scope.selected.length;
                if(!!city){
                    if(scope.level==3) {
                        if( selected_length == 3 ){
                            scope.selected.splice(1,2,city_stick);
                        }else if( selected_length == 2 ){
                            scope.selected.splice(1,1,city_stick);
                        }else{
                            scope.selected.push(city_stick);
                        }
                        scope.showAreas(sub);
                    }else if(scope.level==2){
                        if(selected_length>=2){
                            scope.selected.splice(1,1,city_stick);
                        }else{
                            scope.selected.push(city_stick);
                        }
                    }
                }
            };

            scope.showAreas = function(areas){
                scope.areas = areas

            };

            scope.selectArea = function(area){
                if(!area) return;
                if(!scope.selected.length) return;

                let selected_length = scope.selected.length;
                let { name,code } = area;
                let area_stick = { name,code }
                scope.area = area_stick;
                if(!!area){
                    if(selected_length==3){
                        scope.selected.splice(2,1,area_stick)
                    }else if(selected_length==2){
                        scope.selected.push(area_stick)
                    }
                }
            }

        }
    }
}

