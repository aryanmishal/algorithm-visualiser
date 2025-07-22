/**
 * Algorithm Registry and Manager
 * Manages all algorithm plugins and provides unified interface
 */

// Import existing algorithms
import { createBFSAlgorithm } from './graph/BFSAlgorithm.js'
import { createDFSAlgorithm } from './graph/DFSAlgorithm.js'
import { createAStarAlgorithm } from './pathfinding/AStarAlgorithm.js'
import { 
  createInorderTraversal, 
  createPreorderTraversal, 
  createPostorderTraversal, 
  createLevelOrderTraversal 
} from './tree/TreeTraversalAlgorithm.js'

// Import visualization types
import { ArrayVisualization } from '../visualization/types/ArrayVisualization.js'
import { TreeVisualization } from '../visualization/types/TreeVisualization.js'
import { GraphVisualization } from '../visualization/types/GraphVisualization.js'
import { GridVisualization } from '../visualization/types/GridVisualization.js'

export class AlgorithmRegistry {
  constructor() {
    this.algorithms = new Map()
    this.categories = new Map()
    this.visualizations = new Map()
    
    this.initializeBuiltInAlgorithms()
    this.initializeVisualizations()
  }
  
  initializeBuiltInAlgorithms() {
    // Graph algorithms
    this.register('bfs', createBFSAlgorithm())
    this.register('dfs', createDFSAlgorithm())
    
    // Pathfinding algorithms
    this.register('astar', createAStarAlgorithm())
    
    // Tree algorithms
    this.register('inorder', createInorderTraversal())
    this.register('preorder', createPreorderTraversal())
    this.register('postorder', createPostorderTraversal())
    this.register('levelorder', createLevelOrderTraversal())
    
    // Legacy sorting algorithms (converted to new system)
    this.registerLegacySortingAlgorithms()
  }
  
  initializeVisualizations() {
    this.visualizations.set('array', ArrayVisualization)
    this.visualizations.set('tree', TreeVisualization)
    this.visualizations.set('graph', GraphVisualization)
    this.visualizations.set('grid', GridVisualization)
  }
  
  registerLegacySortingAlgorithms() {
    // Convert existing sorting algorithms to new plugin system
    const bubbleSort = {
      name: 'Bubble Sort',
      category: 'Sorting Algorithms',
      description: 'Compares adjacent elements and swaps them if in wrong order',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      visualizationType: 'array',
      execute: this.bubbleSortExecution.bind(this),
      generateSteps: this.bubbleSortSteps.bind(this)
    }
    
    const selectionSort = {
      name: 'Selection Sort',
      category: 'Sorting Algorithms',
      description: 'Finds minimum element and places it at the beginning',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      visualizationType: 'array',
      execute: this.selectionSortExecution.bind(this),
      generateSteps: this.selectionSortSteps.bind(this)
    }
    
    this.algorithms.set('bubble_sort', bubbleSort)
    this.algorithms.set('selection_sort', selectionSort)
  }
  
  // Legacy bubble sort implementation
  bubbleSortSteps(arr) {
    const steps = []
    const n = arr.length
    const arrCopy = [...arr]
    
    for (let i = 0; i < n; i++) {
      let swapped = false
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({
          type: 'compare',
          indices: [j, j + 1],
          array: [...arrCopy],
          message: `Comparing elements at indices ${j} and ${j + 1}`
        })
        
        if (arrCopy[j] > arrCopy[j + 1]) {
          [arrCopy[j], arrCopy[j + 1]] = [arrCopy[j + 1], arrCopy[j]]
          swapped = true
          steps.push({
            type: 'swap',
            indices: [j, j + 1],
            array: [...arrCopy],
            message: `Swapped elements at indices ${j} and ${j + 1}`
          })
        }
      }
      
      steps.push({
        type: 'pass_complete',
        indices: [n - i - 1],
        array: [...arrCopy],
        message: `Pass ${i + 1} complete. Element at index ${n - i - 1} is in final position`
      })
      
      if (!swapped) break
    }
    
