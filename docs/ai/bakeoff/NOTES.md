# Bake-off working notes

Running notes on the local model bake-off: what was done, what we think, and what's still open. This feeds `docs/proposals/002-local-model-bakeoff.md`.

**Author:** Bijou Leinbach · **Started:** 2026-10-08

## Setup

- **Scorer:** one person (Bijou). The card says Dash-1 + Dash-2 score together, but in practice this is solo work. The proposal should say the scores come from a single scorer.
- **Models:** `llama3.2:3b`, `qwen2.5:3b`, `gemma2:2b`, `phi3.5` (the four from B1.1).
- **Prompt used for scoring:** v1 (`prompt.md`).
- **Machine:** laptop only (M2 Max, 32GB). The VM run is waiting on B1.1.

## Scores (prompt v1, laptop)

Scored with `rubric.md`, starting from handwritten notes, then rechecked against every reply. Full row-by-row scores, with the reason for each judgement call, are in `scoring/v1/scores.csv`.

Scoring rules applied strictly:
- **Any factual error scores 0 on "correct"** (an automatic fail). Hints that are misleading without saying anything false score 1.
- **Any reply that gives the answer scores 0 on "doesn't reveal"**, including telling the student the exact fix in words.
- Where the notes and the rubric disagreed, or the notes missed an error, the rubric wins.

| Model | Points | % | Fails | Gave the answer | Factually wrong | Avg helpful (0–2) |
|---|---|---|---|---|---|---|
| gemma2:2b | 89/112 | 79% | 2 | 2 | 0 | 0.93 |
| qwen2.5:3b | 88/112 | 79% | 4 | 3 | 1 | 1.07 |
| llama3.2:3b | 84/112 | 75% | 4 | 2 | 2 | 0.93 |
| phi3.5 | 70/112 | 62% | 7 | 7 | 3 | **1.33** |

Fails by case:
- gemma2:2b: E03, C04
- qwen2.5:3b: E01, E04, E07, C04
- llama3.2:3b: E01, E06, E07, C03
- phi3.5: E01, E02, E05, E07, E09, E10, C04

Max is 112, not 120: "doesn't reveal" doesn't apply to C01, C02, C03 and C05.

## Incorrect information (important)

**A model teaching something false is the most serious failure, and a better prompt can't fix it.** The prompt can change *how* a model answers (shorter, no giveaways, stay on topic), but not *what it knows*. If a model believes something wrong, it will keep teaching it. So factual errors weigh more heavily in the choice than leaks do: leaks can be reduced with prompting and code checks, wrong facts can't.

The evidence supports this: **prompt v2 fixed none of the factual errors.** The same kinds of mistakes appeared in both runs, and llama3.2 got E07 wrong both times.

### Prompt v1 (scored)

| Model | Case | What it got wrong | Score |
|---|---|---|---|
| phi3.5 | E07 | Says `getElementById` needs a `#` before the id. It doesn't; only `querySelector` does. | Correct = 0 |
| phi3.5 | E02 | Says a hyphen makes the name "look like a string". It actually makes Python read it as a minus sign. | Correct = 0 |
| phi3.5 | E10 | Says in a tree "each edge leads to exactly one other node". False. | Correct = 0 |
| phi3.5 | E06 | "What comes after that, which also surrounds the padding?" steers the student towards Border, a wrong answer. Misleading rather than false. | Correct = 1 |
| qwen2.5:3b | E01 | Tells the student to remove a space between `print` and the quotation marks. The student's answer has no such space and no quotation marks. | Correct = 0 |
| llama3.2:3b | E07 | Says `querySelector("title")` looks for text content "title". It actually selects the `<title>` tag. | Correct = 0 |
| llama3.2:3b | C03 | Padding/margin analogy says margin is "visible from the outside". Margin is transparent. | Correct = 0 |
| llama3.2:3b | E05 | Brings up range step values, which have nothing to do with the mistake. Misleading rather than false. | Correct = 1 |
| gemma2:2b | E01 | Says the message must go inside the parentheses. The student already did that; the real problem is the missing quotes. | Correct = 1 |

### Prompt v2 (observed, not formally scored)

