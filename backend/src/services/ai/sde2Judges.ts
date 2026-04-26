import type { JudgeResult } from "../../types";
import { openai } from "./openai";
import { judgeModelFor, runProviderPrompt, type Provider } from "./dispatch";
import { safeJsonParse } from "../../utils/json";

/**
 * SDE2+ judges. Each one combines:
 *  - Deterministic signals already extracted by the runner (tool counts,
 *    subgoal coverage, budget consumption, file outputs).
 *  - A judge-model rubric pass over the trace narrative.
 *
 * Scoring philosophy: the deterministic signals are load-bearing. The judge
 * model only resolves the qualitative axes (root-cause correctness,
 * grounding, design decision quality).
 */

function judgeProvider(requested?: Provider): Provider {
  return openai ? "openai" : requested ?? "openai";
}

export async function judgeDistributedDebug(params: {
  scenario: string;
  hiddenRootCause: string;
  rubric: string;
  candidatePrompt: string;
  signals: Record<string, unknown>;
  finalText: string;
  toolCallSummary: string;
  provider?: Provider;
}) {
  const provider = judgeProvider(params.provider);
  const submitted = params.signals.submitted_fix as
    | { patched_files?: string[]; root_cause?: string }
    | null
    | undefined;
  const toolEfficiency = computeEfficiencyMultiplier(
    Number(params.signals.tool_call_count ?? 0),
    Number(params.signals.par_tool_calls ?? 0),
  );

  const result = await runProviderPrompt(provider, {
    model: judgeModelFor(provider),
    responseFormat: "json_object",
    systemPrompt: `You grade distributed-systems debugging exercises run by a Managed Agent inside a sandbox.
You see: the scenario, the hidden root cause, the candidate's debug plan, the agent's submitted fix (root cause + patched files), and a summarized tool-call trace.

You DO NOT have access to the patched code. Trust the agent's submitted root_cause and patched_files claims, but cross-check them against the rubric and the hidden root cause.

Calibration for overall_score (0-10):
- 10: Submitted root_cause matches the hidden root cause; patched files are in the right modules; debug trajectory is hypothesis-driven.
- 7-9: Correct root cause, slightly fuzzy patch location OR right area, slightly off cause framing.
- 4-6: Touched the right area but didn't identify the real cause (e.g. patched a symptom).
- 1-3: Wrong area, no submission, or thrashing trace.
- 0: No submit_fix call.

Respond in this EXACT JSON format:
{
  "root_cause_match": <number 0-10>,
  "patch_location_match": <number 0-10>,
  "debug_trajectory_score": <number 0-10>,
  "overall_score": <number 0-10>,
  "feedback": "<2-3 sentences>"
}`,
    userPrompt: `## Scenario
${params.scenario}

## Hidden root cause (judge-only, not shown to candidate)
${params.hiddenRootCause}

## Rubric
${params.rubric}

## Candidate's debug plan
${params.candidatePrompt}

## Agent's submitted fix
${submitted ? JSON.stringify(submitted, null, 2) : "<no submit_fix call>"}

## Hypothesis count
${String(params.signals.hypothesis_count ?? 0)}

## Final assistant text (truncated)
${params.finalText.slice(0, 2000)}

## Tool call summary
${params.toolCallSummary}`,
    maxTokens: 800,
  });

  const judged = safeJsonParse<JudgeResult>(result.content, {
    overall_score: 0,
    feedback: "Judge response was not parseable.",
  });

  // Apply the deterministic efficiency multiplier on top of the judge score.
  const baseOverall = Number(judged.overall_score ?? 0);
  const adjusted = Math.max(0, Math.min(10, baseOverall * toolEfficiency));
  return {
    ...judged,
    overall_score: Number(adjusted.toFixed(2)),
    judge_overall_pre_efficiency: baseOverall,
    tool_efficiency_multiplier: Number(toolEfficiency.toFixed(2)),
  } as JudgeResult;
}

export async function judgeSystemDesignBuild(params: {
  spec: string;
  rubric: string;
  candidatePrompt: string;
  signals: Record<string, unknown>;
  finalText: string;
  toolCallSummary: string;
  provider?: Provider;
}) {
  const provider = judgeProvider(params.provider);
  const decisionsCovered = Number(params.signals.required_decision_coverage ?? 0);
  const submitted = Boolean(params.signals.submitted);

  const result = await runProviderPrompt(provider, {
    model: judgeModelFor(provider),
    responseFormat: "json_object",
    systemPrompt: `You grade a system-build exercise run by a Managed Agent. The agent built a service from a spec inside a sandbox, ran tests, and recorded design decisions via a custom tool.

You see: the spec, the rubric, the recorded design decisions, the submission summary, and the test commands run.
You DO NOT see the actual code or test output exit codes — trust the submission summary on test pass/fail unless the trace clearly contradicts it.

Calibration for overall_score (0-10):
- 10: All required decision points covered with sound rationales; service likely correct per submission summary; tests claimed passing.
- 7-9: Most decision points covered; submission summary confident; minor rubric gaps.
- 4-6: Several decision points missing OR weak rationales OR tests not claimed passing.
- 1-3: No submission OR most required decisions missing.
- 0: No submit_build, no decisions recorded.

Respond in this EXACT JSON format:
{
  "decision_quality_score": <number 0-10>,
  "spec_coverage_score": <number 0-10>,
  "test_confidence_score": <number 0-10>,
  "overall_score": <number 0-10>,
  "feedback": "<2-3 sentences>"
}`,
    userPrompt: `## Spec
${params.spec}

## Rubric
${params.rubric}

## Candidate's build prompt
${params.candidatePrompt}

## Required decision coverage
${(decisionsCovered * 100).toFixed(0)}% (missing: ${JSON.stringify(params.signals.missing_decision_points ?? [])})

## Submission summary
${submitted ? String(params.signals.submission_summary ?? "") : "<no submit_build call>"}

## Test commands run
${JSON.stringify(params.signals.test_commands_run ?? [])}

## Output files (written to /mnt/session/outputs)
${JSON.stringify(params.signals.output_files ?? [], null, 2)}

## Final assistant text (truncated)
${params.finalText.slice(0, 2000)}

## Tool call summary
${params.toolCallSummary}`,
    maxTokens: 800,
  });

  return safeJsonParse<JudgeResult>(result.content, {
    overall_score: 0,
    feedback: "Judge response was not parseable.",
  });
}

