import type {
  AgentOrchestrationData,
  ChallengeRecord,
  DistributedDebugData,
  SystemDesignBuildData,
} from "./types";

export const sde2ChallengeIds = {
  "DD-E1": "00000000-0000-4000-8000-000000000031",
  "DD-M1": "00000000-0000-4000-8000-000000000032",
  "DD-H1": "00000000-0000-4000-8000-000000000033",
  "SB-E1": "00000000-0000-4000-8000-000000000034",
  "SB-M1": "00000000-0000-4000-8000-000000000035",
  "SB-H1": "00000000-0000-4000-8000-000000000036",
  "AO-E1": "00000000-0000-4000-8000-000000000037",
  "AO-M1": "00000000-0000-4000-8000-000000000038",
  "AO-H1": "00000000-0000-4000-8000-000000000039",
} as const;

const distributedDebugChallenges: Array<ChallengeRecord<DistributedDebugData>> = [
  {
    id: sde2ChallengeIds["DD-E1"],
    code: "DD-E1",
    category: "distributed_debug",
    difficulty: "easy",
    rating: 1500,
    title: "The Off-By-One Pagination",
    description:
      "A two-service /listings API silently drops the last item on every page boundary. Drive an agent to reproduce, isolate, and patch it.",
    challenge_data: {
      repo_url: "https://github.com/dwivediishivam/vibeforces-eval-listings-pager",
      starter_branch: "main",
      failing_test_path: "tests/regression/test_pagination.py::test_last_page_complete",
      scenario:
        "A frontend gateway service calls a Postgres-backed catalog service over gRPC. With 47 items and page_size=10, page 5 returns 6 items locally but only 5 in production. The integration test fails. Logs are clean — no exceptions.",
      hidden_root_cause:
        "Off-by-one in the catalog service's LIMIT/OFFSET math: it uses `(page - 1) * page_size + 1` instead of `(page - 1) * page_size`, dropping one item per page. The gateway then de-dupes by id, masking the symptom on inner pages but exposing it on the last partial page.",
      par_tool_calls: 12,
      task_budget_tokens: 60000,
      rubric:
        "Full credit: regression test goes red→green AND the patch is in catalog/pagination.py (not a gateway-side workaround). Partial: test passes via gateway hack. Zero: tests still fail or agent edited unrelated files.",
    },
  },
  {
    id: sde2ChallengeIds["DD-M1"],
    code: "DD-M1",
    category: "distributed_debug",
    difficulty: "medium",
    rating: 1900,
    title: "The Phantom Cache Stampede",
    description:
      "Every Monday 9:00 UTC the auth service's p99 spikes to 4s for 90 seconds, then recovers. Three services involved. Find it.",
    challenge_data: {
      repo_url: "https://github.com/dwivediishivam/vibeforces-eval-auth-stampede",
      starter_branch: "main",
      failing_test_path: "tests/load/test_cold_cache.py::test_p99_under_500ms",
      scenario:
        "Auth service caches JWT signing keys in Redis with TTL=7d. The KMS rotates keys weekly on Monday 9:00 UTC. When the Redis key expires, every in-flight request simultaneously tries to refetch from KMS, which rate-limits at 50 rps. The load test simulates 300 concurrent logins at the moment of TTL expiry.",
      hidden_root_cause:
        "Classic cache stampede: no single-flight / mutex around the KMS fetch, no jittered TTL, no stale-while-revalidate. Fix requires a Redis-backed lock OR a request-coalescing layer in the auth service. Bonus: jittered TTL prevents the synchronized expiry across pods.",
      par_tool_calls: 22,
      task_budget_tokens: 120000,
      rubric:
        "Full: load test passes (p99<500ms) AND fix uses request coalescing or distributed lock, not just a longer TTL. Partial: TTL bump or in-process mutex (works on 1 pod, fails the multi-pod test). Zero: regression test still red.",
    },
  },
  {
    id: sde2ChallengeIds["DD-H1"],
    code: "DD-H1",
    category: "distributed_debug",
    difficulty: "hard",
    rating: 2300,
    title: "The Lost-Update Across Two Databases",
    description:
      "A payments service writes to Postgres, then publishes to Kafka, then a ledger service consumes and writes to a separate Postgres. Under load, ~0.3% of payments show as charged but never ledgered. Inbox/outbox? Idempotency? Both?",
    challenge_data: {
      repo_url: "https://github.com/dwivediishivam/vibeforces-eval-dual-write-payments",
      starter_branch: "main",
      failing_test_path: "tests/chaos/test_partition_recovery.py::test_zero_lost_writes",
      scenario:
        "The chaos test injects a 3-second Kafka broker partition mid-transaction. After recovery, exactly-once is violated: payments_db has the charge, ledger_db is missing the row. The test does 5000 concurrent payments with 4 partition events. Current loss rate: ~15 rows. Target: 0.",
      hidden_root_cause:
        "Two failures stacked: (1) the publisher does Postgres COMMIT before Kafka publish — the classic dual-write — so a crash between commit and publish loses the event. (2) The ledger consumer is not idempotent on retry; on rebalance, an in-flight message is reprocessed but its dedup key is the Kafka offset (which changes), not the payment_id. Fix needs an outbox table polled by a relay AND a payment_id-keyed idempotency table on the consumer.",
      par_tool_calls: 40,
      task_budget_tokens: 250000,
      rubric:
        "Full: chaos test green (0 lost rows across 10 runs) AND solution uses transactional outbox + consumer idempotency by payment_id. Partial: outbox only (still allows duplicates) or idempotency only (still loses on publisher crash). Zero: relies on 'at-least-once Kafka config' without addressing dual-write.",
    },
  },
];

