import React from 'react'

/**
 * Line component - represents a line between two dots
 */
function Line({ 
  lineKey, 
  isDrawn, 
  player,
  isHovered, 
  orientation, 
  row, 
  col, 
  onMouseEnter, 
  onMouseLeave, 
  onClick 
}) {
  const isHorizontal = orientation === 'horizontal'
  const cellSize = 100 / 5 // 20% per cell in a 5x5 grid
  
  let style = {
    position: 'absolute',
  }

  if (isHorizontal) {
    // Horizontal line: positioned BETWEEN dots (row, col) and (row, col+1)
    // Dots are centered at: col*20% + 10%, (col+1)*20% + 10%
    // Line should span the gap between dots, starting slightly after first dot center
    // and ending slightly before second dot center
    const dotRadius = 1.5 // Approximate dot radius in percentage
    style.top = `calc(${row * cellSize + 10}% - 2px)`
    style.left = `calc(${col * cellSize + 10}% + ${dotRadius}%)`
    style.width = `calc(${cellSize}% - ${dotRadius * 2}%)`
    style.height = '4px'
  } else {
    // Vertical line: positioned BETWEEN dots (row, col) and (row+1, col)
    // Dots are centered at: row*20% + 10%, (row+1)*20% + 10%
    // Line should span the gap between dots, starting slightly after first dot center
    // and ending slightly before second dot center
    const dotRadius = 1.5 // Approximate dot radius in percentage
    style.top = `calc(${row * cellSize + 10}% + ${dotRadius}%)`
    style.left = `calc(${col * cellSize + 10}% - 2px)`
    style.width = '4px'
    style.height = `calc(${cellSize}% - ${dotRadius * 2}%)`
  }

  // Add player-specific class for color
  const playerClass = player === 1 ? 'line-player1' : player === 2 ? 'line-player2' : ''
  
  return (
    <div
      className={`line ${isDrawn ? 'line-drawn' : ''} ${playerClass} ${isHovered ? 'line-hovered' : ''} ${orientation}`}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      data-line-key={lineKey}
    />
  )
}

export default Line

