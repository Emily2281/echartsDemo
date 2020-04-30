//获取项目根路径
var wlocation = window.location;
var path = wlocation.pathname.substring(1);
var basePath = [wlocation.protocol, '//', wlocation.hostname,
    (wlocation.port == '' ? '' : ':'), wlocation.port, '/',
    path.substring(0, path.indexOf('/') + 1)].join('');

/**
 * jquery 插件，把表单form 转化成json对象，支持嵌套对象
 * author huchangggui
 */
(function( $ ) {
    $.fn.toJSON = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            var name = this.name;
            var value = this.value;
            var paths = this.name.split(".");
            var len = paths.length;
            var obj = o;
            $.each(paths, function(i, e) {
                if (i == len - 1) {
                    if (obj[e]) {
                        if (!obj[e].push) {
                            obj[e] = [ obj[e] ];
                        }
                        obj[e].push(value || '');
                    } else {
                        obj[e] = value || '';
                    }
                } else {
                    if (!obj[e]) {
                        obj[e] = {};
                    }
                }
                obj = o[e];
            });
        });
        return o;
    };
})( jQuery );

/**
 * 获取当前页面URL的参数
 * @return 返回一个js对象，参数名为对象的属性名，参数值为属性的值
 */
function getUrlParams() {
    let params = {};
    let s= location.href.split('?');
    if(s.length>1) {
        let ss = s[1].split('&');
        for (let i in ss) {
            let ps = ss[i];
            if (typeof ps == 'string') {
                let pss = ps.split('=');
                for (let k in pss) {
                    params[pss[0]] = pss[1];
                }
            }
        }
    }
    return params;
}
/**
 * 日期格式化
 * @param fmt yyyy-MM-dd HH:mm:ss
 * @return {string}  2020-04-30 14:16:02
 */
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

/**
 * 日期格式化
 * @param str 86400000
 * @return {string}  2020-04-26
 */
function formatDate(str) {
    console.log("日期格式："+(str));
    var date = new Date(str);
    return date.getFullYear() + "-" + (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());//+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}

/**
 * 日期字符串解析
 * @param s
 * @return {Date}
 */
function dateParser(s){
    if (!s) return new Date();
    var ss = (s.split('-'));
    var y = parseInt(ss[0],10);
    var m = parseInt(ss[1],10);
    var d = parseInt(ss[2],10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)){
        return new Date(y,m-1,d);
    } else {
        return new Date();
    }
}

/**
 * 通用前端分页
 * @param data {{array}}  要分页的数据
 * @param pageNumber 页码
 * @param pageSize  每页条数
 * @return data {{array}} 要展示的数据
 */
function pageSplit(data,pageNumber,pageSize) {
    let newData = $.extend(true,[],data);
    var start = (pageNumber - 1) * parseInt(pageSize);
    var end = start + parseInt(pageSize);
    newData = (newData.slice(start, end));
    return newData;
}

/**
 * 获取下拉框的值，只适用于combobox
 * @param elementId 选择框元素ID
 * @param sqlId Sql文件的sqlID
 * @param options 参数JSON对象 见代码params注解
 * @param callback 返回数据的回调
 */
