//作用：弹出遮罩，提示加载中
var MaskUtil = (function(){
    var $mask,$maskMsg;
      
    var defMsg = '正在处理，请稍待。。。';  
      
    function init(){  
        if(!$mask){  
            $mask = $("<div class=\"datagrid-mask mymask\"></div>").appendTo("body").css("z-index","99998");
        }  
        if(!$maskMsg){  
            $maskMsg = $("<div class=\"datagrid-mask-msg mymask\">"+defMsg+"</div>")  
                .appendTo("body").css({'font-size':'12px','z-index':'99998'});
        }  
          
        $mask.css({width:"100%",height:$(document).height()});  
          
        var scrollTop = $(document.body).scrollTop();  
          
        $maskMsg.css({  
            left:( $(document.body).outerWidth(true) - 190 ) / 2  
            ,top:( ($(window).height() - 45) / 2 ) + scrollTop  
        });   
                  
    }  
      
    return {  
        mask:function(msg){  
            init();  
            $mask.show();  
            $maskMsg.html(msg||defMsg).show();  
        }  
        ,unmask:function(){  
        	//隐藏遮罩层之前，先判断是否存在遮罩层
        	if(undefined!=$mask){
                $mask.hide();  
                $maskMsg.hide();  
        	}
        }  
    }  
      
}());  