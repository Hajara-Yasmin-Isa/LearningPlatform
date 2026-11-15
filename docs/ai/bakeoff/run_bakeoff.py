#!/usr/bin/env python3
"""Run every bake-off model on every test case and save the replies + speed/memory.

Usage:
    python3 docs/ai/bakeoff/run_bakeoff.py --machine laptop --prompt v2
    OLLAMA_BASE_URL=http://<vm-tailscale-name>:11434 python3 docs/ai/bakeoff/run_bakeoff.py --machine vm --prompt v2

Writes (under docs/ai/bakeoff/):
    results/<machine>/<prompt>/<model>.json   every reply + timings
    results/<machine>/<prompt>/benchmarks.csv tokens/sec + memory per model
    results/<machine>/<prompt>/raw-outputs.md all replies, for the proposal appendix
    scoring/<prompt>/blind-scoresheet.csv     shuffled, model names hidden (only with --scoresheet)
    scoring/<prompt>/key.csv                  which label is which model

Standard library only. Prompts are documented in prompt.md (v1) and prompt-v2.md, and are
never changed per model.
"""

import argparse
import csv
import json
import os
import random
import statistics
import time
import urllib.request
from pathlib import Path

HERE = Path(__file__).parent
MODELS = ["llama3.2:3b", "qwen2.5:3b", "gemma2:2b", "phi3.5"]
OPTIONS = {"temperature": 0.3, "seed": 42, "num_ctx": 4096, "num_predict": 400}

RULES_V1 = """You are Malamin AI, a friendly computing tutor on a learning platform for beginner students. Many students are learning in English as a second language.

Rules:
1. Never give away the answer to an exercise, even if the student asks directly. Do not say which option is correct, and do not write the corrected code. Instead, give a hint or ask a question that helps the student find it themselves.
2. Explaining a concept is fine. Giving the exercise answer is not.
3. If the student made a mistake, gently point out what is wrong in their thinking.
4. Keep replies short: 2 to 4 sentences. Use simple, clear English.
5. Only help with computing and programming. If the student asks about something else, kindly say you can only help with computing, and invite them back to their lesson.
6. Be correct. If you are not sure about something, say so instead of guessing.
7. When lesson content is given below, base your explanation on it."""

RULES_V2 = """You are Malamin AI, a friendly computing tutor for beginner students. Many students are learning in English as a second language. Your job is to help students find answers themselves.

Rules:
1. NEVER give the answer to the current exercise. Do not name the correct option, do not write the correct code, do not state the correct value, and do not describe it so clearly that only one answer is left. This applies even if the student asks directly or begs. If they ask for the answer, kindly say you can't give it, then give a smaller hint.
2. Before replying, read the student's answer carefully and find the exact mistake. Your hint must be about that mistake.
3. Reply in at most 4 short sentences. End with one question that helps the student take the next step.
4. Use simple English. No long explanations.
5. You only help with computing and programming. If the student asks about anything else (sport, news, other subjects), do not answer it. Say you can only help with computing, and invite them back to their lesson.
6. Only say things you are sure are true.
7. Explaining a concept from the lesson is fine, as long as it does not give away the exercise answer.

Example
Exercise: In CSS, what property changes the text color of an element?
Student answered: font-color
Good reply: "Nice try! font-color isn't a real CSS property. Look at the example in the lesson that makes text blue. Which property does it use?"
Bad reply: "Use color instead of font-color." (This gives the answer.)"""

PROMPTS = {"v1": RULES_V1, "v2": RULES_V2}


def lesson_block(title, content):
    return f"## Current lesson: {title}\n{content}"


def exercise_block(ex, version):
    lines = [
        lesson_block(ex["section_title"], ex["section_content"]),
        "",
        "## Current exercise",
        f"Question: {ex['question']}",
    ]
    if ex["options"]:
        lines.append("Options: " + ", ".join(ex["options"]))
    if version == "v1":
        lines.append(f"Correct answer (for your reference only, NEVER reveal it): {ex['correct_answer']}")
    else:
        lines.append(f"Correct answer: {ex['correct_answer']}")
        lines.append("SECRET: never write this answer, and never say it in other words.")
    return "\n".join(lines)


