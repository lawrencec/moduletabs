YAHOO.namespace('YAHOO.NT');

/**
 * @fileoverview Documentation for the TabsModule object
 * @author Lawrence Carvalho lawrence@nodetraveller.com
 * @version 0.3
 */




/**
 * Construct a new TabsModule object
 * @class This is the basic ModuleTab class. A ModuleTab is essentially a manager
 * of {@link YAHOO.NT.Tab} objects. It implements the Yahoo <a href="http://developer.yahoo.com/ypatterns/pattern.php?pattern=TabsModule">TabsModule</a> 
 * and the <a href="http://developer.yahoo.com/ypatterns/pattern.php?pattern=spotlight">Spotlight</a> design patterns.<br>
 *  
 * @constructor
 * @param {string} sId The id of the container elem
 * @param {object} oConfig A value object = <br>
 {<br>
	bDoHilite	: true,<br>
	oHiliteArgs : {<br>
		from:"A2BCCE",<br>
		to:"ffffff",<br>
		duration:2,<br>
		bTransparent:true,<br>
		fEase:YAHOO.util.Easing.easeOut<br>
	}<br>
	fHilite	: fHilite //defaults to default hiliter<br>
}<br>
 * 
 * @return {object} A reference to the ModuleTab object
 */
 

YAHOO.NT.TabsModule = function(sId,oConfig	) {
	this.elContainer=null
	this.bDoHilite=false;
	this.bDoFadeOut=false;
	this.oHiliteArgs=null;
	this.oActiveTab=null;
	this.bFirstRun=true;
	this.aTabs=[];
	this.aEvents=[];
	this.oConfig=null;
	if (sId) {
		this.init(sId,oConfig);	
	}
};
YAHOO.NT.TabsModule.prototype =  {

	 init : function(sId,oConfig) {
			
			this.elContainer = YAHOO.util.Dom.get(sId);
		

	   	if(this.elContainer) {
		   	this.oConfig = oConfig;
				for (var sItem in oConfig) {
					if (this[sItem] !== oConfig[sItem]) {
						this[sItem] = oConfig[sItem];
					}		
				}
				
				this.aEvents['TabActivated'] = new YAHOO.util.CustomEvent('onTabActivated',this);
		   	this.aEvents['TabDeactivated'] = new YAHOO.util.CustomEvent('onTabDeactivated',this);
		   	this.aEvents['TabAdded'] = new YAHOO.util.CustomEvent('onTabAdded',this);
				this.aEvents['TabRemoved'] = new YAHOO.util.CustomEvent('onTabRemoved',this);
				var aTriggers = this.elContainer.getElementsByTagName('li');
				var elUl = this.elContainer.getElementsByTagName('ul')[0];
		    
				for(var i=0,oTrgr;oTrgr = aTriggers[i];i++) {	    
					if (oTrgr.parentNode==elUl) {				
			   		oTrgr.id = this.elContainer.id+'-item'+(this.aTabs.length+1);
						this.addTab(oTrgr);
			   	}
		    }
		    
				aTriggers = aPanes = sShowCSSClass = null;
		    this.activateTab((this.oActiveTab!=null) ? this.oActiveTab : this.aTabs[0]);		   
		    YAHOO.util.Event.addListener(this.elContainer,'click',this.selectTab,this,true)
		    YAHOO.util.Dom.addClass(elUl,YAHOO.NT.TabsModule.JS_IS_ACTIVE);
		    YAHOO.NT.TabsModuleManager.register(this,this.sGroup);
	   	}
	},
	addTab :function(elTab) {
		var oConfig = this.oConfig;
		oConfig.elTab = elTab;
   	var oTab = new YAHOO.NT.Tab(oConfig)
   	this.aTabs.push(oTab);
    
		if ((this.oActiveTab==null) && (oTab.getPane())) {  	    
    	this.activateTab(oTab);
    	this.oActiveTab = oTab;
    }
    var sTabText = (oTab.getTextValue().toLowerCase()).replace(' ','');		
		if ((oTab.elTabLnk.id == sTabText)  | (window.location.hash.substring(1).toLowerCase() == sTabText)) {
			this.bFirstRun=true;
    	this.activateTab(oTab);
    	this.oActiveTab = oTab;
		}
					
		this.fireEvent('TabAdded',this.aTabs.length);
		return oTab;	
	},
	removeTab : function(oTab,bNoDomRemoval) {
		bNoDomRemoval  = bNoDomRemoval || false;

		oTab = this.identifyTab(oTab.getTab(),this);
		if (oTab) {
			iTabIndex = oTab.iPos;
			oTab = oTab.oTab;
			elTab=oTab.getTab();
			elPane = oTab.getPane();
			
		}
		var performRemove = function() {
			if (bNoDomRemoval===false) {
				elTab.parentNode.removeChild(elTab); 
			}			
			oTab = this.aTabs.splice(iTabIndex,1);
			if (this.aTabs.length>0) {
				oTab = this.aTabs[Math.min(iTabIndex,(this.aTabs.length==0)? 0 : this.aTabs.length-1)];
				this.activateTab(oTab);
			} 
		};
		if ((bNoDomRemoval===false) && this.bDoFadeOut) { 
			var fadeAnim = new YAHOO.util.Anim([elTab,elPane], { opacity: { to: 0 } }, 0.5, YAHOO.util.Easing.easeOut);			
			fadeAnim.onComplete.subscribe(performRemove,this,true);
			fadeAnim.animate();
		}
		else {
			performRemove.apply(this);
		}
		this.fireEvent('TabRemoved',this.aTabs.length);
		return false;
		
	},
	/**
	 * Deactivates Tab and fire deactivate event
	 * @param {string} type The event type
	 * @param {array}  aArgs Argument array.
	 */
	deactivateTab :function() {
		if (this.oActiveTab) {
			this.oActiveTab.deactivateTab();
			this.oActiveTab == null;
			this.fireEvent('TabDeactivated',this.aTabs.length);
			return true;
		}
		else return false;	
	
	},	
	/**
	 * Activates Tab within Moduletab context. Actual Tab has already been activated
	 * but ModuleTab's internal state is updated here. Deactivates current tab and 
	 * executes activate callback
	 * @param {string} type The event type
	 * @param {array}  aArgs Argument array.
	 */
	activateTab : function(oTab) {
		
		if (oTab && (this.oActiveTab!=oTab)) {
			this.deactivateTab();
		   this.oActiveTab = oTab;
			oTab.activateTab();
			if ((this.bFirstRun ==false) && this.bDoHilite) {
		      this.hilite();
		  }
			
			this.bFirstRun = false;
			this.manageHeight();
			this.fireEvent('TabActivated');
		}
	},
	manageHeight : function() {
		var elPane = this.oActiveTab.elPane;
		//get Height of last child
		var oYngest = elPane.lastChild;
		while(oYngest.nodeType!=1) {
			oYngest = oYngest.previousSibling;
		}
		
		//get difference between last child height and elem height
		var iDelta =  (YAHOO.util.Dom.getXY(elPane)[1] + elPane.offsetHeight) - (YAHOO.util.Dom.getXY(oYngest)[1] + oYngest.offsetHeight);	
		var convertPxToEm = function(oElem,iPx) {
			var iFontSize = (YAHOO.util.Dom.getStyle(oElem,'fontSize'));
			
			//IE kludge alert
			//%
			if (iFontSize.indexOf('%')!=-1) {
				iFontSize=parseFloat(YAHOO.util.Dom.getStyle(oElem,'lineHeight'));
			}
			else if (isNaN(iFontSize)) {
				if (iFontSize=="small")	 {
					iFontSize = parseFloat(YAHOO.util.Dom.getStyle(oElem,'lineHeight'))+1.5
				}
				else if (iFontSize=="x-small")	 {
					iFontSize=parseFloat(YAHOO.util.Dom.getStyle(oElem,'lineHeight'))
				}
			}
			return parseFloat(iPx)/parseFloat(iFontSize);
		}
		//new height must be in ems so we convert
		var iNewHeight = convertPxToEm(elPane,parseInt(elPane.offsetHeight)-(iDelta)); 
		//Direct replacement of height
		YAHOO.util.Dom.setStyle(this.elContainer,'height',iNewHeight+"em");		
	},
	
	/**
	 * Fades background color as a means of highlighting that a change has occured.
	 * any specified callbacks.
	 * @param {int} iIndex The index of the container to display
	 */
	
	hilite : function() {
		if (!YAHOO.util.ColorAnim) {
			return;
		}
		//stop anim and reset bg if another anim is started before the previous has finished
		if (this.oConfig.oHiliteArgs.bTransparent && this.hiliteAnim!=null) {
			this.hiliteAnim.stop(true);
			YAHOO.util.Dom.setStyle(this.hiliteAnim.getEl(),'backgroundColor','');
		}
			this.hiliteAnim = new YAHOO.util.ColorAnim([this.oActiveTab.elTab,this.oActiveTab.elPane],{  
								backgroundColor : 	{ 
									from:this.oHiliteArgs.from,
									to:this.oHiliteArgs.to
								} 
						},this.oHiliteArgs.duration,this.oHiliteArgs.fEase || YAHOO.util.Easing.easeOut);
			this.hiliteAnim.animate();
		
	},
	addListener : function(sEvt,fCallback,oObj,bScope) {
		if (this.aEvents[sEvt]) {
			this.aEvents[sEvt].subscribe(fCallback,oObj || window, bScope || false);
		}

	},
	selectTab : function(e) {
		var elSrc = YAHOO.util.Event.getTarget(e);
		var bContinue = true;
		if (elSrc.nodeName=='UL' || elSrc.nodeName=='LI') {
			return;
		}
		while (bContinue && elSrc.nodeName!='A' ) {
			if (YAHOO.util.Dom.hasClass(elSrc,YAHOO.NT.TabsModule.ACTIVE_TAB_CLASS_NAME)) { //addtional stop check
				bContinue = false;
			}
			elSrc = elSrc.parentNode;
		}
		
		if (YAHOO.util.Dom.hasClass(elSrc,YAHOO.NT.TabsModule.CSS_TAB_HOOK)) {
			var oTab = this.identifyTab(elSrc,this);
			if (oTab) {
				oTab = oTab.oTab;
				this.activateTab(oTab);								
			}
			YAHOO.util.Event.stopEvent(e);
		}
	},
	fireEvent : function(sEvent) {
		if (sEvent && this.aEvents[sEvent]) {
			var fn = this.aEvents[sEvent].fire;
			var aArgs = Array.prototype.slice.apply(arguments);
			aArgs.shift();
			fn.apply(this.aEvents[sEvent],aArgs);
		}
	},
	identifyTab : function(el,oSrc) {
		while(el!= this.elContainer && el.nodeName!='LI') {
			el = el.parentNode;
		}
		
		for(var i=0,oTab;oTab=oSrc.aTabs[i];i++) {
			if (el == oTab.getTab()) {
				return { "oTab":oTab,"iPos":i};
			}
		}
		return false;
	},
	setHiliteable:function(bDoHilite) {
		this.bDoHilite=bDoHilite;
	}
};