| Model | Case | What it got wrong |
|---|---|---|
| phi3.5 | E07 | Says "'title' is usually a global attribute, not an ID". Misleading. |
| phi3.5 | C02 | Claims RAM and storage were covered "in our lessons". They weren't; it made that up. |
| phi3.5 | E02 | Talks about spaces and case-sensitivity instead of the hyphen. Misreads the mistake. |
| qwen2.5:3b | E01 | Still wrong: tells the student to remove a space after "Hello". |
| qwen2.5:3b | E07 | Says `querySelector` doesn't necessarily find "the one with the exact id". Misleading. |
| llama3.2:3b | E01 | Says the parentheses are missing. They aren't. |
| llama3.2:3b | E07 | Says `querySelector` can't select by id. It can, with `#title`. |
| gemma2:2b | C05 | Mentions "changing the text color", which the student never asked about (borrowed from the prompt's example). |

### What this means

- **gemma2:2b made the fewest factual errors**: no outright false statements in either run, only a missed point and a borrowed example.
- **phi3.5 made the most outright false statements in v1** (3: E02, E07, E10), plus a misleading hint (E06), and kept making errors in v2 (E07, plus inventing "our lessons" in C02).
- **llama3.2:3b** made 2 false statements in v1 (E07, C03), and the same kind of errors again in v2 (E01, E07).
- **qwen2.5:3b** made 1 (E01), and repeated it in v2.
- **E07 is the hardest case:** 3 of 4 models said something wrong about selecting by id. A real tutor needs to be precise about details like this.
- Two kinds of error showed up: **wrong facts** (E07, C03) and **misreading the student's answer** (E01, E02). Neither improved with prompt v2.
- **For phi3.5:** its leaks may be fixable, but its factual errors (E02, E07, E10 in v1; C02 and E07 in v2) are not. This is the biggest weakness in the case for phi3.5, and the proposal has to weigh it.

## Current thinking

**None of the four models is an obvious choice, which makes this a hard call.** Each one fails somewhere that matters for a tutor, and they fail in different ways. No model is good at all three essentials: being accurate, not giving the answer away, and actually helping.

### Each model's trade-off

| Model | Strengths | Weaknesses | Speed / memory (laptop) |
|---|---|---|---|
| **gemma2:2b** | Highest score (89/112). Only model with **no factual errors**. Fastest and smallest. | Least helpful (0.93). Hints often just repeat the question ("What does `range(5)` do?"). Gave the answer in E03 (named "float") and C04. Chatted about football in C05. | 69.7 tok/s · 1.0s per reply · 1.7GB |
| **qwen2.5:3b** | Close second (88/112). Short, clear and well-pitched when it works (E02, E03, E09). Second most helpful (1.07). | Bluntly gave the answer in E04, E07 and C04 ("range(5) produces Numbers 0 to 4"). One factual error (E01). **Ignored the stricter v2 prompt entirely.** | 45.9 tok/s · 1.0s · 2.0GB |
| **llama3.2:3b** | Held firm when pushed for the answer (C04). Best off-topic redirect (C05). Warm tone. Its 2 reveals were indirect (showing the quoted string in E01, reciting padding's definition in E06). | Two factual errors (E07, C03), repeated in kind in v2. Low helpfulness (0.93). With v2 it became overcautious and refused a normal "explain loops" question. | 48.0 tok/s · 1.4s · 2.2GB |
| **phi3.5** | **Best explanations** by a clear margin (helpful 1.33). Richest chat answers (C02, C03). Improved the most with a stricter prompt (reveals roughly halved). | Lowest score (70/112). Most fails (7) and most answer reveals (7 of 11). **Most factual errors (3).** Garbled words in 5 replies. Slowest and largest. Didn't redirect off-topic. | 58.1 tok/s · 1.8s · 2.9GB |

### Why it's hard to choose

- **The safest model is the least helpful.** gemma2 is accurate and rarely leaks, but often doesn't teach anything. A tutor that only repeats the question isn't much better than no tutor.
- **The most helpful model is the least safe.** phi3.5 explains best, but it leaks the most and gets the most facts wrong.
- **Leaks and factual errors aren't equally fixable.** Leaks can be reduced with a stronger prompt (v2 roughly halved phi3.5's) and possibly a code check. Factual errors can't be fixed by prompting; v2 fixed none of them. So a model's factual errors count against it more than its leaks.
- **The middle options don't clearly win either.** qwen2.5 ignores prompt changes, so its leaks can't be fixed. llama3.2 has factual errors and becomes unhelpful when the prompt gets stricter.
- **The scores are close at the top.** gemma2 (89) and qwen2.5 (88) are effectively tied, and llama3.2 (84) isn't far behind. With 15 cases and one scorer, a few judgement calls could change the order.
- **The total score and what we value most point in different directions.** By total, gemma2 wins. By helpfulness, phi3.5 wins. By accuracy, gemma2 wins. Which one matters most is a judgement the team should make together at the sync.

### Tentative lean

**phi3.5, but with serious reservations.** It's the only model that consistently teaches. The thinking: a robust system prompt plus a code check that blocks answer leaks could fix its biggest problem, and `ONBOARDING.md` already says guide-don't-reveal should be "enforced in code".

- **A more robust system prompt should help.** v1's "never reveal" rule wasn't strong enough for phi3.5, and v2 showed it responds to stricter instructions better than the others.
- **A code check should back up the prompt.** The first attempt (see Experiments) didn't work yet, so this is still unproven.

What still counts against phi3.5:
- **Three factual errors in v1** (E02, E07, E10), the most of any model, and more in v2. A prompt can't fix these. This is the biggest weakness in the case for it.
- **Garbled words** in 5 replies ("Python'thy", "doesn'thy", "on thethy", "one bydictating"), plus a stray `-----`.
- **Slowest and largest:** 1.79s median reply and 2.9GB on the laptop, vs 1.0s and 1.7GB for gemma2. This matters more on the VM, which has no GPU.
- **Doesn't redirect off-topic questions** (C05, football) with the v1 prompt. Fixed in v2.

**The fallback is gemma2:2b,** if accuracy and speed are judged more important than explanation quality. A better prompt might make its hints more useful, which would be easier than making phi3.5 accurate.

### What would make the call easier

- **VM numbers.** If phi3.5 is too slow on a CPU-only server, the choice makes itself.
- **Scoring prompt v2 formally**, to see whether phi3.5's leaks really fall and whether gemma2's hints improve.
- **A working leak check.** If leaks can be reliably caught in code, phi3.5's main weakness shrinks. If not, the case for it is much weaker.
- **A second scorer**, to check that the close scores at the top aren't down to one person's judgement calls.

## Experiments tried (not adopted yet)

### Prompt v2 (`prompt-v2.md`, results in `results/laptop/v2/`)
A stricter prompt: spells out every way of revealing, handles "just tell me", sets a 4-sentence limit, firmer off-topic rule, and one good/bad example. First-pass reveal counts (not formally scored):

| Model | Reveals v1 → v2 (first-pass counts, before the strict rescoring) |
|---|---|
| phi3.5 | 6 → 3 |
| qwen2.5:3b | 4 → 4 |
| llama3.2:3b | ~2 → 3 |
| gemma2:2b | 2 → 0 |

All four models handled the off-topic question correctly with v2. This supports the idea that a better prompt helps phi3.5 in particular, but doesn't fix it fully. Its remaining leaks were paraphrases ("logarithmic", "cycles", "add a #"). Side effects: phi3.5 wrapped replies in quote marks; llama3.2 refused a normal "explain loops" question as off-topic; gemma2 borrowed the prompt's example in C05.

### Code check for revealed answers (`guard/`)
First pass, tested on 88 replies (19 labelled as leaks, see `guard/leak-labels.json`):

| Method | Leaks caught | False alarms |
|---|---|---|
| Does the reply contain the answer text? | 5/19 | 13/69 |
| gemma2:2b asked YES/NO | 19/19 | 69/69 (says YES to everything) |
| qwen2.5:3b asked YES/NO | 8/19 | 24/69 |
| llama3.2:3b asked YES/NO | 1/19 | 1/69 |
| phi3.5 asked YES/NO | 8/19 | 7/69 |

Neither simple approach works yet. Leaks tend to be paraphrases, so plain text matching misses them, and short answers like "FALSE" cause false alarms. Small models are poor yes/no judges. **Paused here.** Ideas not yet tried: letting the judge reason before its verdict, and per-exercise "giveaway keywords" written alongside each exercise.

## Open items

- [ ] VM run and VM speed/memory, once B1.1 exists (`run_bakeoff.py --machine vm`).
- [ ] Minimum machine spec (needs VM numbers).
- [ ] Decide whether the final recommended prompt is v1, v2 or a v3.
- [x] Write `docs/proposals/002-local-model-bakeoff.md` (draft) and open a PR to `dev`.
- [ ] Trello card title ("What should the instructor dashboard show?") doesn't match the description. Confirm with the team lead.
