/**
 * Edge Element Class
 * Represents connections between nodes in tree and graph visualizations
 */

import { BaseElement } from './BaseElement.js'

export class EdgeElement extends BaseElement {
  constructor(fromNode, toNode, options = {}) {
    super(0, 0, options)
    
    this.fromNode = fromNode
    this.toNode = toNode
    this.weight = options.weight || null
    this.directed = options.directed || false
    
    // Visual properties
    this.color = options.color || '#6b7280'
    this.lineWidth = options.lineWidth || 2
    this.arrowSize = options.arrowSize || 10
    this.showWeight = options.showWeight && this.weight !== null
    this.weightFont = options.weightFont || '12px Arial'
    this.weightColor = options.weightColor || '#374151'
    
    // Edge styles
    this.style = options.style || 'solid' // 'solid', 'dashed', 'dotted'
    this.curve = options.curve || 0 // Curve amount for curved edges
    
    // State colors
    this.stateColors = {
      default: '#6b7280',
      active: '#ef4444',
      visited: '#10b981',
      path: '#3b82f6',
      highlighted: '#fbbf24',
      ...options.stateColors
    }
    
    // Register edge with nodes
    if (this.fromNode) this.fromNode.addEdge(this)
    if (this.toNode) this.toNode.addEdge(this)
    
    this.updateVisualState()
  }
  
  updateVisualState() {
    if (this.stateColors[this.state]) {
      this.color = this.stateColors[this.state]
    }
  }
  
  render(ctx) {
    if (!this.visible || !this.fromNode || !this.toNode) return
    
    ctx.save()
    ctx.globalAlpha = this.opacity
    
    const from = this.fromNode.getCenter()
    const to = this.toNode.getCenter()
    
    // Calculate edge endpoints (accounting for node radius)
    const angle = Math.atan2(to.y - from.y, to.x - from.x)
    const fromRadius = this.fromNode.radius || 0
    const toRadius = this.toNode.radius || 0
    
    const startX = from.x + Math.cos(angle) * fromRadius
    const startY = from.y + Math.sin(angle) * fromRadius
    const endX = to.x - Math.cos(angle) * toRadius
    const endY = to.y - Math.sin(angle) * toRadius
    
    // Set line style
    ctx.strokeStyle = this.color
    ctx.lineWidth = this.lineWidth
    
    if (this.style === 'dashed') {
      ctx.setLineDash([5, 5])
    } else if (this.style === 'dotted') {
      ctx.setLineDash([2, 3])
    } else {
      ctx.setLineDash([])
    }
    
    // Draw edge
    if (this.curve === 0) {
      this.drawStraightEdge(ctx, startX, startY, endX, endY)
    } else {
      this.drawCurvedEdge(ctx, startX, startY, endX, endY)
    }
    
    // Draw arrow for directed edges
    if (this.directed) {
      this.drawArrow(ctx, endX, endY, angle)
    }
    
    // Draw weight label
    if (this.showWeight) {
      this.drawWeight(ctx, startX, startY, endX, endY)
    }
    
    ctx.restore()
  }
  
  drawStraightEdge(ctx, startX, startY, endX, endY) {
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()
  }
  
  drawCurvedEdge(ctx, startX, startY, endX, endY) {
    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2
    
    // Calculate perpendicular offset for curve
    const dx = endX - startX
    const dy = endY - startY
    const length = Math.sqrt(dx * dx + dy * dy)
    const perpX = -dy / length * this.curve
    const perpY = dx / length * this.curve
    
    const controlX = midX + perpX
    const controlY = midY + perpY
    
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.quadraticCurveTo(controlX, controlY, endX, endY)
    ctx.stroke()
  }
  
  drawArrow(ctx, x, y, angle) {
    const arrowAngle = Math.PI / 6 // 30 degrees
    
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(
      x - this.arrowSize * Math.cos(angle - arrowAngle),
      y - this.arrowSize * Math.sin(angle - arrowAngle)
    )
    ctx.moveTo(x, y)
    ctx.lineTo(
      x - this.arrowSize * Math.cos(angle + arrowAngle),
      y - this.arrowSize * Math.sin(angle + arrowAngle)
    )
    ctx.stroke()
  }
  
  drawWeight(ctx, startX, startY, endX, endY) {
    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2
    
    // Draw background circle for weight
    const textMetrics = ctx.measureText(this.weight.toString())
    const textWidth = textMetrics.width
    const padding = 4
    const bgRadius = Math.max(textWidth / 2 + padding, 12)
    
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(midX, midY, bgRadius, 0, 2 * Math.PI)
    ctx.fill()
    
    ctx.strokeStyle = this.color
    ctx.lineWidth = 1
    ctx.stroke()
    
    // Draw weight text
    ctx.fillStyle = this.weightColor
    ctx.font = this.weightFont
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.weight.toString(), midX, midY)
  }
  
  // Utility methods
  getLength() {
    if (!this.fromNode || !this.toNode) return 0
    return this.fromNode.distanceTo(this.toNode)
  }
  
  getMidpoint() {
    if (!this.fromNode || !this.toNode) return { x: 0, y: 0 }
    
    const from = this.fromNode.getCenter()
    const to = this.toNode.getCenter()
    
    return {
      x: (from.x + to.x) / 2,
      y: (from.y + to.y) / 2
    }
  }
  
  // Hit testing for edges
  containsPoint(x, y) {
    if (!this.fromNode || !this.toNode) return false
    
    const from = this.fromNode.getCenter()
    const to = this.toNode.getCenter()
    
    // Calculate distance from point to line segment
    const A = x - from.x
    const B = y - from.y
    const C = to.x - from.x
    const D = to.y - from.y
    
    const dot = A * C + B * D
    const lenSq = C * C + D * D
    
    if (lenSq === 0) return false
    
    const param = dot / lenSq
    
    let xx, yy
    if (param < 0) {
      xx = from.x
      yy = from.y
    } else if (param > 1) {
      xx = to.x
      yy = to.y
    } else {
      xx = from.x + param * C
      yy = from.y + param * D
    }
    
    const dx = x - xx
    const dy = y - yy
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    return distance <= this.lineWidth + 5 // 5px tolerance
  }
  
  // Animation helpers
  animateFlow(duration = 1000) {
    if (!this.engine) return
    
    // Create a flowing dot animation
    const dot = {
      x: this.fromNode.centerX,
      y: this.fromNode.centerY,
      radius: 3,
      color: '#fbbf24'
    }
    
    return this.engine.animate(dot, {
      x: this.toNode.centerX,
      y: this.toNode.centerY
    }, duration)
  }
  
  // Cleanup
  destroy() {
    if (this.fromNode) this.fromNode.removeEdge(this)
    if (this.toNode) this.toNode.removeEdge(this)
    super.destroy()
  }
}

