/**
 * Modular Algorithm Visualizer Component
 * Uses the new modular visualization system
 */

import { useEffect, useRef, useState } from 'react'
import { VisualizationEngine } from '../visualization/VisualizationEngine.js'
import { algorithmRegistry } from '../algorithms/AlgorithmRegistry.js'

const ModularAlgorithmVisualizer = ({ 
  algorithmId, 
  input, 
  isPlaying, 
  currentStep, 
  onStepChange,
  speed = 500 
}) => {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const visualizationRef = useRef(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [steps, setSteps] = useState([])
  const [currentMessage, setCurrentMessage] = useState('')

  // Initialize visualization engine
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const engine = new VisualizationEngine(canvas, {
      animationDuration: speed,
      backgroundColor: '#ffffff'
    })

    engineRef.current = engine
    
    // Set up callbacks
    engine.onStepChange((step) => {
      if (onStepChange) {
        onStepChange(step)
      }
    })

    setIsInitialized(true)

    return () => {
      if (engineRef.current) {
        engineRef.current = null
      }
    }
  }, [speed, onStepChange])

  // Initialize algorithm and visualization when algorithm changes
  useEffect(() => {
    if (!isInitialized || !algorithmId || !engineRef.current) return

    const algorithm = algorithmRegistry.get(algorithmId)
    if (!algorithm) return

    try {
      // Create appropriate visualization
      const visualizationType = algorithm.visualizationType || 'array'
      const visualization = algorithmRegistry.createVisualization(visualizationType, {
        title: algorithm.name
      })

      // Initialize visualization with engine
      visualization.engine = engineRef.current
      engineRef.current.setVisualization(visualization)
      visualization.init()

      visualizationRef.current = visualization

      // Set up input data
      if (input) {
        setupVisualizationData(visualization, visualizationType, input)
      }

    } catch (error) {
      console.error('Error initializing visualization:', error)
    }
  }, [isInitialized, algorithmId, input])

  // Execute algorithm when input changes
  useEffect(() => {
    if (!algorithmId || !input || !visualizationRef.current) return

    executeAlgorithm()
  }, [algorithmId, input])

  // Handle step changes
  useEffect(() => {
    if (engineRef.current && steps.length > 0 && currentStep >= 0) {
      engineRef.current.goToStep(currentStep)
    }
  }, [currentStep, steps])

  const setupVisualizationData = (visualization, type, inputData) => {
    switch (type) {
      case 'array':
        if (Array.isArray(inputData)) {
          visualization.setData(inputData)
        } else if (inputData.array) {
          visualization.setData(inputData.array)
        }
        break

      case 'tree':
        if (inputData.tree) {
          visualization.setTree(inputData.tree)
        }
        break

      case 'graph':
        if (inputData.graph) {
          visualization.setGraph(inputData.graph)
        }
        break

      case 'grid':
        if (inputData.grid) {
          // Grid is usually created by the visualization itself
          // but we can set start/end points
          if (inputData.start) {
            visualization.setStart(inputData.start.row, inputData.start.col)
          }
          if (inputData.end) {
            visualization.setEnd(inputData.end.row, inputData.end.col)
          }
        }
        break
    }
  }

  const executeAlgorithm = async () => {
    try {
      const algorithm = algorithmRegistry.get(algorithmId)
      if (!algorithm) return

      // Execute algorithm to get steps
      const algorithmSteps = await algorithmRegistry.executeAlgorithm(algorithmId, input)
      
      setSteps(algorithmSteps)
      
      // Set steps in engine
      if (engineRef.current) {
        engineRef.current.setSteps(algorithmSteps)
        if (algorithmSteps.length > 0) {
          engineRef.current.goToStep(0)
        }
      }

    } catch (error) {
      console.error('Error executing algorithm:', error)
    }
  }

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && engineRef.current) {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        
        canvas.width = rect.width
        canvas.height = rect.height
        
        engineRef.current.resize(rect.width, rect.height)
        
        if (visualizationRef.current && visualizationRef.current.resize) {
          visualizationRef.current.resize()
        }
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Initial resize

    return () => window.removeEventListener('resize', handleResize)
  }, [isInitialized])

  // Get current step message
  useEffect(() => {
    if (steps.length > 0 && currentStep >= 0 && currentStep < steps.length) {
      const step = steps[currentStep]
      setCurrentMessage(step.message || '')
    }
  }, [steps, currentStep])

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full border border-gray-200 rounded-lg bg-white"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      {/* Step information */}
      {steps.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
          </div>
          {currentMessage && (
            <div className="text-sm text-gray-800">
              {currentMessage}
            </div>
          )}
        </div>
      )}
      
      {/* Loading state */}
      {!isInitialized && (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Initializing visualization engine...</p>
        </div>
      )}
      
      {/* No algorithm selected */}
      {isInitialized && !algorithmId && (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Select an algorithm to start visualization</p>
        </div>
      )}
      
      {/* No input provided */}
      {isInitialized && algorithmId && !input && (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Provide input data to visualize the algorithm</p>
        </div>
      )}
    </div>
  )
}

export default ModularAlgorithmVisualizer

