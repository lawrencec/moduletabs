YAHOO.namespace('YAHOO.NT');


YAHOO.NT.TabsModule.prototype.onTabSwapped = function(type,aArgs) { 
		var sSourceTabId = aArgs[0].source.id;//tab that is being dragged
		var sTargetTabId = aArgs[0].target.id;//tab that is being dragged onto
		 
		var iSourceIndex = -1;
		var iTargetIndex = -1;
		
		for(var i=0,oTab;oTab = this.aTabs[i];i++) {
			if (oTab.getTab().id == sSourceTabId) {
				iSourceIndex = i;
			}
			if (oTab.getTab().id == sTargetTabId) {
				iTargetIndex = i;
			}
		}
		
		if (iSourceIndex<0) {
			return false;
		}
		
		var oTmpTab = this.aTabs[iSourceIndex];
		this.aTabs[iSourceIndex] = this.aTabs[iTargetIndex];
		this.aTabs[iTargetIndex] = oTmpTab;
		oTmpTab = null;
		
		//only activate if not currently active
		if (this.oActiveTab != this.aTabs[iTargetIndex]) {
			this.activateTab(this.aTabs[iTargetIndex])
		}
		this.fireEvent('TabSwapped',aArgs[0].source,aArgs[0].target);	
	
};	
YAHOO.NT.TabsModule.prototype.init =function() {
	var origInit = YAHOO.NT.TabsModule.prototype.init;
	return function(sId,oConfig) {
		origInit.apply(this,[sId,oConfig]);
		var draggableInit=function(sId,oConfig) {
			if (oConfig.bDraggable!=null && oConfig.bDraggable==true) {
				this.aEvents["TabSwapped"] = new YAHOO.util.CustomEvent('TabSwapped',this)
				for (var i=0,oTab;oTab = this.aTabs[i];i++){
					oTab.addListener('TabSwapped',this.onTabSwapped,this,true);
				};
			};
		}
		draggableInit.apply(this,[sId,oConfig]);	
	};
}();	
  	
