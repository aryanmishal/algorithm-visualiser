/**
 * Base Visual Element Class
 * All visual elements inherit from this class
 */

export class BaseElement {
  constructor(x = 0, y = 0, options = {}) {
    this.x = x
    this.y = y
    this.width = options.width || 50
    this.height = options.height || 50
    this.visible = options.visible !== false
    this.interactive = options.interactive !== false
    
    // Visual properties
    this.fillColor = options.fillColor || '#e5e7eb'
    this.strokeColor = options.strokeColor || '#374151'
    this.lineWidth = options.lineWidth || 1
    this.opacity = options.opacity || 1
    
    // Animation properties
    this.targetX = x
    this.targetY = y
    this.animating = false
    
    // State
    this.state = options.state || 'default'
    this.data = options.data || null
    
    // References
    this.id = null
    this.engine = null
  }
  
  // Core rendering method (to be overridden)
  render(ctx) {
    if (!this.visible) return
    
    ctx.save()
    ctx.globalAlpha = this.opacity
    
    // Default rendering (rectangle)
    if (this.fillColor) {
      ctx.fillStyle = this.fillColor
      ctx.fillRect(this.x, this.y, this.width, this.height)
    }
    
    if (this.strokeColor) {
      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = this.lineWidth
      ctx.strokeRect(this.x, this.y, this.width, this.height)
    }
    
    ctx.restore()
  }
  
  // Hit testing
  containsPoint(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height
  }
  
  // Position methods
  setPosition(x, y) {
    this.x = x
    this.y = y
  }
  
  moveTo(x, y, animated = false) {
    if (animated && this.engine) {
      return this.engine.animate(this, { x, y })
    } else {
      this.x = x
      this.y = y
    }
  }
  
  // State management
  setState(state) {
    this.state = state
    this.updateVisualState()
  }
  
  updateVisualState() {
    // Override in subclasses to handle state changes
  }
  
  // Animation helpers
  fadeIn(duration = 300) {
    if (this.engine) {
      this.opacity = 0
      return this.engine.animate(this, { opacity: 1 }, duration)
    }
  }
  
  fadeOut(duration = 300) {
    if (this.engine) {
      return this.engine.animate(this, { opacity: 0 }, duration)
    }
  }
  
  highlight(color = '#fbbf24', duration = 300) {
    const originalColor = this.fillColor
    this.fillColor = color
    if (this.engine) {
      this.engine.render()
      setTimeout(() => {
        this.fillColor = originalColor
        this.engine.render()
      }, duration)
    }
  }
  
  // Utility methods
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      right: this.x + this.width,
      bottom: this.y + this.height,
      centerX: this.x + this.width / 2,
      centerY: this.y + this.height / 2
    }
  }
  
  getCenter() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    }
  }
  
  // Cleanup
  destroy() {
    if (this.engine) {
      this.engine.removeElement(this.id)
    }
  }
}

