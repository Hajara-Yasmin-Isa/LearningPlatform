/**
 * A correct pair in the exercise — what the right answer looks like.
 * left: the term or prompt shown to the student
 * right: the correct match for that term
 */
export interface MatchingPair {
  left: string;
  right: string;
}

/**
 * A single match submitted by the student.
 * left: the term they were matching
 * right: the answer they chose for it
 */
export interface StudentMatch {
  left: string;
  right: string;
}

/**
 * Feedback for a single student match — was it right or wrong?
 */
export interface MatchFeedback {
  left: string;
  right: string;
  isCorrect: boolean;
}

/**
 * The full result returned by matchingEngine.
 */
export interface MatchingResult {
  correct: boolean;                 // true only if every match is correct
  correctMatches: number;           // how many matches were right
  totalMatches: number;             // how many matches were submitted
  feedback: MatchFeedback[];        // breakdown for each match
  error: string | null;             // error message if input was invalid
}

/**
 * Validates student matches against the correct pairs.
 *
 * @param pairs - the correct pairs (the answer key)
 * @param studentMatches - the matches the student submitted
 * @returns MatchingResult with pass/fail status and per-match feedback
 */
export function matchingEngine(
  pairs: MatchingPair[],
  studentMatches: StudentMatch[]
): MatchingResult {
  // --- Input validation ---

  // are both inputs actually arrays?
  if (!Array.isArray(pairs) || !Array.isArray(studentMatches)) {
    return {
      correct: false,
      correctMatches: 0,
      totalMatches: 0,
      feedback: [],
      error: "Invalid input: pairs and studentMatches must both be arrays.",
    };
  }

  // is the pairs array empty?
  if (pairs.length === 0) {
    return {
      correct: false,
      correctMatches: 0,
      totalMatches: 0,
      feedback: [],
      error: "Invalid input: pairs array is empty.",
    };
  }

  // Check for missing data inside pairs
  // does every correct pair have a left and right?
  for (const pair of pairs) {
    if (!pair.left || !pair.right) {
      return {
        correct: false,
        correctMatches: 0,
        totalMatches: 0,
        feedback: [],
        error: "Invalid input: every pair must have a non-empty left and right.",
      };
    }
  }

  // Check for missing data inside student matches
  // does every student match have a left and right?
  for (const match of studentMatches) {
    if (!match.left || !match.right) {
      return {
        correct: false,
        correctMatches: 0,
        totalMatches: studentMatches.length,
        feedback: [],
        error:
          "Invalid input: every student match must have a non-empty left and right.",
      };
    }
  }

  // Check for duplicate left items in student matches
  // did the student match the same left item to multiple different right items? (match same term twice?)
  const submittedLefts = studentMatches.map((m) => m.left);
  const uniqueLefts = new Set(submittedLefts);
  if (uniqueLefts.size !== submittedLefts.length) {
    return {
      correct: false,
      correctMatches: 0,
      totalMatches: studentMatches.length,
      feedback: [],
      error:
        "Invalid input: duplicate matches found. Each left item may only be matched once.",
    };
  }

  // Check for mismatched number of pairs
  // did the student submit the right number of matches?
  if (studentMatches.length !== pairs.length) {
    return {
      correct: false,
      correctMatches: 0,
      totalMatches: studentMatches.length,
      feedback: [],
      error: `Invalid input: expected ${pairs.length} matches but received ${studentMatches.length}.`,
    };
  }

  // --- Validation logic ---

  // Build a hash map/dictionary from correct pairs: left → right
  // this will allow us to find the value (right answer) by its key (left item)
  // after this runs, answerKey will look like this:
  // {
  //   "term": "definition",
  //   "term2": "definition2",
  //   ... (for every term in the exercise)
  // }
  const answerKey = new Map<string, string>();
  for (const pair of pairs) {
    answerKey.set(pair.left, pair.right);
  }

  const feedback: MatchFeedback[] = [];
  let correctCount = 0;

  for (const match of studentMatches) {
    const expectedRight = answerKey.get(match.left);

    // Student matched a left item that doesn't exist in the exercise
    if (expectedRight === undefined) {
      return {
        correct: false,
        correctMatches: correctCount,
        totalMatches: studentMatches.length,
        feedback,
        error: `Invalid input: "${match.left}" is not a valid left item in this exercise.`,
      };
    }

    const isCorrect = match.right === expectedRight;
    if (isCorrect) correctCount++;

    feedback.push({
      left: match.left,
      right: match.right,
      isCorrect,
    });
  }

  return {
    correct: correctCount === pairs.length,
    correctMatches: correctCount,
    totalMatches: studentMatches.length,
    feedback,
    error: null,
  };
}

/**
 * Returns the right-column items in a randomized order.
 * Use this to shuffle the options shown to the student before they match.
 *
 * @param pairs - the correct pairs for the exercise
 * @returns a shuffled array of the right-side strings
 */
export function getShuffledRightItems(pairs: MatchingPair[]): string[] {
  const rights = pairs.map((p) => p.right);
  // Fisher-Yates shuffle
  for (let i = rights.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rights[i], rights[j]] = [rights[j], rights[i]];
  }
  return rights;
}
