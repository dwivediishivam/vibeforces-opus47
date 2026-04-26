import {
  runAgentSession,
  type AgentTemplate,
  type AgentTrace,
  type CustomToolHandler,
  type CustomToolSpec,
  type SessionResource,
} from "./managedAgent";

// Backend mirrors of the shared SDE2 challenge data shapes (kept in sync with
// shared/types.ts). The backend tsconfig has rootDir="src", so it cannot import
// from shared/.
export interface DistributedDebugData {
  repo_url: string;
  starter_branch: string;
  failing_test_path: string;
  scenario: string;
  hidden_root_cause: string;
  par_tool_calls: number;
  task_budget_tokens: number;
  rubric: string;
}

export interface SystemDesignBuildData {
  spec: string;
  starter_repo_url?: string;
  acceptance_tests_path: string;
  required_decision_points: string[];
  load_probe_command?: string;
  task_budget_tokens: number;
  rubric: string;
}

export interface AgentOrchestrationToolSpec {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  scoring_role: "subgoal" | "side_effect" | "final_output";
}

export interface AgentOrchestrationData {
  goal: string;
  eval_fixture_id: string;
  required_tools: AgentOrchestrationToolSpec[];
  forbidden_tools?: string[];
  task_budget_tokens: number;
  perturbation_count: number;
  pass_threshold: number;
  rubric: string;
}

export interface Sde2ExecutionResult {
  trace: AgentTrace;
  /** Deterministic signals extracted from the trace, fed to the judge. */
  signals: Record<string, unknown>;
}

const DEBUG_SYSTEM = `You are a senior backend engineer debugging a multi-service system in a sandbox container.
The repository is mounted under /workspace. Services may be runnable via docker-compose or scripts in /workspace/bin.
Your goal: REPRODUCE the failure, ISOLATE the root cause, and PATCH the code so the failing test goes red->green.

Workflow guidelines:
- Read first, edit later. Use grep/glob to localize before opening files.
- Reproduce the failure with the failing test BEFORE editing — this confirms environment.
- Prefer minimal targeted patches. Do not rewrite unrelated code.
- When you believe the patch is correct, run the failing test plus any neighboring tests in the same package.

End your turn when the failing test passes. Be concise; the trace is your output.`;

const SYSTEM_BUILD_SYSTEM = `You are a senior engineer building a service from a spec inside a clean sandbox.
The spec is in the kickoff message. Build the service in /workspace, install dependencies, write code, write tests, run them.

Decision-logging contract: every time you make a meaningful architectural choice (storage tier, algorithm, concurrency
control, idempotency strategy, observability hook, etc.), call the report_design_decision tool. Required fields:
component, choice, rationale. The decision log is part of how you are graded.

Final-output contract: when the service is done and tests pass, call submit_build with a one-paragraph summary and the
list of acceptance test commands you ran. Then end your turn.`;

const ORCHESTRATION_HARNESS_SYSTEM = `You are a candidate-supplied orchestration agent. Your behavior is defined by the
candidate's submission below. Follow it. The eval harness will deliver tasks via user messages and provide custom tools
that record your subgoal completions. Use them to mark progress; the harness scores you on whether you call them
correctly. Do not ask clarifying questions — act.`;

// ---------------------------------------------------------------------------
// distributed_debug
// ---------------------------------------------------------------------------

export async function executeDistributedDebug(params: {
  challengeData: DistributedDebugData;
  candidatePrompt: string;
  candidateModel?: string;
}): Promise<Sde2ExecutionResult> {
  const customTools: CustomToolSpec[] = [
    {
      name: "report_hypothesis",
      description:
        "Record a hypothesis about the root cause before testing it. Helps grade reasoning quality.",
      input_schema: {
        type: "object",
        properties: {
          hypothesis: { type: "string" },
          how_to_test: { type: "string" },
        },
        required: ["hypothesis", "how_to_test"],
      },
    },
    {
      name: "submit_fix",
      description:
        "Call once when the failing test passes. Provide the file paths you patched and a one-sentence root-cause statement.",
      input_schema: {
        type: "object",
        properties: {
          patched_files: { type: "array", items: { type: "string" } },
          root_cause: { type: "string" },
        },
        required: ["patched_files", "root_cause"],
      },
    },
  ];

  const template: AgentTemplate = {
    key: "distributed_debug",
    name: "VibeForces Distributed Debugger",
    systemPrompt: DEBUG_SYSTEM,
    customTools,
    enableAgentToolset: true,
    model: params.candidateModel,
  };

  const resources: SessionResource[] = [
    {
      type: "github_repository",
      url: params.challengeData.repo_url,
      branch: params.challengeData.starter_branch,
      authorization_token: process.env.VIBEFORCES_EVAL_GITHUB_TOKEN ?? "",
      mount_path: "/workspace",
    },
  ];

  const kickoff = [
    `# Scenario`,
    params.challengeData.scenario,
    ``,
    `# Failing test (must go red -> green)`,
    params.challengeData.failing_test_path,
    ``,
    `# Candidate's debug plan`,
    params.candidatePrompt,
    ``,
    `Begin. Reproduce first; patch after you have a hypothesis.`,
  ].join("\n");

  const trace = await runAgentSession({
    template,
    resources,
    kickoffMessage: kickoff,
    taskBudgetTokens: params.challengeData.task_budget_tokens,
    customToolDispatch: simpleAcknowledgeDispatch(["report_hypothesis", "submit_fix"]),
  });

  const submitFixCall = trace.custom_tool_invocations.find((c) => c.name === "submit_fix");
  const hypothesisCount = trace.custom_tool_invocations.filter(
    (c) => c.name === "report_hypothesis",
  ).length;

  return {
    trace,
    signals: {
      tool_call_count: trace.tool_calls.length,
      par_tool_calls: params.challengeData.par_tool_calls,
      submitted_fix: submitFixCall?.input ?? null,
      hypothesis_count: hypothesisCount,
      tokens_consumed: trace.usage.input_tokens + trace.usage.output_tokens,
      task_budget: params.challengeData.task_budget_tokens,
      stopped_because: trace.stopped_because,
    },
  };
}

