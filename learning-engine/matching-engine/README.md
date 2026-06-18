# Matching Engine

A local module that validates student responses for matching exercises. Given a set of correct pairs and a student's submitted matches, it reports which matches are right or wrong.

No UI, no database, no persistence — pure logic only.

---

## How to Run Locally

From the repo root:

```bash
npx tsx learning-engine/matching-engine/demo.ts
```

---

## Example Input / Output

**Input:**

```ts
const pairs = [
  { left: "Variable", right: "A container that stores a value" },
  { left: "Function", right: "A reusable block of code" },
];

const studentMatches = [
  { left: "Variable", right: "A container that stores a value" }, // correct
  { left: "Function", right: "Repeats a block of code" },         // wrong
];
```

**Output:**

```ts
{
  correct: false,
  correctMatches: 1,
  totalMatches: 2,
  feedback: [
    { left: "Variable", right: "A container that stores a value", isCorrect: true },
    { left: "Function", right: "Repeats a block of code", isCorrect: false },
  ],
  error: null
}
```

---

## Data Structures

### `MatchingPair`
Represents one correct pair (the answer key).

| Field | Type | Description |
|-------|------|-------------|
| `left` | `string` | The term or prompt shown to the student |
| `right` | `string` | The correct match for that term |

### `StudentMatch`
Represents one match submitted by the student.

| Field | Type | Description |
|-------|------|-------------|
| `left` | `string` | The term they were matching |
| `right` | `string` | The answer they chose |

### `MatchingResult`
Returned by `matchingEngine()`.

| Field | Type | Description |
|-------|------|-------------|
| `correct` | `boolean` | `true` only if all matches are correct |
| `correctMatches` | `number` | How many matches were right |
| `totalMatches` | `number` | How many matches were submitted |
| `feedback` | `MatchFeedback[]` | Per-match breakdown |
| `error` | `string \| null` | Error message if input was invalid |

### `MatchFeedback`
One entry in the `feedback` array.

| Field | Type | Description |
|-------|------|-------------|
| `left` | `string` | The left item |
| `right` | `string` | What the student matched it to |
| `isCorrect` | `boolean` | Whether it was correct |

---

## Exported Functions

### `matchingEngine(pairs, studentMatches) → MatchingResult`
Validates the student's submitted matches against the correct pairs.

**Error cases handled:**
- Non-array input
- Empty pairs array
- Missing `left` or `right` on any item
- Wrong number of matches submitted
- Duplicate left items in student matches
- Student references a left item not in the exercise

### `getShuffledRightItems(pairs) → string[]`
Returns the right-column items in a randomized order. Use this to shuffle the options shown to the student before they begin matching.

---

## Assumptions

- Matching is **case-sensitive**. `"variable"` and `"Variable"` are treated as different values.
- Each left item must be **unique** within a set of pairs. The engine uses the left item as the key to look up the correct answer.
- The student must submit **exactly one match per left item** — no partial submissions.
- Right-column options are shuffled randomly each time `getShuffledRightItems` is called, so students see a different order on every attempt.
