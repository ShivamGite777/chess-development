import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Position, ApiResponse, GameApiState } from '../types/chess';
import { 
  createInitialGameState, 
  getPossibleMoves, 
  makeMove, 
  positionsEqual 
} from '../utils/chessLogic';
import ChessBoard from './ChessBoard';
import GameInfo from './GameInfo';
import axios from 'axios';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const ChessGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [gameId, setGameId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Initialize game - try to connect to backend
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      // Try to create a new game on the backend
      const response = await axios.post<ApiResponse<GameApiState>>(`${API_BASE_URL}/games`);
      
      if (response.data.success && response.data.data) {
        setGameId(response.data.data.id);
        setIsOnline(true);
        setConnectionError(null);
        console.log('Connected to backend, game ID:', response.data.data.id);
      }
    } catch (error) {
      console.log('Backend not available, playing offline');
      setIsOnline(false);
      setConnectionError('Playing offline - backend not available');
    }
  };

  const syncWithBackend = async (newGameState: GameState, move?: { from: Position; to: Position }) => {
    if (!isOnline || !gameId) return;

    try {
      if (move) {
        // Send move to backend
        await axios.post(`${API_BASE_URL}/games/${gameId}/moves`, {
          from: move.from,
          to: move.to
        });
      }
      
      // Optionally fetch updated game state from backend
      // const response = await axios.get<ApiResponse<GameApiState>>(`${API_BASE_URL}/games/${gameId}`);
      // if (response.data.success && response.data.data) {
      //   // Update local state with backend state if needed
      // }
    } catch (error) {
      console.error('Failed to sync with backend:', error);
      // Continue playing offline
      setIsOnline(false);
      setConnectionError('Lost connection to backend, continuing offline');
    }
  };

  const handleSquareClick = useCallback(async (position: Position) => {
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
        
        // Sync with backend
        await syncWithBackend(newGameState, { from: selectedSquare, to: position });
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

  const handleNewGame = useCallback(async () => {
    const newGameState = createInitialGameState();
    setGameState(newGameState);
    setSelectedSquare(null);
    setValidMoves([]);

    // Create new game on backend
    if (isOnline) {
      try {
        const response = await axios.post<ApiResponse<GameApiState>>(`${API_BASE_URL}/games`);
        if (response.data.success && response.data.data) {
          setGameId(response.data.data.id);
        }
      } catch (error) {
        console.error('Failed to create new game on backend:', error);
      }
    }
  }, [isOnline]);

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
          
          {/* Connection Status */}
          <div className="connection-status">
            <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
              <div className="status-dot"></div>
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            {connectionError && (
              <div className="connection-error">
                {connectionError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessGame;