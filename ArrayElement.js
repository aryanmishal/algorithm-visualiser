/**
 * Array Element (Bar) Class
 * Represents individual elements in array visualizations
 */

import { BaseElement } from './BaseElement.js'

export class ArrayElement extends BaseElement {
  constructor(value, index, x, y, options = {}) {
    super(x, y, options)
    
    this.value = value
    this.index = index
    this.maxValue = options.maxValue || 100
    this.minHeight = options.minHeight || 20
    this.maxHeight = options.maxHeight || 200
    
    // Calculate height based on value
    this.updateHeight()
    
    // Array-specific visual properties
    this.showValue = options.showValue !== false
    this.showIndex = options.showIndex !== false
    this.valueFont = options.valueFont || '12px Arial'
    this.indexFont = options.indexFont || '10px Arial'
    this.textColor = options.textColor || '#1f2937'
    
    // State colors
    this.stateColors = {
      default: '#e5e7eb',
      comparing: '#fbbf24',
      swapping: '#ef4444',
      completed: '#10b981',
      current: '#8b5cf6',
      minimum: '#3b82f6',
      visited: '#f59e0b',
      ...options.stateColors
    }
    
    this.updateVisualState()
  }
  
  updateHeight() {
    const ratio = this.value / this.maxValue
    this.height = this.minHeight + (this.maxHeight - this.minHeight) * ratio
  }
  
  setValue(value) {
    this.value = value
    this.updateHeight()
  }
  
  setMaxValue(maxValue) {
    this.maxValue = maxValue
    this.updateHeight()
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
    
    // Calculate position (bars grow upward)
    const barY = this.y - this.height
    
    // Draw bar
    if (this.fillColor) {
      ctx.fillStyle = this.fillColor
      ctx.fillRect(this.x, barY, this.width, this.height)
    }
    
    if (this.strokeColor) {
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = this.lineWidth
      ctx.strokeRect(this.x, barY, this.width, this.height)
    }
    
    // Draw value on top of bar
    if (this.showValue) {
      ctx.fillStyle = this.textColor
      ctx.font = this.valueFont
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(
        this.value.toString(),
        this.x + this.width / 2,
        barY - 5
      )
    }
    
    // Draw index below bar
    if (this.showIndex) {
      ctx.fillStyle = this.textColor
      ctx.font = this.indexFont
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(
        this.index.toString(),
        this.x + this.width / 2,
        this.y + 5
      )
    }
    
    ctx.restore()
  }
  
  // Array-specific methods
  swap(otherElement, animated = true) {
    if (!animated) {
      const tempX = this.x
      this.x = otherElement.x
      otherElement.x = tempX
      return Promise.resolve()
    }
    
    if (this.engine) {
      return Promise.all([
        this.engine.animate(this, { x: otherElement.x }),
        this.engine.animate(otherElement, { x: this.x })
      ])
    }
  }
  
  compare(otherElement) {
    return this.value - otherElement.value
  }
  
  // Override containsPoint to account for upward-growing bars
  containsPoint(x, y) {
    const barY = this.y - this.height
    return x >= this.x && x <= this.x + this.width &&
           y >= barY && y <= this.y
  }
  
  getBounds() {
    const barY = this.y - this.height
    return {
      x: this.x,
      y: barY,
      width: this.width,
      height: this.height,
      right: this.x + this.width,
      bottom: this.y,
      centerX: this.x + this.width / 2,
      centerY: barY + this.height / 2
    }
  }
}

