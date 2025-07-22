/**
 * Breadth-First Search Algorithm Plugin
 * Implements BFS for graph traversal and shortest path finding
 */

import { AlgorithmPlugin } from '../AlgorithmPlugin.js'

export class BFSAlgorithm extends AlgorithmPlugin {
  constructor() {
    super('Breadth-First Search', 'Graph Algorithms', {
      description: 'Explores graph level by level, guaranteeing shortest path in unweighted graphs',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)',
      visualizationType: 'graph'
    })
  }
  
  async execute(input, options = {}) {
    const { graph, startNode, endNode = null } = input
    const findPath = endNode !== null
    
    // Initialize data structures
    const visited = new Set()
    const queue = [startNode]
    const parent = new Map()
    const distances = new Map()
    const steps = []
    
    // Initialize distances
    distances.set(startNode, 0)
    parent.set(startNode, null)
    
    // Add initial step
    steps.push({
      type: 'start',
      nodeId: startNode,
      message: `Starting BFS from node ${startNode}`
    })
    
    while (queue.length > 0) {
      const currentNode = queue.shift()
      
      // Mark as current
      steps.push({
        type: 'current',
        nodeId: currentNode,
        message: `Visiting node ${currentNode}`
      })
      
      // Check if we found the target
      if (findPath && currentNode === endNode) {
        steps.push({
          type: 'found',
          nodeId: currentNode,
          message: `Found target node ${endNode}!`
        })
        
        // Reconstruct path
        const path = this.reconstructPath(parent, startNode, endNode)
        steps.push({
          type: 'highlight_path',
          path: path,
          message: `Shortest path: ${path.join(' → ')}`
        })
        break
      }
      
      // Mark as visited
      visited.add(currentNode)
      steps.push({
        type: 'visit',
        nodeId: currentNode,
        message: `Node ${currentNode} visited`
      })
      
      // Explore neighbors
      const neighbors = this.getNeighbors(graph, currentNode)
      const newFrontier = []
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor) && !queue.includes(neighbor)) {
          queue.push(neighbor)
          parent.set(neighbor, currentNode)
          distances.set(neighbor, distances.get(currentNode) + 1)
          newFrontier.push(neighbor)
        }
      }
      
      if (newFrontier.length > 0) {
        steps.push({
          type: 'frontier',
          nodeIds: newFrontier,
          message: `Added to frontier: ${newFrontier.join(', ')}`
        })
      }
    }
    
    // Final result
    if (findPath && !visited.has(endNode)) {
      steps.push({
        type: 'not_found',
        message: `No path found from ${startNode} to ${endNode}`
      })
    } else if (!findPath) {
      steps.push({
        type: 'complete',
        message: `BFS traversal complete. Visited ${visited.size} nodes.`
      })
    }
    
    return steps
  }
  
  generateSteps(input) {
    // For BFS, we generate steps during execution
    // This method is called by the base class but we handle step generation in execute()
    return []
  }
  
  getNeighbors(graph, nodeId) {
    // Extract neighbors from graph structure
    if (graph.adjacencyList) {
      return Array.from(graph.adjacencyList.get(nodeId) || [])
    } else if (graph.edges) {
      // Extract from edge list
      const neighbors = []
      graph.edges.forEach(edge => {
        if (edge.from === nodeId) {
          neighbors.push(edge.to)
        } else if (!edge.directed && edge.to === nodeId) {
          neighbors.push(edge.from)
        }
      })
      return neighbors
    }
    return []
  }
  
  reconstructPath(parent, start, end) {
    const path = []
    let current = end
    
    while (current !== null) {
      path.unshift(current)
      current = parent.get(current)
    }
    
    return path
  }
  
  // Override step execution for custom visualization
  async onStep(step) {
    switch (step.type) {
      case 'start':
        this.highlightNode(step.nodeId, 'start')
        break
        
      case 'current':
        this.highlightNode(step.nodeId, 'current')
        break
        
      case 'visit':
        this.highlightNode(step.nodeId, 'visited')
        break
        
      case 'frontier':
        step.nodeIds.forEach(nodeId => {
          this.highlightNode(nodeId, 'frontier')
        })
        break
        
      case 'highlight_path':
        if (this.visualization && this.visualization.highlightPath) {
          this.visualization.highlightPath(step.path)
        }
        break
        
      case 'found':
        this.highlightNode(step.nodeId, 'end')
        break
    }
  }
}

// Factory function for easy instantiation
export function createBFSAlgorithm() {
  return new BFSAlgorithm()
}

