#!/usr/bin/env bash
# Runs every prompt in hausa-prompts.txt through the configured provider and
# writes prompt/response pairs to a file a fluent reviewer can score.
#
#   usage: ./hausa-eval.sh
#   env:   AI_BASE_URL, AI_API_KEY, AI_MODEL

set -euo pipefail

: "${AI_BASE_URL:?set AI_BASE_URL}"
: "${AI_API_KEY:?set AI_API_KEY}"

DIR="$(cd "$(dirname "$0")" && pwd)"
PROMPTS="$DIR/hausa-prompts.txt"
OUT="$DIR/results/hausa-eval-$(date +%Y%m%d-%H%M%S).md"
mkdir -p "$DIR/results"

echo "# Hausa output review" > "$OUT"
echo "" >> "$OUT"
echo "Score each response 1-3. 3 = would ship, 2 = understandable but awkward," >> "$OUT"
echo "1 = wrong or incoherent. Record the percentage scoring 3." >> "$OUT"
echo "" >> "$OUT"

n=0
while IFS= read -r prompt; do
  [ -z "$prompt" ] && continue
  n=$((n + 1))

  body=$(jq -n --arg p "$prompt" '{messages: [{role: "user", content: $p}]}')

  response=$(curl -s -X POST "$AI_BASE_URL" \
    -H "Authorization: Bearer $AI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$body" | jq -r '.result.response // .choices[0].message.content // "NO RESPONSE"')

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

echo "" >&2
echo "wrote $OUT ($n prompts)" >&2