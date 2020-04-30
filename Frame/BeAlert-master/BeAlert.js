/**
 * 图标类型：error  success  question   warning  info notip(不显示图标)
 *
 * function (title, message, callback, opts)  opts 可以指定 下面 defaultConfig所有内容
 *
 * ##################  普通 alert
 *              1. alert("");
 *              2.  alert("","",null,{type:'success',, confirmButtonText: 'OK'})
 *
 * ##################  comfirm弹框： function (title, message, callback, opts）
 *
 *  $("#confirm").click(function () {
            confirm("Are you sure?", "You will not be able to recover this imaginary file!", function (isConfirm) {
                if (isConfirm) {
                    //after click the confirm
                } else {
                    //after click the cancel
                }
            }, {confirmButtonText: 'Yes, delete it!', cancelButtonText: 'No, cancel plx!', width: 400});
        });
 *
 */
var BeAlert;
var isDataAccess = false;//是否在数据接入平台访问改js

if (typeof $ === 'function') {
    $(function () {
        var topWin;
        try {
            isDataAccess = true;
            if (isDataAccess) {
                topWin = $(window.document.body);
            } else {
                topWin = $(window.top.document.body);
            }
        } catch (e) {
            //如果异常则使用window.document.body   lwb
            console.info(e);
            topWin = $(window.document.body);
        }

        BeAlert = {
            defaultConfig: {
                width: 'auto',
                height: 'auto',
                'min-width': 200,
                timer: 0,
                type: 'warning',
                showConfirmButton: true,
                showCancelButton: false,
                confirmButtonText: '确认',
                cancelButtonText: '取消'
            },
            html: '<div class="BeAlert_box">' +
                '<div class="BeAlert_image"></div>' +
                '<div class="BeAlert_title"></div>' +
                '<div class="BeAlert_message"></div>' +
                '<div class="BeAlert_button">' +
                '<button class="BeAlert_confirm"></button>' +
                '<button class="BeAlert_cancel"></button>' +
                '</div>' +
                '</div>',
            overlay: '<div class="BeAlert_overlay"></div>',
            open: function (title, message, callback, o, closeCallback) {
                var opts = {}, that = this;
                $.extend(opts, that.defaultConfig, o);
                // $('body').append(that.html).append(that.overlay);
                topWin.append(that.html).append(that.overlay);
                var box = topWin.find('.BeAlert_box');
                /* box.css({
                 'width': opts.width + 'px',
                 'min-height': opts.height + 'px',
                 'margin-left': -((topWin.find('.BeAlert_box').width()) / 2) + 'px'
                 // 'margin-left': -(opts.width / 2) + 'px'
                 });*/
                topWin.find('.BeAlert_image').addClass(opts.type);
                title && topWin.find('.BeAlert_title').html(title).show();
                message && topWin.find('.BeAlert_message').html(message).show();
                var confirmBtn = topWin.find('.BeAlert_confirm'), cancelBtn = topWin.find('.BeAlert_cancel');
                opts.showConfirmButton && confirmBtn.text(opts.confirmButtonText).show();
                opts.showCancelButton && cancelBtn.text(opts.cancelButtonText).show();
                topWin.find('.BeAlert_overlay').unbind('click').bind('click', function () {
                    that.close(closeCallback);
                });
                confirmBtn.unbind('click').bind('click', function () {
                    that.close();
                    typeof callback === 'function' && callback(true);
                });
                cancelBtn.unbind('click').bind('click', function () {
                    that.close();
                    typeof callback === 'function' && callback(false);
                });
                var h = box.height();
                var clientWith = topWin.width();
                var w = box.width() > (clientWith / 2) ? (clientWith / 2) : box.width();
                box.css({
                    'margin-top': -(Math.max(h, (opts.height == 'auto' ? 0 : opts.height)) / 2 + 100) + 'px',
                    'width': opts.width + 'px',
                    'min-height': opts.height + 'px',
                    'margin-left': -(Math.max(w, (opts.width == 'auto' ? 0 : opts.width)) / 2) + 'px',
                    'min-width': '200px',
                    'max-width': clientWith / 2
                });
            },
            close: function (closeCallback) {
                topWin.find(".BeAlert_overlay,.BeAlert_box").remove();
                typeof closeCallback === 'function' && closeCallback();
            }
        };
        window.alert = function (title, message, callback, opts, closeCallback) {
            try {
                if (isDataAccess) {
                    if (window.BeAlert != null) {
                        window.BeAlert.open(title, message, callback, opts, closeCallback);
                    }
                } else {
                    window.top.BeAlert.open(title, message, callback, opts, closeCallback);
                }
            } catch (e) {
                if (window.BeAlert != null) {
                    window.BeAlert.open(title, message, callback, opts, closeCallback);
                }
            }
        };
        var _confirm = window.confirm;
        window.confirm = function (title, message, callback, opts, closeCallback) {
            opts = $.extend({type: 'question', showCancelButton: true}, opts);
            if (typeof callback === 'function') {
                try {
                    if (isDataAccess) {
                        if (window.BeAlert != null) {
                            window.BeAlert.open(title, message, callback, opts, closeCallback);
                        }
                    } else {
                        window.top.BeAlert.open(title, message, callback, opts, closeCallback);
                    }
                } catch (e) {
                    if (window.BeAlert != null) {
                        window.BeAlert.open(title, message, callback, opts, closeCallback);
                    }
                }
            } else {
                return _confirm(title);
            }
        }
    });
}