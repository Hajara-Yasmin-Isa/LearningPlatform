#!/usr/bin/env bash
# Summarises a results file from bench.sh. Portable: BSD awk + sort, no gawk needed.
#
#   usage: ./stats.sh results/cloudflare-20261006-193000.txt
#
# Latency percentiles are over successful (HTTP 200) calls only; failures are counted
# separately. Token usage is reported when the bodies directory next to the file exists
# and the provider returns a usage object (Cloudflare: result.usage, OpenAI-style: usage).

set -euo pipefail

FILE="${1:?usage: ./stats.sh <results-file>}"

n=$(wc -l < "$FILE" | tr -d ' ')
if [ "$n" -eq 0 ]; then echo "no data"; exit 1; fi
failures=$(awk '$3 != 200 { f++ } END { print f + 0 }' "$FILE")
ok=$((n - failures))

# pct <column> <fraction>: nearest-rank percentile of a column over successful calls
pct() {
  local idx
  idx=$(awk -v n="$ok" -v p="$2" 'BEGIN { i = int(n * p + 0.999999); if (i < 1) i = 1; print i }')
  awk -v c="$1" '$3 == 200 { print $c }' "$FILE" | sort -n | sed -n "${idx}p"
}

printf "calls:        %d\n" "$n"
printf "failures:     %d (%s%%)\n" "$failures" "$(awk -v f="$failures" -v n="$n" 'BEGIN { printf "%.1f", f / n * 100 }')"
if [ "$ok" -eq 0 ]; then
  echo "latency:      no successful calls"
else
  printf "ttfb  p50:    %.2fs\n" "$(pct 1 0.50)"
  printf "ttfb  p95:    %.2fs\n" "$(pct 1 0.95)"
  printf "total p50:    %.2fs\n" "$(pct 2 0.50)"
  printf "total p95:    %.2fs\n" "$(pct 2 0.95)"
fi

BODIES="${FILE%.txt}"
if [ -d "$BODIES" ] && ls "$BODIES"/*.json >/dev/null 2>&1; then
  jq -r '(.result.usage // .usage) | select(. != null) | "\(.prompt_tokens) \(.completion_tokens)"' "$BODIES"/*.json 2>/dev/null \
    | awk '{ p += $1; c += $2; k++ }
           END { if (k) printf "tokens (mean): prompt %.0f, completion %.0f, over %d calls\n", p / k, c / k, k
                 else print "tokens:       not reported by this provider" }'
fi
