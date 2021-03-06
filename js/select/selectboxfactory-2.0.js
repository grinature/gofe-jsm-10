/*
Select Box Factory 2.0 for jQuery by Ari N. Karp, September 2008

 * Copyright (c) 2008 Ari N Karp (theuiguy.blogspot.com)
 * licensed under the MIT license

Note: This is not a jQuery plugin. It is a tool that uses the jQuery 
framework that users can drop in without any wiring. 
If you set resize, it expects there to be a plugin. 

User guide: see theuiguy.blogspot.com

*/

var sFac = function(options){	

	/* nonsettable defaults */
	this.initialized = false;
	this.external = false;
	this.options = options || {};
	this.selectedNodes = [];
	this.uiChoices = []; 	
	this.hBuffer = 0;		
	this.selectionCount = 0;	
	this.approxPadding = ($.browser.msie) ? 10 : 8;
	this.vAlign = ($.browser.msie) ? "54%" : "29%";
	if($.browser.safari) this.vAlign = "35%";

	/* helper tools */
	this.aux = {
		isNum : function(val){return (typeof val === "number") ? true : false;},
		contains : function(arr,item){arr.toString().indexOf(item);},
		esc : function(str){return str.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');},	
		test : function(regex, str){return new RegExp(regex).test(str);},
		include : function(arr,item){ if(arr.toString().indexOf(item) === -1) arr.push(item);},
		includeById : function(arr,item){
			if(arr.toString().indexOf(item[0]) === -1){
				arr.push(item);
				return true;
			}
		},
		erase : function(item,arr){for(var i = arr.length; i--; i) if(arr[i] === item) arr.splice(i, 1);},	
		eraseById : function(item,arr){for(var i = arr.length; i--; i) if(arr[i].attr("id") === item.attr("id")) arr.splice(i, 1);},	
		eraseByNum : function(item,arr){for(var i = arr.length; i--; i) if(arr[i][0] === item) arr.splice(i, 1);},	
		get : function(o){return document.getElementById(o)},
		swapClass : function(obj,c,p){
			if(p) $(obj).css('background-color',''); 
			$(obj).removeClass();
			$(obj).addClass(c);
		}
	}

	/* settable options : core structure */
	this.id = this.options.id || "";		
	this.type = this.options.type;
	this.toggleStyle = this.options.toggleStyle || "none"; 		
	this.container = $("#"+this.options.container) || document.body; //this.aux.get(this.options.container) 

	/* settable options : data elements */
	this.coreImages = this.options.coreImages || ["clear.gif","eraser.gif","sortasc.gif","sortdesc.gif"];
	this.selectionImagePath = this.options.selectionImagePath || false;
	this.urlTarget = this.options.urlTarget || "new";
	this.choices = this.options.choices || [];

	/* settable options : features */
	this.sort = this.options.sort;			
	this.sortDirection = this.options.sortDirection || 'ascending';	
	this.sortImage = (this.sortDirection === "descending") ? this.coreImages[3] : this.coreImages[2];	
	this.useInfo = this.options.info;
	this.useEraser = this.options.eraser;
	this.useToggle = ((this.toggleStyle !== undefined && this.toggleStyle !== "none" && this.toggleStyle !== null) || this.type==="dropdown") ? true : false;
	this.sift = this.options.sift; 	
	this.useStates = this.options.useStates;	
	if(this.useStates){
		this.states = [];
		this.stateButtons = [];
		this.stateColors = this.options.stateColors;
		this.showStateButtons = this.options.showStateButtons;
	}	
	this.resize = this.options.resizable;
	
	/* settable options : look and feel */
	this.disabled = this.options.disabled;	
	this.classSet = this.options.classes || ["uiSelectBox","uiSelectBoxToggle","uiSelectBoxChoice","uiSelectBoxStack"];
	this.width = this.options.width; // if not specified, it will class width, then container width in that order.
	this.absolute = this.options.isAbsolute;
	this.absPosition = this.options.absolutePosition || {top:0,left:0,z:0};
	this.typeSearch = (this.options.typeSearch === "false" || this.options.typeSearch === false) ? false : true;

	/* settable options : textual */
	this.toggleLabel = this.options.toggleLabel || "<b><font style='font-size:11px'>Select One: </font></b>";		
	this.toggleLabelChosen = this.options.introMessage || ""; // the more intro message you have, the wider you'll need to make your dropdown.
	this.siftTitle = this.options.siftTitle || "Use AND (+) plus, or OR (|) pipe to extend search. Use (!) not to flip the search."; 
	this.useCount = this.options.count;
	
	/* setup: focus : helps with spreadsheet selections, since browsers think your selecting text. */	
	this._setupFocus = function(){
		if($.browser.safari){
			this.focusBox = $("<input type='checkbox' class='focusBox'>").insertAfter(this.infoSelections);	
		}else{
			this.focusBox = $("<input type='text' class='focusBox'>").insertAfter(this.infoSelections);	
		}
		this.focusBox.focus(function(sFacRef) {
			return function(e){
				$(this).blur();
			}
		}(this));	
	};
			
	/* sort: setup image for flipping sort */	
	this._setupFlipSort = function(){
		this.sortImageIcon = $("<img"
		 	+ " class=sortFlip"
			+ " id=sortFlipButton" + this.id
			+ " src=" + this.sortImage
			+ " title= " + this.sortDirection
			+ " >").insertBefore(this.infoSelections);		
		this.sortImageIcon.click(function(sFacRef){
			return function(e){						
				sFacRef.sortDirection = (sFacRef.sortDirection === "descending") ? "ascending" : "descending";
				var newSrc = (sFacRef.sortDirection === "descending") ? sFacRef.coreImages[3] : sFacRef.coreImages[2];
				sFacRef.sortImageIcon.attr("src",newSrc);	
				sFacRef.sortImageIcon.attr("title",sFacRef.sortDirection);
				sFacRef.uiChoices = [];
				sFacRef.dInner.empty();
				if(sFacRef.sort) sFacRef._sortChoices(sFacRef.choices, sFacRef.sortDirection);		
				sFacRef._setupChoices(true);
				if(sFacRef.useInfo) sFacRef.aux.get('infoSelections' + sFacRef.dropdown.id).innerHTML = "0 selected";
				if(sFacRef.useCount) sFacRef.countUpdate.html(sFacRef.choices.length);
				sFacRef.dropdownStack.scrollTop = 0;											
			}
		}(this));							
	};

	/* choices: insert : puts choice into stack */	
	this._insertChoice = function(choice){		
		this.aux.includeById(this.uiChoices,$(choice));
		choice.appendTo(this.dInner);
	};	
				
	/* choices: create : creates the jquery div if making them with this.choices */	
	this._createChoice = function(choice,index){	
		return $("<div"
			 + " class=" + this.classSet[2]
			 + " id=" + choice[0] + this.id
			 + " count=" + index
			 + " title=" + choice[1]			
			 + " defaultSelection=" + choice[3]
			 + " select=false"
			 + " state=" + choice[4]			
			 + ">" + choice[2] + "</div>");	
	};

	/* choices: produce choice type: helper for images */
	this.produceChoiceType = function(text,choice){
		choice = this.aux.get(choice);
		var newPath = (this.selectionImagePath === "\/") ? "" : this.selectionImagePath;		
		if(text.toString().substring(0,4).toLowerCase()==="img-"){
			$(choice).empty();
			$("<img src=" + newPath + text.substring(4,text.length) + ">").appendTo(choice);
		}		
		if(text.toString().substring(0,4).toLowerCase()==="url-"){
			$(choice).empty();
			var urlPath = text.substring(4,text.length);
			$("<a href=http://" + urlPath + " target=new class='link'>" + choice.getAttribute("title") + "</a>").appendTo(choice);
		}	
		return choice;
	};
	
	/* choices: binds attributes, events to choice */	
	this._setupChoice = function(c){		
		c.addClass(' '+this.classSet[2]+'Normal');	
		if(this.useStates) c.css("background-color",this.stateColors[parseInt(c.attr("state"))]);								
		c.bind('mouseover', function(sFacRef) {
			return function(e){
				if($(this).attr("select") === "false") sFacRef.aux.swapClass(this,sFacRef.classSet[2] + ' '+sFacRef.classSet[2]+'Active',true);	
			};
		}(this));								
		if(this.typeSearch){
			c.bind('graze', function(sFacRef) {
				return function(e){
					if($(this).attr("select") === "false") sFacRef.aux.swapClass(this,sFacRef.classSet[2] + ' '+sFacRef.classSet[2]+'Graze');
				};
			}(this));
		}
		c.bind('mouseout', function(sFacRef) {
			return function(e){
				if($(this).attr("select") === "false"){
					sFacRef.aux.swapClass(this,sFacRef.classSet[2] + ' '+sFacRef.classSet[2],true);	
					if(sFacRef.useStates) $(this).css('background-color',sFacRef.stateColors[parseInt($(this).attr("state"))]);				
				}
			}
		}(this));
		c.click(function(sFacRef) {
			return function(e){		
				// mac users: metaKey (command key) is trapped under ctrlKey in jQuery. no work needed.
				ctl = (e.ctrlKey !== undefined) ? e.ctrlKey : true;
				sft = (e.shiftKey !== undefined) ? e.shiftKey : false;
				sFacRef._setupSelectBoxItemEvents(this,sft,ctl,e);
			}
		}(this));
		return c;	
	};
	
	/*
		choice: add many: programmatic or manual addition of a choice to the list.
		test by adding a structure as you did when setting up the first time.
		This is exclusively for adding externally.
	*/	
	this._addChoices = function(choices){
		this.external = true;
		var uniqueAdditions = 0;
		for(x=0;x<choices.length;x++){
			if(this.aux.includeById(this.choices,choices[x])) uniqueAdditions++;
		}
		if(uniqueAdditions > 0){
			this.dInner.empty();
			this.uiChoices = [];
			if(this.sort) this._sortChoices(this.choices, this.sortDirection);		
			this._setupChoices();
			if(this.useCount) this.countUpdate.html(this.choices.length);
			this.selectionCount = 0;
			this.dOuter.trigger("choose");
			$('#siftBox'+this.id).attr("value","");
		}
		this.external = false;
	};

	/* choices: setupChoice: iteration used at load. */	
	this._setupChoices = function(){				
		$.each(this.choices, function(sFacRef){
			return function(index, choice){		
				if(!sFacRef.aux.get(choice[0]+sFacRef.id)){					
					sFacRef._insertChoice(sFacRef._setupChoice(sFacRef._createChoice(choice,index)));
					sFacRef.aux.get(choice[0]+sFacRef.id).setAttribute("data",choice[5].concat(choice[0]).concat(choice[2]).concat(choice[4])); // must do it this way, since $function doesn't accept whitespace.									
					if(!sFacRef.selectionImagePath) sFacRef.aux.get(choice[0]+sFacRef.id).setAttribute("displayName",choice[2]);
					if(sFacRef.selectionImagePath || sFacRef.urlTarget) sFacRef.produceChoiceType(choice[2],choice[0]+sFacRef.id);					
					//$(choice).html(sFacRef.setTruncation(choice[2]));
				}
			};
		}(this));							
	};	

	/*	
	choices: setTruncation: We don't have a width to work with, since the dropdown isn't 
	visible yet. This is for long, unbroken strings. Normal textual strings with spaces
	wrap nicely. Its yours to turn on if you want to set a dropdown width on your dropdown (uiSelectBox) class.
			 
	this.setTruncation = function(text){
		if(this.dOuter.width() === 0) return text;
		var allowable = this.uiToggle.width() / 13; // or based on the M in your font family, but you may want a toggle arrow.
		if(text.length > allowable){
			return text.substring(0,allowable) + "...";
		}else{
			return text;
		}			
	};
	*/
	
	/*
		choices: remove: programmatic or manual addition of a choice to the list. 
		send as array elements.
	*/	
	this._removeChoices = function(choices){
		for(x=0;x<choices.length;x++){			
			var choice = typeof(choices[x] === "string") ? this.aux.get(choices[x]+this.id) :  this.aux.get($(choices[x]).attr("id")) 
			if(choice){	
				if($(choice).attr("select") === "true") $(choice).trigger("click");		
				this.aux.eraseById($(choice),this.uiChoices);			
				this.aux.eraseByNum(this._findTrueNodeText($(choice)[0]),this.choices);
				this.dropdownStack.removeChild(choice);						
			}
		}
		if(this.useCount) this.countUpdate.html(this.choices.length);
	};	
	
	
	/* 
		choices: sort: generalized to take args. 
		note: its better to sort an array in the beginning then
			to sort dom nodes once rendered. This makes adding elements
			later a bit harder since you have to find where they belong.	
			
		this does not yet allow reasonable sorting of alphanumeric, dates, or randomizing.
		If you combine numbers and strings, it assumes strings.
		
		If you must use commas or financial formatting, put it in the displayname, not the id.
		
	*/	
	this._sortChoices = function(arr, dir){
		var isNum = this.aux.isNum(arr[0][0]);
		if(isNum){			
			for(var i=0;i<arr.length;i++){
				for(var j=i+1;j<arr.length;j++){	
					if(arr[i][0] > arr[j][0]){					
						tempValue = arr[j];	
						arr[j] = arr[i];
						arr[i] = tempValue;
					}
				}
			}					
		}else{
			arr.sort(); //strings and images.
		}						
		if(dir == "descending") arr.reverse();						
	};
		
	/* choices: setupOthers : iter, gives each choice a list every other choice. */		
	this._setupOthers = function(node){	
		if(this.aux.get($(node).attr("id"))["others"] === undefined){
			this.aux.get($(node).attr("id"))["others"] = $.grep(this.uiChoices, function(item, i){
				return $(item).attr("id") !== $(node).attr("id");
			});
		}
	},
	
	/* choices: _locateAndCreate : find divs, absorb them and enter framework for display. */
	this._locateAndCreate = function(node){		
		$.each(this.container.children(), function(sFacRef){
			return function(index, c){		
				var data = []; 
				var iter = $(c).attr("data").split(",");
				for(i=0;i<iter.length;i++) data.push(iter[i]);
				sFacRef.choices.push([$(c).attr("id")+sFacRef.id,$(c).attr("title"),$(c).text(),$(c).attr("defaultSelection"),$(c).attr("state"),data.join(",")]);
			};
		}(this));	
		this.container.empty();			
	},

	/* initialize: begin setting up box */	
	this._initialize = function(type){	
		this.dOuter = $("<div id=" + this.id + " class=" + this.classSet[0] + "></div>");	
		if(this.width) this.dOuter.css("width",this.width);
		this.dInner = $("<div class=" + this.classSet[3] + "></div>");
		if(this.choices.length === 0) this._locateAndCreate();			
		this.dOuter.appendTo(this.container);
		this.dInner.appendTo(this.dOuter);
		if(this.sort) this._sortChoices(this.choices, this.sortDirection)		
		this._setupChoices();
		/* settable options : limits */
		this.maxChoices = this.options.maxSize || this.choices.length;		
	    /* setup: core dropdown and stack */											
		this.dropdown = this.aux.get(this.id);	
		this.dropdownStack = this.dropdown.firstChild;							
		if(this.useToggle || this.sift) this._setupToggle();		
		this._setupInfoBar();			
		if(this.sift && this.useStates && this.dropdownStack.childNodes.length > 0) this._setupStateButtons(this.uiChoices);						
		if(this.sift && this.type !== "dropdown") this._setupSiftToolEvents();								
		this._setupSelectBoxEvents();				 	
		this._displaySelectBox();	
		if(this.resize && this.type !== "dropdown") this._setupResize();	
		this._finalize();					
	};
	
	/* setup: _setupInfoBar: information element: use this to get selections and counts. info must be there for focus element, even if empty. */	
	this._setupInfoBar = function(){
		this.infoBar = $("<div id=divUpdate" + this.id + " class='infoBar'></div>").insertAfter(this.dOuter);	
		this.infoBar.css("width",this.dOuter.width())
		if(this.useInfo){
			this.infoSelections = $("<div id=infoSelections" + this.id + " class='selectUpdate'>0 selected</div>").appendTo(this.infoBar);	
		}else{
			this.infoSelections = $("<div class='selectUpdate'></div>").appendTo(this.infoBar);	
		}
		this.infoSelections.css("vertical-align","15%");
		if(this.useCount){
			this.countLabel = $("<div class='selectUpdate'>&nbsp;(<span id=total"+ this.id +">" + 0 + "</span> total)</div>").appendTo(this.infoBar);
			this.countUpdate = $($("#total"+ this.id));
			this.countUpdate.html(this.choices.length);		
			this.countLabel.css("vertical-align","15%");
		}				
		if(this.sort) this._setupFlipSort();	
		this._setupFocus();		
	};
	
	/* setup: use resize plugin. */	
	this._setupResize = function(){			
		if($.browser.msie && this.dOuter.css("position") !== "absolute") return; 
		// sorry, plugin doesnt work for ie in some cases unless absolute. 
		// Will try to fix in next version if its an SBF issue.
		try{
			this.dOuter.resizable({
				handles : "e, w, s, se, sw",
				minHeight : this.dropdownStack.offsetHeight,
				minWidth : this.aux.get("uiSelectBoxToggle" + this.id).offsetWidth
			})
			this.dOuter.bind('resize',function(sFacRef){
				return function(e){							
					sFacRef._displaySelectBox();	
					if(sFacRef.uiToggle) sFacRef.uiToggle.css("width",parseInt($(this).width())+sFacRef.approxPadding); // 8 is added with adding resize.					
					if(sFacRef.absolute) sFacRef._positionInfobar();				
				}
			}(this));					
		}catch(e){/* just in case you don't have the plugin */};
	};
	
	/* setup: create state buttons, if sifting with state */	
	this._setupStateButtons = function(obj){		
		$.each(obj, function(sFacRef){
			return function(index, o){sFacRef.aux.include(sFacRef.states,parseInt($(o).attr("state")))};
		}(this));
		if(this.showStateButtons){			
			$.each(this.states, function(sFacRef){
				return function(index, state){ 		
					var sElement = $("<div id=state" + index + " class='statesHeaderItem unPushedHeaderItem'>&nbsp;&nbsp;&nbsp;</div>").appendTo(sFacRef.statesHeader);				
					sFacRef.stateButtons.push(sElement);
					sFacRef.siftInput.css("width",(sFacRef.siftInput.width() - sFacRef.aux.get(sElement.attr("id")).offsetWidth)); // ie needs this, can't use .width() with outset.				
					sFacRef.statesHeader.css("width",(sFacRef.statesHeader.width() + sFacRef.aux.get(sElement.attr("id")).offsetWidth));	// ie needs this, can't use .width() with outset.
					sElement.css("background-color",sFacRef.stateColors[index]);		
				};
			}(this));			
			$.each(this.stateButtons, function(sFacRef){
				return function(index, stateButton){ 								
					sFacRef.aux.get($(stateButton).attr("id"))["others"] = $.grep(sFacRef.stateButtons, function(item, i){
						return $(item).attr("id") !== $(stateButton).attr("id")				
					});									
					$(stateButton).click(function(e){												
						sFacRef.currentStateButtonInFocus = $(stateButton);
						if($(this).attr("select") === "false" || $(this).attr("select") === undefined){
							$('#siftBox'+sFacRef.id).attr("value",index);
							sFacRef.aux.swapClass(this,"statesHeaderItem pushedHeaderItem");
							$(this).attr("select","false");
						}else{
							$('#siftBox'+sFacRef.id).attr("value","");						
							sFacRef.aux.swapClass(this,"statesHeaderItem unPushedHeaderItem");
							$(this).attr("select","true");
						}
						$.each(sFacRef.aux.get($(stateButton).attr("id"))["others"], function(index, other){		
							sFacRef.aux.swapClass(other,"statesHeaderItem unPushedHeaderItem");
						});
						if(e) e.stopPropagation();	
						if(e) e.preventDefault();	
						sFacRef._captureKeys();
					});				
				}
			}(this));
		}		
	};
	
	/* setup: toggle bar, sift box, clear icon, state buttons */	
	this._setupToggle = function(){	
		this.uiToggle = $("<div"
			+ " id=uiSelectBoxToggle" + this.id
			+ " clicked=0"
			+ " toggleCount=0"
			+ " class=" + this.classSet[1] 
			+ " ></div>").insertBefore(this.dOuter);	
		this.clearIconContainer = $("<span style='display:inline'></span>").appendTo(this.uiToggle);
		this.clearImage = (this.useEraser) ? this.coreImages[1] : this.coreImages[0];
		this.clearImageWidth = (this.useEraser) ? 30 : 6; //for ie6 and safari.
		this.clearIcon = $("<img"
		 	+ " src=" + this.clearImage
			+ " id=clearButton" + this.id
			+ " width=" + this.clearImageWidth
			+ " height=" + 18
			+ " >").appendTo(this.clearIconContainer);	
		this.header = $("<div id=toggleHeader"+ this.id + " class=toggleText></div>").appendTo(this.uiToggle);		
		this.clearIcon.click(function(sFacRef) {
			return function(e){
				if(sFacRef.currentStateButtonInFocus){ 
					sFacRef.aux.swapClass(sFacRef.currentStateButtonInFocus,"statesHeaderItem unPushedHeaderItem");
					$(sFacRef.currentStateButtonInFocus).attr("select","true");
				}
				$.each(sFacRef.uiChoices, function(index, c){ 				
					if($(c).hasClass(sFacRef.classSet[2] + ' '+ sFacRef.classSet[2]+'Selected')){ 
						sFacRef.aux.swapClass(c,sFacRef.classSet[2] + ' '+sFacRef.classSet[2]); 
						if(sFacRef.useStates) $(c).css("background-color",sFacRef.stateColors[parseInt($(c).attr("state"))]); 
						$(c).attr("select","false"); 				
					}										
				});	
				sFacRef.selectionCount = 0
				if(sFacRef.useInfo) sFacRef.aux.get('infoSelections' + sFacRef.dropdown.id).innerHTML = "0 selected";
				if(sFacRef.type === "dropdown") sFacRef.uiToggle.children("div").html("<b><font style='font-size:11px'>"+sFacRef.toggleLabel+"</font></b>");
				if(e) e.stopPropagation();	
				if(e) e.preventDefault();		
			};
		}(this));				
		if(this.sift){						
			this.siftInput = $("<input type='text' class='siftBox' id='siftBox" + this.id + "'>").appendTo(this.header);
			this.siftInput.attr("title",this.siftTitle); 
			this.siftInput.click(function(e){
				if(e) e.stopPropagation();	
				if(e) e.preventDefault();		
			});
			this.siftInput.css("width",this.siftInput.width() - this.clearIcon.width());
			this.aux.swapClass(this.uiToggle,this.classSet[1]+'Sift');
		}else{
			this.header.html(this.toggleLabel);
		}	
		if(this.useStates) this.statesHeader = $("<div class='statesHeader'></div>").appendTo(this.header);  
		this.toggle = this.aux.get($(this.uiToggle).attr("id"));
		if(this.useToggle && !this.sift){					
			this.uiToggle.click(function(sFacRef){
				return function(e){														
					if(sFacRef.dInner.css("display") === "none") sFacRef.dInner.css("display","block");		
					var toggleSpeed = ($.browser.msie) ? 150 : 230;
					sFacRef.dOuter.slideToggle(toggleSpeed);			
					if(sFacRef.absolute){
						sFacRef.infoBar.fadeOut("fast");
						window.setTimeout(function(){					
							sFacRef._positionInfobar();
						},(toggleSpeed+50));	
					}															
				}
			}(this));			
		}
		if($.browser.msie){
			this.clearIcon.css("vertical-align","0%"); 
			if(this.sift){ this.header.css("vertical-align","20%") }else{ this.header.css("vertical-align","40%"); }
		}else{		
			this.header.css("vertical-align",this.vAlign);
		}
		this.uiToggle.css("width",parseInt(this.dOuter.width())+this.approxPadding);	
	};

	/* setup directionals: not yet implemented. 
	this._setupDirectionals = function(code){		
		switch(code){
			case 40: // arrow down 
			case 38: // arrow up
			case 34: // page down
			case 33: // page up
			case 35: // end, should use ctrl.
			case 36: // home, should use ctrl.				
			break;					
		}
	return;
	};
	*/	
	
	/* setup: the select box events. */	
	this._setupSelectBoxEvents = function(){		
		if(this.typeSearch){
			this.dOuter.attr('tabIndex', '-1'); // allows key focus to work in ff;		
			this.dOuter.mouseover(function(e){
				this.focus();
			});		
			this.dOuter.keydown(function(sFacRef){			
				return function(e){
					// sFacRef._setupDirectionals(e.keyCode);Yours to turn on if you want to provide the code.				
					e.stopPropagation();
					e.preventDefault();						
					var instanceOf = false;
					$.each(sFacRef.uiChoices, function(index, c){
						$(c).trigger("mouseout");
						if(String.fromCharCode(e.keyCode).toLowerCase() === $(c).attr("id").toLowerCase().charAt(0) && instanceOf === false){
							instanceOf = true;
							if(sFacRef.typeSearch) $(c).trigger("graze");	
							var moveTo = sFacRef.aux.get($(c).attr("id")).offsetTop - parseInt($(c).height())
							sFacRef.dropdownStack.scrollTop = (moveTo > 20) ? moveTo : 0;
						}				
					});
				};
			}(this));
		}
		this.dOuter.bind('disable', function(sFacRef){
			return function(e){
				$(this).attr("disable","true");				
				sFacRef.aux.swapClass(this,sFacRef.classSet[0]+'Disabled');
				if(sFacRef.useToggle) sFacRef.aux.swapClass(sFacRef.uiToggle,sFacRef.classSet[1]+'Disabled');
				$.each(sFacRef.uiChoices, function(index, c){
					$(c).unbind();
					$(c).attr("disable","false");
					sFacRef.aux.swapClass(c,sFacRef.classSet[2] + ' '+sFacRef.classSet[2]+'Disabled');
				});
			};
		}(this));
		this.dOuter.bind('enable', function(sFacRef){
			return function(e){
				$(this).attr("disable","false");
				sFacRef.aux.swapClass(this,sFacRef.classSet[0]);				
				if(sFacRef.useToggle && !sFacRef.sift) sFacRef.aux.swapClass(sFacRef.uiToggle,sFacRef.classSet[1]);			
				$.each(sFacRef.uiChoices, function(index, c){			
					sFacRef.aux.swapClass(c,sFacRef.classSet[2] + ' '+sFacRef.classSet[2]+'Normal');									
				});				
			};
		}(this));	
		this.dOuter.bind('choose', function(sFacRef){
			return function(e){
				$.each(sFacRef.uiChoices, function(index, c){			
					if($(c).attr("defaultSelection") === "true") $(c).trigger('click'); 						
				});				
			};
		}(this));				
	};
	
	/* setup: the spreadsheet style selection mechanism, with ctrl + shift */	
	this._setupSelectBoxItemEvents = function(node,shift,ctrl,e){
		this._setupOthers(node);
		this.clearSelection = true;		
		this.highlightNode = $(node);		
		if($(node).attr("select") === "true" && !ctrl){				
			this._resetSelectBoxItem(node);														
		}else{
			if(!(shift) && this.sourceNode === undefined){				
				this._setSelectBoxItem(node,false);
			}else{
				if(shift && this.sourceNode !== undefined && this.type === "selectmultiple"){ 								
					this._shiftSelectBoxItem(node);
				}else{
					if(ctrl && this.sourceNode !== undefined && this.type === "selectmultiple"){						
						this._controlSelectBoxItem(node);
					}else{
						if(this.sourceNode !== undefined){
							this._setSelectBoxItem(node,true);
						}
					}
				}			
			}
		}
		if(!(ctrl) && !(shift)){						
			(function(sFacRef){
				return function(e){
					sFacRef.aux.get($(node).attr("id"))["lastselected"] = $.grep(sFacRef.aux.get($(node).attr("id"))["others"], function(item, i){
						return $(item).hasClass(sFacRef.classSet[2] + ' '+sFacRef.classSet[2]+'Selected');
					});
				}
			}(this));					
		}		
		if(this.type === "dropdown" && !this.sift){
			if(this.initialized && !this.external) this.uiToggle.trigger('click');
			var trueNodeText = this._findTrueNodeText(node);
			var displayText = ($(node).children().length > 0) ? trueNodeText : $(node).text();
			var allowable = parseInt((this.uiToggle.width() - this.clearIcon.width())) / 13; // or based on the M in your font family, but you may want a toggle arrow.
			if(displayText.length > allowable) displayText = displayText.substring(0,allowable) + "...";
			var printId = (this.toggleLabelChosen === "") ? "<b><font style='font-size:11px'>"+displayText+"</font></b>" : displayText;																		
			this.uiToggle.children("div").html(this.toggleLabelChosen + printId);
			this.uiToggle.attr("title",trueNodeText);
		}
		if(this.clearSelection) this.focusBox.focus();
	};
	
	this._findTrueNodeText = function(node){		
		return $(node).attr("id").substring(0,$(node).attr("id").length-this.id.length);// this is for images and urls.
	};
	
	/* helper: when user or code clicks fresh after using shift key, or when data loads from a response. */	
	this._resetSelectBoxItem = function(node){
		this.sourceNode = $(node);
		$(node).attr("select","true");
		this.selectedNodes = [];
		this.selectedNodes.push(node); 
		if(this.type === "selectmultiple"){						
			$.each(this.aux.get($(node).attr("id"))["others"], function(sFacRef){
				return function(index, n){	
					if($(n).attr("select") === "true"){				
						$(n).attr("select","false");
						sFacRef.aux.swapClass(n,sFacRef.classSet[2] + ' '+sFacRef.classSet[2]);
						if(sFacRef.useStates) $(n).css("background-color",sFacRef.stateColors[parseInt(n.attr("state"))]);		
						sFacRef.selectionCount = 1;				
						if(sFacRef.useInfo) sFacRef.aux.get('infoSelections' + sFacRef.dropdown.id).innerHTML = "1 selected";
					}
				};
			}(this));																			
		}
	};
	
	/* helper: when user or code first clicks without special keys */	
	this._setSelectBoxItem = function(node,isSrcNodeDefined){
		this.sourceNode = $(node);						
		this.aux.swapClass(node,this.classSet[2] + ' '+this.classSet[2]+'Selected',true);
		$(node).attr("select","true");
		this.clearSelection = false;
		this.selectedNodes = [];
		if(this.useInfo) $('infoSelections' + this.dropdown.id).innerHTML = ++this.selectionCount + " selected";				
		if(isSrcNodeDefined){				
			$.each(this.aux.get($(node).attr("id"))["others"], function(sFacRef){
				return function(index, n){	
					if($(n).attr("select") === "true"){				
						$(n).attr("select","false");
						sFacRef.aux.swapClass(n,sFacRef.classSet[2] + ' '+sFacRef.classSet[2]);
						if(sFacRef.useStates) $(n).css("background-color",sFacRef.stateColors[parseInt(n.attr("state"))]);
						sFacRef.selectionCount = 1;
						if(sFacRef.useInfo) sFacRef.aux.get('infoSelections' + sFacRef.dropdown.id).innerHTML = "1 selected";
					}
				};
			}(this));
		}else{
			this.selectedNodes.push(node);
		}
		if(this.useInfo) this.aux.get('infoSelections' + this.dropdown.id).innerHTML = "1 selected";
	};

	/* helper: when user or code clicks when using ctrl key */	
	this._controlSelectBoxItem = function(node){		
		if($(node).attr("select") === "true"){
			$(node).attr("select","false");
			this.aux.swapClass(node,this.classSet[2] + ' '+this.classSet[2]);
			if(this.useStates) $(node).css("background-color",this.stateColors[parseInt($(node).attr("state"))]);	
			this.aux.erase(node,this.selectedNodes);
			if(this.useInfo) this.aux.get('infoSelections' + this.dropdown.id).innerHTML = --this.selectionCount + " selected";
		}else{
			$(node).attr("select","true");
			this.selectedNodes.push(node);
			this.aux.swapClass(node,this.classSet[2] + ' '+this.classSet[2]+'Selected',true);
			if(this.useInfo) this.aux.get('infoSelections' + this.dropdown.id).innerHTML = ++this.selectionCount + " selected";
		}	
	};
	
	/* helper: when user or code clicks when using shift key */	
	this._shiftSelectBoxItem = function(node){
		if(this.useInfo) this.selectionCount = 0;
		this.selectedNodes = [];
		this._rangeSelections(); 								
		$.each(this.selectedNodes, function(sFacRef){
			return function(index, n){	
				$(n).attr("select","true");
				sFacRef.aux.swapClass(n,sFacRef.classSet[2] + ' '+sFacRef.classSet[2]+'Selected',true);
				if(sFacRef.useInfo) sFacRef.aux.get('infoSelections' + sFacRef.dropdown.id).innerHTML = ++sFacRef.selectionCount + " selected";
			};
		}(this));						
	};

	/* helper: range function for spreadsheet style selection mechanism */	
	this._rangeSelections = function(){
		var x = 0;
		var directionLeft;
		var directionRight;
		var startingPoint = parseInt(this.sourceNode.attr("count"));
		var endPoint = parseInt(this.highlightNode.attr("count"));
		var difference = endPoint - startingPoint;
		if(difference.toString().indexOf("-") != -1){ 
			directionLeft =  parseInt(endPoint,10);
			directionRight = parseInt(startingPoint,10);
		}else{
			directionLeft = parseInt(startingPoint,10);
			directionRight = parseInt(endPoint,10);
		}			
		while(directionLeft <= directionRight){
			for(i=0;i<this.dropdownStack.childNodes.length;i++){
				if(parseInt(this.dropdownStack.childNodes[i].getAttribute("count")) === directionLeft) var tResult = this.dropdownStack.childNodes[i];
			}
			this.selectedNodes[x] = tResult;		
			directionLeft++;
			x++;
		}
	};

	/* setup: events for sifting tool, if enabled. */	
	this._setupSiftToolEvents = function(){
		var stateHeaderWidth = (this.useStates) ? this.statesHeader.width() : 0;
		var headCalc = (this.uiToggle.width() - (this.clearIconContainer.width() + 4 + stateHeaderWidth)); // taking 4 away for looks.
		this.aux.get(this.header.attr("id")).firstChild.style.width = Math.max(headCalc,50) + "px"; 		
		this.header.keyup(function (sFacRef) {
			return function(e){
				sFacRef._captureKeys();				
			};		
		}(this));		
		this.clearIcon.click(function (sFacRef) {	
			return function(e){
	    		sFacRef.aux.get(sFacRef.header.attr("id")).firstChild.value = "";
	    		sFacRef._captureKeys();
			}
		}(this));	
		this.cArray = []; 
	};

	/* sift: initialization and sift time-reduction algorithm (cArray) */	
	this._captureKeys = function(){	    
		$.each(this.uiChoices, function(sFacRef){
			return function(index, obj){	
				if(sFacRef.testFailAttribute(obj,'siftBox'+sFacRef.id)){
					if(sFacRef.aux.contains(sFacRef.cArray,$(obj).attr("id"))){
						return false;
					}else{
						sFacRef.cArray[sFacRef.cArray.length] = $(obj).attr("id");
					}
				}else{
					if(sFacRef.aux.contains(sFacRef.cArray,$(obj).attr("id"))){
						sFacRef.aux.erase($(obj).attr("id"), sFacRef.cArray);
						$(obj).css("display","block");
					}
				}
			};
		}(this));			
    	this.tM = null;
		this.isAnd = -1;
		this.isOr = -1;
		this.isNot = -1
		this.firstStyle = "";
		this.secondStyle = "";
		this.returnNeg = false;
		this.returnPos = true;
		this.cArray = [];
	};
	
	/*
		sift: testing algorithm at the row level 
		must be either AND, or OR, can't mix the two.
	*/	
	this.testFailAttribute = function(obj,box){
		box = this.aux.get(box);
	    if(!this.tM){
			 this.firstStyle = "block";
			 this.secondStyle = "none";
			 this.returnNeg = false;
			 this.returnPos = true;
			 this.isNot = box.value.indexOf("!");
	         this.isAnd = box.value.indexOf("+");
	         this.isOr = box.value.indexOf("|"); 
			 if(this.isOr === -1) this.tM = box.value.toLowerCase().split(/\+/g);
			 if(this.isAnd === -1) this.tM = box.value.toLowerCase().split(/\|/g);
	         if(this.isOr !== -1 && this.isAnd !== -1) return;
	    };
	    var objFlag = 0;
		$(obj).attr("doShowObj",objFlag);				
		$.each(this.tM, function(sFacRef){
			return function(index, m){	
		       index = index+1;
		       m = sFacRef.aux.esc(m);
		       if(!sFacRef.testFailMatch(obj,m)){		        	
				   $(obj).attr("doShowObj",parseInt($(obj).attr("doShowObj"))+1);
		       }else{
		            if(sFacRef.isOr !== -1){
		                 if(index === 1 && parseInt($(obj).attr("doShowObj")) > 0) $(obj).attr("doShowObj",parseInt($(obj).attr("doShowObj"))-1);
		            }else{
		                 if(parseInt($(obj).attr("doShowObj")) > 0) parseInt($(obj).attr("doShowObj"),parseInt($(obj).attr("doShowObj"))-1);
		            };
		       };				
			};
		}(this));							
	  	if(this.isNot !== -1){
	   		this.firstStyle = "none";
			this.secondStyle = "block";
			this.returnPos = false;
			this.returnNeg = true;
		};
		if(this.isOr === -1){
			if(parseInt($(obj).attr("doShowObj")) === this.tM.length){
				$(obj).css("display", this.firstStyle);
				return this.returnNeg;		
			}else{
				$(obj).css("display",this.secondStyle);	
				return this.returnPos;	
			};
		};
		if(this.isOr !== -1){
			if(parseInt($(obj).attr("doShowObj")) > 0){
				$(obj).css("display",this.firstStyle);
				return this.returnNeg;		
			}else{
				$(obj).css("display",this.secondStyle);	
				return this.returnPos;	
			};			
		};	
	};
	
	/* 
		sift: testing algorithm at the attribute level 
		note: you can add as many string attributes as you want to array items to enhance sifting.
	*/	
	this.testFailMatch = function(obj,testMatch){
		var patternFailsMatch = [];
		testMatch = testMatch.replace("!","");
		var arr = $(obj).attr("data");			
			$.each([arr].join(",").split(","), function(sFacRef){ // ie can't handle treating arrays as strings, so the join-split is for ie.
				return function(index, c){	
					if(!sFacRef.aux.test(testMatch,$.trim(c.toLowerCase()))) patternFailsMatch.push(1);
				};
			}(this));	
			if(patternFailsMatch.length === [arr].join(",").split(",").length){
				return true;
			}else{
				return false; 		    
			};
	};

	/* 
		display: main display logic 		
		note: maxHeight of dropdown determined both by maxSize and the height on your container class, if set.
	*/
	this._displaySelectBox = function(){
		this.dOuter.css("display","block");
		this.dInner.css("display","block");	
		if(this.uiChoices.length === 0) return;
		this.actualHeightOfSelectBoxChoice = this.dropdownStack.childNodes[0].offsetHeight; // css() doesnt work here.
		this.knownHeightOfContainer = this.container.height();		
		if(this.maxChoices > 0){			
			this.actualCountOfChoices = this.uiChoices.length;					
			this.heightOfMaxColumns = (this.actualHeightOfSelectBoxChoice * this.maxChoices);		
			this.heightOfActualColumns = (this.actualHeightOfSelectBoxChoice * this.actualCountOfChoices);						
			this.infoHeight = (this.useInfo) ? parseInt(this.infoBar.height()) : 0; 										
			this.toggleHeight = (this.useToggle || this.sift) ? parseInt(this.uiToggle.css("height")) : 0;			
			this.availableHeightForSelectBox =  this.knownHeightOfContainer - (this.infoHeight + this.toggleHeight);
			this.dInner.css("height",this.availableHeightForSelectBox);		
			if(this.heightOfActualColumns === this.heightOfMaxColumns) this.dInner.css("height",this.heightOfActualColumns);	
			if(this.heightOfActualColumns > this.heightOfMaxColumns || this.knownHeightOfContainer < this.heightOfMaxColumns){
				this.dInner.css("height",this.heightOfMaxColumns);	
			};
			if(this.resize) this.dInner.css("height",this.dOuter.height());
			this.dInner.css("overflow-y","auto");	
			this.dInner.css("overflow-x","hidden");	
		};					
		if(this.absolute){
			// set the zIndex
			this.container.css("position","absolute");
			this.dOuter.css("position","absolute");
			this.dOuter.css("z-index",this.absPosition.z);
			this.uiToggle.css("position","absolute");
			this.uiToggle.css("z-index",this.absPosition.z);
			// how high is the toggle? 
			var tHeight = this.aux.get("uiSelectBoxToggle" + this.id).offsetHeight;			
			// set the top 
			this.uiToggle.css("top",this.absPosition.top);
			this.uiToggle.css("left",this.absPosition.left);
			this.dOuter.css("left",this.absPosition.left);
			this.dOuter.css("top",parseInt(this.uiToggle.css("top")) + tHeight);					
		}		
	};
	
	this._positionInfobar = function(){		
		this.infoBar.css("position","absolute");
		this.infoBar.css("z-index",this.absPosition.z);
		this.infoBar.css("top",this.absPosition.top + this.dropdown.offsetHeight + this.aux.get("uiSelectBoxToggle" + this.id).offsetHeight);
		this.infoBar.css("left",this.absPosition.left);
		this.infoBar.fadeIn("slow");
	};
	
	/* finalize: finish setting up dropdowns */	
	this._finalize = function(){
		if(this.disabled){				
			this.dOuter.trigger('disable');
			this.uiToggle.unbind();
		};		
		this.dOuter.trigger("choose");
		if(this.toggleStyle === "closed") this.dOuter.css("display","none");	
		this.initialized = true;
		if(this.absolute) this._positionInfobar();	
	};	

	this._initialize(this.type);	
	
	return this;
}	
