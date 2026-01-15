import React from 'react'

/**
 * Dot component - represents a single dot in the grid
 */
function Dot({ 
  row, 
  col, 
  isHovered, 
  onMouseEnter, 
  onMouseLeave, 
  onClick 
}) {
  return (
    <div
      className={`dot ${isHovered ? 'dot-hovered' : ''}`}
      style={{
        gridRow: row + 1,
        gridColumn: col + 1,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    />
  )
}

export default Dot