function initComboboxSelect(id, sqlId, options, callback) {
    if(!options)options = {};
    if(sqlId && options.queryParam && !options.queryParam.sqlId){
        options.queryParam.sqlId = sqlId;
    }
    let params = {
        queryParam:{
            sqlId: sqlId
        },
        tipText: "加载中...",//加载数据的提示文字
        url: basePath + 'json/city.json',//加载数据URL
        valueField: 'value',//数据值字段
        prompt: null,//placeholder
        idField: 'value',
        textField: 'text',//数据的label字段
        parentField: 'parentId',
        emptyOption: false,//否需要空选项
        emptyText: "--请选择--",//空选项显示文本
        emptyValue: '',//空选项值
        value: null,//已选中文本
        multiple: false,//是否多选
        editable:false,
        combotype: 'combobox',//是否combobox/combotree
        callback: callback, //成功加载树回调函数，参数 list
        initCheckAll: false,//初始化就自动全选
        onBeforeLoad:function(param,treeParam){
            let queryParam;
            queryParam = $.extend(param,queryParams);

            //防止回显时加载两次导致数据被清理的bug。
            let id = ele.attr('id');
            let parentEles = ele.parents('form').find('input,select');//找到级联父节点
            for(let i = 0;i<parentEles.length;i++){
                let _opts = parentEles.eq(i).data('select');
                if(_opts){
                    try{
                        _opts = eval('_opts = {' + _opts + '}');
                        if(_opts && !isEmpty(_opts.childId) && _opts.childId == id){
                            let thisVal = queryParam[params.childParamName || 'parentId'];
                            let parentVal = parentEles.eq(i)[params.combotype]('getValue');
                            // console.debug('找到级联父节点 parentVal = ' + parentVal + ',thisVal = ' + thisVal);
                            if(isEmpty(thisVal)){
                                console.debug('级联复选框还没选值，等待触发级联事件');
                                return false;
                            }
                        }
                    }catch (e) {console.error('解析失败:[' + id + ']',e)}
                }
            }
            ele.combobox('panel').append('<span class="combo-loading">'+params.tipText+'</span>');
        },
        onLoadSuccess:function(data){
            ele[params.combotype]('panel').find('.combo-loading').remove();

            let opts = ele[params.combotype]('options');
            let val = ele[params.combotype]('getValue');

            if(ele.data('afterLoadChild')){
                ele.data('afterLoadChild',null);
                let op = data.find(d=>d[params.valueField] == val);
                if(!op){console.debug('用户更改了选项，清空已有值，要不会显示一个ID:' + val);
                    ele[params.combotype]('setValue','');
                }
            }
            //单选默认第一个
            if(!params.emptyOption
                && !opts.multiple
                && params.combotype == 'combobox'
                && !isEmpty(data)
                && isEmpty($(this)[params.combotype]('getValue'))){
                let val = data[0][params.valueField];
                console.log('下拉框没有初始值，默认选中第一个');
                $(this)[params.combotype]('select',val == null ? params.emptyValue : val);// val === params.emptyValue?null:val
            }
            //自动触发请选择的控制选项
            if(params.emptyOption && !params.multiple && isEmpty(val)){
                setTimeout(()=>$(this)[params.combotype]('select', params.emptyValue),10);
            }

        },
        loadFilter:	function(data){
            if(params.callback){
                params.callback(data);
            }
            //插入空值选项
            if(params.emptyOption && !params.multiple){
                let emptyOption = {emptyOption:true};
                let oldEmptyOption = data.find(o=>o.emptyOption === true);
                if(isEmpty(oldEmptyOption)){//加个判断防止重复加入空选项
                    emptyOption[params.textField] = params.emptyText;
                    emptyOption[params.valueField] = params.emptyValue;
                    data.splice(0,0,emptyOption);
                }
            }
            return data;
        },
        //多选出现checkbox的方法
        formatter: function (row) {
            let opts = ele[params.combotype]('options');
            return row[opts.textField];
        },
        onLoadError:function (err) {
            ele[params.combotype]('panel').find('.combo-loading').remove();
            alert("下拉框初始化失败");
        },
        onChange:function(newValue, oldValue){
            if(newValue === params.emptyValue){
                $(this)[params.combotype]('select',null);
            }
        }
    };

    //默认参数继承
    $.extend(params,options);

    //设置默认prompt
    if(isEmpty(params.prompt) && params.emptyOption){
        params.prompt = params.emptyText;
    }

    //传入后台参数,无需携带过多前台相关数据
    let queryParams = params.queryParam;
    let ele = id;
    if(!(id instanceof jQuery)){
        ele = $('#' + id);
    }

    ele[params.combotype](params);
}

/**
 判断对象是否为空，字符串是否有值
 */
function isEmpty(val){
    if(typeof(val) == 'boolean'){
        return false;
    }
    if(typeof(val) == 'number'){
        return false;
    }
    if(Array.isArray(val)){
        return val.length == 0;
    }
    if(val == null || typeof(val) == 'undefined'){
        return true;
    }
    if(val['__ob__']){//Vue Object
        for(var k in val){
            return false;
        }
        return true;
    }

    if(typeof(val) == 'object' && JSON.stringify(val) == '{}'){
        return true;
    }

    return !val || val == '';
}

/**
 * 生成折线图x轴时间刻度
 */
function createXTimeData(inputDate) {
    // let selDate;
    timeData = [];
    for (let k=0;k<2;k++) {
        let date;
        let selDate = inputDate;
        // let selDate = new Date();
        if(k==0){
            selDate = new Date(selDate).getTime()-86400000;
            date = formatDate(selDate);
        }else{
            selDate = new Date(selDate).getTime();
            date = formatDate(selDate);
        }

        let dateStr = date+"\n";//日期
        for (let i = 0; i < 24; i++) {
            let index = i+"";
            if (i >= 10) {//两位数
                // index =  dateStr+i + ":00";
                index =  i ;
                timeData.push(index)
            } else {
                // index = dateStr+" 0" + i + ":00";
                index = " 0" + i ;
                timeData.push(index)
            }
        }
    }
}