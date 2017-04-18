import dashboard from "./pages/dashboard";
import homeCtrl from "./pages/homeCtrl";
//#import
//注意上面是自动化文件插入位置

(function(){
$('body').append(`<div class="ui active inverted dimmer" id="loadingBox">
    <div class="ui medium text loader">正在加载数据...</div>
</div>`);
dashboard();
homeCtrl();
//#insert
//注意上面是自动化文件插入位置
})();
