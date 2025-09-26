import React from 'react';
import ChessGame from './components/ChessGame';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>Chess Game</h1>
        <p>A complete chess game with all standard rules</p>
      </header>
      
      <main className="app-main">
        <ChessGame />
      </main>
      
      <footer className="app-footer">
        <p>Built with React, TypeScript, and modern web technologies</p>
      </footer>
    </div>
  );
}

export default App;