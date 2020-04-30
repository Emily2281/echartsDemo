/*
 * 离线地图城市坐标
 * 文本文件必须以UTF-8编码存储，建议用Notepad++编辑
 * 格式:城市名称 经度 纬度
 */
var offlinemap_cities = [
     ['北京', 116.427265, 39.918698]
    ,['上海', 121.472724, 31.239761]
    ,['武汉', 114.28398, 30.601327]
    ,['成都', 104.070606, 30.59138]
    ,['广州', 113.270404, 23.159763]
    ,['重庆', 106.595635, 29.619598]
    ,['珠海', 113.51667,22.30000]
    ,['深圳', 114.06667,22.61667]
    ,['惠州', 114.22,23.05]
    ,['江门', 113.04,22.35]
    ,['佛山', 113.06,23.02]
    ,['河源', 114.41,23.43]
    ,['清远', 113.01,23.42]
    ,['汕头', 116.41,23.22]
    ,['湛江', 110.24,21.11]
    ,['肇庆', 112.27,23.03]
    ,['中山', 113.22,22.31]
    ,['东莞', 113.45,23.02]
    ,['潮州', 116.38,23.40]
    ,['揭阳', 116.21,22.32]
    ,['茂名', 110.53,21.40]
    ,['梅州', 116.07,24.19]
    ,['汕尾', 115.21,22.47]
    ,['韶关', 113.37,24.48]
    ,['阳江', 111.58,21.50]
    ,['云浮', 112.02,22.57]
    ,['昆明', 102.42,25.04]
];


/* 城市数据映射
 *
 */
var offlinemap_cityobj = new Object();
for(var i=0; i<offlinemap_cities.length; i++){
    offlinemap_cityobj[ offlinemap_cities[i][0] ] = [offlinemap_cities[i][1], offlinemap_cities[i][2]];
}

/*
 * 获得城市坐标
 * 城市的坐标必须先存储在map_city.js
 */
var i_getCityPoint = function(a) {
	if( a in offlinemap_cityobj ){
		var pt = new BMap.Point(offlinemap_cityobj[a][0], offlinemap_cityobj[a][1]);
		return pt;
	}
	alert('map_city.js中未定义城市坐标:'+ a);
	return false;    
};

/*
 * 设置地图中心为某个城市
 * 城市的坐标必须先存储在map_city.js
 */
var i_setCurrentCity = function(map, a) {
    var pt = i_getCityPoint(a);
	if( pt ){
		map.centerAndZoom( pt,15 );
		return pt;
	}
	return false;
};
