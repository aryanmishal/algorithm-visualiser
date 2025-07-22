/**
 * Tree Traversal Algorithm Plugin
 * Implements various tree traversal methods (inorder, preorder, postorder, level-order)
 */

import { AlgorithmPlugin } from '../AlgorithmPlugin.js'

export class TreeTraversalAlgorithm extends AlgorithmPlugin {
  constructor(traversalType = 'inorder') {
    super(`${traversalType.charAt(0).toUpperCase() + traversalType.slice(1)} Traversal`, 'Tree Algorithms', {
      description: `Traverses binary tree in ${traversalType} order`,
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(h)',
      visualizationType: 'tree'
    })
    
    this.traversalType = traversalType
  }
  
  async execute(input, options = {}) {
    const { tree, rootValue } = input
    const steps = []
    
    steps.push({
      type: 'start',
      nodeId: rootValue,
      message: `Starting ${this.traversalType} traversal from root ${rootValue}`
    })
    
    switch (this.traversalType) {
      case 'inorder':
        this.inorderTraversal(tree, rootValue, steps)
        break
      case 'preorder':
        this.preorderTraversal(tree, rootValue, steps)
        break
      case 'postorder':
        this.postorderTraversal(tree, rootValue, steps)
        break
      case 'levelorder':
        this.levelOrderTraversal(tree, rootValue, steps)
        break
    }
    
    steps.push({
      type: 'complete',
      message: `${this.traversalType} traversal complete`
    })
    
    return steps
  }
  
  generateSteps(input) {
    // For tree traversal, we generate steps during execution
    return []
  }
  
  inorderTraversal(tree, nodeValue, steps, visited = new Set()) {
    if (!nodeValue || visited.has(nodeValue)) return
    
    const node = this.findNode(tree, nodeValue)
    if (!node) return
    
    visited.add(nodeValue)
    
    steps.push({
      type: 'current',
      nodeId: nodeValue,
      message: `Visiting node ${nodeValue}`
    })
    
    // Traverse left subtree
    if (node.left) {
      steps.push({
        type: 'explore',
        nodeId: node.left,
        message: `Exploring left subtree of ${nodeValue}`
      })
      this.inorderTraversal(tree, node.left, steps, visited)
    }
    
    // Visit root
    steps.push({
      type: 'visit',
      nodeId: nodeValue,
      message: `Processing node ${nodeValue}`
    })
    
    // Traverse right subtree
    if (node.right) {
      steps.push({
        type: 'explore',
        nodeId: node.right,
        message: `Exploring right subtree of ${nodeValue}`
      })
      this.inorderTraversal(tree, node.right, steps, visited)
    }
    
    steps.push({
      type: 'backtrack',
      nodeId: nodeValue,
      message: `Backtracking from node ${nodeValue}`
    })
  }
  
  preorderTraversal(tree, nodeValue, steps, visited = new Set()) {
    if (!nodeValue || visited.has(nodeValue)) return
    
    const node = this.findNode(tree, nodeValue)
    if (!node) return
    
    visited.add(nodeValue)
    
    steps.push({
      type: 'current',
      nodeId: nodeValue,
      message: `Visiting node ${nodeValue}`
    })
    
    // Visit root first
    steps.push({
      type: 'visit',
      nodeId: nodeValue,
      message: `Processing node ${nodeValue}`
    })
    
    // Traverse left subtree
    if (node.left) {
      steps.push({
        type: 'explore',
        nodeId: node.left,
        message: `Exploring left subtree of ${nodeValue}`
      })
      this.preorderTraversal(tree, node.left, steps, visited)
    }
    
    // Traverse right subtree
    if (node.right) {
      steps.push({
        type: 'explore',
        nodeId: node.right,
        message: `Exploring right subtree of ${nodeValue}`
      })
      this.preorderTraversal(tree, node.right, steps, visited)
    }
    
    steps.push({
      type: 'backtrack',
      nodeId: nodeValue,
      message: `Backtracking from node ${nodeValue}`
    })
  }
  
  postorderTraversal(tree, nodeValue, steps, visited = new Set()) {
    if (!nodeValue || visited.has(nodeValue)) return
    
    const node = this.findNode(tree, nodeValue)
    if (!node) return
    
    visited.add(nodeValue)
    
    steps.push({
      type: 'current',
      nodeId: nodeValue,
      message: `Visiting node ${nodeValue}`
    })
    
    // Traverse left subtree
    if (node.left) {
      steps.push({
        type: 'explore',
        nodeId: node.left,
        message: `Exploring left subtree of ${nodeValue}`
      })
      this.postorderTraversal(tree, node.left, steps, visited)
    }
    
    // Traverse right subtree
    if (node.right) {
      steps.push({
        type: 'explore',
        nodeId: node.right,
        message: `Exploring right subtree of ${nodeValue}`
      })
      this.postorderTraversal(tree, node.right, steps, visited)
    }
    
    // Visit root last
    steps.push({
      type: 'visit',
      nodeId: nodeValue,
      message: `Processing node ${nodeValue}`
    })
    
    steps.push({
      type: 'backtrack',
      nodeId: nodeValue,
      message: `Backtracking from node ${nodeValue}`
    })
  }
  
  levelOrderTraversal(tree, rootValue, steps) {
    const queue = [rootValue]
    const visited = new Set()
    
    while (queue.length > 0) {
      const currentValue = queue.shift()
      
      if (visited.has(currentValue)) continue
      visited.add(currentValue)
      
      const node = this.findNode(tree, currentValue)
      if (!node) continue
      
      steps.push({
        type: 'current',
        nodeId: currentValue,
        message: `Visiting node ${currentValue} at level`
      })
      
      steps.push({
        type: 'visit',
        nodeId: currentValue,
        message: `Processing node ${currentValue}`
      })
      
      // Add children to queue
      const children = []
      if (node.left) {
        queue.push(node.left)
        children.push(node.left)
      }
      if (node.right) {
        queue.push(node.right)
        children.push(node.right)
      }
      
      if (children.length > 0) {
        steps.push({
          type: 'enqueue',
          nodeIds: children,
          message: `Added to queue: ${children.join(', ')}`
        })
      }
    }
  }
  
  findNode(tree, value) {
    // Helper function to find node by value in tree structure
    if (tree.value === value) {
      return tree
    }
    
    if (tree.children) {
      for (const child of tree.children) {
        const found = this.findNode(child, value)
        if (found) return found
      }
    }
    
    if (tree.left) {
      const found = this.findNode(tree.left, value)
      if (found) return found
    }
    
    if (tree.right) {
      const found = this.findNode(tree.right, value)
      if (found) return found
    }
    
    return null
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
        
      case 'explore':
        this.highlightNode(step.nodeId, 'visiting')
        break
        
      case 'enqueue':
        step.nodeIds.forEach(nodeId => {
          this.highlightNode(nodeId, 'frontier')
        })
        break
        
      case 'backtrack':
        this.highlightNode(step.nodeId, 'visited')
        break
    }
  }
}

// Factory functions for different traversal types
export function createInorderTraversal() {
  return new TreeTraversalAlgorithm('inorder')
}

export function createPreorderTraversal() {
  return new TreeTraversalAlgorithm('preorder')
}

export function createPostorderTraversal() {
  return new TreeTraversalAlgorithm('postorder')
}

export function createLevelOrderTraversal() {
  return new TreeTraversalAlgorithm('levelorder')
}

