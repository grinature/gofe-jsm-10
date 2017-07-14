/*
UI Log 1.2j by Ari N. Karp, September 2008
using jQuery 1.2 and draggables js.

Blog: theuiguy.blogspot.com

You are free to use at will, just at least visit my blog and tell me
1. if you are using it and how (for curiosity sake)
2. some feedback on how you changed, enhanced, or minimized it. 

I believe in sharing code to the community, so if you feel the same, then
please share your changes with me to help make the UI a better place.

For help on this, please visit theuiguy.blogspot.com and I will get back asap.
*/
$(function(){
	$(window).resize(function (evt) {			
		log.positionLog();
	});
	$(window).scroll(function(evt) {		
		log.positionLog()				
	});
});

(function(){
	return log = {
		start : function(options){			
			/* 
				the following are settings that should be changed with caution			
			*/
			this.count = 1;
			this.minimumHeight = 80;
			this.panelButtons = []; // only a clearButton, but you can add more.
			this.shrinkHeight = 22;
			this.toggleDuration = 300;	
			/* 	
				the following are options with reasonable defaults
			*/			
			this.useResizer = options.resizer;
			this.backgroundColor = options.bgColor || "#FDFDFD";
			this.zebraStripe = options.zebraColor || "#E6EFFA";
			this.minimized = options.minimized;
			this.snap = options.snap;
			this.originalSnap = options.snap;
			this.logNumbers = options.logNumbers;
			this.opacity = options.opacity || 1;			
			this.outerPadding = options.outerPadding || 2; 
			this.innerPadding = options.innerPadding || 2;
			this.pS = options.pixelSnap || 100; 
			this.pT = options.pixelThreshhold || 50; 
			this.position = options.position || 2;	
			this.logOutputWidth = Math.max(100,options.width) || 570;
			this.originalOutputWidth = this.logOutputWidth;
			this.logOutputHeight = Math.max(this.minimumHeight,options.height) || 400;		
			this.originalOutputHeight = this.logOutputHeight;
			this.controlPanelBorder = options.controlPanelBorder || "1px solid #3B5A82"; // used but not set initially
			this.controlPanelBackground = options.controlPanelBackground || "url(logbg.gif) center"; // used but not set initially		
			/* 
				the following establish the log itself 
			*/
			this.logStructure = {
				initialize : function(){			
					$("<div id='logContainer' class='logContainer'></div>").appendTo("body");					
					$("#logContainer").mousedown(function(event){event.stopPropagation();});											
					$("<div id='controlPanel' class='controlPanel'></div>").appendTo("#logContainer");									
					$("#controlPanel").bind('mouseup',function(event){
						if(log.snap){
							var coords = {
								top : parseInt($("#logContainer").css("top")),
								left : parseInt($("#logContainer").css("left"))
							}
							if(coords.top < (log.pS + document.body.scrollTop) && coords.top < ((document.body.clientHeight + document.body.scrollTop) - log.pT) && coords.left > log.pT && coords.left < (document.body.clientWidth - log.pT)) log.positionLog(1); // top												
							if(coords.top > log.pT && coords.top > ((document.body.clientHeight + document.body.scrollTop - $("#logContainer").height()) - log.pS) && coords.left > log.pT && coords.left < (document.body.clientWidth - log.pT)) log.positionLog(2); // bottom
							if(coords.top > log.pT && coords.top < ((document.body.clientHeight + document.body.scrollTop) - log.pT) && coords.left < log.pS && coords.left < (document.body.clientWidth - log.pT)) log.positionLog(3); // left
							if(coords.top > log.pT && coords.top < ((document.body.clientHeight + document.body.scrollTop) - log.pT) && coords.left > log.pT && coords.left > (document.body.clientWidth - $("#logContainer").width() - log.pS)) log.positionLog(4); // right								
						}
					});				
					$("<div id='toggleDisplayButton' title='toggle the display of the log' class='controlButton hide'></div>").appendTo("#controlPanel");								
					$("#toggleDisplayButton").bind('mousedown',function(event){
						if(event) event.stopPropagation();
						if($(this).attr("hidden") === "false" || $(this).attr("hidden") === undefined){
							$(this).removeClass('controlButton hide').addClass('controlButton show');
							log.hideUiLog();
							$(this).attr("hidden","true");
						}else{
							$(this).removeClass('controlButton show')
							$(this).addClass('controlButton hide');
							log.showUiLog(true);
							$(this).attr("hidden","false");
						}				
					});						
					$("<div id='clearButton' title='clear log' class='controlButton clear'></div>").appendTo("#controlPanel");						
					$("#clearButton").bind('mousedown',function(event){												
						event.stopPropagation();
						log.clearUiLog();					
					});
					log.panelButtons.push('#clearButton'); 
					$("<div id='uiLog' class='uiLog'></div>").appendTo("#logContainer");
					$("#uiLog").mousedown(function(event){event.stopPropagation();});									
				}			
			};			
			this.logStructure.initialize();														
			$("#logContainer").draggable();									
			this.started = true;
			this.initLog();		
			window.setTimeout(function(){	
				log.setDimensions(!log.minimized);				
				if(log.minimized){				
					log.positionLog(log.position);
					$("#toggleDisplayButton").trigger("mousedown");	
				}else{					
					log.positionLog(log.position);	
				}					
			},15);	
			log._routines();		
		},
		setDimensions : function(show){		
			this.setControlPanel(true);	
			var controlWidth = $("#controlPanel").width();					
			$("#uiLog").css("padding-left",this.innerPadding+"px");							
			$("#uiLog").css("height",this.logOutputHeight + "px");	
			$("#uiLog").css("width",this.logOutputWidth - controlWidth)
			$("#uiLog").css("filter","alpha(opacity="+ (this.opacity * 100) +")"); 
			$("#uiLog").css("opacity",this.opacity);	
			if($("#uiLog").css("visibility") !== "visible") $("#uiLog").css("visibility","visible");						
			if($("#logContainer").css("visibility") !== "visible") $("#logContainer").css("visibility","visible");								
			this.setContainer();
			this.positionLog();				
			if(this.useResizer && $("#uiLog").attr("sized") !== "true"){	
				$("#uiLog").resizable({
					handles : "e, s, se",
					minHeight : log.originalOutputHeight,
					minWidth : log.originalOutputWidth,
					resize : function(){						
						log.logOutputWidth = $("#uiLog").width();
						log.logOutputHeight = $("#uiLog").height();						
						log.setContainer();
						log.setControlPanel(false);
					}
				})
				$("#uiLog").attr("sized","true");
			}				
		},
		setControlPanel : function(original){
			var oHeight = (jQuery.browser.msie) ? this.outerPadding : 0;
			$("#controlPanel").css("height",(original) ? this.logOutputHeight + "px" : $("#uiLog").height() + oHeight);
		},
		setContainer : function(){
			$("#logContainer").css("width",$("#uiLog").width() + $("#controlPanel").width() + this.outerPadding + this.innerPadding); 
			$("#logContainer").css("height",$("#uiLog").height());
		},	
		initLog : function(){
			this.updateLogClock();
			this.xDate = new Date();
			$("#uiLog").append(this.updateLogClock() + "<em>Log started</em>" + "<br>");			
		},
		clearUiLog : function(){
			this.count = 1;
			$("#uiLog").empty();
			this.initLog();
		},
		showUiLog : function(animate){			
			window.setTimeout(function(){
				$("#uiLog").css("overflow-y","auto");				
				$("#controlPanel").css("border",log.controlPanelBorder);
				$("#controlPanel").css("border-right","0px");
				$("#controlPanel").css("background",log.controlPanelBackground);
				log.setDimensions(false);			
				$.each(log.panelButtons, function(index, button){					
					$(button).css("display","block");
				});				
			},0);
		},	
		hideUiLog : function(){
			$.each(this.panelButtons, function(index, button){
				$(button).css("display","none");
			});			
			var startValue = (jQuery.browser.msie) ? 1 : 0;						
			$("#uiLog").css("width",startValue);
			$("#uiLog").css("visibility","hidden");
			$("#uiLog").css("overflow-x","hidden");
			$("#uiLog").css("padding-left",0);	
			$("#controlPanel").css("background",0);
			$("#controlPanel").css("border",0);
			$("#controlPanel").css("height",log.shrinkHeight);										
			$("#logContainer").css("height",log.shrinkHeight);			
			$("#logContainer").css("width",$("#uiLog").width());			
			window.setTimeout(function(){
				$("#logContainer").css("left",log.outerPadding);	
				$("#logContainer").css("top",((document.body.clientHeight - log.shrinkHeight) - log.outerPadding)); 
				if($("#logContainer").css("visibility") !== "visible") $("#logContainer").css("visibility","visible");			
				log.positionLog();
			},0);
		},
		positionLog : function(position){	
			this.position = (position === undefined) ? this.position : position;
			if($("#toggleDisplayButton").attr("hidden") === "true"){
				$("#logContainer").css("top",(((parseInt(document.body.clientHeight,10)) - ($("#controlPanel").height()) + document.body.scrollTop) - this.outerPadding));			
				return;
			}					
			if(!this.position){
				$("#logContainer").css("left",this.outerPadding);	
				$("#logContainer").css("top",((parseInt(document.body.clientHeight,10) / 2) - (($("#logContainer").height())/ 2)));
				return;
			}	
			try{
				switch(this.position){
					case "top": 
					case 1: 
						$("#logContainer").css("left",((parseInt(document.body.clientWidth,10) / 2) - (($("#logContainer").width())/ 2)));		
						$("#logContainer").css("top",(this.outerPadding + document.body.scrollTop));	
					break;	
					case "bottom": 
					case 2: 
						$("#logContainer").css("left",((parseInt(document.body.clientWidth,10) / 2) - (($("#logContainer").width())/ 2)));							
						$("#logContainer").css("top",(((document.body.clientHeight + document.body.scrollTop) - $("#uiLog").height()) - this.outerPadding));
					break;		
					case "left": 
					case 3: 
						$("#logContainer").css("left",this.outerPadding);							
						$("#logContainer").css("top",((parseInt(document.body.clientHeight,10) / 2) - (($("#uiLog").height())/ 2) + document.body.scrollTop));
					break;			
					case "right": 
					case 4:
						$("#logContainer").css("left",((document.body.clientWidth - $("#logContainer").width()) - this.outerPadding));													
						$("#logContainer").css("top",((parseInt(document.body.clientHeight,10) / 2) - (($("#uiLog").height())/ 2) + document.body.scrollTop));
					break;										
				}
			}catch(e){};
		},	
		updateLogClock : function(){	
			var tDate = new Date();				
			this.currentClock = tDate;
			return "[" + this._formatDate(tDate,"dd-MM-yy hh:mm:ss:iii") + "] : ";	
		},	
		out : function(m){
			log._out(m)//window.setTimeout(function(){log._out(m)},0); 
		},
		_out : function(m){
			if(this.started){
				this.logNumber = (this.logNumbers) ? this.count + " - " : "";
				this.bgColor = (this.count % 2 === 0) ? this.backgroundColor : this.zebraStripe;
				$("#uiLog").append("<div style='background-color:" + this.bgColor + "; width:100%'>" + this.logNumber + this.updateLogClock() + m + " <span class='log'>(" +  (this.currentClock - this.xDate) + ")</span> ms" + "</div>");
				this.xDate = new Date();
				this.count++;
			}
		},		
		_addZero : function(vNumber,millis){			
			if(millis){
				vNumber = (vNumber.toString().length === 2) ? "0" + vNumber : vNumber;
				vNumber = (vNumber.toString().length === 1) ? "00" + vNumber : vNumber;
				return vNumber
			}else{
				return ((vNumber < 10) ? 0 : "") + vNumber;
			}
		},	
		_formatDate : function(vDate, vFormat){ 
			var vDay = this._addZero(vDate.getDate());
			var vMonth = this._addZero(vDate.getMonth()+1);
			var vYearLong = this._addZero(vDate.getFullYear());
			var vYearShort = this._addZero(vDate.getFullYear().toString().substring(3,4));
			var vYear  = (vFormat.indexOf("yyyy")>-1?vYearLong:vYearShort); 
			var vHour = this._addZero(vDate.getHours());
			var vMinute	= this._addZero(vDate.getMinutes());
			var vSecond	= this._addZero(vDate.getSeconds());
			var vMillis	= this._addZero(vDate.getMilliseconds(),true);
			var vDateString	 = vFormat.replace(/dd/g, vDay).replace(/MM/g, vMonth).replace(/y{1,4}/g, vYear);
			vDateString	= vDateString.replace(/hh/g, vHour).replace(/mm/g, vMinute).replace(/ss/g, vSecond).replace(/iii/g, vMillis);
			return vDateString;
		},
		// useful only for demo...
		_routines : function(){
			this.suite1 = {
				iteration1 : function(){
					log.clearUiLog();
						for(i=0;i<50;i++){
							log.out("iteration: " + i + " <b>some very minor html output</b>")
						}
					log.out("Iteration 1 finished. (logged 50 entries.)")									
				},
				iteration2 : function(){
					log.clearUiLog();
						for(i=0;i<500;i++){
							var el = $("<div></div>").appendTo("body");								
							el.remove();
						}
					log.out("Iteration 2 finished. (Added and removed 500 empty divs.)")									
				}								
			}
			this.suite2 = {
				show1 : function(){
					log.clearUiLog();																											
					log.out("<a href='http://wwww.google.com' target=new>Google example (image)</a>")
					log.out("<img src='http://www.google.com/intl/en_ALL/images/logo.gif'>")
					log.out("Show 1 finished.")
				},
				show2 : function(){
					log.clearUiLog();																											
					log.out("<a href='http://wwww.google.com' target=new>Google example (in iframe)</a>")
					log.out("<iframe src='http://www.google.com' frameborder=0 width=" + $("#uiLog").clientWidth + " height=200></iframe>")
					log.out("Show 2 finished.")
				},
				show3 : function(){
					log.clearUiLog();
					log.out($("#main").html())
				}
			}	
		}
	}	
})();

