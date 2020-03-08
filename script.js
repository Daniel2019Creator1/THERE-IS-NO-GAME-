function WebForm_PostBackOptions(eventTarget, eventArgument, validation, validationGroup, actionUrl, trackFocus, clientSubmit) {
    this.eventTarget = eventTarget;
    this.eventArgument = eventArgument;
    this.validation = validation;
    this.validationGroup = validationGroup;
    this.actionUrl = actionUrl;
    this.trackFocus = trackFocus;
    this.clientSubmit = clientSubmit;
}
function WebForm_DoPostBackWithOptions(options) {
    var validationResult = true;
    if (options.validation) {
        if (typeof(Page_ClientValidate) == 'function') {
            validationResult = Page_ClientValidate(options.validationGroup);
        }
    }
    if (validationResult) {
        if ((typeof(options.actionUrl) != "undefined") && (options.actionUrl != null) && (options.actionUrl.length > 0)) {
            theForm.action = options.actionUrl;
        }
        if (options.trackFocus) {
            var lastFocus = theForm.elements["__LASTFOCUS"];
            if ((typeof(lastFocus) != "undefined") && (lastFocus != null)) {
                if (typeof(document.activeElement) == "undefined") {
                    lastFocus.value = options.eventTarget;
                }
                else {
                    var active = document.activeElement;
                    if ((typeof(active) != "undefined") && (active != null)) {
                        if ((typeof(active.id) != "undefined") && (active.id != null) && (active.id.length > 0)) {
                            lastFocus.value = active.id;
                        }
                        else if (typeof(active.name) != "undefined") {
                            lastFocus.value = active.name;
                        }
                    }
                }
            }
        }
    }
    if (options.clientSubmit) {
        __doPostBack(options.eventTarget, options.eventArgument);
    }
}
var __pendingCallbacks = new Array();
var __synchronousCallBackIndex = -1;
function WebForm_DoCallback(eventTarget, eventArgument, eventCallback, context, errorCallback, useAsync) {
    var postData = __theFormPostData +
                "__CALLBACKID=" + WebForm_EncodeCallback(eventTarget) +
                "&__CALLBACKPARAM=" + WebForm_EncodeCallback(eventArgument);
    if (theForm["__EVENTVALIDATION"]) {
        postData += "&__EVENTVALIDATION=" + WebForm_EncodeCallback(theForm["__EVENTVALIDATION"].value);
    }
    var xmlRequest,e;
    try {
        xmlRequest = new XMLHttpRequest();
    }
    catch(e) {
        try {
            xmlRequest = new ActiveXObject("Microsoft.XMLHTTP");
        }
        catch(e) {
        }
    }
    var setRequestHeaderMethodExists = true;
    try {
        setRequestHeaderMethodExists = (xmlRequest && xmlRequest.setRequestHeader);
    }
    catch(e) {}
    var callback = new Object();
    callback.eventCallback = eventCallback;
    callback.context = context;
    callback.errorCallback = errorCallback;
    callback.async = useAsync;
    var callbackIndex = WebForm_FillFirstAvailableSlot(__pendingCallbacks, callback);
    if (!useAsync) {
        if (__synchronousCallBackIndex != -1) {
            __pendingCallbacks[__synchronousCallBackIndex] = null;
        }
        __synchronousCallBackIndex = callbackIndex;
    }
    if (setRequestHeaderMethodExists) {
        xmlRequest.onreadystatechange = WebForm_CallbackComplete;
        callback.xmlRequest = xmlRequest;
        // e.g. http:
        var action = theForm.action || document.location.pathname, fragmentIndex = action.indexOf('#');
        if (fragmentIndex !== -1) {
            action = action.substr(0, fragmentIndex);
        }
        if (!__nonMSDOMBrowser) {
            var domain = "";
            var path = action;
            var query = "";
            var queryIndex = action.indexOf('?');
            if (queryIndex !== -1) {
                query = action.substr(queryIndex);
                path = action.substr(0, queryIndex);
            }
            if (path.indexOf("%") === -1) {
                // domain may or may not be present (e.g. action of "foo.aspx" vs "http:
                if (/^https?\:\/\/.*$/gi.test(path)) {
                    var domainPartIndex = path.indexOf("\/\/") + 2;
                    var slashAfterDomain = path.indexOf("/", domainPartIndex);
                    if (slashAfterDomain === -1) {
                        // entire url is the domain (e.g. "http:
                        domain = path;
                        path = "";
                    }
                    else {
                        domain = path.substr(0, slashAfterDomain);
                        path = path.substr(slashAfterDomain);
                    }
                }
                action = domain + encodeURI(path) + query;
            }
        }
        xmlRequest.open("POST", action, true);
        xmlRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
        xmlRequest.send(postData);
        return;
    }
    callback.xmlRequest = new Object();
    var callbackFrameID = "__CALLBACKFRAME" + callbackIndex;
    var xmlRequestFrame = document.frames[callbackFrameID];
    if (!xmlRequestFrame) {
        xmlRequestFrame = document.createElement("IFRAME");
        xmlRequestFrame.width = "1";
        xmlRequestFrame.height = "1";
        xmlRequestFrame.frameBorder = "0";
        xmlRequestFrame.id = callbackFrameID;
        xmlRequestFrame.name = callbackFrameID;
        xmlRequestFrame.style.position = "absolute";
        xmlRequestFrame.style.top = "-100px"
        xmlRequestFrame.style.left = "-100px";
        try {
            if (callBackFrameUrl) {
                xmlRequestFrame.src = callBackFrameUrl;
            }
        }
        catch(e) {}
        document.body.appendChild(xmlRequestFrame);
    }
    var interval = window.setInterval(function() {
        xmlRequestFrame = document.frames[callbackFrameID];
        if (xmlRequestFrame && xmlRequestFrame.document) {
            window.clearInterval(interval);
            xmlRequestFrame.document.write("");
            xmlRequestFrame.document.close();
            xmlRequestFrame.document.write('<html><body><form method="post"><input type="hidden" name="__CALLBACKLOADSCRIPT" value="t"></form></body></html>');
            xmlRequestFrame.document.close();
            xmlRequestFrame.document.forms[0].action = theForm.action;
            var count = __theFormPostCollection.length;
            var element;
            for (var i = 0; i < count; i++) {
                element = __theFormPostCollection[i];
                if (element) {
                    var fieldElement = xmlRequestFrame.document.createElement("INPUT");
                    fieldElement.type = "hidden";
                    fieldElement.name = element.name;
                    fieldElement.value = element.value;
                    xmlRequestFrame.document.forms[0].appendChild(fieldElement);
                }
            }
            var callbackIdFieldElement = xmlRequestFrame.document.createElement("INPUT");
            callbackIdFieldElement.type = "hidden";
            callbackIdFieldElement.name = "__CALLBACKID";
            callbackIdFieldElement.value = eventTarget;
            xmlRequestFrame.document.forms[0].appendChild(callbackIdFieldElement);
            var callbackParamFieldElement = xmlRequestFrame.document.createElement("INPUT");
            callbackParamFieldElement.type = "hidden";
            callbackParamFieldElement.name = "__CALLBACKPARAM";
            callbackParamFieldElement.value = eventArgument;
            xmlRequestFrame.document.forms[0].appendChild(callbackParamFieldElement);
            if (theForm["__EVENTVALIDATION"]) {
                var callbackValidationFieldElement = xmlRequestFrame.document.createElement("INPUT");
                callbackValidationFieldElement.type = "hidden";
                callbackValidationFieldElement.name = "__EVENTVALIDATION";
                callbackValidationFieldElement.value = theForm["__EVENTVALIDATION"].value;
                xmlRequestFrame.document.forms[0].appendChild(callbackValidationFieldElement);
            }
            var callbackIndexFieldElement = xmlRequestFrame.document.createElement("INPUT");
            callbackIndexFieldElement.type = "hidden";
            callbackIndexFieldElement.name = "__CALLBACKINDEX";
            callbackIndexFieldElement.value = callbackIndex;
            xmlRequestFrame.document.forms[0].appendChild(callbackIndexFieldElement);
            xmlRequestFrame.document.forms[0].submit();
        }
    }, 10);
}
function WebForm_CallbackComplete() {
    for (var i = 0; i < __pendingCallbacks.length; i++) {
        callbackObject = __pendingCallbacks[i];
        if (callbackObject && callbackObject.xmlRequest && (callbackObject.xmlRequest.readyState == 4)) {
            if (!__pendingCallbacks[i].async) {
                __synchronousCallBackIndex = -1;
            }
            __pendingCallbacks[i] = null;
            var callbackFrameID = "__CALLBACKFRAME" + i;
            var xmlRequestFrame = document.getElementById(callbackFrameID);
            if (xmlRequestFrame) {
                xmlRequestFrame.parentNode.removeChild(xmlRequestFrame);
            }
            WebForm_ExecuteCallback(callbackObject);
        }
    }
}
function WebForm_ExecuteCallback(callbackObject) {
    var response = callbackObject.xmlRequest.responseText;
    if (response.charAt(0) == "s") {
        if ((typeof(callbackObject.eventCallback) != "undefined") && (callbackObject.eventCallback != null)) {
            callbackObject.eventCallback(response.substring(1), callbackObject.context);
        }
    }
    else if (response.charAt(0) == "e") {
        if ((typeof(callbackObject.errorCallback) != "undefined") && (callbackObject.errorCallback != null)) {
            callbackObject.errorCallback(response.substring(1), callbackObject.context);
        }
    }
    else {
        var separatorIndex = response.indexOf("|");
        if (separatorIndex != -1) {
            var validationFieldLength = parseInt(response.substring(0, separatorIndex));
            if (!isNaN(validationFieldLength)) {
                var validationField = response.substring(separatorIndex + 1, separatorIndex + validationFieldLength + 1);
                if (validationField != "") {
                    var validationFieldElement = theForm["__EVENTVALIDATION"];
                    if (!validationFieldElement) {
                        validationFieldElement = document.createElement("INPUT");
                        validationFieldElement.type = "hidden";
                        validationFieldElement.name = "__EVENTVALIDATION";
                        theForm.appendChild(validationFieldElement);
                    }
                    validationFieldElement.value = validationField;
                }
                if ((typeof(callbackObject.eventCallback) != "undefined") && (callbackObject.eventCallback != null)) {
                    callbackObject.eventCallback(response.substring(separatorIndex + validationFieldLength + 1), callbackObject.context);
                }
            }
        }
    }
}
function WebForm_FillFirstAvailableSlot(array, element) {
    var i;
    for (i = 0; i < array.length; i++) {
        if (!array[i]) break;
    }
    array[i] = element;
    return i;
}
var __nonMSDOMBrowser = (window.navigator.appName.toLowerCase().indexOf('explorer') == -1);
var __theFormPostData = "";
var __theFormPostCollection = new Array();
var __callbackTextTypes = /^(text|password|hidden|search|tel|url|email|number|range|color|datetime|date|month|week|time|datetime-local)$/i;
function WebForm_InitCallback() {
    var formElements = theForm.elements,
        count = formElements.length,
        element;
    for (var i = 0; i < count; i++) {
        element = formElements[i];
        var tagName = element.tagName.toLowerCase();
        if (tagName == "input") {
            var type = element.type;
            if ((__callbackTextTypes.test(type) || ((type == "checkbox" || type == "radio") && element.checked))
                && (element.id != "__EVENTVALIDATION")) {
                WebForm_InitCallbackAddField(element.name, element.value);
            }
        }
        else if (tagName == "select") {
            var selectCount = element.options.length;
            for (var j = 0; j < selectCount; j++) {
                var selectChild = element.options[j];
                if (selectChild.selected == true) {
                    WebForm_InitCallbackAddField(element.name, element.value);
                }
            }
        }
        else if (tagName == "textarea") {
            WebForm_InitCallbackAddField(element.name, element.value);
        }
    }
}
function WebForm_InitCallbackAddField(name, value) {
    var nameValue = new Object();
    nameValue.name = name;
    nameValue.value = value;
    __theFormPostCollection[__theFormPostCollection.length] = nameValue;
    __theFormPostData += WebForm_EncodeCallback(name) + "=" + WebForm_EncodeCallback(value) + "&";
}
function WebForm_EncodeCallback(parameter) {
    if (encodeURIComponent) {
        return encodeURIComponent(parameter);
    }
    else {
        return escape(parameter);
    }
}
var __disabledControlArray = new Array();
function WebForm_ReEnableControls() {
    if (typeof(__enabledControlArray) == 'undefined') {
        return false;
    }
    var disabledIndex = 0;
    for (var i = 0; i < __enabledControlArray.length; i++) {
        var c;
        if (__nonMSDOMBrowser) {
            c = document.getElementById(__enabledControlArray[i]);
        }
        else {
            c = document.all[__enabledControlArray[i]];
        }
        if ((typeof(c) != "undefined") && (c != null) && (c.disabled == true)) {
            c.disabled = false;
            __disabledControlArray[disabledIndex++] = c;
        }
    }
    setTimeout("WebForm_ReDisableControls()", 0);
    return true;
}
function WebForm_ReDisableControls() {
    for (var i = 0; i < __disabledControlArray.length; i++) {
        __disabledControlArray[i].disabled = true;
    }
}
function WebForm_SimulateClick(element, event) {
    var clickEvent;
    if (element) {
        if (element.click) {
            element.click();
        } else { 
            clickEvent = document.createEvent("MouseEvents");
            clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            if (!element.dispatchEvent(clickEvent)) {
                return true;
            }
        }
        event.cancelBubble = true;
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        return false;
    }
    return true;
}
function WebForm_FireDefaultButton(event, target) {
    if (event.keyCode == 13) {
        var src = event.srcElement || event.target;
        if (src &&
            ((src.tagName.toLowerCase() == "input") &&
             (src.type.toLowerCase() == "submit" || src.type.toLowerCase() == "button")) ||
            ((src.tagName.toLowerCase() == "a") &&
             (src.href != null) && (src.href != "")) ||
            (src.tagName.toLowerCase() == "textarea")) {
            return true;
        }
        var defaultButton;
        if (__nonMSDOMBrowser) {
            defaultButton = document.getElementById(target);
        }
        else {
            defaultButton = document.all[target];
        }
        if (defaultButton) {
            return WebForm_SimulateClick(defaultButton, event);
        } 
    }
    return true;
}
function WebForm_GetScrollX() {
    if (__nonMSDOMBrowser) {
        return window.pageXOffset;
    }
    else {
        if (document.documentElement && document.documentElement.scrollLeft) {
            return document.documentElement.scrollLeft;
        }
        else if (document.body) {
            return document.body.scrollLeft;
        }
    }
    return 0;
}
function WebForm_GetScrollY() {
    if (__nonMSDOMBrowser) {
        return window.pageYOffset;
    }
    else {
        if (document.documentElement && document.documentElement.scrollTop) {
            return document.documentElement.scrollTop;
        }
        else if (document.body) {
            return document.body.scrollTop;
        }
    }
    return 0;
}
function WebForm_SaveScrollPositionSubmit() {
    if (__nonMSDOMBrowser) {
        theForm.elements['__SCROLLPOSITIONY'].value = window.pageYOffset;
        theForm.elements['__SCROLLPOSITIONX'].value = window.pageXOffset;
    }
    else {
        theForm.__SCROLLPOSITIONX.value = WebForm_GetScrollX();
        theForm.__SCROLLPOSITIONY.value = WebForm_GetScrollY();
    }
    if ((typeof(this.oldSubmit) != "undefined") && (this.oldSubmit != null)) {
        return this.oldSubmit();
    }
    return true;
}
function WebForm_SaveScrollPositionOnSubmit() {
    theForm.__SCROLLPOSITIONX.value = WebForm_GetScrollX();
    theForm.__SCROLLPOSITIONY.value = WebForm_GetScrollY();
    if ((typeof(this.oldOnSubmit) != "undefined") && (this.oldOnSubmit != null)) {
        return this.oldOnSubmit();
    }
    return true;
}
function WebForm_RestoreScrollPosition() {
    if (__nonMSDOMBrowser) {
        window.scrollTo(theForm.elements['__SCROLLPOSITIONX'].value, theForm.elements['__SCROLLPOSITIONY'].value);
    }
    else {
        window.scrollTo(theForm.__SCROLLPOSITIONX.value, theForm.__SCROLLPOSITIONY.value);
    }
    if ((typeof(theForm.oldOnLoad) != "undefined") && (theForm.oldOnLoad != null)) {
        return theForm.oldOnLoad();
    }
    return true;
}
function WebForm_TextBoxKeyHandler(event) {
    if (event.keyCode == 13) {
        var target;
        if (__nonMSDOMBrowser) {
            target = event.target;
        }
        else {
            target = event.srcElement;
        }
        if ((typeof(target) != "undefined") && (target != null)) {
            if (typeof(target.onchange) != "undefined") {
                target.onchange();
                event.cancelBubble = true;
                if (event.stopPropagation) event.stopPropagation();
                return false;
            }
        }
    }
    return true;
}
function WebForm_TrimString(value) {
    return value.replace(/^\s+|\s+$/g, '')
}
function WebForm_AppendToClassName(element, className) {
    var currentClassName = ' ' + WebForm_TrimString(element.className) + ' ';
    className = WebForm_TrimString(className);
    var index = currentClassName.indexOf(' ' + className + ' ');
    if (index === -1) {
        element.className = (element.className === '') ? className : element.className + ' ' + className;
    }
}
function WebForm_RemoveClassName(element, className) {
    var currentClassName = ' ' + WebForm_TrimString(element.className) + ' ';
    className = WebForm_TrimString(className);
    var index = currentClassName.indexOf(' ' + className + ' ');
    if (index >= 0) {
        element.className = WebForm_TrimString(currentClassName.substring(0, index) + ' ' +
            currentClassName.substring(index + className.length + 1, currentClassName.length));
    }
}
function WebForm_GetElementById(elementId) {
    if (document.getElementById) {
        return document.getElementById(elementId);
    }
    else if (document.all) {
        return document.all[elementId];
    }
    else return null;
}
function WebForm_GetElementByTagName(element, tagName) {
    var elements = WebForm_GetElementsByTagName(element, tagName);
    if (elements && elements.length > 0) {
        return elements[0];
    }
    else return null;
}
function WebForm_GetElementsByTagName(element, tagName) {
    if (element && tagName) {
        if (element.getElementsByTagName) {
            return element.getElementsByTagName(tagName);
        }
        if (element.all && element.all.tags) {
            return element.all.tags(tagName);
        }
    }
    return null;
}
function WebForm_GetElementDir(element) {
    if (element) {
        if (element.dir) {
            return element.dir;
        }
        return WebForm_GetElementDir(element.parentNode);
    }
    return "ltr";
}
function WebForm_GetElementPosition(element) {
    var result = new Object();
    result.x = 0;
    result.y = 0;
    result.width = 0;
    result.height = 0;
    if (element.offsetParent) {
        result.x = element.offsetLeft;
        result.y = element.offsetTop;
        var parent = element.offsetParent;
        while (parent) {
            result.x += parent.offsetLeft;
            result.y += parent.offsetTop;
            var parentTagName = parent.tagName.toLowerCase();
            if (parentTagName != "table" &&
                parentTagName != "body" && 
                parentTagName != "html" && 
                parentTagName != "div" && 
                parent.clientTop && 
                parent.clientLeft) {
                result.x += parent.clientLeft;
                result.y += parent.clientTop;
            }
            parent = parent.offsetParent;
        }
    }
    else if (element.left && element.top) {
        result.x = element.left;
        result.y = element.top;
    }
    else {
        if (element.x) {
            result.x = element.x;
        }
        if (element.y) {
            result.y = element.y;
        }
    }
    if (element.offsetWidth && element.offsetHeight) {
        result.width = element.offsetWidth;
        result.height = element.offsetHeight;
    }
    else if (element.style && element.style.pixelWidth && element.style.pixelHeight) {
        result.width = element.style.pixelWidth;
        result.height = element.style.pixelHeight;
    }
    return result;
}
function WebForm_GetParentByTagName(element, tagName) {
    var parent = element.parentNode;
    var upperTagName = tagName.toUpperCase();
    while (parent && (parent.tagName.toUpperCase() != upperTagName)) {
        parent = parent.parentNode ? parent.parentNode : parent.parentElement;
    }
    return parent;
}
function WebForm_SetElementHeight(element, height) {
    if (element && element.style) {
        element.style.height = height + "px";
    }
}
function WebForm_SetElementWidth(element, width) {
    if (element && element.style) {
        element.style.width = width + "px";
    }
}
function WebForm_SetElementX(element, x) {
    if (element && element.style) {
        element.style.left = x + "px";
    }
}
function WebForm_SetElementY(element, y) {
    if (element && element.style) {
        element.style.top = y + "px";
    }
}
var cr={};cr.plugins_={};cr.behaviors={};if(typeof Object.getPrototypeOf!=="function")
{if(typeof "test".__proto__==="object")
{Object.getPrototypeOf=function(object){return object.__proto__;};}
else
{Object.getPrototypeOf=function(object){return object.constructor.prototype;};}}
(function(){cr.logexport=function(msg)
{if(window.console&&window.console.log)
window.console.log(msg);};cr.logerror=function(msg)
{if(window.console&&window.console.error)
window.console.error(msg);};cr.seal=function(x)
{return x;};cr.freeze=function(x)
{return x;};cr.is_undefined=function(x)
{return typeof x==="undefined";};cr.is_number=function(x)
{return typeof x==="number";};cr.is_string=function(x)
{return typeof x==="string";};cr.isPOT=function(x)
{return x>0&&((x-1)&x)===0;};cr.nextHighestPowerOfTwo=function(x){--x;for(var i=1;i<32;i<<=1){x=x|x>>i;}
return x+1;}
cr.abs=function(x)
{return(x<0?-x:x);};cr.max=function(a,b)
{return(a>b?a:b);};cr.min=function(a,b)
{return(a<b?a:b);};cr.PI=Math.PI;cr.round=function(x)
{return(x+0.5)|0;};cr.floor=function(x)
{if(x>=0)
return x|0;else
return(x|0)-1;};cr.ceil=function(x)
{var f=x|0;return(f===x?f:f+1);};function Vector2(x,y)
{this.x=x;this.y=y;cr.seal(this);};Vector2.prototype.offset=function(px,py)
{this.x+=px;this.y+=py;return this;};Vector2.prototype.mul=function(px,py)
{this.x*=px;this.y*=py;return this;};cr.vector2=Vector2;cr.segments_intersect=function(a1x,a1y,a2x,a2y,b1x,b1y,b2x,b2y)
{var max_ax,min_ax,max_ay,min_ay,max_bx,min_bx,max_by,min_by;if(a1x<a2x)
{min_ax=a1x;max_ax=a2x;}
else
{min_ax=a2x;max_ax=a1x;}
if(b1x<b2x)
{min_bx=b1x;max_bx=b2x;}
else
{min_bx=b2x;max_bx=b1x;}
if(max_ax<min_bx||min_ax>max_bx)
return false;if(a1y<a2y)
{min_ay=a1y;max_ay=a2y;}
else
{min_ay=a2y;max_ay=a1y;}
if(b1y<b2y)
{min_by=b1y;max_by=b2y;}
else
{min_by=b2y;max_by=b1y;}
if(max_ay<min_by||min_ay>max_by)
return false;var dpx=b1x-a1x+b2x-a2x;var dpy=b1y-a1y+b2y-a2y;var qax=a2x-a1x;var qay=a2y-a1y;var qbx=b2x-b1x;var qby=b2y-b1y;var d=cr.abs(qay*qbx-qby*qax);var la=qbx*dpy-qby*dpx;if(cr.abs(la)>d)
return false;var lb=qax*dpy-qay*dpx;return cr.abs(lb)<=d;};function Rect(left,top,right,bottom)
{this.set(left,top,right,bottom);cr.seal(this);};Rect.prototype.set=function(left,top,right,bottom)
{this.left=left;this.top=top;this.right=right;this.bottom=bottom;};Rect.prototype.copy=function(r)
{this.left=r.left;this.top=r.top;this.right=r.right;this.bottom=r.bottom;};Rect.prototype.width=function()
{return this.right-this.left;};Rect.prototype.height=function()
{return this.bottom-this.top;};Rect.prototype.offset=function(px,py)
{this.left+=px;this.top+=py;this.right+=px;this.bottom+=py;return this;};Rect.prototype.normalize=function()
{var temp=0;if(this.left>this.right)
{temp=this.left;this.left=this.right;this.right=temp;}
if(this.top>this.bottom)
{temp=this.top;this.top=this.bottom;this.bottom=temp;}};Rect.prototype.intersects_rect=function(rc)
{return!(rc.right<this.left||rc.bottom<this.top||rc.left>this.right||rc.top>this.bottom);};Rect.prototype.intersects_rect_off=function(rc,ox,oy)
{return!(rc.right+ox<this.left||rc.bottom+oy<this.top||rc.left+ox>this.right||rc.top+oy>this.bottom);};Rect.prototype.contains_pt=function(x,y)
{return(x>=this.left&&x<=this.right)&&(y>=this.top&&y<=this.bottom);};Rect.prototype.equals=function(r)
{return this.left===r.left&&this.top===r.top&&this.right===r.right&&this.bottom===r.bottom;};cr.rect=Rect;function Quad()
{this.tlx=0;this.tly=0;this.trx=0;this.try_=0;this.brx=0;this.bry=0;this.blx=0;this.bly=0;cr.seal(this);};Quad.prototype.set_from_rect=function(rc)
{this.tlx=rc.left;this.tly=rc.top;this.trx=rc.right;this.try_=rc.top;this.brx=rc.right;this.bry=rc.bottom;this.blx=rc.left;this.bly=rc.bottom;};Quad.prototype.set_from_rotated_rect=function(rc,a)
{if(a===0)
{this.set_from_rect(rc);}
else
{var sin_a=Math.sin(a);var cos_a=Math.cos(a);var left_sin_a=rc.left*sin_a;var top_sin_a=rc.top*sin_a;var right_sin_a=rc.right*sin_a;var bottom_sin_a=rc.bottom*sin_a;var left_cos_a=rc.left*cos_a;var top_cos_a=rc.top*cos_a;var right_cos_a=rc.right*cos_a;var bottom_cos_a=rc.bottom*cos_a;this.tlx=left_cos_a-top_sin_a;this.tly=top_cos_a+left_sin_a;this.trx=right_cos_a-top_sin_a;this.try_=top_cos_a+right_sin_a;this.brx=right_cos_a-bottom_sin_a;this.bry=bottom_cos_a+right_sin_a;this.blx=left_cos_a-bottom_sin_a;this.bly=bottom_cos_a+left_sin_a;}};Quad.prototype.offset=function(px,py)
{this.tlx+=px;this.tly+=py;this.trx+=px;this.try_+=py;this.brx+=px;this.bry+=py;this.blx+=px;this.bly+=py;return this;};var minresult=0;var maxresult=0;function minmax4(a,b,c,d)
{if(a<b)
{if(c<d)
{if(a<c)
minresult=a;else
minresult=c;if(b>d)
maxresult=b;else
maxresult=d;}
else
{if(a<d)
minresult=a;else
minresult=d;if(b>c)
maxresult=b;else
maxresult=c;}}
else
{if(c<d)
{if(b<c)
minresult=b;else
minresult=c;if(a>d)
maxresult=a;else
maxresult=d;}
else
{if(b<d)
minresult=b;else
minresult=d;if(a>c)
maxresult=a;else
maxresult=c;}}};Quad.prototype.bounding_box=function(rc)
{minmax4(this.tlx,this.trx,this.brx,this.blx);rc.left=minresult;rc.right=maxresult;minmax4(this.tly,this.try_,this.bry,this.bly);rc.top=minresult;rc.bottom=maxresult;};Quad.prototype.contains_pt=function(x,y)
{var tlx=this.tlx;var tly=this.tly;var v0x=this.trx-tlx;var v0y=this.try_-tly;var v1x=this.brx-tlx;var v1y=this.bry-tly;var v2x=x-tlx;var v2y=y-tly;var dot00=v0x*v0x+v0y*v0y
var dot01=v0x*v1x+v0y*v1y
var dot02=v0x*v2x+v0y*v2y
var dot11=v1x*v1x+v1y*v1y
var dot12=v1x*v2x+v1y*v2y
var invDenom=1.0/(dot00*dot11-dot01*dot01);var u=(dot11*dot02-dot01*dot12)*invDenom;var v=(dot00*dot12-dot01*dot02)*invDenom;if((u>=0.0)&&(v>0.0)&&(u+v<1))
return true;v0x=this.blx-tlx;v0y=this.bly-tly;var dot00=v0x*v0x+v0y*v0y
var dot01=v0x*v1x+v0y*v1y
var dot02=v0x*v2x+v0y*v2y
invDenom=1.0/(dot00*dot11-dot01*dot01);u=(dot11*dot02-dot01*dot12)*invDenom;v=(dot00*dot12-dot01*dot02)*invDenom;return(u>=0.0)&&(v>0.0)&&(u+v<1);};Quad.prototype.at=function(i,xory)
{if(xory)
{switch(i)
{case 0:return this.tlx;case 1:return this.trx;case 2:return this.brx;case 3:return this.blx;case 4:return this.tlx;default:return this.tlx;}}
else
{switch(i)
{case 0:return this.tly;case 1:return this.try_;case 2:return this.bry;case 3:return this.bly;case 4:return this.tly;default:return this.tly;}}};Quad.prototype.midX=function()
{return(this.tlx+this.trx+this.brx+this.blx)/4;};Quad.prototype.midY=function()
{return(this.tly+this.try_+this.bry+this.bly)/4;};Quad.prototype.intersects_segment=function(x1,y1,x2,y2)
{if(this.contains_pt(x1,y1)||this.contains_pt(x2,y2))
return true;var a1x,a1y,a2x,a2y;var i;for(i=0;i<4;i++)
{a1x=this.at(i,true);a1y=this.at(i,false);a2x=this.at(i+1,true);a2y=this.at(i+1,false);if(cr.segments_intersect(x1,y1,x2,y2,a1x,a1y,a2x,a2y))
return true;}
return false;};Quad.prototype.intersects_quad=function(rhs)
{var midx=rhs.midX();var midy=rhs.midY();if(this.contains_pt(midx,midy))
return true;midx=this.midX();midy=this.midY();if(rhs.contains_pt(midx,midy))
return true;var a1x,a1y,a2x,a2y,b1x,b1y,b2x,b2y;var i,j;for(i=0;i<4;i++)
{for(j=0;j<4;j++)
{a1x=this.at(i,true);a1y=this.at(i,false);a2x=this.at(i+1,true);a2y=this.at(i+1,false);b1x=rhs.at(j,true);b1y=rhs.at(j,false);b2x=rhs.at(j+1,true);b2y=rhs.at(j+1,false);if(cr.segments_intersect(a1x,a1y,a2x,a2y,b1x,b1y,b2x,b2y))
return true;}}
return false;};cr.quad=Quad;cr.RGB=function(red,green,blue)
{return Math.max(Math.min(red,255),0)|(Math.max(Math.min(green,255),0)<<8)|(Math.max(Math.min(blue,255),0)<<16);};cr.GetRValue=function(rgb)
{return rgb&0xFF;};cr.GetGValue=function(rgb)
{return(rgb&0xFF00)>>8;};cr.GetBValue=function(rgb)
{return(rgb&0xFF0000)>>16;};cr.shallowCopy=function(a,b,allowOverwrite)
{var attr;for(attr in b)
{if(b.hasOwnProperty(attr))
{;a[attr]=b[attr];}}
return a;};cr.arrayRemove=function(arr,index)
{var i,len;index=cr.floor(index);if(index<0||index>=arr.length)
return;for(i=index,len=arr.length-1;i<len;i++)
arr[i]=arr[i+1];cr.truncateArray(arr,len);};cr.truncateArray=function(arr,index)
{arr.length=index;};cr.clearArray=function(arr)
{cr.truncateArray(arr,0);};cr.shallowAssignArray=function(dest,src)
{cr.clearArray(dest);var i,len;for(i=0,len=src.length;i<len;++i)
dest[i]=src[i];};cr.appendArray=function(a,b)
{a.push.apply(a,b);};cr.fastIndexOf=function(arr,item)
{var i,len;for(i=0,len=arr.length;i<len;++i)
{if(arr[i]===item)
return i;}
return-1;};cr.arrayFindRemove=function(arr,item)
{var index=cr.fastIndexOf(arr,item);if(index!==-1)
cr.arrayRemove(arr,index);};cr.clamp=function(x,a,b)
{if(x<a)
return a;else if(x>b)
return b;else
return x;};cr.to_radians=function(x)
{return x/(180.0/cr.PI);};cr.to_degrees=function(x)
{return x*(180.0/cr.PI);};cr.clamp_angle_degrees=function(a)
{a%=360;if(a<0)
a+=360;return a;};cr.clamp_angle=function(a)
{a%=2*cr.PI;if(a<0)
a+=2*cr.PI;return a;};cr.to_clamped_degrees=function(x)
{return cr.clamp_angle_degrees(cr.to_degrees(x));};cr.to_clamped_radians=function(x)
{return cr.clamp_angle(cr.to_radians(x));};cr.angleTo=function(x1,y1,x2,y2)
{var dx=x2-x1;var dy=y2-y1;return Math.atan2(dy,dx);};cr.angleDiff=function(a1,a2)
{if(a1===a2)
return 0;var s1=Math.sin(a1);var c1=Math.cos(a1);var s2=Math.sin(a2);var c2=Math.cos(a2);var n=s1*s2+c1*c2;if(n>=1)
return 0;if(n<=-1)
return cr.PI;return Math.acos(n);};cr.angleRotate=function(start,end,step)
{var ss=Math.sin(start);var cs=Math.cos(start);var se=Math.sin(end);var ce=Math.cos(end);if(Math.acos(ss*se+cs*ce)>step)
{if(cs*se-ss*ce>0)
return cr.clamp_angle(start+step);else
return cr.clamp_angle(start-step);}
else
return cr.clamp_angle(end);};cr.angleClockwise=function(a1,a2)
{var s1=Math.sin(a1);var c1=Math.cos(a1);var s2=Math.sin(a2);var c2=Math.cos(a2);return c1*s2-s1*c2<=0;};cr.rotatePtAround=function(px,py,a,ox,oy,getx)
{if(a===0)
return getx?px:py;var sin_a=Math.sin(a);var cos_a=Math.cos(a);px-=ox;py-=oy;var left_sin_a=px*sin_a;var top_sin_a=py*sin_a;var left_cos_a=px*cos_a;var top_cos_a=py*cos_a;px=left_cos_a-top_sin_a;py=top_cos_a+left_sin_a;px+=ox;py+=oy;return getx?px:py;}
cr.distanceTo=function(x1,y1,x2,y2)
{var dx=x2-x1;var dy=y2-y1;return Math.sqrt(dx*dx+dy*dy);};cr.xor=function(x,y)
{return!x!==!y;};cr.lerp=function(a,b,x)
{return a+(b-a)*x;};cr.unlerp=function(a,b,c)
{if(a===b)
return 0;return(c-a)/(b-a);};cr.anglelerp=function(a,b,x)
{var diff=cr.angleDiff(a,b);if(cr.angleClockwise(b,a))
{return a+diff*x;}
else
{return a-diff*x;}};cr.qarp=function(a,b,c,x)
{return cr.lerp(cr.lerp(a,b,x),cr.lerp(b,c,x),x);};cr.cubic=function(a,b,c,d,x)
{return cr.lerp(cr.qarp(a,b,c,x),cr.qarp(b,c,d,x),x);};cr.cosp=function(a,b,x)
{return(a+b+(a-b)*Math.cos(x*Math.PI))/2;};cr.hasAnyOwnProperty=function(o)
{var p;for(p in o)
{if(o.hasOwnProperty(p))
return true;}
return false;};cr.wipe=function(obj)
{var p;for(p in obj)
{if(obj.hasOwnProperty(p))
delete obj[p];}};var startup_time=+(new Date());cr.performance_now=function()
{if(typeof window["performance"]!=="undefined")
{var winperf=window["performance"];if(typeof winperf.now!=="undefined")
return winperf.now();else if(typeof winperf["webkitNow"]!=="undefined")
return winperf["webkitNow"]();else if(typeof winperf["mozNow"]!=="undefined")
return winperf["mozNow"]();else if(typeof winperf["msNow"]!=="undefined")
return winperf["msNow"]();}
return Date.now()-startup_time;};var isChrome=false;var isSafari=false;var isiOS=false;var isEjecta=false;if(typeof window!=="undefined")
{isChrome=/chrome/i.test(navigator.userAgent)||/chromium/i.test(navigator.userAgent);isSafari=!isChrome&&/safari/i.test(navigator.userAgent);isiOS=/(iphone|ipod|ipad)/i.test(navigator.userAgent);isEjecta=window["c2ejecta"];}
var supports_set=((!isSafari&&!isEjecta&&!isiOS)&&(typeof Set!=="undefined"&&typeof Set.prototype["forEach"]!=="undefined"));function ObjectSet_()
{this.s=null;this.items=null;this.item_count=0;if(supports_set)
{this.s=new Set();}
this.values_cache=[];this.cache_valid=true;cr.seal(this);};ObjectSet_.prototype.contains=function(x)
{if(this.isEmpty())
return false;if(supports_set)
return this.s["has"](x);else
return(this.items&&this.items.hasOwnProperty(x));};ObjectSet_.prototype.add=function(x)
{if(supports_set)
{if(!this.s["has"](x))
{this.s["add"](x);this.cache_valid=false;}}
else
{var str=x.toString();var items=this.items;if(!items)
{this.items={};this.items[str]=x;this.item_count=1;this.cache_valid=false;}
else if(!items.hasOwnProperty(str))
{items[str]=x;this.item_count++;this.cache_valid=false;}}};ObjectSet_.prototype.remove=function(x)
{if(this.isEmpty())
return;if(supports_set)
{if(this.s["has"](x))
{this.s["delete"](x);this.cache_valid=false;}}
else if(this.items)
{var str=x.toString();var items=this.items;if(items.hasOwnProperty(str))
{delete items[str];this.item_count--;this.cache_valid=false;}}};ObjectSet_.prototype.clear=function()
{if(this.isEmpty())
return;if(supports_set)
{this.s["clear"]();}
else
{this.items=null;this.item_count=0;}
cr.clearArray(this.values_cache);this.cache_valid=true;};ObjectSet_.prototype.isEmpty=function()
{return this.count()===0;};ObjectSet_.prototype.count=function()
{if(supports_set)
return this.s["size"];else
return this.item_count;};var current_arr=null;var current_index=0;function set_append_to_arr(x)
{current_arr[current_index++]=x;};ObjectSet_.prototype.update_cache=function()
{if(this.cache_valid)
return;if(supports_set)
{cr.clearArray(this.values_cache);current_arr=this.values_cache;current_index=0;this.s["forEach"](set_append_to_arr);;current_arr=null;current_index=0;}
else
{var values_cache=this.values_cache;cr.clearArray(values_cache);var p,n=0,items=this.items;if(items)
{for(p in items)
{if(items.hasOwnProperty(p))
values_cache[n++]=items[p];}};}
this.cache_valid=true;};ObjectSet_.prototype.valuesRef=function()
{this.update_cache();return this.values_cache;};cr.ObjectSet=ObjectSet_;var tmpSet=new cr.ObjectSet();cr.removeArrayDuplicates=function(arr)
{var i,len;for(i=0,len=arr.length;i<len;++i)
{tmpSet.add(arr[i]);}
cr.shallowAssignArray(arr,tmpSet.valuesRef());tmpSet.clear();};cr.arrayRemoveAllFromObjectSet=function(arr,remset)
{if(supports_set)
cr.arrayRemoveAll_set(arr,remset.s);else
cr.arrayRemoveAll_arr(arr,remset.valuesRef());};cr.arrayRemoveAll_set=function(arr,s)
{var i,j,len,item;for(i=0,j=0,len=arr.length;i<len;++i)
{item=arr[i];if(!s["has"](item))
arr[j++]=item;}
cr.truncateArray(arr,j);};cr.arrayRemoveAll_arr=function(arr,rem)
{var i,j,len,item;for(i=0,j=0,len=arr.length;i<len;++i)
{item=arr[i];if(cr.fastIndexOf(rem,item)===-1)
arr[j++]=item;}
cr.truncateArray(arr,j);};function KahanAdder_()
{this.c=0;this.y=0;this.t=0;this.sum=0;cr.seal(this);};KahanAdder_.prototype.add=function(v)
{this.y=v-this.c;this.t=this.sum+this.y;this.c=(this.t-this.sum)-this.y;this.sum=this.t;};KahanAdder_.prototype.reset=function()
{this.c=0;this.y=0;this.t=0;this.sum=0;};cr.KahanAdder=KahanAdder_;cr.regexp_escape=function(text)
{return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&");};function CollisionPoly_(pts_array_)
{this.pts_cache=[];this.bboxLeft=0;this.bboxTop=0;this.bboxRight=0;this.bboxBottom=0;this.convexpolys=null;this.set_pts(pts_array_);cr.seal(this);};CollisionPoly_.prototype.set_pts=function(pts_array_)
{this.pts_array=pts_array_;this.pts_count=pts_array_.length/2;this.pts_cache.length=pts_array_.length;this.cache_width=-1;this.cache_height=-1;this.cache_angle=0;};CollisionPoly_.prototype.is_empty=function()
{return!this.pts_array.length;};CollisionPoly_.prototype.update_bbox=function()
{var myptscache=this.pts_cache;var bboxLeft_=myptscache[0];var bboxRight_=bboxLeft_;var bboxTop_=myptscache[1];var bboxBottom_=bboxTop_;var x,y,i=1,i2,len=this.pts_count;for(;i<len;++i)
{i2=i*2;x=myptscache[i2];y=myptscache[i2+1];if(x<bboxLeft_)
bboxLeft_=x;if(x>bboxRight_)
bboxRight_=x;if(y<bboxTop_)
bboxTop_=y;if(y>bboxBottom_)
bboxBottom_=y;}
this.bboxLeft=bboxLeft_;this.bboxRight=bboxRight_;this.bboxTop=bboxTop_;this.bboxBottom=bboxBottom_;};CollisionPoly_.prototype.set_from_rect=function(rc,offx,offy)
{this.pts_cache.length=8;this.pts_count=4;var myptscache=this.pts_cache;myptscache[0]=rc.left-offx;myptscache[1]=rc.top-offy;myptscache[2]=rc.right-offx;myptscache[3]=rc.top-offy;myptscache[4]=rc.right-offx;myptscache[5]=rc.bottom-offy;myptscache[6]=rc.left-offx;myptscache[7]=rc.bottom-offy;this.cache_width=rc.right-rc.left;this.cache_height=rc.bottom-rc.top;this.update_bbox();};CollisionPoly_.prototype.set_from_quad=function(q,offx,offy,w,h)
{this.pts_cache.length=8;this.pts_count=4;var myptscache=this.pts_cache;myptscache[0]=q.tlx-offx;myptscache[1]=q.tly-offy;myptscache[2]=q.trx-offx;myptscache[3]=q.try_-offy;myptscache[4]=q.brx-offx;myptscache[5]=q.bry-offy;myptscache[6]=q.blx-offx;myptscache[7]=q.bly-offy;this.cache_width=w;this.cache_height=h;this.update_bbox();};CollisionPoly_.prototype.set_from_poly=function(r)
{this.pts_count=r.pts_count;cr.shallowAssignArray(this.pts_cache,r.pts_cache);this.bboxLeft=r.bboxLeft;this.bboxTop-r.bboxTop;this.bboxRight=r.bboxRight;this.bboxBottom=r.bboxBottom;};CollisionPoly_.prototype.cache_poly=function(w,h,a)
{if(this.cache_width===w&&this.cache_height===h&&this.cache_angle===a)
return;this.cache_width=w;this.cache_height=h;this.cache_angle=a;var i,i2,i21,len,x,y;var sina=0;var cosa=1;var myptsarray=this.pts_array;var myptscache=this.pts_cache;if(a!==0)
{sina=Math.sin(a);cosa=Math.cos(a);}
for(i=0,len=this.pts_count;i<len;i++)
{i2=i*2;i21=i2+1;x=myptsarray[i2]*w;y=myptsarray[i21]*h;myptscache[i2]=(x*cosa)-(y*sina);myptscache[i21]=(y*cosa)+(x*sina);}
this.update_bbox();};CollisionPoly_.prototype.contains_pt=function(a2x,a2y)
{var myptscache=this.pts_cache;if(a2x===myptscache[0]&&a2y===myptscache[1])
return true;var i,i2,imod,len=this.pts_count;var a1x=this.bboxLeft-110;var a1y=this.bboxTop-101;var a3x=this.bboxRight+131
var a3y=this.bboxBottom+120;var b1x,b1y,b2x,b2y;var count1=0,count2=0;for(i=0;i<len;i++)
{i2=i*2;imod=((i+1)%len)*2;b1x=myptscache[i2];b1y=myptscache[i2+1];b2x=myptscache[imod];b2y=myptscache[imod+1];if(cr.segments_intersect(a1x,a1y,a2x,a2y,b1x,b1y,b2x,b2y))
count1++;if(cr.segments_intersect(a3x,a3y,a2x,a2y,b1x,b1y,b2x,b2y))
count2++;}
return(count1%2===1)||(count2%2===1);};CollisionPoly_.prototype.intersects_poly=function(rhs,offx,offy)
{var rhspts=rhs.pts_cache;var mypts=this.pts_cache;if(this.contains_pt(rhspts[0]+offx,rhspts[1]+offy))
return true;if(rhs.contains_pt(mypts[0]-offx,mypts[1]-offy))
return true;var i,i2,imod,leni,j,j2,jmod,lenj;var a1x,a1y,a2x,a2y,b1x,b1y,b2x,b2y;for(i=0,leni=this.pts_count;i<leni;i++)
{i2=i*2;imod=((i+1)%leni)*2;a1x=mypts[i2];a1y=mypts[i2+1];a2x=mypts[imod];a2y=mypts[imod+1];for(j=0,lenj=rhs.pts_count;j<lenj;j++)
{j2=j*2;jmod=((j+1)%lenj)*2;b1x=rhspts[j2]+offx;b1y=rhspts[j2+1]+offy;b2x=rhspts[jmod]+offx;b2y=rhspts[jmod+1]+offy;if(cr.segments_intersect(a1x,a1y,a2x,a2y,b1x,b1y,b2x,b2y))
return true;}}
return false;};CollisionPoly_.prototype.intersects_segment=function(offx,offy,x1,y1,x2,y2)
{var mypts=this.pts_cache;if(this.contains_pt(x1-offx,y1-offy))
return true;var i,leni,i2,imod;var a1x,a1y,a2x,a2y;for(i=0,leni=this.pts_count;i<leni;i++)
{i2=i*2;imod=((i+1)%leni)*2;a1x=mypts[i2]+offx;a1y=mypts[i2+1]+offy;a2x=mypts[imod]+offx;a2y=mypts[imod+1]+offy;if(cr.segments_intersect(x1,y1,x2,y2,a1x,a1y,a2x,a2y))
return true;}
return false;};CollisionPoly_.prototype.mirror=function(px)
{var i,leni,i2;for(i=0,leni=this.pts_count;i<leni;++i)
{i2=i*2;this.pts_cache[i2]=px*2-this.pts_cache[i2];}};CollisionPoly_.prototype.flip=function(py)
{var i,leni,i21;for(i=0,leni=this.pts_count;i<leni;++i)
{i21=i*2+1;this.pts_cache[i21]=py*2-this.pts_cache[i21];}};CollisionPoly_.prototype.diag=function()
{var i,leni,i2,i21,temp;for(i=0,leni=this.pts_count;i<leni;++i)
{i2=i*2;i21=i2+1;temp=this.pts_cache[i2];this.pts_cache[i2]=this.pts_cache[i21];this.pts_cache[i21]=temp;}};cr.CollisionPoly=CollisionPoly_;function SparseGrid_(cellwidth_,cellheight_)
{this.cellwidth=cellwidth_;this.cellheight=cellheight_;this.cells={};};SparseGrid_.prototype.totalCellCount=0;SparseGrid_.prototype.getCell=function(x_,y_,create_if_missing)
{var ret;var col=this.cells[x_];if(!col)
{if(create_if_missing)
{ret=allocGridCell(this,x_,y_);this.cells[x_]={};this.cells[x_][y_]=ret;return ret;}
else
return null;}
ret=col[y_];if(ret)
return ret;else if(create_if_missing)
{ret=allocGridCell(this,x_,y_);this.cells[x_][y_]=ret;return ret;}
else
return null;};SparseGrid_.prototype.XToCell=function(x_)
{return cr.floor(x_/this.cellwidth);};SparseGrid_.prototype.YToCell=function(y_)
{return cr.floor(y_/this.cellheight);};SparseGrid_.prototype.update=function(inst,oldrange,newrange)
{var x,lenx,y,leny,cell;if(oldrange)
{for(x=oldrange.left,lenx=oldrange.right;x<=lenx;++x)
{for(y=oldrange.top,leny=oldrange.bottom;y<=leny;++y)
{if(newrange&&newrange.contains_pt(x,y))
continue;cell=this.getCell(x,y,false);if(!cell)
continue;cell.remove(inst);if(cell.isEmpty())
{freeGridCell(cell);this.cells[x][y]=null;}}}}
if(newrange)
{for(x=newrange.left,lenx=newrange.right;x<=lenx;++x)
{for(y=newrange.top,leny=newrange.bottom;y<=leny;++y)
{if(oldrange&&oldrange.contains_pt(x,y))
continue;this.getCell(x,y,true).insert(inst);}}}};SparseGrid_.prototype.queryRange=function(rc,result)
{var x,lenx,ystart,y,leny,cell;x=this.XToCell(rc.left);ystart=this.YToCell(rc.top);lenx=this.XToCell(rc.right);leny=this.YToCell(rc.bottom);for(;x<=lenx;++x)
{for(y=ystart;y<=leny;++y)
{cell=this.getCell(x,y,false);if(!cell)
continue;cell.dump(result);}}};cr.SparseGrid=SparseGrid_;function RenderGrid_(cellwidth_,cellheight_)
{this.cellwidth=cellwidth_;this.cellheight=cellheight_;this.cells={};};RenderGrid_.prototype.totalCellCount=0;RenderGrid_.prototype.getCell=function(x_,y_,create_if_missing)
{var ret;var col=this.cells[x_];if(!col)
{if(create_if_missing)
{ret=allocRenderCell(this,x_,y_);this.cells[x_]={};this.cells[x_][y_]=ret;return ret;}
else
return null;}
ret=col[y_];if(ret)
return ret;else if(create_if_missing)
{ret=allocRenderCell(this,x_,y_);this.cells[x_][y_]=ret;return ret;}
else
return null;};RenderGrid_.prototype.XToCell=function(x_)
{return cr.floor(x_/this.cellwidth);};RenderGrid_.prototype.YToCell=function(y_)
{return cr.floor(y_/this.cellheight);};RenderGrid_.prototype.update=function(inst,oldrange,newrange)
{var x,lenx,y,leny,cell;if(oldrange)
{for(x=oldrange.left,lenx=oldrange.right;x<=lenx;++x)
{for(y=oldrange.top,leny=oldrange.bottom;y<=leny;++y)
{if(newrange&&newrange.contains_pt(x,y))
continue;cell=this.getCell(x,y,false);if(!cell)
continue;cell.remove(inst);if(cell.isEmpty())
{freeRenderCell(cell);this.cells[x][y]=null;}}}}
if(newrange)
{for(x=newrange.left,lenx=newrange.right;x<=lenx;++x)
{for(y=newrange.top,leny=newrange.bottom;y<=leny;++y)
{if(oldrange&&oldrange.contains_pt(x,y))
continue;this.getCell(x,y,true).insert(inst);}}}};RenderGrid_.prototype.queryRange=function(left,top,right,bottom,result)
{var x,lenx,ystart,y,leny,cell;x=this.XToCell(left);ystart=this.YToCell(top);lenx=this.XToCell(right);leny=this.YToCell(bottom);for(;x<=lenx;++x)
{for(y=ystart;y<=leny;++y)
{cell=this.getCell(x,y,false);if(!cell)
continue;cell.dump(result);}}};RenderGrid_.prototype.markRangeChanged=function(rc)
{var x,lenx,ystart,y,leny,cell;x=rc.left;ystart=rc.top;lenx=rc.right;leny=rc.bottom;for(;x<=lenx;++x)
{for(y=ystart;y<=leny;++y)
{cell=this.getCell(x,y,false);if(!cell)
continue;cell.is_sorted=false;}}};cr.RenderGrid=RenderGrid_;var gridcellcache=[];function allocGridCell(grid_,x_,y_)
{var ret;SparseGrid_.prototype.totalCellCount++;if(gridcellcache.length)
{ret=gridcellcache.pop();ret.grid=grid_;ret.x=x_;ret.y=y_;return ret;}
else
return new cr.GridCell(grid_,x_,y_);};function freeGridCell(c)
{SparseGrid_.prototype.totalCellCount--;c.objects.clear();if(gridcellcache.length<1000)
gridcellcache.push(c);};function GridCell_(grid_,x_,y_)
{this.grid=grid_;this.x=x_;this.y=y_;this.objects=new cr.ObjectSet();};GridCell_.prototype.isEmpty=function()
{return this.objects.isEmpty();};GridCell_.prototype.insert=function(inst)
{this.objects.add(inst);};GridCell_.prototype.remove=function(inst)
{this.objects.remove(inst);};GridCell_.prototype.dump=function(result)
{cr.appendArray(result,this.objects.valuesRef());};cr.GridCell=GridCell_;var rendercellcache=[];function allocRenderCell(grid_,x_,y_)
{var ret;RenderGrid_.prototype.totalCellCount++;if(rendercellcache.length)
{ret=rendercellcache.pop();ret.grid=grid_;ret.x=x_;ret.y=y_;return ret;}
else
return new cr.RenderCell(grid_,x_,y_);};function freeRenderCell(c)
{RenderGrid_.prototype.totalCellCount--;c.reset();if(rendercellcache.length<1000)
rendercellcache.push(c);};function RenderCell_(grid_,x_,y_)
{this.grid=grid_;this.x=x_;this.y=y_;this.objects=[];this.is_sorted=true;this.pending_removal=new cr.ObjectSet();this.any_pending_removal=false;};RenderCell_.prototype.isEmpty=function()
{if(!this.objects.length)
{;;return true;}
if(this.objects.length>this.pending_removal.count())
return false;;this.flush_pending();return true;};RenderCell_.prototype.insert=function(inst)
{if(this.pending_removal.contains(inst))
{this.pending_removal.remove(inst);if(this.pending_removal.isEmpty())
this.any_pending_removal=false;return;}
if(this.objects.length)
{var top=this.objects[this.objects.length-1];if(top.get_zindex()>inst.get_zindex())
this.is_sorted=false;this.objects.push(inst);}
else
{this.objects.push(inst);this.is_sorted=true;};};RenderCell_.prototype.remove=function(inst)
{this.pending_removal.add(inst);this.any_pending_removal=true;if(this.pending_removal.count()>=30)
this.flush_pending();};RenderCell_.prototype.flush_pending=function()
{;if(!this.any_pending_removal)
return;if(this.pending_removal.count()===this.objects.length)
{this.reset();return;}
cr.arrayRemoveAllFromObjectSet(this.objects,this.pending_removal);this.pending_removal.clear();this.any_pending_removal=false;};function sortByInstanceZIndex(a,b)
{return a.zindex-b.zindex;};RenderCell_.prototype.ensure_sorted=function()
{if(this.is_sorted)
return;this.objects.sort(sortByInstanceZIndex);this.is_sorted=true;};RenderCell_.prototype.reset=function()
{cr.clearArray(this.objects);this.is_sorted=true;this.pending_removal.clear();this.any_pending_removal=false;};RenderCell_.prototype.dump=function(result)
{this.flush_pending();this.ensure_sorted();if(this.objects.length)
result.push(this.objects);};cr.RenderCell=RenderCell_;var fxNames=["lighter","xor","copy","destination-over","source-in","destination-in","source-out","destination-out","source-atop","destination-atop"];cr.effectToCompositeOp=function(effect)
{if(effect<=0||effect>=11)
return "source-over";return fxNames[effect-1];};cr.setGLBlend=function(this_,effect,gl)
{if(!gl)
return;this_.srcBlend=gl.ONE;this_.destBlend=gl.ONE_MINUS_SRC_ALPHA;switch(effect){case 1:this_.srcBlend=gl.ONE;this_.destBlend=gl.ONE;break;case 2:break;case 3:this_.srcBlend=gl.ONE;this_.destBlend=gl.ZERO;break;case 4:this_.srcBlend=gl.ONE_MINUS_DST_ALPHA;this_.destBlend=gl.ONE;break;case 5:this_.srcBlend=gl.DST_ALPHA;this_.destBlend=gl.ZERO;break;case 6:this_.srcBlend=gl.ZERO;this_.destBlend=gl.SRC_ALPHA;break;case 7:this_.srcBlend=gl.ONE_MINUS_DST_ALPHA;this_.destBlend=gl.ZERO;break;case 8:this_.srcBlend=gl.ZERO;this_.destBlend=gl.ONE_MINUS_SRC_ALPHA;break;case 9:this_.srcBlend=gl.DST_ALPHA;this_.destBlend=gl.ONE_MINUS_SRC_ALPHA;break;case 10:this_.srcBlend=gl.ONE_MINUS_DST_ALPHA;this_.destBlend=gl.SRC_ALPHA;break;}};cr.round6dp=function(x)
{return Math.round(x*1000000)/1000000;};cr.equals_nocase=function(a,b)
{if(typeof a!=="string"||typeof b!=="string")
return false;if(a.length!==b.length)
return false;if(a===b)
return true;return a.toLowerCase()===b.toLowerCase();};cr.isCanvasInputEvent=function(e)
{var target=e.target;if(!target)
return true;if(target===document||target===window)
return true;if(document&&document.body&&target===document.body)
return true;if(cr.equals_nocase(target.tagName,"canvas"))
return true;return false;};}());var MatrixArray=typeof Float32Array!=="undefined"?Float32Array:Array,glMatrixArrayType=MatrixArray,vec3={},mat3={},mat4={},quat4={};vec3.create=function(a){var b=new MatrixArray(3);a&&(b[0]=a[0],b[1]=a[1],b[2]=a[2]);return b};vec3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];return b};vec3.add=function(a,b,c){if(!c||a===c)return a[0]+=b[0],a[1]+=b[1],a[2]+=b[2],a;c[0]=a[0]+b[0];c[1]=a[1]+b[1];c[2]=a[2]+b[2];return c};vec3.subtract=function(a,b,c){if(!c||a===c)return a[0]-=b[0],a[1]-=b[1],a[2]-=b[2],a;c[0]=a[0]-b[0];c[1]=a[1]-b[1];c[2]=a[2]-b[2];return c};vec3.negate=function(a,b){b||(b=a);b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];return b};vec3.scale=function(a,b,c){if(!c||a===c)return a[0]*=b,a[1]*=b,a[2]*=b,a;c[0]=a[0]*b;c[1]=a[1]*b;c[2]=a[2]*b;return c};vec3.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=Math.sqrt(c*c+d*d+e*e);if(g){if(g===1)return b[0]=c,b[1]=d,b[2]=e,b}else return b[0]=0,b[1]=0,b[2]=0,b;g=1/g;b[0]=c*g;b[1]=d*g;b[2]=e*g;return b};vec3.cross=function(a,b,c){c||(c=a);var d=a[0],e=a[1],a=a[2],g=b[0],f=b[1],b=b[2];c[0]=e*b-a*f;c[1]=a*g-d*b;c[2]=d*f-e*g;return c};vec3.length=function(a){var b=a[0],c=a[1],a=a[2];return Math.sqrt(b*b+c*c+a*a)};vec3.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]};vec3.direction=function(a,b,c){c||(c=a);var d=a[0]-b[0],e=a[1]-b[1],a=a[2]-b[2],b=Math.sqrt(d*d+e*e+a*a);if(!b)return c[0]=0,c[1]=0,c[2]=0,c;b=1/b;c[0]=d*b;c[1]=e*b;c[2]=a*b;return c};vec3.lerp=function(a,b,c,d){d||(d=a);d[0]=a[0]+c*(b[0]-a[0]);d[1]=a[1]+c*(b[1]-a[1]);d[2]=a[2]+c*(b[2]-a[2]);return d};vec3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+"]"};mat3.create=function(a){var b=new MatrixArray(9);a&&(b[0]=a[0],b[1]=a[1],b[2]=a[2],b[3]=a[3],b[4]=a[4],b[5]=a[5],b[6]=a[6],b[7]=a[7],b[8]=a[8]);return b};mat3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];return b};mat3.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=1;a[5]=0;a[6]=0;a[7]=0;a[8]=1;return a};mat3.transpose=function(a,b){if(!b||a===b){var c=a[1],d=a[2],e=a[5];a[1]=a[3];a[2]=a[6];a[3]=c;a[5]=a[7];a[6]=d;a[7]=e;return a}b[0]=a[0];b[1]=a[3];b[2]=a[6];b[3]=a[1];b[4]=a[4];b[5]=a[7];b[6]=a[2];b[7]=a[5];b[8]=a[8];return b};mat3.toMat4=function(a,b){b||(b=mat4.create());b[15]=1;b[14]=0;b[13]=0;b[12]=0;b[11]=0;b[10]=a[8];b[9]=a[7];b[8]=a[6];b[7]=0;b[6]=a[5];b[5]=a[4];b[4]=a[3];b[3]=0;b[2]=a[2];b[1]=a[1];b[0]=a[0];return b};mat3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+"]"};mat4.create=function(a){var b=new MatrixArray(16);a&&(b[0]=a[0],b[1]=a[1],b[2]=a[2],b[3]=a[3],b[4]=a[4],b[5]=a[5],b[6]=a[6],b[7]=a[7],b[8]=a[8],b[9]=a[9],b[10]=a[10],b[11]=a[11],b[12]=a[12],b[13]=a[13],b[14]=a[14],b[15]=a[15]);return b};mat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15];return b};mat4.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=0;a[5]=1;a[6]=0;a[7]=0;a[8]=0;a[9]=0;a[10]=1;a[11]=0;a[12]=0;a[13]=0;a[14]=0;a[15]=1;return a};mat4.transpose=function(a,b){if(!b||a===b){var c=a[1],d=a[2],e=a[3],g=a[6],f=a[7],h=a[11];a[1]=a[4];a[2]=a[8];a[3]=a[12];a[4]=c;a[6]=a[9];a[7]=a[13];a[8]=d;a[9]=g;a[11]=a[14];a[12]=e;a[13]=f;a[14]=h;return a}b[0]=a[0];b[1]=a[4];b[2]=a[8];b[3]=a[12];b[4]=a[1];b[5]=a[5];b[6]=a[9];b[7]=a[13];b[8]=a[2];b[9]=a[6];b[10]=a[10];b[11]=a[14];b[12]=a[3];b[13]=a[7];b[14]=a[11];b[15]=a[15];return b};mat4.determinant=function(a){var b=a[0],c=a[1],d=a[2],e=a[3],g=a[4],f=a[5],h=a[6],i=a[7],j=a[8],k=a[9],l=a[10],n=a[11],o=a[12],m=a[13],p=a[14],a=a[15];return o*k*h*e-j*m*h*e-o*f*l*e+g*m*l*e+j*f*p*e-g*k*p*e-o*k*d*i+j*m*d*i+o*c*l*i-b*m*l*i-j*c*p*i+b*k*p*i+o*f*d*n-g*m*d*n-o*c*h*n+b*m*h*n+g*c*p*n-b*f*p*n-j*f*d*a+g*k*d*a+j*c*h*a-b*k*h*a-g*c*l*a+b*f*l*a};mat4.inverse=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=a[4],h=a[5],i=a[6],j=a[7],k=a[8],l=a[9],n=a[10],o=a[11],m=a[12],p=a[13],r=a[14],s=a[15],A=c*h-d*f,B=c*i-e*f,t=c*j-g*f,u=d*i-e*h,v=d*j-g*h,w=e*j-g*i,x=k*p-l*m,y=k*r-n*m,z=k*s-o*m,C=l*r-n*p,D=l*s-o*p,E=n*s-o*r,q=1/(A*E-B*D+t*C+u*z-v*y+w*x);b[0]=(h*E-i*D+j*C)*q;b[1]=(-d*E+e*D-g*C)*q;b[2]=(p*w-r*v+s*u)*q;b[3]=(-l*w+n*v-o*u)*q;b[4]=(-f*E+i*z-j*y)*q;b[5]=(c*E-e*z+g*y)*q;b[6]=(-m*w+r*t-s*B)*q;b[7]=(k*w-n*t+o*B)*q;b[8]=(f*D-h*z+j*x)*q;b[9]=(-c*D+d*z-g*x)*q;b[10]=(m*v-p*t+s*A)*q;b[11]=(-k*v+l*t-o*A)*q;b[12]=(-f*C+h*y-i*x)*q;b[13]=(c*C-d*y+e*x)*q;b[14]=(-m*u+p*B-r*A)*q;b[15]=(k*u-l*B+n*A)*q;return b};mat4.toRotationMat=function(a,b){b||(b=mat4.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};mat4.toMat3=function(a,b){b||(b=mat3.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[4];b[4]=a[5];b[5]=a[6];b[6]=a[8];b[7]=a[9];b[8]=a[10];return b};mat4.toInverseMat3=function(a,b){var c=a[0],d=a[1],e=a[2],g=a[4],f=a[5],h=a[6],i=a[8],j=a[9],k=a[10],l=k*f-h*j,n=-k*g+h*i,o=j*g-f*i,m=c*l+d*n+e*o;if(!m)return null;m=1/m;b||(b=mat3.create());b[0]=l*m;b[1]=(-k*d+e*j)*m;b[2]=(h*d-e*f)*m;b[3]=n*m;b[4]=(k*c-e*i)*m;b[5]=(-h*c+e*g)*m;b[6]=o*m;b[7]=(-j*c+d*i)*m;b[8]=(f*c-d*g)*m;return b};mat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2],f=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],n=a[9],o=a[10],m=a[11],p=a[12],r=a[13],s=a[14],a=a[15],A=b[0],B=b[1],t=b[2],u=b[3],v=b[4],w=b[5],x=b[6],y=b[7],z=b[8],C=b[9],D=b[10],E=b[11],q=b[12],F=b[13],G=b[14],b=b[15];c[0]=A*d+B*h+t*l+u*p;c[1]=A*e+B*i+t*n+u*r;c[2]=A*g+B*j+t*o+u*s;c[3]=A*f+B*k+t*m+u*a;c[4]=v*d+w*h+x*l+y*p;c[5]=v*e+w*i+x*n+y*r;c[6]=v*g+w*j+x*o+y*s;c[7]=v*f+w*k+x*m+y*a;c[8]=z*d+C*h+D*l+E*p;c[9]=z*e+C*i+D*n+E*r;c[10]=z*g+C*j+D*o+E*s;c[11]=z*f+C*k+D*m+E*a;c[12]=q*d+F*h+G*l+b*p;c[13]=q*e+F*i+G*n+b*r;c[14]=q*g+F*j+G*o+b*s;c[15]=q*f+F*k+G*m+b*a;return c};mat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1],b=b[2];c[0]=a[0]*d+a[4]*e+a[8]*b+a[12];c[1]=a[1]*d+a[5]*e+a[9]*b+a[13];c[2]=a[2]*d+a[6]*e+a[10]*b+a[14];return c};mat4.multiplyVec4=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2],b=b[3];c[0]=a[0]*d+a[4]*e+a[8]*g+a[12]*b;c[1]=a[1]*d+a[5]*e+a[9]*g+a[13]*b;c[2]=a[2]*d+a[6]*e+a[10]*g+a[14]*b;c[3]=a[3]*d+a[7]*e+a[11]*g+a[15]*b;return c};mat4.translate=function(a,b,c){var d=b[0],e=b[1],b=b[2],g,f,h,i,j,k,l,n,o,m,p,r;if(!c||a===c)return a[12]=a[0]*d+a[4]*e+a[8]*b+a[12],a[13]=a[1]*d+a[5]*e+a[9]*b+a[13],a[14]=a[2]*d+a[6]*e+a[10]*b+a[14],a[15]=a[3]*d+a[7]*e+a[11]*b+a[15],a;g=a[0];f=a[1];h=a[2];i=a[3];j=a[4];k=a[5];l=a[6];n=a[7];o=a[8];m=a[9];p=a[10];r=a[11];c[0]=g;c[1]=f;c[2]=h;c[3]=i;c[4]=j;c[5]=k;c[6]=l;c[7]=n;c[8]=o;c[9]=m;c[10]=p;c[11]=r;c[12]=g*d+j*e+o*b+a[12];c[13]=f*d+k*e+m*b+a[13];c[14]=h*d+l*e+p*b+a[14];c[15]=i*d+n*e+r*b+a[15];return c};mat4.scale=function(a,b,c){var d=b[0],e=b[1],b=b[2];if(!c||a===c)return a[0]*=d,a[1]*=d,a[2]*=d,a[3]*=d,a[4]*=e,a[5]*=e,a[6]*=e,a[7]*=e,a[8]*=b,a[9]*=b,a[10]*=b,a[11]*=b,a;c[0]=a[0]*d;c[1]=a[1]*d;c[2]=a[2]*d;c[3]=a[3]*d;c[4]=a[4]*e;c[5]=a[5]*e;c[6]=a[6]*e;c[7]=a[7]*e;c[8]=a[8]*b;c[9]=a[9]*b;c[10]=a[10]*b;c[11]=a[11]*b;c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15];return c};mat4.rotate=function(a,b,c,d){var e=c[0],g=c[1],c=c[2],f=Math.sqrt(e*e+g*g+c*c),h,i,j,k,l,n,o,m,p,r,s,A,B,t,u,v,w,x,y,z;if(!f)return null;f!==1&&(f=1/f,e*=f,g*=f,c*=f);h=Math.sin(b);i=Math.cos(b);j=1-i;b=a[0];f=a[1];k=a[2];l=a[3];n=a[4];o=a[5];m=a[6];p=a[7];r=a[8];s=a[9];A=a[10];B=a[11];t=e*e*j+i;u=g*e*j+c*h;v=c*e*j-g*h;w=e*g*j-c*h;x=g*g*j+i;y=c*g*j+e*h;z=e*c*j+g*h;e=g*c*j-e*h;g=c*c*j+i;d?a!==d&&(d[12]=a[12],d[13]=a[13],d[14]=a[14],d[15]=a[15]):d=a;d[0]=b*t+n*u+r*v;d[1]=f*t+o*u+s*v;d[2]=k*t+m*u+A*v;d[3]=l*t+p*u+B*v;d[4]=b*w+n*x+r*y;d[5]=f*w+o*x+s*y;d[6]=k*w+m*x+A*y;d[7]=l*w+p*x+B*y;d[8]=b*z+n*e+r*g;d[9]=f*z+o*e+s*g;d[10]=k*z+m*e+A*g;d[11]=l*z+p*e+B*g;return d};mat4.rotateX=function(a,b,c){var d=Math.sin(b),b=Math.cos(b),e=a[4],g=a[5],f=a[6],h=a[7],i=a[8],j=a[9],k=a[10],l=a[11];c?a!==c&&(c[0]=a[0],c[1]=a[1],c[2]=a[2],c[3]=a[3],c[12]=a[12],c[13]=a[13],c[14]=a[14],c[15]=a[15]):c=a;c[4]=e*b+i*d;c[5]=g*b+j*d;c[6]=f*b+k*d;c[7]=h*b+l*d;c[8]=e*-d+i*b;c[9]=g*-d+j*b;c[10]=f*-d+k*b;c[11]=h*-d+l*b;return c};mat4.rotateY=function(a,b,c){var d=Math.sin(b),b=Math.cos(b),e=a[0],g=a[1],f=a[2],h=a[3],i=a[8],j=a[9],k=a[10],l=a[11];c?a!==c&&(c[4]=a[4],c[5]=a[5],c[6]=a[6],c[7]=a[7],c[12]=a[12],c[13]=a[13],c[14]=a[14],c[15]=a[15]):c=a;c[0]=e*b+i*-d;c[1]=g*b+j*-d;c[2]=f*b+k*-d;c[3]=h*b+l*-d;c[8]=e*d+i*b;c[9]=g*d+j*b;c[10]=f*d+k*b;c[11]=h*d+l*b;return c};mat4.rotateZ=function(a,b,c){var d=Math.sin(b),b=Math.cos(b),e=a[0],g=a[1],f=a[2],h=a[3],i=a[4],j=a[5],k=a[6],l=a[7];c?a!==c&&(c[8]=a[8],c[9]=a[9],c[10]=a[10],c[11]=a[11],c[12]=a[12],c[13]=a[13],c[14]=a[14],c[15]=a[15]):c=a;c[0]=e*b+i*d;c[1]=g*b+j*d;c[2]=f*b+k*d;c[3]=h*b+l*d;c[4]=e*-d+i*b;c[5]=g*-d+j*b;c[6]=f*-d+k*b;c[7]=h*-d+l*b;return c};mat4.frustum=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=e*2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=e*2/i;f[6]=0;f[7]=0;f[8]=(b+a)/h;f[9]=(d+c)/i;f[10]=-(g+e)/j;f[11]=-1;f[12]=0;f[13]=0;f[14]=-(g*e*2)/j;f[15]=0;return f};mat4.perspective=function(a,b,c,d,e){a=c*Math.tan(a*Math.PI/360);b*=a;return mat4.frustum(-b,b,-a,a,c,d,e)};mat4.ortho=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=2/i;f[6]=0;f[7]=0;f[8]=0;f[9]=0;f[10]=-2/j;f[11]=0;f[12]=-(a+b)/h;f[13]=-(d+c)/i;f[14]=-(g+e)/j;f[15]=1;return f};mat4.lookAt=function(a,b,c,d){d||(d=mat4.create());var e,g,f,h,i,j,k,l,n=a[0],o=a[1],a=a[2];g=c[0];f=c[1];e=c[2];c=b[1];j=b[2];if(n===b[0]&&o===c&&a===j)return mat4.identity(d);c=n-b[0];j=o-b[1];k=a-b[2];l=1/Math.sqrt(c*c+j*j+k*k);c*=l;j*=l;k*=l;b=f*k-e*j;e=e*c-g*k;g=g*j-f*c;(l=Math.sqrt(b*b+e*e+g*g))?(l=1/l,b*=l,e*=l,g*=l):g=e=b=0;f=j*g-k*e;h=k*b-c*g;i=c*e-j*b;(l=Math.sqrt(f*f+h*h+i*i))?(l=1/l,f*=l,h*=l,i*=l):i=h=f=0;d[0]=b;d[1]=f;d[2]=c;d[3]=0;d[4]=e;d[5]=h;d[6]=j;d[7]=0;d[8]=g;d[9]=i;d[10]=k;d[11]=0;d[12]=-(b*n+e*o+g*a);d[13]=-(f*n+h*o+i*a);d[14]=-(c*n+j*o+k*a);d[15]=1;return d};mat4.fromRotationTranslation=function(a,b,c){c||(c=mat4.create());var d=a[0],e=a[1],g=a[2],f=a[3],h=d+d,i=e+e,j=g+g,a=d*h,k=d*i;d*=j;var l=e*i;e*=j;g*=j;h*=f;i*=f;f*=j;c[0]=1-(l+g);c[1]=k+f;c[2]=d-i;c[3]=0;c[4]=k-f;c[5]=1-(a+g);c[6]=e+h;c[7]=0;c[8]=d+i;c[9]=e-h;c[10]=1-(a+l);c[11]=0;c[12]=b[0];c[13]=b[1];c[14]=b[2];c[15]=1;return c};mat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+", "+a[9]+", "+a[10]+", "+a[11]+", "+a[12]+", "+a[13]+", "+a[14]+", "+a[15]+"]"};quat4.create=function(a){var b=new MatrixArray(4);a&&(b[0]=a[0],b[1]=a[1],b[2]=a[2],b[3]=a[3]);return b};quat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];return b};quat4.calculateW=function(a,b){var c=a[0],d=a[1],e=a[2];if(!b||a===b)return a[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e)),a;b[0]=c;b[1]=d;b[2]=e;b[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e));return b};quat4.inverse=function(a,b){if(!b||a===b)return a[0]*=-1,a[1]*=-1,a[2]*=-1,a;b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];b[3]=a[3];return b};quat4.length=function(a){var b=a[0],c=a[1],d=a[2],a=a[3];return Math.sqrt(b*b+c*c+d*d+a*a)};quat4.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=Math.sqrt(c*c+d*d+e*e+g*g);if(f===0)return b[0]=0,b[1]=0,b[2]=0,b[3]=0,b;f=1/f;b[0]=c*f;b[1]=d*f;b[2]=e*f;b[3]=g*f;return b};quat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2],a=a[3],f=b[0],h=b[1],i=b[2],b=b[3];c[0]=d*b+a*f+e*i-g*h;c[1]=e*b+a*h+g*f-d*i;c[2]=g*b+a*i+d*h-e*f;c[3]=a*b-d*f-e*h-g*i;return c};quat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2],b=a[0],f=a[1],h=a[2],a=a[3],i=a*d+f*g-h*e,j=a*e+h*d-b*g,k=a*g+b*e-f*d,d=-b*d-f*e-h*g;c[0]=i*a+d*-b+j*-h-k*-f;c[1]=j*a+d*-f+k*-b-i*-h;c[2]=k*a+d*-h+i*-f-j*-b;return c};quat4.toMat3=function(a,b){b||(b=mat3.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c*=i;var l=d*h;d*=i;e*=i;f*=g;h*=g;g*=i;b[0]=1-(l+e);b[1]=k+g;b[2]=c-h;b[3]=k-g;b[4]=1-(j+e);b[5]=d+f;b[6]=c+h;b[7]=d-f;b[8]=1-(j+l);return b};quat4.toMat4=function(a,b){b||(b=mat4.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c*=i;var l=d*h;d*=i;e*=i;f*=g;h*=g;g*=i;b[0]=1-(l+e);b[1]=k+g;b[2]=c-h;b[3]=0;b[4]=k-g;b[5]=1-(j+e);b[6]=d+f;b[7]=0;b[8]=c+h;b[9]=d-f;b[10]=1-(j+l);b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};quat4.slerp=function(a,b,c,d){d||(d=a);var e=a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3],g,f;if(Math.abs(e)>=1)return d!==a&&(d[0]=a[0],d[1]=a[1],d[2]=a[2],d[3]=a[3]),d;g=Math.acos(e);f=Math.sqrt(1-e*e);if(Math.abs(f)<0.001)return d[0]=a[0]*0.5+b[0]*0.5,d[1]=a[1]*0.5+b[1]*0.5,d[2]=a[2]*0.5+b[2]*0.5,d[3]=a[3]*0.5+b[3]*0.5,d;e=Math.sin((1-c)*g)/f;c=Math.sin(c*g)/f;d[0]=a[0]*e+b[0]*c;d[1]=a[1]*e+b[1]*c;d[2]=a[2]*e+b[2]*c;d[3]=a[3]*e+b[3]*c;return d};quat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+"]"};(function()
{var MAX_VERTICES=8000;var MAX_INDICES=(MAX_VERTICES/2)*3;var MAX_POINTS=8000;var MULTI_BUFFERS=4;var BATCH_NULL=0;var BATCH_QUAD=1;var BATCH_SETTEXTURE=2;var BATCH_SETOPACITY=3;var BATCH_SETBLEND=4;var BATCH_UPDATEMODELVIEW=5;var BATCH_RENDERTOTEXTURE=6;var BATCH_CLEAR=7;var BATCH_POINTS=8;var BATCH_SETPROGRAM=9;var BATCH_SETPROGRAMPARAMETERS=10;var BATCH_SETTEXTURE1=11;var BATCH_SETCOLOR=12;var BATCH_SETDEPTHTEST=13;var BATCH_SETEARLYZMODE=14;var tempMat4=mat4.create();function GLWrap_(gl,isMobile,enableFrontToBack)
{this.isIE=/msie/i.test(navigator.userAgent)||/trident/i.test(navigator.userAgent);this.width=0;this.height=0;this.enableFrontToBack=!!enableFrontToBack;this.isEarlyZPass=false;this.isBatchInEarlyZPass=false;this.currentZ=0;this.zNear=1;this.zFar=1000;this.zIncrement=((this.zFar-this.zNear)/32768);this.zA=this.zFar/(this.zFar-this.zNear);this.zB=this.zFar*this.zNear/(this.zNear-this.zFar);this.kzA=65536*this.zA;this.kzB=65536*this.zB;this.cam=vec3.create([0,0,100]);this.look=vec3.create([0,0,0]);this.up=vec3.create([0,1,0]);this.worldScale=vec3.create([1,1,1]);this.enable_mipmaps=true;this.matP=mat4.create();this.matMV=mat4.create();this.lastMV=mat4.create();this.currentMV=mat4.create();this.gl=gl;this.version=(this.gl.getParameter(this.gl.VERSION).indexOf("WebGL 2")===0?2:1);this.initState();};GLWrap_.prototype.initState=function()
{var gl=this.gl;var i,len;this.lastOpacity=1;this.lastTexture0=null;this.lastTexture1=null;this.currentOpacity=1;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.disable(gl.CULL_FACE);gl.disable(gl.STENCIL_TEST);gl.disable(gl.DITHER);if(this.enableFrontToBack)
{gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);}
else
{gl.disable(gl.DEPTH_TEST);}
this.maxTextureSize=gl.getParameter(gl.MAX_TEXTURE_SIZE);this.lastSrcBlend=gl.ONE;this.lastDestBlend=gl.ONE_MINUS_SRC_ALPHA;this.vertexData=new Float32Array(MAX_VERTICES*(this.enableFrontToBack?3:2));this.texcoordData=new Float32Array(MAX_VERTICES*2);this.pointData=new Float32Array(MAX_POINTS*4);this.pointBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.pointBuffer);gl.bufferData(gl.ARRAY_BUFFER,this.pointData.byteLength,gl.DYNAMIC_DRAW);this.vertexBuffers=new Array(MULTI_BUFFERS);this.texcoordBuffers=new Array(MULTI_BUFFERS);for(i=0;i<MULTI_BUFFERS;i++)
{this.vertexBuffers[i]=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffers[i]);gl.bufferData(gl.ARRAY_BUFFER,this.vertexData.byteLength,gl.DYNAMIC_DRAW);this.texcoordBuffers[i]=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.texcoordBuffers[i]);gl.bufferData(gl.ARRAY_BUFFER,this.texcoordData.byteLength,gl.DYNAMIC_DRAW);}
this.curBuffer=0;this.indexBuffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);var indexData=new Uint16Array(MAX_INDICES);i=0,len=MAX_INDICES;var fv=0;while(i<len)
{indexData[i++]=fv;indexData[i++]=fv+1;indexData[i++]=fv+2;indexData[i++]=fv;indexData[i++]=fv+2;indexData[i++]=fv+3;fv+=4;}
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexData,gl.STATIC_DRAW);this.vertexPtr=0;this.texPtr=0;this.pointPtr=0;var fsSource,vsSource;this.shaderPrograms=[];fsSource=["varying mediump vec2 vTex;","uniform lowp float opacity;","uniform lowp sampler2D samplerFront;","void main(void) {","	gl_FragColor = texture2D(samplerFront, vTex);","	gl_FragColor *= opacity;","}"].join("\n");if(this.enableFrontToBack)
{vsSource=["attribute highp vec3 aPos;","attribute mediump vec2 aTex;","varying mediump vec2 vTex;","uniform highp mat4 matP;","uniform highp mat4 matMV;","void main(void) {","	gl_Position = matP * matMV * vec4(aPos.x, aPos.y, aPos.z, 1.0);","	vTex = aTex;","}"].join("\n");}
else
{vsSource=["attribute highp vec2 aPos;","attribute mediump vec2 aTex;","varying mediump vec2 vTex;","uniform highp mat4 matP;","uniform highp mat4 matMV;","void main(void) {","	gl_Position = matP * matMV * vec4(aPos.x, aPos.y, 0.0, 1.0);","	vTex = aTex;","}"].join("\n");}
var shaderProg=this.createShaderProgram({src:fsSource},vsSource,"<default>");;this.shaderPrograms.push(shaderProg);fsSource=["uniform mediump sampler2D samplerFront;","varying lowp float opacity;","void main(void) {","	gl_FragColor = texture2D(samplerFront, gl_PointCoord);","	gl_FragColor *= opacity;","}"].join("\n");var pointVsSource=["attribute vec4 aPos;","varying float opacity;","uniform mat4 matP;","uniform mat4 matMV;","void main(void) {","	gl_Position = matP * matMV * vec4(aPos.x, aPos.y, 0.0, 1.0);","	gl_PointSize = aPos.z;","	opacity = aPos.w;","}"].join("\n");shaderProg=this.createShaderProgram({src:fsSource},pointVsSource,"<point>");;this.shaderPrograms.push(shaderProg);fsSource=["varying mediump vec2 vTex;","uniform lowp sampler2D samplerFront;","void main(void) {","	if (texture2D(samplerFront, vTex).a < 1.0)","		discard;","}"].join("\n");var shaderProg=this.createShaderProgram({src:fsSource},vsSource,"<earlyz>");;this.shaderPrograms.push(shaderProg);fsSource=["uniform lowp vec4 colorFill;","void main(void) {","	gl_FragColor = colorFill;","}"].join("\n");var shaderProg=this.createShaderProgram({src:fsSource},vsSource,"<fill>");;this.shaderPrograms.push(shaderProg);for(var shader_name in cr.shaders)
{if(cr.shaders.hasOwnProperty(shader_name))
this.shaderPrograms.push(this.createShaderProgram(cr.shaders[shader_name],vsSource,shader_name));}
gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,null);this.batch=[];this.batchPtr=0;this.hasQuadBatchTop=false;this.hasPointBatchTop=false;this.lastProgram=-1;this.currentProgram=-1;this.currentShader=null;this.fbo=gl.createFramebuffer();this.renderToTex=null;this.depthBuffer=null;this.attachedDepthBuffer=false;if(this.enableFrontToBack)
{this.depthBuffer=gl.createRenderbuffer();}
this.tmpVec3=vec3.create([0,0,0]);;var pointsizes=gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);this.minPointSize=pointsizes[0];this.maxPointSize=pointsizes[1];if(this.maxPointSize>2048)
this.maxPointSize=2048;;this.switchProgram(0);cr.seal(this);};function GLShaderProgram(gl,shaderProgram,name)
{this.gl=gl;this.shaderProgram=shaderProgram;this.name=name;this.locAPos=gl.getAttribLocation(shaderProgram,"aPos");this.locATex=gl.getAttribLocation(shaderProgram,"aTex");this.locMatP=gl.getUniformLocation(shaderProgram,"matP");this.locMatMV=gl.getUniformLocation(shaderProgram,"matMV");this.locOpacity=gl.getUniformLocation(shaderProgram,"opacity");this.locColorFill=gl.getUniformLocation(shaderProgram,"colorFill");this.locSamplerFront=gl.getUniformLocation(shaderProgram,"samplerFront");this.locSamplerBack=gl.getUniformLocation(shaderProgram,"samplerBack");this.locDestStart=gl.getUniformLocation(shaderProgram,"destStart");this.locDestEnd=gl.getUniformLocation(shaderProgram,"destEnd");this.locSeconds=gl.getUniformLocation(shaderProgram,"seconds");this.locPixelWidth=gl.getUniformLocation(shaderProgram,"pixelWidth");this.locPixelHeight=gl.getUniformLocation(shaderProgram,"pixelHeight");this.locLayerScale=gl.getUniformLocation(shaderProgram,"layerScale");this.locLayerAngle=gl.getUniformLocation(shaderProgram,"layerAngle");this.locViewOrigin=gl.getUniformLocation(shaderProgram,"viewOrigin");this.locScrollPos=gl.getUniformLocation(shaderProgram,"scrollPos");this.hasAnyOptionalUniforms=!!(this.locPixelWidth||this.locPixelHeight||this.locSeconds||this.locSamplerBack||this.locDestStart||this.locDestEnd||this.locLayerScale||this.locLayerAngle||this.locViewOrigin||this.locScrollPos);this.lpPixelWidth=-999;this.lpPixelHeight=-999;this.lpOpacity=1;this.lpDestStartX=0.0;this.lpDestStartY=0.0;this.lpDestEndX=1.0;this.lpDestEndY=1.0;this.lpLayerScale=1.0;this.lpLayerAngle=0.0;this.lpViewOriginX=0.0;this.lpViewOriginY=0.0;this.lpScrollPosX=0.0;this.lpScrollPosY=0.0;this.lpSeconds=0.0;this.lastCustomParams=[];this.lpMatMV=mat4.create();if(this.locOpacity)
gl.uniform1f(this.locOpacity,1);if(this.locColorFill)
gl.uniform4f(this.locColorFill,1.0,1.0,1.0,1.0);if(this.locSamplerFront)
gl.uniform1i(this.locSamplerFront,0);if(this.locSamplerBack)
gl.uniform1i(this.locSamplerBack,1);if(this.locDestStart)
gl.uniform2f(this.locDestStart,0.0,0.0);if(this.locDestEnd)
gl.uniform2f(this.locDestEnd,1.0,1.0);if(this.locLayerScale)
gl.uniform1f(this.locLayerScale,1.0);if(this.locLayerAngle)
gl.uniform1f(this.locLayerAngle,0.0);if(this.locViewOrigin)
gl.uniform2f(this.locViewOrigin,0.0,0.0);if(this.locScrollPos)
gl.uniform2f(this.locScrollPos,0.0,0.0);if(this.locSeconds)
gl.uniform1f(this.locSeconds,0.0);this.hasCurrentMatMV=false;};function areMat4sEqual(a,b)
{return a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2]&&a[3]===b[3]&&a[4]===b[4]&&a[5]===b[5]&&a[6]===b[6]&&a[7]===b[7]&&a[8]===b[8]&&a[9]===b[9]&&a[10]===b[10]&&a[11]===b[11]&&a[12]===b[12]&&a[13]===b[13]&&a[14]===b[14]&&a[15]===b[15];};GLShaderProgram.prototype.updateMatMV=function(mv)
{if(areMat4sEqual(this.lpMatMV,mv))
return;mat4.set(mv,this.lpMatMV);this.gl.uniformMatrix4fv(this.locMatMV,false,mv);};GLWrap_.prototype.createShaderProgram=function(shaderEntry,vsSource,name)
{var gl=this.gl;var fragmentShader=gl.createShader(gl.FRAGMENT_SHADER);gl.shaderSource(fragmentShader,shaderEntry.src);gl.compileShader(fragmentShader);if(!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS))
{var compilationlog=gl.getShaderInfoLog(fragmentShader);gl.deleteShader(fragmentShader);throw new Error("error compiling fragment shader: "+compilationlog);}
var vertexShader=gl.createShader(gl.VERTEX_SHADER);gl.shaderSource(vertexShader,vsSource);gl.compileShader(vertexShader);if(!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS))
{var compilationlog=gl.getShaderInfoLog(vertexShader);gl.deleteShader(fragmentShader);gl.deleteShader(vertexShader);throw new Error("error compiling vertex shader: "+compilationlog);}
var shaderProgram=gl.createProgram();gl.attachShader(shaderProgram,fragmentShader);gl.attachShader(shaderProgram,vertexShader);gl.linkProgram(shaderProgram);if(!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS))
{var compilationlog=gl.getProgramInfoLog(shaderProgram);gl.deleteShader(fragmentShader);gl.deleteShader(vertexShader);gl.deleteProgram(shaderProgram);throw new Error("error linking shader program: "+compilationlog);}
gl.useProgram(shaderProgram);gl.deleteShader(fragmentShader);gl.deleteShader(vertexShader);var ret=new GLShaderProgram(gl,shaderProgram,name);ret.extendBoxHorizontal=shaderEntry.extendBoxHorizontal||0;ret.extendBoxVertical=shaderEntry.extendBoxVertical||0;ret.crossSampling=!!shaderEntry.crossSampling;ret.preservesOpaqueness=!!shaderEntry.preservesOpaqueness;ret.animated=!!shaderEntry.animated;ret.parameters=shaderEntry.parameters||[];var i,len;for(i=0,len=ret.parameters.length;i<len;i++)
{ret.parameters[i][1]=gl.getUniformLocation(shaderProgram,ret.parameters[i][0]);ret.lastCustomParams.push(0);gl.uniform1f(ret.parameters[i][1],0);}
cr.seal(ret);return ret;};GLWrap_.prototype.getShaderIndex=function(name_)
{var i,len;for(i=0,len=this.shaderPrograms.length;i<len;i++)
{if(this.shaderPrograms[i].name===name_)
return i;}
return-1;};GLWrap_.prototype.project=function(x,y,out)
{var mv=this.matMV;var proj=this.matP;var fTempo=[0,0,0,0,0,0,0,0];fTempo[0]=mv[0]*x+mv[4]*y+mv[12];fTempo[1]=mv[1]*x+mv[5]*y+mv[13];fTempo[2]=mv[2]*x+mv[6]*y+mv[14];fTempo[3]=mv[3]*x+mv[7]*y+mv[15];fTempo[4]=proj[0]*fTempo[0]+proj[4]*fTempo[1]+proj[8]*fTempo[2]+proj[12]*fTempo[3];fTempo[5]=proj[1]*fTempo[0]+proj[5]*fTempo[1]+proj[9]*fTempo[2]+proj[13]*fTempo[3];fTempo[6]=proj[2]*fTempo[0]+proj[6]*fTempo[1]+proj[10]*fTempo[2]+proj[14]*fTempo[3];fTempo[7]=-fTempo[2];if(fTempo[7]===0.0)
return;fTempo[7]=1.0/fTempo[7];fTempo[4]*=fTempo[7];fTempo[5]*=fTempo[7];fTempo[6]*=fTempo[7];out[0]=(fTempo[4]*0.5+0.5)*this.width;out[1]=(fTempo[5]*0.5+0.5)*this.height;};GLWrap_.prototype.setSize=function(w,h,force)
{if(this.width===w&&this.height===h&&!force)
return;this.endBatch();var gl=this.gl;this.width=w;this.height=h;gl.viewport(0,0,w,h);mat4.lookAt(this.cam,this.look,this.up,this.matMV);if(this.enableFrontToBack)
{mat4.ortho(-w/2,w/2,h/2,-h/2,this.zNear,this.zFar,this.matP);this.worldScale[0]=1;this.worldScale[1]=1;}
else
{mat4.perspective(45,w/h,this.zNear,this.zFar,this.matP);var tl=[0,0];var br=[0,0];this.project(0,0,tl);this.project(1,1,br);this.worldScale[0]=1/(br[0]-tl[0]);this.worldScale[1]=-1/(br[1]-tl[1]);}
var i,len,s;for(i=0,len=this.shaderPrograms.length;i<len;i++)
{s=this.shaderPrograms[i];s.hasCurrentMatMV=false;if(s.locMatP)
{gl.useProgram(s.shaderProgram);gl.uniformMatrix4fv(s.locMatP,false,this.matP);}}
gl.useProgram(this.shaderPrograms[this.lastProgram].shaderProgram);gl.bindTexture(gl.TEXTURE_2D,null);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,null);gl.activeTexture(gl.TEXTURE0);this.lastTexture0=null;this.lastTexture1=null;if(this.depthBuffer)
{gl.bindFramebuffer(gl.FRAMEBUFFER,this.fbo);gl.bindRenderbuffer(gl.RENDERBUFFER,this.depthBuffer);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,this.width,this.height);if(!this.attachedDepthBuffer)
{gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,this.depthBuffer);this.attachedDepthBuffer=true;}
gl.bindRenderbuffer(gl.RENDERBUFFER,null);gl.bindFramebuffer(gl.FRAMEBUFFER,null);this.renderToTex=null;}};GLWrap_.prototype.resetModelView=function()
{mat4.lookAt(this.cam,this.look,this.up,this.matMV);mat4.scale(this.matMV,this.worldScale);};GLWrap_.prototype.translate=function(x,y)
{if(x===0&&y===0)
return;this.tmpVec3[0]=x;this.tmpVec3[1]=y;this.tmpVec3[2]=0;mat4.translate(this.matMV,this.tmpVec3);};GLWrap_.prototype.scale=function(x,y)
{if(x===1&&y===1)
return;this.tmpVec3[0]=x;this.tmpVec3[1]=y;this.tmpVec3[2]=1;mat4.scale(this.matMV,this.tmpVec3);};GLWrap_.prototype.rotateZ=function(a)
{if(a===0)
return;mat4.rotateZ(this.matMV,a);};GLWrap_.prototype.updateModelView=function()
{if(areMat4sEqual(this.lastMV,this.matMV))
return;var b=this.pushBatch();b.type=BATCH_UPDATEMODELVIEW;if(b.mat4param)
mat4.set(this.matMV,b.mat4param);else
b.mat4param=mat4.create(this.matMV);mat4.set(this.matMV,this.lastMV);this.hasQuadBatchTop=false;this.hasPointBatchTop=false;};GLWrap_.prototype.setEarlyZIndex=function(i)
{if(!this.enableFrontToBack)
return;if(i>32760)
i=32760;this.currentZ=this.cam[2]-this.zNear-i*this.zIncrement;};function GLBatchJob(type_,glwrap_)
{this.type=type_;this.glwrap=glwrap_;this.gl=glwrap_.gl;this.opacityParam=0;this.startIndex=0;this.indexCount=0;this.texParam=null;this.mat4param=null;this.shaderParams=[];cr.seal(this);};GLBatchJob.prototype.doSetEarlyZPass=function()
{var gl=this.gl;var glwrap=this.glwrap;if(this.startIndex!==0)
{gl.depthMask(true);gl.colorMask(false,false,false,false);gl.disable(gl.BLEND);gl.bindFramebuffer(gl.FRAMEBUFFER,glwrap.fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,null,0);gl.clear(gl.DEPTH_BUFFER_BIT);gl.bindFramebuffer(gl.FRAMEBUFFER,null);glwrap.isBatchInEarlyZPass=true;}
else
{gl.depthMask(false);gl.colorMask(true,true,true,true);gl.enable(gl.BLEND);glwrap.isBatchInEarlyZPass=false;}};GLBatchJob.prototype.doSetTexture=function()
{this.gl.bindTexture(this.gl.TEXTURE_2D,this.texParam);};GLBatchJob.prototype.doSetTexture1=function()
{var gl=this.gl;gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.texParam);gl.activeTexture(gl.TEXTURE0);};GLBatchJob.prototype.doSetOpacity=function()
{var o=this.opacityParam;var glwrap=this.glwrap;glwrap.currentOpacity=o;var curProg=glwrap.currentShader;if(curProg.locOpacity&&curProg.lpOpacity!==o)
{curProg.lpOpacity=o;this.gl.uniform1f(curProg.locOpacity,o);}};GLBatchJob.prototype.doQuad=function()
{this.gl.drawElements(this.gl.TRIANGLES,this.indexCount,this.gl.UNSIGNED_SHORT,this.startIndex);};GLBatchJob.prototype.doSetBlend=function()
{this.gl.blendFunc(this.startIndex,this.indexCount);};GLBatchJob.prototype.doUpdateModelView=function()
{var i,len,s,shaderPrograms=this.glwrap.shaderPrograms,currentProgram=this.glwrap.currentProgram;for(i=0,len=shaderPrograms.length;i<len;i++)
{s=shaderPrograms[i];if(i===currentProgram&&s.locMatMV)
{s.updateMatMV(this.mat4param);s.hasCurrentMatMV=true;}
else
s.hasCurrentMatMV=false;}
mat4.set(this.mat4param,this.glwrap.currentMV);};GLBatchJob.prototype.doRenderToTexture=function()
{var gl=this.gl;var glwrap=this.glwrap;if(this.texParam)
{if(glwrap.lastTexture1===this.texParam)
{gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,null);glwrap.lastTexture1=null;gl.activeTexture(gl.TEXTURE0);}
gl.bindFramebuffer(gl.FRAMEBUFFER,glwrap.fbo);if(!glwrap.isBatchInEarlyZPass)
{gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,this.texParam,0);}}
else
{if(!glwrap.enableFrontToBack)
{gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,null,0);}
gl.bindFramebuffer(gl.FRAMEBUFFER,null);}};GLBatchJob.prototype.doClear=function()
{var gl=this.gl;var mode=this.startIndex;if(mode===0)
{gl.clearColor(this.mat4param[0],this.mat4param[1],this.mat4param[2],this.mat4param[3]);gl.clear(gl.COLOR_BUFFER_BIT);}
else if(mode===1)
{gl.enable(gl.SCISSOR_TEST);gl.scissor(this.mat4param[0],this.mat4param[1],this.mat4param[2],this.mat4param[3]);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.disable(gl.SCISSOR_TEST);}
else
{gl.clear(gl.DEPTH_BUFFER_BIT);}};GLBatchJob.prototype.doSetDepthTestEnabled=function()
{var gl=this.gl;var enable=this.startIndex;if(enable!==0)
{gl.enable(gl.DEPTH_TEST);}
else
{gl.disable(gl.DEPTH_TEST);}};GLBatchJob.prototype.doPoints=function()
{var gl=this.gl;var glwrap=this.glwrap;if(glwrap.enableFrontToBack)
gl.disable(gl.DEPTH_TEST);var s=glwrap.shaderPrograms[1];gl.useProgram(s.shaderProgram);if(!s.hasCurrentMatMV&&s.locMatMV)
{s.updateMatMV(glwrap.currentMV);s.hasCurrentMatMV=true;}
gl.enableVertexAttribArray(s.locAPos);gl.bindBuffer(gl.ARRAY_BUFFER,glwrap.pointBuffer);gl.vertexAttribPointer(s.locAPos,4,gl.FLOAT,false,0,0);gl.drawArrays(gl.POINTS,this.startIndex/4,this.indexCount);s=glwrap.currentShader;gl.useProgram(s.shaderProgram);if(s.locAPos>=0)
{gl.enableVertexAttribArray(s.locAPos);gl.bindBuffer(gl.ARRAY_BUFFER,glwrap.vertexBuffers[glwrap.curBuffer]);gl.vertexAttribPointer(s.locAPos,glwrap.enableFrontToBack?3:2,gl.FLOAT,false,0,0);}
if(s.locATex>=0)
{gl.enableVertexAttribArray(s.locATex);gl.bindBuffer(gl.ARRAY_BUFFER,glwrap.texcoordBuffers[glwrap.curBuffer]);gl.vertexAttribPointer(s.locATex,2,gl.FLOAT,false,0,0);}
if(glwrap.enableFrontToBack)
gl.enable(gl.DEPTH_TEST);};GLBatchJob.prototype.doSetProgram=function()
{var gl=this.gl;var glwrap=this.glwrap;var s=glwrap.shaderPrograms[this.startIndex];glwrap.currentProgram=this.startIndex;glwrap.currentShader=s;gl.useProgram(s.shaderProgram);if(!s.hasCurrentMatMV&&s.locMatMV)
{s.updateMatMV(glwrap.currentMV);s.hasCurrentMatMV=true;}
if(s.locOpacity&&s.lpOpacity!==glwrap.currentOpacity)
{s.lpOpacity=glwrap.currentOpacity;gl.uniform1f(s.locOpacity,glwrap.currentOpacity);}
if(s.locAPos>=0)
{gl.enableVertexAttribArray(s.locAPos);gl.bindBuffer(gl.ARRAY_BUFFER,glwrap.vertexBuffers[glwrap.curBuffer]);gl.vertexAttribPointer(s.locAPos,glwrap.enableFrontToBack?3:2,gl.FLOAT,false,0,0);}
if(s.locATex>=0)
{gl.enableVertexAttribArray(s.locATex);gl.bindBuffer(gl.ARRAY_BUFFER,glwrap.texcoordBuffers[glwrap.curBuffer]);gl.vertexAttribPointer(s.locATex,2,gl.FLOAT,false,0,0);}}
GLBatchJob.prototype.doSetColor=function()
{var s=this.glwrap.currentShader;var mat4param=this.mat4param;this.gl.uniform4f(s.locColorFill,mat4param[0],mat4param[1],mat4param[2],mat4param[3]);};GLBatchJob.prototype.doSetProgramParameters=function()
{var i,len,s=this.glwrap.currentShader;var gl=this.gl;var mat4param=this.mat4param;if(s.locSamplerBack&&this.glwrap.lastTexture1!==this.texParam)
{gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.texParam);this.glwrap.lastTexture1=this.texParam;gl.activeTexture(gl.TEXTURE0);}
var v=mat4param[0];var v2;if(s.locPixelWidth&&v!==s.lpPixelWidth)
{s.lpPixelWidth=v;gl.uniform1f(s.locPixelWidth,v);}
v=mat4param[1];if(s.locPixelHeight&&v!==s.lpPixelHeight)
{s.lpPixelHeight=v;gl.uniform1f(s.locPixelHeight,v);}
v=mat4param[2];v2=mat4param[3];if(s.locDestStart&&(v!==s.lpDestStartX||v2!==s.lpDestStartY))
{s.lpDestStartX=v;s.lpDestStartY=v2;gl.uniform2f(s.locDestStart,v,v2);}
v=mat4param[4];v2=mat4param[5];if(s.locDestEnd&&(v!==s.lpDestEndX||v2!==s.lpDestEndY))
{s.lpDestEndX=v;s.lpDestEndY=v2;gl.uniform2f(s.locDestEnd,v,v2);}
v=mat4param[6];if(s.locLayerScale&&v!==s.lpLayerScale)
{s.lpLayerScale=v;gl.uniform1f(s.locLayerScale,v);}
v=mat4param[7];if(s.locLayerAngle&&v!==s.lpLayerAngle)
{s.lpLayerAngle=v;gl.uniform1f(s.locLayerAngle,v);}
v=mat4param[8];v2=mat4param[9];if(s.locViewOrigin&&(v!==s.lpViewOriginX||v2!==s.lpViewOriginY))
{s.lpViewOriginX=v;s.lpViewOriginY=v2;gl.uniform2f(s.locViewOrigin,v,v2);}
v=mat4param[10];v2=mat4param[11];if(s.locScrollPos&&(v!==s.lpScrollPosX||v2!==s.lpScrollPosY))
{s.lpScrollPosX=v;s.lpScrollPosY=v2;gl.uniform2f(s.locScrollPos,v,v2);}
v=mat4param[12];if(s.locSeconds&&v!==s.lpSeconds)
{s.lpSeconds=v;gl.uniform1f(s.locSeconds,v);}
if(s.parameters.length)
{for(i=0,len=s.parameters.length;i<len;i++)
{v=this.shaderParams[i];if(v!==s.lastCustomParams[i])
{s.lastCustomParams[i]=v;gl.uniform1f(s.parameters[i][1],v);}}}};GLWrap_.prototype.pushBatch=function()
{if(this.batchPtr===this.batch.length)
this.batch.push(new GLBatchJob(BATCH_NULL,this));return this.batch[this.batchPtr++];};GLWrap_.prototype.endBatch=function()
{if(this.batchPtr===0)
return;if(this.gl.isContextLost())
return;var gl=this.gl;if(this.pointPtr>0)
{gl.bindBuffer(gl.ARRAY_BUFFER,this.pointBuffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,this.pointData.subarray(0,this.pointPtr));if(s&&s.locAPos>=0&&s.name==="<point>")
gl.vertexAttribPointer(s.locAPos,4,gl.FLOAT,false,0,0);}
if(this.vertexPtr>0)
{var s=this.currentShader;gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffers[this.curBuffer]);gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexData.subarray(0,this.vertexPtr));if(s&&s.locAPos>=0&&s.name!=="<point>")
gl.vertexAttribPointer(s.locAPos,this.enableFrontToBack?3:2,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,this.texcoordBuffers[this.curBuffer]);gl.bufferSubData(gl.ARRAY_BUFFER,0,this.texcoordData.subarray(0,this.texPtr));if(s&&s.locATex>=0&&s.name!=="<point>")
gl.vertexAttribPointer(s.locATex,2,gl.FLOAT,false,0,0);}
var i,len,b;for(i=0,len=this.batchPtr;i<len;i++)
{b=this.batch[i];switch(b.type){case 1:b.doQuad();break;case 2:b.doSetTexture();break;case 3:b.doSetOpacity();break;case 4:b.doSetBlend();break;case 5:b.doUpdateModelView();break;case 6:b.doRenderToTexture();break;case 7:b.doClear();break;case 8:b.doPoints();break;case 9:b.doSetProgram();break;case 10:b.doSetProgramParameters();break;case 11:b.doSetTexture1();break;case 12:b.doSetColor();break;case 13:b.doSetDepthTestEnabled();break;case 14:b.doSetEarlyZPass();break;}}
this.batchPtr=0;this.vertexPtr=0;this.texPtr=0;this.pointPtr=0;this.hasQuadBatchTop=false;this.hasPointBatchTop=false;this.isBatchInEarlyZPass=false;this.curBuffer++;if(this.curBuffer>=MULTI_BUFFERS)
this.curBuffer=0;};GLWrap_.prototype.setOpacity=function(op)
{if(op===this.lastOpacity)
return;if(this.isEarlyZPass)
return;var b=this.pushBatch();b.type=BATCH_SETOPACITY;b.opacityParam=op;this.lastOpacity=op;this.hasQuadBatchTop=false;this.hasPointBatchTop=false;};GLWrap_.prototype.setTexture=function(tex)
{if(tex===this.lastTexture0)
return;;var b=this.pushBatch();b.type=BATCH_SETTEXTURE;b.texParam=tex;this.lastTexture0=tex;this.hasQuadBatchTop=false;this.hasPointBatchTop=false;};GLWrap_.prototype.setBlend=function(s,d)
{if(s===this.lastSrcBlend&&d===this.lastDestBlend)
return;if(this.isEarlyZPass)
return;var b=this.pushBatch();b.type=BATCH_SETBLEND;b.startIndex=s;b.indexCount=d;this.lastSrcBlend=s;this.lastDestBlend=d;this.hasQuadBatchTop=false;this.hasPointBatchTop=false;};GLWrap_.prototype.isPremultipliedAlphaBlend=function()
{return(this.lastSrcBlend===this.gl.ONE&&this.lastDestBlend===this.gl.ONE_MINUS_SRC_ALPHA);};GLWrap_.prototype.setAlphaBlend=function()
{this.setBlend(this.gl.ONE,this.gl.ONE_MINUS_SRC_ALPHA);};GLWrap_.prototype.setNoPremultiplyAlphaBlend=function()
{this.setBlend(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA);};var LAST_VERTEX=MAX_VERTICES*2-8;GLWrap_.prototype.quad=function(tlx,tly,trx,try_,brx,bry,blx,bly)
{if(this.vertexPtr>=LAST_VERTEX)
this.endBatch();var v=this.vertexPtr;var t=this.texPtr;var vd=this.vertexData;var td=this.texcoordData;var currentZ=this.currentZ;if(this.hasQuadBatchTop)
{this.batch[this.batchPtr-1].indexCount+=6;}
else
{var b=this.pushBatch();b.type=BATCH_QUAD;b.startIndex=this.enableFrontToBack?v:(v/2)*3;b.indexCount=6;this.hasQuadBatchTop=true;this.hasPointBatchTop=false;}
if(this.enableFrontToBack)
{vd[v++]=tlx;vd[v++]=tly;vd[v++]=currentZ;vd[v++]=trx;vd[v++]=try_;vd[v++]=currentZ;vd[v++]=brx;vd[v++]=bry;vd[v++]=currentZ;vd[v++]=blx;vd[v++]=bly;vd[v++]=currentZ;}
else
{vd[v++]=tlx;vd[v++]=tly;vd[v++]=trx;vd[v++]=try_;vd[v++]=brx;vd[v++]=bry;vd[v++]=blx;vd[v++]=bly;}
td[t++]=0;td[t++]=0;td[t++]=1;td[t++]=0;td[t++]=1;td[t++]=1;td[t++]=0;td[t++]=1;this.vertexPtr=v;this.texPtr=t;};GLWrap_.prototype.quadTex=function(tlx,tly,trx,try_,brx,bry,blx,bly,rcTex)
{if(this.vertexPtr>=LAST_VERTEX)
this.endBatch();var v=this.vertexPtr;var t=this.texPtr;var vd=this.vertexData;var td=this.texcoordData;var currentZ=this.currentZ;if(this.hasQuadBatchTop)
{this.batch[this.batchPtr-1].indexCount+=6;}
else
{var b=this.pushBatch();b.type=BATCH_QUAD;b.startIndex=this.enableFrontToBack?v:(v/2)*3;b.indexCount=6;this.hasQuadBatchTop=true;this.hasPointBatchTop=false;}
var rc_left=rcTex.left;var rc_top=rcTex.top;var rc_right=rcTex.right;var rc_bottom=rcTex.bottom;if(this.enableFrontToBack)
{vd[v++]=tlx;vd[v++]=tly;vd[v++]=currentZ;vd[v++]=trx;vd[v++]=try_;vd[v++]=currentZ;vd[v++]=brx;vd[v++]=bry;vd[v++]=currentZ;vd[v++]=blx;vd[v++]=bly;vd[v++]=currentZ;}
else
{vd[v++]=tlx;vd[v++]=tly;vd[v++]=trx;vd[v++]=try_;vd[v++]=brx;vd[v++]=bry;vd[v++]=blx;vd[v++]=bly;}
td[t++]=rc_left;td[t++]=rc_top;td[t++]=rc_right;td[t++]=rc_top;td[t++]=rc_right;td[t++]=rc_bottom;td[t++]=rc_left;td[t++]=rc_bottom;this.vertexPtr=v;this.texPtr=t;};GLWrap_.prototype.quadTexUV=function(tlx,tly,trx,try_,brx,bry,blx,bly,tlu,tlv,tru,trv,bru,brv,blu,blv)
{if(this.vertexPtr>=LAST_VERTEX)
this.endBatch();var v=this.vertexPtr;var t=this.texPtr;var vd=this.vertexData;var td=this.texcoordData;var currentZ=this.currentZ;if(this.hasQuadBatchTop)
{this.batch[this.batchPtr-1].indexCount+=6;}
else
{var b=this.pushBatch();b.type=BATCH_QUAD;b.startIndex=this.enableFrontToBack?v:(v/2)*3;b.indexCount=6;this.hasQuadBatchTop=true;this.hasPointBatchTop=false;}
if(this.enableFrontToBack)
{vd[v++]=tlx;vd[v++]=tly;vd[v++]=currentZ;vd[v++]=trx;vd[v++]=try_;vd[v++]=currentZ;vd[v++]=brx;vd[v++]=bry;vd[v++]=currentZ;vd[v++]=blx;vd[v++]=bly;vd[v++]=currentZ;}
else
{vd[v++]=tlx;vd[v++]=tly;vd[v++]=trx;vd[v++]=try_;vd[v++]=brx;vd[v++]=bry;vd[v++]=blx;vd[v++]=bly;}
td[t++]=tlu;td[t++]=tlv;td[t++]=tru;td[t++]=trv;td[t++]=bru;td[t++]=brv;td[t++]=blu;td[t++]=blv;this.vertexPtr=v;this.texPtr=t;};GLWrap_.prototype.convexPoly=function(pts)
{var pts_count=pts.length/2;;var tris=pts_count-2;var last_tri=tris-1;var p0x=pts[0];var p0y=pts[1];var i,i2,p1x,p1y,p2x,p2y,p3x,p3y;for(i=0;i<tris;i+=2)
{i2=i*2;p1x=pts[i2+2];p1y=pts[i2+3];p2x=pts[i2+4];p2y=pts[i2+5];if(i===last_tri)
{this.quad(p0x,p0y,p1x,p1y,p2x,p2y,p2x,p2y);}
else
{p3x=pts[i2+6];p3y=pts[i2+7];this.quad(p0x,p0y,p1x,p1y,p2x,p2y,p3x,p3y);}}};var LAST_POINT=MAX_POINTS-4;GLWrap_.prototype.point=function(x_,y_,size_,opacity_)
{if(this.pointPtr>=LAST_POINT)
this.endBatch();var p=this.pointPtr;var pd=this.pointData;if(this.hasPointBatchTop)
{this.batch[this.batchPtr-1].indexCount++;}
else
{var b=this.pushBatch();b.type=BATCH_POINTS;b.startIndex=p;b.indexCount=1;this.hasPointBatchTop=true;this.hasQuadBatchTop=false;}
pd[p++]=x_;pd[p++]=y_;pd[p++]=size_;pd[p++]=opacity_;this.pointPtr=p;};GLWrap_.prototype.switchProgram=function(progIndex)
{if(this.lastProgram===progIndex)
return;var shaderProg=this.shaderPrograms[progIndex];if(!shaderProg)
{if(this.lastProgram===0)
return;progIndex=0;shaderProg=this.shaderPrograms[0];}
var b=this.pushBatch();b.type=BATCH_SETPROGRAM;b.startIndex=progIndex;this.lastProgram=progIndex;this.hasQuadBatchTop=false;this.hasPointBatchTop=false;};GLWrap_.prototype.programUsesDest=function(progIndex)
{var s=this.shaderPrograms[progIndex];return!!(s.locDestStart||s.locDestEnd);};GLWrap_.prototype.programUsesCrossSampling=function(progIndex)
{var s=this.shaderPrograms[progIndex];return!!(s.locDestStart||s.locDestEnd||s.crossSampling);};GLWrap_.prototype.programPreservesOpaqueness=function(progIndex)
{return this.shaderPrograms[progIndex].preservesOpaqueness;};GLWrap_.prototype.programExtendsBox=function(progIndex)
{var s=this.shaderPrograms[progIndex];return s.extendBoxHorizontal!==0||s.extendBoxVertical!==0;};GLWrap_.prototype.getProgramBoxExtendHorizontal=function(progIndex)
{return this.shaderPrograms[progIndex].extendBoxHorizontal;};GLWrap_.prototype.getProgramBoxExtendVertical=function(progIndex)
{return this.shaderPrograms[progIndex].extendBoxVertical;};GLWrap_.prototype.getProgramParameterType=function(progIndex,paramIndex)
{return this.shaderPrograms[progIndex].parameters[paramIndex][2];};GLWrap_.prototype.programIsAnimated=function(progIndex)
{return this.shaderPrograms[progIndex].animated;};GLWrap_.prototype.setProgramParameters=function(backTex,pixelWidth,pixelHeight,destStartX,destStartY,destEndX,destEndY,layerScale,layerAngle,viewOriginLeft,viewOriginTop,scrollPosX,scrollPosY,seconds,params)
{var i,len;var s=this.shaderPrograms[this.lastProgram];var b,mat4param,shaderParams;if(s.hasAnyOptionalUniforms||params.length)
{b=this.pushBatch();b.type=BATCH_SETPROGRAMPARAMETERS;if(b.mat4param)
mat4.set(this.matMV,b.mat4param);else
b.mat4param=mat4.create();mat4param=b.mat4param;mat4param[0]=pixelWidth;mat4param[1]=pixelHeight;mat4param[2]=destStartX;mat4param[3]=destStartY;mat4param[4]=destEndX;mat4param[5]=destEndY;mat4param[6]=layerScale;mat4param[7]=layerAngle;mat4param[8]=viewOriginLeft;mat4param[9]=viewOriginTop;mat4param[10]=scrollPosX;mat4param[11]=scrollPosY;mat4param[12]=seconds;if(s.locSamplerBack)
{;b.texParam=backTex;}
else
b.texParam=null;if(params.length)
{shaderParams=b.shaderParams;shaderParams.length=params.length;for(i=0,len=params.length;i<len;i++)
shaderParams[i]=params[i];}
this.hasQuadBatchTop=false;this.hasPointBatchTop=false;}};GLWrap_.prototype.clear=function(r,g,b_,a)
{var b=this.pushBatch();b.type=BATCH_CLEAR;b.startIndex=0;if(!b.mat4param)
b.mat4param=mat4.create();b.mat4param[0]=r;b.mat4param[1]=g;b.mat4param[2]=b_;b.mat4param[3]=a;this.hasQuadBatchTop=false;this.hasPointBatchTop=false;};GLWrap_.prototype.clearRect=function(x,y,w,h)
{if(w<0||h<0)
return;var b=this.pushBatch();b.type=BATCH_CLEAR;b.startIndex=1;if(!b.mat4param)
b.mat4param=mat4.create();b.mat4param[0]=x;b.mat4param[1]=y;b.mat4param[2]=w;b.mat4param[3]=h;this.hasQuadBatchTop=false;this.hasPointBatchTop=false;};GLWrap_.prototype.clearDepth=function()
{var b=this.pushBatch();b.type=BATCH_CLEAR;b.startIndex=2;this.hasQuadBatchTop=false;this.hasPointBatchTop=false;};GLWrap_.prototype.setEarlyZPass=function(e)
{if(!this.enableFrontToBack)
return;e=!!e;if(this.isEarlyZPass===e)
return;var b=this.pushBatch();b.type=BATCH_SETEARLYZMODE;b.startIndex=(e?1:0);this.hasQuadBatchTop=false;this.hasPointBatchTop=false;this.isEarlyZPass=e;this.renderToTex=null;if(this.isEarlyZPass)
{this.switchProgram(2);}
else
{this.switchProgram(0);}};GLWrap_.prototype.setDepthTestEnabled=function(e)
{if(!this.enableFrontToBack)
return;var b=this.pushBatch();b.type=BATCH_SETDEPTHTEST;b.startIndex=(e?1:0);this.hasQuadBatchTop=false;this.hasPointBatchTop=false;};GLWrap_.prototype.fullscreenQuad=function()
{mat4.set(this.lastMV,tempMat4);this.resetModelView();this.updateModelView();var halfw=this.width/2;var halfh=this.height/2;this.quad(-halfw,halfh,halfw,halfh,halfw,-halfh,-halfw,-halfh);mat4.set(tempMat4,this.matMV);this.updateModelView();};GLWrap_.prototype.setColorFillMode=function(r_,g_,b_,a_)
{this.switchProgram(3);var b=this.pushBatch();b.type=BATCH_SETCOLOR;if(!b.mat4param)
b.mat4param=mat4.create();b.mat4param[0]=r_;b.mat4param[1]=g_;b.mat4param[2]=b_;b.mat4param[3]=a_;this.hasQuadBatchTop=false;this.hasPointBatchTop=false;};GLWrap_.prototype.setTextureFillMode=function()
{;this.switchProgram(0);};GLWrap_.prototype.restoreEarlyZMode=function()
{;this.switchProgram(2);};GLWrap_.prototype.present=function()
{this.endBatch();this.gl.flush();};function nextHighestPowerOfTwo(x){--x;for(var i=1;i<32;i<<=1){x=x|x>>i;}
return x+1;}
var all_textures=[];var textures_by_src={};GLWrap_.prototype.contextLost=function()
{cr.clearArray(all_textures);textures_by_src={};};var BF_RGBA8=0;var BF_RGB8=1;var BF_RGBA4=2;var BF_RGB5_A1=3;var BF_RGB565=4;GLWrap_.prototype.loadTexture=function(img,tiling,linearsampling,pixelformat,tiletype,nomip)
{tiling=!!tiling;linearsampling=!!linearsampling;var tex_key=img.src+","+tiling+","+linearsampling+(tiling?(","+tiletype):"");var webGL_texture=null;if(typeof img.src!=="undefined"&&textures_by_src.hasOwnProperty(tex_key))
{webGL_texture=textures_by_src[tex_key];webGL_texture.c2refcount++;return webGL_texture;}
this.endBatch();;var gl=this.gl;var isPOT=(cr.isPOT(img.width)&&cr.isPOT(img.height));webGL_texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,webGL_texture);gl.pixelStorei(gl["UNPACK_PREMULTIPLY_ALPHA_WEBGL"],true);var internalformat=gl.RGBA;var format=gl.RGBA;var type=gl.UNSIGNED_BYTE;if(pixelformat&&!this.isIE)
{switch(pixelformat){case BF_RGB8:internalformat=gl.RGB;format=gl.RGB;break;case BF_RGBA4:type=gl.UNSIGNED_SHORT_4_4_4_4;break;case BF_RGB5_A1:type=gl.UNSIGNED_SHORT_5_5_5_1;break;case BF_RGB565:internalformat=gl.RGB;format=gl.RGB;type=gl.UNSIGNED_SHORT_5_6_5;break;}}
if(this.version===1&&!isPOT&&tiling)
{var canvas=document.createElement("canvas");canvas.width=cr.nextHighestPowerOfTwo(img.width);canvas.height=cr.nextHighestPowerOfTwo(img.height);var ctx=canvas.getContext("2d");if(typeof ctx["imageSmoothingEnabled"]!=="undefined")
{ctx["imageSmoothingEnabled"]=linearsampling;}
else
{ctx["webkitImageSmoothingEnabled"]=linearsampling;ctx["mozImageSmoothingEnabled"]=linearsampling;ctx["msImageSmoothingEnabled"]=linearsampling;}
ctx.drawImage(img,0,0,img.width,img.height,0,0,canvas.width,canvas.height);gl.texImage2D(gl.TEXTURE_2D,0,internalformat,format,type,canvas);}
else
gl.texImage2D(gl.TEXTURE_2D,0,internalformat,format,type,img);if(tiling)
{if(tiletype==="repeat-x")
{gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);}
else if(tiletype==="repeat-y")
{gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);}
else
{gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);}}
else
{gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);}
if(linearsampling)
{gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);if((isPOT||this.version>=2)&&this.enable_mipmaps&&!nomip)
{gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.generateMipmap(gl.TEXTURE_2D);}
else
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);}
else
{gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);}
gl.bindTexture(gl.TEXTURE_2D,null);this.lastTexture0=null;webGL_texture.c2width=img.width;webGL_texture.c2height=img.height;webGL_texture.c2refcount=1;webGL_texture.c2texkey=tex_key;all_textures.push(webGL_texture);textures_by_src[tex_key]=webGL_texture;return webGL_texture;};GLWrap_.prototype.createEmptyTexture=function(w,h,linearsampling,_16bit,tiling)
{this.endBatch();var gl=this.gl;if(this.isIE)
_16bit=false;var webGL_texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,webGL_texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,_16bit?gl.UNSIGNED_SHORT_4_4_4_4:gl.UNSIGNED_BYTE,null);if(tiling)
{gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);}
else
{gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);}
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,linearsampling?gl.LINEAR:gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,linearsampling?gl.LINEAR:gl.NEAREST);gl.bindTexture(gl.TEXTURE_2D,null);this.lastTexture0=null;webGL_texture.c2width=w;webGL_texture.c2height=h;all_textures.push(webGL_texture);return webGL_texture;};GLWrap_.prototype.videoToTexture=function(video_,texture_,_16bit)
{this.endBatch();var gl=this.gl;if(this.isIE)
_16bit=false;gl.bindTexture(gl.TEXTURE_2D,texture_);gl.pixelStorei(gl["UNPACK_PREMULTIPLY_ALPHA_WEBGL"],true);try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,_16bit?gl.UNSIGNED_SHORT_4_4_4_4:gl.UNSIGNED_BYTE,video_);}
catch(e)
{if(console&&console.error)
console.error("Error updating WebGL texture: ",e);}
gl.bindTexture(gl.TEXTURE_2D,null);this.lastTexture0=null;};GLWrap_.prototype.deleteTexture=function(tex)
{if(!tex)
return;if(typeof tex.c2refcount!=="undefined"&&tex.c2refcount>1)
{tex.c2refcount--;return;}
this.endBatch();if(tex===this.lastTexture0)
{this.gl.bindTexture(this.gl.TEXTURE_2D,null);this.lastTexture0=null;}
if(tex===this.lastTexture1)
{this.gl.activeTexture(this.gl.TEXTURE1);this.gl.bindTexture(this.gl.TEXTURE_2D,null);this.gl.activeTexture(this.gl.TEXTURE0);this.lastTexture1=null;}
cr.arrayFindRemove(all_textures,tex);if(typeof tex.c2texkey!=="undefined")
delete textures_by_src[tex.c2texkey];this.gl.deleteTexture(tex);};GLWrap_.prototype.estimateVRAM=function()
{var total=this.width*this.height*4*2;var i,len,t;for(i=0,len=all_textures.length;i<len;i++)
{t=all_textures[i];total+=(t.c2width*t.c2height*4);}
return total;};GLWrap_.prototype.textureCount=function()
{return all_textures.length;};GLWrap_.prototype.setRenderingToTexture=function(tex)
{if(tex===this.renderToTex)
return;;var b=this.pushBatch();b.type=BATCH_RENDERTOTEXTURE;b.texParam=tex;this.renderToTex=tex;this.hasQuadBatchTop=false;this.hasPointBatchTop=false;};cr.GLWrap=GLWrap_;}());;(function()
{var raf=window["requestAnimationFrame"]||window["mozRequestAnimationFrame"]||window["webkitRequestAnimationFrame"]||window["msRequestAnimationFrame"]||window["oRequestAnimationFrame"];function Runtime(canvas)
{if(!canvas||(!canvas.getContext&&!canvas["dc"]))
return;if(canvas["c2runtime"])
return;else
canvas["c2runtime"]=this;var self=this;this.isCrosswalk=/crosswalk/i.test(navigator.userAgent)||/xwalk/i.test(navigator.userAgent)||!!(typeof window["c2isCrosswalk"]!=="undefined"&&window["c2isCrosswalk"]);this.isCordova=this.isCrosswalk||(typeof window["device"]!=="undefined"&&(typeof window["device"]["cordova"]!=="undefined"||typeof window["device"]["phonegap"]!=="undefined"))||(typeof window["c2iscordova"]!=="undefined"&&window["c2iscordova"]);this.isPhoneGap=this.isCordova;this.isDirectCanvas=!!canvas["dc"];this.isAppMobi=(typeof window["AppMobi"]!=="undefined"||this.isDirectCanvas);this.isCocoonJs=!!window["c2cocoonjs"];this.isEjecta=!!window["c2ejecta"];if(this.isCocoonJs)
{CocoonJS["App"]["onSuspended"].addEventListener(function(){self["setSuspended"](true);});CocoonJS["App"]["onActivated"].addEventListener(function(){self["setSuspended"](false);});}
if(this.isEjecta)
{document.addEventListener("pagehide",function(){self["setSuspended"](true);});document.addEventListener("pageshow",function(){self["setSuspended"](false);});document.addEventListener("resize",function(){self["setSize"](window.innerWidth,window.innerHeight);});}
this.isDomFree=(this.isDirectCanvas||this.isCocoonJs||this.isEjecta);this.isMicrosoftEdge=/edge\//i.test(navigator.userAgent);this.isIE=(/msie/i.test(navigator.userAgent)||/trident/i.test(navigator.userAgent)||/iemobile/i.test(navigator.userAgent))&&!this.isMicrosoftEdge;this.isTizen=/tizen/i.test(navigator.userAgent);this.isAndroid=/android/i.test(navigator.userAgent)&&!this.isTizen&&!this.isIE&&!this.isMicrosoftEdge;this.isiPhone=(/iphone/i.test(navigator.userAgent)||/ipod/i.test(navigator.userAgent))&&!this.isIE&&!this.isMicrosoftEdge;this.isiPad=/ipad/i.test(navigator.userAgent);this.isiOS=this.isiPhone||this.isiPad||this.isEjecta;this.isiPhoneiOS6=(this.isiPhone&&/os\s6/i.test(navigator.userAgent));this.isChrome=(/chrome/i.test(navigator.userAgent)||/chromium/i.test(navigator.userAgent))&&!this.isIE&&!this.isMicrosoftEdge;this.isAmazonWebApp=/amazonwebappplatform/i.test(navigator.userAgent);this.isFirefox=/firefox/i.test(navigator.userAgent);this.isSafari=/safari/i.test(navigator.userAgent)&&!this.isChrome&&!this.isIE&&!this.isMicrosoftEdge;this.isWindows=/windows/i.test(navigator.userAgent);this.isNWjs=(typeof window["c2nodewebkit"]!=="undefined"||typeof window["c2nwjs"]!=="undefined"||/nodewebkit/i.test(navigator.userAgent)||/nwjs/i.test(navigator.userAgent));this.isNodeWebkit=this.isNWjs;this.isArcade=(typeof window["is_scirra_arcade"]!=="undefined");this.isWindows8App=!!(typeof window["c2isWindows8"]!=="undefined"&&window["c2isWindows8"]);this.isWindows8Capable=!!(typeof window["c2isWindows8Capable"]!=="undefined"&&window["c2isWindows8Capable"]);this.isWindowsPhone8=!!(typeof window["c2isWindowsPhone8"]!=="undefined"&&window["c2isWindowsPhone8"]);this.isWindowsPhone81=!!(typeof window["c2isWindowsPhone81"]!=="undefined"&&window["c2isWindowsPhone81"]);this.isWindows10=!!window["cr_windows10"];this.isWinJS=(this.isWindows8App||this.isWindows8Capable||this.isWindowsPhone81||this.isWindows10);this.isBlackberry10=!!(typeof window["c2isBlackberry10"]!=="undefined"&&window["c2isBlackberry10"]);this.isAndroidStockBrowser=(this.isAndroid&&!this.isChrome&&!this.isCrosswalk&&!this.isFirefox&&!this.isAmazonWebApp&&!this.isDomFree);this.devicePixelRatio=1;this.isMobile=(this.isCordova||this.isCrosswalk||this.isAppMobi||this.isCocoonJs||this.isAndroid||this.isiOS||this.isWindowsPhone8||this.isWindowsPhone81||this.isBlackberry10||this.isTizen||this.isEjecta);if(!this.isMobile)
{this.isMobile=/(blackberry|bb10|playbook|palm|symbian|nokia|windows\s+ce|phone|mobile|tablet|kindle|silk)/i.test(navigator.userAgent);}
this.isWKWebView=!!(this.isiOS&&this.isCordova&&window["webkit"]);if(typeof cr_is_preview!=="undefined"&&!this.isNWjs&&(window.location.search==="?nw"||/nodewebkit/i.test(navigator.userAgent)||/nwjs/i.test(navigator.userAgent)))
{this.isNWjs=true;}
this.isDebug=(typeof cr_is_preview!=="undefined"&&window.location.search.indexOf("debug")>-1);this.canvas=canvas;this.canvasdiv=document.getElementById("c2canvasdiv");this.gl=null;this.glwrap=null;this.glUnmaskedRenderer="(unavailable)";this.enableFrontToBack=false;this.earlyz_index=0;this.ctx=null;this.firstInFullscreen=false;this.oldWidth=0;this.oldHeight=0;this.canvas.oncontextmenu=function(e){if(e.preventDefault)e.preventDefault();return false;};this.canvas.onselectstart=function(e){if(e.preventDefault)e.preventDefault();return false;};this.canvas.ontouchstart=function(e){if(e.preventDefault)e.preventDefault();return false;};if(this.isDirectCanvas)
window["c2runtime"]=this;if(this.isNWjs)
{window["ondragover"]=function(e){e.preventDefault();return false;};window["ondrop"]=function(e){e.preventDefault();return false;};if(window["nwgui"]&&window["nwgui"]["App"]["clearCache"])
window["nwgui"]["App"]["clearCache"]();}
if(this.isAndroidStockBrowser&&typeof jQuery!=="undefined")
{jQuery("canvas").parents("*").css("overflow","visible");}
this.width=canvas.width;this.height=canvas.height;this.draw_width=this.width;this.draw_height=this.height;this.cssWidth=this.width;this.cssHeight=this.height;this.lastWindowWidth=window.innerWidth;this.lastWindowHeight=window.innerHeight;this.forceCanvasAlpha=false;this.redraw=true;this.isSuspended=false;if(!Date.now){Date.now=function now(){return+new Date();};}
this.plugins=[];this.types={};this.types_by_index=[];this.behaviors=[];this.layouts={};this.layouts_by_index=[];this.eventsheets={};this.eventsheets_by_index=[];this.wait_for_textures=[];this.triggers_to_postinit=[];this.all_global_vars=[];this.all_local_vars=[];this.solidBehavior=null;this.jumpthruBehavior=null;this.shadowcasterBehavior=null;this.deathRow={};this.hasPendingInstances=false;this.isInClearDeathRow=false;this.isInOnDestroy=0;this.isRunningEvents=false;this.isEndingLayout=false;this.createRow=[];this.isLoadingState=false;this.saveToSlot="";this.loadFromSlot="";this.loadFromJson=null;this.lastSaveJson="";this.signalledContinuousPreview=false;this.suspendDrawing=false;this.fireOnCreateAfterLoad=[];this.dt=0;this.dt1=0;this.minimumFramerate=30;this.logictime=0;this.cpuutilisation=0;this.timescale=1.0;this.kahanTime=new cr.KahanAdder();this.wallTime=new cr.KahanAdder();this.last_tick_time=0;this.fps=0;this.last_fps_time=0;this.tickcount=0;this.tickcount_nosave=0;this.execcount=0;this.framecount=0;this.objectcount=0;this.changelayout=null;this.destroycallbacks=[];this.event_stack=[];this.event_stack_index=-1;this.localvar_stack=[[]];this.localvar_stack_index=0;this.trigger_depth=0;this.pushEventStack(null);this.loop_stack=[];this.loop_stack_index=-1;this.next_uid=0;this.next_puid=0;this.layout_first_tick=true;this.family_count=0;this.suspend_events=[];this.raf_id=-1;this.timeout_id=-1;this.isloading=true;this.loadingprogress=0;this.isNodeFullscreen=false;this.stackLocalCount=0;this.audioInstance=null;this.had_a_click=false;this.isInUserInputEvent=false;this.objects_to_pretick=new cr.ObjectSet();this.objects_to_tick=new cr.ObjectSet();this.objects_to_tick2=new cr.ObjectSet();this.registered_collisions=[];this.temp_poly=new cr.CollisionPoly([]);this.temp_poly2=new cr.CollisionPoly([]);this.allGroups=[];this.groups_by_name={};this.cndsBySid={};this.actsBySid={};this.varsBySid={};this.blocksBySid={};this.running_layout=null;this.layer_canvas=null;this.layer_ctx=null;this.layer_tex=null;this.layout_tex=null;this.layout_canvas=null;this.layout_ctx=null;this.is_WebGL_context_lost=false;this.uses_background_blending=false;this.fx_tex=[null,null];this.fullscreen_scaling=0;this.files_subfolder="";this.objectsByUid={};this.loaderlogos=null;this.snapshotCanvas=null;this.snapshotData="";this.objectRefTable=[];this.requestProjectData();};Runtime.prototype.requestProjectData=function()
{var self=this;if(this.isWKWebView)
{this.fetchLocalFileViaCordovaAsText("data.js",function(str)
{self.loadProject(JSON.parse(str));},function(err)
{alert("Error fetching data.js");});return;}
var xhr;if(this.isWindowsPhone8)
xhr=new ActiveXObject("Microsoft.XMLHTTP");else
xhr=new XMLHttpRequest();var datajs_filename="data.js";if(this.isWindows8App||this.isWindowsPhone8||this.isWindowsPhone81||this.isWindows10)
datajs_filename="data.json";xhr.open("GET",datajs_filename,true);var supportsJsonResponse=false;if(!this.isDomFree&&("response"in xhr)&&("responseType"in xhr))
{try{xhr["responseType"]="json";supportsJsonResponse=(xhr["responseType"]==="json");}
catch(e){supportsJsonResponse=false;}}
if(!supportsJsonResponse&&("responseType"in xhr))
{try{xhr["responseType"]="text";}
catch(e){}}
if("overrideMimeType"in xhr)
{try{xhr["overrideMimeType"]("application/json; charset=utf-8");}
catch(e){}}
if(this.isWindowsPhone8)
{xhr.onreadystatechange=function()
{if(xhr.readyState!==4)
return;self.loadProject(JSON.parse(xhr["responseText"]));};}
else
{xhr.onload=function()
{if(supportsJsonResponse)
{self.loadProject(xhr["response"]);}
else
{if(self.isEjecta)
{var str=xhr["responseText"];str=str.substr(str.indexOf("{"));self.loadProject(JSON.parse(str));}
else
{self.loadProject(JSON.parse(xhr["responseText"]));}}};xhr.onerror=function(e)
{cr.logerror("Error requesting "+datajs_filename+":");cr.logerror(e);};}
xhr.send();};Runtime.prototype.initRendererAndLoader=function()
{var self=this;var i,len,j,lenj,k,lenk,t,s,l,y;this.isRetina=((!this.isDomFree||this.isEjecta||this.isCordova)&&this.useHighDpi&&!this.isAndroidStockBrowser);if(this.fullscreen_mode===0&&this.isiOS)
this.isRetina=false;this.devicePixelRatio=(this.isRetina?(window["devicePixelRatio"]||window["webkitDevicePixelRatio"]||window["mozDevicePixelRatio"]||window["msDevicePixelRatio"]||1):1);this.ClearDeathRow();var attribs;if(this.fullscreen_mode>0)
this["setSize"](window.innerWidth,window.innerHeight,true);this.canvas.addEventListener("webglcontextlost",function(ev){ev.preventDefault();self.onContextLost();cr.logexport("[Construct 2] WebGL context lost");window["cr_setSuspended"](true);},false);this.canvas.addEventListener("webglcontextrestored",function(ev){self.glwrap.initState();self.glwrap.setSize(self.glwrap.width,self.glwrap.height,true);self.layer_tex=null;self.layout_tex=null;self.fx_tex[0]=null;self.fx_tex[1]=null;self.onContextRestored();self.redraw=true;cr.logexport("[Construct 2] WebGL context restored");window["cr_setSuspended"](false);},false);try{if(this.enableWebGL&&(this.isCocoonJs||this.isEjecta||!this.isDomFree))
{attribs={"alpha":true,"depth":false,"antialias":false,"powerPreference":"high-performance","failIfMajorPerformanceCaveat":true};this.gl=(this.canvas.getContext("webgl2",attribs)||this.canvas.getContext("webgl",attribs)||this.canvas.getContext("experimental-webgl",attribs));}}
catch(e){}
if(this.gl)
{var isWebGL2=(this.gl.getParameter(this.gl.VERSION).indexOf("WebGL 2")===0);var debug_ext=this.gl.getExtension("WEBGL_debug_renderer_info");if(debug_ext)
{var unmasked_vendor=this.gl.getParameter(debug_ext.UNMASKED_VENDOR_WEBGL);var unmasked_renderer=this.gl.getParameter(debug_ext.UNMASKED_RENDERER_WEBGL);this.glUnmaskedRenderer=unmasked_renderer+" ["+unmasked_vendor+"]";}
if(this.enableFrontToBack)
this.glUnmaskedRenderer+=" [front-to-back enabled]";;if(!this.isDomFree)
{this.overlay_canvas=document.createElement("canvas");jQuery(this.overlay_canvas).appendTo(this.canvas.parentNode);this.overlay_canvas.oncontextmenu=function(e){return false;};this.overlay_canvas.onselectstart=function(e){return false;};this.overlay_canvas.width=Math.round(this.cssWidth*this.devicePixelRatio);this.overlay_canvas.height=Math.round(this.cssHeight*this.devicePixelRatio);jQuery(this.overlay_canvas).css({"width":this.cssWidth+"px","height":this.cssHeight+"px"});this.positionOverlayCanvas();this.overlay_ctx=this.overlay_canvas.getContext("2d");}
this.glwrap=new cr.GLWrap(this.gl,this.isMobile,this.enableFrontToBack);this.glwrap.setSize(this.canvas.width,this.canvas.height);this.glwrap.enable_mipmaps=(this.downscalingQuality!==0);this.ctx=null;for(i=0,len=this.types_by_index.length;i<len;i++)
{t=this.types_by_index[i];for(j=0,lenj=t.effect_types.length;j<lenj;j++)
{s=t.effect_types[j];s.shaderindex=this.glwrap.getShaderIndex(s.id);s.preservesOpaqueness=this.glwrap.programPreservesOpaqueness(s.shaderindex);this.uses_background_blending=this.uses_background_blending||this.glwrap.programUsesDest(s.shaderindex);}}
for(i=0,len=this.layouts_by_index.length;i<len;i++)
{l=this.layouts_by_index[i];for(j=0,lenj=l.effect_types.length;j<lenj;j++)
{s=l.effect_types[j];s.shaderindex=this.glwrap.getShaderIndex(s.id);s.preservesOpaqueness=this.glwrap.programPreservesOpaqueness(s.shaderindex);}
l.updateActiveEffects();for(j=0,lenj=l.layers.length;j<lenj;j++)
{y=l.layers[j];for(k=0,lenk=y.effect_types.length;k<lenk;k++)
{s=y.effect_types[k];s.shaderindex=this.glwrap.getShaderIndex(s.id);s.preservesOpaqueness=this.glwrap.programPreservesOpaqueness(s.shaderindex);this.uses_background_blending=this.uses_background_blending||this.glwrap.programUsesDest(s.shaderindex);}
y.updateActiveEffects();}}}
else
{if(this.fullscreen_mode>0&&this.isDirectCanvas)
{;this.canvas=null;document.oncontextmenu=function(e){return false;};document.onselectstart=function(e){return false;};this.ctx=AppMobi["canvas"]["getContext"]("2d");try{this.ctx["samplingMode"]=this.linearSampling?"smooth":"sharp";this.ctx["globalScale"]=1;this.ctx["HTML5CompatibilityMode"]=true;this.ctx["imageSmoothingEnabled"]=this.linearSampling;}catch(e){}
if(this.width!==0&&this.height!==0)
{this.ctx.width=this.width;this.ctx.height=this.height;}}
if(!this.ctx)
{;if(this.isCocoonJs)
{attribs={"antialias":!!this.linearSampling,"alpha":true};this.ctx=this.canvas.getContext("2d",attribs);}
else
{attribs={"alpha":true};this.ctx=this.canvas.getContext("2d",attribs);}
this.setCtxImageSmoothingEnabled(this.ctx,this.linearSampling);}
this.overlay_canvas=null;this.overlay_ctx=null;}
this.tickFunc=function(timestamp){self.tick(false,timestamp);};if(window!=window.top&&!this.isDomFree&&!this.isWinJS&&!this.isWindowsPhone8)
{document.addEventListener("mousedown",function(){window.focus();},true);document.addEventListener("touchstart",function(){window.focus();},true);}
if(typeof cr_is_preview!=="undefined")
{if(this.isCocoonJs)
console.log("[Construct 2] In preview-over-wifi via CocoonJS mode");if(window.location.search.indexOf("continuous")>-1)
{cr.logexport("Reloading for continuous preview");this.loadFromSlot="__c2_continuouspreview";this.suspendDrawing=true;}
if(this.pauseOnBlur&&!this.isMobile)
{jQuery(window).focus(function()
{self["setSuspended"](false);});jQuery(window).blur(function()
{var parent=window.parent;if(!parent||!parent.document.hasFocus())
self["setSuspended"](true);});}}
window.addEventListener("blur",function(){self.onWindowBlur();});if(!this.isDomFree)
{var unfocusFormControlFunc=function(e){if(cr.isCanvasInputEvent(e)&&document["activeElement"]&&document["activeElement"]!==document.getElementsByTagName("body")[0]&&document["activeElement"].blur)
{try{document["activeElement"].blur();}
catch(e){}}}
if(typeof PointerEvent!=="undefined")
{document.addEventListener("pointerdown",unfocusFormControlFunc);}
else if(window.navigator["msPointerEnabled"])
{document.addEventListener("MSPointerDown",unfocusFormControlFunc);}
else
{document.addEventListener("touchstart",unfocusFormControlFunc);}
document.addEventListener("mousedown",unfocusFormControlFunc);}
if(this.fullscreen_mode===0&&this.isRetina&&this.devicePixelRatio>1)
{this["setSize"](this.original_width,this.original_height,true);}
this.tryLockOrientation();this.getready();this.go();this.extra={};cr.seal(this);};var webkitRepaintFlag=false;Runtime.prototype["setSize"]=function(w,h,force)
{var offx=0,offy=0;var neww=0,newh=0,intscale=0;if(this.lastWindowWidth===w&&this.lastWindowHeight===h&&!force)
return;this.lastWindowWidth=w;this.lastWindowHeight=h;var mode=this.fullscreen_mode;var orig_aspect,cur_aspect;var isfullscreen=(document["mozFullScreen"]||document["webkitIsFullScreen"]||!!document["msFullscreenElement"]||document["fullScreen"]||this.isNodeFullscreen)&&!this.isCordova;if(!isfullscreen&&this.fullscreen_mode===0&&!force)
return;if(isfullscreen&&this.fullscreen_scaling>0)
mode=this.fullscreen_scaling;var dpr=this.devicePixelRatio;if(mode>=4)
{orig_aspect=this.original_width/this.original_height;cur_aspect=w/h;if(cur_aspect>orig_aspect)
{neww=h*orig_aspect;if(mode===5)
{intscale=(neww*dpr)/this.original_width;if(intscale>1)
intscale=Math.floor(intscale);else if(intscale<1)
intscale=1/Math.ceil(1/intscale);neww=this.original_width*intscale/dpr;newh=this.original_height*intscale/dpr;offx=(w-neww)/2;offy=(h-newh)/2;w=neww;h=newh;}
else
{offx=(w-neww)/2;w=neww;}}
else
{newh=w/orig_aspect;if(mode===5)
{intscale=(newh*dpr)/this.original_height;if(intscale>1)
intscale=Math.floor(intscale);else if(intscale<1)
intscale=1/Math.ceil(1/intscale);neww=this.original_width*intscale/dpr;newh=this.original_height*intscale/dpr;offx=(w-neww)/2;offy=(h-newh)/2;w=neww;h=newh;}
else
{offy=(h-newh)/2;h=newh;}}}
else if(this.isNWjs&&this.isNodeFullscreen&&this.fullscreen_mode_set===0)
{offx=Math.floor((w-this.original_width)/2);offy=Math.floor((h-this.original_height)/2);w=this.original_width;h=this.original_height;}
if(mode<2)
this.aspect_scale=dpr;this.cssWidth=Math.round(w);this.cssHeight=Math.round(h);this.width=Math.round(w*dpr);this.height=Math.round(h*dpr);this.redraw=true;if(this.wantFullscreenScalingQuality)
{this.draw_width=this.width;this.draw_height=this.height;this.fullscreenScalingQuality=true;}
else
{if((this.width<this.original_width&&this.height<this.original_height)||mode===1)
{this.draw_width=this.width;this.draw_height=this.height;this.fullscreenScalingQuality=true;}
else
{this.draw_width=this.original_width;this.draw_height=this.original_height;this.fullscreenScalingQuality=false;if(mode===2)
{orig_aspect=this.original_width/this.original_height;cur_aspect=this.lastWindowWidth/this.lastWindowHeight;if(cur_aspect<orig_aspect)
this.draw_width=this.draw_height*cur_aspect;else if(cur_aspect>orig_aspect)
this.draw_height=this.draw_width/cur_aspect;}
else if(mode===3)
{orig_aspect=this.original_width/this.original_height;cur_aspect=this.lastWindowWidth/this.lastWindowHeight;if(cur_aspect>orig_aspect)
this.draw_width=this.draw_height*cur_aspect;else if(cur_aspect<orig_aspect)
this.draw_height=this.draw_width/cur_aspect;}}}
if(this.canvasdiv&&!this.isDomFree)
{jQuery(this.canvasdiv).css({"width":Math.round(w)+"px","height":Math.round(h)+"px","margin-left":Math.floor(offx)+"px","margin-top":Math.floor(offy)+"px"});if(typeof cr_is_preview!=="undefined")
{jQuery("#borderwrap").css({"width":Math.round(w)+"px","height":Math.round(h)+"px"});}}
if(this.canvas)
{this.canvas.width=Math.round(w*dpr);this.canvas.height=Math.round(h*dpr);if(this.isEjecta)
{this.canvas.style.left=Math.floor(offx)+"px";this.canvas.style.top=Math.floor(offy)+"px";this.canvas.style.width=Math.round(w)+"px";this.canvas.style.height=Math.round(h)+"px";}
else if(this.isRetina&&!this.isDomFree)
{this.canvas.style.width=Math.round(w)+"px";this.canvas.style.height=Math.round(h)+"px";}}
if(this.overlay_canvas)
{this.overlay_canvas.width=Math.round(w*dpr);this.overlay_canvas.height=Math.round(h*dpr);this.overlay_canvas.style.width=this.cssWidth+"px";this.overlay_canvas.style.height=this.cssHeight+"px";}
if(this.glwrap)
{this.glwrap.setSize(Math.round(w*dpr),Math.round(h*dpr));}
if(this.isDirectCanvas&&this.ctx)
{this.ctx.width=Math.round(w);this.ctx.height=Math.round(h);}
if(this.ctx)
{this.setCtxImageSmoothingEnabled(this.ctx,this.linearSampling);}
this.tryLockOrientation();if(this.isiPhone&&!this.isCordova)
{window.scrollTo(0,0);}};Runtime.prototype.tryLockOrientation=function()
{if(!this.autoLockOrientation||this.orientations===0)
return;var orientation="portrait";if(this.orientations===2)
orientation="landscape";try{if(screen["orientation"]&&screen["orientation"]["lock"])
screen["orientation"]["lock"](orientation).catch(function(){});else if(screen["lockOrientation"])
screen["lockOrientation"](orientation);else if(screen["webkitLockOrientation"])
screen["webkitLockOrientation"](orientation);else if(screen["mozLockOrientation"])
screen["mozLockOrientation"](orientation);else if(screen["msLockOrientation"])
screen["msLockOrientation"](orientation);}
catch(e)
{if(console&&console.warn)
console.warn("Failed to lock orientation: ",e);}};Runtime.prototype.onContextLost=function()
{this.glwrap.contextLost();this.is_WebGL_context_lost=true;var i,len,t;for(i=0,len=this.types_by_index.length;i<len;i++)
{t=this.types_by_index[i];if(t.onLostWebGLContext)
t.onLostWebGLContext();}};Runtime.prototype.onContextRestored=function()
{this.is_WebGL_context_lost=false;var i,len,t;for(i=0,len=this.types_by_index.length;i<len;i++)
{t=this.types_by_index[i];if(t.onRestoreWebGLContext)
t.onRestoreWebGLContext();}};Runtime.prototype.positionOverlayCanvas=function()
{if(this.isDomFree)
return;var isfullscreen=(document["mozFullScreen"]||document["webkitIsFullScreen"]||document["fullScreen"]||!!document["msFullscreenElement"]||this.isNodeFullscreen)&&!this.isCordova;var overlay_position=isfullscreen?jQuery(this.canvas).offset():jQuery(this.canvas).position();overlay_position.position="absolute";jQuery(this.overlay_canvas).css(overlay_position);};var caf=window["cancelAnimationFrame"]||window["mozCancelAnimationFrame"]||window["webkitCancelAnimationFrame"]||window["msCancelAnimationFrame"]||window["oCancelAnimationFrame"];Runtime.prototype["setSuspended"]=function(s)
{var i,len;var self=this;if(s&&!this.isSuspended)
{cr.logexport("[Construct 2] Suspending");this.isSuspended=true;if(this.raf_id!==-1&&caf)
caf(this.raf_id);if(this.timeout_id!==-1)
clearTimeout(this.timeout_id);for(i=0,len=this.suspend_events.length;i<len;i++)
this.suspend_events[i](true);}
else if(!s&&this.isSuspended)
{cr.logexport("[Construct 2] Resuming");this.isSuspended=false;this.last_tick_time=cr.performance_now();this.last_fps_time=cr.performance_now();this.framecount=0;this.logictime=0;for(i=0,len=this.suspend_events.length;i<len;i++)
this.suspend_events[i](false);this.tick(false);}};Runtime.prototype.addSuspendCallback=function(f)
{this.suspend_events.push(f);};Runtime.prototype.GetObjectReference=function(i)
{;return this.objectRefTable[i];};Runtime.prototype.loadProject=function(data_response)
{;if(!data_response||!data_response["project"])
cr.logerror("Project model unavailable");var pm=data_response["project"];this.name=pm[0];this.first_layout=pm[1];this.fullscreen_mode=pm[12];this.fullscreen_mode_set=pm[12];this.original_width=pm[10];this.original_height=pm[11];this.parallax_x_origin=this.original_width/2;this.parallax_y_origin=this.original_height/2;if(this.isDomFree&&!this.isEjecta&&(pm[12]>=4||pm[12]===0))
{cr.logexport("[Construct 2] Letterbox scale fullscreen modes are not supported on this platform - falling back to 'Scale outer'");this.fullscreen_mode=3;this.fullscreen_mode_set=3;}
this.uses_loader_layout=pm[18];this.loaderstyle=pm[19];if(this.loaderstyle===0)
{var loaderImage=new Image();loaderImage.crossOrigin="anonymous";this.setImageSrc(loaderImage,"loading-logo.png");this.loaderlogos={logo:loaderImage};}
else if(this.loaderstyle===4)
{var loaderC2logo_1024=new Image();loaderC2logo_1024.src="";var loaderC2logo_512=new Image();loaderC2logo_512.src="";var loaderC2logo_256=new Image();loaderC2logo_256.src="";var loaderC2logo_128=new Image();loaderC2logo_128.src="";var loaderPowered_1024=new Image();loaderPowered_1024.src="";var loaderPowered_512=new Image();loaderPowered_512.src="";var loaderPowered_256=new Image();loaderPowered_256.src="";var loaderPowered_128=new Image();loaderPowered_128.src="";var loaderWebsite_1024=new Image();loaderWebsite_1024.src="";var loaderWebsite_512=new Image();loaderWebsite_512.src="";var loaderWebsite_256=new Image();loaderWebsite_256.src="";var loaderWebsite_128=new Image();loaderWebsite_128.src="";this.loaderlogos={logo:[loaderC2logo_1024,loaderC2logo_512,loaderC2logo_256,loaderC2logo_128],powered:[loaderPowered_1024,loaderPowered_512,loaderPowered_256,loaderPowered_128],website:[loaderWebsite_1024,loaderWebsite_512,loaderWebsite_256,loaderWebsite_128]};}
this.next_uid=pm[21];this.objectRefTable=cr.getObjectRefTable();this.system=new cr.system_object(this);var i,len,j,lenj,k,lenk,idstr,m,b,t,f,p;var plugin,plugin_ctor;for(i=0,len=pm[2].length;i<len;i++)
{m=pm[2][i];p=this.GetObjectReference(m[0]);;cr.add_common_aces(m,p.prototype);plugin=new p(this);plugin.singleglobal=m[1];plugin.is_world=m[2];plugin.is_rotatable=m[5];plugin.must_predraw=m[9];if(plugin.onCreate)
plugin.onCreate();cr.seal(plugin);this.plugins.push(plugin);}
this.objectRefTable=cr.getObjectRefTable();for(i=0,len=pm[3].length;i<len;i++)
{m=pm[3][i];plugin_ctor=this.GetObjectReference(m[1]);;plugin=null;for(j=0,lenj=this.plugins.length;j<lenj;j++)
{if(this.plugins[j]instanceof plugin_ctor)
{plugin=this.plugins[j];break;}};;var type_inst=new plugin.Type(plugin);;type_inst.name=m[0];type_inst.is_family=m[2];type_inst.instvar_sids=m[3].slice(0);type_inst.vars_count=m[3].length;type_inst.behs_count=m[4];type_inst.fx_count=m[5];type_inst.sid=m[11];if(type_inst.is_family)
{type_inst.members=[];type_inst.family_index=this.family_count++;type_inst.families=null;}
else
{type_inst.members=null;type_inst.family_index=-1;type_inst.families=[];}
type_inst.family_var_map=null;type_inst.family_beh_map=null;type_inst.family_fx_map=null;type_inst.is_contained=false;type_inst.container=null;if(m[6])
{type_inst.texture_file=m[6][0];type_inst.texture_filesize=m[6][1];type_inst.texture_pixelformat=m[6][2];}
else
{type_inst.texture_file=null;type_inst.texture_filesize=0;type_inst.texture_pixelformat=0;}
if(m[7])
{type_inst.animations=m[7];}
else
{type_inst.animations=null;}
type_inst.index=i;type_inst.instances=[];type_inst.deadCache=[];type_inst.solstack=[new cr.selection(type_inst)];type_inst.cur_sol=0;type_inst.default_instance=null;type_inst.default_layerindex=0;type_inst.stale_iids=true;type_inst.updateIIDs=cr.type_updateIIDs;type_inst.getFirstPicked=cr.type_getFirstPicked;type_inst.getPairedInstance=cr.type_getPairedInstance;type_inst.getCurrentSol=cr.type_getCurrentSol;type_inst.pushCleanSol=cr.type_pushCleanSol;type_inst.pushCopySol=cr.type_pushCopySol;type_inst.popSol=cr.type_popSol;type_inst.getBehaviorByName=cr.type_getBehaviorByName;type_inst.getBehaviorIndexByName=cr.type_getBehaviorIndexByName;type_inst.getEffectIndexByName=cr.type_getEffectIndexByName;type_inst.applySolToContainer=cr.type_applySolToContainer;type_inst.getInstanceByIID=cr.type_getInstanceByIID;type_inst.collision_grid=new cr.SparseGrid(this.original_width,this.original_height);type_inst.any_cell_changed=true;type_inst.any_instance_parallaxed=false;type_inst.extra={};type_inst.toString=cr.type_toString;type_inst.behaviors=[];for(j=0,lenj=m[8].length;j<lenj;j++)
{b=m[8][j];var behavior_ctor=this.GetObjectReference(b[1]);var behavior_plugin=null;for(k=0,lenk=this.behaviors.length;k<lenk;k++)
{if(this.behaviors[k]instanceof behavior_ctor)
{behavior_plugin=this.behaviors[k];break;}}
if(!behavior_plugin)
{behavior_plugin=new behavior_ctor(this);behavior_plugin.my_types=[];behavior_plugin.my_instances=new cr.ObjectSet();if(behavior_plugin.onCreate)
behavior_plugin.onCreate();cr.seal(behavior_plugin);this.behaviors.push(behavior_plugin);if(cr.behaviors.solid&&behavior_plugin instanceof cr.behaviors.solid)
this.solidBehavior=behavior_plugin;if(cr.behaviors.jumpthru&&behavior_plugin instanceof cr.behaviors.jumpthru)
this.jumpthruBehavior=behavior_plugin;if(cr.behaviors.shadowcaster&&behavior_plugin instanceof cr.behaviors.shadowcaster)
this.shadowcasterBehavior=behavior_plugin;}
if(behavior_plugin.my_types.indexOf(type_inst)===-1)
behavior_plugin.my_types.push(type_inst);var behavior_type=new behavior_plugin.Type(behavior_plugin,type_inst);behavior_type.name=b[0];behavior_type.sid=b[2];behavior_type.onCreate();cr.seal(behavior_type);type_inst.behaviors.push(behavior_type);}
type_inst.global=m[9];type_inst.isOnLoaderLayout=m[10];type_inst.effect_types=[];for(j=0,lenj=m[12].length;j<lenj;j++)
{type_inst.effect_types.push({id:m[12][j][0],name:m[12][j][1],shaderindex:-1,preservesOpaqueness:false,active:true,index:j});}
type_inst.tile_poly_data=m[13];if(!this.uses_loader_layout||type_inst.is_family||type_inst.isOnLoaderLayout||!plugin.is_world)
{type_inst.onCreate();cr.seal(type_inst);}
if(type_inst.name)
this.types[type_inst.name]=type_inst;this.types_by_index.push(type_inst);if(plugin.singleglobal)
{var instance=new plugin.Instance(type_inst);instance.uid=this.next_uid++;instance.puid=this.next_puid++;instance.iid=0;instance.get_iid=cr.inst_get_iid;instance.toString=cr.inst_toString;instance.properties=m[14];instance.onCreate();cr.seal(instance);type_inst.instances.push(instance);this.objectsByUid[instance.uid.toString()]=instance;}}
for(i=0,len=pm[4].length;i<len;i++)
{var familydata=pm[4][i];var familytype=this.types_by_index[familydata[0]];var familymember;for(j=1,lenj=familydata.length;j<lenj;j++)
{familymember=this.types_by_index[familydata[j]];familymember.families.push(familytype);familytype.members.push(familymember);}}
for(i=0,len=pm[28].length;i<len;i++)
{var containerdata=pm[28][i];var containertypes=[];for(j=0,lenj=containerdata.length;j<lenj;j++)
containertypes.push(this.types_by_index[containerdata[j]]);for(j=0,lenj=containertypes.length;j<lenj;j++)
{containertypes[j].is_contained=true;containertypes[j].container=containertypes;}}
if(this.family_count>0)
{for(i=0,len=this.types_by_index.length;i<len;i++)
{t=this.types_by_index[i];if(t.is_family||!t.families.length)
continue;t.family_var_map=new Array(this.family_count);t.family_beh_map=new Array(this.family_count);t.family_fx_map=new Array(this.family_count);var all_fx=[];var varsum=0;var behsum=0;var fxsum=0;for(j=0,lenj=t.families.length;j<lenj;j++)
{f=t.families[j];t.family_var_map[f.family_index]=varsum;varsum+=f.vars_count;t.family_beh_map[f.family_index]=behsum;behsum+=f.behs_count;t.family_fx_map[f.family_index]=fxsum;fxsum+=f.fx_count;for(k=0,lenk=f.effect_types.length;k<lenk;k++)
all_fx.push(cr.shallowCopy({},f.effect_types[k]));}
t.effect_types=all_fx.concat(t.effect_types);for(j=0,lenj=t.effect_types.length;j<lenj;j++)
t.effect_types[j].index=j;}}
for(i=0,len=pm[5].length;i<len;i++)
{m=pm[5][i];var layout=new cr.layout(this,m);cr.seal(layout);this.layouts[layout.name]=layout;this.layouts_by_index.push(layout);}
for(i=0,len=pm[6].length;i<len;i++)
{m=pm[6][i];var sheet=new cr.eventsheet(this,m);cr.seal(sheet);this.eventsheets[sheet.name]=sheet;this.eventsheets_by_index.push(sheet);}
for(i=0,len=this.eventsheets_by_index.length;i<len;i++)
this.eventsheets_by_index[i].postInit();for(i=0,len=this.eventsheets_by_index.length;i<len;i++)
this.eventsheets_by_index[i].updateDeepIncludes();for(i=0,len=this.triggers_to_postinit.length;i<len;i++)
this.triggers_to_postinit[i].postInit();cr.clearArray(this.triggers_to_postinit)
this.audio_to_preload=pm[7];this.files_subfolder=pm[8];this.pixel_rounding=pm[9];this.aspect_scale=1.0;this.enableWebGL=pm[13];this.linearSampling=pm[14];this.clearBackground=pm[15];this.versionstr=pm[16];this.useHighDpi=pm[17];this.orientations=pm[20];this.autoLockOrientation=(this.orientations>0);this.pauseOnBlur=pm[22];this.wantFullscreenScalingQuality=pm[23];this.fullscreenScalingQuality=this.wantFullscreenScalingQuality;this.downscalingQuality=pm[24];this.preloadSounds=pm[25];this.projectName=pm[26];this.enableFrontToBack=pm[27]&&!this.isIE;this.start_time=Date.now();cr.clearArray(this.objectRefTable);this.initRendererAndLoader();};var anyImageHadError=false;var MAX_PARALLEL_IMAGE_LOADS=100;var currentlyActiveImageLoads=0;var imageLoadQueue=[];Runtime.prototype.queueImageLoad=function(img_,src_)
{var self=this;var doneFunc=function()
{currentlyActiveImageLoads--;self.maybeLoadNextImages();};img_.addEventListener("load",doneFunc);img_.addEventListener("error",doneFunc);imageLoadQueue.push([img_,src_]);this.maybeLoadNextImages();};Runtime.prototype.maybeLoadNextImages=function()
{var next;while(imageLoadQueue.length&&currentlyActiveImageLoads<MAX_PARALLEL_IMAGE_LOADS)
{currentlyActiveImageLoads++;next=imageLoadQueue.shift();this.setImageSrc(next[0],next[1]);}};Runtime.prototype.waitForImageLoad=function(img_,src_)
{img_["cocoonLazyLoad"]=true;img_.onerror=function(e)
{img_.c2error=true;anyImageHadError=true;if(console&&console.error)
console.error("Error loading image '"+img_.src+"': ",e);};if(this.isEjecta)
{img_.src=src_;}
else if(!img_.src)
{if(typeof XAPKReader!=="undefined")
{XAPKReader.get(src_,function(expanded_url)
{img_.src=expanded_url;},function(e)
{img_.c2error=true;anyImageHadError=true;if(console&&console.error)
console.error("Error extracting image '"+src_+"' from expansion file: ",e);});}
else
{img_.crossOrigin="anonymous";this.queueImageLoad(img_,src_);}}
this.wait_for_textures.push(img_);};Runtime.prototype.findWaitingTexture=function(src_)
{var i,len;for(i=0,len=this.wait_for_textures.length;i<len;i++)
{if(this.wait_for_textures[i].cr_src===src_)
return this.wait_for_textures[i];}
return null;};var audio_preload_totalsize=0;var audio_preload_started=false;Runtime.prototype.getready=function()
{if(!this.audioInstance)
return;audio_preload_totalsize=this.audioInstance.setPreloadList(this.audio_to_preload);};Runtime.prototype.areAllTexturesAndSoundsLoaded=function()
{var totalsize=audio_preload_totalsize;var completedsize=0;var audiocompletedsize=0;var ret=true;var i,len,img;for(i=0,len=this.wait_for_textures.length;i<len;i++)
{img=this.wait_for_textures[i];var filesize=img.cr_filesize;if(!filesize||filesize<=0)
filesize=50000;totalsize+=filesize;if(!!img.src&&(img.complete||img["loaded"])&&!img.c2error)
completedsize+=filesize;else
ret=false;}
if(ret&&this.preloadSounds&&this.audioInstance)
{if(!audio_preload_started)
{this.audioInstance.startPreloads();audio_preload_started=true;}
audiocompletedsize=this.audioInstance.getPreloadedSize();completedsize+=audiocompletedsize;if(audiocompletedsize<audio_preload_totalsize)
ret=false;}
if(totalsize==0)
this.progress=1;else
this.progress=(completedsize/totalsize);return ret;};var isC2SplashDone=false;Runtime.prototype.go=function()
{if(!this.ctx&&!this.glwrap)
return;var ctx=this.ctx||this.overlay_ctx;if(this.overlay_canvas)
this.positionOverlayCanvas();var curwidth=window.innerWidth;var curheight=window.innerHeight;if(this.lastWindowWidth!==curwidth||this.lastWindowHeight!==curheight)
{this["setSize"](curwidth,curheight);}
this.progress=0;this.last_progress=-1;var self=this;if(this.areAllTexturesAndSoundsLoaded()&&(this.loaderstyle!==4||isC2SplashDone))
{this.go_loading_finished();}
else
{var ms_elapsed=Date.now()-this.start_time;if(ctx)
{var overlay_width=this.width;var overlay_height=this.height;var dpr=this.devicePixelRatio;if(this.loaderstyle<3&&(this.isCocoonJs||(ms_elapsed>=500&&this.last_progress!=this.progress)))
{ctx.clearRect(0,0,overlay_width,overlay_height);var mx=overlay_width/2;var my=overlay_height/2;var haslogo=(this.loaderstyle===0&&this.loaderlogos.logo.complete);var hlw=40*dpr;var hlh=0;var logowidth=80*dpr;var logoheight;if(haslogo)
{var loaderLogoImage=this.loaderlogos.logo;logowidth=loaderLogoImage.width*dpr;logoheight=loaderLogoImage.height*dpr;hlw=logowidth/2;hlh=logoheight/2;ctx.drawImage(loaderLogoImage,cr.floor(mx-hlw),cr.floor(my-hlh),logowidth,logoheight);}
if(this.loaderstyle<=1)
{my+=hlh+(haslogo?12*dpr:0);mx-=hlw;mx=cr.floor(mx)+0.5;my=cr.floor(my)+0.5;ctx.fillStyle=anyImageHadError?"red":"DodgerBlue";ctx.fillRect(mx,my,Math.floor(logowidth*this.progress),6*dpr);ctx.strokeStyle="black";ctx.strokeRect(mx,my,logowidth,6*dpr);ctx.strokeStyle="white";ctx.strokeRect(mx-1*dpr,my-1*dpr,logowidth+2*dpr,8*dpr);}
else if(this.loaderstyle===2)
{ctx.font=(this.isEjecta?"12pt ArialMT":"12pt Arial");ctx.fillStyle=anyImageHadError?"#f00":"#999";ctx.textBaseLine="middle";var percent_text=Math.round(this.progress*100)+"%";var text_dim=ctx.measureText?ctx.measureText(percent_text):null;var text_width=text_dim?text_dim.width:0;ctx.fillText(percent_text,mx-(text_width/2),my);}
this.last_progress=this.progress;}
else if(this.loaderstyle===4)
{this.draw_c2_splash_loader(ctx);if(raf)
raf(function(){self.go();});else
setTimeout(function(){self.go();},16);return;}}
setTimeout(function(){self.go();},(this.isCocoonJs?10:100));}};var splashStartTime=-1;var splashFadeInDuration=300;var splashFadeOutDuration=300;var splashAfterFadeOutWait=(typeof cr_is_preview==="undefined"?200:0);var splashIsFadeIn=true;var splashIsFadeOut=false;var splashFadeInFinish=0;var splashFadeOutStart=0;var splashMinDisplayTime=(typeof cr_is_preview==="undefined"?3000:0);var renderViaCanvas=null;var renderViaCtx=null;var splashFrameNumber=0;function maybeCreateRenderViaCanvas(w,h)
{if(!renderViaCanvas||renderViaCanvas.width!==w||renderViaCanvas.height!==h)
{renderViaCanvas=document.createElement("canvas");renderViaCanvas.width=w;renderViaCanvas.height=h;renderViaCtx=renderViaCanvas.getContext("2d");}};function mipImage(arr,size)
{if(size<=128)
return arr[3];else if(size<=256)
return arr[2];else if(size<=512)
return arr[1];else
return arr[0];};Runtime.prototype.draw_c2_splash_loader=function(ctx)
{if(isC2SplashDone)
return;var w=Math.ceil(this.width);var h=Math.ceil(this.height);var dpr=this.devicePixelRatio;var logoimages=this.loaderlogos.logo;var poweredimages=this.loaderlogos.powered;var websiteimages=this.loaderlogos.website;for(var i=0;i<4;++i)
{if(!logoimages[i].complete||!poweredimages[i].complete||!websiteimages[i].complete)
return;}
if(splashFrameNumber===0)
splashStartTime=Date.now();var nowTime=Date.now();var isRenderingVia=false;var renderToCtx=ctx;var drawW,drawH;if(splashIsFadeIn||splashIsFadeOut)
{ctx.clearRect(0,0,w,h);maybeCreateRenderViaCanvas(w,h);renderToCtx=renderViaCtx;isRenderingVia=true;if(splashIsFadeIn&&splashFrameNumber===1)
splashStartTime=Date.now();}
else
{ctx.globalAlpha=1;}
renderToCtx.fillStyle="#333333";renderToCtx.fillRect(0,0,w,h);if(this.cssHeight>256)
{drawW=cr.clamp(h*0.22,105,w*0.6);drawH=drawW*0.25;renderToCtx.drawImage(mipImage(poweredimages,drawW),w*0.5-drawW/2,h*0.2-drawH/2,drawW,drawH);drawW=Math.min(h*0.395,w*0.95);drawH=drawW;renderToCtx.drawImage(mipImage(logoimages,drawW),w*0.5-drawW/2,h*0.485-drawH/2,drawW,drawH);drawW=cr.clamp(h*0.22,105,w*0.6);drawH=drawW*0.25;renderToCtx.drawImage(mipImage(websiteimages,drawW),w*0.5-drawW/2,h*0.868-drawH/2,drawW,drawH);renderToCtx.fillStyle="#3C3C3C";drawW=w;drawH=Math.max(h*0.005,2);renderToCtx.fillRect(0,h*0.8-drawH/2,drawW,drawH);renderToCtx.fillStyle=anyImageHadError?"red":"#E0FF65";drawW=w*this.progress;renderToCtx.fillRect(w*0.5-drawW/2,h*0.8-drawH/2,drawW,drawH);}
else
{drawW=h*0.55;drawH=drawW;renderToCtx.drawImage(mipImage(logoimages,drawW),w*0.5-drawW/2,h*0.45-drawH/2,drawW,drawH);renderToCtx.fillStyle="#3C3C3C";drawW=w;drawH=Math.max(h*0.005,2);renderToCtx.fillRect(0,h*0.85-drawH/2,drawW,drawH);renderToCtx.fillStyle=anyImageHadError?"red":"#E0FF65";drawW=w*this.progress;renderToCtx.fillRect(w*0.5-drawW/2,h*0.85-drawH/2,drawW,drawH);}
if(isRenderingVia)
{if(splashIsFadeIn)
{if(splashFrameNumber===0)
ctx.globalAlpha=0;else
ctx.globalAlpha=Math.min((nowTime-splashStartTime)/splashFadeInDuration,1);}
else if(splashIsFadeOut)
{ctx.globalAlpha=Math.max(1-(nowTime-splashFadeOutStart)/splashFadeOutDuration,0);}
ctx.drawImage(renderViaCanvas,0,0,w,h);}
if(splashIsFadeIn&&nowTime-splashStartTime>=splashFadeInDuration&&splashFrameNumber>=2)
{splashIsFadeIn=false;splashFadeInFinish=nowTime;}
if(!splashIsFadeIn&&nowTime-splashFadeInFinish>=splashMinDisplayTime&&!splashIsFadeOut&&this.progress>=1)
{splashIsFadeOut=true;splashFadeOutStart=nowTime;}
if((splashIsFadeOut&&nowTime-splashFadeOutStart>=splashFadeOutDuration+splashAfterFadeOutWait)||(typeof cr_is_preview!=="undefined"&&this.progress>=1&&Date.now()-splashStartTime<500))
{isC2SplashDone=true;splashIsFadeIn=false;splashIsFadeOut=false;renderViaCanvas=null;renderViaCtx=null;this.loaderlogos=null;}
++splashFrameNumber;};Runtime.prototype.go_loading_finished=function()
{if(this.overlay_canvas)
{this.canvas.parentNode.removeChild(this.overlay_canvas);this.overlay_ctx=null;this.overlay_canvas=null;}
this.start_time=Date.now();this.last_fps_time=cr.performance_now();var i,len,t;if(this.uses_loader_layout)
{for(i=0,len=this.types_by_index.length;i<len;i++)
{t=this.types_by_index[i];if(!t.is_family&&!t.isOnLoaderLayout&&t.plugin.is_world)
{t.onCreate();cr.seal(t);}}}
else
this.isloading=false;for(i=0,len=this.layouts_by_index.length;i<len;i++)
{this.layouts_by_index[i].createGlobalNonWorlds();}
if(this.fullscreen_mode>=2)
{var orig_aspect=this.original_width/this.original_height;var cur_aspect=this.width/this.height;if((this.fullscreen_mode!==2&&cur_aspect>orig_aspect)||(this.fullscreen_mode===2&&cur_aspect<orig_aspect))
this.aspect_scale=this.height/this.original_height;else
this.aspect_scale=this.width/this.original_width;}
if(this.first_layout)
this.layouts[this.first_layout].startRunning();else
this.layouts_by_index[0].startRunning();;if(!this.uses_loader_layout)
{this.loadingprogress=1;this.trigger(cr.system_object.prototype.cnds.OnLoadFinished,null);if(window["C2_RegisterSW"])
window["C2_RegisterSW"]();}
if(navigator["splashscreen"]&&navigator["splashscreen"]["hide"])
navigator["splashscreen"]["hide"]();for(i=0,len=this.types_by_index.length;i<len;i++)
{t=this.types_by_index[i];if(t.onAppBegin)
t.onAppBegin();}
if(document["hidden"]||document["webkitHidden"]||document["mozHidden"]||document["msHidden"])
{window["cr_setSuspended"](true);}
else
{this.tick(false);}
if(this.isDirectCanvas)
AppMobi["webview"]["execute"]("onGameReady();");};Runtime.prototype.tick=function(background_wake,timestamp,debug_step)
{if(!this.running_layout)
return;var nowtime=cr.performance_now();var logic_start=nowtime;if(!debug_step&&this.isSuspended&&!background_wake)
return;if(!background_wake)
{if(raf)
this.raf_id=raf(this.tickFunc);else
{this.timeout_id=setTimeout(this.tickFunc,this.isMobile?1:16);}}
var raf_time=timestamp||nowtime;var fsmode=this.fullscreen_mode;var isfullscreen=(document["mozFullScreen"]||document["webkitIsFullScreen"]||document["fullScreen"]||!!document["msFullscreenElement"])&&!this.isCordova;if((isfullscreen||this.isNodeFullscreen)&&this.fullscreen_scaling>0)
fsmode=this.fullscreen_scaling;if(fsmode>0)
{var curwidth=window.innerWidth;var curheight=window.innerHeight;if(this.lastWindowWidth!==curwidth||this.lastWindowHeight!==curheight)
{this["setSize"](curwidth,curheight);}}
if(!this.isDomFree)
{if(isfullscreen)
{if(!this.firstInFullscreen)
this.firstInFullscreen=true;}
else
{if(this.firstInFullscreen)
{this.firstInFullscreen=false;if(this.fullscreen_mode===0)
{this["setSize"](Math.round(this.oldWidth/this.devicePixelRatio),Math.round(this.oldHeight/this.devicePixelRatio),true);}}
else
{this.oldWidth=this.width;this.oldHeight=this.height;}}}
if(this.isloading)
{var done=this.areAllTexturesAndSoundsLoaded();this.loadingprogress=this.progress;if(done)
{this.isloading=false;this.progress=1;this.trigger(cr.system_object.prototype.cnds.OnLoadFinished,null);if(window["C2_RegisterSW"])
window["C2_RegisterSW"]();}}
this.logic(raf_time);if((this.redraw||this.isCocoonJs)&&!this.is_WebGL_context_lost&&!this.suspendDrawing&&!background_wake)
{this.redraw=false;if(this.glwrap)
this.drawGL();else
this.draw();if(this.snapshotCanvas)
{if(this.canvas&&this.canvas.toDataURL)
{this.snapshotData=this.canvas.toDataURL(this.snapshotCanvas[0],this.snapshotCanvas[1]);if(window["cr_onSnapshot"])
window["cr_onSnapshot"](this.snapshotData);this.trigger(cr.system_object.prototype.cnds.OnCanvasSnapshot,null);}
this.snapshotCanvas=null;}}
if(!this.hit_breakpoint)
{this.tickcount++;this.tickcount_nosave++;this.execcount++;this.framecount++;}
this.logictime+=cr.performance_now()-logic_start;};Runtime.prototype.logic=function(cur_time)
{var i,leni,j,lenj,k,lenk,type,inst,binst;if(cur_time-this.last_fps_time>=1000)
{this.last_fps_time+=1000;if(cur_time-this.last_fps_time>=1000)
this.last_fps_time=cur_time;this.fps=this.framecount;this.framecount=0;this.cpuutilisation=this.logictime;this.logictime=0;}
var wallDt=0;if(this.last_tick_time!==0)
{var ms_diff=cur_time-this.last_tick_time;if(ms_diff<0)
ms_diff=0;wallDt=ms_diff/1000.0;this.dt1=wallDt;if(this.dt1>0.5)
this.dt1=0;else if(this.dt1>1/this.minimumFramerate)
this.dt1=1/this.minimumFramerate;}
this.last_tick_time=cur_time;this.dt=this.dt1*this.timescale;this.kahanTime.add(this.dt);this.wallTime.add(wallDt);var isfullscreen=(document["mozFullScreen"]||document["webkitIsFullScreen"]||document["fullScreen"]||!!document["msFullscreenElement"]||this.isNodeFullscreen)&&!this.isCordova;if(this.fullscreen_mode>=2||(isfullscreen&&this.fullscreen_scaling>0))
{var orig_aspect=this.original_width/this.original_height;var cur_aspect=this.width/this.height;var mode=this.fullscreen_mode;if(isfullscreen&&this.fullscreen_scaling>0)
mode=this.fullscreen_scaling;if((mode!==2&&cur_aspect>orig_aspect)||(mode===2&&cur_aspect<orig_aspect))
{this.aspect_scale=this.height/this.original_height;}
else
{this.aspect_scale=this.width/this.original_width;}
if(this.running_layout)
{this.running_layout.scrollToX(this.running_layout.scrollX);this.running_layout.scrollToY(this.running_layout.scrollY);}}
else
this.aspect_scale=(this.isRetina?this.devicePixelRatio:1);this.ClearDeathRow();this.isInOnDestroy++;this.system.runWaits();this.isInOnDestroy--;this.ClearDeathRow();this.isInOnDestroy++;var tickarr=this.objects_to_pretick.valuesRef();for(i=0,leni=tickarr.length;i<leni;i++)
tickarr[i].pretick();for(i=0,leni=this.types_by_index.length;i<leni;i++)
{type=this.types_by_index[i];if(type.is_family||(!type.behaviors.length&&!type.families.length))
continue;for(j=0,lenj=type.instances.length;j<lenj;j++)
{inst=type.instances[j];for(k=0,lenk=inst.behavior_insts.length;k<lenk;k++)
{inst.behavior_insts[k].tick();}}}
for(i=0,leni=this.types_by_index.length;i<leni;i++)
{type=this.types_by_index[i];if(type.is_family||(!type.behaviors.length&&!type.families.length))
continue;for(j=0,lenj=type.instances.length;j<lenj;j++)
{inst=type.instances[j];for(k=0,lenk=inst.behavior_insts.length;k<lenk;k++)
{binst=inst.behavior_insts[k];if(binst.posttick)
binst.posttick();}}}
tickarr=this.objects_to_tick.valuesRef();for(i=0,leni=tickarr.length;i<leni;i++)
tickarr[i].tick();this.isInOnDestroy--;this.handleSaveLoad();i=0;while(this.changelayout&&i++<10)
{this.doChangeLayout(this.changelayout);}
for(i=0,leni=this.eventsheets_by_index.length;i<leni;i++)
this.eventsheets_by_index[i].hasRun=false;if(this.running_layout.event_sheet)
this.running_layout.event_sheet.run();cr.clearArray(this.registered_collisions);this.layout_first_tick=false;this.isInOnDestroy++;for(i=0,leni=this.types_by_index.length;i<leni;i++)
{type=this.types_by_index[i];if(type.is_family||(!type.behaviors.length&&!type.families.length))
continue;for(j=0,lenj=type.instances.length;j<lenj;j++)
{var inst=type.instances[j];for(k=0,lenk=inst.behavior_insts.length;k<lenk;k++)
{binst=inst.behavior_insts[k];if(binst.tick2)
binst.tick2();}}}
tickarr=this.objects_to_tick2.valuesRef();for(i=0,leni=tickarr.length;i<leni;i++)
tickarr[i].tick2();this.isInOnDestroy--;};Runtime.prototype.onWindowBlur=function()
{var i,leni,j,lenj,k,lenk,type,inst,binst;for(i=0,leni=this.types_by_index.length;i<leni;i++)
{type=this.types_by_index[i];if(type.is_family)
continue;for(j=0,lenj=type.instances.length;j<lenj;j++)
{inst=type.instances[j];if(inst.onWindowBlur)
inst.onWindowBlur();if(!inst.behavior_insts)
continue;for(k=0,lenk=inst.behavior_insts.length;k<lenk;k++)
{binst=inst.behavior_insts[k];if(binst.onWindowBlur)
binst.onWindowBlur();}}}};Runtime.prototype.doChangeLayout=function(changeToLayout)
{var prev_layout=this.running_layout;this.running_layout.stopRunning();var i,len,j,lenj,k,lenk,type,inst,binst;if(this.glwrap)
{for(i=0,len=this.types_by_index.length;i<len;i++)
{type=this.types_by_index[i];if(type.is_family)
continue;if(type.unloadTextures&&(!type.global||type.instances.length===0)&&changeToLayout.initial_types.indexOf(type)===-1)
{type.unloadTextures();}}}
if(prev_layout==changeToLayout)
cr.clearArray(this.system.waits);cr.clearArray(this.registered_collisions);this.runLayoutChangeMethods(true);changeToLayout.startRunning();this.runLayoutChangeMethods(false);this.redraw=true;this.layout_first_tick=true;this.ClearDeathRow();};Runtime.prototype.runLayoutChangeMethods=function(isBeforeChange)
{var i,len,beh,type,j,lenj,inst,k,lenk,binst;for(i=0,len=this.behaviors.length;i<len;i++)
{beh=this.behaviors[i];if(isBeforeChange)
{if(beh.onBeforeLayoutChange)
beh.onBeforeLayoutChange();}
else
{if(beh.onLayoutChange)
beh.onLayoutChange();}}
for(i=0,len=this.types_by_index.length;i<len;i++)
{type=this.types_by_index[i];if(!type.global&&!type.plugin.singleglobal)
continue;for(j=0,lenj=type.instances.length;j<lenj;j++)
{inst=type.instances[j];if(isBeforeChange)
{if(inst.onBeforeLayoutChange)
inst.onBeforeLayoutChange();}
else
{if(inst.onLayoutChange)
inst.onLayoutChange();}
if(inst.behavior_insts)
{for(k=0,lenk=inst.behavior_insts.length;k<lenk;k++)
{binst=inst.behavior_insts[k];if(isBeforeChange)
{if(binst.onBeforeLayoutChange)
binst.onBeforeLayoutChange();}
else
{if(binst.onLayoutChange)
binst.onLayoutChange();}}}}}};Runtime.prototype.pretickMe=function(inst)
{this.objects_to_pretick.add(inst);};Runtime.prototype.unpretickMe=function(inst)
{this.objects_to_pretick.remove(inst);};Runtime.prototype.tickMe=function(inst)
{this.objects_to_tick.add(inst);};Runtime.prototype.untickMe=function(inst)
{this.objects_to_tick.remove(inst);};Runtime.prototype.tick2Me=function(inst)
{this.objects_to_tick2.add(inst);};Runtime.prototype.untick2Me=function(inst)
{this.objects_to_tick2.remove(inst);};Runtime.prototype.getDt=function(inst)
{if(!inst||inst.my_timescale===-1.0)
return this.dt;return this.dt1*inst.my_timescale;};Runtime.prototype.draw=function()
{this.running_layout.draw(this.ctx);if(this.isDirectCanvas)
this.ctx["present"]();};Runtime.prototype.drawGL=function()
{if(this.enableFrontToBack)
{this.earlyz_index=1;this.running_layout.drawGL_earlyZPass(this.glwrap);}
this.running_layout.drawGL(this.glwrap);this.glwrap.present();};Runtime.prototype.addDestroyCallback=function(f)
{if(f)
this.destroycallbacks.push(f);};Runtime.prototype.removeDestroyCallback=function(f)
{cr.arrayFindRemove(this.destroycallbacks,f);};Runtime.prototype.getObjectByUID=function(uid_)
{;var uidstr=uid_.toString();if(this.objectsByUid.hasOwnProperty(uidstr))
return this.objectsByUid[uidstr];else
return null;};var objectset_cache=[];function alloc_objectset()
{if(objectset_cache.length)
return objectset_cache.pop();else
return new cr.ObjectSet();};function free_objectset(s)
{s.clear();objectset_cache.push(s);};Runtime.prototype.DestroyInstance=function(inst)
{var i,len;var type=inst.type;var typename=type.name;var has_typename=this.deathRow.hasOwnProperty(typename);var obj_set=null;if(has_typename)
{obj_set=this.deathRow[typename];if(obj_set.contains(inst))
return;}
else
{obj_set=alloc_objectset();this.deathRow[typename]=obj_set;}
obj_set.add(inst);this.hasPendingInstances=true;if(inst.is_contained)
{for(i=0,len=inst.siblings.length;i<len;i++)
{this.DestroyInstance(inst.siblings[i]);}}
if(this.isInClearDeathRow)
obj_set.values_cache.push(inst);if(!this.isEndingLayout)
{this.isInOnDestroy++;this.trigger(Object.getPrototypeOf(inst.type.plugin).cnds.OnDestroyed,inst);this.isInOnDestroy--;}};Runtime.prototype.ClearDeathRow=function()
{if(!this.hasPendingInstances)
return;var inst,type,instances;var i,j,leni,lenj,obj_set;this.isInClearDeathRow=true;for(i=0,leni=this.createRow.length;i<leni;++i)
{inst=this.createRow[i];type=inst.type;type.instances.push(inst);for(j=0,lenj=type.families.length;j<lenj;++j)
{type.families[j].instances.push(inst);type.families[j].stale_iids=true;}}
cr.clearArray(this.createRow);this.IterateDeathRow();cr.wipe(this.deathRow);this.isInClearDeathRow=false;this.hasPendingInstances=false;};Runtime.prototype.IterateDeathRow=function()
{for(var p in this.deathRow)
{if(this.deathRow.hasOwnProperty(p))
{this.ClearDeathRowForType(this.deathRow[p]);}}};Runtime.prototype.ClearDeathRowForType=function(obj_set)
{var arr=obj_set.valuesRef();;var type=arr[0].type;;;var i,len,j,lenj,w,f,layer_instances,inst;cr.arrayRemoveAllFromObjectSet(type.instances,obj_set);type.stale_iids=true;if(type.instances.length===0)
type.any_instance_parallaxed=false;for(i=0,len=type.families.length;i<len;++i)
{f=type.families[i];cr.arrayRemoveAllFromObjectSet(f.instances,obj_set);f.stale_iids=true;}
for(i=0,len=this.system.waits.length;i<len;++i)
{w=this.system.waits[i];if(w.sols.hasOwnProperty(type.index))
cr.arrayRemoveAllFromObjectSet(w.sols[type.index].insts,obj_set);if(!type.is_family)
{for(j=0,lenj=type.families.length;j<lenj;++j)
{f=type.families[j];if(w.sols.hasOwnProperty(f.index))
cr.arrayRemoveAllFromObjectSet(w.sols[f.index].insts,obj_set);}}}
var first_layer=arr[0].layer;if(first_layer)
{if(first_layer.useRenderCells)
{layer_instances=first_layer.instances;for(i=0,len=layer_instances.length;i<len;++i)
{inst=layer_instances[i];if(!obj_set.contains(inst))
continue;inst.update_bbox();first_layer.render_grid.update(inst,inst.rendercells,null);inst.rendercells.set(0,0,-1,-1);}}
cr.arrayRemoveAllFromObjectSet(first_layer.instances,obj_set);first_layer.setZIndicesStaleFrom(0);}
for(i=0;i<arr.length;++i)
{this.ClearDeathRowForSingleInstance(arr[i],type);}
free_objectset(obj_set);this.redraw=true;};Runtime.prototype.ClearDeathRowForSingleInstance=function(inst,type)
{var i,len,binst;for(i=0,len=this.destroycallbacks.length;i<len;++i)
this.destroycallbacks[i](inst);if(inst.collcells)
{type.collision_grid.update(inst,inst.collcells,null);}
var layer=inst.layer;if(layer)
{layer.removeFromInstanceList(inst,true);}
if(inst.behavior_insts)
{for(i=0,len=inst.behavior_insts.length;i<len;++i)
{binst=inst.behavior_insts[i];if(binst.onDestroy)
binst.onDestroy();binst.behavior.my_instances.remove(inst);}}
this.objects_to_pretick.remove(inst);this.objects_to_tick.remove(inst);this.objects_to_tick2.remove(inst);if(inst.onDestroy)
inst.onDestroy();if(this.objectsByUid.hasOwnProperty(inst.uid.toString()))
delete this.objectsByUid[inst.uid.toString()];this.objectcount--;if(type.deadCache.length<100)
type.deadCache.push(inst);};Runtime.prototype.createInstance=function(type,layer,sx,sy)
{if(type.is_family)
{var i=cr.floor(Math.random()*type.members.length);return this.createInstance(type.members[i],layer,sx,sy);}
if(!type.default_instance)
{return null;}
return this.createInstanceFromInit(type.default_instance,layer,false,sx,sy,false);};var all_behaviors=[];Runtime.prototype.createInstanceFromInit=function(initial_inst,layer,is_startup_instance,sx,sy,skip_siblings)
{var i,len,j,lenj,p,effect_fallback,x,y;if(!initial_inst)
return null;var type=this.types_by_index[initial_inst[1]];;;var is_world=type.plugin.is_world;;if(this.isloading&&is_world&&!type.isOnLoaderLayout)
return null;if(is_world&&!this.glwrap&&initial_inst[0][11]===11)
return null;var original_layer=layer;if(!is_world)
layer=null;var inst;if(type.deadCache.length)
{inst=type.deadCache.pop();inst.recycled=true;type.plugin.Instance.call(inst,type);}
else
{inst=new type.plugin.Instance(type);inst.recycled=false;}
if(is_startup_instance&&!skip_siblings&&!this.objectsByUid.hasOwnProperty(initial_inst[2].toString()))
inst.uid=initial_inst[2];else
inst.uid=this.next_uid++;this.objectsByUid[inst.uid.toString()]=inst;inst.puid=this.next_puid++;inst.iid=type.instances.length;for(i=0,len=this.createRow.length;i<len;++i)
{if(this.createRow[i].type===type)
inst.iid++;}
inst.get_iid=cr.inst_get_iid;inst.toString=cr.inst_toString;var initial_vars=initial_inst[3];if(inst.recycled)
{cr.wipe(inst.extra);}
else
{inst.extra={};if(typeof cr_is_preview!=="undefined")
{inst.instance_var_names=[];inst.instance_var_names.length=initial_vars.length;for(i=0,len=initial_vars.length;i<len;i++)
inst.instance_var_names[i]=initial_vars[i][1];}
inst.instance_vars=[];inst.instance_vars.length=initial_vars.length;}
for(i=0,len=initial_vars.length;i<len;i++)
inst.instance_vars[i]=initial_vars[i][0];if(is_world)
{var wm=initial_inst[0];;inst.x=cr.is_undefined(sx)?wm[0]:sx;inst.y=cr.is_undefined(sy)?wm[1]:sy;inst.z=wm[2];inst.width=wm[3];inst.height=wm[4];inst.depth=wm[5];inst.angle=wm[6];inst.opacity=wm[7];inst.hotspotX=wm[8];inst.hotspotY=wm[9];inst.blend_mode=wm[10];effect_fallback=wm[11];if(!this.glwrap&&type.effect_types.length)
inst.blend_mode=effect_fallback;inst.compositeOp=cr.effectToCompositeOp(inst.blend_mode);if(this.gl)
cr.setGLBlend(inst,inst.blend_mode,this.gl);if(inst.recycled)
{for(i=0,len=wm[12].length;i<len;i++)
{for(j=0,lenj=wm[12][i].length;j<lenj;j++)
inst.effect_params[i][j]=wm[12][i][j];}
inst.bbox.set(0,0,0,0);inst.collcells.set(0,0,-1,-1);inst.rendercells.set(0,0,-1,-1);inst.bquad.set_from_rect(inst.bbox);cr.clearArray(inst.bbox_changed_callbacks);}
else
{inst.effect_params=wm[12].slice(0);for(i=0,len=inst.effect_params.length;i<len;i++)
inst.effect_params[i]=wm[12][i].slice(0);inst.active_effect_types=[];inst.active_effect_flags=[];inst.active_effect_flags.length=type.effect_types.length;inst.bbox=new cr.rect(0,0,0,0);inst.collcells=new cr.rect(0,0,-1,-1);inst.rendercells=new cr.rect(0,0,-1,-1);inst.bquad=new cr.quad();inst.bbox_changed_callbacks=[];inst.set_bbox_changed=cr.set_bbox_changed;inst.add_bbox_changed_callback=cr.add_bbox_changed_callback;inst.contains_pt=cr.inst_contains_pt;inst.update_bbox=cr.update_bbox;inst.update_render_cell=cr.update_render_cell;inst.update_collision_cell=cr.update_collision_cell;inst.get_zindex=cr.inst_get_zindex;}
inst.tilemap_exists=false;inst.tilemap_width=0;inst.tilemap_height=0;inst.tilemap_data=null;if(wm.length===14)
{inst.tilemap_exists=true;inst.tilemap_width=wm[13][0];inst.tilemap_height=wm[13][1];inst.tilemap_data=wm[13][2];}
for(i=0,len=type.effect_types.length;i<len;i++)
inst.active_effect_flags[i]=true;inst.shaders_preserve_opaqueness=true;inst.updateActiveEffects=cr.inst_updateActiveEffects;inst.updateActiveEffects();inst.uses_shaders=!!inst.active_effect_types.length;inst.bbox_changed=true;inst.cell_changed=true;type.any_cell_changed=true;inst.visible=true;inst.my_timescale=-1.0;inst.layer=layer;inst.zindex=layer.instances.length;inst.earlyz_index=0;if(typeof inst.collision_poly==="undefined")
inst.collision_poly=null;inst.collisionsEnabled=true;this.redraw=true;}
var initial_props,binst;cr.clearArray(all_behaviors);for(i=0,len=type.families.length;i<len;i++)
{all_behaviors.push.apply(all_behaviors,type.families[i].behaviors);}
all_behaviors.push.apply(all_behaviors,type.behaviors);if(inst.recycled)
{for(i=0,len=all_behaviors.length;i<len;i++)
{var btype=all_behaviors[i];binst=inst.behavior_insts[i];binst.recycled=true;btype.behavior.Instance.call(binst,btype,inst);initial_props=initial_inst[4][i];for(j=0,lenj=initial_props.length;j<lenj;j++)
binst.properties[j]=initial_props[j];binst.onCreate();btype.behavior.my_instances.add(inst);}}
else
{inst.behavior_insts=[];for(i=0,len=all_behaviors.length;i<len;i++)
{var btype=all_behaviors[i];var binst=new btype.behavior.Instance(btype,inst);binst.recycled=false;binst.properties=initial_inst[4][i].slice(0);binst.onCreate();cr.seal(binst);inst.behavior_insts.push(binst);btype.behavior.my_instances.add(inst);}}
initial_props=initial_inst[5];if(inst.recycled)
{for(i=0,len=initial_props.length;i<len;i++)
inst.properties[i]=initial_props[i];}
else
inst.properties=initial_props.slice(0);this.createRow.push(inst);this.hasPendingInstances=true;if(layer)
{;layer.appendToInstanceList(inst,true);if(layer.parallaxX!==1||layer.parallaxY!==1)
type.any_instance_parallaxed=true;}
this.objectcount++;if(type.is_contained)
{inst.is_contained=true;if(inst.recycled)
cr.clearArray(inst.siblings);else
inst.siblings=[];if(!is_startup_instance&&!skip_siblings)
{for(i=0,len=type.container.length;i<len;i++)
{if(type.container[i]===type)
continue;if(!type.container[i].default_instance)
{return null;}
inst.siblings.push(this.createInstanceFromInit(type.container[i].default_instance,original_layer,false,is_world?inst.x:sx,is_world?inst.y:sy,true));}
for(i=0,len=inst.siblings.length;i<len;i++)
{inst.siblings[i].siblings.push(inst);for(j=0;j<len;j++)
{if(i!==j)
inst.siblings[i].siblings.push(inst.siblings[j]);}}}}
else
{inst.is_contained=false;inst.siblings=null;}
inst.onCreate();if(!inst.recycled)
cr.seal(inst);for(i=0,len=inst.behavior_insts.length;i<len;i++)
{if(inst.behavior_insts[i].postCreate)
inst.behavior_insts[i].postCreate();}
return inst;};Runtime.prototype.getLayerByName=function(layer_name)
{var i,len;for(i=0,len=this.running_layout.layers.length;i<len;i++)
{var layer=this.running_layout.layers[i];if(cr.equals_nocase(layer.name,layer_name))
return layer;}
return null;};Runtime.prototype.getLayerByNumber=function(index)
{index=cr.floor(index);if(index<0)
index=0;if(index>=this.running_layout.layers.length)
index=this.running_layout.layers.length-1;return this.running_layout.layers[index];};Runtime.prototype.getLayer=function(l)
{if(cr.is_number(l))
return this.getLayerByNumber(l);else
return this.getLayerByName(l.toString());};Runtime.prototype.clearSol=function(solModifiers)
{var i,len;for(i=0,len=solModifiers.length;i<len;i++)
{solModifiers[i].getCurrentSol().select_all=true;}};Runtime.prototype.pushCleanSol=function(solModifiers)
{var i,len;for(i=0,len=solModifiers.length;i<len;i++)
{solModifiers[i].pushCleanSol();}};Runtime.prototype.pushCopySol=function(solModifiers)
{var i,len;for(i=0,len=solModifiers.length;i<len;i++)
{solModifiers[i].pushCopySol();}};Runtime.prototype.popSol=function(solModifiers)
{var i,len;for(i=0,len=solModifiers.length;i<len;i++)
{solModifiers[i].popSol();}};Runtime.prototype.updateAllCells=function(type)
{if(!type.any_cell_changed)
return;var i,len,instances=type.instances;for(i=0,len=instances.length;i<len;++i)
{instances[i].update_collision_cell();}
var createRow=this.createRow;for(i=0,len=createRow.length;i<len;++i)
{if(createRow[i].type===type)
createRow[i].update_collision_cell();}
type.any_cell_changed=false;};Runtime.prototype.getCollisionCandidates=function(layer,rtype,bbox,candidates)
{var i,len,t;var is_parallaxed=(layer?(layer.parallaxX!==1||layer.parallaxY!==1):false);if(rtype.is_family)
{for(i=0,len=rtype.members.length;i<len;++i)
{t=rtype.members[i];if(is_parallaxed||t.any_instance_parallaxed)
{cr.appendArray(candidates,t.instances);}
else
{this.updateAllCells(t);t.collision_grid.queryRange(bbox,candidates);}}}
else
{if(is_parallaxed||rtype.any_instance_parallaxed)
{cr.appendArray(candidates,rtype.instances);}
else
{this.updateAllCells(rtype);rtype.collision_grid.queryRange(bbox,candidates);}}};Runtime.prototype.getTypesCollisionCandidates=function(layer,types,bbox,candidates)
{var i,len;for(i=0,len=types.length;i<len;++i)
{this.getCollisionCandidates(layer,types[i],bbox,candidates);}};Runtime.prototype.getSolidCollisionCandidates=function(layer,bbox,candidates)
{var solid=this.getSolidBehavior();if(!solid)
return null;this.getTypesCollisionCandidates(layer,solid.my_types,bbox,candidates);};Runtime.prototype.getJumpthruCollisionCandidates=function(layer,bbox,candidates)
{var jumpthru=this.getJumpthruBehavior();if(!jumpthru)
return null;this.getTypesCollisionCandidates(layer,jumpthru.my_types,bbox,candidates);};Runtime.prototype.testAndSelectCanvasPointOverlap=function(type,ptx,pty,inverted)
{var sol=type.getCurrentSol();var i,j,inst,len;var orblock=this.getCurrentEventStack().current_event.orblock;var lx,ly,arr;if(sol.select_all)
{if(!inverted)
{sol.select_all=false;cr.clearArray(sol.instances);}
for(i=0,len=type.instances.length;i<len;i++)
{inst=type.instances[i];inst.update_bbox();lx=inst.layer.canvasToLayer(ptx,pty,true);ly=inst.layer.canvasToLayer(ptx,pty,false);if(inst.contains_pt(lx,ly))
{if(inverted)
return false;else
sol.instances.push(inst);}
else if(orblock)
sol.else_instances.push(inst);}}
else
{j=0;arr=(orblock?sol.else_instances:sol.instances);for(i=0,len=arr.length;i<len;i++)
{inst=arr[i];inst.update_bbox();lx=inst.layer.canvasToLayer(ptx,pty,true);ly=inst.layer.canvasToLayer(ptx,pty,false);if(inst.contains_pt(lx,ly))
{if(inverted)
return false;else if(orblock)
sol.instances.push(inst);else
{sol.instances[j]=sol.instances[i];j++;}}}
if(!inverted)
arr.length=j;}
type.applySolToContainer();if(inverted)
return true;else
return sol.hasObjects();};Runtime.prototype.testOverlap=function(a,b)
{if(!a||!b||a===b||!a.collisionsEnabled||!b.collisionsEnabled)
return false;a.update_bbox();b.update_bbox();var layera=a.layer;var layerb=b.layer;var different_layers=(layera!==layerb&&(layera.parallaxX!==layerb.parallaxX||layerb.parallaxY!==layerb.parallaxY||layera.scale!==layerb.scale||layera.angle!==layerb.angle||layera.zoomRate!==layerb.zoomRate));var i,len,i2,i21,x,y,haspolya,haspolyb,polya,polyb;if(!different_layers)
{if(!a.bbox.intersects_rect(b.bbox))
return false;if(!a.bquad.intersects_quad(b.bquad))
return false;if(a.tilemap_exists&&b.tilemap_exists)
return false;if(a.tilemap_exists)
return this.testTilemapOverlap(a,b);if(b.tilemap_exists)
return this.testTilemapOverlap(b,a);haspolya=(a.collision_poly&&!a.collision_poly.is_empty());haspolyb=(b.collision_poly&&!b.collision_poly.is_empty());if(!haspolya&&!haspolyb)
return true;if(haspolya)
{a.collision_poly.cache_poly(a.width,a.height,a.angle);polya=a.collision_poly;}
else
{this.temp_poly.set_from_quad(a.bquad,a.x,a.y,a.width,a.height);polya=this.temp_poly;}
if(haspolyb)
{b.collision_poly.cache_poly(b.width,b.height,b.angle);polyb=b.collision_poly;}
else
{this.temp_poly.set_from_quad(b.bquad,b.x,b.y,b.width,b.height);polyb=this.temp_poly;}
return polya.intersects_poly(polyb,b.x-a.x,b.y-a.y);}
else
{haspolya=(a.collision_poly&&!a.collision_poly.is_empty());haspolyb=(b.collision_poly&&!b.collision_poly.is_empty());if(haspolya)
{a.collision_poly.cache_poly(a.width,a.height,a.angle);this.temp_poly.set_from_poly(a.collision_poly);}
else
{this.temp_poly.set_from_quad(a.bquad,a.x,a.y,a.width,a.height);}
polya=this.temp_poly;if(haspolyb)
{b.collision_poly.cache_poly(b.width,b.height,b.angle);this.temp_poly2.set_from_poly(b.collision_poly);}
else
{this.temp_poly2.set_from_quad(b.bquad,b.x,b.y,b.width,b.height);}
polyb=this.temp_poly2;for(i=0,len=polya.pts_count;i<len;i++)
{i2=i*2;i21=i2+1;x=polya.pts_cache[i2];y=polya.pts_cache[i21];polya.pts_cache[i2]=layera.layerToCanvas(x+a.x,y+a.y,true);polya.pts_cache[i21]=layera.layerToCanvas(x+a.x,y+a.y,false);}
polya.update_bbox();for(i=0,len=polyb.pts_count;i<len;i++)
{i2=i*2;i21=i2+1;x=polyb.pts_cache[i2];y=polyb.pts_cache[i21];polyb.pts_cache[i2]=layerb.layerToCanvas(x+b.x,y+b.y,true);polyb.pts_cache[i21]=layerb.layerToCanvas(x+b.x,y+b.y,false);}
polyb.update_bbox();return polya.intersects_poly(polyb,0,0);}};var tmpQuad=new cr.quad();var tmpRect=new cr.rect(0,0,0,0);var collrect_candidates=[];Runtime.prototype.testTilemapOverlap=function(tm,a)
{var i,len,c,rc;var bbox=a.bbox;var tmx=tm.x;var tmy=tm.y;tm.getCollisionRectCandidates(bbox,collrect_candidates);var collrects=collrect_candidates;var haspolya=(a.collision_poly&&!a.collision_poly.is_empty());for(i=0,len=collrects.length;i<len;++i)
{c=collrects[i];rc=c.rc;if(bbox.intersects_rect_off(rc,tmx,tmy))
{tmpQuad.set_from_rect(rc);tmpQuad.offset(tmx,tmy);if(tmpQuad.intersects_quad(a.bquad))
{if(haspolya)
{a.collision_poly.cache_poly(a.width,a.height,a.angle);if(c.poly)
{if(c.poly.intersects_poly(a.collision_poly,a.x-(tmx+rc.left),a.y-(tmy+rc.top)))
{cr.clearArray(collrect_candidates);return true;}}
else
{this.temp_poly.set_from_quad(tmpQuad,0,0,rc.right-rc.left,rc.bottom-rc.top);if(this.temp_poly.intersects_poly(a.collision_poly,a.x,a.y))
{cr.clearArray(collrect_candidates);return true;}}}
else
{if(c.poly)
{this.temp_poly.set_from_quad(a.bquad,0,0,a.width,a.height);if(c.poly.intersects_poly(this.temp_poly,-(tmx+rc.left),-(tmy+rc.top)))
{cr.clearArray(collrect_candidates);return true;}}
else
{cr.clearArray(collrect_candidates);return true;}}}}}
cr.clearArray(collrect_candidates);return false;};Runtime.prototype.testRectOverlap=function(r,b)
{if(!b||!b.collisionsEnabled)
return false;b.update_bbox();var layerb=b.layer;var haspolyb,polyb;if(!b.bbox.intersects_rect(r))
return false;if(b.tilemap_exists)
{b.getCollisionRectCandidates(r,collrect_candidates);var collrects=collrect_candidates;var i,len,c,tilerc;var tmx=b.x;var tmy=b.y;for(i=0,len=collrects.length;i<len;++i)
{c=collrects[i];tilerc=c.rc;if(r.intersects_rect_off(tilerc,tmx,tmy))
{if(c.poly)
{this.temp_poly.set_from_rect(r,0,0);if(c.poly.intersects_poly(this.temp_poly,-(tmx+tilerc.left),-(tmy+tilerc.top)))
{cr.clearArray(collrect_candidates);return true;}}
else
{cr.clearArray(collrect_candidates);return true;}}}
cr.clearArray(collrect_candidates);return false;}
else
{tmpQuad.set_from_rect(r);if(!b.bquad.intersects_quad(tmpQuad))
return false;haspolyb=(b.collision_poly&&!b.collision_poly.is_empty());if(!haspolyb)
return true;b.collision_poly.cache_poly(b.width,b.height,b.angle);tmpQuad.offset(-r.left,-r.top);this.temp_poly.set_from_quad(tmpQuad,0,0,1,1);return b.collision_poly.intersects_poly(this.temp_poly,r.left-b.x,r.top-b.y);}};Runtime.prototype.testSegmentOverlap=function(x1,y1,x2,y2,b)
{if(!b||!b.collisionsEnabled)
return false;b.update_bbox();var layerb=b.layer;var haspolyb,polyb;tmpRect.set(cr.min(x1,x2),cr.min(y1,y2),cr.max(x1,x2),cr.max(y1,y2));if(!b.bbox.intersects_rect(tmpRect))
return false;if(b.tilemap_exists)
{b.getCollisionRectCandidates(tmpRect,collrect_candidates);var collrects=collrect_candidates;var i,len,c,tilerc;var tmx=b.x;var tmy=b.y;for(i=0,len=collrects.length;i<len;++i)
{c=collrects[i];tilerc=c.rc;if(tmpRect.intersects_rect_off(tilerc,tmx,tmy))
{tmpQuad.set_from_rect(tilerc);tmpQuad.offset(tmx,tmy);if(tmpQuad.intersects_segment(x1,y1,x2,y2))
{if(c.poly)
{if(c.poly.intersects_segment(tmx+tilerc.left,tmy+tilerc.top,x1,y1,x2,y2))
{cr.clearArray(collrect_candidates);return true;}}
else
{cr.clearArray(collrect_candidates);return true;}}}}
cr.clearArray(collrect_candidates);return false;}
else
{if(!b.bquad.intersects_segment(x1,y1,x2,y2))
return false;haspolyb=(b.collision_poly&&!b.collision_poly.is_empty());if(!haspolyb)
return true;b.collision_poly.cache_poly(b.width,b.height,b.angle);return b.collision_poly.intersects_segment(b.x,b.y,x1,y1,x2,y2);}};Runtime.prototype.typeHasBehavior=function(t,b)
{if(!b)
return false;var i,len,j,lenj,f;for(i=0,len=t.behaviors.length;i<len;i++)
{if(t.behaviors[i].behavior instanceof b)
return true;}
if(!t.is_family)
{for(i=0,len=t.families.length;i<len;i++)
{f=t.families[i];for(j=0,lenj=f.behaviors.length;j<lenj;j++)
{if(f.behaviors[j].behavior instanceof b)
return true;}}}
return false;};Runtime.prototype.typeHasNoSaveBehavior=function(t)
{return this.typeHasBehavior(t,cr.behaviors.NoSave);};Runtime.prototype.typeHasPersistBehavior=function(t)
{return this.typeHasBehavior(t,cr.behaviors.Persist);};Runtime.prototype.getSolidBehavior=function()
{return this.solidBehavior;};Runtime.prototype.getJumpthruBehavior=function()
{return this.jumpthruBehavior;};var candidates=[];Runtime.prototype.testOverlapSolid=function(inst)
{var i,len,s;inst.update_bbox();this.getSolidCollisionCandidates(inst.layer,inst.bbox,candidates);for(i=0,len=candidates.length;i<len;++i)
{s=candidates[i];if(!s.extra["solidEnabled"])
continue;if(this.testOverlap(inst,s))
{cr.clearArray(candidates);return s;}}
cr.clearArray(candidates);return null;};Runtime.prototype.testRectOverlapSolid=function(r)
{var i,len,s;this.getSolidCollisionCandidates(null,r,candidates);for(i=0,len=candidates.length;i<len;++i)
{s=candidates[i];if(!s.extra["solidEnabled"])
continue;if(this.testRectOverlap(r,s))
{cr.clearArray(candidates);return s;}}
cr.clearArray(candidates);return null;};var jumpthru_array_ret=[];Runtime.prototype.testOverlapJumpThru=function(inst,all)
{var ret=null;if(all)
{ret=jumpthru_array_ret;cr.clearArray(ret);}
inst.update_bbox();this.getJumpthruCollisionCandidates(inst.layer,inst.bbox,candidates);var i,len,j;for(i=0,len=candidates.length;i<len;++i)
{j=candidates[i];if(!j.extra["jumpthruEnabled"])
continue;if(this.testOverlap(inst,j))
{if(all)
ret.push(j);else
{cr.clearArray(candidates);return j;}}}
cr.clearArray(candidates);return ret;};Runtime.prototype.pushOutSolid=function(inst,xdir,ydir,dist,include_jumpthrus,specific_jumpthru)
{var push_dist=dist||50;var oldx=inst.x
var oldy=inst.y;var i;var last_overlapped=null,secondlast_overlapped=null;for(i=0;i<push_dist;i++)
{inst.x=(oldx+(xdir*i));inst.y=(oldy+(ydir*i));inst.set_bbox_changed();if(!this.testOverlap(inst,last_overlapped))
{last_overlapped=this.testOverlapSolid(inst);if(last_overlapped)
secondlast_overlapped=last_overlapped;if(!last_overlapped)
{if(include_jumpthrus)
{if(specific_jumpthru)
last_overlapped=(this.testOverlap(inst,specific_jumpthru)?specific_jumpthru:null);else
last_overlapped=this.testOverlapJumpThru(inst);if(last_overlapped)
secondlast_overlapped=last_overlapped;}
if(!last_overlapped)
{if(secondlast_overlapped)
this.pushInFractional(inst,xdir,ydir,secondlast_overlapped,16);return true;}}}}
inst.x=oldx;inst.y=oldy;inst.set_bbox_changed();return false;};Runtime.prototype.pushOut=function(inst,xdir,ydir,dist,otherinst)
{var push_dist=dist||50;var oldx=inst.x
var oldy=inst.y;var i;for(i=0;i<push_dist;i++)
{inst.x=(oldx+(xdir*i));inst.y=(oldy+(ydir*i));inst.set_bbox_changed();if(!this.testOverlap(inst,otherinst))
return true;}
inst.x=oldx;inst.y=oldy;inst.set_bbox_changed();return false;};Runtime.prototype.pushInFractional=function(inst,xdir,ydir,obj,limit)
{var divisor=2;var frac;var forward=false;var overlapping=false;var bestx=inst.x;var besty=inst.y;while(divisor<=limit)
{frac=1/divisor;divisor*=2;inst.x+=xdir*frac*(forward?1:-1);inst.y+=ydir*frac*(forward?1:-1);inst.set_bbox_changed();if(this.testOverlap(inst,obj))
{forward=true;overlapping=true;}
else
{forward=false;overlapping=false;bestx=inst.x;besty=inst.y;}}
if(overlapping)
{inst.x=bestx;inst.y=besty;inst.set_bbox_changed();}};Runtime.prototype.pushOutSolidNearest=function(inst,max_dist_)
{var max_dist=(cr.is_undefined(max_dist_)?100:max_dist_);var dist=0;var oldx=inst.x
var oldy=inst.y;var dir=0;var dx=0,dy=0;var last_overlapped=this.testOverlapSolid(inst);if(!last_overlapped)
return true;while(dist<=max_dist)
{switch(dir){case 0:dx=0;dy=-1;dist++;break;case 1:dx=1;dy=-1;break;case 2:dx=1;dy=0;break;case 3:dx=1;dy=1;break;case 4:dx=0;dy=1;break;case 5:dx=-1;dy=1;break;case 6:dx=-1;dy=0;break;case 7:dx=-1;dy=-1;break;}
dir=(dir+1)%8;inst.x=cr.floor(oldx+(dx*dist));inst.y=cr.floor(oldy+(dy*dist));inst.set_bbox_changed();if(!this.testOverlap(inst,last_overlapped))
{last_overlapped=this.testOverlapSolid(inst);if(!last_overlapped)
return true;}}
inst.x=oldx;inst.y=oldy;inst.set_bbox_changed();return false;};Runtime.prototype.registerCollision=function(a,b)
{if(!a.collisionsEnabled||!b.collisionsEnabled)
return;this.registered_collisions.push([a,b]);};Runtime.prototype.addRegisteredCollisionCandidates=function(inst,otherType,arr)
{var i,len,r,otherInst;for(i=0,len=this.registered_collisions.length;i<len;++i)
{r=this.registered_collisions[i];if(r[0]===inst)
otherInst=r[1];else if(r[1]===inst)
otherInst=r[0];else
continue;if(otherType.is_family)
{if(otherType.members.indexOf(otherType)===-1)
continue;}
else
{if(otherInst.type!==otherType)
continue;}
if(arr.indexOf(otherInst)===-1)
arr.push(otherInst);}};Runtime.prototype.checkRegisteredCollision=function(a,b)
{var i,len,x;for(i=0,len=this.registered_collisions.length;i<len;i++)
{x=this.registered_collisions[i];if((x[0]===a&&x[1]===b)||(x[0]===b&&x[1]===a))
return true;}
return false;};Runtime.prototype.calculateSolidBounceAngle=function(inst,startx,starty,obj)
{var objx=inst.x;var objy=inst.y;var radius=cr.max(10,cr.distanceTo(startx,starty,objx,objy));var startangle=cr.angleTo(startx,starty,objx,objy);var firstsolid=obj||this.testOverlapSolid(inst);if(!firstsolid)
return cr.clamp_angle(startangle+cr.PI);var cursolid=firstsolid;var i,curangle,anticlockwise_free_angle,clockwise_free_angle;var increment=cr.to_radians(5);for(i=1;i<36;i++)
{curangle=startangle-i*increment;inst.x=startx+Math.cos(curangle)*radius;inst.y=starty+Math.sin(curangle)*radius;inst.set_bbox_changed();if(!this.testOverlap(inst,cursolid))
{cursolid=obj?null:this.testOverlapSolid(inst);if(!cursolid)
{anticlockwise_free_angle=curangle;break;}}}
if(i===36)
anticlockwise_free_angle=cr.clamp_angle(startangle+cr.PI);var cursolid=firstsolid;for(i=1;i<36;i++)
{curangle=startangle+i*increment;inst.x=startx+Math.cos(curangle)*radius;inst.y=starty+Math.sin(curangle)*radius;inst.set_bbox_changed();if(!this.testOverlap(inst,cursolid))
{cursolid=obj?null:this.testOverlapSolid(inst);if(!cursolid)
{clockwise_free_angle=curangle;break;}}}
if(i===36)
clockwise_free_angle=cr.clamp_angle(startangle+cr.PI);inst.x=objx;inst.y=objy;inst.set_bbox_changed();if(clockwise_free_angle===anticlockwise_free_angle)
return clockwise_free_angle;var half_diff=cr.angleDiff(clockwise_free_angle,anticlockwise_free_angle)/2;var normal;if(cr.angleClockwise(clockwise_free_angle,anticlockwise_free_angle))
{normal=cr.clamp_angle(anticlockwise_free_angle+half_diff+cr.PI);}
else
{normal=cr.clamp_angle(clockwise_free_angle+half_diff);};var vx=Math.cos(startangle);var vy=Math.sin(startangle);var nx=Math.cos(normal);var ny=Math.sin(normal);var v_dot_n=vx*nx+vy*ny;var rx=vx-2*v_dot_n*nx;var ry=vy-2*v_dot_n*ny;return cr.angleTo(0,0,rx,ry);};var triggerSheetIndex=-1;Runtime.prototype.trigger=function(method,inst,value)
{;if(!this.running_layout)
return false;var sheet=this.running_layout.event_sheet;if(!sheet)
return false;var ret=false;var r,i,len;triggerSheetIndex++;var deep_includes=sheet.deep_includes;for(i=0,len=deep_includes.length;i<len;++i)
{r=this.triggerOnSheet(method,inst,deep_includes[i],value);ret=ret||r;}
r=this.triggerOnSheet(method,inst,sheet,value);ret=ret||r;triggerSheetIndex--;return ret;};Runtime.prototype.triggerOnSheet=function(method,inst,sheet,value)
{var ret=false;var i,leni,r,families;if(!inst)
{r=this.triggerOnSheetForTypeName(method,inst,"system",sheet,value);ret=ret||r;}
else
{r=this.triggerOnSheetForTypeName(method,inst,inst.type.name,sheet,value);ret=ret||r;families=inst.type.families;for(i=0,leni=families.length;i<leni;++i)
{r=this.triggerOnSheetForTypeName(method,inst,families[i].name,sheet,value);ret=ret||r;}}
return ret;};Runtime.prototype.triggerOnSheetForTypeName=function(method,inst,type_name,sheet,value)
{var i,leni;var ret=false,ret2=false;var trig,index;var fasttrigger=(typeof value!=="undefined");var triggers=(fasttrigger?sheet.fasttriggers:sheet.triggers);var obj_entry=triggers[type_name];if(!obj_entry)
return ret;var triggers_list=null;for(i=0,leni=obj_entry.length;i<leni;++i)
{if(obj_entry[i].method==method)
{triggers_list=obj_entry[i].evs;break;}}
if(!triggers_list)
return ret;var triggers_to_fire;if(fasttrigger)
{triggers_to_fire=triggers_list[value];}
else
{triggers_to_fire=triggers_list;}
if(!triggers_to_fire)
return null;for(i=0,leni=triggers_to_fire.length;i<leni;i++)
{trig=triggers_to_fire[i][0];index=triggers_to_fire[i][1];ret2=this.executeSingleTrigger(inst,type_name,trig,index);ret=ret||ret2;}
return ret;};Runtime.prototype.executeSingleTrigger=function(inst,type_name,trig,index)
{var i,leni;var ret=false;this.trigger_depth++;var current_event=this.getCurrentEventStack().current_event;if(current_event)
this.pushCleanSol(current_event.solModifiersIncludingParents);var isrecursive=(this.trigger_depth>1);this.pushCleanSol(trig.solModifiersIncludingParents);if(isrecursive)
this.pushLocalVarStack();var event_stack=this.pushEventStack(trig);event_stack.current_event=trig;if(inst)
{var sol=this.types[type_name].getCurrentSol();sol.select_all=false;cr.clearArray(sol.instances);sol.instances[0]=inst;this.types[type_name].applySolToContainer();}
var ok_to_run=true;if(trig.parent)
{var temp_parents_arr=event_stack.temp_parents_arr;var cur_parent=trig.parent;while(cur_parent)
{temp_parents_arr.push(cur_parent);cur_parent=cur_parent.parent;}
temp_parents_arr.reverse();for(i=0,leni=temp_parents_arr.length;i<leni;i++)
{if(!temp_parents_arr[i].run_pretrigger())
{ok_to_run=false;break;}}}
if(ok_to_run)
{this.execcount++;if(trig.orblock)
trig.run_orblocktrigger(index);else
trig.run();ret=ret||event_stack.last_event_true;}
this.popEventStack();if(isrecursive)
this.popLocalVarStack();this.popSol(trig.solModifiersIncludingParents);if(current_event)
this.popSol(current_event.solModifiersIncludingParents);if(this.hasPendingInstances&&this.isInOnDestroy===0&&triggerSheetIndex===0&&!this.isRunningEvents)
{this.ClearDeathRow();}
this.trigger_depth--;return ret;};Runtime.prototype.getCurrentCondition=function()
{var evinfo=this.getCurrentEventStack();return evinfo.current_event.conditions[evinfo.cndindex];};Runtime.prototype.getCurrentConditionObjectType=function()
{var cnd=this.getCurrentCondition();return cnd.type;};Runtime.prototype.isCurrentConditionFirst=function()
{var evinfo=this.getCurrentEventStack();return evinfo.cndindex===0;};Runtime.prototype.getCurrentAction=function()
{var evinfo=this.getCurrentEventStack();return evinfo.current_event.actions[evinfo.actindex];};Runtime.prototype.pushLocalVarStack=function()
{this.localvar_stack_index++;if(this.localvar_stack_index>=this.localvar_stack.length)
this.localvar_stack.push([]);};Runtime.prototype.popLocalVarStack=function()
{;this.localvar_stack_index--;};Runtime.prototype.getCurrentLocalVarStack=function()
{return this.localvar_stack[this.localvar_stack_index];};Runtime.prototype.pushEventStack=function(cur_event)
{this.event_stack_index++;if(this.event_stack_index>=this.event_stack.length)
this.event_stack.push(new cr.eventStackFrame());var ret=this.getCurrentEventStack();ret.reset(cur_event);return ret;};Runtime.prototype.popEventStack=function()
{;this.event_stack_index--;};Runtime.prototype.getCurrentEventStack=function()
{return this.event_stack[this.event_stack_index];};Runtime.prototype.pushLoopStack=function(name_)
{this.loop_stack_index++;if(this.loop_stack_index>=this.loop_stack.length)
{this.loop_stack.push(cr.seal({name:name_,index:0,stopped:false}));}
var ret=this.getCurrentLoop();ret.name=name_;ret.index=0;ret.stopped=false;return ret;};Runtime.prototype.popLoopStack=function()
{;this.loop_stack_index--;};Runtime.prototype.getCurrentLoop=function()
{return this.loop_stack[this.loop_stack_index];};Runtime.prototype.getEventVariableByName=function(name,scope)
{var i,leni,j,lenj,sheet,e;while(scope)
{for(i=0,leni=scope.subevents.length;i<leni;i++)
{e=scope.subevents[i];if(e instanceof cr.eventvariable&&cr.equals_nocase(name,e.name))
return e;}
scope=scope.parent;}
for(i=0,leni=this.eventsheets_by_index.length;i<leni;i++)
{sheet=this.eventsheets_by_index[i];for(j=0,lenj=sheet.events.length;j<lenj;j++)
{e=sheet.events[j];if(e instanceof cr.eventvariable&&cr.equals_nocase(name,e.name))
return e;}}
return null;};Runtime.prototype.getLayoutBySid=function(sid_)
{var i,len;for(i=0,len=this.layouts_by_index.length;i<len;i++)
{if(this.layouts_by_index[i].sid===sid_)
return this.layouts_by_index[i];}
return null;};Runtime.prototype.getObjectTypeBySid=function(sid_)
{var i,len;for(i=0,len=this.types_by_index.length;i<len;i++)
{if(this.types_by_index[i].sid===sid_)
return this.types_by_index[i];}
return null;};Runtime.prototype.getGroupBySid=function(sid_)
{var i,len;for(i=0,len=this.allGroups.length;i<len;i++)
{if(this.allGroups[i].sid===sid_)
return this.allGroups[i];}
return null;};Runtime.prototype.doCanvasSnapshot=function(format_,quality_)
{this.snapshotCanvas=[format_,quality_];this.redraw=true;};function IsIndexedDBAvailable()
{try{return!!window.indexedDB;}
catch(e)
{return false;}};function makeSaveDb(e)
{var db=e.target.result;db.createObjectStore("saves",{keyPath:"slot"});};function IndexedDB_WriteSlot(slot_,data_,oncomplete_,onerror_)
{try{var request=indexedDB.open("_C2SaveStates");request.onupgradeneeded=makeSaveDb;request.onerror=onerror_;request.onsuccess=function(e)
{var db=e.target.result;db.onerror=onerror_;var transaction=db.transaction(["saves"],"readwrite");var objectStore=transaction.objectStore("saves");var putReq=objectStore.put({"slot":slot_,"data":data_});putReq.onsuccess=oncomplete_;};}
catch(err)
{onerror_(err);}};function IndexedDB_ReadSlot(slot_,oncomplete_,onerror_)
{try{var request=indexedDB.open("_C2SaveStates");request.onupgradeneeded=makeSaveDb;request.onerror=onerror_;request.onsuccess=function(e)
{var db=e.target.result;db.onerror=onerror_;var transaction=db.transaction(["saves"]);var objectStore=transaction.objectStore("saves");var readReq=objectStore.get(slot_);readReq.onsuccess=function(e)
{if(readReq.result)
oncomplete_(readReq.result["data"]);else
oncomplete_(null);};};}
catch(err)
{onerror_(err);}};Runtime.prototype.signalContinuousPreview=function()
{this.signalledContinuousPreview=true;};function doContinuousPreviewReload()
{cr.logexport("Reloading for continuous preview");if(!!window["c2cocoonjs"])
{CocoonJS["App"]["reload"]();}
else
{if(window.location.search.indexOf("continuous")>-1)
window.location.reload(true);else
window.location=window.location+"?continuous";}};Runtime.prototype.handleSaveLoad=function()
{var self=this;var savingToSlot=this.saveToSlot;var savingJson=this.lastSaveJson;var loadingFromSlot=this.loadFromSlot;var continuous=false;if(this.signalledContinuousPreview)
{continuous=true;savingToSlot="__c2_continuouspreview";this.signalledContinuousPreview=false;}
if(savingToSlot.length)
{this.ClearDeathRow();savingJson=this.saveToJSONString();if(IsIndexedDBAvailable()&&!this.isCocoonJs)
{IndexedDB_WriteSlot(savingToSlot,savingJson,function()
{cr.logexport("Saved state to IndexedDB storage ("+savingJson.length+" bytes)");self.lastSaveJson=savingJson;self.trigger(cr.system_object.prototype.cnds.OnSaveComplete,null);self.lastSaveJson="";if(continuous)
doContinuousPreviewReload();},function(e)
{try{localStorage.setItem("__c2save_"+savingToSlot,savingJson);cr.logexport("Saved state to WebStorage ("+savingJson.length+" bytes)");self.lastSaveJson=savingJson;self.trigger(cr.system_object.prototype.cnds.OnSaveComplete,null);self.lastSaveJson="";if(continuous)
doContinuousPreviewReload();}
catch(f)
{cr.logexport("Failed to save game state: "+e+"; "+f);self.trigger(cr.system_object.prototype.cnds.OnSaveFailed,null);}});}
else
{try{localStorage.setItem("__c2save_"+savingToSlot,savingJson);cr.logexport("Saved state to WebStorage ("+savingJson.length+" bytes)");self.lastSaveJson=savingJson;this.trigger(cr.system_object.prototype.cnds.OnSaveComplete,null);self.lastSaveJson="";if(continuous)
doContinuousPreviewReload();}
catch(e)
{cr.logexport("Error saving to WebStorage: "+e);self.trigger(cr.system_object.prototype.cnds.OnSaveFailed,null);}}
this.saveToSlot="";this.loadFromSlot="";this.loadFromJson=null;}
if(loadingFromSlot.length)
{if(IsIndexedDBAvailable()&&!this.isCocoonJs)
{IndexedDB_ReadSlot(loadingFromSlot,function(result_)
{if(result_)
{self.loadFromJson=result_;cr.logexport("Loaded state from IndexedDB storage ("+self.loadFromJson.length+" bytes)");}
else
{self.loadFromJson=localStorage.getItem("__c2save_"+loadingFromSlot)||"";cr.logexport("Loaded state from WebStorage ("+self.loadFromJson.length+" bytes)");}
self.suspendDrawing=false;if(!self.loadFromJson)
{self.loadFromJson=null;self.trigger(cr.system_object.prototype.cnds.OnLoadFailed,null);}},function(e)
{self.loadFromJson=localStorage.getItem("__c2save_"+loadingFromSlot)||"";cr.logexport("Loaded state from WebStorage ("+self.loadFromJson.length+" bytes)");self.suspendDrawing=false;if(!self.loadFromJson)
{self.loadFromJson=null;self.trigger(cr.system_object.prototype.cnds.OnLoadFailed,null);}});}
else
{try{this.loadFromJson=localStorage.getItem("__c2save_"+loadingFromSlot)||"";cr.logexport("Loaded state from WebStorage ("+this.loadFromJson.length+" bytes)");}
catch(e)
{this.loadFromJson=null;}
this.suspendDrawing=false;if(!self.loadFromJson)
{self.loadFromJson=null;self.trigger(cr.system_object.prototype.cnds.OnLoadFailed,null);}}
this.loadFromSlot="";this.saveToSlot="";}
if(this.loadFromJson!==null)
{this.ClearDeathRow();var ok=this.loadFromJSONString(this.loadFromJson);if(ok)
{this.lastSaveJson=this.loadFromJson;this.trigger(cr.system_object.prototype.cnds.OnLoadComplete,null);this.lastSaveJson="";}
else
{self.trigger(cr.system_object.prototype.cnds.OnLoadFailed,null);}
this.loadFromJson=null;}};function CopyExtraObject(extra)
{var p,ret={};for(p in extra)
{if(extra.hasOwnProperty(p))
{if(extra[p]instanceof cr.ObjectSet)
continue;if(extra[p]&&typeof extra[p].c2userdata!=="undefined")
continue;if(p==="spriteCreatedDestroyCallback")
continue;ret[p]=extra[p];}}
return ret;};Runtime.prototype.saveToJSONString=function()
{var i,len,j,lenj,type,layout,typeobj,g,c,a,v,p;var o={"c2save":true,"version":1,"rt":{"time":this.kahanTime.sum,"walltime":this.wallTime.sum,"timescale":this.timescale,"tickcount":this.tickcount,"execcount":this.execcount,"next_uid":this.next_uid,"running_layout":this.running_layout.sid,"start_time_offset":(Date.now()-this.start_time)},"types":{},"layouts":{},"events":{"groups":{},"cnds":{},"acts":{},"vars":{}}};for(i=0,len=this.types_by_index.length;i<len;i++)
{type=this.types_by_index[i];if(type.is_family||this.typeHasNoSaveBehavior(type))
continue;typeobj={"instances":[]};if(cr.hasAnyOwnProperty(type.extra))
typeobj["ex"]=CopyExtraObject(type.extra);for(j=0,lenj=type.instances.length;j<lenj;j++)
{typeobj["instances"].push(this.saveInstanceToJSON(type.instances[j]));}
o["types"][type.sid.toString()]=typeobj;}
for(i=0,len=this.layouts_by_index.length;i<len;i++)
{layout=this.layouts_by_index[i];o["layouts"][layout.sid.toString()]=layout.saveToJSON();}
var ogroups=o["events"]["groups"];for(i=0,len=this.allGroups.length;i<len;i++)
{g=this.allGroups[i];ogroups[g.sid.toString()]=this.groups_by_name[g.group_name].group_active;}
var ocnds=o["events"]["cnds"];for(p in this.cndsBySid)
{if(this.cndsBySid.hasOwnProperty(p))
{c=this.cndsBySid[p];if(cr.hasAnyOwnProperty(c.extra))
ocnds[p]={"ex":CopyExtraObject(c.extra)};}}
var oacts=o["events"]["acts"];for(p in this.actsBySid)
{if(this.actsBySid.hasOwnProperty(p))
{a=this.actsBySid[p];if(cr.hasAnyOwnProperty(a.extra))
oacts[p]={"ex":CopyExtraObject(a.extra)};}}
var ovars=o["events"]["vars"];for(p in this.varsBySid)
{if(this.varsBySid.hasOwnProperty(p))
{v=this.varsBySid[p];if(!v.is_constant&&(!v.parent||v.is_static))
ovars[p]=v.data;}}
o["system"]=this.system.saveToJSON();return JSON.stringify(o);};Runtime.prototype.refreshUidMap=function()
{var i,len,type,j,lenj,inst;this.objectsByUid={};for(i=0,len=this.types_by_index.length;i<len;i++)
{type=this.types_by_index[i];if(type.is_family)
continue;for(j=0,lenj=type.instances.length;j<lenj;j++)
{inst=type.instances[j];this.objectsByUid[inst.uid.toString()]=inst;}}};Runtime.prototype.loadFromJSONString=function(str)
{var o;try{o=JSON.parse(str);}
catch(e){return false;}
if(!o["c2save"])
return false;if(o["version"]>1)
return false;this.isLoadingState=true;var rt=o["rt"];this.kahanTime.reset();this.kahanTime.sum=rt["time"];this.wallTime.reset();this.wallTime.sum=rt["walltime"]||0;this.timescale=rt["timescale"];this.tickcount=rt["tickcount"];this.execcount=rt["execcount"];this.start_time=Date.now()-rt["start_time_offset"];var layout_sid=rt["running_layout"];if(layout_sid!==this.running_layout.sid)
{var changeToLayout=this.getLayoutBySid(layout_sid);if(changeToLayout)
this.doChangeLayout(changeToLayout);else
return;}
var i,len,j,lenj,k,lenk,p,type,existing_insts,load_insts,inst,binst,layout,layer,g,iid,t;var otypes=o["types"];for(p in otypes)
{if(otypes.hasOwnProperty(p))
{type=this.getObjectTypeBySid(parseInt(p,10));if(!type||type.is_family||this.typeHasNoSaveBehavior(type))
continue;if(otypes[p]["ex"])
type.extra=otypes[p]["ex"];else
cr.wipe(type.extra);existing_insts=type.instances;load_insts=otypes[p]["instances"];for(i=0,len=cr.min(existing_insts.length,load_insts.length);i<len;i++)
{this.loadInstanceFromJSON(existing_insts[i],load_insts[i]);}
for(i=load_insts.length,len=existing_insts.length;i<len;i++)
this.DestroyInstance(existing_insts[i]);for(i=existing_insts.length,len=load_insts.length;i<len;i++)
{layer=null;if(type.plugin.is_world)
{layer=this.running_layout.getLayerBySid(load_insts[i]["w"]["l"]);if(!layer)
continue;}
inst=this.createInstanceFromInit(type.default_instance,layer,false,0,0,true);this.loadInstanceFromJSON(inst,load_insts[i]);}
type.stale_iids=true;}}
this.ClearDeathRow();this.refreshUidMap();var olayouts=o["layouts"];for(p in olayouts)
{if(olayouts.hasOwnProperty(p))
{layout=this.getLayoutBySid(parseInt(p,10));if(!layout)
continue;layout.loadFromJSON(olayouts[p]);}}
var ogroups=o["events"]["groups"];for(p in ogroups)
{if(ogroups.hasOwnProperty(p))
{g=this.getGroupBySid(parseInt(p,10));if(g&&this.groups_by_name[g.group_name])
this.groups_by_name[g.group_name].setGroupActive(ogroups[p]);}}
var ocnds=o["events"]["cnds"];for(p in this.cndsBySid)
{if(this.cndsBySid.hasOwnProperty(p))
{if(ocnds.hasOwnProperty(p))
{this.cndsBySid[p].extra=ocnds[p]["ex"];}
else
{this.cndsBySid[p].extra={};}}}
var oacts=o["events"]["acts"];for(p in this.actsBySid)
{if(this.actsBySid.hasOwnProperty(p))
{if(oacts.hasOwnProperty(p))
{this.actsBySid[p].extra=oacts[p]["ex"];}
else
{this.actsBySid[p].extra={};}}}
var ovars=o["events"]["vars"];for(p in ovars)
{if(ovars.hasOwnProperty(p)&&this.varsBySid.hasOwnProperty(p))
{this.varsBySid[p].data=ovars[p];}}
this.next_uid=rt["next_uid"];this.isLoadingState=false;for(i=0,len=this.fireOnCreateAfterLoad.length;i<len;++i)
{inst=this.fireOnCreateAfterLoad[i];this.trigger(Object.getPrototypeOf(inst.type.plugin).cnds.OnCreated,inst);}
cr.clearArray(this.fireOnCreateAfterLoad);this.system.loadFromJSON(o["system"]);for(i=0,len=this.types_by_index.length;i<len;i++)
{type=this.types_by_index[i];if(type.is_family||this.typeHasNoSaveBehavior(type))
continue;for(j=0,lenj=type.instances.length;j<lenj;j++)
{inst=type.instances[j];if(type.is_contained)
{iid=inst.get_iid();cr.clearArray(inst.siblings);for(k=0,lenk=type.container.length;k<lenk;k++)
{t=type.container[k];if(type===t)
continue;;inst.siblings.push(t.instances[iid]);}}
if(inst.afterLoad)
inst.afterLoad();if(inst.behavior_insts)
{for(k=0,lenk=inst.behavior_insts.length;k<lenk;k++)
{binst=inst.behavior_insts[k];if(binst.afterLoad)
binst.afterLoad();}}}}
this.redraw=true;return true;};Runtime.prototype.saveInstanceToJSON=function(inst,state_only)
{var i,len,world,behinst,et;var type=inst.type;var plugin=type.plugin;var o={};if(state_only)
o["c2"]=true;else
o["uid"]=inst.uid;if(cr.hasAnyOwnProperty(inst.extra))
o["ex"]=CopyExtraObject(inst.extra);if(inst.instance_vars&&inst.instance_vars.length)
{o["ivs"]={};for(i=0,len=inst.instance_vars.length;i<len;i++)
{o["ivs"][inst.type.instvar_sids[i].toString()]=inst.instance_vars[i];}}
if(plugin.is_world)
{world={"x":inst.x,"y":inst.y,"w":inst.width,"h":inst.height,"l":inst.layer.sid,"zi":inst.get_zindex()};if(inst.angle!==0)
world["a"]=inst.angle;if(inst.opacity!==1)
world["o"]=inst.opacity;if(inst.hotspotX!==0.5)
world["hX"]=inst.hotspotX;if(inst.hotspotY!==0.5)
world["hY"]=inst.hotspotY;if(inst.blend_mode!==0)
world["bm"]=inst.blend_mode;if(!inst.visible)
world["v"]=inst.visible;if(!inst.collisionsEnabled)
world["ce"]=inst.collisionsEnabled;if(inst.my_timescale!==-1)
world["mts"]=inst.my_timescale;if(type.effect_types.length)
{world["fx"]=[];for(i=0,len=type.effect_types.length;i<len;i++)
{et=type.effect_types[i];world["fx"].push({"name":et.name,"active":inst.active_effect_flags[et.index],"params":inst.effect_params[et.index]});}}
o["w"]=world;}
if(inst.behavior_insts&&inst.behavior_insts.length)
{o["behs"]={};for(i=0,len=inst.behavior_insts.length;i<len;i++)
{behinst=inst.behavior_insts[i];if(behinst.saveToJSON)
o["behs"][behinst.type.sid.toString()]=behinst.saveToJSON();}}
if(inst.saveToJSON)
o["data"]=inst.saveToJSON();return o;};Runtime.prototype.getInstanceVarIndexBySid=function(type,sid_)
{var i,len;for(i=0,len=type.instvar_sids.length;i<len;i++)
{if(type.instvar_sids[i]===sid_)
return i;}
return-1;};Runtime.prototype.getBehaviorIndexBySid=function(inst,sid_)
{var i,len;for(i=0,len=inst.behavior_insts.length;i<len;i++)
{if(inst.behavior_insts[i].type.sid===sid_)
return i;}
return-1;};Runtime.prototype.loadInstanceFromJSON=function(inst,o,state_only)
{var p,i,len,iv,oivs,world,fxindex,obehs,behindex,value;var oldlayer;var type=inst.type;var plugin=type.plugin;if(state_only)
{if(!o["c2"])
return;}
else
inst.uid=o["uid"];if(o["ex"])
inst.extra=o["ex"];else
cr.wipe(inst.extra);oivs=o["ivs"];if(oivs)
{for(p in oivs)
{if(oivs.hasOwnProperty(p))
{iv=this.getInstanceVarIndexBySid(type,parseInt(p,10));if(iv<0||iv>=inst.instance_vars.length)
continue;value=oivs[p];if(value===null)
value=NaN;inst.instance_vars[iv]=value;}}}
if(plugin.is_world)
{world=o["w"];if(inst.layer.sid!==world["l"])
{oldlayer=inst.layer;inst.layer=this.running_layout.getLayerBySid(world["l"]);if(inst.layer)
{oldlayer.removeFromInstanceList(inst,true);inst.layer.appendToInstanceList(inst,true);inst.set_bbox_changed();inst.layer.setZIndicesStaleFrom(0);}
else
{inst.layer=oldlayer;if(!state_only)
this.DestroyInstance(inst);}}
inst.x=world["x"];inst.y=world["y"];inst.width=world["w"];inst.height=world["h"];inst.zindex=world["zi"];inst.angle=world.hasOwnProperty("a")?world["a"]:0;inst.opacity=world.hasOwnProperty("o")?world["o"]:1;inst.hotspotX=world.hasOwnProperty("hX")?world["hX"]:0.5;inst.hotspotY=world.hasOwnProperty("hY")?world["hY"]:0.5;inst.visible=world.hasOwnProperty("v")?world["v"]:true;inst.collisionsEnabled=world.hasOwnProperty("ce")?world["ce"]:true;inst.my_timescale=world.hasOwnProperty("mts")?world["mts"]:-1;inst.blend_mode=world.hasOwnProperty("bm")?world["bm"]:0;;inst.compositeOp=cr.effectToCompositeOp(inst.blend_mode);if(this.gl)
cr.setGLBlend(inst,inst.blend_mode,this.gl);inst.set_bbox_changed();if(world.hasOwnProperty("fx"))
{for(i=0,len=world["fx"].length;i<len;i++)
{fxindex=type.getEffectIndexByName(world["fx"][i]["name"]);if(fxindex<0)
continue;inst.active_effect_flags[fxindex]=world["fx"][i]["active"];inst.effect_params[fxindex]=world["fx"][i]["params"];}}
inst.updateActiveEffects();}
obehs=o["behs"];if(obehs)
{for(p in obehs)
{if(obehs.hasOwnProperty(p))
{behindex=this.getBehaviorIndexBySid(inst,parseInt(p,10));if(behindex<0)
continue;inst.behavior_insts[behindex].loadFromJSON(obehs[p]);}}}
if(o["data"])
inst.loadFromJSON(o["data"]);};Runtime.prototype.fetchLocalFileViaCordova=function(filename,successCallback,errorCallback)
{var path=cordova["file"]["applicationDirectory"]+"www/"+filename;window["resolveLocalFileSystemURL"](path,function(entry)
{entry.file(successCallback,errorCallback);},errorCallback);};Runtime.prototype.fetchLocalFileViaCordovaAsText=function(filename,successCallback,errorCallback)
{this.fetchLocalFileViaCordova(filename,function(file)
{var reader=new FileReader();reader.onload=function(e)
{successCallback(e.target.result);};reader.onerror=errorCallback;reader.readAsText(file);},errorCallback);};var queuedArrayBufferReads=[];var activeArrayBufferReads=0;var MAX_ARRAYBUFFER_READS=8;Runtime.prototype.maybeStartNextArrayBufferRead=function()
{if(!queuedArrayBufferReads.length)
return;if(activeArrayBufferReads>=MAX_ARRAYBUFFER_READS)
return;activeArrayBufferReads++;var job=queuedArrayBufferReads.shift();this.doFetchLocalFileViaCordovaAsArrayBuffer(job.filename,job.successCallback,job.errorCallback);};Runtime.prototype.fetchLocalFileViaCordovaAsArrayBuffer=function(filename,successCallback_,errorCallback_)
{var self=this;queuedArrayBufferReads.push({filename:filename,successCallback:function(result)
{activeArrayBufferReads--;self.maybeStartNextArrayBufferRead();successCallback_(result);},errorCallback:function(err)
{activeArrayBufferReads--;self.maybeStartNextArrayBufferRead();errorCallback_(err);}});this.maybeStartNextArrayBufferRead();};Runtime.prototype.doFetchLocalFileViaCordovaAsArrayBuffer=function(filename,successCallback,errorCallback)
{this.fetchLocalFileViaCordova(filename,function(file)
{var reader=new FileReader();reader.onload=function(e)
{successCallback(e.target.result);};reader.readAsArrayBuffer(file);},errorCallback);};Runtime.prototype.fetchLocalFileViaCordovaAsURL=function(filename,successCallback,errorCallback)
{var blobType="";var lowername=filename.toLowerCase();var ext3=lowername.substr(lowername.length-4);var ext4=lowername.substr(lowername.length-5);if(ext3===".mp4")
blobType="video/mp4";else if(ext4===".webm")
blobType="video/webm";else if(ext3===".m4a")
blobType="audio/mp4";else if(ext3===".mp3")
blobType="audio/mpeg";this.fetchLocalFileViaCordovaAsArrayBuffer(filename,function(arrayBuffer)
{var blob=new Blob([arrayBuffer],{type:blobType});var url=URL.createObjectURL(blob);successCallback(url);},errorCallback);};Runtime.prototype.isAbsoluteUrl=function(url)
{return /^(?:[a-z]+:)?\/\//.test(url)||url.substr(0,5)==="data:"||url.substr(0,5)==="blob:";};Runtime.prototype.setImageSrc=function(img,src)
{if(this.isWKWebView&&!this.isAbsoluteUrl(src))
{this.fetchLocalFileViaCordovaAsURL(src,function(url)
{img.src=url;},function(err)
{alert("Failed to load image: "+err);});}
else
{img.src=src;}};Runtime.prototype.setCtxImageSmoothingEnabled=function(ctx,e)
{if(typeof ctx["imageSmoothingEnabled"]!=="undefined")
{ctx["imageSmoothingEnabled"]=e;}
else
{ctx["webkitImageSmoothingEnabled"]=e;ctx["mozImageSmoothingEnabled"]=e;ctx["msImageSmoothingEnabled"]=e;}};cr.runtime=Runtime;cr.createRuntime=function(canvasid)
{return new Runtime(document.getElementById(canvasid));};cr.createDCRuntime=function(w,h)
{return new Runtime({"dc":true,"width":w,"height":h});};window["cr_createRuntime"]=cr.createRuntime;window["cr_createDCRuntime"]=cr.createDCRuntime;window["createCocoonJSRuntime"]=function()
{window["c2cocoonjs"]=true;var canvas=document.createElement("screencanvas")||document.createElement("canvas");canvas.screencanvas=true;document.body.appendChild(canvas);var rt=new Runtime(canvas);window["c2runtime"]=rt;window.addEventListener("orientationchange",function(){window["c2runtime"]["setSize"](window.innerWidth,window.innerHeight);});window["c2runtime"]["setSize"](window.innerWidth,window.innerHeight);return rt;};window["createEjectaRuntime"]=function()
{var canvas=document.getElementById("canvas");var rt=new Runtime(canvas);window["c2runtime"]=rt;window["c2runtime"]["setSize"](window.innerWidth,window.innerHeight);return rt;};}());window["cr_getC2Runtime"]=function()
{var canvas=document.getElementById("c2canvas");if(canvas)
return canvas["c2runtime"];else if(window["c2runtime"])
return window["c2runtime"];else
return null;}
window["cr_getSnapshot"]=function(format_,quality_)
{var runtime=window["cr_getC2Runtime"]();if(runtime)
runtime.doCanvasSnapshot(format_,quality_);}
window["cr_sizeCanvas"]=function(w,h)
{if(w===0||h===0)
return;var runtime=window["cr_getC2Runtime"]();if(runtime)
runtime["setSize"](w,h);}
window["cr_setSuspended"]=function(s)
{var runtime=window["cr_getC2Runtime"]();if(runtime)
runtime["setSuspended"](s);};(function()
{function Layout(runtime,m)
{this.runtime=runtime;this.event_sheet=null;this.scrollX=(this.runtime.original_width/2);this.scrollY=(this.runtime.original_height/2);this.scale=1.0;this.angle=0;this.first_visit=true;this.name=m[0];this.originalWidth=m[1];this.originalHeight=m[2];this.width=m[1];this.height=m[2];this.unbounded_scrolling=m[3];this.sheetname=m[4];this.sid=m[5];var lm=m[6];var i,len;this.layers=[];this.initial_types=[];for(i=0,len=lm.length;i<len;i++)
{var layer=new cr.layer(this,lm[i]);layer.number=i;cr.seal(layer);this.layers.push(layer);}
var im=m[7];this.initial_nonworld=[];for(i=0,len=im.length;i<len;i++)
{var inst=im[i];var type=this.runtime.types_by_index[inst[1]];;if(!type.default_instance)
type.default_instance=inst;this.initial_nonworld.push(inst);if(this.initial_types.indexOf(type)===-1)
this.initial_types.push(type);}
this.effect_types=[];this.active_effect_types=[];this.shaders_preserve_opaqueness=true;this.effect_params=[];for(i=0,len=m[8].length;i<len;i++)
{this.effect_types.push({id:m[8][i][0],name:m[8][i][1],shaderindex:-1,preservesOpaqueness:false,active:true,index:i});this.effect_params.push(m[8][i][2].slice(0));}
this.updateActiveEffects();this.rcTex=new cr.rect(0,0,1,1);this.rcTex2=new cr.rect(0,0,1,1);this.persist_data={};};Layout.prototype.saveObjectToPersist=function(inst)
{var sidStr=inst.type.sid.toString();if(!this.persist_data.hasOwnProperty(sidStr))
this.persist_data[sidStr]=[];var type_persist=this.persist_data[sidStr];type_persist.push(this.runtime.saveInstanceToJSON(inst));};Layout.prototype.hasOpaqueBottomLayer=function()
{var layer=this.layers[0];return!layer.transparent&&layer.opacity===1.0&&!layer.forceOwnTexture&&layer.visible;};Layout.prototype.updateActiveEffects=function()
{cr.clearArray(this.active_effect_types);this.shaders_preserve_opaqueness=true;var i,len,et;for(i=0,len=this.effect_types.length;i<len;i++)
{et=this.effect_types[i];if(et.active)
{this.active_effect_types.push(et);if(!et.preservesOpaqueness)
this.shaders_preserve_opaqueness=false;}}};Layout.prototype.getEffectByName=function(name_)
{var i,len,et;for(i=0,len=this.effect_types.length;i<len;i++)
{et=this.effect_types[i];if(et.name===name_)
return et;}
return null;};var created_instances=[];function sort_by_zindex(a,b)
{return a.zindex-b.zindex;};var first_layout=true;Layout.prototype.startRunning=function()
{if(this.sheetname)
{this.event_sheet=this.runtime.eventsheets[this.sheetname];;this.event_sheet.updateDeepIncludes();}
this.runtime.running_layout=this;this.width=this.originalWidth;this.height=this.originalHeight;this.scrollX=(this.runtime.original_width/2);this.scrollY=(this.runtime.original_height/2);var i,k,len,lenk,type,type_instances,initial_inst,inst,iid,t,s,p,q,type_data,layer;for(i=0,len=this.runtime.types_by_index.length;i<len;i++)
{type=this.runtime.types_by_index[i];if(type.is_family)
continue;type_instances=type.instances;for(k=0,lenk=type_instances.length;k<lenk;k++)
{inst=type_instances[k];if(inst.layer)
{var num=inst.layer.number;if(num>=this.layers.length)
num=this.layers.length-1;inst.layer=this.layers[num];if(inst.layer.instances.indexOf(inst)===-1)
inst.layer.instances.push(inst);inst.layer.zindices_stale=true;}}}
if(!first_layout)
{for(i=0,len=this.layers.length;i<len;++i)
{this.layers[i].instances.sort(sort_by_zindex);}}
var layer;cr.clearArray(created_instances);this.boundScrolling();for(i=0,len=this.layers.length;i<len;i++)
{layer=this.layers[i];layer.createInitialInstances();layer.updateViewport(null);}
var uids_changed=false;if(!this.first_visit)
{for(p in this.persist_data)
{if(this.persist_data.hasOwnProperty(p))
{type=this.runtime.getObjectTypeBySid(parseInt(p,10));if(!type||type.is_family||!this.runtime.typeHasPersistBehavior(type))
continue;type_data=this.persist_data[p];for(i=0,len=type_data.length;i<len;i++)
{layer=null;if(type.plugin.is_world)
{layer=this.getLayerBySid(type_data[i]["w"]["l"]);if(!layer)
continue;}
inst=this.runtime.createInstanceFromInit(type.default_instance,layer,false,0,0,true);this.runtime.loadInstanceFromJSON(inst,type_data[i]);uids_changed=true;created_instances.push(inst);}
cr.clearArray(type_data);}}
for(i=0,len=this.layers.length;i<len;i++)
{this.layers[i].instances.sort(sort_by_zindex);this.layers[i].zindices_stale=true;}}
if(uids_changed)
{this.runtime.ClearDeathRow();this.runtime.refreshUidMap();}
for(i=0;i<created_instances.length;i++)
{inst=created_instances[i];if(!inst.type.is_contained)
continue;iid=inst.get_iid();for(k=0,lenk=inst.type.container.length;k<lenk;k++)
{t=inst.type.container[k];if(inst.type===t)
continue;if(t.instances.length>iid)
inst.siblings.push(t.instances[iid]);else
{if(!t.default_instance)
{}
else
{s=this.runtime.createInstanceFromInit(t.default_instance,inst.layer,true,inst.x,inst.y,true);this.runtime.ClearDeathRow();t.updateIIDs();inst.siblings.push(s);created_instances.push(s);}}}}
for(i=0,len=this.initial_nonworld.length;i<len;i++)
{initial_inst=this.initial_nonworld[i];type=this.runtime.types_by_index[initial_inst[1]];if(!type.is_contained)
{inst=this.runtime.createInstanceFromInit(this.initial_nonworld[i],null,true);};}
this.runtime.changelayout=null;this.runtime.ClearDeathRow();if(this.runtime.ctx&&!this.runtime.isDomFree)
{for(i=0,len=this.runtime.types_by_index.length;i<len;i++)
{t=this.runtime.types_by_index[i];if(t.is_family||!t.instances.length||!t.preloadCanvas2D)
continue;t.preloadCanvas2D(this.runtime.ctx);}}
if(this.runtime.isLoadingState)
{cr.shallowAssignArray(this.runtime.fireOnCreateAfterLoad,created_instances);}
else
{for(i=0,len=created_instances.length;i<len;i++)
{inst=created_instances[i];this.runtime.trigger(Object.getPrototypeOf(inst.type.plugin).cnds.OnCreated,inst);}}
cr.clearArray(created_instances);if(!this.runtime.isLoadingState)
{this.runtime.trigger(cr.system_object.prototype.cnds.OnLayoutStart,null);}
this.first_visit=false;};Layout.prototype.createGlobalNonWorlds=function()
{var i,k,len,initial_inst,inst,type;for(i=0,k=0,len=this.initial_nonworld.length;i<len;i++)
{initial_inst=this.initial_nonworld[i];type=this.runtime.types_by_index[initial_inst[1]];if(type.global)
{if(!type.is_contained)
{inst=this.runtime.createInstanceFromInit(initial_inst,null,true);}}
else
{this.initial_nonworld[k]=initial_inst;k++;}}
cr.truncateArray(this.initial_nonworld,k);};Layout.prototype.stopRunning=function()
{;if(!this.runtime.isLoadingState)
{this.runtime.trigger(cr.system_object.prototype.cnds.OnLayoutEnd,null);}
this.runtime.isEndingLayout=true;cr.clearArray(this.runtime.system.waits);var i,leni,j,lenj;var layer_instances,inst,type;if(!this.first_visit)
{for(i=0,leni=this.layers.length;i<leni;i++)
{this.layers[i].updateZIndices();layer_instances=this.layers[i].instances;for(j=0,lenj=layer_instances.length;j<lenj;j++)
{inst=layer_instances[j];if(!inst.type.global)
{if(this.runtime.typeHasPersistBehavior(inst.type))
this.saveObjectToPersist(inst);}}}}
for(i=0,leni=this.layers.length;i<leni;i++)
{layer_instances=this.layers[i].instances;for(j=0,lenj=layer_instances.length;j<lenj;j++)
{inst=layer_instances[j];if(!inst.type.global)
{this.runtime.DestroyInstance(inst);}}
this.runtime.ClearDeathRow();cr.clearArray(layer_instances);this.layers[i].zindices_stale=true;}
for(i=0,leni=this.runtime.types_by_index.length;i<leni;i++)
{type=this.runtime.types_by_index[i];if(type.global||type.plugin.is_world||type.plugin.singleglobal||type.is_family)
continue;for(j=0,lenj=type.instances.length;j<lenj;j++)
this.runtime.DestroyInstance(type.instances[j]);this.runtime.ClearDeathRow();}
first_layout=false;this.runtime.isEndingLayout=false;};var temp_rect=new cr.rect(0,0,0,0);Layout.prototype.recreateInitialObjects=function(type,x1,y1,x2,y2)
{temp_rect.set(x1,y1,x2,y2);var i,len;for(i=0,len=this.layers.length;i<len;i++)
{this.layers[i].recreateInitialObjects(type,temp_rect);}};Layout.prototype.draw=function(ctx)
{var layout_canvas;var layout_ctx=ctx;var ctx_changed=false;var render_offscreen=!this.runtime.fullscreenScalingQuality;if(render_offscreen)
{if(!this.runtime.layout_canvas)
{this.runtime.layout_canvas=document.createElement("canvas");layout_canvas=this.runtime.layout_canvas;layout_canvas.width=this.runtime.draw_width;layout_canvas.height=this.runtime.draw_height;this.runtime.layout_ctx=layout_canvas.getContext("2d");ctx_changed=true;}
layout_canvas=this.runtime.layout_canvas;layout_ctx=this.runtime.layout_ctx;if(layout_canvas.width!==this.runtime.draw_width)
{layout_canvas.width=this.runtime.draw_width;ctx_changed=true;}
if(layout_canvas.height!==this.runtime.draw_height)
{layout_canvas.height=this.runtime.draw_height;ctx_changed=true;}
if(ctx_changed)
{this.runtime.setCtxImageSmoothingEnabled(layout_ctx,this.runtime.linearSampling);}}
layout_ctx.globalAlpha=1;layout_ctx.globalCompositeOperation="source-over";if(this.runtime.clearBackground&&!this.hasOpaqueBottomLayer())
layout_ctx.clearRect(0,0,this.runtime.draw_width,this.runtime.draw_height);var i,len,l;for(i=0,len=this.layers.length;i<len;i++)
{l=this.layers[i];if(l.visible&&l.opacity>0&&l.blend_mode!==11&&(l.instances.length||!l.transparent))
l.draw(layout_ctx);else
l.updateViewport(null);}
if(render_offscreen)
{ctx.drawImage(layout_canvas,0,0,this.runtime.width,this.runtime.height);}};Layout.prototype.drawGL_earlyZPass=function(glw)
{glw.setEarlyZPass(true);if(!this.runtime.layout_tex)
{this.runtime.layout_tex=glw.createEmptyTexture(this.runtime.draw_width,this.runtime.draw_height,this.runtime.linearSampling);}
if(this.runtime.layout_tex.c2width!==this.runtime.draw_width||this.runtime.layout_tex.c2height!==this.runtime.draw_height)
{glw.deleteTexture(this.runtime.layout_tex);this.runtime.layout_tex=glw.createEmptyTexture(this.runtime.draw_width,this.runtime.draw_height,this.runtime.linearSampling);}
glw.setRenderingToTexture(this.runtime.layout_tex);if(!this.runtime.fullscreenScalingQuality)
{glw.setSize(this.runtime.draw_width,this.runtime.draw_height);}
var i,l;for(i=this.layers.length-1;i>=0;--i)
{l=this.layers[i];if(l.visible&&l.opacity===1&&l.shaders_preserve_opaqueness&&l.blend_mode===0&&(l.instances.length||!l.transparent))
{l.drawGL_earlyZPass(glw);}
else
{l.updateViewport(null);}}
glw.setEarlyZPass(false);};Layout.prototype.drawGL=function(glw)
{var render_to_texture=(this.active_effect_types.length>0||this.runtime.uses_background_blending||!this.runtime.fullscreenScalingQuality||this.runtime.enableFrontToBack);if(render_to_texture)
{if(!this.runtime.layout_tex)
{this.runtime.layout_tex=glw.createEmptyTexture(this.runtime.draw_width,this.runtime.draw_height,this.runtime.linearSampling);}
if(this.runtime.layout_tex.c2width!==this.runtime.draw_width||this.runtime.layout_tex.c2height!==this.runtime.draw_height)
{glw.deleteTexture(this.runtime.layout_tex);this.runtime.layout_tex=glw.createEmptyTexture(this.runtime.draw_width,this.runtime.draw_height,this.runtime.linearSampling);}
glw.setRenderingToTexture(this.runtime.layout_tex);if(!this.runtime.fullscreenScalingQuality)
{glw.setSize(this.runtime.draw_width,this.runtime.draw_height);}}
else
{if(this.runtime.layout_tex)
{glw.setRenderingToTexture(null);glw.deleteTexture(this.runtime.layout_tex);this.runtime.layout_tex=null;}}
if(this.runtime.clearBackground&&!this.hasOpaqueBottomLayer())
glw.clear(0,0,0,0);var i,len,l;for(i=0,len=this.layers.length;i<len;i++)
{l=this.layers[i];if(l.visible&&l.opacity>0&&(l.instances.length||!l.transparent))
l.drawGL(glw);else
l.updateViewport(null);}
if(render_to_texture)
{if(this.active_effect_types.length===0||(this.active_effect_types.length===1&&this.runtime.fullscreenScalingQuality))
{if(this.active_effect_types.length===1)
{var etindex=this.active_effect_types[0].index;glw.switchProgram(this.active_effect_types[0].shaderindex);glw.setProgramParameters(null,1.0/this.runtime.draw_width,1.0/this.runtime.draw_height,0.0,0.0,1.0,1.0,this.scale,this.angle,0.0,0.0,this.runtime.draw_width/2,this.runtime.draw_height/2,this.runtime.kahanTime.sum,this.effect_params[etindex]);if(glw.programIsAnimated(this.active_effect_types[0].shaderindex))
this.runtime.redraw=true;}
else
glw.switchProgram(0);if(!this.runtime.fullscreenScalingQuality)
{glw.setSize(this.runtime.width,this.runtime.height);}
glw.setRenderingToTexture(null);glw.setDepthTestEnabled(false);glw.setOpacity(1);glw.setTexture(this.runtime.layout_tex);glw.setAlphaBlend();glw.resetModelView();glw.updateModelView();var halfw=this.runtime.width/2;var halfh=this.runtime.height/2;glw.quad(-halfw,halfh,halfw,halfh,halfw,-halfh,-halfw,-halfh);glw.setTexture(null);glw.setDepthTestEnabled(true);}
else
{this.renderEffectChain(glw,null,null,null);}}};Layout.prototype.getRenderTarget=function()
{if(this.active_effect_types.length>0||this.runtime.uses_background_blending||!this.runtime.fullscreenScalingQuality||this.runtime.enableFrontToBack)
{return this.runtime.layout_tex;}
else
{return null;}};Layout.prototype.getMinLayerScale=function()
{var m=this.layers[0].getScale();var i,len,l;for(i=1,len=this.layers.length;i<len;i++)
{l=this.layers[i];if(l.parallaxX===0&&l.parallaxY===0)
continue;if(l.getScale()<m)
m=l.getScale();}
return m;};Layout.prototype.scrollToX=function(x)
{if(!this.unbounded_scrolling)
{var widthBoundary=(this.runtime.draw_width*(1/this.getMinLayerScale())/2);if(x>this.width-widthBoundary)
x=this.width-widthBoundary;if(x<widthBoundary)
x=widthBoundary;}
if(this.scrollX!==x)
{this.scrollX=x;this.runtime.redraw=true;}};Layout.prototype.scrollToY=function(y)
{if(!this.unbounded_scrolling)
{var heightBoundary=(this.runtime.draw_height*(1/this.getMinLayerScale())/2);if(y>this.height-heightBoundary)
y=this.height-heightBoundary;if(y<heightBoundary)
y=heightBoundary;}
if(this.scrollY!==y)
{this.scrollY=y;this.runtime.redraw=true;}};Layout.prototype.boundScrolling=function()
{this.scrollToX(this.scrollX);this.scrollToY(this.scrollY);};Layout.prototype.renderEffectChain=function(glw,layer,inst,rendertarget)
{var active_effect_types=inst?inst.active_effect_types:layer?layer.active_effect_types:this.active_effect_types;var layerScale=1,layerAngle=0,viewOriginLeft=0,viewOriginTop=0,viewOriginRight=this.runtime.draw_width,viewOriginBottom=this.runtime.draw_height;if(inst)
{layerScale=inst.layer.getScale();layerAngle=inst.layer.getAngle();viewOriginLeft=inst.layer.viewLeft;viewOriginTop=inst.layer.viewTop;viewOriginRight=inst.layer.viewRight;viewOriginBottom=inst.layer.viewBottom;}
else if(layer)
{layerScale=layer.getScale();layerAngle=layer.getAngle();viewOriginLeft=layer.viewLeft;viewOriginTop=layer.viewTop;viewOriginRight=layer.viewRight;viewOriginBottom=layer.viewBottom;}
var fx_tex=this.runtime.fx_tex;var i,len,last,temp,fx_index=0,other_fx_index=1;var y,h;var windowWidth=this.runtime.draw_width;var windowHeight=this.runtime.draw_height;var halfw=windowWidth/2;var halfh=windowHeight/2;var rcTex=layer?layer.rcTex:this.rcTex;var rcTex2=layer?layer.rcTex2:this.rcTex2;var screenleft=0,clearleft=0;var screentop=0,cleartop=0;var screenright=windowWidth,clearright=windowWidth;var screenbottom=windowHeight,clearbottom=windowHeight;var boxExtendHorizontal=0;var boxExtendVertical=0;var inst_layer_angle=inst?inst.layer.getAngle():0;if(inst)
{for(i=0,len=active_effect_types.length;i<len;i++)
{boxExtendHorizontal+=glw.getProgramBoxExtendHorizontal(active_effect_types[i].shaderindex);boxExtendVertical+=glw.getProgramBoxExtendVertical(active_effect_types[i].shaderindex);}
var bbox=inst.bbox;screenleft=layer.layerToCanvas(bbox.left,bbox.top,true,true);screentop=layer.layerToCanvas(bbox.left,bbox.top,false,true);screenright=layer.layerToCanvas(bbox.right,bbox.bottom,true,true);screenbottom=layer.layerToCanvas(bbox.right,bbox.bottom,false,true);if(inst_layer_angle!==0)
{var screentrx=layer.layerToCanvas(bbox.right,bbox.top,true,true);var screentry=layer.layerToCanvas(bbox.right,bbox.top,false,true);var screenblx=layer.layerToCanvas(bbox.left,bbox.bottom,true,true);var screenbly=layer.layerToCanvas(bbox.left,bbox.bottom,false,true);temp=Math.min(screenleft,screenright,screentrx,screenblx);screenright=Math.max(screenleft,screenright,screentrx,screenblx);screenleft=temp;temp=Math.min(screentop,screenbottom,screentry,screenbly);screenbottom=Math.max(screentop,screenbottom,screentry,screenbly);screentop=temp;}
screenleft-=boxExtendHorizontal;screentop-=boxExtendVertical;screenright+=boxExtendHorizontal;screenbottom+=boxExtendVertical;rcTex2.left=screenleft/windowWidth;rcTex2.top=1-screentop/windowHeight;rcTex2.right=screenright/windowWidth;rcTex2.bottom=1-screenbottom/windowHeight;clearleft=screenleft=cr.floor(screenleft);cleartop=screentop=cr.floor(screentop);clearright=screenright=cr.ceil(screenright);clearbottom=screenbottom=cr.ceil(screenbottom);clearleft-=boxExtendHorizontal;cleartop-=boxExtendVertical;clearright+=boxExtendHorizontal;clearbottom+=boxExtendVertical;if(screenleft<0)screenleft=0;if(screentop<0)screentop=0;if(screenright>windowWidth)screenright=windowWidth;if(screenbottom>windowHeight)screenbottom=windowHeight;if(clearleft<0)clearleft=0;if(cleartop<0)cleartop=0;if(clearright>windowWidth)clearright=windowWidth;if(clearbottom>windowHeight)clearbottom=windowHeight;rcTex.left=screenleft/windowWidth;rcTex.top=1-screentop/windowHeight;rcTex.right=screenright/windowWidth;rcTex.bottom=1-screenbottom/windowHeight;}
else
{rcTex.left=rcTex2.left=0;rcTex.top=rcTex2.top=0;rcTex.right=rcTex2.right=1;rcTex.bottom=rcTex2.bottom=1;}
var pre_draw=(inst&&(glw.programUsesDest(active_effect_types[0].shaderindex)||boxExtendHorizontal!==0||boxExtendVertical!==0||inst.opacity!==1||inst.type.plugin.must_predraw))||(layer&&!inst&&layer.opacity!==1);glw.setAlphaBlend();if(pre_draw)
{if(!fx_tex[fx_index])
{fx_tex[fx_index]=glw.createEmptyTexture(windowWidth,windowHeight,this.runtime.linearSampling);}
if(fx_tex[fx_index].c2width!==windowWidth||fx_tex[fx_index].c2height!==windowHeight)
{glw.deleteTexture(fx_tex[fx_index]);fx_tex[fx_index]=glw.createEmptyTexture(windowWidth,windowHeight,this.runtime.linearSampling);}
glw.switchProgram(0);glw.setRenderingToTexture(fx_tex[fx_index]);h=clearbottom-cleartop;y=(windowHeight-cleartop)-h;glw.clearRect(clearleft,y,clearright-clearleft,h);if(inst)
{inst.drawGL(glw);}
else
{glw.setTexture(this.runtime.layer_tex);glw.setOpacity(layer.opacity);glw.resetModelView();glw.translate(-halfw,-halfh);glw.updateModelView();glw.quadTex(screenleft,screenbottom,screenright,screenbottom,screenright,screentop,screenleft,screentop,rcTex);}
rcTex2.left=rcTex2.top=0;rcTex2.right=rcTex2.bottom=1;if(inst)
{temp=rcTex.top;rcTex.top=rcTex.bottom;rcTex.bottom=temp;}
fx_index=1;other_fx_index=0;}
glw.setOpacity(1);var last=active_effect_types.length-1;var post_draw=glw.programUsesCrossSampling(active_effect_types[last].shaderindex)||(!layer&&!inst&&!this.runtime.fullscreenScalingQuality);var etindex=0;for(i=0,len=active_effect_types.length;i<len;i++)
{if(!fx_tex[fx_index])
{fx_tex[fx_index]=glw.createEmptyTexture(windowWidth,windowHeight,this.runtime.linearSampling);}
if(fx_tex[fx_index].c2width!==windowWidth||fx_tex[fx_index].c2height!==windowHeight)
{glw.deleteTexture(fx_tex[fx_index]);fx_tex[fx_index]=glw.createEmptyTexture(windowWidth,windowHeight,this.runtime.linearSampling);}
glw.switchProgram(active_effect_types[i].shaderindex);etindex=active_effect_types[i].index;if(glw.programIsAnimated(active_effect_types[i].shaderindex))
this.runtime.redraw=true;if(i==0&&!pre_draw)
{glw.setRenderingToTexture(fx_tex[fx_index]);h=clearbottom-cleartop;y=(windowHeight-cleartop)-h;glw.clearRect(clearleft,y,clearright-clearleft,h);if(inst)
{var pixelWidth;var pixelHeight;if(inst.curFrame&&inst.curFrame.texture_img)
{var img=inst.curFrame.texture_img;pixelWidth=1.0/img.width;pixelHeight=1.0/img.height;}
else
{pixelWidth=1.0/inst.width;pixelHeight=1.0/inst.height;}
glw.setProgramParameters(rendertarget,pixelWidth,pixelHeight,rcTex2.left,rcTex2.top,rcTex2.right,rcTex2.bottom,layerScale,layerAngle,viewOriginLeft,viewOriginTop,(viewOriginLeft+viewOriginRight)/2,(viewOriginTop+viewOriginBottom)/2,this.runtime.kahanTime.sum,inst.effect_params[etindex]);inst.drawGL(glw);}
else
{glw.setProgramParameters(rendertarget,1.0/windowWidth,1.0/windowHeight,0.0,0.0,1.0,1.0,layerScale,layerAngle,viewOriginLeft,viewOriginTop,(viewOriginLeft+viewOriginRight)/2,(viewOriginTop+viewOriginBottom)/2,this.runtime.kahanTime.sum,layer?layer.effect_params[etindex]:this.effect_params[etindex]);glw.setTexture(layer?this.runtime.layer_tex:this.runtime.layout_tex);glw.resetModelView();glw.translate(-halfw,-halfh);glw.updateModelView();glw.quadTex(screenleft,screenbottom,screenright,screenbottom,screenright,screentop,screenleft,screentop,rcTex);}
rcTex2.left=rcTex2.top=0;rcTex2.right=rcTex2.bottom=1;if(inst&&!post_draw)
{temp=screenbottom;screenbottom=screentop;screentop=temp;}}
else
{glw.setProgramParameters(rendertarget,1.0/windowWidth,1.0/windowHeight,rcTex2.left,rcTex2.top,rcTex2.right,rcTex2.bottom,layerScale,layerAngle,viewOriginLeft,viewOriginTop,(viewOriginLeft+viewOriginRight)/2,(viewOriginTop+viewOriginBottom)/2,this.runtime.kahanTime.sum,inst?inst.effect_params[etindex]:layer?layer.effect_params[etindex]:this.effect_params[etindex]);glw.setTexture(null);if(i===last&&!post_draw)
{if(inst)
glw.setBlend(inst.srcBlend,inst.destBlend);else if(layer)
glw.setBlend(layer.srcBlend,layer.destBlend);glw.setRenderingToTexture(rendertarget);}
else
{glw.setRenderingToTexture(fx_tex[fx_index]);h=clearbottom-cleartop;y=(windowHeight-cleartop)-h;glw.clearRect(clearleft,y,clearright-clearleft,h);}
glw.setTexture(fx_tex[other_fx_index]);glw.resetModelView();glw.translate(-halfw,-halfh);glw.updateModelView();glw.quadTex(screenleft,screenbottom,screenright,screenbottom,screenright,screentop,screenleft,screentop,rcTex);if(i===last&&!post_draw)
glw.setTexture(null);}
fx_index=(fx_index===0?1:0);other_fx_index=(fx_index===0?1:0);}
if(post_draw)
{glw.switchProgram(0);if(inst)
glw.setBlend(inst.srcBlend,inst.destBlend);else if(layer)
glw.setBlend(layer.srcBlend,layer.destBlend);else
{if(!this.runtime.fullscreenScalingQuality)
{glw.setSize(this.runtime.width,this.runtime.height);halfw=this.runtime.width/2;halfh=this.runtime.height/2;screenleft=0;screentop=0;screenright=this.runtime.width;screenbottom=this.runtime.height;}}
glw.setRenderingToTexture(rendertarget);glw.setTexture(fx_tex[other_fx_index]);glw.resetModelView();glw.translate(-halfw,-halfh);glw.updateModelView();if(inst&&active_effect_types.length===1&&!pre_draw)
glw.quadTex(screenleft,screentop,screenright,screentop,screenright,screenbottom,screenleft,screenbottom,rcTex);else
glw.quadTex(screenleft,screenbottom,screenright,screenbottom,screenright,screentop,screenleft,screentop,rcTex);glw.setTexture(null);}};Layout.prototype.getLayerBySid=function(sid_)
{var i,len;for(i=0,len=this.layers.length;i<len;i++)
{if(this.layers[i].sid===sid_)
return this.layers[i];}
return null;};Layout.prototype.saveToJSON=function()
{var i,len,layer,et;var o={"sx":this.scrollX,"sy":this.scrollY,"s":this.scale,"a":this.angle,"w":this.width,"h":this.height,"fv":this.first_visit,"persist":this.persist_data,"fx":[],"layers":{}};for(i=0,len=this.effect_types.length;i<len;i++)
{et=this.effect_types[i];o["fx"].push({"name":et.name,"active":et.active,"params":this.effect_params[et.index]});}
for(i=0,len=this.layers.length;i<len;i++)
{layer=this.layers[i];o["layers"][layer.sid.toString()]=layer.saveToJSON();}
return o;};Layout.prototype.loadFromJSON=function(o)
{var i,j,len,fx,p,layer;this.scrollX=o["sx"];this.scrollY=o["sy"];this.scale=o["s"];this.angle=o["a"];this.width=o["w"];this.height=o["h"];this.persist_data=o["persist"];if(typeof o["fv"]!=="undefined")
this.first_visit=o["fv"];var ofx=o["fx"];for(i=0,len=ofx.length;i<len;i++)
{fx=this.getEffectByName(ofx[i]["name"]);if(!fx)
continue;fx.active=ofx[i]["active"];this.effect_params[fx.index]=ofx[i]["params"];}
this.updateActiveEffects();var olayers=o["layers"];for(p in olayers)
{if(olayers.hasOwnProperty(p))
{layer=this.getLayerBySid(parseInt(p,10));if(!layer)
continue;layer.loadFromJSON(olayers[p]);}}};cr.layout=Layout;function Layer(layout,m)
{this.layout=layout;this.runtime=layout.runtime;this.instances=[];this.scale=1.0;this.angle=0;this.disableAngle=false;this.tmprect=new cr.rect(0,0,0,0);this.tmpquad=new cr.quad();this.viewLeft=0;this.viewRight=0;this.viewTop=0;this.viewBottom=0;this.zindices_stale=false;this.zindices_stale_from=-1;this.clear_earlyz_index=0;this.name=m[0];this.index=m[1];this.sid=m[2];this.visible=m[3];this.background_color=m[4];this.transparent=m[5];this.parallaxX=m[6];this.parallaxY=m[7];this.opacity=m[8];this.forceOwnTexture=m[9];this.useRenderCells=m[10];this.zoomRate=m[11];this.blend_mode=m[12];this.effect_fallback=m[13];this.compositeOp="source-over";this.srcBlend=0;this.destBlend=0;this.render_grid=null;this.last_render_list=alloc_arr();this.render_list_stale=true;this.last_render_cells=new cr.rect(0,0,-1,-1);this.cur_render_cells=new cr.rect(0,0,-1,-1);if(this.useRenderCells)
{this.render_grid=new cr.RenderGrid(this.runtime.original_width,this.runtime.original_height);}
this.render_offscreen=false;var im=m[14];var i,len;this.startup_initial_instances=[];this.initial_instances=[];this.created_globals=[];for(i=0,len=im.length;i<len;i++)
{var inst=im[i];var type=this.runtime.types_by_index[inst[1]];;if(!type.default_instance)
{type.default_instance=inst;type.default_layerindex=this.index;}
this.initial_instances.push(inst);if(this.layout.initial_types.indexOf(type)===-1)
this.layout.initial_types.push(type);}
cr.shallowAssignArray(this.startup_initial_instances,this.initial_instances);this.effect_types=[];this.active_effect_types=[];this.shaders_preserve_opaqueness=true;this.effect_params=[];for(i=0,len=m[15].length;i<len;i++)
{this.effect_types.push({id:m[15][i][0],name:m[15][i][1],shaderindex:-1,preservesOpaqueness:false,active:true,index:i});this.effect_params.push(m[15][i][2].slice(0));}
this.updateActiveEffects();this.rcTex=new cr.rect(0,0,1,1);this.rcTex2=new cr.rect(0,0,1,1);};Layer.prototype.updateActiveEffects=function()
{cr.clearArray(this.active_effect_types);this.shaders_preserve_opaqueness=true;var i,len,et;for(i=0,len=this.effect_types.length;i<len;i++)
{et=this.effect_types[i];if(et.active)
{this.active_effect_types.push(et);if(!et.preservesOpaqueness)
this.shaders_preserve_opaqueness=false;}}};Layer.prototype.getEffectByName=function(name_)
{var i,len,et;for(i=0,len=this.effect_types.length;i<len;i++)
{et=this.effect_types[i];if(et.name===name_)
return et;}
return null;};Layer.prototype.createInitialInstances=function()
{var i,k,len,inst,initial_inst,type,keep,hasPersistBehavior;for(i=0,k=0,len=this.initial_instances.length;i<len;i++)
{initial_inst=this.initial_instances[i];type=this.runtime.types_by_index[initial_inst[1]];;hasPersistBehavior=this.runtime.typeHasPersistBehavior(type);keep=true;if(!hasPersistBehavior||this.layout.first_visit)
{inst=this.runtime.createInstanceFromInit(initial_inst,this,true);if(!inst)
continue;created_instances.push(inst);if(inst.type.global)
{keep=false;this.created_globals.push(inst.uid);}}
if(keep)
{this.initial_instances[k]=this.initial_instances[i];k++;}}
this.initial_instances.length=k;this.runtime.ClearDeathRow();if(!this.runtime.glwrap&&this.effect_types.length)
this.blend_mode=this.effect_fallback;this.compositeOp=cr.effectToCompositeOp(this.blend_mode);if(this.runtime.gl)
cr.setGLBlend(this,this.blend_mode,this.runtime.gl);this.render_list_stale=true;};Layer.prototype.recreateInitialObjects=function(only_type,rc)
{var i,len,initial_inst,type,wm,x,y,inst,j,lenj,s;var types_by_index=this.runtime.types_by_index;var only_type_is_family=only_type.is_family;var only_type_members=only_type.members;for(i=0,len=this.initial_instances.length;i<len;++i)
{initial_inst=this.initial_instances[i];wm=initial_inst[0];x=wm[0];y=wm[1];if(!rc.contains_pt(x,y))
continue;type=types_by_index[initial_inst[1]];if(type!==only_type)
{if(only_type_is_family)
{if(only_type_members.indexOf(type)<0)
continue;}
else
continue;}
inst=this.runtime.createInstanceFromInit(initial_inst,this,false);this.runtime.isInOnDestroy++;this.runtime.trigger(Object.getPrototypeOf(type.plugin).cnds.OnCreated,inst);if(inst.is_contained)
{for(j=0,lenj=inst.siblings.length;j<lenj;j++)
{s=inst.siblings[i];this.runtime.trigger(Object.getPrototypeOf(s.type.plugin).cnds.OnCreated,s);}}
this.runtime.isInOnDestroy--;}};Layer.prototype.removeFromInstanceList=function(inst,remove_from_grid)
{var index=cr.fastIndexOf(this.instances,inst);if(index<0)
return;if(remove_from_grid&&this.useRenderCells&&inst.rendercells&&inst.rendercells.right>=inst.rendercells.left)
{inst.update_bbox();this.render_grid.update(inst,inst.rendercells,null);inst.rendercells.set(0,0,-1,-1);}
if(index===this.instances.length-1)
this.instances.pop();else
{cr.arrayRemove(this.instances,index);this.setZIndicesStaleFrom(index);}
this.render_list_stale=true;};Layer.prototype.appendToInstanceList=function(inst,add_to_grid)
{;inst.zindex=this.instances.length;this.instances.push(inst);if(add_to_grid&&this.useRenderCells&&inst.rendercells)
{inst.set_bbox_changed();}
this.render_list_stale=true;};Layer.prototype.prependToInstanceList=function(inst,add_to_grid)
{;this.instances.unshift(inst);this.setZIndicesStaleFrom(0);if(add_to_grid&&this.useRenderCells&&inst.rendercells)
{inst.set_bbox_changed();}};Layer.prototype.moveInstanceAdjacent=function(inst,other,isafter)
{;var myZ=inst.get_zindex();var insertZ=other.get_zindex();cr.arrayRemove(this.instances,myZ);if(myZ<insertZ)
insertZ--;if(isafter)
insertZ++;if(insertZ===this.instances.length)
this.instances.push(inst);else
this.instances.splice(insertZ,0,inst);this.setZIndicesStaleFrom(myZ<insertZ?myZ:insertZ);};Layer.prototype.setZIndicesStaleFrom=function(index)
{if(this.zindices_stale_from===-1)
this.zindices_stale_from=index;else if(index<this.zindices_stale_from)
this.zindices_stale_from=index;this.zindices_stale=true;this.render_list_stale=true;};Layer.prototype.updateZIndices=function()
{if(!this.zindices_stale)
return;if(this.zindices_stale_from===-1)
this.zindices_stale_from=0;var i,len,inst;if(this.useRenderCells)
{for(i=this.zindices_stale_from,len=this.instances.length;i<len;++i)
{inst=this.instances[i];inst.zindex=i;this.render_grid.markRangeChanged(inst.rendercells);}}
else
{for(i=this.zindices_stale_from,len=this.instances.length;i<len;++i)
{this.instances[i].zindex=i;}}
this.zindices_stale=false;this.zindices_stale_from=-1;};Layer.prototype.getScale=function(include_aspect)
{return this.getNormalScale()*(this.runtime.fullscreenScalingQuality||include_aspect?this.runtime.aspect_scale:1);};Layer.prototype.getNormalScale=function()
{return((this.scale*this.layout.scale)-1)*this.zoomRate+1;};Layer.prototype.getAngle=function()
{if(this.disableAngle)
return 0;return cr.clamp_angle(this.layout.angle+this.angle);};var arr_cache=[];function alloc_arr()
{if(arr_cache.length)
return arr_cache.pop();else
return[];}
function free_arr(a)
{cr.clearArray(a);arr_cache.push(a);};function mergeSortedZArrays(a,b,out)
{var i=0,j=0,k=0,lena=a.length,lenb=b.length,ai,bj;out.length=lena+lenb;for(;i<lena&&j<lenb;++k)
{ai=a[i];bj=b[j];if(ai.zindex<bj.zindex)
{out[k]=ai;++i;}
else
{out[k]=bj;++j;}}
for(;i<lena;++i,++k)
out[k]=a[i];for(;j<lenb;++j,++k)
out[k]=b[j];};var next_arr=[];function mergeAllSortedZArrays_pass(arr,first_pass)
{var i,len,arr1,arr2,out;for(i=0,len=arr.length;i<len-1;i+=2)
{arr1=arr[i];arr2=arr[i+1];out=alloc_arr();mergeSortedZArrays(arr1,arr2,out);if(!first_pass)
{free_arr(arr1);free_arr(arr2);}
next_arr.push(out);}
if(len%2===1)
{if(first_pass)
{arr1=alloc_arr();cr.shallowAssignArray(arr1,arr[len-1]);next_arr.push(arr1);}
else
{next_arr.push(arr[len-1]);}}
cr.shallowAssignArray(arr,next_arr);cr.clearArray(next_arr);};function mergeAllSortedZArrays(arr)
{var first_pass=true;while(arr.length>1)
{mergeAllSortedZArrays_pass(arr,first_pass);first_pass=false;}
return arr[0];};var render_arr=[];Layer.prototype.getRenderCellInstancesToDraw=function()
{;this.updateZIndices();this.render_grid.queryRange(this.viewLeft,this.viewTop,this.viewRight,this.viewBottom,render_arr);if(!render_arr.length)
return alloc_arr();if(render_arr.length===1)
{var a=alloc_arr();cr.shallowAssignArray(a,render_arr[0]);cr.clearArray(render_arr);return a;}
var draw_list=mergeAllSortedZArrays(render_arr);cr.clearArray(render_arr);return draw_list;};Layer.prototype.draw=function(ctx)
{this.render_offscreen=(this.forceOwnTexture||this.opacity!==1.0||this.blend_mode!==0);var layer_canvas=this.runtime.canvas;var layer_ctx=ctx;var ctx_changed=false;if(this.render_offscreen)
{if(!this.runtime.layer_canvas)
{this.runtime.layer_canvas=document.createElement("canvas");;layer_canvas=this.runtime.layer_canvas;layer_canvas.width=this.runtime.draw_width;layer_canvas.height=this.runtime.draw_height;this.runtime.layer_ctx=layer_canvas.getContext("2d");;ctx_changed=true;}
layer_canvas=this.runtime.layer_canvas;layer_ctx=this.runtime.layer_ctx;if(layer_canvas.width!==this.runtime.draw_width)
{layer_canvas.width=this.runtime.draw_width;ctx_changed=true;}
if(layer_canvas.height!==this.runtime.draw_height)
{layer_canvas.height=this.runtime.draw_height;ctx_changed=true;}
if(ctx_changed)
{this.runtime.setCtxImageSmoothingEnabled(layer_ctx,this.runtime.linearSampling);}
if(this.transparent)
layer_ctx.clearRect(0,0,this.runtime.draw_width,this.runtime.draw_height);}
layer_ctx.globalAlpha=1;layer_ctx.globalCompositeOperation="source-over";if(!this.transparent)
{layer_ctx.fillStyle="rgb("+this.background_color[0]+","+this.background_color[1]+","+this.background_color[2]+")";layer_ctx.fillRect(0,0,this.runtime.draw_width,this.runtime.draw_height);}
layer_ctx.save();this.disableAngle=true;var px=this.canvasToLayer(0,0,true,true);var py=this.canvasToLayer(0,0,false,true);this.disableAngle=false;if(this.runtime.pixel_rounding)
{px=Math.round(px);py=Math.round(py);}
this.rotateViewport(px,py,layer_ctx);var myscale=this.getScale();layer_ctx.scale(myscale,myscale);layer_ctx.translate(-px,-py);var instances_to_draw;if(this.useRenderCells)
{this.cur_render_cells.left=this.render_grid.XToCell(this.viewLeft);this.cur_render_cells.top=this.render_grid.YToCell(this.viewTop);this.cur_render_cells.right=this.render_grid.XToCell(this.viewRight);this.cur_render_cells.bottom=this.render_grid.YToCell(this.viewBottom);if(this.render_list_stale||!this.cur_render_cells.equals(this.last_render_cells))
{free_arr(this.last_render_list);instances_to_draw=this.getRenderCellInstancesToDraw();this.render_list_stale=false;this.last_render_cells.copy(this.cur_render_cells);}
else
instances_to_draw=this.last_render_list;}
else
instances_to_draw=this.instances;var i,len,inst,last_inst=null;for(i=0,len=instances_to_draw.length;i<len;++i)
{inst=instances_to_draw[i];if(inst===last_inst)
continue;this.drawInstance(inst,layer_ctx);last_inst=inst;}
if(this.useRenderCells)
this.last_render_list=instances_to_draw;layer_ctx.restore();if(this.render_offscreen)
{ctx.globalCompositeOperation=this.compositeOp;ctx.globalAlpha=this.opacity;ctx.drawImage(layer_canvas,0,0);}};Layer.prototype.drawInstance=function(inst,layer_ctx)
{if(!inst.visible||inst.width===0||inst.height===0)
return;inst.update_bbox();var bbox=inst.bbox;if(bbox.right<this.viewLeft||bbox.bottom<this.viewTop||bbox.left>this.viewRight||bbox.top>this.viewBottom)
return;layer_ctx.globalCompositeOperation=inst.compositeOp;inst.draw(layer_ctx);};Layer.prototype.updateViewport=function(ctx)
{this.disableAngle=true;var px=this.canvasToLayer(0,0,true,true);var py=this.canvasToLayer(0,0,false,true);this.disableAngle=false;if(this.runtime.pixel_rounding)
{px=Math.round(px);py=Math.round(py);}
this.rotateViewport(px,py,ctx);};Layer.prototype.rotateViewport=function(px,py,ctx)
{var myscale=this.getScale();this.viewLeft=px;this.viewTop=py;this.viewRight=px+(this.runtime.draw_width*(1/myscale));this.viewBottom=py+(this.runtime.draw_height*(1/myscale));var temp;if(this.viewLeft>this.viewRight)
{temp=this.viewLeft;this.viewLeft=this.viewRight;this.viewRight=temp;}
if(this.viewTop>this.viewBottom)
{temp=this.viewTop;this.viewTop=this.viewBottom;this.viewBottom=temp;}
var myAngle=this.getAngle();if(myAngle!==0)
{if(ctx)
{ctx.translate(this.runtime.draw_width/2,this.runtime.draw_height/2);ctx.rotate(-myAngle);ctx.translate(this.runtime.draw_width/-2,this.runtime.draw_height/-2);}
this.tmprect.set(this.viewLeft,this.viewTop,this.viewRight,this.viewBottom);this.tmprect.offset((this.viewLeft+this.viewRight)/-2,(this.viewTop+this.viewBottom)/-2);this.tmpquad.set_from_rotated_rect(this.tmprect,myAngle);this.tmpquad.bounding_box(this.tmprect);this.tmprect.offset((this.viewLeft+this.viewRight)/2,(this.viewTop+this.viewBottom)/2);this.viewLeft=this.tmprect.left;this.viewTop=this.tmprect.top;this.viewRight=this.tmprect.right;this.viewBottom=this.tmprect.bottom;}}
Layer.prototype.drawGL_earlyZPass=function(glw)
{var windowWidth=this.runtime.draw_width;var windowHeight=this.runtime.draw_height;var shaderindex=0;var etindex=0;this.render_offscreen=this.forceOwnTexture;if(this.render_offscreen)
{if(!this.runtime.layer_tex)
{this.runtime.layer_tex=glw.createEmptyTexture(this.runtime.draw_width,this.runtime.draw_height,this.runtime.linearSampling);}
if(this.runtime.layer_tex.c2width!==this.runtime.draw_width||this.runtime.layer_tex.c2height!==this.runtime.draw_height)
{glw.deleteTexture(this.runtime.layer_tex);this.runtime.layer_tex=glw.createEmptyTexture(this.runtime.draw_width,this.runtime.draw_height,this.runtime.linearSampling);}
glw.setRenderingToTexture(this.runtime.layer_tex);}
this.disableAngle=true;var px=this.canvasToLayer(0,0,true,true);var py=this.canvasToLayer(0,0,false,true);this.disableAngle=false;if(this.runtime.pixel_rounding)
{px=Math.round(px);py=Math.round(py);}
this.rotateViewport(px,py,null);var myscale=this.getScale();glw.resetModelView();glw.scale(myscale,myscale);glw.rotateZ(-this.getAngle());glw.translate((this.viewLeft+this.viewRight)/-2,(this.viewTop+this.viewBottom)/-2);glw.updateModelView();var instances_to_draw;if(this.useRenderCells)
{this.cur_render_cells.left=this.render_grid.XToCell(this.viewLeft);this.cur_render_cells.top=this.render_grid.YToCell(this.viewTop);this.cur_render_cells.right=this.render_grid.XToCell(this.viewRight);this.cur_render_cells.bottom=this.render_grid.YToCell(this.viewBottom);if(this.render_list_stale||!this.cur_render_cells.equals(this.last_render_cells))
{free_arr(this.last_render_list);instances_to_draw=this.getRenderCellInstancesToDraw();this.render_list_stale=false;this.last_render_cells.copy(this.cur_render_cells);}
else
instances_to_draw=this.last_render_list;}
else
instances_to_draw=this.instances;var i,inst,last_inst=null;for(i=instances_to_draw.length-1;i>=0;--i)
{inst=instances_to_draw[i];if(inst===last_inst)
continue;this.drawInstanceGL_earlyZPass(instances_to_draw[i],glw);last_inst=inst;}
if(this.useRenderCells)
this.last_render_list=instances_to_draw;if(!this.transparent)
{this.clear_earlyz_index=this.runtime.earlyz_index++;glw.setEarlyZIndex(this.clear_earlyz_index);glw.setColorFillMode(1,1,1,1);glw.fullscreenQuad();glw.restoreEarlyZMode();}};Layer.prototype.drawGL=function(glw)
{var windowWidth=this.runtime.draw_width;var windowHeight=this.runtime.draw_height;var shaderindex=0;var etindex=0;this.render_offscreen=(this.forceOwnTexture||this.opacity!==1.0||this.active_effect_types.length>0||this.blend_mode!==0);if(this.render_offscreen)
{if(!this.runtime.layer_tex)
{this.runtime.layer_tex=glw.createEmptyTexture(this.runtime.draw_width,this.runtime.draw_height,this.runtime.linearSampling);}
if(this.runtime.layer_tex.c2width!==this.runtime.draw_width||this.runtime.layer_tex.c2height!==this.runtime.draw_height)
{glw.deleteTexture(this.runtime.layer_tex);this.runtime.layer_tex=glw.createEmptyTexture(this.runtime.draw_width,this.runtime.draw_height,this.runtime.linearSampling);}
glw.setRenderingToTexture(this.runtime.layer_tex);if(this.transparent)
glw.clear(0,0,0,0);}
if(!this.transparent)
{if(this.runtime.enableFrontToBack)
{glw.setEarlyZIndex(this.clear_earlyz_index);glw.setColorFillMode(this.background_color[0]/255,this.background_color[1]/255,this.background_color[2]/255,1);glw.fullscreenQuad();glw.setTextureFillMode();}
else
{glw.clear(this.background_color[0]/255,this.background_color[1]/255,this.background_color[2]/255,1);}}
this.disableAngle=true;var px=this.canvasToLayer(0,0,true,true);var py=this.canvasToLayer(0,0,false,true);this.disableAngle=false;if(this.runtime.pixel_rounding)
{px=Math.round(px);py=Math.round(py);}
this.rotateViewport(px,py,null);var myscale=this.getScale();glw.resetModelView();glw.scale(myscale,myscale);glw.rotateZ(-this.getAngle());glw.translate((this.viewLeft+this.viewRight)/-2,(this.viewTop+this.viewBottom)/-2);glw.updateModelView();var instances_to_draw;if(this.useRenderCells)
{this.cur_render_cells.left=this.render_grid.XToCell(this.viewLeft);this.cur_render_cells.top=this.render_grid.YToCell(this.viewTop);this.cur_render_cells.right=this.render_grid.XToCell(this.viewRight);this.cur_render_cells.bottom=this.render_grid.YToCell(this.viewBottom);if(this.render_list_stale||!this.cur_render_cells.equals(this.last_render_cells))
{free_arr(this.last_render_list);instances_to_draw=this.getRenderCellInstancesToDraw();this.render_list_stale=false;this.last_render_cells.copy(this.cur_render_cells);}
else
instances_to_draw=this.last_render_list;}
else
instances_to_draw=this.instances;var i,len,inst,last_inst=null;for(i=0,len=instances_to_draw.length;i<len;++i)
{inst=instances_to_draw[i];if(inst===last_inst)
continue;this.drawInstanceGL(instances_to_draw[i],glw);last_inst=inst;}
if(this.useRenderCells)
this.last_render_list=instances_to_draw;if(this.render_offscreen)
{shaderindex=this.active_effect_types.length?this.active_effect_types[0].shaderindex:0;etindex=this.active_effect_types.length?this.active_effect_types[0].index:0;if(this.active_effect_types.length===0||(this.active_effect_types.length===1&&!glw.programUsesCrossSampling(shaderindex)&&this.opacity===1))
{if(this.active_effect_types.length===1)
{glw.switchProgram(shaderindex);glw.setProgramParameters(this.layout.getRenderTarget(),1.0/this.runtime.draw_width,1.0/this.runtime.draw_height,0.0,0.0,1.0,1.0,myscale,this.getAngle(),this.viewLeft,this.viewTop,(this.viewLeft+this.viewRight)/2,(this.viewTop+this.viewBottom)/2,this.runtime.kahanTime.sum,this.effect_params[etindex]);if(glw.programIsAnimated(shaderindex))
this.runtime.redraw=true;}
else
glw.switchProgram(0);glw.setRenderingToTexture(this.layout.getRenderTarget());glw.setOpacity(this.opacity);glw.setTexture(this.runtime.layer_tex);glw.setBlend(this.srcBlend,this.destBlend);glw.resetModelView();glw.updateModelView();var halfw=this.runtime.draw_width/2;var halfh=this.runtime.draw_height/2;glw.quad(-halfw,halfh,halfw,halfh,halfw,-halfh,-halfw,-halfh);glw.setTexture(null);}
else
{this.layout.renderEffectChain(glw,this,null,this.layout.getRenderTarget());}}};Layer.prototype.drawInstanceGL=function(inst,glw)
{;if(!inst.visible||inst.width===0||inst.height===0)
return;inst.update_bbox();var bbox=inst.bbox;if(bbox.right<this.viewLeft||bbox.bottom<this.viewTop||bbox.left>this.viewRight||bbox.top>this.viewBottom)
return;glw.setEarlyZIndex(inst.earlyz_index);if(inst.uses_shaders)
{this.drawInstanceWithShadersGL(inst,glw);}
else
{glw.switchProgram(0);glw.setBlend(inst.srcBlend,inst.destBlend);inst.drawGL(glw);}};Layer.prototype.drawInstanceGL_earlyZPass=function(inst,glw)
{;if(!inst.visible||inst.width===0||inst.height===0)
return;inst.update_bbox();var bbox=inst.bbox;if(bbox.right<this.viewLeft||bbox.bottom<this.viewTop||bbox.left>this.viewRight||bbox.top>this.viewBottom)
return;inst.earlyz_index=this.runtime.earlyz_index++;if(inst.blend_mode!==0||inst.opacity!==1||!inst.shaders_preserve_opaqueness||!inst.drawGL_earlyZPass)
return;glw.setEarlyZIndex(inst.earlyz_index);inst.drawGL_earlyZPass(glw);};Layer.prototype.drawInstanceWithShadersGL=function(inst,glw)
{var shaderindex=inst.active_effect_types[0].shaderindex;var etindex=inst.active_effect_types[0].index;var myscale=this.getScale();if(inst.active_effect_types.length===1&&!glw.programUsesCrossSampling(shaderindex)&&!glw.programExtendsBox(shaderindex)&&((!inst.angle&&!inst.layer.getAngle())||!glw.programUsesDest(shaderindex))&&inst.opacity===1&&!inst.type.plugin.must_predraw)
{glw.switchProgram(shaderindex);glw.setBlend(inst.srcBlend,inst.destBlend);if(glw.programIsAnimated(shaderindex))
this.runtime.redraw=true;var destStartX=0,destStartY=0,destEndX=0,destEndY=0;if(glw.programUsesDest(shaderindex))
{var bbox=inst.bbox;var screenleft=this.layerToCanvas(bbox.left,bbox.top,true,true);var screentop=this.layerToCanvas(bbox.left,bbox.top,false,true);var screenright=this.layerToCanvas(bbox.right,bbox.bottom,true,true);var screenbottom=this.layerToCanvas(bbox.right,bbox.bottom,false,true);destStartX=screenleft/windowWidth;destStartY=1-screentop/windowHeight;destEndX=screenright/windowWidth;destEndY=1-screenbottom/windowHeight;}
var pixelWidth;var pixelHeight;if(inst.curFrame&&inst.curFrame.texture_img)
{var img=inst.curFrame.texture_img;pixelWidth=1.0/img.width;pixelHeight=1.0/img.height;}
else
{pixelWidth=1.0/inst.width;pixelHeight=1.0/inst.height;}
glw.setProgramParameters(this.render_offscreen?this.runtime.layer_tex:this.layout.getRenderTarget(),pixelWidth,pixelHeight,destStartX,destStartY,destEndX,destEndY,myscale,this.getAngle(),this.viewLeft,this.viewTop,(this.viewLeft+this.viewRight)/2,(this.viewTop+this.viewBottom)/2,this.runtime.kahanTime.sum,inst.effect_params[etindex]);inst.drawGL(glw);}
else
{this.layout.renderEffectChain(glw,this,inst,this.render_offscreen?this.runtime.layer_tex:this.layout.getRenderTarget());glw.resetModelView();glw.scale(myscale,myscale);glw.rotateZ(-this.getAngle());glw.translate((this.viewLeft+this.viewRight)/-2,(this.viewTop+this.viewBottom)/-2);glw.updateModelView();}};Layer.prototype.canvasToLayer=function(ptx,pty,getx,using_draw_area)
{var multiplier=this.runtime.devicePixelRatio;if(this.runtime.isRetina)
{ptx*=multiplier;pty*=multiplier;}
var ox=this.runtime.parallax_x_origin;var oy=this.runtime.parallax_y_origin;var par_x=((this.layout.scrollX-ox)*this.parallaxX)+ox;var par_y=((this.layout.scrollY-oy)*this.parallaxY)+oy;var x=par_x;var y=par_y;var invScale=1/this.getScale(!using_draw_area);if(using_draw_area)
{x-=(this.runtime.draw_width*invScale)/2;y-=(this.runtime.draw_height*invScale)/2;}
else
{x-=(this.runtime.width*invScale)/2;y-=(this.runtime.height*invScale)/2;}
x+=ptx*invScale;y+=pty*invScale;var a=this.getAngle();if(a!==0)
{x-=par_x;y-=par_y;var cosa=Math.cos(a);var sina=Math.sin(a);var x_temp=(x*cosa)-(y*sina);y=(y*cosa)+(x*sina);x=x_temp;x+=par_x;y+=par_y;}
return getx?x:y;};Layer.prototype.layerToCanvas=function(ptx,pty,getx,using_draw_area)
{var ox=this.runtime.parallax_x_origin;var oy=this.runtime.parallax_y_origin;var par_x=((this.layout.scrollX-ox)*this.parallaxX)+ox;var par_y=((this.layout.scrollY-oy)*this.parallaxY)+oy;var x=par_x;var y=par_y;var a=this.getAngle();if(a!==0)
{ptx-=par_x;pty-=par_y;var cosa=Math.cos(-a);var sina=Math.sin(-a);var x_temp=(ptx*cosa)-(pty*sina);pty=(pty*cosa)+(ptx*sina);ptx=x_temp;ptx+=par_x;pty+=par_y;}
var invScale=1/this.getScale(!using_draw_area);if(using_draw_area)
{x-=(this.runtime.draw_width*invScale)/2;y-=(this.runtime.draw_height*invScale)/2;}
else
{x-=(this.runtime.width*invScale)/2;y-=(this.runtime.height*invScale)/2;}
x=(ptx-x)/invScale;y=(pty-y)/invScale;var multiplier=this.runtime.devicePixelRatio;if(this.runtime.isRetina&&!using_draw_area)
{x/=multiplier;y/=multiplier;}
return getx?x:y;};Layer.prototype.rotatePt=function(x_,y_,getx)
{if(this.getAngle()===0)
return getx?x_:y_;var nx=this.layerToCanvas(x_,y_,true);var ny=this.layerToCanvas(x_,y_,false);this.disableAngle=true;var px=this.canvasToLayer(nx,ny,true);var py=this.canvasToLayer(nx,ny,true);this.disableAngle=false;return getx?px:py;};Layer.prototype.saveToJSON=function()
{var i,len,et;var o={"s":this.scale,"a":this.angle,"vl":this.viewLeft,"vt":this.viewTop,"vr":this.viewRight,"vb":this.viewBottom,"v":this.visible,"bc":this.background_color,"t":this.transparent,"px":this.parallaxX,"py":this.parallaxY,"o":this.opacity,"zr":this.zoomRate,"fx":[],"cg":this.created_globals,"instances":[]};for(i=0,len=this.effect_types.length;i<len;i++)
{et=this.effect_types[i];o["fx"].push({"name":et.name,"active":et.active,"params":this.effect_params[et.index]});}
return o;};Layer.prototype.loadFromJSON=function(o)
{var i,j,len,p,inst,fx;this.scale=o["s"];this.angle=o["a"];this.viewLeft=o["vl"];this.viewTop=o["vt"];this.viewRight=o["vr"];this.viewBottom=o["vb"];this.visible=o["v"];this.background_color=o["bc"];this.transparent=o["t"];this.parallaxX=o["px"];this.parallaxY=o["py"];this.opacity=o["o"];this.zoomRate=o["zr"];this.created_globals=o["cg"]||[];cr.shallowAssignArray(this.initial_instances,this.startup_initial_instances);var temp_set=new cr.ObjectSet();for(i=0,len=this.created_globals.length;i<len;++i)
temp_set.add(this.created_globals[i]);for(i=0,j=0,len=this.initial_instances.length;i<len;++i)
{if(!temp_set.contains(this.initial_instances[i][2]))
{this.initial_instances[j]=this.initial_instances[i];++j;}}
cr.truncateArray(this.initial_instances,j);var ofx=o["fx"];for(i=0,len=ofx.length;i<len;i++)
{fx=this.getEffectByName(ofx[i]["name"]);if(!fx)
continue;fx.active=ofx[i]["active"];this.effect_params[fx.index]=ofx[i]["params"];}
this.updateActiveEffects();this.instances.sort(sort_by_zindex);this.zindices_stale=true;};cr.layer=Layer;}());;(function()
{var allUniqueSolModifiers=[];function testSolsMatch(arr1,arr2)
{var i,len=arr1.length;switch(len){case 0:return true;case 1:return arr1[0]===arr2[0];case 2:return arr1[0]===arr2[0]&&arr1[1]===arr2[1];default:for(i=0;i<len;i++)
{if(arr1[i]!==arr2[i])
return false;}
return true;}};function solArraySorter(t1,t2)
{return t1.index-t2.index;};function findMatchingSolModifier(arr)
{var i,len,u,temp,subarr;if(arr.length===2)
{if(arr[0].index>arr[1].index)
{temp=arr[0];arr[0]=arr[1];arr[1]=temp;}}
else if(arr.length>2)
arr.sort(solArraySorter);if(arr.length>=allUniqueSolModifiers.length)
allUniqueSolModifiers.length=arr.length+1;if(!allUniqueSolModifiers[arr.length])
allUniqueSolModifiers[arr.length]=[];subarr=allUniqueSolModifiers[arr.length];for(i=0,len=subarr.length;i<len;i++)
{u=subarr[i];if(testSolsMatch(arr,u))
return u;}
subarr.push(arr);return arr;};function EventSheet(runtime,m)
{this.runtime=runtime;this.triggers={};this.fasttriggers={};this.hasRun=false;this.includes=new cr.ObjectSet();this.deep_includes=[];this.already_included_sheets=[];this.name=m[0];var em=m[1];this.events=[];var i,len;for(i=0,len=em.length;i<len;i++)
this.init_event(em[i],null,this.events);};EventSheet.prototype.toString=function()
{return this.name;};EventSheet.prototype.init_event=function(m,parent,nontriggers)
{switch(m[0]){case 0:{var block=new cr.eventblock(this,parent,m);cr.seal(block);if(block.orblock)
{nontriggers.push(block);var i,len;for(i=0,len=block.conditions.length;i<len;i++)
{if(block.conditions[i].trigger)
this.init_trigger(block,i);}}
else
{if(block.is_trigger())
this.init_trigger(block,0);else
nontriggers.push(block);}
break;}
case 1:{var v=new cr.eventvariable(this,parent,m);cr.seal(v);nontriggers.push(v);break;}
case 2:{var inc=new cr.eventinclude(this,parent,m);cr.seal(inc);nontriggers.push(inc);break;}
default:;}};EventSheet.prototype.postInit=function()
{var i,len;for(i=0,len=this.events.length;i<len;i++)
{this.events[i].postInit(i<len-1&&this.events[i+1].is_else_block);}};EventSheet.prototype.updateDeepIncludes=function()
{cr.clearArray(this.deep_includes);cr.clearArray(this.already_included_sheets);this.addDeepIncludes(this);cr.clearArray(this.already_included_sheets);};EventSheet.prototype.addDeepIncludes=function(root_sheet)
{var i,len,inc,sheet;var deep_includes=root_sheet.deep_includes;var already_included_sheets=root_sheet.already_included_sheets;var arr=this.includes.valuesRef();for(i=0,len=arr.length;i<len;++i)
{inc=arr[i];sheet=inc.include_sheet;if(!inc.isActive()||root_sheet===sheet||already_included_sheets.indexOf(sheet)>-1)
continue;already_included_sheets.push(sheet);sheet.addDeepIncludes(root_sheet);deep_includes.push(sheet);}};EventSheet.prototype.run=function(from_include)
{if(!this.runtime.resuming_breakpoint)
{this.hasRun=true;if(!from_include)
this.runtime.isRunningEvents=true;}
var i,len;for(i=0,len=this.events.length;i<len;i++)
{var ev=this.events[i];ev.run();this.runtime.clearSol(ev.solModifiers);if(this.runtime.hasPendingInstances)
this.runtime.ClearDeathRow();}
if(!from_include)
this.runtime.isRunningEvents=false;};function isPerformanceSensitiveTrigger(method)
{if(cr.plugins_.Sprite&&method===cr.plugins_.Sprite.prototype.cnds.OnFrameChanged)
{return true;}
return false;};EventSheet.prototype.init_trigger=function(trig,index)
{if(!trig.orblock)
this.runtime.triggers_to_postinit.push(trig);var i,len;var cnd=trig.conditions[index];var type_name;if(cnd.type)
type_name=cnd.type.name;else
type_name="system";var fasttrigger=cnd.fasttrigger;var triggers=(fasttrigger?this.fasttriggers:this.triggers);if(!triggers[type_name])
triggers[type_name]=[];var obj_entry=triggers[type_name];var method=cnd.func;if(fasttrigger)
{if(!cnd.parameters.length)
return;var firstparam=cnd.parameters[0];if(firstparam.type!==1||firstparam.expression.type!==2)
{return;}
var fastevs;var firstvalue=firstparam.expression.value.toLowerCase();var i,len;for(i=0,len=obj_entry.length;i<len;i++)
{if(obj_entry[i].method==method)
{fastevs=obj_entry[i].evs;if(!fastevs[firstvalue])
fastevs[firstvalue]=[[trig,index]];else
fastevs[firstvalue].push([trig,index]);return;}}
fastevs={};fastevs[firstvalue]=[[trig,index]];obj_entry.push({method:method,evs:fastevs});}
else
{for(i=0,len=obj_entry.length;i<len;i++)
{if(obj_entry[i].method==method)
{obj_entry[i].evs.push([trig,index]);return;}}
if(isPerformanceSensitiveTrigger(method))
obj_entry.unshift({method:method,evs:[[trig,index]]});else
obj_entry.push({method:method,evs:[[trig,index]]});}};cr.eventsheet=EventSheet;function Selection(type)
{this.type=type;this.instances=[];this.else_instances=[];this.select_all=true;};Selection.prototype.hasObjects=function()
{if(this.select_all)
return this.type.instances.length;else
return this.instances.length;};Selection.prototype.getObjects=function()
{if(this.select_all)
return this.type.instances;else
return this.instances;};Selection.prototype.pick_one=function(inst)
{if(!inst)
return;if(inst.runtime.getCurrentEventStack().current_event.orblock)
{if(this.select_all)
{cr.clearArray(this.instances);cr.shallowAssignArray(this.else_instances,inst.type.instances);this.select_all=false;}
var i=this.else_instances.indexOf(inst);if(i!==-1)
{this.instances.push(this.else_instances[i]);this.else_instances.splice(i,1);}}
else
{this.select_all=false;cr.clearArray(this.instances);this.instances[0]=inst;}};cr.selection=Selection;function EventBlock(sheet,parent,m)
{this.sheet=sheet;this.parent=parent;this.runtime=sheet.runtime;this.solModifiers=[];this.solModifiersIncludingParents=[];this.solWriterAfterCnds=false;this.group=false;this.initially_activated=false;this.toplevelevent=false;this.toplevelgroup=false;this.has_else_block=false;;this.conditions=[];this.actions=[];this.subevents=[];this.group_name="";this.group=false;this.initially_activated=false;this.group_active=false;this.contained_includes=null;if(m[1])
{this.group_name=m[1][1].toLowerCase();this.group=true;this.initially_activated=!!m[1][0];this.contained_includes=[];this.group_active=this.initially_activated;this.runtime.allGroups.push(this);this.runtime.groups_by_name[this.group_name]=this;}
this.orblock=m[2];this.sid=m[4];if(!this.group)
this.runtime.blocksBySid[this.sid.toString()]=this;var i,len;var cm=m[5];for(i=0,len=cm.length;i<len;i++)
{var cnd=new cr.condition(this,cm[i]);cnd.index=i;cr.seal(cnd);this.conditions.push(cnd);this.addSolModifier(cnd.type);}
var am=m[6];for(i=0,len=am.length;i<len;i++)
{var act=new cr.action(this,am[i]);act.index=i;cr.seal(act);this.actions.push(act);}
if(m.length===8)
{var em=m[7];for(i=0,len=em.length;i<len;i++)
this.sheet.init_event(em[i],this,this.subevents);}
this.is_else_block=false;if(this.conditions.length)
{this.is_else_block=(this.conditions[0].type==null&&this.conditions[0].func==cr.system_object.prototype.cnds.Else);}};window["_c2hh_"]="8FB3D68C8CCFC180F66D1A0B3451B1FC87E1B91F";EventBlock.prototype.postInit=function(hasElse)
{var i,len;var p=this.parent;if(this.group)
{this.toplevelgroup=true;while(p)
{if(!p.group)
{this.toplevelgroup=false;break;}
p=p.parent;}}
this.toplevelevent=!this.is_trigger()&&(!this.parent||(this.parent.group&&this.parent.toplevelgroup));this.has_else_block=!!hasElse;this.solModifiersIncludingParents=this.solModifiers.slice(0);p=this.parent;while(p)
{for(i=0,len=p.solModifiers.length;i<len;i++)
this.addParentSolModifier(p.solModifiers[i]);p=p.parent;}
this.solModifiers=findMatchingSolModifier(this.solModifiers);this.solModifiersIncludingParents=findMatchingSolModifier(this.solModifiersIncludingParents);var i,len;for(i=0,len=this.conditions.length;i<len;i++)
this.conditions[i].postInit();for(i=0,len=this.actions.length;i<len;i++)
this.actions[i].postInit();for(i=0,len=this.subevents.length;i<len;i++)
{this.subevents[i].postInit(i<len-1&&this.subevents[i+1].is_else_block);}};EventBlock.prototype.setGroupActive=function(a)
{if(this.group_active===!!a)
return;this.group_active=!!a;var i,len;for(i=0,len=this.contained_includes.length;i<len;++i)
{this.contained_includes[i].updateActive();}
if(len>0&&this.runtime.running_layout.event_sheet)
this.runtime.running_layout.event_sheet.updateDeepIncludes();};function addSolModifierToList(type,arr)
{var i,len,t;if(!type)
return;if(arr.indexOf(type)===-1)
arr.push(type);if(type.is_contained)
{for(i=0,len=type.container.length;i<len;i++)
{t=type.container[i];if(type===t)
continue;if(arr.indexOf(t)===-1)
arr.push(t);}}};EventBlock.prototype.addSolModifier=function(type)
{addSolModifierToList(type,this.solModifiers);};EventBlock.prototype.addParentSolModifier=function(type)
{addSolModifierToList(type,this.solModifiersIncludingParents);};EventBlock.prototype.setSolWriterAfterCnds=function()
{this.solWriterAfterCnds=true;if(this.parent)
this.parent.setSolWriterAfterCnds();};EventBlock.prototype.is_trigger=function()
{if(!this.conditions.length)
return false;else
return this.conditions[0].trigger;};EventBlock.prototype.run=function()
{var i,len,c,any_true=false,cnd_result;var runtime=this.runtime;var evinfo=this.runtime.getCurrentEventStack();evinfo.current_event=this;var conditions=this.conditions;if(!this.is_else_block)
evinfo.else_branch_ran=false;if(this.orblock)
{if(conditions.length===0)
any_true=true;evinfo.cndindex=0
for(len=conditions.length;evinfo.cndindex<len;evinfo.cndindex++)
{c=conditions[evinfo.cndindex];if(c.trigger)
continue;cnd_result=c.run();if(cnd_result)
any_true=true;}
evinfo.last_event_true=any_true;if(any_true)
this.run_actions_and_subevents();}
else
{evinfo.cndindex=0
for(len=conditions.length;evinfo.cndindex<len;evinfo.cndindex++)
{cnd_result=conditions[evinfo.cndindex].run();if(!cnd_result)
{evinfo.last_event_true=false;if(this.toplevelevent&&runtime.hasPendingInstances)
runtime.ClearDeathRow();return;}}
evinfo.last_event_true=true;this.run_actions_and_subevents();}
this.end_run(evinfo);};EventBlock.prototype.end_run=function(evinfo)
{if(evinfo.last_event_true&&this.has_else_block)
evinfo.else_branch_ran=true;if(this.toplevelevent&&this.runtime.hasPendingInstances)
this.runtime.ClearDeathRow();};EventBlock.prototype.run_orblocktrigger=function(index)
{var evinfo=this.runtime.getCurrentEventStack();evinfo.current_event=this;if(this.conditions[index].run())
{this.run_actions_and_subevents();this.runtime.getCurrentEventStack().last_event_true=true;}};EventBlock.prototype.run_actions_and_subevents=function()
{var evinfo=this.runtime.getCurrentEventStack();var len;for(evinfo.actindex=0,len=this.actions.length;evinfo.actindex<len;evinfo.actindex++)
{if(this.actions[evinfo.actindex].run())
return;}
this.run_subevents();};EventBlock.prototype.resume_actions_and_subevents=function()
{var evinfo=this.runtime.getCurrentEventStack();var len;for(len=this.actions.length;evinfo.actindex<len;evinfo.actindex++)
{if(this.actions[evinfo.actindex].run())
return;}
this.run_subevents();};EventBlock.prototype.run_subevents=function()
{if(!this.subevents.length)
return;var i,len,subev,pushpop;var last=this.subevents.length-1;this.runtime.pushEventStack(this);if(this.solWriterAfterCnds)
{for(i=0,len=this.subevents.length;i<len;i++)
{subev=this.subevents[i];pushpop=(!this.toplevelgroup||(!this.group&&i<last));if(pushpop)
this.runtime.pushCopySol(subev.solModifiers);subev.run();if(pushpop)
this.runtime.popSol(subev.solModifiers);else
this.runtime.clearSol(subev.solModifiers);}}
else
{for(i=0,len=this.subevents.length;i<len;i++)
{this.subevents[i].run();}}
this.runtime.popEventStack();};EventBlock.prototype.run_pretrigger=function()
{var evinfo=this.runtime.getCurrentEventStack();evinfo.current_event=this;var any_true=false;var i,len;for(evinfo.cndindex=0,len=this.conditions.length;evinfo.cndindex<len;evinfo.cndindex++)
{;if(this.conditions[evinfo.cndindex].run())
any_true=true;else if(!this.orblock)
return false;}
return this.orblock?any_true:true;};EventBlock.prototype.retrigger=function()
{this.runtime.execcount++;var prevcndindex=this.runtime.getCurrentEventStack().cndindex;var len;var evinfo=this.runtime.pushEventStack(this);if(!this.orblock)
{for(evinfo.cndindex=prevcndindex+1,len=this.conditions.length;evinfo.cndindex<len;evinfo.cndindex++)
{if(!this.conditions[evinfo.cndindex].run())
{this.runtime.popEventStack();return false;}}}
this.run_actions_and_subevents();this.runtime.popEventStack();return true;};EventBlock.prototype.isFirstConditionOfType=function(cnd)
{var cndindex=cnd.index;if(cndindex===0)
return true;--cndindex;for(;cndindex>=0;--cndindex)
{if(this.conditions[cndindex].type===cnd.type)
return false;}
return true;};cr.eventblock=EventBlock;function Condition(block,m)
{this.block=block;this.sheet=block.sheet;this.runtime=block.runtime;this.parameters=[];this.results=[];this.extra={};this.index=-1;this.anyParamVariesPerInstance=false;this.func=this.runtime.GetObjectReference(m[1]);;this.trigger=(m[3]>0);this.fasttrigger=(m[3]===2);this.looping=m[4];this.inverted=m[5];this.isstatic=m[6];this.sid=m[7];this.runtime.cndsBySid[this.sid.toString()]=this;if(m[0]===-1)
{this.type=null;this.run=this.run_system;this.behaviortype=null;this.beh_index=-1;}
else
{this.type=this.runtime.types_by_index[m[0]];;if(this.isstatic)
this.run=this.run_static;else
this.run=this.run_object;if(m[2])
{this.behaviortype=this.type.getBehaviorByName(m[2]);;this.beh_index=this.type.getBehaviorIndexByName(m[2]);;}
else
{this.behaviortype=null;this.beh_index=-1;}
if(this.block.parent)
this.block.parent.setSolWriterAfterCnds();}
if(this.fasttrigger)
this.run=this.run_true;if(m.length===10)
{var i,len;var em=m[9];for(i=0,len=em.length;i<len;i++)
{var param=new cr.parameter(this,em[i]);cr.seal(param);this.parameters.push(param);}
this.results.length=em.length;}};Condition.prototype.postInit=function()
{var i,len,p;for(i=0,len=this.parameters.length;i<len;i++)
{p=this.parameters[i];p.postInit();if(p.variesPerInstance)
this.anyParamVariesPerInstance=true;}};Condition.prototype.run_true=function()
{return true;};Condition.prototype.run_system=function()
{var i,len;for(i=0,len=this.parameters.length;i<len;i++)
this.results[i]=this.parameters[i].get();return cr.xor(this.func.apply(this.runtime.system,this.results),this.inverted);};Condition.prototype.run_static=function()
{var i,len;for(i=0,len=this.parameters.length;i<len;i++)
this.results[i]=this.parameters[i].get();var ret=this.func.apply(this.behaviortype?this.behaviortype:this.type,this.results);this.type.applySolToContainer();return ret;};Condition.prototype.run_object=function()
{var i,j,k,leni,lenj,p,ret,met,inst,s,sol2;var type=this.type;var sol=type.getCurrentSol();var is_orblock=this.block.orblock&&!this.trigger;var offset=0;var is_contained=type.is_contained;var is_family=type.is_family;var family_index=type.family_index;var beh_index=this.beh_index;var is_beh=(beh_index>-1);var params_vary=this.anyParamVariesPerInstance;var parameters=this.parameters;var results=this.results;var inverted=this.inverted;var func=this.func;var arr,container;if(params_vary)
{for(j=0,lenj=parameters.length;j<lenj;++j)
{p=parameters[j];if(!p.variesPerInstance)
results[j]=p.get(0);}}
else
{for(j=0,lenj=parameters.length;j<lenj;++j)
results[j]=parameters[j].get(0);}
if(sol.select_all){cr.clearArray(sol.instances);cr.clearArray(sol.else_instances);arr=type.instances;for(i=0,leni=arr.length;i<leni;++i)
{inst=arr[i];;if(params_vary)
{for(j=0,lenj=parameters.length;j<lenj;++j)
{p=parameters[j];if(p.variesPerInstance)
results[j]=p.get(i);}}
if(is_beh)
{offset=0;if(is_family)
{offset=inst.type.family_beh_map[family_index];}
ret=func.apply(inst.behavior_insts[beh_index+offset],results);}
else
ret=func.apply(inst,results);met=cr.xor(ret,inverted);if(met)
sol.instances.push(inst);else if(is_orblock)
sol.else_instances.push(inst);}
if(type.finish)
type.finish(true);sol.select_all=false;type.applySolToContainer();return sol.hasObjects();}
else{k=0;var using_else_instances=(is_orblock&&!this.block.isFirstConditionOfType(this));arr=(using_else_instances?sol.else_instances:sol.instances);var any_true=false;for(i=0,leni=arr.length;i<leni;++i)
{inst=arr[i];;if(params_vary)
{for(j=0,lenj=parameters.length;j<lenj;++j)
{p=parameters[j];if(p.variesPerInstance)
results[j]=p.get(i);}}
if(is_beh)
{offset=0;if(is_family)
{offset=inst.type.family_beh_map[family_index];}
ret=func.apply(inst.behavior_insts[beh_index+offset],results);}
else
ret=func.apply(inst,results);if(cr.xor(ret,inverted))
{any_true=true;if(using_else_instances)
{sol.instances.push(inst);if(is_contained)
{for(j=0,lenj=inst.siblings.length;j<lenj;j++)
{s=inst.siblings[j];s.type.getCurrentSol().instances.push(s);}}}
else
{arr[k]=inst;if(is_contained)
{for(j=0,lenj=inst.siblings.length;j<lenj;j++)
{s=inst.siblings[j];s.type.getCurrentSol().instances[k]=s;}}
k++;}}
else
{if(using_else_instances)
{arr[k]=inst;if(is_contained)
{for(j=0,lenj=inst.siblings.length;j<lenj;j++)
{s=inst.siblings[j];s.type.getCurrentSol().else_instances[k]=s;}}
k++;}
else if(is_orblock)
{sol.else_instances.push(inst);if(is_contained)
{for(j=0,lenj=inst.siblings.length;j<lenj;j++)
{s=inst.siblings[j];s.type.getCurrentSol().else_instances.push(s);}}}}}
cr.truncateArray(arr,k);if(is_contained)
{container=type.container;for(i=0,leni=container.length;i<leni;i++)
{sol2=container[i].getCurrentSol();if(using_else_instances)
cr.truncateArray(sol2.else_instances,k);else
cr.truncateArray(sol2.instances,k);}}
var pick_in_finish=any_true;if(using_else_instances&&!any_true)
{for(i=0,leni=sol.instances.length;i<leni;i++)
{inst=sol.instances[i];if(params_vary)
{for(j=0,lenj=parameters.length;j<lenj;j++)
{p=parameters[j];if(p.variesPerInstance)
results[j]=p.get(i);}}
if(is_beh)
ret=func.apply(inst.behavior_insts[beh_index],results);else
ret=func.apply(inst,results);if(cr.xor(ret,inverted))
{any_true=true;break;}}}
if(type.finish)
type.finish(pick_in_finish||is_orblock);return is_orblock?any_true:sol.hasObjects();}};cr.condition=Condition;function Action(block,m)
{this.block=block;this.sheet=block.sheet;this.runtime=block.runtime;this.parameters=[];this.results=[];this.extra={};this.index=-1;this.anyParamVariesPerInstance=false;this.func=this.runtime.GetObjectReference(m[1]);;if(m[0]===-1)
{this.type=null;this.run=this.run_system;this.behaviortype=null;this.beh_index=-1;}
else
{this.type=this.runtime.types_by_index[m[0]];;this.run=this.run_object;if(m[2])
{this.behaviortype=this.type.getBehaviorByName(m[2]);;this.beh_index=this.type.getBehaviorIndexByName(m[2]);;}
else
{this.behaviortype=null;this.beh_index=-1;}}
this.sid=m[3];this.runtime.actsBySid[this.sid.toString()]=this;if(m.length===6)
{var i,len;var em=m[5];for(i=0,len=em.length;i<len;i++)
{var param=new cr.parameter(this,em[i]);cr.seal(param);this.parameters.push(param);}
this.results.length=em.length;}};Action.prototype.postInit=function()
{var i,len,p;for(i=0,len=this.parameters.length;i<len;i++)
{p=this.parameters[i];p.postInit();if(p.variesPerInstance)
this.anyParamVariesPerInstance=true;}};Action.prototype.run_system=function()
{var runtime=this.runtime;var i,len;var parameters=this.parameters;var results=this.results;for(i=0,len=parameters.length;i<len;++i)
results[i]=parameters[i].get();return this.func.apply(runtime.system,results);};Action.prototype.run_object=function()
{var type=this.type;var beh_index=this.beh_index;var family_index=type.family_index;var params_vary=this.anyParamVariesPerInstance;var parameters=this.parameters;var results=this.results;var func=this.func;var instances=type.getCurrentSol().getObjects();var is_family=type.is_family;var is_beh=(beh_index>-1);var i,j,leni,lenj,p,inst,offset;if(params_vary)
{for(j=0,lenj=parameters.length;j<lenj;++j)
{p=parameters[j];if(!p.variesPerInstance)
results[j]=p.get(0);}}
else
{for(j=0,lenj=parameters.length;j<lenj;++j)
results[j]=parameters[j].get(0);}
for(i=0,leni=instances.length;i<leni;++i)
{inst=instances[i];if(params_vary)
{for(j=0,lenj=parameters.length;j<lenj;++j)
{p=parameters[j];if(p.variesPerInstance)
results[j]=p.get(i);}}
if(is_beh)
{offset=0;if(is_family)
{offset=inst.type.family_beh_map[family_index];}
func.apply(inst.behavior_insts[beh_index+offset],results);}
else
func.apply(inst,results);}
return false;};cr.action=Action;var tempValues=[];var tempValuesPtr=-1;function pushTempValue()
{tempValuesPtr++;if(tempValues.length===tempValuesPtr)
tempValues.push(new cr.expvalue());return tempValues[tempValuesPtr];};function popTempValue()
{tempValuesPtr--;};function Parameter(owner,m)
{this.owner=owner;this.block=owner.block;this.sheet=owner.sheet;this.runtime=owner.runtime;this.type=m[0];this.expression=null;this.solindex=0;this.get=null;this.combosel=0;this.layout=null;this.key=0;this.object=null;this.index=0;this.varname=null;this.eventvar=null;this.fileinfo=null;this.subparams=null;this.variadicret=null;this.subparams=null;this.variadicret=null;this.variesPerInstance=false;var i,len,param;switch(m[0])
{case 0:case 7:this.expression=new cr.expNode(this,m[1]);this.solindex=0;this.get=this.get_exp;break;case 1:this.expression=new cr.expNode(this,m[1]);this.solindex=0;this.get=this.get_exp_str;break;case 5:this.expression=new cr.expNode(this,m[1]);this.solindex=0;this.get=this.get_layer;break;case 3:case 8:this.combosel=m[1];this.get=this.get_combosel;break;case 6:this.layout=this.runtime.layouts[m[1]];;this.get=this.get_layout;break;case 9:this.key=m[1];this.get=this.get_key;break;case 4:this.object=this.runtime.types_by_index[m[1]];;this.get=this.get_object;this.block.addSolModifier(this.object);if(this.owner instanceof cr.action)
this.block.setSolWriterAfterCnds();else if(this.block.parent)
this.block.parent.setSolWriterAfterCnds();break;case 10:this.index=m[1];if(owner.type&&owner.type.is_family)
{this.get=this.get_familyvar;this.variesPerInstance=true;}
else
this.get=this.get_instvar;break;case 11:this.varname=m[1];this.eventvar=null;this.get=this.get_eventvar;break;case 2:case 12:this.fileinfo=m[1];this.get=this.get_audiofile;break;case 13:this.get=this.get_variadic;this.subparams=[];this.variadicret=[];for(i=1,len=m.length;i<len;i++)
{param=new cr.parameter(this.owner,m[i]);cr.seal(param);this.subparams.push(param);this.variadicret.push(0);}
break;default:;}};Parameter.prototype.postInit=function()
{var i,len;if(this.type===11)
{this.eventvar=this.runtime.getEventVariableByName(this.varname,this.block.parent);;}
else if(this.type===13)
{for(i=0,len=this.subparams.length;i<len;i++)
this.subparams[i].postInit();}
if(this.expression)
this.expression.postInit();};Parameter.prototype.maybeVaryForType=function(t)
{if(this.variesPerInstance)
return;if(!t)
return;if(!t.plugin.singleglobal)
{this.variesPerInstance=true;return;}};Parameter.prototype.setVaries=function()
{this.variesPerInstance=true;};Parameter.prototype.get_exp=function(solindex)
{this.solindex=solindex||0;var temp=pushTempValue();this.expression.get(temp);popTempValue();return temp.data;};Parameter.prototype.get_exp_str=function(solindex)
{this.solindex=solindex||0;var temp=pushTempValue();this.expression.get(temp);popTempValue();if(cr.is_string(temp.data))
return temp.data;else
return "";};Parameter.prototype.get_object=function()
{return this.object;};Parameter.prototype.get_combosel=function()
{return this.combosel;};Parameter.prototype.get_layer=function(solindex)
{this.solindex=solindex||0;var temp=pushTempValue();this.expression.get(temp);popTempValue();if(temp.is_number())
return this.runtime.getLayerByNumber(temp.data);else
return this.runtime.getLayerByName(temp.data);}
Parameter.prototype.get_layout=function()
{return this.layout;};Parameter.prototype.get_key=function()
{return this.key;};Parameter.prototype.get_instvar=function()
{return this.index;};Parameter.prototype.get_familyvar=function(solindex_)
{var solindex=solindex_||0;var familytype=this.owner.type;var realtype=null;var sol=familytype.getCurrentSol();var objs=sol.getObjects();if(objs.length)
realtype=objs[solindex%objs.length].type;else if(sol.else_instances.length)
realtype=sol.else_instances[solindex%sol.else_instances.length].type;else if(familytype.instances.length)
realtype=familytype.instances[solindex%familytype.instances.length].type;else
return 0;return this.index+realtype.family_var_map[familytype.family_index];};Parameter.prototype.get_eventvar=function()
{return this.eventvar;};Parameter.prototype.get_audiofile=function()
{return this.fileinfo;};Parameter.prototype.get_variadic=function()
{var i,len;for(i=0,len=this.subparams.length;i<len;i++)
{this.variadicret[i]=this.subparams[i].get();}
return this.variadicret;};cr.parameter=Parameter;function EventVariable(sheet,parent,m)
{this.sheet=sheet;this.parent=parent;this.runtime=sheet.runtime;this.solModifiers=[];this.name=m[1];this.vartype=m[2];this.initial=m[3];this.is_static=!!m[4];this.is_constant=!!m[5];this.sid=m[6];this.runtime.varsBySid[this.sid.toString()]=this;this.data=this.initial;if(this.parent)
{if(this.is_static||this.is_constant)
this.localIndex=-1;else
this.localIndex=this.runtime.stackLocalCount++;this.runtime.all_local_vars.push(this);}
else
{this.localIndex=-1;this.runtime.all_global_vars.push(this);}};EventVariable.prototype.postInit=function()
{this.solModifiers=findMatchingSolModifier(this.solModifiers);};EventVariable.prototype.setValue=function(x)
{;var lvs=this.runtime.getCurrentLocalVarStack();if(!this.parent||this.is_static||!lvs)
this.data=x;else
{if(this.localIndex>=lvs.length)
lvs.length=this.localIndex+1;lvs[this.localIndex]=x;}};EventVariable.prototype.getValue=function()
{var lvs=this.runtime.getCurrentLocalVarStack();if(!this.parent||this.is_static||!lvs||this.is_constant)
return this.data;else
{if(this.localIndex>=lvs.length)
{return this.initial;}
if(typeof lvs[this.localIndex]==="undefined")
{return this.initial;}
return lvs[this.localIndex];}};EventVariable.prototype.run=function()
{if(this.parent&&!this.is_static&&!this.is_constant)
this.setValue(this.initial);};cr.eventvariable=EventVariable;function EventInclude(sheet,parent,m)
{this.sheet=sheet;this.parent=parent;this.runtime=sheet.runtime;this.solModifiers=[];this.include_sheet=null;this.include_sheet_name=m[1];this.active=true;};EventInclude.prototype.toString=function()
{return "include:"+this.include_sheet.toString();};EventInclude.prototype.postInit=function()
{this.include_sheet=this.runtime.eventsheets[this.include_sheet_name];;;this.sheet.includes.add(this);this.solModifiers=findMatchingSolModifier(this.solModifiers);var p=this.parent;while(p)
{if(p.group)
p.contained_includes.push(this);p=p.parent;}
this.updateActive();};EventInclude.prototype.run=function()
{if(this.parent)
this.runtime.pushCleanSol(this.runtime.types_by_index);if(!this.include_sheet.hasRun)
this.include_sheet.run(true);if(this.parent)
this.runtime.popSol(this.runtime.types_by_index);};EventInclude.prototype.updateActive=function()
{var p=this.parent;while(p)
{if(p.group&&!p.group_active)
{this.active=false;return;}
p=p.parent;}
this.active=true;};EventInclude.prototype.isActive=function()
{return this.active;};cr.eventinclude=EventInclude;function EventStackFrame()
{this.temp_parents_arr=[];this.reset(null);cr.seal(this);};EventStackFrame.prototype.reset=function(cur_event)
{this.current_event=cur_event;this.cndindex=0;this.actindex=0;cr.clearArray(this.temp_parents_arr);this.last_event_true=false;this.else_branch_ran=false;this.any_true_state=false;};EventStackFrame.prototype.isModifierAfterCnds=function()
{if(this.current_event.solWriterAfterCnds)
return true;if(this.cndindex<this.current_event.conditions.length-1)
return!!this.current_event.solModifiers.length;return false;};cr.eventStackFrame=EventStackFrame;}());(function()
{function ExpNode(owner_,m)
{this.owner=owner_;this.runtime=owner_.runtime;this.type=m[0];;this.get=[this.eval_int,this.eval_float,this.eval_string,this.eval_unaryminus,this.eval_add,this.eval_subtract,this.eval_multiply,this.eval_divide,this.eval_mod,this.eval_power,this.eval_and,this.eval_or,this.eval_equal,this.eval_notequal,this.eval_less,this.eval_lessequal,this.eval_greater,this.eval_greaterequal,this.eval_conditional,this.eval_system_exp,this.eval_object_exp,this.eval_instvar_exp,this.eval_behavior_exp,this.eval_eventvar_exp][this.type];var paramsModel=null;this.value=null;this.first=null;this.second=null;this.third=null;this.func=null;this.results=null;this.parameters=null;this.object_type=null;this.beh_index=-1;this.instance_expr=null;this.varindex=-1;this.behavior_type=null;this.varname=null;this.eventvar=null;this.return_string=false;switch(this.type){case 0:case 1:case 2:this.value=m[1];break;case 3:this.first=new cr.expNode(owner_,m[1]);break;case 18:this.first=new cr.expNode(owner_,m[1]);this.second=new cr.expNode(owner_,m[2]);this.third=new cr.expNode(owner_,m[3]);break;case 19:this.func=this.runtime.GetObjectReference(m[1]);;if(this.func===cr.system_object.prototype.exps.random||this.func===cr.system_object.prototype.exps.choose)
{this.owner.setVaries();}
this.results=[];this.parameters=[];if(m.length===3)
{paramsModel=m[2];this.results.length=paramsModel.length+1;}
else
this.results.length=1;break;case 20:this.object_type=this.runtime.types_by_index[m[1]];;this.beh_index=-1;this.func=this.runtime.GetObjectReference(m[2]);this.return_string=m[3];if(cr.plugins_.Function&&this.func===cr.plugins_.Function.prototype.exps.Call)
{this.owner.setVaries();}
if(m[4])
this.instance_expr=new cr.expNode(owner_,m[4]);else
this.instance_expr=null;this.results=[];this.parameters=[];if(m.length===6)
{paramsModel=m[5];this.results.length=paramsModel.length+1;}
else
this.results.length=1;break;case 21:this.object_type=this.runtime.types_by_index[m[1]];;this.return_string=m[2];if(m[3])
this.instance_expr=new cr.expNode(owner_,m[3]);else
this.instance_expr=null;this.varindex=m[4];break;case 22:this.object_type=this.runtime.types_by_index[m[1]];;this.behavior_type=this.object_type.getBehaviorByName(m[2]);;this.beh_index=this.object_type.getBehaviorIndexByName(m[2]);this.func=this.runtime.GetObjectReference(m[3]);this.return_string=m[4];if(m[5])
this.instance_expr=new cr.expNode(owner_,m[5]);else
this.instance_expr=null;this.results=[];this.parameters=[];if(m.length===7)
{paramsModel=m[6];this.results.length=paramsModel.length+1;}
else
this.results.length=1;break;case 23:this.varname=m[1];this.eventvar=null;break;}
this.owner.maybeVaryForType(this.object_type);if(this.type>=4&&this.type<=17)
{this.first=new cr.expNode(owner_,m[1]);this.second=new cr.expNode(owner_,m[2]);}
if(paramsModel)
{var i,len;for(i=0,len=paramsModel.length;i<len;i++)
this.parameters.push(new cr.expNode(owner_,paramsModel[i]));}
cr.seal(this);};ExpNode.prototype.postInit=function()
{if(this.type===23)
{this.eventvar=this.owner.runtime.getEventVariableByName(this.varname,this.owner.block.parent);;}
if(this.first)
this.first.postInit();if(this.second)
this.second.postInit();if(this.third)
this.third.postInit();if(this.instance_expr)
this.instance_expr.postInit();if(this.parameters)
{var i,len;for(i=0,len=this.parameters.length;i<len;i++)
this.parameters[i].postInit();}};var tempValues=[];var tempValuesPtr=-1;function pushTempValue()
{++tempValuesPtr;if(tempValues.length===tempValuesPtr)
tempValues.push(new cr.expvalue());return tempValues[tempValuesPtr];};function popTempValue()
{--tempValuesPtr;};function eval_params(parameters,results,temp)
{var i,len;for(i=0,len=parameters.length;i<len;++i)
{parameters[i].get(temp);results[i+1]=temp.data;}}
ExpNode.prototype.eval_system_exp=function(ret)
{var parameters=this.parameters;var results=this.results;results[0]=ret;var temp=pushTempValue();eval_params(parameters,results,temp);popTempValue();this.func.apply(this.runtime.system,results);};ExpNode.prototype.eval_object_exp=function(ret)
{var object_type=this.object_type;var results=this.results;var parameters=this.parameters;var instance_expr=this.instance_expr;var func=this.func;var index=this.owner.solindex;var sol=object_type.getCurrentSol();var instances=sol.getObjects();if(!instances.length)
{if(sol.else_instances.length)
instances=sol.else_instances;else
{if(this.return_string)
ret.set_string("");else
ret.set_int(0);return;}}
results[0]=ret;ret.object_class=object_type;var temp=pushTempValue();eval_params(parameters,results,temp);if(instance_expr){instance_expr.get(temp);if(temp.is_number()){index=temp.data;instances=object_type.instances;}}
popTempValue();var len=instances.length;if(index>=len||index<=-len)
index%=len;if(index<0)
index+=len;var returned_val=func.apply(instances[index],results);;};ExpNode.prototype.eval_behavior_exp=function(ret)
{var object_type=this.object_type;var results=this.results;var parameters=this.parameters;var instance_expr=this.instance_expr;var beh_index=this.beh_index;var func=this.func;var index=this.owner.solindex;var sol=object_type.getCurrentSol();var instances=sol.getObjects();if(!instances.length)
{if(sol.else_instances.length)
instances=sol.else_instances;else
{if(this.return_string)
ret.set_string("");else
ret.set_int(0);return;}}
results[0]=ret;ret.object_class=object_type;var temp=pushTempValue();eval_params(parameters,results,temp);if(instance_expr){instance_expr.get(temp);if(temp.is_number()){index=temp.data;instances=object_type.instances;}}
popTempValue();var len=instances.length;if(index>=len||index<=-len)
index%=len;if(index<0)
index+=len;var inst=instances[index];var offset=0;if(object_type.is_family)
{offset=inst.type.family_beh_map[object_type.family_index];}
var returned_val=func.apply(inst.behavior_insts[beh_index+offset],results);;};ExpNode.prototype.eval_instvar_exp=function(ret)
{var instance_expr=this.instance_expr;var object_type=this.object_type;var varindex=this.varindex;var index=this.owner.solindex;var sol=object_type.getCurrentSol();var instances=sol.getObjects();var inst;if(!instances.length)
{if(sol.else_instances.length)
instances=sol.else_instances;else
{if(this.return_string)
ret.set_string("");else
ret.set_int(0);return;}}
if(instance_expr)
{var temp=pushTempValue();instance_expr.get(temp);if(temp.is_number())
{index=temp.data;var type_instances=object_type.instances;if(type_instances.length!==0)
{index%=type_instances.length;if(index<0)
index+=type_instances.length;}
inst=object_type.getInstanceByIID(index);var to_ret=inst.instance_vars[varindex];if(cr.is_string(to_ret))
ret.set_string(to_ret);else
ret.set_float(to_ret);popTempValue();return;}
popTempValue();}
var len=instances.length;if(index>=len||index<=-len)
index%=len;if(index<0)
index+=len;inst=instances[index];var offset=0;if(object_type.is_family)
{offset=inst.type.family_var_map[object_type.family_index];}
var to_ret=inst.instance_vars[varindex+offset];if(cr.is_string(to_ret))
ret.set_string(to_ret);else
ret.set_float(to_ret);};ExpNode.prototype.eval_int=function(ret)
{ret.type=cr.exptype.Integer;ret.data=this.value;};ExpNode.prototype.eval_float=function(ret)
{ret.type=cr.exptype.Float;ret.data=this.value;};ExpNode.prototype.eval_string=function(ret)
{ret.type=cr.exptype.String;ret.data=this.value;};ExpNode.prototype.eval_unaryminus=function(ret)
{this.first.get(ret);if(ret.is_number())
ret.data=-ret.data;};ExpNode.prototype.eval_add=function(ret)
{this.first.get(ret);var temp=pushTempValue();this.second.get(temp);if(ret.is_number()&&temp.is_number())
{ret.data+=temp.data;if(temp.is_float())
ret.make_float();}
popTempValue();};ExpNode.prototype.eval_subtract=function(ret)
{this.first.get(ret);var temp=pushTempValue();this.second.get(temp);if(ret.is_number()&&temp.is_number())
{ret.data-=temp.data;if(temp.is_float())
ret.make_float();}
popTempValue();};ExpNode.prototype.eval_multiply=function(ret)
{this.first.get(ret);var temp=pushTempValue();this.second.get(temp);if(ret.is_number()&&temp.is_number())
{ret.data*=temp.data;if(temp.is_float())
ret.make_float();}
popTempValue();};ExpNode.prototype.eval_divide=function(ret)
{this.first.get(ret);var temp=pushTempValue();this.second.get(temp);if(ret.is_number()&&temp.is_number())
{ret.data/=temp.data;ret.make_float();}
popTempValue();};ExpNode.prototype.eval_mod=function(ret)
{this.first.get(ret);var temp=pushTempValue();this.second.get(temp);if(ret.is_number()&&temp.is_number())
{ret.data%=temp.data;if(temp.is_float())
ret.make_float();}
popTempValue();};ExpNode.prototype.eval_power=function(ret)
{this.first.get(ret);var temp=pushTempValue();this.second.get(temp);if(ret.is_number()&&temp.is_number())
{ret.data=Math.pow(ret.data,temp.data);if(temp.is_float())
ret.make_float();}
popTempValue();};ExpNode.prototype.eval_and=function(ret)
{this.first.get(ret);var temp=pushTempValue();this.second.get(temp);if(temp.is_string()||ret.is_string())
this.eval_and_stringconcat(ret,temp);else
this.eval_and_logical(ret,temp);popTempValue();};ExpNode.prototype.eval_and_stringconcat=function(ret,temp)
{if(ret.is_string()&&temp.is_string())
this.eval_and_stringconcat_str_str(ret,temp);else
this.eval_and_stringconcat_num(ret,temp);};ExpNode.prototype.eval_and_stringconcat_str_str=function(ret,temp)
{ret.data+=temp.data;};ExpNode.prototype.eval_and_stringconcat_num=function(ret,temp)
{if(ret.is_string())
{ret.data+=(Math.round(temp.data*1e10)/1e10).toString();}
else
{ret.set_string(ret.data.toString()+temp.data);}};ExpNode.prototype.eval_and_logical=function(ret,temp)
{ret.set_int(ret.data&&temp.data?1:0);};ExpNode.prototype.eval_or=function(ret)
{this.first.get(ret);var temp=pushTempValue();this.second.get(temp);if(ret.is_number()&&temp.is_number())
{if(ret.data||temp.data)
ret.set_int(1);else
ret.set_int(0);}
popTempValue();};ExpNode.prototype.eval_conditional=function(ret)
{this.first.get(ret);if(ret.data)
this.second.get(ret);else
this.third.get(ret);};ExpNode.prototype.eval_equal=function(ret)
{this.first.get(ret);var temp=pushTempValue();this.second.get(temp);ret.set_int(ret.data===temp.data?1:0);popTempValue();};ExpNode.prototype.eval_notequal=function(ret)
{this.first.get(ret);var temp=pushTempValue();this.second.get(temp);ret.set_int(ret.data!==temp.data?1:0);popTempValue();};ExpNode.prototype.eval_less=function(ret)
{this.first.get(ret);var temp=pushTempValue();this.second.get(temp);ret.set_int(ret.data<temp.data?1:0);popTempValue();};ExpNode.prototype.eval_lessequal=function(ret)
{this.first.get(ret);var temp=pushTempValue();this.second.get(temp);ret.set_int(ret.data<=temp.data?1:0);popTempValue();};ExpNode.prototype.eval_greater=function(ret)
{this.first.get(ret);var temp=pushTempValue();this.second.get(temp);ret.set_int(ret.data>temp.data?1:0);popTempValue();};ExpNode.prototype.eval_greaterequal=function(ret)
{this.first.get(ret);var temp=pushTempValue();this.second.get(temp);ret.set_int(ret.data>=temp.data?1:0);popTempValue();};ExpNode.prototype.eval_eventvar_exp=function(ret)
{var val=this.eventvar.getValue();if(cr.is_number(val))
ret.set_float(val);else
ret.set_string(val);};cr.expNode=ExpNode;function ExpValue(type,data)
{this.type=type||cr.exptype.Integer;this.data=data||0;this.object_class=null;;;;if(this.type==cr.exptype.Integer)
this.data=Math.floor(this.data);cr.seal(this);};ExpValue.prototype.is_int=function()
{return this.type===cr.exptype.Integer;};ExpValue.prototype.is_float=function()
{return this.type===cr.exptype.Float;};ExpValue.prototype.is_number=function()
{return this.type===cr.exptype.Integer||this.type===cr.exptype.Float;};ExpValue.prototype.is_string=function()
{return this.type===cr.exptype.String;};ExpValue.prototype.make_int=function()
{if(!this.is_int())
{if(this.is_float())
this.data=Math.floor(this.data);else if(this.is_string())
this.data=parseInt(this.data,10);this.type=cr.exptype.Integer;}};ExpValue.prototype.make_float=function()
{if(!this.is_float())
{if(this.is_string())
this.data=parseFloat(this.data);this.type=cr.exptype.Float;}};ExpValue.prototype.make_string=function()
{if(!this.is_string())
{this.data=this.data.toString();this.type=cr.exptype.String;}};ExpValue.prototype.set_int=function(val)
{;this.type=cr.exptype.Integer;this.data=Math.floor(val);};ExpValue.prototype.set_float=function(val)
{;this.type=cr.exptype.Float;this.data=val;};ExpValue.prototype.set_string=function(val)
{;this.type=cr.exptype.String;this.data=val;};ExpValue.prototype.set_any=function(val)
{if(cr.is_number(val))
{this.type=cr.exptype.Float;this.data=val;}
else if(cr.is_string(val))
{this.type=cr.exptype.String;this.data=val.toString();}
else
{this.type=cr.exptype.Integer;this.data=0;}};cr.expvalue=ExpValue;cr.exptype={Integer:0,Float:1,String:2};}());;cr.system_object=function(runtime)
{this.runtime=runtime;this.waits=[];};cr.system_object.prototype.saveToJSON=function()
{var o={};var i,len,j,lenj,p,w,t,sobj;o["waits"]=[];var owaits=o["waits"];var waitobj;for(i=0,len=this.waits.length;i<len;i++)
{w=this.waits[i];waitobj={"t":w.time,"st":w.signaltag,"s":w.signalled,"ev":w.ev.sid,"sm":[],"sols":{}};if(w.ev.actions[w.actindex])
waitobj["act"]=w.ev.actions[w.actindex].sid;for(j=0,lenj=w.solModifiers.length;j<lenj;j++)
waitobj["sm"].push(w.solModifiers[j].sid);for(p in w.sols)
{if(w.sols.hasOwnProperty(p))
{t=this.runtime.types_by_index[parseInt(p,10)];;sobj={"sa":w.sols[p].sa,"insts":[]};for(j=0,lenj=w.sols[p].insts.length;j<lenj;j++)
sobj["insts"].push(w.sols[p].insts[j].uid);waitobj["sols"][t.sid.toString()]=sobj;}}
owaits.push(waitobj);}
return o;};cr.system_object.prototype.loadFromJSON=function(o)
{var owaits=o["waits"];var i,len,j,lenj,p,w,addWait,e,aindex,t,savedsol,nusol,inst;cr.clearArray(this.waits);for(i=0,len=owaits.length;i<len;i++)
{w=owaits[i];e=this.runtime.blocksBySid[w["ev"].toString()];if(!e)
continue;aindex=-1;for(j=0,lenj=e.actions.length;j<lenj;j++)
{if(e.actions[j].sid===w["act"])
{aindex=j;break;}}
if(aindex===-1)
continue;addWait={};addWait.sols={};addWait.solModifiers=[];addWait.deleteme=false;addWait.time=w["t"];addWait.signaltag=w["st"]||"";addWait.signalled=!!w["s"];addWait.ev=e;addWait.actindex=aindex;for(j=0,lenj=w["sm"].length;j<lenj;j++)
{t=this.runtime.getObjectTypeBySid(w["sm"][j]);if(t)
addWait.solModifiers.push(t);}
for(p in w["sols"])
{if(w["sols"].hasOwnProperty(p))
{t=this.runtime.getObjectTypeBySid(parseInt(p,10));if(!t)
continue;savedsol=w["sols"][p];nusol={sa:savedsol["sa"],insts:[]};for(j=0,lenj=savedsol["insts"].length;j<lenj;j++)
{inst=this.runtime.getObjectByUID(savedsol["insts"][j]);if(inst)
nusol.insts.push(inst);}
addWait.sols[t.index.toString()]=nusol;}}
this.waits.push(addWait);}};(function()
{var sysProto=cr.system_object.prototype;function SysCnds(){};SysCnds.prototype.EveryTick=function()
{return true;};SysCnds.prototype.OnLayoutStart=function()
{return true;};SysCnds.prototype.OnLayoutEnd=function()
{return true;};SysCnds.prototype.Compare=function(x,cmp,y)
{return cr.do_cmp(x,cmp,y);};SysCnds.prototype.CompareTime=function(cmp,t)
{var elapsed=this.runtime.kahanTime.sum;if(cmp===0)
{var cnd=this.runtime.getCurrentCondition();if(!cnd.extra["CompareTime_executed"])
{if(elapsed>=t)
{cnd.extra["CompareTime_executed"]=true;return true;}}
return false;}
return cr.do_cmp(elapsed,cmp,t);};SysCnds.prototype.LayerVisible=function(layer)
{if(!layer)
return false;else
return layer.visible;};SysCnds.prototype.LayerEmpty=function(layer)
{if(!layer)
return false;else
return!layer.instances.length;};SysCnds.prototype.LayerCmpOpacity=function(layer,cmp,opacity_)
{if(!layer)
return false;return cr.do_cmp(layer.opacity*100,cmp,opacity_);};SysCnds.prototype.Repeat=function(count)
{var current_frame=this.runtime.getCurrentEventStack();var current_event=current_frame.current_event;var solModifierAfterCnds=current_frame.isModifierAfterCnds();var current_loop=this.runtime.pushLoopStack();var i;if(solModifierAfterCnds)
{for(i=0;i<count&&!current_loop.stopped;i++)
{this.runtime.pushCopySol(current_event.solModifiers);current_loop.index=i;current_event.retrigger();this.runtime.popSol(current_event.solModifiers);}}
else
{for(i=0;i<count&&!current_loop.stopped;i++)
{current_loop.index=i;current_event.retrigger();}}
this.runtime.popLoopStack();return false;};SysCnds.prototype.While=function(count)
{var current_frame=this.runtime.getCurrentEventStack();var current_event=current_frame.current_event;var solModifierAfterCnds=current_frame.isModifierAfterCnds();var current_loop=this.runtime.pushLoopStack();var i;if(solModifierAfterCnds)
{for(i=0;!current_loop.stopped;i++)
{this.runtime.pushCopySol(current_event.solModifiers);current_loop.index=i;if(!current_event.retrigger())
current_loop.stopped=true;this.runtime.popSol(current_event.solModifiers);}}
else
{for(i=0;!current_loop.stopped;i++)
{current_loop.index=i;if(!current_event.retrigger())
current_loop.stopped=true;}}
this.runtime.popLoopStack();return false;};SysCnds.prototype.For=function(name,start,end)
{var current_frame=this.runtime.getCurrentEventStack();var current_event=current_frame.current_event;var solModifierAfterCnds=current_frame.isModifierAfterCnds();var current_loop=this.runtime.pushLoopStack(name);var i;if(end<start)
{if(solModifierAfterCnds)
{for(i=start;i>=end&&!current_loop.stopped;--i)
{this.runtime.pushCopySol(current_event.solModifiers);current_loop.index=i;current_event.retrigger();this.runtime.popSol(current_event.solModifiers);}}
else
{for(i=start;i>=end&&!current_loop.stopped;--i)
{current_loop.index=i;current_event.retrigger();}}}
else
{if(solModifierAfterCnds)
{for(i=start;i<=end&&!current_loop.stopped;++i)
{this.runtime.pushCopySol(current_event.solModifiers);current_loop.index=i;current_event.retrigger();this.runtime.popSol(current_event.solModifiers);}}
else
{for(i=start;i<=end&&!current_loop.stopped;++i)
{current_loop.index=i;current_event.retrigger();}}}
this.runtime.popLoopStack();return false;};var foreach_instancestack=[];var foreach_instanceptr=-1;SysCnds.prototype.ForEach=function(obj)
{var sol=obj.getCurrentSol();foreach_instanceptr++;if(foreach_instancestack.length===foreach_instanceptr)
foreach_instancestack.push([]);var instances=foreach_instancestack[foreach_instanceptr];cr.shallowAssignArray(instances,sol.getObjects());var current_frame=this.runtime.getCurrentEventStack();var current_event=current_frame.current_event;var solModifierAfterCnds=current_frame.isModifierAfterCnds();var current_loop=this.runtime.pushLoopStack();var i,len,j,lenj,inst,s,sol2;var is_contained=obj.is_contained;if(solModifierAfterCnds)
{for(i=0,len=instances.length;i<len&&!current_loop.stopped;i++)
{this.runtime.pushCopySol(current_event.solModifiers);inst=instances[i];sol=obj.getCurrentSol();sol.select_all=false;cr.clearArray(sol.instances);sol.instances[0]=inst;if(is_contained)
{for(j=0,lenj=inst.siblings.length;j<lenj;j++)
{s=inst.siblings[j];sol2=s.type.getCurrentSol();sol2.select_all=false;cr.clearArray(sol2.instances);sol2.instances[0]=s;}}
current_loop.index=i;current_event.retrigger();this.runtime.popSol(current_event.solModifiers);}}
else
{sol.select_all=false;cr.clearArray(sol.instances);for(i=0,len=instances.length;i<len&&!current_loop.stopped;i++)
{inst=instances[i];sol.instances[0]=inst;if(is_contained)
{for(j=0,lenj=inst.siblings.length;j<lenj;j++)
{s=inst.siblings[j];sol2=s.type.getCurrentSol();sol2.select_all=false;cr.clearArray(sol2.instances);sol2.instances[0]=s;}}
current_loop.index=i;current_event.retrigger();}}
cr.clearArray(instances);this.runtime.popLoopStack();foreach_instanceptr--;return false;};function foreach_sortinstances(a,b)
{var va=a.extra["c2_feo_val"];var vb=b.extra["c2_feo_val"];if(cr.is_number(va)&&cr.is_number(vb))
return va-vb;else
{va=""+va;vb=""+vb;if(va<vb)
return-1;else if(va>vb)
return 1;else
return 0;}};SysCnds.prototype.ForEachOrdered=function(obj,exp,order)
{var sol=obj.getCurrentSol();foreach_instanceptr++;if(foreach_instancestack.length===foreach_instanceptr)
foreach_instancestack.push([]);var instances=foreach_instancestack[foreach_instanceptr];cr.shallowAssignArray(instances,sol.getObjects());var current_frame=this.runtime.getCurrentEventStack();var current_event=current_frame.current_event;var current_condition=this.runtime.getCurrentCondition();var solModifierAfterCnds=current_frame.isModifierAfterCnds();var current_loop=this.runtime.pushLoopStack();var i,len,j,lenj,inst,s,sol2;for(i=0,len=instances.length;i<len;i++)
{instances[i].extra["c2_feo_val"]=current_condition.parameters[1].get(i);}
instances.sort(foreach_sortinstances);if(order===1)
instances.reverse();var is_contained=obj.is_contained;if(solModifierAfterCnds)
{for(i=0,len=instances.length;i<len&&!current_loop.stopped;i++)
{this.runtime.pushCopySol(current_event.solModifiers);inst=instances[i];sol=obj.getCurrentSol();sol.select_all=false;cr.clearArray(sol.instances);sol.instances[0]=inst;if(is_contained)
{for(j=0,lenj=inst.siblings.length;j<lenj;j++)
{s=inst.siblings[j];sol2=s.type.getCurrentSol();sol2.select_all=false;cr.clearArray(sol2.instances);sol2.instances[0]=s;}}
current_loop.index=i;current_event.retrigger();this.runtime.popSol(current_event.solModifiers);}}
else
{sol.select_all=false;cr.clearArray(sol.instances);for(i=0,len=instances.length;i<len&&!current_loop.stopped;i++)
{inst=instances[i];sol.instances[0]=inst;if(is_contained)
{for(j=0,lenj=inst.siblings.length;j<lenj;j++)
{s=inst.siblings[j];sol2=s.type.getCurrentSol();sol2.select_all=false;cr.clearArray(sol2.instances);sol2.instances[0]=s;}}
current_loop.index=i;current_event.retrigger();}}
cr.clearArray(instances);this.runtime.popLoopStack();foreach_instanceptr--;return false;};SysCnds.prototype.PickByComparison=function(obj_,exp_,cmp_,val_)
{var i,len,k,inst;if(!obj_)
return;foreach_instanceptr++;if(foreach_instancestack.length===foreach_instanceptr)
foreach_instancestack.push([]);var tmp_instances=foreach_instancestack[foreach_instanceptr];var sol=obj_.getCurrentSol();cr.shallowAssignArray(tmp_instances,sol.getObjects());if(sol.select_all)
cr.clearArray(sol.else_instances);var current_condition=this.runtime.getCurrentCondition();for(i=0,k=0,len=tmp_instances.length;i<len;i++)
{inst=tmp_instances[i];tmp_instances[k]=inst;exp_=current_condition.parameters[1].get(i);val_=current_condition.parameters[3].get(i);if(cr.do_cmp(exp_,cmp_,val_))
{k++;}
else
{sol.else_instances.push(inst);}}
cr.truncateArray(tmp_instances,k);sol.select_all=false;cr.shallowAssignArray(sol.instances,tmp_instances);cr.clearArray(tmp_instances);foreach_instanceptr--;obj_.applySolToContainer();return!!sol.instances.length;};SysCnds.prototype.PickByEvaluate=function(obj_,exp_)
{var i,len,k,inst;if(!obj_)
return;foreach_instanceptr++;if(foreach_instancestack.length===foreach_instanceptr)
foreach_instancestack.push([]);var tmp_instances=foreach_instancestack[foreach_instanceptr];var sol=obj_.getCurrentSol();cr.shallowAssignArray(tmp_instances,sol.getObjects());if(sol.select_all)
cr.clearArray(sol.else_instances);var current_condition=this.runtime.getCurrentCondition();for(i=0,k=0,len=tmp_instances.length;i<len;i++)
{inst=tmp_instances[i];tmp_instances[k]=inst;exp_=current_condition.parameters[1].get(i);if(exp_)
{k++;}
else
{sol.else_instances.push(inst);}}
cr.truncateArray(tmp_instances,k);sol.select_all=false;cr.shallowAssignArray(sol.instances,tmp_instances);cr.clearArray(tmp_instances);foreach_instanceptr--;obj_.applySolToContainer();return!!sol.instances.length;};SysCnds.prototype.TriggerOnce=function()
{var cndextra=this.runtime.getCurrentCondition().extra;if(typeof cndextra["TriggerOnce_lastTick"]==="undefined")
cndextra["TriggerOnce_lastTick"]=-1;var last_tick=cndextra["TriggerOnce_lastTick"];var cur_tick=this.runtime.tickcount;cndextra["TriggerOnce_lastTick"]=cur_tick;return this.runtime.layout_first_tick||last_tick!==cur_tick-1;};SysCnds.prototype.Every=function(seconds)
{var cnd=this.runtime.getCurrentCondition();var last_time=cnd.extra["Every_lastTime"]||0;var cur_time=this.runtime.kahanTime.sum;if(typeof cnd.extra["Every_seconds"]==="undefined")
cnd.extra["Every_seconds"]=seconds;var this_seconds=cnd.extra["Every_seconds"];if(cur_time>=last_time+this_seconds)
{cnd.extra["Every_lastTime"]=last_time+this_seconds;if(cur_time>=cnd.extra["Every_lastTime"]+0.04)
{cnd.extra["Every_lastTime"]=cur_time;}
cnd.extra["Every_seconds"]=seconds;return true;}
else if(cur_time<last_time-0.1)
{cnd.extra["Every_lastTime"]=cur_time;}
return false;};SysCnds.prototype.PickNth=function(obj,index)
{if(!obj)
return false;var sol=obj.getCurrentSol();var instances=sol.getObjects();index=cr.floor(index);if(index<0||index>=instances.length)
return false;var inst=instances[index];sol.pick_one(inst);obj.applySolToContainer();return true;};SysCnds.prototype.PickRandom=function(obj)
{if(!obj)
return false;var sol=obj.getCurrentSol();var instances=sol.getObjects();var index=cr.floor(Math.random()*instances.length);if(index>=instances.length)
return false;var inst=instances[index];sol.pick_one(inst);obj.applySolToContainer();return true;};SysCnds.prototype.CompareVar=function(v,cmp,val)
{return cr.do_cmp(v.getValue(),cmp,val);};SysCnds.prototype.IsGroupActive=function(group)
{var g=this.runtime.groups_by_name[group.toLowerCase()];return g&&g.group_active;};SysCnds.prototype.IsPreview=function()
{return typeof cr_is_preview!=="undefined";};SysCnds.prototype.PickAll=function(obj)
{if(!obj)
return false;if(!obj.instances.length)
return false;var sol=obj.getCurrentSol();sol.select_all=true;obj.applySolToContainer();return true;};SysCnds.prototype.IsMobile=function()
{return this.runtime.isMobile;};SysCnds.prototype.CompareBetween=function(x,a,b)
{return x>=a&&x<=b;};SysCnds.prototype.Else=function()
{var current_frame=this.runtime.getCurrentEventStack();if(current_frame.else_branch_ran)
return false;else
return!current_frame.last_event_true;};SysCnds.prototype.OnLoadFinished=function()
{return true;};SysCnds.prototype.OnCanvasSnapshot=function()
{return true;};SysCnds.prototype.EffectsSupported=function()
{return!!this.runtime.glwrap;};SysCnds.prototype.OnSaveComplete=function()
{return true;};SysCnds.prototype.OnSaveFailed=function()
{return true;};SysCnds.prototype.OnLoadComplete=function()
{return true;};SysCnds.prototype.OnLoadFailed=function()
{return true;};SysCnds.prototype.ObjectUIDExists=function(u)
{return!!this.runtime.getObjectByUID(u);};SysCnds.prototype.IsOnPlatform=function(p)
{var rt=this.runtime;switch(p){case 0:return!rt.isDomFree&&!rt.isNodeWebkit&&!rt.isCordova&&!rt.isWinJS&&!rt.isWindowsPhone8&&!rt.isBlackberry10&&!rt.isAmazonWebApp;case 1:return rt.isiOS;case 2:return rt.isAndroid;case 3:return rt.isWindows8App;case 4:return rt.isWindowsPhone8;case 5:return rt.isBlackberry10;case 6:return rt.isTizen;case 7:return rt.isCocoonJs;case 8:return rt.isCordova;case 9:return rt.isArcade;case 10:return rt.isNodeWebkit;case 11:return rt.isCrosswalk;case 12:return rt.isAmazonWebApp;case 13:return rt.isWindows10;default:return false;}};var cacheRegex=null;var lastRegex="";var lastFlags="";function getRegex(regex_,flags_)
{if(!cacheRegex||regex_!==lastRegex||flags_!==lastFlags)
{cacheRegex=new RegExp(regex_,flags_);lastRegex=regex_;lastFlags=flags_;}
cacheRegex.lastIndex=0;return cacheRegex;};SysCnds.prototype.RegexTest=function(str_,regex_,flags_)
{var regex=getRegex(regex_,flags_);return regex.test(str_);};var tmp_arr=[];SysCnds.prototype.PickOverlappingPoint=function(obj_,x_,y_)
{if(!obj_)
return false;var sol=obj_.getCurrentSol();var instances=sol.getObjects();var current_event=this.runtime.getCurrentEventStack().current_event;var orblock=current_event.orblock;var cnd=this.runtime.getCurrentCondition();var i,len,inst,pick;if(sol.select_all)
{cr.shallowAssignArray(tmp_arr,instances);cr.clearArray(sol.else_instances);sol.select_all=false;cr.clearArray(sol.instances);}
else
{if(orblock)
{cr.shallowAssignArray(tmp_arr,sol.else_instances);cr.clearArray(sol.else_instances);}
else
{cr.shallowAssignArray(tmp_arr,instances);cr.clearArray(sol.instances);}}
for(i=0,len=tmp_arr.length;i<len;++i)
{inst=tmp_arr[i];inst.update_bbox();pick=cr.xor(inst.contains_pt(x_,y_),cnd.inverted);if(pick)
sol.instances.push(inst);else
sol.else_instances.push(inst);}
obj_.applySolToContainer();return cr.xor(!!sol.instances.length,cnd.inverted);};SysCnds.prototype.IsNaN=function(n)
{return!!isNaN(n);};SysCnds.prototype.AngleWithin=function(a1,within,a2)
{return cr.angleDiff(cr.to_radians(a1),cr.to_radians(a2))<=cr.to_radians(within);};SysCnds.prototype.IsClockwiseFrom=function(a1,a2)
{return cr.angleClockwise(cr.to_radians(a1),cr.to_radians(a2));};SysCnds.prototype.IsBetweenAngles=function(a,la,ua)
{var angle=cr.to_clamped_radians(a);var lower=cr.to_clamped_radians(la);var upper=cr.to_clamped_radians(ua);var obtuse=(!cr.angleClockwise(upper,lower));if(obtuse)
return!(!cr.angleClockwise(angle,lower)&&cr.angleClockwise(angle,upper));else
return cr.angleClockwise(angle,lower)&&!cr.angleClockwise(angle,upper);};SysCnds.prototype.IsValueType=function(x,t)
{if(typeof x==="number")
return t===0;else
return t===1;};sysProto.cnds=new SysCnds();function SysActs(){};SysActs.prototype.GoToLayout=function(to)
{if(this.runtime.isloading)
return;if(this.runtime.changelayout)
return;;this.runtime.changelayout=to;};SysActs.prototype.NextPrevLayout=function(prev)
{if(this.runtime.isloading)
return;if(this.runtime.changelayout)
return;var index=this.runtime.layouts_by_index.indexOf(this.runtime.running_layout);if(prev&&index===0)
return;if(!prev&&index===this.runtime.layouts_by_index.length-1)
return;var to=this.runtime.layouts_by_index[index+(prev?-1:1)];;this.runtime.changelayout=to;};SysActs.prototype.CreateObject=function(obj,layer,x,y)
{if(!layer||!obj)
return;var inst=this.runtime.createInstance(obj,layer,x,y);if(!inst)
return;this.runtime.isInOnDestroy++;var i,len,s;this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated,inst);if(inst.is_contained)
{for(i=0,len=inst.siblings.length;i<len;i++)
{s=inst.siblings[i];this.runtime.trigger(Object.getPrototypeOf(s.type.plugin).cnds.OnCreated,s);}}
this.runtime.isInOnDestroy--;var sol=obj.getCurrentSol();sol.select_all=false;cr.clearArray(sol.instances);sol.instances[0]=inst;if(inst.is_contained)
{for(i=0,len=inst.siblings.length;i<len;i++)
{s=inst.siblings[i];sol=s.type.getCurrentSol();sol.select_all=false;cr.clearArray(sol.instances);sol.instances[0]=s;}}};SysActs.prototype.SetLayerVisible=function(layer,visible_)
{if(!layer)
return;if(layer.visible!==visible_)
{layer.visible=visible_;this.runtime.redraw=true;}};SysActs.prototype.SetLayerOpacity=function(layer,opacity_)
{if(!layer)
return;opacity_=cr.clamp(opacity_/100,0,1);if(layer.opacity!==opacity_)
{layer.opacity=opacity_;this.runtime.redraw=true;}};SysActs.prototype.SetLayerScaleRate=function(layer,sr)
{if(!layer)
return;if(layer.zoomRate!==sr)
{layer.zoomRate=sr;this.runtime.redraw=true;}};SysActs.prototype.SetLayerForceOwnTexture=function(layer,f)
{if(!layer)
return;f=!!f;if(layer.forceOwnTexture!==f)
{layer.forceOwnTexture=f;this.runtime.redraw=true;}};SysActs.prototype.SetLayoutScale=function(s)
{if(!this.runtime.running_layout)
return;if(this.runtime.running_layout.scale!==s)
{this.runtime.running_layout.scale=s;this.runtime.running_layout.boundScrolling();this.runtime.redraw=true;}};SysActs.prototype.ScrollX=function(x)
{this.runtime.running_layout.scrollToX(x);};SysActs.prototype.ScrollY=function(y)
{this.runtime.running_layout.scrollToY(y);};SysActs.prototype.Scroll=function(x,y)
{this.runtime.running_layout.scrollToX(x);this.runtime.running_layout.scrollToY(y);};SysActs.prototype.ScrollToObject=function(obj)
{var inst=obj.getFirstPicked();if(inst)
{this.runtime.running_layout.scrollToX(inst.x);this.runtime.running_layout.scrollToY(inst.y);}};SysActs.prototype.SetVar=function(v,x)
{;if(v.vartype===0)
{if(cr.is_number(x))
v.setValue(x);else
v.setValue(parseFloat(x));}
else if(v.vartype===1)
v.setValue(x.toString());};SysActs.prototype.AddVar=function(v,x)
{;if(v.vartype===0)
{if(cr.is_number(x))
v.setValue(v.getValue()+x);else
v.setValue(v.getValue()+parseFloat(x));}
else if(v.vartype===1)
v.setValue(v.getValue()+x.toString());};SysActs.prototype.SubVar=function(v,x)
{;if(v.vartype===0)
{if(cr.is_number(x))
v.setValue(v.getValue()-x);else
v.setValue(v.getValue()-parseFloat(x));}};SysActs.prototype.SetGroupActive=function(group,active)
{var g=this.runtime.groups_by_name[group.toLowerCase()];if(!g)
return;switch(active){case 0:g.setGroupActive(false);break;case 1:g.setGroupActive(true);break;case 2:g.setGroupActive(!g.group_active);break;}};SysActs.prototype.SetTimescale=function(ts_)
{var ts=ts_;if(ts<0)
ts=0;this.runtime.timescale=ts;};SysActs.prototype.SetObjectTimescale=function(obj,ts_)
{var ts=ts_;if(ts<0)
ts=0;if(!obj)
return;var sol=obj.getCurrentSol();var instances=sol.getObjects();var i,len;for(i=0,len=instances.length;i<len;i++)
{instances[i].my_timescale=ts;}};SysActs.prototype.RestoreObjectTimescale=function(obj)
{if(!obj)
return false;var sol=obj.getCurrentSol();var instances=sol.getObjects();var i,len;for(i=0,len=instances.length;i<len;i++)
{instances[i].my_timescale=-1.0;}};var waitobjrecycle=[];function allocWaitObject()
{var w;if(waitobjrecycle.length)
w=waitobjrecycle.pop();else
{w={};w.sols={};w.solModifiers=[];}
w.deleteme=false;return w;};function freeWaitObject(w)
{cr.wipe(w.sols);cr.clearArray(w.solModifiers);waitobjrecycle.push(w);};var solstateobjects=[];function allocSolStateObject()
{var s;if(solstateobjects.length)
s=solstateobjects.pop();else
{s={};s.insts=[];}
s.sa=false;return s;};function freeSolStateObject(s)
{cr.clearArray(s.insts);solstateobjects.push(s);};SysActs.prototype.Wait=function(seconds)
{if(seconds<0)
return;var i,len,s,t,ss;var evinfo=this.runtime.getCurrentEventStack();var waitobj=allocWaitObject();waitobj.time=this.runtime.kahanTime.sum+seconds;waitobj.signaltag="";waitobj.signalled=false;waitobj.ev=evinfo.current_event;waitobj.actindex=evinfo.actindex+1;for(i=0,len=this.runtime.types_by_index.length;i<len;i++)
{t=this.runtime.types_by_index[i];s=t.getCurrentSol();if(s.select_all&&evinfo.current_event.solModifiers.indexOf(t)===-1)
continue;waitobj.solModifiers.push(t);ss=allocSolStateObject();ss.sa=s.select_all;cr.shallowAssignArray(ss.insts,s.instances);waitobj.sols[i.toString()]=ss;}
this.waits.push(waitobj);return true;};SysActs.prototype.WaitForSignal=function(tag)
{var i,len,s,t,ss;var evinfo=this.runtime.getCurrentEventStack();var waitobj=allocWaitObject();waitobj.time=-1;waitobj.signaltag=tag.toLowerCase();waitobj.signalled=false;waitobj.ev=evinfo.current_event;waitobj.actindex=evinfo.actindex+1;for(i=0,len=this.runtime.types_by_index.length;i<len;i++)
{t=this.runtime.types_by_index[i];s=t.getCurrentSol();if(s.select_all&&evinfo.current_event.solModifiers.indexOf(t)===-1)
continue;waitobj.solModifiers.push(t);ss=allocSolStateObject();ss.sa=s.select_all;cr.shallowAssignArray(ss.insts,s.instances);waitobj.sols[i.toString()]=ss;}
this.waits.push(waitobj);return true;};SysActs.prototype.Signal=function(tag)
{var lowertag=tag.toLowerCase();var i,len,w;for(i=0,len=this.waits.length;i<len;++i)
{w=this.waits[i];if(w.time!==-1)
continue;if(w.signaltag===lowertag)
w.signalled=true;}};SysActs.prototype.SetLayerScale=function(layer,scale)
{if(!layer)
return;if(layer.scale===scale)
return;layer.scale=scale;this.runtime.redraw=true;};SysActs.prototype.ResetGlobals=function()
{var i,len,g;for(i=0,len=this.runtime.all_global_vars.length;i<len;i++)
{g=this.runtime.all_global_vars[i];g.data=g.initial;}};SysActs.prototype.SetLayoutAngle=function(a)
{a=cr.to_radians(a);a=cr.clamp_angle(a);if(this.runtime.running_layout)
{if(this.runtime.running_layout.angle!==a)
{this.runtime.running_layout.angle=a;this.runtime.redraw=true;}}};SysActs.prototype.SetLayerAngle=function(layer,a)
{if(!layer)
return;a=cr.to_radians(a);a=cr.clamp_angle(a);if(layer.angle===a)
return;layer.angle=a;this.runtime.redraw=true;};SysActs.prototype.SetLayerParallax=function(layer,px,py)
{if(!layer)
return;if(layer.parallaxX===px/100&&layer.parallaxY===py/100)
return;layer.parallaxX=px/100;layer.parallaxY=py/100;if(layer.parallaxX!==1||layer.parallaxY!==1)
{var i,len,instances=layer.instances;for(i=0,len=instances.length;i<len;++i)
{instances[i].type.any_instance_parallaxed=true;}}
this.runtime.redraw=true;};SysActs.prototype.SetLayerBackground=function(layer,c)
{if(!layer)
return;var r=cr.GetRValue(c);var g=cr.GetGValue(c);var b=cr.GetBValue(c);if(layer.background_color[0]===r&&layer.background_color[1]===g&&layer.background_color[2]===b)
return;layer.background_color[0]=r;layer.background_color[1]=g;layer.background_color[2]=b;this.runtime.redraw=true;};SysActs.prototype.SetLayerTransparent=function(layer,t)
{if(!layer)
return;if(!!t===!!layer.transparent)
return;layer.transparent=!!t;this.runtime.redraw=true;};SysActs.prototype.SetLayerBlendMode=function(layer,bm)
{if(!layer)
return;if(layer.blend_mode===bm)
return;layer.blend_mode=bm;layer.compositeOp=cr.effectToCompositeOp(layer.blend_mode);if(this.runtime.gl)
cr.setGLBlend(layer,layer.blend_mode,this.runtime.gl);this.runtime.redraw=true;};SysActs.prototype.StopLoop=function()
{if(this.runtime.loop_stack_index<0)
return;this.runtime.getCurrentLoop().stopped=true;};SysActs.prototype.GoToLayoutByName=function(layoutname)
{if(this.runtime.isloading)
return;if(this.runtime.changelayout)
return;;var l;for(l in this.runtime.layouts)
{if(this.runtime.layouts.hasOwnProperty(l)&&cr.equals_nocase(l,layoutname))
{this.runtime.changelayout=this.runtime.layouts[l];return;}}};SysActs.prototype.RestartLayout=function(layoutname)
{if(this.runtime.isloading)
return;if(this.runtime.changelayout)
return;;if(!this.runtime.running_layout)
return;this.runtime.changelayout=this.runtime.running_layout;var i,len,g;for(i=0,len=this.runtime.allGroups.length;i<len;i++)
{g=this.runtime.allGroups[i];g.setGroupActive(g.initially_activated);}};SysActs.prototype.SnapshotCanvas=function(format_,quality_)
{this.runtime.doCanvasSnapshot(format_===0?"image/png":"image/jpeg",quality_/100);};SysActs.prototype.SetCanvasSize=function(w,h)
{if(w<=0||h<=0)
return;var mode=this.runtime.fullscreen_mode;var isfullscreen=(document["mozFullScreen"]||document["webkitIsFullScreen"]||!!document["msFullscreenElement"]||document["fullScreen"]||this.runtime.isNodeFullscreen);if(isfullscreen&&this.runtime.fullscreen_scaling>0)
mode=this.runtime.fullscreen_scaling;if(mode===0)
{this.runtime["setSize"](w,h,true);}
else
{this.runtime.original_width=w;this.runtime.original_height=h;this.runtime["setSize"](this.runtime.lastWindowWidth,this.runtime.lastWindowHeight,true);}};SysActs.prototype.SetLayoutEffectEnabled=function(enable_,effectname_)
{if(!this.runtime.running_layout||!this.runtime.glwrap)
return;var et=this.runtime.running_layout.getEffectByName(effectname_);if(!et)
return;var enable=(enable_===1);if(et.active==enable)
return;et.active=enable;this.runtime.running_layout.updateActiveEffects();this.runtime.redraw=true;};SysActs.prototype.SetLayerEffectEnabled=function(layer,enable_,effectname_)
{if(!layer||!this.runtime.glwrap)
return;var et=layer.getEffectByName(effectname_);if(!et)
return;var enable=(enable_===1);if(et.active==enable)
return;et.active=enable;layer.updateActiveEffects();this.runtime.redraw=true;};SysActs.prototype.SetLayoutEffectParam=function(effectname_,index_,value_)
{if(!this.runtime.running_layout||!this.runtime.glwrap)
return;var et=this.runtime.running_layout.getEffectByName(effectname_);if(!et)
return;var params=this.runtime.running_layout.effect_params[et.index];index_=Math.floor(index_);if(index_<0||index_>=params.length)
return;if(this.runtime.glwrap.getProgramParameterType(et.shaderindex,index_)===1)
value_/=100.0;if(params[index_]===value_)
return;params[index_]=value_;if(et.active)
this.runtime.redraw=true;};SysActs.prototype.SetLayerEffectParam=function(layer,effectname_,index_,value_)
{if(!layer||!this.runtime.glwrap)
return;var et=layer.getEffectByName(effectname_);if(!et)
return;var params=layer.effect_params[et.index];index_=Math.floor(index_);if(index_<0||index_>=params.length)
return;if(this.runtime.glwrap.getProgramParameterType(et.shaderindex,index_)===1)
value_/=100.0;if(params[index_]===value_)
return;params[index_]=value_;if(et.active)
this.runtime.redraw=true;};SysActs.prototype.SaveState=function(slot_)
{this.runtime.saveToSlot=slot_;};SysActs.prototype.LoadState=function(slot_)
{this.runtime.loadFromSlot=slot_;};SysActs.prototype.LoadStateJSON=function(jsonstr_)
{this.runtime.loadFromJson=jsonstr_;};SysActs.prototype.SetHalfFramerateMode=function(set_)
{this.runtime.halfFramerateMode=(set_!==0);};SysActs.prototype.SetFullscreenQuality=function(q)
{var isfullscreen=(document["mozFullScreen"]||document["webkitIsFullScreen"]||!!document["msFullscreenElement"]||document["fullScreen"]||this.isNodeFullscreen);if(!isfullscreen&&this.runtime.fullscreen_mode===0)
return;this.runtime.wantFullscreenScalingQuality=(q!==0);this.runtime["setSize"](this.runtime.lastWindowWidth,this.runtime.lastWindowHeight,true);};SysActs.prototype.ResetPersisted=function()
{var i,len;for(i=0,len=this.runtime.layouts_by_index.length;i<len;++i)
{this.runtime.layouts_by_index[i].persist_data={};this.runtime.layouts_by_index[i].first_visit=true;}};SysActs.prototype.RecreateInitialObjects=function(obj,x1,y1,x2,y2)
{if(!obj)
return;this.runtime.running_layout.recreateInitialObjects(obj,x1,y1,x2,y2);};SysActs.prototype.SetPixelRounding=function(m)
{this.runtime.pixel_rounding=(m!==0);this.runtime.redraw=true;};SysActs.prototype.SetMinimumFramerate=function(f)
{if(f<1)
f=1;if(f>120)
f=120;this.runtime.minimumFramerate=f;};function SortZOrderList(a,b)
{var layerA=a[0];var layerB=b[0];var diff=layerA-layerB;if(diff!==0)
return diff;var indexA=a[1];var indexB=b[1];return indexA-indexB;};function SortInstancesByValue(a,b)
{return a[1]-b[1];};SysActs.prototype.SortZOrderByInstVar=function(obj,iv)
{if(!obj)
return;var i,len,inst,value,r,layer,toZ;var sol=obj.getCurrentSol();var pickedInstances=sol.getObjects();var zOrderList=[];var instValues=[];var layout=this.runtime.running_layout;var isFamily=obj.is_family;var familyIndex=obj.family_index;for(i=0,len=pickedInstances.length;i<len;++i)
{inst=pickedInstances[i];if(!inst.layer)
continue;if(isFamily)
value=inst.instance_vars[iv+inst.type.family_var_map[familyIndex]];else
value=inst.instance_vars[iv];zOrderList.push([inst.layer.index,inst.get_zindex()]);instValues.push([inst,value]);}
if(!zOrderList.length)
return;zOrderList.sort(SortZOrderList);instValues.sort(SortInstancesByValue);for(i=0,len=zOrderList.length;i<len;++i)
{inst=instValues[i][0];layer=layout.layers[zOrderList[i][0]];toZ=zOrderList[i][1];if(layer.instances[toZ]!==inst)
{layer.instances[toZ]=inst;inst.layer=layer;layer.setZIndicesStaleFrom(toZ);}}};sysProto.acts=new SysActs();function SysExps(){};SysExps.prototype["int"]=function(ret,x)
{if(cr.is_string(x))
{ret.set_int(parseInt(x,10));if(isNaN(ret.data))
ret.data=0;}
else
ret.set_int(x);};SysExps.prototype["float"]=function(ret,x)
{if(cr.is_string(x))
{ret.set_float(parseFloat(x));if(isNaN(ret.data))
ret.data=0;}
else
ret.set_float(x);};SysExps.prototype.str=function(ret,x)
{if(cr.is_string(x))
ret.set_string(x);else
ret.set_string(x.toString());};SysExps.prototype.len=function(ret,x)
{ret.set_int(x.length||0);};SysExps.prototype.random=function(ret,a,b)
{if(b===undefined)
{ret.set_float(Math.random()*a);}
else
{ret.set_float(Math.random()*(b-a)+a);}};SysExps.prototype.sqrt=function(ret,x)
{ret.set_float(Math.sqrt(x));};SysExps.prototype.abs=function(ret,x)
{ret.set_float(Math.abs(x));};SysExps.prototype.round=function(ret,x)
{ret.set_int(Math.round(x));};SysExps.prototype.floor=function(ret,x)
{ret.set_int(Math.floor(x));};SysExps.prototype.ceil=function(ret,x)
{ret.set_int(Math.ceil(x));};SysExps.prototype.sin=function(ret,x)
{ret.set_float(Math.sin(cr.to_radians(x)));};SysExps.prototype.cos=function(ret,x)
{ret.set_float(Math.cos(cr.to_radians(x)));};SysExps.prototype.tan=function(ret,x)
{ret.set_float(Math.tan(cr.to_radians(x)));};SysExps.prototype.asin=function(ret,x)
{ret.set_float(cr.to_degrees(Math.asin(x)));};SysExps.prototype.acos=function(ret,x)
{ret.set_float(cr.to_degrees(Math.acos(x)));};SysExps.prototype.atan=function(ret,x)
{ret.set_float(cr.to_degrees(Math.atan(x)));};SysExps.prototype.exp=function(ret,x)
{ret.set_float(Math.exp(x));};SysExps.prototype.ln=function(ret,x)
{ret.set_float(Math.log(x));};SysExps.prototype.log10=function(ret,x)
{ret.set_float(Math.log(x)/Math.LN10);};SysExps.prototype.max=function(ret)
{var max_=arguments[1];if(typeof max_!=="number")
max_=0;var i,len,a;for(i=2,len=arguments.length;i<len;i++)
{a=arguments[i];if(typeof a!=="number")
continue;if(max_<a)
max_=a;}
ret.set_float(max_);};SysExps.prototype.min=function(ret)
{var min_=arguments[1];if(typeof min_!=="number")
min_=0;var i,len,a;for(i=2,len=arguments.length;i<len;i++)
{a=arguments[i];if(typeof a!=="number")
continue;if(min_>a)
min_=a;}
ret.set_float(min_);};SysExps.prototype.dt=function(ret)
{ret.set_float(this.runtime.dt);};SysExps.prototype.timescale=function(ret)
{ret.set_float(this.runtime.timescale);};SysExps.prototype.wallclocktime=function(ret)
{ret.set_float((Date.now()-this.runtime.start_time)/1000.0);};SysExps.prototype.time=function(ret)
{ret.set_float(this.runtime.kahanTime.sum);};SysExps.prototype.tickcount=function(ret)
{ret.set_int(this.runtime.tickcount);};SysExps.prototype.objectcount=function(ret)
{ret.set_int(this.runtime.objectcount);};SysExps.prototype.fps=function(ret)
{ret.set_int(this.runtime.fps);};SysExps.prototype.loopindex=function(ret,name_)
{var loop,i,len;if(!this.runtime.loop_stack.length)
{ret.set_int(0);return;}
if(name_)
{for(i=this.runtime.loop_stack_index;i>=0;--i)
{loop=this.runtime.loop_stack[i];if(loop.name===name_)
{ret.set_int(loop.index);return;}}
ret.set_int(0);}
else
{loop=this.runtime.getCurrentLoop();ret.set_int(loop?loop.index:-1);}};SysExps.prototype.distance=function(ret,x1,y1,x2,y2)
{ret.set_float(cr.distanceTo(x1,y1,x2,y2));};SysExps.prototype.angle=function(ret,x1,y1,x2,y2)
{ret.set_float(cr.to_degrees(cr.angleTo(x1,y1,x2,y2)));};SysExps.prototype.scrollx=function(ret)
{ret.set_float(this.runtime.running_layout.scrollX);};SysExps.prototype.scrolly=function(ret)
{ret.set_float(this.runtime.running_layout.scrollY);};SysExps.prototype.newline=function(ret)
{ret.set_string("\n");};SysExps.prototype.lerp=function(ret,a,b,x)
{ret.set_float(cr.lerp(a,b,x));};SysExps.prototype.qarp=function(ret,a,b,c,x)
{ret.set_float(cr.qarp(a,b,c,x));};SysExps.prototype.cubic=function(ret,a,b,c,d,x)
{ret.set_float(cr.cubic(a,b,c,d,x));};SysExps.prototype.cosp=function(ret,a,b,x)
{ret.set_float(cr.cosp(a,b,x));};SysExps.prototype.windowwidth=function(ret)
{ret.set_int(this.runtime.width);};SysExps.prototype.windowheight=function(ret)
{ret.set_int(this.runtime.height);};SysExps.prototype.uppercase=function(ret,str)
{ret.set_string(cr.is_string(str)?str.toUpperCase():"");};SysExps.prototype.lowercase=function(ret,str)
{ret.set_string(cr.is_string(str)?str.toLowerCase():"");};SysExps.prototype.clamp=function(ret,x,l,u)
{if(x<l)
ret.set_float(l);else if(x>u)
ret.set_float(u);else
ret.set_float(x);};SysExps.prototype.layerscale=function(ret,layerparam)
{var layer=this.runtime.getLayer(layerparam);if(!layer)
ret.set_float(0);else
ret.set_float(layer.scale);};SysExps.prototype.layeropacity=function(ret,layerparam)
{var layer=this.runtime.getLayer(layerparam);if(!layer)
ret.set_float(0);else
ret.set_float(layer.opacity*100);};SysExps.prototype.layerscalerate=function(ret,layerparam)
{var layer=this.runtime.getLayer(layerparam);if(!layer)
ret.set_float(0);else
ret.set_float(layer.zoomRate);};SysExps.prototype.layerparallaxx=function(ret,layerparam)
{var layer=this.runtime.getLayer(layerparam);if(!layer)
ret.set_float(0);else
ret.set_float(layer.parallaxX*100);};SysExps.prototype.layerparallaxy=function(ret,layerparam)
{var layer=this.runtime.getLayer(layerparam);if(!layer)
ret.set_float(0);else
ret.set_float(layer.parallaxY*100);};SysExps.prototype.layerindex=function(ret,layerparam)
{var layer=this.runtime.getLayer(layerparam);if(!layer)
ret.set_int(-1);else
ret.set_int(layer.index);};SysExps.prototype.layoutscale=function(ret)
{if(this.runtime.running_layout)
ret.set_float(this.runtime.running_layout.scale);else
ret.set_float(0);};SysExps.prototype.layoutangle=function(ret)
{ret.set_float(cr.to_degrees(this.runtime.running_layout.angle));};SysExps.prototype.layerangle=function(ret,layerparam)
{var layer=this.runtime.getLayer(layerparam);if(!layer)
ret.set_float(0);else
ret.set_float(cr.to_degrees(layer.angle));};SysExps.prototype.layoutwidth=function(ret)
{ret.set_int(this.runtime.running_layout.width);};SysExps.prototype.layoutheight=function(ret)
{ret.set_int(this.runtime.running_layout.height);};SysExps.prototype.find=function(ret,text,searchstr)
{if(cr.is_string(text)&&cr.is_string(searchstr))
ret.set_int(text.search(new RegExp(cr.regexp_escape(searchstr),"i")));else
ret.set_int(-1);};SysExps.prototype.findcase=function(ret,text,searchstr)
{if(cr.is_string(text)&&cr.is_string(searchstr))
ret.set_int(text.search(new RegExp(cr.regexp_escape(searchstr),"")));else
ret.set_int(-1);};SysExps.prototype.left=function(ret,text,n)
{ret.set_string(cr.is_string(text)?text.substr(0,n):"");};SysExps.prototype.right=function(ret,text,n)
{ret.set_string(cr.is_string(text)?text.substr(text.length-n):"");};SysExps.prototype.mid=function(ret,text,index_,length_)
{ret.set_string(cr.is_string(text)?text.substr(index_,length_):"");};SysExps.prototype.tokenat=function(ret,text,index_,sep)
{if(cr.is_string(text)&&cr.is_string(sep))
{var arr=text.split(sep);var i=cr.floor(index_);if(i<0||i>=arr.length)
ret.set_string("");else
ret.set_string(arr[i]);}
else
ret.set_string("");};SysExps.prototype.tokencount=function(ret,text,sep)
{if(cr.is_string(text)&&text.length)
ret.set_int(text.split(sep).length);else
ret.set_int(0);};SysExps.prototype.replace=function(ret,text,find_,replace_)
{if(cr.is_string(text)&&cr.is_string(find_)&&cr.is_string(replace_))
ret.set_string(text.replace(new RegExp(cr.regexp_escape(find_),"gi"),replace_));else
ret.set_string(cr.is_string(text)?text:"");};SysExps.prototype.trim=function(ret,text)
{ret.set_string(cr.is_string(text)?text.trim():"");};SysExps.prototype.pi=function(ret)
{ret.set_float(cr.PI);};SysExps.prototype.layoutname=function(ret)
{if(this.runtime.running_layout)
ret.set_string(this.runtime.running_layout.name);else
ret.set_string("");};SysExps.prototype.renderer=function(ret)
{ret.set_string(this.runtime.gl?"webgl":"canvas2d");};SysExps.prototype.rendererdetail=function(ret)
{ret.set_string(this.runtime.glUnmaskedRenderer);};SysExps.prototype.anglediff=function(ret,a,b)
{ret.set_float(cr.to_degrees(cr.angleDiff(cr.to_radians(a),cr.to_radians(b))));};SysExps.prototype.choose=function(ret)
{var index=cr.floor(Math.random()*(arguments.length-1));ret.set_any(arguments[index+1]);};SysExps.prototype.rgb=function(ret,r,g,b)
{ret.set_int(cr.RGB(r,g,b));};SysExps.prototype.projectversion=function(ret)
{ret.set_string(this.runtime.versionstr);};SysExps.prototype.projectname=function(ret)
{ret.set_string(this.runtime.projectName);};SysExps.prototype.anglelerp=function(ret,a,b,x)
{a=cr.to_radians(a);b=cr.to_radians(b);var diff=cr.angleDiff(a,b);if(cr.angleClockwise(b,a))
{ret.set_float(cr.to_clamped_degrees(a+diff*x));}
else
{ret.set_float(cr.to_clamped_degrees(a-diff*x));}};SysExps.prototype.anglerotate=function(ret,a,b,c)
{a=cr.to_radians(a);b=cr.to_radians(b);c=cr.to_radians(c);ret.set_float(cr.to_clamped_degrees(cr.angleRotate(a,b,c)));};SysExps.prototype.zeropad=function(ret,n,d)
{var s=(n<0?"-":"");if(n<0)n=-n;var zeroes=d-n.toString().length;for(var i=0;i<zeroes;i++)
s+="0";ret.set_string(s+n.toString());};SysExps.prototype.cpuutilisation=function(ret)
{ret.set_float(this.runtime.cpuutilisation/1000);};SysExps.prototype.viewportleft=function(ret,layerparam)
{var layer=this.runtime.getLayer(layerparam);ret.set_float(layer?layer.viewLeft:0);};SysExps.prototype.viewporttop=function(ret,layerparam)
{var layer=this.runtime.getLayer(layerparam);ret.set_float(layer?layer.viewTop:0);};SysExps.prototype.viewportright=function(ret,layerparam)
{var layer=this.runtime.getLayer(layerparam);ret.set_float(layer?layer.viewRight:0);};SysExps.prototype.viewportbottom=function(ret,layerparam)
{var layer=this.runtime.getLayer(layerparam);ret.set_float(layer?layer.viewBottom:0);};SysExps.prototype.loadingprogress=function(ret)
{ret.set_float(this.runtime.loadingprogress);};SysExps.prototype.unlerp=function(ret,a,b,y)
{ret.set_float(cr.unlerp(a,b,y));};SysExps.prototype.canvassnapshot=function(ret)
{ret.set_string(this.runtime.snapshotData);};SysExps.prototype.urlencode=function(ret,s)
{ret.set_string(encodeURIComponent(s));};SysExps.prototype.urldecode=function(ret,s)
{ret.set_string(decodeURIComponent(s));};SysExps.prototype.canvastolayerx=function(ret,layerparam,x,y)
{var layer=this.runtime.getLayer(layerparam);ret.set_float(layer?layer.canvasToLayer(x,y,true):0);};SysExps.prototype.canvastolayery=function(ret,layerparam,x,y)
{var layer=this.runtime.getLayer(layerparam);ret.set_float(layer?layer.canvasToLayer(x,y,false):0);};SysExps.prototype.layertocanvasx=function(ret,layerparam,x,y)
{var layer=this.runtime.getLayer(layerparam);ret.set_float(layer?layer.layerToCanvas(x,y,true):0);};SysExps.prototype.layertocanvasy=function(ret,layerparam,x,y)
{var layer=this.runtime.getLayer(layerparam);ret.set_float(layer?layer.layerToCanvas(x,y,false):0);};SysExps.prototype.savestatejson=function(ret)
{ret.set_string(this.runtime.lastSaveJson);};SysExps.prototype.imagememoryusage=function(ret)
{if(this.runtime.glwrap)
ret.set_float(Math.round(100*this.runtime.glwrap.estimateVRAM()/(1024*1024))/100);else
ret.set_float(0);};SysExps.prototype.regexsearch=function(ret,str_,regex_,flags_)
{var regex=getRegex(regex_,flags_);ret.set_int(str_?str_.search(regex):-1);};SysExps.prototype.regexreplace=function(ret,str_,regex_,flags_,replace_)
{var regex=getRegex(regex_,flags_);ret.set_string(str_?str_.replace(regex,replace_):"");};var regexMatches=[];var lastMatchesStr="";var lastMatchesRegex="";var lastMatchesFlags="";function updateRegexMatches(str_,regex_,flags_)
{if(str_===lastMatchesStr&&regex_===lastMatchesRegex&&flags_===lastMatchesFlags)
return;var regex=getRegex(regex_,flags_);regexMatches=str_.match(regex);lastMatchesStr=str_;lastMatchesRegex=regex_;lastMatchesFlags=flags_;};SysExps.prototype.regexmatchcount=function(ret,str_,regex_,flags_)
{var regex=getRegex(regex_,flags_);updateRegexMatches(str_.toString(),regex_,flags_);ret.set_int(regexMatches?regexMatches.length:0);};SysExps.prototype.regexmatchat=function(ret,str_,regex_,flags_,index_)
{index_=Math.floor(index_);var regex=getRegex(regex_,flags_);updateRegexMatches(str_.toString(),regex_,flags_);if(!regexMatches||index_<0||index_>=regexMatches.length)
ret.set_string("");else
ret.set_string(regexMatches[index_]);};SysExps.prototype.infinity=function(ret)
{ret.set_float(Infinity);};SysExps.prototype.setbit=function(ret,n,b,v)
{n=n|0;b=b|0;v=(v!==0?1:0);ret.set_int((n&~(1<<b))|(v<<b));};SysExps.prototype.togglebit=function(ret,n,b)
{n=n|0;b=b|0;ret.set_int(n^(1<<b));};SysExps.prototype.getbit=function(ret,n,b)
{n=n|0;b=b|0;ret.set_int((n&(1<<b))?1:0);};SysExps.prototype.originalwindowwidth=function(ret)
{ret.set_int(this.runtime.original_width);};SysExps.prototype.originalwindowheight=function(ret)
{ret.set_int(this.runtime.original_height);};sysProto.exps=new SysExps();sysProto.runWaits=function()
{var i,j,len,w,k,s,ss;var evinfo=this.runtime.getCurrentEventStack();for(i=0,len=this.waits.length;i<len;i++)
{w=this.waits[i];if(w.time===-1)
{if(!w.signalled)
continue;}
else
{if(w.time>this.runtime.kahanTime.sum)
continue;}
evinfo.current_event=w.ev;evinfo.actindex=w.actindex;evinfo.cndindex=0;for(k in w.sols)
{if(w.sols.hasOwnProperty(k))
{s=this.runtime.types_by_index[parseInt(k,10)].getCurrentSol();ss=w.sols[k];s.select_all=ss.sa;cr.shallowAssignArray(s.instances,ss.insts);freeSolStateObject(ss);}}
w.ev.resume_actions_and_subevents();this.runtime.clearSol(w.solModifiers);w.deleteme=true;}
for(i=0,j=0,len=this.waits.length;i<len;i++)
{w=this.waits[i];this.waits[j]=w;if(w.deleteme)
freeWaitObject(w);else
j++;}
cr.truncateArray(this.waits,j);};}());;(function(){cr.add_common_aces=function(m,pluginProto)
{var singleglobal_=m[1];var position_aces=m[3];var size_aces=m[4];var angle_aces=m[5];var appearance_aces=m[6];var zorder_aces=m[7];var effects_aces=m[8];if(!pluginProto.cnds)
pluginProto.cnds={};if(!pluginProto.acts)
pluginProto.acts={};if(!pluginProto.exps)
pluginProto.exps={};var cnds=pluginProto.cnds;var acts=pluginProto.acts;var exps=pluginProto.exps;if(position_aces)
{cnds.CompareX=function(cmp,x)
{return cr.do_cmp(this.x,cmp,x);};cnds.CompareY=function(cmp,y)
{return cr.do_cmp(this.y,cmp,y);};cnds.IsOnScreen=function()
{var layer=this.layer;this.update_bbox();var bbox=this.bbox;return!(bbox.right<layer.viewLeft||bbox.bottom<layer.viewTop||bbox.left>layer.viewRight||bbox.top>layer.viewBottom);};cnds.IsOutsideLayout=function()
{this.update_bbox();var bbox=this.bbox;var layout=this.runtime.running_layout;return(bbox.right<0||bbox.bottom<0||bbox.left>layout.width||bbox.top>layout.height);};cnds.PickDistance=function(which,x,y)
{var sol=this.getCurrentSol();var instances=sol.getObjects();if(!instances.length)
return false;var inst=instances[0];var pickme=inst;var dist=cr.distanceTo(inst.x,inst.y,x,y);var i,len,d;for(i=1,len=instances.length;i<len;i++)
{inst=instances[i];d=cr.distanceTo(inst.x,inst.y,x,y);if((which===0&&d<dist)||(which===1&&d>dist))
{dist=d;pickme=inst;}}
sol.pick_one(pickme);return true;};acts.SetX=function(x)
{if(this.x!==x)
{this.x=x;this.set_bbox_changed();}};acts.SetY=function(y)
{if(this.y!==y)
{this.y=y;this.set_bbox_changed();}};acts.SetPos=function(x,y)
{if(this.x!==x||this.y!==y)
{this.x=x;this.y=y;this.set_bbox_changed();}};acts.SetPosToObject=function(obj,imgpt)
{var inst=obj.getPairedInstance(this);if(!inst)
return;var newx,newy;if(inst.getImagePoint)
{newx=inst.getImagePoint(imgpt,true);newy=inst.getImagePoint(imgpt,false);}
else
{newx=inst.x;newy=inst.y;}
if(this.x!==newx||this.y!==newy)
{this.x=newx;this.y=newy;this.set_bbox_changed();}};acts.MoveForward=function(dist)
{if(dist!==0)
{this.x+=Math.cos(this.angle)*dist;this.y+=Math.sin(this.angle)*dist;this.set_bbox_changed();}};acts.MoveAtAngle=function(a,dist)
{if(dist!==0)
{this.x+=Math.cos(cr.to_radians(a))*dist;this.y+=Math.sin(cr.to_radians(a))*dist;this.set_bbox_changed();}};exps.X=function(ret)
{ret.set_float(this.x);};exps.Y=function(ret)
{ret.set_float(this.y);};exps.dt=function(ret)
{ret.set_float(this.runtime.getDt(this));};}
if(size_aces)
{cnds.CompareWidth=function(cmp,w)
{return cr.do_cmp(this.width,cmp,w);};cnds.CompareHeight=function(cmp,h)
{return cr.do_cmp(this.height,cmp,h);};acts.SetWidth=function(w)
{if(this.width!==w)
{this.width=w;this.set_bbox_changed();}};acts.SetHeight=function(h)
{if(this.height!==h)
{this.height=h;this.set_bbox_changed();}};acts.SetSize=function(w,h)
{if(this.width!==w||this.height!==h)
{this.width=w;this.height=h;this.set_bbox_changed();}};exps.Width=function(ret)
{ret.set_float(this.width);};exps.Height=function(ret)
{ret.set_float(this.height);};exps.BBoxLeft=function(ret)
{this.update_bbox();ret.set_float(this.bbox.left);};exps.BBoxTop=function(ret)
{this.update_bbox();ret.set_float(this.bbox.top);};exps.BBoxRight=function(ret)
{this.update_bbox();ret.set_float(this.bbox.right);};exps.BBoxBottom=function(ret)
{this.update_bbox();ret.set_float(this.bbox.bottom);};}
if(angle_aces)
{cnds.AngleWithin=function(within,a)
{return cr.angleDiff(this.angle,cr.to_radians(a))<=cr.to_radians(within);};cnds.IsClockwiseFrom=function(a)
{return cr.angleClockwise(this.angle,cr.to_radians(a));};cnds.IsBetweenAngles=function(a,b)
{var lower=cr.to_clamped_radians(a);var upper=cr.to_clamped_radians(b);var angle=cr.clamp_angle(this.angle);var obtuse=(!cr.angleClockwise(upper,lower));if(obtuse)
return!(!cr.angleClockwise(angle,lower)&&cr.angleClockwise(angle,upper));else
return cr.angleClockwise(angle,lower)&&!cr.angleClockwise(angle,upper);};acts.SetAngle=function(a)
{var newangle=cr.to_radians(cr.clamp_angle_degrees(a));if(isNaN(newangle))
return;if(this.angle!==newangle)
{this.angle=newangle;this.set_bbox_changed();}};acts.RotateClockwise=function(a)
{if(a!==0&&!isNaN(a))
{this.angle+=cr.to_radians(a);this.angle=cr.clamp_angle(this.angle);this.set_bbox_changed();}};acts.RotateCounterclockwise=function(a)
{if(a!==0&&!isNaN(a))
{this.angle-=cr.to_radians(a);this.angle=cr.clamp_angle(this.angle);this.set_bbox_changed();}};acts.RotateTowardAngle=function(amt,target)
{var newangle=cr.angleRotate(this.angle,cr.to_radians(target),cr.to_radians(amt));if(isNaN(newangle))
return;if(this.angle!==newangle)
{this.angle=newangle;this.set_bbox_changed();}};acts.RotateTowardPosition=function(amt,x,y)
{var dx=x-this.x;var dy=y-this.y;var target=Math.atan2(dy,dx);var newangle=cr.angleRotate(this.angle,target,cr.to_radians(amt));if(isNaN(newangle))
return;if(this.angle!==newangle)
{this.angle=newangle;this.set_bbox_changed();}};acts.SetTowardPosition=function(x,y)
{var dx=x-this.x;var dy=y-this.y;var newangle=Math.atan2(dy,dx);if(isNaN(newangle))
return;if(this.angle!==newangle)
{this.angle=newangle;this.set_bbox_changed();}};exps.Angle=function(ret)
{ret.set_float(cr.to_clamped_degrees(this.angle));};}
if(!singleglobal_)
{cnds.CompareInstanceVar=function(iv,cmp,val)
{return cr.do_cmp(this.instance_vars[iv],cmp,val);};cnds.IsBoolInstanceVarSet=function(iv)
{return this.instance_vars[iv];};cnds.PickInstVarHiLow=function(which,iv)
{var sol=this.getCurrentSol();var instances=sol.getObjects();if(!instances.length)
return false;var inst=instances[0];var pickme=inst;var val=inst.instance_vars[iv];var i,len,v;for(i=1,len=instances.length;i<len;i++)
{inst=instances[i];v=inst.instance_vars[iv];if((which===0&&v<val)||(which===1&&v>val))
{val=v;pickme=inst;}}
sol.pick_one(pickme);return true;};cnds.PickByUID=function(u)
{var i,len,j,inst,families,instances,sol;var cnd=this.runtime.getCurrentCondition();if(cnd.inverted)
{sol=this.getCurrentSol();if(sol.select_all)
{sol.select_all=false;cr.clearArray(sol.instances);cr.clearArray(sol.else_instances);instances=this.instances;for(i=0,len=instances.length;i<len;i++)
{inst=instances[i];if(inst.uid===u)
sol.else_instances.push(inst);else
sol.instances.push(inst);}
this.applySolToContainer();return!!sol.instances.length;}
else
{for(i=0,j=0,len=sol.instances.length;i<len;i++)
{inst=sol.instances[i];sol.instances[j]=inst;if(inst.uid===u)
{sol.else_instances.push(inst);}
else
j++;}
cr.truncateArray(sol.instances,j);this.applySolToContainer();return!!sol.instances.length;}}
else
{inst=this.runtime.getObjectByUID(u);if(!inst)
return false;sol=this.getCurrentSol();if(!sol.select_all&&sol.instances.indexOf(inst)===-1)
return false;if(this.is_family)
{families=inst.type.families;for(i=0,len=families.length;i<len;i++)
{if(families[i]===this)
{sol.pick_one(inst);this.applySolToContainer();return true;}}}
else if(inst.type===this)
{sol.pick_one(inst);this.applySolToContainer();return true;}
return false;}};cnds.OnCreated=function()
{return true;};cnds.OnDestroyed=function()
{return true;};acts.SetInstanceVar=function(iv,val)
{var myinstvars=this.instance_vars;if(cr.is_number(myinstvars[iv]))
{if(cr.is_number(val))
myinstvars[iv]=val;else
myinstvars[iv]=parseFloat(val);}
else if(cr.is_string(myinstvars[iv]))
{if(cr.is_string(val))
myinstvars[iv]=val;else
myinstvars[iv]=val.toString();}
else;};acts.AddInstanceVar=function(iv,val)
{var myinstvars=this.instance_vars;if(cr.is_number(myinstvars[iv]))
{if(cr.is_number(val))
myinstvars[iv]+=val;else
myinstvars[iv]+=parseFloat(val);}
else if(cr.is_string(myinstvars[iv]))
{if(cr.is_string(val))
myinstvars[iv]+=val;else
myinstvars[iv]+=val.toString();}
else;};acts.SubInstanceVar=function(iv,val)
{var myinstvars=this.instance_vars;if(cr.is_number(myinstvars[iv]))
{if(cr.is_number(val))
myinstvars[iv]-=val;else
myinstvars[iv]-=parseFloat(val);}
else;};acts.SetBoolInstanceVar=function(iv,val)
{this.instance_vars[iv]=val?1:0;};acts.ToggleBoolInstanceVar=function(iv)
{this.instance_vars[iv]=1-this.instance_vars[iv];};acts.Destroy=function()
{this.runtime.DestroyInstance(this);};if(!acts.LoadFromJsonString)
{acts.LoadFromJsonString=function(str_)
{var o,i,len,binst;try{o=JSON.parse(str_);}
catch(e){return;}
this.runtime.loadInstanceFromJSON(this,o,true);if(this.afterLoad)
this.afterLoad();if(this.behavior_insts)
{for(i=0,len=this.behavior_insts.length;i<len;++i)
{binst=this.behavior_insts[i];if(binst.afterLoad)
binst.afterLoad();}}};}
exps.Count=function(ret)
{var count=ret.object_class.instances.length;var i,len,inst;for(i=0,len=this.runtime.createRow.length;i<len;i++)
{inst=this.runtime.createRow[i];if(ret.object_class.is_family)
{if(inst.type.families.indexOf(ret.object_class)>=0)
count++;}
else
{if(inst.type===ret.object_class)
count++;}}
ret.set_int(count);};exps.PickedCount=function(ret)
{ret.set_int(ret.object_class.getCurrentSol().getObjects().length);};exps.UID=function(ret)
{ret.set_int(this.uid);};exps.IID=function(ret)
{ret.set_int(this.get_iid());};if(!exps.AsJSON)
{exps.AsJSON=function(ret)
{ret.set_string(JSON.stringify(this.runtime.saveInstanceToJSON(this,true)));};}}
if(appearance_aces)
{cnds.IsVisible=function()
{return this.visible;};acts.SetVisible=function(v)
{if(!v!==!this.visible)
{this.visible=!!v;this.runtime.redraw=true;}};cnds.CompareOpacity=function(cmp,x)
{return cr.do_cmp(cr.round6dp(this.opacity*100),cmp,x);};acts.SetOpacity=function(x)
{var new_opacity=x/100.0;if(new_opacity<0)
new_opacity=0;else if(new_opacity>1)
new_opacity=1;if(new_opacity!==this.opacity)
{this.opacity=new_opacity;this.runtime.redraw=true;}};exps.Opacity=function(ret)
{ret.set_float(cr.round6dp(this.opacity*100.0));};}
if(zorder_aces)
{cnds.IsOnLayer=function(layer_)
{if(!layer_)
return false;return this.layer===layer_;};cnds.PickTopBottom=function(which_)
{var sol=this.getCurrentSol();var instances=sol.getObjects();if(!instances.length)
return false;var inst=instances[0];var pickme=inst;var i,len;for(i=1,len=instances.length;i<len;i++)
{inst=instances[i];if(which_===0)
{if(inst.layer.index>pickme.layer.index||(inst.layer.index===pickme.layer.index&&inst.get_zindex()>pickme.get_zindex()))
{pickme=inst;}}
else
{if(inst.layer.index<pickme.layer.index||(inst.layer.index===pickme.layer.index&&inst.get_zindex()<pickme.get_zindex()))
{pickme=inst;}}}
sol.pick_one(pickme);return true;};acts.MoveToTop=function()
{var layer=this.layer;var layer_instances=layer.instances;if(layer_instances.length&&layer_instances[layer_instances.length-1]===this)
return;layer.removeFromInstanceList(this,false);layer.appendToInstanceList(this,false);this.runtime.redraw=true;};acts.MoveToBottom=function()
{var layer=this.layer;var layer_instances=layer.instances;if(layer_instances.length&&layer_instances[0]===this)
return;layer.removeFromInstanceList(this,false);layer.prependToInstanceList(this,false);this.runtime.redraw=true;};acts.MoveToLayer=function(layerMove)
{if(!layerMove||layerMove==this.layer)
return;this.layer.removeFromInstanceList(this,true);this.layer=layerMove;layerMove.appendToInstanceList(this,true);this.runtime.redraw=true;};acts.ZMoveToObject=function(where_,obj_)
{var isafter=(where_===0);if(!obj_)
return;var other=obj_.getFirstPicked(this);if(!other||other.uid===this.uid)
return;if(this.layer.index!==other.layer.index)
{this.layer.removeFromInstanceList(this,true);this.layer=other.layer;other.layer.appendToInstanceList(this,true);}
this.layer.moveInstanceAdjacent(this,other,isafter);this.runtime.redraw=true;};exps.LayerNumber=function(ret)
{ret.set_int(this.layer.number);};exps.LayerName=function(ret)
{ret.set_string(this.layer.name);};exps.ZIndex=function(ret)
{ret.set_int(this.get_zindex());};}
if(effects_aces)
{acts.SetEffectEnabled=function(enable_,effectname_)
{if(!this.runtime.glwrap)
return;var i=this.type.getEffectIndexByName(effectname_);if(i<0)
return;var enable=(enable_===1);if(this.active_effect_flags[i]===enable)
return;this.active_effect_flags[i]=enable;this.updateActiveEffects();this.runtime.redraw=true;};acts.SetEffectParam=function(effectname_,index_,value_)
{if(!this.runtime.glwrap)
return;var i=this.type.getEffectIndexByName(effectname_);if(i<0)
return;var et=this.type.effect_types[i];var params=this.effect_params[i];index_=Math.floor(index_);if(index_<0||index_>=params.length)
return;if(this.runtime.glwrap.getProgramParameterType(et.shaderindex,index_)===1)
value_/=100.0;if(params[index_]===value_)
return;params[index_]=value_;if(et.active)
this.runtime.redraw=true;};}};cr.set_bbox_changed=function()
{this.bbox_changed=true;this.cell_changed=true;this.type.any_cell_changed=true;this.runtime.redraw=true;var i,len,callbacks=this.bbox_changed_callbacks;for(i=0,len=callbacks.length;i<len;++i)
{callbacks[i](this);}
if(this.layer.useRenderCells)
this.update_bbox();};cr.add_bbox_changed_callback=function(f)
{if(f)
{this.bbox_changed_callbacks.push(f);}};cr.update_bbox=function()
{if(!this.bbox_changed)
return;var bbox=this.bbox;var bquad=this.bquad;bbox.set(this.x,this.y,this.x+this.width,this.y+this.height);bbox.offset(-this.hotspotX*this.width,-this.hotspotY*this.height);if(!this.angle)
{bquad.set_from_rect(bbox);}
else
{bbox.offset(-this.x,-this.y);bquad.set_from_rotated_rect(bbox,this.angle);bquad.offset(this.x,this.y);bquad.bounding_box(bbox);}
bbox.normalize();this.bbox_changed=false;this.update_render_cell();};var tmprc=new cr.rect(0,0,0,0);cr.update_render_cell=function()
{if(!this.layer.useRenderCells)
return;var mygrid=this.layer.render_grid;var bbox=this.bbox;tmprc.set(mygrid.XToCell(bbox.left),mygrid.YToCell(bbox.top),mygrid.XToCell(bbox.right),mygrid.YToCell(bbox.bottom));if(this.rendercells.equals(tmprc))
return;if(this.rendercells.right<this.rendercells.left)
mygrid.update(this,null,tmprc);else
mygrid.update(this,this.rendercells,tmprc);this.rendercells.copy(tmprc);this.layer.render_list_stale=true;};cr.update_collision_cell=function()
{if(!this.cell_changed||!this.collisionsEnabled)
return;this.update_bbox();var mygrid=this.type.collision_grid;var bbox=this.bbox;tmprc.set(mygrid.XToCell(bbox.left),mygrid.YToCell(bbox.top),mygrid.XToCell(bbox.right),mygrid.YToCell(bbox.bottom));if(this.collcells.equals(tmprc))
return;if(this.collcells.right<this.collcells.left)
mygrid.update(this,null,tmprc);else
mygrid.update(this,this.collcells,tmprc);this.collcells.copy(tmprc);this.cell_changed=false;};cr.inst_contains_pt=function(x,y)
{if(!this.bbox.contains_pt(x,y))
return false;if(!this.bquad.contains_pt(x,y))
return false;if(this.tilemap_exists)
return this.testPointOverlapTile(x,y);if(this.collision_poly&&!this.collision_poly.is_empty())
{this.collision_poly.cache_poly(this.width,this.height,this.angle);return this.collision_poly.contains_pt(x-this.x,y-this.y);}
else
return true;};cr.inst_get_iid=function()
{this.type.updateIIDs();return this.iid;};cr.inst_get_zindex=function()
{this.layer.updateZIndices();return this.zindex;};cr.inst_updateActiveEffects=function()
{cr.clearArray(this.active_effect_types);var i,len,et;var preserves_opaqueness=true;for(i=0,len=this.active_effect_flags.length;i<len;i++)
{if(this.active_effect_flags[i])
{et=this.type.effect_types[i];this.active_effect_types.push(et);if(!et.preservesOpaqueness)
preserves_opaqueness=false;}}
this.uses_shaders=!!this.active_effect_types.length;this.shaders_preserve_opaqueness=preserves_opaqueness;};cr.inst_toString=function()
{return "Inst"+this.puid;};cr.type_getFirstPicked=function(frominst)
{if(frominst&&frominst.is_contained&&frominst.type!=this)
{var i,len,s;for(i=0,len=frominst.siblings.length;i<len;i++)
{s=frominst.siblings[i];if(s.type==this)
return s;}}
var instances=this.getCurrentSol().getObjects();if(instances.length)
return instances[0];else
return null;};cr.type_getPairedInstance=function(inst)
{var instances=this.getCurrentSol().getObjects();if(instances.length)
return instances[inst.get_iid()%instances.length];else
return null;};cr.type_updateIIDs=function()
{if(!this.stale_iids||this.is_family)
return;var i,len;for(i=0,len=this.instances.length;i<len;i++)
this.instances[i].iid=i;var next_iid=i;var createRow=this.runtime.createRow;for(i=0,len=createRow.length;i<len;++i)
{if(createRow[i].type===this)
createRow[i].iid=next_iid++;}
this.stale_iids=false;};cr.type_getInstanceByIID=function(i)
{if(i<this.instances.length)
return this.instances[i];i-=this.instances.length;var createRow=this.runtime.createRow;var j,lenj;for(j=0,lenj=createRow.length;j<lenj;++j)
{if(createRow[j].type===this)
{if(i===0)
return createRow[j];--i;}};return null;};cr.type_getCurrentSol=function()
{return this.solstack[this.cur_sol];};cr.type_pushCleanSol=function()
{this.cur_sol++;if(this.cur_sol===this.solstack.length)
{this.solstack.push(new cr.selection(this));}
else
{this.solstack[this.cur_sol].select_all=true;cr.clearArray(this.solstack[this.cur_sol].else_instances);}};cr.type_pushCopySol=function()
{this.cur_sol++;if(this.cur_sol===this.solstack.length)
this.solstack.push(new cr.selection(this));var clonesol=this.solstack[this.cur_sol];var prevsol=this.solstack[this.cur_sol-1];if(prevsol.select_all)
{clonesol.select_all=true;cr.clearArray(clonesol.else_instances);}
else
{clonesol.select_all=false;cr.shallowAssignArray(clonesol.instances,prevsol.instances);cr.shallowAssignArray(clonesol.else_instances,prevsol.else_instances);}};cr.type_popSol=function()
{;this.cur_sol--;};cr.type_getBehaviorByName=function(behname)
{var i,len,j,lenj,f,index=0;if(!this.is_family)
{for(i=0,len=this.families.length;i<len;i++)
{f=this.families[i];for(j=0,lenj=f.behaviors.length;j<lenj;j++)
{if(behname===f.behaviors[j].name)
{this.extra["lastBehIndex"]=index;return f.behaviors[j];}
index++;}}}
for(i=0,len=this.behaviors.length;i<len;i++){if(behname===this.behaviors[i].name)
{this.extra["lastBehIndex"]=index;return this.behaviors[i];}
index++;}
return null;};cr.type_getBehaviorIndexByName=function(behname)
{var b=this.getBehaviorByName(behname);if(b)
return this.extra["lastBehIndex"];else
return-1;};cr.type_getEffectIndexByName=function(name_)
{var i,len;for(i=0,len=this.effect_types.length;i<len;i++)
{if(this.effect_types[i].name===name_)
return i;}
return-1;};cr.type_applySolToContainer=function()
{if(!this.is_contained||this.is_family)
return;var i,len,j,lenj,t,sol,sol2;this.updateIIDs();sol=this.getCurrentSol();var select_all=sol.select_all;var es=this.runtime.getCurrentEventStack();var orblock=es&&es.current_event&&es.current_event.orblock;for(i=0,len=this.container.length;i<len;i++)
{t=this.container[i];if(t===this)
continue;t.updateIIDs();sol2=t.getCurrentSol();sol2.select_all=select_all;if(!select_all)
{cr.clearArray(sol2.instances);for(j=0,lenj=sol.instances.length;j<lenj;++j)
sol2.instances[j]=t.getInstanceByIID(sol.instances[j].iid);if(orblock)
{cr.clearArray(sol2.else_instances);for(j=0,lenj=sol.else_instances.length;j<lenj;++j)
sol2.else_instances[j]=t.getInstanceByIID(sol.else_instances[j].iid);}}}};cr.type_toString=function()
{return "Type"+this.sid;};cr.do_cmp=function(x,cmp,y)
{if(typeof x==="undefined"||typeof y==="undefined")
return false;switch(cmp)
{case 0:return x===y;case 1:return x!==y;case 2:return x<y;case 3:return x<=y;case 4:return x>y;case 5:return x>=y;default:;return false;}};})();cr.shaders={};cr.shaders["noisemask"]={src:["varying mediump vec2 vTex;","uniform lowp sampler2D samplerFront;","uniform lowp sampler2D samplerBack;","uniform mediump vec2 destStart;","uniform mediump vec2 destEnd;","uniform mediump float seconds;","uniform lowp float intensity;","void main(void)","{","lowp float fronta = texture2D(samplerFront, vTex).a;","lowp vec4 back1 = texture2D(samplerBack, mix(destStart, destEnd, vTex));","lowp vec4 back2 = back1;","back2.rgb /= back2.a;","mediump float seconds_mod = mod(seconds, 10.0);","mediump vec3 noise = vec3(fract(sin(dot(vTex.xy, vec2(12.9898,78.233)) + seconds_mod) * 43758.5453),","fract(sin(dot(vTex.yx, vec2(12.9898,-78.233)) + seconds_mod) * 43758.5453),","fract(sin(dot(vTex.xy, vec2(-12.9898,-78.233)) + seconds_mod) * 43758.5453));","back2.rgb += (noise * intensity) - (intensity / 2.0);","back2.rgb *= back2.a;","gl_FragColor = mix(back1, back2, fronta);","}"].join("\n"),extendBoxHorizontal:0,extendBoxVertical:0,crossSampling:true,preservesOpaqueness:true,animated:true,parameters:[["intensity",0,1]]}
cr.shaders["shift"]={src:["varying mediump vec2 vTex;","uniform lowp sampler2D samplerFront;","uniform lowp float pixelWidth;","uniform lowp float pixelHeight;","uniform mediump float xshift;","uniform mediump float yshift;","void main(void)","{","mediump vec2 tex = vTex;","tex.x += (pixelWidth*-xshift);","tex.y += (pixelHeight*-yshift);","gl_FragColor = texture2D(samplerFront, tex);","}"].join("\n"),extendBoxHorizontal:0,extendBoxVertical:0,crossSampling:false,preservesOpaqueness:false,animated:false,parameters:[["xshift",0,0],["yshift",0,0]]};;cr.plugins_.AJAX=function(runtime)
{this.runtime=runtime;};(function()
{var isNWjs=false;var path=null;var fs=null;var nw_appfolder="";var pluginProto=cr.plugins_.AJAX.prototype;pluginProto.Type=function(plugin)
{this.plugin=plugin;this.runtime=plugin.runtime;};var typeProto=pluginProto.Type.prototype;typeProto.onCreate=function()
{};pluginProto.Instance=function(type)
{this.type=type;this.runtime=type.runtime;this.lastData="";this.curTag="";this.progress=0;this.timeout=-1;isNWjs=this.runtime.isNWjs;if(isNWjs)
{path=require("path");fs=require("fs");var process=window["process"]||nw["process"];nw_appfolder=path["dirname"](process["execPath"])+"\\";}};var instanceProto=pluginProto.Instance.prototype;var theInstance=null;window["C2_AJAX_DCSide"]=function(event_,tag_,param_)
{if(!theInstance)
return;if(event_==="success")
{theInstance.curTag=tag_;theInstance.lastData=param_;theInstance.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyComplete,theInstance);theInstance.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnComplete,theInstance);}
else if(event_==="error")
{theInstance.curTag=tag_;theInstance.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyError,theInstance);theInstance.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnError,theInstance);}
else if(event_==="progress")
{theInstance.progress=param_;theInstance.curTag=tag_;theInstance.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnProgress,theInstance);}};instanceProto.onCreate=function()
{theInstance=this;};instanceProto.saveToJSON=function()
{return{"lastData":this.lastData};};instanceProto.loadFromJSON=function(o)
{this.lastData=o["lastData"];this.curTag="";this.progress=0;};var next_request_headers={};var next_override_mime="";instanceProto.doRequest=function(tag_,url_,method_,data_)
{if(this.runtime.isDirectCanvas)
{AppMobi["webview"]["execute"]('C2_AJAX_WebSide("'+tag_+'", "'+url_+'", "'+method_+'", '+(data_?'"'+data_+'"':"null")+');');return;}
var self=this;var request=null;var doErrorFunc=function()
{self.curTag=tag_;self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyError,self);self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnError,self);};var errorFunc=function()
{if(isNWjs)
{var filepath=nw_appfolder+url_;if(fs["existsSync"](filepath))
{fs["readFile"](filepath,{"encoding":"utf8"},function(err,data){if(err)
{doErrorFunc();return;}
self.curTag=tag_;self.lastData=data.replace(/\r\n/g,"\n")
self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyComplete,self);self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnComplete,self);});}
else
doErrorFunc();}
else
doErrorFunc();};var progressFunc=function(e)
{if(!e["lengthComputable"])
return;self.progress=e.loaded/e.total;self.curTag=tag_;self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnProgress,self);};try
{if(this.runtime.isWindowsPhone8)
request=new ActiveXObject("Microsoft.XMLHTTP");else
request=new XMLHttpRequest();request.onreadystatechange=function()
{if(request.readyState===4)
{self.curTag=tag_;if(request.responseText)
self.lastData=request.responseText.replace(/\r\n/g,"\n");else
self.lastData="";if(request.status>=400)
{self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyError,self);self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnError,self);}
else
{if((!isNWjs||self.lastData.length)&&!(!isNWjs&&request.status===0&&!self.lastData.length))
{self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyComplete,self);self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnComplete,self);}}}};if(!this.runtime.isWindowsPhone8)
{request.onerror=errorFunc;request.ontimeout=errorFunc;request.onabort=errorFunc;request["onprogress"]=progressFunc;}
request.open(method_,url_);if(!this.runtime.isWindowsPhone8)
{if(this.timeout>=0&&typeof request["timeout"]!=="undefined")
request["timeout"]=this.timeout;}
try{request.responseType="text";}catch(e){}
if(data_)
{if(request["setRequestHeader"]&&!next_request_headers.hasOwnProperty("Content-Type"))
{request["setRequestHeader"]("Content-Type","application/x-www-form-urlencoded");}}
if(request["setRequestHeader"])
{var p;for(p in next_request_headers)
{if(next_request_headers.hasOwnProperty(p))
{try{request["setRequestHeader"](p,next_request_headers[p]);}
catch(e){}}}
next_request_headers={};}
if(next_override_mime&&request["overrideMimeType"])
{try{request["overrideMimeType"](next_override_mime);}
catch(e){}
next_override_mime="";}
if(data_)
request.send(data_);else
request.send();}
catch(e)
{errorFunc();}};function Cnds(){};Cnds.prototype.OnComplete=function(tag)
{return cr.equals_nocase(tag,this.curTag);};Cnds.prototype.OnAnyComplete=function(tag)
{return true;};Cnds.prototype.OnError=function(tag)
{return cr.equals_nocase(tag,this.curTag);};Cnds.prototype.OnAnyError=function(tag)
{return true;};Cnds.prototype.OnProgress=function(tag)
{return cr.equals_nocase(tag,this.curTag);};pluginProto.cnds=new Cnds();function Acts(){};Acts.prototype.Request=function(tag_,url_)
{var self=this;if(this.runtime.isWKWebView&&!this.runtime.isAbsoluteUrl(url_))
{this.runtime.fetchLocalFileViaCordovaAsText(url_,function(str)
{self.curTag=tag_;self.lastData=str.replace(/\r\n/g,"\n");self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyComplete,self);self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnComplete,self);},function(err)
{self.curTag=tag_;self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyError,self);self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnError,self);});}
else
{this.doRequest(tag_,url_,"GET");}};Acts.prototype.RequestFile=function(tag_,file_)
{var self=this;if(this.runtime.isWKWebView)
{this.runtime.fetchLocalFileViaCordovaAsText(file_,function(str)
{self.curTag=tag_;self.lastData=str.replace(/\r\n/g,"\n");self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyComplete,self);self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnComplete,self);},function(err)
{self.curTag=tag_;self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyError,self);self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnError,self);});}
else
{this.doRequest(tag_,file_,"GET");}};Acts.prototype.Post=function(tag_,url_,data_,method_)
{this.doRequest(tag_,url_,method_,data_);};Acts.prototype.SetTimeout=function(t)
{this.timeout=t*1000;};Acts.prototype.SetHeader=function(n,v)
{next_request_headers[n]=v;};Acts.prototype.OverrideMIMEType=function(m)
{next_override_mime=m;};pluginProto.acts=new Acts();function Exps(){};Exps.prototype.LastData=function(ret)
{ret.set_string(this.lastData);};Exps.prototype.Progress=function(ret)
{ret.set_float(this.progress);};Exps.prototype.Tag=function(ret)
{ret.set_string(this.curTag);};pluginProto.exps=new Exps();}());;;cr.plugins_.Audio=function(runtime)
{this.runtime=runtime;};(function()
{var pluginProto=cr.plugins_.Audio.prototype;pluginProto.Type=function(plugin)
{this.plugin=plugin;this.runtime=plugin.runtime;};var typeProto=pluginProto.Type.prototype;typeProto.onCreate=function()
{};var audRuntime=null;var audInst=null;var audTag="";var appPath="";var API_HTML5=0;var API_WEBAUDIO=1;var API_CORDOVA=2;var API_APPMOBI=3;var api=API_HTML5;var context=null;var audioBuffers=[];var audioInstances=[];var lastAudio=null;var useOgg=false;var timescale_mode=0;var silent=false;var masterVolume=1;var listenerX=0;var listenerY=0;var isContextSuspended=false;var panningModel=1;var distanceModel=1;var refDistance=10;var maxDistance=10000;var rolloffFactor=1;var micSource=null;var micTag="";var useNextTouchWorkaround=false;var playOnNextInput=[];var playMusicAsSoundWorkaround=false;var hasPlayedDummyBuffer=false;function addAudioToPlayOnNextInput(a)
{var i=playOnNextInput.indexOf(a);if(i===-1)
playOnNextInput.push(a);};function tryPlayAudioElement(a)
{var audioElem=a.instanceObject;var playRet;try{playRet=audioElem.play();}
catch(err){addAudioToPlayOnNextInput(a);return;}
if(playRet)
{playRet.catch(function(err)
{addAudioToPlayOnNextInput(a);});}
else if(useNextTouchWorkaround&&!audRuntime.isInUserInputEvent)
{addAudioToPlayOnNextInput(a);}};function playQueuedAudio()
{var i,len,m,playRet;if(!hasPlayedDummyBuffer&&!isContextSuspended&&context)
{playDummyBuffer();if(context["state"]==="running")
hasPlayedDummyBuffer=true;}
var tryPlay=playOnNextInput.slice(0);cr.clearArray(playOnNextInput);if(!silent)
{for(i=0,len=tryPlay.length;i<len;++i)
{m=tryPlay[i];if(!m.stopped&&!m.is_paused)
{playRet=m.instanceObject.play();if(playRet)
{playRet.catch(function(err)
{addAudioToPlayOnNextInput(m);});}}}}};function playDummyBuffer()
{if(context["state"]==="suspended"&&context["resume"])
context["resume"]();if(!context["createBuffer"])
return;var buffer=context["createBuffer"](1,220,22050);var source=context["createBufferSource"]();source["buffer"]=buffer;source["connect"](context["destination"]);startSource(source);};document.addEventListener("touchend",playQueuedAudio,true);document.addEventListener("click",playQueuedAudio,true);document.addEventListener("keydown",playQueuedAudio,true);function dbToLinear(x)
{var v=dbToLinear_nocap(x);if(!isFinite(v))
v=0;if(v<0)
v=0;if(v>1)
v=1;return v;};function linearToDb(x)
{if(x<0)
x=0;if(x>1)
x=1;return linearToDb_nocap(x);};function dbToLinear_nocap(x)
{return Math.pow(10,x/20);};function linearToDb_nocap(x)
{return(Math.log(x)/Math.log(10))*20;};var effects={};function getDestinationForTag(tag)
{tag=tag.toLowerCase();if(effects.hasOwnProperty(tag))
{if(effects[tag].length)
return effects[tag][0].getInputNode();}
return context["destination"];};function createGain()
{if(context["createGain"])
return context["createGain"]();else
return context["createGainNode"]();};function createDelay(d)
{if(context["createDelay"])
return context["createDelay"](d);else
return context["createDelayNode"](d);};function startSource(s,scheduledTime)
{if(s["start"])
s["start"](scheduledTime||0);else
s["noteOn"](scheduledTime||0);};function startSourceAt(s,x,d,scheduledTime)
{if(s["start"])
s["start"](scheduledTime||0,x);else
s["noteGrainOn"](scheduledTime||0,x,d-x);};function stopSource(s)
{try{if(s["stop"])
s["stop"](0);else
s["noteOff"](0);}
catch(e){}};function setAudioParam(ap,value,ramp,time)
{if(!ap)
return;ap["cancelScheduledValues"](0);if(time===0)
{ap["value"]=value;return;}
var curTime=context["currentTime"];time+=curTime;switch(ramp){case 0:ap["setValueAtTime"](value,time);break;case 1:ap["setValueAtTime"](ap["value"],curTime);ap["linearRampToValueAtTime"](value,time);break;case 2:ap["setValueAtTime"](ap["value"],curTime);ap["exponentialRampToValueAtTime"](value,time);break;}};var filterTypes=["lowpass","highpass","bandpass","lowshelf","highshelf","peaking","notch","allpass"];function FilterEffect(type,freq,detune,q,gain,mix)
{this.type="filter";this.params=[type,freq,detune,q,gain,mix];this.inputNode=createGain();this.wetNode=createGain();this.wetNode["gain"]["value"]=mix;this.dryNode=createGain();this.dryNode["gain"]["value"]=1-mix;this.filterNode=context["createBiquadFilter"]();if(typeof this.filterNode["type"]==="number")
this.filterNode["type"]=type;else
this.filterNode["type"]=filterTypes[type];this.filterNode["frequency"]["value"]=freq;if(this.filterNode["detune"])
this.filterNode["detune"]["value"]=detune;this.filterNode["Q"]["value"]=q;this.filterNode["gain"]["value"]=gain;this.inputNode["connect"](this.filterNode);this.inputNode["connect"](this.dryNode);this.filterNode["connect"](this.wetNode);};FilterEffect.prototype.connectTo=function(node)
{this.wetNode["disconnect"]();this.wetNode["connect"](node);this.dryNode["disconnect"]();this.dryNode["connect"](node);};FilterEffect.prototype.remove=function()
{this.inputNode["disconnect"]();this.filterNode["disconnect"]();this.wetNode["disconnect"]();this.dryNode["disconnect"]();};FilterEffect.prototype.getInputNode=function()
{return this.inputNode;};FilterEffect.prototype.setParam=function(param,value,ramp,time)
{switch(param){case 0:value=value/100;if(value<0)value=0;if(value>1)value=1;this.params[5]=value;setAudioParam(this.wetNode["gain"],value,ramp,time);setAudioParam(this.dryNode["gain"],1-value,ramp,time);break;case 1:this.params[1]=value;setAudioParam(this.filterNode["frequency"],value,ramp,time);break;case 2:this.params[2]=value;setAudioParam(this.filterNode["detune"],value,ramp,time);break;case 3:this.params[3]=value;setAudioParam(this.filterNode["Q"],value,ramp,time);break;case 4:this.params[4]=value;setAudioParam(this.filterNode["gain"],value,ramp,time);break;}};function DelayEffect(delayTime,delayGain,mix)
{this.type="delay";this.params=[delayTime,delayGain,mix];this.inputNode=createGain();this.wetNode=createGain();this.wetNode["gain"]["value"]=mix;this.dryNode=createGain();this.dryNode["gain"]["value"]=1-mix;this.mainNode=createGain();this.delayNode=createDelay(delayTime);this.delayNode["delayTime"]["value"]=delayTime;this.delayGainNode=createGain();this.delayGainNode["gain"]["value"]=delayGain;this.inputNode["connect"](this.mainNode);this.inputNode["connect"](this.dryNode);this.mainNode["connect"](this.wetNode);this.mainNode["connect"](this.delayNode);this.delayNode["connect"](this.delayGainNode);this.delayGainNode["connect"](this.mainNode);};DelayEffect.prototype.connectTo=function(node)
{this.wetNode["disconnect"]();this.wetNode["connect"](node);this.dryNode["disconnect"]();this.dryNode["connect"](node);};DelayEffect.prototype.remove=function()
{this.inputNode["disconnect"]();this.mainNode["disconnect"]();this.delayNode["disconnect"]();this.delayGainNode["disconnect"]();this.wetNode["disconnect"]();this.dryNode["disconnect"]();};DelayEffect.prototype.getInputNode=function()
{return this.inputNode;};DelayEffect.prototype.setParam=function(param,value,ramp,time)
{switch(param){case 0:value=value/100;if(value<0)value=0;if(value>1)value=1;this.params[2]=value;setAudioParam(this.wetNode["gain"],value,ramp,time);setAudioParam(this.dryNode["gain"],1-value,ramp,time);break;case 4:this.params[1]=dbToLinear(value);setAudioParam(this.delayGainNode["gain"],dbToLinear(value),ramp,time);break;case 5:this.params[0]=value;setAudioParam(this.delayNode["delayTime"],value,ramp,time);break;}};function ConvolveEffect(buffer,normalize,mix,src)
{this.type="convolve";this.params=[normalize,mix,src];this.inputNode=createGain();this.wetNode=createGain();this.wetNode["gain"]["value"]=mix;this.dryNode=createGain();this.dryNode["gain"]["value"]=1-mix;this.convolveNode=context["createConvolver"]();if(buffer)
{this.convolveNode["normalize"]=normalize;this.convolveNode["buffer"]=buffer;}
this.inputNode["connect"](this.convolveNode);this.inputNode["connect"](this.dryNode);this.convolveNode["connect"](this.wetNode);};ConvolveEffect.prototype.connectTo=function(node)
{this.wetNode["disconnect"]();this.wetNode["connect"](node);this.dryNode["disconnect"]();this.dryNode["connect"](node);};ConvolveEffect.prototype.remove=function()
{this.inputNode["disconnect"]();this.convolveNode["disconnect"]();this.wetNode["disconnect"]();this.dryNode["disconnect"]();};ConvolveEffect.prototype.getInputNode=function()
{return this.inputNode;};ConvolveEffect.prototype.setParam=function(param,value,ramp,time)
{switch(param){case 0:value=value/100;if(value<0)value=0;if(value>1)value=1;this.params[1]=value;setAudioParam(this.wetNode["gain"],value,ramp,time);setAudioParam(this.dryNode["gain"],1-value,ramp,time);break;}};function FlangerEffect(delay,modulation,freq,feedback,mix)
{this.type="flanger";this.params=[delay,modulation,freq,feedback,mix];this.inputNode=createGain();this.dryNode=createGain();this.dryNode["gain"]["value"]=1-(mix/2);this.wetNode=createGain();this.wetNode["gain"]["value"]=mix/2;this.feedbackNode=createGain();this.feedbackNode["gain"]["value"]=feedback;this.delayNode=createDelay(delay+modulation);this.delayNode["delayTime"]["value"]=delay;this.oscNode=context["createOscillator"]();this.oscNode["frequency"]["value"]=freq;this.oscGainNode=createGain();this.oscGainNode["gain"]["value"]=modulation;this.inputNode["connect"](this.delayNode);this.inputNode["connect"](this.dryNode);this.delayNode["connect"](this.wetNode);this.delayNode["connect"](this.feedbackNode);this.feedbackNode["connect"](this.delayNode);this.oscNode["connect"](this.oscGainNode);this.oscGainNode["connect"](this.delayNode["delayTime"]);startSource(this.oscNode);};FlangerEffect.prototype.connectTo=function(node)
{this.dryNode["disconnect"]();this.dryNode["connect"](node);this.wetNode["disconnect"]();this.wetNode["connect"](node);};FlangerEffect.prototype.remove=function()
{this.inputNode["disconnect"]();this.delayNode["disconnect"]();this.oscNode["disconnect"]();this.oscGainNode["disconnect"]();this.dryNode["disconnect"]();this.wetNode["disconnect"]();this.feedbackNode["disconnect"]();};FlangerEffect.prototype.getInputNode=function()
{return this.inputNode;};FlangerEffect.prototype.setParam=function(param,value,ramp,time)
{switch(param){case 0:value=value/100;if(value<0)value=0;if(value>1)value=1;this.params[4]=value;setAudioParam(this.wetNode["gain"],value/2,ramp,time);setAudioParam(this.dryNode["gain"],1-(value/2),ramp,time);break;case 6:this.params[1]=value/1000;setAudioParam(this.oscGainNode["gain"],value/1000,ramp,time);break;case 7:this.params[2]=value;setAudioParam(this.oscNode["frequency"],value,ramp,time);break;case 8:this.params[3]=value/100;setAudioParam(this.feedbackNode["gain"],value/100,ramp,time);break;}};function PhaserEffect(freq,detune,q,modulation,modfreq,mix)
{this.type="phaser";this.params=[freq,detune,q,modulation,modfreq,mix];this.inputNode=createGain();this.dryNode=createGain();this.dryNode["gain"]["value"]=1-(mix/2);this.wetNode=createGain();this.wetNode["gain"]["value"]=mix/2;this.filterNode=context["createBiquadFilter"]();if(typeof this.filterNode["type"]==="number")
this.filterNode["type"]=7;else
this.filterNode["type"]="allpass";this.filterNode["frequency"]["value"]=freq;if(this.filterNode["detune"])
this.filterNode["detune"]["value"]=detune;this.filterNode["Q"]["value"]=q;this.oscNode=context["createOscillator"]();this.oscNode["frequency"]["value"]=modfreq;this.oscGainNode=createGain();this.oscGainNode["gain"]["value"]=modulation;this.inputNode["connect"](this.filterNode);this.inputNode["connect"](this.dryNode);this.filterNode["connect"](this.wetNode);this.oscNode["connect"](this.oscGainNode);this.oscGainNode["connect"](this.filterNode["frequency"]);startSource(this.oscNode);};PhaserEffect.prototype.connectTo=function(node)
{this.dryNode["disconnect"]();this.dryNode["connect"](node);this.wetNode["disconnect"]();this.wetNode["connect"](node);};PhaserEffect.prototype.remove=function()
{this.inputNode["disconnect"]();this.filterNode["disconnect"]();this.oscNode["disconnect"]();this.oscGainNode["disconnect"]();this.dryNode["disconnect"]();this.wetNode["disconnect"]();};PhaserEffect.prototype.getInputNode=function()
{return this.inputNode;};PhaserEffect.prototype.setParam=function(param,value,ramp,time)
{switch(param){case 0:value=value/100;if(value<0)value=0;if(value>1)value=1;this.params[5]=value;setAudioParam(this.wetNode["gain"],value/2,ramp,time);setAudioParam(this.dryNode["gain"],1-(value/2),ramp,time);break;case 1:this.params[0]=value;setAudioParam(this.filterNode["frequency"],value,ramp,time);break;case 2:this.params[1]=value;setAudioParam(this.filterNode["detune"],value,ramp,time);break;case 3:this.params[2]=value;setAudioParam(this.filterNode["Q"],value,ramp,time);break;case 6:this.params[3]=value;setAudioParam(this.oscGainNode["gain"],value,ramp,time);break;case 7:this.params[4]=value;setAudioParam(this.oscNode["frequency"],value,ramp,time);break;}};function GainEffect(g)
{this.type="gain";this.params=[g];this.node=createGain();this.node["gain"]["value"]=g;};GainEffect.prototype.connectTo=function(node_)
{this.node["disconnect"]();this.node["connect"](node_);};GainEffect.prototype.remove=function()
{this.node["disconnect"]();};GainEffect.prototype.getInputNode=function()
{return this.node;};GainEffect.prototype.setParam=function(param,value,ramp,time)
{switch(param){case 4:this.params[0]=dbToLinear(value);setAudioParam(this.node["gain"],dbToLinear(value),ramp,time);break;}};function TremoloEffect(freq,mix)
{this.type="tremolo";this.params=[freq,mix];this.node=createGain();this.node["gain"]["value"]=1-(mix/2);this.oscNode=context["createOscillator"]();this.oscNode["frequency"]["value"]=freq;this.oscGainNode=createGain();this.oscGainNode["gain"]["value"]=mix/2;this.oscNode["connect"](this.oscGainNode);this.oscGainNode["connect"](this.node["gain"]);startSource(this.oscNode);};TremoloEffect.prototype.connectTo=function(node_)
{this.node["disconnect"]();this.node["connect"](node_);};TremoloEffect.prototype.remove=function()
{this.oscNode["disconnect"]();this.oscGainNode["disconnect"]();this.node["disconnect"]();};TremoloEffect.prototype.getInputNode=function()
{return this.node;};TremoloEffect.prototype.setParam=function(param,value,ramp,time)
{switch(param){case 0:value=value/100;if(value<0)value=0;if(value>1)value=1;this.params[1]=value;setAudioParam(this.node["gain"]["value"],1-(value/2),ramp,time);setAudioParam(this.oscGainNode["gain"]["value"],value/2,ramp,time);break;case 7:this.params[0]=value;setAudioParam(this.oscNode["frequency"],value,ramp,time);break;}};function RingModulatorEffect(freq,mix)
{this.type="ringmod";this.params=[freq,mix];this.inputNode=createGain();this.wetNode=createGain();this.wetNode["gain"]["value"]=mix;this.dryNode=createGain();this.dryNode["gain"]["value"]=1-mix;this.ringNode=createGain();this.ringNode["gain"]["value"]=0;this.oscNode=context["createOscillator"]();this.oscNode["frequency"]["value"]=freq;this.oscNode["connect"](this.ringNode["gain"]);startSource(this.oscNode);this.inputNode["connect"](this.ringNode);this.inputNode["connect"](this.dryNode);this.ringNode["connect"](this.wetNode);};RingModulatorEffect.prototype.connectTo=function(node_)
{this.wetNode["disconnect"]();this.wetNode["connect"](node_);this.dryNode["disconnect"]();this.dryNode["connect"](node_);};RingModulatorEffect.prototype.remove=function()
{this.oscNode["disconnect"]();this.ringNode["disconnect"]();this.inputNode["disconnect"]();this.wetNode["disconnect"]();this.dryNode["disconnect"]();};RingModulatorEffect.prototype.getInputNode=function()
{return this.inputNode;};RingModulatorEffect.prototype.setParam=function(param,value,ramp,time)
{switch(param){case 0:value=value/100;if(value<0)value=0;if(value>1)value=1;this.params[1]=value;setAudioParam(this.wetNode["gain"],value,ramp,time);setAudioParam(this.dryNode["gain"],1-value,ramp,time);break;case 7:this.params[0]=value;setAudioParam(this.oscNode["frequency"],value,ramp,time);break;}};function DistortionEffect(threshold,headroom,drive,makeupgain,mix)
{this.type="distortion";this.params=[threshold,headroom,drive,makeupgain,mix];this.inputNode=createGain();this.preGain=createGain();this.postGain=createGain();this.setDrive(drive,dbToLinear_nocap(makeupgain));this.wetNode=createGain();this.wetNode["gain"]["value"]=mix;this.dryNode=createGain();this.dryNode["gain"]["value"]=1-mix;this.waveShaper=context["createWaveShaper"]();this.curve=new Float32Array(65536);this.generateColortouchCurve(threshold,headroom);this.waveShaper.curve=this.curve;this.inputNode["connect"](this.preGain);this.inputNode["connect"](this.dryNode);this.preGain["connect"](this.waveShaper);this.waveShaper["connect"](this.postGain);this.postGain["connect"](this.wetNode);};DistortionEffect.prototype.setDrive=function(drive,makeupgain)
{if(drive<0.01)
drive=0.01;this.preGain["gain"]["value"]=drive;this.postGain["gain"]["value"]=Math.pow(1/drive,0.6)*makeupgain;};function e4(x,k)
{return 1.0-Math.exp(-k*x);}
DistortionEffect.prototype.shape=function(x,linearThreshold,linearHeadroom)
{var maximum=1.05*linearHeadroom*linearThreshold;var kk=(maximum-linearThreshold);var sign=x<0?-1:+1;var absx=x<0?-x:x;var shapedInput=absx<linearThreshold?absx:linearThreshold+kk*e4(absx-linearThreshold,1.0/kk);shapedInput*=sign;return shapedInput;};DistortionEffect.prototype.generateColortouchCurve=function(threshold,headroom)
{var linearThreshold=dbToLinear_nocap(threshold);var linearHeadroom=dbToLinear_nocap(headroom);var n=65536;var n2=n/2;var x=0;for(var i=0;i<n2;++i){x=i/n2;x=this.shape(x,linearThreshold,linearHeadroom);this.curve[n2+i]=x;this.curve[n2-i-1]=-x;}};DistortionEffect.prototype.connectTo=function(node)
{this.wetNode["disconnect"]();this.wetNode["connect"](node);this.dryNode["disconnect"]();this.dryNode["connect"](node);};DistortionEffect.prototype.remove=function()
{this.inputNode["disconnect"]();this.preGain["disconnect"]();this.waveShaper["disconnect"]();this.postGain["disconnect"]();this.wetNode["disconnect"]();this.dryNode["disconnect"]();};DistortionEffect.prototype.getInputNode=function()
{return this.inputNode;};DistortionEffect.prototype.setParam=function(param,value,ramp,time)
{switch(param){case 0:value=value/100;if(value<0)value=0;if(value>1)value=1;this.params[4]=value;setAudioParam(this.wetNode["gain"],value,ramp,time);setAudioParam(this.dryNode["gain"],1-value,ramp,time);break;}};function CompressorEffect(threshold,knee,ratio,attack,release)
{this.type="compressor";this.params=[threshold,knee,ratio,attack,release];this.node=context["createDynamicsCompressor"]();try{this.node["threshold"]["value"]=threshold;this.node["knee"]["value"]=knee;this.node["ratio"]["value"]=ratio;this.node["attack"]["value"]=attack;this.node["release"]["value"]=release;}
catch(e){}};CompressorEffect.prototype.connectTo=function(node_)
{this.node["disconnect"]();this.node["connect"](node_);};CompressorEffect.prototype.remove=function()
{this.node["disconnect"]();};CompressorEffect.prototype.getInputNode=function()
{return this.node;};CompressorEffect.prototype.setParam=function(param,value,ramp,time)
{};function AnalyserEffect(fftSize,smoothing)
{this.type="analyser";this.params=[fftSize,smoothing];this.node=context["createAnalyser"]();this.node["fftSize"]=fftSize;this.node["smoothingTimeConstant"]=smoothing;this.freqBins=new Float32Array(this.node["frequencyBinCount"]);this.signal=new Uint8Array(fftSize);this.peak=0;this.rms=0;};AnalyserEffect.prototype.tick=function()
{this.node["getFloatFrequencyData"](this.freqBins);this.node["getByteTimeDomainData"](this.signal);var fftSize=this.node["fftSize"];var i=0;this.peak=0;var rmsSquaredSum=0;var s=0;for(;i<fftSize;i++)
{s=(this.signal[i]-128)/128;if(s<0)
s=-s;if(this.peak<s)
this.peak=s;rmsSquaredSum+=s*s;}
this.peak=linearToDb(this.peak);this.rms=linearToDb(Math.sqrt(rmsSquaredSum/fftSize));};AnalyserEffect.prototype.connectTo=function(node_)
{this.node["disconnect"]();this.node["connect"](node_);};AnalyserEffect.prototype.remove=function()
{this.node["disconnect"]();};AnalyserEffect.prototype.getInputNode=function()
{return this.node;};AnalyserEffect.prototype.setParam=function(param,value,ramp,time)
{};function ObjectTracker()
{this.obj=null;this.loadUid=0;};ObjectTracker.prototype.setObject=function(obj_)
{this.obj=obj_;};ObjectTracker.prototype.hasObject=function()
{return!!this.obj;};ObjectTracker.prototype.tick=function(dt)
{};function C2AudioBuffer(src_,is_music)
{this.src=src_;this.myapi=api;this.is_music=is_music;this.added_end_listener=false;var self=this;this.outNode=null;this.mediaSourceNode=null;this.panWhenReady=[];this.seekWhenReady=0;this.pauseWhenReady=false;this.supportWebAudioAPI=false;this.failedToLoad=false;this.wasEverReady=false;if(api===API_WEBAUDIO&&is_music&&!playMusicAsSoundWorkaround)
{this.myapi=API_HTML5;this.outNode=createGain();}
this.bufferObject=null;this.audioData=null;var request;switch(this.myapi){case API_HTML5:this.bufferObject=new Audio();this.bufferObject.crossOrigin="anonymous";this.bufferObject.addEventListener("canplaythrough",function(){self.wasEverReady=true;});if(api===API_WEBAUDIO&&context["createMediaElementSource"]&&!/wiiu/i.test(navigator.userAgent))
{this.supportWebAudioAPI=true;this.bufferObject.addEventListener("canplay",function()
{if(!self.mediaSourceNode&&self.bufferObject)
{self.mediaSourceNode=context["createMediaElementSource"](self.bufferObject);self.mediaSourceNode["connect"](self.outNode);}});}
this.bufferObject.autoplay=false;this.bufferObject.preload="auto";this.bufferObject.src=src_;break;case API_WEBAUDIO:if(audRuntime.isWKWebView)
{audRuntime.fetchLocalFileViaCordovaAsArrayBuffer(src_,function(arrayBuffer)
{self.audioData=arrayBuffer;self.decodeAudioBuffer();},function(err)
{self.failedToLoad=true;});}
else
{request=new XMLHttpRequest();request.open("GET",src_,true);request.responseType="arraybuffer";request.onload=function(){self.audioData=request.response;self.decodeAudioBuffer();};request.onerror=function(){self.failedToLoad=true;};request.send();}
break;case API_CORDOVA:this.bufferObject=true;break;case API_APPMOBI:this.bufferObject=true;break;}};C2AudioBuffer.prototype.release=function()
{var i,len,j,a;for(i=0,j=0,len=audioInstances.length;i<len;++i)
{a=audioInstances[i];audioInstances[j]=a;if(a.buffer===this)
a.stop();else
++j;}
audioInstances.length=j;if(this.mediaSourceNode)
{this.mediaSourceNode["disconnect"]();this.mediaSourceNode=null;}
if(this.outNode)
{this.outNode["disconnect"]();this.outNode=null;}
this.bufferObject=null;this.audioData=null;};C2AudioBuffer.prototype.decodeAudioBuffer=function()
{if(this.bufferObject||!this.audioData)
return;var self=this;if(context["decodeAudioData"])
{context["decodeAudioData"](this.audioData,function(buffer){self.bufferObject=buffer;self.audioData=null;var p,i,len,a;if(!cr.is_undefined(self.playTagWhenReady)&&!silent)
{if(self.panWhenReady.length)
{for(i=0,len=self.panWhenReady.length;i<len;i++)
{p=self.panWhenReady[i];a=new C2AudioInstance(self,p.thistag);a.setPannerEnabled(true);if(typeof p.objUid!=="undefined")
{p.obj=audRuntime.getObjectByUID(p.objUid);if(!p.obj)
continue;}
if(p.obj)
{var px=cr.rotatePtAround(p.obj.x,p.obj.y,-p.obj.layer.getAngle(),listenerX,listenerY,true);var py=cr.rotatePtAround(p.obj.x,p.obj.y,-p.obj.layer.getAngle(),listenerX,listenerY,false);a.setPan(px,py,cr.to_degrees(p.obj.angle-p.obj.layer.getAngle()),p.ia,p.oa,p.og);a.setObject(p.obj);}
else
{a.setPan(p.x,p.y,p.a,p.ia,p.oa,p.og);}
a.play(self.loopWhenReady,self.volumeWhenReady,self.seekWhenReady);if(self.pauseWhenReady)
a.pause();audioInstances.push(a);}
cr.clearArray(self.panWhenReady);}
else
{a=new C2AudioInstance(self,self.playTagWhenReady||"");a.play(self.loopWhenReady,self.volumeWhenReady,self.seekWhenReady);if(self.pauseWhenReady)
a.pause();audioInstances.push(a);}}
else if(!cr.is_undefined(self.convolveWhenReady))
{var convolveNode=self.convolveWhenReady.convolveNode;convolveNode["normalize"]=self.normalizeWhenReady;convolveNode["buffer"]=buffer;}},function(e){self.failedToLoad=true;});}
else
{this.bufferObject=context["createBuffer"](this.audioData,false);this.audioData=null;if(!cr.is_undefined(this.playTagWhenReady)&&!silent)
{var a=new C2AudioInstance(this,this.playTagWhenReady);a.play(this.loopWhenReady,this.volumeWhenReady,this.seekWhenReady);if(this.pauseWhenReady)
a.pause();audioInstances.push(a);}
else if(!cr.is_undefined(this.convolveWhenReady))
{var convolveNode=this.convolveWhenReady.convolveNode;convolveNode["normalize"]=this.normalizeWhenReady;convolveNode["buffer"]=this.bufferObject;}}};C2AudioBuffer.prototype.isLoaded=function()
{switch(this.myapi){case API_HTML5:var ret=this.bufferObject["readyState"]>=4;if(ret)
this.wasEverReady=true;return ret||this.wasEverReady;case API_WEBAUDIO:return!!this.audioData||!!this.bufferObject;case API_CORDOVA:return true;case API_APPMOBI:return true;}
return false;};C2AudioBuffer.prototype.isLoadedAndDecoded=function()
{switch(this.myapi){case API_HTML5:return this.isLoaded();case API_WEBAUDIO:return!!this.bufferObject;case API_CORDOVA:return true;case API_APPMOBI:return true;}
return false;};C2AudioBuffer.prototype.hasFailedToLoad=function()
{switch(this.myapi){case API_HTML5:return!!this.bufferObject["error"];case API_WEBAUDIO:return this.failedToLoad;}
return false;};function C2AudioInstance(buffer_,tag_)
{var self=this;this.tag=tag_;this.fresh=true;this.stopped=true;this.src=buffer_.src;this.buffer=buffer_;this.myapi=api;this.is_music=buffer_.is_music;this.playbackRate=1;this.hasPlaybackEnded=true;this.resume_me=false;this.is_paused=false;this.resume_position=0;this.looping=false;this.is_muted=false;this.is_silent=false;this.volume=1;this.onended_handler=function(e)
{if(self.is_paused||self.resume_me)
return;var bufferThatEnded=this;if(!bufferThatEnded)
bufferThatEnded=e.target;if(bufferThatEnded!==self.active_buffer)
return;self.hasPlaybackEnded=true;self.stopped=true;audTag=self.tag;audRuntime.trigger(cr.plugins_.Audio.prototype.cnds.OnEnded,audInst);};this.active_buffer=null;this.isTimescaled=((timescale_mode===1&&!this.is_music)||timescale_mode===2);this.mutevol=1;this.startTime=(this.isTimescaled?audRuntime.kahanTime.sum:audRuntime.wallTime.sum);this.gainNode=null;this.pannerNode=null;this.pannerEnabled=false;this.objectTracker=null;this.panX=0;this.panY=0;this.panAngle=0;this.panConeInner=0;this.panConeOuter=0;this.panConeOuterGain=0;this.instanceObject=null;var add_end_listener=false;if(this.myapi===API_WEBAUDIO&&this.buffer.myapi===API_HTML5&&!this.buffer.supportWebAudioAPI)
this.myapi=API_HTML5;switch(this.myapi){case API_HTML5:if(this.is_music)
{this.instanceObject=buffer_.bufferObject;add_end_listener=!buffer_.added_end_listener;buffer_.added_end_listener=true;}
else
{this.instanceObject=new Audio();this.instanceObject.crossOrigin="anonymous";this.instanceObject.autoplay=false;this.instanceObject.src=buffer_.bufferObject.src;add_end_listener=true;}
if(add_end_listener)
{this.instanceObject.addEventListener('ended',function(){audTag=self.tag;self.stopped=true;audRuntime.trigger(cr.plugins_.Audio.prototype.cnds.OnEnded,audInst);});}
break;case API_WEBAUDIO:this.gainNode=createGain();this.gainNode["connect"](getDestinationForTag(tag_));if(this.buffer.myapi===API_WEBAUDIO)
{if(buffer_.bufferObject)
{this.instanceObject=context["createBufferSource"]();this.instanceObject["buffer"]=buffer_.bufferObject;this.instanceObject["connect"](this.gainNode);}}
else
{this.instanceObject=this.buffer.bufferObject;this.buffer.outNode["connect"](this.gainNode);if(!this.buffer.added_end_listener)
{this.buffer.added_end_listener=true;this.buffer.bufferObject.addEventListener('ended',function(){audTag=self.tag;self.stopped=true;audRuntime.trigger(cr.plugins_.Audio.prototype.cnds.OnEnded,audInst);});}}
break;case API_CORDOVA:this.instanceObject=new window["Media"](appPath+this.src,null,null,function(status){if(status===window["Media"]["MEDIA_STOPPED"])
{self.hasPlaybackEnded=true;self.stopped=true;audTag=self.tag;audRuntime.trigger(cr.plugins_.Audio.prototype.cnds.OnEnded,audInst);}});break;case API_APPMOBI:this.instanceObject=true;break;}};C2AudioInstance.prototype.hasEnded=function()
{var time;switch(this.myapi){case API_HTML5:return this.instanceObject.ended;case API_WEBAUDIO:if(this.buffer.myapi===API_WEBAUDIO)
{if(!this.fresh&&!this.stopped&&this.instanceObject["loop"])
return false;if(this.is_paused)
return false;return this.hasPlaybackEnded;}
else
return this.instanceObject.ended;case API_CORDOVA:return this.hasPlaybackEnded;case API_APPMOBI:true;}
return true;};C2AudioInstance.prototype.canBeRecycled=function()
{if(this.fresh||this.stopped)
return true;return this.hasEnded();};C2AudioInstance.prototype.setPannerEnabled=function(enable_)
{if(api!==API_WEBAUDIO)
return;if(!this.pannerEnabled&&enable_)
{if(!this.gainNode)
return;if(!this.pannerNode)
{this.pannerNode=context["createPanner"]();if(typeof this.pannerNode["panningModel"]==="number")
this.pannerNode["panningModel"]=panningModel;else
this.pannerNode["panningModel"]=["equalpower","HRTF","soundfield"][panningModel];if(typeof this.pannerNode["distanceModel"]==="number")
this.pannerNode["distanceModel"]=distanceModel;else
this.pannerNode["distanceModel"]=["linear","inverse","exponential"][distanceModel];this.pannerNode["refDistance"]=refDistance;this.pannerNode["maxDistance"]=maxDistance;this.pannerNode["rolloffFactor"]=rolloffFactor;}
this.gainNode["disconnect"]();this.gainNode["connect"](this.pannerNode);this.pannerNode["connect"](getDestinationForTag(this.tag));this.pannerEnabled=true;}
else if(this.pannerEnabled&&!enable_)
{if(!this.gainNode)
return;this.pannerNode["disconnect"]();this.gainNode["disconnect"]();this.gainNode["connect"](getDestinationForTag(this.tag));this.pannerEnabled=false;}};C2AudioInstance.prototype.setPan=function(x,y,angle,innerangle,outerangle,outergain)
{if(!this.pannerEnabled||api!==API_WEBAUDIO)
return;this.pannerNode["setPosition"](x,y,0);this.pannerNode["setOrientation"](Math.cos(cr.to_radians(angle)),Math.sin(cr.to_radians(angle)),0);this.pannerNode["coneInnerAngle"]=innerangle;this.pannerNode["coneOuterAngle"]=outerangle;this.pannerNode["coneOuterGain"]=outergain;this.panX=x;this.panY=y;this.panAngle=angle;this.panConeInner=innerangle;this.panConeOuter=outerangle;this.panConeOuterGain=outergain;};C2AudioInstance.prototype.setObject=function(o)
{if(!this.pannerEnabled||api!==API_WEBAUDIO)
return;if(!this.objectTracker)
this.objectTracker=new ObjectTracker();this.objectTracker.setObject(o);};C2AudioInstance.prototype.tick=function(dt)
{if(!this.pannerEnabled||api!==API_WEBAUDIO||!this.objectTracker||!this.objectTracker.hasObject()||!this.isPlaying())
{return;}
this.objectTracker.tick(dt);var inst=this.objectTracker.obj;var px=cr.rotatePtAround(inst.x,inst.y,-inst.layer.getAngle(),listenerX,listenerY,true);var py=cr.rotatePtAround(inst.x,inst.y,-inst.layer.getAngle(),listenerX,listenerY,false);this.pannerNode["setPosition"](px,py,0);var a=0;if(typeof this.objectTracker.obj.angle!=="undefined")
{a=inst.angle-inst.layer.getAngle();this.pannerNode["setOrientation"](Math.cos(a),Math.sin(a),0);}};C2AudioInstance.prototype.play=function(looping,vol,fromPosition,scheduledTime)
{var instobj=this.instanceObject;this.looping=looping;this.volume=vol;var seekPos=fromPosition||0;scheduledTime=scheduledTime||0;switch(this.myapi){case API_HTML5:if(instobj.playbackRate!==1.0)
instobj.playbackRate=1.0;if(instobj.volume!==vol*masterVolume)
instobj.volume=vol*masterVolume;if(instobj.loop!==looping)
instobj.loop=looping;if(instobj.muted)
instobj.muted=false;if(instobj.currentTime!==seekPos)
{try{instobj.currentTime=seekPos;}
catch(err)
{;}}
tryPlayAudioElement(this);break;case API_WEBAUDIO:this.muted=false;this.mutevol=1;if(this.buffer.myapi===API_WEBAUDIO)
{this.gainNode["gain"]["value"]=vol*masterVolume;if(!this.fresh)
{this.instanceObject=context["createBufferSource"]();this.instanceObject["buffer"]=this.buffer.bufferObject;this.instanceObject["connect"](this.gainNode);}
this.instanceObject["onended"]=this.onended_handler;this.active_buffer=this.instanceObject;this.instanceObject.loop=looping;this.hasPlaybackEnded=false;if(seekPos===0)
startSource(this.instanceObject,scheduledTime);else
startSourceAt(this.instanceObject,seekPos,this.getDuration(),scheduledTime);}
else
{if(instobj.playbackRate!==1.0)
instobj.playbackRate=1.0;if(instobj.loop!==looping)
instobj.loop=looping;instobj.volume=vol*masterVolume;if(instobj.currentTime!==seekPos)
{try{instobj.currentTime=seekPos;}
catch(err)
{;}}
tryPlayAudioElement(this);}
break;case API_CORDOVA:if((!this.fresh&&this.stopped)||seekPos!==0)
instobj["seekTo"](seekPos);instobj["play"]();this.hasPlaybackEnded=false;break;case API_APPMOBI:if(audRuntime.isDirectCanvas)
AppMobi["context"]["playSound"](this.src,looping);else
AppMobi["player"]["playSound"](this.src,looping);break;}
this.playbackRate=1;this.startTime=(this.isTimescaled?audRuntime.kahanTime.sum:audRuntime.wallTime.sum)-seekPos;this.fresh=false;this.stopped=false;this.is_paused=false;};C2AudioInstance.prototype.stop=function()
{switch(this.myapi){case API_HTML5:if(!this.instanceObject.paused)
this.instanceObject.pause();break;case API_WEBAUDIO:if(this.buffer.myapi===API_WEBAUDIO)
stopSource(this.instanceObject);else
{if(!this.instanceObject.paused)
this.instanceObject.pause();}
break;case API_CORDOVA:this.instanceObject["stop"]();break;case API_APPMOBI:if(audRuntime.isDirectCanvas)
AppMobi["context"]["stopSound"](this.src);break;}
this.stopped=true;this.is_paused=false;};C2AudioInstance.prototype.pause=function()
{if(this.fresh||this.stopped||this.hasEnded()||this.is_paused)
return;switch(this.myapi){case API_HTML5:if(!this.instanceObject.paused)
this.instanceObject.pause();break;case API_WEBAUDIO:if(this.buffer.myapi===API_WEBAUDIO)
{this.resume_position=this.getPlaybackTime(true);if(this.looping)
this.resume_position=this.resume_position%this.getDuration();this.is_paused=true;stopSource(this.instanceObject);}
else
{if(!this.instanceObject.paused)
this.instanceObject.pause();}
break;case API_CORDOVA:this.instanceObject["pause"]();break;case API_APPMOBI:if(audRuntime.isDirectCanvas)
AppMobi["context"]["stopSound"](this.src);break;}
this.is_paused=true;};C2AudioInstance.prototype.resume=function()
{if(this.fresh||this.stopped||this.hasEnded()||!this.is_paused)
return;switch(this.myapi){case API_HTML5:tryPlayAudioElement(this);break;case API_WEBAUDIO:if(this.buffer.myapi===API_WEBAUDIO)
{this.instanceObject=context["createBufferSource"]();this.instanceObject["buffer"]=this.buffer.bufferObject;this.instanceObject["connect"](this.gainNode);this.instanceObject["onended"]=this.onended_handler;this.active_buffer=this.instanceObject;this.instanceObject.loop=this.looping;this.gainNode["gain"]["value"]=masterVolume*this.volume*this.mutevol;this.updatePlaybackRate();this.startTime=(this.isTimescaled?audRuntime.kahanTime.sum:audRuntime.wallTime.sum)-(this.resume_position/(this.playbackRate||0.001));startSourceAt(this.instanceObject,this.resume_position,this.getDuration());}
else
{tryPlayAudioElement(this);}
break;case API_CORDOVA:this.instanceObject["play"]();break;case API_APPMOBI:if(audRuntime.isDirectCanvas)
AppMobi["context"]["resumeSound"](this.src);break;}
this.is_paused=false;};C2AudioInstance.prototype.seek=function(pos)
{if(this.fresh||this.stopped||this.hasEnded())
return;switch(this.myapi){case API_HTML5:try{this.instanceObject.currentTime=pos;}
catch(e){}
break;case API_WEBAUDIO:if(this.buffer.myapi===API_WEBAUDIO)
{if(this.is_paused)
this.resume_position=pos;else
{this.pause();this.resume_position=pos;this.resume();}}
else
{try{this.instanceObject.currentTime=pos;}
catch(e){}}
break;case API_CORDOVA:break;case API_APPMOBI:if(audRuntime.isDirectCanvas)
AppMobi["context"]["seekSound"](this.src,pos);break;}};C2AudioInstance.prototype.reconnect=function(toNode)
{if(this.myapi!==API_WEBAUDIO)
return;if(this.pannerEnabled)
{this.pannerNode["disconnect"]();this.pannerNode["connect"](toNode);}
else
{this.gainNode["disconnect"]();this.gainNode["connect"](toNode);}};C2AudioInstance.prototype.getDuration=function(applyPlaybackRate)
{var ret=0;switch(this.myapi){case API_HTML5:if(typeof this.instanceObject.duration!=="undefined")
ret=this.instanceObject.duration;break;case API_WEBAUDIO:ret=this.buffer.bufferObject["duration"];break;case API_CORDOVA:ret=this.instanceObject["getDuration"]();break;case API_APPMOBI:if(audRuntime.isDirectCanvas)
ret=AppMobi["context"]["getDurationSound"](this.src);break;}
if(applyPlaybackRate)
ret/=(this.playbackRate||0.001);return ret;};C2AudioInstance.prototype.getPlaybackTime=function(applyPlaybackRate)
{var duration=this.getDuration();var ret=0;switch(this.myapi){case API_HTML5:if(typeof this.instanceObject.currentTime!=="undefined")
ret=this.instanceObject.currentTime;break;case API_WEBAUDIO:if(this.buffer.myapi===API_WEBAUDIO)
{if(this.is_paused)
return this.resume_position;else
ret=(this.isTimescaled?audRuntime.kahanTime.sum:audRuntime.wallTime.sum)-this.startTime;}
else if(typeof this.instanceObject.currentTime!=="undefined")
ret=this.instanceObject.currentTime;break;case API_CORDOVA:break;case API_APPMOBI:if(audRuntime.isDirectCanvas)
ret=AppMobi["context"]["getPlaybackTimeSound"](this.src);break;}
if(applyPlaybackRate)
ret*=this.playbackRate;if(!this.looping&&ret>duration)
ret=duration;return ret;};C2AudioInstance.prototype.isPlaying=function()
{return!this.is_paused&&!this.fresh&&!this.stopped&&!this.hasEnded();};C2AudioInstance.prototype.shouldSave=function()
{return!this.fresh&&!this.stopped&&!this.hasEnded();};C2AudioInstance.prototype.setVolume=function(v)
{this.volume=v;this.updateVolume();};C2AudioInstance.prototype.updateVolume=function()
{var volToSet=this.volume*masterVolume;if(!isFinite(volToSet))
volToSet=0;switch(this.myapi){case API_HTML5:if(typeof this.instanceObject.volume!=="undefined"&&this.instanceObject.volume!==volToSet)
this.instanceObject.volume=volToSet;break;case API_WEBAUDIO:if(this.buffer.myapi===API_WEBAUDIO)
{this.gainNode["gain"]["value"]=volToSet*this.mutevol;}
else
{if(typeof this.instanceObject.volume!=="undefined"&&this.instanceObject.volume!==volToSet)
this.instanceObject.volume=volToSet;}
break;case API_CORDOVA:break;case API_APPMOBI:break;}};C2AudioInstance.prototype.getVolume=function()
{return this.volume;};C2AudioInstance.prototype.doSetMuted=function(m)
{switch(this.myapi){case API_HTML5:if(this.instanceObject.muted!==!!m)
this.instanceObject.muted=!!m;break;case API_WEBAUDIO:if(this.buffer.myapi===API_WEBAUDIO)
{this.mutevol=(m?0:1);this.gainNode["gain"]["value"]=masterVolume*this.volume*this.mutevol;}
else
{if(this.instanceObject.muted!==!!m)
this.instanceObject.muted=!!m;}
break;case API_CORDOVA:break;case API_APPMOBI:break;}};C2AudioInstance.prototype.setMuted=function(m)
{this.is_muted=!!m;this.doSetMuted(this.is_muted||this.is_silent);};C2AudioInstance.prototype.setSilent=function(m)
{this.is_silent=!!m;this.doSetMuted(this.is_muted||this.is_silent);};C2AudioInstance.prototype.setLooping=function(l)
{this.looping=l;switch(this.myapi){case API_HTML5:if(this.instanceObject.loop!==!!l)
this.instanceObject.loop=!!l;break;case API_WEBAUDIO:if(this.instanceObject.loop!==!!l)
this.instanceObject.loop=!!l;break;case API_CORDOVA:break;case API_APPMOBI:if(audRuntime.isDirectCanvas)
AppMobi["context"]["setLoopingSound"](this.src,l);break;}};C2AudioInstance.prototype.setPlaybackRate=function(r)
{this.playbackRate=r;this.updatePlaybackRate();};C2AudioInstance.prototype.updatePlaybackRate=function()
{var r=this.playbackRate;if(this.isTimescaled)
r*=audRuntime.timescale;switch(this.myapi){case API_HTML5:if(this.instanceObject.playbackRate!==r)
this.instanceObject.playbackRate=r;break;case API_WEBAUDIO:if(this.buffer.myapi===API_WEBAUDIO)
{if(this.instanceObject["playbackRate"]["value"]!==r)
this.instanceObject["playbackRate"]["value"]=r;}
else
{if(this.instanceObject.playbackRate!==r)
this.instanceObject.playbackRate=r;}
break;case API_CORDOVA:break;case API_APPMOBI:break;}};C2AudioInstance.prototype.setSuspended=function(s)
{switch(this.myapi){case API_HTML5:if(s)
{if(this.isPlaying())
{this.resume_me=true;this.instanceObject["pause"]();}
else
this.resume_me=false;}
else
{if(this.resume_me)
{this.instanceObject["play"]();this.resume_me=false;}}
break;case API_WEBAUDIO:if(s)
{if(this.isPlaying())
{this.resume_me=true;if(this.buffer.myapi===API_WEBAUDIO)
{this.resume_position=this.getPlaybackTime(true);if(this.looping)
this.resume_position=this.resume_position%this.getDuration();stopSource(this.instanceObject);}
else
this.instanceObject["pause"]();}
else
this.resume_me=false;}
else
{if(this.resume_me)
{if(this.buffer.myapi===API_WEBAUDIO)
{this.instanceObject=context["createBufferSource"]();this.instanceObject["buffer"]=this.buffer.bufferObject;this.instanceObject["connect"](this.gainNode);this.instanceObject["onended"]=this.onended_handler;this.active_buffer=this.instanceObject;this.instanceObject.loop=this.looping;this.gainNode["gain"]["value"]=masterVolume*this.volume*this.mutevol;this.updatePlaybackRate();this.startTime=(this.isTimescaled?audRuntime.kahanTime.sum:audRuntime.wallTime.sum)-(this.resume_position/(this.playbackRate||0.001));startSourceAt(this.instanceObject,this.resume_position,this.getDuration());}
else
{this.instanceObject["play"]();}
this.resume_me=false;}}
break;case API_CORDOVA:if(s)
{if(this.isPlaying())
{this.instanceObject["pause"]();this.resume_me=true;}
else
this.resume_me=false;}
else
{if(this.resume_me)
{this.resume_me=false;this.instanceObject["play"]();}}
break;case API_APPMOBI:break;}};pluginProto.Instance=function(type)
{this.type=type;this.runtime=type.runtime;audRuntime=this.runtime;audInst=this;this.listenerTracker=null;this.listenerZ=-600;if(this.runtime.isWKWebView)
playMusicAsSoundWorkaround=true;if((this.runtime.isiOS||(this.runtime.isAndroid&&(this.runtime.isChrome||this.runtime.isAndroidStockBrowser)))&&!this.runtime.isCrosswalk&&!this.runtime.isDomFree&&!this.runtime.isAmazonWebApp&&!playMusicAsSoundWorkaround)
{useNextTouchWorkaround=true;}
context=null;if(typeof AudioContext!=="undefined")
{api=API_WEBAUDIO;context=new AudioContext();}
else if(typeof webkitAudioContext!=="undefined")
{api=API_WEBAUDIO;context=new webkitAudioContext();}
if(this.runtime.isiOS&&context)
{if(context.close)
context.close();if(typeof AudioContext!=="undefined")
context=new AudioContext();else if(typeof webkitAudioContext!=="undefined")
context=new webkitAudioContext();}
if(api!==API_WEBAUDIO)
{if(this.runtime.isCordova&&typeof window["Media"]!=="undefined")
api=API_CORDOVA;else if(this.runtime.isAppMobi)
api=API_APPMOBI;}
if(api===API_CORDOVA)
{appPath=location.href;var i=appPath.lastIndexOf("/");if(i>-1)
appPath=appPath.substr(0,i+1);appPath=appPath.replace("file://","");}
if(this.runtime.isSafari&&this.runtime.isWindows&&typeof Audio==="undefined")
{alert("It looks like you're using Safari for Windows without Quicktime.  Audio cannot be played until Quicktime is installed.");this.runtime.DestroyInstance(this);}
else
{if(this.runtime.isDirectCanvas)
useOgg=this.runtime.isAndroid;else
{try{useOgg=!!(new Audio().canPlayType('audio/ogg; codecs="vorbis"'));}
catch(e)
{useOgg=false;}}
switch(api){case API_HTML5:;break;case API_WEBAUDIO:;break;case API_CORDOVA:;break;case API_APPMOBI:;break;default:;}
this.runtime.tickMe(this);}};var instanceProto=pluginProto.Instance.prototype;instanceProto.onCreate=function()
{this.runtime.audioInstance=this;timescale_mode=this.properties[0];this.saveload=this.properties[1];this.playinbackground=(this.properties[2]!==0);this.nextPlayTime=0;panningModel=this.properties[3];distanceModel=this.properties[4];this.listenerZ=-this.properties[5];refDistance=this.properties[6];maxDistance=this.properties[7];rolloffFactor=this.properties[8];this.listenerTracker=new ObjectTracker();var draw_width=(this.runtime.draw_width||this.runtime.width);var draw_height=(this.runtime.draw_height||this.runtime.height);if(api===API_WEBAUDIO)
{context["listener"]["setPosition"](draw_width/2,draw_height/2,this.listenerZ);context["listener"]["setOrientation"](0,0,1,0,-1,0);window["c2OnAudioMicStream"]=function(localMediaStream,tag)
{if(micSource)
micSource["disconnect"]();micTag=tag.toLowerCase();micSource=context["createMediaStreamSource"](localMediaStream);micSource["connect"](getDestinationForTag(micTag));};}
this.runtime.addSuspendCallback(function(s)
{audInst.onSuspend(s);});var self=this;this.runtime.addDestroyCallback(function(inst)
{self.onInstanceDestroyed(inst);});};instanceProto.onInstanceDestroyed=function(inst)
{var i,len,a;for(i=0,len=audioInstances.length;i<len;i++)
{a=audioInstances[i];if(a.objectTracker)
{if(a.objectTracker.obj===inst)
{a.objectTracker.obj=null;if(a.pannerEnabled&&a.isPlaying()&&a.looping)
a.stop();}}}
if(this.listenerTracker.obj===inst)
this.listenerTracker.obj=null;};instanceProto.saveToJSON=function()
{var o={"silent":silent,"masterVolume":masterVolume,"listenerZ":this.listenerZ,"listenerUid":this.listenerTracker.hasObject()?this.listenerTracker.obj.uid:-1,"playing":[],"effects":{}};var playingarr=o["playing"];var i,len,a,d,p,panobj,playbackTime;for(i=0,len=audioInstances.length;i<len;i++)
{a=audioInstances[i];if(!a.shouldSave())
continue;if(this.saveload===3)
continue;if(a.is_music&&this.saveload===1)
continue;if(!a.is_music&&this.saveload===2)
continue;playbackTime=a.getPlaybackTime();if(a.looping)
playbackTime=playbackTime%a.getDuration();d={"tag":a.tag,"buffersrc":a.buffer.src,"is_music":a.is_music,"playbackTime":playbackTime,"volume":a.volume,"looping":a.looping,"muted":a.is_muted,"playbackRate":a.playbackRate,"paused":a.is_paused,"resume_position":a.resume_position};if(a.pannerEnabled)
{d["pan"]={};panobj=d["pan"];if(a.objectTracker&&a.objectTracker.hasObject())
{panobj["objUid"]=a.objectTracker.obj.uid;}
else
{panobj["x"]=a.panX;panobj["y"]=a.panY;panobj["a"]=a.panAngle;}
panobj["ia"]=a.panConeInner;panobj["oa"]=a.panConeOuter;panobj["og"]=a.panConeOuterGain;}
playingarr.push(d);}
var fxobj=o["effects"];var fxarr;for(p in effects)
{if(effects.hasOwnProperty(p))
{fxarr=[];for(i=0,len=effects[p].length;i<len;i++)
{fxarr.push({"type":effects[p][i].type,"params":effects[p][i].params});}
fxobj[p]=fxarr;}}
return o;};var objectTrackerUidsToLoad=[];instanceProto.loadFromJSON=function(o)
{var setSilent=o["silent"];masterVolume=o["masterVolume"];this.listenerZ=o["listenerZ"];this.listenerTracker.setObject(null);var listenerUid=o["listenerUid"];if(listenerUid!==-1)
{this.listenerTracker.loadUid=listenerUid;objectTrackerUidsToLoad.push(this.listenerTracker);}
var playingarr=o["playing"];var i,len,d,src,is_music,tag,playbackTime,looping,vol,b,a,p,pan,panObjUid;if(this.saveload!==3)
{for(i=0,len=audioInstances.length;i<len;i++)
{a=audioInstances[i];if(a.is_music&&this.saveload===1)
continue;if(!a.is_music&&this.saveload===2)
continue;a.stop();}}
var fxarr,fxtype,fxparams,fx;for(p in effects)
{if(effects.hasOwnProperty(p))
{for(i=0,len=effects[p].length;i<len;i++)
effects[p][i].remove();}}
cr.wipe(effects);for(p in o["effects"])
{if(o["effects"].hasOwnProperty(p))
{fxarr=o["effects"][p];for(i=0,len=fxarr.length;i<len;i++)
{fxtype=fxarr[i]["type"];fxparams=fxarr[i]["params"];switch(fxtype){case "filter":addEffectForTag(p,new FilterEffect(fxparams[0],fxparams[1],fxparams[2],fxparams[3],fxparams[4],fxparams[5]));break;case "delay":addEffectForTag(p,new DelayEffect(fxparams[0],fxparams[1],fxparams[2]));break;case "convolve":src=fxparams[2];b=this.getAudioBuffer(src,false);if(b.bufferObject)
{fx=new ConvolveEffect(b.bufferObject,fxparams[0],fxparams[1],src);}
else
{fx=new ConvolveEffect(null,fxparams[0],fxparams[1],src);b.normalizeWhenReady=fxparams[0];b.convolveWhenReady=fx;}
addEffectForTag(p,fx);break;case "flanger":addEffectForTag(p,new FlangerEffect(fxparams[0],fxparams[1],fxparams[2],fxparams[3],fxparams[4]));break;case "phaser":addEffectForTag(p,new PhaserEffect(fxparams[0],fxparams[1],fxparams[2],fxparams[3],fxparams[4],fxparams[5]));break;case "gain":addEffectForTag(p,new GainEffect(fxparams[0]));break;case "tremolo":addEffectForTag(p,new TremoloEffect(fxparams[0],fxparams[1]));break;case "ringmod":addEffectForTag(p,new RingModulatorEffect(fxparams[0],fxparams[1]));break;case "distortion":addEffectForTag(p,new DistortionEffect(fxparams[0],fxparams[1],fxparams[2],fxparams[3],fxparams[4]));break;case "compressor":addEffectForTag(p,new CompressorEffect(fxparams[0],fxparams[1],fxparams[2],fxparams[3],fxparams[4]));break;case "analyser":addEffectForTag(p,new AnalyserEffect(fxparams[0],fxparams[1]));break;}}}}
for(i=0,len=playingarr.length;i<len;i++)
{if(this.saveload===3)
continue;d=playingarr[i];src=d["buffersrc"];is_music=d["is_music"];tag=d["tag"];playbackTime=d["playbackTime"];looping=d["looping"];vol=d["volume"];pan=d["pan"];panObjUid=(pan&&pan.hasOwnProperty("objUid"))?pan["objUid"]:-1;if(is_music&&this.saveload===1)
continue;if(!is_music&&this.saveload===2)
continue;a=this.getAudioInstance(src,tag,is_music,looping,vol);if(!a)
{b=this.getAudioBuffer(src,is_music);b.seekWhenReady=playbackTime;b.pauseWhenReady=d["paused"];if(pan)
{if(panObjUid!==-1)
{b.panWhenReady.push({objUid:panObjUid,ia:pan["ia"],oa:pan["oa"],og:pan["og"],thistag:tag});}
else
{b.panWhenReady.push({x:pan["x"],y:pan["y"],a:pan["a"],ia:pan["ia"],oa:pan["oa"],og:pan["og"],thistag:tag});}}
continue;}
a.resume_position=d["resume_position"];a.setPannerEnabled(!!pan);a.play(looping,vol,playbackTime);a.updatePlaybackRate();a.updateVolume();a.doSetMuted(a.is_muted||a.is_silent);if(d["paused"])
a.pause();if(d["muted"])
a.setMuted(true);a.doSetMuted(a.is_muted||a.is_silent);if(pan)
{if(panObjUid!==-1)
{a.objectTracker=a.objectTracker||new ObjectTracker();a.objectTracker.loadUid=panObjUid;objectTrackerUidsToLoad.push(a.objectTracker);}
else
{a.setPan(pan["x"],pan["y"],pan["a"],pan["ia"],pan["oa"],pan["og"]);}}}
if(setSilent&&!silent)
{for(i=0,len=audioInstances.length;i<len;i++)
audioInstances[i].setSilent(true);silent=true;}
else if(!setSilent&&silent)
{for(i=0,len=audioInstances.length;i<len;i++)
audioInstances[i].setSilent(false);silent=false;}};instanceProto.afterLoad=function()
{var i,len,ot,inst;for(i=0,len=objectTrackerUidsToLoad.length;i<len;i++)
{ot=objectTrackerUidsToLoad[i];inst=this.runtime.getObjectByUID(ot.loadUid);ot.setObject(inst);ot.loadUid=-1;if(inst)
{listenerX=inst.x;listenerY=inst.y;}}
cr.clearArray(objectTrackerUidsToLoad);};instanceProto.onSuspend=function(s)
{if(this.playinbackground)
return;if(!s&&context&&context["resume"])
{context["resume"]();isContextSuspended=false;}
var i,len;for(i=0,len=audioInstances.length;i<len;i++)
audioInstances[i].setSuspended(s);if(s&&context&&context["suspend"])
{context["suspend"]();isContextSuspended=true;}};instanceProto.tick=function()
{var dt=this.runtime.dt;var i,len,a;for(i=0,len=audioInstances.length;i<len;i++)
{a=audioInstances[i];a.tick(dt);if(timescale_mode!==0)
a.updatePlaybackRate();}
var p,arr,f;for(p in effects)
{if(effects.hasOwnProperty(p))
{arr=effects[p];for(i=0,len=arr.length;i<len;i++)
{f=arr[i];if(f.tick)
f.tick();}}}
if(api===API_WEBAUDIO&&this.listenerTracker.hasObject())
{this.listenerTracker.tick(dt);listenerX=this.listenerTracker.obj.x;listenerY=this.listenerTracker.obj.y;context["listener"]["setPosition"](this.listenerTracker.obj.x,this.listenerTracker.obj.y,this.listenerZ);}};var preload_list=[];instanceProto.setPreloadList=function(arr)
{var i,len,p,filename,size,isOgg;var total_size=0;for(i=0,len=arr.length;i<len;++i)
{p=arr[i];filename=p[0];size=p[1]*2;isOgg=(filename.length>4&&filename.substr(filename.length-4)===".ogg");if((isOgg&&useOgg)||(!isOgg&&!useOgg))
{preload_list.push({filename:filename,size:size,obj:null});total_size+=size;}}
return total_size;};instanceProto.startPreloads=function()
{var i,len,p,src;for(i=0,len=preload_list.length;i<len;++i)
{p=preload_list[i];src=this.runtime.files_subfolder+p.filename;p.obj=this.getAudioBuffer(src,false);}};instanceProto.getPreloadedSize=function()
{var completed=0;var i,len,p;for(i=0,len=preload_list.length;i<len;++i)
{p=preload_list[i];if(p.obj.isLoadedAndDecoded()||p.obj.hasFailedToLoad()||this.runtime.isDomFree||this.runtime.isAndroidStockBrowser)
{completed+=p.size;}
else if(p.obj.isLoaded())
{completed+=Math.floor(p.size/2);}};return completed;};instanceProto.releaseAllMusicBuffers=function()
{var i,len,j,b;for(i=0,j=0,len=audioBuffers.length;i<len;++i)
{b=audioBuffers[i];audioBuffers[j]=b;if(b.is_music)
b.release();else
++j;}
audioBuffers.length=j;};instanceProto.getAudioBuffer=function(src_,is_music,dont_create)
{var i,len,a,ret=null,j,k,lenj,ai;for(i=0,len=audioBuffers.length;i<len;i++)
{a=audioBuffers[i];if(a.src===src_)
{ret=a;break;}}
if(!ret&&!dont_create)
{if(playMusicAsSoundWorkaround&&is_music)
this.releaseAllMusicBuffers();ret=new C2AudioBuffer(src_,is_music);audioBuffers.push(ret);}
return ret;};instanceProto.getAudioInstance=function(src_,tag,is_music,looping,vol)
{var i,len,a;for(i=0,len=audioInstances.length;i<len;i++)
{a=audioInstances[i];if(a.src===src_&&(a.canBeRecycled()||is_music))
{a.tag=tag;return a;}}
var b=this.getAudioBuffer(src_,is_music);if(!b.bufferObject)
{if(tag!=="<preload>")
{b.playTagWhenReady=tag;b.loopWhenReady=looping;b.volumeWhenReady=vol;}
return null;}
a=new C2AudioInstance(b,tag);audioInstances.push(a);return a;};var taggedAudio=[];function SortByIsPlaying(a,b)
{var an=a.isPlaying()?1:0;var bn=b.isPlaying()?1:0;if(an===bn)
return 0;else if(an<bn)
return 1;else
return-1;};function getAudioByTag(tag,sort_by_playing)
{cr.clearArray(taggedAudio);if(!tag.length)
{if(!lastAudio||lastAudio.hasEnded())
return;else
{cr.clearArray(taggedAudio);taggedAudio[0]=lastAudio;return;}}
var i,len,a;for(i=0,len=audioInstances.length;i<len;i++)
{a=audioInstances[i];if(cr.equals_nocase(tag,a.tag))
taggedAudio.push(a);}
if(sort_by_playing)
taggedAudio.sort(SortByIsPlaying);};function reconnectEffects(tag)
{var i,len,arr,n,toNode=context["destination"];if(effects.hasOwnProperty(tag))
{arr=effects[tag];if(arr.length)
{toNode=arr[0].getInputNode();for(i=0,len=arr.length;i<len;i++)
{n=arr[i];if(i+1===len)
n.connectTo(context["destination"]);else
n.connectTo(arr[i+1].getInputNode());}}}
getAudioByTag(tag);for(i=0,len=taggedAudio.length;i<len;i++)
taggedAudio[i].reconnect(toNode);if(micSource&&micTag===tag)
{micSource["disconnect"]();micSource["connect"](toNode);}};function addEffectForTag(tag,fx)
{if(!effects.hasOwnProperty(tag))
effects[tag]=[fx];else
effects[tag].push(fx);reconnectEffects(tag);};function Cnds(){};Cnds.prototype.OnEnded=function(t)
{return cr.equals_nocase(audTag,t);};Cnds.prototype.PreloadsComplete=function()
{var i,len;for(i=0,len=audioBuffers.length;i<len;i++)
{if(!audioBuffers[i].isLoadedAndDecoded()&&!audioBuffers[i].hasFailedToLoad())
return false;}
return true;};Cnds.prototype.AdvancedAudioSupported=function()
{return api===API_WEBAUDIO;};Cnds.prototype.IsSilent=function()
{return silent;};Cnds.prototype.IsAnyPlaying=function()
{var i,len;for(i=0,len=audioInstances.length;i<len;i++)
{if(audioInstances[i].isPlaying())
return true;}
return false;};Cnds.prototype.IsTagPlaying=function(tag)
{getAudioByTag(tag);var i,len;for(i=0,len=taggedAudio.length;i<len;i++)
{if(taggedAudio[i].isPlaying())
return true;}
return false;};pluginProto.cnds=new Cnds();function Acts(){};Acts.prototype.Play=function(file,looping,vol,tag)
{if(silent)
return;var v=dbToLinear(vol);var is_music=file[1];var src=this.runtime.files_subfolder+file[0]+(useOgg?".ogg":".m4a");lastAudio=this.getAudioInstance(src,tag,is_music,looping!==0,v);if(!lastAudio)
return;lastAudio.setPannerEnabled(false);lastAudio.play(looping!==0,v,0,this.nextPlayTime);this.nextPlayTime=0;};Acts.prototype.PlayAtPosition=function(file,looping,vol,x_,y_,angle_,innerangle_,outerangle_,outergain_,tag)
{if(silent)
return;var v=dbToLinear(vol);var is_music=file[1];var src=this.runtime.files_subfolder+file[0]+(useOgg?".ogg":".m4a");lastAudio=this.getAudioInstance(src,tag,is_music,looping!==0,v);if(!lastAudio)
{var b=this.getAudioBuffer(src,is_music);b.panWhenReady.push({x:x_,y:y_,a:angle_,ia:innerangle_,oa:outerangle_,og:dbToLinear(outergain_),thistag:tag});return;}
lastAudio.setPannerEnabled(true);lastAudio.setPan(x_,y_,angle_,innerangle_,outerangle_,dbToLinear(outergain_));lastAudio.play(looping!==0,v,0,this.nextPlayTime);this.nextPlayTime=0;};Acts.prototype.PlayAtObject=function(file,looping,vol,obj,innerangle,outerangle,outergain,tag)
{if(silent||!obj)
return;var inst=obj.getFirstPicked();if(!inst)
return;var v=dbToLinear(vol);var is_music=file[1];var src=this.runtime.files_subfolder+file[0]+(useOgg?".ogg":".m4a");lastAudio=this.getAudioInstance(src,tag,is_music,looping!==0,v);if(!lastAudio)
{var b=this.getAudioBuffer(src,is_music);b.panWhenReady.push({obj:inst,ia:innerangle,oa:outerangle,og:dbToLinear(outergain),thistag:tag});return;}
lastAudio.setPannerEnabled(true);var px=cr.rotatePtAround(inst.x,inst.y,-inst.layer.getAngle(),listenerX,listenerY,true);var py=cr.rotatePtAround(inst.x,inst.y,-inst.layer.getAngle(),listenerX,listenerY,false);lastAudio.setPan(px,py,cr.to_degrees(inst.angle-inst.layer.getAngle()),innerangle,outerangle,dbToLinear(outergain));lastAudio.setObject(inst);lastAudio.play(looping!==0,v,0,this.nextPlayTime);this.nextPlayTime=0;};Acts.prototype.PlayByName=function(folder,filename,looping,vol,tag)
{if(silent)
return;var v=dbToLinear(vol);var is_music=(folder===1);var src=this.runtime.files_subfolder+filename.toLowerCase()+(useOgg?".ogg":".m4a");lastAudio=this.getAudioInstance(src,tag,is_music,looping!==0,v);if(!lastAudio)
return;lastAudio.setPannerEnabled(false);lastAudio.play(looping!==0,v,0,this.nextPlayTime);this.nextPlayTime=0;};Acts.prototype.PlayAtPositionByName=function(folder,filename,looping,vol,x_,y_,angle_,innerangle_,outerangle_,outergain_,tag)
{if(silent)
return;var v=dbToLinear(vol);var is_music=(folder===1);var src=this.runtime.files_subfolder+filename.toLowerCase()+(useOgg?".ogg":".m4a");lastAudio=this.getAudioInstance(src,tag,is_music,looping!==0,v);if(!lastAudio)
{var b=this.getAudioBuffer(src,is_music);b.panWhenReady.push({x:x_,y:y_,a:angle_,ia:innerangle_,oa:outerangle_,og:dbToLinear(outergain_),thistag:tag});return;}
lastAudio.setPannerEnabled(true);lastAudio.setPan(x_,y_,angle_,innerangle_,outerangle_,dbToLinear(outergain_));lastAudio.play(looping!==0,v,0,this.nextPlayTime);this.nextPlayTime=0;};Acts.prototype.PlayAtObjectByName=function(folder,filename,looping,vol,obj,innerangle,outerangle,outergain,tag)
{if(silent||!obj)
return;var inst=obj.getFirstPicked();if(!inst)
return;var v=dbToLinear(vol);var is_music=(folder===1);var src=this.runtime.files_subfolder+filename.toLowerCase()+(useOgg?".ogg":".m4a");lastAudio=this.getAudioInstance(src,tag,is_music,looping!==0,v);if(!lastAudio)
{var b=this.getAudioBuffer(src,is_music);b.panWhenReady.push({obj:inst,ia:innerangle,oa:outerangle,og:dbToLinear(outergain),thistag:tag});return;}
lastAudio.setPannerEnabled(true);var px=cr.rotatePtAround(inst.x,inst.y,-inst.layer.getAngle(),listenerX,listenerY,true);var py=cr.rotatePtAround(inst.x,inst.y,-inst.layer.getAngle(),listenerX,listenerY,false);lastAudio.setPan(px,py,cr.to_degrees(inst.angle-inst.layer.getAngle()),innerangle,outerangle,dbToLinear(outergain));lastAudio.setObject(inst);lastAudio.play(looping!==0,v,0,this.nextPlayTime);this.nextPlayTime=0;};Acts.prototype.SetLooping=function(tag,looping)
{getAudioByTag(tag);var i,len;for(i=0,len=taggedAudio.length;i<len;i++)
taggedAudio[i].setLooping(looping===0);};Acts.prototype.SetMuted=function(tag,muted)
{getAudioByTag(tag);var i,len;for(i=0,len=taggedAudio.length;i<len;i++)
taggedAudio[i].setMuted(muted===0);};Acts.prototype.SetVolume=function(tag,vol)
{getAudioByTag(tag);var v=dbToLinear(vol);var i,len;for(i=0,len=taggedAudio.length;i<len;i++)
taggedAudio[i].setVolume(v);};Acts.prototype.Preload=function(file)
{if(silent)
return;var is_music=file[1];var src=this.runtime.files_subfolder+file[0]+(useOgg?".ogg":".m4a");if(api===API_APPMOBI)
{if(this.runtime.isDirectCanvas)
AppMobi["context"]["loadSound"](src);else
AppMobi["player"]["loadSound"](src);return;}
else if(api===API_CORDOVA)
{return;}
this.getAudioInstance(src,"<preload>",is_music,false);};Acts.prototype.PreloadByName=function(folder,filename)
{if(silent)
return;var is_music=(folder===1);var src=this.runtime.files_subfolder+filename.toLowerCase()+(useOgg?".ogg":".m4a");if(api===API_APPMOBI)
{if(this.runtime.isDirectCanvas)
AppMobi["context"]["loadSound"](src);else
AppMobi["player"]["loadSound"](src);return;}
else if(api===API_CORDOVA)
{return;}
this.getAudioInstance(src,"<preload>",is_music,false);};Acts.prototype.SetPlaybackRate=function(tag,rate)
{getAudioByTag(tag);if(rate<0.0)
rate=0;var i,len;for(i=0,len=taggedAudio.length;i<len;i++)
taggedAudio[i].setPlaybackRate(rate);};Acts.prototype.Stop=function(tag)
{getAudioByTag(tag);var i,len;for(i=0,len=taggedAudio.length;i<len;i++)
taggedAudio[i].stop();};Acts.prototype.StopAll=function()
{var i,len;for(i=0,len=audioInstances.length;i<len;i++)
audioInstances[i].stop();};Acts.prototype.SetPaused=function(tag,state)
{getAudioByTag(tag);var i,len;for(i=0,len=taggedAudio.length;i<len;i++)
{if(state===0)
taggedAudio[i].pause();else
taggedAudio[i].resume();}};Acts.prototype.Seek=function(tag,pos)
{getAudioByTag(tag);var i,len;for(i=0,len=taggedAudio.length;i<len;i++)
{taggedAudio[i].seek(pos);}};Acts.prototype.SetSilent=function(s)
{var i,len;if(s===2)
s=(silent?1:0);if(s===0&&!silent)
{for(i=0,len=audioInstances.length;i<len;i++)
audioInstances[i].setSilent(true);silent=true;}
else if(s===1&&silent)
{for(i=0,len=audioInstances.length;i<len;i++)
audioInstances[i].setSilent(false);silent=false;}};Acts.prototype.SetMasterVolume=function(vol)
{masterVolume=dbToLinear(vol);var i,len;for(i=0,len=audioInstances.length;i<len;i++)
audioInstances[i].updateVolume();};Acts.prototype.AddFilterEffect=function(tag,type,freq,detune,q,gain,mix)
{if(api!==API_WEBAUDIO||type<0||type>=filterTypes.length||!context["createBiquadFilter"])
return;tag=tag.toLowerCase();mix=mix/100;if(mix<0)mix=0;if(mix>1)mix=1;addEffectForTag(tag,new FilterEffect(type,freq,detune,q,gain,mix));};Acts.prototype.AddDelayEffect=function(tag,delay,gain,mix)
{if(api!==API_WEBAUDIO)
return;tag=tag.toLowerCase();mix=mix/100;if(mix<0)mix=0;if(mix>1)mix=1;addEffectForTag(tag,new DelayEffect(delay,dbToLinear(gain),mix));};Acts.prototype.AddFlangerEffect=function(tag,delay,modulation,freq,feedback,mix)
{if(api!==API_WEBAUDIO||!context["createOscillator"])
return;tag=tag.toLowerCase();mix=mix/100;if(mix<0)mix=0;if(mix>1)mix=1;addEffectForTag(tag,new FlangerEffect(delay/1000,modulation/1000,freq,feedback/100,mix));};Acts.prototype.AddPhaserEffect=function(tag,freq,detune,q,mod,modfreq,mix)
{if(api!==API_WEBAUDIO||!context["createOscillator"])
return;tag=tag.toLowerCase();mix=mix/100;if(mix<0)mix=0;if(mix>1)mix=1;addEffectForTag(tag,new PhaserEffect(freq,detune,q,mod,modfreq,mix));};Acts.prototype.AddConvolutionEffect=function(tag,file,norm,mix)
{if(api!==API_WEBAUDIO||!context["createConvolver"])
return;var doNormalize=(norm===0);var src=this.runtime.files_subfolder+file[0]+(useOgg?".ogg":".m4a");var b=this.getAudioBuffer(src,false);tag=tag.toLowerCase();mix=mix/100;if(mix<0)mix=0;if(mix>1)mix=1;var fx;if(b.bufferObject)
{fx=new ConvolveEffect(b.bufferObject,doNormalize,mix,src);}
else
{fx=new ConvolveEffect(null,doNormalize,mix,src);b.normalizeWhenReady=doNormalize;b.convolveWhenReady=fx;}
addEffectForTag(tag,fx);};Acts.prototype.AddGainEffect=function(tag,g)
{if(api!==API_WEBAUDIO)
return;tag=tag.toLowerCase();addEffectForTag(tag,new GainEffect(dbToLinear(g)));};Acts.prototype.AddMuteEffect=function(tag)
{if(api!==API_WEBAUDIO)
return;tag=tag.toLowerCase();addEffectForTag(tag,new GainEffect(0));};Acts.prototype.AddTremoloEffect=function(tag,freq,mix)
{if(api!==API_WEBAUDIO||!context["createOscillator"])
return;tag=tag.toLowerCase();mix=mix/100;if(mix<0)mix=0;if(mix>1)mix=1;addEffectForTag(tag,new TremoloEffect(freq,mix));};Acts.prototype.AddRingModEffect=function(tag,freq,mix)
{if(api!==API_WEBAUDIO||!context["createOscillator"])
return;tag=tag.toLowerCase();mix=mix/100;if(mix<0)mix=0;if(mix>1)mix=1;addEffectForTag(tag,new RingModulatorEffect(freq,mix));};Acts.prototype.AddDistortionEffect=function(tag,threshold,headroom,drive,makeupgain,mix)
{if(api!==API_WEBAUDIO||!context["createWaveShaper"])
return;tag=tag.toLowerCase();mix=mix/100;if(mix<0)mix=0;if(mix>1)mix=1;addEffectForTag(tag,new DistortionEffect(threshold,headroom,drive,makeupgain,mix));};Acts.prototype.AddCompressorEffect=function(tag,threshold,knee,ratio,attack,release)
{if(api!==API_WEBAUDIO||!context["createDynamicsCompressor"])
return;tag=tag.toLowerCase();addEffectForTag(tag,new CompressorEffect(threshold,knee,ratio,attack/1000,release/1000));};Acts.prototype.AddAnalyserEffect=function(tag,fftSize,smoothing)
{if(api!==API_WEBAUDIO)
return;tag=tag.toLowerCase();addEffectForTag(tag,new AnalyserEffect(fftSize,smoothing));};Acts.prototype.RemoveEffects=function(tag)
{if(api!==API_WEBAUDIO)
return;tag=tag.toLowerCase();var i,len,arr;if(effects.hasOwnProperty(tag))
{arr=effects[tag];if(arr.length)
{for(i=0,len=arr.length;i<len;i++)
arr[i].remove();cr.clearArray(arr);reconnectEffects(tag);}}};Acts.prototype.SetEffectParameter=function(tag,index,param,value,ramp,time)
{if(api!==API_WEBAUDIO)
return;tag=tag.toLowerCase();index=Math.floor(index);var arr;if(!effects.hasOwnProperty(tag))
return;arr=effects[tag];if(index<0||index>=arr.length)
return;arr[index].setParam(param,value,ramp,time);};Acts.prototype.SetListenerObject=function(obj_)
{if(!obj_||api!==API_WEBAUDIO)
return;var inst=obj_.getFirstPicked();if(!inst)
return;this.listenerTracker.setObject(inst);listenerX=inst.x;listenerY=inst.y;};Acts.prototype.SetListenerZ=function(z)
{this.listenerZ=z;};Acts.prototype.ScheduleNextPlay=function(t)
{if(!context)
return;this.nextPlayTime=t;};Acts.prototype.UnloadAudio=function(file)
{var is_music=file[1];var src=this.runtime.files_subfolder+file[0]+(useOgg?".ogg":".m4a");var b=this.getAudioBuffer(src,is_music,true);if(!b)
return;b.release();cr.arrayFindRemove(audioBuffers,b);};Acts.prototype.UnloadAudioByName=function(folder,filename)
{var is_music=(folder===1);var src=this.runtime.files_subfolder+filename.toLowerCase()+(useOgg?".ogg":".m4a");var b=this.getAudioBuffer(src,is_music,true);if(!b)
return;b.release();cr.arrayFindRemove(audioBuffers,b);};Acts.prototype.UnloadAll=function()
{var i,len;for(i=0,len=audioBuffers.length;i<len;++i)
{audioBuffers[i].release();};cr.clearArray(audioBuffers);};pluginProto.acts=new Acts();function Exps(){};Exps.prototype.Duration=function(ret,tag)
{getAudioByTag(tag,true);if(taggedAudio.length)
ret.set_float(taggedAudio[0].getDuration());else
ret.set_float(0);};Exps.prototype.PlaybackTime=function(ret,tag)
{getAudioByTag(tag,true);if(taggedAudio.length)
ret.set_float(taggedAudio[0].getPlaybackTime(true));else
ret.set_float(0);};Exps.prototype.Volume=function(ret,tag)
{getAudioByTag(tag,true);if(taggedAudio.length)
{var v=taggedAudio[0].getVolume();ret.set_float(linearToDb(v));}
else
ret.set_float(0);};Exps.prototype.MasterVolume=function(ret)
{ret.set_float(linearToDb(masterVolume));};Exps.prototype.EffectCount=function(ret,tag)
{tag=tag.toLowerCase();var arr=null;if(effects.hasOwnProperty(tag))
arr=effects[tag];ret.set_int(arr?arr.length:0);};function getAnalyser(tag,index)
{var arr=null;if(effects.hasOwnProperty(tag))
arr=effects[tag];if(arr&&index>=0&&index<arr.length&&arr[index].freqBins)
return arr[index];else
return null;};Exps.prototype.AnalyserFreqBinCount=function(ret,tag,index)
{tag=tag.toLowerCase();index=Math.floor(index);var analyser=getAnalyser(tag,index);ret.set_int(analyser?analyser.node["frequencyBinCount"]:0);};Exps.prototype.AnalyserFreqBinAt=function(ret,tag,index,bin)
{tag=tag.toLowerCase();index=Math.floor(index);bin=Math.floor(bin);var analyser=getAnalyser(tag,index);if(!analyser)
ret.set_float(0);else if(bin<0||bin>=analyser.node["frequencyBinCount"])
ret.set_float(0);else
ret.set_float(analyser.freqBins[bin]);};Exps.prototype.AnalyserPeakLevel=function(ret,tag,index)
{tag=tag.toLowerCase();index=Math.floor(index);var analyser=getAnalyser(tag,index);if(analyser)
ret.set_float(analyser.peak);else
ret.set_float(0);};Exps.prototype.AnalyserRMSLevel=function(ret,tag,index)
{tag=tag.toLowerCase();index=Math.floor(index);var analyser=getAnalyser(tag,index);if(analyser)
ret.set_float(analyser.rms);else
ret.set_float(0);};Exps.prototype.SampleRate=function(ret)
{ret.set_int(context?context.sampleRate:0);};Exps.prototype.CurrentTime=function(ret)
{ret.set_float(context?context.currentTime:cr.performance_now());};pluginProto.exps=new Exps();}());;;cr.plugins_.Browser=function(runtime)
{this.runtime=runtime;};(function()
{var pluginProto=cr.plugins_.Browser.prototype;pluginProto.Type=function(plugin)
{this.plugin=plugin;this.runtime=plugin.runtime;};var typeProto=pluginProto.Type.prototype;typeProto.onCreate=function()
{};var offlineScriptReady=false;var browserPluginReady=false;document.addEventListener("DOMContentLoaded",function()
{if(window["C2_RegisterSW"]&&navigator.serviceWorker)
{var offlineClientScript=document.createElement("script");offlineClientScript.onload=function()
{offlineScriptReady=true;checkReady()};offlineClientScript.src="offlineClient.js";document.head.appendChild(offlineClientScript);}});var browserInstance=null;typeProto.onAppBegin=function()
{browserPluginReady=true;checkReady();};function checkReady()
{if(offlineScriptReady&&browserPluginReady&&window["OfflineClientInfo"])
{window["OfflineClientInfo"]["SetMessageCallback"](function(e)
{browserInstance.onSWMessage(e);});}};pluginProto.Instance=function(type)
{this.type=type;this.runtime=type.runtime;};var instanceProto=pluginProto.Instance.prototype;instanceProto.onCreate=function()
{var self=this;window.addEventListener("resize",function(){self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnResize,self);});browserInstance=this;if(typeof navigator.onLine!=="undefined")
{window.addEventListener("online",function(){self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnOnline,self);});window.addEventListener("offline",function(){self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnOffline,self);});}
if(typeof window.applicationCache!=="undefined")
{window.applicationCache.addEventListener('updateready',function(){self.runtime.loadingprogress=1;self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnUpdateReady,self);});window.applicationCache.addEventListener('progress',function(e){self.runtime.loadingprogress=(e["loaded"]/e["total"])||0;});}
if(!this.runtime.isDirectCanvas)
{document.addEventListener("appMobi.device.update.available",function(){self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnUpdateReady,self);});document.addEventListener("backbutton",function(){self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnBackButton,self);});document.addEventListener("menubutton",function(){self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnMenuButton,self);});document.addEventListener("searchbutton",function(){self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnSearchButton,self);});document.addEventListener("tizenhwkey",function(e){var ret;switch(e["keyName"]){case "back":ret=self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnBackButton,self);if(!ret)
{if(window["tizen"])
window["tizen"]["application"]["getCurrentApplication"]()["exit"]();}
break;case "menu":ret=self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnMenuButton,self);if(!ret)
e.preventDefault();break;}});}
if(this.runtime.isWindows10&&typeof Windows!=="undefined")
{Windows["UI"]["Core"]["SystemNavigationManager"]["getForCurrentView"]().addEventListener("backrequested",function(e)
{var ret=self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnBackButton,self);if(ret)
e["handled"]=true;});}
else if(this.runtime.isWinJS&&WinJS["Application"])
{WinJS["Application"]["onbackclick"]=function(e)
{return!!self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnBackButton,self);};}
this.runtime.addSuspendCallback(function(s){if(s)
{self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnPageHidden,self);}
else
{self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnPageVisible,self);}});this.is_arcade=(typeof window["is_scirra_arcade"]!=="undefined");};instanceProto.onSWMessage=function(e)
{var messageType=e.data.type;if(messageType==="downloading-update")
this.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnUpdateFound,this);else if(messageType==="update-ready"||messageType==="update-pending")
this.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnUpdateReady,this);else if(messageType==="offline-ready")
this.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnOfflineReady,this);};var batteryManager=null;var loadedBatteryManager=false;function maybeLoadBatteryManager()
{if(loadedBatteryManager)
return;if(!navigator["getBattery"])
return;var promise=navigator["getBattery"]();loadedBatteryManager=true;if(promise)
{promise.then(function(manager){batteryManager=manager;});}};function Cnds(){};Cnds.prototype.CookiesEnabled=function()
{return navigator?navigator.cookieEnabled:false;};Cnds.prototype.IsOnline=function()
{return navigator?navigator.onLine:false;};Cnds.prototype.HasJava=function()
{return navigator?navigator.javaEnabled():false;};Cnds.prototype.OnOnline=function()
{return true;};Cnds.prototype.OnOffline=function()
{return true;};Cnds.prototype.IsDownloadingUpdate=function()
{if(typeof window["applicationCache"]==="undefined")
return false;else
return window["applicationCache"]["status"]===window["applicationCache"]["DOWNLOADING"];};Cnds.prototype.OnUpdateReady=function()
{return true;};Cnds.prototype.PageVisible=function()
{return!this.runtime.isSuspended;};Cnds.prototype.OnPageVisible=function()
{return true;};Cnds.prototype.OnPageHidden=function()
{return true;};Cnds.prototype.OnResize=function()
{return true;};Cnds.prototype.IsFullscreen=function()
{return!!(document["mozFullScreen"]||document["webkitIsFullScreen"]||document["fullScreen"]||this.runtime.isNodeFullscreen);};Cnds.prototype.OnBackButton=function()
{return true;};Cnds.prototype.OnMenuButton=function()
{return true;};Cnds.prototype.OnSearchButton=function()
{return true;};Cnds.prototype.IsMetered=function()
{var connection=navigator["connection"]||navigator["mozConnection"]||navigator["webkitConnection"];if(!connection)
return false;return!!connection["metered"];};Cnds.prototype.IsCharging=function()
{var battery=navigator["battery"]||navigator["mozBattery"]||navigator["webkitBattery"];if(battery)
{return!!battery["charging"]}
else
{maybeLoadBatteryManager();if(batteryManager)
{return!!batteryManager["charging"];}
else
{return true;}}};Cnds.prototype.IsPortraitLandscape=function(p)
{var current=(window.innerWidth<=window.innerHeight?0:1);return current===p;};Cnds.prototype.SupportsFullscreen=function()
{if(this.runtime.isNodeWebkit)
return true;var elem=this.runtime.canvasdiv||this.runtime.canvas;return!!(elem["requestFullscreen"]||elem["mozRequestFullScreen"]||elem["msRequestFullscreen"]||elem["webkitRequestFullScreen"]);};Cnds.prototype.OnUpdateFound=function()
{return true;};Cnds.prototype.OnUpdateReady=function()
{return true;};Cnds.prototype.OnOfflineReady=function()
{return true;};pluginProto.cnds=new Cnds();function Acts(){};Acts.prototype.Alert=function(msg)
{if(!this.runtime.isDomFree)
alert(msg.toString());};Acts.prototype.Close=function()
{if(this.runtime.isCocoonJs)
CocoonJS["App"]["forceToFinish"]();else if(window["tizen"])
window["tizen"]["application"]["getCurrentApplication"]()["exit"]();else if(navigator["app"]&&navigator["app"]["exitApp"])
navigator["app"]["exitApp"]();else if(navigator["device"]&&navigator["device"]["exitApp"])
navigator["device"]["exitApp"]();else if(!this.is_arcade&&!this.runtime.isDomFree)
window.close();};Acts.prototype.Focus=function()
{if(this.runtime.isNodeWebkit)
{var win=window["nwgui"]["Window"]["get"]();win["focus"]();}
else if(!this.is_arcade&&!this.runtime.isDomFree)
window.focus();};Acts.prototype.Blur=function()
{if(this.runtime.isNodeWebkit)
{var win=window["nwgui"]["Window"]["get"]();win["blur"]();}
else if(!this.is_arcade&&!this.runtime.isDomFree)
window.blur();};Acts.prototype.GoBack=function()
{if(navigator["app"]&&navigator["app"]["backHistory"])
navigator["app"]["backHistory"]();else if(!this.is_arcade&&!this.runtime.isDomFree&&window.back)
window.back();};Acts.prototype.GoForward=function()
{if(!this.is_arcade&&!this.runtime.isDomFree&&window.forward)
window.forward();};Acts.prototype.GoHome=function()
{if(!this.is_arcade&&!this.runtime.isDomFree&&window.home)
window.home();};Acts.prototype.GoToURL=function(url,target)
{if(this.runtime.isCocoonJs)
CocoonJS["App"]["openURL"](url);else if(this.runtime.isEjecta)
ejecta["openURL"](url);else if(this.runtime.isWinJS)
Windows["System"]["Launcher"]["launchUriAsync"](new Windows["Foundation"]["Uri"](url));else if(navigator["app"]&&navigator["app"]["loadUrl"])
navigator["app"]["loadUrl"](url,{"openExternal":true});else if(this.runtime.isCordova)
window.open(url,"_system");else if(!this.is_arcade&&!this.runtime.isDomFree)
{if(target===2&&!this.is_arcade)
window.top.location=url;else if(target===1&&!this.is_arcade)
window.parent.location=url;else
window.location=url;}};Acts.prototype.GoToURLWindow=function(url,tag)
{if(this.runtime.isCocoonJs)
CocoonJS["App"]["openURL"](url);else if(this.runtime.isEjecta)
ejecta["openURL"](url);else if(this.runtime.isWinJS)
Windows["System"]["Launcher"]["launchUriAsync"](new Windows["Foundation"]["Uri"](url));else if(navigator["app"]&&navigator["app"]["loadUrl"])
navigator["app"]["loadUrl"](url,{"openExternal":true});else if(this.runtime.isCordova)
window.open(url,"_system");else if(!this.is_arcade&&!this.runtime.isDomFree)
window.open(url,tag);};Acts.prototype.Reload=function()
{if(!this.is_arcade&&!this.runtime.isDomFree)
window.location.reload();};var firstRequestFullscreen=true;var crruntime=null;function onFullscreenError(e)
{if(console&&console.warn)
console.warn("Fullscreen request failed: ",e);crruntime["setSize"](window.innerWidth,window.innerHeight);};Acts.prototype.RequestFullScreen=function(stretchmode)
{if(this.runtime.isDomFree)
{cr.logexport("[Construct 2] Requesting fullscreen is not supported on this platform - the request has been ignored");return;}
if(stretchmode>=2)
stretchmode+=1;if(stretchmode===6)
stretchmode=2;if(this.runtime.isNodeWebkit)
{if(this.runtime.isDebug)
{debuggerFullscreen(true);}
else if(!this.runtime.isNodeFullscreen&&window["nwgui"])
{window["nwgui"]["Window"]["get"]()["enterFullscreen"]();this.runtime.isNodeFullscreen=true;this.runtime.fullscreen_scaling=(stretchmode>=2?stretchmode:0);}}
else
{if(document["mozFullScreen"]||document["webkitIsFullScreen"]||!!document["msFullscreenElement"]||document["fullScreen"]||document["fullScreenElement"])
{return;}
this.runtime.fullscreen_scaling=(stretchmode>=2?stretchmode:0);var elem=document.documentElement;if(firstRequestFullscreen)
{firstRequestFullscreen=false;crruntime=this.runtime;elem.addEventListener("mozfullscreenerror",onFullscreenError);elem.addEventListener("webkitfullscreenerror",onFullscreenError);elem.addEventListener("MSFullscreenError",onFullscreenError);elem.addEventListener("fullscreenerror",onFullscreenError);}
if(elem["requestFullscreen"])
elem["requestFullscreen"]();else if(elem["mozRequestFullScreen"])
elem["mozRequestFullScreen"]();else if(elem["msRequestFullscreen"])
elem["msRequestFullscreen"]();else if(elem["webkitRequestFullScreen"])
{if(typeof Element!=="undefined"&&typeof Element["ALLOW_KEYBOARD_INPUT"]!=="undefined")
elem["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);else
elem["webkitRequestFullScreen"]();}}};Acts.prototype.CancelFullScreen=function()
{if(this.runtime.isDomFree)
{cr.logexport("[Construct 2] Exiting fullscreen is not supported on this platform - the request has been ignored");return;}
if(this.runtime.isNodeWebkit)
{if(this.runtime.isDebug)
{debuggerFullscreen(false);}
else if(this.runtime.isNodeFullscreen&&window["nwgui"])
{window["nwgui"]["Window"]["get"]()["leaveFullscreen"]();this.runtime.isNodeFullscreen=false;}}
else
{if(document["exitFullscreen"])
document["exitFullscreen"]();else if(document["mozCancelFullScreen"])
document["mozCancelFullScreen"]();else if(document["msExitFullscreen"])
document["msExitFullscreen"]();else if(document["webkitCancelFullScreen"])
document["webkitCancelFullScreen"]();}};Acts.prototype.Vibrate=function(pattern_)
{try{var arr=pattern_.split(",");var i,len;for(i=0,len=arr.length;i<len;i++)
{arr[i]=parseInt(arr[i],10);}
if(navigator["vibrate"])
navigator["vibrate"](arr);else if(navigator["mozVibrate"])
navigator["mozVibrate"](arr);else if(navigator["webkitVibrate"])
navigator["webkitVibrate"](arr);else if(navigator["msVibrate"])
navigator["msVibrate"](arr);}
catch(e){}};Acts.prototype.InvokeDownload=function(url_,filename_)
{var a=document.createElement("a");if(typeof a["download"]==="undefined")
{window.open(url_);}
else
{var body=document.getElementsByTagName("body")[0];a.textContent=filename_;a.href=url_;a["download"]=filename_;body.appendChild(a);var clickEvent=new MouseEvent("click");a.dispatchEvent(clickEvent);body.removeChild(a);}};Acts.prototype.InvokeDownloadString=function(str_,mimetype_,filename_)
{var datauri="data:"+mimetype_+","+encodeURIComponent(str_);var a=document.createElement("a");if(typeof a["download"]==="undefined")
{window.open(datauri);}
else
{var body=document.getElementsByTagName("body")[0];a.textContent=filename_;a.href=datauri;a["download"]=filename_;body.appendChild(a);var clickEvent=new MouseEvent("click");a.dispatchEvent(clickEvent);body.removeChild(a);}};Acts.prototype.ConsoleLog=function(type_,msg_)
{if(typeof console==="undefined")
return;if(type_===0&&console.log)
console.log(msg_.toString());if(type_===1&&console.warn)
console.warn(msg_.toString());if(type_===2&&console.error)
console.error(msg_.toString());};Acts.prototype.ConsoleGroup=function(name_)
{if(console&&console.group)
console.group(name_);};Acts.prototype.ConsoleGroupEnd=function()
{if(console&&console.groupEnd)
console.groupEnd();};Acts.prototype.ExecJs=function(js_)
{try{if(eval)
eval(js_);}
catch(e)
{if(console&&console.error)
console.error("Error executing Javascript: ",e);}};var orientations=["portrait","landscape","portrait-primary","portrait-secondary","landscape-primary","landscape-secondary"];Acts.prototype.LockOrientation=function(o)
{o=Math.floor(o);if(o<0||o>=orientations.length)
return;this.runtime.autoLockOrientation=false;var orientation=orientations[o];if(screen["orientation"]&&screen["orientation"]["lock"])
screen["orientation"]["lock"](orientation);else if(screen["lockOrientation"])
screen["lockOrientation"](orientation);else if(screen["webkitLockOrientation"])
screen["webkitLockOrientation"](orientation);else if(screen["mozLockOrientation"])
screen["mozLockOrientation"](orientation);else if(screen["msLockOrientation"])
screen["msLockOrientation"](orientation);};Acts.prototype.UnlockOrientation=function()
{this.runtime.autoLockOrientation=false;if(screen["orientation"]&&screen["orientation"]["unlock"])
screen["orientation"]["unlock"]();else if(screen["unlockOrientation"])
screen["unlockOrientation"]();else if(screen["webkitUnlockOrientation"])
screen["webkitUnlockOrientation"]();else if(screen["mozUnlockOrientation"])
screen["mozUnlockOrientation"]();else if(screen["msUnlockOrientation"])
screen["msUnlockOrientation"]();};pluginProto.acts=new Acts();function Exps(){};Exps.prototype.URL=function(ret)
{ret.set_string(this.runtime.isDomFree?"":window.location.toString());};Exps.prototype.Protocol=function(ret)
{ret.set_string(this.runtime.isDomFree?"":window.location.protocol);};Exps.prototype.Domain=function(ret)
{ret.set_string(this.runtime.isDomFree?"":window.location.hostname);};Exps.prototype.PathName=function(ret)
{ret.set_string(this.runtime.isDomFree?"":window.location.pathname);};Exps.prototype.Hash=function(ret)
{ret.set_string(this.runtime.isDomFree?"":window.location.hash);};Exps.prototype.Referrer=function(ret)
{ret.set_string(this.runtime.isDomFree?"":document.referrer);};Exps.prototype.Title=function(ret)
{ret.set_string(this.runtime.isDomFree?"":document.title);};Exps.prototype.Name=function(ret)
{ret.set_string(this.runtime.isDomFree?"":navigator.appName);};Exps.prototype.Version=function(ret)
{ret.set_string(this.runtime.isDomFree?"":navigator.appVersion);};Exps.prototype.Language=function(ret)
{if(navigator&&navigator.language)
ret.set_string(navigator.language);else
ret.set_string("");};Exps.prototype.Platform=function(ret)
{ret.set_string(this.runtime.isDomFree?"":navigator.platform);};Exps.prototype.Product=function(ret)
{if(navigator&&navigator.product)
ret.set_string(navigator.product);else
ret.set_string("");};Exps.prototype.Vendor=function(ret)
{if(navigator&&navigator.vendor)
ret.set_string(navigator.vendor);else
ret.set_string("");};Exps.prototype.UserAgent=function(ret)
{ret.set_string(this.runtime.isDomFree?"":navigator.userAgent);};Exps.prototype.QueryString=function(ret)
{ret.set_string(this.runtime.isDomFree?"":window.location.search);};Exps.prototype.QueryParam=function(ret,paramname)
{if(this.runtime.isDomFree)
{ret.set_string("");return;}
var match=RegExp('[?&]'+paramname+'=([^&]*)').exec(window.location.search);if(match)
ret.set_string(decodeURIComponent(match[1].replace(/\+/g,' ')));else
ret.set_string("");};Exps.prototype.Bandwidth=function(ret)
{var connection=navigator["connection"]||navigator["mozConnection"]||navigator["webkitConnection"];if(!connection)
ret.set_float(Number.POSITIVE_INFINITY);else
{if(typeof connection["bandwidth"]!=="undefined")
ret.set_float(connection["bandwidth"]);else if(typeof connection["downlinkMax"]!=="undefined")
ret.set_float(connection["downlinkMax"]);else
ret.set_float(Number.POSITIVE_INFINITY);}};Exps.prototype.ConnectionType=function(ret)
{var connection=navigator["connection"]||navigator["mozConnection"]||navigator["webkitConnection"];if(!connection)
ret.set_string("unknown");else
{ret.set_string(connection["type"]||"unknown");}};Exps.prototype.BatteryLevel=function(ret)
{var battery=navigator["battery"]||navigator["mozBattery"]||navigator["webkitBattery"];if(battery)
{ret.set_float(battery["level"]);}
else
{maybeLoadBatteryManager();if(batteryManager)
{ret.set_float(batteryManager["level"]);}
else
{ret.set_float(1);}}};Exps.prototype.BatteryTimeLeft=function(ret)
{var battery=navigator["battery"]||navigator["mozBattery"]||navigator["webkitBattery"];if(battery)
{ret.set_float(battery["dischargingTime"]);}
else
{maybeLoadBatteryManager();if(batteryManager)
{ret.set_float(batteryManager["dischargingTime"]);}
else
{ret.set_float(Number.POSITIVE_INFINITY);}}};Exps.prototype.ExecJS=function(ret,js_)
{if(!eval)
{ret.set_any(0);return;}
var result=0;try{result=eval(js_);}
catch(e)
{if(console&&console.error)
console.error("Error executing Javascript: ",e);}
if(typeof result==="number")
ret.set_any(result);else if(typeof result==="string")
ret.set_any(result);else if(typeof result==="boolean")
ret.set_any(result?1:0);else
ret.set_any(0);};Exps.prototype.ScreenWidth=function(ret)
{ret.set_int(screen.width);};Exps.prototype.ScreenHeight=function(ret)
{ret.set_int(screen.height);};Exps.prototype.DevicePixelRatio=function(ret)
{ret.set_float(this.runtime.devicePixelRatio);};Exps.prototype.WindowInnerWidth=function(ret)
{ret.set_int(window.innerWidth);};Exps.prototype.WindowInnerHeight=function(ret)
{ret.set_int(window.innerHeight);};Exps.prototype.WindowOuterWidth=function(ret)
{ret.set_int(window.outerWidth);};Exps.prototype.WindowOuterHeight=function(ret)
{ret.set_int(window.outerHeight);};pluginProto.exps=new Exps();}());;;cr.plugins_.Button=function(runtime)
{this.runtime=runtime;};(function()
{var pluginProto=cr.plugins_.Button.prototype;pluginProto.Type=function(plugin)
{this.plugin=plugin;this.runtime=plugin.runtime;};var typeProto=pluginProto.Type.prototype;typeProto.onCreate=function()
{};pluginProto.Instance=function(type)
{this.type=type;this.runtime=type.runtime;};var instanceProto=pluginProto.Instance.prototype;instanceProto.onCreate=function()
{if(this.runtime.isDomFree)
{cr.logexport("[Construct 2] Button plugin not supported on this platform - the object will not be created");return;}
this.isCheckbox=(this.properties[0]===1);this.inputElem=document.createElement("input");if(this.isCheckbox)
this.elem=document.createElement("label");else
this.elem=this.inputElem;this.labelText=null;this.inputElem.type=(this.isCheckbox?"checkbox":"button");this.inputElem.id=this.properties[6];jQuery(this.elem).appendTo(this.runtime.canvasdiv?this.runtime.canvasdiv:"body");if(this.isCheckbox)
{jQuery(this.inputElem).appendTo(this.elem);this.labelText=document.createTextNode(this.properties[1]);jQuery(this.elem).append(this.labelText);this.inputElem.checked=(this.properties[7]!==0);jQuery(this.elem).css("font-family","sans-serif");jQuery(this.elem).css("display","inline-block");jQuery(this.elem).css("color","black");}
else
this.inputElem.value=this.properties[1];this.elem.title=this.properties[2];this.inputElem.disabled=(this.properties[4]===0);this.autoFontSize=(this.properties[5]!==0);this.element_hidden=false;if(this.properties[3]===0)
{jQuery(this.elem).hide();this.visible=false;this.element_hidden=true;}
this.inputElem.onclick=(function(self){return function(e){e.stopPropagation();self.runtime.isInUserInputEvent=true;self.runtime.trigger(cr.plugins_.Button.prototype.cnds.OnClicked,self);self.runtime.isInUserInputEvent=false;};})(this);this.elem.addEventListener("touchstart",function(e){e.stopPropagation();},false);this.elem.addEventListener("touchmove",function(e){e.stopPropagation();},false);this.elem.addEventListener("touchend",function(e){e.stopPropagation();},false);jQuery(this.elem).mousedown(function(e){e.stopPropagation();});jQuery(this.elem).mouseup(function(e){e.stopPropagation();});jQuery(this.elem).keydown(function(e){e.stopPropagation();});jQuery(this.elem).keyup(function(e){e.stopPropagation();});this.lastLeft=0;this.lastTop=0;this.lastRight=0;this.lastBottom=0;this.lastWinWidth=0;this.lastWinHeight=0;this.updatePosition(true);this.runtime.tickMe(this);};instanceProto.saveToJSON=function()
{var o={"tooltip":this.elem.title,"disabled":!!this.inputElem.disabled};if(this.isCheckbox)
{o["checked"]=!!this.inputElem.checked;o["text"]=this.labelText.nodeValue;}
else
{o["text"]=this.elem.value;}
return o;};instanceProto.loadFromJSON=function(o)
{this.elem.title=o["tooltip"];this.inputElem.disabled=o["disabled"];if(this.isCheckbox)
{this.inputElem.checked=o["checked"];this.labelText.nodeValue=o["text"];}
else
{this.elem.value=o["text"];}};instanceProto.onDestroy=function()
{if(this.runtime.isDomFree)
return;jQuery(this.elem).remove();this.elem=null;};instanceProto.tick=function()
{this.updatePosition();};var last_canvas_offset=null;var last_checked_tick=-1;instanceProto.updatePosition=function(first)
{if(this.runtime.isDomFree)
return;var left=this.layer.layerToCanvas(this.x,this.y,true);var top=this.layer.layerToCanvas(this.x,this.y,false);var right=this.layer.layerToCanvas(this.x+this.width,this.y+this.height,true);var bottom=this.layer.layerToCanvas(this.x+this.width,this.y+this.height,false);var rightEdge=this.runtime.width/this.runtime.devicePixelRatio;var bottomEdge=this.runtime.height/this.runtime.devicePixelRatio;if(!this.visible||!this.layer.visible||right<=0||bottom<=0||left>=rightEdge||top>=bottomEdge)
{if(!this.element_hidden)
jQuery(this.elem).hide();this.element_hidden=true;return;}
if(left<1)
left=1;if(top<1)
top=1;if(right>=rightEdge)
right=rightEdge-1;if(bottom>=bottomEdge)
bottom=bottomEdge-1;var curWinWidth=window.innerWidth;var curWinHeight=window.innerHeight;if(!first&&this.lastLeft===left&&this.lastTop===top&&this.lastRight===right&&this.lastBottom===bottom&&this.lastWinWidth===curWinWidth&&this.lastWinHeight===curWinHeight)
{if(this.element_hidden)
{jQuery(this.elem).show();this.element_hidden=false;}
return;}
this.lastLeft=left;this.lastTop=top;this.lastRight=right;this.lastBottom=bottom;this.lastWinWidth=curWinWidth;this.lastWinHeight=curWinHeight;if(this.element_hidden)
{jQuery(this.elem).show();this.element_hidden=false;}
var offx=Math.round(left)+jQuery(this.runtime.canvas).offset().left;var offy=Math.round(top)+jQuery(this.runtime.canvas).offset().top;jQuery(this.elem).css("position","absolute");jQuery(this.elem).offset({left:offx,top:offy});jQuery(this.elem).width(Math.round(right-left));jQuery(this.elem).height(Math.round(bottom-top));if(this.autoFontSize)
jQuery(this.elem).css("font-size",((this.layer.getScale(true)/this.runtime.devicePixelRatio)-0.2)+"em");};instanceProto.draw=function(ctx)
{};instanceProto.drawGL=function(glw)
{};function Cnds(){};Cnds.prototype.OnClicked=function()
{return true;};Cnds.prototype.IsChecked=function()
{return this.isCheckbox&&this.inputElem.checked;};pluginProto.cnds=new Cnds();function Acts(){};Acts.prototype.SetText=function(text)
{if(this.runtime.isDomFree)
return;if(this.isCheckbox)
this.labelText.nodeValue=text;else
this.elem.value=text;};Acts.prototype.SetTooltip=function(text)
{if(this.runtime.isDomFree)
return;this.elem.title=text;};Acts.prototype.SetVisible=function(vis)
{if(this.runtime.isDomFree)
return;this.visible=(vis!==0);};Acts.prototype.SetEnabled=function(en)
{if(this.runtime.isDomFree)
return;this.inputElem.disabled=(en===0);};Acts.prototype.SetFocus=function()
{if(this.runtime.isDomFree)
return;this.inputElem.focus();};Acts.prototype.SetBlur=function()
{if(this.runtime.isDomFree)
return;this.inputElem.blur();};Acts.prototype.SetCSSStyle=function(p,v)
{if(this.runtime.isDomFree)
return;jQuery(this.elem).css(p,v);};Acts.prototype.SetChecked=function(c)
{if(this.runtime.isDomFree||!this.isCheckbox)
return;this.inputElem.checked=(c===1);};Acts.prototype.ToggleChecked=function()
{if(this.runtime.isDomFree||!this.isCheckbox)
return;this.inputElem.checked=!this.inputElem.checked;};pluginProto.acts=new Acts();function Exps(){};pluginProto.exps=new Exps();}());;;cr.plugins_.Function=function(runtime)
{this.runtime=runtime;};(function()
{var pluginProto=cr.plugins_.Function.prototype;pluginProto.Type=function(plugin)
{this.plugin=plugin;this.runtime=plugin.runtime;};var typeProto=pluginProto.Type.prototype;typeProto.onCreate=function()
{};pluginProto.Instance=function(type)
{this.type=type;this.runtime=type.runtime;};var instanceProto=pluginProto.Instance.prototype;var funcStack=[];var funcStackPtr=-1;var isInPreview=false;function FuncStackEntry()
{this.name="";this.retVal=0;this.params=[];};function pushFuncStack()
{funcStackPtr++;if(funcStackPtr===funcStack.length)
funcStack.push(new FuncStackEntry());return funcStack[funcStackPtr];};function getCurrentFuncStack()
{if(funcStackPtr<0)
return null;return funcStack[funcStackPtr];};function getOneAboveFuncStack()
{if(!funcStack.length)
return null;var i=funcStackPtr+1;if(i>=funcStack.length)
i=funcStack.length-1;return funcStack[i];};function popFuncStack()
{;funcStackPtr--;};instanceProto.onCreate=function()
{isInPreview=(typeof cr_is_preview!=="undefined");var self=this;window["c2_callFunction"]=function(name_,params_)
{var i,len,v;var fs=pushFuncStack();fs.name=name_.toLowerCase();fs.retVal=0;if(params_)
{fs.params.length=params_.length;for(i=0,len=params_.length;i<len;++i)
{v=params_[i];if(typeof v==="number"||typeof v==="string")
fs.params[i]=v;else if(typeof v==="boolean")
fs.params[i]=(v?1:0);else
fs.params[i]=0;}}
else
{cr.clearArray(fs.params);}
self.runtime.trigger(cr.plugins_.Function.prototype.cnds.OnFunction,self,fs.name);popFuncStack();return fs.retVal;};};function Cnds(){};Cnds.prototype.OnFunction=function(name_)
{var fs=getCurrentFuncStack();if(!fs)
return false;return cr.equals_nocase(name_,fs.name);};Cnds.prototype.CompareParam=function(index_,cmp_,value_)
{var fs=getCurrentFuncStack();if(!fs)
return false;index_=cr.floor(index_);if(index_<0||index_>=fs.params.length)
return false;return cr.do_cmp(fs.params[index_],cmp_,value_);};pluginProto.cnds=new Cnds();function Acts(){};Acts.prototype.CallFunction=function(name_,params_)
{var fs=pushFuncStack();fs.name=name_.toLowerCase();fs.retVal=0;cr.shallowAssignArray(fs.params,params_);var ran=this.runtime.trigger(cr.plugins_.Function.prototype.cnds.OnFunction,this,fs.name);if(isInPreview&&!ran)
{;}
popFuncStack();};Acts.prototype.SetReturnValue=function(value_)
{var fs=getCurrentFuncStack();if(fs)
fs.retVal=value_;else;};Acts.prototype.CallExpression=function(unused)
{};pluginProto.acts=new Acts();function Exps(){};Exps.prototype.ReturnValue=function(ret)
{var fs=getOneAboveFuncStack();if(fs)
ret.set_any(fs.retVal);else
ret.set_int(0);};Exps.prototype.ParamCount=function(ret)
{var fs=getCurrentFuncStack();if(fs)
ret.set_int(fs.params.length);else
{;ret.set_int(0);}};Exps.prototype.Param=function(ret,index_)
{index_=cr.floor(index_);var fs=getCurrentFuncStack();if(fs)
{if(index_>=0&&index_<fs.params.length)
{ret.set_any(fs.params[index_]);}
else
{;ret.set_int(0);}}
else
{;ret.set_int(0);}};Exps.prototype.Call=function(ret,name_)
{var fs=pushFuncStack();fs.name=name_.toLowerCase();fs.retVal=0;cr.clearArray(fs.params);var i,len;for(i=2,len=arguments.length;i<len;i++)
fs.params.push(arguments[i]);var ran=this.runtime.trigger(cr.plugins_.Function.prototype.cnds.OnFunction,this,fs.name);if(isInPreview&&!ran)
{;}
popFuncStack();ret.set_any(fs.retVal);};pluginProto.exps=new Exps();}());;;cr.plugins_.Keyboard=function(runtime)
{this.runtime=runtime;};(function()
{var pluginProto=cr.plugins_.Keyboard.prototype;pluginProto.Type=function(plugin)
{this.plugin=plugin;this.runtime=plugin.runtime;};var typeProto=pluginProto.Type.prototype;typeProto.onCreate=function()
{};pluginProto.Instance=function(type)
{this.type=type;this.runtime=type.runtime;this.keyMap=new Array(256);this.usedKeys=new Array(256);this.triggerKey=0;};var instanceProto=pluginProto.Instance.prototype;instanceProto.onCreate=function()
{var self=this;if(!this.runtime.isDomFree)
{jQuery(document).keydown(function(info){self.onKeyDown(info);});jQuery(document).keyup(function(info){self.onKeyUp(info);});}};var keysToBlockWhenFramed=[32,33,34,35,36,37,38,39,40,44];instanceProto.onKeyDown=function(info)
{var alreadyPreventedDefault=false;if(window!=window.top&&keysToBlockWhenFramed.indexOf(info.which)>-1)
{info.preventDefault();alreadyPreventedDefault=true;info.stopPropagation();}
if(this.keyMap[info.which])
{if(this.usedKeys[info.which]&&!alreadyPreventedDefault)
info.preventDefault();return;}
this.keyMap[info.which]=true;this.triggerKey=info.which;this.runtime.isInUserInputEvent=true;this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnAnyKey,this);var eventRan=this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKey,this);var eventRan2=this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyCode,this);this.runtime.isInUserInputEvent=false;if(eventRan||eventRan2)
{this.usedKeys[info.which]=true;if(!alreadyPreventedDefault)
info.preventDefault();}};instanceProto.onKeyUp=function(info)
{this.keyMap[info.which]=false;this.triggerKey=info.which;this.runtime.isInUserInputEvent=true;this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnAnyKeyReleased,this);var eventRan=this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyReleased,this);var eventRan2=this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyCodeReleased,this);this.runtime.isInUserInputEvent=false;if(eventRan||eventRan2||this.usedKeys[info.which])
{this.usedKeys[info.which]=true;info.preventDefault();}};instanceProto.onWindowBlur=function()
{var i;for(i=0;i<256;++i)
{if(!this.keyMap[i])
continue;this.keyMap[i]=false;this.triggerKey=i;this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnAnyKeyReleased,this);var eventRan=this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyReleased,this);var eventRan2=this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyCodeReleased,this);if(eventRan||eventRan2)
this.usedKeys[i]=true;}};instanceProto.saveToJSON=function()
{return{"triggerKey":this.triggerKey};};instanceProto.loadFromJSON=function(o)
{this.triggerKey=o["triggerKey"];};function Cnds(){};Cnds.prototype.IsKeyDown=function(key)
{return this.keyMap[key];};Cnds.prototype.OnKey=function(key)
{return(key===this.triggerKey);};Cnds.prototype.OnAnyKey=function(key)
{return true;};Cnds.prototype.OnAnyKeyReleased=function(key)
{return true;};Cnds.prototype.OnKeyReleased=function(key)
{return(key===this.triggerKey);};Cnds.prototype.IsKeyCodeDown=function(key)
{key=Math.floor(key);if(key<0||key>=this.keyMap.length)
return false;return this.keyMap[key];};Cnds.prototype.OnKeyCode=function(key)
{return(key===this.triggerKey);};Cnds.prototype.OnKeyCodeReleased=function(key)
{return(key===this.triggerKey);};pluginProto.cnds=new Cnds();function Acts(){};pluginProto.acts=new Acts();function Exps(){};Exps.prototype.LastKeyCode=function(ret)
{ret.set_int(this.triggerKey);};function fixedStringFromCharCode(kc)
{kc=Math.floor(kc);switch(kc){case 8:return "backspace";case 9:return "tab";case 13:return "enter";case 16:return "shift";case 17:return "control";case 18:return "alt";case 19:return "pause";case 20:return "capslock";case 27:return "esc";case 33:return "pageup";case 34:return "pagedown";case 35:return "end";case 36:return "home";case 37:return "←";case 38:return "↑";case 39:return "→";case 40:return "↓";case 45:return "insert";case 46:return "del";case 91:return "left window key";case 92:return "right window key";case 93:return "select";case 96:return "numpad 0";case 97:return "numpad 1";case 98:return "numpad 2";case 99:return "numpad 3";case 100:return "numpad 4";case 101:return "numpad 5";case 102:return "numpad 6";case 103:return "numpad 7";case 104:return "numpad 8";case 105:return "numpad 9";case 106:return "numpad *";case 107:return "numpad +";case 109:return "numpad -";case 110:return "numpad .";case 111:return "numpad /";case 112:return "F1";case 113:return "F2";case 114:return "F3";case 115:return "F4";case 116:return "F5";case 117:return "F6";case 118:return "F7";case 119:return "F8";case 120:return "F9";case 121:return "F10";case 122:return "F11";case 123:return "F12";case 144:return "numlock";case 145:return "scroll lock";case 186:return ";";case 187:return "=";case 188:return ",";case 189:return "-";case 190:return ".";case 191:return "/";case 192:return "'";case 219:return "[";case 220:return "\\";case 221:return "]";case 222:return "#";case 223:return "`";default:return String.fromCharCode(kc);}};Exps.prototype.StringFromKeyCode=function(ret,kc)
{ret.set_string(fixedStringFromCharCode(kc));};pluginProto.exps=new Exps();}());;;cr.plugins_.Mouse=function(runtime)
{this.runtime=runtime;};(function()
{var pluginProto=cr.plugins_.Mouse.prototype;pluginProto.Type=function(plugin)
{this.plugin=plugin;this.runtime=plugin.runtime;};var typeProto=pluginProto.Type.prototype;typeProto.onCreate=function()
{};pluginProto.Instance=function(type)
{this.type=type;this.runtime=type.runtime;this.buttonMap=new Array(4);this.mouseXcanvas=0;this.mouseYcanvas=0;this.triggerButton=0;this.triggerType=0;this.triggerDir=0;this.handled=false;};var instanceProto=pluginProto.Instance.prototype;instanceProto.onCreate=function()
{var self=this;if(!this.runtime.isDomFree)
{jQuery(document).mousemove(function(info){self.onMouseMove(info);});jQuery(document).mousedown(function(info){self.onMouseDown(info);});jQuery(document).mouseup(function(info){self.onMouseUp(info);});jQuery(document).dblclick(function(info){self.onDoubleClick(info);});var wheelevent=function(info){self.onWheel(info);};document.addEventListener("mousewheel",wheelevent,false);document.addEventListener("DOMMouseScroll",wheelevent,false);}};var dummyoffset={left:0,top:0};instanceProto.onMouseMove=function(info)
{var offset=this.runtime.isDomFree?dummyoffset:jQuery(this.runtime.canvas).offset();this.mouseXcanvas=info.pageX-offset.left;this.mouseYcanvas=info.pageY-offset.top;};instanceProto.mouseInGame=function()
{if(this.runtime.fullscreen_mode>0)
return true;return this.mouseXcanvas>=0&&this.mouseYcanvas>=0&&this.mouseXcanvas<this.runtime.width&&this.mouseYcanvas<this.runtime.height;};instanceProto.onMouseDown=function(info)
{if(!this.mouseInGame())
return;this.buttonMap[info.which]=true;this.runtime.isInUserInputEvent=true;this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnAnyClick,this);this.triggerButton=info.which-1;this.triggerType=0;this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnClick,this);this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnObjectClicked,this);this.runtime.isInUserInputEvent=false;};instanceProto.onMouseUp=function(info)
{if(!this.buttonMap[info.which])
return;if(this.runtime.had_a_click&&!this.runtime.isMobile)
info.preventDefault();this.runtime.had_a_click=true;this.buttonMap[info.which]=false;this.runtime.isInUserInputEvent=true;this.triggerButton=info.which-1;this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnRelease,this);this.runtime.isInUserInputEvent=false;};instanceProto.onDoubleClick=function(info)
{if(!this.mouseInGame())
return;info.preventDefault();this.runtime.isInUserInputEvent=true;this.triggerButton=info.which-1;this.triggerType=1;this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnClick,this);this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnObjectClicked,this);this.runtime.isInUserInputEvent=false;};instanceProto.onWheel=function(info)
{var delta=info.wheelDelta?info.wheelDelta:info.detail?-info.detail:0;this.triggerDir=(delta<0?0:1);this.handled=false;this.runtime.isInUserInputEvent=true;this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnWheel,this);this.runtime.isInUserInputEvent=false;if(this.handled&&cr.isCanvasInputEvent(info))
info.preventDefault();};instanceProto.onWindowBlur=function()
{var i,len;for(i=0,len=this.buttonMap.length;i<len;++i)
{if(!this.buttonMap[i])
continue;this.buttonMap[i]=false;this.triggerButton=i-1;this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnRelease,this);}};function Cnds(){};Cnds.prototype.OnClick=function(button,type)
{return button===this.triggerButton&&type===this.triggerType;};Cnds.prototype.OnAnyClick=function()
{return true;};Cnds.prototype.IsButtonDown=function(button)
{return this.buttonMap[button+1];};Cnds.prototype.OnRelease=function(button)
{return button===this.triggerButton;};Cnds.prototype.IsOverObject=function(obj)
{var cnd=this.runtime.getCurrentCondition();var mx=this.mouseXcanvas;var my=this.mouseYcanvas;return cr.xor(this.runtime.testAndSelectCanvasPointOverlap(obj,mx,my,cnd.inverted),cnd.inverted);};Cnds.prototype.OnObjectClicked=function(button,type,obj)
{if(button!==this.triggerButton||type!==this.triggerType)
return false;return this.runtime.testAndSelectCanvasPointOverlap(obj,this.mouseXcanvas,this.mouseYcanvas,false);};Cnds.prototype.OnWheel=function(dir)
{this.handled=true;return dir===this.triggerDir;};pluginProto.cnds=new Cnds();function Acts(){};var lastSetCursor=null;Acts.prototype.SetCursor=function(c)
{if(this.runtime.isDomFree)
return;var cursor_style=["auto","pointer","text","crosshair","move","help","wait","none"][c];if(lastSetCursor===cursor_style)
return;lastSetCursor=cursor_style;document.body.style.cursor=cursor_style;};Acts.prototype.SetCursorSprite=function(obj)
{if(this.runtime.isDomFree||this.runtime.isMobile||!obj)
return;var inst=obj.getFirstPicked();if(!inst||!inst.curFrame)
return;var frame=inst.curFrame;if(lastSetCursor===frame)
return;lastSetCursor=frame;var datauri=frame.getDataUri();var cursor_style="url("+datauri+") "+Math.round(frame.hotspotX*frame.width)+" "+Math.round(frame.hotspotY*frame.height)+", auto";document.body.style.cursor="";document.body.style.cursor=cursor_style;};pluginProto.acts=new Acts();function Exps(){};Exps.prototype.X=function(ret,layerparam)
{var layer,oldScale,oldZoomRate,oldParallaxX,oldAngle;if(cr.is_undefined(layerparam))
{layer=this.runtime.getLayerByNumber(0);oldScale=layer.scale;oldZoomRate=layer.zoomRate;oldParallaxX=layer.parallaxX;oldAngle=layer.angle;layer.scale=1;layer.zoomRate=1.0;layer.parallaxX=1.0;layer.angle=0;ret.set_float(layer.canvasToLayer(this.mouseXcanvas,this.mouseYcanvas,true));layer.scale=oldScale;layer.zoomRate=oldZoomRate;layer.parallaxX=oldParallaxX;layer.angle=oldAngle;}
else
{if(cr.is_number(layerparam))
layer=this.runtime.getLayerByNumber(layerparam);else
layer=this.runtime.getLayerByName(layerparam);if(layer)
ret.set_float(layer.canvasToLayer(this.mouseXcanvas,this.mouseYcanvas,true));else
ret.set_float(0);}};Exps.prototype.Y=function(ret,layerparam)
{var layer,oldScale,oldZoomRate,oldParallaxY,oldAngle;if(cr.is_undefined(layerparam))
{layer=this.runtime.getLayerByNumber(0);oldScale=layer.scale;oldZoomRate=layer.zoomRate;oldParallaxY=layer.parallaxY;oldAngle=layer.angle;layer.scale=1;layer.zoomRate=1.0;layer.parallaxY=1.0;layer.angle=0;ret.set_float(layer.canvasToLayer(this.mouseXcanvas,this.mouseYcanvas,false));layer.scale=oldScale;layer.zoomRate=oldZoomRate;layer.parallaxY=oldParallaxY;layer.angle=oldAngle;}
else
{if(cr.is_number(layerparam))
layer=this.runtime.getLayerByNumber(layerparam);else
layer=this.runtime.getLayerByName(layerparam);if(layer)
ret.set_float(layer.canvasToLayer(this.mouseXcanvas,this.mouseYcanvas,false));else
ret.set_float(0);}};Exps.prototype.AbsoluteX=function(ret)
{ret.set_float(this.mouseXcanvas);};Exps.prototype.AbsoluteY=function(ret)
{ret.set_float(this.mouseYcanvas);};pluginProto.exps=new Exps();}());;;cr.plugins_.Particles=function(runtime)
{this.runtime=runtime;};(function()
{var pluginProto=cr.plugins_.Particles.prototype;pluginProto.Type=function(plugin)
{this.plugin=plugin;this.runtime=plugin.runtime;};var typeProto=pluginProto.Type.prototype;typeProto.onCreate=function()
{if(this.is_family)
return;this.texture_img=new Image();this.texture_img.cr_filesize=this.texture_filesize;this.webGL_texture=null;this.runtime.waitForImageLoad(this.texture_img,this.texture_file);};typeProto.onLostWebGLContext=function()
{if(this.is_family)
return;this.webGL_texture=null;};typeProto.onRestoreWebGLContext=function()
{if(this.is_family||!this.instances.length)
return;if(!this.webGL_texture)
{this.webGL_texture=this.runtime.glwrap.loadTexture(this.texture_img,true,this.runtime.linearSampling,this.texture_pixelformat);}};typeProto.loadTextures=function()
{if(this.is_family||this.webGL_texture||!this.runtime.glwrap)
return;this.webGL_texture=this.runtime.glwrap.loadTexture(this.texture_img,true,this.runtime.linearSampling,this.texture_pixelformat);};typeProto.unloadTextures=function()
{if(this.is_family||this.instances.length||!this.webGL_texture)
return;this.runtime.glwrap.deleteTexture(this.webGL_texture);this.webGL_texture=null;};typeProto.preloadCanvas2D=function(ctx)
{ctx.drawImage(this.texture_img,0,0);};function Particle(owner)
{this.owner=owner;this.active=false;this.x=0;this.y=0;this.speed=0;this.angle=0;this.opacity=1;this.grow=0;this.size=0;this.gs=0;this.age=0;cr.seal(this);};Particle.prototype.init=function()
{var owner=this.owner;this.x=owner.x-(owner.xrandom/2)+(Math.random()*owner.xrandom);this.y=owner.y-(owner.yrandom/2)+(Math.random()*owner.yrandom);this.speed=owner.initspeed-(owner.speedrandom/2)+(Math.random()*owner.speedrandom);this.angle=owner.angle-(owner.spraycone/2)+(Math.random()*owner.spraycone);this.opacity=owner.initopacity;this.size=owner.initsize-(owner.sizerandom/2)+(Math.random()*owner.sizerandom);this.grow=owner.growrate-(owner.growrandom/2)+(Math.random()*owner.growrandom);this.gs=0;this.age=0;};Particle.prototype.tick=function(dt)
{var owner=this.owner;this.x+=Math.cos(this.angle)*this.speed*dt;this.y+=Math.sin(this.angle)*this.speed*dt;this.y+=this.gs*dt;this.speed+=owner.acc*dt;this.size+=this.grow*dt;this.gs+=owner.g*dt;this.age+=dt;if(this.size<1)
{this.active=false;return;}
if(owner.lifeanglerandom!==0)
this.angle+=(Math.random()*owner.lifeanglerandom*dt)-(owner.lifeanglerandom*dt/2);if(owner.lifespeedrandom!==0)
this.speed+=(Math.random()*owner.lifespeedrandom*dt)-(owner.lifespeedrandom*dt/2);if(owner.lifeopacityrandom!==0)
{this.opacity+=(Math.random()*owner.lifeopacityrandom*dt)-(owner.lifeopacityrandom*dt/2);if(this.opacity<0)
this.opacity=0;else if(this.opacity>1)
this.opacity=1;}
if(owner.destroymode<=1&&this.age>=owner.timeout)
{this.active=false;}
if(owner.destroymode===2&&this.speed<=0)
{this.active=false;}};Particle.prototype.draw=function(ctx)
{var curopacity=this.owner.opacity*this.opacity;if(curopacity===0)
return;if(this.owner.destroymode===0)
curopacity*=1-(this.age/this.owner.timeout);ctx.globalAlpha=curopacity;var drawx=this.x-this.size/2;var drawy=this.y-this.size/2;if(this.owner.runtime.pixel_rounding)
{drawx=(drawx+0.5)|0;drawy=(drawy+0.5)|0;}
ctx.drawImage(this.owner.type.texture_img,drawx,drawy,this.size,this.size);};Particle.prototype.drawGL=function(glw)
{var curopacity=this.owner.opacity*this.opacity;if(this.owner.destroymode===0)
curopacity*=1-(this.age/this.owner.timeout);var drawsize=this.size;var scaleddrawsize=drawsize*this.owner.particlescale;var drawx=this.x-drawsize/2;var drawy=this.y-drawsize/2;if(this.owner.runtime.pixel_rounding)
{drawx=(drawx+0.5)|0;drawy=(drawy+0.5)|0;}
if(scaleddrawsize<1||curopacity===0)
return;if(scaleddrawsize<glw.minPointSize||scaleddrawsize>glw.maxPointSize)
{glw.setOpacity(curopacity);glw.quad(drawx,drawy,drawx+drawsize,drawy,drawx+drawsize,drawy+drawsize,drawx,drawy+drawsize);}
else
glw.point(this.x,this.y,scaleddrawsize,curopacity);};Particle.prototype.left=function()
{return this.x-this.size/2;};Particle.prototype.right=function()
{return this.x+this.size/2;};Particle.prototype.top=function()
{return this.y-this.size/2;};Particle.prototype.bottom=function()
{return this.y+this.size/2;};pluginProto.Instance=function(type)
{this.type=type;this.runtime=type.runtime;};var instanceProto=pluginProto.Instance.prototype;var deadparticles=[];instanceProto.onCreate=function()
{var props=this.properties;this.rate=props[0];this.spraycone=cr.to_radians(props[1]);this.spraytype=props[2];this.spraying=true;this.initspeed=props[3];this.initsize=props[4];this.initopacity=props[5]/100.0;this.growrate=props[6];this.xrandom=props[7];this.yrandom=props[8];this.speedrandom=props[9];this.sizerandom=props[10];this.growrandom=props[11];this.acc=props[12];this.g=props[13];this.lifeanglerandom=props[14];this.lifespeedrandom=props[15];this.lifeopacityrandom=props[16];this.destroymode=props[17];this.timeout=props[18];this.particleCreateCounter=0;this.particlescale=1;this.particleBoxLeft=this.x;this.particleBoxTop=this.y;this.particleBoxRight=this.x;this.particleBoxBottom=this.y;this.add_bbox_changed_callback(function(self){self.bbox.set(self.particleBoxLeft,self.particleBoxTop,self.particleBoxRight,self.particleBoxBottom);self.bquad.set_from_rect(self.bbox);self.bbox_changed=false;self.update_collision_cell();self.update_render_cell();});if(!this.recycled)
this.particles=[];this.runtime.tickMe(this);this.type.loadTextures();if(this.spraytype===1)
{for(var i=0;i<this.rate;i++)
this.allocateParticle().opacity=0;}
this.first_tick=true;};instanceProto.saveToJSON=function()
{var o={"r":this.rate,"sc":this.spraycone,"st":this.spraytype,"s":this.spraying,"isp":this.initspeed,"isz":this.initsize,"io":this.initopacity,"gr":this.growrate,"xr":this.xrandom,"yr":this.yrandom,"spr":this.speedrandom,"szr":this.sizerandom,"grnd":this.growrandom,"acc":this.acc,"g":this.g,"lar":this.lifeanglerandom,"lsr":this.lifespeedrandom,"lor":this.lifeopacityrandom,"dm":this.destroymode,"to":this.timeout,"pcc":this.particleCreateCounter,"ft":this.first_tick,"p":[]};var i,len,p;var arr=o["p"];for(i=0,len=this.particles.length;i<len;i++)
{p=this.particles[i];arr.push([p.x,p.y,p.speed,p.angle,p.opacity,p.grow,p.size,p.gs,p.age]);}
return o;};instanceProto.loadFromJSON=function(o)
{this.rate=o["r"];this.spraycone=o["sc"];this.spraytype=o["st"];this.spraying=o["s"];this.initspeed=o["isp"];this.initsize=o["isz"];this.initopacity=o["io"];this.growrate=o["gr"];this.xrandom=o["xr"];this.yrandom=o["yr"];this.speedrandom=o["spr"];this.sizerandom=o["szr"];this.growrandom=o["grnd"];this.acc=o["acc"];this.g=o["g"];this.lifeanglerandom=o["lar"];this.lifespeedrandom=o["lsr"];this.lifeopacityrandom=o["lor"];this.destroymode=o["dm"];this.timeout=o["to"];this.particleCreateCounter=o["pcc"];this.first_tick=o["ft"];deadparticles.push.apply(deadparticles,this.particles);cr.clearArray(this.particles);var i,len,p,d;var arr=o["p"];for(i=0,len=arr.length;i<len;i++)
{p=this.allocateParticle();d=arr[i];p.x=d[0];p.y=d[1];p.speed=d[2];p.angle=d[3];p.opacity=d[4];p.grow=d[5];p.size=d[6];p.gs=d[7];p.age=d[8];}};instanceProto.onDestroy=function()
{deadparticles.push.apply(deadparticles,this.particles);cr.clearArray(this.particles);};instanceProto.allocateParticle=function()
{var p;if(deadparticles.length)
{p=deadparticles.pop();p.owner=this;}
else
p=new Particle(this);this.particles.push(p);p.active=true;return p;};instanceProto.tick=function()
{var dt=this.runtime.getDt(this);var i,len,p,n,j;if(this.spraytype===0&&this.spraying)
{this.particleCreateCounter+=dt*this.rate;n=cr.floor(this.particleCreateCounter);this.particleCreateCounter-=n;for(i=0;i<n;i++)
{p=this.allocateParticle();p.init();}}
this.particleBoxLeft=this.x;this.particleBoxTop=this.y;this.particleBoxRight=this.x;this.particleBoxBottom=this.y;for(i=0,j=0,len=this.particles.length;i<len;i++)
{p=this.particles[i];this.particles[j]=p;this.runtime.redraw=true;if(this.spraytype===1&&this.first_tick)
p.init();p.tick(dt);if(!p.active)
{deadparticles.push(p);continue;}
if(p.left()<this.particleBoxLeft)
this.particleBoxLeft=p.left();if(p.right()>this.particleBoxRight)
this.particleBoxRight=p.right();if(p.top()<this.particleBoxTop)
this.particleBoxTop=p.top();if(p.bottom()>this.particleBoxBottom)
this.particleBoxBottom=p.bottom();j++;}
cr.truncateArray(this.particles,j);this.set_bbox_changed();this.first_tick=false;if(this.spraytype===1&&this.particles.length===0)
this.runtime.DestroyInstance(this);};instanceProto.draw=function(ctx)
{var i,len,p,layer=this.layer;for(i=0,len=this.particles.length;i<len;i++)
{p=this.particles[i];if(p.right()>=layer.viewLeft&&p.bottom()>=layer.viewTop&&p.left()<=layer.viewRight&&p.top()<=layer.viewBottom)
{p.draw(ctx);}}};instanceProto.drawGL=function(glw)
{this.particlescale=this.layer.getScale();glw.setTexture(this.type.webGL_texture);var i,len,p,layer=this.layer;for(i=0,len=this.particles.length;i<len;i++)
{p=this.particles[i];if(p.right()>=layer.viewLeft&&p.bottom()>=layer.viewTop&&p.left()<=layer.viewRight&&p.top()<=layer.viewBottom)
{p.drawGL(glw);}}};function Cnds(){};Cnds.prototype.IsSpraying=function()
{return this.spraying;};pluginProto.cnds=new Cnds();function Acts(){};Acts.prototype.SetSpraying=function(set_)
{this.spraying=(set_!==0);};Acts.prototype.SetEffect=function(effect)
{this.blend_mode=effect;this.compositeOp=cr.effectToCompositeOp(effect);cr.setGLBlend(this,effect,this.runtime.gl);this.runtime.redraw=true;};Acts.prototype.SetRate=function(x)
{this.rate=x;var diff,i;if(this.spraytype===1&&this.first_tick)
{if(x<this.particles.length)
{diff=this.particles.length-x;for(i=0;i<diff;i++)
deadparticles.push(this.particles.pop());}
else if(x>this.particles.length)
{diff=x-this.particles.length;for(i=0;i<diff;i++)
this.allocateParticle().opacity=0;}}};Acts.prototype.SetSprayCone=function(x)
{this.spraycone=cr.to_radians(x);};Acts.prototype.SetInitSpeed=function(x)
{this.initspeed=x;};Acts.prototype.SetInitSize=function(x)
{this.initsize=x;};Acts.prototype.SetInitOpacity=function(x)
{this.initopacity=x/100;};Acts.prototype.SetGrowRate=function(x)
{this.growrate=x;};Acts.prototype.SetXRandomiser=function(x)
{this.xrandom=x;};Acts.prototype.SetYRandomiser=function(x)
{this.yrandom=x;};Acts.prototype.SetSpeedRandomiser=function(x)
{this.speedrandom=x;};Acts.prototype.SetSizeRandomiser=function(x)
{this.sizerandom=x;};Acts.prototype.SetGrowRateRandomiser=function(x)
{this.growrandom=x;};Acts.prototype.SetParticleAcc=function(x)
{this.acc=x;};Acts.prototype.SetGravity=function(x)
{this.g=x;};Acts.prototype.SetAngleRandomiser=function(x)
{this.lifeanglerandom=x;};Acts.prototype.SetLifeSpeedRandomiser=function(x)
{this.lifespeedrandom=x;};Acts.prototype.SetOpacityRandomiser=function(x)
{this.lifeopacityrandom=x;};Acts.prototype.SetTimeout=function(x)
{this.timeout=x;};pluginProto.acts=new Acts();function Exps(){};Exps.prototype.ParticleCount=function(ret)
{ret.set_int(this.particles.length);};Exps.prototype.Rate=function(ret)
{ret.set_float(this.rate);};Exps.prototype.SprayCone=function(ret)
{ret.set_float(cr.to_degrees(this.spraycone));};Exps.prototype.InitSpeed=function(ret)
{ret.set_float(this.initspeed);};Exps.prototype.InitSize=function(ret)
{ret.set_float(this.initsize);};Exps.prototype.InitOpacity=function(ret)
{ret.set_float(this.initopacity*100);};Exps.prototype.InitGrowRate=function(ret)
{ret.set_float(this.growrate);};Exps.prototype.XRandom=function(ret)
{ret.set_float(this.xrandom);};Exps.prototype.YRandom=function(ret)
{ret.set_float(this.yrandom);};Exps.prototype.InitSpeedRandom=function(ret)
{ret.set_float(this.speedrandom);};Exps.prototype.InitSizeRandom=function(ret)
{ret.set_float(this.sizerandom);};Exps.prototype.InitGrowRandom=function(ret)
{ret.set_float(this.growrandom);};Exps.prototype.ParticleAcceleration=function(ret)
{ret.set_float(this.acc);};Exps.prototype.Gravity=function(ret)
{ret.set_float(this.g);};Exps.prototype.ParticleAngleRandom=function(ret)
{ret.set_float(this.lifeanglerandom);};Exps.prototype.ParticleSpeedRandom=function(ret)
{ret.set_float(this.lifespeedrandom);};Exps.prototype.ParticleOpacityRandom=function(ret)
{ret.set_float(this.lifeopacityrandom);};Exps.prototype.Timeout=function(ret)
{ret.set_float(this.timeout);};pluginProto.exps=new Exps();}());;;cr.plugins_.Sprite=function(runtime)
{this.runtime=runtime;};(function()
{var pluginProto=cr.plugins_.Sprite.prototype;pluginProto.Type=function(plugin)
{this.plugin=plugin;this.runtime=plugin.runtime;};var typeProto=pluginProto.Type.prototype;function frame_getDataUri()
{if(this.datauri.length===0)
{var tmpcanvas=document.createElement("canvas");tmpcanvas.width=this.width;tmpcanvas.height=this.height;var tmpctx=tmpcanvas.getContext("2d");if(this.spritesheeted)
{tmpctx.drawImage(this.texture_img,this.offx,this.offy,this.width,this.height,0,0,this.width,this.height);}
else
{tmpctx.drawImage(this.texture_img,0,0,this.width,this.height);}
this.datauri=tmpcanvas.toDataURL("image/png");}
return this.datauri;};typeProto.onCreate=function()
{if(this.is_family)
return;var i,leni,j,lenj;var anim,frame,animobj,frameobj,wt,uv;this.all_frames=[];this.has_loaded_textures=false;for(i=0,leni=this.animations.length;i<leni;i++)
{anim=this.animations[i];animobj={};animobj.name=anim[0];animobj.speed=anim[1];animobj.loop=anim[2];animobj.repeatcount=anim[3];animobj.repeatto=anim[4];animobj.pingpong=anim[5];animobj.sid=anim[6];animobj.frames=[];for(j=0,lenj=anim[7].length;j<lenj;j++)
{frame=anim[7][j];frameobj={};frameobj.texture_file=frame[0];frameobj.texture_filesize=frame[1];frameobj.offx=frame[2];frameobj.offy=frame[3];frameobj.width=frame[4];frameobj.height=frame[5];frameobj.duration=frame[6];frameobj.hotspotX=frame[7];frameobj.hotspotY=frame[8];frameobj.image_points=frame[9];frameobj.poly_pts=frame[10];frameobj.pixelformat=frame[11];frameobj.spritesheeted=(frameobj.width!==0);frameobj.datauri="";frameobj.getDataUri=frame_getDataUri;uv={};uv.left=0;uv.top=0;uv.right=1;uv.bottom=1;frameobj.sheetTex=uv;frameobj.webGL_texture=null;wt=this.runtime.findWaitingTexture(frame[0]);if(wt)
{frameobj.texture_img=wt;}
else
{frameobj.texture_img=new Image();frameobj.texture_img.cr_src=frame[0];frameobj.texture_img.cr_filesize=frame[1];frameobj.texture_img.c2webGL_texture=null;this.runtime.waitForImageLoad(frameobj.texture_img,frame[0]);}
cr.seal(frameobj);animobj.frames.push(frameobj);this.all_frames.push(frameobj);}
cr.seal(animobj);this.animations[i]=animobj;}};typeProto.updateAllCurrentTexture=function()
{var i,len,inst;for(i=0,len=this.instances.length;i<len;i++)
{inst=this.instances[i];inst.curWebGLTexture=inst.curFrame.webGL_texture;}};typeProto.onLostWebGLContext=function()
{if(this.is_family)
return;var i,len,frame;for(i=0,len=this.all_frames.length;i<len;++i)
{frame=this.all_frames[i];frame.texture_img.c2webGL_texture=null;frame.webGL_texture=null;}
this.has_loaded_textures=false;this.updateAllCurrentTexture();};typeProto.onRestoreWebGLContext=function()
{if(this.is_family||!this.instances.length)
return;var i,len,frame;for(i=0,len=this.all_frames.length;i<len;++i)
{frame=this.all_frames[i];frame.webGL_texture=this.runtime.glwrap.loadTexture(frame.texture_img,false,this.runtime.linearSampling,frame.pixelformat);}
this.updateAllCurrentTexture();};typeProto.loadTextures=function()
{if(this.is_family||this.has_loaded_textures||!this.runtime.glwrap)
return;var i,len,frame;for(i=0,len=this.all_frames.length;i<len;++i)
{frame=this.all_frames[i];frame.webGL_texture=this.runtime.glwrap.loadTexture(frame.texture_img,false,this.runtime.linearSampling,frame.pixelformat);}
this.has_loaded_textures=true;};typeProto.unloadTextures=function()
{if(this.is_family||this.instances.length||!this.has_loaded_textures)
return;var i,len,frame;for(i=0,len=this.all_frames.length;i<len;++i)
{frame=this.all_frames[i];this.runtime.glwrap.deleteTexture(frame.webGL_texture);frame.webGL_texture=null;}
this.has_loaded_textures=false;};var already_drawn_images=[];typeProto.preloadCanvas2D=function(ctx)
{var i,len,frameimg;cr.clearArray(already_drawn_images);for(i=0,len=this.all_frames.length;i<len;++i)
{frameimg=this.all_frames[i].texture_img;if(already_drawn_images.indexOf(frameimg)!==-1)
continue;ctx.drawImage(frameimg,0,0);already_drawn_images.push(frameimg);}};pluginProto.Instance=function(type)
{this.type=type;this.runtime=type.runtime;var poly_pts=this.type.animations[0].frames[0].poly_pts;if(this.recycled)
this.collision_poly.set_pts(poly_pts);else
this.collision_poly=new cr.CollisionPoly(poly_pts);};var instanceProto=pluginProto.Instance.prototype;instanceProto.onCreate=function()
{this.visible=(this.properties[0]===0);this.isTicking=false;this.inAnimTrigger=false;this.collisionsEnabled=(this.properties[3]!==0);this.cur_animation=this.getAnimationByName(this.properties[1])||this.type.animations[0];this.cur_frame=this.properties[2];if(this.cur_frame<0)
this.cur_frame=0;if(this.cur_frame>=this.cur_animation.frames.length)
this.cur_frame=this.cur_animation.frames.length-1;var curanimframe=this.cur_animation.frames[this.cur_frame];this.collision_poly.set_pts(curanimframe.poly_pts);this.hotspotX=curanimframe.hotspotX;this.hotspotY=curanimframe.hotspotY;this.cur_anim_speed=this.cur_animation.speed;this.cur_anim_repeatto=this.cur_animation.repeatto;if(!(this.type.animations.length===1&&this.type.animations[0].frames.length===1)&&this.cur_anim_speed!==0)
{this.runtime.tickMe(this);this.isTicking=true;}
if(this.recycled)
this.animTimer.reset();else
this.animTimer=new cr.KahanAdder();this.frameStart=this.getNowTime();this.animPlaying=true;this.animRepeats=0;this.animForwards=true;this.animTriggerName="";this.changeAnimName="";this.changeAnimFrom=0;this.changeAnimFrame=-1;this.type.loadTextures();var i,leni,j,lenj;var anim,frame,uv,maintex;for(i=0,leni=this.type.animations.length;i<leni;i++)
{anim=this.type.animations[i];for(j=0,lenj=anim.frames.length;j<lenj;j++)
{frame=anim.frames[j];if(frame.width===0)
{frame.width=frame.texture_img.width;frame.height=frame.texture_img.height;}
if(frame.spritesheeted)
{maintex=frame.texture_img;uv=frame.sheetTex;uv.left=frame.offx/maintex.width;uv.top=frame.offy/maintex.height;uv.right=(frame.offx+frame.width)/maintex.width;uv.bottom=(frame.offy+frame.height)/maintex.height;if(frame.offx===0&&frame.offy===0&&frame.width===maintex.width&&frame.height===maintex.height)
{frame.spritesheeted=false;}}}}
this.curFrame=this.cur_animation.frames[this.cur_frame];this.curWebGLTexture=this.curFrame.webGL_texture;};instanceProto.saveToJSON=function()
{var o={"a":this.cur_animation.sid,"f":this.cur_frame,"cas":this.cur_anim_speed,"fs":this.frameStart,"ar":this.animRepeats,"at":this.animTimer.sum,"rt":this.cur_anim_repeatto};if(!this.animPlaying)
o["ap"]=this.animPlaying;if(!this.animForwards)
o["af"]=this.animForwards;return o;};instanceProto.loadFromJSON=function(o)
{var anim=this.getAnimationBySid(o["a"]);if(anim)
this.cur_animation=anim;this.cur_frame=o["f"];if(this.cur_frame<0)
this.cur_frame=0;if(this.cur_frame>=this.cur_animation.frames.length)
this.cur_frame=this.cur_animation.frames.length-1;this.cur_anim_speed=o["cas"];this.frameStart=o["fs"];this.animRepeats=o["ar"];this.animTimer.reset();this.animTimer.sum=o["at"];this.animPlaying=o.hasOwnProperty("ap")?o["ap"]:true;this.animForwards=o.hasOwnProperty("af")?o["af"]:true;if(o.hasOwnProperty("rt"))
this.cur_anim_repeatto=o["rt"];else
this.cur_anim_repeatto=this.cur_animation.repeatto;this.curFrame=this.cur_animation.frames[this.cur_frame];this.curWebGLTexture=this.curFrame.webGL_texture;this.collision_poly.set_pts(this.curFrame.poly_pts);this.hotspotX=this.curFrame.hotspotX;this.hotspotY=this.curFrame.hotspotY;};instanceProto.animationFinish=function(reverse)
{this.cur_frame=reverse?0:this.cur_animation.frames.length-1;this.animPlaying=false;this.animTriggerName=this.cur_animation.name;this.inAnimTrigger=true;this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnAnyAnimFinished,this);this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnAnimFinished,this);this.inAnimTrigger=false;this.animRepeats=0;};instanceProto.getNowTime=function()
{return this.animTimer.sum;};instanceProto.tick=function()
{this.animTimer.add(this.runtime.getDt(this));if(this.changeAnimName.length)
this.doChangeAnim();if(this.changeAnimFrame>=0)
this.doChangeAnimFrame();var now=this.getNowTime();var cur_animation=this.cur_animation;var prev_frame=cur_animation.frames[this.cur_frame];var next_frame;var cur_frame_time=prev_frame.duration/this.cur_anim_speed;if(this.animPlaying&&now>=this.frameStart+cur_frame_time)
{if(this.animForwards)
{this.cur_frame++;}
else
{this.cur_frame--;}
this.frameStart+=cur_frame_time;if(this.cur_frame>=cur_animation.frames.length)
{if(cur_animation.pingpong)
{this.animForwards=false;this.cur_frame=cur_animation.frames.length-2;}
else if(cur_animation.loop)
{this.cur_frame=this.cur_anim_repeatto;}
else
{this.animRepeats++;if(this.animRepeats>=cur_animation.repeatcount)
{this.animationFinish(false);}
else
{this.cur_frame=this.cur_anim_repeatto;}}}
if(this.cur_frame<0)
{if(cur_animation.pingpong)
{this.cur_frame=1;this.animForwards=true;if(!cur_animation.loop)
{this.animRepeats++;if(this.animRepeats>=cur_animation.repeatcount)
{this.animationFinish(true);}}}
else
{if(cur_animation.loop)
{this.cur_frame=this.cur_anim_repeatto;}
else
{this.animRepeats++;if(this.animRepeats>=cur_animation.repeatcount)
{this.animationFinish(true);}
else
{this.cur_frame=this.cur_anim_repeatto;}}}}
if(this.cur_frame<0)
this.cur_frame=0;else if(this.cur_frame>=cur_animation.frames.length)
this.cur_frame=cur_animation.frames.length-1;if(now>this.frameStart+(cur_animation.frames[this.cur_frame].duration/this.cur_anim_speed))
{this.frameStart=now;}
next_frame=cur_animation.frames[this.cur_frame];this.OnFrameChanged(prev_frame,next_frame);this.runtime.redraw=true;}};instanceProto.getAnimationByName=function(name_)
{var i,len,a;for(i=0,len=this.type.animations.length;i<len;i++)
{a=this.type.animations[i];if(cr.equals_nocase(a.name,name_))
return a;}
return null;};instanceProto.getAnimationBySid=function(sid_)
{var i,len,a;for(i=0,len=this.type.animations.length;i<len;i++)
{a=this.type.animations[i];if(a.sid===sid_)
return a;}
return null;};instanceProto.doChangeAnim=function()
{var prev_frame=this.cur_animation.frames[this.cur_frame];var anim=this.getAnimationByName(this.changeAnimName);this.changeAnimName="";if(!anim)
return;if(cr.equals_nocase(anim.name,this.cur_animation.name)&&this.animPlaying)
return;this.cur_animation=anim;this.cur_anim_speed=anim.speed;this.cur_anim_repeatto=anim.repeatto;if(this.cur_frame<0)
this.cur_frame=0;if(this.cur_frame>=this.cur_animation.frames.length)
this.cur_frame=this.cur_animation.frames.length-1;if(this.changeAnimFrom===1)
this.cur_frame=0;this.animPlaying=true;this.frameStart=this.getNowTime();this.animForwards=true;this.OnFrameChanged(prev_frame,this.cur_animation.frames[this.cur_frame]);this.runtime.redraw=true;};instanceProto.doChangeAnimFrame=function()
{var prev_frame=this.cur_animation.frames[this.cur_frame];var prev_frame_number=this.cur_frame;this.cur_frame=cr.floor(this.changeAnimFrame);if(this.cur_frame<0)
this.cur_frame=0;if(this.cur_frame>=this.cur_animation.frames.length)
this.cur_frame=this.cur_animation.frames.length-1;if(prev_frame_number!==this.cur_frame)
{this.OnFrameChanged(prev_frame,this.cur_animation.frames[this.cur_frame]);this.frameStart=this.getNowTime();this.runtime.redraw=true;}
this.changeAnimFrame=-1;};instanceProto.OnFrameChanged=function(prev_frame,next_frame)
{var oldw=prev_frame.width;var oldh=prev_frame.height;var neww=next_frame.width;var newh=next_frame.height;if(oldw!=neww)
this.width*=(neww/oldw);if(oldh!=newh)
this.height*=(newh/oldh);this.hotspotX=next_frame.hotspotX;this.hotspotY=next_frame.hotspotY;this.collision_poly.set_pts(next_frame.poly_pts);this.set_bbox_changed();this.curFrame=next_frame;this.curWebGLTexture=next_frame.webGL_texture;var i,len,b;for(i=0,len=this.behavior_insts.length;i<len;i++)
{b=this.behavior_insts[i];if(b.onSpriteFrameChanged)
b.onSpriteFrameChanged(prev_frame,next_frame);}
this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnFrameChanged,this);};instanceProto.draw=function(ctx)
{ctx.globalAlpha=this.opacity;var cur_frame=this.curFrame;var spritesheeted=cur_frame.spritesheeted;var cur_image=cur_frame.texture_img;var myx=this.x;var myy=this.y;var w=this.width;var h=this.height;if(this.angle===0&&w>=0&&h>=0)
{myx-=this.hotspotX*w;myy-=this.hotspotY*h;if(this.runtime.pixel_rounding)
{myx=Math.round(myx);myy=Math.round(myy);}
if(spritesheeted)
{ctx.drawImage(cur_image,cur_frame.offx,cur_frame.offy,cur_frame.width,cur_frame.height,myx,myy,w,h);}
else
{ctx.drawImage(cur_image,myx,myy,w,h);}}
else
{if(this.runtime.pixel_rounding)
{myx=Math.round(myx);myy=Math.round(myy);}
ctx.save();var widthfactor=w>0?1:-1;var heightfactor=h>0?1:-1;ctx.translate(myx,myy);if(widthfactor!==1||heightfactor!==1)
ctx.scale(widthfactor,heightfactor);ctx.rotate(this.angle*widthfactor*heightfactor);var drawx=0-(this.hotspotX*cr.abs(w))
var drawy=0-(this.hotspotY*cr.abs(h));if(spritesheeted)
{ctx.drawImage(cur_image,cur_frame.offx,cur_frame.offy,cur_frame.width,cur_frame.height,drawx,drawy,cr.abs(w),cr.abs(h));}
else
{ctx.drawImage(cur_image,drawx,drawy,cr.abs(w),cr.abs(h));}
ctx.restore();}};instanceProto.drawGL_earlyZPass=function(glw)
{this.drawGL(glw);};instanceProto.drawGL=function(glw)
{glw.setTexture(this.curWebGLTexture);glw.setOpacity(this.opacity);var cur_frame=this.curFrame;var q=this.bquad;if(this.runtime.pixel_rounding)
{var ox=Math.round(this.x)-this.x;var oy=Math.round(this.y)-this.y;if(cur_frame.spritesheeted)
glw.quadTex(q.tlx+ox,q.tly+oy,q.trx+ox,q.try_+oy,q.brx+ox,q.bry+oy,q.blx+ox,q.bly+oy,cur_frame.sheetTex);else
glw.quad(q.tlx+ox,q.tly+oy,q.trx+ox,q.try_+oy,q.brx+ox,q.bry+oy,q.blx+ox,q.bly+oy);}
else
{if(cur_frame.spritesheeted)
glw.quadTex(q.tlx,q.tly,q.trx,q.try_,q.brx,q.bry,q.blx,q.bly,cur_frame.sheetTex);else
glw.quad(q.tlx,q.tly,q.trx,q.try_,q.brx,q.bry,q.blx,q.bly);}};instanceProto.getImagePointIndexByName=function(name_)
{var cur_frame=this.curFrame;var i,len;for(i=0,len=cur_frame.image_points.length;i<len;i++)
{if(cr.equals_nocase(name_,cur_frame.image_points[i][0]))
return i;}
return-1;};instanceProto.getImagePoint=function(imgpt,getX)
{var cur_frame=this.curFrame;var image_points=cur_frame.image_points;var index;if(cr.is_string(imgpt))
index=this.getImagePointIndexByName(imgpt);else
index=imgpt-1;index=cr.floor(index);if(index<0||index>=image_points.length)
return getX?this.x:this.y;var x=(image_points[index][1]-cur_frame.hotspotX)*this.width;var y=image_points[index][2];y=(y-cur_frame.hotspotY)*this.height;var cosa=Math.cos(this.angle);var sina=Math.sin(this.angle);var x_temp=(x*cosa)-(y*sina);y=(y*cosa)+(x*sina);x=x_temp;x+=this.x;y+=this.y;return getX?x:y;};function Cnds(){};var arrCache=[];function allocArr()
{if(arrCache.length)
return arrCache.pop();else
return[0,0,0];};function freeArr(a)
{a[0]=0;a[1]=0;a[2]=0;arrCache.push(a);};function makeCollKey(a,b)
{if(a<b)
return ""+a+","+b;else
return ""+b+","+a;};function collmemory_add(collmemory,a,b,tickcount)
{var a_uid=a.uid;var b_uid=b.uid;var key=makeCollKey(a_uid,b_uid);if(collmemory.hasOwnProperty(key))
{collmemory[key][2]=tickcount;return;}
var arr=allocArr();arr[0]=a_uid;arr[1]=b_uid;arr[2]=tickcount;collmemory[key]=arr;};function collmemory_remove(collmemory,a,b)
{var key=makeCollKey(a.uid,b.uid);if(collmemory.hasOwnProperty(key))
{freeArr(collmemory[key]);delete collmemory[key];}};function collmemory_removeInstance(collmemory,inst)
{var uid=inst.uid;var p,entry;for(p in collmemory)
{if(collmemory.hasOwnProperty(p))
{entry=collmemory[p];if(entry[0]===uid||entry[1]===uid)
{freeArr(collmemory[p]);delete collmemory[p];}}}};var last_coll_tickcount=-2;function collmemory_has(collmemory,a,b)
{var key=makeCollKey(a.uid,b.uid);if(collmemory.hasOwnProperty(key))
{last_coll_tickcount=collmemory[key][2];return true;}
else
{last_coll_tickcount=-2;return false;}};var candidates1=[];Cnds.prototype.OnCollision=function(rtype)
{if(!rtype)
return false;var runtime=this.runtime;var cnd=runtime.getCurrentCondition();var ltype=cnd.type;var collmemory=null;if(cnd.extra["collmemory"])
{collmemory=cnd.extra["collmemory"];}
else
{collmemory={};cnd.extra["collmemory"]=collmemory;}
if(!cnd.extra["spriteCreatedDestroyCallback"])
{cnd.extra["spriteCreatedDestroyCallback"]=true;runtime.addDestroyCallback(function(inst){collmemory_removeInstance(cnd.extra["collmemory"],inst);});}
var lsol=ltype.getCurrentSol();var rsol=rtype.getCurrentSol();var linstances=lsol.getObjects();var rinstances;var registeredInstances;var l,linst,r,rinst;var curlsol,currsol;var tickcount=this.runtime.tickcount;var lasttickcount=tickcount-1;var exists,run;var current_event=runtime.getCurrentEventStack().current_event;var orblock=current_event.orblock;for(l=0;l<linstances.length;l++)
{linst=linstances[l];if(rsol.select_all)
{linst.update_bbox();this.runtime.getCollisionCandidates(linst.layer,rtype,linst.bbox,candidates1);rinstances=candidates1;this.runtime.addRegisteredCollisionCandidates(linst,rtype,rinstances);}
else
{rinstances=rsol.getObjects();}
for(r=0;r<rinstances.length;r++)
{rinst=rinstances[r];if(runtime.testOverlap(linst,rinst)||runtime.checkRegisteredCollision(linst,rinst))
{exists=collmemory_has(collmemory,linst,rinst);run=(!exists||(last_coll_tickcount<lasttickcount));collmemory_add(collmemory,linst,rinst,tickcount);if(run)
{runtime.pushCopySol(current_event.solModifiers);curlsol=ltype.getCurrentSol();currsol=rtype.getCurrentSol();curlsol.select_all=false;currsol.select_all=false;if(ltype===rtype)
{curlsol.instances.length=2;curlsol.instances[0]=linst;curlsol.instances[1]=rinst;ltype.applySolToContainer();}
else
{curlsol.instances.length=1;currsol.instances.length=1;curlsol.instances[0]=linst;currsol.instances[0]=rinst;ltype.applySolToContainer();rtype.applySolToContainer();}
current_event.retrigger();runtime.popSol(current_event.solModifiers);}}
else
{collmemory_remove(collmemory,linst,rinst);}}
cr.clearArray(candidates1);}
return false;};var rpicktype=null;var rtopick=new cr.ObjectSet();var needscollisionfinish=false;var candidates2=[];var temp_bbox=new cr.rect(0,0,0,0);function DoOverlapCondition(rtype,offx,offy)
{if(!rtype)
return false;var do_offset=(offx!==0||offy!==0);var oldx,oldy,ret=false,r,lenr,rinst;var cnd=this.runtime.getCurrentCondition();var ltype=cnd.type;var inverted=cnd.inverted;var rsol=rtype.getCurrentSol();var orblock=this.runtime.getCurrentEventStack().current_event.orblock;var rinstances;if(rsol.select_all)
{this.update_bbox();temp_bbox.copy(this.bbox);temp_bbox.offset(offx,offy);this.runtime.getCollisionCandidates(this.layer,rtype,temp_bbox,candidates2);rinstances=candidates2;}
else if(orblock)
{if(this.runtime.isCurrentConditionFirst()&&!rsol.else_instances.length&&rsol.instances.length)
rinstances=rsol.instances;else
rinstances=rsol.else_instances;}
else
{rinstances=rsol.instances;}
rpicktype=rtype;needscollisionfinish=(ltype!==rtype&&!inverted);if(do_offset)
{oldx=this.x;oldy=this.y;this.x+=offx;this.y+=offy;this.set_bbox_changed();}
for(r=0,lenr=rinstances.length;r<lenr;r++)
{rinst=rinstances[r];if(this.runtime.testOverlap(this,rinst))
{ret=true;if(inverted)
break;if(ltype!==rtype)
rtopick.add(rinst);}}
if(do_offset)
{this.x=oldx;this.y=oldy;this.set_bbox_changed();}
cr.clearArray(candidates2);return ret;};typeProto.finish=function(do_pick)
{if(!needscollisionfinish)
return;if(do_pick)
{var orblock=this.runtime.getCurrentEventStack().current_event.orblock;var sol=rpicktype.getCurrentSol();var topick=rtopick.valuesRef();var i,len,inst;if(sol.select_all)
{sol.select_all=false;cr.clearArray(sol.instances);for(i=0,len=topick.length;i<len;++i)
{sol.instances[i]=topick[i];}
if(orblock)
{cr.clearArray(sol.else_instances);for(i=0,len=rpicktype.instances.length;i<len;++i)
{inst=rpicktype.instances[i];if(!rtopick.contains(inst))
sol.else_instances.push(inst);}}}
else
{if(orblock)
{var initsize=sol.instances.length;for(i=0,len=topick.length;i<len;++i)
{sol.instances[initsize+i]=topick[i];cr.arrayFindRemove(sol.else_instances,topick[i]);}}
else
{cr.shallowAssignArray(sol.instances,topick);}}
rpicktype.applySolToContainer();}
rtopick.clear();needscollisionfinish=false;};Cnds.prototype.IsOverlapping=function(rtype)
{return DoOverlapCondition.call(this,rtype,0,0);};Cnds.prototype.IsOverlappingOffset=function(rtype,offx,offy)
{return DoOverlapCondition.call(this,rtype,offx,offy);};Cnds.prototype.IsAnimPlaying=function(animname)
{if(this.changeAnimName.length)
return cr.equals_nocase(this.changeAnimName,animname);else
return cr.equals_nocase(this.cur_animation.name,animname);};Cnds.prototype.CompareFrame=function(cmp,framenum)
{return cr.do_cmp(this.cur_frame,cmp,framenum);};Cnds.prototype.CompareAnimSpeed=function(cmp,x)
{var s=(this.animForwards?this.cur_anim_speed:-this.cur_anim_speed);return cr.do_cmp(s,cmp,x);};Cnds.prototype.OnAnimFinished=function(animname)
{return cr.equals_nocase(this.animTriggerName,animname);};Cnds.prototype.OnAnyAnimFinished=function()
{return true;};Cnds.prototype.OnFrameChanged=function()
{return true;};Cnds.prototype.IsMirrored=function()
{return this.width<0;};Cnds.prototype.IsFlipped=function()
{return this.height<0;};Cnds.prototype.OnURLLoaded=function()
{return true;};Cnds.prototype.IsCollisionEnabled=function()
{return this.collisionsEnabled;};pluginProto.cnds=new Cnds();function Acts(){};Acts.prototype.Spawn=function(obj,layer,imgpt)
{if(!obj||!layer)
return;var inst=this.runtime.createInstance(obj,layer,this.getImagePoint(imgpt,true),this.getImagePoint(imgpt,false));if(!inst)
return;if(typeof inst.angle!=="undefined")
{inst.angle=this.angle;inst.set_bbox_changed();}
this.runtime.isInOnDestroy++;var i,len,s;this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated,inst);if(inst.is_contained)
{for(i=0,len=inst.siblings.length;i<len;i++)
{s=inst.siblings[i];this.runtime.trigger(Object.getPrototypeOf(s.type.plugin).cnds.OnCreated,s);}}
this.runtime.isInOnDestroy--;var cur_act=this.runtime.getCurrentAction();var reset_sol=false;if(cr.is_undefined(cur_act.extra["Spawn_LastExec"])||cur_act.extra["Spawn_LastExec"]<this.runtime.execcount)
{reset_sol=true;cur_act.extra["Spawn_LastExec"]=this.runtime.execcount;}
var sol;if(obj!=this.type)
{sol=obj.getCurrentSol();sol.select_all=false;if(reset_sol)
{cr.clearArray(sol.instances);sol.instances[0]=inst;}
else
sol.instances.push(inst);if(inst.is_contained)
{for(i=0,len=inst.siblings.length;i<len;i++)
{s=inst.siblings[i];sol=s.type.getCurrentSol();sol.select_all=false;if(reset_sol)
{cr.clearArray(sol.instances);sol.instances[0]=s;}
else
sol.instances.push(s);}}}};Acts.prototype.SetEffect=function(effect)
{this.blend_mode=effect;this.compositeOp=cr.effectToCompositeOp(effect);cr.setGLBlend(this,effect,this.runtime.gl);this.runtime.redraw=true;};Acts.prototype.StopAnim=function()
{this.animPlaying=false;};Acts.prototype.StartAnim=function(from)
{this.animPlaying=true;this.frameStart=this.getNowTime();if(from===1&&this.cur_frame!==0)
{this.changeAnimFrame=0;if(!this.inAnimTrigger)
this.doChangeAnimFrame();}
if(!this.isTicking)
{this.runtime.tickMe(this);this.isTicking=true;}};Acts.prototype.SetAnim=function(animname,from)
{this.changeAnimName=animname;this.changeAnimFrom=from;if(!this.isTicking)
{this.runtime.tickMe(this);this.isTicking=true;}
if(!this.inAnimTrigger)
this.doChangeAnim();};Acts.prototype.SetAnimFrame=function(framenumber)
{this.changeAnimFrame=framenumber;if(!this.isTicking)
{this.runtime.tickMe(this);this.isTicking=true;}
if(!this.inAnimTrigger)
this.doChangeAnimFrame();};Acts.prototype.SetAnimSpeed=function(s)
{this.cur_anim_speed=cr.abs(s);this.animForwards=(s>=0);if(!this.isTicking)
{this.runtime.tickMe(this);this.isTicking=true;}};Acts.prototype.SetAnimRepeatToFrame=function(s)
{s=Math.floor(s);if(s<0)
s=0;if(s>=this.cur_animation.frames.length)
s=this.cur_animation.frames.length-1;this.cur_anim_repeatto=s;};Acts.prototype.SetMirrored=function(m)
{var neww=cr.abs(this.width)*(m===0?-1:1);if(this.width===neww)
return;this.width=neww;this.set_bbox_changed();};Acts.prototype.SetFlipped=function(f)
{var newh=cr.abs(this.height)*(f===0?-1:1);if(this.height===newh)
return;this.height=newh;this.set_bbox_changed();};Acts.prototype.SetScale=function(s)
{var cur_frame=this.curFrame;var mirror_factor=(this.width<0?-1:1);var flip_factor=(this.height<0?-1:1);var new_width=cur_frame.width*s*mirror_factor;var new_height=cur_frame.height*s*flip_factor;if(this.width!==new_width||this.height!==new_height)
{this.width=new_width;this.height=new_height;this.set_bbox_changed();}};Acts.prototype.LoadURL=function(url_,resize_,crossOrigin_)
{var img=new Image();var self=this;var curFrame_=this.curFrame;img.onload=function()
{if(curFrame_.texture_img.src===img.src)
{if(self.runtime.glwrap&&self.curFrame===curFrame_)
self.curWebGLTexture=curFrame_.webGL_texture;if(resize_===0)
{self.width=img.width;self.height=img.height;self.set_bbox_changed();}
self.runtime.redraw=true;self.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnURLLoaded,self);return;}
curFrame_.texture_img=img;curFrame_.offx=0;curFrame_.offy=0;curFrame_.width=img.width;curFrame_.height=img.height;curFrame_.spritesheeted=false;curFrame_.datauri="";curFrame_.pixelformat=0;if(self.runtime.glwrap)
{if(curFrame_.webGL_texture)
self.runtime.glwrap.deleteTexture(curFrame_.webGL_texture);curFrame_.webGL_texture=self.runtime.glwrap.loadTexture(img,false,self.runtime.linearSampling);if(self.curFrame===curFrame_)
self.curWebGLTexture=curFrame_.webGL_texture;self.type.updateAllCurrentTexture();}
if(resize_===0)
{self.width=img.width;self.height=img.height;self.set_bbox_changed();}
self.runtime.redraw=true;self.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnURLLoaded,self);};if(url_.substr(0,5)!=="data:"&&crossOrigin_===0)
img["crossOrigin"]="anonymous";this.runtime.setImageSrc(img,url_);};Acts.prototype.SetCollisions=function(set_)
{if(this.collisionsEnabled===(set_!==0))
return;this.collisionsEnabled=(set_!==0);if(this.collisionsEnabled)
this.set_bbox_changed();else
{if(this.collcells.right>=this.collcells.left)
this.type.collision_grid.update(this,this.collcells,null);this.collcells.set(0,0,-1,-1);}};pluginProto.acts=new Acts();function Exps(){};Exps.prototype.AnimationFrame=function(ret)
{ret.set_int(this.cur_frame);};Exps.prototype.AnimationFrameCount=function(ret)
{ret.set_int(this.cur_animation.frames.length);};Exps.prototype.AnimationName=function(ret)
{ret.set_string(this.cur_animation.name);};Exps.prototype.AnimationSpeed=function(ret)
{ret.set_float(this.animForwards?this.cur_anim_speed:-this.cur_anim_speed);};Exps.prototype.ImagePointX=function(ret,imgpt)
{ret.set_float(this.getImagePoint(imgpt,true));};Exps.prototype.ImagePointY=function(ret,imgpt)
{ret.set_float(this.getImagePoint(imgpt,false));};Exps.prototype.ImagePointCount=function(ret)
{ret.set_int(this.curFrame.image_points.length);};Exps.prototype.ImageWidth=function(ret)
{ret.set_float(this.curFrame.width);};Exps.prototype.ImageHeight=function(ret)
{ret.set_float(this.curFrame.height);};pluginProto.exps=new Exps();}());;;cr.plugins_.Spritefont2=function(runtime)
{this.runtime=runtime;};(function()
{var pluginProto=cr.plugins_.Spritefont2.prototype;pluginProto.onCreate=function()
{};pluginProto.Type=function(plugin)
{this.plugin=plugin;this.runtime=plugin.runtime;};var typeProto=pluginProto.Type.prototype;typeProto.onCreate=function()
{if(this.is_family)
return;this.texture_img=new Image();this.runtime.waitForImageLoad(this.texture_img,this.texture_file);this.webGL_texture=null;};typeProto.onLostWebGLContext=function()
{if(this.is_family)
return;this.webGL_texture=null;};typeProto.onRestoreWebGLContext=function()
{if(this.is_family||!this.instances.length)
return;if(!this.webGL_texture)
{this.webGL_texture=this.runtime.glwrap.loadTexture(this.texture_img,false,this.runtime.linearSampling,this.texture_pixelformat);}
var i,len;for(i=0,len=this.instances.length;i<len;i++)
this.instances[i].webGL_texture=this.webGL_texture;};typeProto.unloadTextures=function()
{if(this.is_family||this.instances.length||!this.webGL_texture)
return;this.runtime.glwrap.deleteTexture(this.webGL_texture);this.webGL_texture=null;};typeProto.preloadCanvas2D=function(ctx)
{ctx.drawImage(this.texture_img,0,0);};pluginProto.Instance=function(type)
{this.type=type;this.runtime=type.runtime;};var instanceProto=pluginProto.Instance.prototype;instanceProto.onDestroy=function()
{freeAllLines(this.lines);freeAllClip(this.clipList);freeAllClipUV(this.clipUV);cr.wipe(this.characterWidthList);};instanceProto.onCreate=function()
{this.texture_img=this.type.texture_img;this.characterWidth=this.properties[0];this.characterHeight=this.properties[1];this.characterSet=this.properties[2];this.text=this.properties[3];this.characterScale=this.properties[4];this.visible=(this.properties[5]===0);this.halign=this.properties[6]/2.0;this.valign=this.properties[7]/2.0;this.wrapbyword=(this.properties[9]===0);this.characterSpacing=this.properties[10];this.lineHeight=this.properties[11];this.textWidth=0;this.textHeight=0;if(this.recycled)
{cr.clearArray(this.lines);cr.wipe(this.clipList);cr.wipe(this.clipUV);cr.wipe(this.characterWidthList);}
else
{this.lines=[];this.clipList={};this.clipUV={};this.characterWidthList={};}
this.text_changed=true;this.lastwrapwidth=this.width;if(this.runtime.glwrap)
{if(!this.type.webGL_texture)
{this.type.webGL_texture=this.runtime.glwrap.loadTexture(this.type.texture_img,false,this.runtime.linearSampling,this.type.texture_pixelformat);}
this.webGL_texture=this.type.webGL_texture;}
this.SplitSheet();};instanceProto.saveToJSON=function()
{var save={"t":this.text,"csc":this.characterScale,"csp":this.characterSpacing,"lh":this.lineHeight,"tw":this.textWidth,"th":this.textHeight,"lrt":this.last_render_tick,"ha":this.halign,"va":this.valign,"cw":{}};for(var ch in this.characterWidthList)
save["cw"][ch]=this.characterWidthList[ch];return save;};instanceProto.loadFromJSON=function(o)
{this.text=o["t"];this.characterScale=o["csc"];this.characterSpacing=o["csp"];this.lineHeight=o["lh"];this.textWidth=o["tw"];this.textHeight=o["th"];this.last_render_tick=o["lrt"];if(o.hasOwnProperty("ha"))
this.halign=o["ha"];if(o.hasOwnProperty("va"))
this.valign=o["va"];for(var ch in o["cw"])
this.characterWidthList[ch]=o["cw"][ch];this.text_changed=true;this.lastwrapwidth=this.width;};function trimRight(text)
{return text.replace(/\s\s*$/,'');}
var MAX_CACHE_SIZE=1000;function alloc(cache,Constructor)
{if(cache.length)
return cache.pop();else
return new Constructor();}
function free(cache,data)
{if(cache.length<MAX_CACHE_SIZE)
{cache.push(data);}}
function freeAll(cache,dataList,isArray)
{if(isArray){var i,len;for(i=0,len=dataList.length;i<len;i++)
{free(cache,dataList[i]);}
cr.clearArray(dataList);}else{var prop;for(prop in dataList){if(Object.prototype.hasOwnProperty.call(dataList,prop)){free(cache,dataList[prop]);delete dataList[prop];}}}}
function addLine(inst,lineIndex,cur_line){var lines=inst.lines;var line;cur_line=trimRight(cur_line);if(lineIndex>=lines.length)
lines.push(allocLine());line=lines[lineIndex];line.text=cur_line;line.width=inst.measureWidth(cur_line);inst.textWidth=cr.max(inst.textWidth,line.width);}
var linesCache=[];function allocLine(){return alloc(linesCache,Object);}
function freeLine(l){free(linesCache,l);}
function freeAllLines(arr){freeAll(linesCache,arr,true);}
function addClip(obj,property,x,y,w,h){if(obj[property]===undefined){obj[property]=alloc(clipCache,Object);}
obj[property].x=x;obj[property].y=y;obj[property].w=w;obj[property].h=h;}
var clipCache=[];function allocClip(){return alloc(clipCache,Object);}
function freeAllClip(obj){freeAll(clipCache,obj,false);}
function addClipUV(obj,property,left,top,right,bottom){if(obj[property]===undefined){obj[property]=alloc(clipUVCache,cr.rect);}
obj[property].left=left;obj[property].top=top;obj[property].right=right;obj[property].bottom=bottom;}
var clipUVCache=[];function allocClipUV(){return alloc(clipUVCache,cr.rect);}
function freeAllClipUV(obj){freeAll(clipUVCache,obj,false);}
instanceProto.SplitSheet=function(){var texture=this.texture_img;var texWidth=texture.width;var texHeight=texture.height;var charWidth=this.characterWidth;var charHeight=this.characterHeight;var charU=charWidth/texWidth;var charV=charHeight/texHeight;var charSet=this.characterSet;var cols=Math.floor(texWidth/charWidth);var rows=Math.floor(texHeight/charHeight);for(var c=0;c<charSet.length;c++){if(c>=cols*rows)break;var x=c%cols;var y=Math.floor(c/cols);var letter=charSet.charAt(c);if(this.runtime.glwrap){addClipUV(this.clipUV,letter,x*charU,y*charV,(x+1)*charU,(y+1)*charV);}else{addClip(this.clipList,letter,x*charWidth,y*charHeight,charWidth,charHeight);}}};var wordsCache=[];pluginProto.TokeniseWords=function(text)
{cr.clearArray(wordsCache);var cur_word="";var ch;var i=0;while(i<text.length)
{ch=text.charAt(i);if(ch==="\n")
{if(cur_word.length)
{wordsCache.push(cur_word);cur_word="";}
wordsCache.push("\n");++i;}
else if(ch===" "||ch==="\t"||ch==="-")
{do{cur_word+=text.charAt(i);i++;}
while(i<text.length&&(text.charAt(i)===" "||text.charAt(i)==="\t"));wordsCache.push(cur_word);cur_word="";}
else if(i<text.length)
{cur_word+=ch;i++;}}
if(cur_word.length)
wordsCache.push(cur_word);};pluginProto.WordWrap=function(inst)
{var text=inst.text;var lines=inst.lines;if(!text||!text.length)
{freeAllLines(lines);return;}
var width=inst.width;if(width<=2.0)
{freeAllLines(lines);return;}
var charWidth=inst.characterWidth;var charScale=inst.characterScale;var charSpacing=inst.characterSpacing;if((text.length*(charWidth*charScale+charSpacing)-charSpacing)<=width&&text.indexOf("\n")===-1)
{var all_width=inst.measureWidth(text);if(all_width<=width)
{freeAllLines(lines);lines.push(allocLine());lines[0].text=text;lines[0].width=all_width;inst.textWidth=all_width;inst.textHeight=inst.characterHeight*charScale+inst.lineHeight;return;}}
var wrapbyword=inst.wrapbyword;this.WrapText(inst);inst.textHeight=lines.length*(inst.characterHeight*charScale+inst.lineHeight);};pluginProto.WrapText=function(inst)
{var wrapbyword=inst.wrapbyword;var text=inst.text;var lines=inst.lines;var width=inst.width;var wordArray;if(wrapbyword){this.TokeniseWords(text);wordArray=wordsCache;}else{wordArray=text;}
var cur_line="";var prev_line;var line_width;var i;var lineIndex=0;var line;var ignore_newline=false;for(i=0;i<wordArray.length;i++)
{if(wordArray[i]==="\n")
{if(ignore_newline===true){ignore_newline=false;}else{addLine(inst,lineIndex,cur_line);lineIndex++;}
cur_line="";continue;}
ignore_newline=false;prev_line=cur_line;cur_line+=wordArray[i];line_width=inst.measureWidth(trimRight(cur_line));if(line_width>width)
{if(prev_line===""){addLine(inst,lineIndex,cur_line);cur_line="";ignore_newline=true;}else{addLine(inst,lineIndex,prev_line);cur_line=wordArray[i];}
lineIndex++;if(!wrapbyword&&cur_line===" ")
cur_line="";}}
if(trimRight(cur_line).length)
{addLine(inst,lineIndex,cur_line);lineIndex++;}
for(i=lineIndex;i<lines.length;i++)
freeLine(lines[i]);lines.length=lineIndex;};instanceProto.measureWidth=function(text){var spacing=this.characterSpacing;var len=text.length;var width=0;for(var i=0;i<len;i++){width+=this.getCharacterWidth(text.charAt(i))*this.characterScale+spacing;}
width-=(width>0)?spacing:0;return width;};instanceProto.getCharacterWidth=function(character){var widthList=this.characterWidthList;if(widthList[character]!==undefined){return widthList[character];}else{return this.characterWidth;}};instanceProto.rebuildText=function(){if(this.text_changed||this.width!==this.lastwrapwidth){this.textWidth=0;this.textHeight=0;this.type.plugin.WordWrap(this);this.text_changed=false;this.lastwrapwidth=this.width;}};var EPSILON=0.00001;instanceProto.draw=function(ctx,glmode)
{var texture=this.texture_img;if(this.text!==""&&texture!=null){this.rebuildText();if(this.height<this.characterHeight*this.characterScale+this.lineHeight){return;}
ctx.globalAlpha=this.opacity;var myx=this.x;var myy=this.y;if(this.runtime.pixel_rounding)
{myx=Math.round(myx);myy=Math.round(myy);}
var viewLeft=this.layer.viewLeft;var viewTop=this.layer.viewTop;var viewRight=this.layer.viewRight;var viewBottom=this.layer.viewBottom;ctx.save();ctx.translate(myx,myy);ctx.rotate(this.angle);var angle=this.angle;var ha=this.halign;var va=this.valign;var scale=this.characterScale;var charHeight=this.characterHeight*scale;var lineHeight=this.lineHeight;var charSpace=this.characterSpacing;var lines=this.lines;var textHeight=this.textHeight;var letterWidth;var halign;var valign=va*cr.max(0,(this.height-textHeight));var offx=-(this.hotspotX*this.width);var offy=-(this.hotspotY*this.height);offy+=valign;var drawX;var drawY=offy;var roundX,roundY;for(var i=0;i<lines.length;i++){var line=lines[i].text;var len=lines[i].width;halign=ha*cr.max(0,this.width-len);drawX=offx+halign;drawY+=lineHeight;if(angle===0&&myy+drawY+charHeight<viewTop)
{drawY+=charHeight;continue;}
for(var j=0;j<line.length;j++){var letter=line.charAt(j);letterWidth=this.getCharacterWidth(letter);var clip=this.clipList[letter];if(angle===0&&myx+drawX+letterWidth*scale+charSpace<viewLeft)
{drawX+=letterWidth*scale+charSpace;continue;}
if(drawX+letterWidth*scale>this.width+EPSILON){break;}
if(clip!==undefined){roundX=drawX;roundY=drawY;if(angle===0&&scale===1)
{roundX=Math.round(roundX);roundY=Math.round(roundY);}
ctx.drawImage(this.texture_img,clip.x,clip.y,clip.w,clip.h,roundX,roundY,clip.w*scale,clip.h*scale);}
drawX+=letterWidth*scale+charSpace;if(angle===0&&myx+drawX>viewRight)
break;}
drawY+=charHeight;if(angle===0&&(drawY+charHeight+lineHeight>this.height||myy+drawY>viewBottom))
{break;}}
ctx.restore();}};var dQuad=new cr.quad();function rotateQuad(quad,cosa,sina){var x_temp;x_temp=(quad.tlx*cosa)-(quad.tly*sina);quad.tly=(quad.tly*cosa)+(quad.tlx*sina);quad.tlx=x_temp;x_temp=(quad.trx*cosa)-(quad.try_*sina);quad.try_=(quad.try_*cosa)+(quad.trx*sina);quad.trx=x_temp;x_temp=(quad.blx*cosa)-(quad.bly*sina);quad.bly=(quad.bly*cosa)+(quad.blx*sina);quad.blx=x_temp;x_temp=(quad.brx*cosa)-(quad.bry*sina);quad.bry=(quad.bry*cosa)+(quad.brx*sina);quad.brx=x_temp;}
instanceProto.drawGL=function(glw)
{glw.setTexture(this.webGL_texture);glw.setOpacity(this.opacity);if(!this.text)
return;this.rebuildText();if(this.height<this.characterHeight*this.characterScale+this.lineHeight){return;}
this.update_bbox();var q=this.bquad;var ox=0;var oy=0;if(this.runtime.pixel_rounding)
{ox=Math.round(this.x)-this.x;oy=Math.round(this.y)-this.y;}
var viewLeft=this.layer.viewLeft;var viewTop=this.layer.viewTop;var viewRight=this.layer.viewRight;var viewBottom=this.layer.viewBottom;var angle=this.angle;var ha=this.halign;var va=this.valign;var scale=this.characterScale;var charHeight=this.characterHeight*scale;var lineHeight=this.lineHeight;var charSpace=this.characterSpacing;var lines=this.lines;var textHeight=this.textHeight;var letterWidth;var cosa,sina;if(angle!==0)
{cosa=Math.cos(angle);sina=Math.sin(angle);}
var halign;var valign=va*cr.max(0,(this.height-textHeight));var offx=q.tlx+ox;var offy=q.tly+oy;var drawX;var drawY=valign;var roundX,roundY;for(var i=0;i<lines.length;i++){var line=lines[i].text;var lineWidth=lines[i].width;halign=ha*cr.max(0,this.width-lineWidth);drawX=halign;drawY+=lineHeight;if(angle===0&&offy+drawY+charHeight<viewTop)
{drawY+=charHeight;continue;}
for(var j=0;j<line.length;j++){var letter=line.charAt(j);letterWidth=this.getCharacterWidth(letter);var clipUV=this.clipUV[letter];if(angle===0&&offx+drawX+letterWidth*scale+charSpace<viewLeft)
{drawX+=letterWidth*scale+charSpace;continue;}
if(drawX+letterWidth*scale>this.width+EPSILON)
{break;}
if(clipUV!==undefined){var clipWidth=this.characterWidth*scale;var clipHeight=this.characterHeight*scale;roundX=drawX;roundY=drawY;if(angle===0&&scale===1)
{roundX=Math.round(roundX);roundY=Math.round(roundY);}
dQuad.tlx=roundX;dQuad.tly=roundY;dQuad.trx=roundX+clipWidth;dQuad.try_=roundY;dQuad.blx=roundX;dQuad.bly=roundY+clipHeight;dQuad.brx=roundX+clipWidth;dQuad.bry=roundY+clipHeight;if(angle!==0)
{rotateQuad(dQuad,cosa,sina);}
dQuad.offset(offx,offy);glw.quadTex(dQuad.tlx,dQuad.tly,dQuad.trx,dQuad.try_,dQuad.brx,dQuad.bry,dQuad.blx,dQuad.bly,clipUV);}
drawX+=letterWidth*scale+charSpace;if(angle===0&&offx+drawX>viewRight)
break;}
drawY+=charHeight;if(angle===0&&(drawY+charHeight+lineHeight>this.height||offy+drawY>viewBottom))
{break;}}};function Cnds(){}
Cnds.prototype.CompareText=function(text_to_compare,case_sensitive)
{if(case_sensitive)
return this.text==text_to_compare;else
return cr.equals_nocase(this.text,text_to_compare);};pluginProto.cnds=new Cnds();function Acts(){}
Acts.prototype.SetText=function(param)
{if(cr.is_number(param)&&param<1e9)
param=Math.round(param*1e10)/1e10;var text_to_set=param.toString();if(this.text!==text_to_set)
{this.text=text_to_set;this.text_changed=true;this.runtime.redraw=true;}};Acts.prototype.AppendText=function(param)
{if(cr.is_number(param))
param=Math.round(param*1e10)/1e10;var text_to_append=param.toString();if(text_to_append)
{this.text+=text_to_append;this.text_changed=true;this.runtime.redraw=true;}};Acts.prototype.SetScale=function(param)
{if(param!==this.characterScale){this.characterScale=param;this.text_changed=true;this.runtime.redraw=true;}};Acts.prototype.SetCharacterSpacing=function(param)
{if(param!==this.CharacterSpacing){this.characterSpacing=param;this.text_changed=true;this.runtime.redraw=true;}};Acts.prototype.SetLineHeight=function(param)
{if(param!==this.lineHeight){this.lineHeight=param;this.text_changed=true;this.runtime.redraw=true;}};instanceProto.SetCharWidth=function(character,width){var w=parseInt(width,10);if(this.characterWidthList[character]!==w){this.characterWidthList[character]=w;this.text_changed=true;this.runtime.redraw=true;}};Acts.prototype.SetCharacterWidth=function(characterSet,width)
{if(characterSet!==""){for(var c=0;c<characterSet.length;c++){this.SetCharWidth(characterSet.charAt(c),width);}}};Acts.prototype.SetEffect=function(effect)
{this.blend_mode=effect;this.compositeOp=cr.effectToCompositeOp(effect);cr.setGLBlend(this,effect,this.runtime.gl);this.runtime.redraw=true;};Acts.prototype.SetHAlign=function(a)
{this.halign=a/2.0;this.text_changed=true;this.runtime.redraw=true;};Acts.prototype.SetVAlign=function(a)
{this.valign=a/2.0;this.text_changed=true;this.runtime.redraw=true;};pluginProto.acts=new Acts();function Exps(){}
Exps.prototype.CharacterWidth=function(ret,character)
{ret.set_int(this.getCharacterWidth(character));};Exps.prototype.CharacterHeight=function(ret)
{ret.set_int(this.characterHeight);};Exps.prototype.CharacterScale=function(ret)
{ret.set_float(this.characterScale);};Exps.prototype.CharacterSpacing=function(ret)
{ret.set_int(this.characterSpacing);};Exps.prototype.LineHeight=function(ret)
{ret.set_int(this.lineHeight);};Exps.prototype.Text=function(ret)
{ret.set_string(this.text);};Exps.prototype.TextWidth=function(ret)
{this.rebuildText();ret.set_float(this.textWidth);};Exps.prototype.TextHeight=function(ret)
{this.rebuildText();ret.set_float(this.textHeight);};pluginProto.exps=new Exps();}());;;cr.plugins_.Text=function(runtime)
{this.runtime=runtime;};(function()
{var pluginProto=cr.plugins_.Text.prototype;pluginProto.onCreate=function()
{pluginProto.acts.SetWidth=function(w)
{if(this.width!==w)
{this.width=w;this.text_changed=true;this.set_bbox_changed();}};};pluginProto.Type=function(plugin)
{this.plugin=plugin;this.runtime=plugin.runtime;};var typeProto=pluginProto.Type.prototype;typeProto.onCreate=function()
{};typeProto.onLostWebGLContext=function()
{if(this.is_family)
return;var i,len,inst;for(i=0,len=this.instances.length;i<len;i++)
{inst=this.instances[i];inst.mycanvas=null;inst.myctx=null;inst.mytex=null;}};pluginProto.Instance=function(type)
{this.type=type;this.runtime=type.runtime;if(this.recycled)
cr.clearArray(this.lines);else
this.lines=[];this.text_changed=true;};var instanceProto=pluginProto.Instance.prototype;var requestedWebFonts={};instanceProto.onCreate=function()
{this.text=this.properties[0];this.visible=(this.properties[1]===0);this.font=this.properties[2];this.color=this.properties[3];this.halign=this.properties[4];this.valign=this.properties[5];this.wrapbyword=(this.properties[7]===0);this.lastwidth=this.width;this.lastwrapwidth=this.width;this.lastheight=this.height;this.line_height_offset=this.properties[8];this.facename="";this.fontstyle="";this.ptSize=0;this.textWidth=0;this.textHeight=0;this.parseFont();this.mycanvas=null;this.myctx=null;this.mytex=null;this.need_text_redraw=false;this.last_render_tick=this.runtime.tickcount;if(this.recycled)
this.rcTex.set(0,0,1,1);else
this.rcTex=new cr.rect(0,0,1,1);if(this.runtime.glwrap)
this.runtime.tickMe(this);;};instanceProto.parseFont=function()
{var arr=this.font.split(" ");var i;for(i=0;i<arr.length;i++)
{if(arr[i].substr(arr[i].length-2,2)==="pt")
{this.ptSize=parseInt(arr[i].substr(0,arr[i].length-2));this.pxHeight=Math.ceil((this.ptSize/72.0)*96.0)+4;if(i>0)
this.fontstyle=arr[i-1];this.facename=arr[i+1];for(i=i+2;i<arr.length;i++)
this.facename+=" "+arr[i];break;}}};instanceProto.saveToJSON=function()
{return{"t":this.text,"f":this.font,"c":this.color,"ha":this.halign,"va":this.valign,"wr":this.wrapbyword,"lho":this.line_height_offset,"fn":this.facename,"fs":this.fontstyle,"ps":this.ptSize,"pxh":this.pxHeight,"tw":this.textWidth,"th":this.textHeight,"lrt":this.last_render_tick};};instanceProto.loadFromJSON=function(o)
{this.text=o["t"];this.font=o["f"];this.color=o["c"];this.halign=o["ha"];this.valign=o["va"];this.wrapbyword=o["wr"];this.line_height_offset=o["lho"];this.facename=o["fn"];this.fontstyle=o["fs"];this.ptSize=o["ps"];this.pxHeight=o["pxh"];this.textWidth=o["tw"];this.textHeight=o["th"];this.last_render_tick=o["lrt"];this.text_changed=true;this.lastwidth=this.width;this.lastwrapwidth=this.width;this.lastheight=this.height;};instanceProto.tick=function()
{if(this.runtime.glwrap&&this.mytex&&(this.runtime.tickcount-this.last_render_tick>=300))
{var layer=this.layer;this.update_bbox();var bbox=this.bbox;if(bbox.right<layer.viewLeft||bbox.bottom<layer.viewTop||bbox.left>layer.viewRight||bbox.top>layer.viewBottom)
{this.runtime.glwrap.deleteTexture(this.mytex);this.mytex=null;this.myctx=null;this.mycanvas=null;}}};instanceProto.onDestroy=function()
{this.myctx=null;this.mycanvas=null;if(this.runtime.glwrap&&this.mytex)
this.runtime.glwrap.deleteTexture(this.mytex);this.mytex=null;};instanceProto.updateFont=function()
{this.font=this.fontstyle+" "+this.ptSize.toString()+"pt "+this.facename;this.text_changed=true;this.runtime.redraw=true;};instanceProto.draw=function(ctx,glmode)
{ctx.font=this.font;ctx.textBaseline="top";ctx.fillStyle=this.color;ctx.globalAlpha=glmode?1:this.opacity;var myscale=1;if(glmode)
{myscale=Math.abs(this.layer.getScale());ctx.save();ctx.scale(myscale,myscale);}
if(this.text_changed||this.width!==this.lastwrapwidth)
{this.type.plugin.WordWrap(this.text,this.lines,ctx,this.width,this.wrapbyword);this.text_changed=false;this.lastwrapwidth=this.width;}
this.update_bbox();var penX=glmode?0:this.bquad.tlx;var penY=glmode?0:this.bquad.tly;if(this.runtime.pixel_rounding)
{penX=(penX+0.5)|0;penY=(penY+0.5)|0;}
if(this.angle!==0&&!glmode)
{ctx.save();ctx.translate(penX,penY);ctx.rotate(this.angle);penX=0;penY=0;}
var endY=penY+this.height;var line_height=this.pxHeight;line_height+=this.line_height_offset;var drawX;var i;if(this.valign===1)
penY+=Math.max(this.height/2-(this.lines.length*line_height)/2,0);else if(this.valign===2)
penY+=Math.max(this.height-(this.lines.length*line_height)-2,0);for(i=0;i<this.lines.length;i++)
{drawX=penX;if(this.halign===1)
drawX=penX+(this.width-this.lines[i].width)/2;else if(this.halign===2)
drawX=penX+(this.width-this.lines[i].width);ctx.fillText(this.lines[i].text,drawX,penY);penY+=line_height;if(penY>=endY-line_height)
break;}
if(this.angle!==0||glmode)
ctx.restore();this.last_render_tick=this.runtime.tickcount;};instanceProto.drawGL=function(glw)
{if(this.width<1||this.height<1)
return;var need_redraw=this.text_changed||this.need_text_redraw;this.need_text_redraw=false;var layer_scale=this.layer.getScale();var layer_angle=this.layer.getAngle();var rcTex=this.rcTex;var floatscaledwidth=layer_scale*this.width;var floatscaledheight=layer_scale*this.height;var scaledwidth=Math.ceil(floatscaledwidth);var scaledheight=Math.ceil(floatscaledheight);var absscaledwidth=Math.abs(scaledwidth);var absscaledheight=Math.abs(scaledheight);var halfw=this.runtime.draw_width/2;var halfh=this.runtime.draw_height/2;if(!this.myctx)
{this.mycanvas=document.createElement("canvas");this.mycanvas.width=absscaledwidth;this.mycanvas.height=absscaledheight;this.lastwidth=absscaledwidth;this.lastheight=absscaledheight;need_redraw=true;this.myctx=this.mycanvas.getContext("2d");}
if(absscaledwidth!==this.lastwidth||absscaledheight!==this.lastheight)
{this.mycanvas.width=absscaledwidth;this.mycanvas.height=absscaledheight;if(this.mytex)
{glw.deleteTexture(this.mytex);this.mytex=null;}
need_redraw=true;}
if(need_redraw)
{this.myctx.clearRect(0,0,absscaledwidth,absscaledheight);this.draw(this.myctx,true);if(!this.mytex)
this.mytex=glw.createEmptyTexture(absscaledwidth,absscaledheight,this.runtime.linearSampling,this.runtime.isMobile);glw.videoToTexture(this.mycanvas,this.mytex,this.runtime.isMobile);}
this.lastwidth=absscaledwidth;this.lastheight=absscaledheight;glw.setTexture(this.mytex);glw.setOpacity(this.opacity);glw.resetModelView();glw.translate(-halfw,-halfh);glw.updateModelView();var q=this.bquad;var tlx=this.layer.layerToCanvas(q.tlx,q.tly,true,true);var tly=this.layer.layerToCanvas(q.tlx,q.tly,false,true);var trx=this.layer.layerToCanvas(q.trx,q.try_,true,true);var try_=this.layer.layerToCanvas(q.trx,q.try_,false,true);var brx=this.layer.layerToCanvas(q.brx,q.bry,true,true);var bry=this.layer.layerToCanvas(q.brx,q.bry,false,true);var blx=this.layer.layerToCanvas(q.blx,q.bly,true,true);var bly=this.layer.layerToCanvas(q.blx,q.bly,false,true);if(this.runtime.pixel_rounding||(this.angle===0&&layer_angle===0))
{var ox=((tlx+0.5)|0)-tlx;var oy=((tly+0.5)|0)-tly
tlx+=ox;tly+=oy;trx+=ox;try_+=oy;brx+=ox;bry+=oy;blx+=ox;bly+=oy;}
if(this.angle===0&&layer_angle===0)
{trx=tlx+scaledwidth;try_=tly;brx=trx;bry=tly+scaledheight;blx=tlx;bly=bry;rcTex.right=1;rcTex.bottom=1;}
else
{rcTex.right=floatscaledwidth/scaledwidth;rcTex.bottom=floatscaledheight/scaledheight;}
glw.quadTex(tlx,tly,trx,try_,brx,bry,blx,bly,rcTex);glw.resetModelView();glw.scale(layer_scale,layer_scale);glw.rotateZ(-this.layer.getAngle());glw.translate((this.layer.viewLeft+this.layer.viewRight)/-2,(this.layer.viewTop+this.layer.viewBottom)/-2);glw.updateModelView();this.last_render_tick=this.runtime.tickcount;};var wordsCache=[];pluginProto.TokeniseWords=function(text)
{cr.clearArray(wordsCache);var cur_word="";var ch;var i=0;while(i<text.length)
{ch=text.charAt(i);if(ch==="\n")
{if(cur_word.length)
{wordsCache.push(cur_word);cur_word="";}
wordsCache.push("\n");++i;}
else if(ch===" "||ch==="\t"||ch==="-")
{do{cur_word+=text.charAt(i);i++;}
while(i<text.length&&(text.charAt(i)===" "||text.charAt(i)==="\t"));wordsCache.push(cur_word);cur_word="";}
else if(i<text.length)
{cur_word+=ch;i++;}}
if(cur_word.length)
wordsCache.push(cur_word);};var linesCache=[];function allocLine()
{if(linesCache.length)
return linesCache.pop();else
return{};};function freeLine(l)
{linesCache.push(l);};function freeAllLines(arr)
{var i,len;for(i=0,len=arr.length;i<len;i++)
{freeLine(arr[i]);}
cr.clearArray(arr);};pluginProto.WordWrap=function(text,lines,ctx,width,wrapbyword)
{if(!text||!text.length)
{freeAllLines(lines);return;}
if(width<=2.0)
{freeAllLines(lines);return;}
if(text.length<=100&&text.indexOf("\n")===-1)
{var all_width=ctx.measureText(text).width;if(all_width<=width)
{freeAllLines(lines);lines.push(allocLine());lines[0].text=text;lines[0].width=all_width;return;}}
this.WrapText(text,lines,ctx,width,wrapbyword);};function trimSingleSpaceRight(str)
{if(!str.length||str.charAt(str.length-1)!==" ")
return str;return str.substring(0,str.length-1);};pluginProto.WrapText=function(text,lines,ctx,width,wrapbyword)
{var wordArray;if(wrapbyword)
{this.TokeniseWords(text);wordArray=wordsCache;}
else
wordArray=text;var cur_line="";var prev_line;var line_width;var i;var lineIndex=0;var line;for(i=0;i<wordArray.length;i++)
{if(wordArray[i]==="\n")
{if(lineIndex>=lines.length)
lines.push(allocLine());cur_line=trimSingleSpaceRight(cur_line);line=lines[lineIndex];line.text=cur_line;line.width=ctx.measureText(cur_line).width;lineIndex++;cur_line="";continue;}
prev_line=cur_line;cur_line+=wordArray[i];line_width=ctx.measureText(cur_line).width;if(line_width>=width)
{if(lineIndex>=lines.length)
lines.push(allocLine());prev_line=trimSingleSpaceRight(prev_line);line=lines[lineIndex];line.text=prev_line;line.width=ctx.measureText(prev_line).width;lineIndex++;cur_line=wordArray[i];if(!wrapbyword&&cur_line===" ")
cur_line="";}}
if(cur_line.length)
{if(lineIndex>=lines.length)
lines.push(allocLine());cur_line=trimSingleSpaceRight(cur_line);line=lines[lineIndex];line.text=cur_line;line.width=ctx.measureText(cur_line).width;lineIndex++;}
for(i=lineIndex;i<lines.length;i++)
freeLine(lines[i]);lines.length=lineIndex;};function Cnds(){};Cnds.prototype.CompareText=function(text_to_compare,case_sensitive)
{if(case_sensitive)
return this.text==text_to_compare;else
return cr.equals_nocase(this.text,text_to_compare);};pluginProto.cnds=new Cnds();function Acts(){};Acts.prototype.SetText=function(param)
{if(cr.is_number(param)&&param<1e9)
param=Math.round(param*1e10)/1e10;var text_to_set=param.toString();if(this.text!==text_to_set)
{this.text=text_to_set;this.text_changed=true;this.runtime.redraw=true;}};Acts.prototype.AppendText=function(param)
{if(cr.is_number(param))
param=Math.round(param*1e10)/1e10;var text_to_append=param.toString();if(text_to_append)
{this.text+=text_to_append;this.text_changed=true;this.runtime.redraw=true;}};Acts.prototype.SetFontFace=function(face_,style_)
{var newstyle="";switch(style_){case 1:newstyle="bold";break;case 2:newstyle="italic";break;case 3:newstyle="bold italic";break;}
if(face_===this.facename&&newstyle===this.fontstyle)
return;this.facename=face_;this.fontstyle=newstyle;this.updateFont();};Acts.prototype.SetFontSize=function(size_)
{if(this.ptSize===size_)
return;this.ptSize=size_;this.pxHeight=Math.ceil((this.ptSize/72.0)*96.0)+4;this.updateFont();};Acts.prototype.SetFontColor=function(rgb)
{var newcolor="rgb("+cr.GetRValue(rgb).toString()+","+cr.GetGValue(rgb).toString()+","+cr.GetBValue(rgb).toString()+")";if(newcolor===this.color)
return;this.color=newcolor;this.need_text_redraw=true;this.runtime.redraw=true;};Acts.prototype.SetWebFont=function(familyname_,cssurl_)
{if(this.runtime.isDomFree)
{cr.logexport("[Construct 2] Text plugin: 'Set web font' not supported on this platform - the action has been ignored");return;}
var self=this;var refreshFunc=(function(){self.runtime.redraw=true;self.text_changed=true;});if(requestedWebFonts.hasOwnProperty(cssurl_))
{var newfacename="'"+familyname_+"'";if(this.facename===newfacename)
return;this.facename=newfacename;this.updateFont();for(var i=1;i<10;i++)
{setTimeout(refreshFunc,i*100);setTimeout(refreshFunc,i*1000);}
return;}
var wf=document.createElement("link");wf.href=cssurl_;wf.rel="stylesheet";wf.type="text/css";wf.onload=refreshFunc;document.getElementsByTagName('head')[0].appendChild(wf);requestedWebFonts[cssurl_]=true;this.facename="'"+familyname_+"'";this.updateFont();for(var i=1;i<10;i++)
{setTimeout(refreshFunc,i*100);setTimeout(refreshFunc,i*1000);};};Acts.prototype.SetEffect=function(effect)
{this.blend_mode=effect;this.compositeOp=cr.effectToCompositeOp(effect);cr.setGLBlend(this,effect,this.runtime.gl);this.runtime.redraw=true;};pluginProto.acts=new Acts();function Exps(){};Exps.prototype.Text=function(ret)
{ret.set_string(this.text);};Exps.prototype.FaceName=function(ret)
{ret.set_string(this.facename);};Exps.prototype.FaceSize=function(ret)
{ret.set_int(this.ptSize);};Exps.prototype.TextWidth=function(ret)
{var w=0;var i,len,x;for(i=0,len=this.lines.length;i<len;i++)
{x=this.lines[i].width;if(w<x)
w=x;}
ret.set_int(w);};Exps.prototype.TextHeight=function(ret)
{ret.set_int(this.lines.length*(this.pxHeight+this.line_height_offset)-this.line_height_offset);};pluginProto.exps=new Exps();}());;;cr.plugins_.Touch=function(runtime)
{this.runtime=runtime;};(function()
{var pluginProto=cr.plugins_.Touch.prototype;pluginProto.Type=function(plugin)
{this.plugin=plugin;this.runtime=plugin.runtime;};var typeProto=pluginProto.Type.prototype;typeProto.onCreate=function()
{};pluginProto.Instance=function(type)
{this.type=type;this.runtime=type.runtime;this.touches=[];this.mouseDown=false;};var instanceProto=pluginProto.Instance.prototype;var dummyoffset={left:0,top:0};instanceProto.findTouch=function(id)
{var i,len;for(i=0,len=this.touches.length;i<len;i++)
{if(this.touches[i]["id"]===id)
return i;}
return-1;};var appmobi_accx=0;var appmobi_accy=0;var appmobi_accz=0;function AppMobiGetAcceleration(evt)
{appmobi_accx=evt.x;appmobi_accy=evt.y;appmobi_accz=evt.z;};var pg_accx=0;var pg_accy=0;var pg_accz=0;function PhoneGapGetAcceleration(evt)
{pg_accx=evt.x;pg_accy=evt.y;pg_accz=evt.z;};var theInstance=null;var touchinfo_cache=[];function AllocTouchInfo(x,y,id,index)
{var ret;if(touchinfo_cache.length)
ret=touchinfo_cache.pop();else
ret=new TouchInfo();ret.init(x,y,id,index);return ret;};function ReleaseTouchInfo(ti)
{if(touchinfo_cache.length<100)
touchinfo_cache.push(ti);};var GESTURE_HOLD_THRESHOLD=15;var GESTURE_HOLD_TIMEOUT=500;var GESTURE_TAP_TIMEOUT=333;var GESTURE_DOUBLETAP_THRESHOLD=25;function TouchInfo()
{this.starttime=0;this.time=0;this.lasttime=0;this.startx=0;this.starty=0;this.x=0;this.y=0;this.lastx=0;this.lasty=0;this["id"]=0;this.startindex=0;this.triggeredHold=false;this.tooFarForHold=false;};TouchInfo.prototype.init=function(x,y,id,index)
{var nowtime=cr.performance_now();this.time=nowtime;this.lasttime=nowtime;this.starttime=nowtime;this.startx=x;this.starty=y;this.x=x;this.y=y;this.lastx=x;this.lasty=y;this.width=0;this.height=0;this.pressure=0;this["id"]=id;this.startindex=index;this.triggeredHold=false;this.tooFarForHold=false;};TouchInfo.prototype.update=function(nowtime,x,y,width,height,pressure)
{this.lasttime=this.time;this.time=nowtime;this.lastx=this.x;this.lasty=this.y;this.x=x;this.y=y;this.width=width;this.height=height;this.pressure=pressure;if(!this.tooFarForHold&&cr.distanceTo(this.startx,this.starty,this.x,this.y)>=GESTURE_HOLD_THRESHOLD)
{this.tooFarForHold=true;}};TouchInfo.prototype.maybeTriggerHold=function(inst,index)
{if(this.triggeredHold)
return;var nowtime=cr.performance_now();if(nowtime-this.starttime>=GESTURE_HOLD_TIMEOUT&&!this.tooFarForHold&&cr.distanceTo(this.startx,this.starty,this.x,this.y)<GESTURE_HOLD_THRESHOLD)
{this.triggeredHold=true;inst.trigger_index=this.startindex;inst.trigger_id=this["id"];inst.getTouchIndex=index;inst.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnHoldGesture,inst);inst.curTouchX=this.x;inst.curTouchY=this.y;inst.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnHoldGestureObject,inst);inst.getTouchIndex=0;}};var lastTapX=-1000;var lastTapY=-1000;var lastTapTime=-10000;TouchInfo.prototype.maybeTriggerTap=function(inst,index)
{if(this.triggeredHold)
return;var nowtime=cr.performance_now();if(nowtime-this.starttime<=GESTURE_TAP_TIMEOUT&&!this.tooFarForHold&&cr.distanceTo(this.startx,this.starty,this.x,this.y)<GESTURE_HOLD_THRESHOLD)
{inst.trigger_index=this.startindex;inst.trigger_id=this["id"];inst.getTouchIndex=index;if((nowtime-lastTapTime<=GESTURE_TAP_TIMEOUT*2)&&cr.distanceTo(lastTapX,lastTapY,this.x,this.y)<GESTURE_DOUBLETAP_THRESHOLD)
{inst.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnDoubleTapGesture,inst);inst.curTouchX=this.x;inst.curTouchY=this.y;inst.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnDoubleTapGestureObject,inst);lastTapX=-1000;lastTapY=-1000;lastTapTime=-10000;}
else
{inst.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTapGesture,inst);inst.curTouchX=this.x;inst.curTouchY=this.y;inst.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTapGestureObject,inst);lastTapX=this.x;lastTapY=this.y;lastTapTime=nowtime;}
inst.getTouchIndex=0;}};instanceProto.onCreate=function()
{theInstance=this;this.isWindows8=!!(typeof window["c2isWindows8"]!=="undefined"&&window["c2isWindows8"]);this.orient_alpha=0;this.orient_beta=0;this.orient_gamma=0;this.acc_g_x=0;this.acc_g_y=0;this.acc_g_z=0;this.acc_x=0;this.acc_y=0;this.acc_z=0;this.curTouchX=0;this.curTouchY=0;this.trigger_index=0;this.trigger_id=0;this.getTouchIndex=0;this.useMouseInput=(this.properties[0]!==0);var elem=(this.runtime.fullscreen_mode>0)?document:this.runtime.canvas;var elem2=document;if(this.runtime.isDirectCanvas)
elem2=elem=window["Canvas"];else if(this.runtime.isCocoonJs)
elem2=elem=window;var self=this;if(typeof PointerEvent!=="undefined")
{elem.addEventListener("pointerdown",function(info){self.onPointerStart(info);},false);elem.addEventListener("pointermove",function(info){self.onPointerMove(info);},false);elem2.addEventListener("pointerup",function(info){self.onPointerEnd(info,false);},false);elem2.addEventListener("pointercancel",function(info){self.onPointerEnd(info,true);},false);if(this.runtime.canvas)
{this.runtime.canvas.addEventListener("MSGestureHold",function(e){e.preventDefault();},false);document.addEventListener("MSGestureHold",function(e){e.preventDefault();},false);this.runtime.canvas.addEventListener("gesturehold",function(e){e.preventDefault();},false);document.addEventListener("gesturehold",function(e){e.preventDefault();},false);}}
else if(window.navigator["msPointerEnabled"])
{elem.addEventListener("MSPointerDown",function(info){self.onPointerStart(info);},false);elem.addEventListener("MSPointerMove",function(info){self.onPointerMove(info);},false);elem2.addEventListener("MSPointerUp",function(info){self.onPointerEnd(info,false);},false);elem2.addEventListener("MSPointerCancel",function(info){self.onPointerEnd(info,true);},false);if(this.runtime.canvas)
{this.runtime.canvas.addEventListener("MSGestureHold",function(e){e.preventDefault();},false);document.addEventListener("MSGestureHold",function(e){e.preventDefault();},false);}}
else
{elem.addEventListener("touchstart",function(info){self.onTouchStart(info);},false);elem.addEventListener("touchmove",function(info){self.onTouchMove(info);},false);elem2.addEventListener("touchend",function(info){self.onTouchEnd(info,false);},false);elem2.addEventListener("touchcancel",function(info){self.onTouchEnd(info,true);},false);}
if(this.isWindows8)
{var win8accelerometerFn=function(e){var reading=e["reading"];self.acc_x=reading["accelerationX"];self.acc_y=reading["accelerationY"];self.acc_z=reading["accelerationZ"];};var win8inclinometerFn=function(e){var reading=e["reading"];self.orient_alpha=reading["yawDegrees"];self.orient_beta=reading["pitchDegrees"];self.orient_gamma=reading["rollDegrees"];};var accelerometer=Windows["Devices"]["Sensors"]["Accelerometer"]["getDefault"]();if(accelerometer)
{accelerometer["reportInterval"]=Math.max(accelerometer["minimumReportInterval"],16);accelerometer.addEventListener("readingchanged",win8accelerometerFn);}
var inclinometer=Windows["Devices"]["Sensors"]["Inclinometer"]["getDefault"]();if(inclinometer)
{inclinometer["reportInterval"]=Math.max(inclinometer["minimumReportInterval"],16);inclinometer.addEventListener("readingchanged",win8inclinometerFn);}
document.addEventListener("visibilitychange",function(e){if(document["hidden"]||document["msHidden"])
{if(accelerometer)
accelerometer.removeEventListener("readingchanged",win8accelerometerFn);if(inclinometer)
inclinometer.removeEventListener("readingchanged",win8inclinometerFn);}
else
{if(accelerometer)
accelerometer.addEventListener("readingchanged",win8accelerometerFn);if(inclinometer)
inclinometer.addEventListener("readingchanged",win8inclinometerFn);}},false);}
else
{window.addEventListener("deviceorientation",function(eventData){self.orient_alpha=eventData["alpha"]||0;self.orient_beta=eventData["beta"]||0;self.orient_gamma=eventData["gamma"]||0;},false);window.addEventListener("devicemotion",function(eventData){if(eventData["accelerationIncludingGravity"])
{self.acc_g_x=eventData["accelerationIncludingGravity"]["x"]||0;self.acc_g_y=eventData["accelerationIncludingGravity"]["y"]||0;self.acc_g_z=eventData["accelerationIncludingGravity"]["z"]||0;}
if(eventData["acceleration"])
{self.acc_x=eventData["acceleration"]["x"]||0;self.acc_y=eventData["acceleration"]["y"]||0;self.acc_z=eventData["acceleration"]["z"]||0;}},false);}
if(this.useMouseInput&&!this.runtime.isDomFree)
{jQuery(document).mousemove(function(info){self.onMouseMove(info);});jQuery(document).mousedown(function(info){self.onMouseDown(info);});jQuery(document).mouseup(function(info){self.onMouseUp(info);});}
if(!this.runtime.isiOS&&this.runtime.isCordova&&navigator["accelerometer"]&&navigator["accelerometer"]["watchAcceleration"])
{navigator["accelerometer"]["watchAcceleration"](PhoneGapGetAcceleration,null,{"frequency":40});}
this.runtime.tick2Me(this);};instanceProto.onPointerMove=function(info)
{if(info["pointerType"]===info["MSPOINTER_TYPE_MOUSE"]||info["pointerType"]==="mouse")
return;if(info.preventDefault)
info.preventDefault();var i=this.findTouch(info["pointerId"]);var nowtime=cr.performance_now();if(i>=0)
{var offset=this.runtime.isDomFree?dummyoffset:jQuery(this.runtime.canvas).offset();var t=this.touches[i];if(nowtime-t.time<2)
return;t.update(nowtime,info.pageX-offset.left,info.pageY-offset.top,info.width||0,info.height||0,info.pressure||0);}};instanceProto.onPointerStart=function(info)
{if(info["pointerType"]===info["MSPOINTER_TYPE_MOUSE"]||info["pointerType"]==="mouse")
return;if(info.preventDefault&&cr.isCanvasInputEvent(info))
info.preventDefault();var offset=this.runtime.isDomFree?dummyoffset:jQuery(this.runtime.canvas).offset();var touchx=info.pageX-offset.left;var touchy=info.pageY-offset.top;var nowtime=cr.performance_now();this.trigger_index=this.touches.length;this.trigger_id=info["pointerId"];this.touches.push(AllocTouchInfo(touchx,touchy,info["pointerId"],this.trigger_index));this.runtime.isInUserInputEvent=true;this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchStart,this);this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchStart,this);this.curTouchX=touchx;this.curTouchY=touchy;this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchObject,this);this.runtime.isInUserInputEvent=false;};instanceProto.onPointerEnd=function(info,isCancel)
{if(info["pointerType"]===info["MSPOINTER_TYPE_MOUSE"]||info["pointerType"]==="mouse")
return;if(info.preventDefault&&cr.isCanvasInputEvent(info))
info.preventDefault();var i=this.findTouch(info["pointerId"]);this.trigger_index=(i>=0?this.touches[i].startindex:-1);this.trigger_id=(i>=0?this.touches[i]["id"]:-1);this.runtime.isInUserInputEvent=true;this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchEnd,this);this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchEnd,this);if(i>=0)
{if(!isCancel)
this.touches[i].maybeTriggerTap(this,i);ReleaseTouchInfo(this.touches[i]);this.touches.splice(i,1);}
this.runtime.isInUserInputEvent=false;};instanceProto.onTouchMove=function(info)
{if(info.preventDefault)
info.preventDefault();var nowtime=cr.performance_now();var i,len,t,u;for(i=0,len=info.changedTouches.length;i<len;i++)
{t=info.changedTouches[i];var j=this.findTouch(t["identifier"]);if(j>=0)
{var offset=this.runtime.isDomFree?dummyoffset:jQuery(this.runtime.canvas).offset();u=this.touches[j];if(nowtime-u.time<2)
continue;var touchWidth=(t.radiusX||t.webkitRadiusX||t.mozRadiusX||t.msRadiusX||0)*2;var touchHeight=(t.radiusY||t.webkitRadiusY||t.mozRadiusY||t.msRadiusY||0)*2;var touchForce=t.force||t.webkitForce||t.mozForce||t.msForce||0;u.update(nowtime,t.pageX-offset.left,t.pageY-offset.top,touchWidth,touchHeight,touchForce);}}};instanceProto.onTouchStart=function(info)
{if(info.preventDefault&&cr.isCanvasInputEvent(info))
info.preventDefault();var offset=this.runtime.isDomFree?dummyoffset:jQuery(this.runtime.canvas).offset();var nowtime=cr.performance_now();this.runtime.isInUserInputEvent=true;var i,len,t,j;for(i=0,len=info.changedTouches.length;i<len;i++)
{t=info.changedTouches[i];j=this.findTouch(t["identifier"]);if(j!==-1)
continue;var touchx=t.pageX-offset.left;var touchy=t.pageY-offset.top;this.trigger_index=this.touches.length;this.trigger_id=t["identifier"];this.touches.push(AllocTouchInfo(touchx,touchy,t["identifier"],this.trigger_index));this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchStart,this);this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchStart,this);this.curTouchX=touchx;this.curTouchY=touchy;this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchObject,this);}
this.runtime.isInUserInputEvent=false;};instanceProto.onTouchEnd=function(info,isCancel)
{if(info.preventDefault&&cr.isCanvasInputEvent(info))
info.preventDefault();this.runtime.isInUserInputEvent=true;var i,len,t,j;for(i=0,len=info.changedTouches.length;i<len;i++)
{t=info.changedTouches[i];j=this.findTouch(t["identifier"]);if(j>=0)
{this.trigger_index=this.touches[j].startindex;this.trigger_id=this.touches[j]["id"];this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchEnd,this);this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchEnd,this);if(!isCancel)
this.touches[j].maybeTriggerTap(this,j);ReleaseTouchInfo(this.touches[j]);this.touches.splice(j,1);}}
this.runtime.isInUserInputEvent=false;};instanceProto.getAlpha=function()
{if(this.runtime.isCordova&&this.orient_alpha===0&&pg_accz!==0)
return pg_accz*90;else
return this.orient_alpha;};instanceProto.getBeta=function()
{if(this.runtime.isCordova&&this.orient_beta===0&&pg_accy!==0)
return pg_accy*90;else
return this.orient_beta;};instanceProto.getGamma=function()
{if(this.runtime.isCordova&&this.orient_gamma===0&&pg_accx!==0)
return pg_accx*90;else
return this.orient_gamma;};var noop_func=function(){};function isCompatibilityMouseEvent(e)
{return(e["sourceCapabilities"]&&e["sourceCapabilities"]["firesTouchEvents"])||(e.originalEvent&&e.originalEvent["sourceCapabilities"]&&e.originalEvent["sourceCapabilities"]["firesTouchEvents"]);};instanceProto.onMouseDown=function(info)
{if(isCompatibilityMouseEvent(info))
return;var t={pageX:info.pageX,pageY:info.pageY,"identifier":0};var fakeinfo={changedTouches:[t]};this.onTouchStart(fakeinfo);this.mouseDown=true;};instanceProto.onMouseMove=function(info)
{if(!this.mouseDown)
return;if(isCompatibilityMouseEvent(info))
return;var t={pageX:info.pageX,pageY:info.pageY,"identifier":0};var fakeinfo={changedTouches:[t]};this.onTouchMove(fakeinfo);};instanceProto.onMouseUp=function(info)
{if(info.preventDefault&&this.runtime.had_a_click&&!this.runtime.isMobile)
info.preventDefault();this.runtime.had_a_click=true;if(isCompatibilityMouseEvent(info))
return;var t={pageX:info.pageX,pageY:info.pageY,"identifier":0};var fakeinfo={changedTouches:[t]};this.onTouchEnd(fakeinfo);this.mouseDown=false;};instanceProto.tick2=function()
{var i,len,t;var nowtime=cr.performance_now();for(i=0,len=this.touches.length;i<len;++i)
{t=this.touches[i];if(t.time<=nowtime-50)
t.lasttime=nowtime;t.maybeTriggerHold(this,i);}};function Cnds(){};Cnds.prototype.OnTouchStart=function()
{return true;};Cnds.prototype.OnTouchEnd=function()
{return true;};Cnds.prototype.IsInTouch=function()
{return this.touches.length;};Cnds.prototype.OnTouchObject=function(type)
{if(!type)
return false;return this.runtime.testAndSelectCanvasPointOverlap(type,this.curTouchX,this.curTouchY,false);};var touching=[];Cnds.prototype.IsTouchingObject=function(type)
{if(!type)
return false;var sol=type.getCurrentSol();var instances=sol.getObjects();var px,py;var i,leni,j,lenj;for(i=0,leni=instances.length;i<leni;i++)
{var inst=instances[i];inst.update_bbox();for(j=0,lenj=this.touches.length;j<lenj;j++)
{var touch=this.touches[j];px=inst.layer.canvasToLayer(touch.x,touch.y,true);py=inst.layer.canvasToLayer(touch.x,touch.y,false);if(inst.contains_pt(px,py))
{touching.push(inst);break;}}}
if(touching.length)
{sol.select_all=false;cr.shallowAssignArray(sol.instances,touching);type.applySolToContainer();cr.clearArray(touching);return true;}
else
return false;};Cnds.prototype.CompareTouchSpeed=function(index,cmp,s)
{index=Math.floor(index);if(index<0||index>=this.touches.length)
return false;var t=this.touches[index];var dist=cr.distanceTo(t.x,t.y,t.lastx,t.lasty);var timediff=(t.time-t.lasttime)/1000;var speed=0;if(timediff>0)
speed=dist/timediff;return cr.do_cmp(speed,cmp,s);};Cnds.prototype.OrientationSupported=function()
{return typeof window["DeviceOrientationEvent"]!=="undefined";};Cnds.prototype.MotionSupported=function()
{return typeof window["DeviceMotionEvent"]!=="undefined";};Cnds.prototype.CompareOrientation=function(orientation_,cmp_,angle_)
{var v=0;if(orientation_===0)
v=this.getAlpha();else if(orientation_===1)
v=this.getBeta();else
v=this.getGamma();return cr.do_cmp(v,cmp_,angle_);};Cnds.prototype.CompareAcceleration=function(acceleration_,cmp_,angle_)
{var v=0;if(acceleration_===0)
v=this.acc_g_x;else if(acceleration_===1)
v=this.acc_g_y;else if(acceleration_===2)
v=this.acc_g_z;else if(acceleration_===3)
v=this.acc_x;else if(acceleration_===4)
v=this.acc_y;else if(acceleration_===5)
v=this.acc_z;return cr.do_cmp(v,cmp_,angle_);};Cnds.prototype.OnNthTouchStart=function(touch_)
{touch_=Math.floor(touch_);return touch_===this.trigger_index;};Cnds.prototype.OnNthTouchEnd=function(touch_)
{touch_=Math.floor(touch_);return touch_===this.trigger_index;};Cnds.prototype.HasNthTouch=function(touch_)
{touch_=Math.floor(touch_);return this.touches.length>=touch_+1;};Cnds.prototype.OnHoldGesture=function()
{return true;};Cnds.prototype.OnTapGesture=function()
{return true;};Cnds.prototype.OnDoubleTapGesture=function()
{return true;};Cnds.prototype.OnHoldGestureObject=function(type)
{if(!type)
return false;return this.runtime.testAndSelectCanvasPointOverlap(type,this.curTouchX,this.curTouchY,false);};Cnds.prototype.OnTapGestureObject=function(type)
{if(!type)
return false;return this.runtime.testAndSelectCanvasPointOverlap(type,this.curTouchX,this.curTouchY,false);};Cnds.prototype.OnDoubleTapGestureObject=function(type)
{if(!type)
return false;return this.runtime.testAndSelectCanvasPointOverlap(type,this.curTouchX,this.curTouchY,false);};pluginProto.cnds=new Cnds();function Exps(){};Exps.prototype.TouchCount=function(ret)
{ret.set_int(this.touches.length);};Exps.prototype.X=function(ret,layerparam)
{var index=this.getTouchIndex;if(index<0||index>=this.touches.length)
{ret.set_float(0);return;}
var layer,oldScale,oldZoomRate,oldParallaxX,oldAngle;if(cr.is_undefined(layerparam))
{layer=this.runtime.getLayerByNumber(0);oldScale=layer.scale;oldZoomRate=layer.zoomRate;oldParallaxX=layer.parallaxX;oldAngle=layer.angle;layer.scale=1;layer.zoomRate=1.0;layer.parallaxX=1.0;layer.angle=0;ret.set_float(layer.canvasToLayer(this.touches[index].x,this.touches[index].y,true));layer.scale=oldScale;layer.zoomRate=oldZoomRate;layer.parallaxX=oldParallaxX;layer.angle=oldAngle;}
else
{if(cr.is_number(layerparam))
layer=this.runtime.getLayerByNumber(layerparam);else
layer=this.runtime.getLayerByName(layerparam);if(layer)
ret.set_float(layer.canvasToLayer(this.touches[index].x,this.touches[index].y,true));else
ret.set_float(0);}};Exps.prototype.XAt=function(ret,index,layerparam)
{index=Math.floor(index);if(index<0||index>=this.touches.length)
{ret.set_float(0);return;}
var layer,oldScale,oldZoomRate,oldParallaxX,oldAngle;if(cr.is_undefined(layerparam))
{layer=this.runtime.getLayerByNumber(0);oldScale=layer.scale;oldZoomRate=layer.zoomRate;oldParallaxX=layer.parallaxX;oldAngle=layer.angle;layer.scale=1;layer.zoomRate=1.0;layer.parallaxX=1.0;layer.angle=0;ret.set_float(layer.canvasToLayer(this.touches[index].x,this.touches[index].y,true));layer.scale=oldScale;layer.zoomRate=oldZoomRate;layer.parallaxX=oldParallaxX;layer.angle=oldAngle;}
else
{if(cr.is_number(layerparam))
layer=this.runtime.getLayerByNumber(layerparam);else
layer=this.runtime.getLayerByName(layerparam);if(layer)
ret.set_float(layer.canvasToLayer(this.touches[index].x,this.touches[index].y,true));else
ret.set_float(0);}};Exps.prototype.XForID=function(ret,id,layerparam)
{var index=this.findTouch(id);if(index<0)
{ret.set_float(0);return;}
var touch=this.touches[index];var layer,oldScale,oldZoomRate,oldParallaxX,oldAngle;if(cr.is_undefined(layerparam))
{layer=this.runtime.getLayerByNumber(0);oldScale=layer.scale;oldZoomRate=layer.zoomRate;oldParallaxX=layer.parallaxX;oldAngle=layer.angle;layer.scale=1;layer.zoomRate=1.0;layer.parallaxX=1.0;layer.angle=0;ret.set_float(layer.canvasToLayer(touch.x,touch.y,true));layer.scale=oldScale;layer.zoomRate=oldZoomRate;layer.parallaxX=oldParallaxX;layer.angle=oldAngle;}
else
{if(cr.is_number(layerparam))
layer=this.runtime.getLayerByNumber(layerparam);else
layer=this.runtime.getLayerByName(layerparam);if(layer)
ret.set_float(layer.canvasToLayer(touch.x,touch.y,true));else
ret.set_float(0);}};Exps.prototype.Y=function(ret,layerparam)
{var index=this.getTouchIndex;if(index<0||index>=this.touches.length)
{ret.set_float(0);return;}
var layer,oldScale,oldZoomRate,oldParallaxY,oldAngle;if(cr.is_undefined(layerparam))
{layer=this.runtime.getLayerByNumber(0);oldScale=layer.scale;oldZoomRate=layer.zoomRate;oldParallaxY=layer.parallaxY;oldAngle=layer.angle;layer.scale=1;layer.zoomRate=1.0;layer.parallaxY=1.0;layer.angle=0;ret.set_float(layer.canvasToLayer(this.touches[index].x,this.touches[index].y,false));layer.scale=oldScale;layer.zoomRate=oldZoomRate;layer.parallaxY=oldParallaxY;layer.angle=oldAngle;}
else
{if(cr.is_number(layerparam))
layer=this.runtime.getLayerByNumber(layerparam);else
layer=this.runtime.getLayerByName(layerparam);if(layer)
ret.set_float(layer.canvasToLayer(this.touches[index].x,this.touches[index].y,false));else
ret.set_float(0);}};Exps.prototype.YAt=function(ret,index,layerparam)
{index=Math.floor(index);if(index<0||index>=this.touches.length)
{ret.set_float(0);return;}
var layer,oldScale,oldZoomRate,oldParallaxY,oldAngle;if(cr.is_undefined(layerparam))
{layer=this.runtime.getLayerByNumber(0);oldScale=layer.scale;oldZoomRate=layer.zoomRate;oldParallaxY=layer.parallaxY;oldAngle=layer.angle;layer.scale=1;layer.zoomRate=1.0;layer.parallaxY=1.0;layer.angle=0;ret.set_float(layer.canvasToLayer(this.touches[index].x,this.touches[index].y,false));layer.scale=oldScale;layer.zoomRate=oldZoomRate;layer.parallaxY=oldParallaxY;layer.angle=oldAngle;}
else
{if(cr.is_number(layerparam))
layer=this.runtime.getLayerByNumber(layerparam);else
layer=this.runtime.getLayerByName(layerparam);if(layer)
ret.set_float(layer.canvasToLayer(this.touches[index].x,this.touches[index].y,false));else
ret.set_float(0);}};Exps.prototype.YForID=function(ret,id,layerparam)
{var index=this.findTouch(id);if(index<0)
{ret.set_float(0);return;}
var touch=this.touches[index];var layer,oldScale,oldZoomRate,oldParallaxY,oldAngle;if(cr.is_undefined(layerparam))
{layer=this.runtime.getLayerByNumber(0);oldScale=layer.scale;oldZoomRate=layer.zoomRate;oldParallaxY=layer.parallaxY;oldAngle=layer.angle;layer.scale=1;layer.zoomRate=1.0;layer.parallaxY=1.0;layer.angle=0;ret.set_float(layer.canvasToLayer(touch.x,touch.y,false));layer.scale=oldScale;layer.zoomRate=oldZoomRate;layer.parallaxY=oldParallaxY;layer.angle=oldAngle;}
else
{if(cr.is_number(layerparam))
layer=this.runtime.getLayerByNumber(layerparam);else
layer=this.runtime.getLayerByName(layerparam);if(layer)
ret.set_float(layer.canvasToLayer(touch.x,touch.y,false));else
ret.set_float(0);}};Exps.prototype.AbsoluteX=function(ret)
{if(this.touches.length)
ret.set_float(this.touches[0].x);else
ret.set_float(0);};Exps.prototype.AbsoluteXAt=function(ret,index)
{index=Math.floor(index);if(index<0||index>=this.touches.length)
{ret.set_float(0);return;}
ret.set_float(this.touches[index].x);};Exps.prototype.AbsoluteXForID=function(ret,id)
{var index=this.findTouch(id);if(index<0)
{ret.set_float(0);return;}
var touch=this.touches[index];ret.set_float(touch.x);};Exps.prototype.AbsoluteY=function(ret)
{if(this.touches.length)
ret.set_float(this.touches[0].y);else
ret.set_float(0);};Exps.prototype.AbsoluteYAt=function(ret,index)
{index=Math.floor(index);if(index<0||index>=this.touches.length)
{ret.set_float(0);return;}
ret.set_float(this.touches[index].y);};Exps.prototype.AbsoluteYForID=function(ret,id)
{var index=this.findTouch(id);if(index<0)
{ret.set_float(0);return;}
var touch=this.touches[index];ret.set_float(touch.y);};Exps.prototype.SpeedAt=function(ret,index)
{index=Math.floor(index);if(index<0||index>=this.touches.length)
{ret.set_float(0);return;}
var t=this.touches[index];var dist=cr.distanceTo(t.x,t.y,t.lastx,t.lasty);var timediff=(t.time-t.lasttime)/1000;if(timediff<=0)
ret.set_float(0);else
ret.set_float(dist/timediff);};Exps.prototype.SpeedForID=function(ret,id)
{var index=this.findTouch(id);if(index<0)
{ret.set_float(0);return;}
var touch=this.touches[index];var dist=cr.distanceTo(touch.x,touch.y,touch.lastx,touch.lasty);var timediff=(touch.time-touch.lasttime)/1000;if(timediff<=0)
ret.set_float(0);else
ret.set_float(dist/timediff);};Exps.prototype.AngleAt=function(ret,index)
{index=Math.floor(index);if(index<0||index>=this.touches.length)
{ret.set_float(0);return;}
var t=this.touches[index];ret.set_float(cr.to_degrees(cr.angleTo(t.lastx,t.lasty,t.x,t.y)));};Exps.prototype.AngleForID=function(ret,id)
{var index=this.findTouch(id);if(index<0)
{ret.set_float(0);return;}
var touch=this.touches[index];ret.set_float(cr.to_degrees(cr.angleTo(touch.lastx,touch.lasty,touch.x,touch.y)));};Exps.prototype.Alpha=function(ret)
{ret.set_float(this.getAlpha());};Exps.prototype.Beta=function(ret)
{ret.set_float(this.getBeta());};Exps.prototype.Gamma=function(ret)
{ret.set_float(this.getGamma());};Exps.prototype.AccelerationXWithG=function(ret)
{ret.set_float(this.acc_g_x);};Exps.prototype.AccelerationYWithG=function(ret)
{ret.set_float(this.acc_g_y);};Exps.prototype.AccelerationZWithG=function(ret)
{ret.set_float(this.acc_g_z);};Exps.prototype.AccelerationX=function(ret)
{ret.set_float(this.acc_x);};Exps.prototype.AccelerationY=function(ret)
{ret.set_float(this.acc_y);};Exps.prototype.AccelerationZ=function(ret)
{ret.set_float(this.acc_z);};Exps.prototype.TouchIndex=function(ret)
{ret.set_int(this.trigger_index);};Exps.prototype.TouchID=function(ret)
{ret.set_float(this.trigger_id);};Exps.prototype.WidthForID=function(ret,id)
{var index=this.findTouch(id);if(index<0)
{ret.set_float(0);return;}
var touch=this.touches[index];ret.set_float(touch.width);};Exps.prototype.HeightForID=function(ret,id)
{var index=this.findTouch(id);if(index<0)
{ret.set_float(0);return;}
var touch=this.touches[index];ret.set_float(touch.height);};Exps.prototype.PressureForID=function(ret,id)
{var index=this.findTouch(id);if(index<0)
{ret.set_float(0);return;}
var touch=this.touches[index];ret.set_float(touch.pressure);};pluginProto.exps=new Exps();}());;;cr.plugins_.Twitter=function(runtime)
{this.runtime=runtime;};(function()
{var pluginProto=cr.plugins_.Twitter.prototype;pluginProto.Type=function(plugin)
{this.plugin=plugin;this.runtime=plugin.runtime;};var typeProto=pluginProto.Type.prototype;typeProto.onCreate=function()
{};pluginProto.Instance=function(type)
{this.type=type;this.runtime=type.runtime;};var instanceProto=pluginProto.Instance.prototype;var isLoading=true;instanceProto.onCreate=function()
{if(this.runtime.isDomFree)
{cr.logexport("[Construct 2] Twitter plugin not supported on this platform - the object will not be created");return;}
this.elem=document.createElement("div");jQuery(this.elem).appendTo(this.runtime.canvasdiv?this.runtime.canvasdiv:"body");this.element_hidden=false;this.buttonType=this.properties[0];this.buttonShare=this.properties[1];this.buttonText=this.properties[2];this.buttonVia=this.properties[3];this.buttonHashtags=this.properties[4];if(this.properties[5]===0)
{jQuery(this.elem).hide();this.visible=false;this.element_hidden=true;}
this.buttonCount=this.properties[6];this.buttonSize=this.properties[7];this.buttonLang=this.properties[8]||"en";this.lastLeft=0;this.lastTop=0;this.lastRight=0;this.lastBottom=0;this.lastWinWidth=0;this.lastWinHeight=0;this.updatePosition(true);this.runtime.tickMe(this);var self=this;if(!window["twttr"])
{window["twttr"]=(function(d,s,id){var t,js,fjs=d.getElementsByTagName(s)[0];if(d.getElementById(id))return;js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);return window["twttr"]||(t={_e:[],ready:function(f){t._e.push(f)}});}(document,"script","twitter-wjs"));window["twttr"].ready(function(twttr)
{loadTwitterButton(twttr,self);});}
else if(isLoading)
{window["twttr"].ready(function(twttr)
{loadTwitterButton(twttr,self);});}
else
loadTwitterButton(window["twttr"],self);};function loadTwitterButton(twttr,self)
{isLoading=false;var params;var countstr="none";if(self.buttonCount===1)
countstr="horizontal";else if(self.buttonCount===2)
countstr="vertical";var sizestr=(self.buttonSize===0?"medium":"large");if(self.buttonType===0)
{twttr["widgets"]["createFollowButton"](self.buttonShare,self.elem,function(){triggerOnLoaded(self);},{"count":countstr,"size":sizestr,"lang":self.buttonLang});}
else if(self.buttonType===1)
{params={"count":countstr,"size":sizestr,"lang":self.buttonLang,"text":self.buttonText};if(self.buttonVia)
params["via"]=self.buttonVia;if(self.buttonHashtags)
params["hashtags"]=self.buttonHashtags;twttr["widgets"]["createShareButton"](self.buttonShare,self.elem,function(){triggerOnLoaded(self);},params);}
else if(self.buttonType===2)
{params={"count":countstr,"size":sizestr,"lang":self.buttonLang,"text":self.buttonText};if(self.buttonVia)
params["via"]=self.buttonVia;if(self.buttonHashtags)
params["hashtags"]=self.buttonHashtags;twttr["widgets"]["createMentionButton"](self.buttonShare,self.elem,function(){triggerOnLoaded(self);},params);}
else if(self.buttonType===3)
{params={"count":countstr,"size":sizestr,"lang":self.buttonLang,"text":self.buttonText};if(self.buttonVia)
params["via"]=self.buttonVia;if(self.buttonHashtags)
params["hashtags"]=self.buttonHashtags;twttr["widgets"]["createHashtagButton"](self.buttonShare,self.elem,function(){triggerOnLoaded(self);},params);}};function triggerOnLoaded(self)
{self.runtime.trigger(cr.plugins_.Twitter.prototype.cnds.OnLoaded,self);};instanceProto.saveToJSON=function()
{var o={};return o;};instanceProto.loadFromJSON=function(o)
{};instanceProto.onDestroy=function()
{if(this.runtime.isDomFree)
return;jQuery(this.elem).remove();this.elem=null;};instanceProto.tick=function()
{this.updatePosition();};var last_canvas_offset=null;var last_checked_tick=-1;instanceProto.updatePosition=function(first)
{if(this.runtime.isDomFree)
return;var left=this.layer.layerToCanvas(this.x,this.y,true);var top=this.layer.layerToCanvas(this.x,this.y,false);var right=this.layer.layerToCanvas(this.x+this.width,this.y+this.height,true);var bottom=this.layer.layerToCanvas(this.x+this.width,this.y+this.height,false);if(!this.visible||!this.layer.visible||right<=0||bottom<=0||left>=this.runtime.width||top>=this.runtime.height)
{if(!this.element_hidden)
jQuery(this.elem).hide();this.element_hidden=true;return;}
if(left<1)
left=1;if(top<1)
top=1;if(right>=this.runtime.width)
right=this.runtime.width-1;if(bottom>=this.runtime.height)
bottom=this.runtime.height-1;var curWinWidth=window.innerWidth;var curWinHeight=window.innerHeight;if(!first&&this.lastLeft===left&&this.lastTop===top&&this.lastRight===right&&this.lastBottom===bottom&&this.lastWinWidth===curWinWidth&&this.lastWinHeight===curWinHeight)
{if(this.element_hidden)
{jQuery(this.elem).show();this.element_hidden=false;}
return;}
this.lastLeft=left;this.lastTop=top;this.lastRight=right;this.lastBottom=bottom;this.lastWinWidth=curWinWidth;this.lastWinHeight=curWinHeight;if(this.element_hidden)
{jQuery(this.elem).show();this.element_hidden=false;}
var offx=Math.round(left)+jQuery(this.runtime.canvas).offset().left;var offy=Math.round(top)+jQuery(this.runtime.canvas).offset().top;jQuery(this.elem).css("position","absolute");jQuery(this.elem).offset({left:offx,top:offy});jQuery(this.elem).width(Math.round(right-left));jQuery(this.elem).height(Math.round(bottom-top));};instanceProto.draw=function(ctx)
{};instanceProto.drawGL=function(glw)
{};function Cnds(){};Cnds.prototype.OnLoaded=function()
{return true;};pluginProto.cnds=new Cnds();function Acts(){};Acts.prototype.SetVisible=function(vis)
{if(this.runtime.isDomFree)
return;this.visible=(vis!==0);};Acts.prototype.SetShare=function(str)
{this.buttonShare=str;};Acts.prototype.SetText=function(str)
{this.buttonText=str;};Acts.prototype.SetVia=function(str)
{this.buttonVia=str;};Acts.prototype.SetHashtags=function(str)
{this.buttonHashtags=str;};Acts.prototype.Reload=function()
{if(this.runtime.isDomFree||isLoading)
return;jQuery(this.elem).remove();this.elem=document.createElement("div");jQuery(this.elem).appendTo(this.runtime.canvasdiv?this.runtime.canvasdiv:"body");if(this.element_hidden)
jQuery(this.elem).hide();loadTwitterButton(window["twttr"],this);this.updatePosition(true);};pluginProto.acts=new Acts();function Exps(){};pluginProto.exps=new Exps();}());;;cr.plugins_.XML=function(runtime)
{this.runtime=runtime;if(this.runtime.isIE)
{var x={};window["XPathResult"]=x;x.NUMBER_TYPE=1;x.STRING_TYPE=2;x.UNORDERED_NODE_SNAPSHOT_TYPE=6;x.ORDERED_NODE_SNAPSHOT_TYPE=7;}};(function()
{var pluginProto=cr.plugins_.XML.prototype;pluginProto.Type=function(plugin)
{this.plugin=plugin;this.runtime=plugin.runtime;};var typeProto=pluginProto.Type.prototype;typeProto.onCreate=function()
{};pluginProto.Instance=function(type)
{this.type=type;this.runtime=type.runtime;};var instanceProto=pluginProto.Instance.prototype;instanceProto.onCreate=function()
{this.xmlDoc=null;this.nodeStack=[];if(this.runtime.isDomFree)
cr.logexport("[Construct 2] The XML object is not supported on this platform.");};instanceProto.xpath_eval_one=function(xpath,result_type)
{if(!this.xmlDoc)
return;var root=this.nodeStack.length?this.nodeStack[this.nodeStack.length-1]:this.xmlDoc.documentElement;try{if(this.runtime.isIE)
return root.selectSingleNode(xpath);else
return this.xmlDoc.evaluate(xpath,root,null,result_type,null);}
catch(e){return null;}};instanceProto.xpath_eval_many=function(xpath,result_type)
{if(!this.xmlDoc)
return;var root=this.nodeStack.length?this.nodeStack[this.nodeStack.length-1]:this.xmlDoc.documentElement;try{if(this.runtime.isIE)
return root.selectNodes(xpath);else
return this.xmlDoc.evaluate(xpath,root,null,result_type,null);}
catch(e){return null;}};function Cnds(){};instanceProto.doForEachIteration=function(current_event,item)
{this.nodeStack.push(item);this.runtime.pushCopySol(current_event.solModifiers);current_event.retrigger();this.runtime.popSol(current_event.solModifiers);this.nodeStack.pop();};Cnds.prototype.ForEach=function(xpath)
{if(this.runtime.isDomFree)
return false;var current_event=this.runtime.getCurrentEventStack().current_event;var result=this.xpath_eval_many(xpath,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);var i,len,x;if(!result)
return false;else
{var current_loop=this.runtime.pushLoopStack();if(this.runtime.isIE)
{for(i=0,len=result.length;i<len;i++)
{current_loop.index=i;this.doForEachIteration(current_event,result[i]);}}
else
{for(i=0,len=result.snapshotLength;i<len;i++)
{current_loop.index=i;this.doForEachIteration(current_event,result.snapshotItem(i));}}
this.runtime.popLoopStack();}
return false;};pluginProto.cnds=new Cnds();function Acts(){};Acts.prototype.Load=function(str)
{if(this.runtime.isDomFree)
return;var xml,tmp;var isWindows8=!!(typeof window["c2isWindows8"]!=="undefined"&&window["c2isWindows8"]);try{if(isWindows8)
{xml=new Windows["Data"]["Xml"]["Dom"]["XmlDocument"]()
xml["loadXml"](str);}
else if(this.runtime.isIE)
{var versions=["MSXML2.DOMDocument.6.0","MSXML2.DOMDocument.3.0","MSXML2.DOMDocument"];for(var i=0;i<3;i++){try{xml=new ActiveXObject(versions[i]);if(xml)
break;}catch(ex){xml=null;}}
if(xml)
{xml.async="false";xml["loadXML"](str);}}
else{tmp=new DOMParser();xml=tmp.parseFromString(str,"text/xml");}}catch(e){xml=null;}
if(xml)
{this.xmlDoc=xml;if(this.runtime.isIE&&!isWindows8)
this.xmlDoc["setProperty"]("SelectionLanguage","XPath");}};pluginProto.acts=new Acts();function Exps(){};Exps.prototype.NumberValue=function(ret,xpath)
{if(this.runtime.isDomFree)
{ret.set_int(0);return;}
var result=this.xpath_eval_one(xpath,XPathResult.NUMBER_TYPE);if(!result)
ret.set_int(0);else if(this.runtime.isIE)
ret.set_int(parseInt(result.nodeValue,10));else
ret.set_int(result.numberValue||0);};Exps.prototype.StringValue=function(ret,xpath)
{if(this.runtime.isDomFree)
{ret.set_string("");return;}
var result;if(/firefox/i.test(navigator.userAgent))
{result=this.xpath_eval_one(xpath,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);if(!result)
ret.set_string("");else
{var i,len,totalstr="";for(i=0,len=result.snapshotLength;i<len;i++)
{totalstr+=result.snapshotItem(i).textContent;}
ret.set_string(totalstr);}}
else
{result=this.xpath_eval_one(xpath,XPathResult.STRING_TYPE);if(!result)
ret.set_string("");else if(this.runtime.isIE)
ret.set_string((result.nodeValue||result.nodeTypedValue)||"");else
ret.set_string(result.stringValue||"");}};Exps.prototype.NodeCount=function(ret,xpath)
{if(this.runtime.isDomFree)
{ret.set_int(0);return;}
var result=this.xpath_eval_many(xpath,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE);if(!result)
ret.set_int(0);else if(this.runtime.isIE)
ret.set_int(result.length||0);else
ret.set_int(result.snapshotLength||0);};pluginProto.exps=new Exps();}());;;cr.behaviors.Bullet=function(runtime)
{this.runtime=runtime;};(function()
{var behaviorProto=cr.behaviors.Bullet.prototype;behaviorProto.Type=function(behavior,objtype)
{this.behavior=behavior;this.objtype=objtype;this.runtime=behavior.runtime;};var behtypeProto=behaviorProto.Type.prototype;behtypeProto.onCreate=function()
{};behaviorProto.Instance=function(type,inst)
{this.type=type;this.behavior=type.behavior;this.inst=inst;this.runtime=type.runtime;};var behinstProto=behaviorProto.Instance.prototype;behinstProto.onCreate=function()
{var speed=this.properties[0];this.acc=this.properties[1];this.g=this.properties[2];this.bounceOffSolid=(this.properties[3]!==0);this.setAngle=(this.properties[4]!==0);this.dx=Math.cos(this.inst.angle)*speed;this.dy=Math.sin(this.inst.angle)*speed;this.lastx=this.inst.x;this.lasty=this.inst.y;this.lastKnownAngle=this.inst.angle;this.travelled=0;this.enabled=(this.properties[5]!==0);};behinstProto.saveToJSON=function()
{return{"acc":this.acc,"g":this.g,"dx":this.dx,"dy":this.dy,"lx":this.lastx,"ly":this.lasty,"lka":this.lastKnownAngle,"t":this.travelled,"e":this.enabled};};behinstProto.loadFromJSON=function(o)
{this.acc=o["acc"];this.g=o["g"];this.dx=o["dx"];this.dy=o["dy"];this.lastx=o["lx"];this.lasty=o["ly"];this.lastKnownAngle=o["lka"];this.travelled=o["t"];this.enabled=o["e"];};behinstProto.tick=function()
{if(!this.enabled)
return;var dt=this.runtime.getDt(this.inst);var s,a;var bounceSolid,bounceAngle;if(this.inst.angle!==this.lastKnownAngle)
{if(this.setAngle)
{s=cr.distanceTo(0,0,this.dx,this.dy);this.dx=Math.cos(this.inst.angle)*s;this.dy=Math.sin(this.inst.angle)*s;}
this.lastKnownAngle=this.inst.angle;}
if(this.acc!==0)
{s=cr.distanceTo(0,0,this.dx,this.dy);if(this.dx===0&&this.dy===0)
a=this.inst.angle;else
a=cr.angleTo(0,0,this.dx,this.dy);s+=this.acc*dt;if(s<0)
s=0;this.dx=Math.cos(a)*s;this.dy=Math.sin(a)*s;}
if(this.g!==0)
this.dy+=this.g*dt;this.lastx=this.inst.x;this.lasty=this.inst.y;if(this.dx!==0||this.dy!==0)
{this.inst.x+=this.dx*dt;this.inst.y+=this.dy*dt;this.travelled+=cr.distanceTo(0,0,this.dx*dt,this.dy*dt)
if(this.setAngle)
{this.inst.angle=cr.angleTo(0,0,this.dx,this.dy);this.inst.set_bbox_changed();this.lastKnownAngle=this.inst.angle;}
this.inst.set_bbox_changed();if(this.bounceOffSolid)
{bounceSolid=this.runtime.testOverlapSolid(this.inst);if(bounceSolid)
{this.runtime.registerCollision(this.inst,bounceSolid);s=cr.distanceTo(0,0,this.dx,this.dy);bounceAngle=this.runtime.calculateSolidBounceAngle(this.inst,this.lastx,this.lasty);this.dx=Math.cos(bounceAngle)*s;this.dy=Math.sin(bounceAngle)*s;this.inst.x+=this.dx*dt;this.inst.y+=this.dy*dt;this.inst.set_bbox_changed();if(this.setAngle)
{this.inst.angle=bounceAngle;this.lastKnownAngle=bounceAngle;this.inst.set_bbox_changed();}
if(!this.runtime.pushOutSolid(this.inst,this.dx/s,this.dy/s,Math.max(s*2.5*dt,30)))
this.runtime.pushOutSolidNearest(this.inst,100);}}}};function Cnds(){};Cnds.prototype.CompareSpeed=function(cmp,s)
{return cr.do_cmp(cr.distanceTo(0,0,this.dx,this.dy),cmp,s);};Cnds.prototype.CompareTravelled=function(cmp,d)
{return cr.do_cmp(this.travelled,cmp,d);};behaviorProto.cnds=new Cnds();function Acts(){};Acts.prototype.SetSpeed=function(s)
{var a=cr.angleTo(0,0,this.dx,this.dy);this.dx=Math.cos(a)*s;this.dy=Math.sin(a)*s;};Acts.prototype.SetAcceleration=function(a)
{this.acc=a;};Acts.prototype.SetGravity=function(g)
{this.g=g;};Acts.prototype.SetAngleOfMotion=function(a)
{a=cr.to_radians(a);var s=cr.distanceTo(0,0,this.dx,this.dy)
this.dx=Math.cos(a)*s;this.dy=Math.sin(a)*s;};Acts.prototype.Bounce=function(objtype)
{if(!objtype)
return;var otherinst=objtype.getFirstPicked(this.inst);if(!otherinst)
return;var dt=this.runtime.getDt(this.inst);var s=cr.distanceTo(0,0,this.dx,this.dy);var bounceAngle=this.runtime.calculateSolidBounceAngle(this.inst,this.lastx,this.lasty,otherinst);this.dx=Math.cos(bounceAngle)*s;this.dy=Math.sin(bounceAngle)*s;this.inst.x+=this.dx*dt;this.inst.y+=this.dy*dt;this.inst.set_bbox_changed();if(this.setAngle)
{this.inst.angle=bounceAngle;this.lastKnownAngle=bounceAngle;this.inst.set_bbox_changed();}
if(s!==0)
{if(this.bounceOffSolid)
{if(!this.runtime.pushOutSolid(this.inst,this.dx/s,this.dy/s,Math.max(s*2.5*dt,30)))
this.runtime.pushOutSolidNearest(this.inst,100);}
else
{this.runtime.pushOut(this.inst,this.dx/s,this.dy/s,Math.max(s*2.5*dt,30),otherinst)}}};Acts.prototype.SetDistanceTravelled=function(d)
{this.travelled=d;};Acts.prototype.SetEnabled=function(en)
{this.enabled=(en===1);};behaviorProto.acts=new Acts();function Exps(){};Exps.prototype.Speed=function(ret)
{var s=cr.distanceTo(0,0,this.dx,this.dy);s=cr.round6dp(s);ret.set_float(s);};Exps.prototype.Acceleration=function(ret)
{ret.set_float(this.acc);};Exps.prototype.AngleOfMotion=function(ret)
{ret.set_float(cr.to_degrees(cr.angleTo(0,0,this.dx,this.dy)));};Exps.prototype.DistanceTravelled=function(ret)
{ret.set_float(this.travelled);};Exps.prototype.Gravity=function(ret)
{ret.set_float(this.g);};behaviorProto.exps=new Exps();}());;;cr.behaviors.DragnDrop=function(runtime)
{this.runtime=runtime;var self=this;if(!this.runtime.isDomFree)
{jQuery(document).mousemove(function(info){self.onMouseMove(info);});jQuery(document).mousedown(function(info){self.onMouseDown(info);});jQuery(document).mouseup(function(info){self.onMouseUp(info);});}
var elem=(this.runtime.fullscreen_mode>0)?document:this.runtime.canvas;if(this.runtime.isDirectCanvas)
elem=window["Canvas"];else if(this.runtime.isCocoonJs)
elem=window;if(typeof PointerEvent!=="undefined")
{elem.addEventListener("pointerdown",function(info){self.onPointerStart(info);},false);elem.addEventListener("pointermove",function(info){self.onPointerMove(info);},false);elem.addEventListener("pointerup",function(info){self.onPointerEnd(info);},false);elem.addEventListener("pointercancel",function(info){self.onPointerEnd(info);},false);}
else if(window.navigator["msPointerEnabled"])
{elem.addEventListener("MSPointerDown",function(info){self.onPointerStart(info);},false);elem.addEventListener("MSPointerMove",function(info){self.onPointerMove(info);},false);elem.addEventListener("MSPointerUp",function(info){self.onPointerEnd(info);},false);elem.addEventListener("MSPointerCancel",function(info){self.onPointerEnd(info);},false);}
else
{elem.addEventListener("touchstart",function(info){self.onTouchStart(info);},false);elem.addEventListener("touchmove",function(info){self.onTouchMove(info);},false);elem.addEventListener("touchend",function(info){self.onTouchEnd(info);},false);elem.addEventListener("touchcancel",function(info){self.onTouchEnd(info);},false);}};(function()
{var behaviorProto=cr.behaviors.DragnDrop.prototype;var dummyoffset={left:0,top:0};function GetDragDropBehavior(inst)
{var i,len;for(i=0,len=inst.behavior_insts.length;i<len;i++)
{if(inst.behavior_insts[i]instanceof behaviorProto.Instance)
return inst.behavior_insts[i];}
return null;};behaviorProto.onMouseDown=function(info)
{if(info.which!==1)
return;this.onInputDown("leftmouse",info.pageX,info.pageY);};behaviorProto.onMouseMove=function(info)
{if(info.which!==1)
return;this.onInputMove("leftmouse",info.pageX,info.pageY);};behaviorProto.onMouseUp=function(info)
{if(info.which!==1)
return;this.onInputUp("leftmouse");};behaviorProto.onTouchStart=function(info)
{if(info.preventDefault&&cr.isCanvasInputEvent(info))
info.preventDefault();var i,len,t,id;for(i=0,len=info.changedTouches.length;i<len;i++)
{t=info.changedTouches[i];id=t.identifier;this.onInputDown(id?id.toString():"<none>",t.pageX,t.pageY);}};behaviorProto.onTouchMove=function(info)
{if(info.preventDefault)
info.preventDefault();var i,len,t,id;for(i=0,len=info.changedTouches.length;i<len;i++)
{t=info.changedTouches[i];id=t.identifier;this.onInputMove(id?id.toString():"<none>",t.pageX,t.pageY);}};behaviorProto.onTouchEnd=function(info)
{if(info.preventDefault&&cr.isCanvasInputEvent(info))
info.preventDefault();var i,len,t,id;for(i=0,len=info.changedTouches.length;i<len;i++)
{t=info.changedTouches[i];id=t.identifier;this.onInputUp(id?id.toString():"<none>");}};behaviorProto.onPointerStart=function(info)
{if(info["pointerType"]===info["MSPOINTER_TYPE_MOUSE"]||info["pointerType"]==="mouse")
return;if(info.preventDefault&&cr.isCanvasInputEvent(info))
info.preventDefault();this.onInputDown(info["pointerId"].toString(),info.pageX,info.pageY);};behaviorProto.onPointerMove=function(info)
{if(info["pointerType"]===info["MSPOINTER_TYPE_MOUSE"]||info["pointerType"]==="mouse")
return;if(info.preventDefault)
info.preventDefault();this.onInputMove(info["pointerId"].toString(),info.pageX,info.pageY);};behaviorProto.onPointerEnd=function(info)
{if(info["pointerType"]===info["MSPOINTER_TYPE_MOUSE"]||info["pointerType"]==="mouse")
return;if(info.preventDefault&&cr.isCanvasInputEvent(info))
info.preventDefault();this.onInputUp(info["pointerId"].toString());};behaviorProto.onInputDown=function(src,pageX,pageY)
{var offset=this.runtime.isDomFree?dummyoffset:jQuery(this.runtime.canvas).offset();var x=pageX-offset.left;var y=pageY-offset.top;var lx,ly,topx,topy;var arr=this.my_instances.valuesRef();var i,len,b,inst,topmost=null;for(i=0,len=arr.length;i<len;i++)
{inst=arr[i];b=GetDragDropBehavior(inst);if(!b.enabled||b.dragging)
continue;lx=inst.layer.canvasToLayer(x,y,true);ly=inst.layer.canvasToLayer(x,y,false);inst.update_bbox();if(!inst.contains_pt(lx,ly))
continue;if(!topmost)
{topmost=inst;topx=lx;topy=ly;continue;}
if(inst.layer.index>topmost.layer.index)
{topmost=inst;topx=lx;topy=ly;continue;}
if(inst.layer.index===topmost.layer.index&&inst.get_zindex()>topmost.get_zindex())
{topmost=inst;topx=lx;topy=ly;continue;}}
if(topmost)
GetDragDropBehavior(topmost).onDown(src,topx,topy);};behaviorProto.onInputMove=function(src,pageX,pageY)
{var offset=this.runtime.isDomFree?dummyoffset:jQuery(this.runtime.canvas).offset();var x=pageX-offset.left;var y=pageY-offset.top;var lx,ly;var arr=this.my_instances.valuesRef();var i,len,b,inst;for(i=0,len=arr.length;i<len;i++)
{inst=arr[i];b=GetDragDropBehavior(inst);if(!b.enabled||!b.dragging||(b.dragging&&b.dragsource!==src))
continue;lx=inst.layer.canvasToLayer(x,y,true);ly=inst.layer.canvasToLayer(x,y,false);b.onMove(lx,ly);}};behaviorProto.onInputUp=function(src)
{var arr=this.my_instances.valuesRef();var i,len,b,inst;for(i=0,len=arr.length;i<len;i++)
{inst=arr[i];b=GetDragDropBehavior(inst);if(b.dragging&&b.dragsource===src)
b.onUp();}};behaviorProto.Type=function(behavior,objtype)
{this.behavior=behavior;this.objtype=objtype;this.runtime=behavior.runtime;};var behtypeProto=behaviorProto.Type.prototype;behtypeProto.onCreate=function()
{};behaviorProto.Instance=function(type,inst)
{this.type=type;this.behavior=type.behavior;this.inst=inst;this.runtime=type.runtime;};var behinstProto=behaviorProto.Instance.prototype;behinstProto.onCreate=function()
{this.dragging=false;this.dx=0;this.dy=0;this.dragsource="<none>";this.axes=this.properties[0];this.enabled=(this.properties[1]!==0);};behinstProto.saveToJSON=function()
{return{"enabled":this.enabled};};behinstProto.loadFromJSON=function(o)
{this.enabled=o["enabled"];this.dragging=false;};behinstProto.onDown=function(src,x,y)
{this.dx=x-this.inst.x;this.dy=y-this.inst.y;this.dragging=true;this.dragsource=src;this.runtime.isInUserInputEvent=true;this.runtime.trigger(cr.behaviors.DragnDrop.prototype.cnds.OnDragStart,this.inst);this.runtime.isInUserInputEvent=false;};behinstProto.onMove=function(x,y)
{var newx=x-this.dx;var newy=y-this.dy;if(this.axes===0)
{if(this.inst.x!==newx||this.inst.y!==newy)
{this.inst.x=newx;this.inst.y=newy;this.inst.set_bbox_changed();}}
else if(this.axes===1)
{if(this.inst.x!==newx)
{this.inst.x=newx;this.inst.set_bbox_changed();}}
else if(this.axes===2)
{if(this.inst.y!==newy)
{this.inst.y=newy;this.inst.set_bbox_changed();}}};behinstProto.onUp=function()
{this.dragging=false;this.runtime.isInUserInputEvent=true;this.runtime.trigger(cr.behaviors.DragnDrop.prototype.cnds.OnDrop,this.inst);this.runtime.isInUserInputEvent=false;};behinstProto.tick=function()
{};function Cnds(){};Cnds.prototype.IsDragging=function()
{return this.dragging;};Cnds.prototype.OnDragStart=function()
{return true;};Cnds.prototype.OnDrop=function()
{return true;};Cnds.prototype.IsEnabled=function()
{return!!this.enabled;};behaviorProto.cnds=new Cnds();function Acts(){};Acts.prototype.SetEnabled=function(s)
{this.enabled=(s!==0);if(!this.enabled)
this.dragging=false;};Acts.prototype.Drop=function()
{if(this.dragging)
this.onUp();};behaviorProto.acts=new Acts();function Exps(){};behaviorProto.exps=new Exps();}());;;cr.behaviors.EightDir=function(runtime)
{this.runtime=runtime;};(function()
{var behaviorProto=cr.behaviors.EightDir.prototype;behaviorProto.Type=function(behavior,objtype)
{this.behavior=behavior;this.objtype=objtype;this.runtime=behavior.runtime;};var behtypeProto=behaviorProto.Type.prototype;behtypeProto.onCreate=function()
{};behaviorProto.Instance=function(type,inst)
{this.type=type;this.behavior=type.behavior;this.inst=inst;this.runtime=type.runtime;this.upkey=false;this.downkey=false;this.leftkey=false;this.rightkey=false;this.ignoreInput=false;this.simup=false;this.simdown=false;this.simleft=false;this.simright=false;this.lastuptick=-1;this.lastdowntick=-1;this.lastlefttick=-1;this.lastrighttick=-1;this.dx=0;this.dy=0;};var behinstProto=behaviorProto.Instance.prototype;behinstProto.onCreate=function()
{this.maxspeed=this.properties[0];this.acc=this.properties[1];this.dec=this.properties[2];this.directions=this.properties[3];this.angleMode=this.properties[4];this.defaultControls=(this.properties[5]===1);this.enabled=(this.properties[6]!==0);if(this.defaultControls&&!this.runtime.isDomFree)
{jQuery(document).keydown((function(self){return function(info){self.onKeyDown(info);};})(this));jQuery(document).keyup((function(self){return function(info){self.onKeyUp(info);};})(this));}};behinstProto.saveToJSON=function()
{return{"dx":this.dx,"dy":this.dy,"enabled":this.enabled,"maxspeed":this.maxspeed,"acc":this.acc,"dec":this.dec,"ignoreInput":this.ignoreInput};};behinstProto.loadFromJSON=function(o)
{this.dx=o["dx"];this.dy=o["dy"];this.enabled=o["enabled"];this.maxspeed=o["maxspeed"];this.acc=o["acc"];this.dec=o["dec"];this.ignoreInput=o["ignoreInput"];this.upkey=false;this.downkey=false;this.leftkey=false;this.rightkey=false;this.simup=false;this.simdown=false;this.simleft=false;this.simright=false;this.lastuptick=-1;this.lastdowntick=-1;this.lastlefttick=-1;this.lastrighttick=-1;};behinstProto.onKeyDown=function(info)
{var tickcount=this.runtime.tickcount;switch(info.which){case 37:info.preventDefault();if(this.lastlefttick<tickcount)
this.leftkey=true;break;case 38:info.preventDefault();if(this.lastuptick<tickcount)
this.upkey=true;break;case 39:info.preventDefault();if(this.lastrighttick<tickcount)
this.rightkey=true;break;case 40:info.preventDefault();if(this.lastdowntick<tickcount)
this.downkey=true;break;}};behinstProto.onKeyUp=function(info)
{var tickcount=this.runtime.tickcount;switch(info.which){case 37:info.preventDefault();this.leftkey=false;this.lastlefttick=tickcount;break;case 38:info.preventDefault();this.upkey=false;this.lastuptick=tickcount;break;case 39:info.preventDefault();this.rightkey=false;this.lastrighttick=tickcount;break;case 40:info.preventDefault();this.downkey=false;this.lastdowntick=tickcount;break;}};behinstProto.onWindowBlur=function()
{this.upkey=false;this.downkey=false;this.leftkey=false;this.rightkey=false;};behinstProto.tick=function()
{var dt=this.runtime.getDt(this.inst);var left=this.leftkey||this.simleft;var right=this.rightkey||this.simright;var up=this.upkey||this.simup;var down=this.downkey||this.simdown;this.simleft=false;this.simright=false;this.simup=false;this.simdown=false;if(!this.enabled)
return;var collobj=this.runtime.testOverlapSolid(this.inst);if(collobj)
{this.runtime.registerCollision(this.inst,collobj);if(!this.runtime.pushOutSolidNearest(this.inst))
return;}
if(this.ignoreInput)
{left=false;right=false;up=false;down=false;}
if(this.directions===0)
{left=false;right=false;}
else if(this.directions===1)
{up=false;down=false;}
if(this.directions===2&&(up||down))
{left=false;right=false;}
if(left==right)
{if(this.dx<0)
{this.dx+=this.dec*dt;if(this.dx>0)
this.dx=0;}
else if(this.dx>0)
{this.dx-=this.dec*dt;if(this.dx<0)
this.dx=0;}}
if(up==down)
{if(this.dy<0)
{this.dy+=this.dec*dt;if(this.dy>0)
this.dy=0;}
else if(this.dy>0)
{this.dy-=this.dec*dt;if(this.dy<0)
this.dy=0;}}
if(left&&!right)
{if(this.dx>0)
this.dx-=(this.acc+this.dec)*dt;else
this.dx-=this.acc*dt;}
if(right&&!left)
{if(this.dx<0)
this.dx+=(this.acc+this.dec)*dt;else
this.dx+=this.acc*dt;}
if(up&&!down)
{if(this.dy>0)
this.dy-=(this.acc+this.dec)*dt;else
this.dy-=this.acc*dt;}
if(down&&!up)
{if(this.dy<0)
this.dy+=(this.acc+this.dec)*dt;else
this.dy+=this.acc*dt;}
var ax,ay;if(this.dx!==0||this.dy!==0)
{var speed=Math.sqrt(this.dx*this.dx+this.dy*this.dy);if(speed>this.maxspeed)
{var a=Math.atan2(this.dy,this.dx);this.dx=this.maxspeed*Math.cos(a);this.dy=this.maxspeed*Math.sin(a);}
var oldx=this.inst.x;var oldy=this.inst.y;var oldangle=this.inst.angle;this.inst.x+=this.dx*dt;this.inst.set_bbox_changed();collobj=this.runtime.testOverlapSolid(this.inst);if(collobj)
{if(!this.runtime.pushOutSolid(this.inst,(this.dx<0?1:-1),0,Math.abs(Math.floor(this.dx*dt))))
{this.inst.x=oldx;}
this.dx=0;this.inst.set_bbox_changed();this.runtime.registerCollision(this.inst,collobj);}
this.inst.y+=this.dy*dt;this.inst.set_bbox_changed();collobj=this.runtime.testOverlapSolid(this.inst);if(collobj)
{if(!this.runtime.pushOutSolid(this.inst,0,(this.dy<0?1:-1),Math.abs(Math.floor(this.dy*dt))))
{this.inst.y=oldy;}
this.dy=0;this.inst.set_bbox_changed();this.runtime.registerCollision(this.inst,collobj);}
ax=cr.round6dp(this.dx);ay=cr.round6dp(this.dy);if((ax!==0||ay!==0)&&this.inst.type.plugin.is_rotatable)
{if(this.angleMode===1)
this.inst.angle=cr.to_clamped_radians(Math.round(cr.to_degrees(Math.atan2(ay,ax))/90.0)*90.0);else if(this.angleMode===2)
this.inst.angle=cr.to_clamped_radians(Math.round(cr.to_degrees(Math.atan2(ay,ax))/45.0)*45.0);else if(this.angleMode===3)
this.inst.angle=Math.atan2(ay,ax);}
this.inst.set_bbox_changed();if(this.inst.angle!=oldangle)
{collobj=this.runtime.testOverlapSolid(this.inst);if(collobj)
{this.inst.angle=oldangle;this.inst.set_bbox_changed();this.runtime.registerCollision(this.inst,collobj);}}}};function Cnds(){};Cnds.prototype.IsMoving=function()
{var speed=Math.sqrt(this.dx*this.dx+this.dy*this.dy);return speed>1e-10;};Cnds.prototype.CompareSpeed=function(cmp,s)
{var speed=Math.sqrt(this.dx*this.dx+this.dy*this.dy);return cr.do_cmp(speed,cmp,s);};behaviorProto.cnds=new Cnds();function Acts(){};Acts.prototype.Stop=function()
{this.dx=0;this.dy=0;};Acts.prototype.Reverse=function()
{this.dx*=-1;this.dy*=-1;};Acts.prototype.SetIgnoreInput=function(ignoring)
{this.ignoreInput=ignoring;};Acts.prototype.SetSpeed=function(speed)
{if(speed<0)
speed=0;if(speed>this.maxspeed)
speed=this.maxspeed;var a=Math.atan2(this.dy,this.dx);this.dx=speed*Math.cos(a);this.dy=speed*Math.sin(a);};Acts.prototype.SetMaxSpeed=function(maxspeed)
{this.maxspeed=maxspeed;if(this.maxspeed<0)
this.maxspeed=0;};Acts.prototype.SetAcceleration=function(acc)
{this.acc=acc;if(this.acc<0)
this.acc=0;};Acts.prototype.SetDeceleration=function(dec)
{this.dec=dec;if(this.dec<0)
this.dec=0;};Acts.prototype.SimulateControl=function(ctrl)
{switch(ctrl){case 0:this.simleft=true;break;case 1:this.simright=true;break;case 2:this.simup=true;break;case 3:this.simdown=true;break;}};Acts.prototype.SetEnabled=function(en)
{this.enabled=(en===1);};Acts.prototype.SetVectorX=function(x_)
{this.dx=x_;};Acts.prototype.SetVectorY=function(y_)
{this.dy=y_;};behaviorProto.acts=new Acts();function Exps(){};Exps.prototype.Speed=function(ret)
{ret.set_float(Math.sqrt(this.dx*this.dx+this.dy*this.dy));};Exps.prototype.MaxSpeed=function(ret)
{ret.set_float(this.maxspeed);};Exps.prototype.Acceleration=function(ret)
{ret.set_float(this.acc);};Exps.prototype.Deceleration=function(ret)
{ret.set_float(this.dec);};Exps.prototype.MovingAngle=function(ret)
{ret.set_float(cr.to_degrees(Math.atan2(this.dy,this.dx)));};Exps.prototype.VectorX=function(ret)
{ret.set_float(this.dx);};Exps.prototype.VectorY=function(ret)
{ret.set_float(this.dy);};behaviorProto.exps=new Exps();}());;;cr.behaviors.Fade=function(runtime)
{this.runtime=runtime;};(function()
{var behaviorProto=cr.behaviors.Fade.prototype;behaviorProto.Type=function(behavior,objtype)
{this.behavior=behavior;this.objtype=objtype;this.runtime=behavior.runtime;};var behtypeProto=behaviorProto.Type.prototype;behtypeProto.onCreate=function()
{};behaviorProto.Instance=function(type,inst)
{this.type=type;this.behavior=type.behavior;this.inst=inst;this.runtime=type.runtime;};var behinstProto=behaviorProto.Instance.prototype;behinstProto.onCreate=function()
{this.activeAtStart=this.properties[0]===1;this.setMaxOpacity=false;this.fadeInTime=this.properties[1];this.waitTime=this.properties[2];this.fadeOutTime=this.properties[3];this.destroy=this.properties[4];this.stage=this.activeAtStart?0:3;if(this.recycled)
this.stageTime.reset();else
this.stageTime=new cr.KahanAdder();this.maxOpacity=(this.inst.opacity?this.inst.opacity:1.0);if(this.activeAtStart)
{if(this.fadeInTime===0)
{this.stage=1;if(this.waitTime===0)
this.stage=2;}
else
{this.inst.opacity=0;this.runtime.redraw=true;}}};behinstProto.saveToJSON=function()
{return{"fit":this.fadeInTime,"wt":this.waitTime,"fot":this.fadeOutTime,"s":this.stage,"st":this.stageTime.sum,"mo":this.maxOpacity,};};behinstProto.loadFromJSON=function(o)
{this.fadeInTime=o["fit"];this.waitTime=o["wt"];this.fadeOutTime=o["fot"];this.stage=o["s"];this.stageTime.reset();this.stageTime.sum=o["st"];this.maxOpacity=o["mo"];};behinstProto.tick=function()
{this.stageTime.add(this.runtime.getDt(this.inst));if(this.stage===0)
{this.inst.opacity=(this.stageTime.sum/this.fadeInTime)*this.maxOpacity;this.runtime.redraw=true;if(this.inst.opacity>=this.maxOpacity)
{this.inst.opacity=this.maxOpacity;this.stage=1;this.stageTime.reset();this.runtime.trigger(cr.behaviors.Fade.prototype.cnds.OnFadeInEnd,this.inst);}}
if(this.stage===1)
{if(this.stageTime.sum>=this.waitTime)
{this.stage=2;this.stageTime.reset();this.runtime.trigger(cr.behaviors.Fade.prototype.cnds.OnWaitEnd,this.inst);}}
if(this.stage===2)
{if(this.fadeOutTime!==0)
{this.inst.opacity=this.maxOpacity-((this.stageTime.sum/this.fadeOutTime)*this.maxOpacity);this.runtime.redraw=true;if(this.inst.opacity<0)
{this.inst.opacity=0;this.stage=3;this.stageTime.reset();this.runtime.trigger(cr.behaviors.Fade.prototype.cnds.OnFadeOutEnd,this.inst);if(this.destroy===1)
this.runtime.DestroyInstance(this.inst);}}}};behinstProto.doStart=function()
{this.stage=0;this.stageTime.reset();if(this.fadeInTime===0)
{this.stage=1;if(this.waitTime===0)
this.stage=2;}
else
{this.inst.opacity=0;this.runtime.redraw=true;}};function Cnds(){};Cnds.prototype.OnFadeOutEnd=function()
{return true;};Cnds.prototype.OnFadeInEnd=function()
{return true;};Cnds.prototype.OnWaitEnd=function()
{return true;};behaviorProto.cnds=new Cnds();function Acts(){};Acts.prototype.StartFade=function()
{if(!this.activeAtStart&&!this.setMaxOpacity)
{this.maxOpacity=(this.inst.opacity?this.inst.opacity:1.0);this.setMaxOpacity=true;}
if(this.stage===3)
this.doStart();};Acts.prototype.RestartFade=function()
{this.doStart();};Acts.prototype.SetFadeInTime=function(t)
{if(t<0)
t=0;this.fadeInTime=t;};Acts.prototype.SetWaitTime=function(t)
{if(t<0)
t=0;this.waitTime=t;};Acts.prototype.SetFadeOutTime=function(t)
{if(t<0)
t=0;this.fadeOutTime=t;};behaviorProto.acts=new Acts();function Exps(){};Exps.prototype.FadeInTime=function(ret)
{ret.set_float(this.fadeInTime);};Exps.prototype.WaitTime=function(ret)
{ret.set_float(this.waitTime);};Exps.prototype.FadeOutTime=function(ret)
{ret.set_float(this.fadeOutTime);};behaviorProto.exps=new Exps();}());;;cr.behaviors.Flash=function(runtime)
{this.runtime=runtime;};(function()
{var behaviorProto=cr.behaviors.Flash.prototype;behaviorProto.Type=function(behavior,objtype)
{this.behavior=behavior;this.objtype=objtype;this.runtime=behavior.runtime;};var behtypeProto=behaviorProto.Type.prototype;behtypeProto.onCreate=function()
{};behaviorProto.Instance=function(type,inst)
{this.type=type;this.behavior=type.behavior;this.inst=inst;this.runtime=type.runtime;};var behinstProto=behaviorProto.Instance.prototype;behinstProto.onCreate=function()
{this.ontime=0;this.offtime=0;this.stage=0;this.stagetimeleft=0;this.timeleft=0;};behinstProto.saveToJSON=function()
{return{"ontime":this.ontime,"offtime":this.offtime,"stage":this.stage,"stagetimeleft":this.stagetimeleft,"timeleft":this.timeleft};};behinstProto.loadFromJSON=function(o)
{this.ontime=o["ontime"];this.offtime=o["offtime"];this.stage=o["stage"];this.stagetimeleft=o["stagetimeleft"];this.timeleft=o["timeleft"];if(this.timeleft===null)
this.timeleft=Infinity;};behinstProto.tick=function()
{if(this.timeleft<=0)
return;var dt=this.runtime.getDt(this.inst);this.timeleft-=dt;if(this.timeleft<=0)
{this.timeleft=0;this.inst.visible=true;this.runtime.redraw=true;this.runtime.trigger(cr.behaviors.Flash.prototype.cnds.OnFlashEnded,this.inst);return;}
this.stagetimeleft-=dt;if(this.stagetimeleft<=0)
{if(this.stage===0)
{this.inst.visible=false;this.stage=1;this.stagetimeleft+=this.offtime;}
else
{this.inst.visible=true;this.stage=0;this.stagetimeleft+=this.ontime;}
this.runtime.redraw=true;}};function Cnds(){};Cnds.prototype.IsFlashing=function()
{return this.timeleft>0;};Cnds.prototype.OnFlashEnded=function()
{return true;};behaviorProto.cnds=new Cnds();function Acts(){};Acts.prototype.Flash=function(on_,off_,dur_)
{this.ontime=on_;this.offtime=off_;this.stage=1;this.stagetimeleft=off_;this.timeleft=dur_;this.inst.visible=false;this.runtime.redraw=true;};Acts.prototype.StopFlashing=function()
{this.timeleft=0;this.inst.visible=true;this.runtime.redraw=true;return;};behaviorProto.acts=new Acts();function Exps(){};behaviorProto.exps=new Exps();}());;;cr.behaviors.Pin=function(runtime)
{this.runtime=runtime;};(function()
{var behaviorProto=cr.behaviors.Pin.prototype;behaviorProto.Type=function(behavior,objtype)
{this.behavior=behavior;this.objtype=objtype;this.runtime=behavior.runtime;};var behtypeProto=behaviorProto.Type.prototype;behtypeProto.onCreate=function()
{};behaviorProto.Instance=function(type,inst)
{this.type=type;this.behavior=type.behavior;this.inst=inst;this.runtime=type.runtime;};var behinstProto=behaviorProto.Instance.prototype;behinstProto.onCreate=function()
{this.pinObject=null;this.pinObjectUid=-1;this.pinAngle=0;this.pinDist=0;this.myStartAngle=0;this.theirStartAngle=0;this.lastKnownAngle=0;this.mode=0;var self=this;if(!this.recycled)
{this.myDestroyCallback=(function(inst){self.onInstanceDestroyed(inst);});}
this.runtime.addDestroyCallback(this.myDestroyCallback);};behinstProto.saveToJSON=function()
{return{"uid":this.pinObject?this.pinObject.uid:-1,"pa":this.pinAngle,"pd":this.pinDist,"msa":this.myStartAngle,"tsa":this.theirStartAngle,"lka":this.lastKnownAngle,"m":this.mode};};behinstProto.loadFromJSON=function(o)
{this.pinObjectUid=o["uid"];this.pinAngle=o["pa"];this.pinDist=o["pd"];this.myStartAngle=o["msa"];this.theirStartAngle=o["tsa"];this.lastKnownAngle=o["lka"];this.mode=o["m"];};behinstProto.afterLoad=function()
{if(this.pinObjectUid===-1)
this.pinObject=null;else
{this.pinObject=this.runtime.getObjectByUID(this.pinObjectUid);;}
this.pinObjectUid=-1;};behinstProto.onInstanceDestroyed=function(inst)
{if(this.pinObject==inst)
this.pinObject=null;};behinstProto.onDestroy=function()
{this.pinObject=null;this.runtime.removeDestroyCallback(this.myDestroyCallback);};behinstProto.tick=function()
{};behinstProto.tick2=function()
{if(!this.pinObject)
return;if(this.lastKnownAngle!==this.inst.angle)
this.myStartAngle=cr.clamp_angle(this.myStartAngle+(this.inst.angle-this.lastKnownAngle));var newx=this.inst.x;var newy=this.inst.y;if(this.mode===3||this.mode===4)
{var dist=cr.distanceTo(this.inst.x,this.inst.y,this.pinObject.x,this.pinObject.y);if((dist>this.pinDist)||(this.mode===4&&dist<this.pinDist))
{var a=cr.angleTo(this.pinObject.x,this.pinObject.y,this.inst.x,this.inst.y);newx=this.pinObject.x+Math.cos(a)*this.pinDist;newy=this.pinObject.y+Math.sin(a)*this.pinDist;}}
else
{newx=this.pinObject.x+Math.cos(this.pinObject.angle+this.pinAngle)*this.pinDist;newy=this.pinObject.y+Math.sin(this.pinObject.angle+this.pinAngle)*this.pinDist;}
var newangle=cr.clamp_angle(this.myStartAngle+(this.pinObject.angle-this.theirStartAngle));this.lastKnownAngle=newangle;if((this.mode===0||this.mode===1||this.mode===3||this.mode===4)&&(this.inst.x!==newx||this.inst.y!==newy))
{this.inst.x=newx;this.inst.y=newy;this.inst.set_bbox_changed();}
if((this.mode===0||this.mode===2)&&(this.inst.angle!==newangle))
{this.inst.angle=newangle;this.inst.set_bbox_changed();}};function Cnds(){};Cnds.prototype.IsPinned=function()
{return!!this.pinObject;};behaviorProto.cnds=new Cnds();function Acts(){};Acts.prototype.Pin=function(obj,mode_)
{if(!obj)
return;var otherinst=obj.getFirstPicked(this.inst);if(!otherinst)
return;this.pinObject=otherinst;this.pinAngle=cr.angleTo(otherinst.x,otherinst.y,this.inst.x,this.inst.y)-otherinst.angle;this.pinDist=cr.distanceTo(otherinst.x,otherinst.y,this.inst.x,this.inst.y);this.myStartAngle=this.inst.angle;this.lastKnownAngle=this.inst.angle;this.theirStartAngle=otherinst.angle;this.mode=mode_;};Acts.prototype.Unpin=function()
{this.pinObject=null;};behaviorProto.acts=new Acts();function Exps(){};Exps.prototype.PinnedUID=function(ret)
{ret.set_int(this.pinObject?this.pinObject.uid:-1);};behaviorProto.exps=new Exps();}());;;cr.behaviors.Platform=function(runtime)
{this.runtime=runtime;};(function()
{var behaviorProto=cr.behaviors.Platform.prototype;behaviorProto.Type=function(behavior,objtype)
{this.behavior=behavior;this.objtype=objtype;this.runtime=behavior.runtime;};var behtypeProto=behaviorProto.Type.prototype;behtypeProto.onCreate=function()
{};var ANIMMODE_STOPPED=0;var ANIMMODE_MOVING=1;var ANIMMODE_JUMPING=2;var ANIMMODE_FALLING=3;behaviorProto.Instance=function(type,inst)
{this.type=type;this.behavior=type.behavior;this.inst=inst;this.runtime=type.runtime;this.leftkey=false;this.rightkey=false;this.jumpkey=false;this.jumped=false;this.doubleJumped=false;this.canDoubleJump=false;this.ignoreInput=false;this.simleft=false;this.simright=false;this.simjump=false;this.lastFloorObject=null;this.loadFloorObject=-1;this.lastFloorX=0;this.lastFloorY=0;this.floorIsJumpthru=false;this.animMode=ANIMMODE_STOPPED;this.fallthrough=0;this.firstTick=true;this.dx=0;this.dy=0;};var behinstProto=behaviorProto.Instance.prototype;behinstProto.updateGravity=function()
{this.downx=Math.cos(this.ga);this.downy=Math.sin(this.ga);this.rightx=Math.cos(this.ga-Math.PI/2);this.righty=Math.sin(this.ga-Math.PI/2);this.downx=cr.round6dp(this.downx);this.downy=cr.round6dp(this.downy);this.rightx=cr.round6dp(this.rightx);this.righty=cr.round6dp(this.righty);this.g1=this.g;if(this.g<0)
{this.downx*=-1;this.downy*=-1;this.g=Math.abs(this.g);}};behinstProto.onCreate=function()
{this.maxspeed=this.properties[0];this.acc=this.properties[1];this.dec=this.properties[2];this.jumpStrength=this.properties[3];this.g=this.properties[4];this.g1=this.g;this.maxFall=this.properties[5];this.enableDoubleJump=(this.properties[6]!==0);this.jumpSustain=(this.properties[7]/1000);this.defaultControls=(this.properties[8]===1);this.enabled=(this.properties[9]!==0);this.wasOnFloor=false;this.wasOverJumpthru=this.runtime.testOverlapJumpThru(this.inst);this.loadOverJumpthru=-1;this.sustainTime=0;this.ga=cr.to_radians(90);this.updateGravity();var self=this;if(this.defaultControls&&!this.runtime.isDomFree)
{jQuery(document).keydown(function(info){self.onKeyDown(info);});jQuery(document).keyup(function(info){self.onKeyUp(info);});}
if(!this.recycled)
{this.myDestroyCallback=function(inst){self.onInstanceDestroyed(inst);};}
this.runtime.addDestroyCallback(this.myDestroyCallback);this.inst.extra["isPlatformBehavior"]=true;};behinstProto.saveToJSON=function()
{return{"ii":this.ignoreInput,"lfx":this.lastFloorX,"lfy":this.lastFloorY,"lfo":(this.lastFloorObject?this.lastFloorObject.uid:-1),"am":this.animMode,"en":this.enabled,"fall":this.fallthrough,"ft":this.firstTick,"dx":this.dx,"dy":this.dy,"ms":this.maxspeed,"acc":this.acc,"dec":this.dec,"js":this.jumpStrength,"g":this.g,"g1":this.g1,"mf":this.maxFall,"wof":this.wasOnFloor,"woj":(this.wasOverJumpthru?this.wasOverJumpthru.uid:-1),"ga":this.ga,"edj":this.enableDoubleJump,"cdj":this.canDoubleJump,"dj":this.doubleJumped,"sus":this.jumpSustain};};behinstProto.loadFromJSON=function(o)
{this.ignoreInput=o["ii"];this.lastFloorX=o["lfx"];this.lastFloorY=o["lfy"];this.loadFloorObject=o["lfo"];this.animMode=o["am"];this.enabled=o["en"];this.fallthrough=o["fall"];this.firstTick=o["ft"];this.dx=o["dx"];this.dy=o["dy"];this.maxspeed=o["ms"];this.acc=o["acc"];this.dec=o["dec"];this.jumpStrength=o["js"];this.g=o["g"];this.g1=o["g1"];this.maxFall=o["mf"];this.wasOnFloor=o["wof"];this.loadOverJumpthru=o["woj"];this.ga=o["ga"];this.enableDoubleJump=o["edj"];this.canDoubleJump=o["cdj"];this.doubleJumped=o["dj"];this.jumpSustain=o["sus"];this.leftkey=false;this.rightkey=false;this.jumpkey=false;this.jumped=false;this.simleft=false;this.simright=false;this.simjump=false;this.sustainTime=0;this.updateGravity();};behinstProto.afterLoad=function()
{if(this.loadFloorObject===-1)
this.lastFloorObject=null;else
this.lastFloorObject=this.runtime.getObjectByUID(this.loadFloorObject);if(this.loadOverJumpthru===-1)
this.wasOverJumpthru=null;else
this.wasOverJumpthru=this.runtime.getObjectByUID(this.loadOverJumpthru);};behinstProto.onInstanceDestroyed=function(inst)
{if(this.lastFloorObject==inst)
this.lastFloorObject=null;};behinstProto.onDestroy=function()
{this.lastFloorObject=null;this.runtime.removeDestroyCallback(this.myDestroyCallback);};behinstProto.onKeyDown=function(info)
{switch(info.which){case 38:info.preventDefault();this.jumpkey=true;break;case 37:info.preventDefault();this.leftkey=true;break;case 39:info.preventDefault();this.rightkey=true;break;}};behinstProto.onKeyUp=function(info)
{switch(info.which){case 38:info.preventDefault();this.jumpkey=false;this.jumped=false;break;case 37:info.preventDefault();this.leftkey=false;break;case 39:info.preventDefault();this.rightkey=false;break;}};behinstProto.onWindowBlur=function()
{this.leftkey=false;this.rightkey=false;this.jumpkey=false;};behinstProto.getGDir=function()
{if(this.g<0)
return-1;else
return 1;};behinstProto.isOnFloor=function()
{var ret=null;var ret2=null;var i,len,j;var oldx=this.inst.x;var oldy=this.inst.y;this.inst.x+=this.downx;this.inst.y+=this.downy;this.inst.set_bbox_changed();if(this.lastFloorObject&&this.runtime.testOverlap(this.inst,this.lastFloorObject)&&(!this.runtime.typeHasBehavior(this.lastFloorObject.type,cr.behaviors.solid)||this.lastFloorObject.extra["solidEnabled"]))
{this.inst.x=oldx;this.inst.y=oldy;this.inst.set_bbox_changed();return this.lastFloorObject;}
else
{ret=this.runtime.testOverlapSolid(this.inst);if(!ret&&this.fallthrough===0)
ret2=this.runtime.testOverlapJumpThru(this.inst,true);this.inst.x=oldx;this.inst.y=oldy;this.inst.set_bbox_changed();if(ret)
{if(this.runtime.testOverlap(this.inst,ret))
return null;else
{this.floorIsJumpthru=false;return ret;}}
if(ret2&&ret2.length)
{for(i=0,j=0,len=ret2.length;i<len;i++)
{ret2[j]=ret2[i];if(!this.runtime.testOverlap(this.inst,ret2[i]))
j++;}
if(j>=1)
{this.floorIsJumpthru=true;return ret2[0];}}
return null;}};behinstProto.tick=function()
{};behinstProto.posttick=function()
{var dt=this.runtime.getDt(this.inst);var mx,my,obstacle,mag,allover,i,len,j,oldx,oldy;if(!this.jumpkey&&!this.simjump)
this.jumped=false;var left=this.leftkey||this.simleft;var right=this.rightkey||this.simright;var jumpkey=(this.jumpkey||this.simjump);var jump=jumpkey&&!this.jumped;this.simleft=false;this.simright=false;this.simjump=false;if(!this.enabled)
return;if(this.ignoreInput)
{left=false;right=false;jumpkey=false;jump=false;}
if(!jumpkey)
this.sustainTime=0;var lastFloor=this.lastFloorObject;var floor_moved=false;if(this.firstTick)
{if(this.runtime.testOverlapSolid(this.inst)||this.runtime.testOverlapJumpThru(this.inst))
{this.runtime.pushOutSolid(this.inst,-this.downx,-this.downy,4,true);}
this.firstTick=false;}
if(lastFloor&&this.dy===0&&(lastFloor.y!==this.lastFloorY||lastFloor.x!==this.lastFloorX))
{mx=(lastFloor.x-this.lastFloorX);my=(lastFloor.y-this.lastFloorY);this.inst.x+=mx;this.inst.y+=my;this.inst.set_bbox_changed();this.lastFloorX=lastFloor.x;this.lastFloorY=lastFloor.y;floor_moved=true;if(this.runtime.testOverlapSolid(this.inst))
{this.runtime.pushOutSolid(this.inst,-mx,-my,Math.sqrt(mx*mx+my*my)*2.5);}}
var floor_=this.isOnFloor();var collobj=this.runtime.testOverlapSolid(this.inst);if(collobj)
{if(this.inst.extra["inputPredicted"])
{this.runtime.pushOutSolid(this.inst,-this.downx,-this.downy,10,false);}
else if(this.runtime.pushOutSolidNearest(this.inst,Math.max(this.inst.width,this.inst.height)/2))
{this.runtime.registerCollision(this.inst,collobj);}
else
return;}
if(floor_)
{this.doubleJumped=false;this.canDoubleJump=false;if(this.dy>0)
{if(!this.wasOnFloor)
{this.runtime.pushInFractional(this.inst,-this.downx,-this.downy,floor_,16);this.wasOnFloor=true;}
this.dy=0;}
if(lastFloor!=floor_)
{this.lastFloorObject=floor_;this.lastFloorX=floor_.x;this.lastFloorY=floor_.y;this.runtime.registerCollision(this.inst,floor_);}
else if(floor_moved)
{collobj=this.runtime.testOverlapSolid(this.inst);if(collobj)
{this.runtime.registerCollision(this.inst,collobj);if(mx!==0)
{if(mx>0)
this.runtime.pushOutSolid(this.inst,-this.rightx,-this.righty);else
this.runtime.pushOutSolid(this.inst,this.rightx,this.righty);}
this.runtime.pushOutSolid(this.inst,-this.downx,-this.downy);}}}
else
{if(!jumpkey)
this.canDoubleJump=true;}
if((floor_&&jump)||(!floor_&&this.enableDoubleJump&&jumpkey&&this.canDoubleJump&&!this.doubleJumped))
{oldx=this.inst.x;oldy=this.inst.y;this.inst.x-=this.downx;this.inst.y-=this.downy;this.inst.set_bbox_changed();if(!this.runtime.testOverlapSolid(this.inst))
{this.sustainTime=this.jumpSustain;this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnJump,this.inst);this.animMode=ANIMMODE_JUMPING;this.dy=-this.jumpStrength;jump=true;if(floor_)
this.jumped=true;else
this.doubleJumped=true;}
else
jump=false;this.inst.x=oldx;this.inst.y=oldy;this.inst.set_bbox_changed();}
if(!floor_)
{if(jumpkey&&this.sustainTime>0)
{this.dy=-this.jumpStrength;this.sustainTime-=dt;}
else
{this.lastFloorObject=null;this.dy+=this.g*dt;if(this.dy>this.maxFall)
this.dy=this.maxFall;}
if(jump)
this.jumped=true;}
this.wasOnFloor=!!floor_;if(left==right)
{if(this.dx<0)
{this.dx+=this.dec*dt;if(this.dx>0)
this.dx=0;}
else if(this.dx>0)
{this.dx-=this.dec*dt;if(this.dx<0)
this.dx=0;}}
if(left&&!right)
{if(this.dx>0)
this.dx-=(this.acc+this.dec)*dt;else
this.dx-=this.acc*dt;}
if(right&&!left)
{if(this.dx<0)
this.dx+=(this.acc+this.dec)*dt;else
this.dx+=this.acc*dt;}
if(this.dx>this.maxspeed)
this.dx=this.maxspeed;else if(this.dx<-this.maxspeed)
this.dx=-this.maxspeed;var landed=false;if(this.dx!==0)
{oldx=this.inst.x;oldy=this.inst.y;mx=this.dx*dt*this.rightx;my=this.dx*dt*this.righty;this.inst.x+=this.rightx*(this.dx>1?1:-1)-this.downx;this.inst.y+=this.righty*(this.dx>1?1:-1)-this.downy;this.inst.set_bbox_changed();var is_jumpthru=false;var slope_too_steep=this.runtime.testOverlapSolid(this.inst);this.inst.x=oldx+mx;this.inst.y=oldy+my;this.inst.set_bbox_changed();obstacle=this.runtime.testOverlapSolid(this.inst);if(!obstacle&&floor_)
{obstacle=this.runtime.testOverlapJumpThru(this.inst);if(obstacle)
{this.inst.x=oldx;this.inst.y=oldy;this.inst.set_bbox_changed();if(this.runtime.testOverlap(this.inst,obstacle))
{obstacle=null;is_jumpthru=false;}
else
is_jumpthru=true;this.inst.x=oldx+mx;this.inst.y=oldy+my;this.inst.set_bbox_changed();}}
if(obstacle)
{var push_dist=Math.abs(this.dx*dt)+2;if(slope_too_steep||!this.runtime.pushOutSolid(this.inst,-this.downx,-this.downy,push_dist,is_jumpthru,obstacle))
{this.runtime.registerCollision(this.inst,obstacle);push_dist=Math.max(Math.abs(this.dx*dt*2.5),30);if(!this.runtime.pushOutSolid(this.inst,this.rightx*(this.dx<0?1:-1),this.righty*(this.dx<0?1:-1),push_dist,false))
{this.inst.x=oldx;this.inst.y=oldy;this.inst.set_bbox_changed();}
else if(floor_&&!is_jumpthru&&!this.floorIsJumpthru)
{oldx=this.inst.x;oldy=this.inst.y;this.inst.x+=this.downx;this.inst.y+=this.downy;if(this.runtime.testOverlapSolid(this.inst))
{if(!this.runtime.pushOutSolid(this.inst,-this.downx,-this.downy,3,false))
{this.inst.x=oldx;this.inst.y=oldy;this.inst.set_bbox_changed();}}
else
{this.inst.x=oldx;this.inst.y=oldy;this.inst.set_bbox_changed();}}
if(!is_jumpthru)
this.dx=0;}
else if(!slope_too_steep&&!jump&&(Math.abs(this.dy)<Math.abs(this.jumpStrength/4)))
{this.dy=0;if(!floor_)
landed=true;}}
else
{var newfloor=this.isOnFloor();if(floor_&&!newfloor)
{mag=Math.ceil(Math.abs(this.dx*dt))+2;oldx=this.inst.x;oldy=this.inst.y;this.inst.x+=this.downx*mag;this.inst.y+=this.downy*mag;this.inst.set_bbox_changed();if(this.runtime.testOverlapSolid(this.inst)||this.runtime.testOverlapJumpThru(this.inst))
this.runtime.pushOutSolid(this.inst,-this.downx,-this.downy,mag+2,true);else
{this.inst.x=oldx;this.inst.y=oldy;this.inst.set_bbox_changed();}}
else if(newfloor&&this.dy===0)
{this.runtime.pushInFractional(this.inst,-this.downx,-this.downy,newfloor,16);}}}
if(this.dy!==0)
{oldx=this.inst.x;oldy=this.inst.y;this.inst.x+=this.dy*dt*this.downx;this.inst.y+=this.dy*dt*this.downy;var newx=this.inst.x;var newy=this.inst.y;this.inst.set_bbox_changed();collobj=this.runtime.testOverlapSolid(this.inst);var fell_on_jumpthru=false;if(!collobj&&(this.dy>0)&&!floor_)
{allover=this.fallthrough>0?null:this.runtime.testOverlapJumpThru(this.inst,true);if(allover&&allover.length)
{if(this.wasOverJumpthru)
{this.inst.x=oldx;this.inst.y=oldy;this.inst.set_bbox_changed();for(i=0,j=0,len=allover.length;i<len;i++)
{allover[j]=allover[i];if(!this.runtime.testOverlap(this.inst,allover[i]))
j++;}
allover.length=j;this.inst.x=newx;this.inst.y=newy;this.inst.set_bbox_changed();}
if(allover.length>=1)
collobj=allover[0];}
fell_on_jumpthru=!!collobj;}
if(collobj)
{this.runtime.registerCollision(this.inst,collobj);this.sustainTime=0;var push_dist=(fell_on_jumpthru?Math.abs(this.dy*dt*2.5+10):Math.max(Math.abs(this.dy*dt*2.5+10),30));if(!this.runtime.pushOutSolid(this.inst,this.downx*(this.dy<0?1:-1),this.downy*(this.dy<0?1:-1),push_dist,fell_on_jumpthru,collobj))
{this.inst.x=oldx;this.inst.y=oldy;this.inst.set_bbox_changed();this.wasOnFloor=true;if(!fell_on_jumpthru)
this.dy=0;}
else
{this.lastFloorObject=collobj;this.lastFloorX=collobj.x;this.lastFloorY=collobj.y;this.floorIsJumpthru=fell_on_jumpthru;if(fell_on_jumpthru)
landed=true;this.dy=0;}}}
if(this.animMode!==ANIMMODE_FALLING&&this.dy>0&&!floor_)
{this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnFall,this.inst);this.animMode=ANIMMODE_FALLING;}
if(floor_||landed)
{if(this.animMode===ANIMMODE_FALLING||landed||(jump&&this.dy===0))
{this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnLand,this.inst);if(this.dx===0&&this.dy===0)
this.animMode=ANIMMODE_STOPPED;else
this.animMode=ANIMMODE_MOVING;}
else
{if(this.animMode!==ANIMMODE_STOPPED&&this.dx===0&&this.dy===0)
{this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnStop,this.inst);this.animMode=ANIMMODE_STOPPED;}
if(this.animMode!==ANIMMODE_MOVING&&(this.dx!==0||this.dy!==0)&&!jump)
{this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnMove,this.inst);this.animMode=ANIMMODE_MOVING;}}}
if(this.fallthrough>0)
this.fallthrough--;this.wasOverJumpthru=this.runtime.testOverlapJumpThru(this.inst);};function Cnds(){};Cnds.prototype.IsMoving=function()
{return this.dx!==0||this.dy!==0;};Cnds.prototype.CompareSpeed=function(cmp,s)
{var speed=Math.sqrt(this.dx*this.dx+this.dy*this.dy);return cr.do_cmp(speed,cmp,s);};Cnds.prototype.IsOnFloor=function()
{if(this.dy!==0)
return false;var ret=null;var ret2=null;var i,len,j;var oldx=this.inst.x;var oldy=this.inst.y;this.inst.x+=this.downx;this.inst.y+=this.downy;this.inst.set_bbox_changed();ret=this.runtime.testOverlapSolid(this.inst);if(!ret&&this.fallthrough===0)
ret2=this.runtime.testOverlapJumpThru(this.inst,true);this.inst.x=oldx;this.inst.y=oldy;this.inst.set_bbox_changed();if(ret)
{return!this.runtime.testOverlap(this.inst,ret);}
if(ret2&&ret2.length)
{for(i=0,j=0,len=ret2.length;i<len;i++)
{ret2[j]=ret2[i];if(!this.runtime.testOverlap(this.inst,ret2[i]))
j++;}
if(j>=1)
return true;}
return false;};Cnds.prototype.IsByWall=function(side)
{var ret=false;var oldx=this.inst.x;var oldy=this.inst.y;if(side===0)
{this.inst.x-=this.rightx*2;this.inst.y-=this.righty*2;}
else
{this.inst.x+=this.rightx*2;this.inst.y+=this.righty*2;}
this.inst.set_bbox_changed();if(!this.runtime.testOverlapSolid(this.inst))
{this.inst.x=oldx;this.inst.y=oldy;this.inst.set_bbox_changed();return false;}
this.inst.x-=this.downx*3;this.inst.y-=this.downy*3;this.inst.set_bbox_changed();ret=this.runtime.testOverlapSolid(this.inst);this.inst.x=oldx;this.inst.y=oldy;this.inst.set_bbox_changed();return ret;};Cnds.prototype.IsJumping=function()
{return this.dy<0;};Cnds.prototype.IsFalling=function()
{return this.dy>0;};Cnds.prototype.OnJump=function()
{return true;};Cnds.prototype.OnFall=function()
{return true;};Cnds.prototype.OnStop=function()
{return true;};Cnds.prototype.OnMove=function()
{return true;};Cnds.prototype.OnLand=function()
{return true;};Cnds.prototype.IsDoubleJumpEnabled=function()
{return this.enableDoubleJump;};behaviorProto.cnds=new Cnds();function Acts(){};Acts.prototype.SetIgnoreInput=function(ignoring)
{this.ignoreInput=ignoring;};Acts.prototype.SetMaxSpeed=function(maxspeed)
{this.maxspeed=maxspeed;if(this.maxspeed<0)
this.maxspeed=0;};Acts.prototype.SetAcceleration=function(acc)
{this.acc=acc;if(this.acc<0)
this.acc=0;};Acts.prototype.SetDeceleration=function(dec)
{this.dec=dec;if(this.dec<0)
this.dec=0;};Acts.prototype.SetJumpStrength=function(js)
{this.jumpStrength=js;if(this.jumpStrength<0)
this.jumpStrength=0;};Acts.prototype.SetGravity=function(grav)
{if(this.g1===grav)
return;this.g=grav;this.updateGravity();if(this.runtime.testOverlapSolid(this.inst))
{this.runtime.pushOutSolid(this.inst,this.downx,this.downy,10);this.inst.x+=this.downx*2;this.inst.y+=this.downy*2;this.inst.set_bbox_changed();}
this.lastFloorObject=null;};Acts.prototype.SetMaxFallSpeed=function(mfs)
{this.maxFall=mfs;if(this.maxFall<0)
this.maxFall=0;};Acts.prototype.SimulateControl=function(ctrl)
{switch(ctrl){case 0:this.simleft=true;break;case 1:this.simright=true;break;case 2:this.simjump=true;break;}};Acts.prototype.SetVectorX=function(vx)
{this.dx=vx;};Acts.prototype.SetVectorY=function(vy)
{this.dy=vy;};Acts.prototype.SetGravityAngle=function(a)
{a=cr.to_radians(a);a=cr.clamp_angle(a);if(this.ga===a)
return;this.ga=a;this.updateGravity();this.lastFloorObject=null;};Acts.prototype.SetEnabled=function(en)
{if(this.enabled!==(en===1))
{this.enabled=(en===1);if(!this.enabled)
this.lastFloorObject=null;}};Acts.prototype.FallThrough=function()
{var oldx=this.inst.x;var oldy=this.inst.y;this.inst.x+=this.downx;this.inst.y+=this.downy;this.inst.set_bbox_changed();var overlaps=this.runtime.testOverlapJumpThru(this.inst,false);this.inst.x=oldx;this.inst.y=oldy;this.inst.set_bbox_changed();if(!overlaps)
return;this.fallthrough=3;this.lastFloorObject=null;};Acts.prototype.SetDoubleJumpEnabled=function(e)
{this.enableDoubleJump=(e!==0);};Acts.prototype.SetJumpSustain=function(s)
{this.jumpSustain=s/1000;};behaviorProto.acts=new Acts();function Exps(){};Exps.prototype.Speed=function(ret)
{ret.set_float(Math.sqrt(this.dx*this.dx+this.dy*this.dy));};Exps.prototype.MaxSpeed=function(ret)
{ret.set_float(this.maxspeed);};Exps.prototype.Acceleration=function(ret)
{ret.set_float(this.acc);};Exps.prototype.Deceleration=function(ret)
{ret.set_float(this.dec);};Exps.prototype.JumpStrength=function(ret)
{ret.set_float(this.jumpStrength);};Exps.prototype.Gravity=function(ret)
{ret.set_float(this.g);};Exps.prototype.GravityAngle=function(ret)
{ret.set_float(cr.to_degrees(this.ga));};Exps.prototype.MaxFallSpeed=function(ret)
{ret.set_float(this.maxFall);};Exps.prototype.MovingAngle=function(ret)
{ret.set_float(cr.to_degrees(Math.atan2(this.dy,this.dx)));};Exps.prototype.VectorX=function(ret)
{ret.set_float(this.dx);};Exps.prototype.VectorY=function(ret)
{ret.set_float(this.dy);};Exps.prototype.JumpSustain=function(ret)
{ret.set_float(this.jumpSustain*1000);};behaviorProto.exps=new Exps();}());;;cr.behaviors.Rex_MoveTo=function(runtime)
{this.runtime=runtime;};(function()
{var behaviorProto=cr.behaviors.Rex_MoveTo.prototype;behaviorProto.Type=function(behavior,objtype)
{this.behavior=behavior;this.objtype=objtype;this.runtime=behavior.runtime;};var behtypeProto=behaviorProto.Type.prototype;behtypeProto.onCreate=function()
{};behaviorProto.Instance=function(type,inst)
{this.type=type;this.behavior=type.behavior;this.inst=inst;this.runtime=type.runtime;};var behinstProto=behaviorProto.Instance.prototype;behinstProto.onCreate=function()
{this.activated=(this.properties[0]==1);this.move={"max":this.properties[1],"acc":this.properties[2],"dec":this.properties[3]};this.target={"x":0,"y":0,"a":0};this.is_moving=false;this.current_speed=0;this.remain_distance=0;this.is_hit_target=false;this._pre_pos={"x":0,"y":0};this._moving_angle_info={"x":0,"y":0,"a":(-1)};this._last_tick=null;this.is_my_call=false;};behinstProto.tick=function()
{if(this.is_hit_target)
{this.is_my_call=true;this.runtime.trigger(cr.behaviors.Rex_MoveTo.prototype.cnds.OnHitTarget,this.inst);this.is_my_call=false;this.is_hit_target=false;}
if((!this.activated)||(!this.is_moving))
{return;}
var dt=this.runtime.getDt(this.inst);if(dt==0)
return;if((this._pre_pos["x"]!=this.inst.x)||(this._pre_pos["y"]!=this.inst.y))
this._reset_current_pos();var is_slow_down=false;if(this.move["dec"]!=0)
{var _speed=this.current_speed;var _distance=(_speed*_speed)/(2*this.move["dec"]);is_slow_down=(_distance>=this.remain_distance);}
var acc=(is_slow_down)?(-this.move["dec"]):this.move["acc"];if(acc!=0)
{this.SetCurrentSpeed(this.current_speed+(acc*dt));}
var distance=this.current_speed*dt;this.remain_distance-=distance;if((this.remain_distance<=0)||(this.current_speed<=0))
{this.is_moving=false;this.inst.x=this.target["x"];this.inst.y=this.target["y"];this.SetCurrentSpeed(0);this.moving_angle_get();this.is_hit_target=true;}
else
{var angle=this.target["a"];this.inst.x+=(distance*Math.cos(angle));this.inst.y+=(distance*Math.sin(angle));}
this.inst.set_bbox_changed();this._pre_pos["x"]=this.inst.x;this._pre_pos["y"]=this.inst.y;};behinstProto.tick2=function()
{this._moving_angle_info["x"]=this.inst.x;this._moving_angle_info["y"]=this.inst.y;};behinstProto.SetCurrentSpeed=function(speed)
{if(speed!=null)
{this.current_speed=(speed>this.move["max"])?this.move["max"]:speed;}
else if(this.move["acc"]==0)
{this.current_speed=this.move["max"];}};behinstProto._reset_current_pos=function()
{var dx=this.target["x"]-this.inst.x;var dy=this.target["y"]-this.inst.y;this.target["a"]=Math.atan2(dy,dx);this.remain_distance=Math.sqrt((dx*dx)+(dy*dy));this._pre_pos["x"]=this.inst.x;this._pre_pos["y"]=this.inst.y;};behinstProto.SetTargetPos=function(_x,_y)
{this.is_moving=true;this.target["x"]=_x;this.target["y"]=_y;this._reset_current_pos();this.SetCurrentSpeed(null);this._moving_angle_info["x"]=this.inst.x;this._moving_angle_info["y"]=this.inst.y;};behinstProto.is_tick_changed=function()
{var cur_tick=this.runtime.tickcount;var tick_changed=(this._last_tick!=cur_tick);this._last_tick=cur_tick;return tick_changed;};behinstProto.moving_angle_get=function(ret)
{if(this.is_tick_changed())
{var dx=this.inst.x-this._moving_angle_info["x"];var dy=this.inst.y-this._moving_angle_info["y"];if((dx!=0)||(dy!=0))
this._moving_angle_info["a"]=cr.to_clamped_degrees(Math.atan2(dy,dx));}
return this._moving_angle_info["a"];};behinstProto.saveToJSON=function()
{return{"en":this.activated,"v":this.move,"t":this.target,"is_m":this.is_moving,"c_spd":this.current_speed,"rd":this.remain_distance,"is_ht":this.is_hit_target,"pp":this._pre_pos,"ma":this._moving_angle_info,"lt":this._last_tick,};};behinstProto.loadFromJSON=function(o)
{this.activated=o["en"];this.move=o["v"];this.target=o["t"];this.is_moving=o["is_m"];this.current_speed=o["c_spd"];this.remain_distance=o["rd"];this.is_hit_target=o["is_ht"];this._pre_pos=o["pp"];this._moving_angle_info=o["ma"];this._last_tick=o["lt"];};function Cnds(){};behaviorProto.cnds=new Cnds();Cnds.prototype.OnHitTarget=function()
{return(this.is_my_call);};Cnds.prototype.CompareSpeed=function(cmp,s)
{return cr.do_cmp(this.current_speed,cmp,s);};Cnds.prototype.OnMoving=function()
{return false;};Cnds.prototype.IsMoving=function()
{return(this.activated&&this.is_moving);};Cnds.prototype.CompareMovingAngle=function(cmp,s)
{var angle=this.moving_angle_get();if(angle!=(-1))
return cr.do_cmp(this.moving_angle_get(),cmp,s);else
return false;};function Acts(){};behaviorProto.acts=new Acts();Acts.prototype.SetActivated=function(s)
{this.activated=(s==1);};Acts.prototype.SetMaxSpeed=function(s)
{this.move["max"]=s;this.SetCurrentSpeed(null);};Acts.prototype.SetAcceleration=function(a)
{this.move["acc"]=a;this.SetCurrentSpeed(null);};Acts.prototype.SetDeceleration=function(a)
{this.move["dec"]=a;};Acts.prototype.SetTargetPos=function(_x,_y)
{this.SetTargetPos(_x,_y)};Acts.prototype.SetCurrentSpeed=function(s)
{this.SetCurrentSpeed(s);};Acts.prototype.SetTargetPosOnObject=function(objtype)
{if(!objtype)
return;var inst=objtype.getFirstPicked();if(inst!=null)
this.SetTargetPos(inst.x,inst.y);};Acts.prototype.SetTargetPosByDeltaXY=function(dx,dy)
{this.SetTargetPos(this.inst.x+dx,this.inst.y+dy);};Acts.prototype.SetTargetPosByDistanceAngle=function(distance,angle)
{var a=cr.to_clamped_radians(angle);var dx=distance*Math.cos(a);var dy=distance*Math.sin(a);this.SetTargetPos(this.inst.x+dx,this.inst.y+dy);};Acts.prototype.Stop=function()
{this.is_moving=false;};function Exps(){};behaviorProto.exps=new Exps();Exps.prototype.Activated=function(ret)
{ret.set_int((this.activated)?1:0);};Exps.prototype.Speed=function(ret)
{ret.set_float(this.current_speed);};Exps.prototype.MaxSpeed=function(ret)
{ret.set_float(this.move["max"]);};Exps.prototype.Acc=function(ret)
{ret.set_float(this.move["acc"]);};Exps.prototype.Dec=function(ret)
{ret.set_float(this.move["dec"]);};Exps.prototype.TargetX=function(ret)
{var x=(this.is_moving)?this.target["x"]:0;ret.set_float(x);};Exps.prototype.TargetY=function(ret)
{var y=(this.is_moving)?this.target["y"]:0;ret.set_float(y);};Exps.prototype.MovingAngle=function(ret)
{ret.set_float(this.moving_angle_get());};}());;;cr.behaviors.Rotate=function(runtime)
{this.runtime=runtime;};(function()
{var behaviorProto=cr.behaviors.Rotate.prototype;behaviorProto.Type=function(behavior,objtype)
{this.behavior=behavior;this.objtype=objtype;this.runtime=behavior.runtime;};var behtypeProto=behaviorProto.Type.prototype;behtypeProto.onCreate=function()
{};behaviorProto.Instance=function(type,inst)
{this.type=type;this.behavior=type.behavior;this.inst=inst;this.runtime=type.runtime;};var behinstProto=behaviorProto.Instance.prototype;behinstProto.onCreate=function()
{this.speed=cr.to_radians(this.properties[0]);this.acc=cr.to_radians(this.properties[1]);};behinstProto.saveToJSON=function()
{return{"speed":this.speed,"acc":this.acc};};behinstProto.loadFromJSON=function(o)
{this.speed=o["speed"];this.acc=o["acc"];};behinstProto.tick=function()
{var dt=this.runtime.getDt(this.inst);if(dt===0)
return;if(this.acc!==0)
this.speed+=this.acc*dt;if(this.speed!==0)
{this.inst.angle=cr.clamp_angle(this.inst.angle+this.speed*dt);this.inst.set_bbox_changed();}};function Cnds(){};behaviorProto.cnds=new Cnds();function Acts(){};Acts.prototype.SetSpeed=function(s)
{this.speed=cr.to_radians(s);};Acts.prototype.SetAcceleration=function(a)
{this.acc=cr.to_radians(a);};behaviorProto.acts=new Acts();function Exps(){};Exps.prototype.Speed=function(ret)
{ret.set_float(cr.to_degrees(this.speed));};Exps.prototype.Acceleration=function(ret)
{ret.set_float(cr.to_degrees(this.acc));};behaviorProto.exps=new Exps();}());;;cr.behaviors.Sin=function(runtime)
{this.runtime=runtime;};(function()
{var behaviorProto=cr.behaviors.Sin.prototype;behaviorProto.Type=function(behavior,objtype)
{this.behavior=behavior;this.objtype=objtype;this.runtime=behavior.runtime;};var behtypeProto=behaviorProto.Type.prototype;behtypeProto.onCreate=function()
{};behaviorProto.Instance=function(type,inst)
{this.type=type;this.behavior=type.behavior;this.inst=inst;this.runtime=type.runtime;this.i=0;};var behinstProto=behaviorProto.Instance.prototype;var _2pi=2*Math.PI;var _pi_2=Math.PI/2;var _3pi_2=(3*Math.PI)/2;behinstProto.onCreate=function()
{this.active=(this.properties[0]===1);this.movement=this.properties[1];this.wave=this.properties[2];this.period=this.properties[3];this.period+=Math.random()*this.properties[4];if(this.period===0)
this.i=0;else
{this.i=(this.properties[5]/this.period)*_2pi;this.i+=((Math.random()*this.properties[6])/this.period)*_2pi;}
this.mag=this.properties[7];this.mag+=Math.random()*this.properties[8];this.initialValue=0;this.initialValue2=0;this.ratio=0;if(this.movement===5)
this.mag=cr.to_radians(this.mag);this.init();};behinstProto.saveToJSON=function()
{return{"i":this.i,"a":this.active,"mv":this.movement,"w":this.wave,"p":this.period,"mag":this.mag,"iv":this.initialValue,"iv2":this.initialValue2,"r":this.ratio,"lkv":this.lastKnownValue,"lkv2":this.lastKnownValue2};};behinstProto.loadFromJSON=function(o)
{this.i=o["i"];this.active=o["a"];this.movement=o["mv"];this.wave=o["w"];this.period=o["p"];this.mag=o["mag"];this.initialValue=o["iv"];this.initialValue2=o["iv2"]||0;this.ratio=o["r"];this.lastKnownValue=o["lkv"];this.lastKnownValue2=o["lkv2"]||0;};behinstProto.init=function()
{switch(this.movement){case 0:this.initialValue=this.inst.x;break;case 1:this.initialValue=this.inst.y;break;case 2:this.initialValue=this.inst.width;this.ratio=this.inst.height/this.inst.width;break;case 3:this.initialValue=this.inst.width;break;case 4:this.initialValue=this.inst.height;break;case 5:this.initialValue=this.inst.angle;break;case 6:this.initialValue=this.inst.opacity;break;case 7:this.initialValue=0;break;case 8:this.initialValue=this.inst.x;this.initialValue2=this.inst.y;break;default:;}
this.lastKnownValue=this.initialValue;this.lastKnownValue2=this.initialValue2;};behinstProto.waveFunc=function(x)
{x=x%_2pi;switch(this.wave){case 0:return Math.sin(x);case 1:if(x<=_pi_2)
return x/_pi_2;else if(x<=_3pi_2)
return 1-(2*(x-_pi_2)/Math.PI);else
return(x-_3pi_2)/_pi_2-1;case 2:return 2*x/_2pi-1;case 3:return-2*x/_2pi+1;case 4:return x<Math.PI?-1:1;};return 0;};behinstProto.tick=function()
{var dt=this.runtime.getDt(this.inst);if(!this.active||dt===0)
return;if(this.period===0)
this.i=0;else
{this.i+=(dt/this.period)*_2pi;this.i=this.i%_2pi;}
this.updateFromPhase();};behinstProto.updateFromPhase=function()
{switch(this.movement){case 0:if(this.inst.x!==this.lastKnownValue)
this.initialValue+=this.inst.x-this.lastKnownValue;this.inst.x=this.initialValue+this.waveFunc(this.i)*this.mag;this.lastKnownValue=this.inst.x;break;case 1:if(this.inst.y!==this.lastKnownValue)
this.initialValue+=this.inst.y-this.lastKnownValue;this.inst.y=this.initialValue+this.waveFunc(this.i)*this.mag;this.lastKnownValue=this.inst.y;break;case 2:this.inst.width=this.initialValue+this.waveFunc(this.i)*this.mag;this.inst.height=this.inst.width*this.ratio;break;case 3:this.inst.width=this.initialValue+this.waveFunc(this.i)*this.mag;break;case 4:this.inst.height=this.initialValue+this.waveFunc(this.i)*this.mag;break;case 5:if(this.inst.angle!==this.lastKnownValue)
this.initialValue=cr.clamp_angle(this.initialValue+(this.inst.angle-this.lastKnownValue));this.inst.angle=cr.clamp_angle(this.initialValue+this.waveFunc(this.i)*this.mag);this.lastKnownValue=this.inst.angle;break;case 6:this.inst.opacity=this.initialValue+(this.waveFunc(this.i)*this.mag)/100;if(this.inst.opacity<0)
this.inst.opacity=0;else if(this.inst.opacity>1)
this.inst.opacity=1;break;case 8:if(this.inst.x!==this.lastKnownValue)
this.initialValue+=this.inst.x-this.lastKnownValue;if(this.inst.y!==this.lastKnownValue2)
this.initialValue2+=this.inst.y-this.lastKnownValue2;this.inst.x=this.initialValue+Math.cos(this.inst.angle)*this.waveFunc(this.i)*this.mag;this.inst.y=this.initialValue2+Math.sin(this.inst.angle)*this.waveFunc(this.i)*this.mag;this.lastKnownValue=this.inst.x;this.lastKnownValue2=this.inst.y;break;}
this.inst.set_bbox_changed();};behinstProto.onSpriteFrameChanged=function(prev_frame,next_frame)
{switch(this.movement){case 2:this.initialValue*=(next_frame.width/prev_frame.width);this.ratio=next_frame.height/next_frame.width;break;case 3:this.initialValue*=(next_frame.width/prev_frame.width);break;case 4:this.initialValue*=(next_frame.height/prev_frame.height);break;}};function Cnds(){};Cnds.prototype.IsActive=function()
{return this.active;};Cnds.prototype.CompareMovement=function(m)
{return this.movement===m;};Cnds.prototype.ComparePeriod=function(cmp,v)
{return cr.do_cmp(this.period,cmp,v);};Cnds.prototype.CompareMagnitude=function(cmp,v)
{if(this.movement===5)
return cr.do_cmp(this.mag,cmp,cr.to_radians(v));else
return cr.do_cmp(this.mag,cmp,v);};Cnds.prototype.CompareWave=function(w)
{return this.wave===w;};behaviorProto.cnds=new Cnds();function Acts(){};Acts.prototype.SetActive=function(a)
{this.active=(a===1);};Acts.prototype.SetPeriod=function(x)
{this.period=x;};Acts.prototype.SetMagnitude=function(x)
{this.mag=x;if(this.movement===5)
this.mag=cr.to_radians(this.mag);};Acts.prototype.SetMovement=function(m)
{if(this.movement===5&&m!==5)
this.mag=cr.to_degrees(this.mag);this.movement=m;this.init();};Acts.prototype.SetWave=function(w)
{this.wave=w;};Acts.prototype.SetPhase=function(x)
{this.i=(x*_2pi)%_2pi;this.updateFromPhase();};Acts.prototype.UpdateInitialState=function()
{this.init();};behaviorProto.acts=new Acts();function Exps(){};Exps.prototype.CyclePosition=function(ret)
{ret.set_float(this.i/_2pi);};Exps.prototype.Period=function(ret)
{ret.set_float(this.period);};Exps.prototype.Magnitude=function(ret)
{if(this.movement===5)
ret.set_float(cr.to_degrees(this.mag));else
ret.set_float(this.mag);};Exps.prototype.Value=function(ret)
{ret.set_float(this.waveFunc(this.i)*this.mag);};behaviorProto.exps=new Exps();}());;;cr.behaviors.Timer=function(runtime)
{this.runtime=runtime;};(function()
{var behaviorProto=cr.behaviors.Timer.prototype;behaviorProto.Type=function(behavior,objtype)
{this.behavior=behavior;this.objtype=objtype;this.runtime=behavior.runtime;};var behtypeProto=behaviorProto.Type.prototype;behtypeProto.onCreate=function()
{};behaviorProto.Instance=function(type,inst)
{this.type=type;this.behavior=type.behavior;this.inst=inst;this.runtime=type.runtime;};var behinstProto=behaviorProto.Instance.prototype;behinstProto.onCreate=function()
{this.timers={};};behinstProto.onDestroy=function()
{cr.wipe(this.timers);};behinstProto.saveToJSON=function()
{var o={};var p,t;for(p in this.timers)
{if(this.timers.hasOwnProperty(p))
{t=this.timers[p];o[p]={"c":t.current.sum,"t":t.total.sum,"d":t.duration,"r":t.regular};}}
return o;};behinstProto.loadFromJSON=function(o)
{this.timers={};var p;for(p in o)
{if(o.hasOwnProperty(p))
{this.timers[p]={current:new cr.KahanAdder(),total:new cr.KahanAdder(),duration:o[p]["d"],regular:o[p]["r"]};this.timers[p].current.sum=o[p]["c"];this.timers[p].total.sum=o[p]["t"];}}};behinstProto.tick=function()
{var dt=this.runtime.getDt(this.inst);var p,t;for(p in this.timers)
{if(this.timers.hasOwnProperty(p))
{t=this.timers[p];t.current.add(dt);t.total.add(dt);}}};behinstProto.tick2=function()
{var p,t;for(p in this.timers)
{if(this.timers.hasOwnProperty(p))
{t=this.timers[p];if(t.current.sum>=t.duration)
{if(t.regular)
t.current.sum-=t.duration;else
delete this.timers[p];}}}};function Cnds(){};Cnds.prototype.OnTimer=function(tag_)
{tag_=tag_.toLowerCase();var t=this.timers[tag_];if(!t)
return false;return t.current.sum>=t.duration;};behaviorProto.cnds=new Cnds();function Acts(){};Acts.prototype.StartTimer=function(duration_,type_,tag_)
{this.timers[tag_.toLowerCase()]={current:new cr.KahanAdder(),total:new cr.KahanAdder(),duration:duration_,regular:(type_===1)};};Acts.prototype.StopTimer=function(tag_)
{tag_=tag_.toLowerCase();if(this.timers.hasOwnProperty(tag_))
delete this.timers[tag_];};behaviorProto.acts=new Acts();function Exps(){};Exps.prototype.CurrentTime=function(ret,tag_)
{var t=this.timers[tag_.toLowerCase()];ret.set_float(t?t.current.sum:0);};Exps.prototype.TotalTime=function(ret,tag_)
{var t=this.timers[tag_.toLowerCase()];ret.set_float(t?t.total.sum:0);};Exps.prototype.Duration=function(ret,tag_)
{var t=this.timers[tag_.toLowerCase()];ret.set_float(t?t.duration:0);};behaviorProto.exps=new Exps();}());;;cr.behaviors.scrollto=function(runtime)
{this.runtime=runtime;this.shakeMag=0;this.shakeStart=0;this.shakeEnd=0;this.shakeMode=0;};(function()
{var behaviorProto=cr.behaviors.scrollto.prototype;behaviorProto.Type=function(behavior,objtype)
{this.behavior=behavior;this.objtype=objtype;this.runtime=behavior.runtime;};var behtypeProto=behaviorProto.Type.prototype;behtypeProto.onCreate=function()
{};behaviorProto.Instance=function(type,inst)
{this.type=type;this.behavior=type.behavior;this.inst=inst;this.runtime=type.runtime;};var behinstProto=behaviorProto.Instance.prototype;behinstProto.onCreate=function()
{this.enabled=(this.properties[0]!==0);};behinstProto.saveToJSON=function()
{return{"smg":this.behavior.shakeMag,"ss":this.behavior.shakeStart,"se":this.behavior.shakeEnd,"smd":this.behavior.shakeMode};};behinstProto.loadFromJSON=function(o)
{this.behavior.shakeMag=o["smg"];this.behavior.shakeStart=o["ss"];this.behavior.shakeEnd=o["se"];this.behavior.shakeMode=o["smd"];};behinstProto.tick=function()
{};function getScrollToBehavior(inst)
{var i,len,binst;for(i=0,len=inst.behavior_insts.length;i<len;++i)
{binst=inst.behavior_insts[i];if(binst.behavior instanceof cr.behaviors.scrollto)
return binst;}
return null;};behinstProto.tick2=function()
{if(!this.enabled)
return;var all=this.behavior.my_instances.valuesRef();var sumx=0,sumy=0;var i,len,binst,count=0;for(i=0,len=all.length;i<len;i++)
{binst=getScrollToBehavior(all[i]);if(!binst||!binst.enabled)
continue;sumx+=all[i].x;sumy+=all[i].y;++count;}
var layout=this.inst.layer.layout;var now=this.runtime.kahanTime.sum;var offx=0,offy=0;if(now>=this.behavior.shakeStart&&now<this.behavior.shakeEnd)
{var mag=this.behavior.shakeMag*Math.min(this.runtime.timescale,1);if(this.behavior.shakeMode===0)
mag*=1-(now-this.behavior.shakeStart)/(this.behavior.shakeEnd-this.behavior.shakeStart);var a=Math.random()*Math.PI*2;var d=Math.random()*mag;offx=Math.cos(a)*d;offy=Math.sin(a)*d;}
layout.scrollToX(sumx/count+offx);layout.scrollToY(sumy/count+offy);};function Acts(){};Acts.prototype.Shake=function(mag,dur,mode)
{this.behavior.shakeMag=mag;this.behavior.shakeStart=this.runtime.kahanTime.sum;this.behavior.shakeEnd=this.behavior.shakeStart+dur;this.behavior.shakeMode=mode;};Acts.prototype.SetEnabled=function(e)
{this.enabled=(e!==0);};behaviorProto.acts=new Acts();}());;;cr.behaviors.solid=function(runtime)
{this.runtime=runtime;};(function()
{var behaviorProto=cr.behaviors.solid.prototype;behaviorProto.Type=function(behavior,objtype)
{this.behavior=behavior;this.objtype=objtype;this.runtime=behavior.runtime;};var behtypeProto=behaviorProto.Type.prototype;behtypeProto.onCreate=function()
{};behaviorProto.Instance=function(type,inst)
{this.type=type;this.behavior=type.behavior;this.inst=inst;this.runtime=type.runtime;};var behinstProto=behaviorProto.Instance.prototype;behinstProto.onCreate=function()
{this.inst.extra["solidEnabled"]=(this.properties[0]!==0);};behinstProto.tick=function()
{};function Cnds(){};Cnds.prototype.IsEnabled=function()
{return this.inst.extra["solidEnabled"];};behaviorProto.cnds=new Cnds();function Acts(){};Acts.prototype.SetEnabled=function(e)
{this.inst.extra["solidEnabled"]=!!e;};behaviorProto.acts=new Acts();}());cr.getObjectRefTable=function(){return[cr.plugins_.AJAX,cr.plugins_.Function,cr.plugins_.Keyboard,cr.plugins_.Mouse,cr.plugins_.Particles,cr.plugins_.Sprite,cr.plugins_.Spritefont2,cr.plugins_.Text,cr.plugins_.Touch,cr.plugins_.Twitter,cr.plugins_.Audio,cr.plugins_.Button,cr.plugins_.Browser,cr.plugins_.XML,cr.behaviors.Fade,cr.behaviors.Timer,cr.behaviors.scrollto,cr.behaviors.Rex_MoveTo,cr.behaviors.solid,cr.behaviors.DragnDrop,cr.behaviors.Platform,cr.behaviors.Bullet,cr.behaviors.EightDir,cr.behaviors.Rotate,cr.behaviors.Pin,cr.behaviors.Sin,cr.behaviors.Flash,cr.system_object.prototype.cnds.IsGroupActive,cr.system_object.prototype.cnds.OnLayoutStart,cr.plugins_.Spritefont2.prototype.acts.SetOpacity,cr.plugins_.Audio.prototype.acts.PlayByName,cr.system_object.prototype.acts.Wait,cr.plugins_.Spritefont2.prototype.acts.SetText,cr.plugins_.Function.prototype.exps.Call,cr.behaviors.Fade.prototype.acts.StartFade,cr.system_object.prototype.acts.GoToLayout,cr.plugins_.Audio.prototype.acts.PreloadByName,cr.plugins_.Sprite.prototype.acts.SetOpacity,cr.behaviors.solid.prototype.acts.SetEnabled,cr.plugins_.Sprite.prototype.acts.SetPos,cr.plugins_.Sprite.prototype.exps.X,cr.plugins_.Sprite.prototype.exps.Y,cr.behaviors.Pin.prototype.acts.Pin,cr.system_object.prototype.acts.SetVar,cr.plugins_.Audio.prototype.acts.Stop,cr.plugins_.Function.prototype.acts.CallFunction,cr.system_object.prototype.cnds.ForEach,cr.behaviors.Platform.prototype.acts.SetMaxFallSpeed,cr.system_object.prototype.exps.random,cr.plugins_.Sprite.prototype.acts.SetInstanceVar,cr.plugins_.Sprite.prototype.acts.SetAnimFrame,cr.plugins_.Sprite.prototype.acts.SetAnimSpeed,cr.behaviors.Sin.prototype.acts.SetPeriod,cr.behaviors.DragnDrop.prototype.cnds.OnDragStart,cr.behaviors.DragnDrop.prototype.cnds.OnDrop,cr.plugins_.Sprite.prototype.cnds.IsVisible,cr.plugins_.Sprite.prototype.cnds.CompareX,cr.system_object.prototype.cnds.Compare,cr.plugins_.Sprite.prototype.acts.SetX,cr.system_object.prototype.exps.dt,cr.plugins_.Sprite.prototype.cnds.IsOverlapping,cr.plugins_.Sprite.prototype.cnds.CompareInstanceVar,cr.behaviors.Platform.prototype.acts.SetEnabled,cr.plugins_.Sprite.prototype.acts.MoveToTop,cr.plugins_.Audio.prototype.exps.MasterVolume,cr.system_object.prototype.cnds.CompareVar,cr.plugins_.Touch.prototype.cnds.OnTouchObject,cr.behaviors.DragnDrop.prototype.cnds.IsEnabled,cr.system_object.prototype.cnds.PickByComparison,cr.plugins_.Sprite.prototype.acts.AddInstanceVar,cr.plugins_.Sprite.prototype.acts.Spawn,cr.plugins_.Sprite.prototype.acts.SetAnim,cr.plugins_.Sprite.prototype.acts.SetY,cr.system_object.prototype.cnds.TriggerOnce,cr.behaviors.DragnDrop.prototype.acts.SetEnabled,cr.behaviors.Platform.prototype.cnds.OnLand,cr.behaviors.Platform.prototype.cnds.IsOnFloor,cr.behaviors.Platform.prototype.acts.SimulateControl,cr.system_object.prototype.cnds.Every,cr.plugins_.Sprite.prototype.cnds.IsAnimPlaying,cr.plugins_.Sprite.prototype.cnds.CompareFrame,cr.plugins_.Audio.prototype.acts.SetPlaybackRate,cr.plugins_.Sprite.prototype.acts.SubInstanceVar,cr.system_object.prototype.acts.CreateObject,cr.plugins_.Touch.prototype.exps.X,cr.plugins_.Touch.prototype.exps.Y,cr.plugins_.Sprite.prototype.cnds.OnCollision,cr.behaviors.Platform.prototype.cnds.IsFalling,cr.behaviors.Platform.prototype.acts.SetVectorY,cr.plugins_.Sprite.prototype.acts.Destroy,cr.plugins_.Sprite.prototype.cnds.CompareY,cr.behaviors.DragnDrop.prototype.cnds.IsDragging,cr.plugins_.Sprite.prototype.exps.Count,cr.behaviors.Fade.prototype.acts.RestartFade,cr.behaviors.Bullet.prototype.acts.SetEnabled,cr.plugins_.Sprite.prototype.acts.SetVisible,cr.behaviors.Flash.prototype.acts.Flash,cr.behaviors.Platform.prototype.acts.SetGravity,cr.system_object.prototype.cnds.EveryTick,cr.plugins_.Sprite.prototype.cnds.IsOutsideLayout,cr.behaviors.Bullet.prototype.acts.SetSpeed,cr.behaviors.Bullet.prototype.acts.SetAngleOfMotion,cr.behaviors.EightDir.prototype.acts.SimulateControl,cr.plugins_.Spritefont2.prototype.acts.AddInstanceVar,cr.behaviors.Bullet.prototype.exps.AngleOfMotion,cr.plugins_.Sprite.prototype.exps.Width,cr.behaviors.Bullet.prototype.cnds.CompareSpeed,cr.plugins_.Sprite.prototype.cnds.IsOnScreen,cr.plugins_.Touch.prototype.cnds.IsTouchingObject,cr.plugins_.Sprite.prototype.acts.RotateCounterclockwise,cr.plugins_.Audio.prototype.cnds.IsTagPlaying,cr.behaviors.Rotate.prototype.acts.SetSpeed,cr.plugins_.Sprite.prototype.cnds.PickDistance,cr.plugins_.Sprite.prototype.acts.MoveToBottom,cr.behaviors.Rex_MoveTo.prototype.acts.SetTargetPosOnObject,cr.plugins_.Sprite.prototype.exps.ImagePointX,cr.plugins_.Sprite.prototype.exps.ImagePointY,cr.plugins_.Sprite.prototype.acts.SetCollisions,cr.behaviors.Rex_MoveTo.prototype.cnds.IsMoving,cr.behaviors.Rex_MoveTo.prototype.acts.SetAcceleration,cr.behaviors.Rex_MoveTo.prototype.acts.SetDeceleration,cr.plugins_.Sprite.prototype.cnds.CompareOpacity,cr.plugins_.Audio.prototype.acts.SetMuted,cr.plugins_.Audio.prototype.acts.SetVolume,cr.behaviors.Pin.prototype.acts.Unpin,cr.system_object.prototype.exps.choose,cr.plugins_.Sprite.prototype.acts.MoveToLayer,cr.plugins_.Twitter.prototype.acts.SetX,cr.system_object.prototype.exps.clamp,cr.system_object.prototype.cnds.IsMobile,cr.plugins_.Browser.prototype.acts.GoToURLWindow,cr.system_object.prototype.acts.SetLayerEffectEnabled,cr.system_object.prototype.acts.SubVar,cr.system_object.prototype.acts.SetLayerEffectParam,cr.plugins_.Function.prototype.cnds.OnFunction,cr.plugins_.Spritefont2.prototype.acts.SetVisible,cr.plugins_.Spritefont2.prototype.cnds.IsVisible,cr.plugins_.Audio.prototype.exps.Duration,cr.system_object.prototype.exps.layoutwidth,cr.system_object.prototype.exps.layoutheight,cr.plugins_.Mouse.prototype.acts.SetCursor,cr.plugins_.Mouse.prototype.exps.X,cr.plugins_.Mouse.prototype.exps.Y,cr.plugins_.Browser.prototype.acts.RequestFullScreen,cr.plugins_.Function.prototype.exps.Param,cr.plugins_.AJAX.prototype.acts.Request,cr.plugins_.AJAX.prototype.cnds.OnComplete,cr.plugins_.XML.prototype.acts.Load,cr.plugins_.AJAX.prototype.exps.LastData,cr.plugins_.Function.prototype.acts.SetReturnValue,cr.plugins_.XML.prototype.exps.StringValue];};
/*! jQuery v2.1.1 | (c) 2005, 2014 jQuery Foundation, Inc. | jquery.org/license */
!function (a, b) { "object" == typeof module && "object" == typeof module.exports ? module.exports = a.document ? b(a, !0) : function (a) { if (!a.document) throw new Error("jQuery requires a window with a document"); return b(a) } : b(a) }("undefined" != typeof window ? window : this, function (a, b) {
    var c = [], d = c.slice, e = c.concat, f = c.push, g = c.indexOf, h = {}, i = h.toString, j = h.hasOwnProperty, k = {}, l = a.document, m = "2.1.1", n = function (a, b) { return new n.fn.init(a, b) }, o = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, p = /^-ms-/, q = /-([\da-z])/gi, r = function (a, b) { return b.toUpperCase() }; n.fn = n.prototype = { jquery: m, constructor: n, selector: "", length: 0, toArray: function () { return d.call(this) }, get: function (a) { return null != a ? 0 > a ? this[a + this.length] : this[a] : d.call(this) }, pushStack: function (a) { var b = n.merge(this.constructor(), a); return b.prevObject = this, b.context = this.context, b }, each: function (a, b) { return n.each(this, a, b) }, map: function (a) { return this.pushStack(n.map(this, function (b, c) { return a.call(b, c, b) })) }, slice: function () { return this.pushStack(d.apply(this, arguments)) }, first: function () { return this.eq(0) }, last: function () { return this.eq(-1) }, eq: function (a) { var b = this.length, c = +a + (0 > a ? b : 0); return this.pushStack(c >= 0 && b > c ? [this[c]] : []) }, end: function () { return this.prevObject || this.constructor(null) }, push: f, sort: c.sort, splice: c.splice }, n.extend = n.fn.extend = function () { var a, b, c, d, e, f, g = arguments[0] || {}, h = 1, i = arguments.length, j = !1; for ("boolean" == typeof g && (j = g, g = arguments[h] || {}, h++), "object" == typeof g || n.isFunction(g) || (g = {}), h === i && (g = this, h--); i > h; h++)if (null != (a = arguments[h])) for (b in a) c = g[b], d = a[b], g !== d && (j && d && (n.isPlainObject(d) || (e = n.isArray(d))) ? (e ? (e = !1, f = c && n.isArray(c) ? c : []) : f = c && n.isPlainObject(c) ? c : {}, g[b] = n.extend(j, f, d)) : void 0 !== d && (g[b] = d)); return g }, n.extend({ expando: "jQuery" + (m + Math.random()).replace(/\D/g, ""), isReady: !0, error: function (a) { throw new Error(a) }, noop: function () { }, isFunction: function (a) { return "function" === n.type(a) }, isArray: Array.isArray, isWindow: function (a) { return null != a && a === a.window }, isNumeric: function (a) { return !n.isArray(a) && a - parseFloat(a) >= 0 }, isPlainObject: function (a) { return "object" !== n.type(a) || a.nodeType || n.isWindow(a) ? !1 : a.constructor && !j.call(a.constructor.prototype, "isPrototypeOf") ? !1 : !0 }, isEmptyObject: function (a) { var b; for (b in a) return !1; return !0 }, type: function (a) { return null == a ? a + "" : "object" == typeof a || "function" == typeof a ? h[i.call(a)] || "object" : typeof a }, globalEval: function (a) { var b, c = eval; a = n.trim(a), a && (1 === a.indexOf("use strict") ? (b = l.createElement("script"), b.text = a, l.head.appendChild(b).parentNode.removeChild(b)) : c(a)) }, camelCase: function (a) { return a.replace(p, "ms-").replace(q, r) }, nodeName: function (a, b) { return a.nodeName && a.nodeName.toLowerCase() === b.toLowerCase() }, each: function (a, b, c) { var d, e = 0, f = a.length, g = s(a); if (c) { if (g) { for (; f > e; e++)if (d = b.apply(a[e], c), d === !1) break } else for (e in a) if (d = b.apply(a[e], c), d === !1) break } else if (g) { for (; f > e; e++)if (d = b.call(a[e], e, a[e]), d === !1) break } else for (e in a) if (d = b.call(a[e], e, a[e]), d === !1) break; return a }, trim: function (a) { return null == a ? "" : (a + "").replace(o, "") }, makeArray: function (a, b) { var c = b || []; return null != a && (s(Object(a)) ? n.merge(c, "string" == typeof a ? [a] : a) : f.call(c, a)), c }, inArray: function (a, b, c) { return null == b ? -1 : g.call(b, a, c) }, merge: function (a, b) { for (var c = +b.length, d = 0, e = a.length; c > d; d++)a[e++] = b[d]; return a.length = e, a }, grep: function (a, b, c) { for (var d, e = [], f = 0, g = a.length, h = !c; g > f; f++)d = !b(a[f], f), d !== h && e.push(a[f]); return e }, map: function (a, b, c) { var d, f = 0, g = a.length, h = s(a), i = []; if (h) for (; g > f; f++)d = b(a[f], f, c), null != d && i.push(d); else for (f in a) d = b(a[f], f, c), null != d && i.push(d); return e.apply([], i) }, guid: 1, proxy: function (a, b) { var c, e, f; return "string" == typeof b && (c = a[b], b = a, a = c), n.isFunction(a) ? (e = d.call(arguments, 2), f = function () { return a.apply(b || this, e.concat(d.call(arguments))) }, f.guid = a.guid = a.guid || n.guid++ , f) : void 0 }, now: Date.now, support: k }), n.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (a, b) { h["[object " + b + "]"] = b.toLowerCase() }); function s(a) { var b = a.length, c = n.type(a); return "function" === c || n.isWindow(a) ? !1 : 1 === a.nodeType && b ? !0 : "array" === c || 0 === b || "number" == typeof b && b > 0 && b - 1 in a } var t = function (a) { var b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u = "sizzle" + -new Date, v = a.document, w = 0, x = 0, y = gb(), z = gb(), A = gb(), B = function (a, b) { return a === b && (l = !0), 0 }, C = "undefined", D = 1 << 31, E = {}.hasOwnProperty, F = [], G = F.pop, H = F.push, I = F.push, J = F.slice, K = F.indexOf || function (a) { for (var b = 0, c = this.length; c > b; b++)if (this[b] === a) return b; return -1 }, L = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", M = "[\\x20\\t\\r\\n\\f]", N = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+", O = N.replace("w", "w#"), P = "\\[" + M + "*(" + N + ")(?:" + M + "*([*^$|!~]?=)" + M + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + O + "))|)" + M + "*\\]", Q = ":(" + N + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + P + ")*)|.*)\\)|)", R = new RegExp("^" + M + "+|((?:^|[^\\\\])(?:\\\\.)*)" + M + "+$", "g"), S = new RegExp("^" + M + "*," + M + "*"), T = new RegExp("^" + M + "*([>+~]|" + M + ")" + M + "*"), U = new RegExp("=" + M + "*([^\\]'\"]*?)" + M + "*\\]", "g"), V = new RegExp(Q), W = new RegExp("^" + O + "$"), X = { ID: new RegExp("^#(" + N + ")"), CLASS: new RegExp("^\\.(" + N + ")"), TAG: new RegExp("^(" + N.replace("w", "w*") + ")"), ATTR: new RegExp("^" + P), PSEUDO: new RegExp("^" + Q), CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + M + "*(even|odd|(([+-]|)(\\d*)n|)" + M + "*(?:([+-]|)" + M + "*(\\d+)|))" + M + "*\\)|)", "i"), bool: new RegExp("^(?:" + L + ")$", "i"), needsContext: new RegExp("^" + M + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + M + "*((?:-\\d)?\\d*)" + M + "*\\)|)(?=[^-]|$)", "i") }, Y = /^(?:input|select|textarea|button)$/i, Z = /^h\d$/i, $ = /^[^{]+\{\s*\[native \w/, _ = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, ab = /[+~]/, bb = /'|\\/g, cb = new RegExp("\\\\([\\da-f]{1,6}" + M + "?|(" + M + ")|.)", "ig"), db = function (a, b, c) { var d = "0x" + b - 65536; return d !== d || c ? b : 0 > d ? String.fromCharCode(d + 65536) : String.fromCharCode(d >> 10 | 55296, 1023 & d | 56320) }; try { I.apply(F = J.call(v.childNodes), v.childNodes), F[v.childNodes.length].nodeType } catch (eb) { I = { apply: F.length ? function (a, b) { H.apply(a, J.call(b)) } : function (a, b) { var c = a.length, d = 0; while (a[c++] = b[d++]); a.length = c - 1 } } } function fb(a, b, d, e) { var f, h, j, k, l, o, r, s, w, x; if ((b ? b.ownerDocument || b : v) !== n && m(b), b = b || n, d = d || [], !a || "string" != typeof a) return d; if (1 !== (k = b.nodeType) && 9 !== k) return []; if (p && !e) { if (f = _.exec(a)) if (j = f[1]) { if (9 === k) { if (h = b.getElementById(j), !h || !h.parentNode) return d; if (h.id === j) return d.push(h), d } else if (b.ownerDocument && (h = b.ownerDocument.getElementById(j)) && t(b, h) && h.id === j) return d.push(h), d } else { if (f[2]) return I.apply(d, b.getElementsByTagName(a)), d; if ((j = f[3]) && c.getElementsByClassName && b.getElementsByClassName) return I.apply(d, b.getElementsByClassName(j)), d } if (c.qsa && (!q || !q.test(a))) { if (s = r = u, w = b, x = 9 === k && a, 1 === k && "object" !== b.nodeName.toLowerCase()) { o = g(a), (r = b.getAttribute("id")) ? s = r.replace(bb, "\\$&") : b.setAttribute("id", s), s = "[id='" + s + "'] ", l = o.length; while (l--) o[l] = s + qb(o[l]); w = ab.test(a) && ob(b.parentNode) || b, x = o.join(",") } if (x) try { return I.apply(d, w.querySelectorAll(x)), d } catch (y) { } finally { r || b.removeAttribute("id") } } } return i(a.replace(R, "$1"), b, d, e) } function gb() { var a = []; function b(c, e) { return a.push(c + " ") > d.cacheLength && delete b[a.shift()], b[c + " "] = e } return b } function hb(a) { return a[u] = !0, a } function ib(a) { var b = n.createElement("div"); try { return !!a(b) } catch (c) { return !1 } finally { b.parentNode && b.parentNode.removeChild(b), b = null } } function jb(a, b) { var c = a.split("|"), e = a.length; while (e--) d.attrHandle[c[e]] = b } function kb(a, b) { var c = b && a, d = c && 1 === a.nodeType && 1 === b.nodeType && (~b.sourceIndex || D) - (~a.sourceIndex || D); if (d) return d; if (c) while (c = c.nextSibling) if (c === b) return -1; return a ? 1 : -1 } function lb(a) { return function (b) { var c = b.nodeName.toLowerCase(); return "input" === c && b.type === a } } function mb(a) { return function (b) { var c = b.nodeName.toLowerCase(); return ("input" === c || "button" === c) && b.type === a } } function nb(a) { return hb(function (b) { return b = +b, hb(function (c, d) { var e, f = a([], c.length, b), g = f.length; while (g--) c[e = f[g]] && (c[e] = !(d[e] = c[e])) }) }) } function ob(a) { return a && typeof a.getElementsByTagName !== C && a } c = fb.support = {}, f = fb.isXML = function (a) { var b = a && (a.ownerDocument || a).documentElement; return b ? "HTML" !== b.nodeName : !1 }, m = fb.setDocument = function (a) { var b, e = a ? a.ownerDocument || a : v, g = e.defaultView; return e !== n && 9 === e.nodeType && e.documentElement ? (n = e, o = e.documentElement, p = !f(e), g && g !== g.top && (g.addEventListener ? g.addEventListener("unload", function () { m() }, !1) : g.attachEvent && g.attachEvent("onunload", function () { m() })), c.attributes = ib(function (a) { return a.className = "i", !a.getAttribute("className") }), c.getElementsByTagName = ib(function (a) { return a.appendChild(e.createComment("")), !a.getElementsByTagName("*").length }), c.getElementsByClassName = $.test(e.getElementsByClassName) && ib(function (a) { return a.innerHTML = "<div class='a'></div><div class='a i'></div>", a.firstChild.className = "i", 2 === a.getElementsByClassName("i").length }), c.getById = ib(function (a) { return o.appendChild(a).id = u, !e.getElementsByName || !e.getElementsByName(u).length }), c.getById ? (d.find.ID = function (a, b) { if (typeof b.getElementById !== C && p) { var c = b.getElementById(a); return c && c.parentNode ? [c] : [] } }, d.filter.ID = function (a) { var b = a.replace(cb, db); return function (a) { return a.getAttribute("id") === b } }) : (delete d.find.ID, d.filter.ID = function (a) { var b = a.replace(cb, db); return function (a) { var c = typeof a.getAttributeNode !== C && a.getAttributeNode("id"); return c && c.value === b } }), d.find.TAG = c.getElementsByTagName ? function (a, b) { return typeof b.getElementsByTagName !== C ? b.getElementsByTagName(a) : void 0 } : function (a, b) { var c, d = [], e = 0, f = b.getElementsByTagName(a); if ("*" === a) { while (c = f[e++]) 1 === c.nodeType && d.push(c); return d } return f }, d.find.CLASS = c.getElementsByClassName && function (a, b) { return typeof b.getElementsByClassName !== C && p ? b.getElementsByClassName(a) : void 0 }, r = [], q = [], (c.qsa = $.test(e.querySelectorAll)) && (ib(function (a) { a.innerHTML = "<select msallowclip=''><option selected=''></option></select>", a.querySelectorAll("[msallowclip^='']").length && q.push("[*^$]=" + M + "*(?:''|\"\")"), a.querySelectorAll("[selected]").length || q.push("\\[" + M + "*(?:value|" + L + ")"), a.querySelectorAll(":checked").length || q.push(":checked") }), ib(function (a) { var b = e.createElement("input"); b.setAttribute("type", "hidden"), a.appendChild(b).setAttribute("name", "D"), a.querySelectorAll("[name=d]").length && q.push("name" + M + "*[*^$|!~]?="), a.querySelectorAll(":enabled").length || q.push(":enabled", ":disabled"), a.querySelectorAll("*,:x"), q.push(",.*:") })), (c.matchesSelector = $.test(s = o.matches || o.webkitMatchesSelector || o.mozMatchesSelector || o.oMatchesSelector || o.msMatchesSelector)) && ib(function (a) { c.disconnectedMatch = s.call(a, "div"), s.call(a, "[s!='']:x"), r.push("!=", Q) }), q = q.length && new RegExp(q.join("|")), r = r.length && new RegExp(r.join("|")), b = $.test(o.compareDocumentPosition), t = b || $.test(o.contains) ? function (a, b) { var c = 9 === a.nodeType ? a.documentElement : a, d = b && b.parentNode; return a === d || !(!d || 1 !== d.nodeType || !(c.contains ? c.contains(d) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(d))) } : function (a, b) { if (b) while (b = b.parentNode) if (b === a) return !0; return !1 }, B = b ? function (a, b) { if (a === b) return l = !0, 0; var d = !a.compareDocumentPosition - !b.compareDocumentPosition; return d ? d : (d = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1, 1 & d || !c.sortDetached && b.compareDocumentPosition(a) === d ? a === e || a.ownerDocument === v && t(v, a) ? -1 : b === e || b.ownerDocument === v && t(v, b) ? 1 : k ? K.call(k, a) - K.call(k, b) : 0 : 4 & d ? -1 : 1) } : function (a, b) { if (a === b) return l = !0, 0; var c, d = 0, f = a.parentNode, g = b.parentNode, h = [a], i = [b]; if (!f || !g) return a === e ? -1 : b === e ? 1 : f ? -1 : g ? 1 : k ? K.call(k, a) - K.call(k, b) : 0; if (f === g) return kb(a, b); c = a; while (c = c.parentNode) h.unshift(c); c = b; while (c = c.parentNode) i.unshift(c); while (h[d] === i[d]) d++; return d ? kb(h[d], i[d]) : h[d] === v ? -1 : i[d] === v ? 1 : 0 }, e) : n }, fb.matches = function (a, b) { return fb(a, null, null, b) }, fb.matchesSelector = function (a, b) { if ((a.ownerDocument || a) !== n && m(a), b = b.replace(U, "='$1']"), !(!c.matchesSelector || !p || r && r.test(b) || q && q.test(b))) try { var d = s.call(a, b); if (d || c.disconnectedMatch || a.document && 11 !== a.document.nodeType) return d } catch (e) { } return fb(b, n, null, [a]).length > 0 }, fb.contains = function (a, b) { return (a.ownerDocument || a) !== n && m(a), t(a, b) }, fb.attr = function (a, b) { (a.ownerDocument || a) !== n && m(a); var e = d.attrHandle[b.toLowerCase()], f = e && E.call(d.attrHandle, b.toLowerCase()) ? e(a, b, !p) : void 0; return void 0 !== f ? f : c.attributes || !p ? a.getAttribute(b) : (f = a.getAttributeNode(b)) && f.specified ? f.value : null }, fb.error = function (a) { throw new Error("Syntax error, unrecognized expression: " + a) }, fb.uniqueSort = function (a) { var b, d = [], e = 0, f = 0; if (l = !c.detectDuplicates, k = !c.sortStable && a.slice(0), a.sort(B), l) { while (b = a[f++]) b === a[f] && (e = d.push(f)); while (e--) a.splice(d[e], 1) } return k = null, a }, e = fb.getText = function (a) { var b, c = "", d = 0, f = a.nodeType; if (f) { if (1 === f || 9 === f || 11 === f) { if ("string" == typeof a.textContent) return a.textContent; for (a = a.firstChild; a; a = a.nextSibling)c += e(a) } else if (3 === f || 4 === f) return a.nodeValue } else while (b = a[d++]) c += e(b); return c }, d = fb.selectors = { cacheLength: 50, createPseudo: hb, match: X, attrHandle: {}, find: {}, relative: { ">": { dir: "parentNode", first: !0 }, " ": { dir: "parentNode" }, "+": { dir: "previousSibling", first: !0 }, "~": { dir: "previousSibling" } }, preFilter: { ATTR: function (a) { return a[1] = a[1].replace(cb, db), a[3] = (a[3] || a[4] || a[5] || "").replace(cb, db), "~=" === a[2] && (a[3] = " " + a[3] + " "), a.slice(0, 4) }, CHILD: function (a) { return a[1] = a[1].toLowerCase(), "nth" === a[1].slice(0, 3) ? (a[3] || fb.error(a[0]), a[4] = +(a[4] ? a[5] + (a[6] || 1) : 2 * ("even" === a[3] || "odd" === a[3])), a[5] = +(a[7] + a[8] || "odd" === a[3])) : a[3] && fb.error(a[0]), a }, PSEUDO: function (a) { var b, c = !a[6] && a[2]; return X.CHILD.test(a[0]) ? null : (a[3] ? a[2] = a[4] || a[5] || "" : c && V.test(c) && (b = g(c, !0)) && (b = c.indexOf(")", c.length - b) - c.length) && (a[0] = a[0].slice(0, b), a[2] = c.slice(0, b)), a.slice(0, 3)) } }, filter: { TAG: function (a) { var b = a.replace(cb, db).toLowerCase(); return "*" === a ? function () { return !0 } : function (a) { return a.nodeName && a.nodeName.toLowerCase() === b } }, CLASS: function (a) { var b = y[a + " "]; return b || (b = new RegExp("(^|" + M + ")" + a + "(" + M + "|$)")) && y(a, function (a) { return b.test("string" == typeof a.className && a.className || typeof a.getAttribute !== C && a.getAttribute("class") || "") }) }, ATTR: function (a, b, c) { return function (d) { var e = fb.attr(d, a); return null == e ? "!=" === b : b ? (e += "", "=" === b ? e === c : "!=" === b ? e !== c : "^=" === b ? c && 0 === e.indexOf(c) : "*=" === b ? c && e.indexOf(c) > -1 : "$=" === b ? c && e.slice(-c.length) === c : "~=" === b ? (" " + e + " ").indexOf(c) > -1 : "|=" === b ? e === c || e.slice(0, c.length + 1) === c + "-" : !1) : !0 } }, CHILD: function (a, b, c, d, e) { var f = "nth" !== a.slice(0, 3), g = "last" !== a.slice(-4), h = "of-type" === b; return 1 === d && 0 === e ? function (a) { return !!a.parentNode } : function (b, c, i) { var j, k, l, m, n, o, p = f !== g ? "nextSibling" : "previousSibling", q = b.parentNode, r = h && b.nodeName.toLowerCase(), s = !i && !h; if (q) { if (f) { while (p) { l = b; while (l = l[p]) if (h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType) return !1; o = p = "only" === a && !o && "nextSibling" } return !0 } if (o = [g ? q.firstChild : q.lastChild], g && s) { k = q[u] || (q[u] = {}), j = k[a] || [], n = j[0] === w && j[1], m = j[0] === w && j[2], l = n && q.childNodes[n]; while (l = ++n && l && l[p] || (m = n = 0) || o.pop()) if (1 === l.nodeType && ++m && l === b) { k[a] = [w, n, m]; break } } else if (s && (j = (b[u] || (b[u] = {}))[a]) && j[0] === w) m = j[1]; else while (l = ++n && l && l[p] || (m = n = 0) || o.pop()) if ((h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType) && ++m && (s && ((l[u] || (l[u] = {}))[a] = [w, m]), l === b)) break; return m -= e, m === d || m % d === 0 && m / d >= 0 } } }, PSEUDO: function (a, b) { var c, e = d.pseudos[a] || d.setFilters[a.toLowerCase()] || fb.error("unsupported pseudo: " + a); return e[u] ? e(b) : e.length > 1 ? (c = [a, a, "", b], d.setFilters.hasOwnProperty(a.toLowerCase()) ? hb(function (a, c) { var d, f = e(a, b), g = f.length; while (g--) d = K.call(a, f[g]), a[d] = !(c[d] = f[g]) }) : function (a) { return e(a, 0, c) }) : e } }, pseudos: { not: hb(function (a) { var b = [], c = [], d = h(a.replace(R, "$1")); return d[u] ? hb(function (a, b, c, e) { var f, g = d(a, null, e, []), h = a.length; while (h--) (f = g[h]) && (a[h] = !(b[h] = f)) }) : function (a, e, f) { return b[0] = a, d(b, null, f, c), !c.pop() } }), has: hb(function (a) { return function (b) { return fb(a, b).length > 0 } }), contains: hb(function (a) { return function (b) { return (b.textContent || b.innerText || e(b)).indexOf(a) > -1 } }), lang: hb(function (a) { return W.test(a || "") || fb.error("unsupported lang: " + a), a = a.replace(cb, db).toLowerCase(), function (b) { var c; do if (c = p ? b.lang : b.getAttribute("xml:lang") || b.getAttribute("lang")) return c = c.toLowerCase(), c === a || 0 === c.indexOf(a + "-"); while ((b = b.parentNode) && 1 === b.nodeType); return !1 } }), target: function (b) { var c = a.location && a.location.hash; return c && c.slice(1) === b.id }, root: function (a) { return a === o }, focus: function (a) { return a === n.activeElement && (!n.hasFocus || n.hasFocus()) && !!(a.type || a.href || ~a.tabIndex) }, enabled: function (a) { return a.disabled === !1 }, disabled: function (a) { return a.disabled === !0 }, checked: function (a) { var b = a.nodeName.toLowerCase(); return "input" === b && !!a.checked || "option" === b && !!a.selected }, selected: function (a) { return a.parentNode && a.parentNode.selectedIndex, a.selected === !0 }, empty: function (a) { for (a = a.firstChild; a; a = a.nextSibling)if (a.nodeType < 6) return !1; return !0 }, parent: function (a) { return !d.pseudos.empty(a) }, header: function (a) { return Z.test(a.nodeName) }, input: function (a) { return Y.test(a.nodeName) }, button: function (a) { var b = a.nodeName.toLowerCase(); return "input" === b && "button" === a.type || "button" === b }, text: function (a) { var b; return "input" === a.nodeName.toLowerCase() && "text" === a.type && (null == (b = a.getAttribute("type")) || "text" === b.toLowerCase()) }, first: nb(function () { return [0] }), last: nb(function (a, b) { return [b - 1] }), eq: nb(function (a, b, c) { return [0 > c ? c + b : c] }), even: nb(function (a, b) { for (var c = 0; b > c; c += 2)a.push(c); return a }), odd: nb(function (a, b) { for (var c = 1; b > c; c += 2)a.push(c); return a }), lt: nb(function (a, b, c) { for (var d = 0 > c ? c + b : c; --d >= 0;)a.push(d); return a }), gt: nb(function (a, b, c) { for (var d = 0 > c ? c + b : c; ++d < b;)a.push(d); return a }) } }, d.pseudos.nth = d.pseudos.eq; for (b in { radio: !0, checkbox: !0, file: !0, password: !0, image: !0 }) d.pseudos[b] = lb(b); for (b in { submit: !0, reset: !0 }) d.pseudos[b] = mb(b); function pb() { } pb.prototype = d.filters = d.pseudos, d.setFilters = new pb, g = fb.tokenize = function (a, b) { var c, e, f, g, h, i, j, k = z[a + " "]; if (k) return b ? 0 : k.slice(0); h = a, i = [], j = d.preFilter; while (h) { (!c || (e = S.exec(h))) && (e && (h = h.slice(e[0].length) || h), i.push(f = [])), c = !1, (e = T.exec(h)) && (c = e.shift(), f.push({ value: c, type: e[0].replace(R, " ") }), h = h.slice(c.length)); for (g in d.filter) !(e = X[g].exec(h)) || j[g] && !(e = j[g](e)) || (c = e.shift(), f.push({ value: c, type: g, matches: e }), h = h.slice(c.length)); if (!c) break } return b ? h.length : h ? fb.error(a) : z(a, i).slice(0) }; function qb(a) { for (var b = 0, c = a.length, d = ""; c > b; b++)d += a[b].value; return d } function rb(a, b, c) { var d = b.dir, e = c && "parentNode" === d, f = x++; return b.first ? function (b, c, f) { while (b = b[d]) if (1 === b.nodeType || e) return a(b, c, f) } : function (b, c, g) { var h, i, j = [w, f]; if (g) { while (b = b[d]) if ((1 === b.nodeType || e) && a(b, c, g)) return !0 } else while (b = b[d]) if (1 === b.nodeType || e) { if (i = b[u] || (b[u] = {}), (h = i[d]) && h[0] === w && h[1] === f) return j[2] = h[2]; if (i[d] = j, j[2] = a(b, c, g)) return !0 } } } function sb(a) { return a.length > 1 ? function (b, c, d) { var e = a.length; while (e--) if (!a[e](b, c, d)) return !1; return !0 } : a[0] } function tb(a, b, c) { for (var d = 0, e = b.length; e > d; d++)fb(a, b[d], c); return c } function ub(a, b, c, d, e) { for (var f, g = [], h = 0, i = a.length, j = null != b; i > h; h++)(f = a[h]) && (!c || c(f, d, e)) && (g.push(f), j && b.push(h)); return g } function vb(a, b, c, d, e, f) { return d && !d[u] && (d = vb(d)), e && !e[u] && (e = vb(e, f)), hb(function (f, g, h, i) { var j, k, l, m = [], n = [], o = g.length, p = f || tb(b || "*", h.nodeType ? [h] : h, []), q = !a || !f && b ? p : ub(p, m, a, h, i), r = c ? e || (f ? a : o || d) ? [] : g : q; if (c && c(q, r, h, i), d) { j = ub(r, n), d(j, [], h, i), k = j.length; while (k--) (l = j[k]) && (r[n[k]] = !(q[n[k]] = l)) } if (f) { if (e || a) { if (e) { j = [], k = r.length; while (k--) (l = r[k]) && j.push(q[k] = l); e(null, r = [], j, i) } k = r.length; while (k--) (l = r[k]) && (j = e ? K.call(f, l) : m[k]) > -1 && (f[j] = !(g[j] = l)) } } else r = ub(r === g ? r.splice(o, r.length) : r), e ? e(null, g, r, i) : I.apply(g, r) }) } function wb(a) { for (var b, c, e, f = a.length, g = d.relative[a[0].type], h = g || d.relative[" "], i = g ? 1 : 0, k = rb(function (a) { return a === b }, h, !0), l = rb(function (a) { return K.call(b, a) > -1 }, h, !0), m = [function (a, c, d) { return !g && (d || c !== j) || ((b = c).nodeType ? k(a, c, d) : l(a, c, d)) }]; f > i; i++)if (c = d.relative[a[i].type]) m = [rb(sb(m), c)]; else { if (c = d.filter[a[i].type].apply(null, a[i].matches), c[u]) { for (e = ++i; f > e; e++)if (d.relative[a[e].type]) break; return vb(i > 1 && sb(m), i > 1 && qb(a.slice(0, i - 1).concat({ value: " " === a[i - 2].type ? "*" : "" })).replace(R, "$1"), c, e > i && wb(a.slice(i, e)), f > e && wb(a = a.slice(e)), f > e && qb(a)) } m.push(c) } return sb(m) } function xb(a, b) { var c = b.length > 0, e = a.length > 0, f = function (f, g, h, i, k) { var l, m, o, p = 0, q = "0", r = f && [], s = [], t = j, u = f || e && d.find.TAG("*", k), v = w += null == t ? 1 : Math.random() || .1, x = u.length; for (k && (j = g !== n && g); q !== x && null != (l = u[q]); q++) { if (e && l) { m = 0; while (o = a[m++]) if (o(l, g, h)) { i.push(l); break } k && (w = v) } c && ((l = !o && l) && p-- , f && r.push(l)) } if (p += q, c && q !== p) { m = 0; while (o = b[m++]) o(r, s, g, h); if (f) { if (p > 0) while (q--) r[q] || s[q] || (s[q] = G.call(i)); s = ub(s) } I.apply(i, s), k && !f && s.length > 0 && p + b.length > 1 && fb.uniqueSort(i) } return k && (w = v, j = t), r }; return c ? hb(f) : f } return h = fb.compile = function (a, b) { var c, d = [], e = [], f = A[a + " "]; if (!f) { b || (b = g(a)), c = b.length; while (c--) f = wb(b[c]), f[u] ? d.push(f) : e.push(f); f = A(a, xb(e, d)), f.selector = a } return f }, i = fb.select = function (a, b, e, f) { var i, j, k, l, m, n = "function" == typeof a && a, o = !f && g(a = n.selector || a); if (e = e || [], 1 === o.length) { if (j = o[0] = o[0].slice(0), j.length > 2 && "ID" === (k = j[0]).type && c.getById && 9 === b.nodeType && p && d.relative[j[1].type]) { if (b = (d.find.ID(k.matches[0].replace(cb, db), b) || [])[0], !b) return e; n && (b = b.parentNode), a = a.slice(j.shift().value.length) } i = X.needsContext.test(a) ? 0 : j.length; while (i--) { if (k = j[i], d.relative[l = k.type]) break; if ((m = d.find[l]) && (f = m(k.matches[0].replace(cb, db), ab.test(j[0].type) && ob(b.parentNode) || b))) { if (j.splice(i, 1), a = f.length && qb(j), !a) return I.apply(e, f), e; break } } } return (n || h(a, o))(f, b, !p, e, ab.test(a) && ob(b.parentNode) || b), e }, c.sortStable = u.split("").sort(B).join("") === u, c.detectDuplicates = !!l, m(), c.sortDetached = ib(function (a) { return 1 & a.compareDocumentPosition(n.createElement("div")) }), ib(function (a) { return a.innerHTML = "<a href='#'></a>", "#" === a.firstChild.getAttribute("href") }) || jb("type|href|height|width", function (a, b, c) { return c ? void 0 : a.getAttribute(b, "type" === b.toLowerCase() ? 1 : 2) }), c.attributes && ib(function (a) { return a.innerHTML = "<input/>", a.firstChild.setAttribute("value", ""), "" === a.firstChild.getAttribute("value") }) || jb("value", function (a, b, c) { return c || "input" !== a.nodeName.toLowerCase() ? void 0 : a.defaultValue }), ib(function (a) { return null == a.getAttribute("disabled") }) || jb(L, function (a, b, c) { var d; return c ? void 0 : a[b] === !0 ? b.toLowerCase() : (d = a.getAttributeNode(b)) && d.specified ? d.value : null }), fb }(a); n.find = t, n.expr = t.selectors, n.expr[":"] = n.expr.pseudos, n.unique = t.uniqueSort, n.text = t.getText, n.isXMLDoc = t.isXML, n.contains = t.contains; var u = n.expr.match.needsContext, v = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, w = /^.[^:#\[\.,]*$/; function x(a, b, c) { if (n.isFunction(b)) return n.grep(a, function (a, d) { return !!b.call(a, d, a) !== c }); if (b.nodeType) return n.grep(a, function (a) { return a === b !== c }); if ("string" == typeof b) { if (w.test(b)) return n.filter(b, a, c); b = n.filter(b, a) } return n.grep(a, function (a) { return g.call(b, a) >= 0 !== c }) } n.filter = function (a, b, c) { var d = b[0]; return c && (a = ":not(" + a + ")"), 1 === b.length && 1 === d.nodeType ? n.find.matchesSelector(d, a) ? [d] : [] : n.find.matches(a, n.grep(b, function (a) { return 1 === a.nodeType })) }, n.fn.extend({ find: function (a) { var b, c = this.length, d = [], e = this; if ("string" != typeof a) return this.pushStack(n(a).filter(function () { for (b = 0; c > b; b++)if (n.contains(e[b], this)) return !0 })); for (b = 0; c > b; b++)n.find(a, e[b], d); return d = this.pushStack(c > 1 ? n.unique(d) : d), d.selector = this.selector ? this.selector + " " + a : a, d }, filter: function (a) { return this.pushStack(x(this, a || [], !1)) }, not: function (a) { return this.pushStack(x(this, a || [], !0)) }, is: function (a) { return !!x(this, "string" == typeof a && u.test(a) ? n(a) : a || [], !1).length } }); var y, z = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/, A = n.fn.init = function (a, b) { var c, d; if (!a) return this; if ("string" == typeof a) { if (c = "<" === a[0] && ">" === a[a.length - 1] && a.length >= 3 ? [null, a, null] : z.exec(a), !c || !c[1] && b) return !b || b.jquery ? (b || y).find(a) : this.constructor(b).find(a); if (c[1]) { if (b = b instanceof n ? b[0] : b, n.merge(this, n.parseHTML(c[1], b && b.nodeType ? b.ownerDocument || b : l, !0)), v.test(c[1]) && n.isPlainObject(b)) for (c in b) n.isFunction(this[c]) ? this[c](b[c]) : this.attr(c, b[c]); return this } return d = l.getElementById(c[2]), d && d.parentNode && (this.length = 1, this[0] = d), this.context = l, this.selector = a, this } return a.nodeType ? (this.context = this[0] = a, this.length = 1, this) : n.isFunction(a) ? "undefined" != typeof y.ready ? y.ready(a) : a(n) : (void 0 !== a.selector && (this.selector = a.selector, this.context = a.context), n.makeArray(a, this)) }; A.prototype = n.fn, y = n(l); var B = /^(?:parents|prev(?:Until|All))/, C = { children: !0, contents: !0, next: !0, prev: !0 }; n.extend({ dir: function (a, b, c) { var d = [], e = void 0 !== c; while ((a = a[b]) && 9 !== a.nodeType) if (1 === a.nodeType) { if (e && n(a).is(c)) break; d.push(a) } return d }, sibling: function (a, b) { for (var c = []; a; a = a.nextSibling)1 === a.nodeType && a !== b && c.push(a); return c } }), n.fn.extend({ has: function (a) { var b = n(a, this), c = b.length; return this.filter(function () { for (var a = 0; c > a; a++)if (n.contains(this, b[a])) return !0 }) }, closest: function (a, b) { for (var c, d = 0, e = this.length, f = [], g = u.test(a) || "string" != typeof a ? n(a, b || this.context) : 0; e > d; d++)for (c = this[d]; c && c !== b; c = c.parentNode)if (c.nodeType < 11 && (g ? g.index(c) > -1 : 1 === c.nodeType && n.find.matchesSelector(c, a))) { f.push(c); break } return this.pushStack(f.length > 1 ? n.unique(f) : f) }, index: function (a) { return a ? "string" == typeof a ? g.call(n(a), this[0]) : g.call(this, a.jquery ? a[0] : a) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1 }, add: function (a, b) { return this.pushStack(n.unique(n.merge(this.get(), n(a, b)))) }, addBack: function (a) { return this.add(null == a ? this.prevObject : this.prevObject.filter(a)) } }); function D(a, b) { while ((a = a[b]) && 1 !== a.nodeType); return a } n.each({ parent: function (a) { var b = a.parentNode; return b && 11 !== b.nodeType ? b : null }, parents: function (a) { return n.dir(a, "parentNode") }, parentsUntil: function (a, b, c) { return n.dir(a, "parentNode", c) }, next: function (a) { return D(a, "nextSibling") }, prev: function (a) { return D(a, "previousSibling") }, nextAll: function (a) { return n.dir(a, "nextSibling") }, prevAll: function (a) { return n.dir(a, "previousSibling") }, nextUntil: function (a, b, c) { return n.dir(a, "nextSibling", c) }, prevUntil: function (a, b, c) { return n.dir(a, "previousSibling", c) }, siblings: function (a) { return n.sibling((a.parentNode || {}).firstChild, a) }, children: function (a) { return n.sibling(a.firstChild) }, contents: function (a) { return a.contentDocument || n.merge([], a.childNodes) } }, function (a, b) { n.fn[a] = function (c, d) { var e = n.map(this, b, c); return "Until" !== a.slice(-5) && (d = c), d && "string" == typeof d && (e = n.filter(d, e)), this.length > 1 && (C[a] || n.unique(e), B.test(a) && e.reverse()), this.pushStack(e) } }); var E = /\S+/g, F = {}; function G(a) { var b = F[a] = {}; return n.each(a.match(E) || [], function (a, c) { b[c] = !0 }), b } n.Callbacks = function (a) { a = "string" == typeof a ? F[a] || G(a) : n.extend({}, a); var b, c, d, e, f, g, h = [], i = !a.once && [], j = function (l) { for (b = a.memory && l, c = !0, g = e || 0, e = 0, f = h.length, d = !0; h && f > g; g++)if (h[g].apply(l[0], l[1]) === !1 && a.stopOnFalse) { b = !1; break } d = !1, h && (i ? i.length && j(i.shift()) : b ? h = [] : k.disable()) }, k = { add: function () { if (h) { var c = h.length; !function g(b) { n.each(b, function (b, c) { var d = n.type(c); "function" === d ? a.unique && k.has(c) || h.push(c) : c && c.length && "string" !== d && g(c) }) }(arguments), d ? f = h.length : b && (e = c, j(b)) } return this }, remove: function () { return h && n.each(arguments, function (a, b) { var c; while ((c = n.inArray(b, h, c)) > -1) h.splice(c, 1), d && (f >= c && f-- , g >= c && g--) }), this }, has: function (a) { return a ? n.inArray(a, h) > -1 : !(!h || !h.length) }, empty: function () { return h = [], f = 0, this }, disable: function () { return h = i = b = void 0, this }, disabled: function () { return !h }, lock: function () { return i = void 0, b || k.disable(), this }, locked: function () { return !i }, fireWith: function (a, b) { return !h || c && !i || (b = b || [], b = [a, b.slice ? b.slice() : b], d ? i.push(b) : j(b)), this }, fire: function () { return k.fireWith(this, arguments), this }, fired: function () { return !!c } }; return k }, n.extend({ Deferred: function (a) { var b = [["resolve", "done", n.Callbacks("once memory"), "resolved"], ["reject", "fail", n.Callbacks("once memory"), "rejected"], ["notify", "progress", n.Callbacks("memory")]], c = "pending", d = { state: function () { return c }, always: function () { return e.done(arguments).fail(arguments), this }, then: function () { var a = arguments; return n.Deferred(function (c) { n.each(b, function (b, f) { var g = n.isFunction(a[b]) && a[b]; e[f[1]](function () { var a = g && g.apply(this, arguments); a && n.isFunction(a.promise) ? a.promise().done(c.resolve).fail(c.reject).progress(c.notify) : c[f[0] + "With"](this === d ? c.promise() : this, g ? [a] : arguments) }) }), a = null }).promise() }, promise: function (a) { return null != a ? n.extend(a, d) : d } }, e = {}; return d.pipe = d.then, n.each(b, function (a, f) { var g = f[2], h = f[3]; d[f[1]] = g.add, h && g.add(function () { c = h }, b[1 ^ a][2].disable, b[2][2].lock), e[f[0]] = function () { return e[f[0] + "With"](this === e ? d : this, arguments), this }, e[f[0] + "With"] = g.fireWith }), d.promise(e), a && a.call(e, e), e }, when: function (a) { var b = 0, c = d.call(arguments), e = c.length, f = 1 !== e || a && n.isFunction(a.promise) ? e : 0, g = 1 === f ? a : n.Deferred(), h = function (a, b, c) { return function (e) { b[a] = this, c[a] = arguments.length > 1 ? d.call(arguments) : e, c === i ? g.notifyWith(b, c) : --f || g.resolveWith(b, c) } }, i, j, k; if (e > 1) for (i = new Array(e), j = new Array(e), k = new Array(e); e > b; b++)c[b] && n.isFunction(c[b].promise) ? c[b].promise().done(h(b, k, c)).fail(g.reject).progress(h(b, j, i)) : --f; return f || g.resolveWith(k, c), g.promise() } }); var H; n.fn.ready = function (a) { return n.ready.promise().done(a), this }, n.extend({ isReady: !1, readyWait: 1, holdReady: function (a) { a ? n.readyWait++ : n.ready(!0) }, ready: function (a) { (a === !0 ? --n.readyWait : n.isReady) || (n.isReady = !0, a !== !0 && --n.readyWait > 0 || (H.resolveWith(l, [n]), n.fn.triggerHandler && (n(l).triggerHandler("ready"), n(l).off("ready")))) } }); function I() { l.removeEventListener("DOMContentLoaded", I, !1), a.removeEventListener("load", I, !1), n.ready() } n.ready.promise = function (b) { return H || (H = n.Deferred(), "complete" === l.readyState ? setTimeout(n.ready) : (l.addEventListener("DOMContentLoaded", I, !1), a.addEventListener("load", I, !1))), H.promise(b) }, n.ready.promise(); var J = n.access = function (a, b, c, d, e, f, g) { var h = 0, i = a.length, j = null == c; if ("object" === n.type(c)) { e = !0; for (h in c) n.access(a, b, h, c[h], !0, f, g) } else if (void 0 !== d && (e = !0, n.isFunction(d) || (g = !0), j && (g ? (b.call(a, d), b = null) : (j = b, b = function (a, b, c) { return j.call(n(a), c) })), b)) for (; i > h; h++)b(a[h], c, g ? d : d.call(a[h], h, b(a[h], c))); return e ? a : j ? b.call(a) : i ? b(a[0], c) : f }; n.acceptData = function (a) { return 1 === a.nodeType || 9 === a.nodeType || !+a.nodeType }; function K() { Object.defineProperty(this.cache = {}, 0, { get: function () { return {} } }), this.expando = n.expando + Math.random() } K.uid = 1, K.accepts = n.acceptData, K.prototype = { key: function (a) { if (!K.accepts(a)) return 0; var b = {}, c = a[this.expando]; if (!c) { c = K.uid++; try { b[this.expando] = { value: c }, Object.defineProperties(a, b) } catch (d) { b[this.expando] = c, n.extend(a, b) } } return this.cache[c] || (this.cache[c] = {}), c }, set: function (a, b, c) { var d, e = this.key(a), f = this.cache[e]; if ("string" == typeof b) f[b] = c; else if (n.isEmptyObject(f)) n.extend(this.cache[e], b); else for (d in b) f[d] = b[d]; return f }, get: function (a, b) { var c = this.cache[this.key(a)]; return void 0 === b ? c : c[b] }, access: function (a, b, c) { var d; return void 0 === b || b && "string" == typeof b && void 0 === c ? (d = this.get(a, b), void 0 !== d ? d : this.get(a, n.camelCase(b))) : (this.set(a, b, c), void 0 !== c ? c : b) }, remove: function (a, b) { var c, d, e, f = this.key(a), g = this.cache[f]; if (void 0 === b) this.cache[f] = {}; else { n.isArray(b) ? d = b.concat(b.map(n.camelCase)) : (e = n.camelCase(b), b in g ? d = [b, e] : (d = e, d = d in g ? [d] : d.match(E) || [])), c = d.length; while (c--) delete g[d[c]] } }, hasData: function (a) { return !n.isEmptyObject(this.cache[a[this.expando]] || {}) }, discard: function (a) { a[this.expando] && delete this.cache[a[this.expando]] } }; var L = new K, M = new K, N = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, O = /([A-Z])/g; function P(a, b, c) { var d; if (void 0 === c && 1 === a.nodeType) if (d = "data-" + b.replace(O, "-$1").toLowerCase(), c = a.getAttribute(d), "string" == typeof c) { try { c = "true" === c ? !0 : "false" === c ? !1 : "null" === c ? null : +c + "" === c ? +c : N.test(c) ? n.parseJSON(c) : c } catch (e) { } M.set(a, b, c) } else c = void 0; return c } n.extend({
        hasData: function (a) { return M.hasData(a) || L.hasData(a) }, data: function (a, b, c) { return M.access(a, b, c) }, removeData: function (a, b) {
            M.remove(a, b)
        }, _data: function (a, b, c) { return L.access(a, b, c) }, _removeData: function (a, b) { L.remove(a, b) }
    }), n.fn.extend({ data: function (a, b) { var c, d, e, f = this[0], g = f && f.attributes; if (void 0 === a) { if (this.length && (e = M.get(f), 1 === f.nodeType && !L.get(f, "hasDataAttrs"))) { c = g.length; while (c--) g[c] && (d = g[c].name, 0 === d.indexOf("data-") && (d = n.camelCase(d.slice(5)), P(f, d, e[d]))); L.set(f, "hasDataAttrs", !0) } return e } return "object" == typeof a ? this.each(function () { M.set(this, a) }) : J(this, function (b) { var c, d = n.camelCase(a); if (f && void 0 === b) { if (c = M.get(f, a), void 0 !== c) return c; if (c = M.get(f, d), void 0 !== c) return c; if (c = P(f, d, void 0), void 0 !== c) return c } else this.each(function () { var c = M.get(this, d); M.set(this, d, b), -1 !== a.indexOf("-") && void 0 !== c && M.set(this, a, b) }) }, null, b, arguments.length > 1, null, !0) }, removeData: function (a) { return this.each(function () { M.remove(this, a) }) } }), n.extend({ queue: function (a, b, c) { var d; return a ? (b = (b || "fx") + "queue", d = L.get(a, b), c && (!d || n.isArray(c) ? d = L.access(a, b, n.makeArray(c)) : d.push(c)), d || []) : void 0 }, dequeue: function (a, b) { b = b || "fx"; var c = n.queue(a, b), d = c.length, e = c.shift(), f = n._queueHooks(a, b), g = function () { n.dequeue(a, b) }; "inprogress" === e && (e = c.shift(), d--), e && ("fx" === b && c.unshift("inprogress"), delete f.stop, e.call(a, g, f)), !d && f && f.empty.fire() }, _queueHooks: function (a, b) { var c = b + "queueHooks"; return L.get(a, c) || L.access(a, c, { empty: n.Callbacks("once memory").add(function () { L.remove(a, [b + "queue", c]) }) }) } }), n.fn.extend({ queue: function (a, b) { var c = 2; return "string" != typeof a && (b = a, a = "fx", c--), arguments.length < c ? n.queue(this[0], a) : void 0 === b ? this : this.each(function () { var c = n.queue(this, a, b); n._queueHooks(this, a), "fx" === a && "inprogress" !== c[0] && n.dequeue(this, a) }) }, dequeue: function (a) { return this.each(function () { n.dequeue(this, a) }) }, clearQueue: function (a) { return this.queue(a || "fx", []) }, promise: function (a, b) { var c, d = 1, e = n.Deferred(), f = this, g = this.length, h = function () { --d || e.resolveWith(f, [f]) }; "string" != typeof a && (b = a, a = void 0), a = a || "fx"; while (g--) c = L.get(f[g], a + "queueHooks"), c && c.empty && (d++ , c.empty.add(h)); return h(), e.promise(b) } }); var Q = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, R = ["Top", "Right", "Bottom", "Left"], S = function (a, b) { return a = b || a, "none" === n.css(a, "display") || !n.contains(a.ownerDocument, a) }, T = /^(?:checkbox|radio)$/i; !function () { var a = l.createDocumentFragment(), b = a.appendChild(l.createElement("div")), c = l.createElement("input"); c.setAttribute("type", "radio"), c.setAttribute("checked", "checked"), c.setAttribute("name", "t"), b.appendChild(c), k.checkClone = b.cloneNode(!0).cloneNode(!0).lastChild.checked, b.innerHTML = "<textarea>x</textarea>", k.noCloneChecked = !!b.cloneNode(!0).lastChild.defaultValue }(); var U = "undefined"; k.focusinBubbles = "onfocusin" in a; var V = /^key/, W = /^(?:mouse|pointer|contextmenu)|click/, X = /^(?:focusinfocus|focusoutblur)$/, Y = /^([^.]*)(?:\.(.+)|)$/; function Z() { return !0 } function $() { return !1 } function _() { try { return l.activeElement } catch (a) { } } n.event = { global: {}, add: function (a, b, c, d, e) { var f, g, h, i, j, k, l, m, o, p, q, r = L.get(a); if (r) { c.handler && (f = c, c = f.handler, e = f.selector), c.guid || (c.guid = n.guid++), (i = r.events) || (i = r.events = {}), (g = r.handle) || (g = r.handle = function (b) { return typeof n !== U && n.event.triggered !== b.type ? n.event.dispatch.apply(a, arguments) : void 0 }), b = (b || "").match(E) || [""], j = b.length; while (j--) h = Y.exec(b[j]) || [], o = q = h[1], p = (h[2] || "").split(".").sort(), o && (l = n.event.special[o] || {}, o = (e ? l.delegateType : l.bindType) || o, l = n.event.special[o] || {}, k = n.extend({ type: o, origType: q, data: d, handler: c, guid: c.guid, selector: e, needsContext: e && n.expr.match.needsContext.test(e), namespace: p.join(".") }, f), (m = i[o]) || (m = i[o] = [], m.delegateCount = 0, l.setup && l.setup.call(a, d, p, g) !== !1 || a.addEventListener && a.addEventListener(o, g, !1)), l.add && (l.add.call(a, k), k.handler.guid || (k.handler.guid = c.guid)), e ? m.splice(m.delegateCount++, 0, k) : m.push(k), n.event.global[o] = !0) } }, remove: function (a, b, c, d, e) { var f, g, h, i, j, k, l, m, o, p, q, r = L.hasData(a) && L.get(a); if (r && (i = r.events)) { b = (b || "").match(E) || [""], j = b.length; while (j--) if (h = Y.exec(b[j]) || [], o = q = h[1], p = (h[2] || "").split(".").sort(), o) { l = n.event.special[o] || {}, o = (d ? l.delegateType : l.bindType) || o, m = i[o] || [], h = h[2] && new RegExp("(^|\\.)" + p.join("\\.(?:.*\\.|)") + "(\\.|$)"), g = f = m.length; while (f--) k = m[f], !e && q !== k.origType || c && c.guid !== k.guid || h && !h.test(k.namespace) || d && d !== k.selector && ("**" !== d || !k.selector) || (m.splice(f, 1), k.selector && m.delegateCount-- , l.remove && l.remove.call(a, k)); g && !m.length && (l.teardown && l.teardown.call(a, p, r.handle) !== !1 || n.removeEvent(a, o, r.handle), delete i[o]) } else for (o in i) n.event.remove(a, o + b[j], c, d, !0); n.isEmptyObject(i) && (delete r.handle, L.remove(a, "events")) } }, trigger: function (b, c, d, e) { var f, g, h, i, k, m, o, p = [d || l], q = j.call(b, "type") ? b.type : b, r = j.call(b, "namespace") ? b.namespace.split(".") : []; if (g = h = d = d || l, 3 !== d.nodeType && 8 !== d.nodeType && !X.test(q + n.event.triggered) && (q.indexOf(".") >= 0 && (r = q.split("."), q = r.shift(), r.sort()), k = q.indexOf(":") < 0 && "on" + q, b = b[n.expando] ? b : new n.Event(q, "object" == typeof b && b), b.isTrigger = e ? 2 : 3, b.namespace = r.join("."), b.namespace_re = b.namespace ? new RegExp("(^|\\.)" + r.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, b.result = void 0, b.target || (b.target = d), c = null == c ? [b] : n.makeArray(c, [b]), o = n.event.special[q] || {}, e || !o.trigger || o.trigger.apply(d, c) !== !1)) { if (!e && !o.noBubble && !n.isWindow(d)) { for (i = o.delegateType || q, X.test(i + q) || (g = g.parentNode); g; g = g.parentNode)p.push(g), h = g; h === (d.ownerDocument || l) && p.push(h.defaultView || h.parentWindow || a) } f = 0; while ((g = p[f++]) && !b.isPropagationStopped()) b.type = f > 1 ? i : o.bindType || q, m = (L.get(g, "events") || {})[b.type] && L.get(g, "handle"), m && m.apply(g, c), m = k && g[k], m && m.apply && n.acceptData(g) && (b.result = m.apply(g, c), b.result === !1 && b.preventDefault()); return b.type = q, e || b.isDefaultPrevented() || o._default && o._default.apply(p.pop(), c) !== !1 || !n.acceptData(d) || k && n.isFunction(d[q]) && !n.isWindow(d) && (h = d[k], h && (d[k] = null), n.event.triggered = q, d[q](), n.event.triggered = void 0, h && (d[k] = h)), b.result } }, dispatch: function (a) { a = n.event.fix(a); var b, c, e, f, g, h = [], i = d.call(arguments), j = (L.get(this, "events") || {})[a.type] || [], k = n.event.special[a.type] || {}; if (i[0] = a, a.delegateTarget = this, !k.preDispatch || k.preDispatch.call(this, a) !== !1) { h = n.event.handlers.call(this, a, j), b = 0; while ((f = h[b++]) && !a.isPropagationStopped()) { a.currentTarget = f.elem, c = 0; while ((g = f.handlers[c++]) && !a.isImmediatePropagationStopped()) (!a.namespace_re || a.namespace_re.test(g.namespace)) && (a.handleObj = g, a.data = g.data, e = ((n.event.special[g.origType] || {}).handle || g.handler).apply(f.elem, i), void 0 !== e && (a.result = e) === !1 && (a.preventDefault(), a.stopPropagation())) } return k.postDispatch && k.postDispatch.call(this, a), a.result } }, handlers: function (a, b) { var c, d, e, f, g = [], h = b.delegateCount, i = a.target; if (h && i.nodeType && (!a.button || "click" !== a.type)) for (; i !== this; i = i.parentNode || this)if (i.disabled !== !0 || "click" !== a.type) { for (d = [], c = 0; h > c; c++)f = b[c], e = f.selector + " ", void 0 === d[e] && (d[e] = f.needsContext ? n(e, this).index(i) >= 0 : n.find(e, this, null, [i]).length), d[e] && d.push(f); d.length && g.push({ elem: i, handlers: d }) } return h < b.length && g.push({ elem: this, handlers: b.slice(h) }), g }, props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "), fixHooks: {}, keyHooks: { props: "char charCode key keyCode".split(" "), filter: function (a, b) { return null == a.which && (a.which = null != b.charCode ? b.charCode : b.keyCode), a } }, mouseHooks: { props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "), filter: function (a, b) { var c, d, e, f = b.button; return null == a.pageX && null != b.clientX && (c = a.target.ownerDocument || l, d = c.documentElement, e = c.body, a.pageX = b.clientX + (d && d.scrollLeft || e && e.scrollLeft || 0) - (d && d.clientLeft || e && e.clientLeft || 0), a.pageY = b.clientY + (d && d.scrollTop || e && e.scrollTop || 0) - (d && d.clientTop || e && e.clientTop || 0)), a.which || void 0 === f || (a.which = 1 & f ? 1 : 2 & f ? 3 : 4 & f ? 2 : 0), a } }, fix: function (a) { if (a[n.expando]) return a; var b, c, d, e = a.type, f = a, g = this.fixHooks[e]; g || (this.fixHooks[e] = g = W.test(e) ? this.mouseHooks : V.test(e) ? this.keyHooks : {}), d = g.props ? this.props.concat(g.props) : this.props, a = new n.Event(f), b = d.length; while (b--) c = d[b], a[c] = f[c]; return a.target || (a.target = l), 3 === a.target.nodeType && (a.target = a.target.parentNode), g.filter ? g.filter(a, f) : a }, special: { load: { noBubble: !0 }, focus: { trigger: function () { return this !== _() && this.focus ? (this.focus(), !1) : void 0 }, delegateType: "focusin" }, blur: { trigger: function () { return this === _() && this.blur ? (this.blur(), !1) : void 0 }, delegateType: "focusout" }, click: { trigger: function () { return "checkbox" === this.type && this.click && n.nodeName(this, "input") ? (this.click(), !1) : void 0 }, _default: function (a) { return n.nodeName(a.target, "a") } }, beforeunload: { postDispatch: function (a) { void 0 !== a.result && a.originalEvent && (a.originalEvent.returnValue = a.result) } } }, simulate: function (a, b, c, d) { var e = n.extend(new n.Event, c, { type: a, isSimulated: !0, originalEvent: {} }); d ? n.event.trigger(e, null, b) : n.event.dispatch.call(b, e), e.isDefaultPrevented() && c.preventDefault() } }, n.removeEvent = function (a, b, c) { a.removeEventListener && a.removeEventListener(b, c, !1) }, n.Event = function (a, b) { return this instanceof n.Event ? (a && a.type ? (this.originalEvent = a, this.type = a.type, this.isDefaultPrevented = a.defaultPrevented || void 0 === a.defaultPrevented && a.returnValue === !1 ? Z : $) : this.type = a, b && n.extend(this, b), this.timeStamp = a && a.timeStamp || n.now(), void (this[n.expando] = !0)) : new n.Event(a, b) }, n.Event.prototype = { isDefaultPrevented: $, isPropagationStopped: $, isImmediatePropagationStopped: $, preventDefault: function () { var a = this.originalEvent; this.isDefaultPrevented = Z, a && a.preventDefault && a.preventDefault() }, stopPropagation: function () { var a = this.originalEvent; this.isPropagationStopped = Z, a && a.stopPropagation && a.stopPropagation() }, stopImmediatePropagation: function () { var a = this.originalEvent; this.isImmediatePropagationStopped = Z, a && a.stopImmediatePropagation && a.stopImmediatePropagation(), this.stopPropagation() } }, n.each({ mouseenter: "mouseover", mouseleave: "mouseout", pointerenter: "pointerover", pointerleave: "pointerout" }, function (a, b) { n.event.special[a] = { delegateType: b, bindType: b, handle: function (a) { var c, d = this, e = a.relatedTarget, f = a.handleObj; return (!e || e !== d && !n.contains(d, e)) && (a.type = f.origType, c = f.handler.apply(this, arguments), a.type = b), c } } }), k.focusinBubbles || n.each({ focus: "focusin", blur: "focusout" }, function (a, b) { var c = function (a) { n.event.simulate(b, a.target, n.event.fix(a), !0) }; n.event.special[b] = { setup: function () { var d = this.ownerDocument || this, e = L.access(d, b); e || d.addEventListener(a, c, !0), L.access(d, b, (e || 0) + 1) }, teardown: function () { var d = this.ownerDocument || this, e = L.access(d, b) - 1; e ? L.access(d, b, e) : (d.removeEventListener(a, c, !0), L.remove(d, b)) } } }), n.fn.extend({ on: function (a, b, c, d, e) { var f, g; if ("object" == typeof a) { "string" != typeof b && (c = c || b, b = void 0); for (g in a) this.on(g, b, c, a[g], e); return this } if (null == c && null == d ? (d = b, c = b = void 0) : null == d && ("string" == typeof b ? (d = c, c = void 0) : (d = c, c = b, b = void 0)), d === !1) d = $; else if (!d) return this; return 1 === e && (f = d, d = function (a) { return n().off(a), f.apply(this, arguments) }, d.guid = f.guid || (f.guid = n.guid++)), this.each(function () { n.event.add(this, a, d, c, b) }) }, one: function (a, b, c, d) { return this.on(a, b, c, d, 1) }, off: function (a, b, c) { var d, e; if (a && a.preventDefault && a.handleObj) return d = a.handleObj, n(a.delegateTarget).off(d.namespace ? d.origType + "." + d.namespace : d.origType, d.selector, d.handler), this; if ("object" == typeof a) { for (e in a) this.off(e, b, a[e]); return this } return (b === !1 || "function" == typeof b) && (c = b, b = void 0), c === !1 && (c = $), this.each(function () { n.event.remove(this, a, c, b) }) }, trigger: function (a, b) { return this.each(function () { n.event.trigger(a, b, this) }) }, triggerHandler: function (a, b) { var c = this[0]; return c ? n.event.trigger(a, b, c, !0) : void 0 } }); var ab = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, bb = /<([\w:]+)/, cb = /<|&#?\w+;/, db = /<(?:script|style|link)/i, eb = /checked\s*(?:[^=]|=\s*.checked.)/i, fb = /^$|\/(?:java|ecma)script/i, gb = /^true\/(.*)/, hb = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g, ib = { option: [1, "<select multiple='multiple'>", "</select>"], thead: [1, "<table>", "</table>"], col: [2, "<table><colgroup>", "</colgroup></table>"], tr: [2, "<table><tbody>", "</tbody></table>"], td: [3, "<table><tbody><tr>", "</tr></tbody></table>"], _default: [0, "", ""] }; ib.optgroup = ib.option, ib.tbody = ib.tfoot = ib.colgroup = ib.caption = ib.thead, ib.th = ib.td; function jb(a, b) { return n.nodeName(a, "table") && n.nodeName(11 !== b.nodeType ? b : b.firstChild, "tr") ? a.getElementsByTagName("tbody")[0] || a.appendChild(a.ownerDocument.createElement("tbody")) : a } function kb(a) { return a.type = (null !== a.getAttribute("type")) + "/" + a.type, a } function lb(a) { var b = gb.exec(a.type); return b ? a.type = b[1] : a.removeAttribute("type"), a } function mb(a, b) { for (var c = 0, d = a.length; d > c; c++)L.set(a[c], "globalEval", !b || L.get(b[c], "globalEval")) } function nb(a, b) { var c, d, e, f, g, h, i, j; if (1 === b.nodeType) { if (L.hasData(a) && (f = L.access(a), g = L.set(b, f), j = f.events)) { delete g.handle, g.events = {}; for (e in j) for (c = 0, d = j[e].length; d > c; c++)n.event.add(b, e, j[e][c]) } M.hasData(a) && (h = M.access(a), i = n.extend({}, h), M.set(b, i)) } } function ob(a, b) { var c = a.getElementsByTagName ? a.getElementsByTagName(b || "*") : a.querySelectorAll ? a.querySelectorAll(b || "*") : []; return void 0 === b || b && n.nodeName(a, b) ? n.merge([a], c) : c } function pb(a, b) { var c = b.nodeName.toLowerCase(); "input" === c && T.test(a.type) ? b.checked = a.checked : ("input" === c || "textarea" === c) && (b.defaultValue = a.defaultValue) } n.extend({ clone: function (a, b, c) { var d, e, f, g, h = a.cloneNode(!0), i = n.contains(a.ownerDocument, a); if (!(k.noCloneChecked || 1 !== a.nodeType && 11 !== a.nodeType || n.isXMLDoc(a))) for (g = ob(h), f = ob(a), d = 0, e = f.length; e > d; d++)pb(f[d], g[d]); if (b) if (c) for (f = f || ob(a), g = g || ob(h), d = 0, e = f.length; e > d; d++)nb(f[d], g[d]); else nb(a, h); return g = ob(h, "script"), g.length > 0 && mb(g, !i && ob(a, "script")), h }, buildFragment: function (a, b, c, d) { for (var e, f, g, h, i, j, k = b.createDocumentFragment(), l = [], m = 0, o = a.length; o > m; m++)if (e = a[m], e || 0 === e) if ("object" === n.type(e)) n.merge(l, e.nodeType ? [e] : e); else if (cb.test(e)) { f = f || k.appendChild(b.createElement("div")), g = (bb.exec(e) || ["", ""])[1].toLowerCase(), h = ib[g] || ib._default, f.innerHTML = h[1] + e.replace(ab, "<$1></$2>") + h[2], j = h[0]; while (j--) f = f.lastChild; n.merge(l, f.childNodes), f = k.firstChild, f.textContent = "" } else l.push(b.createTextNode(e)); k.textContent = "", m = 0; while (e = l[m++]) if ((!d || -1 === n.inArray(e, d)) && (i = n.contains(e.ownerDocument, e), f = ob(k.appendChild(e), "script"), i && mb(f), c)) { j = 0; while (e = f[j++]) fb.test(e.type || "") && c.push(e) } return k }, cleanData: function (a) { for (var b, c, d, e, f = n.event.special, g = 0; void 0 !== (c = a[g]); g++) { if (n.acceptData(c) && (e = c[L.expando], e && (b = L.cache[e]))) { if (b.events) for (d in b.events) f[d] ? n.event.remove(c, d) : n.removeEvent(c, d, b.handle); L.cache[e] && delete L.cache[e] } delete M.cache[c[M.expando]] } } }), n.fn.extend({ text: function (a) { return J(this, function (a) { return void 0 === a ? n.text(this) : this.empty().each(function () { (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) && (this.textContent = a) }) }, null, a, arguments.length) }, append: function () { return this.domManip(arguments, function (a) { if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) { var b = jb(this, a); b.appendChild(a) } }) }, prepend: function () { return this.domManip(arguments, function (a) { if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) { var b = jb(this, a); b.insertBefore(a, b.firstChild) } }) }, before: function () { return this.domManip(arguments, function (a) { this.parentNode && this.parentNode.insertBefore(a, this) }) }, after: function () { return this.domManip(arguments, function (a) { this.parentNode && this.parentNode.insertBefore(a, this.nextSibling) }) }, remove: function (a, b) { for (var c, d = a ? n.filter(a, this) : this, e = 0; null != (c = d[e]); e++)b || 1 !== c.nodeType || n.cleanData(ob(c)), c.parentNode && (b && n.contains(c.ownerDocument, c) && mb(ob(c, "script")), c.parentNode.removeChild(c)); return this }, empty: function () { for (var a, b = 0; null != (a = this[b]); b++)1 === a.nodeType && (n.cleanData(ob(a, !1)), a.textContent = ""); return this }, clone: function (a, b) { return a = null == a ? !1 : a, b = null == b ? a : b, this.map(function () { return n.clone(this, a, b) }) }, html: function (a) { return J(this, function (a) { var b = this[0] || {}, c = 0, d = this.length; if (void 0 === a && 1 === b.nodeType) return b.innerHTML; if ("string" == typeof a && !db.test(a) && !ib[(bb.exec(a) || ["", ""])[1].toLowerCase()]) { a = a.replace(ab, "<$1></$2>"); try { for (; d > c; c++)b = this[c] || {}, 1 === b.nodeType && (n.cleanData(ob(b, !1)), b.innerHTML = a); b = 0 } catch (e) { } } b && this.empty().append(a) }, null, a, arguments.length) }, replaceWith: function () { var a = arguments[0]; return this.domManip(arguments, function (b) { a = this.parentNode, n.cleanData(ob(this)), a && a.replaceChild(b, this) }), a && (a.length || a.nodeType) ? this : this.remove() }, detach: function (a) { return this.remove(a, !0) }, domManip: function (a, b) { a = e.apply([], a); var c, d, f, g, h, i, j = 0, l = this.length, m = this, o = l - 1, p = a[0], q = n.isFunction(p); if (q || l > 1 && "string" == typeof p && !k.checkClone && eb.test(p)) return this.each(function (c) { var d = m.eq(c); q && (a[0] = p.call(this, c, d.html())), d.domManip(a, b) }); if (l && (c = n.buildFragment(a, this[0].ownerDocument, !1, this), d = c.firstChild, 1 === c.childNodes.length && (c = d), d)) { for (f = n.map(ob(c, "script"), kb), g = f.length; l > j; j++)h = c, j !== o && (h = n.clone(h, !0, !0), g && n.merge(f, ob(h, "script"))), b.call(this[j], h, j); if (g) for (i = f[f.length - 1].ownerDocument, n.map(f, lb), j = 0; g > j; j++)h = f[j], fb.test(h.type || "") && !L.access(h, "globalEval") && n.contains(i, h) && (h.src ? n._evalUrl && n._evalUrl(h.src) : n.globalEval(h.textContent.replace(hb, ""))) } return this } }), n.each({ appendTo: "append", prependTo: "prepend", insertBefore: "before", insertAfter: "after", replaceAll: "replaceWith" }, function (a, b) { n.fn[a] = function (a) { for (var c, d = [], e = n(a), g = e.length - 1, h = 0; g >= h; h++)c = h === g ? this : this.clone(!0), n(e[h])[b](c), f.apply(d, c.get()); return this.pushStack(d) } }); var qb, rb = {}; function sb(b, c) { var d, e = n(c.createElement(b)).appendTo(c.body), f = a.getDefaultComputedStyle && (d = a.getDefaultComputedStyle(e[0])) ? d.display : n.css(e[0], "display"); return e.detach(), f } function tb(a) { var b = l, c = rb[a]; return c || (c = sb(a, b), "none" !== c && c || (qb = (qb || n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement), b = qb[0].contentDocument, b.write(), b.close(), c = sb(a, b), qb.detach()), rb[a] = c), c } var ub = /^margin/, vb = new RegExp("^(" + Q + ")(?!px)[a-z%]+$", "i"), wb = function (a) { return a.ownerDocument.defaultView.getComputedStyle(a, null) }; function xb(a, b, c) { var d, e, f, g, h = a.style; return c = c || wb(a), c && (g = c.getPropertyValue(b) || c[b]), c && ("" !== g || n.contains(a.ownerDocument, a) || (g = n.style(a, b)), vb.test(g) && ub.test(b) && (d = h.width, e = h.minWidth, f = h.maxWidth, h.minWidth = h.maxWidth = h.width = g, g = c.width, h.width = d, h.minWidth = e, h.maxWidth = f)), void 0 !== g ? g + "" : g } function yb(a, b) { return { get: function () { return a() ? void delete this.get : (this.get = b).apply(this, arguments) } } } !function () { var b, c, d = l.documentElement, e = l.createElement("div"), f = l.createElement("div"); if (f.style) { f.style.backgroundClip = "content-box", f.cloneNode(!0).style.backgroundClip = "", k.clearCloneStyle = "content-box" === f.style.backgroundClip, e.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute", e.appendChild(f); function g() { f.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute", f.innerHTML = "", d.appendChild(e); var g = a.getComputedStyle(f, null); b = "1%" !== g.top, c = "4px" === g.width, d.removeChild(e) } a.getComputedStyle && n.extend(k, { pixelPosition: function () { return g(), b }, boxSizingReliable: function () { return null == c && g(), c }, reliableMarginRight: function () { var b, c = f.appendChild(l.createElement("div")); return c.style.cssText = f.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0", c.style.marginRight = c.style.width = "0", f.style.width = "1px", d.appendChild(e), b = !parseFloat(a.getComputedStyle(c, null).marginRight), d.removeChild(e), b } }) } }(), n.swap = function (a, b, c, d) { var e, f, g = {}; for (f in b) g[f] = a.style[f], a.style[f] = b[f]; e = c.apply(a, d || []); for (f in b) a.style[f] = g[f]; return e }; var zb = /^(none|table(?!-c[ea]).+)/, Ab = new RegExp("^(" + Q + ")(.*)$", "i"), Bb = new RegExp("^([+-])=(" + Q + ")", "i"), Cb = { position: "absolute", visibility: "hidden", display: "block" }, Db = { letterSpacing: "0", fontWeight: "400" }, Eb = ["Webkit", "O", "Moz", "ms"]; function Fb(a, b) { if (b in a) return b; var c = b[0].toUpperCase() + b.slice(1), d = b, e = Eb.length; while (e--) if (b = Eb[e] + c, b in a) return b; return d } function Gb(a, b, c) { var d = Ab.exec(b); return d ? Math.max(0, d[1] - (c || 0)) + (d[2] || "px") : b } function Hb(a, b, c, d, e) { for (var f = c === (d ? "border" : "content") ? 4 : "width" === b ? 1 : 0, g = 0; 4 > f; f += 2)"margin" === c && (g += n.css(a, c + R[f], !0, e)), d ? ("content" === c && (g -= n.css(a, "padding" + R[f], !0, e)), "margin" !== c && (g -= n.css(a, "border" + R[f] + "Width", !0, e))) : (g += n.css(a, "padding" + R[f], !0, e), "padding" !== c && (g += n.css(a, "border" + R[f] + "Width", !0, e))); return g } function Ib(a, b, c) { var d = !0, e = "width" === b ? a.offsetWidth : a.offsetHeight, f = wb(a), g = "border-box" === n.css(a, "boxSizing", !1, f); if (0 >= e || null == e) { if (e = xb(a, b, f), (0 > e || null == e) && (e = a.style[b]), vb.test(e)) return e; d = g && (k.boxSizingReliable() || e === a.style[b]), e = parseFloat(e) || 0 } return e + Hb(a, b, c || (g ? "border" : "content"), d, f) + "px" } function Jb(a, b) { for (var c, d, e, f = [], g = 0, h = a.length; h > g; g++)d = a[g], d.style && (f[g] = L.get(d, "olddisplay"), c = d.style.display, b ? (f[g] || "none" !== c || (d.style.display = ""), "" === d.style.display && S(d) && (f[g] = L.access(d, "olddisplay", tb(d.nodeName)))) : (e = S(d), "none" === c && e || L.set(d, "olddisplay", e ? c : n.css(d, "display")))); for (g = 0; h > g; g++)d = a[g], d.style && (b && "none" !== d.style.display && "" !== d.style.display || (d.style.display = b ? f[g] || "" : "none")); return a } n.extend({ cssHooks: { opacity: { get: function (a, b) { if (b) { var c = xb(a, "opacity"); return "" === c ? "1" : c } } } }, cssNumber: { columnCount: !0, fillOpacity: !0, flexGrow: !0, flexShrink: !0, fontWeight: !0, lineHeight: !0, opacity: !0, order: !0, orphans: !0, widows: !0, zIndex: !0, zoom: !0 }, cssProps: { "float": "cssFloat" }, style: function (a, b, c, d) { if (a && 3 !== a.nodeType && 8 !== a.nodeType && a.style) { var e, f, g, h = n.camelCase(b), i = a.style; return b = n.cssProps[h] || (n.cssProps[h] = Fb(i, h)), g = n.cssHooks[b] || n.cssHooks[h], void 0 === c ? g && "get" in g && void 0 !== (e = g.get(a, !1, d)) ? e : i[b] : (f = typeof c, "string" === f && (e = Bb.exec(c)) && (c = (e[1] + 1) * e[2] + parseFloat(n.css(a, b)), f = "number"), null != c && c === c && ("number" !== f || n.cssNumber[h] || (c += "px"), k.clearCloneStyle || "" !== c || 0 !== b.indexOf("background") || (i[b] = "inherit"), g && "set" in g && void 0 === (c = g.set(a, c, d)) || (i[b] = c)), void 0) } }, css: function (a, b, c, d) { var e, f, g, h = n.camelCase(b); return b = n.cssProps[h] || (n.cssProps[h] = Fb(a.style, h)), g = n.cssHooks[b] || n.cssHooks[h], g && "get" in g && (e = g.get(a, !0, c)), void 0 === e && (e = xb(a, b, d)), "normal" === e && b in Db && (e = Db[b]), "" === c || c ? (f = parseFloat(e), c === !0 || n.isNumeric(f) ? f || 0 : e) : e } }), n.each(["height", "width"], function (a, b) { n.cssHooks[b] = { get: function (a, c, d) { return c ? zb.test(n.css(a, "display")) && 0 === a.offsetWidth ? n.swap(a, Cb, function () { return Ib(a, b, d) }) : Ib(a, b, d) : void 0 }, set: function (a, c, d) { var e = d && wb(a); return Gb(a, c, d ? Hb(a, b, d, "border-box" === n.css(a, "boxSizing", !1, e), e) : 0) } } }), n.cssHooks.marginRight = yb(k.reliableMarginRight, function (a, b) { return b ? n.swap(a, { display: "inline-block" }, xb, [a, "marginRight"]) : void 0 }), n.each({ margin: "", padding: "", border: "Width" }, function (a, b) { n.cssHooks[a + b] = { expand: function (c) { for (var d = 0, e = {}, f = "string" == typeof c ? c.split(" ") : [c]; 4 > d; d++)e[a + R[d] + b] = f[d] || f[d - 2] || f[0]; return e } }, ub.test(a) || (n.cssHooks[a + b].set = Gb) }), n.fn.extend({ css: function (a, b) { return J(this, function (a, b, c) { var d, e, f = {}, g = 0; if (n.isArray(b)) { for (d = wb(a), e = b.length; e > g; g++)f[b[g]] = n.css(a, b[g], !1, d); return f } return void 0 !== c ? n.style(a, b, c) : n.css(a, b) }, a, b, arguments.length > 1) }, show: function () { return Jb(this, !0) }, hide: function () { return Jb(this) }, toggle: function (a) { return "boolean" == typeof a ? a ? this.show() : this.hide() : this.each(function () { S(this) ? n(this).show() : n(this).hide() }) } }); function Kb(a, b, c, d, e) { return new Kb.prototype.init(a, b, c, d, e) } n.Tween = Kb, Kb.prototype = { constructor: Kb, init: function (a, b, c, d, e, f) { this.elem = a, this.prop = c, this.easing = e || "swing", this.options = b, this.start = this.now = this.cur(), this.end = d, this.unit = f || (n.cssNumber[c] ? "" : "px") }, cur: function () { var a = Kb.propHooks[this.prop]; return a && a.get ? a.get(this) : Kb.propHooks._default.get(this) }, run: function (a) { var b, c = Kb.propHooks[this.prop]; return this.pos = b = this.options.duration ? n.easing[this.easing](a, this.options.duration * a, 0, 1, this.options.duration) : a, this.now = (this.end - this.start) * b + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), c && c.set ? c.set(this) : Kb.propHooks._default.set(this), this } }, Kb.prototype.init.prototype = Kb.prototype, Kb.propHooks = { _default: { get: function (a) { var b; return null == a.elem[a.prop] || a.elem.style && null != a.elem.style[a.prop] ? (b = n.css(a.elem, a.prop, ""), b && "auto" !== b ? b : 0) : a.elem[a.prop] }, set: function (a) { n.fx.step[a.prop] ? n.fx.step[a.prop](a) : a.elem.style && (null != a.elem.style[n.cssProps[a.prop]] || n.cssHooks[a.prop]) ? n.style(a.elem, a.prop, a.now + a.unit) : a.elem[a.prop] = a.now } } }, Kb.propHooks.scrollTop = Kb.propHooks.scrollLeft = { set: function (a) { a.elem.nodeType && a.elem.parentNode && (a.elem[a.prop] = a.now) } }, n.easing = { linear: function (a) { return a }, swing: function (a) { return .5 - Math.cos(a * Math.PI) / 2 } }, n.fx = Kb.prototype.init, n.fx.step = {}; var Lb, Mb, Nb = /^(?:toggle|show|hide)$/, Ob = new RegExp("^(?:([+-])=|)(" + Q + ")([a-z%]*)$", "i"), Pb = /queueHooks$/, Qb = [Vb], Rb = { "*": [function (a, b) { var c = this.createTween(a, b), d = c.cur(), e = Ob.exec(b), f = e && e[3] || (n.cssNumber[a] ? "" : "px"), g = (n.cssNumber[a] || "px" !== f && +d) && Ob.exec(n.css(c.elem, a)), h = 1, i = 20; if (g && g[3] !== f) { f = f || g[3], e = e || [], g = +d || 1; do h = h || ".5", g /= h, n.style(c.elem, a, g + f); while (h !== (h = c.cur() / d) && 1 !== h && --i) } return e && (g = c.start = +g || +d || 0, c.unit = f, c.end = e[1] ? g + (e[1] + 1) * e[2] : +e[2]), c }] }; function Sb() { return setTimeout(function () { Lb = void 0 }), Lb = n.now() } function Tb(a, b) { var c, d = 0, e = { height: a }; for (b = b ? 1 : 0; 4 > d; d += 2 - b)c = R[d], e["margin" + c] = e["padding" + c] = a; return b && (e.opacity = e.width = a), e } function Ub(a, b, c) { for (var d, e = (Rb[b] || []).concat(Rb["*"]), f = 0, g = e.length; g > f; f++)if (d = e[f].call(c, b, a)) return d } function Vb(a, b, c) { var d, e, f, g, h, i, j, k, l = this, m = {}, o = a.style, p = a.nodeType && S(a), q = L.get(a, "fxshow"); c.queue || (h = n._queueHooks(a, "fx"), null == h.unqueued && (h.unqueued = 0, i = h.empty.fire, h.empty.fire = function () { h.unqueued || i() }), h.unqueued++ , l.always(function () { l.always(function () { h.unqueued-- , n.queue(a, "fx").length || h.empty.fire() }) })), 1 === a.nodeType && ("height" in b || "width" in b) && (c.overflow = [o.overflow, o.overflowX, o.overflowY], j = n.css(a, "display"), k = "none" === j ? L.get(a, "olddisplay") || tb(a.nodeName) : j, "inline" === k && "none" === n.css(a, "float") && (o.display = "inline-block")), c.overflow && (o.overflow = "hidden", l.always(function () { o.overflow = c.overflow[0], o.overflowX = c.overflow[1], o.overflowY = c.overflow[2] })); for (d in b) if (e = b[d], Nb.exec(e)) { if (delete b[d], f = f || "toggle" === e, e === (p ? "hide" : "show")) { if ("show" !== e || !q || void 0 === q[d]) continue; p = !0 } m[d] = q && q[d] || n.style(a, d) } else j = void 0; if (n.isEmptyObject(m)) "inline" === ("none" === j ? tb(a.nodeName) : j) && (o.display = j); else { q ? "hidden" in q && (p = q.hidden) : q = L.access(a, "fxshow", {}), f && (q.hidden = !p), p ? n(a).show() : l.done(function () { n(a).hide() }), l.done(function () { var b; L.remove(a, "fxshow"); for (b in m) n.style(a, b, m[b]) }); for (d in m) g = Ub(p ? q[d] : 0, d, l), d in q || (q[d] = g.start, p && (g.end = g.start, g.start = "width" === d || "height" === d ? 1 : 0)) } } function Wb(a, b) { var c, d, e, f, g; for (c in a) if (d = n.camelCase(c), e = b[d], f = a[c], n.isArray(f) && (e = f[1], f = a[c] = f[0]), c !== d && (a[d] = f, delete a[c]), g = n.cssHooks[d], g && "expand" in g) { f = g.expand(f), delete a[d]; for (c in f) c in a || (a[c] = f[c], b[c] = e) } else b[d] = e } function Xb(a, b, c) { var d, e, f = 0, g = Qb.length, h = n.Deferred().always(function () { delete i.elem }), i = function () { if (e) return !1; for (var b = Lb || Sb(), c = Math.max(0, j.startTime + j.duration - b), d = c / j.duration || 0, f = 1 - d, g = 0, i = j.tweens.length; i > g; g++)j.tweens[g].run(f); return h.notifyWith(a, [j, f, c]), 1 > f && i ? c : (h.resolveWith(a, [j]), !1) }, j = h.promise({ elem: a, props: n.extend({}, b), opts: n.extend(!0, { specialEasing: {} }, c), originalProperties: b, originalOptions: c, startTime: Lb || Sb(), duration: c.duration, tweens: [], createTween: function (b, c) { var d = n.Tween(a, j.opts, b, c, j.opts.specialEasing[b] || j.opts.easing); return j.tweens.push(d), d }, stop: function (b) { var c = 0, d = b ? j.tweens.length : 0; if (e) return this; for (e = !0; d > c; c++)j.tweens[c].run(1); return b ? h.resolveWith(a, [j, b]) : h.rejectWith(a, [j, b]), this } }), k = j.props; for (Wb(k, j.opts.specialEasing); g > f; f++)if (d = Qb[f].call(j, a, k, j.opts)) return d; return n.map(k, Ub, j), n.isFunction(j.opts.start) && j.opts.start.call(a, j), n.fx.timer(n.extend(i, { elem: a, anim: j, queue: j.opts.queue })), j.progress(j.opts.progress).done(j.opts.done, j.opts.complete).fail(j.opts.fail).always(j.opts.always) } n.Animation = n.extend(Xb, { tweener: function (a, b) { n.isFunction(a) ? (b = a, a = ["*"]) : a = a.split(" "); for (var c, d = 0, e = a.length; e > d; d++)c = a[d], Rb[c] = Rb[c] || [], Rb[c].unshift(b) }, prefilter: function (a, b) { b ? Qb.unshift(a) : Qb.push(a) } }), n.speed = function (a, b, c) { var d = a && "object" == typeof a ? n.extend({}, a) : { complete: c || !c && b || n.isFunction(a) && a, duration: a, easing: c && b || b && !n.isFunction(b) && b }; return d.duration = n.fx.off ? 0 : "number" == typeof d.duration ? d.duration : d.duration in n.fx.speeds ? n.fx.speeds[d.duration] : n.fx.speeds._default, (null == d.queue || d.queue === !0) && (d.queue = "fx"), d.old = d.complete, d.complete = function () { n.isFunction(d.old) && d.old.call(this), d.queue && n.dequeue(this, d.queue) }, d }, n.fn.extend({ fadeTo: function (a, b, c, d) { return this.filter(S).css("opacity", 0).show().end().animate({ opacity: b }, a, c, d) }, animate: function (a, b, c, d) { var e = n.isEmptyObject(a), f = n.speed(b, c, d), g = function () { var b = Xb(this, n.extend({}, a), f); (e || L.get(this, "finish")) && b.stop(!0) }; return g.finish = g, e || f.queue === !1 ? this.each(g) : this.queue(f.queue, g) }, stop: function (a, b, c) { var d = function (a) { var b = a.stop; delete a.stop, b(c) }; return "string" != typeof a && (c = b, b = a, a = void 0), b && a !== !1 && this.queue(a || "fx", []), this.each(function () { var b = !0, e = null != a && a + "queueHooks", f = n.timers, g = L.get(this); if (e) g[e] && g[e].stop && d(g[e]); else for (e in g) g[e] && g[e].stop && Pb.test(e) && d(g[e]); for (e = f.length; e--;)f[e].elem !== this || null != a && f[e].queue !== a || (f[e].anim.stop(c), b = !1, f.splice(e, 1)); (b || !c) && n.dequeue(this, a) }) }, finish: function (a) { return a !== !1 && (a = a || "fx"), this.each(function () { var b, c = L.get(this), d = c[a + "queue"], e = c[a + "queueHooks"], f = n.timers, g = d ? d.length : 0; for (c.finish = !0, n.queue(this, a, []), e && e.stop && e.stop.call(this, !0), b = f.length; b--;)f[b].elem === this && f[b].queue === a && (f[b].anim.stop(!0), f.splice(b, 1)); for (b = 0; g > b; b++)d[b] && d[b].finish && d[b].finish.call(this); delete c.finish }) } }), n.each(["toggle", "show", "hide"], function (a, b) { var c = n.fn[b]; n.fn[b] = function (a, d, e) { return null == a || "boolean" == typeof a ? c.apply(this, arguments) : this.animate(Tb(b, !0), a, d, e) } }), n.each({ slideDown: Tb("show"), slideUp: Tb("hide"), slideToggle: Tb("toggle"), fadeIn: { opacity: "show" }, fadeOut: { opacity: "hide" }, fadeToggle: { opacity: "toggle" } }, function (a, b) { n.fn[a] = function (a, c, d) { return this.animate(b, a, c, d) } }), n.timers = [], n.fx.tick = function () { var a, b = 0, c = n.timers; for (Lb = n.now(); b < c.length; b++)a = c[b], a() || c[b] !== a || c.splice(b--, 1); c.length || n.fx.stop(), Lb = void 0 }, n.fx.timer = function (a) { n.timers.push(a), a() ? n.fx.start() : n.timers.pop() }, n.fx.interval = 13, n.fx.start = function () { Mb || (Mb = setInterval(n.fx.tick, n.fx.interval)) }, n.fx.stop = function () { clearInterval(Mb), Mb = null }, n.fx.speeds = { slow: 600, fast: 200, _default: 400 }, n.fn.delay = function (a, b) { return a = n.fx ? n.fx.speeds[a] || a : a, b = b || "fx", this.queue(b, function (b, c) { var d = setTimeout(b, a); c.stop = function () { clearTimeout(d) } }) }, function () { var a = l.createElement("input"), b = l.createElement("select"), c = b.appendChild(l.createElement("option")); a.type = "checkbox", k.checkOn = "" !== a.value, k.optSelected = c.selected, b.disabled = !0, k.optDisabled = !c.disabled, a = l.createElement("input"), a.value = "t", a.type = "radio", k.radioValue = "t" === a.value }(); var Yb, Zb, $b = n.expr.attrHandle; n.fn.extend({ attr: function (a, b) { return J(this, n.attr, a, b, arguments.length > 1) }, removeAttr: function (a) { return this.each(function () { n.removeAttr(this, a) }) } }), n.extend({
        attr: function (a, b, c) {
            var d, e, f = a.nodeType; if (a && 3 !== f && 8 !== f && 2 !== f) return typeof a.getAttribute === U ? n.prop(a, b, c) : (1 === f && n.isXMLDoc(a) || (b = b.toLowerCase(), d = n.attrHooks[b] || (n.expr.match.bool.test(b) ? Zb : Yb)), void 0 === c ? d && "get" in d && null !== (e = d.get(a, b)) ? e : (e = n.find.attr(a, b), null == e ? void 0 : e) : null !== c ? d && "set" in d && void 0 !== (e = d.set(a, c, b)) ? e : (a.setAttribute(b, c + ""), c) : void n.removeAttr(a, b))
        }, removeAttr: function (a, b) { var c, d, e = 0, f = b && b.match(E); if (f && 1 === a.nodeType) while (c = f[e++]) d = n.propFix[c] || c, n.expr.match.bool.test(c) && (a[d] = !1), a.removeAttribute(c) }, attrHooks: { type: { set: function (a, b) { if (!k.radioValue && "radio" === b && n.nodeName(a, "input")) { var c = a.value; return a.setAttribute("type", b), c && (a.value = c), b } } } }
    }), Zb = { set: function (a, b, c) { return b === !1 ? n.removeAttr(a, c) : a.setAttribute(c, c), c } }, n.each(n.expr.match.bool.source.match(/\w+/g), function (a, b) { var c = $b[b] || n.find.attr; $b[b] = function (a, b, d) { var e, f; return d || (f = $b[b], $b[b] = e, e = null != c(a, b, d) ? b.toLowerCase() : null, $b[b] = f), e } }); var _b = /^(?:input|select|textarea|button)$/i; n.fn.extend({ prop: function (a, b) { return J(this, n.prop, a, b, arguments.length > 1) }, removeProp: function (a) { return this.each(function () { delete this[n.propFix[a] || a] }) } }), n.extend({ propFix: { "for": "htmlFor", "class": "className" }, prop: function (a, b, c) { var d, e, f, g = a.nodeType; if (a && 3 !== g && 8 !== g && 2 !== g) return f = 1 !== g || !n.isXMLDoc(a), f && (b = n.propFix[b] || b, e = n.propHooks[b]), void 0 !== c ? e && "set" in e && void 0 !== (d = e.set(a, c, b)) ? d : a[b] = c : e && "get" in e && null !== (d = e.get(a, b)) ? d : a[b] }, propHooks: { tabIndex: { get: function (a) { return a.hasAttribute("tabindex") || _b.test(a.nodeName) || a.href ? a.tabIndex : -1 } } } }), k.optSelected || (n.propHooks.selected = { get: function (a) { var b = a.parentNode; return b && b.parentNode && b.parentNode.selectedIndex, null } }), n.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function () { n.propFix[this.toLowerCase()] = this }); var ac = /[\t\r\n\f]/g; n.fn.extend({ addClass: function (a) { var b, c, d, e, f, g, h = "string" == typeof a && a, i = 0, j = this.length; if (n.isFunction(a)) return this.each(function (b) { n(this).addClass(a.call(this, b, this.className)) }); if (h) for (b = (a || "").match(E) || []; j > i; i++)if (c = this[i], d = 1 === c.nodeType && (c.className ? (" " + c.className + " ").replace(ac, " ") : " ")) { f = 0; while (e = b[f++]) d.indexOf(" " + e + " ") < 0 && (d += e + " "); g = n.trim(d), c.className !== g && (c.className = g) } return this }, removeClass: function (a) { var b, c, d, e, f, g, h = 0 === arguments.length || "string" == typeof a && a, i = 0, j = this.length; if (n.isFunction(a)) return this.each(function (b) { n(this).removeClass(a.call(this, b, this.className)) }); if (h) for (b = (a || "").match(E) || []; j > i; i++)if (c = this[i], d = 1 === c.nodeType && (c.className ? (" " + c.className + " ").replace(ac, " ") : "")) { f = 0; while (e = b[f++]) while (d.indexOf(" " + e + " ") >= 0) d = d.replace(" " + e + " ", " "); g = a ? n.trim(d) : "", c.className !== g && (c.className = g) } return this }, toggleClass: function (a, b) { var c = typeof a; return "boolean" == typeof b && "string" === c ? b ? this.addClass(a) : this.removeClass(a) : this.each(n.isFunction(a) ? function (c) { n(this).toggleClass(a.call(this, c, this.className, b), b) } : function () { if ("string" === c) { var b, d = 0, e = n(this), f = a.match(E) || []; while (b = f[d++]) e.hasClass(b) ? e.removeClass(b) : e.addClass(b) } else (c === U || "boolean" === c) && (this.className && L.set(this, "__className__", this.className), this.className = this.className || a === !1 ? "" : L.get(this, "__className__") || "") }) }, hasClass: function (a) { for (var b = " " + a + " ", c = 0, d = this.length; d > c; c++)if (1 === this[c].nodeType && (" " + this[c].className + " ").replace(ac, " ").indexOf(b) >= 0) return !0; return !1 } }); var bc = /\r/g; n.fn.extend({ val: function (a) { var b, c, d, e = this[0]; { if (arguments.length) return d = n.isFunction(a), this.each(function (c) { var e; 1 === this.nodeType && (e = d ? a.call(this, c, n(this).val()) : a, null == e ? e = "" : "number" == typeof e ? e += "" : n.isArray(e) && (e = n.map(e, function (a) { return null == a ? "" : a + "" })), b = n.valHooks[this.type] || n.valHooks[this.nodeName.toLowerCase()], b && "set" in b && void 0 !== b.set(this, e, "value") || (this.value = e)) }); if (e) return b = n.valHooks[e.type] || n.valHooks[e.nodeName.toLowerCase()], b && "get" in b && void 0 !== (c = b.get(e, "value")) ? c : (c = e.value, "string" == typeof c ? c.replace(bc, "") : null == c ? "" : c) } } }), n.extend({ valHooks: { option: { get: function (a) { var b = n.find.attr(a, "value"); return null != b ? b : n.trim(n.text(a)) } }, select: { get: function (a) { for (var b, c, d = a.options, e = a.selectedIndex, f = "select-one" === a.type || 0 > e, g = f ? null : [], h = f ? e + 1 : d.length, i = 0 > e ? h : f ? e : 0; h > i; i++)if (c = d[i], !(!c.selected && i !== e || (k.optDisabled ? c.disabled : null !== c.getAttribute("disabled")) || c.parentNode.disabled && n.nodeName(c.parentNode, "optgroup"))) { if (b = n(c).val(), f) return b; g.push(b) } return g }, set: function (a, b) { var c, d, e = a.options, f = n.makeArray(b), g = e.length; while (g--) d = e[g], (d.selected = n.inArray(d.value, f) >= 0) && (c = !0); return c || (a.selectedIndex = -1), f } } } }), n.each(["radio", "checkbox"], function () { n.valHooks[this] = { set: function (a, b) { return n.isArray(b) ? a.checked = n.inArray(n(a).val(), b) >= 0 : void 0 } }, k.checkOn || (n.valHooks[this].get = function (a) { return null === a.getAttribute("value") ? "on" : a.value }) }), n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function (a, b) { n.fn[b] = function (a, c) { return arguments.length > 0 ? this.on(b, null, a, c) : this.trigger(b) } }), n.fn.extend({ hover: function (a, b) { return this.mouseenter(a).mouseleave(b || a) }, bind: function (a, b, c) { return this.on(a, null, b, c) }, unbind: function (a, b) { return this.off(a, null, b) }, delegate: function (a, b, c, d) { return this.on(b, a, c, d) }, undelegate: function (a, b, c) { return 1 === arguments.length ? this.off(a, "**") : this.off(b, a || "**", c) } }); var cc = n.now(), dc = /\?/; n.parseJSON = function (a) { return JSON.parse(a + "") }, n.parseXML = function (a) { var b, c; if (!a || "string" != typeof a) return null; try { c = new DOMParser, b = c.parseFromString(a, "text/xml") } catch (d) { b = void 0 } return (!b || b.getElementsByTagName("parsererror").length) && n.error("Invalid XML: " + a), b }; var ec, fc, gc = /#.*$/, hc = /([?&])_=[^&]*/, ic = /^(.*?):[ \t]*([^\r\n]*)$/gm, jc = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, kc = /^(?:GET|HEAD)$/, lc = /^\/\//, mc = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/, nc = {}, oc = {}, pc = "*/".concat("*"); try { fc = location.href } catch (qc) { fc = l.createElement("a"), fc.href = "", fc = fc.href } ec = mc.exec(fc.toLowerCase()) || []; function rc(a) { return function (b, c) { "string" != typeof b && (c = b, b = "*"); var d, e = 0, f = b.toLowerCase().match(E) || []; if (n.isFunction(c)) while (d = f[e++]) "+" === d[0] ? (d = d.slice(1) || "*", (a[d] = a[d] || []).unshift(c)) : (a[d] = a[d] || []).push(c) } } function sc(a, b, c, d) { var e = {}, f = a === oc; function g(h) { var i; return e[h] = !0, n.each(a[h] || [], function (a, h) { var j = h(b, c, d); return "string" != typeof j || f || e[j] ? f ? !(i = j) : void 0 : (b.dataTypes.unshift(j), g(j), !1) }), i } return g(b.dataTypes[0]) || !e["*"] && g("*") } function tc(a, b) { var c, d, e = n.ajaxSettings.flatOptions || {}; for (c in b) void 0 !== b[c] && ((e[c] ? a : d || (d = {}))[c] = b[c]); return d && n.extend(!0, a, d), a } function uc(a, b, c) { var d, e, f, g, h = a.contents, i = a.dataTypes; while ("*" === i[0]) i.shift(), void 0 === d && (d = a.mimeType || b.getResponseHeader("Content-Type")); if (d) for (e in h) if (h[e] && h[e].test(d)) { i.unshift(e); break } if (i[0] in c) f = i[0]; else { for (e in c) { if (!i[0] || a.converters[e + " " + i[0]]) { f = e; break } g || (g = e) } f = f || g } return f ? (f !== i[0] && i.unshift(f), c[f]) : void 0 } function vc(a, b, c, d) { var e, f, g, h, i, j = {}, k = a.dataTypes.slice(); if (k[1]) for (g in a.converters) j[g.toLowerCase()] = a.converters[g]; f = k.shift(); while (f) if (a.responseFields[f] && (c[a.responseFields[f]] = b), !i && d && a.dataFilter && (b = a.dataFilter(b, a.dataType)), i = f, f = k.shift()) if ("*" === f) f = i; else if ("*" !== i && i !== f) { if (g = j[i + " " + f] || j["* " + f], !g) for (e in j) if (h = e.split(" "), h[1] === f && (g = j[i + " " + h[0]] || j["* " + h[0]])) { g === !0 ? g = j[e] : j[e] !== !0 && (f = h[0], k.unshift(h[1])); break } if (g !== !0) if (g && a["throws"]) b = g(b); else try { b = g(b) } catch (l) { return { state: "parsererror", error: g ? l : "No conversion from " + i + " to " + f } } } return { state: "success", data: b } } n.extend({ active: 0, lastModified: {}, etag: {}, ajaxSettings: { url: fc, type: "GET", isLocal: jc.test(ec[1]), global: !0, processData: !0, async: !0, contentType: "application/x-www-form-urlencoded; charset=UTF-8", accepts: { "*": pc, text: "text/plain", html: "text/html", xml: "application/xml, text/xml", json: "application/json, text/javascript" }, contents: { xml: /xml/, html: /html/, json: /json/ }, responseFields: { xml: "responseXML", text: "responseText", json: "responseJSON" }, converters: { "* text": String, "text html": !0, "text json": n.parseJSON, "text xml": n.parseXML }, flatOptions: { url: !0, context: !0 } }, ajaxSetup: function (a, b) { return b ? tc(tc(a, n.ajaxSettings), b) : tc(n.ajaxSettings, a) }, ajaxPrefilter: rc(nc), ajaxTransport: rc(oc), ajax: function (a, b) { "object" == typeof a && (b = a, a = void 0), b = b || {}; var c, d, e, f, g, h, i, j, k = n.ajaxSetup({}, b), l = k.context || k, m = k.context && (l.nodeType || l.jquery) ? n(l) : n.event, o = n.Deferred(), p = n.Callbacks("once memory"), q = k.statusCode || {}, r = {}, s = {}, t = 0, u = "canceled", v = { readyState: 0, getResponseHeader: function (a) { var b; if (2 === t) { if (!f) { f = {}; while (b = ic.exec(e)) f[b[1].toLowerCase()] = b[2] } b = f[a.toLowerCase()] } return null == b ? null : b }, getAllResponseHeaders: function () { return 2 === t ? e : null }, setRequestHeader: function (a, b) { var c = a.toLowerCase(); return t || (a = s[c] = s[c] || a, r[a] = b), this }, overrideMimeType: function (a) { return t || (k.mimeType = a), this }, statusCode: function (a) { var b; if (a) if (2 > t) for (b in a) q[b] = [q[b], a[b]]; else v.always(a[v.status]); return this }, abort: function (a) { var b = a || u; return c && c.abort(b), x(0, b), this } }; if (o.promise(v).complete = p.add, v.success = v.done, v.error = v.fail, k.url = ((a || k.url || fc) + "").replace(gc, "").replace(lc, ec[1] + "//"), k.type = b.method || b.type || k.method || k.type, k.dataTypes = n.trim(k.dataType || "*").toLowerCase().match(E) || [""], null == k.crossDomain && (h = mc.exec(k.url.toLowerCase()), k.crossDomain = !(!h || h[1] === ec[1] && h[2] === ec[2] && (h[3] || ("http:" === h[1] ? "80" : "443")) === (ec[3] || ("http:" === ec[1] ? "80" : "443")))), k.data && k.processData && "string" != typeof k.data && (k.data = n.param(k.data, k.traditional)), sc(nc, k, b, v), 2 === t) return v; i = k.global, i && 0 === n.active++ && n.event.trigger("ajaxStart"), k.type = k.type.toUpperCase(), k.hasContent = !kc.test(k.type), d = k.url, k.hasContent || (k.data && (d = k.url += (dc.test(d) ? "&" : "?") + k.data, delete k.data), k.cache === !1 && (k.url = hc.test(d) ? d.replace(hc, "$1_=" + cc++) : d + (dc.test(d) ? "&" : "?") + "_=" + cc++)), k.ifModified && (n.lastModified[d] && v.setRequestHeader("If-Modified-Since", n.lastModified[d]), n.etag[d] && v.setRequestHeader("If-None-Match", n.etag[d])), (k.data && k.hasContent && k.contentType !== !1 || b.contentType) && v.setRequestHeader("Content-Type", k.contentType), v.setRequestHeader("Accept", k.dataTypes[0] && k.accepts[k.dataTypes[0]] ? k.accepts[k.dataTypes[0]] + ("*" !== k.dataTypes[0] ? ", " + pc + "; q=0.01" : "") : k.accepts["*"]); for (j in k.headers) v.setRequestHeader(j, k.headers[j]); if (k.beforeSend && (k.beforeSend.call(l, v, k) === !1 || 2 === t)) return v.abort(); u = "abort"; for (j in { success: 1, error: 1, complete: 1 }) v[j](k[j]); if (c = sc(oc, k, b, v)) { v.readyState = 1, i && m.trigger("ajaxSend", [v, k]), k.async && k.timeout > 0 && (g = setTimeout(function () { v.abort("timeout") }, k.timeout)); try { t = 1, c.send(r, x) } catch (w) { if (!(2 > t)) throw w; x(-1, w) } } else x(-1, "No Transport"); function x(a, b, f, h) { var j, r, s, u, w, x = b; 2 !== t && (t = 2, g && clearTimeout(g), c = void 0, e = h || "", v.readyState = a > 0 ? 4 : 0, j = a >= 200 && 300 > a || 304 === a, f && (u = uc(k, v, f)), u = vc(k, u, v, j), j ? (k.ifModified && (w = v.getResponseHeader("Last-Modified"), w && (n.lastModified[d] = w), w = v.getResponseHeader("etag"), w && (n.etag[d] = w)), 204 === a || "HEAD" === k.type ? x = "nocontent" : 304 === a ? x = "notmodified" : (x = u.state, r = u.data, s = u.error, j = !s)) : (s = x, (a || !x) && (x = "error", 0 > a && (a = 0))), v.status = a, v.statusText = (b || x) + "", j ? o.resolveWith(l, [r, x, v]) : o.rejectWith(l, [v, x, s]), v.statusCode(q), q = void 0, i && m.trigger(j ? "ajaxSuccess" : "ajaxError", [v, k, j ? r : s]), p.fireWith(l, [v, x]), i && (m.trigger("ajaxComplete", [v, k]), --n.active || n.event.trigger("ajaxStop"))) } return v }, getJSON: function (a, b, c) { return n.get(a, b, c, "json") }, getScript: function (a, b) { return n.get(a, void 0, b, "script") } }), n.each(["get", "post"], function (a, b) { n[b] = function (a, c, d, e) { return n.isFunction(c) && (e = e || d, d = c, c = void 0), n.ajax({ url: a, type: b, dataType: e, data: c, success: d }) } }), n.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function (a, b) { n.fn[b] = function (a) { return this.on(b, a) } }), n._evalUrl = function (a) { return n.ajax({ url: a, type: "GET", dataType: "script", async: !1, global: !1, "throws": !0 }) }, n.fn.extend({ wrapAll: function (a) { var b; return n.isFunction(a) ? this.each(function (b) { n(this).wrapAll(a.call(this, b)) }) : (this[0] && (b = n(a, this[0].ownerDocument).eq(0).clone(!0), this[0].parentNode && b.insertBefore(this[0]), b.map(function () { var a = this; while (a.firstElementChild) a = a.firstElementChild; return a }).append(this)), this) }, wrapInner: function (a) { return this.each(n.isFunction(a) ? function (b) { n(this).wrapInner(a.call(this, b)) } : function () { var b = n(this), c = b.contents(); c.length ? c.wrapAll(a) : b.append(a) }) }, wrap: function (a) { var b = n.isFunction(a); return this.each(function (c) { n(this).wrapAll(b ? a.call(this, c) : a) }) }, unwrap: function () { return this.parent().each(function () { n.nodeName(this, "body") || n(this).replaceWith(this.childNodes) }).end() } }), n.expr.filters.hidden = function (a) { return a.offsetWidth <= 0 && a.offsetHeight <= 0 }, n.expr.filters.visible = function (a) { return !n.expr.filters.hidden(a) }; var wc = /%20/g, xc = /\[\]$/, yc = /\r?\n/g, zc = /^(?:submit|button|image|reset|file)$/i, Ac = /^(?:input|select|textarea|keygen)/i; function Bc(a, b, c, d) { var e; if (n.isArray(b)) n.each(b, function (b, e) { c || xc.test(a) ? d(a, e) : Bc(a + "[" + ("object" == typeof e ? b : "") + "]", e, c, d) }); else if (c || "object" !== n.type(b)) d(a, b); else for (e in b) Bc(a + "[" + e + "]", b[e], c, d) } n.param = function (a, b) { var c, d = [], e = function (a, b) { b = n.isFunction(b) ? b() : null == b ? "" : b, d[d.length] = encodeURIComponent(a) + "=" + encodeURIComponent(b) }; if (void 0 === b && (b = n.ajaxSettings && n.ajaxSettings.traditional), n.isArray(a) || a.jquery && !n.isPlainObject(a)) n.each(a, function () { e(this.name, this.value) }); else for (c in a) Bc(c, a[c], b, e); return d.join("&").replace(wc, "+") }, n.fn.extend({ serialize: function () { return n.param(this.serializeArray()) }, serializeArray: function () { return this.map(function () { var a = n.prop(this, "elements"); return a ? n.makeArray(a) : this }).filter(function () { var a = this.type; return this.name && !n(this).is(":disabled") && Ac.test(this.nodeName) && !zc.test(a) && (this.checked || !T.test(a)) }).map(function (a, b) { var c = n(this).val(); return null == c ? null : n.isArray(c) ? n.map(c, function (a) { return { name: b.name, value: a.replace(yc, "\r\n") } }) : { name: b.name, value: c.replace(yc, "\r\n") } }).get() } }), n.ajaxSettings.xhr = function () { try { return new XMLHttpRequest } catch (a) { } }; var Cc = 0, Dc = {}, Ec = { 0: 200, 1223: 204 }, Fc = n.ajaxSettings.xhr(); a.ActiveXObject && n(a).on("unload", function () { for (var a in Dc) Dc[a]() }), k.cors = !!Fc && "withCredentials" in Fc, k.ajax = Fc = !!Fc, n.ajaxTransport(function (a) { var b; return k.cors || Fc && !a.crossDomain ? { send: function (c, d) { var e, f = a.xhr(), g = ++Cc; if (f.open(a.type, a.url, a.async, a.username, a.password), a.xhrFields) for (e in a.xhrFields) f[e] = a.xhrFields[e]; a.mimeType && f.overrideMimeType && f.overrideMimeType(a.mimeType), a.crossDomain || c["X-Requested-With"] || (c["X-Requested-With"] = "XMLHttpRequest"); for (e in c) f.setRequestHeader(e, c[e]); b = function (a) { return function () { b && (delete Dc[g], b = f.onload = f.onerror = null, "abort" === a ? f.abort() : "error" === a ? d(f.status, f.statusText) : d(Ec[f.status] || f.status, f.statusText, "string" == typeof f.responseText ? { text: f.responseText } : void 0, f.getAllResponseHeaders())) } }, f.onload = b(), f.onerror = b("error"), b = Dc[g] = b("abort"); try { f.send(a.hasContent && a.data || null) } catch (h) { if (b) throw h } }, abort: function () { b && b() } } : void 0 }), n.ajaxSetup({ accepts: { script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript" }, contents: { script: /(?:java|ecma)script/ }, converters: { "text script": function (a) { return n.globalEval(a), a } } }), n.ajaxPrefilter("script", function (a) { void 0 === a.cache && (a.cache = !1), a.crossDomain && (a.type = "GET") }), n.ajaxTransport("script", function (a) { if (a.crossDomain) { var b, c; return { send: function (d, e) { b = n("<script>").prop({ async: !0, charset: a.scriptCharset, src: a.url }).on("load error", c = function (a) { b.remove(), c = null, a && e("error" === a.type ? 404 : 200, a.type) }), l.head.appendChild(b[0]) }, abort: function () { c && c() } } } }); var Gc = [], Hc = /(=)\?(?=&|$)|\?\?/; n.ajaxSetup({ jsonp: "callback", jsonpCallback: function () { var a = Gc.pop() || n.expando + "_" + cc++; return this[a] = !0, a } }), n.ajaxPrefilter("json jsonp", function (b, c, d) { var e, f, g, h = b.jsonp !== !1 && (Hc.test(b.url) ? "url" : "string" == typeof b.data && !(b.contentType || "").indexOf("application/x-www-form-urlencoded") && Hc.test(b.data) && "data"); return h || "jsonp" === b.dataTypes[0] ? (e = b.jsonpCallback = n.isFunction(b.jsonpCallback) ? b.jsonpCallback() : b.jsonpCallback, h ? b[h] = b[h].replace(Hc, "$1" + e) : b.jsonp !== !1 && (b.url += (dc.test(b.url) ? "&" : "?") + b.jsonp + "=" + e), b.converters["script json"] = function () { return g || n.error(e + " was not called"), g[0] }, b.dataTypes[0] = "json", f = a[e], a[e] = function () { g = arguments }, d.always(function () { a[e] = f, b[e] && (b.jsonpCallback = c.jsonpCallback, Gc.push(e)), g && n.isFunction(f) && f(g[0]), g = f = void 0 }), "script") : void 0 }), n.parseHTML = function (a, b, c) { if (!a || "string" != typeof a) return null; "boolean" == typeof b && (c = b, b = !1), b = b || l; var d = v.exec(a), e = !c && []; return d ? [b.createElement(d[1])] : (d = n.buildFragment([a], b, e), e && e.length && n(e).remove(), n.merge([], d.childNodes)) }; var Ic = n.fn.load; n.fn.load = function (a, b, c) { if ("string" != typeof a && Ic) return Ic.apply(this, arguments); var d, e, f, g = this, h = a.indexOf(" "); return h >= 0 && (d = n.trim(a.slice(h)), a = a.slice(0, h)), n.isFunction(b) ? (c = b, b = void 0) : b && "object" == typeof b && (e = "POST"), g.length > 0 && n.ajax({ url: a, type: e, dataType: "html", data: b }).done(function (a) { f = arguments, g.html(d ? n("<div>").append(n.parseHTML(a)).find(d) : a) }).complete(c && function (a, b) { g.each(c, f || [a.responseText, b, a]) }), this }, n.expr.filters.animated = function (a) { return n.grep(n.timers, function (b) { return a === b.elem }).length }; var Jc = a.document.documentElement; function Kc(a) { return n.isWindow(a) ? a : 9 === a.nodeType && a.defaultView } n.offset = { setOffset: function (a, b, c) { var d, e, f, g, h, i, j, k = n.css(a, "position"), l = n(a), m = {}; "static" === k && (a.style.position = "relative"), h = l.offset(), f = n.css(a, "top"), i = n.css(a, "left"), j = ("absolute" === k || "fixed" === k) && (f + i).indexOf("auto") > -1, j ? (d = l.position(), g = d.top, e = d.left) : (g = parseFloat(f) || 0, e = parseFloat(i) || 0), n.isFunction(b) && (b = b.call(a, c, h)), null != b.top && (m.top = b.top - h.top + g), null != b.left && (m.left = b.left - h.left + e), "using" in b ? b.using.call(a, m) : l.css(m) } }, n.fn.extend({ offset: function (a) { if (arguments.length) return void 0 === a ? this : this.each(function (b) { n.offset.setOffset(this, a, b) }); var b, c, d = this[0], e = { top: 0, left: 0 }, f = d && d.ownerDocument; if (f) return b = f.documentElement, n.contains(b, d) ? (typeof d.getBoundingClientRect !== U && (e = d.getBoundingClientRect()), c = Kc(f), { top: e.top + c.pageYOffset - b.clientTop, left: e.left + c.pageXOffset - b.clientLeft }) : e }, position: function () { if (this[0]) { var a, b, c = this[0], d = { top: 0, left: 0 }; return "fixed" === n.css(c, "position") ? b = c.getBoundingClientRect() : (a = this.offsetParent(), b = this.offset(), n.nodeName(a[0], "html") || (d = a.offset()), d.top += n.css(a[0], "borderTopWidth", !0), d.left += n.css(a[0], "borderLeftWidth", !0)), { top: b.top - d.top - n.css(c, "marginTop", !0), left: b.left - d.left - n.css(c, "marginLeft", !0) } } }, offsetParent: function () { return this.map(function () { var a = this.offsetParent || Jc; while (a && !n.nodeName(a, "html") && "static" === n.css(a, "position")) a = a.offsetParent; return a || Jc }) } }), n.each({ scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function (b, c) { var d = "pageYOffset" === c; n.fn[b] = function (e) { return J(this, function (b, e, f) { var g = Kc(b); return void 0 === f ? g ? g[c] : b[e] : void (g ? g.scrollTo(d ? a.pageXOffset : f, d ? f : a.pageYOffset) : b[e] = f) }, b, e, arguments.length, null) } }), n.each(["top", "left"], function (a, b) { n.cssHooks[b] = yb(k.pixelPosition, function (a, c) { return c ? (c = xb(a, b), vb.test(c) ? n(a).position()[b] + "px" : c) : void 0 }) }), n.each({ Height: "height", Width: "width" }, function (a, b) { n.each({ padding: "inner" + a, content: b, "": "outer" + a }, function (c, d) { n.fn[d] = function (d, e) { var f = arguments.length && (c || "boolean" != typeof d), g = c || (d === !0 || e === !0 ? "margin" : "border"); return J(this, function (b, c, d) { var e; return n.isWindow(b) ? b.document.documentElement["client" + a] : 9 === b.nodeType ? (e = b.documentElement, Math.max(b.body["scroll" + a], e["scroll" + a], b.body["offset" + a], e["offset" + a], e["client" + a])) : void 0 === d ? n.css(b, c, g) : n.style(b, c, d, g) }, b, f ? d : void 0, f, null) } }) }), n.fn.size = function () { return this.length }, n.fn.andSelf = n.fn.addBack, "function" == typeof define && define.amd && define("jquery", [], function () { return n }); var Lc = a.jQuery, Mc = a.$; return n.noConflict = function (b) { return a.$ === n && (a.$ = Mc), b && a.jQuery === n && (a.jQuery = Lc), n }, typeof b === U && (a.jQuery = a.$ = n), n
});
"use strict";(function(){var gameStarted=false;window.PlayGame={init:function(){PlayGame.initMessageListener();PlayGame.checkInFrame();PlayGame.preventPageScrolling();PlayGame.keepAlive();setInterval(function(){PlayGame.keepAlive();},15000);},initMessageListener:function(){window.addEventListener('message',function(e){const message=e.data;if(message==="AuthStep2"){if(constructNet_gameEmbedURL.startsWith(e.origin)){PlayGame.startGame();}}});},checkInFrame:function(){var inFrame=PlayGame.isInFrame();if(!inFrame){window.location.href=constructNet_gameURL;return;}
parent.postMessage("InitRequest","*");},isInFrame:function(){try{return window.self!==window.top;}catch(e){return true;}},setCookie:function(name,value,days){var expires="";if(days){const date=new Date();date.setTime(date.getTime()+(days*24*60*60*1000));expires="; expires="+date.toUTCString();}
document.cookie=name+"="+(value||"")+expires+"; path=/; domain=.constructdev.net; secure";},getCookie:function(name){const nameEQ=name+"=";const ca=document.cookie.split(';');for(let i=0;i<ca.length;i++){let c=ca[i];while(c.charAt(0)===' ')c=c.substring(1,c.length);if(c.indexOf(nameEQ)===0)return c.substring(nameEQ.length,c.length);}
return null;},keepAlive:function(){if(constructNet_gameVersionRecordID<=0)return;const xhr=new XMLHttpRequest();xhr.open("POST",`/handlers/arcade/keepalive.ashx?gameID=${constructNet_gameID}&versionRecordID=${constructNet_gameVersionRecordID}`);xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");xhr.send();},startGame:function(){if(gameStarted===true)return;let promiseArray=[];for(let i=0;i<constructNet_scriptURLs.length;i++){promiseArray.push(PlayGame.addScript(constructNet_scriptURLs[i]));}
Promise.all(promiseArray).then(function(values){if(constructNet_madeInC2){jQuery(document).ready(function(){cr_createRuntime("c2canvas");});document.addEventListener("visibilitychange",PlayGame.c2onVisibilityChanged,false);document.addEventListener("mozvisibilitychange",PlayGame.c2onVisibilityChanged,false);document.addEventListener("webkitvisibilitychange",PlayGame.c2onVisibilityChanged,false);document.addEventListener("msvisibilitychange",PlayGame.c2onVisibilityChanged,false);}
gameStarted=true;if(constructNet_gameVersionRecordID>0){var ott=new URLSearchParams(window.location.search).get("ott");var xhr=new XMLHttpRequest();xhr.open("POST",constructNet_gameHost+"/handlers/arcade/loadcomplete.ashx",true);xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8");xhr.send("gameID="+constructNet_gameID+"&versionRID="+constructNet_gameVersionRecordID+"&ott="+ott);}});},c2onVisibilityChanged:function(){if(document.hidden||document.mozHidden||document.webkitHidden||document.msHidden)
cr_setSuspended(true);else
cr_setSuspended(false);},addScript:function(src){return new Promise(function(resolve,reject){const s=document.createElement('script');s.setAttribute('src',src);s.onload=resolve;s.onerror=reject;s.async=false;document.body.appendChild(s);});},preventPageScrolling:function(){document.addEventListener("keydown",function(event){event.preventDefault();});document.oncontextmenu=function(event){if(event.preventDefault!==undefined)
event.preventDefault();if(event.stopPropagation!==undefined)
event.stopPropagation();};document.addEventListener("mousewheel",function(event){event.preventDefault();},{passive:false});}};PlayGame.init();})();
(function(){/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
var m=this||self,n=function(a,b){a=a.split(".");var c=m;a[0]in c||"undefined"==typeof c.execScript||c.execScript("var "+a[0]);for(var d;a.length&&(d=a.shift());)a.length||void 0===b?c=c[d]&&c[d]!==Object.prototype[d]?c[d]:c[d]={}:c[d]=b};var p=function(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c])},q=function(a){for(var b in a)if(a.hasOwnProperty(b))return!0;return!1};var r=window,t=document,u=function(a,b){t.addEventListener?t.addEventListener(a,b,!1):t.attachEvent&&t.attachEvent("on"+a,b)};var v=/^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i;var w={},x=function(){w.TAGGING=w.TAGGING||[];w.TAGGING[1]=!0};var y=/:[0-9]+$/,A=function(a,b){b&&(b=String(b).toLowerCase());if("protocol"===b||"port"===b)a.protocol=z(a.protocol)||z(r.location.protocol);"port"===b?a.port=String(Number(a.hostname?a.port:r.location.port)||("http"==a.protocol?80:"https"==a.protocol?443:"")):"host"===b&&(a.hostname=(a.hostname||r.location.hostname).replace(y,"").toLowerCase());var c=z(a.protocol);b&&(b=String(b).toLowerCase());switch(b){case "url_no_fragment":b="";a&&a.href&&(b=a.href.indexOf("#"),b=0>b?a.href:a.href.substr(0,
b));a=b;break;case "protocol":a=c;break;case "host":a=a.hostname.replace(y,"").toLowerCase();break;case "port":a=String(Number(a.port)||("http"==c?80:"https"==c?443:""));break;case "path":a.pathname||a.hostname||x();a="/"==a.pathname.substr(0,1)?a.pathname:"/"+a.pathname;a=a.split("/");a:if(b=a[a.length-1],c=[],Array.prototype.indexOf)b=c.indexOf(b),b="number"==typeof b?b:-1;else{for(var d=0;d<c.length;d++)if(c[d]===b){b=d;break a}b=-1}0<=b&&(a[a.length-1]="");a=a.join("/");break;case "query":a=a.search.replace("?",
"");break;case "extension":a=a.pathname.split(".");a=1<a.length?a[a.length-1]:"";a=a.split("/")[0];break;case "fragment":a=a.hash.replace("#","");break;default:a=a&&a.href}return a},z=function(a){return a?a.replace(":","").toLowerCase():""},B=function(a){var b=t.createElement("a");a&&(b.href=a);var c=b.pathname;"/"!==c[0]&&(a||x(),c="/"+c);a=b.hostname.replace(y,"");return{href:b.href,protocol:b.protocol,host:b.host,hostname:a,pathname:c,search:b.search,hash:b.hash,port:b.port}};function C(){for(var a=D,b={},c=0;c<a.length;++c)b[a[c]]=c;return b}function E(){var a="ABCDEFGHIJKLMNOPQRSTUVWXYZ";a+=a.toLowerCase()+"0123456789-_";return a+"."}var D,F;function G(a){D=D||E();F=F||C();for(var b=[],c=0;c<a.length;c+=3){var d=c+1<a.length,f=c+2<a.length,e=a.charCodeAt(c),g=d?a.charCodeAt(c+1):0,h=f?a.charCodeAt(c+2):0,k=e>>2;e=(e&3)<<4|g>>4;g=(g&15)<<2|h>>6;h&=63;f||(h=64,d||(g=64));b.push(D[k],D[e],D[g],D[h])}return b.join("")}
function H(a){function b(k){for(;d<a.length;){var l=a.charAt(d++),M=F[l];if(null!=M)return M;if(!/^[\s\xa0]*$/.test(l))throw Error("Unknown base64 encoding at char: "+l);}return k}D=D||E();F=F||C();for(var c="",d=0;;){var f=b(-1),e=b(0),g=b(64),h=b(64);if(64===h&&-1===f)return c;c+=String.fromCharCode(f<<2|e>>4);64!=g&&(c+=String.fromCharCode(e<<4&240|g>>2),64!=h&&(c+=String.fromCharCode(g<<6&192|h)))}};var I;var N=function(){var a=J,b=K,c=L(),d=function(g){a(g.target||g.srcElement||{})},f=function(g){b(g.target||g.srcElement||{})};if(!c.init){u("mousedown",d);u("keyup",d);u("submit",f);var e=HTMLFormElement.prototype.submit;HTMLFormElement.prototype.submit=function(){b(this);e.call(this)};c.init=!0}},O=function(a,b,c){for(var d=L().decorators,f={},e=0;e<d.length;++e){var g=d[e],h;if(h=!c||g.forms)a:{h=g.domains;var k=a;if(h&&(g.sameHost||k!==t.location.hostname))for(var l=0;l<h.length;l++)if(h[l]instanceof
RegExp){if(h[l].test(k)){h=!0;break a}}else if(0<=k.indexOf(h[l])){h=!0;break a}h=!1}h&&(h=g.placement,void 0==h&&(h=g.fragment?2:1),h===b&&p(f,g.callback()))}return f},L=function(){var a={};var b=r.google_tag_data;r.google_tag_data=void 0===b?a:b;a=r.google_tag_data;b=a.gl;b&&b.decorators||(b={decorators:[]},a.gl=b);return b};var P=/(.*?)\*(.*?)\*(.*)/,aa=/([^?#]+)(\?[^#]*)?(#.*)?/;function Q(a){return new RegExp("(.*?)(^|&)"+a+"=([^&]*)&?(.*)")}
var S=function(a){var b=[],c;for(c in a)if(a.hasOwnProperty(c)){var d=a[c];void 0!==d&&d===d&&null!==d&&"[object Object]"!==d.toString()&&(b.push(c),b.push(G(String(d))))}a=b.join("*");return["1",R(a),a].join("*")},R=function(a,b){a=[window.navigator.userAgent,(new Date).getTimezoneOffset(),window.navigator.userLanguage||window.navigator.language,Math.floor((new Date).getTime()/60/1E3)-(void 0===b?0:b),a].join("*");if(!(b=I)){b=Array(256);for(var c=0;256>c;c++){for(var d=c,f=0;8>f;f++)d=d&1?d>>>1^
3988292384:d>>>1;b[c]=d}}I=b;b=4294967295;for(c=0;c<a.length;c++)b=b>>>8^I[(b^a.charCodeAt(c))&255];return((b^-1)>>>0).toString(36)},ca=function(a){return function(b){var c=B(r.location.href),d=c.search.replace("?","");a:{var f=d.split("&");for(var e=0;e<f.length;e++){var g=f[e].split("=");if("_gl"===decodeURIComponent(g[0]).replace(/\+/g," ")){f=g.slice(1).join("=");break a}}f=void 0}b.query=T(f||"")||{};f=A(c,"fragment");e=f.match(Q("_gl"));b.fragment=T(e&&e[3]||"")||{};a&&ba(c,d,f)}};
function U(a,b){if(a=Q(a).exec(b)){var c=a[2],d=a[4];b=a[1];d&&(b=b+c+d)}return b}
var ba=function(a,b,c){function d(e,g){e=U("_gl",e);e.length&&(e=g+e);return e}if(r.history&&r.history.replaceState){var f=Q("_gl");if(f.test(b)||f.test(c))a=A(a,"path"),b=d(b,"?"),c=d(c,"#"),r.history.replaceState({},void 0,""+a+b+c)}},T=function(a){var b=void 0===b?3:b;try{if(a){a:{for(var c=0;3>c;++c){var d=P.exec(a);if(d){var f=d;break a}a=decodeURIComponent(a)}f=void 0}if(f&&"1"===f[1]){var e=f[2],g=f[3];a:{for(f=0;f<b;++f)if(e===R(g,f)){var h=!0;break a}h=!1}if(h){b={};var k=g?g.split("*"):
[];for(g=0;g<k.length;g+=2)b[k[g]]=H(k[g+1]);return b}}}}catch(l){}};function V(a,b,c,d){function f(k){k=U(a,k);var l=k.charAt(k.length-1);k&&"&"!==l&&(k+="&");return k+h}d=void 0===d?!1:d;var e=aa.exec(c);if(!e)return"";c=e[1];var g=e[2]||"";e=e[3]||"";var h=a+"="+b;d?e="#"+f(e.substring(1)):g="?"+f(g.substring(1));return""+c+g+e}
function W(a,b){var c="FORM"===(a.tagName||"").toUpperCase(),d=O(b,1,c),f=O(b,2,c);b=O(b,3,c);q(d)&&(d=S(d),c?X("_gl",d,a):Y("_gl",d,a,!1));!c&&q(f)&&(c=S(f),Y("_gl",c,a,!0));for(var e in b)b.hasOwnProperty(e)&&Z(e,b[e],a)}function Z(a,b,c,d){if(c.tagName){if("a"===c.tagName.toLowerCase())return Y(a,b,c,d);if("form"===c.tagName.toLowerCase())return X(a,b,c)}if("string"==typeof c)return V(a,b,c,d)}function Y(a,b,c,d){c.href&&(a=V(a,b,c.href,void 0===d?!1:d),v.test(a)&&(c.href=a))}
function X(a,b,c){if(c&&c.action){var d=(c.method||"").toLowerCase();if("get"===d){d=c.childNodes||[];for(var f=!1,e=0;e<d.length;e++){var g=d[e];if(g.name===a){g.setAttribute("value",b);f=!0;break}}f||(d=t.createElement("input"),d.setAttribute("type","hidden"),d.setAttribute("name",a),d.setAttribute("value",b),c.appendChild(d))}else"post"===d&&(a=V(a,b,c.action),v.test(a)&&(c.action=a))}}
var J=function(a){try{a:{for(var b=100;a&&0<b;){if(a.href&&a.nodeName.match(/^a(?:rea)?$/i)){var c=a;break a}a=a.parentNode;b--}c=null}if(c){var d=c.protocol;"http:"!==d&&"https:"!==d||W(c,c.hostname)}}catch(f){}},K=function(a){try{if(a.action){var b=A(B(a.action),"host");W(a,b)}}catch(c){}};n("google_tag_data.glBridge.auto",function(a,b,c,d){N();c="fragment"===c?2:1;a={callback:a,domains:b,fragment:2===c,placement:c,forms:!!d,sameHost:!1};L().decorators.push(a)});n("google_tag_data.glBridge.decorate",function(a,b,c){a=S(a);return Z("_gl",a,b,!!c)});n("google_tag_data.glBridge.generate",S);n("google_tag_data.glBridge.get",function(a,b){var c=ca(!!b);b=L();b.data||(b.data={query:{},fragment:{}},c(b.data));c={};if(b=b.data)p(c,b.query),a&&p(c,b.fragment);return c});})(window);
(function(){function La(a){var b=1,c;if(a)for(b=0,c=a.length-1;0<=c;c--){var d=a.charCodeAt(c);b=(b<<6&268435455)+d+(d<<14);d=b&266338304;b=0!=d?b^d>>21:b}return b};/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
var $c=function(a){this.w=a||[]};$c.prototype.set=function(a){this.w[a]=!0};$c.prototype.encode=function(){for(var a=[],b=0;b<this.w.length;b++)this.w[b]&&(a[Math.floor(b/6)]^=1<<b%6);for(b=0;b<a.length;b++)a[b]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".charAt(a[b]||0);return a.join("")+"~"};var ha=window.GoogleAnalyticsObject,wa;if(wa=void 0!=ha)wa=-1<(ha.constructor+"").indexOf("String");var Qa;if(Qa=wa){var Za=window.GoogleAnalyticsObject;Qa=Za?Za.replace(/^[\s\xa0]+|[\s\xa0]+$/g,""):""}var gb=Qa||"ga",jd=/^(?:utma\.)?\d+\.\d+$/,kd=/^amp-[\w.-]{22,64}$/,Ba=!1;var vd=new $c;function J(a){vd.set(a)}var Td=function(a){a=Dd(a);a=new $c(a);for(var b=vd.w.slice(),c=0;c<a.w.length;c++)b[c]=b[c]||a.w[c];return(new $c(b)).encode()},Dd=function(a){a=a.get(Gd);ka(a)||(a=[]);return a};var ea=function(a){return"function"==typeof a},ka=function(a){return"[object Array]"==Object.prototype.toString.call(Object(a))},qa=function(a){return void 0!=a&&-1<(a.constructor+"").indexOf("String")},D=function(a,b){return 0==a.indexOf(b)},sa=function(a){return a?a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,""):""},ra=function(){for(var a=O.navigator.userAgent+(M.cookie?M.cookie:"")+(M.referrer?M.referrer:""),b=a.length,c=O.history.length;0<c;)a+=c--^b++;return[hd()^La(a)&2147483647,Math.round((new Date).getTime()/
1E3)].join(".")},ta=function(a){var b=M.createElement("img");b.width=1;b.height=1;b.src=a;return b},ua=function(){},K=function(a){if(encodeURIComponent instanceof Function)return encodeURIComponent(a);J(28);return a},L=function(a,b,c,d){try{a.addEventListener?a.addEventListener(b,c,!!d):a.attachEvent&&a.attachEvent("on"+b,c)}catch(e){J(27)}},f=/^[\w\-:/.?=&%!\[\]]+$/,Nd=/^[\w+/_-]+[=]{0,2}$/,be=function(a,b){return E(M.location[b?"href":"search"],a)},E=function(a,b){return(a=a.match("(?:&|#|\\?)"+
K(b).replace(/([.*+?^=!:${}()|\[\]\/\\])/g,"\\$1")+"=([^&#]*)"))&&2==a.length?a[1]:""},xa=function(){var a=""+M.location.hostname;return 0==a.indexOf("www.")?a.substring(4):a},de=function(a,b){var c=a.indexOf(b);if(5==c||6==c)if(a=a.charAt(c+b.length),"/"==a||"?"==a||""==a||":"==a)return!0;return!1},ya=function(a,b){var c=M.referrer;if(/^(https?|android-app):\/\//i.test(c)){if(a)return c;a="//"+M.location.hostname;if(!de(c,a))return b&&(b=a.replace(/\./g,"-")+".cdn.ampproject.org",de(c,b))?void 0:
c}},za=function(a,b){if(1==b.length&&null!=b[0]&&"object"===typeof b[0])return b[0];for(var c={},d=Math.min(a.length+1,b.length),e=0;e<d;e++)if("object"===typeof b[e]){for(var g in b[e])b[e].hasOwnProperty(g)&&(c[g]=b[e][g]);break}else e<a.length&&(c[a[e]]=b[e]);return c};var ee=function(){this.keys=[];this.values={};this.m={}};ee.prototype.set=function(a,b,c){this.keys.push(a);c?this.m[":"+a]=b:this.values[":"+a]=b};ee.prototype.get=function(a){return this.m.hasOwnProperty(":"+a)?this.m[":"+a]:this.values[":"+a]};ee.prototype.map=function(a){for(var b=0;b<this.keys.length;b++){var c=this.keys[b],d=this.get(c);d&&a(c,d)}};var O=window,M=document,va=function(a,b){return setTimeout(a,b)};var F=window,Ea=document,G=function(a){var b=F._gaUserPrefs;if(b&&b.ioo&&b.ioo()||a&&!0===F["ga-disable-"+a])return!0;try{var c=F.external;if(c&&c._gaUserPrefs&&"oo"==c._gaUserPrefs)return!0}catch(g){}a=[];b=String(Ea.cookie||document.cookie).split(";");for(c=0;c<b.length;c++){var d=b[c].split("="),e=d[0].replace(/^\s*|\s*$/g,"");e&&"AMP_TOKEN"==e&&((d=d.slice(1).join("=").replace(/^\s*|\s*$/g,""))&&(d=decodeURIComponent(d)),a.push(d))}for(b=0;b<a.length;b++)if("$OPT_OUT"==a[b])return!0;return Ea.getElementById("__gaOptOutExtension")?
!0:!1};var Ca=function(a){var b=[],c=M.cookie.split(";");a=new RegExp("^\\s*"+a+"=\\s*(.*?)\\s*$");for(var d=0;d<c.length;d++){var e=c[d].match(a);e&&b.push(e[1])}return b},zc=function(a,b,c,d,e,g,ca){e=G(e)?!1:eb.test(M.location.hostname)||"/"==c&&vc.test(d)?!1:!0;if(!e)return!1;b&&1200<b.length&&(b=b.substring(0,1200));c=a+"="+b+"; path="+c+"; ";g&&(c+="expires="+(new Date((new Date).getTime()+g)).toGMTString()+"; ");d&&"none"!==d&&(c+="domain="+d+";");ca&&(c+=ca+";");d=M.cookie;M.cookie=c;if(!(d=d!=M.cookie))a:{a=
Ca(a);for(d=0;d<a.length;d++)if(b==a[d]){d=!0;break a}d=!1}return d},Cc=function(a){return encodeURIComponent?encodeURIComponent(a).replace(/\(/g,"%28").replace(/\)/g,"%29"):a},vc=/^(www\.)?google(\.com?)?(\.[a-z]{2})?$/,eb=/(^|\.)doubleclick\.net$/i;var oc,Id=/^.*Version\/?(\d+)[^\d].*$/i,ne=function(){if(void 0!==O.__ga4__)return O.__ga4__;if(void 0===oc){var a=O.navigator.userAgent;if(a){var b=a;try{b=decodeURIComponent(a)}catch(c){}if(a=!(0<=b.indexOf("Chrome"))&&!(0<=b.indexOf("CriOS"))&&(0<=b.indexOf("Safari/")||0<=b.indexOf("Safari,")))b=Id.exec(b),a=11<=(b?Number(b[1]):-1);oc=a}else oc=!1}return oc};var Fa,Ga,fb,Ab,ja=/^https?:\/\/[^/]*cdn\.ampproject\.org\//,Ue=/^(?:www\.|m\.|amp\.)+/,Ub=[],da=function(a){if(ye(a[Kd])){if(void 0===Ab){var b;if(b=(b=De.get())&&b._ga||void 0)Ab=b,J(81)}if(void 0!==Ab)return a[Q]||(a[Q]=Ab),!1}if(a[Kd]){J(67);if(a[ac]&&"cookie"!=a[ac])return!1;if(void 0!==Ab)a[Q]||(a[Q]=Ab);else{a:{b=String(a[W]||xa());var c=String(a[Yb]||"/"),d=Ca(String(a[U]||"_ga"));b=na(d,b,c);if(!b||jd.test(b))b=!0;else if(b=Ca("AMP_TOKEN"),0==b.length)b=!0;else{if(1==b.length&&(b=decodeURIComponent(b[0]),
"$RETRIEVING"==b||"$OPT_OUT"==b||"$ERROR"==b||"$NOT_FOUND"==b)){b=!0;break a}b=!1}}if(b&&tc(ic,String(a[Na])))return!0}}return!1},ic=function(){Z.D([ua])},tc=function(a,b){var c=Ca("AMP_TOKEN");if(1<c.length)return J(55),!1;c=decodeURIComponent(c[0]||"");if("$OPT_OUT"==c||"$ERROR"==c||G(b))return J(62),!1;if(!ja.test(M.referrer)&&"$NOT_FOUND"==c)return J(68),!1;if(void 0!==Ab)return J(56),va(function(){a(Ab)},0),!0;if(Fa)return Ub.push(a),!0;if("$RETRIEVING"==c)return J(57),va(function(){tc(a,b)},
1E4),!0;Fa=!0;c&&"$"!=c[0]||(xc("$RETRIEVING",3E4),setTimeout(Mc,3E4),c="");return Pc(c,b)?(Ub.push(a),!0):!1},Pc=function(a,b,c){if(!window.JSON)return J(58),!1;var d=O.XMLHttpRequest;if(!d)return J(59),!1;var e=new d;if(!("withCredentials"in e))return J(60),!1;e.open("POST",(c||"https://ampcid.google.com/v1/publisher:getClientId")+"?key=AIzaSyA65lEHUEizIsNtlbNo-l2K18dT680nsaM",!0);e.withCredentials=!0;e.setRequestHeader("Content-Type","text/plain");e.onload=function(){Fa=!1;if(4==e.readyState){try{200!=
e.status&&(J(61),Qc("","$ERROR",3E4));var g=JSON.parse(e.responseText);g.optOut?(J(63),Qc("","$OPT_OUT",31536E6)):g.clientId?Qc(g.clientId,g.securityToken,31536E6):!c&&g.alternateUrl?(Ga&&clearTimeout(Ga),Fa=!0,Pc(a,b,g.alternateUrl)):(J(64),Qc("","$NOT_FOUND",36E5))}catch(ca){J(65),Qc("","$ERROR",3E4)}e=null}};d={originScope:"AMP_ECID_GOOGLE"};a&&(d.securityToken=a);e.send(JSON.stringify(d));Ga=va(function(){J(66);Qc("","$ERROR",3E4)},1E4);return!0},Mc=function(){Fa=!1},xc=function(a,b){if(void 0===
fb){fb="";for(var c=id(),d=0;d<c.length;d++){var e=c[d];if(zc("AMP_TOKEN",encodeURIComponent(a),"/",e,"",b)){fb=e;return}}}zc("AMP_TOKEN",encodeURIComponent(a),"/",fb,"",b)},Qc=function(a,b,c){Ga&&clearTimeout(Ga);b&&xc(b,c);Ab=a;b=Ub;Ub=[];for(c=0;c<b.length;c++)b[c](a)},ye=function(a){a:{if(ja.test(M.referrer)){var b=M.location.hostname.replace(Ue,"");b:{var c=M.referrer;c=c.replace(/^https?:\/\//,"");var d=c.replace(/^[^/]+/,"").split("/"),e=d[2];d=(d="s"==e?d[3]:e)?decodeURIComponent(d):d;if(!d){if(0==
c.indexOf("xn--")){c="";break b}(c=c.match(/(.*)\.cdn\.ampproject\.org\/?$/))&&2==c.length&&(d=c[1].replace(/-/g,".").replace(/\.\./g,"-"))}c=d?d.replace(Ue,""):""}(d=b===c)||(c="."+c,d=b.substring(b.length-c.length,b.length)===c);if(d){b=!0;break a}else J(78)}b=!1}return b&&!1!==a};var bd=function(a){return(a?"https:":Ba||"https:"==M.location.protocol?"https:":"http:")+"//www.google-analytics.com"},Da=function(a){this.name="len";this.message=a+"-8192"},ba=function(a,b,c){c=c||ua;if(2036>=b.length)wc(a,b,c);else if(8192>=b.length)x(a,b,c)||wd(a,b,c)||wc(a,b,c);else throw ge("len",b.length),new Da(b.length);},pe=function(a,b,c,d){d=d||ua;wd(a+"?"+b,"",d,c)},wc=function(a,b,c){var d=ta(a+"?"+b);d.onload=d.onerror=function(){d.onload=null;d.onerror=null;c()}},wd=function(a,b,c,
d){var e=O.XMLHttpRequest;if(!e)return!1;var g=new e;if(!("withCredentials"in g))return!1;a=a.replace(/^http:/,"https:");g.open("POST",a,!0);g.withCredentials=!0;g.setRequestHeader("Content-Type","text/plain");g.onreadystatechange=function(){if(4==g.readyState){if(d)try{var ca=g.responseText;if(1>ca.length)ge("xhr","ver","0"),c();else if("1"!=ca.charAt(0))ge("xhr","ver",String(ca.length)),c();else if(3<d.count++)ge("xhr","tmr",""+d.count),c();else if(1==ca.length)c();else{var l=ca.charAt(1);if("d"==
l)pe("https://stats.g.doubleclick.net/j/collect",d.U,d,c);else if("g"==l){wc("https://www.google.%/ads/ga-audiences".replace("%","com"),d.google,c);var k=ca.substring(2);k&&(/^[a-z.]{1,6}$/.test(k)?wc("https://www.google.%/ads/ga-audiences".replace("%",k),d.google,ua):ge("tld","bcc",k))}else ge("xhr","brc",l),c()}}catch(w){ge("xhr","rsp"),c()}else c();g=null}};g.send(b);return!0},x=function(a,b,c){return O.navigator.sendBeacon?O.navigator.sendBeacon(a,b)?(c(),!0):!1:!1},ge=function(a,b,c){1<=100*
Math.random()||G("?")||(a=["t=error","_e="+a,"_v=j81","sr=1"],b&&a.push("_f="+b),c&&a.push("_m="+K(c.substring(0,100))),a.push("aip=1"),a.push("z="+hd()),wc(bd(!0)+"/u/d",a.join("&"),ua))};var qc=function(){return O.gaData=O.gaData||{}},h=function(a){var b=qc();return b[a]=b[a]||{}};var Ha=function(){this.M=[]};Ha.prototype.add=function(a){this.M.push(a)};Ha.prototype.D=function(a){try{for(var b=0;b<this.M.length;b++){var c=a.get(this.M[b]);c&&ea(c)&&c.call(O,a)}}catch(d){}b=a.get(Ia);b!=ua&&ea(b)&&(a.set(Ia,ua,!0),setTimeout(b,10))};function Ja(a){if(100!=a.get(Ka)&&La(P(a,Q))%1E4>=100*R(a,Ka))throw"abort";}function Ma(a){if(G(P(a,Na)))throw"abort";}function Oa(){var a=M.location.protocol;if("http:"!=a&&"https:"!=a)throw"abort";}
function Pa(a){try{O.navigator.sendBeacon?J(42):O.XMLHttpRequest&&"withCredentials"in new O.XMLHttpRequest&&J(40)}catch(c){}a.set(ld,Td(a),!0);a.set(Ac,R(a,Ac)+1);var b=[];ue.map(function(c,d){d.F&&(c=a.get(c),void 0!=c&&c!=d.defaultValue&&("boolean"==typeof c&&(c*=1),b.push(d.F+"="+K(""+c))))});!1===a.get(xe)&&b.push("npa=1");b.push("z="+Bd());a.set(Ra,b.join("&"),!0)}
function Sa(a){var b=P(a,fa);!b&&a.get(Vd)&&(b="beacon");var c=P(a,gd),d=P(a,oe),e=c||(d?d+"/3":bd(!1)+"/collect");switch(P(a,ad)){case "d":e=c||(d?d+"/32":bd(!1)+"/j/collect");b=a.get(qe)||void 0;pe(e,P(a,Ra),b,a.Z(Ia));break;case "b":e=c||(d?d+"/31":bd(!1)+"/r/collect");default:b?(c=P(a,Ra),d=(d=a.Z(Ia))||ua,"image"==b?wc(e,c,d):"xhr"==b&&wd(e,c,d)||"beacon"==b&&x(e,c,d)||ba(e,c,d)):ba(e,P(a,Ra),a.Z(Ia))}e=P(a,Na);e=h(e);b=e.hitcount;e.hitcount=b?b+1:1;e=P(a,Na);delete h(e).pending_experiments;
a.set(Ia,ua,!0)}function Hc(a){qc().expId&&a.set(Nc,qc().expId);qc().expVar&&a.set(Oc,qc().expVar);var b=P(a,Na);if(b=h(b).pending_experiments){var c=[];for(d in b)b.hasOwnProperty(d)&&b[d]&&c.push(encodeURIComponent(d)+"."+encodeURIComponent(b[d]));var d=c.join("!")}else d=void 0;d&&a.set(m,d,!0)}function cd(){if(O.navigator&&"preview"==O.navigator.loadPurpose)throw"abort";}function yd(a){var b=O.gaDevIds;ka(b)&&0!=b.length&&a.set("&did",b.join(","),!0)}
function vb(a){if(!a.get(Na))throw"abort";};var hd=function(){return Math.round(2147483647*Math.random())},Bd=function(){try{var a=new Uint32Array(1);O.crypto.getRandomValues(a);return a[0]&2147483647}catch(b){return hd()}};function Ta(a){var b=R(a,Ua);500<=b&&J(15);var c=P(a,Va);if("transaction"!=c&&"item"!=c){c=R(a,Wa);var d=(new Date).getTime(),e=R(a,Xa);0==e&&a.set(Xa,d);e=Math.round(2*(d-e)/1E3);0<e&&(c=Math.min(c+e,20),a.set(Xa,d));if(0>=c)throw"abort";a.set(Wa,--c)}a.set(Ua,++b)};var Ya=function(){this.data=new ee};Ya.prototype.get=function(a){var b=$a(a),c=this.data.get(a);b&&void 0==c&&(c=ea(b.defaultValue)?b.defaultValue():b.defaultValue);return b&&b.Z?b.Z(this,a,c):c};var P=function(a,b){a=a.get(b);return void 0==a?"":""+a},R=function(a,b){a=a.get(b);return void 0==a||""===a?0:Number(a)};Ya.prototype.Z=function(a){return(a=this.get(a))&&ea(a)?a:ua};
Ya.prototype.set=function(a,b,c){if(a)if("object"==typeof a)for(var d in a)a.hasOwnProperty(d)&&ab(this,d,a[d],c);else ab(this,a,b,c)};var ab=function(a,b,c,d){if(void 0!=c)switch(b){case Na:wb.test(c)}var e=$a(b);e&&e.o?e.o(a,b,c,d):a.data.set(b,c,d)};var ue=new ee,ve=[],bb=function(a,b,c,d,e){this.name=a;this.F=b;this.Z=d;this.o=e;this.defaultValue=c},$a=function(a){var b=ue.get(a);if(!b)for(var c=0;c<ve.length;c++){var d=ve[c],e=d[0].exec(a);if(e){b=d[1](e);ue.set(b.name,b);break}}return b},yc=function(a){var b;ue.map(function(c,d){d.F==a&&(b=d)});return b&&b.name},S=function(a,b,c,d,e){a=new bb(a,b,c,d,e);ue.set(a.name,a);return a.name},cb=function(a,b){ve.push([new RegExp("^"+a+"$"),b])},T=function(a,b,c){return S(a,b,c,void 0,db)},db=function(){};var hb=T("apiVersion","v"),ib=T("clientVersion","_v");S("anonymizeIp","aip");var jb=S("adSenseId","a"),Va=S("hitType","t"),Ia=S("hitCallback"),Ra=S("hitPayload");S("nonInteraction","ni");S("currencyCode","cu");S("dataSource","ds");var Vd=S("useBeacon",void 0,!1),fa=S("transport");S("sessionControl","sc","");S("sessionGroup","sg");S("queueTime","qt");var Ac=S("_s","_s");S("screenName","cd");var kb=S("location","dl",""),lb=S("referrer","dr"),mb=S("page","dp","");S("hostname","dh");
var nb=S("language","ul"),ob=S("encoding","de");S("title","dt",function(){return M.title||void 0});cb("contentGroup([0-9]+)",function(a){return new bb(a[0],"cg"+a[1])});var pb=S("screenColors","sd"),qb=S("screenResolution","sr"),rb=S("viewportSize","vp"),sb=S("javaEnabled","je"),tb=S("flashVersion","fl");S("campaignId","ci");S("campaignName","cn");S("campaignSource","cs");S("campaignMedium","cm");S("campaignKeyword","ck");S("campaignContent","cc");
var ub=S("eventCategory","ec"),xb=S("eventAction","ea"),yb=S("eventLabel","el"),zb=S("eventValue","ev"),Bb=S("socialNetwork","sn"),Cb=S("socialAction","sa"),Db=S("socialTarget","st"),Eb=S("l1","plt"),Fb=S("l2","pdt"),Gb=S("l3","dns"),Hb=S("l4","rrt"),Ib=S("l5","srt"),Jb=S("l6","tcp"),Kb=S("l7","dit"),Lb=S("l8","clt"),Ve=S("l9","_gst"),We=S("l10","_gbt"),Xe=S("l11","_cst"),Ye=S("l12","_cbt"),Mb=S("timingCategory","utc"),Nb=S("timingVar","utv"),Ob=S("timingLabel","utl"),Pb=S("timingValue","utt");
S("appName","an");S("appVersion","av","");S("appId","aid","");S("appInstallerId","aiid","");S("exDescription","exd");S("exFatal","exf");var Nc=S("expId","xid"),Oc=S("expVar","xvar"),m=S("exp","exp"),Rc=S("_utma","_utma"),Sc=S("_utmz","_utmz"),Tc=S("_utmht","_utmht"),Ua=S("_hc",void 0,0),Xa=S("_ti",void 0,0),Wa=S("_to",void 0,20);cb("dimension([0-9]+)",function(a){return new bb(a[0],"cd"+a[1])});cb("metric([0-9]+)",function(a){return new bb(a[0],"cm"+a[1])});S("linkerParam",void 0,void 0,Bc,db);
var Ze=T("_cd2l",void 0,!1),ld=S("usage","_u"),Gd=S("_um");S("forceSSL",void 0,void 0,function(){return Ba},function(a,b,c){J(34);Ba=!!c});var ed=S("_j1","jid"),ia=S("_j2","gjid");cb("\\&(.*)",function(a){var b=new bb(a[0],a[1]),c=yc(a[0].substring(1));c&&(b.Z=function(d){return d.get(c)},b.o=function(d,e,g,ca){d.set(c,g,ca)},b.F=void 0);return b});
var Qb=T("_oot"),dd=S("previewTask"),Rb=S("checkProtocolTask"),md=S("validationTask"),Sb=S("checkStorageTask"),Uc=S("historyImportTask"),Tb=S("samplerTask"),Vb=S("_rlt"),Wb=S("buildHitTask"),Xb=S("sendHitTask"),Vc=S("ceTask"),zd=S("devIdTask"),Cd=S("timingTask"),Ld=S("displayFeaturesTask"),oa=S("customTask"),V=T("name"),Q=T("clientId","cid"),n=T("clientIdTime"),xd=T("storedClientId"),Ad=S("userId","uid"),Na=T("trackingId","tid"),U=T("cookieName",void 0,"_ga"),W=T("cookieDomain"),Yb=T("cookiePath",
void 0,"/"),Zb=T("cookieExpires",void 0,63072E3),Hd=T("cookieUpdate",void 0,!0),Be=T("cookieFlags",void 0,""),$b=T("legacyCookieDomain"),Wc=T("legacyHistoryImport",void 0,!0),ac=T("storage",void 0,"cookie"),bc=T("allowLinker",void 0,!1),cc=T("allowAnchor",void 0,!0),Ka=T("sampleRate","sf",100),dc=T("siteSpeedSampleRate",void 0,1),ec=T("alwaysSendReferrer",void 0,!1),I=T("_gid","_gid"),la=T("_gcn"),Kd=T("useAmpClientId"),ce=T("_gclid"),fe=T("_gt"),he=T("_ge",void 0,7776E6),ie=T("_gclsrc"),je=T("storeGac",
void 0,!0),oe=S("_x_19"),gd=S("transportUrl"),Md=S("_r","_r"),qe=S("_dp"),ad=S("_jt",void 0,"n"),Ud=S("allowAdFeatures",void 0,!0),xe=S("allowAdPersonalizationSignals",void 0,!0);function X(a,b,c,d){b[a]=function(){try{return d&&J(d),c.apply(this,arguments)}catch(e){throw ge("exc",a,e&&e.name),e;}}};var Od=function(){this.V=100;this.$=this.fa=!1;this.oa="detourexp";this.groups=1},Ed=function(a){var b=new Od,c;if(b.fa&&b.$)return 0;b.$=!0;if(a){if(b.oa&&void 0!==a.get(b.oa))return R(a,b.oa);if(0==a.get(dc))return 0}if(0==b.V)return 0;void 0===c&&(c=Bd());return 0==c%b.V?Math.floor(c/b.V)%b.groups+1:0};function fc(){var a,b;if((b=(b=O.navigator)?b.plugins:null)&&b.length)for(var c=0;c<b.length&&!a;c++){var d=b[c];-1<d.name.indexOf("Shockwave Flash")&&(a=d.description)}if(!a)try{var e=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");a=e.GetVariable("$version")}catch(g){}if(!a)try{e=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6"),a="WIN 6,0,21,0",e.AllowScriptAccess="always",a=e.GetVariable("$version")}catch(g){}if(!a)try{e=new ActiveXObject("ShockwaveFlash.ShockwaveFlash"),a=e.GetVariable("$version")}catch(g){}a&&
(e=a.match(/[\d]+/g))&&3<=e.length&&(a=e[0]+"."+e[1]+" r"+e[2]);return a||void 0};var aa=function(a){var b=Math.min(R(a,dc),100);return La(P(a,Q))%100>=b?!1:!0},gc=function(a){var b={};if(Ec(b)||Fc(b)){var c=b[Eb];void 0==c||Infinity==c||isNaN(c)||(0<c?(Y(b,Gb),Y(b,Jb),Y(b,Ib),Y(b,Fb),Y(b,Hb),Y(b,Kb),Y(b,Lb),Y(b,Ve),Y(b,We),Y(b,Xe),Y(b,Ye),va(function(){a(b)},10)):L(O,"load",function(){gc(a)},!1))}},Ec=function(a){var b=O.performance||O.webkitPerformance;b=b&&b.timing;if(!b)return!1;var c=b.navigationStart;if(0==c)return!1;a[Eb]=b.loadEventStart-c;a[Gb]=b.domainLookupEnd-b.domainLookupStart;
a[Jb]=b.connectEnd-b.connectStart;a[Ib]=b.responseStart-b.requestStart;a[Fb]=b.responseEnd-b.responseStart;a[Hb]=b.fetchStart-c;a[Kb]=b.domInteractive-c;a[Lb]=b.domContentLoadedEventStart-c;a[Ve]=N.L-c;a[We]=N.ya-c;O.google_tag_manager&&O.google_tag_manager._li&&(b=O.google_tag_manager._li,a[Xe]=b.cst,a[Ye]=b.cbt);return!0},Fc=function(a){if(O.top!=O)return!1;var b=O.external,c=b&&b.onloadT;b&&!b.isValidLoadTime&&(c=void 0);2147483648<c&&(c=void 0);0<c&&b.setPageReadyTime();if(void 0==c)return!1;
a[Eb]=c;return!0},Y=function(a,b){var c=a[b];if(isNaN(c)||Infinity==c||0>c)a[b]=void 0},Fd=function(a){return function(b){if("pageview"==b.get(Va)&&!a.I){a.I=!0;var c=aa(b),d=0<E(P(b,kb),"gclid").length;(c||d)&&gc(function(e){c&&a.send("timing",e);d&&a.send("adtiming",e)})}}};var hc=!1,mc=function(a){if("cookie"==P(a,ac)){if(a.get(Hd)||P(a,xd)!=P(a,Q)){var b=1E3*R(a,Zb);ma(a,Q,U,b)}(a.get(Hd)||uc(a)!=P(a,I))&&ma(a,I,la,864E5);if(a.get(je)){var c=P(a,ce);if(c){var d=Math.min(R(a,he),1E3*R(a,Zb));d=Math.min(d,1E3*R(a,fe)+d-(new Date).getTime());a.data.set(he,d);b={};var e=P(a,fe),g=P(a,ie),ca=kc(P(a,Yb)),l=lc(P(a,W)),k=P(a,Na);a=P(a,Be);g&&"aw.ds"!=g?b&&(b.ua=!0):(c=["1",e,Cc(c)].join("."),0<d&&(b&&(b.ta=!0),zc("_gac_"+Cc(k),c,ca,l,k,d,a)));le(b)}}else J(75)}},ma=function(a,
b,c,d){var e=nd(a,b);if(e){c=P(a,c);var g=kc(P(a,Yb)),ca=lc(P(a,W)),l=P(a,Be),k=P(a,Na);if("auto"!=ca)zc(c,e,g,ca,k,d,l)&&(hc=!0);else{J(32);for(var w=id(),Ce=0;Ce<w.length;Ce++)if(ca=w[Ce],a.data.set(W,ca),e=nd(a,b),zc(c,e,g,ca,k,d,l)){hc=!0;return}a.data.set(W,"auto")}}},uc=function(a){var b=Ca(P(a,la));return Xd(a,b)},nc=function(a){if("cookie"==P(a,ac)&&!hc&&(mc(a),!hc))throw"abort";},Yc=function(a){if(a.get(Wc)){var b=P(a,W),c=P(a,$b)||xa(),d=Xc("__utma",c,b);d&&(J(19),a.set(Tc,(new Date).getTime(),
!0),a.set(Rc,d.R),(b=Xc("__utmz",c,b))&&d.hash==b.hash&&a.set(Sc,b.R))}},nd=function(a,b){b=Cc(P(a,b));var c=lc(P(a,W)).split(".").length;a=jc(P(a,Yb));1<a&&(c+="-"+a);return b?["GA1",c,b].join("."):""},Xd=function(a,b){return na(b,P(a,W),P(a,Yb))},na=function(a,b,c){if(!a||1>a.length)J(12);else{for(var d=[],e=0;e<a.length;e++){var g=a[e];var ca=g.split(".");var l=ca.shift();("GA1"==l||"1"==l)&&1<ca.length?(g=ca.shift().split("-"),1==g.length&&(g[1]="1"),g[0]*=1,g[1]*=1,ca={H:g,s:ca.join(".")}):ca=
kd.test(g)?{H:[0,0],s:g}:void 0;ca&&d.push(ca)}if(1==d.length)return J(13),d[0].s;if(0==d.length)J(12);else{J(14);d=Gc(d,lc(b).split(".").length,0);if(1==d.length)return d[0].s;d=Gc(d,jc(c),1);1<d.length&&J(41);return d[0]&&d[0].s}}},Gc=function(a,b,c){for(var d=[],e=[],g,ca=0;ca<a.length;ca++){var l=a[ca];l.H[c]==b?d.push(l):void 0==g||l.H[c]<g?(e=[l],g=l.H[c]):l.H[c]==g&&e.push(l)}return 0<d.length?d:e},lc=function(a){return 0==a.indexOf(".")?a.substr(1):a},id=function(){var a=[],b=xa().split(".");
if(4==b.length){var c=b[b.length-1];if(parseInt(c,10)==c)return["none"]}for(c=b.length-2;0<=c;c--)a.push(b.slice(c).join("."));b=M.location.hostname;eb.test(b)||vc.test(b)||a.push("none");return a},kc=function(a){if(!a)return"/";1<a.length&&a.lastIndexOf("/")==a.length-1&&(a=a.substr(0,a.length-1));0!=a.indexOf("/")&&(a="/"+a);return a},jc=function(a){a=kc(a);return"/"==a?1:a.split("/").length},le=function(a){a.ta&&J(77);a.na&&J(74);a.pa&&J(73);a.ua&&J(69)};function Xc(a,b,c){"none"==b&&(b="");var d=[],e=Ca(a);a="__utma"==a?6:2;for(var g=0;g<e.length;g++){var ca=(""+e[g]).split(".");ca.length>=a&&d.push({hash:ca[0],R:e[g],O:ca})}if(0!=d.length)return 1==d.length?d[0]:Zc(b,d)||Zc(c,d)||Zc(null,d)||d[0]}function Zc(a,b){if(null==a)var c=a=1;else c=La(a),a=La(D(a,".")?a.substring(1):"."+a);for(var d=0;d<b.length;d++)if(b[d].hash==c||b[d].hash==a)return b[d]};var Jc=new RegExp(/^https?:\/\/([^\/:]+)/),De=O.google_tag_data.glBridge,Kc=/(.*)([?&#])(?:_ga=[^&#]*)(?:&?)(.*)/,od=/(.*)([?&#])(?:_gac=[^&#]*)(?:&?)(.*)/;function Bc(a){if(a.get(Ze))return J(35),De.generate($e(a));var b=P(a,Q),c=P(a,I)||"";b="_ga=2."+K(pa(c+b,0)+"."+c+"-"+b);(a=af(a))?(J(44),a="&_gac=1."+K([pa(a.qa,0),a.timestamp,a.qa].join("."))):a="";return b+a}
function Ic(a,b){var c=new Date,d=O.navigator,e=d.plugins||[];a=[a,d.userAgent,c.getTimezoneOffset(),c.getYear(),c.getDate(),c.getHours(),c.getMinutes()+b];for(b=0;b<e.length;++b)a.push(e[b].description);return La(a.join("."))}function pa(a,b){var c=new Date,d=O.navigator,e=c.getHours()+Math.floor((c.getMinutes()+b)/60);return La([a,d.userAgent,d.language||"",c.getTimezoneOffset(),c.getYear(),c.getDate()+Math.floor(e/24),(24+e)%24,(60+c.getMinutes()+b)%60].join("."))}
var Dc=function(a){J(48);this.target=a;this.T=!1};Dc.prototype.ca=function(a,b){if(a){if(this.target.get(Ze))return De.decorate($e(this.target),a,b);if(a.tagName){if("a"==a.tagName.toLowerCase()){a.href&&(a.href=qd(this,a.href,b));return}if("form"==a.tagName.toLowerCase())return rd(this,a)}if("string"==typeof a)return qd(this,a,b)}};
var qd=function(a,b,c){var d=Kc.exec(b);d&&3<=d.length&&(b=d[1]+(d[3]?d[2]+d[3]:""));(d=od.exec(b))&&3<=d.length&&(b=d[1]+(d[3]?d[2]+d[3]:""));a=a.target.get("linkerParam");var e=b.indexOf("?");d=b.indexOf("#");c?b+=(-1==d?"#":"&")+a:(c=-1==e?"?":"&",b=-1==d?b+(c+a):b.substring(0,d)+c+a+b.substring(d));b=b.replace(/&+_ga=/,"&_ga=");return b=b.replace(/&+_gac=/,"&_gac=")},rd=function(a,b){if(b&&b.action)if("get"==b.method.toLowerCase()){a=a.target.get("linkerParam").split("&");for(var c=0;c<a.length;c++){var d=
a[c].split("="),e=d[1];d=d[0];for(var g=b.childNodes||[],ca=!1,l=0;l<g.length;l++)if(g[l].name==d){g[l].setAttribute("value",e);ca=!0;break}ca||(g=M.createElement("input"),g.setAttribute("type","hidden"),g.setAttribute("name",d),g.setAttribute("value",e),b.appendChild(g))}}else"post"==b.method.toLowerCase()&&(b.action=qd(a,b.action))};
Dc.prototype.S=function(a,b,c){function d(g){try{g=g||O.event;a:{var ca=g.target||g.srcElement;for(g=100;ca&&0<g;){if(ca.href&&ca.nodeName.match(/^a(?:rea)?$/i)){var l=ca;break a}ca=ca.parentNode;g--}l={}}("http:"==l.protocol||"https:"==l.protocol)&&sd(a,l.hostname||"")&&l.href&&(l.href=qd(e,l.href,b))}catch(k){J(26)}}var e=this;this.target.get(Ze)?De.auto(function(){return $e(e.target)},a,b?"fragment":"",c):(this.T||(this.T=!0,L(M,"mousedown",d,!1),L(M,"keyup",d,!1)),c&&L(M,"submit",function(g){g=
g||O.event;if((g=g.target||g.srcElement)&&g.action){var ca=g.action.match(Jc);ca&&sd(a,ca[1])&&rd(e,g)}}))};function sd(a,b){if(b==M.location.hostname)return!1;for(var c=0;c<a.length;c++)if(a[c]instanceof RegExp){if(a[c].test(b))return!0}else if(0<=b.indexOf(a[c]))return!0;return!1}function ke(a,b){return b!=Ic(a,0)&&b!=Ic(a,-1)&&b!=Ic(a,-2)&&b!=pa(a,0)&&b!=pa(a,-1)&&b!=pa(a,-2)}function $e(a){var b=af(a);return{_ga:a.get(Q),_gid:a.get(I)||void 0,_gac:b?[b.qa,b.timestamp].join("."):void 0}}
function af(a){function b(e){return void 0==e||""===e?0:Number(e)}var c=a.get(ce);if(c&&a.get(je)){var d=b(a.get(fe));if(1E3*d+b(a.get(he))<=(new Date).getTime())J(76);else return{timestamp:d,qa:c}}};var p=/^(GTM|OPT)-[A-Z0-9]+$/,q=/;_gaexp=[^;]*/g,r=/;((__utma=)|([^;=]+=GAX?\d+\.))[^;]*/g,Aa=/^https?:\/\/[\w\-.]+\.google.com(:\d+)?\/optimize\/opt-launch\.html\?.*$/,t=function(a){function b(d,e){e&&(c+="&"+d+"="+K(e))}var c="https://www.google-analytics.com/gtm/js?id="+K(a.id);"dataLayer"!=a.B&&b("l",a.B);b("t",a.target);b("cid",a.clientId);b("cidt",a.ka);b("gac",a.la);b("aip",a.ia);a.sync&&b("m","sync");b("cycle",a.G);a.qa&&b("gclid",a.qa);Aa.test(M.referrer)&&b("cb",String(hd()));return c};var Jd=function(a,b,c){this.aa=b;(b=c)||(b=(b=P(a,V))&&"t0"!=b?Wd.test(b)?"_gat_"+Cc(P(a,Na)):"_gat_"+Cc(b):"_gat");this.Y=b;this.ra=null},Rd=function(a,b){var c=b.get(Wb);b.set(Wb,function(e){Pd(a,e,ed);Pd(a,e,ia);var g=c(e);Qd(a,e);return g});var d=b.get(Xb);b.set(Xb,function(e){var g=d(e);if(se(e)){if(ne()!==H(a,e)){J(80);var ca={U:re(a,e,1),google:re(a,e,2),count:0};pe("https://stats.g.doubleclick.net/j/collect",ca.U,ca)}else ta(re(a,e,0));e.set(ed,"",!0)}return g})},Pd=function(a,b,c){!1===b.get(Ud)||
b.get(c)||("1"==Ca(a.Y)[0]?b.set(c,"",!0):b.set(c,""+hd(),!0))},Qd=function(a,b){se(b)&&zc(a.Y,"1",P(b,Yb),P(b,W),P(b,Na),6E4,P(b,Be))},se=function(a){return!!a.get(ed)&&!1!==a.get(Ud)},re=function(a,b,c){var d=new ee,e=function(ca){$a(ca).F&&d.set($a(ca).F,b.get(ca))};e(hb);e(ib);e(Na);e(Q);e(ed);if(0==c||1==c)e(Ad),e(ia),e(I);d.set($a(ld).F,Td(b));var g="";d.map(function(ca,l){g+=K(ca)+"=";g+=K(""+l)+"&"});g+="z="+hd();0==c?g=a.aa+g:1==c?g="t=dc&aip=1&_r=3&"+g:2==c&&(g="t=sr&aip=1&_r=4&slf_rd=1&"+
g);return g},H=function(a,b){null===a.ra&&(a.ra=1===Ed(b),a.ra&&J(33));return a.ra},Wd=/^gtm\d+$/;var fd=function(a,b){a=a.b;if(!a.get("dcLoaded")){var c=new $c(Dd(a));c.set(29);a.set(Gd,c.w);b=b||{};var d;b[U]&&(d=Cc(b[U]));b=new Jd(a,"https://stats.g.doubleclick.net/r/collect?t=dc&aip=1&_r=3&",d);Rd(b,a);a.set("dcLoaded",!0)}};var Sd=function(a){if(!a.get("dcLoaded")&&"cookie"==a.get(ac)){var b=new Jd(a);Pd(b,a,ed);Pd(b,a,ia);Qd(b,a);if(se(a)){var c=ne()!==H(b,a);a.set(Md,1,!0);c?(J(79),a.set(ad,"d",!0),a.set(qe,{U:re(b,a,1),google:re(b,a,2),count:0},!0)):a.set(ad,"b",!0)}}};var Lc=function(){var a=O.gaGlobal=O.gaGlobal||{};return a.hid=a.hid||hd()};var wb=/^(UA|YT|MO|GP)-(\d+)-(\d+)$/,pc=function(a){function b(e,g){d.b.data.set(e,g)}function c(e,g){b(e,g);d.filters.add(e)}var d=this;this.b=new Ya;this.filters=new Ha;b(V,a[V]);b(Na,sa(a[Na]));b(U,a[U]);b(W,a[W]||xa());b(Yb,a[Yb]);b(Zb,a[Zb]);b(Hd,a[Hd]);b(Be,a[Be]);b($b,a[$b]);b(Wc,a[Wc]);b(bc,a[bc]);b(cc,a[cc]);b(Ka,a[Ka]);b(dc,a[dc]);b(ec,a[ec]);b(ac,a[ac]);b(Ad,a[Ad]);b(n,a[n]);b(Kd,a[Kd]);b(je,a[je]);b(Ze,a[Ze]);b(oe,a[oe]);b(hb,1);b(ib,"j81");c(Qb,Ma);c(oa,ua);c(dd,cd);c(Rb,Oa);c(md,vb);
c(Sb,nc);c(Uc,Yc);c(Tb,Ja);c(Vb,Ta);c(Vc,Hc);c(zd,yd);c(Ld,Sd);c(Wb,Pa);c(Xb,Sa);c(Cd,Fd(this));pd(this.b);td(this.b,a[Q]);this.b.set(jb,Lc())},td=function(a,b){var c=P(a,U);a.data.set(la,"_ga"==c?"_gid":c+"_gid");if("cookie"==P(a,ac)){hc=!1;c=Ca(P(a,U));c=Xd(a,c);if(!c){c=P(a,W);var d=P(a,$b)||xa();c=Xc("__utma",d,c);void 0!=c?(J(10),c=c.O[1]+"."+c.O[2]):c=void 0}c&&(hc=!0);if(d=c&&!a.get(Hd))if(d=c.split("."),2!=d.length)d=!1;else if(d=Number(d[1])){var e=R(a,Zb);d=d+e<(new Date).getTime()/1E3}else d=
!1;d&&(c=void 0);c&&(a.data.set(xd,c),a.data.set(Q,c),(c=uc(a))&&a.data.set(I,c));if(a.get(je)&&(c=a.get(ce),d=a.get(ie),!c||d&&"aw.ds"!=d)){c={};if(M){d=[];e=M.cookie.split(";");for(var g=/^\s*_gac_(UA-\d+-\d+)=\s*(.+?)\s*$/,ca=0;ca<e.length;ca++){var l=e[ca].match(g);l&&d.push({ja:l[1],value:l[2]})}e={};if(d&&d.length)for(g=0;g<d.length;g++)(ca=d[g].value.split("."),"1"!=ca[0]||3!=ca.length)?c&&(c.na=!0):ca[1]&&(e[d[g].ja]?c&&(c.pa=!0):e[d[g].ja]=[],e[d[g].ja].push({timestamp:ca[1],qa:ca[2]}));
d=e}else d={};d=d[P(a,Na)];le(c);d&&0!=d.length&&(c=d[0],a.data.set(fe,c.timestamp),a.data.set(ce,c.qa))}}if(a.get(Hd)&&(c=be("_ga",!!a.get(cc)),g=be("_gl",!!a.get(cc)),d=De.get(a.get(cc)),e=d._ga,g&&0<g.indexOf("_ga*")&&!e&&J(30),g=d.gclid,ca=d._gac,c||e||g||ca))if(c&&e&&J(36),a.get(bc)||ye(a.get(Kd))){if(e&&(J(38),a.data.set(Q,e),d._gid&&(J(51),a.data.set(I,d._gid))),g?(J(82),a.data.set(ce,g),d.gclsrc&&a.data.set(ie,d.gclsrc)):ca&&(d=ca.split("."))&&2===d.length&&(J(37),a.data.set(ce,d[0]),a.data.set(fe,
d[1])),c)b:if(d=c.indexOf("."),-1==d)J(22);else{e=c.substring(0,d);g=c.substring(d+1);d=g.indexOf(".");c=g.substring(0,d);g=g.substring(d+1);if("1"==e){if(d=g,ke(d,c)){J(23);break b}}else if("2"==e){d=g.indexOf("-");e="";0<d?(e=g.substring(0,d),d=g.substring(d+1)):d=g.substring(1);if(ke(e+d,c)){J(53);break b}e&&(J(2),a.data.set(I,e))}else{J(22);break b}J(11);a.data.set(Q,d);if(c=be("_gac",!!a.get(cc)))c=c.split("."),"1"!=c[0]||4!=c.length?J(72):ke(c[3],c[1])?J(71):(a.data.set(ce,c[3]),a.data.set(fe,
c[2]),J(70))}}else J(21);b&&(J(9),a.data.set(Q,K(b)));a.get(Q)||((b=(b=O.gaGlobal&&O.gaGlobal.vid)&&-1!=b.search(jd)?b:void 0)?(J(17),a.data.set(Q,b)):(J(8),a.data.set(Q,ra())));a.get(I)||(J(3),a.data.set(I,ra()));mc(a)},pd=function(a){var b=O.navigator,c=O.screen,d=M.location;a.set(lb,ya(!!a.get(ec),!!a.get(Kd)));if(d){var e=d.pathname||"";"/"!=e.charAt(0)&&(J(31),e="/"+e);a.set(kb,d.protocol+"//"+d.hostname+e+d.search)}c&&a.set(qb,c.width+"x"+c.height);c&&a.set(pb,c.colorDepth+"-bit");c=M.documentElement;
var g=(e=M.body)&&e.clientWidth&&e.clientHeight,ca=[];c&&c.clientWidth&&c.clientHeight&&("CSS1Compat"===M.compatMode||!g)?ca=[c.clientWidth,c.clientHeight]:g&&(ca=[e.clientWidth,e.clientHeight]);c=0>=ca[0]||0>=ca[1]?"":ca.join("x");a.set(rb,c);a.set(tb,fc());a.set(ob,M.characterSet||M.charset);a.set(sb,b&&"function"===typeof b.javaEnabled&&b.javaEnabled()||!1);a.set(nb,(b&&(b.language||b.browserLanguage)||"").toLowerCase());a.data.set(ce,be("gclid",!0));a.data.set(ie,be("gclsrc",!0));a.data.set(fe,
Math.round((new Date).getTime()/1E3));if(d&&a.get(cc)&&(b=M.location.hash)){b=b.split(/[?&#]+/);d=[];for(c=0;c<b.length;++c)(D(b[c],"utm_id")||D(b[c],"utm_campaign")||D(b[c],"utm_source")||D(b[c],"utm_medium")||D(b[c],"utm_term")||D(b[c],"utm_content")||D(b[c],"gclid")||D(b[c],"dclid")||D(b[c],"gclsrc"))&&d.push(b[c]);0<d.length&&(b="#"+d.join("&"),a.set(kb,a.get(kb)+b))}};pc.prototype.get=function(a){return this.b.get(a)};pc.prototype.set=function(a,b){this.b.set(a,b)};
var me={pageview:[mb],event:[ub,xb,yb,zb],social:[Bb,Cb,Db],timing:[Mb,Nb,Pb,Ob]};pc.prototype.send=function(a){if(!(1>arguments.length)){if("string"===typeof arguments[0]){var b=arguments[0];var c=[].slice.call(arguments,1)}else b=arguments[0]&&arguments[0][Va],c=arguments;b&&(c=za(me[b]||[],c),c[Va]=b,this.b.set(c,void 0,!0),this.filters.D(this.b),this.b.data.m={})}};pc.prototype.ma=function(a,b){var c=this;u(a,c,b)||(v(a,function(){u(a,c,b)}),y(String(c.get(V)),a,void 0,b,!0))};var rc=function(a){if("prerender"==M.visibilityState)return!1;a();return!0},z=function(a){if(!rc(a)){J(16);var b=!1,c=function(){if(!b&&rc(a)){b=!0;var d=c,e=M;e.removeEventListener?e.removeEventListener("visibilitychange",d,!1):e.detachEvent&&e.detachEvent("onvisibilitychange",d)}};L(M,"visibilitychange",c)}};var te=/^(?:(\w+)\.)?(?:(\w+):)?(\w+)$/,sc=function(a){if(ea(a[0]))this.u=a[0];else{var b=te.exec(a[0]);null!=b&&4==b.length&&(this.c=b[1]||"t0",this.K=b[2]||"",this.methodName=b[3],this.a=[].slice.call(a,1),this.K||(this.A="create"==this.methodName,this.i="require"==this.methodName,this.g="provide"==this.methodName,this.ba="remove"==this.methodName),this.i&&(3<=this.a.length?(this.X=this.a[1],this.W=this.a[2]):this.a[1]&&(qa(this.a[1])?this.X=this.a[1]:this.W=this.a[1])));b=a[1];a=a[2];if(!this.methodName)throw"abort";
if(this.i&&(!qa(b)||""==b))throw"abort";if(this.g&&(!qa(b)||""==b||!ea(a)))throw"abort";if(ud(this.c)||ud(this.K))throw"abort";if(this.g&&"t0"!=this.c)throw"abort";}};function ud(a){return 0<=a.indexOf(".")||0<=a.indexOf(":")};var Yd,Zd,$d,A;Yd=new ee;$d=new ee;A=new ee;Zd={ec:45,ecommerce:46,linkid:47};
var u=function(a,b,c){b==N||b.get(V);var d=Yd.get(a);if(!ea(d))return!1;b.plugins_=b.plugins_||new ee;if(b.plugins_.get(a))return!0;b.plugins_.set(a,new d(b,c||{}));return!0},y=function(a,b,c,d,e){if(!ea(Yd.get(b))&&!$d.get(b)){Zd.hasOwnProperty(b)&&J(Zd[b]);a=N.j(a);if(p.test(b)){J(52);if(!a)return!0;c=d||{};d={id:b,B:c.dataLayer||"dataLayer",ia:!!a.get("anonymizeIp"),sync:e,G:!1};a.get("&gtm")==b&&(d.G=!0);var g=String(a.get("name"));"t0"!=g&&(d.target=g);G(String(a.get("trackingId")))||(d.clientId=
String(a.get(Q)),d.ka=Number(a.get(n)),c=c.palindrome?r:q,c=(c=M.cookie.replace(/^|(; +)/g,";").match(c))?c.sort().join("").substring(1):void 0,d.la=c,d.qa=E(a.b.get(kb)||"","gclid"));c=d.B;g=(new Date).getTime();O[c]=O[c]||[];g={"gtm.start":g};e||(g.event="gtm.js");O[c].push(g);c=t(d)}!c&&Zd.hasOwnProperty(b)?(J(39),c=b+".js"):J(43);if(c){if(a){var ca=a.get(oe);qa(ca)||(ca=void 0)}c&&0<=c.indexOf("/")||(c=(ca?ca+"/34":bd(!1)+"/plugins/ua/")+c);ca=ae(c);a=ca.protocol;d=M.location.protocol;if(("https:"==
a||a==d||("http:"!=a?0:"http:"==d))&&B(ca)){if(ca=ca.url)a=(a=M.querySelector&&M.querySelector("script[nonce]")||null)?a.nonce||a.getAttribute&&a.getAttribute("nonce")||"":"",e?(e="",a&&Nd.test(a)&&(e=' nonce="'+a+'"'),f.test(ca)&&M.write("<script"+e+' src="'+ca+'">\x3c/script>')):(e=M.createElement("script"),e.type="text/javascript",e.async=!0,e.src=ca,a&&e.setAttribute("nonce",a),ca=M.getElementsByTagName("script")[0],ca.parentNode.insertBefore(e,ca));$d.set(b,!0)}}}},v=function(a,b){var c=A.get(a)||
[];c.push(b);A.set(a,c)},C=function(a,b){Yd.set(a,b);b=A.get(a)||[];for(var c=0;c<b.length;c++)b[c]();A.set(a,[])},B=function(a){var b=ae(M.location.href);if(D(a.url,"https://www.google-analytics.com/gtm/js?id="))return!0;if(a.query||0<=a.url.indexOf("?")||0<=a.path.indexOf("://"))return!1;if(a.host==b.host&&a.port==b.port)return!0;b="http:"==a.protocol?80:443;return"www.google-analytics.com"==a.host&&(a.port||b)==b&&D(a.path,"/plugins/")?!0:!1},ae=function(a){function b(l){var k=l.hostname||"",w=
0<=k.indexOf("]");k=k.split(w?"]":":")[0].toLowerCase();w&&(k+="]");w=(l.protocol||"").toLowerCase();w=1*l.port||("http:"==w?80:"https:"==w?443:"");l=l.pathname||"";D(l,"/")||(l="/"+l);return[k,""+w,l]}var c=M.createElement("a");c.href=M.location.href;var d=(c.protocol||"").toLowerCase(),e=b(c),g=c.search||"",ca=d+"//"+e[0]+(e[1]?":"+e[1]:"");D(a,"//")?a=d+a:D(a,"/")?a=ca+a:!a||D(a,"?")?a=ca+e[2]+(a||g):0>a.split("/")[0].indexOf(":")&&(a=ca+e[2].substring(0,e[2].lastIndexOf("/"))+"/"+a);c.href=a;
d=b(c);return{protocol:(c.protocol||"").toLowerCase(),host:d[0],port:d[1],path:d[2],query:c.search||"",url:a||""}};var Z={ga:function(){Z.f=[]}};Z.ga();Z.D=function(a){var b=Z.J.apply(Z,arguments);b=Z.f.concat(b);for(Z.f=[];0<b.length&&!Z.v(b[0])&&!(b.shift(),0<Z.f.length););Z.f=Z.f.concat(b)};Z.J=function(a){for(var b=[],c=0;c<arguments.length;c++)try{var d=new sc(arguments[c]);d.g?C(d.a[0],d.a[1]):(d.i&&(d.ha=y(d.c,d.a[0],d.X,d.W)),b.push(d))}catch(e){}return b};
Z.v=function(a){try{if(a.u)a.u.call(O,N.j("t0"));else{var b=a.c==gb?N:N.j(a.c);if(a.A){if("t0"==a.c&&(b=N.create.apply(N,a.a),null===b))return!0}else if(a.ba)N.remove(a.c);else if(b)if(a.i){if(a.ha&&(a.ha=y(a.c,a.a[0],a.X,a.W)),!u(a.a[0],b,a.W))return!0}else if(a.K){var c=a.methodName,d=a.a,e=b.plugins_.get(a.K);e[c].apply(e,d)}else b[a.methodName].apply(b,a.a)}}catch(g){}};var N=function(a){J(1);Z.D.apply(Z,[arguments])};N.h={};N.P=[];N.L=0;N.ya=0;N.answer=42;var we=[Na,W,V];N.create=function(a){var b=za(we,[].slice.call(arguments));b[V]||(b[V]="t0");var c=""+b[V];if(N.h[c])return N.h[c];if(da(b))return null;b=new pc(b);N.h[c]=b;N.P.push(b);c=qc().tracker_created;if(ea(c))try{c(b)}catch(d){}return b};N.remove=function(a){for(var b=0;b<N.P.length;b++)if(N.P[b].get(V)==a){N.P.splice(b,1);N.h[a]=null;break}};N.j=function(a){return N.h[a]};N.getAll=function(){return N.P.slice(0)};
N.N=function(){"ga"!=gb&&J(49);var a=O[gb];if(!a||42!=a.answer){N.L=a&&a.l;N.ya=1*new Date;N.loaded=!0;var b=O[gb]=N;X("create",b,b.create);X("remove",b,b.remove);X("getByName",b,b.j,5);X("getAll",b,b.getAll,6);b=pc.prototype;X("get",b,b.get,7);X("set",b,b.set,4);X("send",b,b.send);X("requireSync",b,b.ma);b=Ya.prototype;X("get",b,b.get);X("set",b,b.set);if("https:"!=M.location.protocol&&!Ba){a:{b=M.getElementsByTagName("script");for(var c=0;c<b.length&&100>c;c++){var d=b[c].src;if(d&&0==d.indexOf(bd(!0)+
"/analytics")){b=!0;break a}}b=!1}b&&(Ba=!0)}(O.gaplugins=O.gaplugins||{}).Linker=Dc;b=Dc.prototype;C("linker",Dc);X("decorate",b,b.ca,20);X("autoLink",b,b.S,25);C("displayfeatures",fd);C("adfeatures",fd);a=a&&a.q;ka(a)?Z.D.apply(N,a):J(50)}};N.da=function(){for(var a=N.getAll(),b=0;b<a.length;b++)a[b].get(V)};var ze=N.N,Ae=O[gb];Ae&&Ae.r?ze():z(ze);z(function(){Z.D(["provide","render",ua])});})(window);
"use strict";(function(){var gameLoaded=false;var activePopup;var popBG;var sharePop;var loginPop;var instructionsPop;var registerPop;var loggedInBar;var loggedOutBar;var officialHost;var mainWebsiteLoggedInUserID;var embedErrorNotice=false;var aUnit;var aLink;window.GameEmbed={init:function(){const urlParams=new URLSearchParams(window.location.search);try{mainWebsiteLoggedInUserID=parseInt(urlParams.get("uid"));}
catch(err){mainWebsiteLoggedInUserID=0;}
try{officialHost=urlParams.get("o")==="1";}
catch(err){officialHost=false;}
if(!gameAllowEmbedding&&!officialHost){embedErrorNotice=true;document.getElementById("NoEmbeddingNotice").style.display="flex";}
GameEmbed.initMessageListener();GameEmbed.checkInFrame();loggedInBar=document.getElementById("LoggedInBar");loggedOutBar=document.getElementById("LoggedOutBar");GameEmbed.getPops();GameEmbed.initialiseControls();GameEmbed.initUserAuth();GameEmbed.initPopups();GameEmbed.checkForLogin();GameEmbed.initGame();},checkInFrame:function(){var inFrame=GameEmbed.isInFrame();if(!inFrame){window.location.href=constructGameURL;return;}},isInFrame:function(){try{return window.self!==window.top;}catch(e){return true;}},checkForLogin:function(){if(!loggedIn){loggedOutBar.style.display="block";GameEmbed.initTopBar();return;}
GameEmbed.setLoggedInAsUser(loggedInUsername,loggedInAvatarURL,loggedInAsUserID);GameEmbed.initTopBar();},setCookie:function(name,value,days){var expires="";if(days){const date=new Date();date.setTime(date.getTime()+(days*24*60*60*1000));expires="; expires="+date.toUTCString();}
document.cookie=name+"="+(value||"")+expires+"; path=/; domain=."+rootDomain+"; secure";},getCookie:function(name){const nameEQ=name+"=";const ca=document.cookie.split(';');for(let i=0;i<ca.length;i++){let c=ca[i];while(c.charAt(0)===' ')c=c.substring(1,c.length);if(c.indexOf(nameEQ)===0)return c.substring(nameEQ.length,c.length);}
return null;},eraseCookie:function(name){document.cookie=name+"=; path=/; domain=."+rootDomain+"; expires="+new Date(0).toUTCString();},initMessageListener:function(){window.addEventListener('message',function(e){const message=e.data;if(message==="InitRequest"){document.getElementById("EmbededGameFrame").contentWindow.postMessage("AuthStep2","*");return;}
const json=e.data;const method=json.method;if(method==="login"){const token=json.token;const userID=json.userID;const remember=json.remember;const username=json.username;const avatarURL=json.avatarURL;GameEmbed.setLoggedInAsUser(username,avatarURL,userID);GameEmbed.closePopups();let days=1;if(remember)days=180;GameEmbed.setCookie(tokenCookieName,token,days);GameEmbed.setCookie(userIDCookieName,userID,days);GameEmbed.sendGAEvent("Game"+constructGameID,"UserLogin","Version"+constructGameVersion);}
else console.warn("Unhandled method: "+method);});},logout:function(){loggedInBar.style.display="none";loggedOutBar.style.display="block";document.getElementById("LoggedInUsername").innerText="";document.getElementById("LoggedInAvatar").removeAttribute("src");const token=GameEmbed.getCookie(tokenCookieName);const userID=GameEmbed.getCookie(userIDCookieName);if(token&&userID){const xhr=new XMLHttpRequest();xhr.open("POST","/logout.ashx");xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");xhr.send("token="+encodeURIComponent(token)+"&userID="+encodeURIComponent(userID));}
GameEmbed.eraseCookie(tokenCookieName);GameEmbed.eraseCookie(userIDCookieName);loggedIn=false;loggedInAsUserID=0;loggedInUsername="";loggedInAvatarURL="";GameEmbed.sendGAEvent("Game"+constructGameID,"UserLogout","Version"+constructGameVersion);},setLoggedInAsUser:function(username,avatarURL,userID){loggedInBar.style.display="flex";loggedOutBar.style.display="none";document.getElementById("LoggedInUsername").innerText=username;document.getElementById("LoggedInAvatar").setAttribute("src",avatarURL);loggedIn=true;loggedInAsUserID=userID;loggedInUsername=username;loggedInAvatarURL=avatarURL;},getPops:function(){sharePop=document.getElementById("SharePop");instructionsPop=document.getElementById("InstructionsPop");loginPop=document.getElementById("LoginPop");registerPop=document.getElementById("RegisterPop");},initUserAuth:function(){const loginLink=document.getElementById("LoginLink");if(loginLink){loginLink.addEventListener("click",function(event){event.preventDefault();GameEmbed.showLoginPopup();});}
const registerLink=document.getElementById("RegisterLink");if(registerLink){registerLink.addEventListener("click",function(event){event.preventDefault();GameEmbed.showRegisterPopup();});}
const logoutLink=document.getElementById("LogoutLink");if(logoutLink){logoutLink.addEventListener("click",function(event){event.preventDefault();GameEmbed.logout();});}},initPopups:function(){const popups=document.querySelectorAll("#PopBG > div");for(let i=0;i<popups.length;i++){popups[i].addEventListener("click",function(e){e.stopPropagation();});}
const closePopLinks=document.querySelectorAll(".closePopLink");for(let i=0;i<closePopLinks.length;i++){closePopLinks[i].addEventListener("click",function(e){e.preventDefault();GameEmbed.closePopups();});}
activePopup="";popBG=document.getElementById("PopBG");popBG.addEventListener("click",function(e){e.preventDefault();GameEmbed.closePopups();});const inputs=document.querySelectorAll(".autoSel");for(let i=0;i<inputs.length;i++){const input=inputs[i];input.addEventListener("click",function(){this.setSelectionRange(0,this.value.length);});}},closePopups:function(){GameEmbed.sendGAEvent("Game"+constructGameID,"ClosePopup"+activePopup,"Version"+constructGameVersion);if(activePopup==="Share"){GameEmbed.closeSharePopup();}
else if(activePopup==="Instructions"){GameEmbed.closeInstructionsPopup();}
else if(activePopup==="Login"){GameEmbed.closeLoginPopup();}
else if(activePopup==="Register"){GameEmbed.closeRegisterPopup();}
activePopup="";popBG.style.display="none";const gameDoc=document.getElementById("EmbededGameFrame");gameDoc.focus();},closeSharePopup:function(){sharePop.style.display="none";},closeInstructionsPopup:function(){instructionsPop.style.display="none";},closeLoginPopup:function(){loginPop.style.display="none";const iFrame=loginPop.querySelector("iframe");iFrame.setAttribute("src","");},closeRegisterPopup:function(){registerPop.style.display="none";const iFrame=registerPop.querySelector("iframe");iFrame.setAttribute("src","");},showRegisterPopup:function(){popBG.style.display="flex";registerPop.style.display="flex";activePopup="Register";GameEmbed.sendGAEvent("Game"+constructGameID,"OpenPopup"+activePopup,"Version"+constructGameVersion);const iFrame=registerPop.querySelector("iframe");iFrame.setAttribute("src",iFrame.getAttribute("data-src"));},showLoginPopup:function(){popBG.style.display="flex";loginPop.style.display="flex";activePopup="Login";GameEmbed.sendGAEvent("Game"+constructGameID,"OpenPopup"+activePopup,"Version"+constructGameVersion);const iFrame=loginPop.querySelector("iframe");iFrame.setAttribute("src",iFrame.getAttribute("data-src"));},showSharePopup:function(){popBG.style.display="flex";sharePop.style.display="flex";activePopup="Share";GameEmbed.sendGAEvent("Game"+constructGameID,"OpenPopup"+activePopup,"Version"+constructGameVersion);},showInstructionsPopup:function(){popBG.style.display="flex";instructionsPop.style.display="flex";activePopup="Instructions";GameEmbed.sendGAEvent("Game"+constructGameID,"OpenPopup"+activePopup,"Version"+constructGameVersion);},initialiseControls:function(){const c3Link=document.getElementById("C3Link");c3Link.addEventListener("mousedown",function(e){GameEmbed.sendGAEvent("Game"+constructGameID,"ControlC3LogoClick","Version"+constructGameVersion);});const showcaseLink=document.getElementById("ShowcaseLink");if(showcaseLink!==undefined&&showcaseLink!==null){showcaseLink.querySelector("a").addEventListener("click",function(e){GameEmbed.sendGAEvent("Game"+constructGameID,"ControlShowcaseLogoClick","Version"+constructGameVersion);});}
const instructionsLink=document.getElementById("CtrlInstructions");if(instructionsLink!==undefined&&instructionsLink!==null){instructionsLink.addEventListener("click",function(e){e.preventDefault();GameEmbed.showInstructionsPopup();});}
const shareLink=document.getElementById("CtrlShare");if(shareLink!==undefined&&shareLink!==null){const shareCopyButton=document.getElementById("CopyShareLink");shareCopyButton.addEventListener("click",function(e){e.preventDefault();document.getElementById("ShareURL").select();document.execCommand('copy');});var shareURL=sharePop.getAttribute("data-share-url");var shareName=sharePop.getAttribute("data-share-name");var shareImage=sharePop.getAttribute("data-share-image");var shareDescription=sharePop.getAttribute("data-share-description");{const shareLink=document.getElementById("ShareTwitterLink");shareLink.setAttribute("href",shareLink.getAttribute("href").replace("{0}",shareURL).replace("{1}",shareName));shareLink.addEventListener("mousedown",function(event){GameEmbed.sendGAEvent("Game"+constructGameID,"ShareTwitterClick","Version"+constructGameVersion);});}
{const shareLink=document.getElementById("ShareFBLink");shareLink.setAttribute("href",shareLink.getAttribute("href").replace("{0}",shareURL));shareLink.addEventListener("mousedown",function(event){GameEmbed.sendGAEvent("Game"+constructGameID,"ShareFBClick","Version"+constructGameVersion);});}
{const shareLink=document.getElementById("ShareRedditLink");shareLink.setAttribute("href",shareLink.getAttribute("href").replace("{0}",shareURL).replace("{1}",shareName));shareLink.addEventListener("mousedown",function(event){GameEmbed.sendGAEvent("Game"+constructGameID,"ShareRedditClick","Version"+constructGameVersion);});}
{const shareLink=document.getElementById("LinkedInShareLink");shareLink.setAttribute("href",shareLink.getAttribute("href").replace("{0}",shareURL).replace("{1}",shareName));shareLink.addEventListener("mousedown",function(event){GameEmbed.sendGAEvent("Game"+constructGameID,"ShareLinkedInClick","Version"+constructGameVersion);});}
{const shareLink=document.getElementById("PinterestShareLink");shareLink.setAttribute("href",shareLink.getAttribute("href").replace("{0}",shareURL).replace("{1}",shareDescription).replace("{2}",shareImage));shareLink.addEventListener("mousedown",function(event){GameEmbed.sendGAEvent("Game"+constructGameID,"SharePintrestClick","Version"+constructGameVersion);});}
{const shareLink=document.getElementById("ShareVKLink");shareLink.setAttribute("href",shareLink.getAttribute("href").replace("{0}",shareURL).replace("{1}",shareName).replace("{2}",shareDescription).replace("{3}",shareImage));shareLink.addEventListener("mousedown",function(event){GameEmbed.sendGAEvent("Game"+constructGameID,"ShareVKClick","Version"+constructGameVersion);});}
{const shareLink=document.getElementById("EmbedLink");if(shareLink!==undefined&&shareLink!==null){shareLink.addEventListener("mousedown",function(event){GameEmbed.sendGAEvent("Game"+constructGameID,"ShareEmbedClick","Version"+constructGameVersion);});}}
shareLink.addEventListener("click",function(e)
{e.preventDefault();GameEmbed.showSharePopup();});}
const fullScreenLink=document.getElementById("CtrlFullScreen");fullScreenLink.addEventListener("click",function(e){e.preventDefault();if(!gameLoaded)return;const gameDoc=document.getElementById("EmbededGameFrame");if(gameDoc.requestFullscreen){gameDoc.requestFullscreen();}else if(gameDoc.msRequestFullscreen){gameDoc.msRequestFullscreen();}else if(gameDoc.mozRequestFullScreen){gameDoc.mozRequestFullScreen();}else if(gameDoc.webkitRequestFullscreen){gameDoc.webkitRequestFullscreen();}
if(document.fullscreenEnabled===undefined&&document.webkitFullscreenEnabled===undefined){GameEmbed.sendGAEvent("Game"+constructGameID,"ControlFullScreenClickFailure","Version"+constructGameVersion);alert("Your browser does not support full screen.");}else{GameEmbed.sendGAEvent("Game"+constructGameID,"ControlFullScreenClick","Version"+constructGameVersion);}
gameDoc.focus();});{document.addEventListener('webkitfullscreenchange',GameEmbed.fullScreenStatusChange,false);document.addEventListener('mozfullscreenchange',GameEmbed.fullScreenStatusChange,false);document.addEventListener('fullscreenchange',GameEmbed.fullScreenStatusChange,false);document.addEventListener('MSFullscreenChange',GameEmbed.fullScreenStatusChange,false);}},fullScreenStatusChange:function(){var fullScreenValue=0;var fullscreenElement=document.fullscreenElement||document.mozFullScreenElement||document.webkitFullscreenElement;if(fullscreenElement!==null){fullScreenValue=1;}
GameEmbed.sendGAEvent("Game"+constructGameID,"FullScreenModeChange","Version"+constructGameVersion,fullScreenValue);},initTopBar:function(){const forceTopBar=window.location.hash==="#forcetopbar";if(forceTopBar===true){GameEmbed.showTopBar();return;}
let referrer=document.referrer;if(!referrer){GameEmbed.showTopBar();return;}
const qString=referrer.indexOf("?");if(qString!==-1){referrer=referrer.substr(0,qString);}
if(referrer!==constructGameURL){GameEmbed.showTopBar();return;}
if(mainWebsiteLoggedInUserID!==loggedInAsUserID){GameEmbed.showTopBar();return;}
GameEmbed.hideTopBar();},showTopBar:function(){document.getElementById("TopBar").style.display="flex";const iFrame=document.getElementById("EmbededGameFrame");if(iFrame){iFrame.setAttribute("style","height: calc(100% - 34px - 20px)");}},hideTopBar:function(){document.getElementById("TopBar").style.display="none";const iFrame=document.getElementById("EmbededGameFrame");if(iFrame){iFrame.setAttribute("style","height: calc(100% - 34px)");}},initGame:function(){aUnit=document.getElementById("APop");aLink=document.getElementById("ALink");const referer=document.referrer;var fromOfficialSite=false;if(referer&&referer.startsWith(c3RootDomain)){fromOfficialSite=true;}
if(!loggedIn&&!fromOfficialSite){GameEmbed.showPGC();}else{aUnit.remove();GameEmbed.showGame();}},showPGC:function(){aUnit.style.display="flex";aLink.setAttribute("style","background-image:url('"+aBG+"');");aLink.addEventListener("click",function(){GameEmbed.sendGAEvent("Game"+constructGameID,"PreGameContentClick","Version"+constructGameVersion);GameEmbed.hidePGC();GameEmbed.showGame();});const fullScreenButton=document.getElementById("CtrlFullScreen").parentNode;fullScreenButton.style.display="none";GameEmbed.sendGAEvent("Game"+constructGameID,"ShowPreGameContent","Version"+constructGameVersion);window.addEventListener("resize",GameEmbed.onResize);GameEmbed.onResize();const countDown=document.getElementById("ACount");let seconds=parseInt(countDown.innerHTML);const originalSeconds=seconds;const aCountdown=setInterval(function(){seconds--;countDown.innerHTML=seconds;if(seconds===0){clearInterval(aCountdown);GameEmbed.sendGAEvent("Game"+constructGameID,"PreGameContentTimedOut","Version"+constructGameVersion,originalSeconds);GameEmbed.hidePGC();GameEmbed.showGame();}},1000);},onResize:function(){const outerWidth=aUnit.offsetWidth-30;const outerHeight=aUnit.offsetHeight-60;if(outerWidth>400&&outerHeight>400){aLink.style.width=400+"px";aLink.style.height=400+"px";}
else if(outerWidth<outerHeight){aLink.style.height=outerWidth+"px";aLink.style.width=outerWidth+"px";}
else if(outerWidth>outerHeight){aLink.style.height=outerHeight+"px";aLink.style.width=outerHeight+"px";}},hidePGC:function(){aUnit.remove();const fullScreenButton=document.getElementById("CtrlFullScreen").parentNode;fullScreenButton.style.display="list-item";window.removeEventListener("resize",GameEmbed.onResize);},showGame:function(){const frame=document.getElementById("EmbededGameFrame");if(!embedErrorNotice){const frameSrc=frame.getAttribute("data-src");frame.setAttribute("src",frameSrc);gameLoaded=true;GameEmbed.sendGAEvent("Game"+constructGameID,"GameLoadStart","Version"+constructGameVersion);}else{frame.remove();}},sendGAEvent:function(eventCategory,eventAction,eventLabel,eventValue,transport){const eventObject=JSON.parse(JSON.stringify({eventCategory:eventCategory,eventAction:eventAction,eventLabel:eventLabel,eventValue:eventValue,transport:transport},GameEmbed.gaClean,"\t"));for(let i=0;i<gaAccountNames.length;i++){const accountName=gaAccountNames[i];ga(accountName+'.send','event',eventObject);}},gaClean:function(key,value){if(value===null){return undefined;}
return value;},};GameEmbed.init();})();
!function(e){function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}var t={};n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:r})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},n.p="",n(n.s=13)}({13:function(e,n,t){e.exports=t("aq4y")},aq4y:function(){var e="https://m.stripe.network",n=window.location.hash,t=/preview=true/.test(n)?"inner-preview.html":"inner.html",r=document.createElement("iframe");r.src=e+"/"+t+n;var o=function(n){if(n.origin===e){var t=window.opener||window.parent||window;if(!t)return;t.postMessage(n.data,"*")}else r.contentWindow.postMessage(n.data,"*")};window.addEventListener?window.addEventListener("message",o,!1):window.attachEvent("onMessage",o),document.body&&document.body.appendChild(r)}});
"use strict";(function(){var imagesRequiringLazyLoading=[];var imageLazyLoadBottomThreshold=100;window.C3Web={loadDeferredCSS:function(){for(var i=0;i<deferredCSS.length;i++){var cssURL=deferredCSS[i];var stylesheet=document.createElement("link");stylesheet.href=cssURL;stylesheet.rel="stylesheet";stylesheet.type="text/css";document.getElementsByTagName("head")[0].appendChild(stylesheet);}},langSel(link){var parent=link.parentNode;var selector=parent.getElementsByClassName("languageSelector")[0];var initialised=selector.classList.contains("selector");if(!initialised){document.addEventListener('click',function(e){var el=e.target.closest("li.language");if(!el){selector.classList.remove("show");}});var links=selector.querySelectorAll("a");for(var i=0;i<links.length;i++){links[i].onclick=function(event){event.preventDefault();var link=this;if(link.classList.contains("selected")){selector.classList.remove("show");return;}
var languageID=link.getAttribute("data-language-ID");var xhr=new XMLHttpRequest();xhr.open("POST","/handlers/language/set.ashx");xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");xhr.onload=function(){if(xhr.status===200){var urlFragment=link.getAttribute("data-url-fragment");var newURL=canonicalURL;if(urlFragment!==""){newURL="/"+urlFragment+newURL;}
if(canonicalURL==="/"){if(urlFragment===""){newURL="";}else{newURL="/"+urlFragment;}}
var langText=link.innerText;var selectedLink=link.parentNode.parentNode.querySelectorAll("a.selected")[0];selectedLink.classList.remove("selected");link.classList.add("selected");var tick=selectedLink.querySelectorAll("span")[0];link.insertBefore(tick,link.firstChild);parent.querySelectorAll("span.currLang")[0].innerText=langText;selector.classList.remove("show");C3Web.trackEvent(langChangedEventCat,langChangedEventAction,langText);window.location.href=secureRootDomain+newURL;}}
xhr.send("languageID="+encodeURIComponent(languageID));};}
selector.classList.add("initialised");}
var visible=selector.classList.contains("show");if(visible){selector.classList.remove("show");}else{selector.classList.add("show");}
return false;},replaceAll:function(original,find,replacement){return original.split(find).join(replacement);},isOnMobile:function(){return(window.innerWidth<=800&&window.innerHeight<=600);},getCanonicalURL:function(){return document.querySelector("link[rel='canonical']").getAttribute("href");},getQuerystring:function getParameterByName(name,url){if(!url){url=window.location.href;}
name=name.replace(/[\[\]]/g,"\\$&");var regex=new RegExp("[?&]"+name+"(=([^&#]*)|&|#|$)"),results=regex.exec(url);if(!results)return null;if(!results[2])return "";return decodeURIComponent(results[2].replace(/\+/g," "));},readCookie:function(name){var nameEq=name+"=";var ca=document.cookie.split(";");for(var i=0;i<ca.length;i++){var c=ca[i];while(c.charAt(0)===" ")c=c.substring(1,c.length);if(c.indexOf(nameEq)===0)return c.substring(nameEq.length,c.length);}
return null;},writeCookie:function(key,value,days){const date=new Date();days=days||365;date.setTime(+date+(days*86400000));window.document.cookie=key+"="+value+"; expires="+date.toGMTString()+"; path=/";return value;},showError:function(sender,message){C3Web.hideError(sender);var errorClass="error field";var error=document.createElement("div");error.innerHTML=message;error.className=errorClass;C3Web.insertAfter(error,sender);},hideError:function(sender){var nextSibling=sender.nextSibling;if(nextSibling!=null&&nextSibling.className==="error field"){sender.parentNode.removeChild(nextSibling);}},insertAfter:function(newElement,targetElement){var parent=targetElement.parentNode;if(parent.lastChild==targetElement){parent.appendChild(newElement);}else{parent.insertBefore(newElement,targetElement.nextSibling);}},initLazyLoadImages:function(){var images=document.querySelectorAll("img[data-src], div[data-src], video[data-src]");for(var i=0;i<images.length;i++){imagesRequiringLazyLoading.push(images[i]);}
window.addEventListener("scroll",C3Web.passiveOnScroll,{passive:true});window.addEventListener("resize",C3Web.passiveOnScroll,{passive:true});var scrollDivs=document.querySelectorAll(".scrollable");for(var i=0;i<scrollDivs.length;i++){scrollDivs[i].addEventListener("scroll",C3Web.passiveOnScroll,{passive:true});}
C3Web.passiveOnScroll();},passiveOnScroll:function(){var bodyScroll=document.scrollingElement||document.body;var scrollTop=bodyScroll.scrollTop;var scrollBottom=scrollTop+window.innerHeight+imageLazyLoadBottomThreshold;var unloadedImages=[];for(var i=0;i<imagesRequiringLazyLoading.length;i++){var image=imagesRequiringLazyLoading[i];var boundingRect=image.getBoundingClientRect();var rectTop=boundingRect.top;var rectHeight=boundingRect.height;var visible=rectTop!==0&&rectHeight!==0;if(!visible){var parent=image.parentNode;if(parent!==null){while(true&&parent!==undefined){boundingRect=parent.getBoundingClientRect();rectTop=boundingRect.top;rectHeight=boundingRect.height;if(rectTop>0||rectHeight>0)break;parent=parent.parentNode;if(parent===null||parent===undefined)break;}}}
var imageTop=rectTop+bodyScroll.scrollTop;var imageBottom=imageTop+rectHeight;if(imageTop<scrollBottom&&imageBottom>scrollTop){var imageURL=image.getAttribute("data-src");if(image.tagName==="IMG"){image.setAttribute("src",imageURL);var srcSet=image.getAttribute("data-srcset");if(srcSet!==null){image.setAttribute("srcset",image.getAttribute("data-srcset"));}}
else if(image.tagName==="VIDEO"){image.setAttribute("src",imageURL);}else{image.style.backgroundImage="url('"+imageURL+"')";}
var nativeHeight=image.getAttribute("height");if(nativeHeight!==null){image.style.maxHeight=nativeHeight+"px";}
image.classList.add("loaded");}else{unloadedImages.push(image);}}
imagesRequiringLazyLoading=unloadedImages;},trackEvent:function(eventCategory,eventAction,eventLabel,eventValue,nonInteraction=false)
{if(typeof(ga)==="undefined")return;ga('send','event',eventCategory,eventAction,eventLabel,eventValue,{nonInteraction:nonInteraction});},trackPageView:function(specifiedCanonicalURL,specifiedPageTitle){if(typeof(window.ga)==="undefined")return;ga('send',{hitType:'pageview',page:specifiedCanonicalURL,title:specifiedPageTitle});},trackOutboundLink:function(eventCategory,eventAction,eventLabel){if(!window.ga)return;ga("send","event",{eventCategory:eventCategory,eventAction:eventAction,eventLabel:eventLabel,page:canonicalURL});},initOverlay:function(){var overlays=document.querySelectorAll("div.overlay");for(var i=0;i<overlays.length;i++){var overlay=overlays[i];overlay.addEventListener("click",C3Web.overlayClick,false);}},overlayClick:function(event){var link=event.target;if(link.classList.contains("overlay")&&!link.classList.contains("uncloseable")){link.style.display="none";}},closeAllOverlays:function(event){event.preventDefault();var overlays=document.querySelectorAll("div.overlay");for(var i=0;i<overlays.length;i++){var overlay=overlays[i];overlay.style.display="none";}},doAutoFocus:function(){var e=document.querySelector(".autoFocus");if(e===null||e===undefined)return;var val=e.value;e.value="";e.focus();e.value=val;},closeUserMenu(link){var mobile=document.querySelectorAll(".topNav .accountLinks .popper")[0];var isMobileMenu=(mobile.currentStyle?mobile.currentStyle.display:getComputedStyle(mobile,null).display)==="none";if(isMobileMenu){C3Web.showMobileTopMenu("LoggedInMenu");return false;}
var popup=link.parentNode.getElementsByClassName("popper")[0];if(popup===undefined)return false;var visibility=popup.style.visibility;var visible=visibility!=="hidden";if(visible){popup.style.visibility="hidden";}else{popup.style.visibility="visible";}
link.onmouseout=function(){popup.style.visibility="";link.onmouseout=null;};return false;},showPopper(clickedLink){},showMobileTopMenu(selectedMenuElID){var mobileMenuContent=document.getElementById("MobileMenuContent");mobileMenuContent.style.visibility="visible";mobileMenuContent.style.zIndex="3";var closer=mobileMenuContent.getElementsByClassName("closer")[0];closer.style.WebkitTransition="transform 700ms";closer.style.MozTransition="transform 500ms";closer.style.webkitTransform="scale(1)";closer.style.transform="scale(1)";var homelink=mobileMenuContent.getElementsByClassName("homelink")[0];homelink.style.WebkitTransition="transform 700ms";homelink.style.MozTransition="transform 500ms";homelink.style.webkitTransform="scale(1)";homelink.style.transform="scale(1)";var inner=mobileMenuContent.getElementsByClassName("mobileInner")[0];inner.style.width="90%";var hider=mobileMenuContent.getElementsByClassName("mobileHider")[0];hider.style.opacity="1";hider.style.display="block";if(selectedMenuElID!==undefined&&selectedMenuElID!==null){C3Web.openSpecifiedMobileMenuSubMenu(selectedMenuElID);}
return false;},openSpecifiedMobileMenuSubMenu(menuLiID){var topMenu=document.getElementById("TopMobileMenu");var selectedLis=topMenu.querySelectorAll("li.selected");for(var i=0;i<selectedLis.length;i++){selectedLis[i].classList.remove("selected");}
var openMenu=document.getElementById(menuLiID);if(openMenu!==undefined&&openMenu!==null){openMenu.classList.add("selected");}},hideMobileTopMenu(){var mobileMenuContent=document.getElementById("MobileMenuContent");var closer=mobileMenuContent.getElementsByClassName("closer")[0];closer.style.WebkitTransition="transform 200ms";closer.style.MozTransition="transform 200ms";closer.style.webkitTransform="scale(0)";closer.style.transform="scale(0)";var homelink=mobileMenuContent.getElementsByClassName("homelink")[0];homelink.style.WebkitTransition="transform 200ms";homelink.style.MozTransition="transform 200ms";homelink.style.webkitTransform="scale(0)";homelink.style.transform="scale(0)";var inner=mobileMenuContent.getElementsByClassName("mobileInner")[0];inner.style.width="0";var hider=mobileMenuContent.getElementsByClassName("mobileHider")[0];hider.style.opacity="0";setTimeout(function(){mobileMenuContent.style.zIndex="-100";mobileMenuContent.style.visibility="hidden";hider.style.display="none";},200);return false;},mobileSubMenu(link){var parent=link.parentNode;var subMenu=parent.getElementsByClassName("subMenu")[0];if(subMenu===undefined)return false;if(parent.classList.contains("selected")){parent.classList.remove("selected");}else{var list=parent.parentNode;var selected=list.querySelectorAll("li.selected");for(var i=0;i<selected.length;i++){selected[i].classList.remove("selected");}
parent.classList.add("selected");}
return false;}};document.addEventListener("DOMContentLoaded",C3Web.doAutoFocus);document.addEventListener("DOMContentLoaded",C3Web.initLazyLoadImages);document.addEventListener("DOMContentLoaded",C3Web.initOutlinkTracking);document.addEventListener("DOMContentLoaded",C3Web.loadDeferredCSS);document.addEventListener("DOMContentLoaded",C3Web.initOverlay);})();
!function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=0)}([function(e,t,r){"use strict";r.r(t);var n=Object.assign||function(e){for(var t,r=1,n=arguments.length;r<n;r++)for(var o in t=arguments[r])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},o=new(function(){function e(){this.gameFrame=null}return e.prototype.init=function(e){this.gameFrame=this.getGameframe(),"1.0.0"!==e.version?this.gameFrame.init(e):this.initLegacy(e)},e.prototype.requestAd=function(e){this.gameFrame?this.gameFrame.requestAd(e):console.error("[CrazySDK Legacy] call init first")},e.prototype.getGameframe=function(){var e=window.Crazygames;if(!e)throw new Error("[CrazySDK Legacy] gameframe not found?");return e},e.prototype.initLegacy=function(e){if(!this.gameFrame)throw new Error("[CrazySDK Legacy] gameframe not found?");this.gameFrame.init(n({},e,{sdkType:"unity5.6"}))},e}());window.CrazySDK=o}]);
(this["webpackJsonpcrazygames-gameframe"]=this["webpackJsonpcrazygames-gameframe"]||[]).push([[0],{646:function(e,t,n){"use strict";var r=n(671);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(683)).default;t.default=i},660:function(e,t){e.exports=function(e){return e&&e.__esModule?e:{default:e}}},662:function(e,t,n){"use strict";t.__esModule=!0,t.default=void 0;var r=!("undefined"===typeof window||!window.document||!window.document.createElement);t.default=r,e.exports=t.default},671:function(e,t){e.exports=function(e){return e&&e.__esModule?e:{default:e}}},672:function(e,t,n){"use strict";var r=function(){};e.exports=r},673:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;t.default={RESISTANCE_COEF:.6,UNCERTAINTY_THRESHOLD:3}},683:function(e,t,n){"use strict";var r=n(671);Object.defineProperty(t,"__esModule",{value:!0}),t.getDomTreeShapes=C,t.findNativeHandler=O,t.default=void 0;var i=r(n(684)),a=r(n(685)),o=r(n(687)),s=r(n(688)),l=r(n(689)),d=r(n(692)),u=r(n(693)),c=r(n(0)),f=r(n(7)),p=(r(n(672)),r(n(695))),h=r(n(696)),v=r(n(697)),m=n(698);function g(e,t,n,r){return(0,h.default)(e,t,n,r),{remove:function(){(0,v.default)(e,t,n,r)}}}var y={direction:"ltr",display:"flex",willChange:"transform"},b={width:"100%",WebkitFlexShrink:0,flexShrink:0,overflow:"auto"},x={root:{x:{overflowX:"hidden"},"x-reverse":{overflowX:"hidden"},y:{overflowY:"hidden"},"y-reverse":{overflowY:"hidden"}},flexDirection:{x:"row","x-reverse":"row-reverse",y:"column","y-reverse":"column-reverse"},transform:{x:function(e){return"translate(".concat(-e,"%, 0)")},"x-reverse":function(e){return"translate(".concat(e,"%, 0)")},y:function(e){return"translate(0, ".concat(-e,"%)")},"y-reverse":function(e){return"translate(0, ".concat(e,"%)")}},length:{x:"width","x-reverse":"width",y:"height","y-reverse":"height"},rotationMatrix:{x:{x:[1,0],y:[0,1]},"x-reverse":{x:[-1,0],y:[0,1]},y:{x:[0,1],y:[1,0]},"y-reverse":{x:[0,-1],y:[1,0]}},scrollPosition:{x:"scrollLeft","x-reverse":"scrollLeft",y:"scrollTop","y-reverse":"scrollTop"},scrollLength:{x:"scrollWidth","x-reverse":"scrollWidth",y:"scrollHeight","y-reverse":"scrollHeight"},clientLength:{x:"clientWidth","x-reverse":"clientWidth",y:"clientHeight","y-reverse":"clientHeight"}};function S(e,t){var n=t.duration,r=t.easeFunction,i=t.delay;return"".concat(e," ").concat(n," ").concat(r," ").concat(i)}function w(e,t){var n=x.rotationMatrix[t];return{pageX:n.x[0]*e.pageX+n.x[1]*e.pageY,pageY:n.y[0]*e.pageX+n.y[1]*e.pageY}}function E(e){return e.touches=[{pageX:e.pageX,pageY:e.pageY}],e}function C(e,t){for(var n=[];e&&e!==t&&!e.hasAttribute("data-swipeable");){var r=window.getComputedStyle(e);"absolute"===r.getPropertyValue("position")||"hidden"===r.getPropertyValue("overflow-x")?n=[]:(e.clientWidth>0&&e.scrollWidth>e.clientWidth||e.clientHeight>0&&e.scrollHeight>e.clientHeight)&&n.push({element:e,scrollWidth:e.scrollWidth,scrollHeight:e.scrollHeight,clientWidth:e.clientWidth,clientHeight:e.clientHeight,scrollLeft:e.scrollLeft,scrollTop:e.scrollTop}),e=e.parentNode}return n}var M=null;function O(e){var t=e.domTreeShapes,n=e.pageX,r=e.startX,i=e.axis;return t.some((function(e){var t=n>=r;"x"!==i&&"y"!==i||(t=!t);var a=e[x.scrollPosition[i]],o=a>0,s=a+e[x.clientLength[i]]<e[x.scrollLength[i]];return!!(t&&s||!t&&o)&&(M=e.element,!0)}))}var T=function(e){function t(e){var n;return(0,o.default)(this,t),(n=(0,l.default)(this,(0,d.default)(t).call(this,e))).rootNode=null,n.containerNode=null,n.ignoreNextScrollEvents=!1,n.viewLength=0,n.startX=0,n.lastX=0,n.vx=0,n.startY=0,n.isSwiping=void 0,n.started=!1,n.startIndex=0,n.transitionListener=null,n.touchMoveListener=null,n.activeSlide=null,n.indexCurrent=null,n.firstRenderTimeout=null,n.setRootNode=function(e){n.rootNode=e},n.setContainerNode=function(e){n.containerNode=e},n.setActiveSlide=function(e){n.activeSlide=e,n.updateHeight()},n.handleSwipeStart=function(e){var t=n.props.axis,r=w(e.touches[0],t);n.viewLength=n.rootNode.getBoundingClientRect()[x.length[t]],n.startX=r.pageX,n.lastX=r.pageX,n.vx=0,n.startY=r.pageY,n.isSwiping=void 0,n.started=!0;var i=window.getComputedStyle(n.containerNode),a=i.getPropertyValue("-webkit-transform")||i.getPropertyValue("transform");if(a&&"none"!==a){var o=a.split("(")[1].split(")")[0].split(","),s=window.getComputedStyle(n.rootNode),l=w({pageX:parseInt(o[4],10),pageY:parseInt(o[5],10)},t);n.startIndex=-l.pageX/(n.viewLength-parseInt(s.paddingLeft,10)-parseInt(s.paddingRight,10))||0}},n.handleSwipeMove=function(e){if(n.started){if(null===M||M===n.rootNode){var t=n.props,r=t.axis,i=t.children,a=t.ignoreNativeScroll,o=t.onSwitching,s=t.resistance,l=w(e.touches[0],r);if(void 0===n.isSwiping){var d=Math.abs(l.pageX-n.startX),u=Math.abs(l.pageY-n.startY),f=d>u&&d>m.constant.UNCERTAINTY_THRESHOLD;if(!s&&("y"===r||"y-reverse"===r)&&(0===n.indexCurrent&&n.startX<l.pageX||n.indexCurrent===c.default.Children.count(n.props.children)-1&&n.startX>l.pageX))return void(n.isSwiping=!1);if(d>u&&e.preventDefault(),!0===f||u>m.constant.UNCERTAINTY_THRESHOLD)return n.isSwiping=f,void(n.startX=l.pageX)}if(!0===n.isSwiping){e.preventDefault(),n.vx=.5*n.vx+.5*(l.pageX-n.lastX),n.lastX=l.pageX;var p=(0,m.computeIndex)({children:i,resistance:s,pageX:l.pageX,startIndex:n.startIndex,startX:n.startX,viewLength:n.viewLength}),h=p.index,v=p.startX;if(null===M&&!a)if(O({domTreeShapes:C(e.target,n.rootNode),startX:n.startX,pageX:l.pageX,axis:r}))return;v?n.startX=v:null===M&&(M=n.rootNode),n.setIndexCurrent(h);var g=function(){o&&o(h,"move")};!n.state.displaySameSlide&&n.state.isDragging||n.setState({displaySameSlide:!1,isDragging:!0},g),g()}}}else n.handleTouchStart(e)},n.handleSwipeEnd=function(){if(M=null,n.started&&(n.started=!1,!0===n.isSwiping)){var e,t=n.state.indexLatest,r=n.indexCurrent,i=t-r;e=Math.abs(n.vx)>n.props.threshold?n.vx>0?Math.floor(r):Math.ceil(r):Math.abs(i)>n.props.hysteresis?i>0?Math.floor(r):Math.ceil(r):t;var a=c.default.Children.count(n.props.children)-1;e<0?e=0:e>a&&(e=a),n.setIndexCurrent(e),n.setState({indexLatest:e,isDragging:!1},(function(){n.props.onSwitching&&n.props.onSwitching(e,"end"),n.props.onChangeIndex&&e!==t&&n.props.onChangeIndex(e,t,{reason:"swipe"}),r===t&&n.handleTransitionEnd()}))}},n.handleTouchStart=function(e){n.props.onTouchStart&&n.props.onTouchStart(e),n.handleSwipeStart(e)},n.handleTouchEnd=function(e){n.props.onTouchEnd&&n.props.onTouchEnd(e),n.handleSwipeEnd(e)},n.handleMouseDown=function(e){n.props.onMouseDown&&n.props.onMouseDown(e),e.persist(),n.handleSwipeStart(E(e))},n.handleMouseUp=function(e){n.props.onMouseUp&&n.props.onMouseUp(e),n.handleSwipeEnd(E(e))},n.handleMouseLeave=function(e){n.props.onMouseLeave&&n.props.onMouseLeave(e),n.started&&n.handleSwipeEnd(E(e))},n.handleMouseMove=function(e){n.props.onMouseMove&&n.props.onMouseMove(e),n.started&&n.handleSwipeMove(E(e))},n.handleScroll=function(e){if(n.props.onScroll&&n.props.onScroll(e),e.target===n.rootNode)if(n.ignoreNextScrollEvents)n.ignoreNextScrollEvents=!1;else{var t=n.state.indexLatest,r=Math.ceil(e.target.scrollLeft/e.target.clientWidth)+t;n.ignoreNextScrollEvents=!0,e.target.scrollLeft=0,n.props.onChangeIndex&&r!==t&&n.props.onChangeIndex(r,t,{reason:"focus"})}},n.updateHeight=function(){if(null!==n.activeSlide){var e=n.activeSlide.children[0];void 0!==e&&void 0!==e.offsetHeight&&n.state.heightLatest!==e.offsetHeight&&n.setState({heightLatest:e.offsetHeight})}},n.state={indexLatest:e.index,isDragging:!1,renderOnlyActive:!e.disableLazyLoading,heightLatest:0,displaySameSlide:!0},n.setIndexCurrent(e.index),n}return(0,u.default)(t,e),(0,s.default)(t,[{key:"getChildContext",value:function(){var e=this;return{swipeableViews:{slideUpdateHeight:function(){e.updateHeight()}}}}},{key:"componentDidMount",value:function(){var e=this;this.transitionListener=g(this.containerNode,p.default.end,(function(t){t.target===e.containerNode&&e.handleTransitionEnd()})),this.touchMoveListener=g(this.rootNode,"touchmove",(function(t){e.props.disabled||e.handleSwipeMove(t)}),{passive:!1}),this.props.disableLazyLoading||(this.firstRenderTimeout=setTimeout((function(){e.setState({renderOnlyActive:!1})}),0)),this.props.action&&this.props.action({updateHeight:this.updateHeight})}},{key:"componentWillReceiveProps",value:function(e){var t=e.index;"number"===typeof t&&t!==this.props.index&&(this.setIndexCurrent(t),this.setState({displaySameSlide:(0,m.getDisplaySameSlide)(this.props,e),indexLatest:t}))}},{key:"componentWillUnmount",value:function(){this.transitionListener.remove(),this.touchMoveListener.remove(),clearTimeout(this.firstRenderTimeout)}},{key:"setIndexCurrent",value:function(e){if(this.props.animateTransitions||this.indexCurrent===e||this.handleTransitionEnd(),this.indexCurrent=e,this.containerNode){var t=this.props.axis,n=x.transform[t](100*e);this.containerNode.style.WebkitTransform=n,this.containerNode.style.transform=n}}},{key:"handleTransitionEnd",value:function(){this.props.onTransitionEnd&&(this.state.displaySameSlide||this.state.isDragging||this.props.onTransitionEnd())}},{key:"render",value:function(){var e,t,n=this,r=this.props,o=(r.action,r.animateHeight),s=r.animateTransitions,l=r.axis,d=r.children,u=r.containerStyle,f=r.disabled,p=(r.disableLazyLoading,r.enableMouseEvents),h=(r.hysteresis,r.ignoreNativeScroll,r.index,r.onChangeIndex,r.onSwitching,r.onTransitionEnd,r.resistance,r.slideStyle),v=r.slideClassName,m=r.springConfig,g=r.style,w=(r.threshold,(0,a.default)(r,["action","animateHeight","animateTransitions","axis","children","containerStyle","disabled","disableLazyLoading","enableMouseEvents","hysteresis","ignoreNativeScroll","index","onChangeIndex","onSwitching","onTransitionEnd","resistance","slideStyle","slideClassName","springConfig","style","threshold"])),E=this.state,C=E.displaySameSlide,M=E.heightLatest,O=E.indexLatest,T=E.isDragging,L=E.renderOnlyActive,N=f?{}:{onTouchStart:this.handleTouchStart,onTouchEnd:this.handleTouchEnd},j=!f&&p?{onMouseDown:this.handleMouseDown,onMouseUp:this.handleMouseUp,onMouseLeave:this.handleMouseLeave,onMouseMove:this.handleMouseMove}:{},k=(0,i.default)({},b,h);if(T||!s||C)e="all 0s ease 0s",t="all 0s ease 0s";else if(e=S("transform",m),t=S("-webkit-transform",m),0!==M){var P=", ".concat(S("height",m));e+=P,t+=P}var X={height:null,WebkitFlexDirection:x.flexDirection[l],flexDirection:x.flexDirection[l],WebkitTransition:t,transition:e};if(!L){var D=x.transform[l](100*this.indexCurrent);X.WebkitTransform=D,X.transform=D}return o&&(X.height=M),c.default.createElement("div",(0,i.default)({ref:this.setRootNode,style:(0,i.default)({},x.root[l],g)},w,N,j,{onScroll:this.handleScroll}),c.default.createElement("div",{ref:this.setContainerNode,style:(0,i.default)({},X,y,u),className:"react-swipeable-view-container"},c.default.Children.map(d,(function(e,t){if(L&&t!==O)return null;var r,i=!0;return t===O&&(i=!1,o&&(r=n.setActiveSlide,k.overflowY="hidden")),c.default.createElement("div",{ref:r,style:k,className:v,"aria-hidden":i,"data-swipeable":"true"},e)}))))}}]),t}(c.default.Component);T.displayName="ReactSwipableView",T.propTypes={},T.defaultProps={animateHeight:!1,animateTransitions:!0,axis:"x",disabled:!1,disableLazyLoading:!1,enableMouseEvents:!1,hysteresis:.6,ignoreNativeScroll:!1,index:0,threshold:5,springConfig:{duration:"0.35s",easeFunction:"cubic-bezier(0.15, 0.3, 0.25, 1)",delay:"0s"},resistance:!1},T.childContextTypes={swipeableViews:f.default.shape({slideUpdateHeight:f.default.func})};var L=T;t.default=L},684:function(e,t){function n(){return e.exports=n=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},n.apply(this,arguments)}e.exports=n},685:function(e,t,n){var r=n(686);e.exports=function(e,t){if(null==e)return{};var n,i,a=r(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}},686:function(e,t){e.exports=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}},687:function(e,t){e.exports=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}},688:function(e,t){function n(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}e.exports=function(e,t,r){return t&&n(e.prototype,t),r&&n(e,r),e}},689:function(e,t,n){var r=n(690),i=n(691);e.exports=function(e,t){return!t||"object"!==r(t)&&"function"!==typeof t?i(e):t}},690:function(e,t){function n(e){return(n="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"===typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function r(t){return"function"===typeof Symbol&&"symbol"===n(Symbol.iterator)?e.exports=r=function(e){return n(e)}:e.exports=r=function(e){return e&&"function"===typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":n(e)},r(t)}e.exports=r},691:function(e,t){e.exports=function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}},692:function(e,t){function n(t){return e.exports=n=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)},n(t)}e.exports=n},693:function(e,t,n){var r=n(694);e.exports=function(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&r(e,t)}},694:function(e,t){function n(t,r){return e.exports=n=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e},n(t,r)}e.exports=n},695:function(e,t,n){"use strict";var r=n(73);t.__esModule=!0,t.default=t.animationEnd=t.animationDelay=t.animationTiming=t.animationDuration=t.animationName=t.transitionEnd=t.transitionDuration=t.transitionDelay=t.transitionTiming=t.transitionProperty=t.transform=void 0;var i,a,o,s,l,d,u,c,f,p,h,v=r(n(662)),m="transform";if(t.transform=m,t.animationEnd=o,t.transitionEnd=a,t.transitionDelay=u,t.transitionTiming=d,t.transitionDuration=l,t.transitionProperty=s,t.animationDelay=h,t.animationTiming=p,t.animationDuration=f,t.animationName=c,v.default){var g=function(){for(var e,t,n=document.createElement("div").style,r={O:function(e){return"o"+e.toLowerCase()},Moz:function(e){return e.toLowerCase()},Webkit:function(e){return"webkit"+e},ms:function(e){return"MS"+e}},i=Object.keys(r),a="",o=0;o<i.length;o++){var s=i[o];if(s+"TransitionProperty"in n){a="-"+s.toLowerCase(),e=r[s]("TransitionEnd"),t=r[s]("AnimationEnd");break}}!e&&"transitionProperty"in n&&(e="transitionend");!t&&"animationName"in n&&(t="animationend");return n=null,{animationEnd:t,transitionEnd:e,prefix:a}}();i=g.prefix,t.transitionEnd=a=g.transitionEnd,t.animationEnd=o=g.animationEnd,t.transform=m=i+"-"+m,t.transitionProperty=s=i+"-transition-property",t.transitionDuration=l=i+"-transition-duration",t.transitionDelay=u=i+"-transition-delay",t.transitionTiming=d=i+"-transition-timing-function",t.animationName=c=i+"-animation-name",t.animationDuration=f=i+"-animation-duration",t.animationTiming=p=i+"-animation-delay",t.animationDelay=h=i+"-animation-timing-function"}var y={transform:m,end:a,property:s,timing:d,delay:u,duration:l};t.default=y},696:function(e,t,n){"use strict";var r=n(73);t.__esModule=!0,t.default=void 0;var i=function(){};r(n(662)).default&&(i=document.addEventListener?function(e,t,n,r){return e.addEventListener(t,n,r||!1)}:document.attachEvent?function(e,t,n){return e.attachEvent("on"+t,(function(t){(t=t||window.event).target=t.target||t.srcElement,t.currentTarget=e,n.call(e,t)}))}:void 0);var a=i;t.default=a,e.exports=t.default},697:function(e,t,n){"use strict";var r=n(73);t.__esModule=!0,t.default=void 0;var i=function(){};r(n(662)).default&&(i=document.addEventListener?function(e,t,n,r){return e.removeEventListener(t,n,r||!1)}:document.attachEvent?function(e,t,n){return e.detachEvent("on"+t,n)}:void 0);var a=i;t.default=a,e.exports=t.default},698:function(e,t,n){"use strict";var r=n(660);Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"checkIndexBounds",{enumerable:!0,get:function(){return i.default}}),Object.defineProperty(t,"computeIndex",{enumerable:!0,get:function(){return a.default}}),Object.defineProperty(t,"constant",{enumerable:!0,get:function(){return o.default}}),Object.defineProperty(t,"getDisplaySameSlide",{enumerable:!0,get:function(){return s.default}}),Object.defineProperty(t,"mod",{enumerable:!0,get:function(){return l.default}});var i=r(n(699)),a=r(n(700)),o=r(n(673)),s=r(n(701)),l=r(n(702))},699:function(e,t,n){"use strict";var r=n(660);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(0)),a=(r(n(672)),function(e){e.index;var t=e.children;i.default.Children.count(t)});t.default=a},700:function(e,t,n){"use strict";var r=n(660);Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){var t,n=e.children,r=e.startIndex,o=e.startX,s=e.pageX,l=e.viewLength,d=e.resistance,u=i.default.Children.count(n)-1,c=r+(o-s)/l;d?c<0?c=Math.exp(c*a.default.RESISTANCE_COEF)-1:c>u&&(c=u+1-Math.exp((u-c)*a.default.RESISTANCE_COEF)):c<0?t=((c=0)-r)*l+s:c>u&&(t=((c=u)-r)*l+s);return{index:c,startX:t}};var i=r(n(0)),a=r(n(673))},701:function(e,t,n){"use strict";var r=n(660);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(0)),a=function(e,t){var n=!1,r=function(e){return e?e.key:"empty"};if(e.children.length&&t.children.length){var a=i.default.Children.map(e.children,r)[e.index];if(null!==a&&void 0!==a)a===i.default.Children.map(t.children,r)[t.index]&&(n=!0)}return n};t.default=a},702:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var r=function(e,t){var n=e%t;return n<0?n+t:n};t.default=r},727:function(e,t,n){"use strict";var r=n(1),i=n(153),a=n(6),o=n(0),s=n.n(o),l=(n(7),n(9)),d=n(16),u=n(563),c=n(33),f=n(37),p=n(61),h=s.a.forwardRef((function(e,t){var n=e.classes,i=e.className,o=e.color,d=void 0===o?"primary":o,u=e.value,f=e.valueBuffer,h=e.variant,v=void 0===h?"indeterminate":h,m=Object(a.a)(e,["classes","className","color","value","valueBuffer","variant"]),g=Object(p.a)(),y={},b={bar1:{},bar2:{}};if("determinate"===v||"buffer"===v)if(void 0!==u){y["aria-valuenow"]=Math.round(u);var x=u-100;"rtl"===g.direction&&(x=-x),b.bar1.transform="translateX(".concat(x,"%)")}else 0;if("buffer"===v)if(void 0!==f){var S=(f||0)-100;"rtl"===g.direction&&(S=-S),b.bar2.transform="translateX(".concat(S,"%)")}else 0;return s.a.createElement("div",Object(r.a)({className:Object(l.a)(n.root,n["color".concat(Object(c.a)(d))],i,{determinate:n.determinate,indeterminate:n.indeterminate,buffer:n.buffer,query:n.query}[v]),role:"progressbar"},y,{ref:t},m),"buffer"===v?s.a.createElement("div",{className:Object(l.a)(n.dashed,n["dashedColor".concat(Object(c.a)(d))])}):null,s.a.createElement("div",{className:Object(l.a)(n.bar,n["barColor".concat(Object(c.a)(d))],("indeterminate"===v||"query"===v)&&n.bar1Indeterminate,{determinate:n.bar1Determinate,buffer:n.bar1Buffer}[v]),style:b.bar1}),"determinate"===v?null:s.a.createElement("div",{className:Object(l.a)(n.bar,("indeterminate"===v||"query"===v)&&n.bar2Indeterminate,"buffer"===v?[n["color".concat(Object(c.a)(d))],n.bar2Buffer]:n["barColor".concat(Object(c.a)(d))]),style:b.bar2}))})),v=Object(d.a)((function(e){var t=function(t){return"light"===e.palette.type?Object(f.d)(t,.62):Object(f.a)(t,.5)},n=t(e.palette.primary.main),r=t(e.palette.secondary.main);return{root:{position:"relative",overflow:"hidden",height:4},colorPrimary:{backgroundColor:n},colorSecondary:{backgroundColor:r},determinate:{},indeterminate:{},buffer:{backgroundColor:"transparent"},query:{transform:"rotate(180deg)"},dashed:{position:"absolute",marginTop:0,height:"100%",width:"100%",animation:"$buffer 3s infinite linear"},dashedColorPrimary:{backgroundImage:"radial-gradient(".concat(n," 0%, ").concat(n," 16%, transparent 42%)"),backgroundSize:"10px 10px",backgroundPosition:"0px -23px"},dashedColorSecondary:{backgroundImage:"radial-gradient(".concat(r," 0%, ").concat(r," 16%, transparent 42%)"),backgroundSize:"10px 10px",backgroundPosition:"0px -23px"},bar:{width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left"},barColorPrimary:{backgroundColor:e.palette.primary.main},barColorSecondary:{backgroundColor:e.palette.secondary.main},bar1Indeterminate:{width:"auto",animation:"$indeterminate1 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite"},bar1Determinate:{transition:"transform .".concat(4,"s linear")},bar1Buffer:{zIndex:1,transition:"transform .".concat(4,"s linear")},bar2Indeterminate:{width:"auto",animation:"$indeterminate2 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite",animationDelay:"1.15s"},bar2Buffer:{transition:"transform .".concat(4,"s linear")},"@keyframes indeterminate1":{"0%":{left:"-35%",right:"100%"},"60%":{left:"100%",right:"-90%"},"100%":{left:"100%",right:"-90%"}},"@keyframes indeterminate2":{"0%":{left:"-200%",right:"100%"},"60%":{left:"107%",right:"-8%"},"100%":{left:"107%",right:"-8%"}},"@keyframes buffer":{"0%":{opacity:1,backgroundPosition:"0px -23px"},"50%":{opacity:0,backgroundPosition:"0px -23px"},"100%":{opacity:1,backgroundPosition:"-200px -23px"}}}}),{name:"MuiLinearProgress"})(h),m=s.a.forwardRef((function(e,t){var n=e.activeStep,o=void 0===n?0:n,d=e.backButton,f=e.classes,p=e.className,h=e.LinearProgressProps,m=e.nextButton,g=e.position,y=void 0===g?"bottom":g,b=e.steps,x=e.variant,S=void 0===x?"dots":x,w=Object(a.a)(e,["activeStep","backButton","classes","className","LinearProgressProps","nextButton","position","steps","variant"]);return s.a.createElement(u.a,Object(r.a)({square:!0,elevation:0,className:Object(l.a)(f.root,f["position".concat(Object(c.a)(y))],p),ref:t},w),d,"text"===S&&s.a.createElement(s.a.Fragment,null,o+1," / ",b),"dots"===S&&s.a.createElement("div",{className:f.dots},Object(i.a)(new Array(b)).map((function(e,t){return s.a.createElement("div",{key:t,className:Object(l.a)(f.dot,t===o&&f.dotActive)})}))),"progress"===S&&s.a.createElement(v,Object(r.a)({className:f.progress,variant:"determinate",value:Math.ceil(o/(b-1)*100)},h)),m)}));t.a=Object(d.a)((function(e){return{root:{display:"flex",flexDirection:"row",justifyContent:"space-between",alignItems:"center",background:e.palette.background.default,padding:8},positionBottom:{position:"fixed",bottom:0,left:0,right:0,zIndex:e.zIndex.mobileStepper},positionTop:{position:"fixed",top:0,left:0,right:0,zIndex:e.zIndex.mobileStepper},positionStatic:{},dots:{display:"flex",flexDirection:"row"},dot:{backgroundColor:e.palette.action.disabled,borderRadius:"50%",width:8,height:8,margin:"0 2px"},dotActive:{backgroundColor:e.palette.primary.main},progress:{width:"50%"}}}),{name:"MuiMobileStepper"})(m)}}]);
