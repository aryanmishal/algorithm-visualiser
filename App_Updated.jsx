import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Button } from './components/ui/button'
import { Textarea } from './components/ui/textarea'
import { Slider } from './components/ui/slider'
import { Badge } from './components/ui/badge'
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Settings } from 'lucide-react'

import ModularAlgorithmVisualizer from './components/ModularAlgorithmVisualizer'
import CodeEditor from './components/CodeEditor'
import HelpModal from './components/HelpModal'
import { algorithmRegistry } from './algorithms/AlgorithmRegistry'

function App() {
  // Algorithm selection
  const [selectedCategory, setSelectedCategory] = useState('Sorting Algorithms')
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubble_sort')
  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript')
  
  // Visualization state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [speed, setSpeed] = useState(500)
  
  // Input data
  const [inputType, setInputType] = useState('array')
  const [arrayInput, setArrayInput] = useState('64, 34, 25, 12, 22, 11, 90')
  const [graphInput, setGraphInput] = useState('')
  const [treeInput, setTreeInput] = useState('')
  const [gridSize, setGridSize] = useState({ rows: 15, cols: 20 })
  
  // Processed input for visualization
  const [visualizationInput, setVisualizationInput] = useState(null)
  
  // Available algorithms and categories
  const [categories, setCategories] = useState({})
  const [currentAlgorithmInfo, setCurrentAlgorithmInfo] = useState(null)
  
  // Animation control
  const [animationInterval, setAnimationInterval] = useState(null)

  // Initialize categories and algorithms
  useEffect(() => {
    const categoriesData = algorithmRegistry.getCategoriesWithAlgorithms()
    setCategories(categoriesData)
    
    // Set default algorithm info
    const algorithmInfo = algorithmRegistry.getAlgorithmInfo(selectedAlgorithm)
    setCurrentAlgorithmInfo(algorithmInfo)
  }, [])

  // Update algorithm info when selection changes
  useEffect(() => {
    const algorithmInfo = algorithmRegistry.getAlgorithmInfo(selectedAlgorithm)
    setCurrentAlgorithmInfo(algorithmInfo)
    
    // Update input type based on algorithm
    if (algorithmInfo) {
      setInputType(algorithmInfo.visualizationType)
    }
  }, [selectedAlgorithm])

  // Process input data when it changes
  useEffect(() => {
    processInputData()
  }, [inputType, arrayInput, graphInput, treeInput, gridSize])

  const processInputData = () => {
    try {
      switch (inputType) {
        case 'array':
          const arrayData = arrayInput.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x))
          setVisualizationInput(arrayData)
          break
          
        case 'graph':
          if (graphInput.trim()) {
            const graphData = JSON.parse(graphInput)
            setVisualizationInput({ graph: graphData })
          } else {
            // Default graph for testing
            setVisualizationInput({
              graph: {
                nodes: [
                  { id: 'A', value: 'A' },
                  { id: 'B', value: 'B' },
                  { id: 'C', value: 'C' },
                  { id: 'D', value: 'D' },
                  { id: 'E', value: 'E' }
                ],
                edges: [
                  { from: 'A', to: 'B' },
                  { from: 'A', to: 'C' },
                  { from: 'B', to: 'D' },
                  { from: 'C', to: 'E' },
                  { from: 'B', to: 'E' }
                ]
              },
              startNode: 'A',
              endNode: 'E'
            })
          }
          break
          
        case 'tree':
          if (treeInput.trim()) {
            const treeData = JSON.parse(treeInput)
            setVisualizationInput({ tree: treeData, rootValue: treeData.value })
          } else {
            // Default tree for testing
            setVisualizationInput({
              tree: {
                value: 'A',
                children: [
                  {
                    value: 'B',
                    children: [
                      { value: 'D' },
                      { value: 'E' }
                    ]
                  },
                  {
                    value: 'C',
                    children: [
                      { value: 'F' },
                      { value: 'G' }
                    ]
                  }
                ]
              },
              rootValue: 'A'
            })
          }
          break
          
        case 'grid':
          setVisualizationInput({
            grid: true, // Grid will be created by visualization
            start: { row: 2, col: 2 },
            end: { row: gridSize.rows - 3, col: gridSize.cols - 3 }
          })
          break
          
        default:
          setVisualizationInput(null)
      }
    } catch (error) {
      console.error('Error processing input:', error)
      setVisualizationInput(null)
    }
  }

  // Animation controls
  const handlePlay = () => {
    if (isPlaying) {
      setIsPlaying(false)
      if (animationInterval) {
        clearInterval(animationInterval)
        setAnimationInterval(null)
      }
    } else {
      setIsPlaying(true)
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false)
            clearInterval(interval)
            setAnimationInterval(null)
            return prev
          }
          return prev + 1
        })
      }, speed)
      setAnimationInterval(interval)
    }
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStep(0)
    if (animationInterval) {
      clearInterval(animationInterval)
      setAnimationInterval(null)
    }
  }

  const handleStepForward = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleStepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleStepChange = (step) => {
    setCurrentStep(step)
  }

  // Update total steps when visualization changes
  const handleVisualizationUpdate = (steps) => {
    setTotalSteps(steps)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <HelpModal />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Algorithm Visualizer
          </h1>
          <p className="text-lg text-gray-600">
            Interactive learning tool for understanding algorithms step-by-step
          </p>
          <div className="mt-4">
            <Badge variant="secondary" className="mr-2">
              Modular Architecture
            </Badge>
            <Badge variant="secondary" className="mr-2">
              Extensible Plugin System
            </Badge>
            <Badge variant="secondary">
              Multiple Data Structures
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Algorithm Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Algorithm Selection</CardTitle>
                <CardDescription>Choose algorithm and visualization type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(categories).map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Algorithm</label>
                  <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories[selectedCategory] || []).map(algorithm => (
                        <SelectItem key={algorithm.id} value={algorithm.id}>
                          {algorithm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="C++">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Algorithm Info */}
                {currentAlgorithmInfo && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">{currentAlgorithmInfo.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{currentAlgorithmInfo.description}</p>
                    <div className="flex gap-2 text-xs">
                      <Badge variant="outline">Time: {currentAlgorithmInfo.timeComplexity}</Badge>
                      <Badge variant="outline">Space: {currentAlgorithmInfo.spaceComplexity}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Input Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Input Configuration</CardTitle>
                <CardDescription>Configure input data for visualization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {inputType === 'array' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Custom Array (comma-separated)
                    </label>
                    <Textarea
                      value={arrayInput}
                      onChange={(e) => setArrayInput(e.target.value)}
                      placeholder="64, 34, 25, 12, 22, 11, 90"
                      className="min-h-[60px]"
                    />
                  </div>
                )}

                {inputType === 'graph' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Graph Data (JSON format)
                    </label>
                    <Textarea
                      value={graphInput}
                      onChange={(e) => setGraphInput(e.target.value)}
                      placeholder="Leave empty for default graph"
                      className="min-h-[100px]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to use default graph for testing
                    </p>
                  </div>
                )}

                {inputType === 'tree' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tree Data (JSON format)
                    </label>
                    <Textarea
                      value={treeInput}
                      onChange={(e) => setTreeInput(e.target.value)}
                      placeholder="Leave empty for default tree"
                      className="min-h-[100px]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to use default tree for testing
                    </p>
                  </div>
                )}

                {inputType === 'grid' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Grid Size: {gridSize.rows} × {gridSize.cols}
                      </label>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-600">Rows: {gridSize.rows}</label>
                          <Slider
                            value={[gridSize.rows]}
                            onValueChange={([value]) => setGridSize(prev => ({ ...prev, rows: value }))}
                            min={10}
                            max={25}
                            step={1}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Columns: {gridSize.cols}</label>
                          <Slider
                            value={[gridSize.cols]}
                            onValueChange={([value]) => setGridSize(prev => ({ ...prev, cols: value }))}
                            min={15}
                            max={35}
                            step={1}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Visualization */}
          <div className="lg:col-span-2 space-y-6">
            {/* Playback Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Playback Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStepBackward}
                    disabled={currentStep === 0}
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={handlePlay}
                    className="px-6"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStepForward}
                    disabled={currentStep >= totalSteps - 1}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Speed: {speed}ms delay</span>
                    <span>Step {currentStep + 1} of {totalSteps}</span>
                  </div>
                  <Slider
                    value={[speed]}
                    onValueChange={([value]) => setSpeed(value)}
                    min={100}
                    max={2000}
                    step={100}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <ModularAlgorithmVisualizer
                  algorithmId={selectedAlgorithm}
                  input={visualizationInput}
                  isPlaying={isPlaying}
                  currentStep={currentStep}
                  onStepChange={handleStepChange}
                  speed={speed}
                />
              </CardContent>
            </Card>

            {/* Algorithm Code */}
            <Card>
              <CardHeader>
                <CardTitle>Algorithm Code</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeEditor
                  algorithm={selectedAlgorithm}
                  language={selectedLanguage}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

