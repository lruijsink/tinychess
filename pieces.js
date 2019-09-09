function initializePiecesModule()
{
}

var Side =
{
	White: 0,
	Black: 1
};

function getOppositeSide(side)
{
	if(side == Side.White)
		return Side.Black;
	else
		return Side.White;
}

var BasicPieceType =
{
	Pawn: 0,
	Knight: 1,
	Bishop: 2,
	Rook: 3,
	Queen: 4,
	King: 5
};

var PieceType =
{
	WPawn:   {id: 0,  name: "w_pawn",   basicType: BasicPieceType.Pawn,   side: Side.White},
	WKnight: {id: 1,  name: "w_knight", basicType: BasicPieceType.Knight, side: Side.White},
	WBishop: {id: 2,  name: "w_bishop", basicType: BasicPieceType.Bishop, side: Side.White},
	WRook:   {id: 3,  name: "w_rook",   basicType: BasicPieceType.Rook,   side: Side.White},
	WQueen:  {id: 4,  name: "w_queen",  basicType: BasicPieceType.Queen,  side: Side.White},
	WKing:   {id: 5,  name: "w_king",   basicType: BasicPieceType.King,   side: Side.White},
	
	BPawn:   {id: 6,  name: "b_pawn",   basicType: BasicPieceType.Pawn,   side: Side.Black},
	BKnight: {id: 7,  name: "b_knight", basicType: BasicPieceType.Knight, side: Side.Black},
	BBishop: {id: 8,  name: "b_bishop", basicType: BasicPieceType.Bishop, side: Side.Black},
	BRook:   {id: 9,  name: "b_rook",   basicType: BasicPieceType.Rook,   side: Side.Black},
	BQueen:  {id: 10, name: "b_queen",  basicType: BasicPieceType.Queen,  side: Side.Black},
	BKing:   {id: 11, name: "b_king",   basicType: BasicPieceType.King,   side: Side.Black}
};

function Location(xCoord, yCoord)
{
	this.x = xCoord;
	this.y = yCoord;
	
	this.copy = function()
	{
		return new Location(this.x, this.y);
	}
	
	this.equals = function(location)
	{
		if(!location)
			return false;
		
		return this.x == location.x
		    && this.y == location.y;
	}
	
	this.toString = function()
	{
		return this.x + ", " + this.y;
	}
}

function Piece(pieceType, pieceLocation)
{
	this.type = pieceType;
	this.location = pieceLocation.copy();
	
	this.copy = function()
	{
		return new Piece(this.type, this.location);
	}
}
