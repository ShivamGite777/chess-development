import { ChessPiece, PieceColor, PieceType, Position, GameState, Move, GameStatus } from '../types/chess';

// Chess piece Unicode symbols
export const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
};

// Initialize starting chess position
export const createInitialBoard = (): (ChessPiece | null)[][] => {
  const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black' };
    board[6][col] = { type: 'pawn', color: 'white' };
  }
  
  // Place other pieces
  const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: pieceOrder[col], color: 'black' };
    board[7][col] = { type: pieceOrder[col], color: 'white' };
  }
  
  return board;
};

export const createInitialGameState = (): GameState => ({
  board: createInitialBoard(),
  currentPlayer: 'white',
  status: 'active',
  moveHistory: [],
  capturedPieces: { white: [], black: [] },
  castlingRights: {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true
  },
  enPassantTarget: null,
  halfMoveClock: 0,
  fullMoveNumber: 1
});

export const isValidPosition = (pos: Position): boolean => {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
};

export const positionsEqual = (pos1: Position, pos2: Position): boolean => {
  return pos1.row === pos2.row && pos1.col === pos2.col;
};

export const isPathClear = (board: (ChessPiece | null)[][], from: Position, to: Position): boolean => {
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;
  
  const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
  const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
  
  let currentRow = from.row + rowStep;
  let currentCol = from.col + colStep;
  
  while (currentRow !== to.row || currentCol !== to.col) {
    if (board[currentRow][currentCol] !== null) {
      return false;
    }
    currentRow += rowStep;
    currentCol += colStep;
  }
  
  return true;
};

export const getPossibleMoves = (
  board: (ChessPiece | null)[][],
  from: Position,
  gameState: GameState
): Position[] => {
  const piece = board[from.row][from.col];
  if (!piece) return [];
  
  const moves: Position[] = [];
  
  switch (piece.type) {
    case 'pawn':
      moves.push(...getPawnMoves(board, from, piece.color, gameState.enPassantTarget));
      break;
    case 'rook':
      moves.push(...getRookMoves(board, from, piece.color));
      break;
    case 'knight':
      moves.push(...getKnightMoves(board, from, piece.color));
      break;
    case 'bishop':
      moves.push(...getBishopMoves(board, from, piece.color));
      break;
    case 'queen':
      moves.push(...getQueenMoves(board, from, piece.color));
      break;
    case 'king':
      moves.push(...getKingMoves(board, from, piece.color, gameState.castlingRights));
      break;
  }
  
  // Filter out moves that would put own king in check
  return moves.filter(to => !wouldBeInCheck(board, from, to, piece.color));
};

const getPawnMoves = (
  board: (ChessPiece | null)[][],
  from: Position,
  color: PieceColor,
  enPassantTarget: Position | null
): Position[] => {
  const moves: Position[] = [];
  const direction = color === 'white' ? -1 : 1;
  const startRow = color === 'white' ? 6 : 1;
  
  // Forward move
  const oneForward = { row: from.row + direction, col: from.col };
  if (isValidPosition(oneForward) && board[oneForward.row][oneForward.col] === null) {
    moves.push(oneForward);
    
    // Two squares forward from starting position
    if (from.row === startRow) {
      const twoForward = { row: from.row + 2 * direction, col: from.col };
      if (isValidPosition(twoForward) && board[twoForward.row][twoForward.col] === null) {
        moves.push(twoForward);
      }
    }
  }
  
  // Diagonal captures
  const captureLeft = { row: from.row + direction, col: from.col - 1 };
  const captureRight = { row: from.row + direction, col: from.col + 1 };
  
  if (isValidPosition(captureLeft)) {
    const leftPiece = board[captureLeft.row][captureLeft.col];
    if (leftPiece && leftPiece.color !== color) {
      moves.push(captureLeft);
    }
  }
  
  if (isValidPosition(captureRight)) {
    const rightPiece = board[captureRight.row][captureRight.col];
    if (rightPiece && rightPiece.color !== color) {
      moves.push(captureRight);
    }
  }
  
  // En passant
  if (enPassantTarget) {
    if (positionsEqual(captureLeft, enPassantTarget) || positionsEqual(captureRight, enPassantTarget)) {
      moves.push(enPassantTarget);
    }
  }
  
  return moves;
};

