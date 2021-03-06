export default function(module) {
    module.directive('uiSearchedItems', directive);
    directive.$inject = ['$timeout', 'pNotify', 'services'];
    function directive($timeout,pNotify,services){
        return {
            restrict: 'E',
            require: ['^?uiTopSearch'],
            priority: 400,
            template: `
            <div class="box common_label" style="position: relative;">
                <div id="sc_Box">
                    <div style="width: -moz-max-content;width: -webkit-max-content;width: max-content; position: relative; overflow: auto;"
                     id="searchList">
                    </div>
                </div>
            </div>`,
            replace: true,
            controller:function($scope){
                console.log($scope)
            },
            link: function(scope, elem, attrs, topSearchCtrl) {
                let labellist = []; //搜索项标签字典
                scope.openSearchModal = function(){
                    topSearchCtrl[0].openSearchModal(); //跟topSearch耦合在一起
                };

                scope.generateLabel = function(data){
                    return `<span class="item" data-key="${data.keyWord}">
                            ${data.name}&nbsp;<strong>:</strong>&nbsp;${data.valInfo}
                            <a class="remove_label" data-type="${data.type}" data-name="${data.keyWord}">×</a>
                            </span>`;
                }

                scope.outputLabel = function(data){
                    let label = scope.generateLabel(data);
                    scope.labellist.push(label);
                }

                $timeout(() =>{
                    //创建显示搜索项的labels
                    let count = 0;
                    if (!scope.searchKeys || angular.equals({}, scope.searchKeys)) {
                        $('#searchList').html("<span style='color:#999'>目前还没有相关的搜索信息!</span>")
                            .parents('.common_label')
                            .css("user-select","none");
                            scope.$parent.searchKeys.operateFunction();
                            return;
                    }

                    scope.$watch('searchKeys', function(newVal, oldVal) {
                        if(oldVal == newVal) {
                            // scope.$parent.searchKeys.operateFunction();
                            return;
                        }
                        count++;
                        scope.labellist = [];
                        let fields = scope.searchKeys.fields;
                        let searchDataStatus = false;
                        if(fields){
                            for(let key in fields){
                                if(fields[key].value || fields[key].text){
                                    searchDataStatus = true;
                                    break;
                                }
                            }
                        }

                        if(!searchDataStatus){
                            $('#searchList').html("<span style='color:#999'>目前还没有相关的搜索信息!</span>")
                            .parents('.common_label')
                            .css("user-select","none");
                            return;
                        }

                        let addble = false, html, keyWord, valInfo;
                        for (keyWord in fields) {
                            addble=false;
                            if (fields[keyWord].type == "input" && fields[keyWord].value) {
                                valInfo = fields[keyWord].value;
                                addble=true;
                            } else if(fields[keyWord].type=="area" && fields[keyWord].value) { //如果是地区选择器的话是city.name
                                addble=true;
                                if(fields[keyWord].level == 1){
                                    let arr = angular.fromJson(fields[keyWord].value);
                                    if(arr.length > 0){
                                        valInfo = angular.fromJson(fields[keyWord].value)[0].name;
                                    }
                                }else{
                                    let areaList = angular.fromJson(fields[keyWord].value);
                                    valInfo = '';
                                    angular.forEach(areaList,function(item){
                                        valInfo += item.name+'-';
                                    });
                                    valInfo =  valInfo.substring(0, valInfo.length - 1);
                                }
                            } else if (fields[keyWord].type == "datePicker" && fields[keyWord].value) {
                                valInfo = fields[keyWord].value.join('至');
                                addble=true;
                            } else if (fields[keyWord].type == "dropdown" && fields[keyWord].text) {
                                valInfo = fields[keyWord].text;
                                addble=true;
                            } else if (fields[keyWord].type == "dropdowns" && fields[keyWord].text) {
                                valInfo = fields[keyWord].text;
                                addble=true;
                            }


                            if(addble){
                                scope.outputLabel({
                                    keyWord:keyWord,
                                    name:fields[keyWord].label,
                                    valInfo:valInfo,
                                    type:fields[keyWord].type
                                });
                            }
                        }

                        html = scope.labellist.join('');
                        $('#searchList').html(html);
                        if (count == 1) {
                            scope.$parent.searchKeys.operateFunction();
                        }
                        scope.resetScrollBar();

                    }, true);
                })

                //生成新的labal由于长度发生变化，重新初始化滚动条样式
                scope.resetScrollBar = function(){
                    var view = $('#sc_Box');
                    let outerWidth = view.width(),
                    innerWidth = $('#searchList').width();

                    if(innerWidth > outerWidth) {
                        $(view).mCustomScrollbar({
                            axis: "x",
                            theme: "dark-thin",
                            autoExpandScrollbar: false,
                            advanced: { autoExpandHorizontalScroll: true }
                        });
                        $(view).mCustomScrollbar("scrollTo","left");
                    }else{
                        $(view).mCustomScrollbar("destroy");
                    }
                };

                //点击其中任何一个标签都会打开顶部搜索的sidebar组件
                $(elem).on('click', '.item', function() {
                    scope.openSearchModal();
                });

                //删除某一个查询的标签项，就会重新唤起一次查询
                $(elem).on('click', '.remove_label', function() {
                    let name = $(this).data('name');
                    let type = $(this).data('type');

                    scope.searchKeys.fields[name].value = '';
                    scope.searchKeys.fields[name].text = '';
                    scope.clearDomInfo(type,name);
                    scope.searchKeys.operateFunction();
                    $(this).parent().remove();
                    return false;
                });

                //特殊类型表单中 清空dom数据
                scope.clearDomInfo = function(type,name){
                    switch(type){
                        case "dropdown":
                        $(`#${topSearchCtrl[0].searchModalId} #searchItem_${name}.ui.dropdown`).dropdown('clear');
                        break;
                        case "area":
                        $(`#${topSearchCtrl[0].searchModalId} .area_check select`).val('');
                        break;
                        default:
                    }
                }

            }
        }
    }

};