export async function judgeAgentOrchestration(params: {
  goal: string;
  rubric: string;
  passThreshold: number;
  signals: Record<string, unknown>;
  /** Gold-standard expected outputs from the eval fixture. Judge-only. */
  expectedSubgoals: Array<Record<string, unknown>>;
  finalOutputContract?: { name: string };
  provider?: Provider;
}) {
  const provider = judgeProvider(params.provider);

  // If forbidden tool was used, hard-zero. No judge call needed.
  if (params.signals.forbidden_tool_used) {
    return {
      overall_score: 0,
      feedback: "Forbidden tool was invoked — automatic disqualification.",
      hard_disqualified: true,
    } as JudgeResult;
  }

  const tokensConsumed = Number(params.signals.tokens_consumed ?? 0);
  const taskBudget = Number(params.signals.task_budget ?? 1);
  const efficiency = Math.max(0, Math.min(1, 1 - tokensConsumed / Math.max(1, taskBudget)));

  const result = await runProviderPrompt(provider, {
    model: judgeModelFor(provider),
    responseFormat: "json_object",
    systemPrompt: `You grade a candidate's agent-orchestration submission. The candidate's job is to design an agent (system prompt + tool surface) that completes a goal by calling subgoal tools we registered. You see the recorded subgoal-tool inputs and the gold-standard expected subgoals.

Compute three axes:
- coverage: fraction of expected subgoals correctly addressed (recall).
- precision: fraction of recorded subgoals that are correct (no fabrications).
- grounding: were claims (in the final_output, if any) traceable to recorded subgoal inputs? Hallucinations drop this.

Calibration for overall_score (0-10):
- 10: Full coverage, no fabrications, final output well-grounded.
- 7-9: Strong coverage, minor precision gaps.
- 4-6: Partial coverage OR notable fabrications.
- 1-3: Most subgoals missed OR final output ungrounded.
- 0: No subgoal calls, or pure hallucination.

Respond in this EXACT JSON format:
{
  "coverage_score": <number 0-10>,
  "precision_score": <number 0-10>,
  "grounding_score": <number 0-10>,
  "overall_score": <number 0-10>,
  "feedback": "<2-3 sentences>"
}`,
    userPrompt: `## Goal
${params.goal}

## Rubric
${params.rubric}

## Recorded subgoal calls
${JSON.stringify(params.signals.subgoal_inputs ?? [], null, 2)}

## Final output (if any)
${JSON.stringify(params.signals.final_output ?? null, null, 2)}

## Expected subgoals (gold)
${JSON.stringify(params.expectedSubgoals, null, 2)}

## Tokens / budget
${tokensConsumed} / ${taskBudget} (efficiency=${efficiency.toFixed(2)})`,
    maxTokens: 800,
  });

  const judged = safeJsonParse<JudgeResult>(result.content, {
    overall_score: 0,
    feedback: "Judge response was not parseable.",
  });

  // 80% judge axes + 20% efficiency.
  const judgeOverall = Number(judged.overall_score ?? 0);
  const adjusted = judgeOverall * 0.8 + efficiency * 10 * 0.2;
  const passed = adjusted / 10 >= params.passThreshold;

  return {
    ...judged,
    overall_score: Number(adjusted.toFixed(2)),
    efficiency_score_0_10: Number((efficiency * 10).toFixed(2)),
    passed_threshold: passed,
  } as JudgeResult;
}

function computeEfficiencyMultiplier(actualToolCalls: number, parToolCalls: number): number {
  if (parToolCalls <= 0) return 1;
  if (actualToolCalls <= parToolCalls) return 1;
  // Soft penalty: 1.0 at par, 0.7 at 2x par, 0.5 at 3x par, floor 0.5.
  const ratio = actualToolCalls / parToolCalls;
  if (ratio >= 3) return 0.5;
  return 1 - (ratio - 1) * 0.25;
}

export function summarizeToolCalls(
  calls: Array<{ name: string; type: string; is_error?: boolean }>,
): string {
  const counts: Record<string, number> = {};
  for (const c of calls) {
    const key = `${c.type}:${c.name}${c.is_error ? "(err)" : ""}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
}
