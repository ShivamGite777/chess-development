import React from 'react';
import { GameState, Position } from '../types/chess';
import { positionsEqual, isInCheck } from '../utils/chessLogic';
import ChessSquare from './ChessSquare';

interface ChessBoardProps {
  gameState: GameState;
  selectedSquare: Position | null;
  validMoves: Position[];
  onSquareClick: (position: Position) => void;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  gameState,
  selectedSquare,
  validMoves,
  onSquareClick
}) => {
  const { board, moveHistory } = gameState;
  
  const getLastMovePositions = (): Position[] => {
    if (moveHistory.length === 0) return [];
    const lastMove = moveHistory[moveHistory.length - 1];
    return [lastMove.from, lastMove.to];
  };

  const lastMovePositions = getLastMovePositions();
  const isCurrentPlayerInCheck = isInCheck(board, gameState.currentPlayer);

  const renderSquare = (row: number, col: number) => {
    const position: Position = { row, col };
    const piece = board[row][col];
    const isLight = (row + col) % 2 === 0;
    const isSelected = selectedSquare && positionsEqual(selectedSquare, position);
    const isValidMove = validMoves.some(move => positionsEqual(move, position));
    const isLastMove = lastMovePositions.some(pos => positionsEqual(pos, position));
    const isInCheckSquare = isCurrentPlayerInCheck && 
                           piece?.type === 'king' && 
                           piece.color === gameState.currentPlayer;

    return (
      <ChessSquare
        key={`${row}-${col}`}
        piece={piece}
        position={position}
        isLight={isLight}
        isSelected={!!isSelected}
        isValidMove={isValidMove}
        isLastMove={isLastMove}
        isInCheck={!!isInCheckSquare}
        onClick={onSquareClick}
      />
    );
  };

  return (
    <div className="chess-board">
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => renderSquare(row, col))
      )}
    </div>
  );
};

export default ChessBoard;