const getRookMoves = (board: (ChessPiece | null)[][], from: Position, color: PieceColor): Position[] => {
  const moves: Position[] = [];
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  
  for (const [rowDir, colDir] of directions) {
    for (let i = 1; i < 8; i++) {
      const to = { row: from.row + i * rowDir, col: from.col + i * colDir };
      
      if (!isValidPosition(to)) break;
      
      const targetPiece = board[to.row][to.col];
      if (targetPiece === null) {
        moves.push(to);
      } else {
        if (targetPiece.color !== color) {
          moves.push(to);
        }
        break;
      }
    }
  }
  
  return moves;
};

const getKnightMoves = (board: (ChessPiece | null)[][], from: Position, color: PieceColor): Position[] => {
  const moves: Position[] = [];
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  
  for (const [rowOffset, colOffset] of knightMoves) {
    const to = { row: from.row + rowOffset, col: from.col + colOffset };
    
    if (isValidPosition(to)) {
      const targetPiece = board[to.row][to.col];
      if (targetPiece === null || targetPiece.color !== color) {
        moves.push(to);
      }
    }
  }
  
  return moves;
};

const getBishopMoves = (board: (ChessPiece | null)[][], from: Position, color: PieceColor): Position[] => {
  const moves: Position[] = [];
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  
  for (const [rowDir, colDir] of directions) {
    for (let i = 1; i < 8; i++) {
      const to = { row: from.row + i * rowDir, col: from.col + i * colDir };
      
      if (!isValidPosition(to)) break;
      
      const targetPiece = board[to.row][to.col];
      if (targetPiece === null) {
        moves.push(to);
      } else {
        if (targetPiece.color !== color) {
          moves.push(to);
        }
        break;
      }
    }
  }
  
  return moves;
};

const getQueenMoves = (board: (ChessPiece | null)[][], from: Position, color: PieceColor): Position[] => {
  return [...getRookMoves(board, from, color), ...getBishopMoves(board, from, color)];
};

const getKingMoves = (
  board: (ChessPiece | null)[][],
  from: Position,
  color: PieceColor,
  castlingRights: GameState['castlingRights']
): Position[] => {
  const moves: Position[] = [];
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  
  // Regular king moves
  for (const [rowOffset, colOffset] of directions) {
    const to = { row: from.row + rowOffset, col: from.col + colOffset };
    
    if (isValidPosition(to)) {
      const targetPiece = board[to.row][to.col];
      if (targetPiece === null || targetPiece.color !== color) {
        moves.push(to);
      }
    }
  }
  
  // Castling
  if (color === 'white' && from.row === 7 && from.col === 4) {
    // White king-side castling
    if (castlingRights.whiteKingSide &&
        board[7][5] === null && board[7][6] === null &&
        !isSquareAttacked(board, { row: 7, col: 4 }, 'black') &&
        !isSquareAttacked(board, { row: 7, col: 5 }, 'black') &&
        !isSquareAttacked(board, { row: 7, col: 6 }, 'black')) {
      moves.push({ row: 7, col: 6 });
    }
    
    // White queen-side castling
    if (castlingRights.whiteQueenSide &&
        board[7][1] === null && board[7][2] === null && board[7][3] === null &&
        !isSquareAttacked(board, { row: 7, col: 4 }, 'black') &&
        !isSquareAttacked(board, { row: 7, col: 3 }, 'black') &&
        !isSquareAttacked(board, { row: 7, col: 2 }, 'black')) {
      moves.push({ row: 7, col: 2 });
    }
  } else if (color === 'black' && from.row === 0 && from.col === 4) {
    // Black king-side castling
    if (castlingRights.blackKingSide &&
        board[0][5] === null && board[0][6] === null &&
        !isSquareAttacked(board, { row: 0, col: 4 }, 'white') &&
        !isSquareAttacked(board, { row: 0, col: 5 }, 'white') &&
        !isSquareAttacked(board, { row: 0, col: 6 }, 'white')) {
      moves.push({ row: 0, col: 6 });
    }
    
    // Black queen-side castling
    if (castlingRights.blackQueenSide &&
        board[0][1] === null && board[0][2] === null && board[0][3] === null &&
        !isSquareAttacked(board, { row: 0, col: 4 }, 'white') &&
        !isSquareAttacked(board, { row: 0, col: 3 }, 'white') &&
        !isSquareAttacked(board, { row: 0, col: 2 }, 'white')) {
      moves.push({ row: 0, col: 2 });
    }
  }
  
  return moves;
};

