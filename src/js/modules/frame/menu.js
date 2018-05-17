import * as menuJson from './menuJson';
export default function init(){
    $(function(){
        let menu = menuJson.menu;
        function judgePrevItem(values,index,len){
            let first=false, last=false, prev,next,current;

            if(len==1){
                if(!values[index].content){
                    return {first:true,last:true}
                }
            }else{
                if(index==0){
                    if(!values[index].content){
                         first = true;
                     }else{
                        first = false;
                     }
                }else{index>0}{
                    prev = values[index-1];
                    next = values[index+1];
                    current =  values[index]
                    if(prev && prev.content && !current.content){
                        first = true;
                    }
                    if(next && next.content && !current.content){
                        last = true;
                    }
                    if(!next){
                        last = true;
                    }
                }
            }
            return {first:first, last:last};
        }

        function secondFunc(value,icon,name){
            let menuFirstHtml=``, status;

            menuFirstHtml += `<section class="menu-section">`;
            //menuFirstHtml += `<h3 class="menu-section-title"><i class="${icon} icon"></i>${name}</h3>`;
            value.forEach(function(second,index2){
                status = judgePrevItem(value,index2,value.length);
                if(!second.content){
                    menuFirstHtml += status.first ?`<ul class="menu-section-list" id="${second.id}">`:``;
                    menuFirstHtml += `<li>
                                        <a href="javascript:;" data-id="${second.id}"
                                        data-url="${second.url}">
                                        <i class="${second.icon} icon"></i>${second.firstTitle}</a>
                                        </li>`;
                    menuFirstHtml += status.last ? `</ul>` : ``;
                }else{
                    second.content.forEach(function(third,index3){
                        menuFirstHtml +=  index3==0 ? `<section class="menu_second" id="${second.id}">
                                                <h3 class="menu-section-title"><i class="${second.icon} icon"></i>${second.firstTitle}</h3>
                                                <ul class="menu-section-list">` : ``;
                        menuFirstHtml += `<li>
                                            <a href="javascript:;" data-id="${third.id}" data-url="${third.url}">
                                            <i class="${third.icon} icon"></i>${third.secondTitle}
                                            </a>
                                            </li>`;
                        menuFirstHtml += index3==(second.content.length-1) ? `</ul></section>` : ``;

                    });
                }
            });
            menuFirstHtml += `</section>`;
            return menuFirstHtml;
        }

        let menuFirstHtml = ``;
        let menuSecondHtml = ``;
        /***设置宽侧边栏导航****/
        menuFirstHtml =`<div class="logo">
                            <header class="menu-header">
                                <span class="menu-header-title">后台管理系统</span>
                            </header>
                        </div>`;
        menu.forEach(function(value,index){
            if (index==0) {
                //let html = secondFunc(value, 'newspaper', '销售跟踪'); //先去掉一级标题
                let html = secondFunc(value);
                menuFirstHtml += html;
            } else if(index==1) {
                //let html = secondFunc(value, 'user', '用户操作'); //先去掉一级标题
                let html = secondFunc(value);
                menuFirstHtml += html;
            }
        });
        $('#menu').html(menuFirstHtml);

        /***设置窄侧边栏导航****/
        menuSecondHtml = `<div class="inner"><div class="logo_2"></div><ul>`;
        menu.forEach(function(value,index){
            value.forEach(function(second,index2){
                if(second.content){
                    menuSecondHtml += `<li id="${second.id}2">
                                        <a href="javascript:;" data-inverted="" data-position="right center"
                                        data-tooltip="${second.firstTitle}">
                                        <i class="${second.icon} icon"></i>
                                        <span class="content">${second.firstTitle}</span>
                                        </a>`;
                    if(index2 > 1 && index!=0){
                        menuSecondHtml += `<ul class="five_grid">`;
                    }else{
                        menuSecondHtml += `<ul>`;
                    }
                    second.content.forEach(function(third){
                        menuSecondHtml +=  `<li>
                                            <a href="javascript:;" data-id="${third.id}" data-url="${third.url}">
                                            <i class="${third.icon} icon">
                                            </i>${third.secondTitle}</a>
                                            </li>`;
                    });
                    menuSecondHtml += `</ul>`;
                    menuSecondHtml += `</li>`;
                }else{
                    menuSecondHtml += `<li>
                                        <a href="javascript:;" data-url="${second.url}" data-inverted=""
                                        data-position="right center" data-tooltip="${second.firstTitle}" data-id="${second.id}">
                                        <i class="${second.icon} icon"></i>
                                        <span class="content">${second.firstTitle}</span></span>
                                        </a>
                                        </li>`;
                }
            });
        });
        menuSecondHtml += `</ul></div>`;
        $('#menu2').html(menuSecondHtml);

        /******设置宽侧边栏的黑色滚动条样式*******/
        $("#menu").mCustomScrollbar({
            scrollButtons:{enable:true},
            theme:"light-thick",
            scrollbarPosition:"outside"
        });
    })

}







