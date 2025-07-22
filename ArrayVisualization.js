/**
 * Array Visualization Class
 * Handles visualization of array-based algorithms (sorting, searching)
 */

import { ArrayElement } from '../elements/ArrayElement.js'

export class ArrayVisualization {
  constructor(options = {}) {
    this.options = {
      padding: 20,
      barSpacing: 5,
      minBarWidth: 20,
      maxBarWidth: 80,
      minBarHeight: 20,
      maxBarHeight: 200,
      showValues: true,
      showIndices: true,
      ...options
    }
    
    this.engine = null
    this.elements = []
    this.data = []
    this.title = options.title || 'Array Visualization'
  }
  
  init() {
    if (!this.engine) return
    this.setupLayout()
  }
  
  setData(data) {
    this.data = [...data]
    this.createElements()
    this.setupLayout()
  }
  
  createElements() {
    if (!this.engine) return
    
    // Clear existing elements
    this.elements.forEach(element => element.destroy())
    this.elements = []
    
    const maxValue = Math.max(...this.data)
    const barWidth = this.calculateBarWidth()
    
    this.data.forEach((value, index) => {
      const element = new ArrayElement(value, index, 0, 0, {
        width: barWidth,
        maxValue: maxValue,
        maxHeight: this.options.maxBarHeight,
        minHeight: this.options.minBarHeight,
        showValue: this.options.showValues,
        showIndex: this.options.showIndices
      })
      
      this.engine.addElement(`array_${index}`, element)
      this.elements.push(element)
    })
  }
  
  calculateBarWidth() {
    if (!this.engine) return this.options.minBarWidth
    
    const availableWidth = this.engine.width - (this.options.padding * 2)
    const totalSpacing = (this.data.length - 1) * this.options.barSpacing
    const barWidth = (availableWidth - totalSpacing) / this.data.length
    
    return Math.max(
      this.options.minBarWidth,
      Math.min(this.options.maxBarWidth, barWidth)
    )
  }
  
  setupLayout() {
    if (!this.engine || this.elements.length === 0) return
    
    const barWidth = this.calculateBarWidth()
    const totalWidth = this.data.length * barWidth + (this.data.length - 1) * this.options.barSpacing
    const startX = (this.engine.width - totalWidth) / 2
    const baseY = this.engine.height - this.options.padding - 40 // Space for indices
    
    this.elements.forEach((element, index) => {
      const x = startX + index * (barWidth + this.options.barSpacing)
      element.setPosition(x, baseY)
      element.width = barWidth
    })
    
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
    const legendY = 50
    const legendItems = [
      { color: '#fbbf24', label: 'Comparing' },
      { color: '#ef4444', label: 'Swapping' },
      { color: '#10b981', label: 'Completed' },
      { color: '#e5e7eb', label: 'Unsorted' }
    ]
    
    legendItems.forEach((item, index) => {
      const x = 20 + index * 100
      
      // Draw color box
      ctx.fillStyle = item.color
      ctx.fillRect(x, legendY, 15, 15)
      ctx.strokeStyle = '#374151'
      ctx.strokeRect(x, legendY, 15, 15)
      
      // Draw label
      ctx.fillStyle = '#374151'
      ctx.font = '12px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(item.label, x + 20, legendY + 12)
    })
  }
  
  executeStep(step) {
    const { type, indices = [], message } = step
    
    // Reset all elements to default state
    this.elements.forEach(element => element.setState('default'))
    
    // Apply step-specific states
    switch (type) {
      case 'compare':
        indices.forEach(index => {
          if (this.elements[index]) {
            this.elements[index].setState('comparing')
          }
        })
        break
        
      case 'swap':
        indices.forEach(index => {
          if (this.elements[index]) {
            this.elements[index].setState('swapping')
          }
        })
        // Update data and element values
        if (indices.length === 2 && step.array) {
          this.updateFromArray(step.array)
        }
        break
        
      case 'pass_complete':
      case 'completed':
        indices.forEach(index => {
          if (this.elements[index]) {
            this.elements[index].setState('completed')
          }
        })
        break
        
      case 'new_min':
        indices.forEach(index => {
          if (this.elements[index]) {
            this.elements[index].setState('minimum')
          }
        })
        break
        
      case 'pass_start':
      case 'current':
        indices.forEach(index => {
          if (this.elements[index]) {
            this.elements[index].setState('current')
          }
        })
        break
    }
    
    // Update message if provided
    if (message && this.engine) {
      this.currentMessage = message
    }
  }
  
  updateFromArray(newArray) {
    this.data = [...newArray]
    this.elements.forEach((element, index) => {
      if (newArray[index] !== undefined) {
        element.setValue(newArray[index])
      }
    })
  }
  
  // Animation methods
  async animateSwap(index1, index2) {
    if (this.elements[index1] && this.elements[index2]) {
      await this.elements[index1].swap(this.elements[index2], true)
    }
  }
  
  async animateComparison(index1, index2, duration = 300) {
    if (this.elements[index1] && this.elements[index2]) {
      this.elements[index1].setState('comparing')
      this.elements[index2].setState('comparing')
      this.engine.render()
      
      return new Promise(resolve => {
        setTimeout(() => {
          this.elements[index1].setState('default')
          this.elements[index2].setState('default')
          this.engine.render()
          resolve()
        }, duration)
      })
    }
  }
  
  // API methods for algorithm plugins
  highlightElement(index, state = 'current') {
    if (this.elements[index]) {
      this.elements[index].setState(state)
      this.engine.render()
    }
  }
  
  swap(index1, index2, animated = true) {
    if (this.elements[index1] && this.elements[index2]) {
      // Swap in data array
      [this.data[index1], this.data[index2]] = [this.data[index2], this.data[index1]]
      
      // Swap element values
      const temp = this.elements[index1].value
      this.elements[index1].setValue(this.elements[index2].value)
      this.elements[index2].setValue(temp)
      
      if (animated) {
        return this.animateSwap(index1, index2)
      } else {
        this.engine.render()
        return Promise.resolve()
      }
    }
  }
  
  compare(index1, index2, animated = true) {
    if (animated) {
      return this.animateComparison(index1, index2)
    } else {
      return this.data[index1] - this.data[index2]
    }
  }
  
  markCompleted(index) {
    this.highlightElement(index, 'completed')
  }
  
  reset() {
    this.elements.forEach(element => element.setState('default'))
    this.engine.render()
  }
  
  // Resize handling
  resize() {
    this.setupLayout()
  }
}

