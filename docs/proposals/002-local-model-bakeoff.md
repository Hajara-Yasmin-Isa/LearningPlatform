# 002 — Local model bake-off: which open model powers Malamin AI?

**Author(s):** Bijou Leinbach · **Date:** 2026-10-09, updated 2026-11-01 · **Trello card:** B1.2 RESEARCH — Model bake-off: which free model can tutor? · **Status:** Draft (waiting on co-scoring)

> **Laptop only.** The shared model server (B1.1) isn't up yet, so every run and benchmark below is from one laptop. Sections that need server numbers are marked **Pending B1.1**.

> **Change from the first draft:** the first draft recommended `phi3.5`. After scoring the stricter prompt (v2), **the data overturns that pick. The recommendation is now `gemma2:2b`.** See section 3.

## 1. Question
Which small, free, locally run model should power the Malamin AI tutor, and with what prompt?

## 2. Background
- **Constraints** (`ONBOARDING.md`): no paid AI APIs, inference through Ollama, small quantized models, guide-don't-reveal "enforced in code".
- **Models tested:** the four from B1.1, all run through Ollama 0.40.1:

  | Model | Size | Quantization | Ollama ID |
  |---|---|---|---|
  | `llama3.2:3b` | 3.2B | Q4_K_M | a80c4f17acd5 |
  | `qwen2.5:3b` | 3.1B | Q4_K_M | 357c53fb659c |
  | `gemma2:2b` | 2.6B | Q4_0 | 8ccf136fdd52 |
  | `phi3.5` | 3.8B | Q4_0 | 61819fb370a3 |

- **Test set** (`docs/ai/bakeoff/test-set.json`): 10 exercises from `supabase/seed/seed_lessons.sql`, each with a realistic wrong answer, plus 5 chat cases. The chat cases cover simplifying, a fact not in the lessons, a common confusion, a student demanding the answer, and an off-topic question.
- **Prompts:** identical for every model, with the lesson text and the correct answer included so the tutor can give accurate hints. Fixed settings: temperature 0.3, seed 42.
  - **v1** (`docs/ai/bakeoff/prompt.md`): the first prompt.
  - **v2** (`docs/ai/bakeoff/prompt-v2.md`): stricter. Spells out every way of revealing an answer, handles "just tell me", limits replies to 4 sentences, and firmly redirects off-topic questions.
- **Rubric** (`docs/ai/bakeoff/rubric.md`): each reply scored 0–2 on four qualities: doesn't reveal the answer, factually correct, helpful, length/tone. A 0 on revealing or on correctness is an **automatic fail**. Any false statement scores 0.
- **Coverage:** 4 models × 15 cases × 2 prompts = **120 replies, every one scored.**
- **Scoring:**
  - v1 was scored blind (replies shuffled and labelled A–D), then strictly rechecked against the rubric.
  - v2 was scored by the same scorer, not blind.
  - A **co-scorer** re-scored a blind sample of 10 v2 replies (section 3, Co-scoring).
- **Machine:** MacBook Pro, M2 Max, 32GB RAM.

## 3. Proposed answer

**Recommendation: `gemma2:2b` with prompt v2, plus a code-level answer-leak check.**

**It's still not an obvious choice.** No model is good at all three essentials: being accurate, not giving the answer away, and actually helping. gemma2 is the best on the two that matter most for a tutor, **accuracy and reliability**. Its weak spot is helpfulness, and that is the thing a better prompt can most likely improve.

### Scores: prompt v2 (recommended prompt)

| Model | Score | Fails | Gave the answer | Factual errors | Helpful (avg 0–2) |
|---|---|---|---|---|---|
| **gemma2:2b** | 89/112 (79%) | **2** | 2 | **0** | 1.20 |
| llama3.2:3b | **90/112** (80%) | **2** | **0** | 2 | 1.40 |
| qwen2.5:3b | **90/112** (80%) | 6 | 5 | 1 | 1.47 |
| phi3.5 | 73/112 (65%) | 6 | 5 | 2 | **1.67** |

### Scores: prompt v1

| Model | Score | Fails | Gave the answer | Factual errors | Helpful (avg 0–2) |
|---|---|---|---|---|---|
| **gemma2:2b** | **89/112** (79%) | **2** | 2 | **0** | 0.93 |
| qwen2.5:3b | 88/112 (79%) | 4 | 3 | 1 | 1.07 |
| llama3.2:3b | 84/112 (75%) | 4 | 2 | 2 | 0.93 |
| phi3.5 | 70/112 (62%) | 7 | 7 | 3 | **1.33** |

