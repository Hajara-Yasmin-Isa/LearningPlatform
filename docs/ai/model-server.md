# Malami Model Server

The shared always-on inference server for Team B. Runs Ollama with the Malami candidate models,
reachable by the team over Tailscale.

**Card:** B1.1 (AI-1) · **Owner:** Ammar · **Status:** blocked on Always Free compute capacity — see section 2

---

## 1. What this is and why it exists

Malami needs a model server that is always on. Laptops are not, and the bake-off (B1.2) needs
consistent hardware so tokens/sec numbers are comparable across models.

This server is for **development and beta testing only**. Production hosting is a separate
question, owned by B1.4 — see `docs/proposals/003-free-ai-hosting.md`.

---

## 2. What we provisioned, and why

### Current status: no instance yet

Account and network are ready; compute capacity is the blocker.

**Done:**

| | |
|---|---|
| Tenancy | `contact7792`, owned by Littafin Fasaha (not a student account) |
| Compartment | `ai-dev` |
| Region | `us-chicago-1` |
| VCN | `malami-vcn` (10.0.0.0/16) with public subnet, internet gateway, route tables |
| Instance config | Validated — public IPv4, SSH key, 100 GB boot volume |

**Blocked:** no Always Free compute shape is currently obtainable in this region.

### Capacity investigation — 2026-10-20

**`VM.Standard.A1.Flex` (ARM, the target): out of capacity.** Eight combinations tried, all
returning `Out of capacity for shape VM.Standard.A1.Flex`:

| Availability domain | 4 OCPU / 24 GB | 2 OCPU / 12 GB | 1 OCPU / 6 GB |
|---|---|---|---|
| AD-1 | failed | failed | failed |
| AD-2 | failed | failed | failed |
| AD-3 | failed | failed | — |

**`VM.Standard.E2.1.Micro` (x86, the documented fallback): not offered in `us-chicago-1`.**
The "Specialty and previous generation" shape category — which is where Oracle lists the
Always Free shapes — is empty in all three availability domains, on both Ubuntu 22.04 and
24.04 images. The only AMD shape offered in this region is `VM.Standard.E5.Flex`, which is
not Always Free eligible.

Chicago is one of Oracle's newer regions and appears to have launched on E4/E5 hardware
without ever deploying the older E2 generation that the Always Free x86 tier depends on.

**Consequence:** this region has no Always Free x86 option at all, and the ARM pool is dry.
The home region is fixed at tenancy creation and Always Free resources exist only in the
home region, so switching regions is not available as a workaround.

**Relevant to B1.4:** Always Free compute availability is region-dependent in a way the
provider's marketing does not make obvious. Worth factoring into any production hosting
recommendation that assumes Oracle Always Free as a durable zero-cost base.

### Interim

Bake-off groundwork (B1.2) proceeds on local laptop installs of Ollama, which the B1.2 card
already anticipates. See section 8 — laptop figures are recorded separately and are **not**
a substitute for server benchmarks.

---

## 3. How to connect

### One-time setup

1. Create a free Tailscale account at <https://tailscale.com>.
2. Ask Ammar for a **node share invite** (the server is shared as a node — you do not join a
   shared tailnet, you keep your own).
3. Install Tailscale on your laptop and sign in.
4. Accept the shared node.

### Verify you can reach it

```bash
curl http://TODO_TAILSCALE_IP:11434/api/generate \
  -d '{"model":"llama3.2:3b","prompt":"hello","stream":false}'
```

A JSON response containing a `response` field means you are connected.

### For local app development

Add to `.env.local`:

```
OLLAMA_BASE_URL=http://TODO_TAILSCALE_IP:11434
```

This is the variable `lib/ai/ollamaClient.ts` reads (see B1.3). Swapping hosting later is a
config change, not a code change.

**Never commit this value with a public address, and never prefix it with `NEXT_PUBLIC_`.**
AI calls are server-side only.

---

## 4. Available models

| Model | Size | Params | Notes |
|---|---|---|---|
| `llama3.2:3b` | TODO | 3B | |
| `qwen2.5:3b` | TODO | 3B | |
| `gemma2:2b` | TODO | 2B | |
| `phi3.5` | TODO | 3.8B | |

List what is actually installed:

```bash
ollama list
```

---

## 5. How to add a model

SSH to the server (or use Tailscale SSH), then:

```bash
ollama pull <model-name>
ollama list                 # confirm it registered
df -h                       # check disk headroom before pulling anything large
```

Prefer quantized tags. Check disk before pulling — the boot volume is finite and a failed
pull on a full disk leaves partial blobs behind.

---

## 6. How to restart it

Ollama runs as a systemd service.

```bash
sudo systemctl status ollama     # is it running?
sudo systemctl restart ollama    # restart
sudo systemctl stop ollama
sudo systemctl start ollama
journalctl -u ollama -f          # live logs
journalctl -u ollama -n 100      # recent logs
```

Confirm it is bound to the Tailscale interface and nothing else:

```bash
sudo ss -tlnp | grep 11434
```

