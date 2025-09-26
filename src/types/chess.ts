export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';
export type GameStatus = 'active' | 'check' | 'checkmate' | 'stalemate' | 'draw';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  capturedPiece?: ChessPiece;
  notation: string;
  timestamp: number;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isCastling?: boolean;
  isEnPassant?: boolean;
  promotionPiece?: PieceType;
}

export interface GameState {
  board: (ChessPiece | null)[][];
  currentPlayer: PieceColor;
  status: GameStatus;
  moveHistory: Move[];
  capturedPieces: {
    white: ChessPiece[];
    black: ChessPiece[];
  };
  castlingRights: {
    whiteKingSide: boolean;
    whiteQueenSide: boolean;
    blackKingSide: boolean;
    blackQueenSide: boolean;
  };
  enPassantTarget: Position | null;
  halfMoveClock: number;
  fullMoveNumber: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GameApiState {
  id: string;
  board: string; // FEN notation
  currentPlayer: PieceColor;
  status: GameStatus;
  moveHistory: Move[];
  createdAt: string;
  updatedAt: string;
}