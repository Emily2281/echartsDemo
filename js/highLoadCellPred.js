var timeData = [],//x轴时间
    tmpTimeData = [],
    yPredData = [],//预测值
    yActualData = [];//实际值
var yPredTime = [],yActualTime = [];
var num=0;
$(function () {
    //初始化日期为今天
    $("#dataDate").datebox('setValue', "2020-04-24");//dateFormatter(new Date())
    let inputDate = $("#dataDate").datebox('getValue');
    createXTimeData(inputDate);
    //查询
    $('#queryBtn').on('click',function () {
        createXTimeData(inputDate);
        getHighLoadInfo();
    })
    //导出
    $('#exprotBtn').on('click',function () {
        exportHighinfo();
    })
    getHighLoadInfo();
    //城市列表  区域 HighLoad.queryDistrictList city
    initComboboxSelect('city','HighLoad.queryCityList',{queryParam:{},emptyOption:true,editable:false});
    $("#city").combobox({
        onSelect:function (record) {
            //区域列表    city
            if(record.value){
                initComboboxSelect('area','HighLoad.queryDistrictList',{queryParam:{city:record.text},emptyOption:true,editable:false});
            }
        }
    })

});

/**
 * 初始化展示折线图
 * @param echartId
 */
function initEcharts(echartId,index,tabIndex) {
    console.log("timeData:"+eval(timeData));
    yActualData = buildYChartData(yActualTime,yActualData);
    console.log("yActualDataNew---:"+eval(yActualData));
    yPredData = buildYChartData(yPredTime,yPredData);
    console.log("yPredDataNew---:"+eval(yPredData));

    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById(echartId));
    let option = {
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                // 当我们想要自定义提示框内容时，可以先将鼠标悬浮的数据打印出来，然后根据需求提取出来即可
                let firstParams = params[0];
                let secParams = params[1];
                let html = "";
                let date;
                let selDate = $("#dataDate").datebox('getValue');
                if(firstParams.dataIndex>23){
                    selDate = new Date(selDate).getTime();
                    date = formatDate(selDate);
                }else{
                    selDate = new Date(selDate).getTime()-86400000;
                    date = formatDate(selDate);
                }
                if(firstParams&&firstParams.data!=undefined){
                    let actHtml = `<span class="icon-pred">`+firstParams.seriesName+`：`+firstParams.data+`</span> `;//实际值图标
                    html = date+" "+firstParams.name+":00"+`<br>`+actHtml+`<br>`;
                }
                if(secParams&&secParams.data!=undefined){
                    let predHtml = `<span class="icon-actual">`+secParams.seriesName+`：`+secParams.data+`</span>  `;//预测值图标
                    html += predHtml+`<br>`;
                }
                return  html;
            }
        },
        legend: {
            itemWidth: 30,
            itemHeight: 40,
            data: [{
                name:'预测值',
                icon:'image://img/predLine.svg'
            },
            {
                name:'实际值',
                icon:'image://img/actualLine.svg'
            }]
        },
        toolbox: { //查看邻区负荷按钮
            feature: {
                myTool: {
                    show: true,
                    title: '查看邻区负荷                 ',
                    icon: 'image://img/actualValue.svg',
                    onclick: function (){
                        //弹出邻区负荷界面
                        openWin('neighborHighLoad.html?index='+index+'&tabIndex='+tabIndex,"邻区负荷列表", {max: true});
                    }
                }
            }
        },
        dataZoom: [{//最底部拉条
            type: 'slider',
            xAxisIndex: [0],
            filterMode: 'filter'
        }],
        grid: {
            left: '3%',
            right: '5%',
            top:'20%',
            height:'58%',
            containLabel: true
        },
        xAxis:{
            type: 'category',
            boundaryGap: false,
            axisLabel: {
                interval:0,
                rotate:-40  //时间旋转
            },
            data: timeData
        },
        yAxis: {},
        series: [
            {
                name: '预测值',
                type: 'line',
                itemStyle : {
                    normal : {
                        lineStyle:{
                            color:'rgba(63, 130, 221, 1)'
                        }
                    }
                },
                data: yPredData
            },
            {
                name: '实际值',
                type: 'line',
                itemStyle : {
                    normal : {
                        lineStyle:{
                            color:'rgba(108, 203, 132, 1)'
                        }
                    }
                },
                data: yActualData
            }
        ]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
}