const systemDesignBuildChallenges: Array<ChallengeRecord<SystemDesignBuildData>> = [
  {
    id: sde2ChallengeIds["SB-E1"],
    code: "SB-E1",
    category: "system_design_build",
    difficulty: "easy",
    rating: 1400,
    title: "Idempotent URL Shortener",
    description:
      "Build a URL shortener with idempotent POST, /metrics, and a Redis storage tier. Tests + load probe must pass in the sandbox.",
    challenge_data: {
      spec: [
        "Build a Python (FastAPI) URL shortener with these requirements:",
        "1. POST /shorten {url, idempotency_key?} → {short_code}. Same idempotency_key MUST return the same short_code.",
        "2. GET /{short_code} → 302 redirect, or 404.",
        "3. GET /metrics → Prometheus text format with at minimum http_requests_total{path,status}.",
        "4. Storage: Redis (hostname `redis`, port 6379, no auth — already running in the sandbox).",
        "5. Short codes must be 7 chars, base62, deterministic for a given (url, idempotency_key) pair.",
        "6. Provide pytest tests covering: idempotency, 404 path, metrics endpoint shape.",
      ].join("\n"),
      starter_repo_url: "https://github.com/dwivediishivam/vibeforces-eval-url-shortener-starter",
      acceptance_tests_path: "tests/acceptance/",
      required_decision_points: ["short_code_strategy", "idempotency_storage"],
      load_probe_command: "wrk -t4 -c100 -d10s http://localhost:8000/abc1234",
      task_budget_tokens: 150000,
      rubric:
        "Full: all acceptance tests pass, /metrics scrapable by prom client, p99 read <50ms in load probe. Partial: tests pass but no metrics, or non-deterministic short codes. Zero: tests fail or service doesn't start.",
    },
  },
  {
    id: sde2ChallengeIds["SB-M1"],
    code: "SB-M1",
    category: "system_design_build",
    difficulty: "medium",
    rating: 1850,
    title: "Sliding-Window Rate Limiter Service",
    description:
      "Standalone rate-limiter service. Sliding-window log algorithm. Multi-tenant. Must survive a simulated Redis flap.",
    challenge_data: {
      spec: [
        "Build a Go HTTP service that exposes:",
        "1. POST /check {tenant_id, key, limit, window_seconds} → {allowed: bool, remaining: int, reset_at: unix_ts}",
        "2. The algorithm MUST be sliding-window log (not fixed-window or token-bucket). Each request stores a timestamp; expired ones are evicted lazily.",
        "3. Storage: Redis cluster (3 nodes, hosts `redis-0`, `redis-1`, `redis-2`).",
        "4. The service MUST fail open (return allowed=true) if Redis is unreachable, AND must emit a `redis_unavailable` counter to /metrics.",
        "5. Provide a chaos test that kills `redis-0` mid-load and asserts no 5xx responses (fail-open).",
        "6. The service must handle 5000 rps on a single instance with p99 < 20ms.",
      ].join("\n"),
      starter_repo_url: "https://github.com/dwivediishivam/vibeforces-eval-rate-limiter-starter",
      acceptance_tests_path: "tests/",
      required_decision_points: [
        "sliding_window_storage",
        "fail_open_strategy",
        "lua_vs_pipeline",
      ],
      load_probe_command: "go run ./cmd/loadgen -rps 5000 -duration 30s",
      task_budget_tokens: 220000,
      rubric:
        "Full: chaos test passes (0 5xx during Redis flap), p99<20ms, sliding-window correctness verified by acceptance tests. Partial: works but uses fixed-window (algorithmic miss) or fails closed. Zero: doesn't compile, tests red.",
    },
  },
  {
    id: sde2ChallengeIds["SB-H1"],
    code: "SB-H1",
    category: "system_design_build",
    difficulty: "hard",
    rating: 2400,
    title: "Event-Sourced Inventory with Replay",
    description:
      "Build an event-sourced inventory service: append-only event log, materialized view, replay-from-zero, and a snapshotting strategy. Concurrency-safe under contention.",
    challenge_data: {
      spec: [
        "Build a TypeScript (Node) inventory service with full event sourcing:",
        "1. Commands: ReserveStock, ReleaseStock, CommitSale, RestockItem. Each appends an event to an append-only Postgres table `events(stream_id, version, type, payload, created_at)` with UNIQUE(stream_id, version).",
        "2. A materialized view `inventory_view(sku, available, reserved)` is updated by a projector consuming the event log.",
        "3. Implement optimistic concurrency: a command with stale `expected_version` must 409.",
        "4. Implement snapshotting: every 1000 events per stream, write a snapshot. Replay must be able to start from the latest snapshot + tail of events.",
        "5. Provide a `POST /admin/replay` endpoint that drops the materialized view and rebuilds it from the event log + snapshots. Replay of 1M events must complete in under 60s in the sandbox.",
        "6. Concurrency test: 200 concurrent ReserveStock for the same SKU with stock=10. Exactly 10 must succeed, 190 must 409. No double-reservations under any interleaving.",
      ].join("\n"),
      starter_repo_url: "https://github.com/dwivediishivam/vibeforces-eval-event-sourced-inventory-starter",
      acceptance_tests_path: "tests/",
      required_decision_points: [
        "snapshot_storage_format",
        "concurrency_control",
        "projector_idempotency",
        "replay_parallelism",
      ],
      load_probe_command: "npm run bench:replay -- --events 1000000",
      task_budget_tokens: 400000,
      rubric:
        "Full: concurrency test exact (10 success / 190 409), replay <60s, snapshots used (verified by replay log), idempotent projector (rerun is a no-op). Partial: works but replay >60s or projector not idempotent. Zero: double-reservations or non-deterministic replay.",
    },
  },
];

