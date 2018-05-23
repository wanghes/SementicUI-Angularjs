export default function($timeout, pNotify, services, $sce) {
    return {
        restrict: 'E',
        replace: true,
        template: `
        <div class="ui right sidebar custom_sidebar" id="{{id}}" style="{{sidebarStyle}}">
            <div class="custom_sidebar_inner">
                <h3 class="ui dividing header"><i class="{{icon}} icon"></i>{{title}}</h3>
                <div class="insert_wrap">
                    <div id="{{id}}InsertSlider" style="width:100%; height:100%; display:flex;">
                        <form
                        ng-show="!!fields"
                        style="width:{{formWidth}}"
                        id="{{id}}InsertedForm"
                        class="insert_slider ui form clearfix">
                            <div ng-repeat="(name, field) in fields" class="form_item" style="{{ itemStyle(field) }}">
                                <div ng-if="field.type == 'input'" class="sixteen wide field slider_io">
                                    <label>{{ field.label }}</label>
                                    <input
                                    type="text"
                                    name="{{ name }}"
                                    placeholder="{{ field.defaultText }}"
                                    value="{{ field.value }}"
                                    ng-model="field.value">
                                </div>
                                <div ng-if="field.type == 'dropdown'" class="sixteen wide field slider_io">
                                    <label>{{ field.label }}</label>
                                    <div class="ui search selection dropdown" data-func="{{ field.defaultFuncName }}">
                                        <input
                                        type="hidden"
                                        name="{{ name }}"
                                        value="{{ field.value }}" />
                                        <i class="dropdown icon"></i>
                                        <div ng-class="{true: 'text', false: 'text default'}[field.text.length>0]">
                                            {{ field.text || field.defaultText }}
                                        </div>
                                        <div class="menu">
                                            <div class="item"
                                            ng-repeat="data in field.data"
                                            data-value="{{ data.value }}">{{ data.name }}</div>
                                        </div>
                                    </div>
                                </div>
                                <div ng-if="field.type == 'dropdowns'" class="sixteen wide field slider_io">
                                    <label>{{ field.label }}</label>
                                    <div class="ui search selection dropdown multiple" data-func="{{ field.defaultFuncName }}">
                                        <input
                                        type="hidden"
                                        name="{{ name }}"
                                        value="{{ field.value }}" />
                                        <i class="dropdown icon"></i>
                                        <div class="text default">{{ field.text || field.defaultText }}</div>
                                        <div class="menu">
                                            <div class="item"
                                            ng-repeat="data in field.data"
                                            data-value="{{data.value}}">{{data.name}}</div>
                                        </div>
                                    </div>
                                </div>
                                <div ng-if="field.type == 'tree'" class="sixteen wide field slider_io">
                                    <ui-tree-view item="field" name="{{ name }}"></ui-tree-view>
                                </div>
                                <div ng-if="field.type == 'file'" class="sixteen wide field slider_io">
                                    <label>{{ field.label }}</label>
                                    <ui-file-input
                                    api-service="{{ field.apiService }}"
                                    name="{{ name }}"
                                    value="{{ field.value }}"
                                    placeholder="{{ field.defaultText }}"
                                    ng-upload-change="fileChanged($event, name)">
                                    </ui-file-input>
                                </div>
                                <div ng-if="field.type == 'textarea'" class="sixteen wide field slider_io">
                                    <label>{{ field.label }}</label>
                                    <textarea
                                    rows="3"
                                    name="{{ name }}"
                                    ng-model="field.value"
                                    placeholder="{{ field.defaultText }}">
                                    {{ field.value }}
                                    </textarea>
                                </div>
                                 <div ng-if="field.type=='area'" class="sixteen wide field slider_io">
                                    <label>{{ field.label }}</label>
                                    <input type="hidden"
                                    name="{{ name }}"
                                    value="{{ field.value }}" />
                                    <ui-city selected="field.value" level="{{ field.level }}"></ui-city>
                                </div>
                            </div>
                            <div class="insert_slider_buttons">
                                <button
                                id="{{ sliderButton.id }}"
                                ng-repeat="sliderButton in sliderButtons"
                                class="ui button {{ sliderButton.className }}"
                                ng-click="emitClick(sliderButton.func)">
                                {{ sliderButton.name }}
                                </button>
                            </div>
                        </form>
                        <div id="cludeBox" ng-show="otherShow" class="other_html_wrap" ng-transclude></div>
                    </div>
                </div>
            </div>
        </div>`,
        transclude: true,
        scope: {
            sliderInfo: '='
        },
        controller: function($scope, $element) {
            let self = this;

            $scope.formID = $scope.id + "InsertedForm";
            $scope.sliderButtons = $scope.sliderInfo.sliderButtons;
            $scope.fields = $scope.sliderInfo.fields || '';
            $scope.title = $scope.sliderInfo.title;
            $scope.icon = $scope.sliderInfo.icon;
            $scope.otherShow = $scope.sliderInfo.otherShow || false;
            $scope.id = $scope.sliderInfo.id;
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

                $(`#${scope.id}InsertedForm`).find('.ui.dropdown.search.selection').dropdown({
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

            //文件上传
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
            };

            scope.closeRightModal = function() {
                if ($(`#${scope.id}InsertSlider .otherHtml`) && $(`#${scope.id}InsertSlider .otherHtml`).hasClass('show')) { //todo
                    $(`#${scope.id}InsertSlider .otherHtml`).addClass('hide').removeClass('show');
                    scope.$broadcast('clearOtherHtmlData', true);
                }
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
