def bubble_sort(arr):
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
    print(f"Number of steps: {len(steps)}")