/**
 * 动态展示每一行数据
 * @param index
 * @param rowData
 */
function addHeightRow(index,rowData) {
    if(index===""||typeof (index) == "undefined"){
        num++;
    }else{
        num = index;
    }
    let heightLeftHtml = initHighLeftData(num,rowData);
    let rowHtml = `<form id="highForm_`+num+`"><div class="form_row" id="heightRow_`+num+`">
                    <input type="hidden" name="rowData" id="rowData_`+num+`">
                    <div id="heightLeft_`+num+`" class="col_item heightLeft">
                        `+heightLeftHtml+`
                    </div>
                    <div class="col_item heightRight">
                        <div id="heightTab_`+num+`" class="easyui-tabs" style="height: 100%">
                            <!-- =================== RRC最大链接用户数 =================== -->
                            <div title="RRC最大链接用户数">
                                <div id="rrcUser_`+num+`" style="width: 100%;height:100%;padding-right: 10px"></div>
                            </div>
                            <!-- =================== 上行PRB利用率 =================== -->
                            <div title="上行PRB利用率">
                                <div id="upPrbUse_`+num+`" style="width: 100%;height:100%;padding-right: 10px"></div>
                            </div>
                            <!-- =================== 下行PRB利用率 =================== -->
                            <div title="下行PRB利用率">
                                <div id="downPrbUse_`+num+`" style="width: 100%;height:100%;padding-right: 10px"></div>
                            </div>
                        </div>
                    </div>
                   </div></form>
                   <hr>`;
    $("#heightRow").append(rowHtml);
    $.parser.parse($('#heightRow_'+num));
    $("#rowData_"+num).val(JSON.stringify(rowData));
    rowHtml = null;

    addTabEvents(num,rowData);
    initEcharts("rrcUser_"+num,num,'0');
}

/**
 * 每一行左边的数据加载
 * @param num
 * @param rowData
 * @return {string}
 */
function initHighLeftData(num,rowData) {
    let status = rowData.confirm_status+"";
    let statusHtml,QoffsetHtml,IndividualHtml;
    if(status!="null"&&status!=""){
        let qOffset = rowData.enodeb_cell_qoffset;
        let individualOffset = rowData.enodeb_cell_individualoffset;
        QoffsetHtml = `<span>`+qOffset+`</span>`;
        IndividualHtml = `<span>`+individualOffset+`</span>`;
        let statusText = '已接受';
        if(status=="0"){
            statusText = `<font color="red">已拒绝</font>`;
        }
        statusHtml = `<span>`+statusText+`</span>`;
    }else {
        QoffsetHtml = `<span id="qoffset_`+num+`"><input name="enodeb_cell_qoffset" class="easyui-textbox sm_width" value="2"></span>`;
        IndividualHtml =`<span id="indoffset_`+num+`"><input name="enodeb_cell_individualoffset" class="easyui-textbox sm_width" value="2"></span>`;
        statusHtml = `<!--接受-->
                    <a href="javascript:;" data-i18n-text="aisee.public.btn.save"
                        onclick="updateStatus(`+num+`,'1')"
                       class="easyui-linkbutton btn_sm primary">接受</a>
                    <!--拒绝-->
                    <a href="javascript:;" data-i18n-text="aisee.public.btn.save"
                        onclick="updateStatus(`+num+`,'0')"
                       class="easyui-linkbutton btn_sm refused">拒绝</a>
                    `;
    }
    let cellId = rowData.pred_enodeb_cell;//拥塞小区ID
    let cellName = rowData.cell_name;//拥塞小区名称
    let longAndLat = rowData.longitude+","+rowData.latitude;//经纬度
    let startTime = rowData.pred_start_time?rowData.pred_start_time.substring(11):"无";
    let endTime = rowData.pred_end_time?rowData.pred_end_time.substring(11):"无";
    let startEndTime = startTime+"-"+endTime;//调整时间范围
    let heightLeftHtml = `<div style="margin: 5px">
                            <div style="vertical-align: middle;float: left;width: 50px;height: 90px">
                                <img src="img/wifi.svg" >
                            </div>
                            <div class="form_row titleImg">
                                <span>拥塞小区ID：</span><span>`+cellId+`</span>
                                <span style="float: right">
                                    <img src="img/candidate.svg" onclick="showCandidate(`+num+`)">
                                    <img src="img/script.svg" onclick="showScript(`+num+`)">
                                </span>
                            </div>
                            <div class="form_row">
                                <span>拥塞小区名称：</span><span>`+cellName+`</span>
                            </div>
                            <div class="form_row">
                                <span>经纬度：</span><span>`+longAndLat+`</span>
                            </div>
                            <div class="form_row">
                                <span>调整时间范围：</span><span id="startEndTime_`+num+`">`+startEndTime+`</span>
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
                            <div class="form_row" style="float: right;">`+statusHtml+`</div>
                        </div>`;
    return heightLeftHtml;
}
/**
 * 为每一行的tab添加切换事件，初始化折线图
 * @param index
 */
