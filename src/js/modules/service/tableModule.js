import utilsModule from './utils';
import pNotify from './pNotify';
let tableModule = angular.module('tableModule', [
    'ui.grid',
    'ui.grid.autoResize',
    'ui.grid.pagination',
    'ui.grid.exporter',
    'ui.grid.selection',
    'ui.grid.resizeColumns',
    'ui.grid.moveColumns',
    'ui.grid.pinning',
    'ui.grid.cellNav',
    'ui.grid.grouping',
    'utilsModule',
    "pNotifyModule"
]);

tableModule.factory('tableFactory', tableFactoryFunc);
tableFactoryFunc.$inject = [
    '$timeout',
    '$q',
    '$interval',
    'i18nService',
    'uiGridConstants',
    'uiGridColumnMenuService',
    'uiGridMoveColumnService',
    'utils',
    'pNotify'
];

function tableFactoryFunc($timeout, $q, $interval, i18nService, uiGridConstants, uiGridColumnMenuService, uiGridMoveColumnService, utils, pNotify) {
    var factory = {};
    var tableConfigs = [];

    factory.init = function(scope, columnDefs, config){
        var fakeI18n;
        i18nService.setCurrentLang('zh-cn');
        fakeI18n = function(title) {
            var deferred = $q.defer();
            $interval(function() {
                deferred.resolve(title);
            }, 1000, 1);
            return deferred.promise;
        }

        // 设置预备的搜索条件
        scope.searchData = {};
        scope.isRefresh = false;
        if (scope.searchKeys && !angular.equals({}, scope.searchKeys)) {
            angular.extend(scope.searchKeys, {
                operateFunction: function() {
                    let sKeys = Object.keys(scope.searchKeys.fields);
                    sKeys.forEach(function(item){
                        scope.searchData[item] = scope.searchKeys.fields[item].value;
                    });
                    getPage();
                }
            });
        } else {
            scope.searchKeys = {};
            angular.extend(scope.searchKeys, {
                operateFunction: function() {
                    getPage();
                }
            });
        }



        function getPage() {
            let data = angular.copy(scope.searchData);
            data.page = scope.gridOptions.paginationCurrentPage;
            data.per_page = scope.gridOptions.paginationPageSize;
            scope.gridLoading = true;
            config.fetchInfo(data, (data) => {
                scope.gridOptions.totalItems = 50;

                if (config.requireChangeInfo) {
                    scope.gridOptions.data = angular.isFunction(config.done) && config.done(data, true);
                } else {
                    scope.gridOptions.data = angular.isFunction(config.done) && config.done(data, false);
                }

                scope.gridLoading = false;
                scope.initTableData();
                if(scope.isRefresh) {
                    pNotify.show('刷新成功','success');
                    scope.isRefresh = false;//刷新完之后再将isRefresh置为false，否则则会一直弹这个刷新成功
                    scope.resetTableData(); //重置表格的相关数据
                }
            });
        }

        //是否启用水平滚动条
        var ifEnableHorizontalScrollbar;
        switch(config.enableHorizontalScrollbar){
            case "no":
            ifEnableHorizontalScrollbar = uiGridConstants.scrollbars.NEVER;
            break;
            case "yes":
            ifEnableHorizontalScrollbar = uiGridConstants.scrollbars.ALWAYS;
            break;
            default:
            ifEnableHorizontalScrollbar = uiGridConstants.scrollbars.WHEN_NEEDED;
        }


        //获取用户上次拖拽表头的保存信息，并重新初始化字段列表
        if(config.allowMenuReset && config.menuReset){
            let localStorageMenus = utils.localStorage.get(config.menuReset);
            if(localStorageMenus){
                let menus = localStorageMenus.split(',');
                let colDefs = menus.map(function(item){
                    let arr = columnDefs.filter(function(it){
                        if(it.field == item) return it;
                    })
                    return arr[0]
                });
               columnDefs = colDefs;
            }
        }


        scope.uiGridConstants = uiGridConstants;
        factory.gridOptions = {
            rowHeight: 30,
            enableFiltering: false, //启用行过滤条件
            enableSorting: true,
            allowCellFocus:true,
            enableColumnMenus: config.enableColumnMenus?config.enableColumnMenus:false,
            enableGridMenu: config.enableGridMenu ? config.enableGridMenu : false, //是否启用显示右上角总控制菜单
            enableColumnResizing: true, //是否启用可控的列宽的伸缩
            exporterMenuCsv: false, //在右上角总控制菜单中显示导出Csv按钮
            exporterMenuPdf: false, //在右上角总控制菜单中显示导出pdf按钮
            exporterOlderExcelCompatibility: true,//导出兼容老版本的excel
            enableRowHeaderSelection:config.ifDetail ? false : true,//是否启用第一列checkbox
            enableFullRowSelection: config.enableFullRowSelection ? true : false, //是否启用整行选择
            enableRowSelection: config.rowSelection ? true : false, //是否启用点击行选中checkbox
            enableSelectAll: true, //是否启用全选按钮
            gridMenuTitleFilter: fakeI18n,
            enablePinning: true, //是否启用固定列功能
            noUnselect: config.noUnselect ? true : false, //是否允许反选
            multiSelect: config.multiSelect ? true : false, //是否允许多选
            modifierKeysToMultiSelectCells: true, //默认false,为true时只能 按ctrl或shift键进行多选, multiSelect 必须为true;
            columnDefs:  columnDefs,
            fastWatch:true,
            enableHorizontalScrollbar: ifEnableHorizontalScrollbar,
            enableVerticalScrollbar: uiGridConstants.scrollbars.ALWAYS, //永久启用垂直滚动条
            useExternalPagination: true,//自定义sort
            useExternalSorting: true,//自定义sort
            showColumnFooter: false,
            infiniteScrollDown: true,
            minRowsToShow: 100,
            scrollDebounce: 0,
            wheelScrollThrottle: 0,
            plugins: [new ngGridFlexibleHeightPlugin()],
            onRegisterApi: function(gridApi){
                //保存用户拖拽表头的新秩序
                if(config.allowMenuReset && config.menuReset){
                    gridApi.colMovable.on.columnPositionChanged(scope, function(colDef, originalPosition, newPosition) {
                        var arr = gridApi.grid.moveColumns.orderCache;
                        var indexsArr = arr.map(function(item) {
                            return item.field;
                        });
                        utils.localStorage.set(config.menuReset,indexsArr);
                    });
                }

                tableConfigs.push(config);
                //初始化表格的相关数据
                scope.initTableData = function(){
                    angular.forEach(tableConfigs, function(everyConfig){
                        if(everyConfig.item){
                             scope[everyConfig.item] = null;
                        }else{
                            scope.item = null;
                        }

                        if(everyConfig.selectedRowsNumber){ //通过选中的行数来判断操作按钮的禁用与非禁用
                            scope[everyConfig.selectedRowsNumber] = 0;
                        }else{
                            scope.selectedRowsNumber = 0;
                        }

                        if(everyConfig.selectedRows){
                            scope[everyConfig.selectedRows] = [];
                        }else{
                            scope.selectedRows = [];
                        }

                        if(everyConfig.selectedRowsIndexs){
                            scope[everyConfig.selectedRowsIndexs] = [];
                        }else{
                            scope.selectedRowsIndexs = [];
                        }
                        if(everyConfig.selectedId){
                            scope[everyConfig.selectedId] = '';
                        }else{
                            scope.selectedId = '';
                        }
                    });
                }

                //重置表格的相关数据
                scope.resetTableData = function(){
                    scope.initTableData();
                    //清除选中的行
                    scope.gridApi.selection.clearSelectedRows();
                }

                //console.log(gridApi.selection);
                scope.gridApi = gridApi;
                scope.gridApi.grid.handleWindowResize();
                $(window).resize(function(){
                    setTimeout(function () {
                        scope.gridApi.grid.handleWindowResize();
                    });
                });

                /**
                 * 服务端排序
                 */
                scope.gridApi.core.on.sortChanged(scope, function(grid, sortColumns) {
                    // console.log('grid',grid);
                    // console.log('sortColumns',sortColumns);
                    // 将当前排序列赋到scope上，以便能取当前列的配置
                    scope.sortColumns = sortColumns;
                    if (sortColumns.length == 0) {
                      scope.gridOptions.sort = null;
                    } else {
                      scope.gridOptions.sort = sortColumns[0].sort.direction;
                    }
                    if(getPage){
                        getPage();
                        gridApi.core.queueRefresh();
                    }
                });

                //console.log(gridApi.pagination.getTotalPages());//获取总页数
                gridApi.pagination.on.paginationChanged(scope, function (newPage, pageSize) {
                    if(getPage){
                        getPage();
                        gridApi.core.queueRefresh();
                    }
                });

                if (config.selectedRows) {
                    scope[config.selectedRows] = [];
                }else{
                    scope.selectedRows = [];
                }

                if(config.selectedRowsIndexs){
                    scope[config.selectedRowsIndexs] = [];
                }else{
                    scope.selectedRowsIndexs = [];
                }

                //列的显示与隐藏回调
                gridApi.core.on.columnVisibilityChanged(scope,function(){

                });
                gridApi.cellNav.on.navigate(scope,function(newRowCol, oldRowCol){
                    //console.log(newRowCol);
                    //console.log(oldRowCol);
                });
                scope.gridApi.core.on.sortChanged( scope, function( grid, sort ) {
                    scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
                })
               // scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);

                //点击全选反选批量处理结果集
                gridApi.selection.on.rowSelectionChangedBatch(scope, function(row){
                    if (config.selectedRowsNumber) {
                        //获取选中行的总行数
                        scope[config.selectedRowsNumber] = gridApi.selection.getSelectedRows().length;
                    } else {
                        //获取选中行的总行数
                        scope.selectedRowsNumber = gridApi.selection.getSelectedRows().length;
                    }

                    if (config.selectedRows) {
                        scope[config.selectedRows] = gridApi.selection.getSelectedRows();
                    } else {
                        scope.selectedRows = gridApi.selection.getSelectedRows();
                    }
                });

                gridApi.selection.on.rowSelectionChanged(scope, function(row, event) {
                    console.log(event.target);
                    //console.log(scope.gridApi.selection.getSelectAllState());
                    //console.log(gridApi.grid.api.cellNav.getCurrentSelection());
                    // 选中与不选中的都能活到点击的行的索引
                    let initIndex = gridApi.grid.renderContainers.body.visibleRowCache.indexOf(row);
                    // 选择的行数组
                    if(config.selectedRows){
                        scope[config.selectedRows] = gridApi.selection.getSelectedRows();
                    }else{
                        scope.selectedRows = gridApi.selection.getSelectedRows();
                    }

                    if(row.isSelected){
                        // selectedRowsIndexs 选择的行的索引数组
                        if(config.selectedRowsIndexs){
                            scope[config.selectedRowsIndexs].push(initIndex);
                            scope[config.selectedRowsIndexs] = utils.array_unique(scope[config.selectedRowsIndexs], true);
                        }else{
                            scope.selectedRowsIndexs.push(initIndex);
                            scope.selectedRowsIndexs = utils.array_unique(scope.selectedRowsIndexs, true);
                        }
                        // row.entity 对象中的id一般是数据表中定义的id
                        if(config.selectedId){
                            scope[config.selectedId] = row.entity.id;
                        }else{
                            scope.selectedId = row.entity.id;
                        }
                    }else{
                        // 反选需要手动删除选择的行的索引数组的具体索引
                        if (config.selectedRowsIndexs) {
                            angular.forEach(scope[config.selectedRowsIndexs], function(item, index){
                                if (item == initIndex) {
                                    scope[config.selectedRowsIndexs].splice(index, 1);
                                }
                            });
                        } else {
                             angular.forEach(scope.selectedRowsIndexs, function(item, index){
                                if (item == initIndex) {
                                    scope.selectedRowsIndexs.splice(index, 1);
                                }
                            });
                        }
                        if (config.selectedRows) {
                            if(scope[config.selectedRows].length == 1){
                                scope[config.selectedId] = scope[config.selectedRows][0].id;
                            }
                        } else {
                            if (scope.selectedRows.length == 1) {
                                scope.selectedId = scope.selectedRows[0].id;
                            }
                        }
                    }
                    // 设置在页面中多个表格点击列后每项的代表字段，如果存在则设置 ，如果不存在则使用默认的item字段，说明页面中只有一个表格
                    if (config.item) {
                        scope[config.item] = row.entity;
                    } else {
                        scope.item = row.entity;
                    }
                    console.log('gridApi.selection', gridApi.selection);

                    if (config.selectedRowsNumber) {
                        //获取选中行的总行数
                        scope[config.selectedRowsNumber] = gridApi.selection.getSelectedCount();
                    } else {
                        //获取选中行的总行数
                        scope.selectedRowsNumber = gridApi.selection.getSelectedCount();
                    }

                });


            }
        };

        // 分页的设置
        if(config.pagingOptions){
            factory.gridOptions.useExternalPagination = true;
            factory.gridOptions.enablePaging = true;//启用分页
            factory.gridOptions.paginationPageSizes =  [20, 30, 50, 100]; //分页设置显示条数数组
            factory.gridOptions.paginationPageSize =20;//初始化显示每个分页中显示的item条数
            factory.gridOptions.enablePaginationControls = true; //启用分页设置
            factory.gridOptions.paginationCurrentPage = 1;
        }else{
            factory.gridOptions.enablePaging = false;//启用分页
            factory.gridOptions.enablePaginationControls = false;
        }

        /*
        * 初始化按钮的的禁用状态并监听按钮的disable的状态值
        * 页面的表格的操作按钮跟表格耦合在一起了
        */
        scope.$watch("selectedRowsNumber", function(newVal, oldVal){
            let selectedNums = scope.selectedRowsNumber;
            angular.forEach(scope.operateButton, function(item,index){
                /*
                * 如果item.isLinstener为true，则对其开启watch模式，通过选中行的个数来判断其是否禁用
                */
                if(item.isLinstener){
                    /*
                    * 默认如果是选中一行才使其可用，多行或者不选都是禁用
                    */
                    item.disabled = selectedNums > 1 ? true : selectedNums == 1 ? false : true;
                    /*
                    * 如果item.isMulti为true，则当选中单行或多行时可用
                    */
                    if(item.isMulti){
                        item.disabled = selectedNums >= 1 ? false : true;
                    }
                }
            });
        });
        return factory.gridOptions;
    }
    return factory;
}

export default tableModule;
