# VibeForces

**LeetCode for vibecoders.** A competitive assessment platform for the engineering skill that actually ships software in 2026: prompting, debugging, and orchestrating AI.

**Submission:** Built with Opus 4.7 — Claude Code Hackathon
**Live:** [vibeforces.tech](https://vibeforces.tech)
**Author:** Shivam Dwivedi · [@dwivediishivam](https://github.com/dwivediishivam)
**License:** MIT

---

## Why this exists

LeetCode tests whether you can reverse a linked list. Eighty percent of startups now ship code through AI. There is no standardized way to train, test, or rank the skill that actually moves the needle in a 2026 engineering org — the ability to drive a model toward working software.

VibeForces is two things in one platform:

1. **A training ground for engineers** who want to get measurably better at prompt-driven work.
2. **A hiring instrument for recruiters** who are tired of testing the wrong thing.

Three roles (learner / recruiter / admin), Codeforces-style ratings, public leaderboards, live contests, recruiter test builder with shareable links.

---

## The two tiers

### Tier 1 — SDE1 / SDE2 (5 categories, 30 challenges)

The skills you'd test for an entry-to-mid-level role at a startup:

| Category | What it tests |
|---|---|
| **Spec-to-Prompt** | Listen to a voice-note spec. Write a prompt that produces the described output. Plan-and-act mode at higher difficulties. |
| **Token Golf** | Achieve the target output in the fewest possible tokens. Efficiency is the score. |
| **Bug Fix Prompting** | Broken code is shown. Identify the bug *precisely* in your prompt. "Fix this" scores zero. |
| **Architecture Pick** | The model gives three options for a technical decision. Rank them best-to-worst. Tests judgment. |
| **UI Reproduction** | Screenshot in, prompt out, HTML/CSS generated, screenshot diffed. |

Each category has 6 challenges across easy / medium / hard, rated 800–2000+ Codeforces-style. Every submission is auto-scored on accuracy, token efficiency, and time. Global leaderboard, live percentiles, contest leaderboards, recruiter test results.

### Tier 2 — SDE2+ (3 categories, 9 challenges, **powered by Claude Managed Agents**)

This is the part you can't build on a regular LLM API. Senior engineers don't write one-shot prompts — they design systems, debug distributed bugs, and orchestrate multi-step work. So at this tier the candidate's submission isn't a prompt. It's an agent.

| Category | What it tests | Eval substrate |
|---|---|---|
| **Distributed Debug** | Can you drive an agent to reproduce, isolate, and patch a bug that spans multiple services? Cache stampedes, dual-writes, off-by-ones across two databases. | A real GitHub repo with a planted bug is mounted into a Managed Agents session container. The failing test goes red→green or it doesn't. |
| **System Design Build** | Can you instruct an agent to build a service end-to-end, run tests, verify under load, and *log every architectural decision*? | A fresh sandbox with bash + write + edit + read. A custom `report_design_decision` tool turns rationales into structured grading signal. |
| **Agent Orchestration** | Can you *design the agent itself*? You submit a system prompt + tool surface + budget. We instantiate it as a real Managed Agent and run it against a sealed eval fixture. | Subgoal custom tools (`flag_duplicate`, `submit_digest`, etc.) record every meaningful action. The trace is the score. |

Nine senior-tier challenges, ratings 1400–2400, gated behind a Pro plan because each run is real Managed Agents compute.

---

## Why Claude Managed Agents is load-bearing

Tier 2 is not a Managed Agents demo. It's a workflow that doesn't work without Managed Agents. Three primitives map 1:1 to the grading model:

| Managed Agents primitive | Used as |
|---|---|
| **Per-session sandboxed container** | The thing being debugged or built. The agent has bash, write, edit, code execution. We can't let candidates run untrusted code on our boxes; Anthropic gives us isolation for free. |
| **Custom tools** | Subgoal counters, final-output contracts, decision logs. We grade by counting tool-use events, not by parsing prose. Determinism replaces "judge-the-vibes." |
| **Task budgets** (`output_config.task_budget`, beta `task-budgets-2026-03-13`) | The cost-efficiency axis. The model self-moderates against a token countdown; we additionally hard-cap at 1.25× the budget as defense in depth. |
| **Persistent versioned agent objects** | Agent Orchestration submissions become versioned `agents.create` calls — every submission is a new immutable version, so old submissions are replayable and A/B-testable. |
| **Stream-first SSE event loop** | The grading substrate. Every `agent.tool_use`, `agent.custom_tool_use`, `agent.thinking`, file write, and `span.model_request_end` flows into a structured trace stored alongside the submission. |
| **Mounted GitHub repos via `github_repository` resource** | Distributed Debug challenges clone real bug-planted repos into the container at startup, with auth tokens injected by an Anthropic-side proxy outside the sandbox so prompt injection can't exfiltrate them. |
| **Session-scoped file outputs (`/mnt/session/outputs/`)** | System Design Build challenges write load-probe artifacts to disk; we pull them back via `files.list({scope_id: session.id, betas: ["managed-agents-2026-04-01"]})`. |

The architectural payoff: the artifact we grade is the **trajectory**, not the output. That only became possible because Managed Agents gives you the agent loop as a stream of structured events instead of "a wall of text we'd have to NLP."

The runner that drives all three categories is in [`backend/src/services/ai/managedAgent.ts`](backend/src/services/ai/managedAgent.ts) — caches one environment per process and one agent per challenge kind, opens an SSE stream before sending the kickoff (stream-first ordering), dispatches custom-tool calls to per-category handlers, enforces the budget, polls past the post-idle status-write race, archives the session.

The category-specific composition lives in [`backend/src/services/ai/sde2Runner.ts`](backend/src/services/ai/sde2Runner.ts) — three executors, each with their own system prompt, tool surface, resources, and signal-extraction logic. Judging in [`backend/src/services/ai/sde2Judges.ts`](backend/src/services/ai/sde2Judges.ts) combines the deterministic signals with a Sonnet rubric pass for qualitative axes (root-cause correctness, design rationale soundness, grounding).

---

## Eval content (the moat)

Nine companion repos host the planted bugs, starter scaffolds, and JSON fixtures the agents are graded against:

- `vibeforces-eval-listings-pager` — DD-E1: off-by-one pagination across gateway+catalog services
- `vibeforces-eval-auth-stampede` — DD-M1: cache stampede on JWT key rotation, 300-thread load test
- `vibeforces-eval-dual-write-payments` — DD-H1: lost updates from dual-write + non-idempotent consumer, with 4 partition events
- `vibeforces-eval-{url-shortener, rate-limiter, event-sourced-inventory}-starter` — SB starters
- `vibeforces-eval-ao-{issues, dupes, firehose}-fixture` — AO classification / dupe-detection / digest fixtures with `_gold_*` ground truth

---

## Tech architecture

```
                  vibeforces.tech
                        │
                        ▼
            Vercel ── Next.js 16 + Tailwind v4
                        │  (REST)
                        ▼
            Render ── Express + TypeScript
                ├─ OpenAI SDK   ─── GPT-4.1 / GPT-5.4-mini
                ├─ Anthropic SDK ── Claude Sonnet 4.6 (execution + judging)
                ├─ Anthropic SDK ── Claude Managed Agents (SDE2+ tier)
                └─ Puppeteer    ─── UI Reproduction screenshot diff
                        │
                        ▼
            Supabase ── Postgres (RLS) · Auth · Storage
                        │
                        ▼
            GitHub ──── eval repos mounted into sessions
```

| Component | Stack |
|---|---|
| Frontend | Next.js 16 (App Router) · React 19 · Tailwind v4 · shadcn/ui · Framer Motion · Monaco |
| Backend | Express · TypeScript · `@anthropic-ai/sdk` (beta managed-agents) · `openai` · Puppeteer · Zod |
| Data | Supabase Postgres + Auth + Storage; 12 migrations including the SDE2 category extension and `submissions.agent_trace jsonb` column |
| Hosting | Vercel (frontend) · Render (Docker, GHCR-published) · Supabase (managed) |

---

## Local setup

```bash
# 1. Install
npm install
npm --prefix frontend install
npm --prefix backend install

# 2. Configure
cp .env.example .env  # fill in Supabase + OpenAI + Anthropic keys

# 3. Generate assets, migrate, seed
npm run assets:generate
npm run db:migrate
npm run db:seed

# 4. Run
npm run dev   # frontend on :3000, backend on :3001
```

To exercise the SDE2+ tier locally you also need:

- `ANTHROPIC_API_KEY` with Managed Agents beta access (`managed-agents-2026-04-01`)
- `VIBEFORCES_EVAL_GITHUB_TOKEN` — fine-grained PAT with `Contents: Read` on the eval repos
- `VIBEFORCES_SDE2_ENABLED=true` and `VIBEFORCES_SDE2_ALLOWED_USERNAMES=<your-username>`

---

## Repository layout

```
frontend/                Next.js app
  app/                   route groups: (auth), (learner), (recruiter), (admin)
  components/            challenge workbench, model selector, scoring views
  lib/                   API client, Supabase client
backend/                 Express API
  src/
    routes/              challenges, submissions, contests, tests, hire, profile, admin, leaderboard
    services/
      ai/
        managedAgent.ts        ▶ the SDE2+ runtime (sessions, custom-tool dispatch, traces)
        sde2Runner.ts          ▶ per-category Managed Agents executors
        sde2Judges.ts          ▶ deterministic signals + Sonnet rubric pass
        promptRunner.ts        ▶ SDE1/SDE2 GPT-4.1 / Sonnet 4.6 execution
        judge.ts               ▶ category-specific judging for the original 5 categories
        screenshot.ts          ▶ Puppeteer screenshot diff for UI Reproduction
      scoring.ts, rating.ts, leaderboard.ts
    routes/, middleware/, config/, utils/
shared/
  challenge-library.ts                30 SDE1/SDE2 challenges
  challenge-library-sde2.ts           9 SDE2+ challenges (DD/SB/AO)
  types.ts                            shared TS types
supabase/
  migrations/                         12 SQL migrations
  seed/                               generated seed SQL
```

---

## Demo

A 3-minute walkthrough of:

1. The SDE1/SDE2 catalog — write a prompt, get scored, see your rating move
2. **Distributed Debug live** — open a Managed Agents session, watch the SSE event stream populate in real time, see the agent reproduce the failing test, patch the file, submit the fix
3. **Agent Orchestration** — submit an agent config, watch our orchestrator instantiate it as a real Managed Agent and grade the trace

Demo video: see the hackathon submission.

---

## Acknowledgements

Built with [Claude Opus 4.7](https://www.anthropic.com/claude) and [Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview) for the **Built with Opus 4.7** Claude Code hackathon. Sonnet 4.6 powers the in-product agent and judging pipelines.

The trace is the answer.
