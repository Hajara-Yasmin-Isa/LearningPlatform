import { Worker } from 'worker_threads';
// worker_threads lets us run the student's code on a separate thread,
// so if it never finishes we can terminate it without freezing the server

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
export interface TestCaseResult {
  input: unknown[];   // the input values for the test case
  expected: unknown;   // the expected output value (what we want back)
  actual: unknown;   // what the student's code actually returned
  passed: boolean;   // do the outputs match? did it pass or fail?
}

/**
 * Definition of a test case
 */
export interface TestCase {
  input: unknown[];   // the input values for the test case
  expected: unknown;   // the expected output value (what we want back)
}

/** How long the student's code gets before we kill the worker. */
const TIMEOUT_MS = 5000;

/**
 * Runs inside the worker thread. It's a string so we can spawn the worker with
 * `eval: true` instead of pointing at a separate file. The worker only executes;
 * the main thread does the comparing and formatting.
 */
const WORKER_SOURCE = `
const { parentPort, workerData } = require('worker_threads');
const { code, functionName, testCases } = workerData;

try {
  // newline before the return in case the student's code ends in a // comment
  const factory = new Function(
    code + '\\n; return typeof ' + functionName + " === 'function' ? " + functionName + ' : undefined;'
  );
  const studentFunction = factory();

  if (typeof studentFunction !== 'function') {
    parentPort.postMessage({ kind: 'not-defined' });
  } else {
    const actuals = testCases.map(function (testCase) {
      try {
        return { threw: false, value: studentFunction.apply(null, testCase.input) };
      } catch (err) {
        return { threw: true, message: err instanceof Error ? err.message : String(err) };
      }
    });
    parentPort.postMessage({ kind: 'ran', actuals: actuals });
  }
} catch (err) {
  parentPort.postMessage({
    kind: 'compile-error',
    message: err instanceof Error ? err.message : String(err),
  });
}
`;

/**
 * Worker source for script mode. Same idea as WORKER_SOURCE, but instead of
 * grading a function it just runs the code and collects whatever it logged.
 */
const SCRIPT_WORKER_SOURCE = `
const { parentPort, workerData } = require('worker_threads');
const { code } = workerData;

const logs = [];

function stringify(value) {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

// the student's code gets our console instead of the real one, so their
// output ends up in this array rather than the server's terminal
const captured = {
  log: function () { logs.push(Array.prototype.map.call(arguments, stringify).join(' ')); },
  error: function () { logs.push(Array.prototype.map.call(arguments, stringify).join(' ')); },
  warn: function () { logs.push(Array.prototype.map.call(arguments, stringify).join(' ')); },
};

try {
  new Function('console', code)(captured);
  parentPort.postMessage({ kind: 'ok', logs: logs });
} catch (err) {
  parentPort.postMessage({
    kind: 'threw',
    logs: logs,
    message: err instanceof Error ? err.message : String(err),
  });
}
`;


/**
 * Executes student-submitted JavaScript code against predefined test cases
 * and reports correctness.
 *
 * @param code - The student's JavaScript code as a string
 * @param language - Which language to run the code as; only 'javascript' for now
 * @param [functionName] - The name of the function to call and test (when there are test cases)
 * @param [testCases] - The inputs and expected outputs to check the function against
 * @returns RunCodeResult with pass/fail status, output, and error information
 */
export async function runCode(
  code: string,     // the student's JavaScript code as a string
  language: string,
  functionName?: string,
  testCases?: TestCase[]

): Promise<RunCodeResult> {
  if (language !== 'javascript') { // in future will likely allow for other languages 
    return {passed: false, output: null, error:  `Unsupported language: ${language}`}

  }
  if (testCases && testCases.length > 0) {
    return runWithTestCases(code, functionName, testCases);
  }
  return runAsScript(code);
}

