function initializeGameModule()
{
	startGame();
	
	$(window).on("mousemove", forwardMouseMove);
	$(window).on("mousedown", forwardMouseDown);
	$(window).on("mouseup",   forwardMouseUp);
}

var currentGame = null;
function forwardMouseDown(evt)
{
	if(currentGame)
		currentGame.mouseDown(evt);
}
function forwardMouseUp(evt)
{
	if(currentGame)
		currentGame.mouseUp(evt);
}
function forwardMouseMove(evt)
{
	if(currentGame)
		currentGame.mouseMove(evt);
}

function getMousePosition(evt)
{
	return new Location(evt.pageX, evt.pageY);
}

function PieceDragger(startSquare, mouseStartPos)
{
	this.startSquare   = startSquare.copy();
	this.hoveredSquare = startSquare.copy();
	this.mouseStartPos = mouseStartPos.copy();
	this.cloneNode     = null;
	
	this.isDragging = function()
	{
		return this.cloneNode != null;
	}
	
	this.markHoverSquare = function(square)
	{
		hoverSquareNode(currentGame.getNode(square));
	}
	
	this.unmarkHoverSquare = function(square)
	{
		unhoverSquareNode(currentGame.getNode(square));
	}
	
	this.changeHoverSquare = function(square)
	{
		if(!square.equals(this.hoveredSquare))
		{
			this.markHoverSquare(square);
			this.unmarkHoverSquare(this.hoveredSquare);
			
			this.hoveredSquare = square.copy();
		}
	}
	
	this.start = function(mousePos)
	{
		this.createClone(mousePos);
		
		currentGame.select(this.startSquare);
	}
	
	this.stop = function()
	{
		this.removeClone();
		
		this.unmarkHoverSquare(this.hoveredSquare);
	}
	
	this.createClone = function(mousePos)
	{
		var squareNode = currentGame.getNode(this.startSquare);
		var imageNode  = squareNode.firstChild;
		
		this.cloneNode = document.createElement("img");
		this.cloneNode.src = imageNode.src;
		this.cloneNode.className = "board_piece_clone";
		$(this.cloneNode).width ($(imageNode).width());
		$(this.cloneNode).height($(imageNode).height());
		this.moveClone(mousePos);
		
		clearNode(squareNode);
		document.getElementsByTagName("BODY")[0].appendChild(this.cloneNode);
	}
	
	this.removeClone = function()
	{
		if(this.isDragging())
			document.getElementsByTagName("BODY")[0].removeChild(this.cloneNode);	}
	
	this.moveClone = function(mousePos)
	{
		$(this.cloneNode).offset({
		    left: mousePos.x - $(this.cloneNode).width() / 2,
			top:  mousePos.y - $(this.cloneNode).height() / 2
		});
	}
	
	this.mouseMove = function(evt)
	{
		var mousePos = getMousePosition(evt);
		var hoveredSquare = currentGame.intersectSquare(mousePos);
		if(!hoveredSquare)
			return;
		
		var distanceFromStart = Math.max(Math.abs(mousePos.x - this.mouseStartPos.x),
										 Math.abs(mousePos.y - this.mouseStartPos.y));
		
		if(this.isDragging())
		{
			this.moveClone(mousePos);
			this.changeHoverSquare(hoveredSquare);
		}
		else if(distanceFromStart >= Settings.Application.minDragDistance)
		{
			this.start(mousePos);
		}
	}
}

function SquareHighlighter()
{
	var lastHoveredSquare = null;
	
	this.mouseMove = function(evt)
	{
		var hoveredSquare = currentGame.intersectSquare(getMousePosition(evt));
		
		if(!this.lastHoveredSquare)
			return;
		if(hoveredSquare.equals(this.lastHoveredSquare))
			return;
		
		this.redraw();
		this.lastHoveredSquare = hoveredSquare.copy();
	}
	
	this.redraw = function()
	{
		this.dimAll();
		
		if(Settings.Application.enableHoverHighlights)
			this.drawHover();
		
		this.drawPremoves();
		this.drawSelection();
		
		if(Settings.highlightLastMove)
			this.drawLastMove();
	}
	
	this.dimAll = function()
	{
		for(var yi = 0; yi < 8; yi++)
			for(var xi = 0; xi < 8; xi++)
				dimSquareNode(getSquareNode(xi, yi));
	}
	
	this.hover = function(square)
	{
		hoverSquareNode(currentGame.getNode(square));
	}
	
	this.premove = function(square)
	{
		premoveSquareNode(currentGame.getNode(square));
	}
	
	this.highlight = function(square)
	{
		highlightSquareNode(currentGame.getNode(square));
	}
	
	this.drawHover = function()
	{
		if(currentGame.pieceDragger)
			if(currentGame.pieceDragger.hoveredSquare)
				this.hover(currentGame.pieceDragger.hoveredSquare);
	}
	
	this.drawPremoves = function()
	{
		for(var i = 0; i < currentGame.premover.moves.length; i++)
		{
			this.premove(currentGame.premover.moves[i].from);
			this.premove(currentGame.premover.moves[i].to);
		}
	}
	
	this.drawSelection = function()
	{
		if(currentGame.selection)
			this.highlight(currentGame.selection);
	}
	
	this.drawLastMove = function()
	{
		if(!Settings.Application.highlightLastPlayerMove
		&& currentGame.position.sideToMove != currentGame.playerSide)
			return;
		
		if(currentGame.lastMove)
		{
			this.highlight(currentGame.lastMove.from);
			this.highlight(currentGame.lastMove.to);
		}
	}
}

function Premover()
{
	this.moves = new Array();
	
	this.draw = function()
	{
		for(var i = 0; i < this.moves.length; i++)
		{
			currentGame.tempBoard.movePiece(this.moves[i]);
		}
	}
	
	this.add = function(move)
	{
		if(Settings.enablePremoves)
			this.moves.push(move);
	}
	
	this.getFirst = function()
	{
		return this.moves[0];
	}
	
	this.removeFirst = function()
	{
		this.moves.splice(0, 1);
	}
	
	this.clear = function()
	{
		this.moves = new Array();
	}
	
	this.tryNext = function()
	{
		if(currentGame.position.sideToMove != currentGame.playerSide)
			return;
		
		if(this.moves.length == 0)
		{
		}
		else if(currentGame.position.isLegalMove(this.moves[0]))
		{
			var move = this.getFirst();
			this.removeFirst();
			
			currentGame.doMove(move);
		}
		else
		{
			if(currentGame.selection.equals(this.moves[this.moves.length - 1].to))
				currentGame.deselect();
			this.clear();
		}
		currentGame.redraw();
	}
}

