function initializeMainModule()
{
	initializeLayoutModule();
	initializePiecesModule();
	initializeBoardModule();
	initializePositionModule();
	initializeSettingsModule();
	initializeGameModule();
	
	fixUnselectables();
}

function attachEventListener(eventType, obj, fnc)
{
	if(obj.addEventListener)
	{
		obj.addEventListener(eventType, fnc, false);
	}
	else if(obj.attachEvent)
	{
		obj.attachEvent("on" + eventType, fnc);
	}
}

function detachEventListener(eventType, obj, fnc)
{
	if(obj.addEventListener)
	{
		obj.removeEventListener(eventType, fnc, false);
	}
	else if(obj.attachEvent)
	{
		obj.detachEvent("on" + eventType, fnc);
	}
}

function stopEvent(evt){
	if(evt.preventDefault != undefined)
		evt.preventDefault();
	if(evt.stopPropagation != undefined)
		evt.stopPropagation();
}

function makeUnselectable(node)
{
    if (node.nodeType == 1)
	{
		attachEventListener("contextmenu", node, function(evt) {
			stopEvent(evt);
			return false;
		});
        node.setAttribute("unselectable", "on");
		if(node.className.indexOf("unselectable") < 0)
		{
			node.className += " unselectable";
		}
    }
	
    var child = node.firstChild;
    while (child)
	{
        makeUnselectable(child);
        child = child.nextSibling;
    }
}

function clearNode(node)
{
	while(node.firstChild)
	{
		clearNode(node.firstChild);
		node.removeChild(node.firstChild);
	}
}

function fixUnselectables()
{
	var nodes = document.getElementsByClassName("unselectable");
	
	for(var i = 0; i < nodes.length; i++)
	{
		makeUnselectable(nodes[i]);
	}
}
