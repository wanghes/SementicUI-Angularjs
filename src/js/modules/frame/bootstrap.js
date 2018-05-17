/**
 * 切换类型
 * @param _type
 */
function slidePosition(_type) {
    var _obj = $('.tab_list .current');
    var _next_tab = _obj.next();
    var _prev_tab = _obj.prev();

    if (_type == 'left') {
        if (_prev_tab.html() != undefined) {
            removeCurrentState();
            activeTabByObj(_prev_tab);
            switchPosition(_prev_tab.data('id'));
        }
    } else {
        if (_next_tab.html() != undefined) {
            removeCurrentState();
            activeTabByObj(_next_tab);
            switchPosition(_next_tab.data('id'));
        }
    }
}

/**
 * 添加一个TAB
 * @param _title
 * @param _data_id
 */
function addTab(_obj) {
    var _title = _obj.text();
    var _data_id = _obj.attr('data-id');
    var _url = _obj.attr('data-url');

    var _tpl_tab = '<li class="current" data-id="' + _data_id + '">' + _title + '<a>&times;</a></li>';
    var _tpl_frame = '<iframe src="' + _url + '" class="frame" data-id="' + _data_id + '"></iframe>';

    removeCurrentState();
    $('.tab_list').append(_tpl_tab);
    $('#frame_container').prepend(_tpl_frame);
    $('#loadingBox').show();
    setTimeout(function(){
        $(_tpl_frame).find('body').addClass('iframeBody1111');
    },3000)

}

/**
 * 检测是否存在TAB
 * @param _id
 */
function tabExist(_id) {
    var _tab = $('.tab_list li[data-id=' + _id + ']').html();
    if (_tab == undefined)
        return false;
    else
        return true;
}


/**
 * 切换位置
 */
function switchPosition(_obj) {
    var _switch_obj = $('.tab_list li[data-id=' + _obj + ']');
    var main_pos = $('#tab_menu').position().left;
    var main_width = $('#tab_menu_wrap').width();
    var cur_pos = _switch_obj.position().left;
    var tab_width = _switch_obj.width();

    if ((cur_pos + tab_width) > main_width - main_pos) {
        var _move_to = main_width - cur_pos - tab_width - 30;
        $('#tab_menu').css('left', _move_to);
    }

    if ((cur_pos + main_pos) < 0) {
        var _move_to = 0 - cur_pos;
        $('#tab_menu').css('left', _move_to);
    }
}
/**
 * 切换TAB
 * @param _obj
 */
function switchTab(_obj) {
    if (_obj.hasClass('current')) {
        _obj.parents('ul').find('li').removeClass('current');

        var _next_tab = _obj.next();
        var _prev_tab = _obj.prev();

        if (_next_tab.html() == undefined)
            activeTabByObj(_prev_tab);
        else
            activeTabByObj(_next_tab);
    }
}

/**
 * 删除一个TAB
 * @param _obj
 */
function removeTab(_obj) {
    switchTab(_obj);
    var _id = _obj.data('id');
    $('.tab_list li[data-id=' + _id + ']').remove();
    $('#frame_container iframe[data-id=' + _id + ']').remove();
}

/**
 * 去除TAB和FRAME的激活状态
 */
function removeCurrentState() {
    $('.tab_list li').removeClass('current');
    $('#frame_container iframe').hide();
}
/**
 * 使用对象激活一个TAB
 * @param _data_id
 */
function activeTabByObj(_obj) {
    removeCurrentState();
    _obj.addClass('current');
    var _data_id = _obj.data('id');
    $('.menu-section-list li').removeClass('current');
    $('#menu').find('a[data-id='+_data_id+']').parent().addClass('current');
    $('#frame_container iframe[data-id=' + _data_id + ']').show();
}

/**
 * 使用ID激活一个TAB
 * @param _data_id
 */
function activeTabByDataId(_data_id) {
    //TODO: 这里还要判定存在不存在, 先这样了
    removeCurrentState();
    $('.tab_list li[data-id=' + _data_id + ']').addClass('current');
    $('#frame_container iframe[data-id=' + _data_id + ']').show();
}

export default function init() {
    //切换tablist current状态
    $(document).on('click', '.tab_list li', function(e) {
        activeTabByObj($(this));
    });

    //tablist 关闭按键实现
    $(document).on('click', '.tab_list li a', function(e) {
        var _tab_li = $(this).parent('li');
        removeTab(_tab_li);
        e.preventDefault();
        e.stopPropagation();
    });

    //打开新TAB页面
    $(document).on('click', '.menu-section a,#menu2 a', function(e) {
        var _id = $(this).data('id');
        if(!_id){
            return;
        }
        if (tabExist(_id)) {
            //激活一个TAB
            activeTabByDataId(_id);
        } else {
            //添加一个TAB
            addTab($(this));
        }
        $('.menu-section li').removeClass('current');
        $(this).parent('li').addClass('current');

        switchPosition(_id);
        e.preventDefault();
    });

    //向左滑动
    $(document).on('click', '.slide_left', function(e) {
        slidePosition('left');
        e.preventDefault();
        return false;
    });

    //向右滑动
    $(document).on('click', '.slide_right', function(e) {
        slidePosition('right');
        e.preventDefault();
        return false;
    });
}
