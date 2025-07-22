/**
 * Grid Element Class
 * Represents grid cells for pathfinding and maze algorithms
 */

import { BaseElement } from './BaseElement.js'

export class GridElement extends BaseElement {
  constructor(row, col, x, y, cellSize, options = {}) {
    super(x, y, {
      ...options,
      width: cellSize,
      height: cellSize
    })
    
    this.row = row
    this.col = col
    this.cellSize = cellSize
    
    // Grid-specific properties
    this.type = options.type || 'empty' // 'empty', 'wall', 'start', 'end'
    this.cost = options.cost || 1
    this.heuristic = options.heuristic || 0
    this.distance = options.distance || Infinity
    this.visited = false
    this.inPath = false
    
    // Pathfinding properties
    this.parent = null
    this.gScore = Infinity
    this.fScore = Infinity
    
    // Visual properties
    this.showCoordinates = options.showCoordinates || false
    this.showCost = options.showCost || false
    this.textColor = options.textColor || '#374151'
    this.font = options.font || '10px Arial'
    
    // State colors
    this.stateColors = {
      empty: '#ffffff',
      wall: '#374151',
      start: '#059669',
      end: '#dc2626',
      visited: '#bfdbfe',
      current: '#fbbf24',
      path: '#3b82f6',
      frontier: '#fde68a',
      ...options.stateColors
    }
    
    this.updateVisualState()
  }
  
  updateVisualState() {
    if (this.inPath) {
      this.fillColor = this.stateColors.path
    } else if (this.state === 'current') {
      this.fillColor = this.stateColors.current
    } else if (this.visited) {
      this.fillColor = this.stateColors.visited
    } else if (this.stateColors[this.type]) {
      this.fillColor = this.stateColors[this.type]
    } else if (this.stateColors[this.state]) {
      this.fillColor = this.stateColors[this.state]
    }
  }
  
  render(ctx) {
    if (!this.visible) return
    
    ctx.save()
    ctx.globalAlpha = this.opacity
    
    // Draw cell background
    if (this.fillColor) {
      ctx.fillStyle = this.fillColor
      ctx.fillRect(this.x, this.y, this.width, this.height)
    }
    
    // Draw cell border
    if (this.strokeColor) {
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = this.lineWidth
      ctx.strokeRect(this.x, this.y, this.width, this.height)
    }
    
    // Draw coordinates
    if (this.showCoordinates) {
      ctx.fillStyle = this.textColor
      ctx.font = this.font
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        `${this.row},${this.col}`,
        this.x + this.width / 2,
        this.y + this.height / 2
      )
    }
    
    // Draw cost
    if (this.showCost && this.cost !== 1) {
      ctx.fillStyle = this.textColor
      ctx.font = this.font
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      ctx.fillText(
        this.cost.toString(),
        this.x + this.width - 2,
        this.y + this.height - 2
      )
    }
    
    // Draw distance for pathfinding visualization
    if (this.distance !== Infinity && this.distance < 1000) {
      ctx.fillStyle = this.textColor
      ctx.font = this.font
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(
        this.distance.toFixed(1),
        this.x + 2,
        this.y + 2
      )
    }
    
    ctx.restore()
  }
  
  // Grid-specific methods
  setType(type) {
    this.type = type
    this.updateVisualState()
  }
  
  setVisited(visited = true) {
    this.visited = visited
    this.updateVisualState()
  }
  
  setInPath(inPath = true) {
    this.inPath = inPath
    this.updateVisualState()
  }
  
  setDistance(distance) {
    this.distance = distance
  }
  
  setCost(cost) {
    this.cost = cost
  }
  
  // Pathfinding methods
  getNeighbors(grid, includeDiagonal = false) {
    const neighbors = []
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1] // Up, Down, Left, Right
    ]
    
    if (includeDiagonal) {
      directions.push(
        [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonals
      )
    }
    
    for (const [dr, dc] of directions) {
      const newRow = this.row + dr
      const newCol = this.col + dc
      
      if (grid[newRow] && grid[newRow][newCol]) {
        const neighbor = grid[newRow][newCol]
        if (neighbor.type !== 'wall') {
          neighbors.push(neighbor)
        }
      }
    }
    
    return neighbors
  }
  
  distanceTo(other) {
    // Manhattan distance
    return Math.abs(this.row - other.row) + Math.abs(this.col - other.col)
  }
  
  euclideanDistanceTo(other) {
    // Euclidean distance
    const dx = this.row - other.row
    const dy = this.col - other.col
    return Math.sqrt(dx * dx + dy * dy)
  }
  
  isWalkable() {
    return this.type !== 'wall'
  }
  
  isStart() {
    return this.type === 'start'
  }
  
  isEnd() {
    return this.type === 'end'
  }
  
  // Reset pathfinding state
  reset() {
    this.visited = false
    this.inPath = false
    this.parent = null
    this.gScore = Infinity
    this.fScore = Infinity
    this.distance = Infinity
    this.setState('default')
    this.updateVisualState()
  }
  
  // Animation helpers
  flash(color = '#fbbf24', duration = 200) {
    if (this.engine) {
      const originalColor = this.fillColor
      this.fillColor = color
      this.engine.render()
      setTimeout(() => {
        this.fillColor = originalColor
        this.engine.render()
      }, duration)
    }
  }
  
  ripple(duration = 500) {
    if (this.engine) {
      // Create a ripple effect by temporarily changing opacity
      const originalOpacity = this.opacity
      this.opacity = 0.3
      return this.engine.animate(this, { opacity: originalOpacity }, duration)
    }
  }
  
  // Utility methods
  getCoordinates() {
    return { row: this.row, col: this.col }
  }
  
  equals(other) {
    return this.row === other.row && this.col === other.col
  }
  
  toString() {
    return `GridCell(${this.row}, ${this.col})`
  }
}

