# Modular Visualization System Documentation

## Overview

The Modular Visualization System is an extensible framework for algorithm visualization that supports multiple data structures and algorithm types. This system allows you to:

1. Create custom visualizations for different algorithm types (sorting, recursion, backtracking, graph traversal, tree operations)
2. Design a flexible visual layer that supports various data structures
3. Plug in your own algorithm code that triggers visual updates
4. Control visualization playback with play/pause/step/speed controls

## Architecture

The system is built with a modular architecture consisting of these main components:

### Core Components

1. **VisualizationEngine**: Central manager for all visualizations
2. **BaseElement**: Abstract base class for all visual elements
3. **AlgorithmPlugin**: Interface for algorithm implementations
4. **AlgorithmRegistry**: Registry for all available algorithms

### Visualization Types

1. **ArrayVisualization**: For array-based algorithms (sorting, searching)
2. **GraphVisualization**: For graph algorithms (BFS, DFS)
3. **TreeVisualization**: For tree algorithms (traversals)
4. **GridVisualization**: For grid-based algorithms (pathfinding, mazes)

### Visual Elements

1. **ArrayElement**: Represents array elements as bars or boxes
2. **NodeElement**: Represents nodes in trees and graphs
3. **EdgeElement**: Represents edges between nodes
4. **GridElement**: Represents cells in a grid

## How to Use

### Selecting Algorithm Types

The system provides a category dropdown to select the algorithm type:
- Sorting Algorithms
- Graph Algorithms
- Tree Algorithms
- Pathfinding Algorithms

Each category has specific algorithms available in the algorithm dropdown.

### Input Configuration

The input configuration automatically changes based on the selected algorithm type:
- Array-based algorithms: Custom array input
- Graph algorithms: Graph data in JSON format
- Tree algorithms: Tree data in JSON format
- Grid algorithms: Grid size configuration

### Playback Controls

The system provides standard playback controls:
- Play/Pause button
- Step forward/backward buttons
- Reset button
- Speed control slider

## Adding New Algorithms

### Creating a New Algorithm Plugin

To add a new algorithm, create a new class that extends the `AlgorithmPlugin` base class:

```javascript
import { AlgorithmPlugin } from '../AlgorithmPlugin';

export class MyNewAlgorithm extends AlgorithmPlugin {
  constructor() {
    super('my_new_algorithm', 'My New Algorithm', 'category_name');
  }

  // Initialize algorithm state
  initialize(data) {
    // Setup initial state
    return {
      // Initial state object
    };
  }

  // Generate visualization steps
  generateSteps(data) {
    const steps = [];
    
    // Algorithm logic here
    // Add visualization steps using this.addStep()
    
    return steps;
  }
}
```

### Registering the Algorithm

Register your algorithm in the `AlgorithmRegistry`:

```javascript
import { AlgorithmRegistry } from '../AlgorithmRegistry';
import { MyNewAlgorithm } from './MyNewAlgorithm';

// Register the algorithm
AlgorithmRegistry.register(new MyNewAlgorithm());
```

### Creating Custom Visual Handlers

For custom visualizations, implement the appropriate visualization methods:

```javascript
// Example custom visual handler for highlighting nodes
highlightNode(nodeId, color) {
  // Implementation
}

// Example custom visual handler for marking visited cells
markVisited(x, y) {
  // Implementation
}

// Example custom visual handler for swapping elements
swap(i, j) {
  // Implementation
}
```

## API Reference

### VisualizationEngine

```javascript
// Create a new visualization engine
const engine = new VisualizationEngine(canvas);

// Set algorithm
engine.setAlgorithm(algorithmName);

// Set data
engine.setData(data);

// Playback controls
engine.play();
engine.pause();
engine.step();
engine.reset();
engine.setSpeed(ms);
```

### AlgorithmPlugin

```javascript
// Base methods to override
initialize(data);
generateSteps(data);
```

### Visual Elements

```javascript
// Array element methods
createElement(value, index);
highlight(index, color);
swap(i, j);

// Node element methods
createNode(id, value);
highlightNode(id, color);
visitNode(id);

// Edge element methods
createEdge(fromId, toId);
highlightEdge(fromId, toId, color);

// Grid element methods
createCell(x, y, value);
visitCell(x, y);
markPath(x, y);
setWall(x, y);
```

## Examples

### Example 1: Using the BFS Algorithm

```javascript
// Select Graph Algorithms category
// Select BFS algorithm
// Input graph data or use default
// Click Play to visualize

// Sample graph data format
{
  "nodes": [
    {"id": "A", "value": "A"},
    {"id": "B", "value": "B"},
    {"id": "C", "value": "C"}
  ],
  "edges": [
    {"from": "A", "to": "B"},
    {"from": "A", "to": "C"},
    {"from": "B", "to": "C"}
  ]
}
```

### Example 2: Using the A* Pathfinding Algorithm

```javascript
// Select Pathfinding Algorithms category
// Select A* Pathfinding algorithm
// Configure grid size
// Click Play to visualize
```

### Example 3: Creating a Custom Sorting Algorithm

```javascript
import { AlgorithmPlugin } from '../AlgorithmPlugin';
import { AlgorithmRegistry } from '../AlgorithmRegistry';

class MyCustomSort extends AlgorithmPlugin {
  constructor() {
    super('my_custom_sort', 'My Custom Sort', 'sorting');
  }

  initialize(data) {
    return {
      array: [...data],
      comparisons: 0,
      swaps: 0
    };
  }

  generateSteps(data) {
    const steps = [];
    const array = [...data];
    
    // Custom sorting logic
    // Add steps for visualization
    
    return steps;
  }
}

// Register the algorithm
AlgorithmRegistry.register(new MyCustomSort());
```

## Troubleshooting

### Common Issues

1. **Visualization not appearing**: Check if the canvas element is properly initialized and sized.
2. **Algorithm not working**: Verify that the algorithm is properly registered in the AlgorithmRegistry.
3. **Custom input not recognized**: Ensure the input data format matches what the algorithm expects.

### Performance Tips

1. Limit the number of steps for complex algorithms
2. Use requestAnimationFrame for smooth animations
3. Optimize rendering by only updating changed elements

## Future Enhancements

1. Support for 3D visualizations
2. Export/import of custom algorithms
3. Recording and sharing visualizations
4. More interactive elements for educational purposes

---

This documentation provides a comprehensive guide to using and extending the Modular Visualization System. For further assistance or to report issues, please contact the development team.

