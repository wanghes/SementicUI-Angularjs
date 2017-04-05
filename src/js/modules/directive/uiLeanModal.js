export default function($timeout, pNotify, services, $sce) {
    return {
        restrict: 'E',
        replace: true,
        template: `<div class="ui {{modalSize}} modal" id="{{id}}">
                        <i class="close icon"></i>
                        <div class="header" ng-bind="title"></div>
                        <div class="content" id="{{id}}InsertModal" style="width:{{contentWidth}}; margin:0 auto;">
                            <div ng-show="fields.length>0">
                                <form class="insert_slider ui form" name="alertForm" novalidate id="{{formID}}" style="display:flex; flex-wrap:wrap;">
                                    <div ng-repeat="field in fields" class="field_wrap" style="width:{{itemWidth}}%" ng-hide="field.unShow">
                                        <div ng-switch="field.type" style="width:100%">
                                            <div ng-switch-when="dropdownOne" class="sixteen wide field" style="padding:7px 5px;" >
                                                <label>{{field.name}}</label>
                                                <div class="ui search selection dropdown" data-func="{{field.defaultFuncName}}">
                                                    <input name="{{field.field_name}}" type="hidden" value="{{field.value}}">
                                                    <i class="dropdown icon"></i>
                                                    <div ng-class="{true: 'text', false: 'text default'}[field.text.length>0]">
                                                    {{field.text || field.defaultText}}</div>
                                                    <div class="menu">
                                                        <div class="item" ng-repeat="data in field.data" data-value="{{data.value}}">{{data.name}}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div ng-switch-when="dropdownTwo" class="sixteen wide field" style="padding:7px 5px;">
                                                <label>{{field.name}}</label>
                                                <div class="ui search selection dropdown multiple" data-func="{{field.defaultFuncName}}">
                                                    <input name="{{field.field_name}}" type="hidden" value="{{field.value}}">
                                                    <i class="dropdown icon"></i>
                                                    <div class="text default">{{field.text || field.defaultText}}</div>
                                                    <div class="menu">
                                                        <div class="item" ng-repeat="data in field.data" data-value="{{data.value}}">{{data.name}}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div ng-switch-when="dropdownTree" class="sixteen wide field" style="padding:7px 5px;">
                                                <tree-view item="field"></tree-view>
                                            </div>
                                            <div ng-switch-when="input" class="sixteen wide field" style="padding:7px 5px;">
                                                <label>{{field.name}}</label>
                                                <input type="text" name="{{field.field_name}}" placeholder="{{field.defaultText}}" value="{{field.value}}" ng-model="field.value" ng-change="field.changeFunc()">
                                            </div>
                                            <div ng-switch-when="file" class="sixteen wide field" style="padding:7px 5px;">
                                                <label>{{field.name}}</label>
                                                <div class="ui action input">
                                                    <input type="text" name="{{field.field_name}}" id="{{field.field_name}}_attachmentName"
                                                    value="{{field.value}}" placeholder="{{field.defaultText}}">
                                                    <label for="{{field.field_name}}" class="ui icon button btn-file">
                                                        <span>选择文件</span><i class="attach icon"></i>
                                                        <input type="file" id="{{field.field_name}}" data-field-name="{{field.field_name}}"
                                                        data-api-service="{{field.apiService}}"
                                                        onchange="angular.element(this).scope().changeFileFunc(this)"
                                                        name="{{field.field_name}}" style="display:none;">
                                                    </label>
                                                </div>
                                            </div>
                                            <div ng-switch-when="textarea" class="sixteen wide field" style="padding:7px 5px;">
                                                <label>{{field.name}}</label>
                                                <textarea rows="2" name="{{field.field_name}}" ng-model="field.value" placeholder="{{field.defaultText}}">
                                                {{field.value}}
                                                </textarea>
                                            </div>
                                            <div ng-switch-when="area" class="sixteen wide field" style="padding:7px 5px;">
                                                <label>{{field.name}}</label>
                                                <input type="hidden" name="{{field.field_name}}" value="{{field.value}}">
                                                <ui-city selected-province="field.value" level="{{field.level}}"></ui-city>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div ng-show="message">
                                {{message}}
                            </div>
                        </div>
                        <div class="actions" style="text-align:{{buttonLocation}}">
                            <div ng-repeat="modalButton in modalButtons" id="{{modalButton.id}}"
                            data-func="{{modalButton.func}}" ng-click="modalBtnEventFunc(modalButton.id)"
                            class="ui {{modalButton.className}} button">
                                {{modalButton.name}}
                            </div>
                        </div>
                    </div>`,
        scope: {
            modalInfo: '='
        },
        controller: function($scope, $element) {
            $scope.modalButtons = $scope.modalInfo.modalButtons;
            $scope.fields = ($scope.modalInfo.fields && $scope.modalInfo.fields.length > 0) ? $scope.modalInfo.fields : [];
            $scope.message = ($scope.modalInfo.message && $scope.modalInfo.message != '') ? $scope.modalInfo.message : '';
            $scope.title = $scope.modalInfo.title;
            $scope.id = $scope.modalInfo.id;
            $scope.formID = $scope.id + "Form";
            $scope.content = $scope.modalInfo.content || '';
            $scope.modalSize = $scope.modalInfo.modalSize || '';
            $scope.fieldsColumn = $scope.modalInfo.fieldsColumn || 2;
            $scope.extraFields = $scope.modalInfo.extraFields || false;
            $scope.contentWidth = $scope.modalInfo.contentWidth || 'auto';
            $scope.operateFunctions = $scope.modalInfo.operateFunctions || false;
            $scope.buttonLocation = $scope.modalInfo.buttonLocation || "right";
        },
        link: function(scope, elem, attrs, ctrl) {

            scope.changeFileFunc = function(self) {
                let fieldData = $(self).data();
                let fileID = fieldData.fieldName;
                let apiService = fieldData.apiService;
                $('#' + fileID + "_attachmentName").val($('#' + fileID).get(0).files[0].name);

                var formData = new FormData();
                formData.append("path", document.getElementById(fileID).files[0]);

                scope.operateFunctions[apiService](formData, function(data) {
                    if (scope.extraFields && data) {
                        for (let key in scope.extraFields) {
                            for (let i in data) {
                                if (i == key) {
                                    scope.extraFields[key] = data[i];
                                }
                            }
                        }
                    }
                });
            }

            scope.closeModal = function(scope,noReset) {
                $(`#${scope.id}`).modal('hide');
                if(!noReset){
                    scope.formReset(scope.fields);
                }
            };

            //设置弹出层的按钮事件
            scope.modalBtnEventFunc = function(btnID = '') {
                if (!btnID || !$('#'+btnID).data('func')||$('#'+btnID).data('func')=="close") {
                    scope.closeModal(scope);
                } else {
                    let func = $('#' + btnID).data('func');
                    scope.modalFormSubmitFunc(func);
                }
            };

            $timeout(function() {
                scope.itemClass = "sixteen";
                scope.itemWidth = Math.ceil(100 / scope.fieldsColumn);

                $(elem).find('.ui.search.selection.dropdown').dropdown({
                    direction: 'downward',
                    fullTextSearch: true,
                    transition: 'slide down',
                    forceSelection: false,//fix默认选中最后一个
                    onChange: function(value, text, $selectedItem) {},
                    onShow: function() {
                        let self = $(this);
                        let func = self.data('func');

                        if (!func.length) {
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
            }, 0);

            scope.formReset = function(fields) {
                fields.forEach(item => {
                    switch(item.type){
                        case "dropdownOne":
                            // item.text = '';
                            // item.value= '';                           
                            $(`#${scope.formID} input[name="${item.field_name}"]`).parent().dropdown('restore defaults'); //clear会将默认值也清掉，这样还会保留默认值
                            $(`#${scope.formID} input[name="${item.field_name}"]`).val('');
                            break;
                        case "dropdownTwo":
                            $(`#${scope.formID} input[name="${item.field_name}"]`).parent().dropdown('restore defaults'); //clear会将默认值也清掉，这样还会保留默认值
                            $(`#${scope.formID} input[name="${item.field_name}"]`).val('');
                            break;
                        case "dropdownTree":
                            $(`#${scope.formID} input[name="${item.field_name}"]`).val('');
                            $(`#${scope.formID} .ztreeShow`).val('');
                            break;
                        case "input":
                             item.value= '';
                            $(`#${scope.formID} input[name="${item.field_name}"]`).val('');
                            break;
                        case "textarea":
                            $(`#${scope.formID} textarea[name="${item.field_name}"]`).val('');
                            break;
                        case "file":
                            item.value= '';
                            $(`#${scope.formID} #${item.field_name}_attachmentName`).val('');
                            document.getElementById(`${item.field_name}`).outerHTML = document.getElementById(`${item.field_name}`).outerHTML;
                            break;
                        case "area":
                            item.value= '';
                            $(`#${scope.formID} input[name="${item.field_name}"]`).val('');
                            scope.$broadcast('clearCitys',scope.formID);
                            break;
                    }
                 });

            }

            scope.getFormData = function(scope) {
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
                            case "area":
                                formData[`${item.field_name}`] = $(`#${scope.formID} input[name='${item.field_name}']`).val();
                            break;
                        }
                    });

                    return formData;
                }
                return {};
            };

            scope.modalFormSubmitFunc = function(functionString = '') {
                let result;
                let formData = {};

                //判断调用的是否为关闭或者取消按钮
                if (functionString == 'close' || functionString == '') {
                    scope.closeModal(scope);
                    return;
                }
                if(functionString=="noResetValues"){
                    let noReset = true;
                    scope.closeModal(scope,noReset);
                    return;
                }

                //获取表单中的数据
                if(!scope.message){
                    formData = scope.getFormData(scope);
                }


                if (scope.fields.length > 0) {
                    result = formData;
                    if (scope.extraFields && angular.isObject(scope.extraFields)) {
                        result = angular.extend(formData, scope.extraFields);
                        scope.operateFunctions[functionString](result, function(noReset) {
                            scope.closeModal(scope,noReset);
                        })
                    } else {
                        scope.operateFunctions[functionString](result, function(noReset) {
                            //编辑一个信息时候需要noReset设置成true:不清空值
                            scope.closeModal(scope,noReset);
                        });
                    }
                } else {
                    //一般是消息关闭的时候会调用
                    scope.operateFunctions[functionString](function() {
                        scope.closeModal(scope);
                    });
                }
            };
            scope.fixFields = [];
            scope.generateArr = function() {
                for (let i = 0, val = 0; i < scope.fields.length; i++) {
                    if (i % scope.fieldsColumn == 0) {
                        scope.fixFields[scope.fixFields.length] = [];
                        for (let m = 0; m < scope.fieldsColumn; m++) {
                            scope.fixFields[scope.fixFields.length - 1].push(scope.fields[val++])
                            if (m == scope.fieldsColumn - 1) {
                                if (!scope.fixFields[scope.fixFields.length - 1][scope.fieldsColumn - 1]) {
                                    scope.fixFields[scope.fixFields.length - 1].splice(scope.fieldsColumn - 1, 1);
                                }
                            }
                        }
                    }
                }
            };
        }
    }
}
