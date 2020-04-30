// 仅用于演示的的openWin
window.defaultWinHeightPer = 0.8;
/**
 * 打开窗口
 * @param src   html路径(必填)
 * @param title  弹出框标题(必填)
 * @param options 适配参数（可选）， 参数对象支持以下属性：
 * 			id:'弹出框的id, 默认为win',
 * 			widthPer: '弹出框宽度百分比，默认0.5',
 * 			heightPer: '弹出框高度百分比，默认0.8',
 * 			width : '弹出框宽度, 设置时会覆盖widthPer的算法',
 * 			height : '弹出框高度, 设置时会覆盖heightPer的算法',
 * 			maxWidth: '最大宽度限制，默认500。 width属性设置值时，才生效。',
 * 			max : '是否以最大化打开弹出框，默认false'
 * 			autoSize: '是否按照内部iframe尺寸设置window的宽高，默认false，
 *                      生效时会忽略传入的width/height值，且window会有一次轻微跳动。'
 */
function openWin(src, title, options) {
    options = options ? options : {};
    let widthPer = options.widthPer ? options.widthPer : 0.5;
    let heightPer = options.heightPer ? options.heightPer : window.defaultWinHeightPer;
    let wid = options.id ? options.id : 'win';
    let max = options.max;
    // let maxWidth = options.maxWidth ? options.maxWidth : 500;
    let autoSize = options.autoSize ? options.autoSize : false;

    function getWidth() {
        let w = $('body').width() * widthPer;
        return options.width ? options.width : w;
    }
    function getHeight() {
        let h = $('body').height() * heightPer;
        return options.height ? options.height : h;
    }
    function resizeWin() {
        if (window.winTimer) clearTimeout(window.winTimer);
        window.winTimer = setTimeout(function () {
            $('#' + wid).window('resize', {
                width: getWidth(),
                height: getHeight(),
            }).window('center');
        }, 500);
    }
    var ifr = document.createElement("iframe");
    ifr.style.display = "block";
    ifr.style.width = '100%';
    ifr.style.height = '100%';
    ifr.style.border = '0';
    ifr.src = src;
    /*ifr.addEventListener('load', e => {
        if (e.target.contentWindow.document.readyState === 'complete') {
            if(callback){
                callback(ifr.contentWindow);
            }
        }
    });*/
    

    $('body').append($('<div id="' + wid + '" />').append(ifr));

    if (autoSize) {
        $(ifr).on('load', function(e) {
            let ifrDom = e.target.contentWindow.document;
            if (ifrDom.readyState === 'complete') {
                let winH = $('#' + wid).height();
                let ifrH = $(ifrDom).find('html').outerHeight();
                let titleH = $('#' + wid).prev('.panel-header').outerHeight();
                let targetH = ifrH + titleH + 2;
                if (ifrH - 2 != winH) {
                    let height = (targetH) > $('body').height() ? $('body').height() * heightPer : targetH;
                    $('#' + wid).window('resize', {height}).window('vcenter');
                    options.height = height;
                    getHeight = function() {
                        let $bodyH = $('body').height();
                        return options.height > $bodyH 
                            ? $bodyH 
                            : (options.height < targetH && targetH < $bodyH
                                ? targetH
                                : options.height);
                    }
                }
                let winW = $('#' + wid).width();
                let iformW = $(ifrDom).find('.my-win-form').width() + 80;
                if (iformW != winW) {
                    let width = (iformW) > $('body').width() ? $('body').width() : iformW;
                    $('#' + wid).window('resize', {width}).window('hcenter');
                    options.width = width;
                    getWidth = function() {
                        let $bodyW = $('body').width();
                        return options.width > $bodyW 
                            ? $bodyW
                            : (options.width < iformW && iformW < $bodyW
                                ? iformW 
                                : options.width);
                    }
                }
            }
        });
    }

    let def = {
        title: title,
        modal: true,
        collapsible: false,
        minimizable: false,
        width: getWidth(),
        height: getHeight(),
        onOpen: function () {
            if (!max) {
                $(window).on('resize', resizeWin)
            }
        },
        onClose: function () {
            $(window).off('resize', resizeWin);
            $(this).window('destroy');
        }
    };
    $.extend(def, options);

    var win = $('#' + wid).window(def);
    if (max) $(win).window('maximize');
    currentOpenWindow.push(win);
    return win;
}

let currentOpenWindow = [];
function  closeWin(win) {
    if(!win){
        win = currentOpenWindow.last();
    }
    if(win)$(win).window('close');
}

//返回最后一个元素
Array.prototype.last = function() {
    return this[this.length-1];
};