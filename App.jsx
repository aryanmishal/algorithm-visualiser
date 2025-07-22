import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from 'lucide-react'
import AlgorithmVisualizer from './components/AlgorithmVisualizer'
import CodeEditor from './components/CodeEditor'
import HelpModal from './components/HelpModal'
import algorithmRegistry from './algorithms/registry.json'
import './App.css'

function App() {
  const [selectedCategory, setSelectedCategory] = useState('sorting')
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubble_sort')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState([])
  const [speed, setSpeed] = useState([500])
  const [inputArray, setInputArray] = useState([64, 34, 25, 12, 22, 11, 90])
  const [customInput, setCustomInput] = useState('64, 34, 25, 12, 22, 11, 90')

  // Get available algorithms for selected category
  const availableAlgorithms = algorithmRegistry.algorithms[selectedCategory] || {}
  
  // Get current algorithm info
  const currentAlgorithmInfo = availableAlgorithms[selectedAlgorithm]

  // Generate algorithm steps
  const generateSteps = () => {
    if (selectedAlgorithm === 'bubble_sort') {
      const steps = bubbleSortVisualization(inputArray)
      setSteps(steps)
      setCurrentStep(0)
    } else if (selectedAlgorithm === 'selection_sort') {
      const steps = selectionSortVisualization(inputArray)
      setSteps(steps)
      setCurrentStep(0)
    }
  }

  // Bubble sort visualization function
  const bubbleSortVisualization = (arr) => {
    const n = arr.length
    const steps = []
    const arrCopy = [...arr]
    
    for (let i = 0; i < n; i++) {
      let swapped = false
      for (let j = 0; j < n - i - 1; j++) {
        // Record comparison step
        steps.push({
          type: 'compare',
          indices: [j, j + 1],
          array: [...arrCopy],
          message: `Comparing elements at indices ${j} and ${j + 1}: ${arrCopy[j]} vs ${arrCopy[j + 1]}`
        })
        
        if (arrCopy[j] > arrCopy[j + 1]) {
          // Record swap step
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
      
      // Record completion of pass
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

  // Selection sort visualization function
  const selectionSortVisualization = (arr) => {
    const n = arr.length
    const steps = []
    const arrCopy = [...arr]
    
    for (let i = 0; i < n - 1; i++) {
      let minIndex = i
      
      // Record start of new pass
      steps.push({
        type: 'pass_start',
        indices: [i],
        array: [...arrCopy],
        message: `Starting pass ${i + 1}. Looking for minimum element from index ${i}`
      })
      
      for (let j = i + 1; j < n; j++) {
        // Record comparison step
        steps.push({
          type: 'compare',
          indices: [minIndex, j],
          array: [...arrCopy],
          message: `Comparing elements at indices ${minIndex} (${arrCopy[minIndex]}) and ${j} (${arrCopy[j]})`
        })
        
        if (arrCopy[j] < arrCopy[minIndex]) {
          minIndex = j
          steps.push({
            type: 'new_min',
            indices: [minIndex],
            array: [...arrCopy],
            message: `New minimum found at index ${minIndex} with value ${arrCopy[minIndex]}`
          })
        }
      }
      
      // Swap if needed
      if (minIndex !== i) {
        [arrCopy[i], arrCopy[minIndex]] = [arrCopy[minIndex], arrCopy[i]]
        steps.push({
          type: 'swap',
          indices: [i, minIndex],
          array: [...arrCopy],
          message: `Swapped elements at indices ${i} and ${minIndex}`
        })
      }
      
      // Record completion of pass
      steps.push({
        type: 'pass_complete',
        indices: [i],
        array: [...arrCopy],
        message: `Pass ${i + 1} complete. Element at index ${i} is in final position`
      })
    }
    
    return steps
  }

  // Play/Pause functionality
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  // Reset to beginning
  const reset = () => {
    setIsPlaying(false)
    setCurrentStep(0)
  }

  // Step forward
  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Step backward
  const stepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Auto-play effect
  useEffect(() => {
    let interval
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, speed[0])
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentStep, steps.length, speed])

  // Parse custom input
  const handleInputChange = (value) => {
    setCustomInput(value)
    try {
      const parsed = value.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num))
      if (parsed.length > 0) {
        setInputArray(parsed)
      }
    } catch (error) {
      console.error('Invalid input format')
    }
  }

  // Generate steps when algorithm or input changes
  useEffect(() => {
    generateSteps()
  }, [selectedAlgorithm, inputArray])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <HelpModal />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Algorithm Visualizer</h1>
          <p className="text-gray-600">Interactive learning tool for understanding algorithms step-by-step</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls and Code */}
          <div className="lg:col-span-1 space-y-6">
            {/* Algorithm Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Algorithm Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {algorithmRegistry.categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Algorithm</label>
                  <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(availableAlgorithms).map(([key, algorithm]) => (
                        <SelectItem key={key} value={key}>
                          {algorithm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Language</label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {algorithmRegistry.languages.map(language => (
                        <SelectItem key={language.id} value={language.id}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Input Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Input Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium mb-2 block">Custom Array (comma-separated)</label>
                  <Textarea
                    value={customInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="64, 34, 25, 12, 22, 11, 90"
                    className="min-h-[60px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Playback Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Playback Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center space-x-2">
                  <Button variant="outline" size="sm" onClick={stepBackward} disabled={currentStep === 0}>
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button onClick={togglePlayPause} className="px-6">
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={stepForward} disabled={currentStep >= steps.length - 1}>
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={reset}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Speed: {speed[0]}ms delay
                  </label>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    max={2000}
                    min={100}
                    step={100}
                    className="w-full"
                  />
                </div>

                <div className="text-center text-sm text-gray-600">
                  Step {currentStep + 1} of {steps.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Visualization and Code */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <AlgorithmVisualizer 
                  steps={steps}
                  currentStep={currentStep}
                  algorithm={selectedAlgorithm}
                />
              </CardContent>
            </Card>

            {/* Code Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Algorithm Code</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeEditor 
                  algorithm={selectedAlgorithm}
                  language={selectedLanguage}
                  algorithmInfo={currentAlgorithmInfo}
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

