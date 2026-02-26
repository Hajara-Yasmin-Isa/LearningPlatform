import vm from "vm";    
// this brings in Node.js's vm module which is the tool that lets us run jacascript code in an isolated space
// it's sort of like creating a blank room to put the student's code inside and then running it there 

/**
 * Result returned by the runCode function
 */
// this is what the grader gives back
export interface RunCodeResult {
  passed: boolean;   // true or false if all tests passed
  output: string | null;   // formatted results text or nothing
  error: string | null;   // error message or nothing
  details?: TestCaseResult[];   // array of individual test case results
}

/**
 * Result for an individual test case
 */
interface TestCaseResult {
  input: unknown[];   // the input values for the test case
  expected: unknown;   // the expected output value (what we want back)
  actual: unknown;   // what the student's code actually returned
  passed: boolean;   // do the outputs match? did it pass or fail?
}

/**
 * Definition of a test case
 */
interface TestCase {
  input: unknown[];   // the input values for the test case
  expected: unknown;   // the expected output value (what we want back)
}

/**
 * Definition of an exercise
 */
interface Exercise {
  id: string;      // a unique identifier for the exercise
  title: string;   // the title of the exercise
  description: string;   // a description of the exercise
  functionName: string;   // the name of the function to test
  testCases: TestCase[];   // an array of test cases to run against the student's code
}

/**
 * Sample exercise: Sum of Two Numbers
 *
 * Students must implement a function called `add` that takes two numbers
 * and returns their sum.
 */
const sampleExercise: Exercise = {
  id: "add-two-numbers",
  title: "Sum of Two Numbers",
  description:
    "Write a function called `add` that takes two numbers as arguments and returns their sum.",
  functionName: "add",
  testCases: [
    { input: [1, 2], expected: 3 },
    { input: [0, 0], expected: 0 },
    { input: [-1, 1], expected: 0 },
    { input: [100, 200], expected: 300 },
    { input: [-5, -10], expected: -15 },
  ],
};

/**
 * Executes student-submitted JavaScript code against predefined test cases
 * and reports correctness.
 *
 * @param code - The student's JavaScript code as a string
 * @param exercise - The exercise to test against (defaults to sampleExercise)
 * @returns RunCodeResult with pass/fail status, output, and error information
 */
export function runCode(
  code: string,     // the student's JavaScript code as a string
  exercise: Exercise = sampleExercise   // the exercise to test against (defaults to sampleExercise if no exercise is provided)
): RunCodeResult {
  const results: TestCaseResult[] = [];

  try {
    // Create a VM context for code execution 
    const context = vm.createContext({});

    // Execute the student's code to define their function
    // this runs the student's code in the isolated context
    vm.runInContext(code, context, {
      timeout: 5000, // 5 second timeout to prevent infinite loops (prevents code from running forever)
    });
    // if student wrote broken code, it will fail here and jump to the catch block that returns passed: fail, etc.

    // Check if the required function exists
    // this makes sure that the student named the function the right thing
    const studentFunction = context[exercise.functionName];
    if (typeof studentFunction !== "function") {
      return {
        passed: false,
        output: null,
        error: `Function '${exercise.functionName}' is not defined. Make sure you define a function named '${exercise.functionName}'.`,
      };
    }

    // Loops through test cases and runs each test case
    for (const testCase of exercise.testCases) {
      try {
        // Call the student's function with test inputs
        const callCode = `${exercise.functionName}(${testCase.input.map((arg) => JSON.stringify(arg)).join(", ")})`;   // builds the call as a string
        const actual = vm.runInContext(callCode, context, {     // runs the call in the isolated context
          timeout: 1000, // 1 second per test case
        });

        const passed = deepEqual(actual, testCase.expected);

        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual,
          passed,
        });

        // Stop on first failure
        if (!passed) {
          return {
            passed: false,
            output: formatResults(results, exercise),
            error: null,
            details: results,
          };
        }
      } catch (err) {
        // Runtime error during test execution
        const errorMessage =
          err instanceof Error ? err.message : String(err);
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: `Error: ${errorMessage}`,
          passed: false,
        });

        return {
          passed: false,
          output: formatResults(results, exercise),
          error: `Runtime error during test: ${errorMessage}`,
          details: results,
        };
      }
    }

    // All tests passed
    return {
      passed: true,
      output: formatResults(results, exercise),
      error: null,
      details: results,
    };
  } catch (err) {
    // Syntax error or error in student code definition
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      passed: false,
      output: null,
      error: `Code execution error: ${errorMessage}`,
    };
  }
}

