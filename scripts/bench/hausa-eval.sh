#!/usr/bin/env bash
# Runs every prompt in hausa-prompts.txt through the configured provider, using the same
# system prompt and max_tokens as prompt.json, and writes prompt/response pairs to a file
# a fluent reviewer can score.
#
#   usage: ./hausa-eval.sh
#   env:   AI_BASE_URL, AI_API_KEY, AI_MODEL (optional) — see bench.sh / .env.example

set -euo pipefail

: "${AI_BASE_URL:?set AI_BASE_URL}"
: "${AI_API_KEY:?set AI_API_KEY}"

DIR="$(cd "$(dirname "$0")" && pwd)"
PROMPTS="$DIR/hausa-prompts.txt"
OUT="$DIR/results/hausa-eval-$(date +%Y%m%d-%H%M%S).md"
RAW="$DIR/results/.last-response.json"
mkdir -p "$DIR/results"

SYSTEM="$(jq -r '.messages[] | select(.role == "system") | .content' "$DIR/prompt.json")"
MAX_TOKENS="$(jq -r '.max_tokens // 300' "$DIR/prompt.json")"

{
  echo "# Hausa output review"
  echo ""
  echo "Score each response 1-3. 3 = would ship, 2 = understandable but awkward,"
  echo "1 = wrong or incoherent. Record the percentage scoring 3."
  echo ""
  echo "Endpoint: $AI_BASE_URL · model: ${AI_MODEL:-(in URL)} · max_tokens: $MAX_TOKENS"
  echo ""
} > "$OUT"

n=0
# the `|| [ -n "$prompt" ]` keeps a last line that has no trailing newline
while IFS= read -r prompt || [ -n "$prompt" ]; do
  [ -z "$prompt" ] && continue
  n=$((n + 1))

  body=$(jq -n --arg s "$SYSTEM" --arg p "$prompt" --arg m "${AI_MODEL:-}" --argjson t "$MAX_TOKENS" \
    '{messages: [{role: "system", content: $s}, {role: "user", content: $p}], max_tokens: $t}
     + (if $m != "" then {model: $m} else {} end)')

  # a failed call is recorded as an ERROR line instead of aborting the whole run
  rm -f "$RAW"
  status=$(curl -s --max-time 60 -o "$RAW" -w "%{http_code}" -X POST "$AI_BASE_URL" \
    -H "Authorization: Bearer $AI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$body") || status="000"

  if [ "$status" = "200" ]; then
    response=$(jq -r '.result.response // .choices[0].message.content // "NO RESPONSE (unrecognised body)"' "$RAW" 2>/dev/null \
      || echo "NO RESPONSE (body is not JSON)")
  else
    excerpt=$( { head -c 300 "$RAW" 2>/dev/null || true; } | tr '\n' ' ')
    response="ERROR HTTP $status: ${excerpt:-(no response body)}"
  fi

  {
    echo "## $n"
    echo ""
    echo "**Prompt:** $prompt"
    echo ""
    echo "**Response:** $response"
    echo ""
    echo "**Score:** _____"
    echo ""
    echo "---"
    echo ""
  } >> "$OUT"

  printf '.' >&2
  sleep 1
done < "$PROMPTS"

rm -f "$RAW"
echo "" >&2
echo "wrote $OUT ($n prompts)" >&2
