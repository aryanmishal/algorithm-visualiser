/**
 * Graph Visualization Class
 * Handles visualization of graph-based algorithms (BFS, DFS, shortest path)
 */

import { NodeElement } from '../elements/NodeElement.js'
import { EdgeElement } from '../elements/EdgeElement.js'

export class GraphVisualization {
  constructor(options = {}) {
    this.options = {
      nodeRadius: 20,
      nodeSpacing: 100,
      padding: 50,
      directed: false,
      showWeights: false,
      layoutType: 'force', // 'force', 'circular', 'grid'
      ...options
    }
    
    this.engine = null
    this.nodes = new Map()
    this.edges = new Map()
    this.adjacencyList = new Map()
    this.title = options.title || 'Graph Visualization'
  }
  
  init() {
    if (!this.engine) return
    this.setupLayout()
  }
  
  setGraph(graphData) {
    this.clearGraph()
    this.buildGraph(graphData)
    this.setupLayout()
  }
  
  clearGraph() {
    this.nodes.forEach(node => node.destroy())
    this.edges.forEach(edge => edge.destroy())
    this.nodes.clear()
    this.edges.clear()
    this.adjacencyList.clear()
  }
  
  buildGraph(graphData) {
    if (!this.engine || !graphData) return
    
    // Create nodes
    graphData.nodes.forEach(nodeData => {
      this.addNode(nodeData.id, nodeData.value || nodeData.id, nodeData)
    })
    
    // Create edges
    graphData.edges.forEach(edgeData => {
      this.addEdge(edgeData.from, edgeData.to, edgeData.weight, edgeData)
    })
  }
  
