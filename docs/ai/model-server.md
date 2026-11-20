# Malami's model: where it runs and how to test it

**Host:** Cloudflare Workers AI (decision in `docs/proposals/003-free-ai-hosting.md`, card B1.4).
**Model:** `@cf/meta/llama-4-scout-17b-16e-instruct`, provisional until the bake-off cases are
re-run on Cloudflare. There is no team server: Cloudflare runs the open-weight model on its own
hardware and our app calls it over HTTPS.

## How a message reaches the model

1. A learner types in the Malami page (or presses "Tambayi Malami" after a wrong answer).
2. The browser posts to our route, `/api/malami`, running on Vercel.
3. The route checks the session, builds the prompt, and calls `chatStream()` in
   `lib/ai/modelClient.ts`.
4. `AI_PROVIDER` picks the provider: `cloudflare` on the preview and production sites,
   `ollama` (the default) for offline work on your laptop.
5. The reply streams back word by word through the same route.

The token lives only in Vercel's environment variables and the team lead's `.env.local`. The
browser never sees it.

## Testing as a learner (everyone)

Use the dev preview site (the link is in the team channel). Sign in with your own account.

1. Open the Malami tab and ask a computing question. The reply should appear word by word.
2. Open a lesson, get an exercise wrong on purpose, press **Tambayi Malami**. The chat should
   open with the exercise shown and a first hint already on its way.
3. Ask two follow-ups. Malami should keep the exercise in mind and never give the answer.
4. Try it on a phone too.

Write anything odd on the Trello testing card: what you typed, what came back, the time.

## Running the scripts against Cloudflare (Ammar, Bijou, Elham)

Ask the team lead for the intern token by direct message. Put it in `.env.local`, never in a
commit, a channel or a card:

```
AI_PROVIDER=cloudflare
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

Then:

```bash
npx tsx scripts/cloudflare-adapter-test.ts        # no account needed; fake server
npx tsx scripts/malami-leak-test.ts               # 8 guard cases + 10 live attempts
npx tsx scripts/malami-followup-leak-test.ts      # 5-turn conversation
CLOUDFLARE_MODEL=@cf/meta/llama-3.2-3b-instruct npx tsx scripts/malami-leak-test.ts   # another model
```

## The daily allowance

The free plan gives 10,000 Neurons a day, shared by the preview site and every script run, and
refuses calls after that until 00:00 UTC (01:00 in Nigeria). With Malami's real prompt that is
roughly 200 replies a day on Llama 4 Scout. When it runs out, learners see "Malami is
unavailable" and the server log says `code 4006`. Usage is on the Workers AI page of the
Cloudflare dashboard. Please do not loop the scripts.

## Rollback

Set `NEXT_PUBLIC_MALAMI=false` in Vercel and redeploy: the Malami tab, page and buttons vanish.
To switch provider instead, change `AI_PROVIDER`.

## The Oracle VM (B1.1)

Never obtained: Oracle's free ARM capacity in our region (Chicago) has been unavailable since
October. Not needed for any of the above.