/**
 * Shared worker plumbing: spawns a worker, enforces the timeout, and returns
 * whichever of message / error / timeout lands first.
 *
 * @param source - the worker script to run (a string, spawned with eval: true)
 * @param workerData - the values handed to that script
 * @param onMessage - turns the worker's message into a RunCodeResult
 */
function runInWorker(
  source: string,
  workerData: Record<string, unknown>,
  onMessage: (msg: any) => RunCodeResult
): Promise<RunCodeResult> {
  return new Promise((resolve) => {
    const worker = new Worker(source, { eval: true, workerData });

    function finish(result: RunCodeResult) {
      clearTimeout(timer);
      worker.terminate();
      resolve(result);
    }

    // the real guard: terminate() kills the thread even mid-loop,
    // which new Function() on the main thread could never do
    const timer = setTimeout(() => {
      finish({
        passed: false,
        output: null,
        error: 'Your code took too long to run. Check for an infinite loop.',
      });
    }, TIMEOUT_MS);

    worker.on('message', (msg) => finish(onMessage(msg)));

    // worker crashed outright
    worker.on('error', (err) => {
      finish({ passed: false, output: null, error: `Code execution error: ${err.message}` });
    });
  });
}

/**
 * Grades the student's function against each test case, inside a worker thread
 * so that an infinite loop can actually be killed.
 */
function runWithTestCases(
  code: string,
  functionName: string | undefined,
  testCases: TestCase[]
): Promise<RunCodeResult> {
  if (!functionName) {
    return Promise.resolve({
      passed: false,
      output: null,
      error: 'No function name given for this exercise.',
    });
  }

  return runInWorker(WORKER_SOURCE, { code, functionName, testCases }, (msg) => {
    if (msg.kind === 'compile-error') {
      return { passed: false, output: null, error: `Code execution error: ${msg.message}` };
    }

    if (msg.kind === 'not-defined') {
      return {
        passed: false,
        output: null,
        error: `Function '${functionName}' is not defined. Make sure you define a function named '${functionName}'.`,
      };
    }

    // compare what came back against what we expected
    const results: TestCaseResult[] = testCases.map((testCase, i) => {
      const actual = msg.actuals[i];

      if (actual.threw) {
        return {
          input: testCase.input,
          expected: testCase.expected,
          actual: `Error: ${actual.message}`,
          passed: false,
        };
      }

      return {
        input: testCase.input,
        expected: testCase.expected,
        actual: actual.value,
        passed: deepEqual(actual.value, testCase.expected),
      };
    });

    return {
      passed: results.every((r) => r.passed),
      output: formatResults(results, functionName),
      error: null,
      details: results,
    };
  });
}

/**
 * Runs the code as a plain script with no grading, and returns whatever it logged.
 * Also in a worker, so a runaway loop can be terminated.
 */
function runAsScript(code: string): Promise<RunCodeResult> {
  return runInWorker(SCRIPT_WORKER_SOURCE, { code }, (msg) => {
    if (msg.kind === 'threw') {
      return {
        passed: false,
        output: msg.logs.length > 0 ? msg.logs.join('\n') : null,
        error: msg.message,
      };
    }

    return { passed: true, output: msg.logs.join('\n'), error: null };
  });
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
function formatResults(results: TestCaseResult[], functionName: string): string {
  const lines: string[] = [];
  lines.push(`Function: ${functionName}`);
  lines.push("---");

  results.forEach((result, index) => {
    const status = result.passed ? "PASS" : "FAIL";
    const inputStr = result.input.map((arg) => JSON.stringify(arg)).join(", ");
    lines.push(`Test ${index + 1}: ${status}`);
    lines.push(`  Input: ${functionName}(${inputStr})`);
    lines.push(`  Expected: ${JSON.stringify(result.expected)}`);
    lines.push(`  Actual: ${JSON.stringify(result.actual)}`);
  });

  const passedCount = results.filter((r) => r.passed).length;
  lines.push("---");
  lines.push(`Results: ${passedCount}/${results.length} tests passed`);

  return lines.join("\n");
}

