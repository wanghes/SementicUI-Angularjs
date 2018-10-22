export default function(module) {
    module.directive('uiSliderModal', directive);
    directive.$inject = ['$timeout', 'pNotify', 'services', '$sce', 'utils'];
    function directive($timeout, pNotify, services, $sce, utils) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '../directives/uiSliderModal.html',
            transclude: true,
            scope: {
                sliderInfo: '='
            },
            controller: function($scope, $element) {
                let self = this;
                $scope.id = $scope.sliderInfo.id;
                $scope.formID = utils.GenNonDuplicateID();


                $scope.sliderButtons = $scope.sliderInfo.sliderButtons;
                $scope.fields = $scope.sliderInfo.fields || '';
                $scope.title = $scope.sliderInfo.title;
                $scope.icon = $scope.sliderInfo.icon;
                $scope.otherShow = $scope.sliderInfo.otherShow || false;

                $scope.fieldsColumn = $scope.sliderInfo.fieldsColumn || 2;
                $scope.formWidth = $scope.sliderInfo.formWidth || "100%";
                $scope.sidebarStyle = $scope.sliderInfo.sidebarStyle || "";
                $scope.operateFunctions = $scope.sliderInfo.operateFunctions || false;
                $scope.templates = []; //非公用设置，需要TODO
                $scope.searchValue = ''; //非公用设置，需要TODO
                $scope.formData = {};
                $scope.otherData = $scope.sliderInfo.otherHtml || {};
                $scope.city = services.city;

                $scope.fileChanged = ($event, name) => {
                    var files = $event.target.files;
                    $scope.fields[name].apiService(files[0]);
                }
            },
            link: function(scope, elem, attrs, ctrl) {
                $timeout(function() {
                    let itemWidth = 'width:' + Math.floor(100 / scope.fieldsColumn)+'%;';
                    scope.itemStyle = (field) => {
                        if ((field.type == 'area' && field.level == 3 || field.level == 2) || field.type == 'textarea'){
                            return 'float:left;width:100%;';
                        }else {
                            return `float:left; ${itemWidth}`;
                        }
                    }

                    $(`#${scope.id}`).sidebar('setting', {
                        dimPage: true, //显示褐色遮罩
                        transition: 'overlay',
                        scrollLock: true,
                        closable: false,
                        duration: 300
                    });

                    $(`#${scope.formID}`).find('.ui.dropdown.search.selection').dropdown({
                        direction: 'downward',
                        fullTextSearch: true,
                        transition: 'slide down',
                        forceSelection:false,
                        onChange: function(value, text, $selectedItem) {
                            //console.log(value+"---------"+text);
                            ////这里需要todo
                            scope.searchValue = value;
                        },
                        onShow: function() {
                            let self = $(this);
                            let func = self.data('func');

                            if (!func.length) {
                                return;
                            }
                            self.addClass('loading');
                            scope.operateFunctions[func](function(result, filedName) {
                                if (func == "showTemplates") { //这里是特殊设置，不是一种通用的模板设置
                                    scope.templates = result;
                                }
                                let dropdownList = result.map(item => {
                                    return `<div class="item" data-value="${item.id}">${item[filedName]}</div>`;
                                }).join('');
                                self.find('.menu').html(dropdownList);
                                self.removeClass('loading');
                            });

                        }
                    });
                });

                scope.closeRightModal = function() {
                    $(`#${scope.id}`).sidebar('hide');
                    scope.formReset(scope.fields);
                };
                //提交事件
                scope.emitClick = function(func) {
                     if (!func || func =="close") {
                        scope.closeRightModal();
                    } else {
                        if (scope.fields.length > 0) {
                            scope.formData = scope.getFormData();
                        }
                        scope.modalFormSubmitFunc(func);
                    }
                };
                //充值表单数据 dom操作不会反映到scope.fields上
                scope.formReset = function(fields) {
                    fields.forEach(item => {
                        switch (item.type) {
                            case "dropdownOne":
                                item.text = '';
                                item.value= '';
                                $(`#${scope.formID} input[name="${item.field_name}"]`).parent().dropdown('restore defaults'); //clear会将默认值也清掉，这样还会保留默认值
                                $(`#${scope.formID} input[name="${item.field_name}"]`).val('');
                                break;
                            case "dropdownTwo":
                                item.text = '';
                                item.value= '';
                                $(`#${scope.formID} input[name="${item.field_name}"]`).parent().dropdown('restore defaults'); //clear会将默认值也清掉，这样还会保留默认值
                                $(`#${scope.formID} input[name="${item.field_name}"]`).val('');
                                break;
                            case "dropdownTree":
                                item.text = '';
                                item.value= '';
                                $(`#${scope.formID} input[name="${item.field_name}"]`).val('');
                                $(`#${scope.formID} .ztreeShow`).val('');
                                break;
                            case "input":
                                $(`#${scope.formID} input[name="${item.field_name}"]`).val('');
                                break;
                            case "file":
                                $(`#${scope.formID} #${item.field_name}_attachmentName`).val('');
                                document.getElementById(`${item.field_name}`).outerHTML = document.getElementById(`${item.field_name}`).outerHTML;
                                break;
                            case "textarea":
                                $(`#${scope.formID} textarea[name="${item.field_name}"]`).val('');
                                break;
                            case "area":
                                item.value= '';
                                $(`#${scope.formID} input[name="${item.field_name}"]`).val('');
                                scope.$broadcast('clearCitys',scope.formID);
                                break;

                        }
                    });
                    if (scope.formData.fields) {
                        delete scope.formData.fields; //todo
                    }
                };

                //获取表单数据
                scope.getFormData = function() {
                    let formData = {};
                    if (scope.fields.length > 0) {
                        scope.fields.forEach(function(item, index) {
                            switch (item.type) {
                                case "input":
                                    formData[`${item.field_name}`] = $(`#${scope.formID} input[name='${item.field_name}']`).val();
                                    break;
                                case "file":
                                    formData[`${item.field_name}`] = $(`#${scope.formID} input[name='${item.field_name}']`).val();
                                    break;
                                case "area":
                                    formData[`${item.field_name}`] = $(`#${scope.formID} input[name='${item.field_name}']`).val();
                                    break;
                                case "dropdownOne":
                                    formData[`${item.field_name}`] = $(`#${scope.formID} input[name='${item.field_name}']`).val();
                                    break;
                                case "dropdownTwo":
                                    formData[`${item.field_name}`] = $(`#${scope.formID} input[name='${item.field_name}']`).val();
                                    break;
                                case "dropdownTree":
                                    formData[`${item.field_name}`] = $(`#${scope.formID} input[name='${item.field_name}']`).val();
                                    break;
                                case "textarea":
                                    formData[`${item.field_name}`] = $(`#${scope.formID} textarea[name='${item.field_name}']`).val();
                                break;
                            }
                        });
                        return angular.extend(scope.formData, formData);
                    }
                    return {};
                };

                scope.modalFormSubmitFunc = function(functionString) {
                    let result;
                    //判断调用的是否为关闭或者取消按钮
                    if (functionString == 'close' || functionString == '') {
                        scope.closeRightModal();
                        return;
                    }

                    if (scope.fields.length > 0) {
                        result = scope.formData;
                        if (scope.extraFields && angular.isObject(scope.extraFields)) {
                            result = angular.extend(scope.formData, scope.extraFields);
                            scope.operateFunctions[functionString](result, function() {
                                scope.closeRightModal();
                            });
                        } else {
                            scope.operateFunctions[functionString](result, function() {
                                scope.closeRightModal();
                            });
                        }
                    } else {
                        //一般是消息关闭的时候会调用
                        scope.operateFunctions[functionString](function() {
                            scope.closeRightModal()
                        });
                    }

                    return result;
                };
            }
        }
    }
};
