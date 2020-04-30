var timeData = [],yPredData = [],yActualData = [];//X轴的数据
var num=0;
let params = getUrlParams();
$(function () {
    let inputDate = parent.$("#dataDate").datebox('getValue');
    createXTimeData(inputDate);
    getNearTopChart();
});
function getNearTopChart() {
    let rowData = JSON.parse(parent.$('#rowData_'+params.index).val());
    let formJson = {};
    let confirmStatus = rowData.confirm_status;
    formJson.confirm_status = confirmStatus;
    formJson.pred_data_time = rowData.pred_data_time;
    formJson.pred_enodeb_cell = rowData.pred_enodeb_cell;
    formJson.pred_start_time = rowData.pred_start_time;
    formJson.pred_end_time = rowData.pred_end_time;
    console.log(formJson);
    //数据加载中...
    MaskUtil.mask("数据加载中...");
    $.post(
        basePath + "json/neighborHighLoad.json",
        formJson,
        function (result) {
            MaskUtil.unmask();
            let nearTopChart = result.data;
            if(result.success){
                $.each(nearTopChart,function (i,v) {
                    addTopChartRow(v.near_priority,v);
                })
            }else {
                alert(result.msg);
            }
        });
}
function initEcharts(echartId) {
    console.log("timeData:"+eval(timeData));
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
                let selDate = parent.$("#dataDate").datebox('getValue');
                if(firstParams.dataIndex>23){
                    selDate = new Date(selDate).getTime();
                    date = formatDate(selDate);
                }else{
                    selDate = new Date(selDate).getTime()-86400000;
                    date = formatDate(selDate);
                }

                if(firstParams){
                    let actHtml = `<span class="icon-actual">`+firstParams.seriesName+`：`+firstParams.data+`</span> `;//实际值图标
                    html = date+" "+firstParams.name+":00"+`<br>`+actHtml+`<br>`;
                }
                if(secParams){
                    let predHtml = `<span class="icon-pred">`+secParams.seriesName+`：`+secParams.data+`</span>  `;//预测值图标
                    html += predHtml+`<br>`;
                }
                return  html;
            }
        },
        legend: {
            top:0,//调整预测值/实际值与折线图的距离
            itemWidth: 30,
            itemHeight: 40,
            data: [{
                name:'预测值',
                icon:'image://img/predLine.svg'
            },
            {
                name:'实际值',
                // icon:'pie'
                icon:'image://img/actualLine.svg'
            }]
        },
        dataZoom: [{  //最底部拉条
            type: 'slider',
            xAxisIndex: [0],
            filterMode: 'filter'
        }],
        grid: {
            left: '3%',
            right: '5%',
            top:'20%',
            bottom: '25%',//调整与最底部拉条的距离
            height:'60%',
            containLabel: true
        },
        xAxis:{
            // type: 'time',
            type: 'category',
            boundaryGap: false,
            axisLabel: {
                interval:0,
                rotate:-25  //时间旋转
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
function addTopChartRow(index,rowData) {
    if(index===""||typeof (index) == "undefined"){
        num++;
    }else{
        num = index;
    }
    // 1. 邻区ID：43389-21，邻区名称：正佳广场室内RRU1
    let textInfo = num+`.邻区ID：`+rowData.near_cell+`,邻区名称：`+rowData.cell_name;
    let rowHtml = ` <div class="form_row" >
                        <div class="col_item" style="width: 100%;height: 20px">
                            `+textInfo+`                
                        </div>
                    </div>
                    <div class="form_row" id="heightRow_`+num+`">
                        <div class="col_item" style="width: 100%;height: 250px;border: 1px solid rgba(166, 166, 166, 1);">
                            <div id="echart_`+num+`" style="width: 100%;height:100%;padding-right: 10px"></div>
                        </div>
                    </div>
                   `;
    $("#heightRow").append(rowHtml);
    $.parser.parse($('#heightRow_'+num));

    //折线图初始化
    let tabIndex = params.tabIndex;
    if(tabIndex===1){//上行
        yPredData = rowData.pred_up_prb?rowData.pred_up_prb.split(","):"";
        yActualData = rowData.up_prb_userate?rowData.up_prb_userate.split(","):"";
    }else if(tabIndex===2){//下行
        yPredData = rowData.pred_dw_prb?rowData.pred_dw_prb.split(","):"";
        yActualData = rowData.dw_prb_userate?rowData.dw_prb_userate.split(","):"";
    }else {//最大用户数
        yPredData = rowData.pred_max_rrc?rowData.pred_max_rrc.split(","):"";
        yActualData = rowData.max_rrc_user?rowData.max_rrc_user.split(","):"";
    }

    initEcharts("echart_"+num);
    rowHtml = null;
}