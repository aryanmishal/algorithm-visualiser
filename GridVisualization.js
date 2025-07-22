/**
 * Grid Visualization Class
 * Handles visualization of grid-based algorithms (pathfinding, maze generation)
 */

import { GridElement } from '../elements/GridElement.js'

export class GridVisualization {
  constructor(options = {}) {
    this.options = {
      rows: 20,
      cols: 30,
      cellSize: 20,
      padding: 20,
      showCoordinates: false,
      showCosts: false,
      ...options
    }
    
    this.engine = null
    this.grid = []
    this.startCell = null
    this.endCell = null
    this.title = options.title || 'Grid Visualization'
  }
  
  init() {
    if (!this.engine) return
    this.createGrid()
    this.setupLayout()
  }
  
  createGrid() {
    if (!this.engine) return
    
    // Clear existing grid
    this.clearGrid()
    
    // Calculate grid dimensions
    this.calculateDimensions()
    
    // Create grid cells
    for (let row = 0; row < this.options.rows; row++) {
      this.grid[row] = []
      for (let col = 0; col < this.options.cols; col++) {
        const x = this.startX + col * this.options.cellSize
        const y = this.startY + row * this.options.cellSize
        
        const cell = new GridElement(row, col, x, y, this.options.cellSize, {
          showCoordinates: this.options.showCoordinates,
          showCost: this.options.showCosts,
          strokeColor: '#d1d5db',
          lineWidth: 1
        })
        
        const cellId = `cell_${row}_${col}`
        this.engine.addElement(cellId, cell)
        this.grid[row][col] = cell
        cell.cellId = cellId
      }
    }
  }
  
  calculateDimensions() {
    const totalWidth = this.options.cols * this.options.cellSize
    const totalHeight = this.options.rows * this.options.cellSize
    
    this.startX = (this.engine.width - totalWidth) / 2
    this.startY = (this.engine.height - totalHeight) / 2 + 30 // Space for title
  }
  
  clearGrid() {
    this.grid.forEach(row => {
      row.forEach(cell => cell && cell.destroy())
    })
    this.grid = []
    this.startCell = null
    this.endCell = null
  }
  
  setupLayout() {
    if (!this.engine) return
    this.engine.render()
  }
  
  render(ctx, width, height) {
    // Draw title
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(this.title, width / 2, 25)
    
    // Draw legend
    this.drawLegend(ctx, width, height)
  }
  
  drawLegend(ctx, width, height) {
    const legendY = height - 40
    const legendItems = [
      { color: '#ffffff', label: 'Empty', stroke: true },
      { color: '#374151', label: 'Wall' },
      { color: '#059669', label: 'Start' },
      { color: '#dc2626', label: 'End' },
      { color: '#bfdbfe', label: 'Visited' },
      { color: '#3b82f6', label: 'Path' }
    ]
    
    legendItems.forEach((item, index) => {
      const x = 20 + index * 80
      
      // Draw color box
      ctx.fillStyle = item.color
      ctx.fillRect(x, legendY, 15, 15)
      
      if (item.stroke) {
        ctx.strokeStyle = '#d1d5db'
        ctx.lineWidth = 1
        ctx.strokeRect(x, legendY, 15, 15)
      }
      
      // Draw label
      ctx.fillStyle = '#374151'
      ctx.font = '12px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(item.label, x + 20, legendY + 12)
    })
  }
  
  executeStep(step) {
    const { type, row, col, rows = [], cols = [], path = [], message } = step
    
    switch (type) {
      case 'visit':
        this.visitCell(row, col)
        break
        
      case 'current':
        this.setCurrentCell(row, col)
        break
        
      case 'add_to_frontier':
        this.addToFrontier(rows, cols)
        break
        
      case 'mark_path':
        this.markPath(path)
        break
        
      case 'set_wall':
        this.setWall(row, col)
        break
        
      case 'set_start':
        this.setStart(row, col)
        break
        
      case 'set_end':
        this.setEnd(row, col)
        break
        
      case 'reset':
        this.resetGrid()
        break
    }
    
    if (message && this.engine) {
      this.currentMessage = message
    }
  }
  
  // API methods for algorithm plugins
  visitCell(row, col) {
    const cell = this.getCell(row, col)
    if (cell && cell.isWalkable()) {
      cell.setVisited(true)
      this.engine.render()
    }
  }
  
  setCurrentCell(row, col) {
    // Reset current state
    this.grid.forEach(row => {
      row.forEach(cell => {
        if (cell.state === 'current') {
          cell.setState('default')
        }
      })
    })
    
    const cell = this.getCell(row, col)
    if (cell) {
      cell.setState('current')
      this.engine.render()
    }
  }
  
  addToFrontier(rows, cols) {
    for (let i = 0; i < rows.length; i++) {
      const cell = this.getCell(rows[i], cols[i])
      if (cell && !cell.visited && cell.isWalkable()) {
        cell.setState('frontier')
      }
    }
    this.engine.render()
  }
  
  markPath(path) {
    // Reset path state
    this.grid.forEach(row => {
      row.forEach(cell => cell.setInPath(false))
    })
    
    // Mark new path
    path.forEach(({ row, col }) => {
      const cell = this.getCell(row, col)
      if (cell) {
        cell.setInPath(true)
      }
    })
    
    this.engine.render()
  }
  
