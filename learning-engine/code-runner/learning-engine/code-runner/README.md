# Code Runner Module

## What This Module Does

This module is an **automated code tester** for a learning platform. It:

1. Takes student-submitted JavaScript code (as text/string)
2. Runs that code safely in an isolated environment
3. Tests it against predefined test cases
4. Reports whether the code works correctly

Think of it like an automated teaching assistant that grades coding exercises.

---

## How to Run It Locally

### Prerequisites

You need Node.js installed (version 18 or higher). Check if you have it:

```bash
node --version
```

If you don't have Node.js, download it from [nodejs.org](https://nodejs.org/)

### Running the Module

1. **Navigate to the directory** in your terminal:
   ```bash
   cd learning-engine/code-runner
   ```

2. **Install TypeScript** (if not already installed):
   ```bash
   npm install -g typescript
   npm install -g ts-node
   npm install --save-dev @types/node
   ```

3. **Run the test**:
   ```bash
   ts-node runCode.ts
   ```

This will execute the test section at the bottom of the file and show you the results.

---

## How It Works (Step-by-Step)

### Step 1: Define Test Cases
We create "quiz questions" that the student's code must solve:
```typescript
{ name: 'Add positive numbers', input: [2, 3], expected: 5 }
```
This means: "When we call add(2, 3), we expect to get 5"

### Step 2: Create a Safe Environment
We use Node.js's `vm` module to create a "sandbox" - an isolated space where student code runs safely without access to your computer's files.

### Step 3: Wrap the Student's Code
We wrap their code to capture the function they define:
```typescript
// Their code: function add(a, b) { return a + b; }
// We capture it as: studentFunction = add;
```

### Step 4: Execute the Code
We run their code inside the sandbox using `vm.runInContext()`.

### Step 5: Check if Function Exists
We verify they actually defined the function we expected.

### Step 6: Run Test Cases
We call their function with each test case's inputs and check if the output matches expected results.

### Step 7: Return Results
We format everything into a report showing which tests passed or failed.

---

## Example Usage in Another File

```typescript
import { runCode } from './runCode';

const studentSubmission = `
  function add(a, b) {
    return a + b;
  }
`;

const result = runCode(studentSubmission);

console.log('Did all tests pass?', result.passed);
console.log('Test output:', result.output);
```

---

## Key Assumptions

1. **Function Name**: Students must name their function `add`
2. **Function Parameters**: The function should accept two parameters (a, b)
3. **Exercise Type**: Currently tests a simple addition function
4. **Single Exercise**: Only supports one exercise at a time

To support different exercises, you would modify the test cases and the expected function name.

---

## Common Issues & Solutions

### Issue: "Cannot find module 'vm'"
**Solution**: The `vm` module is built into Node.js. Make sure you're using Node.js 18+

### Issue: "Type error" when running
**Solution**: Make sure TypeScript is installed:
```bash
npm install -g typescript
```

### Issue: Tests always fail
**Solution**: Check that the student's function name matches what the code expects (currently `add`)
