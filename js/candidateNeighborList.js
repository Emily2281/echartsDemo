let num=1;
let params = getUrlParams();
let nearTopList = [];
$(function () {
    getNearTopInfo();
    //保存
    $('#saveBtn').on('click',function () {
        updateNearTopResult();
    })
});

/**
 * 动态展示每一行数据
 * @param index
 * @param rowData
 */
function addTopRow(index,rowData,confirmStatus) {
    if(index===""||typeof (index) == "undefined"){
        num++;
    }else{
        num = index;
    }
    let topRightHtml = initTopRightData(num,rowData,confirmStatus);
    let cellId = rowData.near_cell;//邻区ID
    let cellName = rowData.cell_name;//邻区名称
    let longAndLat = rowData.longitude+","+rowData.latitude;//邻区经纬度
    let rowHtml = `<div class="form_row topRow" id="topRow_`+num+`">
                        <div class="col_item topLeft">
                            <div style="margin: 5px">
                                <div class="form_row">
                                    <img src="img/topWifi.svg" class="candidateImg">
                                </div>
                                <div class="topNum">
                                    `+num+`.
                                </div>
                                <div class="form_row">
                                    <span>邻区ID：</span><span>`+cellId+`</span>
                                </div>
                                <div class="form_row">
                                    <span>邻区名称：</span><span>`+cellName+`</span>
                                </div>
                                <div class="form_row">
                                    <span>邻区经纬度：</span><span>`+longAndLat+` </span>
                                </div>
                            </div>
                        </div>
                        <div id="topRight_`+num+`" class="col_item topRight">`+topRightHtml+`</div>
                   </div>
                   `;
    $("#topRow").append(rowHtml);
    $.parser.parse($('#topRow_'+num));
    rowHtml = null;
}

/**
 * 加载邻区右边输入框信息
 * @param num
 * @param rowData
 * @param confirmStatus
 * @return {string}
 */
function initTopRightData(num,rowData,confirmStatus) {
    let overArea = rowData.overlap_area?rowData.overlap_area:0;//重叠面积
    let status = confirmStatus+"";
    let QoffsetHtml,IndividualHtml;
    let qOffset = rowData.near_cell_qoffset?rowData.near_cell_qoffset:'2';
    let individualOffset = rowData.near_cell_individualoffset?rowData.near_cell_individualoffset:'2';
    if(status!="null"&&status!=""){
        QoffsetHtml = `<span>`+qOffset+`</span>`;
        IndividualHtml = `<span>`+individualOffset+`</span>`;
    }else {
        QoffsetHtml = `<span id="qoffset_`+num+`"><input name="near_cell_qoffset" class="easyui-textbox sm_width" value="`+qOffset+`"></span>`;
        IndividualHtml =`<span id="indoffset_`+num+`"><input name="near_cell_individualoffset" class="easyui-textbox sm_width" value="`+individualOffset+`"></span>`;
    }
    let topRightHtml = `
                        <div style="margin: 5px">
                            <div class="form_row" style="padding-left: 64px">
                                <span>重叠面积：</span>
                                <span style="padding-left: 6px;">`+overArea+`</span>
                            </div>
                            <div class="form_row">
                                <div class="col_item">
                                    <label class="xl_width">CellQoffset：</label>
                                    `+QoffsetHtml+`
                                    <span>dB</span>
                                </div>
                            </div>
                            <div class="form_row">
                                <div class="col_item">
                                    <label>CellIndividualOffset：</label>
                                    `+IndividualHtml+`
                                    <span>dB</span>
                                </div>
                            </div>
                        </div>
                        `;
    return topRightHtml;
}
/**
 * 从后台获取邻区TOP5数据
 */
function getNearTopInfo() {
    $("#topRow").html('');
    let rowData = JSON.parse(parent.$('#rowData_'+params.index).val());
    let formJson = {};
    let confirmStatus = rowData.confirm_status;
    formJson.confirm_status = confirmStatus;
    formJson.pred_data_time = rowData.pred_data_time;
    formJson.pred_enodeb_cell = rowData.pred_enodeb_cell;
    formJson.pred_start_time = rowData.pred_start_time;
    formJson.pred_end_time = rowData.pred_end_time;
    console.log(formJson);
    $("#confirmStatus").val(confirmStatus);
    if(!confirmStatus){//需要输入
        $("#saveBtn").removeClass('hide');
    }else {
        $("#saveBtn").addClass('hide');
    }
    //数据加载中...
    MaskUtil.mask("数据加载中...");
    $.post(
        basePath + "json/candidateNeighborList.json",
        formJson,
        function (result) {
            MaskUtil.unmask();
            nearTopList = result.data;
            if(result.success){
                $.each(nearTopList,function (i,v) {
                    addTopRow(v.near_priority,v,confirmStatus);
                })
            }else {
                alert(result.msg);
            }
        });

}

/**
 * 保存邻区TOP5信息
 */
function updateNearTopResult() {
    $.each(nearTopList,function (i,v) {
        let index = v.near_priority;
        nearTopList[i].near_cell_qoffset = $("#qoffset_"+index).find("input[name=near_cell_qoffset]").val();
        nearTopList[i].near_cell_individualoffset = $("#indoffset_"+index).find("input[name=near_cell_individualoffset]").val();
    })
    let submitData ={
        nearTopList:nearTopList
    };
    MaskUtil.mask("数据提交中...");
    $.ajax({
        url: basePath + 'highLoadCellPredResult/updateNearTopResult.do',
        type: 'post',
        data: JSON.stringify(submitData),
        contentType: 'application/json',
        success: function (res) {
            MaskUtil.unmask();
            console.log(res);
            res = JSON.parse(res);

            if (res.success) {
                parent.$("#needNearOffset").val('no');
                alert(res.msg,"",function () {
                    parent.closeWin();
                },{type:'success'});
                // let confirmStatus = $("#confirmStatus").val();
                // //替换输入框为span
                // $.each(nearTopList,function (i,v) {
                //     let nearPri = v.near_priority;
                //     $("#topRight_"+nearPri).html('');
                //     let topRightHtml = initTopRightData(nearPri,v,confirmStatus);
                //     $("#topRight_"+nearPri).append(topRightHtml);
                // })
            }else {
                alert(res.msg,"",null,{type:'warning'});
            }

        },
        error: function () {
            alert("保存异常!");
        }
    })
}