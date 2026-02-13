// ============================================================================
// CODE RUNNER MODULE - Educational Learning Platform
// ============================================================================
// This module tests student-submitted JavaScript code against predefined tests
// File: learning-engine/code-runner/runCode.ts

import vm from 'vm';

// ============================================================================
// INTERFACES (Type Definitions)
// ============================================================================
// Think of interfaces as blueprints - they define what shape our data should have

/**
 * TestCase: Defines what one test looks like
 * Example: Testing if add(2, 3) returns 5
 */
interface TestCase {
  name: string;           // Human-readable description: "Add positive numbers"
  input: [number, number]; // The two numbers to test with: [2, 3]
  expected: number;       // What we expect the answer to be: 5
}

/**
 * TestResult: Stores the outcome of running one test
 */
interface TestResult {
  name: string;      // Which test was this?
  passed: boolean;   // Did it pass or fail?
  actual: any;       // What did the student's code actually return?
  expected: any;     // What should it have returned?
  error?: string;    // If there was an error, what was it?
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Runs student-submitted JavaScript code against predefined test cases
 * 
 * @param code - The student's JavaScript code as a string
 * @returns Object with test results and pass/fail status
 * 
 * EXAMPLE USAGE:
 * const result = runCode('function add(a, b) { return a + b; }');
 * console.log(result.passed); // true or false
 */
export function runCode(code: string): {
  passed: boolean;
  output: string | null;
  error: string | null;
  testResults?: TestResult[];
} {
  
  // --------------------------------------------------------------------------
  // STEP 1: Define Test Cases
  // --------------------------------------------------------------------------
  // These are the "quiz questions" we'll test the student's code against
  // For this example, we expect students to write a function called "add"
  
  const testCases: TestCase[] = [
    { name: 'Add positive numbers', input: [2, 3], expected: 5 },
    { name: 'Add negative numbers', input: [-1, -2], expected: -3 },
    { name: 'Add zero', input: [5, 0], expected: 5 },
    { name: 'Add decimals', input: [1.5, 2.5], expected: 4.0 },
  ];

  // --------------------------------------------------------------------------
  // STEP 2: Create a Safe Execution Environment
  // --------------------------------------------------------------------------
  // We create an isolated "sandbox" to run student code safely
  // This prevents students from accessing your computer's files or system
  
  const context = {
    // This will store the student's function after we run their code
    studentFunction: null as any,
    
    // We'll capture any console.log() output from their code
    console: {
      logs: [] as string[],
      log: (...args: any[]) => {
        context.console.logs.push(args.join(' '));
      },
    },
    
    // Storage for test results
    testResults: [] as TestResult[],
  };

  // --------------------------------------------------------------------------
  // STEP 3: Wrap Student Code
  // --------------------------------------------------------------------------
  // We wrap the student's code to capture their function
  // Students write: function add(a, b) { return a + b; }
  // We wrap it to grab that function and store it in our context
  
  const wrappedCode = `
    // Student's submitted code:
    ${code}
    
    // Capture their function (assuming they named it 'add')
    if (typeof add === 'function') {
      studentFunction = add;
    }
  `;

  try {
    // --------------------------------------------------------------------------
    // STEP 4: Execute the Student's Code
    // --------------------------------------------------------------------------
    // vm.createContext() creates the sandbox
    // vm.runInContext() runs code inside that sandbox
    
    vm.createContext(context);  // Prepare the sandbox
    vm.runInContext(wrappedCode, context);  // Run their code safely

    // --------------------------------------------------------------------------
    // STEP 5: Verify the Function Exists
    // --------------------------------------------------------------------------
    // Check if the student actually defined the function we expected
    
    if (!context.studentFunction) {
      return {
        passed: false,
        output: null,
        error: 'Could not find function named "add". Make sure to define function add(a, b) { ... }',
        testResults: [],
      };
    }

    // --------------------------------------------------------------------------
    // STEP 6: Run All Test Cases
    // --------------------------------------------------------------------------
    // Loop through each test and check if the student's code produces the
    // correct output
    
    let allPassed = true;  // Track if every test passed
    const testResults: TestResult[] = [];

    for (const testCase of testCases) {
      try {
        // Call the student's function with the test inputs
        const actual = context.studentFunction(...testCase.input);
        
        // Check if the output matches what we expected
        const passed = actual === testCase.expected;
        
        // Store the result
        testResults.push({
          name: testCase.name,
          passed,
          actual,
          expected: testCase.expected,
        });
        
        // If any test fails, set allPassed to false
        if (!passed) allPassed = false;
        
      } catch (error: any) {
        // If the student's function threw an error, record it
        allPassed = false;
        testResults.push({
          name: testCase.name,
          passed: false,
          actual: null,
          expected: testCase.expected,
          error: error.message,
        });
      }
    }

    // --------------------------------------------------------------------------
    // STEP 7: Format and Return Results
    // --------------------------------------------------------------------------
    // Create a readable output showing which tests passed/failed
    
    const consoleOutput = context.console.logs.join('\n');
    const output = testResults
      .map(r => `${r.passed ? '✓' : '✗'} ${r.name}: expected ${r.expected}, got ${r.actual}`)
      .join('\n');

    return {
      passed: allPassed,
      output: consoleOutput ? consoleOutput + '\n' + output : output,
      error: null,
      testResults,
    };

  } catch (error: any) {
    // --------------------------------------------------------------------------
    // STEP 8: Handle Fatal Errors
    // --------------------------------------------------------------------------
    // If something went really wrong (like syntax errors), report it
    
    return {
      passed: false,
      output: null,
      error: `Error executing code: ${error.message}`,
      testResults: [],
    };
  }
}

// ============================================================================
// TESTING SECTION (only runs when you execute this file directly)
// ============================================================================
// This section lets you test the module locally

if (require.main === module) {
  console.log('='.repeat(60));
  console.log('TESTING CODE RUNNER MODULE');
  console.log('='.repeat(60));
  
  // Example: Student submits this code
  const studentCode = `
    function add(a, b) {
      return a + b;
    }
  `;

  console.log('\nStudent Code:');
  console.log(studentCode);
  
  console.log('\nRunning tests...\n');
  const result = runCode(studentCode);

  console.log('Passed:', result.passed);
  console.log('\nOutput:');
  console.log(result.output);
  
  if (result.error) {
    console.log('\nError:', result.error);
  }
  
  console.log('\n' + '='.repeat(60));
}