export default function($timeout) {
    return {
        restrict: 'E',
        priority: 9999,
        template: `<div class="sixteen wide field">
                        <label class="treeview_label">{{item.label}}</label>
                        <input type="hidden" name="{{name}}" readonly  value="{{item.value}}" />
                        <div class="ui icon input" style="width:{{item.width}}" >
                            <input type="text" class="ztreeShow"  readonly placeholder="{{item.defaultText}}" data-func="{{item.defaultFuncName}}">
                            <i class="caret down icon"></i>
                        </div>
                        <div class="menuContent" style="display: none;position: absolute;">
                            <ul class="ztree" id="{{name}}" style="margin-top:0; width:100%; height: 250px;" data-type="{{item.treeType}}"></ul>
                        </div>
                    </div>`,
        replace: false,
        transclude: false,
        scope: {
            item: '=',
            name: '@'
        },
        link: function(scope, elem, attrs) {
            let $this = $(elem).find('.ztreeShow');
            let inputParent = $this.parent('.ui.input');
            let customFunc = scope.item.defaultFuncName || '';
            // let func = $this.data('func'); //绑定的自定义func
            let $menuContent = inputParent.siblings('.menuContent');
            let autoExpand = scope.item.autoExpand; //是否默认展开
            let treeObj = null,PID,ID;
            //复选
            let checkboxSetting = {
                check: {
                    enable: true,
                    chkboxType: {
                        "Y": "",
                        "N": ""
                    }
                },
                view: {
                    dblClickExpand: true
                },
                data: {
                    simpleData: {
                        enable: true,
                        idKey: "id",
                        pIdKey: "pId",
                        rootPId: "0"
                    }
                },
                callback: {
                    beforeClick: beforeClick,
                    onCheck: onCheck
                }
            };

            // 单选
            let radioSetting = {
                check: {
                    enable: true,
                    chkStyle: "radio",
                    radioType: "all"
                },
                view: {
                    dblClickExpand: false
                },
                data: {
                    simpleData: {
                        enable: true,
                        idKey: "id",
                        pIdKey: "pId",
                        rootPId: "2000"
                    }
                },
                callback: {
                    onClick: onClick,
                    onCheck: onCheck
                }
            };
            /*
             * 如果没有自定义的func，则直接返回，这个func主要是为了请求数据，并回调回来
             */
            // if (!func.length) {
            //     return;
            // }

            if (!customFunc.length && !scope.item.data) {
                return;
            }

            // console.log(scope.item);
            // console.log(scope.item.treeFunc);
            // console.log(customFunc);
            // console.log(scope.item.treeFunc[func]);
            $(elem).find('.ztreeShow').on('click', () => {
                /*
                 * 如果tree展开了，点击则关闭，否则需要请求；
                 */
                if ($menuContent.css('display') == 'block') {
                    hideMenu();
                    return;
                }
                /*
                 * 增加loading
                 */
                inputParent.addClass('loading');
                getTree();
            });

            if (!!autoExpand) {
                getTree();
            }


            function setSelectStatus() {
                let result = arguments[0], otherParams;
                otherParams = arguments.length>1 ?  [].slice.call(arguments,1):[];
                if(otherParams.length>0){
                    PID = otherParams[0], ID = otherParams[1];
                }
                result = result.map((item, index) => {
                    //将其父级资源选中
                    if (PID && item.id == PID) {
                        item.checked = true;
                    }
                    //自身禁止选择
                    if (ID && item.id == ID) {
                        item.chkDisabled = true;
                    }
                    return item;
                });
                return result;
            }

            function zTreeInit(result) {
                let $ztree = $(elem).find('#' + scope.name);
                // console.log($ztree);
                //按钮类型，来确定是否是复选还是单选
                let type = $ztree.data('type');

                if (type == 'radio') {
                    $.fn.zTree.init($ztree, radioSetting, result);
                    $timeout(() => {
                        inputParent.removeClass('loading');
                        showMenu();
                    }, 500);
                } else if (type == 'checkbox') {
                    $.fn.zTree.init($ztree, checkboxSetting, result);
                    $timeout(() => {
                        inputParent.removeClass('loading');
                        showMenu();
                    }, 500);
                }
                //设置默认节点展开
                treeObj = $.fn.zTree.getZTreeObj(`${scope.name}`);

                let nodes = treeObj.getNodes();
                for (let i = 0; i < nodes.length; i++) {
                    treeObj.expandNode(nodes[i], true, false, true);
                }
            }
            /**
             * [description]
             * 在回调中拿一下远端数据
             * @param  {[type]} result    [远端数据]
             * @param  {[type]} filedName [description]
             * @return {[type]}           [description]
             */
            function getTree() {
                let result;
                if (customFunc.length > 0 && scope.item.treeFunc[customFunc]) {
                    scope.item.treeFunc[customFunc](function(result, PID, ID) {
                        result = setSelectStatus(result);
                        zTreeInit(result);
                    });
                } else if(scope.item.data && scope.item.data.length > 0) {
                    result = setSelectStatus(scope.item.data);
                    zTreeInit(result);
                }

            }

            function onClick(e, treeId, treeNode) {
                treeObj.checkNode(treeNode, !treeNode.checked, null, true);
                return false;
            }

            // 选中前处理
            function beforeClick(treeId, treeNode) {
                let postSel = $('input[name=' + scope.name + ']')
                    //初始选中前将pid附到这个隐藏域中
                if (!!PID) {
                    postSel.val(PID);
                }
                treeObj.checkNode(treeNode, !treeNode.checked, null, true);
                return false;
            }

            // 选中处理
            function onCheck(e, treeId, treeNode) {
                let nodes = treeObj.getCheckedNodes(true),
                    v = "",
                    pid = "";
                for (let i = 0, l = nodes.length; i < l; i++) {
                    v += nodes[i].name + ",";
                    pid += nodes[i].id + ",";
                }

                if (v.length > 0) v = v.substring(0, v.length - 1);

                if (pid.length > 0) pid = pid.substring(0, pid.length - 1);

                // let initSel = $(`#${filedName}_display`);
                let postSel = $('input[name=' + scope.name + ']')

                $this.val(v);
                //将pid附到这个隐藏域中
                postSel.val(pid);
            }


            // 显示tree
            function showMenu() {
                $menuContent.css({
                    zIndex: "1000",
                    minWidth: '40%',
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(204, 204, 204)",
                    overflow: "auto"
                }).slideDown("fast");
                $("body").bind("mousedown", onBodyDown);
            }

            // 隐藏tree
            function hideMenu() {
                $menuContent.fadeOut("fast");
                $("body").unbind("mousedown", onBodyDown);
            }

            // 监听mousedown
            function onBodyDown(event) {
                if (!(event.target.id == scope.name || event.target.className == "menuContent" || $(event.target).parents(".menuContent").length > 0)) {
                    hideMenu();
                }
            }
        }
    };
};
