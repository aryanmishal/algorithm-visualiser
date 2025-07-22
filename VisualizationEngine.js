/**
 * Core Visualization Engine
 * Handles rendering, animation, and state management for all visualization types
 */

export class VisualizationEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.width = canvas.width
    this.height = canvas.height
    
    // Configuration
    this.config = {
      animationDuration: 300,
      backgroundColor: '#ffffff',
      padding: 20,
      ...options
    }
    
    // State management
    this.currentVisualization = null
    this.animationQueue = []
    this.isAnimating = false
    this.currentStep = 0
    this.steps = []
    
    // Visual elements registry
    this.elements = new Map()
    this.elementTypes = new Map()
    
    // Event callbacks
    this.callbacks = {
      onStepChange: null,
      onAnimationComplete: null,
      onElementClick: null
    }
    
    this.init()
  }
  
  init() {
    this.clear()
    this.setupEventListeners()
  }
  
  setupEventListeners() {
    this.canvas.addEventListener('click', (event) => {
      const rect = this.canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      // Find clicked element
      const clickedElement = this.findElementAt(x, y)
      if (clickedElement && this.callbacks.onElementClick) {
        this.callbacks.onElementClick(clickedElement)
      }
    })
  }
  
  // Core rendering methods
  clear() {
    this.ctx.fillStyle = this.config.backgroundColor
    this.ctx.fillRect(0, 0, this.width, this.height)
  }
  
  render() {
    this.clear()
    
    // Render all elements
    for (const [id, element] of this.elements) {
      if (element.visible) {
        element.render(this.ctx)
      }
    }
    
    // Render current visualization if exists
    if (this.currentVisualization) {
      this.currentVisualization.render(this.ctx, this.width, this.height)
    }
  }
  
  // Element management
  addElement(id, element) {
    this.elements.set(id, element)
    element.id = id
    element.engine = this
  }
  
  removeElement(id) {
    this.elements.delete(id)
  }
  
  getElement(id) {
    return this.elements.get(id)
  }
  
  findElementAt(x, y) {
    for (const [id, element] of this.elements) {
      if (element.containsPoint && element.containsPoint(x, y)) {
        return element
      }
    }
    return null
  }
  
  // Animation system
  animate(element, properties, duration = this.config.animationDuration) {
    return new Promise((resolve) => {
      const startTime = Date.now()
      const startValues = {}
      
      // Store initial values
      for (const prop in properties) {
        startValues[prop] = element[prop]
      }
      
      const animateStep = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function (ease-out)
        const easedProgress = 1 - Math.pow(1 - progress, 3)
        
        // Update properties
        for (const prop in properties) {
          const start = startValues[prop]
          const end = properties[prop]
          element[prop] = start + (end - start) * easedProgress
        }
        
        this.render()
        
        if (progress < 1) {
          requestAnimationFrame(animateStep)
        } else {
          resolve()
        }
      }
      
      requestAnimationFrame(animateStep)
    })
  }
  
  // Step management
  setSteps(steps) {
    this.steps = steps
    this.currentStep = 0
  }
  
  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++
      this.executeStep(this.steps[this.currentStep])
      if (this.callbacks.onStepChange) {
        this.callbacks.onStepChange(this.currentStep)
      }
    }
  }
  
  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--
      this.executeStep(this.steps[this.currentStep])
      if (this.callbacks.onStepChange) {
        this.callbacks.onStepChange(this.currentStep)
      }
    }
  }
  
  goToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      this.currentStep = stepIndex
      this.executeStep(this.steps[this.currentStep])
      if (this.callbacks.onStepChange) {
        this.callbacks.onStepChange(this.currentStep)
      }
    }
  }
  
  executeStep(step) {
    if (this.currentVisualization && this.currentVisualization.executeStep) {
      this.currentVisualization.executeStep(step)
    }
    this.render()
  }
  
  // Visualization management
  setVisualization(visualization) {
    this.currentVisualization = visualization
    visualization.engine = this
    if (visualization.init) {
      visualization.init()
    }
  }
  
  // Utility methods
  drawText(text, x, y, options = {}) {
    const {
      font = '14px Arial',
      color = '#000000',
      align = 'left',
      baseline = 'top'
    } = options
    
    this.ctx.font = font
    this.ctx.fillStyle = color
    this.ctx.textAlign = align
    this.ctx.textBaseline = baseline
    this.ctx.fillText(text, x, y)
  }
  
  drawRect(x, y, width, height, options = {}) {
    const {
      fillColor = null,
      strokeColor = null,
      lineWidth = 1
    } = options
    
    if (fillColor) {
      this.ctx.fillStyle = fillColor
      this.ctx.fillRect(x, y, width, height)
    }
    
    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor
      this.ctx.lineWidth = lineWidth
      this.ctx.strokeRect(x, y, width, height)
    }
  }
  
  drawCircle(x, y, radius, options = {}) {
    const {
      fillColor = null,
      strokeColor = null,
      lineWidth = 1
    } = options
    
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI)
    
    if (fillColor) {
      this.ctx.fillStyle = fillColor
      this.ctx.fill()
    }
    
    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor
      this.ctx.lineWidth = lineWidth
      this.ctx.stroke()
    }
  }
  
  drawLine(x1, y1, x2, y2, options = {}) {
    const {
      color = '#000000',
      lineWidth = 1,
      lineDash = []
    } = options
    
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = lineWidth
    this.ctx.setLineDash(lineDash)
    this.ctx.stroke()
    this.ctx.setLineDash([]) // Reset line dash
  }
  
  // Event callback setters
  onStepChange(callback) {
    this.callbacks.onStepChange = callback
  }
  
  onAnimationComplete(callback) {
    this.callbacks.onAnimationComplete = callback
  }
  
  onElementClick(callback) {
    this.callbacks.onElementClick = callback
  }
  
  // Resize handling
  resize(width, height) {
    this.width = width
    this.height = height
    this.canvas.width = width
    this.canvas.height = height
    this.render()
  }
}

