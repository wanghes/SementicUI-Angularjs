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
    homeCtrl.$inject = ['$scope', 'pNotify', 'tableFactory', 'tableModal', '$timeout', 'BASE_URL', 'services', 'utils'];
    function homeCtrl($scope, pNotify, tableFactory, tableModal, $timeout, BASE_URL, services , utils) {
        $scope.searchData = {};

        //初始化查询结果
        function setInitDate(day) {
            let start, end, startTime, endTime;
            end = new Date().getTime();
            start = end - 3600 * 24 * day * 1000;
            startTime = new Date(start);
            startTime = startTime.getFullYear() + '-' + ('00' + (startTime.getMonth() + 1)).slice(-2) + '-' + ('00' + (startTime.getDate() + 1)).slice(-2);
            endTime = new Date(end);
            endTime = endTime.getFullYear() + '-' + ('00' + (endTime.getMonth() + 1)).slice(-2) + '-' + ('00' + (endTime.getDate() + 1)).slice(-2);
            $scope.searchData.start_time = startTime;
            $scope.searchData.end_time = endTime;
        }
        //90天之内的数据
        setInitDate(90);
        $scope.searchKeys = {
            fields: {
                timeArea: {
                    name: '时间范围',
                    defaultText: "请选择时间范围",
                    text: `${$scope.searchData.start_time} 至 ${$scope.searchData.end_time}`,
                    value: [$scope.searchData.start_time, $scope.searchData.end_time],
                    id: "TimeArea",
                    type: "timePicker",
                },
                test01: {
                    name: 'test01',
                    defaultText: "请选择test01",
                    text: '全部',
                    value: '',
                    type: "dropdown",
                },
                test02: {
                    name: 'test02',
                    defaultText: "请填写test02",
                    text: '',
                    value: '',
                    type: "input",
                },
                test01: {
                    name: 'test01',
                    defaultText: "请填写test01",
                    text: '',
                    value: '',
                    type: "input",
                },
            },
            operateFunction: function() {
                getData();
            }
        };


        let columnDefs = [{
            field: "test01",
            displayName: "测试字段01",
            enableSorting: true,
            allowCellFocus: false,
            width: 150
        }, {
            field: "test02",
            displayName: "测试字段02",
            enableSorting: true,
            allowCellFocus: false,
            width: 150
        }, {
            field: "test02",
            displayName: "测试字段02",
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
            getPage: getData,
            item: "item"
        });

        function getData() {
            let data = $scope.searchData;
            data.page = $scope.gridOptions.paginationCurrentPage;
            data.per_page = $scope.gridOptions.paginationPageSize;

            //异步获取数据TODO
            $timeout(function() {
                $scope.gridOptions.totalItems = 10;
                $scope.gridOptions.data = [
                    { test01: "test01", test02: "test02", test03: "test03" },
                    { test01: "test01", test02: "test02", test03: "test03" },
                    { test01: "test01", test02: "test02", test03: "test03" },
                    { test01: "test01", test02: "test02", test03: "test03" },
                    { test01: "test01", test02: "test02", test03: "test03" },
                    { test01: "test01", test02: "test02", test03: "test03" },
                    { test01: "test01", test02: "test02", test03: "test03" },
                    { test01: "test01", test02: "test02", test03: "test03" },
                    { test01: "test01", test02: "test02", test03: "test03" },
                    { test01: "test01", test02: "test02", test03: "test03" }
                ];
            }, 2000)
        }
        getData();



        $scope.operateButton = [{
            name: "template模式按钮",
            className: "primary",
            icon: "plus",
            id: "templateBtn",
            isLinstener: false,
            isMulti: false,
            action: {
                open: "template",
                operateFunctions: {
                    open: function() {
                        $scope.templateModal.show();
                    }
                }
            },
            disabled: false
        }, {
            name: "modal模式按钮",
            className: "teal",
            id: "modalBtn",
            icon: "recycle",
            isLinstener: false,
            isMulti: false,
            action: {
                open: "modal",
                id: "#openModal",
                operateFunctions: {
                    open: function() {
                        console.log('test modal');
                    }
                }
            },
            disabled: false
        }, {
            name: "sidebar模式按钮",
            className: "red",
            id: "sidebarBtn",
            icon: "minus",
            isLinstener: false,
            isMulti: false,
            action: {
                open: "sidebar",
                id: "#sidebarBox",
                operateFunctions: {
                    open: function() {
                        console.log('test sidebar');
                    }
                }
            },
            disabled: false
        }, {
            name: "非打开模式按钮",
            className: "grey",
            id: "nonStyleBtn",
            icon: "download",
            isLinstener: false,
            isMulti: false,
            action: {
                operateFunctions: {
                    open: function() {
                        window.parent.open('http://www.baicu.com');
                    }
                }
            },
            disabled: false
        }];

        //设置所有的modals的配置
        $scope.modals = [{
            title: "modal模式",
            id: "openModal",
            fieldsColumn: 2,
            modalSize: "small",
            modalButtons: [
                { name: "确定", className: "teal", id: "OkBtn", func: "close" },
                { name: "取消", className: "black deny", id: "CancelBtn", func: "close" }
            ],
            operateFunctions: {},
            fields: [{
                type: "input",
                name: "姓名",
                field_name: "operator",
                defaultText: "请填写姓名",
                text: '',
                value: '',
            }, {
                type: "input",
                name: "电话",
                field_name: "operator",
                defaultText: "请填写电话",
                text: '',
                value: '',
            }, {
                type: "dropdownOne",
                name: "所属公司",
                field_name: "company",
                defaultText: "请选择所属公司",
                text: '',
                value: '',
                data: [
                    { name: "百度", value: 1 },
                    { name: "新浪", value: 2 },
                    { name: "搜狐", value: 3 }
                ]
            }, {
                type: "dropdownTwo",
                name: "兴趣爱好",
                field_name: "hobies",
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
            }, {
                type: "textarea",
                name: "备注",
                field_name: "infos",
                defaultText: "请填写备注说明",
                value: '',
            }, {
                type: "area",
                name: "所在省市",
                field_name: "province",
                defaultText: "请填写所在省市",
                id: "addProvince",
                level: 3,
                text: '',
                value: ''
            }]
        }];

        //设置所有的sidebar的配置
        $scope.sliderModals = [{
            title: 'sidebar模式',
            icon: "alarm",
            id: "sidebarBox",
            fieldsColumn: 2,
            sliderButtons: [ //可以为false或者为[]
                { name: "确认", className: "teal", id: "testPushBtn", func: 'saveForm' },
                { name: "取消", className: "black deny", id: "cancelTestPushBtn", func: 'close' }
            ],
            operateFunctions: {
                saveForm: function(result, callback) {
                    console.log(result);
                    callback()
                }
            },
            fields: [{
                type: "input",
                name: "通知人A",
                defaultText: "请填写通知人A",
                field_name: "peopleA",
                value: ''
            }, {
                type: "input",
                name: "手机号A",
                defaultText: "请填写手机号A",
                field_name: "phoneA",
                value: ''
            }, {
                type: "input",
                name: "通知人B",
                defaultText: "请填写通知人B",
                field_name: "peopleB",
                value: ''
            }, {
                type: "input",
                name: "手机号B",
                defaultText: "请填写手机号B",
                field_name: "phoneB",
                value: ''
            }, {
                type: "dropdownOne",
                name: "所属公司",
                field_name: "company",
                defaultText: "请选择所属公司",
                text: '',
                value: '',
                data: [
                    { name: "百度", value: 1 },
                    { name: "新浪", value: 2 },
                    { name: "搜狐", value: 3 }
                ]
            }, {
                type: "dropdownTwo",
                name: "兴趣爱好",
                field_name: "hobies",
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
            }, {
                type: "area",
                name: "所在省市",
                field_name: "province",
                defaultText: "请填写所在省市",
                id: "addProvince",
                level: 3,
                text: '',
                value: ''
            }, {
                type: "dropdownTree",
                name: "体育器械",
                defaultText: "请选择体育器械",
                field_name: "apparatus",
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
                        })
                    }
                }
            }, {
                type: "dropdownTree",
                name: "喜欢的动物",
                defaultText: "请选择喜欢的动物",
                field_name: "animal",
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
            }, {
                type: "textarea",
                name: "备注",
                field_name: "infos",
                defaultText: "请填写备注说明",
                value: '',
            }]
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
