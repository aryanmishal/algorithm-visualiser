# Developer Guide: Adding New Algorithms to the Visualization System

This guide provides step-by-step instructions for adding new algorithms to the modular visualization system.

## Table of Contents

1. [Understanding the Architecture](#understanding-the-architecture)
2. [Creating a New Algorithm Plugin](#creating-a-new-algorithm-plugin)
3. [Implementing Visualization Steps](#implementing-visualization-steps)
4. [Registering Your Algorithm](#registering-your-algorithm)
5. [Testing Your Algorithm](#testing-your-algorithm)
6. [Advanced Customization](#advanced-customization)
7. [Examples](#examples)

## Understanding the Architecture

Before adding a new algorithm, it's important to understand the system architecture:

- **AlgorithmPlugin**: Base class for all algorithm implementations
- **VisualizationEngine**: Manages rendering and animation
- **Visualization Types**: Specialized renderers for different data structures
- **AlgorithmRegistry**: Central registry for all available algorithms

Each algorithm belongs to a category (sorting, graph, tree, pathfinding) and works with a specific visualization type.

## Creating a New Algorithm Plugin

### Step 1: Choose the Right Base Class

Depending on your algorithm type, extend the appropriate base class:

```javascript
// For sorting algorithms
import { SortingAlgorithm } from '../algorithms/sorting/SortingAlgorithm';

// For graph algorithms
import { GraphAlgorithm } from '../algorithms/graph/GraphAlgorithm';

// For tree algorithms
import { TreeAlgorithm } from '../algorithms/tree/TreeAlgorithm';

// For pathfinding algorithms
import { PathfindingAlgorithm } from '../algorithms/pathfinding/PathfindingAlgorithm';
```

### Step 2: Create Your Algorithm Class

```javascript
export class MyNewAlgorithm extends GraphAlgorithm {
  constructor() {
    // Parameters: id, display name, time complexity, space complexity
    super('my_new_algorithm', 'My New Algorithm', 'O(V + E)', 'O(V)');
  }

  // Initialize algorithm state
  initialize(data) {
    return {
      // Initial state object
      graph: data,
      visited: new Set(),
      queue: [data.startNode],
      current: null,
      path: []
    };
  }

  // Generate visualization steps
  generateSteps(data) {
    const steps = [];
    const state = this.initialize(data);
    
    // Algorithm logic here
    // Add visualization steps
    
    return steps;
  }
}
```

## Implementing Visualization Steps

Each algorithm needs to generate steps that the visualization engine can render. Steps are snapshots of the algorithm's state at each point in the execution.

### Step 1: Define Step Structure

Each step should include:
- Current state of the data structure
- Visual indicators (highlighting, colors, etc.)
- Text explanation of the current operation
- Any additional metadata needed for visualization

### Step 2: Add Steps During Algorithm Execution

```javascript
generateSteps(data) {
  const steps = [];
  const state = this.initialize(data);
  
  // Add initial step
  steps.push({
    state: {...state},
    explanation: "Algorithm initialized",
    highlights: []
  });
  
  // Example: BFS algorithm step
  while (state.queue.length > 0) {
    state.current = state.queue.shift();
    state.visited.add(state.current);
    
    steps.push({
      state: {...state},
      explanation: `Visiting node ${state.current}`,
      highlights: [{type: 'node', id: state.current, color: 'green'}]
    });
    
    // Process neighbors
    const neighbors = state.graph.getNeighbors(state.current);
    for (const neighbor of neighbors) {
      if (!state.visited.has(neighbor) && !state.queue.includes(neighbor)) {
        state.queue.push(neighbor);
        
        steps.push({
          state: {...state},
          explanation: `Adding neighbor ${neighbor} to queue`,
          highlights: [
            {type: 'node', id: state.current, color: 'green'},
            {type: 'node', id: neighbor, color: 'yellow'},
            {type: 'edge', from: state.current, to: neighbor, color: 'yellow'}
          ]
        });
      }
    }
  }
  
  return steps;
}
```

## Registering Your Algorithm

Once your algorithm is implemented, register it with the AlgorithmRegistry:

```javascript
// In src/algorithms/registry.js
import { AlgorithmRegistry } from './AlgorithmRegistry';
import { MyNewAlgorithm } from './graph/MyNewAlgorithm';

// Register the algorithm
AlgorithmRegistry.register(new MyNewAlgorithm());
```

## Testing Your Algorithm

### Step 1: Create Test Data

Create sample data for testing your algorithm:

```javascript
// Example test data for a graph algorithm
const testGraph = {
  nodes: [
    {id: 'A', value: 'A'},
    {id: 'B', value: 'B'},
    {id: 'C', value: 'C'},
    {id: 'D', value: 'D'}
  ],
  edges: [
    {from: 'A', to: 'B'},
    {from: 'A', to: 'C'},
    {from: 'B', to: 'D'},
    {from: 'C', to: 'D'}
  ],
  startNode: 'A'
};
```

### Step 2: Test in the UI

1. Launch the application
2. Select your algorithm's category
3. Select your algorithm from the dropdown
4. Input your test data or use the default
5. Click Play and observe the visualization

### Step 3: Debug if Necessary

If your algorithm doesn't work as expected:
- Check the browser console for errors
- Verify that steps are being generated correctly
- Ensure the visualization engine is rendering your steps properly

## Advanced Customization

### Custom Visual Handlers

For specialized visualizations, you can create custom visual handlers:

```javascript
// In your algorithm class
customVisualHandlers = {
  highlightPath: (path, color) => {
    return {
      type: 'custom',
      operation: 'highlightPath',
      data: { path, color }
    };
  },
  
  markSpecial: (nodeId) => {
    return {
      type: 'custom',
      operation: 'markSpecial',
      data: { nodeId }
    };
  }
};

// Using in your steps
steps.push({
  state: {...state},
  explanation: "Found special node",
  highlights: [this.customVisualHandlers.markSpecial('C')]
});
```

### Custom Input Handlers

For algorithms that need special input processing:

```javascript
// In your algorithm class
parseInput(rawInput) {
  // Custom parsing logic
  return parsedData;
}
```

## Examples

### Example 1: Adding a New Sorting Algorithm (Selection Sort)

```javascript
import { SortingAlgorithm } from '../SortingAlgorithm';
import { AlgorithmRegistry } from '../../AlgorithmRegistry';

export class SelectionSort extends SortingAlgorithm {
  constructor() {
    super('selection_sort', 'Selection Sort', 'O(n²)', 'O(1)');
  }

  initialize(data) {
    return {
      array: [...data],
      currentIndex: 0,
      minIndex: 0,
      comparingIndex: 0,
      sorted: []
    };
  }

  generateSteps(data) {
    const steps = [];
    const state = this.initialize(data);
    const n = state.array.length;
    
    steps.push({
      state: {...state},
      explanation: "Algorithm initialized",
      highlights: []
    });
    
    for (let i = 0; i < n - 1; i++) {
      state.currentIndex = i;
      state.minIndex = i;
      
      steps.push({
        state: {...state},
        explanation: `Starting pass ${i+1}: Finding minimum element`,
        highlights: [{type: 'element', index: i, color: 'blue'}]
      });
      
      for (let j = i + 1; j < n; j++) {
        state.comparingIndex = j;
        
        steps.push({
          state: {...state},
          explanation: `Comparing ${state.array[state.minIndex]} with ${state.array[j]}`,
          highlights: [
            {type: 'element', index: state.minIndex, color: 'blue'},
            {type: 'element', index: j, color: 'yellow'}
          ]
        });
        
        if (state.array[j] < state.array[state.minIndex]) {
          const oldMinIndex = state.minIndex;
          state.minIndex = j;
          
          steps.push({
            state: {...state},
            explanation: `Found new minimum: ${state.array[j]}`,
            highlights: [
              {type: 'element', index: oldMinIndex, color: 'default'},
              {type: 'element', index: j, color: 'blue'}
            ]
          });
        }
      }
      
      if (state.minIndex !== i) {
        // Swap elements
        [state.array[i], state.array[state.minIndex]] = 
        [state.array[state.minIndex], state.array[i]];
        
        steps.push({
          state: {...state},
          explanation: `Swapping ${state.array[state.minIndex]} and ${state.array[i]}`,
          highlights: [
            {type: 'element', index: i, color: 'red'},
            {type: 'element', index: state.minIndex, color: 'red'}
          ]
        });
      }
      
      state.sorted.push(i);
      
      steps.push({
        state: {...state},
        explanation: `Element ${state.array[i]} is now in its sorted position`,
        highlights: [{type: 'element', index: i, color: 'green'}]
      });
    }
    
    // Mark the last element as sorted
    state.sorted.push(n - 1);
    
    steps.push({
      state: {...state},
      explanation: "Array is now sorted",
      highlights: state.sorted.map(index => ({
        type: 'element', 
        index, 
        color: 'green'
      }))
    });
    
    return steps;
  }
}

// Register the algorithm
AlgorithmRegistry.register(new SelectionSort());
```

### Example 2: Adding a New Graph Algorithm (Dijkstra's Algorithm)

```javascript
import { GraphAlgorithm } from '../GraphAlgorithm';
import { AlgorithmRegistry } from '../../AlgorithmRegistry';

export class DijkstraAlgorithm extends GraphAlgorithm {
  constructor() {
    super('dijkstra', 'Dijkstra\'s Algorithm', 'O((V+E)log V)', 'O(V)');
  }

  initialize(data) {
    const distances = {};
    const previous = {};
    const unvisited = new Set();
    
    // Initialize distances
    for (const node of data.nodes) {
      distances[node.id] = node.id === data.startNode ? 0 : Infinity;
      previous[node.id] = null;
      unvisited.add(node.id);
    }
    
    return {
      graph: data,
      distances,
      previous,
      unvisited,
      visited: new Set(),
      current: data.startNode,
      path: []
    };
  }

  generateSteps(data) {
    // Implementation of Dijkstra's algorithm with visualization steps
    // ...
  }
}

// Register the algorithm
AlgorithmRegistry.register(new DijkstraAlgorithm());
```

## Conclusion

By following this guide, you can add new algorithms to the modular visualization system. Remember to:

1. Extend the appropriate base class
2. Implement the required methods
3. Generate meaningful visualization steps
4. Register your algorithm
5. Test thoroughly

For more complex algorithms, consider breaking them down into smaller steps to make the visualization more educational and easier to follow.

