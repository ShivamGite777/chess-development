import React, { useState, useCallback } from 'react';
import { GameState, Position } from '../types/chess';
import {
  createInitialGameState,
  getPossibleMoves,
  makeMove,
  positionsEqual
} from '../utils/chessLogic';
import ChessBoard from './ChessBoard';
import GameInfo from './GameInfo';

const ChessGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);

  const handleSquareClick = useCallback((position: Position) => {
    // If game is over, don't allow moves
    if (gameState.status === 'checkmate' || gameState.status === 'stalemate' || gameState.status === 'draw') {
      return;
    }

    if (selectedSquare) {
      // If clicking the same square, deselect
      if (positionsEqual(selectedSquare, position)) {
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      // Try to make a move
      const newGameState = makeMove(gameState, selectedSquare, position);
      if (newGameState) {
        setGameState(newGameState);
        setSelectedSquare(null);
        setValidMoves([]);
      } else {
        // Invalid move, try to select the clicked square instead
        const piece = gameState.board[position.row][position.col];
        if (piece && piece.color === gameState.currentPlayer) {
          setSelectedSquare(position);
          setValidMoves(getPossibleMoves(gameState.board, position, gameState));
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    } else {
      // Select a piece
      const piece = gameState.board[position.row][position.col];
      if (piece && piece.color === gameState.currentPlayer) {
        setSelectedSquare(position);
        setValidMoves(getPossibleMoves(gameState.board, position, gameState));
      }
    }
  }, [gameState, selectedSquare]);

  const handleNewGame = useCallback(() => {
    const newGameState = createInitialGameState();
    setGameState(newGameState);
    setSelectedSquare(null);
    setValidMoves([]);
  }, []);

  const handleUndoMove = useCallback(() => {
    if (gameState.moveHistory.length === 0) return;

    // Simple undo - recreate game state without the last move
    // In a more sophisticated implementation, you'd store previous states
    const newMoveHistory = gameState.moveHistory.slice(0, -1);
    
    // For now, just start a new game (simplified undo)
    // In production, you'd want to replay all moves except the last one
    if (newMoveHistory.length === 0) {
      handleNewGame();
    } else {
      // This is a simplified implementation
      // A proper implementation would replay all moves from the beginning
      console.log('Undo not fully implemented - starting new game');
      handleNewGame();
    }
  }, [gameState.moveHistory, handleNewGame]);

  const handleSettings = useCallback(() => {
    // Placeholder for settings functionality
    alert('Settings functionality coming soon!');
  }, []);

  return (
    <div className="chess-game">
      <div className="game-container">
        <div className="board-container">
          <ChessBoard
            gameState={gameState}
            selectedSquare={selectedSquare}
            validMoves={validMoves}
            onSquareClick={handleSquareClick}
          />
        </div>
        
        <div className="info-container">
          <GameInfo
            gameState={gameState}
            onNewGame={handleNewGame}
            onUndoMove={handleUndoMove}
            onSettings={handleSettings}
          />
        </div>
      </div>
    </div>
  );
};

export default ChessGame;