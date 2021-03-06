/**
 * 当前文件版本：v0.4
 * 一款简单的鼠标提示js库
 * ============================================
 * 项目地址：https://github.com/ALNY-AC/mTips
 * 作者：见两小儿便日
 * 作者地址：https://github.com/ALNY-AC
 * ============================================
 * 
 * */

var mTips = {
    c: {
        //配置项
        x: 10, //x偏移量,相对于鼠标
        y: 10, //y偏移量,相对于鼠标

        style: {
            'position': 'fixed',
            'padding': '8px 12px',
            'color': '#fff',
            'border-radius': '5px',
            'font-family': "微软雅黑",
            'z-index': '999',
            'display': 'inline',
            'font-size': '14px',
            'background-color': 'rgba(0, 0, 0, 0.5)',
            'color': '#fff',
            'z-index': '1070',
            'line-height': '1.42857143'

        }
    },
    //show方法，用于显示提示

    s: function (em, text, a, b) {
        var style;
        var fun;

        if (typeof (a) == 'string') {
            style = a;
            fun = b;
        } else if (typeof (a) == 'function') {
            style = b;
            fun = a;
        }

        if (style == 'undefined' || style == null) {
            style = 'default';
        }

        var doc = $('<div></div>').addClass('mTips mTips-' + style).html(text).appendTo($('body'));

        if (doc.css('z-index') !== '1070') {
            doc.css(this.c.style);
        }

        em.on('mousemove', function (e) {
            var top = e.pageY + mTips.c.y,
                left = e.pageX + mTips.c.x,
                $w = $('body').width();
            
            doc.offset({
                top: top,
                // 当显示框左侧与body右侧的少于64(最小宽度)时调整left
                left: $w - left < 64 ? left - 64 : left,
            })

        });

        if (fun != null && typeof (fun) != 'undefined') {
            fun();
        }

    },

    //hide方法，用于隐藏和删除提示
    h: function (fun) {

        $('.mTips').remove();
        if (fun != 'undefined' && fun != null) {
            fun();
        }

    },

    //用于给相关属性添加提示功能
    m: function () {

        $(document).on('mouseover', '[data-mtips]', function (e) {
            //鼠标进入

            mTips.s($(this), $(this).attr('data-mtips'), $(this).attr('data-mtips-style'));
            $(".mTips").offset({
                top: e.pageY + mTips.c.x,
                left: e.pageX + mTips.c.y
            })
        });
        $(document).on('mouseout', '[data-mtips]', function (e) {
            //鼠标离开
            mTips.h();
        });

    }

}
mTips.m(); //通过此函数激活所有的