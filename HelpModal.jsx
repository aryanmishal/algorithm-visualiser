import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { X, HelpCircle } from 'lucide-react'

const HelpModal = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50"
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        Help
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Algorithm Visualizer Help</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Welcome to the Algorithm Visualizer! This tool helps you understand how algorithms work through interactive step-by-step visualizations.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">How to Use</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <strong>1. Select Algorithm:</strong> Choose a category and algorithm from the dropdown menus.
                  </div>
                  <div>
                    <strong>2. Choose Language:</strong> View the algorithm implementation in Python, JavaScript, or C++.
                  </div>
                  <div>
                    <strong>3. Customize Input:</strong> Enter your own array values (comma-separated) to see how the algorithm handles different data.
                  </div>
                  <div>
                    <strong>4. Control Playback:</strong> Use the play/pause button to start/stop the animation, or step through manually.
                  </div>
                  <div>
                    <strong>5. Adjust Speed:</strong> Use the speed slider to control how fast the animation runs.
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Visualization Legend</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-400 border"></div>
                    <span>Comparing elements</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 border"></div>
                    <span>Swapping elements</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 border"></div>
                    <span>Element in final position</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-300 border"></div>
                    <span>Unsorted elements</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Control Buttons</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <strong>Play/Pause:</strong> Start or stop the automatic animation
                  </div>
                  <div>
                    <strong>Step Forward/Backward:</strong> Move one step at a time through the algorithm
                  </div>
                  <div>
                    <strong>Reset:</strong> Return to the beginning of the algorithm
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Tips</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• Try different input arrays to see how the algorithm behaves</div>
                  <div>• Use slower speeds to better understand each step</div>
                  <div>• Compare the same algorithm in different programming languages</div>
                  <div>• Watch the step counter to see algorithm efficiency</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-sm text-gray-600">
                  This algorithm visualizer is built with React and uses Canvas for rendering visualizations. 
                  It's designed to be a beginner-friendly educational tool for learning algorithms and data structures.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

export default HelpModal

