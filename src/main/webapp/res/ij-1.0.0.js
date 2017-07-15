var ij = function(selector){
	return new ij.fn.init(selector);
};
ij.fn = ij.prototype = {
	"name":this.name,
	"version": "ij-1.0.0"/*this.version*/,
	"init":function(selector){this.selector=selector;return $(this.selector);},
	"constructor":ij,
	"show":function(){console.log(this.selector);}
};
ij.fn.init.prototype = ij.fn;

/*自动注入依赖 */
ij.ijRuntimeRequire = function(){
	var css = {
			linkTag : function(){
				var href = $("script[src*='"+ij.fn.version+"']").attr("src").replace(/.js/g,".css"),
					tag = '<link rel="stylesheet" href="'+ href +'" />';
				return tag;
			}(),
			init : function(){
				$("head").eq(0).append( $( css.linkTag ) );
				return css;
			}
		},
		viewport = {
			viweportTag : function(){
				var tag = '<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />';
				return tag;
			}(),
			init : function(){
				
				if( $("mate[name='viewport']").length <= 0 ){
					$("head").eq(0).prepend( $(viewport.viweportTag) );
				}
				return viewport;
			}
		},
		init = function(){
			var temp = {};
			temp.css = css.init();
			temp.viewport = viewport.init();
			return temp;
		};
		return init();
}();

/*行分页*/
ij.autoRowPage = function(d,c){
	var page = {
		p : { 
			url : null, 
			data : {ajax : "ajax", page : 1}, 
			model : null, 
			container : null,
			scrollLock : true,
			nomore : '<div class="ij-no-more">已到底，别扯啦 ╭∩╮（￣▽￣）╭∩╮ ...</div>'
		},
		
		init : function(){
			if(!d){
				console.log("%cundefined param d","color:red;font-size:12px");
				return false;
				d = {};
			};
			page.p.url = function(){
				return d.url ? d.url : location.href;
			}();
			page.p.model = function(){
				var doFn = function(o, rem){
					if( $(o).length <= 0 ){
						console.log("model is not exist!");
						return false;
					}
					var text = $(o).html().toString().replace(/img-url/g,"src");
					rem ? $(o).remove() : $(o).empty();
					return text;
				};
				return d.model ? doFn( $(d.model), true ) : doFn( $(".ij-page-ul"), false );
			}();
			page.p.container = function(){
				return d.container ? $(d.container) : $(".ij-page-ul");
			}();
			page.p.data = function(){
				page.p.data.page = 1;
				return d.data ? $.extend(true, page.p.data, d.data) : page.p.data;
			}();
			
			page.pageAjax();
			return page;
		},
		
		pageAjax : function(){
			var url = page.p.url,
				data = page.p.data;
			$.post(url,data,function(data,status){
				var Jdata = null;
				try{
					Jdata = JSON.parse(data);
				}catch(e){
					console.log("function pageAjax throw JSON parse Exception!");
					return false;
				}
				console.log("pageAjax 请求返回的 data:",Jdata);
				page.resultListData(Jdata);
			});

		},
		
		resultListData : function(listD){
			var temp = null,
				replaceFn = function( data ){
					$(data).each(function(index, item){
						
						if( item[0] != undefined && item[0] instanceof Array ){
							
							replaceFn( item );
							
						}else{
							
							temp = page.p.model;
							$(item).each(function(index, item){
								temp = temp.replace(eval("/{arg"+index+"}/g"), item );
							});
							temp = temp.replace(/page="0"/g, "page='"+page.p.data.page+"'");
							$(page.p.container).append( $(temp) );
							
						}
					});
				};
			replaceFn( listD );
			page.afterFn(listD);
		},
		
		afterFn : function(listD){
			if( listD.length <= 0 ){
				
				ij.ijAlert({text:"没有更多数据了!"});
				
				if( $(".ij-no-more").length <= 0 ){
					$(page.p.container).after( $(page.p.nomore) );
				}

				return false;
			}else{
				$(".ij-no-more").remove();
			};
			page.bindScroll();
		},
		
		bindScroll : function(){
			var triggerLI = $("li[page="+ page.p.data.page +"]"),
				triggerLI = $(triggerLI).eq( triggerLI.length - 2 ),
				pageScrollFn = function(){
					var rect = triggerLI[0].getBoundingClientRect().top;
					if( rect < window.innerHeight && page.p.scrollLock ){
						page.p.scrollLock = false;
						$(window).off({ "scroll" : addScrollFn });
						page.pageAjax();
					}
				},
				addScrollFn = function(){
					requestAnimationFrame(pageScrollFn);
				};	
			$(window).on({
				"scroll" : addScrollFn
			});
			page.p.scrollLock = true;
			page.p.data.page ++ ;
		},
		
		resteParam : function(d){
			$(page.p.container).empty();
			page.p.data.page = 1 ;
			$.extend(true, page.p.data, d);
			page.pageAjax();
		}
	};
	return page.init();
};

