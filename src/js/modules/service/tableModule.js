import utilsModule from './utils';
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
    'utilsModule'
]);

tableModule.factory('tableFactory',
    function($timeout,$q,$interval,i18nService,uiGridConstants,uiGridColumnMenuService,uiGridMoveColumnService,utils) {
        var factory = {};
        var tableConfigs = [];

        function array_unique(ar){
            var m,n=[],o= {};
            for (var i=0;(m= ar[i])!==undefined;i++){
                if (!o[m]){
                    n.push(m);o[m]=true;
                }
            }
            return n.sort(function(a,b){return a-b});;
        }
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
                   })
                   columnDefs = colDefs;
                }
            }


            scope.uiGridConstants = uiGridConstants;
            factory.gridOptions = {
                rowHeight: 30,
                enableFiltering: false, //启用行过滤条件
                enableSorting: true,
                allowCellFocus:true,
                enableColumnMenus:config.enableColumnMenus?config.enableColumnMenus:false,
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
                enableHorizontalScrollbar:ifEnableHorizontalScrollbar,
                enableVerticalScrollbar:uiGridConstants.scrollbars.ALWAYS, //永久启用垂直滚动条
                useExternalPagination: true,//自定义sort
                useExternalSorting: true,//自定义sort
                showColumnFooter:false,
                infiniteScrollDown:true,
                minRowsToShow:100,
                scrollDebounce:0,
                wheelScrollThrottle:0,
                plugins: [new ngGridFlexibleHeightPlugin()],
                onRegisterApi:function(gridApi){
                    //console.log(gridApi);
                    //console.log(uiGridMoveColumnService);

                    //保存用户拖拽表头的新秩序
                    if(config.allowMenuReset && config.menuReset){
                        gridApi.colMovable.on.columnPositionChanged(scope,function(colDef, originalPosition, newPosition){
                            //console.log(colDef);
                            //console.log(originalPosition);
                            //console.log(newPosition);
                            //gridApi.colMovable.moveColumn(5,6);
                            var arr  = gridApi.grid.moveColumns.orderCache;
                            var indexsArr = arr.map(function(item){
                              return item.field;
                            });
                            utils.localStorage.set(config.menuReset,indexsArr);
                        });
                    }


                    tableConfigs.push(config);
                    //初始化表格的相关数据
                    scope.initTableData = function(){
                        angular.forEach(tableConfigs,function(everyConfig){
                            if(everyConfig.item){
                                 scope[everyConfig.item] = null;
                            }else{
                                scope.item = null;
                            }

                            if(everyConfig.selectedItems){ //通过选中的行数来判断操作按钮的禁用与非禁用
                                scope[everyConfig.selectedItems] = 0;
                            }else{
                                scope.selectedItems = 0;
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
                        scope.gridApi.selection.clearSelectedRows();//清除选中的行
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
                        if(config.getPage){
                              config.getPage();
                              gridApi.core.queueRefresh();
                         }
                    });

                    //console.log(gridApi.pagination.getTotalPages());//获取总页数
                    gridApi.pagination.on.paginationChanged(scope, function (newPage, pageSize) {
                        if(config.getPage){
                            config.getPage();
                            gridApi.core.queueRefresh();
                        }
                    });

                    if(config.selectedRows){
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
                    /*gridApi.core.on.columnVisibilityChanged(scope,function(){

                    })*/
                   gridApi.cellNav.on.navigate(scope,function(newRowCol, oldRowCol){
                        //console.log(newRowCol);
                        //console.log(oldRowCol);
                    });
                    scope.gridApi.core.on.sortChanged( scope, function( grid, sort ) {
                        scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
                    })
                   // scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);
                    gridApi.selection.on.rowSelectionChanged(scope, function(row) {
                        //scope.gridApi.selection.clearSelectedRows();
                        //console.log(scope.gridApi.selection.getSelectAllState());
                        //console.log(gridApi.grid.api.cellNav.getCurrentSelection());
                        if(row.isSelected){
                            if(config.selectedRowsIndexs){
                                scope[config.selectedRowsIndexs].push(gridApi.grid.renderContainers.body.visibleRowCache.indexOf(row));
                                scope[config.selectedRowsIndexs] = array_unique(scope[config.selectedRowsIndexs]);
                            }else{
                                scope.selectedRowsIndexs.push(gridApi.grid.renderContainers.body.visibleRowCache.indexOf(row));
                                scope.selectedRowsIndexs = array_unique(scope.selectedRowsIndexs);
                            }
                            if(config.selectedId){
                                scope[config.selectedId] = row.entity.id;
                            }else{
                                scope.selectedId = row.entity.id;
                            }
                        }else{
                            let initIndex = gridApi.grid.renderContainers.body.visibleRowCache.indexOf(row);
                            if(config.selectedRowsIndexs){
                                angular.forEach(scope[config.selectedRowsIndexs], function(item,index){
                                    if(item==initIndex){
                                        scope[config.selectedRowsIndexs].splice(index,1);
                                    }
                                });
                            }else{
                                 angular.forEach(scope.selectedRowsIndexs, function(item,index){
                                    if(item==initIndex){
                                        scope.selectedRowsIndexs.splice(index,1);
                                    }
                                });
                            }
                            if(config.selectedRows){
                                if(scope[config.selectedRows].length==1){
                                    scope[config.selectedId] = scope[config.selectedRows][0];
                                }
                            }else{
                                if(scope.selectedRows.length==1){
                                    scope.selectedId = scope.selectedRows[0];
                                }
                            }
                        }

                        if(config.item){ //设置在页面中多个表格点击列后每项的代表字段，如果存在则设置 ，如果不存在则使用默认的item字段，说明页面中只有一个表格
                             scope[config.item] = row.entity;
                        }else{
                            scope.item = row.entity;
                        }
                        // console.log('gridApi.selection',gridApi.selection);
                        // console.log(gridApi.selection.getSelectedCount());
                        if(config.selectedItems){
                            scope[config.selectedItems] = gridApi.selection.getSelectedRows().length; //获取选中行的总行数
                        }else{
                            scope.selectedItems = gridApi.selection.getSelectedRows().length; //获取选中行的总行数
                        }

                        if(config.selectedRows){
                            scope[config.selectedRows] = gridApi.selection.getSelectedRows();
                        }else{
                            scope.selectedRows = gridApi.selection.getSelectedRows();
                        }
                        //console.log(scope.selectedRowsIndexs); //查看选中行的索引
                        //console.log(scope.selectedRows); //查看选中行的列表
                        //console.log(scope.selectedId); //打印选中行的ID
                        //console.log(scope.selectedItems); //打印选中行的数量
                    });

                    // gridApi.selection.on.SelectionChanged(scope, function(row) {
                    // })


                }
            };

            if(config.pagingOptions){
                factory.gridOptions.useExternalPagination = true;
                factory.gridOptions.enablePaging = true;//启用分页
                factory.gridOptions.paginationPageSizes =  [15, 25, 50,100]; //分页设置显示条数数组

                factory.gridOptions.paginationPageSize = 100;//初始化显示每个分页中显示的item条数
                factory.gridOptions.enablePaginationControls = true; //启用分页设置
                factory.gridOptions.paginationCurrentPage = 1;
            }else{
                factory.gridOptions.enablePaging = false;//启用分页
                factory.gridOptions.enablePaginationControls = false;
            }


            /*
            * 初始化按钮的的禁用状态并监听按钮的disable的状态值
            */
            scope.$watch("selectedItems",function(newVal,oldVal){
                let selectedNums = scope.selectedItems;
                angular.forEach(scope.operateButton,function(item,index){
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
);
export default tableModule;
