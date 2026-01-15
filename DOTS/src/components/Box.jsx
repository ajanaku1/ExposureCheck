import React from 'react'

/**
 * Box component - represents a completed box with player color and X/O marker
 */
function Box({ row, col, owner, isNewlyCompleted }) {
  if (!owner) return null

  const playerColors = {
    1: 'player1-gradient',
    2: 'player2-gradient',
  }

  const playerMarkers = {
    1: 'X',
    2: 'O',
  }

  // Calculate absolute position within the 4x4 box grid
  // Boxes are positioned between dots in a 5x5 grid
  // Each cell is 20% (100/5), dots are centered in cells at 10%, 30%, 50%, 70%, 90%
  // Box at (row, col) is between dots at (row, col), (row, col+1), (row+1, col), (row+1, col+1)
  // The box should span from the center of the top-left dot to the center of the bottom-right dot
  const cellSize = 100 / 5 // 20% per cell
  const boxSize = cellSize // Box size matches cell size (20%)
  // Box starts at the first dot's center position (10% + col*20%)
  const left = 10 + col * cellSize
  const top = 10 + row * cellSize

  return (
    <div
      className={`box ${playerColors[owner]} ${isNewlyCompleted ? 'box-completed' : ''}`}
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: `${top}%`,
        width: `${boxSize}%`,
        height: `${boxSize}%`,
      }}
    >
      <div className={`box-marker box-marker-${owner}`}>
        {playerMarkers[owner]}
      </div>
    </div>
  )
}

export default Box

