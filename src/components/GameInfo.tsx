import React from 'react';
import { GameState, PieceColor } from '../types/chess';
import { PIECE_SYMBOLS } from '../utils/chessLogic';
import { Crown, Clock, RotateCcw, Settings } from 'lucide-react';

interface GameInfoProps {
  gameState: GameState;
  onNewGame: () => void;
  onUndoMove: () => void;
  onSettings: () => void;
}

const GameInfo: React.FC<GameInfoProps> = ({
  gameState,
  onNewGame,
  onUndoMove,
  onSettings
}) => {
  const { currentPlayer, status, moveHistory, capturedPieces } = gameState;

  const getStatusMessage = () => {
    switch (status) {
      case 'check':
        return `${currentPlayer === 'white' ? 'White' : 'Black'} is in check!`;
      case 'checkmate':
        return `Checkmate! ${currentPlayer === 'white' ? 'Black' : 'White'} wins!`;
      case 'stalemate':
        return 'Stalemate! The game is a draw.';
      case 'draw':
        return 'The game is a draw.';
      default:
        return `${currentPlayer === 'white' ? 'White' : 'Black'} to move`;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'check':
        return 'text-yellow-600';
      case 'checkmate':
        return 'text-red-600';
      case 'stalemate':
      case 'draw':
        return 'text-blue-600';
      default:
        return 'text-gray-700';
    }
  };

  const renderCapturedPieces = (color: PieceColor) => {
    const pieces = capturedPieces[color];
    if (pieces.length === 0) return <div className="text-gray-400 text-sm">None</div>;

    return (
      <div className="flex flex-wrap gap-1">
        {pieces.map((piece, index) => (
          <span key={index} className="text-lg">
            {PIECE_SYMBOLS[piece.color][piece.type]}
          </span>
        ))}
      </div>
    );
  };

  const renderMoveHistory = () => {
    if (moveHistory.length === 0) {
      return <div className="text-gray-400 text-sm">No moves yet</div>;
    }

    return (
      <div className="move-history">
        {moveHistory.map((move, index) => (
          <div key={index} className="move-entry">
            <span className="move-number">{Math.floor(index / 2) + 1}.</span>
            <span className="move-notation">{move.notation}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="game-info">
      {/* Current Player & Status */}
      <div className="game-status">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Game Status</h2>
        </div>
        <div className={`status-message ${getStatusColor()}`}>
          {getStatusMessage()}
        </div>
        <div className="current-player">
          <div className="player-indicator">
            <div className={`player-dot ${currentPlayer}`}></div>
            <span>{currentPlayer === 'white' ? 'White' : 'Black'} to move</span>
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="game-controls">
        <button
          onClick={onNewGame}
          className="control-button primary"
          title="Start New Game"
        >
          New Game
        </button>
        <button
          onClick={onUndoMove}
          className="control-button secondary"
          disabled={moveHistory.length === 0}
          title="Undo Last Move"
        >
          <RotateCcw className="w-4 h-4" />
          Undo
        </button>
        <button
          onClick={onSettings}
          className="control-button secondary"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Captured Pieces */}
      <div className="captured-pieces">
        <h3 className="section-title">Captured Pieces</h3>
        <div className="captured-section">
          <div className="captured-color">
            <h4>White Pieces</h4>
            {renderCapturedPieces('white')}
          </div>
          <div className="captured-color">
            <h4>Black Pieces</h4>
            {renderCapturedPieces('black')}
          </div>
        </div>
      </div>

      {/* Move History */}
      <div className="move-history-section">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4" />
          <h3 className="section-title">Move History</h3>
        </div>
        <div className="move-history-container">
          {renderMoveHistory()}
        </div>
      </div>
    </div>
  );
};

export default GameInfo;