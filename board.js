function initializeBoardModule()
{
}

function Board()
{
	this.pieces = new Array();
	
	this.copy = function()
	{
		var newBoard = new Board();
		newBoard.pieces = new Array(this.pieces.length);
		
		for(var i = 0; i < this.pieces.length; i++)
		{
			newBoard.pieces[i] = this.pieces[i].copy();
		}
		
		return newBoard;
	}
	
	this.addPiece = function(piece)
	{
		this.pieces[this.pieces.length] = piece;
	}
	
	this.removePiece = function(piece)
	{
		if(!piece)
			return;
		
		for(var i = 0; i < this.pieces.length; i++)
		{
			if(this.pieces[i].location.equals(piece.location))
			{
				this.pieces.splice(i, 1);
				return;
			}
		}
	}
	
	this.movePiece = function(move)
	{
		var fromPiece = this.pieceAt(move.from).copy();
		
		var toPiece = this.pieceAt(move.to);
		if(toPiece)
			this.removePiece(toPiece);
		
		this.removePiece(fromPiece);
		fromPiece.location = move.to;
		this.addPiece(fromPiece);
	}
	
	this.pieceAt = function(location)
	{
		for(var i = 0; i < this.pieces.length; i++)
		{
			if(this.pieces[i].location.equals(location))
			{
				return this.pieces[i];
			}
		}
		return null;
	}
	
	this.getKing = function(side)
	{
		for(var i = 0; i < this.pieces.length; i++)
		{
			if(this.pieces[i].type.side == side
			&& this.pieces[i].type.basicType == BasicPieceType.King)
			{
				return this.pieces[i];
			}
		}
		return null;
	}
	
	this.toString = function()
	{
		var fmt = "";
		for(var yi = 7; yi >= 0; yi--)
		{
			for(var xi = 0; xi < 8; xi++)
			{
				var piece = this.pieceAt(new Location(xi, yi));
				
				if(piece == null)
				{
					fmt += "_";
				}
				else
				{
					switch(piece.type.id)
					{
					case PieceType.WPawn.id:   fmt += "P"; break;
					case PieceType.WKnight.id: fmt += "N"; break;
					case PieceType.WBishop.id: fmt += "B"; break;
					case PieceType.WRook.id:   fmt += "R"; break;
					case PieceType.WQueen.id:  fmt += "Q"; break;
					case PieceType.WKing.id:   fmt += "K"; break;
					case PieceType.BPawn.id:   fmt += "p"; break;
					case PieceType.BKnight.id: fmt += "n"; break;
					case PieceType.BBishop.id: fmt += "b"; break;
					case PieceType.BRook.id:   fmt += "r"; break;
					case PieceType.BQueen.id:  fmt += "q"; break;
					case PieceType.BKing.id:   fmt += "k"; break;
					}
				}
			}
			fmt += "\n";
		}
		return fmt;
	}
}

function getDefaultBoard()
{
	var board = new Board();
	
	for(var i = 0; i < 8; i++)
	{
		board.addPiece(new Piece(PieceType.WPawn, new Location(i, 1)));
		board.addPiece(new Piece(PieceType.BPawn, new Location(i, 6)));
	}
	
	board.addPiece(new Piece(PieceType.WRook,   new Location(0, 0)));
	board.addPiece(new Piece(PieceType.WRook,   new Location(7, 0)));
	board.addPiece(new Piece(PieceType.BRook,   new Location(0, 7)));
	board.addPiece(new Piece(PieceType.BRook,   new Location(7, 7)));
	
	board.addPiece(new Piece(PieceType.WKnight, new Location(1, 0)));
	board.addPiece(new Piece(PieceType.WKnight, new Location(6, 0)));
	board.addPiece(new Piece(PieceType.BKnight, new Location(1, 7)));
	board.addPiece(new Piece(PieceType.BKnight, new Location(6, 7)));
	
	board.addPiece(new Piece(PieceType.WBishop, new Location(2, 0)));
	board.addPiece(new Piece(PieceType.WBishop, new Location(5, 0)));
	board.addPiece(new Piece(PieceType.BBishop, new Location(2, 7)));
	board.addPiece(new Piece(PieceType.BBishop, new Location(5, 7)));
	
	board.addPiece(new Piece(PieceType.WQueen,  new Location(3, 0)));
	board.addPiece(new Piece(PieceType.BQueen,  new Location(3, 7)));
	
	board.addPiece(new Piece(PieceType.WKing,   new Location(4, 0)));
	board.addPiece(new Piece(PieceType.BKing,   new Location(4, 7)));
	
	return board;
}

function renderBoard(board, whiteOnBottom, font)
{
	clearSquareNodes();
	var squareNodes = getSquareNodes();
	
	for(var i = 0; i < board.pieces.length; i++)
	{
		var piece = board.pieces[i];
		var squareNode = squareNodes[whiteOnBottom ? 7 - piece.location.y : piece.location.y]
		                            [whiteOnBottom ? piece.location.x : 7 - piece.location.x];
		
		var imgNode = document.createElement("img");
		imgNode.src = "pieces/" + font + "/" + piece.type.name + ".svg";
		imgNode.ondragstart = function() { return false; };
		squareNode.appendChild(imgNode);
	}
}