export const isSquareAttacked = (
  board: (ChessPiece | null)[][],
  square: Position,
  byColor: PieceColor
): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === byColor) {
        const from = { row, col };
        const possibleMoves = getPossibleMovesWithoutCheckValidation(board, from);
        if (possibleMoves.some(move => positionsEqual(move, square))) {
          return true;
        }
      }
    }
  }
  return false;
};

const getPossibleMovesWithoutCheckValidation = (
  board: (ChessPiece | null)[][],
  from: Position
): Position[] => {
  const piece = board[from.row][from.col];
  if (!piece) return [];
  
  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(board, from, piece.color, null);
    case 'rook':
      return getRookMoves(board, from, piece.color);
    case 'knight':
      return getKnightMoves(board, from, piece.color);
    case 'bishop':
      return getBishopMoves(board, from, piece.color);
    case 'queen':
      return getQueenMoves(board, from, piece.color);
    case 'king':
      return getKingMoves(board, from, piece.color, {
        whiteKingSide: false,
        whiteQueenSide: false,
        blackKingSide: false,
        blackQueenSide: false
      }).filter(move => Math.abs(move.col - from.col) <= 1); // Exclude castling
    default:
      return [];
  }
};

const wouldBeInCheck = (
  board: (ChessPiece | null)[][],
  from: Position,
  to: Position,
  color: PieceColor
): boolean => {
  // Create a copy of the board with the move applied
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from.row][from.col];
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;
  
  // Find the king position
  const kingPos = findKing(newBoard, color);
  if (!kingPos) return true; // If no king found, consider it check
  
  return isSquareAttacked(newBoard, kingPos, color === 'white' ? 'black' : 'white');
};

export const findKing = (board: (ChessPiece | null)[][], color: PieceColor): Position | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
};

export const isInCheck = (board: (ChessPiece | null)[][], color: PieceColor): boolean => {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  
  return isSquareAttacked(board, kingPos, color === 'white' ? 'black' : 'white');
};

export const getAllPossibleMoves = (board: (ChessPiece | null)[][], color: PieceColor, gameState: GameState): Move[] => {
  const moves: Move[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const from = { row, col };
        const possibleMoves = getPossibleMoves(board, from, gameState);
        
        for (const to of possibleMoves) {
          moves.push({
            from,
            to,
            piece,
            capturedPiece: board[to.row][to.col] || undefined,
            notation: '', // Will be filled later
            timestamp: Date.now()
          });
        }
      }
    }
  }
  
  return moves;
};

export const getGameStatus = (gameState: GameState): GameStatus => {
  const { board, currentPlayer } = gameState;
  const inCheck = isInCheck(board, currentPlayer);
  const possibleMoves = getAllPossibleMoves(board, currentPlayer, gameState);
  
  if (possibleMoves.length === 0) {
    return inCheck ? 'checkmate' : 'stalemate';
  }
  
  if (inCheck) {
    return 'check';
  }
  
  // Check for draw conditions
  if (gameState.halfMoveClock >= 50) {
    return 'draw';
  }
  
  // Insufficient material check (simplified)
  const pieces = board.flat().filter(p => p !== null) as ChessPiece[];
  if (pieces.length <= 3) {
    const hasOnlyKingsAndMinorPieces = pieces.every(p => 
      p.type === 'king' || p.type === 'knight' || p.type === 'bishop'
    );
    if (hasOnlyKingsAndMinorPieces) {
      return 'draw';
    }
  }
  
  return 'active';
};

