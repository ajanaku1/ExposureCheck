import React, { useState, useCallback, useEffect } from 'react'
import Dot from './components/Dot'
import Line from './components/Line'
import Box from './components/Box'
import Scoreboard from './components/Scoreboard'
import './DotsGame.css'

const GRID_SIZE = 5
const BOX_SIZE = 4 // 4x4 boxes in a 5x5 dot grid

/**
 * Main game component for the Dots game
 */
function DotsGame() {
  // Game state
  // drawnLines: Map<lineKey, playerNumber> - tracks which player drew each line
  const [drawnLines, setDrawnLines] = useState(new Map())
  const [completedBoxes, setCompletedBoxes] = useState(new Map())
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [player1Score, setPlayer1Score] = useState(0)
  const [player2Score, setPlayer2Score] = useState(0)
  const [hoveredLine, setHoveredLine] = useState(null)
  const [hoveredDot, setHoveredDot] = useState(null)
  const [selectedDot, setSelectedDot] = useState(null)
  const [lastMove, setLastMove] = useState(null)
  const [newlyCompletedBoxes, setNewlyCompletedBoxes] = useState(new Set())
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState(null)

  /**
   * Generate a unique key for a line between two dots
   */
  const getLineKey = useCallback((row1, col1, row2, col2) => {
    // Normalize: always use smaller coordinates first
    const [r1, c1, r2, c2] = 
      row1 < row2 || (row1 === row2 && col1 < col2)
        ? [row1, col1, row2, col2]
        : [row2, col2, row1, col1]
    return `${r1},${c1}-${r2},${c2}`
  }, [])

  /**
   * Check if two dots are adjacent (horizontally or vertically)
   */
  const areAdjacent = useCallback((row1, col1, row2, col2) => {
    const rowDiff = Math.abs(row1 - row2)
    const colDiff = Math.abs(col1 - col2)
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
  }, [])

  /**
   * Get the orientation of a line (horizontal or vertical)
   */
  const getLineOrientation = useCallback((row1, col1, row2, col2) => {
    return row1 === row2 ? 'horizontal' : 'vertical'
  }, [])

  /**
   * Check if a box is completed (all 4 sides drawn) using a specific map of lines
   */
  const isBoxCompletedWithLines = useCallback((boxRow, boxCol, linesMap) => {
    // A box is defined by its top-left corner dot
    const topLeft = { row: boxRow, col: boxCol }
    const topRight = { row: boxRow, col: boxCol + 1 }
    const bottomLeft = { row: boxRow + 1, col: boxCol }
    const bottomRight = { row: boxRow + 1, col: boxCol + 1 }

    const topLine = getLineKey(topLeft.row, topLeft.col, topRight.row, topRight.col)
    const rightLine = getLineKey(topRight.row, topRight.col, bottomRight.row, bottomRight.col)
    const bottomLine = getLineKey(bottomLeft.row, bottomLeft.col, bottomRight.row, bottomRight.col)
    const leftLine = getLineKey(topLeft.row, topLeft.col, bottomLeft.row, bottomLeft.col)

    return (
      linesMap.has(topLine) &&
      linesMap.has(rightLine) &&
      linesMap.has(bottomLine) &&
      linesMap.has(leftLine)
    )
  }, [getLineKey])

  /**
   * Check all boxes and award any newly completed ones to the current player
   */
  const checkAndAwardBoxes = useCallback((newDrawnLines) => {
    const newCompletedBoxes = new Set()
    const updatedCompletedBoxes = new Map(completedBoxes)

    // Check each possible box
    for (let boxRow = 0; boxRow < BOX_SIZE; boxRow++) {
      for (let boxCol = 0; boxCol < BOX_SIZE; boxCol++) {
        const boxKey = `${boxRow},${boxCol}`
        
        // Skip if already completed
        if (updatedCompletedBoxes.has(boxKey)) continue

        // Check if this box is now completed using the NEW lines
        if (isBoxCompletedWithLines(boxRow, boxCol, newDrawnLines)) {
          updatedCompletedBoxes.set(boxKey, currentPlayer)
          newCompletedBoxes.add(boxKey)
        }
      }
    }

    if (newCompletedBoxes.size > 0) {
      setCompletedBoxes(updatedCompletedBoxes)
      setNewlyCompletedBoxes(newCompletedBoxes)
      
      // Update scores
      if (currentPlayer === 1) {
        setPlayer1Score(prev => prev + newCompletedBoxes.size)
      } else {
        setPlayer2Score(prev => prev + newCompletedBoxes.size)
      }

      // Clear the animation after a delay
      setTimeout(() => {
        setNewlyCompletedBoxes(new Set())
      }, 600)

      return true // Return true if boxes were completed (extra turn)
    }

    return false
  }, [completedBoxes, currentPlayer, isBoxCompletedWithLines])

  /**
   * Check if the game is over (all boxes are completed)
   */
  useEffect(() => {
    if (completedBoxes.size === BOX_SIZE * BOX_SIZE) {
      setGameOver(true)
      if (player1Score > player2Score) {
        setWinner(1)
      } else if (player2Score > player1Score) {
        setWinner(2)
      } else {
        setWinner(0) // Tie
      }
    }
  }, [completedBoxes, player1Score, player2Score])

  /**
   * Handle drawing a line between two dots
   */
  const handleDrawLine = useCallback((row1, col1, row2, col2) => {
    if (gameOver) return

    // Validate: dots must be adjacent
    if (!areAdjacent(row1, col1, row2, col2)) {
      return
    }

    const lineKey = getLineKey(row1, col1, row2, col2)

    // Validate: line must not already be drawn
    if (drawnLines.has(lineKey)) {
      return
    }

    // Draw the line and track which player drew it
    const newDrawnLines = new Map(drawnLines)
    newDrawnLines.set(lineKey, currentPlayer)
    setDrawnLines(newDrawnLines)
    setLastMove(lineKey)

    // Check for completed boxes using the NEW lines immediately
    // This ensures we detect box completion on the same turn
    const boxesCompleted = checkAndAwardBoxes(newDrawnLines)

    // If no boxes were completed, switch turns immediately
    if (!boxesCompleted) {
      setCurrentPlayer(prev => prev === 1 ? 2 : 1)
    }
    // If boxes were completed, current player gets an extra turn (no switch)

    setSelectedDot(null)
  }, [gameOver, drawnLines, areAdjacent, getLineKey, checkAndAwardBoxes])

  /**
   * Handle dot click - select or draw line
   */
  const handleDotClick = useCallback((row, col) => {
    if (gameOver) return

    if (selectedDot === null) {
      // First dot selected
      setSelectedDot({ row, col })
    } else {
      // Second dot selected - try to draw line
      if (selectedDot.row === row && selectedDot.col === col) {
        // Same dot clicked - deselect
        setSelectedDot(null)
      } else {
        // Different dot - try to draw line
        handleDrawLine(selectedDot.row, selectedDot.col, row, col)
      }
    }
  }, [selectedDot, gameOver, handleDrawLine])

  /**
   * Handle line click - draw line directly
   */
  const handleLineClick = useCallback((lineKey) => {
    if (gameOver) return
    if (drawnLines.has(lineKey)) return

    // Parse line key to get coordinates
    const [start, end] = lineKey.split('-')
    const [r1, c1] = start.split(',').map(Number)
    const [r2, c2] = end.split(',').map(Number)

    handleDrawLine(r1, c1, r2, c2)
    setSelectedDot(null)
  }, [gameOver, drawnLines, handleDrawLine])

  /**
   * Reset the game
   */
  const handleReset = useCallback(() => {
    setDrawnLines(new Map())
    setCompletedBoxes(new Map())
    setCurrentPlayer(1)
    setPlayer1Score(0)
    setPlayer2Score(0)
    setSelectedDot(null)
    setHoveredLine(null)
    setHoveredDot(null)
    setLastMove(null)
    setNewlyCompletedBoxes(new Set())
    setGameOver(false)
    setWinner(null)
  }, [])

  /**
   * Generate all lines for rendering
   */
  const generateLines = useCallback(() => {
    const lines = []

    // Horizontal lines
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 1; col++) {
        const lineKey = getLineKey(row, col, row, col + 1)
        lines.push({
          key: lineKey,
          row,
          col,
          orientation: 'horizontal',
        })
      }
    }

    // Vertical lines
    for (let row = 0; row < GRID_SIZE - 1; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const lineKey = getLineKey(row, col, row + 1, col)
        lines.push({
          key: lineKey,
          row,
          col,
          orientation: 'vertical',
        })
      }
    }

    return lines
  }, [getLineKey])

  const lines = generateLines()

  return (
    <div className="dots-game">
      <Scoreboard
        player1Score={player1Score}
        player2Score={player2Score}
        currentPlayer={currentPlayer}
        gameOver={gameOver}
        winner={winner}
      />

      <div className="game-board">
        {/* Render boxes first (background) */}
        {Array.from({ length: BOX_SIZE }, (_, boxRow) =>
          Array.from({ length: BOX_SIZE }, (_, boxCol) => {
            const boxKey = `${boxRow},${boxCol}`
            const owner = completedBoxes.get(boxKey)
            return (
              <Box
                key={boxKey}
                row={boxRow}
                col={boxCol}
                owner={owner}
                isNewlyCompleted={newlyCompletedBoxes.has(boxKey)}
              />
            )
          })
        )}

        {/* Render lines */}
        {lines.map((line) => {
          const isDrawn = drawnLines.has(line.key)
          const linePlayer = drawnLines.get(line.key)
          const isHovered = hoveredLine === line.key
          const isLastMove = lastMove === line.key

          return (
            <Line
              key={line.key}
              lineKey={line.key}
              isDrawn={isDrawn}
              player={linePlayer}
              isHovered={isHovered}
              orientation={line.orientation}
              row={line.row}
              col={line.col}
              onMouseEnter={() => !isDrawn && setHoveredLine(line.key)}
              onMouseLeave={() => setHoveredLine(null)}
              onClick={() => handleLineClick(line.key)}
            />
          )
        })}

        {/* Render dots */}
        {Array.from({ length: GRID_SIZE }, (_, row) =>
          Array.from({ length: GRID_SIZE }, (_, col) => {
            const isSelected = selectedDot?.row === row && selectedDot?.col === col
            const isHovered = hoveredDot?.row === row && hoveredDot?.col === col

            return (
              <Dot
                key={`${row},${col}`}
                row={row}
                col={col}
                isHovered={isHovered || isSelected}
                onMouseEnter={() => setHoveredDot({ row, col })}
                onMouseLeave={() => setHoveredDot(null)}
                onClick={() => handleDotClick(row, col)}
              />
            )
          })
        )}
      </div>

      <button className="reset-button" onClick={handleReset}>
        Reset Game
      </button>
    </div>
  )
}

export default DotsGame

