function initializePositionModule()
{
}

function CastleMoves(wShort, wLong, bShort, bLong)
{
	this.wShort = wShort;
	this.wLong  = wLong;
	this.bShort = bShort;
	this.bLong  = bLong;
	
	this.copy = function()
	{
		return new CastleMoves(this.wShort, this.wLong, this.bShort, this.bLong);
	}
}

function Move(from, to)
{
	this.from = from.copy();
	this.to = to.copy();
	
	this.copy = function()
	{
		return new Move(this.from, this.to);
	}
	
	this.equals = function(move)
	{
		if(!move.from || !move.to)
			return false;
		return this.from.equals(move.from)
		    && this.to.equals(move.to);
	}
	
	this.toString = function()
	{
		return this.from + " -> " + this.to;
	}
}

function Position(board, sideToMove, epSquare, castleMoves)
{
	this.board = board.copy();
	this.sideToMove = sideToMove;
	if(epSquare)
		this.epSquare = epSquare.copy();
	else
		this.epSquare = null;
	this.castleMoves = castleMoves.copy();
	this.allMovesCache = null;
	
	this.copy = function()
	{
		return new Position(this.board, this.sideToMove, this.epSquare, this.castleMoves);
	}
	
	this.isEmptySquare = function(location)
	{
		return this.board.pieceAt(location) == null;
	}
	
	this.isOccupiedSquare = function(location)
	{
		return !this.isEmptySquare(location);
	}
	
	this.isFriendlySquare = function(location)
	{
		var piece = this.board.pieceAt(location);
		if(piece)
			return piece.type.side == this.sideToMove;
		else
			return false;
	}
	
	this.isEnemySquare = function(location)
	{
		var piece = this.board.pieceAt(location);
		if(piece)
			return piece.type.side != this.sideToMove;
		else
			return false;
	}
	
	this.isWithinBoard = function(location)
	{
		return location.x >= 0
		    && location.x <= 7
			&& location.y >= 0
			&& location.y <= 7;
	}
	
	this.getPieceControlledSquares = function(piece)
	{
		switch(piece.type.basicType)
		{
		case BasicPieceType.Pawn:
			return this.getPawnControlledSquares(piece);
		case BasicPieceType.Knight:
			return this.getKnightControlledSquares(piece);
		case BasicPieceType.Bishop:
			return this.getBishopControlledSquares(piece);
		case BasicPieceType.Rook:
			return this.getRookControlledSquares(piece);
		case BasicPieceType.Queen:
			return this.getQueenControlledSquares(piece);
		case BasicPieceType.King:
			return this.getKingControlledSquares(piece);
		}
	}
	
	this.getPawnControlledSquares = function(piece)
	{
		var squares = new Array();
		var to;
		
		if(piece.type.side == Side.White)
		{
			to = new Location(piece.location.x, piece.location.y + 1);
			if(this.isEmptySquare(to))
			{
				squares.push(to);
				
				if(piece.location.y == 1)
				{
					to = new Location(piece.location.x, piece.location.y + 2);
					if(this.isEmptySquare(to))
						squares.push(to);
				}
			}
			
			to = new Location(piece.location.x + 1, piece.location.y + 1);
			if(this.isEnemySquare(to) || to.equals(this.epSquare))
				squares.push(to);
			
			to = new Location(piece.location.x - 1, piece.location.y + 1);
			if(this.isEnemySquare(to) || to.equals(this.epSquare))
				squares.push(to);
		}
		else
		{
			to = new Location(piece.location.x, piece.location.y - 1);
			if(this.isEmptySquare(to))
			{
				squares.push(to);
				
				if(piece.location.y == 6)
				{
					to = new Location(piece.location.x, piece.location.y - 2);
					if(this.isEmptySquare(to))
						squares.push(to);
				}
			}
			
			to = new Location(piece.location.x + 1, piece.location.y - 1);
			if(this.isEnemySquare(to) || to.equals(this.epSquare))
				squares.push(to);
			
			to = new Location(piece.location.x - 1, piece.location.y - 1);
			if(this.isEnemySquare(to) || to.equals(this.epSquare))
				squares.push(to);
		}
		
		return squares;
	}
	
	this.getKnightControlledSquares = function(piece)
	{
		var squares = new Array();
		var to;
		
		to = new Location(piece.location.x + 1, piece.location.y + 2);
		if(!this.isFriendlySquare(to) && this.isWithinBoard(to))
			squares.push(to);
		
		to = new Location(piece.location.x + 2, piece.location.y + 1);
		if(!this.isFriendlySquare(to) && this.isWithinBoard(to))
			squares.push(to);
		
		to = new Location(piece.location.x + 2, piece.location.y - 1);
		if(!this.isFriendlySquare(to) && this.isWithinBoard(to))
			squares.push(to);
		
		to = new Location(piece.location.x + 1, piece.location.y - 2);
		if(!this.isFriendlySquare(to) && this.isWithinBoard(to))
			squares.push(to);
		
		to = new Location(piece.location.x - 1, piece.location.y + 2);
		if(!this.isFriendlySquare(to) && this.isWithinBoard(to))
			squares.push(to);
		
		to = new Location(piece.location.x - 2, piece.location.y + 1);
		if(!this.isFriendlySquare(to) && this.isWithinBoard(to))
			squares.push(to);
		
		to = new Location(piece.location.x - 2, piece.location.y - 1);
		if(!this.isFriendlySquare(to) && this.isWithinBoard(to))
			squares.push(to);
		
		to = new Location(piece.location.x - 1, piece.location.y - 2);
		if(!this.isFriendlySquare(to) && this.isWithinBoard(to))
			squares.push(to);
		
		return squares;
	}
	
	this.getBishopControlledSquares = function(piece)
	{
		return this.getGliderControlledSquares(piece,  1,  1).concat(
			   this.getGliderControlledSquares(piece,  1, -1).concat(
			   this.getGliderControlledSquares(piece, -1,  1).concat(
			   this.getGliderControlledSquares(piece, -1, -1))));
	}
	
	this.getRookControlledSquares = function(piece)
	{
		return this.getGliderControlledSquares(piece,  1,  0).concat(
			   this.getGliderControlledSquares(piece,  0,  1).concat(
			   this.getGliderControlledSquares(piece, -1,  0).concat(
			   this.getGliderControlledSquares(piece,  0, -1))));
	}
	
	this.getQueenControlledSquares = function(piece)
	{
		return this.getGliderControlledSquares(piece,  1,  1).concat(
			   this.getGliderControlledSquares(piece,  1, -1).concat(
			   this.getGliderControlledSquares(piece, -1,  1).concat(
			   this.getGliderControlledSquares(piece, -1, -1).concat(
			   this.getGliderControlledSquares(piece,  1,  0).concat(
			   this.getGliderControlledSquares(piece,  0,  1).concat(
			   this.getGliderControlledSquares(piece, -1,  0).concat(
			   this.getGliderControlledSquares(piece,  0, -1))))))));
	}
	
	this.getGliderControlledSquares = function(piece, dx, dy)
	{
		var squares = new Array();
		var to = piece.location.copy();
	
		to.x += dx;
		to.y += dy;
		
		while(to.x >= 0 && to.x <= 7
		   && to.y >= 0 && to.y <= 7)
		{
			if(this.isFriendlySquare(to))
				break;
			
			squares.push(to.copy());
			
			if(this.isEnemySquare(to))
				break;
			
			to.x += dx;
			to.y += dy;
		}
		
		return squares;
	}
	
	this.getKingControlledSquares = function(piece)
	{
		var squares = new Array();
		var to;
		
		to = new Location(piece.location.x + 1, piece.location.y + 1);
		if(!this.isFriendlySquare(to) && this.isWithinBoard(to))
			squares.push(to);
		
		to = new Location(piece.location.x + 1, piece.location.y);
		if(!this.isFriendlySquare(to) && this.isWithinBoard(to))
			squares.push(to);
		
		to = new Location(piece.location.x + 1, piece.location.y - 1);
		if(!this.isFriendlySquare(to) && this.isWithinBoard(to))
			squares.push(to);
		
		to = new Location(piece.location.x, piece.location.y + 1);
		if(!this.isFriendlySquare(to) && this.isWithinBoard(to))
			squares.push(to);
		
		to = new Location(piece.location.x, piece.location.y - 1);
		if(!this.isFriendlySquare(to) && this.isWithinBoard(to))
			squares.push(to);
		
		to = new Location(piece.location.x - 1, piece.location.y + 1);
		if(!this.isFriendlySquare(to) && this.isWithinBoard(to))
			squares.push(to);
		
		to = new Location(piece.location.x - 1, piece.location.y);
		if(!this.isFriendlySquare(to) && this.isWithinBoard(to))
			squares.push(to);
		
		to = new Location(piece.location.x - 1, piece.location.y - 1);
		if(!this.isFriendlySquare(to) && this.isWithinBoard(to))
			squares.push(to);
		
		return squares;
	}
	
	this.getUncheckedPieceMoves = function(piece)
	{
		var squares = this.getPieceControlledSquares(piece);
		var moves = new Array(squares.length);
		
		for(var i = 0; i < squares.length; i++)
		{
			moves[i] = new Move(piece.location, squares[i]);
		}
		
		return moves;
	}
	
	this.getAllControlledSquares = function()
	{
		var squares = new Array();
		
		for(var i = 0; i < this.board.pieces.length; i++)
		{
			if(this.board.pieces[i].type.side == this.sideToMove)
			{
				squares = squares.concat(this.getPieceControlledSquares(this.board.pieces[i]));
			}
		}
		
		return squares;
	}
	
	this.getAllUncheckedMoves = function()
	{
		var moves = new Array();
		
		for(var i = 0; i < this.board.pieces.length; i++)
		{
			if(this.board.pieces[i].type.side == this.sideToMove)
			{
				moves = moves.concat(this.getUncheckedPieceMoves(this.board.pieces[i]));
			}
		}
		
		return moves;
	}
	
	this.inCheck = function()
	{
		var king = this.board.getKing(this.sideToMove);
		
		this.sideToMove = getOppositeSide(this.sideToMove);
		var enemySquares = this.getAllControlledSquares();
		this.sideToMove = getOppositeSide(this.sideToMove);
		
		for(var i = 0; i < enemySquares.length; i++)
		{
			if(enemySquares[i].equals(king.location))
			{
				return true;
			}
		}
		return false;
	}
	
	this.movePiece = function(move)
	{
		if(this.isOccupiedSquare(move.to))
		{
			this.board.removePiece(this.board.pieceAt(move.to));
		}
		
		var piece = this.board.pieceAt(move.from).copy();
		this.board.removePiece(piece);
		piece.location = move.to.copy();
		this.board.addPiece(piece);
		
		if(move.equals(new Move(new Location(4, 0), new Location(6, 0)))
		&& piece.type.id == PieceType.WKing.id)
		{
			this.movePiece(new Move(new Location(7, 0), new Location(5, 0)));
		}
		else if(move.equals(new Move(new Location(4, 0), new Location(2, 0)))
		&& piece.type.id == PieceType.WKing.id)
		{
			this.movePiece(new Move(new Location(0, 0), new Location(3, 0)));
		}
		else if(move.equals(new Move(new Location(4, 7), new Location(6, 7)))
		&& piece.type.id == PieceType.BKing.id)
		{
			this.movePiece(new Move(new Location(7, 7), new Location(5, 7)));
		}
		else if(move.equals(new Move(new Location(4, 7), new Location(2, 7)))
		&& piece.type.id == PieceType.BKing.id)
		{
			this.movePiece(new Move(new Location(0, 7), new Location(3, 7)));
		}
		else if(move.to.equals(this.epSquare)
		&& piece.type.basicType == BasicPieceType.Pawn)
		{
			this.board.removePiece(this.board.pieceAt(new Location(move.to.x, move.from.y)));
		}
	}
	
	this.putInCheck = function(move)
	{
		var newPosition = this.copy();
		newPosition.movePiece(move);
		
		return newPosition.inCheck();
	}
	
	this.getAllMoves = function()
	{
		if(this.allMovesCache != null)
		{
			return allMovesCache;
		}
		
		var moves = new Array();
		var uncheckedMoves = this.getAllUncheckedMoves(this.sideToMove);
		
		for(var i = 0; i < uncheckedMoves.length; i++)
		{
			if(!this.putInCheck(uncheckedMoves[i]))
			{
				moves.push(uncheckedMoves[i]);
			}
		}
		
		if(!this.inCheck())
		{
			if(this.sideToMove == Side.White)
			{
				if(this.castleMoves.wShort
				&& !this.isOccupiedSquare(new Location(5, 0))
				&& !this.isOccupiedSquare(new Location(6, 0)))
				{
					if(!this.putInCheck(new Move(new Location(4, 0), new Location(5, 0)))
					&& !this.putInCheck(new Move(new Location(4, 0), new Location(6, 0))))
					{
						moves.push(new Move(new Location(4, 0), new Location(6, 0)));
					}
				}
				if(this.castleMoves.wLong
				&& !this.isOccupiedSquare(new Location(3, 0))
				&& !this.isOccupiedSquare(new Location(2, 0))
				&& !this.isOccupiedSquare(new Location(1, 0)))
				{
					if(!this.putInCheck(new Move(new Location(4, 0), new Location(3, 0)))
					&& !this.putInCheck(new Move(new Location(4, 0), new Location(2, 0))))
					{
						moves.push(new Move(new Location(4, 0), new Location(2, 0)));
					}
				}
			}
			else
			{
				if(this.castleMoves.bShort
				&& !this.isOccupiedSquare(new Location(5, 7))
				&& !this.isOccupiedSquare(new Location(6, 7)))
				{
					if(!this.putInCheck(new Move(new Location(4, 7), new Location(5, 7)))
					&& !this.putInCheck(new Move(new Location(4, 7), new Location(6, 7))))
					{
						moves.push(new Move(new Location(4, 7), new Location(6, 7)));
					}
				}
				if(this.castleMoves.bLong
				&& !this.isOccupiedSquare(new Location(3, 7))
				&& !this.isOccupiedSquare(new Location(2, 7))
				&& !this.isOccupiedSquare(new Location(1, 7)))
				{
					if(!this.putInCheck(new Move(new Location(4, 7), new Location(3, 7)))
					&& !this.putInCheck(new Move(new Location(4, 7), new Location(2, 7))))
					{
						moves.push(new Move(new Location(4, 7), new Location(2, 7)));
					}
				}
			}
		}
		
		allMovesCache = moves;
		return moves;
	}
	
	this.checkCastleRights = function(move)
	{
		var piece = this.board.pieceAt(move.to);
		
		if(piece.type.id == PieceType.WKing.id)
		{
			this.castleMoves.wShort = false;
			this.castleMoves.wLong  = false;
		}
		else if(piece.type.id == PieceType.BKing.id)
		{
			this.castleMoves.bShort = false;
			this.castleMoves.bLong  = false;
		}
		else if(piece.type.id == PieceType.WRook.id)
		{
			if(move.from.equals(new Location(7, 0)))
				this.castleMoves.wShort = false;
			else if(move.from.equals(new Location(0, 0)))
				this.castleMoves.wLong = false;
		}
		else if(piece.type.id == PieceType.BRook.id)
		{
			if(move.from.equals(new Location(7, 7)))
				this.castleMoves.bShort = false;
			else if(move.from.equals(new Location(0, 7)))
				this.castleMoves.bLong = false;
		}
	}
	
	this.checkEnPassantRights = function(move)
	{
		var piece = this.board.pieceAt(move.to);
		
		this.epSquare = null;
		if(piece.type.id == PieceType.WPawn.id)
		{
			if(move.from.y == 1 && move.to.y == 3)
				this.epSquare = new Location(move.from.x, 2);
		}
		else if(piece.type.id == PieceType.BPawn.id)
		{
			if(move.from.y == 6 && move.to.y == 4)
				this.epSquare = new Location(move.from.x, 5);
		}
	}
	
	this.doMove = function(move)
	{
		this.movePiece(move);
		this.checkCastleRights(move);
		this.checkEnPassantRights(move);
		this.sideToMove = getOppositeSide(this.sideToMove);
	}
	
	this.doPromotion = function(move, pieceType)
	{
		if(this.isOccupiedSquare(move.to))
			this.board.removePiece(this.board.pieceAt(move.to));
		
		var piece = this.board.pieceAt(move.from).copy();
		this.board.removePiece(piece);
		piece.location = move.to.copy();
		piece.type = pieceType;
		this.board.addPiece(piece);
		
		this.epSquare = null;
		this.sideToMove = getOppositeSide(this.sideToMove);
	}
	
	this.getPositionAfterMove = function(move)
	{
		var newPosition = this.copy();
		newPosition.doMove(move);
		
		return newPosition;
	}
	
	this.getPositionAfterPromotion = function(move, pieceType)
	{
		var newPosition = this.copy();
		newPosition.doPromotion(move, pieceType);
		
		return newPosition;
	}
	
	this.isLegalMove = function(move)
	{
		var allMoves = this.getAllMoves();
		
		for(var i = 0; i < allMoves.length; i++)
		{
			if(allMoves[i].equals(move))
			{
				return true;
			}
		}
		return false;
	}
	
	this.isStalemate = function(move)
	{
		return this.getAllMoves().length == 0
		    && !this.inCheck();
	}
	
	this.isCheckmate = function(move)
	{
		return this.getAllMoves().length == 0
			&& this.inCheck();
	}
}

function getDefaultPosition()
{
	return new Position(getDefaultBoard(), Side.White, null, new CastleMoves(true, true, true, true));
}
