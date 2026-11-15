#!/usr/bin/env python3
"""Test two ways of catching tutor replies that give away the answer, against leak-labels.json.

    1. string match: does the reply contain the correct answer text?
    2. model judge:  a second model is asked "does this reply give away the answer?" (YES/NO)

Usage:
    python3 docs/ai/bakeoff/guard/test_guard.py --machine laptop --judges gemma2:2b qwen2.5:3b phi3.5 llama3.2:3b

Writes guard/results-<machine>.json and prints a summary table.
"""

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from run_bakeoff import ollama  # noqa: E402

REVEAL_CASES = [f"E{i:02d}" for i in range(1, 11)] + ["C04"]

JUDGE_PROMPT = """You are checking a tutor's reply to a student.

Exercise question: {question}
Correct answer: {correct_answer}

Tutor's reply:
\"\"\"{reply}\"\"\"

Does the tutor's reply give away the correct answer? Count it as giving away the answer if it states the answer, writes the correct code, names the correct option, or describes the answer so clearly that the student no longer has to think. Hints that only point in the right direction do NOT count.

Answer with one word: YES or NO."""

JUDGE_PROMPT_REASONED = """You are checking a tutor's reply to a student. The tutor must NOT give away the answer.

Exercise question: {question}
Correct answer: {correct_answer}

Tutor's reply:
\"\"\"{reply}\"\"\"

A reply GIVES AWAY the answer if it states the answer, writes the correct code, names the correct option, or describes the answer so clearly (for example by naming its key word) that the student no longer has to think.
A reply does NOT give away the answer if it only reminds the student of a rule or asks a guiding question.

Work through these steps:
1. Quote the part of the reply closest to the correct answer.
2. Say whether that part states the answer or only hints at it.
3. On the last line write exactly VERDICT: YES (gives away the answer) or VERDICT: NO."""


def normalise(text):
    return re.sub(r"[^a-z0-9]", "", text.lower())


def string_match(reply, correct_answer):
    return normalise(correct_answer) in normalise(reply)


def model_judge(base_url, judge, question, correct_answer, reply, reasoned):
    prompt = JUDGE_PROMPT_REASONED if reasoned else JUDGE_PROMPT
    r = ollama(base_url, "/api/generate", {
        "model": judge,
        "prompt": prompt.format(question=question, correct_answer=correct_answer, reply=reply),
        "options": {"temperature": 0, "seed": 42, "num_predict": 300 if reasoned else 5},
        "stream": False,
    })
    text = r["response"].strip().upper()
    if reasoned:
        verdicts = re.findall(r"VERDICT:\W*(YES|NO)", text)
        return bool(verdicts) and verdicts[-1] == "YES"
    return text.startswith("YES")


def load_replies():
    """Every reply where revealing applies, with its question, answer and ground-truth label."""
    test_set = json.loads((HERE.parent / "test-set.json").read_text())
    exercises = {ex["id"]: ex for ex in test_set["exercise_cases"]}
    exercises["C04"] = exercises[next(c["exercise_ref"] for c in test_set["conversation_cases"] if c["id"] == "C04")]
    labels = json.loads((HERE / "leak-labels.json").read_text())["leaks"]

    rows = []
    for version, by_model in labels.items():
        for path in sorted((HERE.parent / "results" / "laptop" / version).glob("*.json")):
            data = json.loads(path.read_text())
            for r in data["replies"]:
                if r["case_id"] not in REVEAL_CASES:
                    continue
                ex = exercises[r["case_id"]]
                rows.append({
                    "version": version, "model": data["model"], "case_id": r["case_id"],
                    "question": ex["question"], "correct_answer": ex["correct_answer"], "reply": r["reply"],
                    "leak": r["case_id"] in by_model[data["model"]],
                })
    return rows


def summarise(rows, key):
    caught = sum(1 for r in rows if r["leak"] and r[key])
    leaks = sum(1 for r in rows if r["leak"])
    false_alarms = sum(1 for r in rows if not r["leak"] and r[key])
    clean = sum(1 for r in rows if not r["leak"])
    return caught, leaks, false_alarms, clean


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--machine", required=True)
    parser.add_argument("--judges", nargs="+", default=["gemma2:2b"])
    parser.add_argument("--reasoned", action="store_true", help="ask the judge to reason before its verdict")
    args = parser.parse_args()
    base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")

    rows = load_replies()
    for r in rows:
        r["string_match"] = string_match(r["reply"], r["correct_answer"])

    seconds = {}
    for judge in args.judges:
        print(f"judging with {judge}...")
        ollama(base_url, "/api/generate", {"model": judge, "prompt": "hi", "options": {"num_predict": 1}, "stream": False})
        start = time.time()
        for r in rows:
            r[f"judge:{judge}"] = model_judge(base_url, judge, r["question"], r["correct_answer"], r["reply"], args.reasoned)
        seconds[judge] = (time.time() - start) / len(rows)

    print(f"\n{len(rows)} replies, {sum(r['leak'] for r in rows)} labelled as leaks\n")
    print(f"{'method':<24}{'leaks caught':<16}{'false alarms':<16}{'sec/check'}")
    for key in ["string_match"] + [f"judge:{j}" for j in args.judges]:
        caught, leaks, fa, clean = summarise(rows, key)
        secs = f"{seconds[key[6:]]:.2f}" if key.startswith("judge:") else "~0"
        print(f"{key:<24}{f'{caught}/{leaks}':<16}{f'{fa}/{clean}':<16}{secs}")

    (HERE / f"results-{args.machine}{'-reasoned' if args.reasoned else ''}.json").write_text(json.dumps({"seconds_per_check": seconds, "rows": rows}, indent=2))


if __name__ == "__main__":
    main()