  addNode(id, value, options = {}) {
    if (this.nodes.has(id)) return false
    
    const node = new NodeElement(value, 0, 0, {
      radius: this.options.nodeRadius,
      ...options
    })
    
    this.engine.addElement(`node_${id}`, node)
    this.nodes.set(id, node)
    node.nodeId = id
    
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, new Set())
    }
    
    return true
  }
  
  addEdge(fromId, toId, weight = null, options = {}) {
    const fromNode = this.nodes.get(fromId)
    const toNode = this.nodes.get(toId)
    
    if (!fromNode || !toNode) return false
    
    const edgeId = `edge_${fromId}_${toId}`
    if (this.edges.has(edgeId)) return false
    
    const edge = new EdgeElement(fromNode, toNode, {
      weight: weight,
      directed: this.options.directed,
      showWeight: this.options.showWeights && weight !== null,
      ...options
    })
    
    this.engine.addElement(edgeId, edge)
    this.edges.set(edgeId, edge)
    
    // Update adjacency list
    this.adjacencyList.get(fromId).add(toId)
    if (!this.options.directed) {
      this.adjacencyList.get(toId).add(fromId)
    }
    
    return true
  }
  
  setupLayout() {
    if (!this.engine || this.nodes.size === 0) return
    
    switch (this.options.layoutType) {
      case 'circular':
        this.circularLayout()
        break
      case 'grid':
        this.gridLayout()
        break
      case 'force':
      default:
        this.forceLayout()
        break
    }
    
    this.engine.render()
  }
  
  circularLayout() {
    const centerX = this.engine.width / 2
    const centerY = this.engine.height / 2
    const radius = Math.min(centerX, centerY) - this.options.padding
    const nodeCount = this.nodes.size
    
    let index = 0
    for (const [id, node] of this.nodes) {
      const angle = (2 * Math.PI * index) / nodeCount
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      node.setCenter(x, y)
      index++
    }
  }
  
  gridLayout() {
    const cols = Math.ceil(Math.sqrt(this.nodes.size))
    const rows = Math.ceil(this.nodes.size / cols)
    const cellWidth = (this.engine.width - 2 * this.options.padding) / cols
    const cellHeight = (this.engine.height - 2 * this.options.padding) / rows
    
    let index = 0
    for (const [id, node] of this.nodes) {
      const col = index % cols
      const row = Math.floor(index / cols)
      const x = this.options.padding + col * cellWidth + cellWidth / 2
      const y = this.options.padding + row * cellHeight + cellHeight / 2
      node.setCenter(x, y)
      index++
    }
  }
  
  forceLayout() {
    // Simple force-directed layout
    const iterations = 100
    const k = Math.sqrt((this.engine.width * this.engine.height) / this.nodes.size)
    
    // Initialize random positions
    for (const [id, node] of this.nodes) {
      if (node.centerX === 0 && node.centerY === 0) {
        node.setCenter(
          Math.random() * (this.engine.width - 2 * this.options.padding) + this.options.padding,
          Math.random() * (this.engine.height - 2 * this.options.padding) + this.options.padding
        )
      }
    }
    
    for (let iter = 0; iter < iterations; iter++) {
      const forces = new Map()
      
      // Initialize forces
      for (const [id, node] of this.nodes) {
        forces.set(id, { x: 0, y: 0 })
      }
      
      // Repulsive forces between all nodes
      for (const [id1, node1] of this.nodes) {
        for (const [id2, node2] of this.nodes) {
          if (id1 !== id2) {
            const dx = node1.centerX - node2.centerX
            const dy = node1.centerY - node2.centerY
            const distance = Math.sqrt(dx * dx + dy * dy) || 1
            const force = k * k / distance
            
            forces.get(id1).x += (dx / distance) * force
            forces.get(id1).y += (dy / distance) * force
          }
        }
      }
      
      // Attractive forces for connected nodes
      for (const [edgeId, edge] of this.edges) {
        const fromId = edge.fromNode.nodeId
        const toId = edge.toNode.nodeId
        const dx = edge.toNode.centerX - edge.fromNode.centerX
        const dy = edge.toNode.centerY - edge.fromNode.centerY
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        const force = distance * distance / k
        
        forces.get(fromId).x += (dx / distance) * force
        forces.get(fromId).y += (dy / distance) * force
        forces.get(toId).x -= (dx / distance) * force
        forces.get(toId).y -= (dy / distance) * force
      }
      
      // Apply forces
      for (const [id, node] of this.nodes) {
        const force = forces.get(id)
        const displacement = Math.sqrt(force.x * force.x + force.y * force.y) || 1
        const maxDisplacement = Math.min(displacement, k)
        
        node.centerX += (force.x / displacement) * maxDisplacement
        node.centerY += (force.y / displacement) * maxDisplacement
        
        // Keep nodes within bounds
        node.centerX = Math.max(this.options.padding, Math.min(this.engine.width - this.options.padding, node.centerX))
        node.centerY = Math.max(this.options.padding, Math.min(this.engine.height - this.options.padding, node.centerY))
        
        node.x = node.centerX - node.radius
        node.y = node.centerY - node.radius
      }
    }
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
      { color: '#6b7280', label: 'Unvisited' },
      { color: '#fbbf24', label: 'Frontier' },
      { color: '#10b981', label: 'Visited' },
      { color: '#ef4444', label: 'Current' },
      { color: '#3b82f6', label: 'Path' }
    ]
    
    legendItems.forEach((item, index) => {
      const x = 20 + index * 90
      
      // Draw color circle
      ctx.fillStyle = item.color
      ctx.beginPath()
      ctx.arc(x + 7, legendY + 7, 7, 0, 2 * Math.PI)
      ctx.fill()
      
      // Draw label
      ctx.fillStyle = '#374151'
      ctx.font = '12px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(item.label, x + 20, legendY + 12)
    })
  }
  
  executeStep(step) {
    const { type, nodeId, nodeIds = [], edgeId, path = [], message } = step
    
    switch (type) {
      case 'visit':
        this.visitNode(nodeId)
        break
        
      case 'current':
        this.setCurrentNode(nodeId)
        break
        
      case 'frontier':
        this.addToFrontier(nodeIds)
        break
        
      case 'highlight_edge':
        this.highlightEdge(edgeId)
        break
        
      case 'highlight_path':
        this.highlightPath(path)
        break
        
      case 'reset':
        this.resetAll()
        break
    }
    
    if (message && this.engine) {
      this.currentMessage = message
    }
  }
  
  // API methods for algorithm plugins
  visitNode(nodeId) {
    const node = this.nodes.get(nodeId)
    if (node) {
      node.setState('visited')
      this.engine.render()
    }
  }
  
  setCurrentNode(nodeId) {
    // Reset current state
    this.nodes.forEach(node => {
      if (node.state === 'current') {
        node.setState('default')
      }
    })
    
    const node = this.nodes.get(nodeId)
    if (node) {
      node.setState('current')
      this.engine.render()
    }
  }
  
  addToFrontier(nodeIds) {
    nodeIds.forEach(nodeId => {
      const node = this.nodes.get(nodeId)
      if (node && node.state !== 'visited') {
        node.setState('frontier')
      }
    })
    this.engine.render()
  }
  
  highlightNode(nodeId, state = 'visiting') {
    const node = this.nodes.get(nodeId)
    if (node) {
      node.setState(state)
      this.engine.render()
    }
  }
  
  highlightEdge(fromId, toId, state = 'active') {
    const edgeId = `edge_${fromId}_${toId}`
    const edge = this.edges.get(edgeId)
    if (edge) {
      edge.setState(state)
      this.engine.render()
    }
  }
  
  highlightPath(path) {
    // Reset all elements
    this.resetAll()
    
    // Highlight path nodes
    path.forEach(nodeId => {
      const node = this.nodes.get(nodeId)
      if (node) {
        node.setState('path')
      }
    })
    
    // Highlight path edges
    for (let i = 0; i < path.length - 1; i++) {
      this.highlightEdge(path[i], path[i + 1], 'path')
    }
    
    this.engine.render()
  }
  
  resetAll() {
    this.nodes.forEach(node => node.setState('default'))
    this.edges.forEach(edge => edge.setState('default'))
    this.engine.render()
  }
  
  // Graph algorithms support
  getNeighbors(nodeId) {
    return Array.from(this.adjacencyList.get(nodeId) || [])
  }
  
  getEdgeWeight(fromId, toId) {
    const edgeId = `edge_${fromId}_${toId}`
    const edge = this.edges.get(edgeId)
    return edge ? edge.weight : null
  }
  
  // Animation helpers
  async animateTraversal(order, delay = 500) {
    for (const nodeId of order) {
      this.setCurrentNode(nodeId)
      await new Promise(resolve => setTimeout(resolve, delay))
      this.visitNode(nodeId)
    }
  }
  
  async animatePathfinding(path, delay = 300) {
    for (let i = 0; i < path.length; i++) {
      this.highlightNode(path[i], 'path')
      if (i > 0) {
        this.highlightEdge(path[i - 1], path[i], 'path')
      }
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  // Resize handling
  resize() {
    this.setupLayout()
  }
}

