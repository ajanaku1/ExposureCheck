import React from 'react'

/**
 * Scoreboard component - displays player scores and turn indicator
 */
function Scoreboard({ player1Score, player2Score, currentPlayer, gameOver, winner }) {
  return (
    <div className="scoreboard">
      <div className={`player-info ${currentPlayer === 1 && !gameOver ? 'player-active' : ''}`}>
        <div className="player-avatar player1-avatar">P1</div>
        <div className="player-details">
          <div className="player-name">Player 1</div>
          <div className="player-score">{player1Score}</div>
          {currentPlayer === 1 && !gameOver && (
            <div className="turn-indicator">Your Turn</div>
          )}
        </div>
      </div>
      
      {gameOver && (
        <div className="game-over">
          <div className="winner-message">
            {winner === 1 ? 'Player 1 Wins!' : winner === 2 ? 'Player 2 Wins!' : "It's a Tie!"}
          </div>
        </div>
      )}
      
      <div className={`player-info ${currentPlayer === 2 && !gameOver ? 'player-active' : ''}`}>
        <div className="player-avatar player2-avatar">P2</div>
        <div className="player-details">
          <div className="player-name">Player 2</div>
          <div className="player-score">{player2Score}</div>
          {currentPlayer === 2 && !gameOver && (
            <div className="turn-indicator">Your Turn</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Scoreboard