// ---------------------------------------------------------------------------
// system_design_build
// ---------------------------------------------------------------------------

export async function executeSystemDesignBuild(params: {
  challengeData: SystemDesignBuildData;
  candidatePrompt: string;
  candidateModel?: string;
}): Promise<Sde2ExecutionResult> {
  const customTools: CustomToolSpec[] = [
    {
      name: "report_design_decision",
      description:
        "Record a meaningful architectural choice. Required for every entry in the challenge's required_decision_points.",
      input_schema: {
        type: "object",
        properties: {
          component: { type: "string" },
          choice: { type: "string" },
          rationale: { type: "string" },
        },
        required: ["component", "choice", "rationale"],
      },
    },
    {
      name: "submit_build",
      description:
        "Call exactly once when the service is built, tests pass, and (if applicable) the load probe has been run.",
      input_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          test_commands_run: { type: "array", items: { type: "string" } },
        },
        required: ["summary", "test_commands_run"],
      },
    },
  ];

  const template: AgentTemplate = {
    key: "system_design_build",
    name: "VibeForces System Builder",
    systemPrompt: SYSTEM_BUILD_SYSTEM,
    customTools,
    enableAgentToolset: true,
    model: params.candidateModel,
  };

  const resources: SessionResource[] = [];
  if (params.challengeData.starter_repo_url) {
    resources.push({
      type: "github_repository",
      url: params.challengeData.starter_repo_url,
      authorization_token: process.env.VIBEFORCES_EVAL_GITHUB_TOKEN ?? "",
      mount_path: "/workspace",
    });
  }

  const kickoff = [
    `# Spec`,
    params.challengeData.spec,
    ``,
    `# Required decision points (call report_design_decision for each)`,
    params.challengeData.required_decision_points.map((d) => `- ${d}`).join("\n"),
    ``,
    `# Acceptance tests live at`,
    params.challengeData.acceptance_tests_path,
    params.challengeData.load_probe_command
      ? `\n# Load probe\n${params.challengeData.load_probe_command}`
      : "",
    ``,
    `# Candidate's build prompt`,
    params.candidatePrompt,
  ]
    .filter(Boolean)
    .join("\n");

  const trace = await runAgentSession({
    template,
    resources,
    kickoffMessage: kickoff,
    taskBudgetTokens: params.challengeData.task_budget_tokens,
    customToolDispatch: simpleAcknowledgeDispatch([
      "report_design_decision",
      "submit_build",
    ]),
    maxIterations: 400,
  });

  const decisions = trace.custom_tool_invocations.filter(
    (c) => c.name === "report_design_decision",
  );
  const decisionsByComponent = new Set(
    decisions.map((d) => String((d.input as any)?.component ?? "")),
  );
  const requiredCovered = params.challengeData.required_decision_points.filter((p) =>
    decisionsByComponent.has(p),
  );
  const submission = trace.custom_tool_invocations.find((c) => c.name === "submit_build");

  return {
    trace,
    signals: {
      decisions_recorded: decisions.length,
      required_decision_coverage: requiredCovered.length / Math.max(1, params.challengeData.required_decision_points.length),
      missing_decision_points: params.challengeData.required_decision_points.filter(
        (p) => !decisionsByComponent.has(p),
      ),
      submitted: Boolean(submission),
      submission_summary: (submission?.input as any)?.summary ?? null,
      test_commands_run: (submission?.input as any)?.test_commands_run ?? [],
      output_files: trace.output_files,
      tokens_consumed: trace.usage.input_tokens + trace.usage.output_tokens,
      task_budget: params.challengeData.task_budget_tokens,
    },
  };
}