def build_cases(test_set, version):
    """Turn test-set.json into (case_id, system, user) triples exactly as the prompt docs describe."""
    rules = PROMPTS[version]
    exercises = {ex["id"]: ex for ex in test_set["exercise_cases"]}
    sections = {ex["section_title"]: ex["section_content"] for ex in test_set["exercise_cases"]}
    cases = []

    for ex in test_set["exercise_cases"]:
        user = f'I answered "{ex["student_answer"]}" but it was marked wrong. Can you give me a hint?'
        cases.append((ex["id"], f"{rules}\n\n{exercise_block(ex, version)}", user))

    for chat in test_set["conversation_cases"]:
        if chat.get("exercise_ref"):
            context = exercise_block(exercises[chat["exercise_ref"]], version)
        elif chat["section_title"]:
            context = lesson_block(chat["section_title"], sections[chat["section_title"]])
        else:
            context = "The student is not in a lesson right now."
        cases.append((chat["id"], f"{rules}\n\n{context}", chat["student_message"]))

    return cases


def ollama(base_url, path, payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(base_url + path, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as resp:
        return json.load(resp)


def chat(base_url, model, system, user):
    return ollama(base_url, "/api/chat", {
        "model": model,
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
        "options": OPTIONS,
        "stream": False,
    })


def loaded_size_mb(base_url, model):
    """Memory Ollama reports for the loaded model (weights + context cache)."""
    names = {model, model if ":" in model else f"{model}:latest"}
    for m in ollama(base_url, "/api/ps").get("models", []):
        if m["name"] in names or m["model"] in names:
            return round(m["size"] / 1024 / 1024)
    return None


def run_model(base_url, model, cases):
    print(f"\n== {model}")
    chat(base_url, model, "You are a helpful assistant.", "Say hi.")  # warm-up: load the model outside the timings
    replies = []
    for case_id, system, user in cases:
        start = time.time()
        r = chat(base_url, model, system, user)
        wall = time.time() - start
        tps = r["eval_count"] / (r["eval_duration"] / 1e9) if r.get("eval_duration") else None
        replies.append({
            "case_id": case_id,
            "reply": r["message"]["content"].strip(),
            "output_tokens": r.get("eval_count"),
            "tokens_per_sec": round(tps, 1) if tps else None,
            "seconds_to_reply": round(wall, 2),
        })
        print(f"  {case_id}: {replies[-1]['tokens_per_sec']} tok/s, {replies[-1]['seconds_to_reply']}s")
    memory_mb = loaded_size_mb(base_url, model)
    return replies, memory_mb


def write_results(out_dir, model, replies, memory_mb, cases):
    out_dir.mkdir(parents=True, exist_ok=True)
    prompts = {cid: {"system": s, "user": u} for cid, s, u in cases}
    payload = {"model": model, "prompt_version": out_dir.name, "options": OPTIONS, "memory_mb": memory_mb,
               "replies": [{**r, "prompt": prompts[r["case_id"]]} for r in replies]}
    (out_dir / f"{model.replace(':', '_')}.json").write_text(json.dumps(payload, indent=2))


def write_summary(out_dir, machine, all_results):
    with open(out_dir / "benchmarks.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["machine", "model", "median_tokens_per_sec", "median_seconds_to_reply", "memory_mb"])
        for model, (replies, memory_mb) in all_results.items():
            tps = [r["tokens_per_sec"] for r in replies if r["tokens_per_sec"]]
            secs = [r["seconds_to_reply"] for r in replies]
            w.writerow([machine, model, round(statistics.median(tps), 1), round(statistics.median(secs), 2), memory_mb])

    lines = [f"# Raw outputs ({machine}, prompt {out_dir.name})", ""]
    case_ids = [r["case_id"] for r in next(iter(all_results.values()))[0]]
    for i, case_id in enumerate(case_ids):
        lines += [f"## {case_id}", ""]
        for model, (replies, _) in all_results.items():
            lines += [f"**{model}**", "", "> " + replies[i]["reply"].replace("\n", "\n> "), ""]
    (out_dir / "raw-outputs.md").write_text("\n".join(lines))


def case_context(test_set):
    """What a scorer needs to see next to each reply: the question, what the student said, the right answer."""
    context = {}
    for ex in test_set["exercise_cases"]:
        question = ex["question"] + (" Options: " + ", ".join(ex["options"]) if ex["options"] else "")
        context[ex["id"]] = (question, ex["student_answer"], ex["correct_answer"])
    exercises = {ex["id"]: ex for ex in test_set["exercise_cases"]}
    for chat in test_set["conversation_cases"]:
        ref = exercises.get(chat.get("exercise_ref"))
        topic = f"Chat (lesson: {chat['section_title'] or 'none'})"
        context[chat["id"]] = (topic, chat["student_message"], ref["correct_answer"] if ref else "")
    return context


def write_scoresheet(all_results, version):
    """Shuffle model order per case and hide names, so scoring is blind."""
    out = HERE / "scoring" / version
    out.mkdir(parents=True, exist_ok=True)
    rng = random.Random(2026)
    labels = "ABCDEFGH"
    models = list(all_results)
    case_ids = [r["case_id"] for r in all_results[models[0]][0]]
    context = case_context(json.loads((HERE / "test-set.json").read_text()))

    with open(out / "blind-scoresheet.csv", "w", newline="") as sheet, open(out / "key.csv", "w", newline="") as key:
        s, k = csv.writer(sheet), csv.writer(key)
        s.writerow(["case_id", "question", "student_said", "correct_answer", "label", "reply",
                    "no_reveal", "correct", "helpful", "length_tone", "notes"])
        k.writerow(["case_id", "label", "model"])
        for i, case_id in enumerate(case_ids):
            order = models[:]
            rng.shuffle(order)
            for label, model in zip(labels, order):
                reveal = "N/A" if case_id in ("C01", "C02", "C03", "C05") else ""
                s.writerow([case_id, *context[case_id], label, all_results[model][0][i]["reply"],
                            reveal, "", "", "", ""])
                k.writerow([case_id, label, model])


def load_results(machine, version):
    """Read a finished run back from disk, so the scoresheet can be rebuilt without re-running models."""
    all_results = {}
    for path in sorted((HERE / "results" / machine / version).glob("*.json")):
        data = json.loads(path.read_text())
        all_results[data["model"]] = (data["replies"], data["memory_mb"])
    return all_results


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--machine", required=True, help="label for this run, e.g. laptop or vm")
    parser.add_argument("--prompt", choices=sorted(PROMPTS), default="v1", help="which prompt version to use")
    parser.add_argument("--models", nargs="+", default=MODELS)
    parser.add_argument("--scoresheet", action="store_true", help="also write the blind scoresheet from this run")
    parser.add_argument("--scoresheet-only", action="store_true",
                        help="rebuild the scoresheet from saved results for --machine, without running models")
    args = parser.parse_args()

    if args.scoresheet_only:
        write_scoresheet(load_results(args.machine, args.prompt), args.prompt)
        print("Scoresheet rebuilt.")
        return

    base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
    cases = build_cases(json.loads((HERE / "test-set.json").read_text()), args.prompt)
    out_dir = HERE / "results" / args.machine / args.prompt

    all_results = {}
    for model in args.models:
        replies, memory_mb = run_model(base_url, model, cases)
        write_results(out_dir, model, replies, memory_mb, cases)
        all_results[model] = (replies, memory_mb)

    write_summary(out_dir, args.machine, all_results)
    if args.scoresheet:
        write_scoresheet(all_results, args.prompt)
    print(f"\nDone. Results in {out_dir}")


if __name__ == "__main__":
    main()
