export default function($timeout){
    return {
        restrict:'E',
        replace:true,
        template:`
         <div class="ui action input">
            <input
            type="text"
            name="{{name}}"
            value="{{value}}"
            placeholder="{{placeholder}}" />
            <label for="{{name}}" class="ui icon button btn-file" style="position:relative;">
                 <span>选择文件</span><i class="attach icon"></i>
                 <input
                 type="file"
                 api-service="{{apiService}}"
                 name="{{name}}"
                 style="opacity: 0;position: absolute;width: 100%;height: 100%;left: 0;">
            </label>
        </div>
        `,
        scope:{
            name:"@",
            value:"@",
            placeholder:'@',
            apiService:'@',
            ngUploadChange:"&"
        },
        link:function(scope, elem, attrs){
            elem.on("change",function(event){
                scope.$apply(function(){
                    scope.ngUploadChange({$event: event, name: scope.name })
                });
            })
            scope.$on("$destroy",function(){
                elem.off();
            });
        }
    }
}
