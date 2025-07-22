/**
 * Node Element Class
 * Represents nodes in tree and graph visualizations
 */

import { BaseElement } from './BaseElement.js'

export class NodeElement extends BaseElement {
  constructor(value, x, y, options = {}) {
    const radius = options.radius || 25
    super(x - radius, y - radius, {
      ...options,
      width: radius * 2,
      height: radius * 2
    })
    
    this.value = value
    this.radius = radius
    this.centerX = x
    this.centerY = y
    
    // Node-specific properties
    this.shape = options.shape || 'circle' // 'circle', 'square', 'diamond'
    this.textColor = options.textColor || '#ffffff'
    this.font = options.font || 'bold 14px Arial'
    
    // Tree/Graph properties
    this.children = []
    this.parent = null
    this.edges = new Set()
    this.level = options.level || 0
    
    // State colors
    this.stateColors = {
      default: '#6b7280',
      visited: '#10b981',
      visiting: '#fbbf24',
      current: '#ef4444',
      path: '#3b82f6',
      start: '#059669',
      end: '#dc2626',
      blocked: '#374151',
      ...options.stateColors
    }
    
    this.updateVisualState()
  }
  
  updateVisualState() {
    if (this.stateColors[this.state]) {
      this.fillColor = this.stateColors[this.state]
    }
  }
  
  render(ctx) {
    if (!this.visible) return
    
    ctx.save()
    ctx.globalAlpha = this.opacity
    
    // Draw node shape
    if (this.shape === 'circle') {
      this.renderCircle(ctx)
    } else if (this.shape === 'square') {
      this.renderSquare(ctx)
    } else if (this.shape === 'diamond') {
      this.renderDiamond(ctx)
    }
    
    // Draw value text
    ctx.fillStyle = this.textColor
    ctx.font = this.font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      this.value.toString(),
      this.centerX,
      this.centerY
    )
    
    ctx.restore()
  }
  
  renderCircle(ctx) {
    ctx.beginPath()
    ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI)
    
    if (this.fillColor) {
      ctx.fillStyle = this.fillColor
      ctx.fill()
    }
    
    if (this.strokeColor) {
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = this.lineWidth
      ctx.stroke()
    }
  }
  
  renderSquare(ctx) {
    const halfSize = this.radius * 0.8
    const x = this.centerX - halfSize
    const y = this.centerY - halfSize
    const size = halfSize * 2
    
    if (this.fillColor) {
      ctx.fillStyle = this.fillColor
      ctx.fillRect(x, y, size, size)
    }
    
    if (this.strokeColor) {
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = this.lineWidth
      ctx.strokeRect(x, y, size, size)
    }
  }
  
  renderDiamond(ctx) {
    const size = this.radius * 0.8
    
    ctx.beginPath()
    ctx.moveTo(this.centerX, this.centerY - size)
    ctx.lineTo(this.centerX + size, this.centerY)
    ctx.lineTo(this.centerX, this.centerY + size)
    ctx.lineTo(this.centerX - size, this.centerY)
    ctx.closePath()
    
    if (this.fillColor) {
      ctx.fillStyle = this.fillColor
      ctx.fill()
    }
    
    if (this.strokeColor) {
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = this.lineWidth
      ctx.stroke()
    }
  }
  
  // Position methods
  setCenter(x, y) {
    this.centerX = x
    this.centerY = y
    this.x = x - this.radius
    this.y = y - this.radius
  }
  
  moveCenter(x, y, animated = false) {
    if (animated && this.engine) {
      return this.engine.animate(this, {
        centerX: x,
        centerY: y,
        x: x - this.radius,
        y: y - this.radius
      })
    } else {
      this.setCenter(x, y)
    }
  }
  
  // Tree/Graph methods
  addChild(childNode) {
    if (!this.children.includes(childNode)) {
      this.children.push(childNode)
      childNode.parent = this
    }
  }
  
  removeChild(childNode) {
    const index = this.children.indexOf(childNode)
    if (index > -1) {
      this.children.splice(index, 1)
      childNode.parent = null
    }
  }
  
  addEdge(edge) {
    this.edges.add(edge)
  }
  
  removeEdge(edge) {
    this.edges.delete(edge)
  }
  
  // Hit testing for circular nodes
  containsPoint(x, y) {
    if (this.shape === 'circle') {
      const dx = x - this.centerX
      const dy = y - this.centerY
      return dx * dx + dy * dy <= this.radius * this.radius
    } else {
      // Use bounding box for other shapes
      return super.containsPoint(x, y)
    }
  }
  
  getBounds() {
    return {
      x: this.centerX - this.radius,
      y: this.centerY - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
      right: this.centerX + this.radius,
      bottom: this.centerY + this.radius,
      centerX: this.centerX,
      centerY: this.centerY
    }
  }
  
  getCenter() {
    return {
      x: this.centerX,
      y: this.centerY
    }
  }
  
  // Distance calculation
  distanceTo(otherNode) {
    const dx = this.centerX - otherNode.centerX
    const dy = this.centerY - otherNode.centerY
    return Math.sqrt(dx * dx + dy * dy)
  }
  
  // Animation helpers
  pulse(scale = 1.2, duration = 300) {
    if (this.engine) {
      const originalRadius = this.radius
      return this.engine.animate(this, { radius: originalRadius * scale }, duration / 2)
        .then(() => this.engine.animate(this, { radius: originalRadius }, duration / 2))
    }
  }
}

