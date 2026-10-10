#!/usr/bin/env bash
# Times repeated calls against one provider endpoint.
#
#   usage: ./bench.sh <label> [n_runs]
#   env:   AI_BASE_URL, AI_API_KEY   (see .env.example)
#
# Output columns: ttfb_seconds total_seconds http_status
# Results land in results/<label>-<timestamp>.txt

set -euo pipefail

LABEL="${1:?usage: ./bench.sh <label> [n_runs]}"
RUNS="${2:-20}"

: "${AI_BASE_URL:?set AI_BASE_URL}"
: "${AI_API_KEY:?set AI_API_KEY}"

DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="$DIR/results/${LABEL}-$(date +%Y%m%d-%H%M%S).txt"
mkdir -p "$DIR/results"

echo "running $RUNS calls against $LABEL" >&2

for i in $(seq 1 "$RUNS"); do
  curl -s -o /dev/null \
    -w "%{time_starttransfer} %{time_total} %{http_code}\n" \
    -X POST "$AI_BASE_URL" \
    -H "Authorization: Bearer $AI_API_KEY" \
    -H "Content-Type: application/json" \
    -d @"$DIR/prompt.json" \
    >> "$OUT"

  printf '.' >&2
  sleep 2
done

echo "" >&2
echo "wrote $OUT" >&2
"$DIR/stats.sh" "$OUT"