# 002 — Local model bake-off: which open model powers Malamin AI?

**Author(s):** Bijou Leinbach · **Date:** 2026-10-09 · **Trello card:** Local model bake-off (Team B; depends on B1.1) · **Status:** Draft

> VM results are pending B1.1 (team model server). Everything below was run on a laptop. Sections that need VM numbers are marked **Pending B1.1**.

## 1. Question
Which small, free, locally run model should power the Malamin AI tutor, and with what prompt?

## 2. Background
- **Constraints** (`ONBOARDING.md`): no paid AI APIs, inference through Ollama, small quantized models, guide-don't-reveal "enforced in code".
- **Models tested:** the four from B1.1, all run through Ollama: `llama3.2:3b`, `qwen2.5:3b`, `gemma2:2b` and `phi3.5`.
- **Test set** (`docs/ai/bakeoff/test-set.json`): 10 exercises from `supabase/seed/seed_lessons.sql`, each with a realistic wrong answer, plus 5 chat cases. The chat cases cover simplifying, a fact not in the lessons, a common confusion, a student demanding the answer, and an off-topic question.
- **Prompt** (`docs/ai/bakeoff/prompt.md`): one system prompt, identical for every model, with the lesson text and the correct answer included so the tutor can give accurate hints. Fixed settings: temperature 0.3, seed 42.
- **Rubric** (`docs/ai/bakeoff/rubric.md`): each reply scored 0–2 on four qualities: doesn't reveal the answer, factually correct, helpful, length/tone. A 0 on revealing or on correctness is an **automatic fail**. Any false statement scores 0.
- **Scoring:** blind (replies shuffled and labelled A–D), then strictly rechecked against the rubric. **Single scorer**: this card was done solo.
- **Machine:** MacBook Pro, M2 Max, 32GB RAM.

## 3. Proposed answer

**Recommendation: `phi3.5` with the stricter prompt (v2) plus a code-level answer-leak check. Fallback: `gemma2:2b`.**

**This is a close call, and none of the four models is an obvious choice.** No model is good at all three essentials: being accurate, not giving the answer away, and actually helping.

### Scores (prompt v1, laptop, 15 cases)

| Model | Score | Fails | Gave the answer | Factual errors | Helpful (avg 0–2) | Tokens/sec | Time per reply | Memory |
|---|---|---|---|---|---|---|---|---|
| gemma2:2b | **89/112** (79%) | **2** | 2 | **0** | 0.93 | **69.7** | **1.0s** | **1.7GB** |
| qwen2.5:3b | 88/112 (79%) | 4 | 3 | 1 | 1.07 | 45.9 | 1.0s | 2.0GB |
| llama3.2:3b | 84/112 (75%) | 4 | 2 | 2 | 0.93 | 48.0 | 1.4s | 2.2GB |
| phi3.5 | 70/112 (62%) | 7 | 7 | 3 | **1.33** | 58.1 | 1.8s | 2.9GB |

Max is 112, because "doesn't reveal" doesn't apply to 4 of the chat cases. Speed and memory are medians on the laptop. Row-by-row scores with reasons are in `docs/ai/bakeoff/scoring/v1/scores.csv`.

### Why phi3.5, despite the lowest score
- **It's the only model that consistently teaches.** Its helpfulness (1.33) is clearly ahead of the rest (≤1.07). gemma2 and llama3.2 often just repeat the question back.
- **Its biggest problem, giving away the answer, is the most fixable.** A stricter prompt (v2) roughly halved its reveals (6 → 3 in a first-pass count), more than any other model improved. qwen2.5 didn't change at all.
- **A code check can back up the prompt** by blocking replies that leak the answer, which `ONBOARDING.md` already calls for.

### Why it's still a risk, and why gemma2 is the fallback
- **phi3.5 made the most factual errors (3)**, and **prompting can't fix factual errors.** v2 fixed none of them for any model. If it's wrong about something, it will keep teaching it.
- **gemma2:2b is the only model with zero factual errors.** It's also the fastest and smallest, and it has the highest total. If the team values accuracy and speed above explanation quality, gemma2 is the better pick.

### Recommended prompt
**v2** (`docs/ai/bakeoff/prompt-v2.md`), as a starting point. It spells out every way of revealing an answer, handles "just tell me", limits replies to 4 sentences, and firmly redirects off-topic questions. With v2, all four models correctly redirected the off-topic question. v2 has **not yet been formally scored**.

## 4. Alternatives considered
- **gemma2:2b.** Most accurate, fastest and smallest, highest total. But it's the least helpful: hints like "What does `range(5)` do?" teach nothing new. **Kept as the fallback.**
- **qwen2.5:3b.** Near-tied second, and short and clear when it works. But it bluntly gives answers ("range(5) produces Numbers 0 to 4"), and it **ignored the stricter prompt completely**, so its leaks can't be fixed by prompting.
- **llama3.2:3b.** Held firm when pushed for the answer, with the best off-topic redirect. But it made 2 factual errors in v1 and repeated the same kind in v2. With the stricter prompt it became overcautious and refused a normal "explain loops" question.
- **Prompt alone, with no code check.** Not enough. Even with v2, phi3.5 still leaked through paraphrases ("logarithmic", "cycles", "add a `#`").
- **Simple code checks** (first attempt, `docs/ai/bakeoff/guard/`):
  - Checking whether a reply contains the answer text caught 5 of 19 leaks, with 13 false alarms.
  - Asking a small model YES/NO "does this give the answer away?" caught at best 8 of 19.
  - **Neither is good enough yet.** See Build sketch.

