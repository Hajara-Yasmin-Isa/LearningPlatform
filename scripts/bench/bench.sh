#!/usr/bin/env bash
# Times repeated calls against one provider endpoint and keeps every response body.
#
#   usage: ./bench.sh <label> [n_runs]
#   env:   AI_BASE_URL   full URL of the chat endpoint
#                        (Cloudflare Workers AI: .../accounts/<id>/ai/run/@cf/<model>)
#          AI_API_KEY    bearer token
#          AI_MODEL      optional; added to the request body for OpenAI-style endpoints
#          See .env.example. These are bench-only variables: the app's provider
#          config is owned by B1.3 (OLLAMA_BASE_URL / OLLAMA_MODEL) and the adapter
#          proposed in docs/proposals/003.
#
# Output columns: ttfb_seconds total_seconds http_status  (status 000 = no connection)
# Results land in results/<label>-<timestamp>.txt, bodies in results/<label>-<timestamp>/NN.json

set -euo pipefail

LABEL="${1:?usage: ./bench.sh <label> [n_runs]}"
RUNS="${2:-20}"

: "${AI_BASE_URL:?set AI_BASE_URL}"
: "${AI_API_KEY:?set AI_API_KEY}"

DIR="$(cd "$(dirname "$0")" && pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$DIR/results/${LABEL}-${STAMP}.txt"
BODIES="$DIR/results/${LABEL}-${STAMP}"
mkdir -p "$BODIES"

# prompt.json is the request; AI_MODEL is only added when set (Cloudflare takes the model in the URL)
BODY="$(jq -c --arg m "${AI_MODEL:-}" 'if $m != "" then . + {model: $m} else . end' "$DIR/prompt.json")"

echo "running $RUNS calls against $LABEL" >&2

for i in $(seq 1 "$RUNS"); do
  n=$(printf '%02d' "$i")
  # a failed call (timeout, refused connection) still writes its line, with status 000
  curl -s --max-time 60 -o "$BODIES/$n.json" \
    -w "%{time_starttransfer} %{time_total} %{http_code}\n" \
    -X POST "$AI_BASE_URL" \
    -H "Authorization: Bearer $AI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$BODY" \
    >> "$OUT" || true

  printf '.' >&2
  sleep 2
done

echo "" >&2
echo "wrote $OUT (bodies in $BODIES/)" >&2
"$DIR/stats.sh" "$OUT"
