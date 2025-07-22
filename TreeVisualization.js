/**
 * Tree Visualization Class
 * Handles visualization of tree-based algorithms (traversals, BST operations)
 */

import { NodeElement } from '../elements/NodeElement.js'
import { EdgeElement } from '../elements/EdgeElement.js'

export class TreeVisualization {
  constructor(options = {}) {
    this.options = {
      nodeRadius: 25,
      levelHeight: 80,
      nodeSpacing: 60,
      padding: 40,
      showEdges: true,
      ...options
    }
    
    this.engine = null
    this.nodes = new Map()
    this.edges = new Map()
    this.root = null
    this.title = options.title || 'Tree Visualization'
  }
  
  init() {
    if (!this.engine) return
    this.setupLayout()
  }
  
  setTree(treeData) {
    this.clearTree()
    this.buildTree(treeData)
    this.setupLayout()
  }
  
  clearTree() {
    // Clear existing nodes and edges
    this.nodes.forEach(node => node.destroy())
    this.edges.forEach(edge => edge.destroy())
    this.nodes.clear()
    this.edges.clear()
    this.root = null
  }
  
  buildTree(treeData) {
    if (!this.engine || !treeData) return
    
    // Build tree from data structure
    this.root = this.createNode(treeData)
    this.buildSubtree(treeData, this.root)
  }
  
  createNode(nodeData) {
    const node = new NodeElement(nodeData.value, 0, 0, {
      radius: this.options.nodeRadius,
      level: nodeData.level || 0
    })
    
    const nodeId = `node_${nodeData.value}_${Date.now()}_${Math.random()}`
    this.engine.addElement(nodeId, node)
    this.nodes.set(nodeId, node)
    node.nodeId = nodeId
    
    return node
  }
  
  buildSubtree(nodeData, parentNode) {
    if (!nodeData.children) return
    
    nodeData.children.forEach(childData => {
      const childNode = this.createNode({
        ...childData,
        level: (nodeData.level || 0) + 1
      })
      
      parentNode.addChild(childNode)
      
      // Create edge
      if (this.options.showEdges) {
        const edge = new EdgeElement(parentNode, childNode)
        const edgeId = `edge_${parentNode.nodeId}_${childNode.nodeId}`
        this.engine.addElement(edgeId, edge)
        this.edges.set(edgeId, edge)
      }
      
      // Recursively build subtree
      this.buildSubtree(childData, childNode)
    })
  }
  
  setupLayout() {
    if (!this.engine || !this.root) return
    
    // Calculate tree dimensions
    const levels = this.calculateLevels()
    const maxWidth = this.calculateMaxWidth()
    
    // Position nodes using level-order layout
    this.positionNodes(levels, maxWidth)
    this.engine.render()
  }
  
  calculateLevels() {
    const levels = new Map()
    
    const traverse = (node, level) => {
      if (!levels.has(level)) {
        levels.set(level, [])
      }
      levels.get(level).push(node)
      
      node.children.forEach(child => traverse(child, level + 1))
    }
    
    if (this.root) {
      traverse(this.root, 0)
    }
    
    return levels
  }
  
  calculateMaxWidth() {
    const levels = this.calculateLevels()
    let maxWidth = 0
    
    for (const [level, nodes] of levels) {
      const width = nodes.length * (this.options.nodeRadius * 2 + this.options.nodeSpacing)
      maxWidth = Math.max(maxWidth, width)
    }
    
    return maxWidth
  }
  
