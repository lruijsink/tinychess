function initializeLayoutModule()
{
	renderLayout();
}

function renderCoordinates(whiteOnBottom)
{
	var filesNode = document.getElementsByClassName("board_border_bottom")[0];
	var ranksNode = document.getElementsByClassName("board_border_left")[0];
	
	renderFiles(filesNode, whiteOnBottom);
	renderRanks(ranksNode, whiteOnBottom);
}

function renderFiles(node, whiteOnBottom)
{
	clearNode(node);
	
	var ulNode = document.createElement("ul");
	for(var i = 0; i < 8; i++)
	{
		var character = String.fromCharCode("a".charCodeAt(0) + (whiteOnBottom ? i : 7 - i));
		
		var liNode = document.createElement("li");
		var spanNode = document.createElement("span");
		spanNode.appendChild(document.createTextNode(character));
		liNode.appendChild(spanNode);
		ulNode.appendChild(liNode);
	}
	node.appendChild(ulNode);
}

function renderRanks(node, whiteOnBottom)
{
	clearNode(node);
	
	var ulNode = document.createElement("ul");
	for(var i = 0; i < 8; i++)
	{
		var liNode = document.createElement("li");
		var spanNode = document.createElement("span");
		spanNode.appendChild(document.createTextNode(whiteOnBottom ? 8 - i : 1 + i));
		liNode.appendChild(spanNode);
		ulNode.appendChild(liNode);
	}
	node.appendChild(ulNode);
}

var squareNodes = new Array(8);

function getSquareNodes()
{
	return squareNodes;
}

function getSquareNode(x, y)
{
	return squareNodes[y][x];
}

function renderSquares()
{
	var rootNode = document.getElementsByClassName("board_squares")[0];
	
	clearNode(rootNode);
	squareNodes = new Array(8);
	
	var lightSquare = true;
	for(var yi = 0; yi < 8; yi++)
	{
		squareNodes[yi] = new Array(8);
		
		var rowNode = document.createElement("div");
		rowNode.className = "board_row";
		rootNode.appendChild(rowNode);
		
		for(var xi = 0; xi < 8; xi++)
		{
			var squareNode = document.createElement("div");
			squareNodes[yi][xi] = squareNode;
			
			squareNode.className = lightSquare ? "board_square board_light_square" : "board_square board_dark_square";
			rowNode.appendChild(squareNode);
			
			lightSquare = !lightSquare;
		}
		lightSquare = !lightSquare;
	}
}

function clearSquareNodes()
{
	var rootNode = document.getElementsByClassName("board_squares")[0];
	var rowNode = rootNode.firstChild;
	
	for(var yi = 0; yi < 8; yi++)
	{
		var squareNode = rowNode.firstChild;
		for(var xi = 0; xi < 8; xi++)
		{
			clearNode(squareNode);
			squareNode = squareNode.nextSibling;
		}
		rowNode = rowNode.nextSibling;
	}
}

function intersectSquareNode(point)
{
	var rootNode = document.getElementsByClassName("board_squares")[0];
	
	var rootPos  = new Location($(rootNode).offset().left, $(rootNode).offset().top);
	var rootSize = new Location($(rootNode).width(), $(rootNode).height());
	
	if(point.x < rootPos.x || point.x >= rootPos.x + rootSize.x
	|| point.y < rootPos.y || point.y >= rootPos.y + rootSize.y)
		return null;
	
	var squareSize = new Location(rootSize.x / 8, rootSize.y / 8);
	var relPoint = new Location(point.x - rootPos.x, point.y - rootPos.y);
	var xi = Math.floor(relPoint.x / squareSize.x);
	var yi = Math.floor(relPoint.y / squareSize.y);
	return {node: getSquareNode(xi, yi), location: new Location(xi, yi)};
}

function highlightSquareNode(node)
{
	if(node.className.indexOf("board_light_square") >= 0)
		node.className = "board_square board_light_square_highlight";
	else
		node.className = "board_square board_dark_square_highlight";
}

function dimSquareNode(node)
{
	if(node.className.indexOf("board_light_square") >= 0)
		node.className = "board_square board_light_square";
	else
		node.className = "board_square board_dark_square";
}

function premoveSquareNode(node)
{
	if(node.className.indexOf("board_light_square") >= 0)
		node.className = "board_square board_light_square_premove";
	else
		node.className = "board_square board_dark_square_premove";
}