- **Max is 112:** "doesn't reveal" doesn't apply to 4 of the chat cases.
- **Row-by-row scores with reasons:** `docs/ai/bakeoff/scoring/v1/scores.csv` and `docs/ai/bakeoff/scoring/v2/scores.csv`.

### Speed and memory (laptop)

| Model | Tokens/sec (v1 / v2) | Time per reply (v1 / v2) | Memory |
|---|---|---|---|
| gemma2:2b | **69.7 / 67.5** | **1.0s / 1.2s** | **1.7GB** |
| qwen2.5:3b | 45.9 / 60.0 | 1.0s / 0.9s | 2.0GB |
| llama3.2:3b | 48.0 / 50.3 | 1.4s / 1.4s | 2.2GB |
| phi3.5 | 58.1 / 56.3 | 1.8s / 1.7s | 2.9GB |

- **Speed figures** are medians over 15 replies, measured after a warm-up call so loading time isn't counted.
- **Memory** is the size Ollama reports for the loaded model (`/api/ps`), not the measured RAM of the whole process. Treat it as an estimate.

### Why gemma2
- **It's the only model with zero factual errors, under both prompts.** Factual errors are the most important finding of this bake-off, because **prompting doesn't fix them**: v2 fixed none of them for any model. A tutor that teaches wrong facts damages learners.
- **It has the fewest fails under both prompts** (2 each). Under v2 it ties with llama3.2, which made 2 false statements.
- **It's the fastest and smallest model.** That matters most on the shared server, which has no GPU.

### Why not phi3.5 (the first draft's pick)
- The first draft picked phi3.5 because it explains best, and assumed its biggest problem (giving away the answer) was fixable with a stricter prompt.
- **The v2 scores show it wasn't fixed:** phi3.5 still gave the answer away **5 times**, still made **2 factual errors**, and still scored **last** (73/112).
- It's still the **best explainer** (helpfulness 1.67). It's worth revisiting if a leak check is proven to work and its factual errors go away.

### Weaknesses of gemma2 to fix next
- **It's the least helpful model** (1.20 with v2, below the 1.3 target in section 6). It often just restates the question ("What is the time complexity of binary search?"). This is the main thing for B1.3's final prompt to improve.
- **It still gave the answer away twice** (E01, E02), so the leak check is still needed.
- **It copied the prompt's example once.** In C05 it invented a "change the text color" exercise taken from v2's example. Changing or removing the example should fix it.

### Recommended prompt
**v2** (`docs/ai/bakeoff/prompt-v2.md`), as the starting point for B1.3. With v2, gemma2's helpfulness rose from 0.93 to 1.20 with no new factual errors, and all four models correctly redirected the off-topic question.

### Co-scoring
To check that the scores aren't one person's judgement, a second scorer re-scored 10 v2 replies blind. The sample mixes clear and borderline calls and covers every model (`docs/ai/bakeoff/scoring/v2/co-score/`).

**Pending:** sent to Ammar, Adaora and Elham on 2026-11-01.

| Co-scorer | Rows | Agreed exactly | Differed by 1+ on any quality |
|---|---|---|---|
| _TBD_ | 10 | _TBD_ | _TBD_ |

**Disagreements** (every difference of 1 point or more, and what was agreed):

| Row | Case / model | Quality | First scorer | Co-scorer | Agreed | Why |
|---|---|---|---|---|---|---|
| _TBD_ | | | | | | |

## 4. Alternatives considered
- **llama3.2:3b.** The close runner-up. It ties for the highest v2 score, and it **never gave away an answer under v2**. But it made **2 factual errors under both prompts**, including false ones: "the parentheses are missing" when they weren't, and "querySelector can't select by id". Under v2 it also refused a normal "explain loops" question as off-topic.
- **phi3.5.** Best explanations, but the most leaks and false statements. See above.
- **qwen2.5:3b.** Short and clear when it works, but it bluntly gives answers ("range(5) produces numbers 0 to 4"). It **got worse under the stricter prompt** (4 → 6 fails), so prompting can't fix its leaks.
- **Prompt alone, with no code check.** Not enough. Every model except llama3.2 still leaked under v2.
- **Simple code checks** (first attempt, `docs/ai/bakeoff/guard/`):
  - Checking whether a reply contains the answer text caught 5 of 19 leaks, with 13 false alarms.
  - Asking a small model YES/NO "does this give the answer away?" caught at best 8 of 19.
  - **Neither is good enough yet.** See Build sketch.