  setWall(row, col) {
    const cell = this.getCell(row, col)
    if (cell && !cell.isStart() && !cell.isEnd()) {
      cell.setType('wall')
      this.engine.render()
    }
  }
  
  setStart(row, col) {
    // Clear previous start
    if (this.startCell) {
      this.startCell.setType('empty')
    }
    
    const cell = this.getCell(row, col)
    if (cell) {
      cell.setType('start')
      this.startCell = cell
      this.engine.render()
    }
  }
  
  setEnd(row, col) {
    // Clear previous end
    if (this.endCell) {
      this.endCell.setType('empty')
    }
    
    const cell = this.getCell(row, col)
    if (cell) {
      cell.setType('end')
      this.endCell = cell
      this.engine.render()
    }
  }
  
  getCell(row, col) {
    if (row >= 0 && row < this.options.rows && col >= 0 && col < this.options.cols) {
      return this.grid[row][col]
    }
    return null
  }
  
  getCellAt(x, y) {
    const col = Math.floor((x - this.startX) / this.options.cellSize)
    const row = Math.floor((y - this.startY) / this.options.cellSize)
    return this.getCell(row, col)
  }
  
  getNeighbors(row, col, includeDiagonal = false) {
    const cell = this.getCell(row, col)
    if (!cell) return []
    
    return cell.getNeighbors(this.grid, includeDiagonal)
  }
  
  resetGrid() {
    this.grid.forEach(row => {
      row.forEach(cell => {
        if (cell && !cell.isStart() && !cell.isEnd() && cell.type !== 'wall') {
          cell.reset()
        }
      })
    })
    this.engine.render()
  }
  
  clearWalls() {
    this.grid.forEach(row => {
      row.forEach(cell => {
        if (cell && cell.type === 'wall') {
          cell.setType('empty')
        }
      })
    })
    this.engine.render()
  }
  
  // Maze generation support
  generateMaze(algorithm = 'recursive_backtracking') {
    // Clear existing walls
    this.clearWalls()
    
    switch (algorithm) {
      case 'recursive_backtracking':
        this.generateRecursiveBacktrackingMaze()
        break
      case 'random':
        this.generateRandomMaze()
        break
    }
  }
  
  generateRandomMaze(wallProbability = 0.3) {
    this.grid.forEach(row => {
      row.forEach(cell => {
        if (cell && !cell.isStart() && !cell.isEnd()) {
          if (Math.random() < wallProbability) {
            cell.setType('wall')
          } else {
            cell.setType('empty')
          }
        }
      })
    })
    this.engine.render()
  }
  
  generateRecursiveBacktrackingMaze() {
    // Initialize all cells as walls
    this.grid.forEach(row => {
      row.forEach(cell => {
        if (cell && !cell.isStart() && !cell.isEnd()) {
          cell.setType('wall')
        }
      })
    })
    
    // Start from a random cell
    const startRow = Math.floor(Math.random() * this.options.rows)
    const startCol = Math.floor(Math.random() * this.options.cols)
    const stack = [{ row: startRow, col: startCol }]
    const visited = new Set()
    
    while (stack.length > 0) {
      const current = stack[stack.length - 1]
      const key = `${current.row},${current.col}`
      
      if (!visited.has(key)) {
        visited.add(key)
        const cell = this.getCell(current.row, current.col)
        if (cell && !cell.isStart() && !cell.isEnd()) {
          cell.setType('empty')
        }
      }
      
      // Get unvisited neighbors
      const neighbors = this.getUnvisitedNeighbors(current.row, current.col, visited, 2)
      
      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)]
        
        // Remove wall between current and next
        const wallRow = current.row + (next.row - current.row) / 2
        const wallCol = current.col + (next.col - current.col) / 2
        const wallCell = this.getCell(wallRow, wallCol)
        if (wallCell && !wallCell.isStart() && !wallCell.isEnd()) {
          wallCell.setType('empty')
        }
        
        stack.push(next)
      } else {
        stack.pop()
      }
    }
    
    this.engine.render()
  }
  
  getUnvisitedNeighbors(row, col, visited, step = 1) {
    const neighbors = []
    const directions = [[-step, 0], [step, 0], [0, -step], [0, step]]
    
    for (const [dr, dc] of directions) {
      const newRow = row + dr
      const newCol = col + dc
      const key = `${newRow},${newCol}`
      
      if (newRow >= 0 && newRow < this.options.rows &&
          newCol >= 0 && newCol < this.options.cols &&
          !visited.has(key)) {
        neighbors.push({ row: newRow, col: newCol })
      }
    }
    
    return neighbors
  }
  
  // Animation helpers
  async animatePathfinding(visitOrder, path, delay = 50) {
    // Animate visiting cells
    for (const { row, col } of visitOrder) {
      this.visitCell(row, col)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    // Animate final path
    if (path.length > 0) {
      await new Promise(resolve => setTimeout(resolve, delay * 5))
      this.markPath(path)
    }
  }
  
  // Resize handling
  resize() {
    this.calculateDimensions()
    
    // Update cell positions
    for (let row = 0; row < this.options.rows; row++) {
      for (let col = 0; col < this.options.cols; col++) {
        const cell = this.grid[row][col]
        if (cell) {
          const x = this.startX + col * this.options.cellSize
          const y = this.startY + row * this.options.cellSize
          cell.setPosition(x, y)
        }
      }
    }
    
    this.engine.render()
  }
}