/**
 * Deep equality comparison for comparing expected vs actual values
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;    // if same num, string, boolean, etc. it's true

  if (typeof a !== typeof b) return false;   // if different types, it's false

  if (a === null || b === null) return a === b;   // if one is null, it's false

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;   // if different lengths, it's false
    return a.every((val, idx) => deepEqual(val, b[idx]));   // checks each value in the array
  }
  // uses recursion to check each value in the array

  if (typeof a === "object" && typeof b === "object") {
    const aObj = a as Record<string, unknown>;   
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);

    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
  }

  return false;
}

/**
 * Formats test results into a human-readable string
 */
function formatResults(results: TestCaseResult[], exercise: Exercise): string {
  const lines: string[] = [];
  lines.push(`Exercise: ${exercise.title}`);
  lines.push(`Function: ${exercise.functionName}`);
  lines.push("---");

  results.forEach((result, index) => {
    const status = result.passed ? "PASS" : "FAIL";
    const inputStr = result.input.map((arg) => JSON.stringify(arg)).join(", ");
    lines.push(`Test ${index + 1}: ${status}`);
    lines.push(`  Input: ${exercise.functionName}(${inputStr})`);
    lines.push(`  Expected: ${JSON.stringify(result.expected)}`);
    lines.push(`  Actual: ${JSON.stringify(result.actual)}`);
  });

  const passedCount = results.filter((r) => r.passed).length;
  lines.push("---");
  lines.push(`Results: ${passedCount}/${results.length} tests passed`);

  return lines.join("\n");
}

/**
 * Get the current sample exercise details
 */
export function getExercise(): Exercise {
  return sampleExercise;
}

// CLI entry point for testing
if (require.main === module) {
  console.log("Code Runner Module");
  console.log("==================\n");

  console.log("Sample Exercise:");
  console.log(`  Title: ${sampleExercise.title}`);
  console.log(`  Description: ${sampleExercise.description}`);
  console.log(`  Function to implement: ${sampleExercise.functionName}`);
  console.log(`  Number of test cases: ${sampleExercise.testCases.length}\n`);

  // Test with correct solution
  console.log("Testing with CORRECT solution:");
  console.log("  Code: function add(a, b) { return a + b; }\n");
  const correctResult = runCode("function add(a, b) { return a + b; }");
  console.log(`  Passed: ${correctResult.passed}`);
  console.log(`  Output:\n${correctResult.output?.split("\n").map((l) => "    " + l).join("\n")}\n`);

  // Test with incorrect solution
  console.log("Testing with INCORRECT solution:");
  console.log("  Code: function add(a, b) { return a - b; }\n");
  const incorrectResult = runCode("function add(a, b) { return a - b; }");
  console.log(`  Passed: ${incorrectResult.passed}`);
  console.log(`  Output:\n${incorrectResult.output?.split("\n").map((l) => "    " + l).join("\n")}\n`);

  // Test with syntax error
  console.log("Testing with SYNTAX ERROR:");
  console.log("  Code: function add(a, b { return a + b; }\n");
  const syntaxErrorResult = runCode("function add(a, b { return a + b; }");
  console.log(`  Passed: ${syntaxErrorResult.passed}`);
  console.log(`  Error: ${syntaxErrorResult.error}\n`);

  // Test with missing function
  console.log("Testing with MISSING FUNCTION:");
  console.log("  Code: function subtract(a, b) { return a - b; }\n");
  const missingFnResult = runCode("function subtract(a, b) { return a - b; }");
  console.log(`  Passed: ${missingFnResult.passed}`);
  console.log(`  Error: ${missingFnResult.error}`);
}