function addTabEvents(index,rowData) {
    //折线图初始化
    yPredData = rowData.pred_max_rrc?rowData.pred_max_rrc.split(","):"";
    yActualData = rowData.max_rrc_user?rowData.max_rrc_user.split(","):"";
    yPredTime = rowData.pred_time?rowData.pred_time.split(","):"";
    yActualTime = rowData.data_time?rowData.data_time.split(","):"";

    $('#heightTab_'+index).tabs({
        onSelect:function(title,tabIndex){
            if(tabIndex==1){
                yPredData = rowData.pred_dw_prb?rowData.pred_up_prb.split(","):"";
                yActualData = rowData.up_prb_userate?rowData.up_prb_userate.split(","):"";
                initEcharts("upPrbUse_"+index,index,tabIndex);//上行PRB利用率
            }else if(tabIndex==2){
                yPredData = rowData.pred_dw_prb?rowData.pred_dw_prb.split(","):"";
                yActualData = rowData.dw_prb_userate?rowData.dw_prb_userate.split(","):"";
                initEcharts("downPrbUse_"+index,index,tabIndex);//下行PRB利用率
            }else {//RRC最大链接用户数
                yPredData = rowData.pred_max_rrc?rowData.pred_max_rrc.split(","):"";
                yActualData = rowData.max_rrc_user?rowData.max_rrc_user.split(","):"";
                initEcharts("rrcUser_"+index,index,tabIndex);
            }
        }
    });
}

/**
 * 弹出候选邻区列表top5
 * @param index
 */
function showCandidate(index) {
    let title = `<span class="icon-candidate">&nbsp;&nbsp;&nbsp;候选邻区列表TOP5</span>`;
    openWin('candidateNeighborList.html?index='+index,title, {height: '650px',width:'800px'});
}

/**
 * 弹出调整脚本界面
 * @param index
 */
function showScript(index) {
    openWin('scriptNearList.html?index='+index,"调整脚本", {height: '700px',width:'1100px'});
}

/**
 * 从后台获取数据加载折线图信息
 */
function getHighLoadInfo() {
    $("#heightRow").html('');
    let params = $('#highLoadForm').toJSON();
    //数据加载中...
    MaskUtil.mask("数据加载中...");
    $.post(
        basePath + "json/highLoadCellPred.json",
        params,
        function (result) {
            MaskUtil.unmask();
            var data = result.data;
            if(result.success){
                initRowDatas(data);
            }else {
                alert(result.msg);
            }
        });

}

