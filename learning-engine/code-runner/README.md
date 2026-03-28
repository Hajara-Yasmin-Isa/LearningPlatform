# Code Runner Module

## What This Module Does

A local code-running module that executes student-submitted JavaScript code against predefined test cases and reports correctness. It accepts a student's code as a string, runs it against expected outputs, and returns whether the code passed or failed along with any error details.

## How to Run Locally

From the project root (`LearningPlatform/`):

```bash
npx tsx learning-engine/code-runner/runCode.ts
```

This runs the built-in demo which tests 4 scenarios: correct code, incorrect code, a syntax error, and a missing function name.

## Example Input/Output

**Correct solution:**

```
Input:  function add(a, b) { return a + b; }
Output: { passed: true, output: "...Results: 5/5 tests passed", error: null }
```

**Incorrect solution:**

```
Input:  function add(a, b) { return a - b; }
Output: { passed: false, output: "...Test 1: FAIL...", error: null }
```

**Syntax error:**

```
Input:  function add(a, b { return a + b; }
Output: { passed: false, output: null, error: "Code execution error: SyntaxError: Unexpected token '{'" }
```

**Missing function:**

```
Input:  function subtract(a, b) { return a - b; }
Output: { passed: false, output: null, error: "Function 'add' is not defined..." }
```

## Assumptions

1. Only one hardcoded exercise is supported (Sum of Two Numbers)
2. Student code must be valid JavaScript (not TypeScript)
3. Student code must define a named function matching the exercise requirement
4. No security sandboxing — suitable for local/trusted execution only
5. Only synchronous code is supported (no async/Promises)
6. Execution stops at the first failing test case
7. Timeouts: 5 seconds for code definition, 1 second per test case
