YAHOO.namespace('YAHOO.NT');

YAHOO.NT.Tab = function(oConfig) {
	if (oConfig) {
		this.initTab(oConfig);
	}
}

YAHOO.NT.Tab.prototype = { 

	initTab : function(oConfig) {
		this.elTab = oConfig.elTab;
		this.elPane = this.elTab.getElementsByTagName('div')[0];
		this.elTabLnk = this.elTab.getElementsByTagName('a')[0];
	
		this.id = this.elTab.id;
	
	},


/**
 * Deactivates Tab. Assigns appropiates CSS class and removes 'title' attribute
 * of linked element.
 *
 */
    deactivateTab : function() {
	if (YAHOO.util.Dom.hasClass(this.elPane,YAHOO.NT.TabsModule.SHOW_PANE_CLASS_NAME)) {
		YAHOO.util.Dom.replaceClass(this.elPane,YAHOO.NT.TabsModule.SHOW_PANE_CLASS_NAME,YAHOO.NT.TabsModule.HIDE_PANE_CLASS_NAME);   
  	}
  	else  { 
		YAHOO.util.Dom.addClass(this.elPane,YAHOO.NT.TabsModule.HIDE_PANE_CLASS_NAME);
  	}
 	  
	//deactivate tab
	YAHOO.util.Dom.removeClass(this.elTab,YAHOO.NT.TabsModule.ACTIVE_TAB_CLASS_NAME);
  	this.elTabLnk.setAttribute('title','');
	this.bActive =false;
	return this.bActive;
  },
/**
 * Activates Tab. Assigns appropiates CSS class and sets 'title' attribute
 * of linked element. TODO : i18n
 */
   activateTab : function() {
	if (YAHOO.util.Dom.hasClass(this.elPane,YAHOO.NT.TabsModule.HIDE_PANE_CLASS_NAME)) {
		YAHOO.util.Dom.replaceClass(this.elPane,YAHOO.NT.TabsModule.HIDE_PANE_CLASS_NAME,YAHOO.NT.TabsModule.SHOW_PANE_CLASS_NAME);
	} 
 	else  { 
 		YAHOO.util.Dom.addClass(this.elPane,YAHOO.NT.TabsModule.SHOW_PANE_CLASS_NAME);
 	}
	//activate tab
	YAHOO.util.Dom.addClass(this.elTab,YAHOO.NT.TabsModule.ACTIVE_TAB_CLASS_NAME);
	this.elTabLnk.setAttribute('title',YAHOO.NT.Tab.ACTIVE_TITLE_TEXT);
		
	this.bActive =true;
	return this.bActive;	
    },



	
	getTab : function() {
		return this.elTab;
	},
	getPane : function() {
		return this.elPane;
	},
	getTextValue : function() {
		var elText = this.elTabLnk.firstChild;
		while (elText.nodeType!=3) {
			elText=elText.firstChild;
		}
		return elText.nodeValue;
	},
	setPaneContent : function(oContent) {
		this.elPane.innerHTML = oContent;
	},
/**
 * Add Listeners to Tab's custom events
 */
	addListener  : function(sEvt,fCallback,oObj,bScope) {
		if (this.aEvents[sEvt]) {
			this.aEvents[sEvt].subscribe(fCallback,oObj || window, bScope || false);
		}
	},
/**
 * Fires events Tab's custom events
 */
	
	fireEvent : function(sEvent) {
		if (sEvent && this.aEvents[sEvent]) {
			var fn = this.aEvents[sEvent].fire;
			var aArgs = Array.prototype.slice.apply(arguments);
			aArgs.shift();
			fn.apply(this.aEvents[sEvent],aArgs);
		}
	}
};
/**
 * text to set into the active attribute of the tab link of an active tab
 * 
 */
YAHOO.NT.Tab.ACTIVE_TITLE_TEXT	=	"active";