function unpremoveSquareNode(node)
{
	if(node.className.indexOf("board_light_square") >= 0)
		node.className = "board_square board_light_square";
	else
		node.className = "board_square board_dark_square";
}

function hoverSquareNode(node)
{
	if(!Settings.Application.enableHoverHighlights)
		return;
	
	if(node.className.indexOf("highlight") >= 0
	|| node.className.indexOf("premove") >= 0)
		return;
	
	if(node.className.indexOf("board_light_square") >= 0)
		node.className = "board_square board_light_square_hover";
	else
		node.className = "board_square board_dark_square_hover";
}

function unhoverSquareNode(node)
{
	if(!Settings.Application.enableHoverHighlights)
		return;
	
	if(node.className.indexOf("highlight") >= 0
	|| node.className.indexOf("premove") >= 0)
		return;
	
	if(node.className.indexOf("board_light_square") >= 0)
		node.className = "board_square board_light_square";
	else
		node.className = "board_square board_dark_square";
}

function setNodeVisible(node, show)
{
	node.style.display = show ? "" : "none";
}

function toggleCoordinates(show)
{
	toggleCoordinatesList(document.getElementsByClassName("board_border_bottom")[0].firstChild, show);
	toggleCoordinatesList(document.getElementsByClassName("board_border_left")[0].firstChild, show);
}

function toggleCoordinatesList(ulNode, show)
{
	var liNode = ulNode.firstChild;
	
	while(liNode)
	{
		setNodeVisible(liNode, show);
		
		liNode = liNode.nextSibling;
	}
}

function togglePlayerInfo(show)
{
	setNodeVisible(document.getElementsByClassName("top_player_avatar")[0], show);
	setNodeVisible(document.getElementsByClassName("top_player_text")[0], show);
	setNodeVisible(document.getElementsByClassName("bottom_player_avatar")[0], show);
	setNodeVisible(document.getElementsByClassName("bottom_player_text")[0], show);
}

function setBoardScale(scale)
{
	setFrameScale(scale);
	setBorderScale(scale);
	setSquaresScale(scale);
}

function setFrameScale(scale)
{
	var frameNode   = document.getElementsByClassName("content_frame")[0];
	var frameWidth  = scale + 32.0*scale + scale + 2.0 + 12.0;
	var frameHeight = 2.0 + 0.5 + scale + 32.0*scale + scale + 0.5 + 2.0;
	frameNode.style.width      = frameWidth  + "em";
	frameNode.style.height     = frameHeight + "em";
	frameNode.style.marginLeft = (-frameWidth  / 2.0) + "em";
	frameNode.style.marginTop  = (-frameHeight / 2.0) + "em";
}

function setSquaresScale(scale)
{
	var squaresNode = document.getElementsByClassName("board_squares")[0];
	squaresNode.style.width  = (scale * 32.0) + "em";
	squaresNode.style.height = (scale * 32.0) + "em";
}

function setBorderScale(scale)
{
	var leftNode = document.getElementsByClassName("board_border_left")[0];
	leftNode.style.width = scale + "em";
	
	var rightNode = document.getElementsByClassName("board_border_right")[0];
	rightNode.style.width = scale + "em";
	
	var topNode = document.getElementsByClassName("board_border_top")[0];
	topNode.style.height = scale + "em";
	
	var bottomNode = document.getElementsByClassName("board_border_bottom")[0];
	bottomNode.style.height = scale + "em";
	bottomNode.style.paddingLeft = scale + "em";
	
	setRanksScale(leftNode.firstChild, scale);
	setFilesScale(bottomNode.firstChild, scale);
}

function setRanksScale(ulNode, scale)
{
	ulNode.style.height = (scale * 32.0) + "em";
	
	var liNode = ulNode.firstChild;
	while(liNode)
	{
		liNode.style.paddingLeft = (scale / 4.0) + "em";
		liNode.firstChild.style.fontSize = (3.0 * scale / 4.0) + "em";
		
		liNode = liNode.nextSibling;
	}
}

function setFilesScale(ulNode, scale)
{
	ulNode.style.width = (scale * 32.0) + "em";
	
	var liNode = ulNode.firstChild;
	while(liNode)
	{
		liNode.firstChild.style.fontSize = (3.0 * scale / 4.0) + "em";
		
		liNode = liNode.nextSibling;
	}
}

function renderLayout()
{
	renderCoordinates(true);
	renderSquares();
	
	toggleCoordinates(true);
	togglePlayerInfo(true);
	setBoardScale(1.0);
}
