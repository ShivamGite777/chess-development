import React from 'react';
import { ChessPiece, Position } from '../types/chess';
import { PIECE_SYMBOLS } from '../utils/chessLogic';

interface ChessSquareProps {
  piece: ChessPiece | null;
  position: Position;
  isLight: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  isLastMove: boolean;
  isInCheck: boolean;
  onClick: (position: Position) => void;
}

const ChessSquare: React.FC<ChessSquareProps> = ({
  piece,
  position,
  isLight,
  isSelected,
  isValidMove,
  isLastMove,
  isInCheck,
  onClick
}) => {
  const handleClick = () => {
    onClick(position);
  };

  const getSquareClasses = () => {
    let classes = 'chess-square';
    
    if (isLight) {
      classes += ' light';
    } else {
      classes += ' dark';
    }
    
    if (isSelected) {
      classes += ' selected';
    }
    
    if (isValidMove) {
      classes += ' valid-move';
    }
    
    if (isLastMove) {
      classes += ' last-move';
    }
    
    if (isInCheck && piece?.type === 'king') {
      classes += ' in-check';
    }
    
    return classes;
  };

  const files = 'abcdefgh';
  const ranks = '87654321';

  return (
    <div
      className={getSquareClasses()}
      onClick={handleClick}
      data-position={`${files[position.col]}${ranks[position.row]}`}
    >
      {piece && (
        <div className="chess-piece">
          {PIECE_SYMBOLS[piece.color][piece.type]}
        </div>
      )}
      
      {isValidMove && !piece && (
        <div className="move-indicator" />
      )}
      
      {isValidMove && piece && (
        <div className="capture-indicator" />
      )}
      
      {/* Coordinate labels */}
      {position.row === 7 && (
        <div className="file-label">
          {files[position.col]}
        </div>
      )}
      
      {position.col === 0 && (
        <div className="rank-label">
          {ranks[position.row]}
        </div>
      )}
    </div>
  );
};

export default ChessSquare;