function Game(position, selection, materialWon, materialLost, playerSide, lastMove)
{
	this.position = position.copy();
	if(selection)
		this.selection = selection.copy();
	else
		this.selection = null;
	this.materialWon = materialWon;
	this.materialLost = materialLost;
	this.playerSide = playerSide;
	if(lastMove)
		this.lastMove = lastMove.copy();
	
	this.squareHighlighter = new SquareHighlighter();
	this.pieceDragger = null;
	this.premover = new Premover();
	this.heldSquare = null;
	this.tempBoard = null;
	
	this.start = function()
	{
		currentGame = this;
		if(this.lastMove)
			this.setLastMove(this.lastMove.copy());
			
		this.redraw();
	}
	
	this.isWhiteOnBottom = function()
	{
		return Settings.whiteAlwaysOnBottom ? true : (this.playerSide == Side.White ? true : false);
	}
	
	this.redraw = function()
	{
		this.tempBoard = this.position.board.copy();
		
		this.premover.draw();
		
		if(this.pieceDragger)
		{
			if(this.pieceDragger.isDragging())
			{
				this.tempBoard.removePiece(this.tempBoard.pieceAt(this.selection));
			}
		}
		
		renderBoard(this.tempBoard, this.isWhiteOnBottom(), Settings.piecesFont);
		this.squareHighlighter.redraw();
	}
	
	this.translateLocation = function(location)
	{
		return this.isWhiteOnBottom() ? new Location(location.x, 7 - location.y) : new Location(7 - location.x, location.y);
	}
	
	this.getNode = function(square)
	{
		var nodeLocation = this.translateLocation(square);
		return getSquareNode(nodeLocation.x, nodeLocation.y);
	}
	
	this.intersectSquare = function(point)
	{
		var intersection = intersectSquareNode(point);
		if(intersection)
			return this.translateLocation(intersection.location);
		else
			return null;
	}
	
	this.isOwnedSquare = function(square)
	{
		var piece = this.tempBoard.pieceAt(square);
		if(!piece)
			return false;
		return piece.type.side == this.playerSide;
	}
	
	this.setLastMove = function(move)
	{
		this.lastMove = move.copy();
	}
	
	this.select = function(square)
	{
		if(this.selection)
			this.deselect();
		this.selection = square.copy();
		this.squareHighlighter.redraw();
	}
	
	this.deselect = function()
	{
		if(this.selection)
			this.selection = null;
		this.stopDragging();
		this.squareHighlighter.redraw();
	}
	
	this.stopDragging = function()
	{
		if(!this.pieceDragger)
			return;
		this.pieceDragger.stop();
		this.pieceDragger = null;
		this.redraw();
	}
	
	this.isDragging = function()
	{
		if(this.pieceDragger)
			return this.pieceDragger.isDragging();
		return false;
	}
	
	this.mouseDown = function(evt)
	{
		this.heldSquare = this.intersectSquare(getMousePosition(evt));
		if(!this.heldSquare)
			return;
		if(!this.isOwnedSquare(this.heldSquare))
			return;
		
		if(!this.pieceDragger && Settings.enablePieceDragging)
			this.pieceDragger = new PieceDragger(this.heldSquare, getMousePosition(evt));
	}
	
	this.mouseUp = function(evt)
	{
		this.stopDragging();
		
		var hoveredSquare = this.intersectSquare(getMousePosition(evt));
		if(!hoveredSquare)
		{
			this.deselect();
			this.redraw();
			return;
		}
		
		if(!this.heldSquare)
			return;
		
		if(!this.selection)
		{
			if(this.heldSquare.equals(hoveredSquare)
			&& this.isOwnedSquare(hoveredSquare))
			{
				this.select(hoveredSquare);
			}
		}
		else if(this.selection.equals(hoveredSquare))
		{
			this.deselect();
		}
		else
		{
			this.tryMove(new Move(this.selection, hoveredSquare));
		}
	}
	
	this.mouseMove = function(evt)
	{
		this.squareHighlighter.mouseMove(evt);
		this.hoveredSquare = this.intersectSquare(getMousePosition(evt));
		
		if(this.pieceDragger)
			this.pieceDragger.mouseMove(evt);
	}
	
	this.tryMove = function(move)
	{
		if(this.position.sideToMove == this.playerSide)
		{
			if(this.position.isLegalMove(move))
				this.doMove(move);
		}
		else if(!move.from.equals(move.to))
		{
			this.premover.add(move);
		}
		this.deselect();
		this.redraw();
	}
	
	this.doOpponentMove = function(move)
	{
		if(move.to.equals(this.selection))
		{
			if(this.pieceDragger)
			{
				this.pieceDragger.stop();
				this.pieceDragger = null;
			}
			this.deselect();
		}
		
		this.doMove(move);
	}
	
	this.doMove = function(move)
	{
		if((move.to.y == 0 || move.to.y == 7)
		&& this.position.board.pieceAt(move.from).type.basicType == BasicPieceType.Pawn)
		{
			if(this.position.sideToMove == this.playerSide)
			{
				if(Settings.autoQueen)
				{
					this.position = this.position.getPositionAfterPromotion(move, this.playerSide == Side.White ? PieceType.WQueen : PieceType.BQueen);
				}
			}
			else
			{
				this.position = this.position.getPositionAfterPromotion(move, this.playerSide == Side.White ? PieceType.BQueen : PieceType.WQueen);
			}
		}
		else
		{
			this.position = this.position.getPositionAfterMove(move);
		}
		
		if(this.position.sideToMove != Side.White)
		{
			setTimeout(function()
			{
				currentGame.doOpponentMove(currentGame.position.getAllMoves()[Math.floor(Math.random() * currentGame.position.getAllMoves().length)]);
				currentGame.redraw();
			}, 2000);
		}
		this.premover.tryNext();
		
		this.setLastMove(move);
		this.redraw();
		
		/**** DEBUG ****/
		//this.playerSide = getOppositeSide(this.playerSide);
		
		if(this.position.isCheckmate())
			alert("Checkmate!");
		//else if(this.position.inCheck())
		//	alert("Check!");
		else if(this.position.isStalemate())
			alert("Stalemate...");
		
		//if(this.playerSide != this.position.sideToMove)
	}
}

function startGame()
{
	var board = new Board();
	var position = getDefaultPosition();
	var game = new Game(position, null, new Array(), new Array(), Side.White, null);
	game.start();
}
//attachEventListener("load", window, startGame);