    return steps
  }
  
  bubbleSortExecution(input) {
    return this.bubbleSortSteps(input.array || input)
  }
  
  // Legacy selection sort implementation
  selectionSortSteps(arr) {
    const steps = []
    const n = arr.length
    const arrCopy = [...arr]
    
    for (let i = 0; i < n - 1; i++) {
      steps.push({
        type: 'pass_start',
        indices: [i],
        array: [...arrCopy],
        message: `Starting pass ${i + 1}, looking for minimum from index ${i}`
      })
      
      let minIndex = i
      
      for (let j = i + 1; j < n; j++) {
        steps.push({
          type: 'compare',
          indices: [j, minIndex],
          array: [...arrCopy],
          message: `Comparing element at index ${j} with current minimum at index ${minIndex}`
        })
        
        if (arrCopy[j] < arrCopy[minIndex]) {
          minIndex = j
          steps.push({
            type: 'new_min',
            indices: [minIndex],
            array: [...arrCopy],
            message: `New minimum found at index ${minIndex}`
          })
        }
      }
      
      if (minIndex !== i) {
        [arrCopy[i], arrCopy[minIndex]] = [arrCopy[minIndex], arrCopy[i]]
        steps.push({
          type: 'swap',
          indices: [i, minIndex],
          array: [...arrCopy],
          message: `Swapped elements at indices ${i} and ${minIndex}`
        })
      }
      
      steps.push({
        type: 'pass_complete',
        indices: [i],
        array: [...arrCopy],
        message: `Pass ${i + 1} complete. Element at index ${i} is in final position`
      })
    }
    
    return steps
  }
  
  selectionSortExecution(input) {
    return this.selectionSortSteps(input.array || input)
  }
  
  // Registry methods
  register(id, algorithm) {
    this.algorithms.set(id, algorithm)
    
    // Add to category
    const category = algorithm.category || 'Uncategorized'
    if (!this.categories.has(category)) {
      this.categories.set(category, [])
    }
    this.categories.get(category).push({ id, ...algorithm })
  }
  
  unregister(id) {
    const algorithm = this.algorithms.get(id)
    if (algorithm) {
      this.algorithms.delete(id)
      
      // Remove from category
      const category = algorithm.category || 'Uncategorized'
      if (this.categories.has(category)) {
        const algorithms = this.categories.get(category)
        const index = algorithms.findIndex(alg => alg.id === id)
        if (index > -1) {
          algorithms.splice(index, 1)
        }
      }
    }
  }
  
  get(id) {
    return this.algorithms.get(id)
  }
  
  getAll() {
    return Array.from(this.algorithms.entries()).map(([id, algorithm]) => ({
      id,
      ...algorithm
    }))
  }
  
  getByCategory(category) {
    return this.categories.get(category) || []
  }
  
  getCategories() {
    return Array.from(this.categories.keys())
  }
  
  getCategoriesWithAlgorithms() {
    const result = {}
    for (const [category, algorithms] of this.categories) {
      result[category] = algorithms
    }
    return result
  }
  
  // Visualization factory
  createVisualization(type, options = {}) {
    const VisualizationClass = this.visualizations.get(type)
    if (VisualizationClass) {
      return new VisualizationClass(options)
    }
    throw new Error(`Unknown visualization type: ${type}`)
  }
  
  // Algorithm execution
  async executeAlgorithm(algorithmId, input, options = {}) {
    const algorithm = this.get(algorithmId)
    if (!algorithm) {
      throw new Error(`Algorithm not found: ${algorithmId}`)
    }
    
    if (algorithm.execute) {
      return await algorithm.execute(input, options)
    } else if (algorithm.generateSteps) {
      return algorithm.generateSteps(input)
    } else {
      throw new Error(`Algorithm ${algorithmId} has no execution method`)
    }
  }
  
  // Get algorithm info
  getAlgorithmInfo(algorithmId) {
    const algorithm = this.get(algorithmId)
    if (!algorithm) {
      return null
    }
    
    return {
      id: algorithmId,
      name: algorithm.name,
      category: algorithm.category,
      description: algorithm.description,
      timeComplexity: algorithm.timeComplexity,
      spaceComplexity: algorithm.spaceComplexity,
      visualizationType: algorithm.visualizationType
    }
  }
  
  // Search algorithms
  search(query) {
    const results = []
    const lowerQuery = query.toLowerCase()
    
    for (const [id, algorithm] of this.algorithms) {
      if (algorithm.name.toLowerCase().includes(lowerQuery) ||
          algorithm.category.toLowerCase().includes(lowerQuery) ||
          algorithm.description.toLowerCase().includes(lowerQuery)) {
        results.push({ id, ...algorithm })
      }
    }
    
    return results
  }
}

// Create singleton instance
export const algorithmRegistry = new AlgorithmRegistry()

// Export convenience functions
export function registerAlgorithm(id, algorithm) {
  return algorithmRegistry.register(id, algorithm)
}

export function getAlgorithm(id) {
  return algorithmRegistry.get(id)
}

export function getAllAlgorithms() {
  return algorithmRegistry.getAll()
}

export function getAlgorithmsByCategory(category) {
  return algorithmRegistry.getByCategory(category)
}

export function getCategories() {
  return algorithmRegistry.getCategories()
}

export function createVisualization(type, options) {
  return algorithmRegistry.createVisualization(type, options)
}