// ---------------------------------------------------------------------------
// agent_orchestration
// ---------------------------------------------------------------------------

export interface OrchestrationSubmission {
  system_prompt: string;
  custom_tools_extra?: CustomToolSpec[];
  task_budget_override?: number;
}

export async function executeAgentOrchestration(params: {
  challengeData: AgentOrchestrationData;
  submission: OrchestrationSubmission;
  evalFixturePayload: string;
  /** Optional perturbation seed: harness re-runs with adversarial inputs for robustness scoring. */
  perturbationIndex?: number;
}): Promise<Sde2ExecutionResult> {
  // Compose required tools (challenge-defined) + any extras the candidate added.
  const required = params.challengeData.required_tools.map<CustomToolSpec>((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.input_schema,
  }));
  const extras = (params.submission.custom_tools_extra ?? []).filter(
    (t) => !required.some((r) => r.name === t.name),
  );
  const customTools = [...required, ...extras];

  // Forbidden tools enforced by NOT registering a handler — agent will get
  // an error reply if it tries.
  const forbidden = new Set(params.challengeData.forbidden_tools ?? []);

  // Dispatch table: every challenge-required tool just records the call.
  // The harness uses the recorded calls as grading signals (subgoal coverage,
  // final output extraction).
  const dispatch: Record<string, CustomToolHandler> = {};
  for (const tool of required) {
    dispatch[tool.name] = () => ({
      content: forbidden.has(tool.name)
        ? `Tool ${tool.name} is forbidden in this challenge.`
        : "ack",
      isError: forbidden.has(tool.name),
    });
  }
  for (const tool of extras) {
    dispatch[tool.name] = () => ({ content: "ack" });
  }

  // Combine the standard harness instruction with the candidate's submission.
  const systemPrompt = [
    ORCHESTRATION_HARNESS_SYSTEM,
    "",
    "# Candidate-supplied instructions",
    params.submission.system_prompt,
  ].join("\n");

  // Note: each candidate submission gets its OWN agent (key includes a hash
  // of the submitted system prompt). This is intentional — it leverages MA's
  // versioning model so old submissions are replayable.
  const submissionHash = simpleHash(systemPrompt);

  const template: AgentTemplate = {
    key: `agent_orchestration:${params.challengeData.eval_fixture_id}:${submissionHash}`,
    name: `Candidate Agent ${submissionHash}`,
    systemPrompt,
    customTools,
    // Forbidden tools never include the prebuilt toolset wholesale; we keep it
    // available unless the challenge specifically forbids "agent_toolset".
    enableAgentToolset: !(params.challengeData.forbidden_tools ?? []).includes("agent_toolset"),
  };

  const budget =
    params.submission.task_budget_override !== undefined
      ? Math.min(params.submission.task_budget_override, params.challengeData.task_budget_tokens)
      : params.challengeData.task_budget_tokens;

  const kickoff = [
    `# Goal`,
    params.challengeData.goal,
    ``,
    `# Eval fixture payload`,
    params.evalFixturePayload,
    params.perturbationIndex !== undefined
      ? `\n# Perturbation index: ${params.perturbationIndex}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const trace = await runAgentSession({
    template,
    kickoffMessage: kickoff,
    taskBudgetTokens: budget,
    customToolDispatch: dispatch,
  });

  // Score signals — deterministic, judge-free pass.
  const subgoalToolNames = new Set(
    params.challengeData.required_tools
      .filter((t) => t.scoring_role === "subgoal")
      .map((t) => t.name),
  );
  const finalToolName = params.challengeData.required_tools.find(
    (t) => t.scoring_role === "final_output",
  )?.name;

  const subgoalCalls = trace.custom_tool_invocations.filter((c) => subgoalToolNames.has(c.name));
  const finalCall = finalToolName
    ? trace.custom_tool_invocations.find((c) => c.name === finalToolName)
    : null;
  const forbiddenCalls = trace.custom_tool_invocations.filter((c) => forbidden.has(c.name));

  return {
    trace,
    signals: {
      subgoal_calls: subgoalCalls.length,
      subgoal_inputs: subgoalCalls.map((c) => ({ name: c.name, input: c.input })),
      final_output: finalCall?.input ?? null,
      forbidden_tool_used: forbiddenCalls.length > 0,
      forbidden_tool_calls: forbiddenCalls.length,
      tokens_consumed: trace.usage.input_tokens + trace.usage.output_tokens,
      task_budget: budget,
      stopped_because: trace.stopped_because,
      perturbation_index: params.perturbationIndex ?? null,
    },
  };
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function simpleAcknowledgeDispatch(toolNames: string[]): Record<string, CustomToolHandler> {
  const out: Record<string, CustomToolHandler> = {};
  for (const name of toolNames) {
    out[name] = () => ({ content: "ack" });
  }
  return out;
}

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16);
}