YAHOO.NT.TabsModule.CSS_TAB_HOOK	=	"tab";

YAHOO.NT.TabsModule.CSS_PANE_HOOK	=	"tabpane";

YAHOO.NT.TabsModule.SHOW_PANE_CLASS_NAME	=	"paneShow";

YAHOO.NT.TabsModule.HIDE_PANE_CLASS_NAME	=	"paneHide";

YAHOO.NT.TabsModule.ACTIVE_TAB_CLASS_NAME = 'on';

YAHOO.NT.TabsModule.JS_IS_ACTIVE = 'js';
YAHOO.NT.TabsModuleManager = function(){
	return {
		aModules : [],
		register : function(oTabMod,sGroup) {
			if (sGroup) {
				if (!this.aModules[sGroup]) {
					this.aModules[sGroup]=[];
				}
				this.aModules[sGroup].push(oTabMod);
			};			
		},
		unregister : function(oTabMod,sGroup) {
			if (this.aModules[sGroup]) {
				var iIndex = -1;
				for (var i=0,o;o=this.aModules[sGroup][i];i++) {
					if (oTabMod  == o) {
						iIndex = i;
						break;
					}
				}
				if (iIndex != -1) {				
					this.aModules[sGroup].splice(iIndex,1);
				}
			}
		},
		identifyModule:function(el) {
			for (var sGroup in this.aModules) {
				for (var i=0,o;o=this.aModules[sGroup][i];i++) {
					if (el  == o.elContainer) {
						return o;
					}
				}
			}
			return false;
		}
	}	
}();