ij.top = function() {
	var mainText = '<div class="ij-top" style="display:none;">' +
		'<span><span></span></span>' +
		'</div>',
		obj = null,
		status = false,
		topScrollFn = function(){
			if( window.scrollY > window.innerHeight ){
				if( status ){
					return false;
				}
				obj = $(mainText);
				status = true;
				$(obj).off("click").on({
					"click" : function(){
						document.body.scrollTop = 0;
					}
				});
				$("body").append( $(obj).fadeIn(1000) );
			}else{
				$(obj).remove();
				status = false;
			}
		},
		requestAF = function(){
			requestAnimationFrame(topScrollFn);
		};
		$(window).on("scroll", requestAF);
}; 
/*弹框*/
ij.alert = function(d) {
	var mainText = '<div class="ij-prompt" style="display:none;">' +
		'<div class="ij-pro-tip">' +
		'<span class="tip-span">'+  function(){return d.text?d.text:"没有提示文字";}() +'</span>' +
		'</div>' +
		'</div>',
		obj = $(mainText),
		hidePro = function() {
			$(obj).fadeOut(200, function() {
				$(this).remove();
			});
		};
	$("body").append($(obj).fadeIn(0,function(){
		setTimeout(function(){
			hidePro();
			d.callback ? d.callback() : false;
		},2000);
	}));
	
};
/*询问框*/
ij.prompt = function(d) {
	var mainText = '<div class="ij-prompt" style="display:none;">' +
		'<div class="ij-pro-con">' +
		'<div class="ij-pro-top">提示框</div>' +
		'<div class="ij-pro-text">'+function(){return d.text?d.text:"没有提示文字";}()+'</div>' +
		'<div class="ij-pro-btn">' +
		'<span class="pro-sure">确定</span>' +
		'<span class="pro-cancel">取消</span>' +
		'</div>' +
		'</div>' +
		'</div>',
		obj = $(mainText),
		hidePro = function() {
			$(obj).fadeOut(0, function() {
				$(this).remove();
			});
		};
	$(obj).find(".pro-sure").on({
		"click": function() {
			hidePro();
			setTimeout(function(){
				d.callback ? d.callback() : false;
			},200)

		}
	});
	$(obj).find(".pro-cancel").on({
		"click": function() {
			hidePro();
		}
	});
	$("body").append($(obj).fadeIn(0));
};
ij.getCurrentTime = function(){
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
        + " " + (date.getHours()<10 ? "0"+date.getHours() : date.getHours())
        + seperator2 + (date.getMinutes() < 10 ? "0"+date.getMinutes() : date.getMinutes())
        + seperator2 + (date.getSeconds() < 10 ? "0" + date.getSeconds() :date.getSeconds());
    return currentdate;
};
/*询问框*/
ij.confirm = function(d) {
    var mainText = '<div class="ij-prompt" style="display:none;">' +
            '<div class="ij-pro-con">' +
            '<div class="ij-pro-top">' + d.text + '</div>' +
            '<div class="ij-pro-text"><input class="confirm-val"/></div>' +
            '<div class="ij-pro-btn">' +
            '<span class="pro-sure">确定</span>' +
            '<span class="pro-cancel">取消</span>' +
            '</div>' +
            '</div>' +
            '</div>',
        obj = $(mainText),
        hidePro = function() {
            $(obj).fadeOut(0, function() {
                $(this).remove();
            });
        };
    $(obj).find(".pro-sure").on({
        "click": function() {
        	var t = $(".confirm-val").val();
            hidePro();
            setTimeout(function(){
                d.callback ? d.callback( t ) : false;
            },200);
        }
    });
    $(obj).find(".pro-cancel").on({
        "click": function() {
            hidePro();
        }
    });
    $("body").append($(obj).fadeIn(0));
};
ij.ws = function(){
	var _ws = {},_o={};

    _o.send = $(".ws-send");
    _o.reconnect = $(".ws-reconnect");
    _o.container = $(".ws-container");
    _o.content = $(".ws-content");
    _o.count = 0;
    _o.wsUrl = function( url ){ return "ws://" + url; }( document.documentURI.split("//")[1].split("/")[0] );
    _o.msgModel = function(){
    	var model = $(_o.container).html().toString();
        $(_o.container).empty();
        return model;
	}();
    _o.message = {
    	from:$(_o.content).attr("from"),
		fromName:$(_o.content).attr("fromName"),
		to:"0",
		text:"",
		date: new Date()
    };
    _o.bindSend = function(){
    	var sendMessage = function(){
            if( _ws.readyState != 1 ){
            	_ws.close();
                _o.connect();
                setTimeout(function(){
                	console.log("reconnecting ...");
                    sendMessage();
                },1000);
            }else{
            	_o.message.text = _o.content.val();
            	_o.message.date = ij.getCurrentTime();
                _ws.send( JSON.stringify( _o.message ) );
                _o.content.val("");
            }
		}
    	_o.send.off("click").click(function(){
			sendMessage();
		});
        window.onkeypress = function(e){
        	if( e.keyCode == 13 && _o.content.val() != "")
            	_o.send.click();
			}
	};
	_o.init = function(){
        _ws.onerror = function(){
            // ij.prompt({text:"连接错误！"});
            console.log("连接错误 ...");
        };
        _ws.onopen = function(){
            // ij.alert({text: "连接成功！"});
            console.log("连接成功 ...");
            _o.count = 0;
        };
        _ws.onmessage = function(e){
            var msg = JSON.parse(e.data);
            var text =  $(_o.msgModel);
            if( _o.message.from == msg.from ){
                $(text).find(".user-logo").addClass("right");
                $(text).find(".msg-text").addClass("right");
			}
            $(text).find(".msg-time").text(msg.date);
            $(text).find(".user-logo").text(msg.fromName);
            $(text).find(".msg-text").text(msg.text);
            $(_o.container).append( text );
            $(".ws-container").find(".ws-message:last-child")[0].scrollIntoView();
        };
        _ws.onclose = function(){
            // ij.prompt({text:"已断开连接！"});
            console.log("已断开连接 ...");
            _o.connect();
        };
        window.onbeforeunload = function(){ _ws.close(); };
        _o.bindSend();
    };
    _o.connect = function(){
        if ('WebSocket' in window && _o.count < 5) {
            _o.count ++;
            _ws = new WebSocket( _o.wsUrl + "/websocket");
        } else {
            ij.alert('Not support websocket');
            return false;
        }
        _o.init();
    };
    return function(){ _o.connect();return {"_ws":_ws,"_o":_o}}();
};