import { matchingEngine, getShuffledRightItems, MatchingPair } from "./matchingEngine";

// --- Sample exercise: Programming terms and definitions ---

const samplePairs: MatchingPair[] = [
  { left: "Variable", right: "A container that stores a value" },
  { left: "Function", right: "A reusable block of code" },
  { left: "Loop", right: "Repeats a block of code" },
  { left: "Array", right: "An ordered list of values" },
  { left: "Boolean", right: "A value that is true or false" },
];

console.log("Matching Engine Demo");
console.log("====================\n");

console.log("Exercise: Match each programming term to its definition");
console.log("Correct pairs:");
samplePairs.forEach((p) => console.log(`  "${p.left}" → "${p.right}"`));
console.log();

// --- Test 1: All correct ---

console.log("Test 1: All correct matches");
const allCorrect = matchingEngine(samplePairs, [
  { left: "Variable", right: "A container that stores a value" },
  { left: "Function", right: "A reusable block of code" },
  { left: "Loop", right: "Repeats a block of code" },
  { left: "Array", right: "An ordered list of values" },
  { left: "Boolean", right: "A value that is true or false" },
]);
console.log(`  Passed: ${allCorrect.correct}`);
console.log(`  Score: ${allCorrect.correctMatches}/${allCorrect.totalMatches}`);
console.log("  Feedback:");
allCorrect.feedback.forEach((f) =>
  console.log(`    [${f.isCorrect ? "CORRECT" : "WRONG  "}] "${f.left}" → "${f.right}"`)
);
console.log();

// --- Test 2: Some incorrect ---

console.log("Test 2: Some incorrect matches");
const someWrong = matchingEngine(samplePairs, [
  { left: "Variable", right: "A container that stores a value" },
  { left: "Function", right: "Repeats a block of code" },       // wrong
  { left: "Loop", right: "A reusable block of code" },          // wrong
  { left: "Array", right: "An ordered list of values" },
  { left: "Boolean", right: "A value that is true or false" },
]);
console.log(`  Passed: ${someWrong.correct}`);
console.log(`  Score: ${someWrong.correctMatches}/${someWrong.totalMatches}`);
console.log("  Feedback:");
someWrong.feedback.forEach((f) =>
  console.log(`    [${f.isCorrect ? "CORRECT" : "WRONG  "}] "${f.left}" → "${f.right}"`)
);
console.log();

// --- Test 3: All incorrect ---

console.log("Test 3: All incorrect matches");
const allWrong = matchingEngine(samplePairs, [
  { left: "Variable", right: "A reusable block of code" },
  { left: "Function", right: "Repeats a block of code" },
  { left: "Loop", right: "An ordered list of values" },
  { left: "Array", right: "A value that is true or false" },
  { left: "Boolean", right: "A container that stores a value" },
]);
console.log(`  Passed: ${allWrong.correct}`);
console.log(`  Score: ${allWrong.correctMatches}/${allWrong.totalMatches}`);
console.log("  Feedback:");
allWrong.feedback.forEach((f) =>
  console.log(`    [${f.isCorrect ? "CORRECT" : "WRONG  "}] "${f.left}" → "${f.right}"`)
);
console.log();

// --- Test 4: Wrong number of matches ---

console.log("Test 4: Wrong number of matches (only 3 submitted)");
const tooFew = matchingEngine(samplePairs, [
  { left: "Variable", right: "A container that stores a value" },
  { left: "Function", right: "A reusable block of code" },
  { left: "Loop", right: "Repeats a block of code" },
]);
console.log(`  Passed: ${tooFew.correct}`);
console.log(`  Error: ${tooFew.error}`);
console.log();

// --- Test 5: Duplicate left item ---

console.log("Test 5: Duplicate left item in student matches");
const duplicate = matchingEngine(samplePairs, [
  { left: "Variable", right: "A container that stores a value" },
  { left: "Variable", right: "A reusable block of code" },      // duplicate
  { left: "Loop", right: "Repeats a block of code" },
  { left: "Array", right: "An ordered list of values" },
  { left: "Boolean", right: "A value that is true or false" },
]);
console.log(`  Passed: ${duplicate.correct}`);
console.log(`  Error: ${duplicate.error}`);
console.log();

// --- Shuffle demo ---

console.log("Shuffled right-column items (for presenting the exercise):");
console.log(" ", getShuffledRightItems(samplePairs));