## 5. Risks
- **Factual errors.** gemma2 made none in 30 replies, but 30 replies is a small sample. E07 (selecting an element by id) tripped 3 of 4 models under v1 and 2 under v2. More cases like it are needed.
- **Low helpfulness.** A tutor that only restates the question won't teach anything. B1.3 must raise gemma2's helpfulness without causing leaks.
- **Answer leaks.** Even the stricter prompt didn't stop them, and the leak check is unproven.
- **Speed and memory. Pending B1.1.** The server has no GPU, so replies will be several times slower than on the laptop. gemma2 is the best-placed model for this.
- **Hausa quality: untested.** All testing was in English, on the English demo course. No model has been checked in Hausa. Per `ONBOARDING.md`, no AI-generated Hausa reaches learners without native-speaker review.
- **Evidence strength.**
  - 15 cases.
  - One main scorer, with co-scoring on 10 replies.
  - v2 scored without blinding.
  - Under v2, the top three totals are within 1 point. **The case for gemma2 rests on factual errors and fails, not on the total.**
- **Cost:** $0. Everything runs locally.

## 6. Success metric
Re-run the same 15 cases with gemma2, the final prompt (B1.3) and the leak check. Ship only if all of these hold:
- **0 factual errors.**
- **No more than 1 answer reveal** reaching the student.
- **Average helpfulness of at least 1.3.** gemma2 is at 1.20 with v2.
- **Median reply time on the server of 5 seconds or less. Pending B1.1.**

## 7. Build sketch
- **B1.3: Final prompt.** Start from v2 with gemma2. Aim at helpfulness: point at the student's exact mistake instead of restating the question. Replace the CSS example that gemma2 copied.
- **B: Answer-leak guard.** Build and test a code check that blocks replies giving away the answer. Try a judge that reasons before its verdict, and per-exercise "giveaway keywords".
- **B: Server bake-off run.** Run `run_bakeoff.py --machine vm` once B1.1 is up, and fill in the speed, memory and minimum machine spec.
- **B: Grow the golden set.** Expand the 15 cases into `docs/ai/golden-set/`, with more cases like E07 that catch factual errors.

## Minimum machine spec
**Pending B1.1.** Provisional, from the laptop: gemma2:2b needs about 1.7GB of memory, so a machine with **8GB RAM** should fit it comfortably. Whether replies are fast enough on a CPU-only machine is still unknown.

---

## Appendix A: Best and worst replies

**Best**
- **gemma2:2b, E04, v2** (student said `range(5)` gives 1 to 5): *"The `range()` function creates a sequence of numbers. What is the starting number in the sequence?"* Points straight at the student's mistake without giving the answer.
- **llama3.2:3b, E09, v2** (student said binary search is O(n)): *"Your answer, O(n), is actually the time complexity of a linear search, not a binary search. Think about how the size of the list affects the time it takes…"*
- **qwen2.5:3b, E03, v1** (student said 3.14 is an `int`): *"3.14 is a decimal number, not a whole number. What data type is typically used for decimal numbers in Python?"*
- **gemma2:2b, C03, v1** (padding vs margin): *"Padding is the space inside the box, between the content and the border. Margin is the space around the box, outside the border. Think of it this way: padding is the cushion inside, and margin is the space outside."*

**Worst**
- **phi3.5, E07, v1 and v2:** tells the student to add a `#` (gives the fix). In v1 it says `getElementById` needs one (false). In v2 it says "'title' is usually a global attribute, not an ID" (wrong here: it is the id).
- **llama3.2:3b, E07, v2:** *"querySelector looks for elements by class, tag, or attribute, but not by id."* False.
- **qwen2.5:3b, C04, v1 and v2** (student demands the answer): *"range(5) produces numbers 0 to 4."* Gives the answer outright, even under the stricter prompt.
- **llama3.2:3b, E01, v2** (student forgot the quotes): *"Your answer is close, but the parentheses are missing."* The parentheses are there.
- **gemma2:2b, C05, v2** (football question): redirects to "the code you are trying to write to change the text color", an exercise the student never had (copied from the prompt's example).

## Appendix B: Raw outputs and working files
All raw outputs are kept in the repo:
- Prompt v1, all 60 replies: `docs/ai/bakeoff/results/laptop/v1/raw-outputs.md`
- Prompt v2, all 60 replies: `docs/ai/bakeoff/results/laptop/v2/raw-outputs.md`
- Per-model JSON, with the full prompt for each reply: `docs/ai/bakeoff/results/laptop/<version>/`
- Scores with reasons: `docs/ai/bakeoff/scoring/v1/scores.csv`, `docs/ai/bakeoff/scoring/v2/scores.csv`
- Co-scoring sample: `docs/ai/bakeoff/scoring/v2/co-score/`
- Working notes, the full list of factual errors, and the experiments: `docs/ai/bakeoff/NOTES.md`
- Runner script: `docs/ai/bakeoff/run_bakeoff.py`
