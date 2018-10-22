import trackDirectiveModule from '../modules/directive/trackDirectives';
import serviceModule from '../modules/service/services';
import tableModuleFactory from '../modules/service/tableModule';
import modalInTableFactory from '../modules/service/modalInTable';
import pNotifyFactory from '../modules/service/pNotify';
import utilsModule from '../modules/service/utils';

let homeModule = angular.module('homeModule', [
    'serviceModule',
    'trackDirectiveModule',
    'tableModule',
    "modalInTableModule",
    "pNotifyModule",
    "utilsModule"
]).config(['$qProvider', function($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);


export default function() {
    homeModule.controller("homeCtrl", homeCtrl)
    homeCtrl.$inject = ['$scope', 'pNotify', 'tableFactory', 'tableModal', '$timeout', 'BASE_URL', 'services', 'utils', 'confirmTip'];
    function homeCtrl($scope, pNotify, tableFactory, tableModal, $timeout, BASE_URL, services , utils, confirmTip) {
        $scope.searchKeys = {
            fields: {
                timeArea: {
                    label: '时间范围',
                    defaultText: "请选择时间范围",
                    text: "",
                    value: "",
                    ranges:7,
                    id: "TimeArea",
                    type: "datePicker",
                },
                test01: {
                    label: '测试信息',
                    defaultText: "请选择测试信息",
                    text: '全部',
                    value: '',
                    type: "dropdown",
                    data:[{
                        name:'测试信息1',
                        value:1
                    },{
                        name:'测试信息2',
                        value:2
                    },{
                        name:'测试信息3',
                        value:3
                    },{
                        name:'测试信息4',
                        value:4
                    }]
                },
                province: {
                    label: '所在省份',
                    type: "area",
                    value: '',
                    level:3
                },
                company: {
                    label: '所属公司',
                    type: "dropdown",
                    defaultText: "请选择所属公司",
                    text: '',
                    value: '',
                    data: [
                        { name: "百度", value: 1 },
                        { name: "新浪", value: 2 },
                        { name: "搜狐", value: 3 }
                    ]
                },
                hobies:  {
                    label: "兴趣爱好",
                    type: "dropdowns",
                    defaultText: "请选择兴趣爱好",
                    text: '',
                    value: '',
                    data: [
                        { name: "篮球", value: 1 },
                        { name: "Dota", value: 2 },
                        { name: "游泳", value: 3 },
                        { name: "爬上", value: 4 },
                        { name: "划船", value: 5 }
                    ]
                },
                test03: {
                    label: 'test03',
                    type: "input",
                    defaultText: "请填写test01",
                    value: ''
                },
                test04: {
                    label: 'test04',
                    type: "input",
                    defaultText: "请填写test04",
                    value: ''
                }
            }
        };

        let columnDefs = [{
            field: "title",
            displayName: "标题",
            enableSorting: true,
            allowCellFocus: false,
            width: 200,
            cellTemplate:'<ui-popup-content position="top left" model="row.entity" field="title">{{row.entity.title}}</ui-popup-content>'
        }, {
            field: "author_name",
            displayName: "作者",
            cellClass:"center",
            enableSorting: true,
            allowCellFocus: false,
            width: 150,
            menuItems: [
                {
                    title: 'Outer Scope Alert',
                    icon: 'ui-grid-icon-info-circled',
                    action: function($event) {
                        console.log($event);
                    },
                    shown: function() { return true; },
                    active: function() { return false; },
                    context: $scope
                },
                {
                    title: 'Grid ID',
                    action: function() {
                        alert('Grid ID: ' + this.grid.id);
                    }
                }
            ]
        }, {
            field: "sex",
            displayName: "性别",
            enableSorting: true,
            allowCellFocus: false,
            width: 100
        }, {
            field: "area",
            displayName: "所在地址",
            enableSorting: true,
            cellTooltip: true,
            allowCellFocus: false,
            width: 250
        },{
            field: "status",
            displayName: "当前状态",
            enableSorting: false,
            allowCellFocus: false,
            width: 100,
            cellTemplate:`<span style="position: relative;top: 3px;" ng-bind-html="row.entity.status_label"></span>`
        }, {
            field: "date",
            displayName: "发布日期",
            enableSorting: true,
            allowCellFocus: false,
            width: 150
        }];

        $scope.gridOptions = tableFactory.init($scope, columnDefs, {
            ifDetail: false,
            pagingOptions: true,
            enableFullRowSelection: true,
            enableColumnMenus: true,
            rowSelection: true,
            noUnselect: false,
            multiSelect: true,
            enableGridMenu: true,
            allowMenuReset:true,
            fetchInfo: services.posts.query,
            item: "item",
            menuReset:'homeColumns',
            requireChangeInfo: true,
            done(data, changeInfoStatus) {
                let result = data.data.articles;
                if (changeInfoStatus) {
                    return result.map(function(item){
                        switch(item.status) {
                            case 1:
                            item["status_label"] = `<a class="ui orange label tiny">已经提交</a>`;
                            break;
                            case 2:
                            item["status_label"] = `<a class="ui green label tiny">已经完成</a>`;
                            break;
                            case 3:
                            item["status_label"] = `<a class="ui blue label tiny">等待回复</a>`;
                            break;
                            case 4:
                            item["status_label"] = `<a class="ui red label tiny">已经驳回</a>`;
                            break;
                            default:
                                //
                        }
                        return item;
                    });
                }

                return result;
            }
        });

        $scope.operateButton = [{
            name: "template模式按钮",
            className: "primary",
            icon: "plus",
            id: "templateBtn",
            isLinstener: true,
            isMulti: false,
            disabled: false,
            action: {
                open: "template",
                operateFunctions: {
                    open: function() {
                        $scope.templateModal.show();
                    }
                }
            }
        }, {
            name: "modal模式按钮",
            className: "teal",
            id: "modalBtn",
            icon: "recycle",
            isLinstener: false,
            isMulti: false,
            disabled: false,
            action: {
                open: "modal",
                id: "openModal",
                operateFunctions: {
                    open: function() {
                        console.log('opened modal');
                    }
                }
            }
        }, {
            name: "sidebar模式按钮",
            className: "red",
            id: "sidebarBtn",
            icon: "minus",
            isLinstener: false,
            isMulti: false,
            disabled: false,
            action: {
                open: "sidebar",
                id: "sidebarBox",
                transition: 'scale down',
                operateFunctions: {
                    open: function() {
                        console.log('opened sidebar');
                    }
                }
            }
        }, {
            name: "非打开模式按钮",
            className: "orange",
            id: "nonStyleBtn",
            icon: "download",
            isLinstener: false,
            isMulti: false,
            disabled: false,
            action: {
                operateFunctions: {
                    open: function() {
                        window.parent.open('http://www.baidu.com');
                    }
                }
            }
        }];

        //设置所有的modals的配置
        $scope.modals = [{
            title: "modal模式",
            id: "openModal",
            fieldsColumn: 2,
            modalSize: "small",
            modalButtons: [
                {
                    name: "确定",
                    id: "OkBtn",
                    className: "teal",
                    func: "submitFormFunc"
                },
                {
                    name: "取消",
                    id: "CancelBtn",
                    className: "black deny",
                    func: "close"
                }
            ],
            operateFunctions: {
                submitFormFunc(result, pause) {
                    confirmTip.show({
                        confirmId: 'ttest',
                        msg:'你确定提交数据表单吗',
                        onDeny(){

                        },
                        onApprove() {

                        }
                    });

                    return new Promise((resolve, reject) => {
                        resolve(false);
                    })
                }
            },
            fields: {
                operator: {
                    label: '姓名',
                    type: "input",
                    defaultText: "请填写姓名",
                    text: '',
                    value: ''
                },
                phone: {
                    label: '电话',
                    type: "input",
                    defaultText: "请填写电话",
                    text: '',
                    value: ''
                },
                company: {
                    label: '所属公司',
                    type: "dropdown",
                    defaultText: "请选择所属公司",
                    text: '',
                    value: '',
                    data: [
                        { name: "百度", value: 1 },
                        { name: "新浪", value: 2 },
                        { name: "搜狐", value: 3 }
                    ]
                },
                hobies: {
                    type: "dropdowns",
                    label: "兴趣爱好",
                    defaultText: "请选择兴趣爱好",
                    text: '',
                    value: '',
                    data: [
                        { name: "篮球", value: 1 },
                        { name: "Dota", value: 2 },
                        { name: "游泳", value: 3 },
                        { name: "爬上", value: 4 },
                        { name: "划船", value: 5 }
                    ]
                },
                remark: {
                    label: "备注",
                    type: "textarea",
                    defaultText: "请填写备注说明",
                    value: ''
                },
                province: {
                    label: "所在省市",
                    type: "area",
                    defaultText: "请填写所在省市",
                    id: "addProvince",
                    level: 3,
                    text: '',
                    value: ''
                },
                head: {
                    label: "上传头像",
                    type: "file",
                    defaultText: "请上传头像",
                    apiService(file) {
                        var formData = new FormData();
                        formData.append("path", file);
                        console.log(file);
                    },
                    value: '',
                }
            }
        }];

        //设置所有的sidebar的配置
        $scope.sliderModals = [{
            title: 'sidebar模式',
            icon: "alarm",
            id: "sidebarBox",
            sidebarStyle:"width:70%;",
            fieldsColumn: 1,
            otherShow: true,
            sliderButtons: [ //可以为false或者为[]
                {
                    name: "确认",
                    className: "teal",
                    id: "testPushBtn",
                    func: 'saveForm'
                },
                {
                    name: "取消",
                    className: "black deny",
                    id: "cancelTestPushBtn",
                    func: 'close'
                }
            ],
            operateFunctions: {
                saveForm: function(result, callback) {
                    console.log(result);
                    callback()
                }
            },
            fields: {
                peopleA: {
                    type: "input",
                    label: "通知人A",
                    defaultText: "请填写通知人A",
                    value: ''
                },
                phoneA: {
                    type: "input",
                    label: "手机号A",
                    defaultText: "请填写手机号A",
                    value: ''
                },
                peopleB: {
                    type: "input",
                    label: "通知人B",
                    defaultText: "请填写通知人B",
                    value: ''
                },
                phoneB: {
                    type: "input",
                    label: "手机号B",
                    defaultText: "请填写手机号B",
                    field_name: "phoneB",
                    value: ''
                },
                company: {
                    type: "dropdown",
                    label: "所属公司",
                    defaultText: "请选择所属公司",
                    text: '',
                    value: '',
                    data: [
                        { name: "百度", value: 1 },
                        { name: "新浪", value: 2 },
                        { name: "搜狐", value: 3 }
                    ]
                },
                hobies:  {
                    type: "dropdowns",
                    label: "兴趣爱好",
                    defaultText: "请选择兴趣爱好",
                    text: '',
                    value: '',
                    data: [
                        { name: "篮球", value: 1 },
                        { name: "Dota", value: 2 },
                        { name: "游泳", value: 3 },
                        { name: "爬上", value: 4 },
                        { name: "划船", value: 5 }
                    ]
                },
                province: {
                    type: "area",
                    label: "所在省市",
                    defaultText: "请填写所在省市",
                    id: "addProvince",
                    level: 3,
                    text: '',
                    value: ''
                },
                apparatus: {
                    type: "tree",
                    label: "体育器械",
                    defaultText: "请选择体育器械",
                    treeType: 'checkbox',
                    value: '',
                    text: '',
                    defaultFuncName: "showApparatus",
                    treeFunc: {
                        showApparatus: function(callBack) {
                            var data = [{
                                id: 1,
                                pId: 0,
                                name: "体育器械",
                                open: true
                            }, {
                                id: 11,
                                pId: 1,
                                name: "球类",
                                open: false
                            }, {
                                id: 111,
                                pId: 11,
                                name: "足球",
                                chkDisabled: true
                            }, {
                                id: 112,
                                pId: 11,
                                name: "篮球",
                                chkDisabled: false,
                                checked: false,
                                open: true
                            }, {
                                id: 12,
                                pId: 1,
                                name: "举重器材",
                                chkDisabled: true,
                                checked: false,
                                open: true
                            }, {
                                id: 121,
                                pId: 12,
                                name: "杠铃",
                                chkDisabled: false,
                                checked: false,
                                open: true
                            }, {
                                id: 122,
                                pId: 12,
                                name: "哑铃",
                                chkDisabled: false,
                                checked: false,
                                open: true
                            }];
                            $timeout(function() {
                                callBack(data);
                            });
                        }
                    }
                },
                animal: {
                    type: "tree",
                    label: "喜欢的动物",
                    defaultText: "请选择喜欢的动物",
                    treeType: 'radio',
                    value: '',
                    data: [{
                        id: 1,
                        pId: 0,
                        name: "动物种类",
                        chkDisabled: true
                    }, {
                        id: 11,
                        pId: 1,
                        name: "猫科",
                        chkDisabled: true
                    }, {
                        id: 111,
                        pId: 11,
                        name: "花豹"
                    }, {
                        id: 112,
                        pId: 11,
                        name: "美洲虎"
                    }, {
                        id: 12,
                        pId: 1,
                        name: "犬科",
                        chkDisabled: true
                    }, {
                        id: 121,
                        pId: 12,
                        name: "鬣狗",
                    }, {
                        id: 122,
                        pId: 12,
                        name: "狼"
                    }, {
                        id: 13,
                        pId: 1,
                        name: "啮齿类",
                        chkDisabled: true
                    }, {
                        id: 131,
                        pId: 13,
                        name: "仓鼠"
                    }]
                },
                head: {
                    type: "file",
                    label: "上传头像",
                    defaultText: "请上传头像",
                    apiService(file) {
                        var formData = new FormData();
                        formData.append("path", file);
                        console.log(file);
                    },
                    value: '',
                },
                remark: {
                    type: "textarea",
                    label: "备注",
                    defaultText: "请填写备注说明",
                    value: '',
                }
            }
        }];

        //设置自定义的template
        tableModal.fromTemlateUrl('modalTpl.html', {
            scope: $scope,
            transition: "scale",
            openType: "modal",
            nodeId: "helloModalNode"
        }).then(function(modal) {
            $scope.templateModal = modal;
            $scope.templateModalTitle = '你好世界';
        });
        $scope.hideModal = function() {
            $scope.templateModal.hide();
        };
    }
}
