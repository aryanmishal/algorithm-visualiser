import { useEffect, useRef } from 'react'

const AlgorithmVisualizer = ({ steps, currentStep, algorithm }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!steps.length || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const currentStepData = steps[currentStep]

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (algorithm === 'bubble_sort') {
      drawBubbleSort(ctx, currentStepData, canvas.width, canvas.height)
    } else if (algorithm === 'selection_sort') {
      drawSelectionSort(ctx, currentStepData, canvas.width, canvas.height)
    }
  }, [steps, currentStep, algorithm])

  const drawBubbleSort = (ctx, stepData, width, height) => {
    if (!stepData) return

    const { array, indices = [], type, message } = stepData
    const barWidth = Math.min(60, (width - 40) / array.length)
    const maxValue = Math.max(...array)
    const barMaxHeight = height - 120

    // Draw title
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Bubble Sort Visualization', width / 2, 25)

    // Draw message
    ctx.fillStyle = '#4b5563'
    ctx.font = '14px Arial'
    ctx.fillText(message || '', width / 2, height - 20)

    // Draw bars
    array.forEach((value, index) => {
      const barHeight = (value / maxValue) * barMaxHeight
      const x = 20 + index * (barWidth + 5)
      const y = height - 60 - barHeight

      // Determine bar color based on step type and indices
      let color = '#e5e7eb' // default gray
      
      if (type === 'compare' && indices.includes(index)) {
        color = '#fbbf24' // yellow for comparison
      } else if (type === 'swap' && indices.includes(index)) {
        color = '#ef4444' // red for swap
      } else if (type === 'pass_complete' && indices.includes(index)) {
        color = '#10b981' // green for completed
      }

      // Draw bar
      ctx.fillStyle = color
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw border
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, barWidth, barHeight)

      // Draw value on top of bar
      ctx.fillStyle = '#1f2937'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(value.toString(), x + barWidth / 2, y - 5)

      // Draw index below bar
      ctx.fillStyle = '#6b7280'
      ctx.font = '10px Arial'
      ctx.fillText(index.toString(), x + barWidth / 2, height - 40)
    })

    // Draw legend
    const legendY = 50
    const legendItems = [
      { color: '#fbbf24', label: 'Comparing' },
      { color: '#ef4444', label: 'Swapping' },
      { color: '#10b981', label: 'Completed' },
      { color: '#e5e7eb', label: 'Unsorted' }
    ]

    legendItems.forEach((item, index) => {
      const x = 20 + index * 100
      
      // Draw color box
      ctx.fillStyle = item.color
      ctx.fillRect(x, legendY, 15, 15)
      ctx.strokeStyle = '#374151'
      ctx.strokeRect(x, legendY, 15, 15)
      
      // Draw label
      ctx.fillStyle = '#374151'
      ctx.font = '12px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(item.label, x + 20, legendY + 12)
    })
  }

  const drawSelectionSort = (ctx, stepData, width, height) => {
    if (!stepData) return

    const { array, indices = [], type, message } = stepData
    const barWidth = Math.min(60, (width - 40) / array.length)
    const maxValue = Math.max(...array)
    const barMaxHeight = height - 120

    // Draw title
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Selection Sort Visualization', width / 2, 25)

    // Draw message
    ctx.fillStyle = '#4b5563'
    ctx.font = '14px Arial'
    ctx.fillText(message || '', width / 2, height - 20)

    // Draw bars
    array.forEach((value, index) => {
      const barHeight = (value / maxValue) * barMaxHeight
      const x = 20 + index * (barWidth + 5)
      const y = height - 60 - barHeight

      // Determine bar color based on step type and indices
      let color = '#e5e7eb' // default gray
      
      if (type === 'compare' && indices.includes(index)) {
        color = '#fbbf24' // yellow for comparison
      } else if (type === 'new_min' && indices.includes(index)) {
        color = '#3b82f6' // blue for new minimum
      } else if (type === 'swap' && indices.includes(index)) {
        color = '#ef4444' // red for swap
      } else if (type === 'pass_complete' && indices.includes(index)) {
        color = '#10b981' // green for completed
      } else if (type === 'pass_start' && indices.includes(index)) {
        color = '#8b5cf6' // purple for current position
      }

      // Draw bar
      ctx.fillStyle = color
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw border
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, barWidth, barHeight)

      // Draw value on top of bar
      ctx.fillStyle = '#1f2937'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(value.toString(), x + barWidth / 2, y - 5)

      // Draw index below bar
      ctx.fillStyle = '#6b7280'
      ctx.font = '10px Arial'
      ctx.fillText(index.toString(), x + barWidth / 2, height - 40)
    })

    // Draw legend
    const legendY = 50
    const legendItems = [
      { color: '#fbbf24', label: 'Comparing' },
      { color: '#3b82f6', label: 'New Min' },
      { color: '#ef4444', label: 'Swapping' },
      { color: '#10b981', label: 'Completed' },
      { color: '#8b5cf6', label: 'Current' }
    ]

    legendItems.forEach((item, index) => {
      const x = 20 + index * 90
      
      // Draw color box
      ctx.fillStyle = item.color
      ctx.fillRect(x, legendY, 15, 15)
      ctx.strokeStyle = '#374151'
      ctx.strokeRect(x, legendY, 15, 15)
      
      // Draw label
      ctx.fillStyle = '#374151'
      ctx.font = '12px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(item.label, x + 20, legendY + 12)
    })
  }

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full border border-gray-200 rounded-lg bg-white"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      {steps.length === 0 && (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Select an algorithm and input to start visualization</p>
        </div>
      )}
    </div>
  )
}

export default AlgorithmVisualizer

