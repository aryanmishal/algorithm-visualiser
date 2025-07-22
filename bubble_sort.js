function bubbleSort(arr) {
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
                message: `Comparing elements at indices ${j} and ${j + 1}`
            });
            
            if (arrCopy[j] > arrCopy[j + 1]) {
                // Record swap step
                [arrCopy[j], arrCopy[j + 1]] = [arrCopy[j + 1], arrCopy[j]];
                swapped = true;
                steps.push({
                    type: 'swap',
                    indices: [j, j + 1],
                    array: [...arrCopy],
                    message: `Swapped elements at indices ${j} and ${j + 1}`
                });
            }
        }
        
        // Record completion of pass
        steps.push({
            type: 'pass_complete',
            indices: [n - i - 1],
            array: [...arrCopy],
            message: `Pass ${i + 1} complete. Element at index ${n - i - 1} is in final position`
        });
        
        if (!swapped) {
            break;
        }
    }
    
    return steps;
}

// Example usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = bubbleSort;
} else {
    // Browser environment
    window.bubbleSort = bubbleSort;
}

// Test example
const testArray = [64, 34, 25, 12, 22, 11, 90];
console.log(`Original array: ${testArray}`);
const steps = bubbleSort(testArray);
console.log(`Number of steps: ${steps.length}`);

