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
        $scope.isRefresh = false;

        $scope.searchKeys = {
            fields: {
                timeArea: {
                    name: '时间范围',
                    defaultText: "请选择时间范围",
                    text: "",
                    value: "",
                    ranges:7,
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
            field: "title",
            displayName: "标题",
            enableSorting: true,
            allowCellFocus: false,
            width: 500
        }, {
            field: "author_name",
            displayName: "作者",
            enableSorting: true,
            allowCellFocus: false,
            width: 150
        }, {
            field: "sex",
            displayName: "性别",
            enableSorting: true,
            allowCellFocus: false,
            width: 50
        }, {
            field: "area",
            displayName: "所在地址",
            enableSorting: true,
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
            getPage: getData,
            allowMenuReset:true,
            item: "item",
            allowMenuReset:true,
            menuReset:'homeColumns'
        });
        function generateChangeInfo (data){
            return data.map(function(item){
                switch(item.status){
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
                }
                return item;
            });
        }

        function getData() {
            let data = angular.copy($scope.searchData);
            data.page = $scope.gridOptions.paginationCurrentPage;
            data.per_page = $scope.gridOptions.paginationPageSize;
            $scope.gridLoading = true;
            services.posts.query(data,(data) => {
                $scope.$broadcast('hideloading');
                $scope.gridOptions.totalItems = 50;
                let newData = generateChangeInfo(data.data.articles);
                $scope.gridOptions.data = newData;
                $scope.gridLoading = false;
                $scope.initTableData();
                if($scope.isRefresh) {
                    pNotify.show('刷新成功','success');
                    $scope.isRefresh = false;//刷新完之后再将isRefresh置为false，否则则会一直弹这个刷新成功
                    $scope.resetTableData(); //重置表格的相关数据
                }
            });
        }


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
                        window.parent.open('http://www.baidu.com');
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
                { name: "确定", className: "teal", id: "OkBtn", func: "submitFormFunc" },
                { name: "取消", className: "black deny", id: "CancelBtn", func: "close" }
            ],
            operateFunctions: {
                submitFormFunc(result) {
                    return new Promise((resolve,resject) =>{
                        setTimeout(() =>{
                            console.log(result);
                            resolve(true);
                        }, 1500)
                    })
                }
            },
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