export const makeMove = (gameState: GameState, from: Position, to: Position): GameState | null => {
  const { board, currentPlayer } = gameState;
  const piece = board[from.row][from.col];
  
  if (!piece || piece.color !== currentPlayer) {
    return null;
  }
  
  const possibleMoves = getPossibleMoves(board, from, gameState);
  const isValidMove = possibleMoves.some(move => positionsEqual(move, to));
  
  if (!isValidMove) {
    return null;
  }
  
  // Create new game state
  const newBoard = board.map(row => [...row]);
  const capturedPiece = newBoard[to.row][to.col];
  
  // Handle special moves
  let isEnPassant = false;
  let isCastling = false;
  
  // En passant
  if (piece.type === 'pawn' && gameState.enPassantTarget && positionsEqual(to, gameState.enPassantTarget)) {
    isEnPassant = true;
    const captureRow = currentPlayer === 'white' ? to.row + 1 : to.row - 1;
    newBoard[captureRow][to.col] = null;
  }
  
  // Castling
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    isCastling = true;
    const isKingSide = to.col > from.col;
    const rookFromCol = isKingSide ? 7 : 0;
    const rookToCol = isKingSide ? 5 : 3;
    const rookRow = from.row;
    
    newBoard[rookRow][rookToCol] = newBoard[rookRow][rookFromCol];
    newBoard[rookRow][rookFromCol] = null;
  }
  
  // Make the move
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;
  
  // Handle pawn promotion
  if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
    newBoard[to.row][to.col] = { type: 'queen', color: piece.color };
  }
  
  // Update captured pieces
  const newCapturedPieces = { ...gameState.capturedPieces };
  if (capturedPiece) {
    newCapturedPieces[capturedPiece.color].push(capturedPiece);
  }
  if (isEnPassant) {
    const capturedPawn = { type: 'pawn' as PieceType, color: currentPlayer === 'white' ? 'black' : 'white' };
    newCapturedPieces[capturedPawn.color].push(capturedPawn);
  }
  
  // Update castling rights
  const newCastlingRights = { ...gameState.castlingRights };
  if (piece.type === 'king') {
    if (currentPlayer === 'white') {
      newCastlingRights.whiteKingSide = false;
      newCastlingRights.whiteQueenSide = false;
    } else {
      newCastlingRights.blackKingSide = false;
      newCastlingRights.blackQueenSide = false;
    }
  }
  if (piece.type === 'rook') {
    if (currentPlayer === 'white') {
      if (from.col === 0) newCastlingRights.whiteQueenSide = false;
      if (from.col === 7) newCastlingRights.whiteKingSide = false;
    } else {
      if (from.col === 0) newCastlingRights.blackQueenSide = false;
      if (from.col === 7) newCastlingRights.blackKingSide = false;
    }
  }
  
  // Update en passant target
  let newEnPassantTarget: Position | null = null;
  if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
    newEnPassantTarget = { row: (from.row + to.row) / 2, col: from.col };
  }
  
  // Create move notation
  const notation = createMoveNotation(piece, from, to, capturedPiece !== null, isCastling, isEnPassant);
  
  // Create move object
  const move: Move = {
    from,
    to,
    piece,
    capturedPiece: capturedPiece || undefined,
    notation,
    timestamp: Date.now(),
    isCastling,
    isEnPassant
  };
  
  const newGameState: GameState = {
    board: newBoard,
    currentPlayer: currentPlayer === 'white' ? 'black' : 'white',
    status: 'active',
    moveHistory: [...gameState.moveHistory, move],
    capturedPieces: newCapturedPieces,
    castlingRights: newCastlingRights,
    enPassantTarget: newEnPassantTarget,
    halfMoveClock: capturedPiece || piece.type === 'pawn' ? 0 : gameState.halfMoveClock + 1,
    fullMoveNumber: currentPlayer === 'black' ? gameState.fullMoveNumber + 1 : gameState.fullMoveNumber
  };
  
  // Update game status
  newGameState.status = getGameStatus(newGameState);
  
  return newGameState;
};

const createMoveNotation = (
  piece: ChessPiece,
  from: Position,
  to: Position,
  isCapture: boolean,
  isCastling: boolean,
  isEnPassant: boolean
): string => {
  if (isCastling) {
    return to.col > from.col ? 'O-O' : 'O-O-O';
  }
  
  const files = 'abcdefgh';
  const ranks = '87654321';
  
  let notation = '';
  
  if (piece.type !== 'pawn') {
    notation += piece.type.charAt(0).toUpperCase();
  }
  
  if (isCapture) {
    if (piece.type === 'pawn') {
      notation += files[from.col];
    }
    notation += 'x';
  }
  
  notation += files[to.col] + ranks[to.row];
  
  if (isEnPassant) {
    notation += ' e.p.';
  }
  
  return notation;
};

export const positionToAlgebraic = (pos: Position): string => {
  const files = 'abcdefgh';
  const ranks = '87654321';
  return files[pos.col] + ranks[pos.row];
};

export const algebraicToPosition = (algebraic: string): Position => {
  const files = 'abcdefgh';
  const ranks = '87654321';
  return {
    col: files.indexOf(algebraic[0]),
    row: ranks.indexOf(algebraic[1])
  };
};