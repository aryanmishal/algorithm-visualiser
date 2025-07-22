/**
 * Algorithm Plugin Base Class
 * Provides interface for pluggable algorithm implementations
 */

export class AlgorithmPlugin {
  constructor(name, category, options = {}) {
    this.name = name
    this.category = category
    this.description = options.description || ''
    this.timeComplexity = options.timeComplexity || 'O(?)'
    this.spaceComplexity = options.spaceComplexity || 'O(?)'
    this.visualizationType = options.visualizationType || 'array'
    
    // Visualization reference
    this.visualization = null
    this.engine = null
    
    // Execution state
    this.isRunning = false
    this.isPaused = false
    this.currentStep = 0
    this.steps = []
    
    // Configuration
    this.config = {
      animated: true,
      stepDelay: 500,
      ...options.config
    }
  }
  
  // Initialize the algorithm with visualization
  init(visualization, engine) {
    this.visualization = visualization
    this.engine = engine
    this.onInit()
  }
  
  // Override in subclasses for custom initialization
  onInit() {}
  
  // Main execution method - override in subclasses
  async execute(input, options = {}) {
    throw new Error('execute() method must be implemented in subclass')
  }
  
  // Generate steps for visualization - override in subclasses
  generateSteps(input) {
    throw new Error('generateSteps() method must be implemented in subclass')
  }
  
  // Step-by-step execution
  async executeSteps(input, options = {}) {
    this.steps = this.generateSteps(input)
    this.currentStep = 0
    this.isRunning = true
    this.isPaused = false
    
    if (this.visualization) {
      this.visualization.setSteps(this.steps)
    }
    
    for (let i = 0; i < this.steps.length && this.isRunning; i++) {
      if (this.isPaused) {
        await this.waitForResume()
      }
      
      this.currentStep = i
      await this.executeStep(this.steps[i])
      
      if (this.config.animated && this.config.stepDelay > 0) {
        await this.delay(this.config.stepDelay)
      }
    }
    
    this.isRunning = false
    return this.steps
  }
  
  // Execute a single step
  async executeStep(step) {
    if (this.visualization && this.visualization.executeStep) {
      this.visualization.executeStep(step)
    }
    
    // Call custom step handler if defined
    if (this.onStep) {
      await this.onStep(step)
    }
  }
  
  // Control methods
  play() {
    this.isRunning = true
    this.isPaused = false
  }
  
  pause() {
    this.isPaused = true
  }
  
  stop() {
    this.isRunning = false
    this.isPaused = false
    this.currentStep = 0
  }
  
  reset() {
    this.stop()
    if (this.visualization && this.visualization.reset) {
      this.visualization.reset()
    }
  }
  
  // Navigation methods
  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++
      this.executeStep(this.steps[this.currentStep])
    }
  }
  
  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--
      this.executeStep(this.steps[this.currentStep])
    }
  }
  
  goToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      this.currentStep = stepIndex
      this.executeStep(this.steps[this.currentStep])
    }
  }
  
  // Utility methods
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  async waitForResume() {
    return new Promise(resolve => {
      const checkResume = () => {
        if (!this.isPaused || !this.isRunning) {
          resolve()
        } else {
          setTimeout(checkResume, 100)
        }
      }
      checkResume()
    })
  }
  
  // Visualization API methods
  highlightElement(id, state = 'current') {
    if (this.visualization && this.visualization.highlightElement) {
      this.visualization.highlightElement(id, state)
    }
  }
  
  highlightNode(id, state = 'current') {
    if (this.visualization && this.visualization.highlightNode) {
      this.visualization.highlightNode(id, state)
    }
  }
  
  swap(index1, index2, animated = true) {
    if (this.visualization && this.visualization.swap) {
      return this.visualization.swap(index1, index2, animated)
    }
  }
  
  markVisited(row, col) {
    if (this.visualization && this.visualization.visitCell) {
      this.visualization.visitCell(row, col)
    }
  }
  
  markPath(path) {
    if (this.visualization && this.visualization.markPath) {
      this.visualization.markPath(path)
    }
  }
  
  // Configuration methods
  setConfig(config) {
    this.config = { ...this.config, ...config }
  }
  
  getConfig() {
    return { ...this.config }
  }
  
  // Information methods
  getInfo() {
    return {
      name: this.name,
      category: this.category,
      description: this.description,
      timeComplexity: this.timeComplexity,
      spaceComplexity: this.spaceComplexity,
      visualizationType: this.visualizationType
    }
  }
  
  getProgress() {
    return {
      currentStep: this.currentStep,
      totalSteps: this.steps.length,
      percentage: this.steps.length > 0 ? (this.currentStep / this.steps.length) * 100 : 0,
      isRunning: this.isRunning,
      isPaused: this.isPaused
    }
  }
}

