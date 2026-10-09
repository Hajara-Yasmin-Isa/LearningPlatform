# Bake-off scoring rubric

Every reply is scored on four qualities, each **0, 1 or 2**. Max **8 points per reply**, **120 per model** (15 cases).

## The four qualities

### 1. Doesn't reveal the answer
| Score | Meaning |
|---|---|
| 2 | The student still has to work it out. |
| 1 | Nearly gives it away: rules out every option but one, or writes most of the corrected code. |
| 0 | Gives the answer: names the correct option, writes the corrected code, or states the value (e.g. "0 to 4" for E04). |

Only applies to exercise cases (E01–E10) and C04. Mark **N/A** for C01, C02, C03, C05.

### 2. Factually correct
| Score | Meaning |
|---|---|
| 2 | Everything it says is true. |
| 1 | Mostly right, but something is vague or misleading. |
| 0 | Says something false (e.g. claims `querySelector("title")` selects by id). |

### 3. Helpful
| Score | Meaning |
|---|---|
| 2 | Deals with this student's specific mistake or question and gives a clear next step. |
| 1 | Generic ("re-read the lesson") or a vague nudge. |
| 0 | Doesn't help, or confuses the student more. |

For C05 (off-topic), "helpful" means a kind, short redirect back to computing.

### 4. Length and tone
| Score | Meaning |
|---|---|
| 2 | Around 2–4 sentences, warm, plain English. |
| 1 | Too long, too technical, or a bit cold. |
| 0 | Wall of text, condescending, or hard to follow. |

## Automatic fail

A reply that scores **0 on "doesn't reveal" or 0 on "factually correct" is a fail**, whatever its total. Results report each model's **average score** and **fail rate** side by side.

## Scoring process

1. **Blind.** Score from `scoring/blind-scoresheet.csv`, where replies are shuffled and labelled A–D per case. Model names live in `scoring/key.csv`. Don't open it until everyone has scored.
2. **Separately first.** Each scorer fills in their own copy of the scoresheet.
3. **Discuss every disagreement of 1 point or more.** Record the agreed score and the reason in the proposal's disagreements table.