/**
 * 根据分页初始化加载每一行数据
 * @param data
 */
function initRowDatas(data) {
    //easyui分页控件
    let pageSize = 2;
    $('#paginationDiv').pagination({
        total:data.length,
        pageSize: pageSize,//每页显示的记录条数，默认为2
        layout:['prev','links','next'],
        links:5,
        onSelectPage:function(pageNumber, pageSize){
            //加载当前页的数据
            $("#heightRow").html('');
            let splitData = pageSplit(data,pageNumber,pageSize);
            $.each(splitData,function (i,v) {
                addHeightRow(i,v);
            })
        }
    });
    //初始化加载第一页的数据
    let splitData = pageSplit(data,1,pageSize);
    $.each(splitData,function (i,v) {
        addHeightRow(i,v);
    })
}

/**
 * 接受/拒绝的提交事件
 * @param index
 * @param confirmStatus
 */
function updateStatus(index,confirmStatus) {
    let statusText = confirmStatus=='1'?"接受":"拒绝";
    confirm("确定要"+statusText+"？<br><font size='3' color='red'>注意：一旦确认状态后，小区的调整参数不能再修改！</font>",null,function (r) {
        if(r){
            let formJson = $("#highForm_"+index).toJSON();
            let rowData = JSON.parse(formJson.rowData);
            formJson.confirm_status = confirmStatus;
            formJson.pred_data_time = rowData.pred_data_time;
            formJson.pred_enodeb_cell = rowData.pred_enodeb_cell;
            formJson.pred_start_time = rowData.pred_start_time;
            formJson.pred_end_time = rowData.pred_end_time;
            let needNearOffset = $("#needNearOffset").val();
            formJson.near_cell_qoffset = needNearOffset=='no'||rowData.near_cell_qoffset?'':'2';
            formJson.near_cell_individualoffset = needNearOffset=='no'||rowData.near_cell_individualoffset?'':'2';
            console.log(formJson);
            MaskUtil.mask("数据提交中...");
            $.post(
                basePath + "highLoadCellPredResult/saveHighResult.do",
                formJson,
                function (result) {
                    MaskUtil.unmask();
                    result = JSON.parse(result);
                    if(result.success){
                        rowData.confirm_status = confirmStatus;
                        rowData.enodeb_cell_qoffset = formJson.enodeb_cell_qoffset;
                        rowData.enodeb_cell_individualoffset = formJson.enodeb_cell_individualoffset;
                        $("#heightLeft_"+index).html('');
                        let heightLeftHtml = initHighLeftData(index,rowData);
                        $("#heightLeft_"+index).append(heightLeftHtml)
                        $("#rowData_"+index).val(JSON.stringify(rowData));
                    }else {
                        alert(result.msg);
                    }
                });
        }
    });
}
//高危小区信息导出
function exportHighinfo() {
   var sqlId = 'HighLoadCellPredResult.export';
   $('#highLoadForm').form('submit', {
       url: basePath + "/highLoadCellPredResult/export.do",
       onSubmit: function (param) {
           param.sqlId = sqlId;
           param.ENames = "cell_name,confirm_status,overlap_area," +
               "pred_data_time,pred_enodeb_cell,pred_start_time,pred_end_time," +
               "enodeb_cell_qoffset,enodeb_cell_individualoffset,near_cell,near_priority," +
               "near_cell_qoffset,near_cell_individualoffset";
           param.CNames = "预测拥塞小区名称,确认状态,重叠面积,执行预测时间,预测拥塞小区ID," +
               "预测发生拥塞的开始时间,预测发生拥塞的结束时间,拥塞小区调整参数CellQoffset," +
               "拥塞小区调整参数CellIndividualOffset,候选邻区ID,候选邻区优先级," +
               "候选邻区调整参数CellQoffset,候选邻区调整参数CellIndividualOffset";
           param.Suffix = '.csv';
           param.exportName = '拥塞小区信息';
       }
   });
}
