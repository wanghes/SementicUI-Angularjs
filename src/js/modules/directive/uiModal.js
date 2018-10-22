export default function(module) {
    module.directive('uiModal', directive);
    directive.$inject = ['$timeout', 'pNotify', 'services', '$sce'];
    function directive($timeout, pNotify, services, $sce) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '../directives/uiModal.html',
            scope: {
                infos: '=modalInfo'
            },
            controller: function($scope, $element) {
                // modal只显示message信息
                $scope.message = ($scope.infos.message && $scope.infos.message != '') ? $scope.infos.message : '';
                // modal表单项目的字段
                $scope.fields = $scope.infos.fields || {};
                // 标题
                $scope.title = $scope.infos.title;
                // formID:modal的id
                $scope.id = $scope.infos.id;
                // formID:表单的id
                $scope.formID = $scope.id + "Form";
                // modalSize:模态框的尺寸
                $scope.modalSize = $scope.infos.modalSize || '';
                // fieldsColumn:字段排放列数
                $scope.fieldsColumn = $scope.infos.fieldsColumn || 2;
                // 表单字段的每项宽度的设置
                $scope.itemWidth = Math.floor(100 / $scope.fieldsColumn);
                // 操作函数
                $scope.operateFunctions = $scope.infos.operateFunctions || false;
                // modal底部的显示按钮
                $scope.modalButtons = $scope.infos.modalButtons;
                // 操作按钮的位置
                $scope.buttonLocation = $scope.infos.buttonLocation || "right";
                // 文件上传函数处理
                $scope.fileChanged = ($event, name) => {
                    var files = $event.target.files;
                    $scope.fields[name].apiService(files[0]);
                }
            },
            link: function(scope, elem, attrs, ctrl) {
                //关闭弹出层事件
                scope.closeModal = function(reset) {
                    $(`#${scope.id}`).modal('hide');
                    if(reset){
                        scope.formReset();
                    }
                };

                //设置弹出层的按钮事件
                scope.modalBtnEventFunc = function(btnID = '') {
                    if (!btnID || !$('#'+btnID).data('func') || $('#'+btnID).data('func')=="close") {
                        scope.closeModal(true);
                    } else {
                        let func = $('#' + btnID).data('func');
                        scope.modalFormSubmitFunc(func);
                    }
                };

                $timeout(function() {
                    $(elem).find('.ui.search.selection.dropdown').dropdown({
                        direction: 'downward',
                        fullTextSearch: true,
                        transition: 'slide down',
                        forceSelection: false,//fix默认选中最后一个
                        onChange: function(value, text, $selectedItem) {
                            // value 包含单选和多选的值
                            // text 选择得值
                            // $selectedItem 选择的dom节点html
                            console.log($selectedItem)
                        },
                        // 只能配合多选时候使用onAdd
                        onAdd:function(addedValue, addedText, $addedChoice){
                            // addedValue 每次选择的值
                            // addedText 每次选择的dom节点html
                            // $addedChoice 选择的jquery元素节点html
                        },
                        onShow: function() {
                            let self = $(this);
                            let func = self.data('handle');
                            if (!func) {
                                return;
                            } else {
                                self.addClass('loading');
                            }

                            scope.operateFunctions[func](function(result, filedName, showValue) {
                                let dropdownList = result.map(item => {
                                    return `<div class="item" data-value="${item[showValue]||item.id}">${item[filedName]}</div>`;
                                }).join('');
                                self.find('.menu').html(dropdownList);
                                self.removeClass('loading');
                            });

                        }
                    });
                });

                scope.formReset = function() {
                    for (let key in scope.fields) {
                       let item = scope.fields[key];
                       switch(item.type){
                            case "dropdown":
                                item.value = '';
                                $(`#${scope.formID} input[name="${key}"]`).parent().dropdown('restore defaults'); //clear会将默认值也清掉，这样还会保留默认值
                                $(`#${scope.formID} input[name="${key}"]`).val('');
                                break;
                            case "dropdowns":
                                item.value = '';
                                $(`#${scope.formID} input[name="${key}"]`).parent().dropdown('restore defaults'); //clear会将默认值也清掉，这样还会保留默认值
                                $(`#${scope.formID} input[name="${key}"]`).val('');
                                break;
                            case "dropdownTree":
                                item.value = '';
                                $(`#${scope.formID} input[name="${key}"]`).val('');
                                $(`#${scope.formID} .ztreeShow`).val('');
                                break;
                            case "input":
                                item.value= '';
                                $(`#${scope.formID} input[name="${key}"]`).val('');
                                break;
                            case "textarea":
                                item.value= '';
                                $(`#${scope.formID} textarea[name="${key}"]`).val('');
                                break;
                            case "file":
                                item.value= '';
                                $(`#${scope.formID} #${key}_attachmentName`).val('');
                                break;
                            case "area":
                                item.value= '';
                                scope.$broadcast('clearCitys', scope.formID);
                                break;
                        }
                    }
                }

                scope.getFormData = function(scope) {
                    let formData = {};

                    for(let key in scope.fields) {
                        let item = scope.fields[key];

                        switch (item.type) {
                            case "input":
                                formData[`${key}`] = $(`#${scope.formID} input[name='${key}']`).val();
                                break;
                            case "file":
                                formData[`${key}`] = $(`#${scope.formID} input[name='${key}']`).val();
                                break;
                            case "dropdown":
                                formData[`${key}`] = $(`#${scope.formID} input[name='${key}']`).val();
                                break;
                            case "dropdowns":
                                formData[`${key}`] = $(`#${scope.formID} input[name='${key}']`).val();
                                break;
                            case "dropdownTree":
                                formData[`${key}`] = $(`#${scope.formID} input[name='${key}']`).val();
                                break;
                            case "textarea":
                                formData[`${key}`] = $(`#${scope.formID} textarea[name='${key}']`).val();
                                break;
                            case "area":
                                formData[`${key}`] = $(`#${scope.formID} input[name='${key}']`).val();
                            break;
                        }
                    }
                    console.log(formData);
                    return formData;

                };

                scope.modalFormSubmitFunc = async (functionString = '') => {
                    let result;
                    let formData = {};

                    //判断调用的是否为关闭或者取消按钮并清空表单数据
                    if (functionString == 'close' || functionString == '') {
                        scope.closeModal(true);
                        return;
                    }
                    // 不清空表单
                    if(functionString == "noResetValues"){
                        scope.closeModal();
                        return;
                    }

                    //获取表单中的数据
                    if(!scope.message){
                        formData = scope.getFormData(scope);
                    }

                    if (scope.fields.length > 0) {
                        result = formData;
                        // if (scope.extraFields && angular.isObject(scope.extraFields)) {
                        //     result = angular.extend(formData, scope.extraFields);
                        // }
                        let res = await scope.operateFunctions[functionString](result);
                        if (res) {
                            scope.closeModal(true);
                        }
                    } else {
                        //一般是消息关闭的时候会调用
                        scope.operateFunctions[functionString]();
                        scope.closeModal(true);
                    }
                };

            }
        }
    }
};
