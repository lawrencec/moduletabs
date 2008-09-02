YAHOO.namespace('YAHOO.NT');

YAHOO.NT.TabsModule.prototype.init =function() {
	var origInit = YAHOO.NT.TabsModule.prototype.init;
	return function(sId,oConfig) {
		origInit.apply(this,[sId,oConfig]);
		var closableInit=function(sId,oConfig) {
			if (oConfig.bCloseable!=null && oConfig.bCloseable==true) {
				this.aEvents["TabClosed"] = new YAHOO.util.CustomEvent('TabClosed',this)
			};
		}
		closableInit.apply(this,[sId,oConfig]);	
	};
}();

YAHOO.NT.TabsModule.prototype.selectTab =function(e) {
	var origSelect = YAHOO.NT.TabsModule.prototype.selectTab;
	return function(e) {
		var closableSelect=function(e) {
				var bDoClose = false;
				var elSrc = YAHOO.util.Event.getTarget(e);
				if (YAHOO.util.Dom.hasClass(elSrc,YAHOO.NT.TabsModule.CSS_CLOSE_ICON)) {
	   				
					var oTab = this.identifyTab(elSrc,this);
	   				if (oTab) {	   					
	   					oTab=oTab.oTab;
						if (oTab.isCloseable()) {
							this.removeTab(oTab);
						}
	   				}
					this.fireEvent('TabClosed');
	   				YAHOO.util.Event.stopEvent(e);
	   			}
	   			else if (!bDoClose) {
					origSelect.apply(this,[e]);	   				
	   			}
		}
		closableSelect.apply(this,[e]);	
	};
}();
//set up augmentation obj	  	
YAHOO.NT.CloseableTab={}
YAHOO.NT.CloseableTab.prototype = {
	bCloseableTab : false,	
	isCloseable : function() {
		return this.bCloseable;
	},	
	setCloseable : function(bCloseable) {
		this.bCloseable = bCloseable;
	}
};

YAHOO.augment(YAHOO.NT.Tab,YAHOO.NT.CloseableTab);

//cleanup
YAHOO.NT.CloseableTab=YAHOO.NT.CloseableTab.prototype = null;

YAHOO.NT.Tab.prototype.initTab =function() {
		var origInit = YAHOO.NT.Tab.prototype.initTab;
		return function(oConfig) {
			origInit.apply(this,[oConfig]);			
			if (oConfig.bCloseable!=null && oConfig.bCloseable == true) {
				var closableInit = function (oConfig) {
					this.bCloseable = oConfig.bCloseable;
					if 	(this.bCloseable) {
						this.elCloseIcon = document.createElement('span');
						YAHOO.util.Dom.addClass(this.elCloseIcon,oConfig.sCloseIconClass);
						YAHOO.util.Dom.setStyle(this.elCloseIcon,'display','none');						
						this.elTabLnk.appendChild(this.elCloseIcon,this.elPane);
					}
				}
			closableInit.apply(this,[oConfig]);
			}
		};		
	}();

YAHOO.NT.Tab.prototype.activateTab =function() {
		var origActivate = YAHOO.NT.Tab.prototype.activateTab;
		return function() {
			origActivate.apply(this);			
				var closableActivate = function () {
						if 	(this.bCloseable) {
							YAHOO.util.Dom.setStyle(this.elCloseIcon,'display','block');
						}
					}
			closableActivate.apply(this);
			}
		}();

YAHOO.NT.Tab.prototype.deactivateTab =function() {
		var origDeactivate = YAHOO.NT.Tab.prototype.deactivateTab;
		return function() {
			origDeactivate.apply(this);
				var closableDeactivate = function () {
						if 	(this.bCloseable) {
							YAHOO.util.Dom.setStyle(this.elCloseIcon,'display','none');
						}
					}
			closableDeactivate.apply(this);
			}
		}();

YAHOO.NT.TabsModule.CSS_CLOSE_ICON = 'mTabCloseIcon';


	