Expected: the Tailscale `100.x.y.z` address. **If this shows `0.0.0.0`, the server is exposed
to the public internet — stop and fix it before doing anything else.**

---

## 7. Security model

Ollama has **no authentication**. Anyone who can reach the port can use the server. The design
here is that the port does not exist on the public interface at all.

- Ollama binds directly to the Tailscale IP, not `0.0.0.0`. There is no firewall rule to get
  wrong, because nothing is listening publicly.
- Cloud security list: only port 22 inbound.
- Host firewall: same.
- Tailscale requires **no inbound firewall rules** — it connects outbound.

### Verified closed

External port scan from a machine **not on the tailnet**:

```bash
nmap -Pn -p 22,11434 TODO_PUBLIC_IP
```

TODO paste result. Expected: 22 open, 11434 filtered.

Last verified: TODO date

If you change the bind address or firewall rules, re-run this scan.

---

## 8. Benchmarks

Method: identical prompt across all models, one warm-up run discarded, median of 3 runs.

Prompt: `Explain what a loop is in programming, in three sentences.`

### Server (Ampere A1) — pending

Blocked on capacity; see section 2. **CPU-only, no GPU.**

| Model | Eval rate (tok/s) | RAM loaded | Cold load (s) |
|---|---|---|---|
| `llama3.2:3b` | TODO | TODO | TODO |
| `qwen2.5:3b` | TODO | TODO | TODO |
| `gemma2:2b` | TODO | TODO | TODO |
| `phi3.5` | TODO | TODO | TODO |

### Laptop reference — Apple M5 Pro, 24 GB · 2026-10-20

Ollama 0.40.5. `ollama ps` reports **100% GPU** for every model.

| Model | Eval rate (median tok/s) | Resident size | Cold load (s) |
|---|---|---|---|
| `gemma2:2b` | 129.20 | 1.9 GB | 1.30 |
| `qwen2.5:3b` | 114.11 | 2.2 GB | 4.81 |
| `llama3.2:3b` | 113.88 | 2.6 GB | 5.09 |
| `phi3.5` | 104.84 | 3.9 GB | 1.07 |

Run-to-run spread was under 3% for every model, so the ranking is stable.

> **These two tables are not comparable, and laptop figures must not be used for capacity
> planning.** Apple Silicon runs inference entirely on the GPU via Metal with unified memory
> — `ollama ps` confirms 100% GPU above. Ampere A1 has no GPU and runs on CPU only. Expect
> the server to be slower by roughly an order of magnitude. Laptop numbers are useful for
> *ranking models against each other*, not for predicting server throughput or sizing
> production load.

Two observations that carry over to the server regardless of hardware:

- **Resident size is the binding constraint, not speed.** `phi3.5` needs 3.9 GB — more than
  double `gemma2:2b` at 1.9 GB. On a memory-constrained instance that difference decides
  what can run at all, and how many models stay resident at once.
- **`gemma2:2b` is both the fastest and the smallest**, which makes it the natural first
  model to pull on any instance — as the B1.1 card already specifies.

Reproduce:

```bash
PROMPT="Explain what a loop is in programming, in three sentences."

for m in gemma2:2b llama3.2:3b qwen2.5:3b phi3.5; do
  ollama stop "$m" 2>/dev/null; sleep 2
  echo "=== $m ==="
  ollama run --verbose "$m" "$PROMPT" 2>&1 >/dev/null | grep -i "load duration"
  ollama ps
  for i in 1 2 3; do
    ollama run --verbose "$m" "$PROMPT" 2>&1 >/dev/null | grep -i "^eval rate"
  done
done
```

These numbers feed B1.2 (model bake-off) and B1.4 (production hosting viability).

---

## 9. Known limits

- **CPU-only inference.** No GPU. TODO note practical tok/s and what that means for UX.
- **Concurrency.** TODO how many simultaneous requests before it degrades.
- **Memory ceiling.** TODO how many models can stay resident at once.
- **Single point of failure.** One VM, no redundancy. If it goes down, all AI work stops.
- **Not production.** Learners cannot reach this server. See B1.4.
- **Free tier terms.** TODO any reclamation or idle policy worth knowing.

---

## 10. Troubleshooting

**Cannot reach the server**
1. `tailscale status` on your laptop — are you connected and is the node visible?
2. Confirm you accepted the node share invite.
3. `ping TODO_TAILSCALE_IP`
4. If ping works but the curl fails, the service is likely down — ask Ammar to check
   `systemctl status ollama`.

**Request hangs or times out**
First request to a model includes load-from-disk time, which is slow on CPU. Subsequent
requests are faster. If it never returns, check `journalctl -u ollama -n 100` for OOM.

**`model not found`**
Run `ollama list`. If missing, it needs pulling — see section 5.

**Out of memory**
Models are being held in memory simultaneously. Restart the service to clear them.

---

## 11. Access and credentials

Tailscale node shares are issued by Ammar. SSH keys are shared privately.

**No credentials, keys, or tokens in this file or anywhere else in the repo.**
