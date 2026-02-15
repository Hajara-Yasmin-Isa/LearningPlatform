# Code Runner Module

A local code-running module that executes student-submitted JavaScript code against predefined test cases and reports correctness.

## What This Module Does

This module is part of the learning engine and provides:

- **Code Execution**: Accepts student-submitted JavaScript code as a string
- **Test Evaluation**: Runs the code against predefined test cases
- **Result Comparison**: Compares actual outputs with expected results
- **Error Handling**: Captures and reports syntax errors, runtime errors, and missing functions
- **Structured Results**: Returns pass/fail status with detailed information

## Prerequisites

- Node.js 18+
- TypeScript
- `tsx` (recommended for running TypeScript directly)

## Installation

From the project root (`LearningPlatform/`):

```bash
# Install tsx globally (if not already installed)
npm install -g tsx

# Or install as a dev dependency
npm install --save-dev tsx
```

## How to Run Locally

### Option 1: Using tsx (Recommended)

```bash
# From the LearningPlatform directory
npx tsx learning-engine/code-runner/runCode.ts
```

### Option 2: Using ts-node

```bash
npx ts-node learning-engine/code-runner/runCode.ts
```

### Option 3: Compile and Run

```bash
# Compile TypeScript
npx tsc learning-engine/code-runner/runCode.ts --outDir dist --esModuleInterop

# Run compiled JavaScript
node dist/runCode.js
```

## Function Interface

```typescript
runCode(code: string) → {
  passed: boolean,      // Whether all tests passed
  output: string | null, // Formatted test results
  error: string | null,  // Error message if execution failed
  details?: TestCaseResult[] // Detailed results per test case
}
```

### Parameters

- `code` (string): The student's JavaScript code to evaluate

### Return Value

| Field | Type | Description |
|-------|------|-------------|
| `passed` | `boolean` | `true` if all test cases passed, `false` otherwise |
| `output` | `string \| null` | Human-readable formatted test results |
| `error` | `string \| null` | Error message if code execution failed |
| `details` | `TestCaseResult[]` | (Optional) Array of individual test case results |

## Sample Exercise

The module includes a hardcoded exercise: **Sum of Two Numbers**

**Task**: Write a function called `add` that takes two numbers as arguments and returns their sum.

**Test Cases**:
| Input | Expected Output |
|-------|-----------------|
| `add(1, 2)` | `3` |
| `add(0, 0)` | `0` |
| `add(-1, 1)` | `0` |
| `add(100, 200)` | `300` |
| `add(-5, -10)` | `-15` |

## Example Usage

### Importing the Module

```typescript
import { runCode, getExercise } from './runCode';

// Get exercise details
const exercise = getExercise();
console.log(exercise.title);       // "Sum of Two Numbers"
console.log(exercise.description); // "Write a function called `add`..."

// Test student code
const studentCode = `
function add(a, b) {
  return a + b;
}
`;

const result = runCode(studentCode);
console.log(result.passed); // true
console.log(result.output); // Formatted test results
```

### Example: Correct Solution

**Input:**
```javascript
function add(a, b) {
  return a + b;
}
```

**Output:**
```javascript
{
  passed: true,
  output: "Exercise: Sum of Two Numbers\nFunction: add\n---\nTest 1: PASS\n  Input: add(1, 2)\n  Expected: 3\n  Actual: 3\n...\nResults: 5/5 tests passed",
  error: null,
  details: [...]
}
```

### Example: Incorrect Solution

**Input:**
```javascript
function add(a, b) {
  return a - b;  // Wrong operation!
}
```

**Output:**
```javascript
{
  passed: false,
  output: "Exercise: Sum of Two Numbers\nFunction: add\n---\nTest 1: FAIL\n  Input: add(1, 2)\n  Expected: 3\n  Actual: -1\n...\nResults: 0/1 tests passed",
  error: null,
  details: [...]
}
```

### Example: Syntax Error

**Input:**
```javascript
function add(a, b {  // Missing closing parenthesis
  return a + b;
}
```

**Output:**
```javascript
{
  passed: false,
  output: null,
  error: "Code execution error: Unexpected token '{'"
}
```

### Example: Missing Function

**Input:**
```javascript
function subtract(a, b) {  // Wrong function name
  return a - b;
}
```

**Output:**
```javascript
{
  passed: false,
  output: null,
  error: "Function 'add' is not defined. Make sure you define a function named 'add'."
}
```

## Assumptions

1. **Single Exercise**: The module currently supports one hardcoded exercise. Future versions will support multiple exercises.

2. **JavaScript Only**: Student code must be valid JavaScript. TypeScript code is not directly supported.

3. **Function-Based**: The exercise expects students to define a named function. Other code patterns (classes, arrow functions assigned to variables) will work as long as the function name is accessible.

4. **No Sandboxing**: The code runs in a Node.js VM context with a timeout but without security sandboxing. This is suitable for trusted/local execution only.

5. **Synchronous Execution**: Student code is expected to be synchronous. Async functions and Promises are not tested.

6. **Timeout Limits**:
   - Code definition: 5 seconds
   - Per test case: 1 second

7. **Stop on First Failure**: Test execution stops at the first failing test case.

## Module Structure

```
learning-engine/
└── code-runner/
    ├── runCode.ts    # Main runner implementation
    └── README.md     # This file
```

## Exported Functions

| Function | Description |
|----------|-------------|
| `runCode(code: string)` | Executes code against test cases and returns results |
| `getExercise()` | Returns the current exercise definition |

## Error Handling

The module handles the following error scenarios:

1. **Syntax Errors**: Invalid JavaScript syntax in student code
2. **Runtime Errors**: Errors thrown during code execution
3. **Missing Functions**: Required function not defined
4. **Timeout**: Code takes too long to execute (prevents infinite loops)

## Future Enhancements

- Support for multiple exercises
- Dynamic exercise loading
- Async code testing
- Security sandboxing
- Integration with backend services
- UI integration

## Dependencies

This module uses only Node.js built-in modules:
- `vm` - For isolated code execution

No external dependencies required.
