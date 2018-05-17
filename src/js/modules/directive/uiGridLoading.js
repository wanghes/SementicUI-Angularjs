export default function(){
  	return {
		restrict: 'E',
		require: '^uiGrid',
		template: `<div class="ui active inverted dimmer" style="background:rgba(255,255,255,.9)" ng-show="gridLoading" id="gridLoading">
						<div class="ui small text loader">正在加载数据...</div>
				   </div>`,
		link: function ($scope, $elm, $attrs, uiGridCtrl) {
			/*$scope.totalItems = uiGridCtrl.uiGrid.totalItems;
			$scope.$watch("totalItems",(newVal,oldVal)=>{
			  	if(newVal){
					$elm.hide();
			  	}
			});*/
			/**
			 * [description]
			 * 监听父级广播的hideloading事件来进行隐藏
			 */
			 /*
			$scope.$on('hideloading',() => {
			   $elm.hide();
			});*/
		}
  	}
}
