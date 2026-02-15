import vm from "vm";

/**
 * Result returned by the runCode function
 */
export interface RunCodeResult {
  passed: boolean;
  output: string | null;
  error: string | null;
  details?: TestCaseResult[];
}

/**
 * Result for an individual test case
 */
interface TestCaseResult {
  input: unknown[];
  expected: unknown;
  actual: unknown;
  passed: boolean;
}

/**
 * Definition of a test case
 */
interface TestCase {
  input: unknown[];
  expected: unknown;
}

/**
 * Definition of an exercise
 */
interface Exercise {
  id: string;
  title: string;
  description: string;
  functionName: string;
  testCases: TestCase[];
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
  code: string,
  exercise: Exercise = sampleExercise
): RunCodeResult {
  const results: TestCaseResult[] = [];

  try {
    // Create a VM context for code execution
    const context = vm.createContext({});

    // Execute the student's code to define their function
    vm.runInContext(code, context, {
      timeout: 5000, // 5 second timeout to prevent infinite loops
    });

    // Check if the required function exists
    const studentFunction = context[exercise.functionName];
    if (typeof studentFunction !== "function") {
      return {
        passed: false,
        output: null,
        error: `Function '${exercise.functionName}' is not defined. Make sure you define a function named '${exercise.functionName}'.`,
      };
    }

    // Run each test case
    for (const testCase of exercise.testCases) {
      try {
        // Call the student's function with test inputs
        const callCode = `${exercise.functionName}(${testCase.input.map((arg) => JSON.stringify(arg)).join(", ")})`;
        const actual = vm.runInContext(callCode, context, {
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
  if (a === b) return true;

  if (typeof a !== typeof b) return false;

  if (a === null || b === null) return a === b;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => deepEqual(val, b[idx]));
  }

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
