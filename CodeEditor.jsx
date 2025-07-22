import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge.jsx'

const CodeEditor = ({ algorithm, language, algorithmInfo }) => {
  const [code, setCode] = useState('')

  // Sample code for different algorithms and languages
  const codeTemplates = {
    bubble_sort: {
      javascript: `function bubbleSort(arr) {
    /**
     * Bubble Sort Algorithm
     * Time Complexity: O(n²)
     * Space Complexity: O(1)
     */
    const n = arr.length;
    const steps = [];
    
    // Create a copy to avoid modifying original
    const arrCopy = [...arr];
    
    for (let i = 0; i < n; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            // Record comparison step
            steps.push({
                type: 'compare',
                indices: [j, j + 1],
                array: [...arrCopy],
                message: \`Comparing elements at indices \${j} and \${j + 1}\`
            });
            
            if (arrCopy[j] > arrCopy[j + 1]) {
                // Record swap step
                [arrCopy[j], arrCopy[j + 1]] = [arrCopy[j + 1], arrCopy[j]];
                swapped = true;
                steps.push({
                    type: 'swap',
                    indices: [j, j + 1],
                    array: [...arrCopy],
                    message: \`Swapped elements at indices \${j} and \${j + 1}\`
                });
            }
        }
        
        // Record completion of pass
        steps.push({
            type: 'pass_complete',
            indices: [n - i - 1],
            array: [...arrCopy],
            message: \`Pass \${i + 1} complete. Element at index \${n - i - 1} is in final position\`
        });
        
        if (!swapped) {
            break;
        }
    }
    
    return steps;
}

// Example usage
const testArray = [64, 34, 25, 12, 22, 11, 90];
console.log('Original array:', testArray);
const steps = bubbleSort(testArray);
console.log('Number of steps:', steps.length);`,
      python: `def bubble_sort(arr):
    """
    Bubble Sort Algorithm
    Time Complexity: O(n²)
    Space Complexity: O(1)
    """
    n = len(arr)
    steps = []
    
    # Create a copy to avoid modifying original
    arr_copy = arr.copy()
    
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            # Record comparison step
            steps.append({
                'type': 'compare',
                'indices': [j, j + 1],
                'array': arr_copy.copy(),
                'message': f'Comparing elements at indices {j} and {j + 1}'
            })
            
            if arr_copy[j] > arr_copy[j + 1]:
                # Record swap step
                arr_copy[j], arr_copy[j + 1] = arr_copy[j + 1], arr_copy[j]
                swapped = True
                steps.append({
                    'type': 'swap',
                    'indices': [j, j + 1],
                    'array': arr_copy.copy(),
                    'message': f'Swapped elements at indices {j} and {j + 1}'
                })
        
        # Record completion of pass
        steps.append({
            'type': 'pass_complete',
            'indices': [n - i - 1],
            'array': arr_copy.copy(),
            'message': f'Pass {i + 1} complete. Element at index {n - i - 1} is in final position'
        })
        
        if not swapped:
            break
    
    return steps

# Example usage
if __name__ == "__main__":
    test_array = [64, 34, 25, 12, 22, 11, 90]
    steps = bubble_sort(test_array)
    print(f"Original array: {test_array}")
    print(f"Number of steps: {len(steps)}")`,
      cpp: `#include <iostream>
#include <vector>
#include <string>

struct Step {
    std::string type;
    std::vector<int> indices;
    std::vector<int> array;
    std::string message;
};

std::vector<Step> bubbleSort(std::vector<int> arr) {
    /*
     * Bubble Sort Algorithm
     * Time Complexity: O(n²)
     * Space Complexity: O(1)
     */
    int n = arr.size();
    std::vector<Step> steps;
    
    for (int i = 0; i < n; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            // Record comparison step
            Step compareStep;
            compareStep.type = "compare";
            compareStep.indices = {j, j + 1};
            compareStep.array = arr;
            compareStep.message = "Comparing elements at indices " + 
                                std::to_string(j) + " and " + std::to_string(j + 1);
            steps.push_back(compareStep);
            
            if (arr[j] > arr[j + 1]) {
                // Record swap step
                std::swap(arr[j], arr[j + 1]);
                swapped = true;
                Step swapStep;
                swapStep.type = "swap";
                swapStep.indices = {j, j + 1};
                swapStep.array = arr;
                swapStep.message = "Swapped elements at indices " + 
                                 std::to_string(j) + " and " + std::to_string(j + 1);
                steps.push_back(swapStep);
            }
        }
        
        // Record completion of pass
        Step passStep;
        passStep.type = "pass_complete";
        passStep.indices = {n - i - 1};
        passStep.array = arr;
        passStep.message = "Pass " + std::to_string(i + 1) + 
                         " complete. Element at index " + std::to_string(n - i - 1) + 
                         " is in final position";
        steps.push_back(passStep);
        
        if (!swapped) {
            break;
        }
    }
    
    return steps;
}

int main() {
    std::vector<int> testArray = {64, 34, 25, 12, 22, 11, 90};
    std::cout << "Original array: ";
    for (int num : testArray) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    
    std::vector<Step> steps = bubbleSort(testArray);
    std::cout << "Number of steps: " << steps.size() << std::endl;
    
    return 0;
}`
    },
    selection_sort: {
      javascript: `function selectionSort(arr) {
    /**
     * Selection Sort Algorithm
     * Time Complexity: O(n²)
     * Space Complexity: O(1)
     */
    const n = arr.length;
    const steps = [];
    
    // Create a copy to avoid modifying original
    const arrCopy = [...arr];
    
    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;
        
        // Record start of new pass
        steps.push({
            type: 'pass_start',
            indices: [i],
            array: [...arrCopy],
            message: \`Starting pass \${i + 1}. Looking for minimum element from index \${i}\`
        });
        
        for (let j = i + 1; j < n; j++) {
            // Record comparison step
            steps.push({
                type: 'compare',
                indices: [minIndex, j],
                array: [...arrCopy],
                message: \`Comparing elements at indices \${minIndex} (\${arrCopy[minIndex]}) and \${j} (\${arrCopy[j]})\`
            });
            
            if (arrCopy[j] < arrCopy[minIndex]) {
                minIndex = j;
                steps.push({
                    type: 'new_min',
                    indices: [minIndex],
                    array: [...arrCopy],
                    message: \`New minimum found at index \${minIndex} with value \${arrCopy[minIndex]}\`
                });
            }
        }
        
        // Swap if needed
        if (minIndex !== i) {
            [arrCopy[i], arrCopy[minIndex]] = [arrCopy[minIndex], arrCopy[i]];
            steps.push({
                type: 'swap',
                indices: [i, minIndex],
                array: [...arrCopy],
                message: \`Swapped elements at indices \${i} and \${minIndex}\`
            });
        }
        
        // Record completion of pass
        steps.push({
            type: 'pass_complete',
            indices: [i],
            array: [...arrCopy],
            message: \`Pass \${i + 1} complete. Element at index \${i} is in final position\`
        });
    }
    
    return steps;
}

// Example usage
const testArray = [64, 34, 25, 12, 22, 11, 90];
console.log('Original array:', testArray);
const steps = selectionSort(testArray);
console.log('Number of steps:', steps.length);`
    }
  }

  useEffect(() => {
    if (codeTemplates[algorithm] && codeTemplates[algorithm][language]) {
      setCode(codeTemplates[algorithm][language])
    } else {
      setCode('// Code not available for this algorithm and language combination')
    }
  }, [algorithm, language])

  const getLanguageClass = (lang) => {
    const classes = {
      javascript: 'language-javascript',
      python: 'language-python',
      cpp: 'language-cpp'
    }
    return classes[lang] || 'language-text'
  }

  return (
    <div className="space-y-4">
      {/* Algorithm Info */}
      {algorithmInfo && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">{algorithmInfo.name}</h3>
            <Badge variant="secondary">Time: {algorithmInfo.timeComplexity}</Badge>
            <Badge variant="outline">Space: {algorithmInfo.spaceComplexity}</Badge>
          </div>
          <p className="text-sm text-gray-600">{algorithmInfo.description}</p>
        </div>
      )}

      {/* Code Display */}
      <div className="relative">
        <div className="absolute top-2 right-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {language.toUpperCase()}
        </div>
        <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto text-sm">
          <code className={getLanguageClass(language)}>
            {code}
          </code>
        </pre>
      </div>

      {/* Code Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Compares adjacent elements in the array</li>
          <li>• Swaps them if they are in the wrong order</li>
          <li>• Repeats until no more swaps are needed</li>
          <li>• Each pass moves the largest unsorted element to its final position</li>
        </ul>
      </div>
    </div>
  )
}

export default CodeEditor

