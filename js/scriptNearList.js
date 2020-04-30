let params = getUrlParams();
$(function () {
    let northTitleText = "建议调整脚本列表";
    let titleBtn = `<span class="icon-script-entre" title="下载脚本" onclick="downloadScript($(this))">&nbsp;</span>`;
    $('#scriptLayout').layout('panel', 'north').panel('setTitle', `<span>${northTitleText}</span>${titleBtn}`);
    let centerTitleText = "建议回调脚本列表";
    $('#scriptLayout').layout('panel', 'center').panel('setTitle', `<span>${centerTitleText}</span>${titleBtn}`);

    let rowData = JSON.parse(parent.$('#rowData_'+params.index).val());
    let startEndTime = parent.$("#startEndTime_"+params.index).text();
    let northTimeHtml = `<span>`+startEndTime+`</span>`;
    let centerTimeHtml = `<span>`+startEndTime+`</span>`;
    let northToolText = `<a href="javascript:;" class="icon-dateWhite"></a><span>建议下发调整时间：</span>`;
    let centerToolText = `<a href="javascript:;" class="icon-dateWhite"></a><span>建议下发回调时间：</span>`;
    $('#scriptLayout').find(".layout-panel-north .panel-tool").html(northToolText+northTimeHtml);
    $('#scriptLayout').find(".layout-panel-center .panel-tool").html(centerToolText+centerTimeHtml);
    getScriptNearInfo(rowData);
})

/**
 * 复制当前点击内容
 * @param _this
 */
function copyFun(_this) {
    var content = _this.parent().prev().text();
    //引入实例化clipboard.js, 注意这里不要用Clipboard而是ClipboardJS
    var clipboard = new ClipboardJS('.copyBtn', {
        text: function() {
            return content;
        }
    });

    //如果成功复制的话
    clipboard.on('success', function(e) {
        _this.next().text('复制成功!').fadeIn();
        _this.next().delay("slow").fadeOut();
        clipboard.destroy();
    });
    //如果复制失败
    clipboard.on('error', function(e) {
        _this.next().text('复制失败!');
        setTimeout(function () {
            _this.next().text('');
        },2000);
    });
}
/**
 * 从后台获取脚本邻区TOP5数据
 */
function getScriptNearInfo(rowData) {
    let formJson = {};
    formJson.pred_data_time = rowData.pred_data_time;
    formJson.pred_enodeb_cell = rowData.pred_enodeb_cell;
    formJson.pred_start_time = rowData.pred_start_time;
    formJson.pred_end_time = rowData.pred_end_time;
    setHighValue(rowData);
    console.log(formJson);
    MaskUtil.mask("数据加载中...");
    $.post(
        basePath + "json/scriptNearList.json",
        formJson,
        function (result) {
            MaskUtil.unmask();
            let nearData = result.data;
            if(result.success){
                setNearTopValue(nearData);
            }else {
                alert(result.msg);
            }
        });
}

/**
 * 候选邻区脚本内容
 * @param nearText
 * @param scriptType
 */
function addTopScript(nearText,scriptType) {
    let rowHtml = `<div class="form_row">
                        <div class="col_item" style="width: 90%">`+nearText+`</div>
                        <div class="col_item" style="width: 8%;">
                            <img onclick="copyFun($(this))" title="复制" src="img/copy.svg" class="extraImg copyBtn">
                            <span style="display: none"></span>
                        </div>
                    </div>
                    `;
    $("#"+scriptType).append(rowHtml);
    rowHtml = null;
}
/**
 * 设置拥塞小区脚本的内容
 * @param rowData
 */
function setHighValue(rowData) {
    let highValues = ["highFactory","highCallFactory","highText","highCallText"];
    $.each(highValues,function (i,v) {
        if(v.indexOf('Factory')>-1){
            $("#"+highValues[i]).text(rowData.factory);
        }
        if(v.indexOf('Text')>-1){
            let enodebCell = rowData.pred_enodeb_cell.split("-");
            let eNodeBId = enodebCell[0],cellId = enodebCell[1];
            let qOffset = (rowData.enodeb_cell_qoffset?rowData.enodeb_cell_qoffset:2)+"dB";
            let indvOffset = (rowData.enodeb_cell_individualoffset?rowData.enodeb_cell_individualoffset:2)+"dB";
            let modText = `MOD EUTRANINTRAFREQNCELL: LocalCellId=0, Mcc="460", Mnc="20", `;
            let highText = modText+`eNodeBId=`+eNodeBId+`, CellId=`+cellId+`, CellIndividualOffset=`+indvOffset+`, CellQoffset=`+qOffset+`；`;
            $("#"+highValues[i]).text(highText);
        }
    })
}

/**
 * 设置候选邻区脚本头的内容
 * @param rowData
 */
function setNearTopValue(rowData) {
    let factoryValues = ["nearFactory","nearCallFactory"];
    let nearValues = ["nearText","nearCallText"];
    console.log(eval(rowData));
    $.each(rowData,function (i,v) {
        $.each(factoryValues,function (j,vj) {
            if(vj.indexOf('Factory')>-1){
                $("#"+factoryValues[j]).text(v.near_factory);
            }
        })

        let enodebCell = v.near_cell.split("-");
        let eNodeBId = enodebCell[0],cellId = enodebCell[1];
        let qOffset = (v.near_cell_qoffset?v.near_cell_qoffset:2)+"dB";
        let indvOffset = (v.near_cell_individualoffset?v.near_cell_individualoffset:2)+"dB";
        let modText = `MOD EUTRANINTRAFREQNCELL: LocalCellId=0, Mcc="460", Mnc="20", `;
        let nearText = modText+`eNodeBId=`+eNodeBId+`, CellId=`+cellId+`, CellIndividualOffset=`+indvOffset+`, CellQoffset=`+qOffset+`；`;
        $.each(nearValues,function (j,vj) {
            addTopScript(nearText, vj);
        })
    })
}

/**
 * 下载脚本内容
 * @param _this
 */
function downloadScript(_this) {
    let parentDiv = _this.parent().parent().parent();
    let paramstr = parentDiv.find(".form_row");
    let textAll = "";
    for ( let i = 0; i < paramstr.length; i++) {
        var paramHtml = paramstr[i];
        if(i===0||i===2){
            let text = $(paramHtml).find('div').eq(0).text();//拥塞小区调整脚本：
            let factory = $(paramHtml).find('div').eq(1).find('span').text();//华为
            textAll = textAll+text+"                      厂家："+factory+"\n";
        }else{
            let text = $(paramHtml).find('div').eq(0).text();//拥塞小区调整脚本内容
            textAll += text+"\n";
        }
    }
    console.log(textAll);
    let title = _this.prev().text();
    let today = new Date().Format("yyyy-MM-dd HH:mm:ss");
    console.log("today:"+today);
    let fileName = title+today;
    var blob = new Blob([textAll], {type: "text/plain;charset=utf-8"});
    saveAs(blob, fileName+".txt");
}