## 5. Risks
- **Factual errors (highest risk).** phi3.5 stated 3 false things in 15 replies (E02, E07, E10). E07, selecting an element by id, tripped 3 of 4 models. A tutor that teaches wrong facts damages learners and the platform's credibility.
- **Answer leaks.** Even the stricter prompt didn't stop them, and the leak check is unproven.
- **Garbled text.** phi3.5 produced broken words in 5 of 15 replies ("Python'thy", "doesn'thy", "on thethy", "one bydictating").
- **Speed and memory. Pending B1.1.** phi3.5 is the slowest and largest model (1.8s per reply, 2.9GB on the laptop). The VM has no GPU, so it will be several times slower there.
- **Hausa quality: untested.** All testing was in English, on the English demo course. No model has been checked in Hausa. Per `ONBOARDING.md`, no AI-generated Hausa reaches learners without native-speaker review.
- **Evidence strength.** 15 cases and a single scorer. The top three totals are within 5 points, so a few judgement calls could change the order.
- **Cost:** $0. Everything runs locally.

## 6. Success metric
Re-run the same 15 cases with the chosen model, the final prompt and the leak check. Ship only if all of these hold:
- **0 factual errors.**
- **No more than 1 answer reveal** reaching the student.
- **Average helpfulness of at least 1.3.**
- **Median reply time on the VM of 5 seconds or less. Pending B1.1.**

## 7. Build sketch
- **B: Answer-leak guard.** Build and test a code check that blocks replies giving away the answer. Try a judge that reasons before its verdict, and per-exercise "giveaway keywords".
- **B: Prompt v3 + formal scoring.** Score v2, fix its side effects (quote marks, borrowed examples), and re-score phi3.5 and gemma2.
- **B: VM bake-off run.** Run `run_bakeoff.py --machine vm` once B1.1 is up, and fill in the speed, memory and minimum machine spec.
- **B: Grow the golden set.** Expand the 15 cases into `docs/ai/golden-set/`, with more cases like E07 that catch factual errors.
- **B: Garbled-output filter.** Detect and retry replies with broken words.

## Minimum machine spec
**Pending B1.1.** Provisional, from the laptop: the phi3.5 model needs about 3GB of memory and gemma2:2b about 1.7GB, so a machine with **8GB RAM** should fit either one. Whether replies are fast enough on a CPU-only machine is still unknown.

---

## Appendix A: Best and worst replies (prompt v1)

**Best**
- **qwen2.5:3b, E03** (student said 3.14 is an `int`): *"3.14 is a decimal number, not a whole number. What data type is typically used for decimal numbers in Python?"* Short, points at the exact mistake, doesn't give the answer.
- **phi3.5, E03:** *"Remember that integers are whole numbers without decimals. Since 3.14 has a decimal point, it's not a whole number. Which data type includes decimal points?"*
- **llama3.2:3b, C05** (football question): *"I'm not sure I can help with that question. I'm a tutoring platform for computer programming and learning… Would you like to talk about something related to programming instead?"*
- **gemma2:2b, C03** (padding vs margin): *"Padding is the space inside the box, between the content and the border. Margin is the space around the box, outside the border. Think of it this way: padding is the cushion inside, and margin is the space outside."*

**Worst**
- **qwen2.5:3b, C04** (student demands the answer): *"range(5) produces Numbers 0 to 4."* Gives the answer outright.
- **phi3.5, E07:** *"…when selecting elements by ID, you should use `document.getElementById()`… The ID should be enclosed in quotes and prefixed with a hash (#)…"* Gives the answer, and it's false: `getElementById` takes no `#`.
- **qwen2.5:3b, E01** (student forgot the quotes): *"Try removing the space between `print` and the quotation marks."* The student's answer has neither a space nor quotes.
- **llama3.2:3b, C03:** compares padding to "frosting" that is "not visible from the outside", and says margin is "visible from the outside". Confusing and wrong; margin is transparent.

## Appendix B: Raw outputs and working files
All raw outputs are kept in the repo:
- Prompt v1, all 60 replies: `docs/ai/bakeoff/results/laptop/v1/raw-outputs.md`
- Prompt v2, all 60 replies: `docs/ai/bakeoff/results/laptop/v2/raw-outputs.md`
- Per-model JSON, with the full prompt for each reply: `docs/ai/bakeoff/results/laptop/<version>/`
- Scores with reasons: `docs/ai/bakeoff/scoring/v1/scores.csv`
- Working notes, the full list of factual errors, and the experiments: `docs/ai/bakeoff/NOTES.md`
- Runner script: `docs/ai/bakeoff/run_bakeoff.py`
