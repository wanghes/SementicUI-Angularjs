export default function(module) {
    module.directive('tabBox', directive);
    directive.$inject = ['$timeout', 'services'];
    function directive($timeout, services) {
        return {
            restrict: 'E',
            scope:{
                selectedId:'=',
                getDetailData:"&"
            },
            controller:function($scope) {
                this.tab = null;
                var topHeight = 45;
                var setHeight = 300;
                var self = this;
                this.setTabFirstNode = function($ele){
                    this.tab = $ele ? $ele : null;
                };

                this.triggerLodingOne = function(){
                    var index = this.tab.index();
                    this.tab.click();
                    $('tab .tab').eq(index).addClass('loading');
                };

                $scope.$watch('selectedId', function(newVal, oldVal) {
                    if (oldVal != newVal) {
                        self.triggerLodingOne();
                    }
                });

                this.getDetailData = function() {
                    $scope.getDetailData().then(function(result){
                        if(result){
                            $('#grid_apply_detail').height(setHeight - topHeight);
                            $timeout(function(){
                                $('.tab.loading').removeClass('loading');
                            }, 200);
                        }
                    });
                };

                this.initLoading = function(config){
                    this.getDetailData();
                };
            },
            link: function(scope, elem, attrs) {

            }
        }

    }
};