  positionNodes(levels, maxWidth) {
    const centerX = this.engine.width / 2
    const startY = this.options.padding + this.options.nodeRadius
    
    for (const [level, nodes] of levels) {
      const levelWidth = nodes.length * (this.options.nodeRadius * 2 + this.options.nodeSpacing)
      const startX = centerX - levelWidth / 2 + this.options.nodeRadius
      const y = startY + level * this.options.levelHeight
      
      nodes.forEach((node, index) => {
        const x = startX + index * (this.options.nodeRadius * 2 + this.options.nodeSpacing)
        node.setCenter(x, y)
      })
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
      { color: '#fbbf24', label: 'Visiting' },
      { color: '#10b981', label: 'Visited' },
      { color: '#ef4444', label: 'Current' }
    ]
    
    legendItems.forEach((item, index) => {
      const x = 20 + index * 100
      
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
    const { type, nodeId, nodeIds = [], message } = step
    
    switch (type) {
      case 'visit':
        this.visitNode(nodeId)
        break
        
      case 'current':
        this.setCurrentNode(nodeId)
        break
        
      case 'highlight':
        this.highlightNodes(nodeIds)
        break
        
      case 'reset':
        this.resetAllNodes()
        break
    }
    
    if (message && this.engine) {
      this.currentMessage = message
    }
  }
  
  // API methods for algorithm plugins
  visitNode(nodeId) {
    const node = this.findNodeByValue(nodeId)
    if (node) {
      node.setState('visited')
      this.engine.render()
    }
  }
  
  setCurrentNode(nodeId) {
    // Reset all nodes first
    this.nodes.forEach(node => {
      if (node.state === 'current') {
        node.setState('default')
      }
    })
    
    const node = this.findNodeByValue(nodeId)
    if (node) {
      node.setState('current')
      this.engine.render()
    }
  }
  
  highlightNode(nodeId, state = 'visiting') {
    const node = this.findNodeByValue(nodeId)
    if (node) {
      node.setState(state)
      this.engine.render()
    }
  }
  
  highlightNodes(nodeIds, state = 'visiting') {
    nodeIds.forEach(nodeId => this.highlightNode(nodeId, state))
  }
  
  highlightPath(path) {
    // Reset all nodes
    this.resetAllNodes()
    
    // Highlight path nodes
    path.forEach(nodeId => {
      const node = this.findNodeByValue(nodeId)
      if (node) {
        node.setState('path')
      }
    })
    
    this.engine.render()
  }
  
  resetAllNodes() {
    this.nodes.forEach(node => node.setState('default'))
    this.engine.render()
  }
  
  findNodeByValue(value) {
    for (const node of this.nodes.values()) {
      if (node.value === value) {
        return node
      }
    }
    return null
  }
  
  findNodeById(nodeId) {
    return this.nodes.get(nodeId)
  }
  
  // Tree traversal animations
  async animateTraversal(traversalOrder, delay = 500) {
    for (const nodeValue of traversalOrder) {
      this.setCurrentNode(nodeValue)
      await new Promise(resolve => setTimeout(resolve, delay))
      this.visitNode(nodeValue)
    }
  }
  
  // Tree operations
  insertNode(value, parentValue = null) {
    const parentNode = parentValue ? this.findNodeByValue(parentValue) : this.root
    
    if (!parentNode && this.root) return false
    
    const newNode = new NodeElement(value, 0, 0, {
      radius: this.options.nodeRadius
    })
    
    const nodeId = `node_${value}_${Date.now()}_${Math.random()}`
    this.engine.addElement(nodeId, newNode)
    this.nodes.set(nodeId, newNode)
    newNode.nodeId = nodeId
    
    if (parentNode) {
      parentNode.addChild(newNode)
      
      // Create edge
      if (this.options.showEdges) {
        const edge = new EdgeElement(parentNode, newNode)
        const edgeId = `edge_${parentNode.nodeId}_${newNode.nodeId}`
        this.engine.addElement(edgeId, edge)
        this.edges.set(edgeId, edge)
      }
    } else {
      this.root = newNode
    }
    
    this.setupLayout()
    return true
  }
  
  deleteNode(value) {
    const node = this.findNodeByValue(value)
    if (!node) return false
    
    // Remove edges
    node.edges.forEach(edge => {
      edge.destroy()
      this.edges.delete(edge.id)
    })
    
    // Remove node
    node.destroy()
    this.nodes.delete(node.nodeId)
    
    this.setupLayout()
    return true
  }
  
  // Resize handling
  resize() {
    this.setupLayout()
  }
}

