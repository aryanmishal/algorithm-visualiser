/**
 * Depth-First Search Algorithm Plugin
 * Implements DFS for graph traversal and pathfinding
 */

import { AlgorithmPlugin } from '../AlgorithmPlugin.js'

export class DFSAlgorithm extends AlgorithmPlugin {
  constructor() {
    super('Depth-First Search', 'Graph Algorithms', {
      description: 'Explores graph by going as deep as possible before backtracking',
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
    const stack = [startNode]
    const parent = new Map()
    const steps = []
    
    parent.set(startNode, null)
    
    // Add initial step
    steps.push({
      type: 'start',
      nodeId: startNode,
      message: `Starting DFS from node ${startNode}`
    })
    
    while (stack.length > 0) {
      const currentNode = stack.pop()
      
      // Skip if already visited
      if (visited.has(currentNode)) {
        continue
      }
      
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
          message: `Path found: ${path.join(' → ')}`
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
      
      // Add neighbors to stack (in reverse order for consistent traversal)
      const neighbors = this.getNeighbors(graph, currentNode)
      const unvisitedNeighbors = neighbors.filter(neighbor => !visited.has(neighbor))
      
      // Add to stack in reverse order so we visit in the original order
      for (let i = unvisitedNeighbors.length - 1; i >= 0; i--) {
        const neighbor = unvisitedNeighbors[i]
        if (!parent.has(neighbor)) {
          parent.set(neighbor, currentNode)
          stack.push(neighbor)
        }
      }
      
      if (unvisitedNeighbors.length > 0) {
        steps.push({
          type: 'add_to_stack',
          nodeIds: unvisitedNeighbors,
          message: `Added to stack: ${unvisitedNeighbors.join(', ')}`
        })
      }
      
      // Show backtracking if stack is not empty and we're going to a different branch
      if (stack.length > 0) {
        const nextNode = stack[stack.length - 1]
        if (!unvisitedNeighbors.includes(nextNode)) {
          steps.push({
            type: 'backtrack',
            fromNode: currentNode,
            toNode: nextNode,
            message: `Backtracking from ${currentNode} to ${nextNode}`
          })
        }
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
        message: `DFS traversal complete. Visited ${visited.size} nodes.`
      })
    }
    
    return steps
  }
  
  generateSteps(input) {
    // For DFS, we generate steps during execution
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
        
      case 'add_to_stack':
        step.nodeIds.forEach(nodeId => {
          this.highlightNode(nodeId, 'frontier')
        })
        break
        
      case 'backtrack':
        // Highlight the backtracking movement
        this.highlightNode(step.fromNode, 'visited')
        this.highlightNode(step.toNode, 'current')
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
export function createDFSAlgorithm() {
  return new DFSAlgorithm()
}

