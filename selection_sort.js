function selectionSort(arr) {
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
            message: `Starting pass ${i + 1}. Looking for minimum element from index ${i}`
        });
        
        for (let j = i + 1; j < n; j++) {
            // Record comparison step
            steps.push({
                type: 'compare',
                indices: [minIndex, j],
                array: [...arrCopy],
                message: `Comparing elements at indices ${minIndex} (${arrCopy[minIndex]}) and ${j} (${arrCopy[j]})`
            });
            
            if (arrCopy[j] < arrCopy[minIndex]) {
                minIndex = j;
                steps.push({
                    type: 'new_min',
                    indices: [minIndex],
                    array: [...arrCopy],
                    message: `New minimum found at index ${minIndex} with value ${arrCopy[minIndex]}`
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
                message: `Swapped elements at indices ${i} and ${minIndex}`
            });
        }
        
        // Record completion of pass
        steps.push({
            type: 'pass_complete',
            indices: [i],
            array: [...arrCopy],
            message: `Pass ${i + 1} complete. Element at index ${i} is in final position`
        });
    }
    
    return steps;
}

// Example usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = selectionSort;
} else {
    // Browser environment
    window.selectionSort = selectionSort;
}

// Test example
const testArray = [64, 34, 25, 12, 22, 11, 90];
console.log(`Original array: ${testArray}`);
const steps = selectionSort(testArray);
console.log(`Number of steps: ${steps.length}`);

