#!/usr/bin/env bash
# Summarises a results file from bench.sh.
#
#   usage: ./stats.sh results/cloudflare-20261006-193000.txt

set -euo pipefail

FILE="${1:?usage: ./stats.sh <results-file>}"

awk '
  { ttfb[NR] = $1; total[NR] = $2; if ($3 != 200) failures++ }
  END {
    n = NR
    if (n == 0) { print "no data"; exit 1 }

    asort(ttfb); asort(total)

    p50_i = int(n * 0.50); if (p50_i < 1) p50_i = 1
    p95_i = int(n * 0.95); if (p95_i < 1) p95_i = 1

    printf "calls:        %d\n", n
    printf "failures:     %d (%.1f%%)\n", failures, (failures / n) * 100
    printf "ttfb  p50:    %.2fs\n", ttfb[p50_i]
    printf "ttfb  p95:    %.2fs\n", ttfb[p95_i]
    printf "total p50:    %.2fs\n", total[p50_i]
    printf "total p95:    %.2fs\n", total[p95_i]
  }
' "$FILE"