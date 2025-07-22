/**
 * A* Pathfinding Algorithm Plugin
 * Implements A* algorithm for grid-based pathfinding
 */

import { AlgorithmPlugin } from '../AlgorithmPlugin.js'

export class AStarAlgorithm extends AlgorithmPlugin {
  constructor() {
    super('A* Pathfinding', 'Pathfinding Algorithms', {
      description: 'Finds shortest path using heuristic to guide search efficiently',
      timeComplexity: 'O(b^d)',
      spaceComplexity: 'O(b^d)',
      visualizationType: 'grid'
    })
  }
  
  async execute(input, options = {}) {
    const { grid, start, end, heuristic = 'manhattan' } = input
    
    // Initialize data structures
    const openSet = [start]
    const closedSet = new Set()
    const gScore = new Map()
    const fScore = new Map()
    const parent = new Map()
    const steps = []
    
    // Initialize scores
    gScore.set(this.cellKey(start), 0)
    fScore.set(this.cellKey(start), this.heuristic(start, end, heuristic))
    
    steps.push({
      type: 'start',
      row: start.row,
      col: start.col,
      message: `Starting A* from (${start.row}, ${start.col}) to (${end.row}, ${end.col})`
    })
    
    while (openSet.length > 0) {
      // Find node with lowest fScore
      let current = openSet[0]
      let currentIndex = 0
      
      for (let i = 1; i < openSet.length; i++) {
        const currentKey = this.cellKey(openSet[i])
        const bestKey = this.cellKey(current)
        if (fScore.get(currentKey) < fScore.get(bestKey)) {
          current = openSet[i]
          currentIndex = i
        }
      }
      
      // Remove current from open set
      openSet.splice(currentIndex, 1)
      closedSet.add(this.cellKey(current))
      
      steps.push({
        type: 'current',
        row: current.row,
        col: current.col,
        message: `Examining cell (${current.row}, ${current.col}) - f=${fScore.get(this.cellKey(current))?.toFixed(1)}`
      })
      
      // Check if we reached the goal
      if (current.row === end.row && current.col === end.col) {
        const path = this.reconstructPath(parent, start, end)
        steps.push({
          type: 'found',
          row: current.row,
          col: current.col,
          message: `Path found! Length: ${path.length}`
        })
        
        steps.push({
          type: 'mark_path',
          path: path,
          message: `Shortest path marked`
        })
        break
      }
      
      // Mark as visited
      steps.push({
        type: 'visit',
        row: current.row,
        col: current.col,
        message: `Cell (${current.row}, ${current.col}) visited`
      })
      
      // Examine neighbors
      const neighbors = this.getNeighbors(grid, current)
      const newFrontier = []
      
      for (const neighbor of neighbors) {
        const neighborKey = this.cellKey(neighbor)
        
        if (closedSet.has(neighborKey)) {
          continue // Skip already evaluated neighbors
        }
        
        const tentativeGScore = gScore.get(this.cellKey(current)) + this.getMoveCost(current, neighbor)
        
        if (!openSet.some(cell => this.cellKey(cell) === neighborKey)) {
          openSet.push(neighbor)
          newFrontier.push(neighbor)
        } else if (tentativeGScore >= gScore.get(neighborKey)) {
          continue // This is not a better path
        }
        
        // This path is the best until now
        parent.set(neighborKey, current)
        gScore.set(neighborKey, tentativeGScore)
        fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, end, heuristic))
      }
      
      if (newFrontier.length > 0) {
        const frontierRows = newFrontier.map(cell => cell.row)
        const frontierCols = newFrontier.map(cell => cell.col)
        
        steps.push({
          type: 'add_to_frontier',
          rows: frontierRows,
          cols: frontierCols,
          message: `Added ${newFrontier.length} cells to frontier`
        })
      }
    }
    
    // Check if no path was found
    if (openSet.length === 0 && !closedSet.has(this.cellKey(end))) {
      steps.push({
        type: 'not_found',
        message: `No path found from (${start.row}, ${start.col}) to (${end.row}, ${end.col})`
      })
    }
    
    return steps
  }
  
  generateSteps(input) {
    // For A*, we generate steps during execution
    return []
  }
  
  getNeighbors(grid, cell) {
    const neighbors = []
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1], // Cardinal directions
      [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonal directions
    ]
    
    for (const [dr, dc] of directions) {
      const newRow = cell.row + dr
      const newCol = cell.col + dc
      
      if (this.isValidCell(grid, newRow, newCol)) {
        neighbors.push({ row: newRow, col: newCol })
      }
    }
    
    return neighbors
  }
  
  isValidCell(grid, row, col) {
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
      return false
    }
    
    const cell = grid[row][col]
    return cell && cell.type !== 'wall'
  }
  
  getMoveCost(from, to) {
    // Diagonal movement costs more
    const dx = Math.abs(from.col - to.col)
    const dy = Math.abs(from.row - to.row)
    
    if (dx === 1 && dy === 1) {
      return Math.sqrt(2) // Diagonal cost
    } else {
      return 1 // Cardinal direction cost
    }
  }
  
  heuristic(from, to, type = 'manhattan') {
    const dx = Math.abs(from.col - to.col)
    const dy = Math.abs(from.row - to.row)
    
    switch (type) {
      case 'manhattan':
        return dx + dy
      case 'euclidean':
        return Math.sqrt(dx * dx + dy * dy)
      case 'diagonal':
        return Math.max(dx, dy)
      default:
        return dx + dy
    }
  }
  
  cellKey(cell) {
    return `${cell.row},${cell.col}`
  }
  
  reconstructPath(parent, start, end) {
    const path = []
    let current = end
    
    while (current) {
      path.unshift(current)
      current = parent.get(this.cellKey(current))
    }
    
    return path
  }
  
  // Override step execution for custom visualization
  async onStep(step) {
    switch (step.type) {
      case 'start':
        if (this.visualization && this.visualization.setCurrentCell) {
          this.visualization.setCurrentCell(step.row, step.col)
        }
        break
        
      case 'current':
        if (this.visualization && this.visualization.setCurrentCell) {
          this.visualization.setCurrentCell(step.row, step.col)
        }
        break
        
      case 'visit':
        this.markVisited(step.row, step.col)
        break
        
      case 'add_to_frontier':
        if (this.visualization && this.visualization.addToFrontier) {
          this.visualization.addToFrontier(step.rows, step.cols)
        }
        break
        
      case 'mark_path':
        this.markPath(step.path)
        break
        
      case 'found':
        if (this.visualization && this.visualization.setCurrentCell) {
          this.visualization.setCurrentCell(step.row, step.col)
        }
        break
    }
  }
}

// Factory function for easy instantiation
export function createAStarAlgorithm() {
  return new AStarAlgorithm()
}

