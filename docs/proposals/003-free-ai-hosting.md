# NNN — Title

**Author(s):Elham Isa** · **10/8:** · **Trello card:** <link= https://trello.com/c/WAkQktia/106-b14-research-ai-3-free-hosting-how-does-this-run-in-production-for-0> · **Status:** Draft | Presented | Approved | Revise | Parked

> Copy this file to `docs/proposals/NNN-short-title.md` using the next free number.
> Keep it to 1–2 pages. Present it at the day-10 sprint sync; the decision gets recorded
> in the Status line above and on the Trello card.

## 1. Question
Which zero-cost hosting path can serve Malami's model calls at acceptable Hausa quality and latency, and survive growth to 1,000 active learners?

## 2. Background
Learners cannot reach our dev VM, so inference has no production home. Four options were in scope: Cloudflare Workers AI, our Oracle Always Free VM behind an authenticated proxy, university compute via NCSA, and Hugging Face. B1.3's env-var design means a provider can be swapped by configuration, so this decision is reversible if we keep one provider adapter. Free allocation. Workers AI gives 10,000 Neurons/day, resetting 00:00 UTC. Neurons are consumed per call and vary by model, so calls/day had to be measured rather than looked up.

## 3. Proposed answer

Cloudflare Workers AI with @cf/meta/llama-4-scout-17b-16e-instruct, behind the B1.3 env-var adapter, with a second provider configured as fallback.

Same prompt, same Hausa brevity system prompt, five Cloudflare-hosted models. Calls/day = 10,000 ÷ Neurons.

| Model | Neurons | Completion tokens | Calls/day | Hausa output |
|---|---|---|---|---|
| llama-3.1-8b-instruct-fp8 | 1.1 | 11 | ~8,700 | **Failed** — 11 tokens, no answer |
| **llama-4-scout-17b-16e-instruct** | **10.3** | **116** | **~970** | **Coherent, correct, on task** |
| mistral-small-3.1-24b-instruct | 14.5 | 256 | ~690 | **Failed** — looped one sentence |
| gemma-4-26b-a4b-it | 36.1 | 1,318 | ~277 | Good, but see 3.2 |
| glm-4.7-flash | 48.8 | 1,334 | ~200 | Ignored Hausa-only instruction |

Example of a failure, Llama 3.1 8B in full: "Ananun Hausa ya takaice."
Example of a pass, Llama 4 Scout: "Sharhi kalma ce da ake amfani da ita wajen bayyana ra'ayi. Lokacin da mutum yake karanta wani aiki, ya gama karantawa, to yana iya bayyana ra'ayinsa game da aikin da ya karanta…"

| Configuration | Completion tokens | Neurons |
|---|---|---|
| Default | 1,318 | 36.1 |
| `reasoning_effort: "low"` | 1,437 | 39.4 |
| Hausa brevity system prompt | 1,278 | 35.4 |
| `max_tokens: 300` | 300 (truncated mid-sentence) | 8.4 |

The brevity prompt obeyed the instruction for the visible answer (~60 words) and still burned ~1,200 tokens of reasoning. Only truncation reduced cost, and truncation cuts answers mid-sentence, which is worse for a learner than a slow answer.

Llama 4 Scout at ~970 calls/day supports roughly 65–195 active learners, against a target of 1,000. Closing that is demand-side engineering, not a hosting change: cap conversation history per call (history growth drives prompt tokens), cache repeated questions, instruct for brevity, rate-limit per learner with a graceful message.
## 4. Alternatives considered
Hugging face returned that credits need to be purchased so it was actually not a free option. Rejected as primary. CPU-only inference serves requests near-serially. Another option is: ia @cf/meta/m2m100-1.2b, which supports Hausa (ha). Triples calls per turn against a 10,000-Neuron ceiling, adds latency, and compounds translation error at both ends. Reconsider only if direct Hausa quality fails the 10-prompt eval.

## 5. Risks

- Hausa quality. Only one of five tested models produced usable Hausa. The viable set is narrow, so losing one model is material.

- Model availability changes without notice. @cf/google/gemma-3-12b-it returned "This account is not allowed to access" despite being documented as free-plan available. Deprecated models can disappear mid-project.

- Response shapes differ between models on one provider (result.response vs. OpenAI-style choices[0].message.content). The adapter must normalise this.

- Cost. $0 target, no paid APIs. Proposed ceiling $25/month if infeasible

## 6. Success metric

- Failure rate under 1% over a one-week measurement window
Daily calls at target learner count fit the free allocation with ≥30% headroom
- Hausa output rated acceptable on ≥8 of 10 first-pass eval prompts by a fluent reviewer (small set; expand to 50 before the build card)

## 7. Build sketch
— Provider adapter behind one interface; normalises response shapes, configured by B1.3 env vars
— Llama 4 Scout integration and API token handling
— Fallback provider behind the same interface, with switch runbook and monthly drill
— Per-learner rate limit with a graceful message, not a 500
— History trimming / summarisation to cap prompt tokens per call
— Response cache for repeated questions
— Latency, failure and Neuron logging so §6 keeps being measured after launch
— Expand Hausa eval set to 50 prompts with a reviewer rubric