YAHOO.NT.DraggableTab={}; 
YAHOO.NT.DraggableTab.prototype = {
	initDD : function() {
		if (this.id) {
			this.init(this.id, this.sGroup,	{ useAbsMath :true,resizeFrame :true,centerFrame : true});
			this.removeInvalidHandleType('A');
			this.initFrame();
		}
	
	},
	onDragDrop : function(e, id) {
	    var el; //target
	    if ("string" == typeof id) {
	        el = YAHOO.util.DDM.getElement(id);
	    } else {
	        el = YAHOO.util.DDM.getBestMatch(id).getEl();
	    }
		// window.console.log(YAHOO.util.DDM.getRelated(this));
		//dropped on el
		var oTargetMod = YAHOO.NT.TabsModuleManager.identifyModule(el.parentNode.parentNode)
		//dragged el
		var oSourceMod = YAHOO.NT.TabsModuleManager.identifyModule(this.getEl().parentNode.parentNode)
		if (oTargetMod == oSourceMod) {
			//swap node
			YAHOO.util.DDM.swapNode(this.getEl(), this.elDummyNode);
			this.fireEvent('TabSwapped',{source:this.getEl(),target:el});
			
		}
		else {
			//swap between modules
			oTargetMod.addTab(this.elTab);
			
			YAHOO.util.DDM.swapNode(this.getEl(), this.elDummyNode);
			oSourceMod.removeTab(this,true);
			//this.fireEvent('TabSwapped',{source:this.getEl(),target:el});
		}
		this.removeDropInvitation(id);
	},

	
	//removes dummy el
	endDrag : function(e) {
		if (this.elDummyNode.parentNode) {
			this.elDummyNode.parentNode.removeChild(this.elDummyNode)
		}
	},
	
	//add drop invitation	
	onDragEnter : function(e, id) {	
		var rNode = YAHOO.util.Dom.get(id);

		this.addDropInvitation(rNode);
	},
	//remove drop invitation
	onDragOut : function(e, id) {
	 	 this.removeDropInvitation(YAHOO.util.Dom.get(id));
	},
	
	onDragOver : function(e,id) {
		// id is id of element that is been dragged over
		var iIndicPosX;
		if ("string" == typeof id) {
	        el = YAHOO.util.DDM.getElement(id);
	    } else {
	        el = YAHOO.util.DDM.getBestMatch(id).getEl();
	    }
		
		elParent =el.parentNode;
		isBefore = this.isOnFirstHalf(el);
		
		if (isBefore){
			this.elDummyNode = elParent.insertBefore(this.elDummyNode,el);
			var elOver = el;
			var iIndicPosX = YAHOO.util.Dom.getX(el)
		}
		else {
			// if after last child, then just append to parent
			var elLast = elParent.lastChild;
			while(elLast.nodeType!=1){
				elLast=elLast.previousSibling;
			};
			if (elLast==this.elDummyNode) {
				elLast = elLast.previousSibling.previousSibling;;
			}
			if (el==elLast) {
				this.elDummyNode = elParent.appendChild(this.elDummyNode);
				elOver = elLast;
				var oRegion = YAHOO.util.Dom.getRegion(elOver);
				var iIndicPosX = oRegion.right;
			}
			// else just insert after child
			else if (el.nextSibling){ 
				this.elDummyNode = elParent.insertBefore(this.elDummyNode,el.nextSibling);
				elOver = this.elDummyNode.nextSibling;
				if (elOver) {
				while(elOver && elOver.nodeType!=1){
					elOver=elOver.nextSibling;
				};
				var iIndicPosX = YAHOO.util.Dom.getX(elOver);
				}
			}
		}
		YAHOO.util.Dom.setX(this.elDummyNode,(iIndicPosX)-8);
	},
	/**
	 * Performs the drop invitation interaction pattern. 
	 * @param {string}  id id of element.
	 */
	addDropInvitation : function(rNode) {
		 YAHOO.util.Dom.addClass(rNode,'drpInvte');
	},
	
	/**
	 * Terminates the drop invitation interaction pattern. 
	 * @param {string}  id id of element.
	 */
	removeDropInvitation : function(rNode) {
		YAHOO.util.Dom.removeClass(rNode,'drpInvte');
	},

	isOnFirstHalf : function(el) {
		var dragEl = this.getDragEl();

		var srcRegion = YAHOO.util.Dom.getRegion(dragEl);
		var srcWidth = srcRegion.right-srcRegion.left;

		var tgtRegion = YAHOO.util.Dom.getRegion(el);
		var tgtWidth = tgtRegion.right-tgtRegion.left;
		var tgtThreshold  = parseInt(tgtWidth/2);
	
		//is left of dragged el further left than midpoint of dragged over el?
		return (srcRegion.left <= ( tgtRegion.left + (tgtThreshold/2)));
	}
}

YAHOO.augment(YAHOO.NT.Tab,YAHOO.NT.DraggableTab);
//cleanup
YAHOO.NT.DraggableTab=YAHOO.NT.DraggableTab.prototype = null;

YAHOO.NT.Tab.prototype.initTab =function() {
		var origInit = YAHOO.NT.Tab.prototype.initTab;
		return function(oConfig) {

			origInit.apply(this,[oConfig]);
			
			if (oConfig.bDraggable!=null && oConfig.bDraggable == true) {
				var draggableInit = function (oConfig) {
					//this.id = this.oTab.id;
					this.sGroup = oConfig.sGroup;
					this.bDraggable = oConfig.bDraggable;
					this.aEvents = this.aEvents || [];
					this.aEvents["TabSwapped"] = new YAHOO.util.CustomEvent('onSwapped',this);
					if (this.bDraggable && YAHOO.util.DDProxy){
						this.initDD();	
					}
					this.elDummyNode = document.createElement('li');
					YAHOO.util.Dom.addClass(this.elDummyNode,'drgPosIndic');
					
				}
			draggableInit.apply(this,[oConfig]);
			}
		};		
	}();
	

if (YAHOO.util.DDProxy) {
	YAHOO.augment(YAHOO.NT.Tab,YAHOO.util.DDProxy);
}