const agentOrchestrationChallenges: Array<ChallengeRecord<AgentOrchestrationData>> = [
  {
    id: sde2ChallengeIds["AO-E1"],
    code: "AO-E1",
    category: "agent_orchestration",
    difficulty: "easy",
    rating: 1500,
    title: "Triage Agent: Bug or Feature?",
    description:
      "Configure an agent that classifies incoming GitHub issues into bug | feature | question, with a confidence score, and files them via a custom tool.",
    challenge_data: {
      goal: "Given a stream of 50 issue payloads (title + body) delivered as user messages, the agent must classify each one and call file_issue exactly once per issue. Misclassifications and missed issues both lose points.",
      eval_fixture_id: "ao-e1-issues-v1",
      eval_fixture_payload:
        "https://raw.githubusercontent.com/dwivediishivam/vibeforces-eval-ao-issues-fixture/main/issues.json",
      required_tools: [
        {
          name: "file_issue",
          description:
            "Files the classification for an issue. Must be called exactly once per issue_id.",
          input_schema: {
            type: "object",
            properties: {
              issue_id: { type: "string" },
              category: { type: "string", enum: ["bug", "feature", "question"] },
              confidence: { type: "number", minimum: 0, maximum: 1 },
            },
            required: ["issue_id", "category", "confidence"],
          },
          scoring_role: "subgoal",
        },
      ],
      forbidden_tools: ["web_search", "web_fetch"],
      task_budget_tokens: 80000,
      perturbation_count: 2,
      pass_threshold: 0.85,
      rubric:
        "Score = (correct_classifications / 50) weighted by confidence calibration (Brier score). Forbidden tool use = auto-zero. Calling file_issue more than once for the same issue_id is a per-call penalty.",
    },
  },
  {
    id: sde2ChallengeIds["AO-M1"],
    code: "AO-M1",
    category: "agent_orchestration",
    difficulty: "medium",
    rating: 1900,
    title: "Duplicate Detective with Bounded Search",
    description:
      "Design an agent that finds duplicate issues across a corpus of 200 existing issues. Token budget is the constraint — naive 'read all 200 every time' will fail.",
    challenge_data: {
      goal: "For each of 30 incoming issues, decide if it's a duplicate of any of 200 existing issues. The 200 existing issues are exposed via a `search_issues` tool (returns top-k by query). The agent must use semantic search wisely — calling search_issues with bad queries burns budget. Output via flag_duplicate(new_id, existing_id, similarity) or flag_unique(new_id).",
      eval_fixture_id: "ao-m1-dupes-v1",
      eval_fixture_payload:
        "https://raw.githubusercontent.com/dwivediishivam/vibeforces-eval-ao-dupes-fixture/main/incoming.json",
      required_tools: [
        {
          name: "search_issues",
          description:
            "Returns up to 5 existing issues most similar to the query string (BM25 + embeddings). Costs ~500 tokens per call.",
          input_schema: {
            type: "object",
            properties: {
              query: { type: "string" },
              top_k: { type: "integer", minimum: 1, maximum: 5 },
            },
            required: ["query"],
          },
          scoring_role: "side_effect",
        },
        {
          name: "flag_duplicate",
          description: "Marks a new issue as a duplicate of an existing one.",
          input_schema: {
            type: "object",
            properties: {
              new_issue_id: { type: "string" },
              existing_issue_id: { type: "string" },
              similarity: { type: "number", minimum: 0, maximum: 1 },
            },
            required: ["new_issue_id", "existing_issue_id", "similarity"],
          },
          scoring_role: "subgoal",
        },
        {
          name: "flag_unique",
          description: "Marks a new issue as not a duplicate of anything.",
          input_schema: {
            type: "object",
            properties: { new_issue_id: { type: "string" } },
            required: ["new_issue_id"],
          },
          scoring_role: "subgoal",
        },
      ],
      task_budget_tokens: 120000,
      perturbation_count: 3,
      pass_threshold: 0.8,
      rubric:
        "Score = F1(dupe_detection) × (1 - tokens_used / task_budget). Penalizes both missed dupes (false negatives) and over-flagging (false positives). Bonus for calling flag_* exactly once per new issue. Perturbation: rephrased dupes — agent must not overfit to surface wording.",
    },
  },
  {
    id: sde2ChallengeIds["AO-H1"],
    code: "AO-H1",
    category: "agent_orchestration",
    difficulty: "hard",
    rating: 2400,
    title: "Multi-Agent Weekly Digest",
    description:
      "Design a multi-agent system: a coordinator agent + at least one subagent topology. Goal: produce a weekly engineering digest from a noisy event firehose. Budget is brutal.",
    challenge_data: {
      goal: "Given 7 days of events (PR merges, incidents, deploys, alerts — ~500 entries) delivered as a single mounted JSON file, produce a 5-section markdown digest: Highlights, Incidents, Shipped, Risks, Numbers. Each section has correctness rubrics. Submit via submit_digest. Subgoal tools (record_highlight, record_incident, etc.) provide intermediate scoring signal — they are how we know the agent's reasoning is grounded, not hallucinated.",
      eval_fixture_id: "ao-h1-firehose-v1",
      eval_fixture_payload:
        "https://raw.githubusercontent.com/dwivediishivam/vibeforces-eval-ao-firehose-fixture/main/events.json",
      required_tools: [
        {
          name: "record_highlight",
          description:
            "Record a candidate highlight with its source event_id(s). Used to verify grounding.",
          input_schema: {
            type: "object",
            properties: {
              text: { type: "string" },
              source_event_ids: { type: "array", items: { type: "string" } },
            },
            required: ["text", "source_event_ids"],
          },
          scoring_role: "subgoal",
        },
        {
          name: "record_incident",
          description: "Record an incident with severity and source events.",
          input_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              severity: { type: "string", enum: ["sev1", "sev2", "sev3"] },
              source_event_ids: { type: "array", items: { type: "string" } },
            },
            required: ["title", "severity", "source_event_ids"],
          },
          scoring_role: "subgoal",
        },
        {
          name: "submit_digest",
          description: "Final submission. Markdown digest. Called exactly once.",
          input_schema: {
            type: "object",
            properties: { markdown: { type: "string" } },
            required: ["markdown"],
          },
          scoring_role: "final_output",
        },
      ],
      task_budget_tokens: 500000,
      perturbation_count: 4,
      pass_threshold: 0.75,
      rubric:
        "Score = 0.4*grounding (every claim in digest must trace to a recorded source_event_id) + 0.3*coverage (judge agent compares against gold digest) + 0.2*precision (no fabricated incidents/numbers) + 0.1*efficiency (tokens vs budget). Perturbations swap in adversarial events designed to bait hallucination (e.g. an incident-shaped marketing announcement). Hallucinating in any perturbation run drops the entire score by 25%.",
    },
  },
];

export const sde2Challenges: ChallengeRecord[] = [
  ...distributedDebugChallenges,
  ...systemDesignBuildChallenges,
  ...agentOrchestrationChallenges,
];
