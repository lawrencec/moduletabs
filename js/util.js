YAHOO.namespace("YAHOO.Nt.util");

/**
 * @fileoverview Useful utility functions
 *
 */

/**
 * function to convert pixel value to ems.
 * @param {HTMLElement} Element to use to source font size value
 * @param {int} Pixel value to convert
 * @author Lawrence Carvalho lawrence@nodetraveller.com
 * @returns Em value
 * @type Float
 * @version 0.1
 */

YAHOO.NT.util.convertPxToEm= function(oElem,iPx) {
	var iFontSize = (YAHOO.util.Dom.getStyle(oElem,'fontSize'));

	//IE kludge alert
	//%
	if (iFontSize.indexOf('%')!=-1) {
		iFontSize=parseFloat(YAHOO.util.Dom.getStyle(oElem,'lineHeight'))+1;
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

