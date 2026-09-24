# Cohort 3 Onboarding — AI Development & Instructor Tools

**Welcome (and welcome back) to the team 🚀**

**Project:** Littafin Fasaha — Language-First Computing Education Platform
**Phase:** Beta (live in production)
**Cohort 3 Goal:** Build AI-assisted learning and a real instructor experience — on top of the platform previous cohorts shipped.

---

## 1. What Changed Since Last Cohort

Previous cohorts built the infrastructure. It's live:

- **littafinfasaha.com is in public beta with real users** — students in Nigeria learning in Hausa, sending us feedback (one user's bug report already led to a shipped fix).
- **One complete course is live:** Ƙa'idoji da Dabarun Koding a Kwamfuta — 6 lessons, 36 sections, 77 interactive exercises, entirely in Hausa, with mastery gating and progress tracking.
- The auth flow, course catalog, lesson viewer, exercise engine, progress tracking, and student dashboard all exist and work. **We are not rebuilding these.**

What this means for you: **the bar changed.** Mistakes in early cohorts broke a demo. Mistakes now can affect real learners. The workflow rules below exist for that reason.

New students: read the original **Student Onboarding Guide** first for the full tool stack (Trello, GitHub, Supabase, Vercel) — this document assumes it. Returning students: §5 is unchanged from how you already work; §3–4 are new.

---

## 2. Cohort 3 Teams

Two fixed teams this cohort — **Team A: Instructor Dashboard (2 students)** · **Team B: Malamin AI (3 students)**. Trello card IDs match the team letters (A1.1…, B1.1…).

### Team B — Malamin AI 🤖 (3 students, research-heavy)

**Goal:** bring the **Malamin AI** tab to life — the AI teacher the site header already promises ("Zuwa nan tafe"). It's a conversational tutor a student chats with, grounded in the lessons; failing an exercise offers a second door into the same conversation ("Tambayi Malami"). You build the *system*; all learner-facing content and Hausa language quality remain owned by the team lead. Prototype against the English demo courses in the seed data.

Example epics (each starts as a research task, §3):

- **Conversation pipeline:** multi-turn chat with lesson/exercise context, topic boundaries (Malami teaches computing — off-topic gets a friendly redirect), and guide-don't-reveal enforced in code.
- **Grounding & retrieval:** current-section context vs retrieval over all lessons vs hybrid.
- **Evaluation harness:** a golden set that measures tutor usefulness and safety before anything ships.
- **Cost & latency:** every message affordable ($0 stack) and fast on low-bandwidth connections.

Living docs to know: `docs/ai/model-server.md` (how to connect to the team model server) · `docs/ai/golden-set/` · `docs/proposals/` (sequential numbering — check for the next free number).

### Team A — Instructor Dashboard 🧑‍🏫 (2 students, engineering-heavy)

**Goal:** replace the current stub with a real instructor experience. Today, `InstructorDashboard.tsx` exists but is not routed, `CreateLessonTab` is placeholder boxes, and the analytics numbers are hardcoded. Real work, clearly scoped:

- Route the instructor dashboard (role-based: `/dashboard` currently always renders the student view).
- **Lesson authoring:** create/edit lessons, sections, and exercises from the UI (today all content is inserted via hand-written SQL seed files).
- **Real analytics:** actual enrollment, progress, and exercise-success data via RLS-respecting queries.
- **Classes:** enrolling in a course always places a student in that course's *general class* (admin-visible); instructors run their own classes that students **join by code**, and see only their own students' performance.
- **The instructor gate:** nobody becomes an instructor without team approval — a request → admin-approval flow guards the role.

Team A tasks mostly follow the standard build flow. Team B tasks often start as research tasks — that's new, read on.

---

## 3. NEW: Research Tasks (Theory Before Code)

Cohort 3 introduces a second task type. Every Trello card is labeled **BUILD** or **RESEARCH**.

We run **2-week sprints**: sprint planning on day 1 re-confirms card scope against the latest proposals; BUILD PRs open by day 8 (leave review time); RESEARCH is presented at the day-10 sprint sync.

**BUILD** = the flow from previous cohorts, unchanged: card → branch → PR to `dev` → review → merge.

**RESEARCH** = for questions where we don't yet know the right answer (most AI work, some dashboard UX). The lifecycle:

1. **Card assigned** in Trello with a research question, scope, and a presentation date.
2. **Investigate** — read, prototype in a scratch repo/notebook (throwaway code is fine and encouraged here; it does NOT go through PR review).
3. **Write a proposal** — 1–2 pages max, using the template below. Committed to `docs/proposals/` via normal PR (this is the one artifact that does get reviewed).
4. **Present at the day-10 sprint sync** — 5–10 minutes, then questions.
5. **Decision:** approve / revise / park. Recorded on the Trello card.
6. **Approved proposals become BUILD cards** — often several, often assigned to more people than just the researcher.

### Proposal template (`docs/proposals/NNN-short-title.md`)

```
# NNN — Title
Author / Date / Trello card link

1. Question        — what are we trying to find out?
2. Background      — what exists (in our repo, in research, in other products)?
3. Proposed answer — your recommendation, concretely
4. Alternatives    — what else you considered and why not
5. Risks           — cost, safety, Hausa quality, learner impact
6. Success metric  — how we'll know it worked
7. Build sketch    — rough breakdown into BUILD cards
```

**Why this exists:** AI features are easy to demo and hard to do responsibly in a low-resource language. Ten minutes of theory review saves weeks of building the wrong thing — and presenting your reasoning is a skill this project is meant to teach as much as coding is.

---

## 4. NEW: Production & AI Rules (Non-Negotiable)

We have real users now. These are additions to (not replacements for) the original guide's rules:

1. **Never test against production.** Use your local Supabase instance / the seed files. Never write scripts that touch production user data.
2. **User data is private.** Real learners' emails, progress, and feedback never appear in Slack, screenshots, PRs, or proposals. Anonymize everything.
3. **Learner-facing copy comes from the team lead.** Build with `TODO: copy` placeholders; final text (in Hausa) is supplied and approved by the lead before anything ships. Don't invent user-facing wording.
4. **No AI-generated Hausa content reaches learners without native-speaker review.** Ever. This is our credibility — one wrong lesson in a language we claim to serve costs more than a missing feature.
5. **No paid AI APIs.** Model inference runs locally via Ollama in development; anything hosted must be free-tier or self-hosted. AI logic lives server-side only — never in client components, never `NEXT_PUBLIC_*`.
6. **Mind machine limits, not bills.** Use small quantized models; document RAM and speed requirements in proposals so everything stays runnable on ordinary laptops.
7. **RLS on every table, migrations via PR** — unchanged from previous cohorts, and now enforced by branch protection.
8. **AI conversations are learner-private.** Malami transcripts are readable only by the learner (and the platform owner). Instructors see **aggregates only** — never build a surface that shows an instructor a student's raw transcript.

---

## 5. Unchanged: How Code Flows

Same as previous cohorts (full detail in the original guide):

- **Trello card first.** No card, no work. One card = one task = one PR.
- **Branches:** `main` (production, protected) ← `dev` (integration, PRs merge here) ← `feature/<your-name>-<task>`.
- **Flow:** pull latest `dev` → branch → small boring commits → push → PR to `dev` with what changed / what to test / risks + Vercel preview link → update Trello → review → merge.
- **Stack:** Next.js 15 + TypeScript (strict) + Tailwind, Supabase (Postgres + Auth + RLS), Vercel. Conventions live in `CLAUDE.md` at the repo root.

---

## 6. Kickoff Week Checklist

**Everyone:**
- [ ] Accept invites: GitHub repo, Trello board, Slack workspace
- [ ] Clone the repo, `npm install`, get `.env.local` keys (shared privately — never committed)
- [ ] Run the app locally and complete Lesson 1 as a student — know what learners experience
- [ ] Confirm your team (A: Instructor Dashboard ×2 · B: Malamin AI ×3) and your first card in Trello
- [ ] *Team B only:* get Tailscale access to the model server and set `OLLAMA_BASE_URL` in `.env.local` (see `docs/ai/model-server.md`)

**New students only:**
- [ ] Read the original Student Onboarding Guide end-to-end
- [ ] First task will be a small starter BUILD card — your first PR within week one

**Returning students only:**
- [ ] Read §3–4 above (research flow + production rules)
- [ ] First research cards go to returning students — you know the codebase; teach it forward

---

*This is both a learning environment and a real system serving real learners.*
*Mistakes are expected. Silent confusion is not. — that rule survives every cohort.*
