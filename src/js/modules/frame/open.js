export default function(){
    var winWidth = $(window).width();
    var timer = null;
    $('#main').width(winWidth-50).addClass('togopen');
    var slideout = new Slideout({
        'panel': document.getElementById('main'),
        'menu': document.getElementById('menu'),
        'padding': 256,
        'tolerance': 70
    });

    function toggleFunc(){
        slideout.toggle();
        toggleFuncCom();
    }
    function toggleFuncCom() {
        if(slideout._opened){
            $('#main').removeClass('togopen').width(winWidth-256);
            $('#menu2').css('display','none');
        }else{
            $('#main').addClass('togopen').width(winWidth-50);
            setTimeout(function(){
                $('#menu2').css('display','block')
            },300);
        }
    }

    toggleFunc();
    document.querySelector('.js-slideout-toggle').addEventListener('click', function() {
        toggleFunc();
    });

    $(window).resize(function(){
        var width = $(window).width();
        toggleFuncCom();
    });

    /*
    document.querySelector('.menu').addEventListener('click', function(eve) {
        if (eve.target.nodeName === 'A') {
            toggleFunc();
            return false;
        }
    });
    */

    $('#alarmId').click(function(){
       $('.showBox').show();
    })
    $('.showBox').mouseenter(function(){
        $('.showBox').show();
        clearTimeout(timer);
        timer = null;
        console.log(timer);
    });
    $('.showBox').mouseleave(function(){
        timer = setTimeout(function(){
            $('.showBox').hide();
        },1000);
    });

      //权限菜单的显示与隐藏
    $(function(){
        var configMenuValue = getCookie('configMenu'),configMenu;

        if(configMenuValue){
            configMenu = configMenuValue.split("|");
            $.each(configMenu,function(index,item){
                $('#menu a[data-id="'+item+'"]').parent().remove();
                $('#menu2 a[data-id="'+item+'"]').parent().remove();
                if(item=="mendian"){
                    $('#menu2 #mendian2').remove();
                    $('#menu #mendian').remove();
                }
            });
        }
    });

   function setCookie(cname,cvalue,exdays){
        var d = new Date();
        d.setTime(d.getTime()+(exdays*24*60*60*1000));
        var expires = "expires="+d.toGMTString();
        var path_ = "path=/",domain_ = "domain="+location.hostname;
        document.cookie = cname + "=" + cvalue + "; " + domain_ + "; " + expires + "; " + path_;
    }

    function getCookie(name)
    {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
        else
        return null;
    }

    function delCookie(name)
    {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval=getCookie(name);
        if(cval!=null)
        document.cookie= name + "="+cval+";expires="+exp.toGMTString();
    }

    //退出用户登录删除cookie中的tokenx信息
    $('#userLogout').click(function(){
        var href = window.location.href;
        var baseUrl = "******************"
        $.ajax({
            url:baseUrl,
            type:"post",
            data:{},
            dataType:"json",
            success:function(data){
                if(data.code==1){
                    delCookie('token');//删除用户token
                    delCookie('configMenu'); //删除配置菜单
                    delCookie('userLevel');//删除用户级别
                    window.location.href = href + "login.html"
                }else{
                    new PNotify({
                        title:'消息提示',
                        text: data.msg,
                        delay: 1000,
                        type: 'error',
                        stack:  {
                            "dir1": "down",
                            "dir2": "left",
                            "firstpos1": 66,
                            "firstpos2": 36
                        }
                    });
                }
            }
        })
    });
}
