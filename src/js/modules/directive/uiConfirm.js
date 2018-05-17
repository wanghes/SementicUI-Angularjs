export default function($timeout){
    return {
        restrict:'E',
        replace:true,
        priority:9999,
        template:`
        <div class="ui mini basic confirm modal" id={{ nodeId }}>
            <div class="ui icon header">{{ title || '确认消息' }}</div>
            <div class="content">
                <p>{{ message }}</p>
            </div>
            <div class="actions">
                <div class="ui red cancel inverted button">
                    <i class="remove icon"></i>否
                </div>
                <div class="ui green ok inverted button">
                    <i class="checkmark icon"></i>是
                </div>
            </div>
        </div>
        `,
        scope:{
            confirmStatus:'=confirmStatus',
            message:"@",
            confirmOk:"&",
            title:'@',
            nodeId:"@"
        },
        link:function(scope, elem, attrs){
            const setFalse = () =>{
                scope.confirmStatus = false;
            }

            $timeout(() => {
                let node =  $(`.confirm#${scope.nodeId}`);
                node.modal({
                    closable  : false,
                    duration:150,
                    onDeny(){
                        setFalse();
                        scope.$apply();
                    },
                    onApprove(){
                        scope.confirmOk()
                    }
                });

                scope.$watch('confirmStatus',(newVal, oldVal) => {
                    if(newVal){
                        node.modal('show');
                    }else{
                        node.modal('hide');
                    }
                });
            });

        }
    }
}
