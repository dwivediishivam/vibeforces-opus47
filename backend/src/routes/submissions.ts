import type { Request } from "express";
import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../config/supabase";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/http";
import {
  getChallengeSummary,
  maxTimeAllowedForChallenge,
} from "../utils/challenges";
import type { ChallengeRow } from "../types";
import { ensureJsonObject } from "../utils/json";
import {
  executeBugFixPrompt,
  executeSpecToPrompt,
  executeTokenGolfPrompt,
  executeUIReproductionPrompt,
} from "../services/ai/promptRunner";
import {
  judgeBugFix,
  judgeSpecToPrompt,
  judgeTokenGolf,
  judgeUIReproduction,
} from "../services/ai/judge";
import {
  executeAgentOrchestration,
  executeDistributedDebug,
  executeSystemDesignBuild,
} from "../services/ai/sde2Runner";
import {
  judgeAgentOrchestration,
  judgeDistributedDebug,
  judgeSystemDesignBuild,
  summarizeToolCalls,
} from "../services/ai/sde2Judges";
import {
  computeCombinedScore,
  computePromptEfficiencyScore,
  computeTimeScore,
  computeTokenScore,
  percentileScore,
  scoreArchitectureRanking,
} from "../services/scoring";
import { htmlToBase64Screenshot, htmlToBase64ScreenshotSafe, fetchUrlToBase64 } from "../services/screenshot";
import { env } from "../config/env";
import { normalizeProvider } from "../services/ai/dispatch";
import { estimateTokens } from "../services/ai/openai";
import { applyRatingChange } from "../services/rating";

const router = Router();

function budgetEfficiencyScore(signals: Record<string, unknown>): number {
  const consumed = Number(signals.tokens_consumed ?? 0);
  const budget = Number(signals.task_budget ?? 0);
  if (!budget) return 100;
  const ratio = consumed / budget;
  if (ratio <= 0.5) return 100;
  if (ratio >= 1.25) return 0;
  return Math.round(100 - ((ratio - 0.5) / 0.75) * 100);
}

const SDE2_CATEGORIES = new Set([
  "distributed_debug",
  "system_design_build",
  "agent_orchestration",
]);

const SDE2_ENABLED = String(process.env.VIBEFORCES_SDE2_ENABLED ?? "false").toLowerCase() === "true";

// SDE2+ challenges are pro-tier. Only the explicit allowlist below can submit;
// everyone else gets a 402 with an upgrade message. The frontend mirrors this
// gate so the UI surfaces the same prompt instead of an opaque server error.
const SDE2_ALLOWED_USERNAMES = new Set(
  (process.env.VIBEFORCES_SDE2_ALLOWED_USERNAMES ?? "dwivediishivam")
    .split(",")
    .map((u) => u.trim().toLowerCase())
    .filter(Boolean),
);

function userCanAttemptSde2(username: string | null | undefined) {
  if (!username) return false;
  return SDE2_ALLOWED_USERNAMES.has(username.toLowerCase());
}

const promptSchema = z.object({
  prompt: z.string().min(1),
  token_count: z.number().int().nonnegative().optional(),
});

const orchestrationSubmissionSchema = z
  .object({
    system_prompt: z.string().min(1),
    custom_tools_extra: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          input_schema: z.record(z.string(), z.unknown()),
        }),
      )
      .optional(),
    task_budget_override: z.number().int().positive().optional(),
  })
  .optional();

const submissionSchema = z.object({
  challenge_id: z.string().uuid(),
  prompts: z.array(promptSchema).default([]),
  user_ranking: z.array(z.enum(["A", "B", "C"])).length(3).optional(),
  context_type: z.enum(["practice", "contest", "test"]).default("practice"),
  context_id: z.string().uuid().nullable().optional(),
  time_taken_seconds: z.number().int().nonnegative().default(0),
  model: z.enum(["openai", "anthropic", "claude", "gpt"]).optional(),
  orchestration_submission: orchestrationSubmissionSchema,
});

router.use(requireAuth);

router.get(
  "/my",
  asyncHandler(async (req: Request, res) => {
    const { data, error } = await supabaseAdmin
      .from("submissions")
      .select(
        "*, challenges!submissions_challenge_id_fkey(id, code, title, category, difficulty, rating, description)",
      )
      .eq("user_id", req.auth!.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ submissions: data ?? [] });
  }),
);

router.get(
  "/by-challenge/:id",
  asyncHandler(async (req: Request, res) => {
    const { data, error } = await supabaseAdmin
      .from("submissions")
      .select("*")
      .eq("user_id", req.auth!.userId)
      .eq("challenge_id", String(req.params.id))
      .eq("context_type", "practice")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json({ submissions: data ?? [] });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req: Request, res) => {
    const { data, error } = await supabaseAdmin
      .from("submissions")
      .select("*")
      .eq("id", String(req.params.id))
      .eq("user_id", req.auth!.userId)
      .single();

    if (error || !data) {
      res.status(404).json({ error: "Submission not found." });
      return;
    }

    res.json({ submission: data });
  }),
);

router.post(
  "/",
  asyncHandler(async (req: Request, res) => {
    const body = submissionSchema.parse(req.body);

    const { data: challengeData, error: challengeError } = await supabaseAdmin
      .from("challenges")
      .select("*")
      .eq("id", body.challenge_id)
      .single();

    if (challengeError || !challengeData) {
      res.status(404).json({ error: "Challenge not found." });
      return;
    }

    const challenge = challengeData as ChallengeRow;
    const provider = normalizeProvider(body.model);
    const prompts = body.prompts.map((item) => ({
      prompt: item.prompt,
      token_count: item.token_count ?? estimateTokens(item.prompt),
    }));
    const userPromptTokens = prompts.reduce(
      (total, item) => total + item.token_count,
      0,
    );

    const promptTokenBenchmarks: Record<string, number> = {
      spec_to_prompt:
        challenge.category === "spec_to_prompt" &&
        challenge.challenge_data.prompt_mode === "plan_act"
          ? 1200
          : 450,
      token_golf:
        challenge.category === "token_golf"
          ? Number(challenge.challenge_data.max_tokens_allowed ?? 220)
          : 220,
      bug_fix: 350,
      architecture_pick: 1,
      ui_reproduction: 650,
    };

    const timeScore = computeTimeScore(
      body.time_taken_seconds,
      maxTimeAllowedForChallenge(challenge),
    );

    let accuracyScore = 0;
    let tokenScore = 100;
    let combinedScore = 0;
    let judgeFeedback: Record<string, unknown> = {};
    let aiResponses: Array<{ response: string; token_count: number }> = [];
    let generatedScreenshotUrl: string | null = null;
    let agentTrace: Record<string, unknown> | null = null;

    if (challenge.category === "spec_to_prompt") {
      const execution = await executeSpecToPrompt({
        promptMode: challenge.challenge_data.prompt_mode,
        userPrompts: prompts.map((item) => item.prompt),
        provider,
      });

      aiResponses = execution.responses.map((response) => ({
        response: response.content,
        token_count: response.tokens,
      }));

      judgeFeedback = await judgeSpecToPrompt({
        expectedBehavior: challenge.challenge_data.expected_behavior,
        rubric: challenge.challenge_data.rubric,
        userPrompts: prompts.map((item) => item.prompt),
        aiOutputs: execution.responses.map((response) => response.content),
        provider,
      });

      accuracyScore =
        Number(judgeFeedback.overall_score ?? judgeFeedback.accuracy_score ?? 0) ||
        0;
      tokenScore = computeTokenScore(
        userPromptTokens,
        promptTokenBenchmarks.spec_to_prompt,
      );
      combinedScore = computeCombinedScore({
        category: challenge.category,
        accuracyRaw: accuracyScore,
        tokenScore,
        timeScore,
      });
    } else if (challenge.category === "token_golf") {
      const execution = await executeTokenGolfPrompt(prompts[0]?.prompt ?? "", provider);
      const parsed = ensureJsonObject<Record<string, any>>(execution.content, {
        code: execution.content,
      });
      aiResponses = [
        {
          response: parsed.code ?? execution.content,
          token_count: execution.totalTokens,
        },
      ];
      judgeFeedback = await judgeTokenGolf({
        targetOutput: challenge.challenge_data.target_output,
        actualOutput: parsed.code ?? execution.content,
        verificationPrompt: challenge.challenge_data.verification_prompt,
        provider,
      });
      accuracyScore =
        Number(judgeFeedback.correctness_percentage ?? 0) / 10;
      tokenScore = computeTokenScore(
        userPromptTokens,
        challenge.challenge_data.max_tokens_allowed,
      );
      combinedScore = computeCombinedScore({
        category: challenge.category,
        accuracyRaw: accuracyScore,
        tokenScore,
        timeScore,
      });
    } else if (challenge.category === "bug_fix") {
      const execution = await executeBugFixPrompt({
        brokenCode: String(challenge.challenge_data.code ?? ""),
        language: String(challenge.challenge_data.language ?? ""),
        task: String(challenge.challenge_data.task ?? ""),
        userPrompt: prompts[0]?.prompt ?? "",
        provider,
      });
      const parsed = ensureJsonObject<Record<string, any>>(execution.content, {
        fixed_code: execution.content,
      });
      const fixedCode = String(parsed.fixed_code ?? execution.content);
      aiResponses = [
        {
          response: fixedCode,
          token_count: execution.totalTokens,
        },
      ];
      judgeFeedback = await judgeBugFix({
        brokenCode: String(challenge.challenge_data.code ?? ""),
        aiFixedCode: fixedCode,
        actualBug: challenge.challenge_data.bug_description,
        bugLocation: challenge.challenge_data.bug_location,
        expectedFix: challenge.challenge_data.expected_fix,
        userPrompt: prompts[0]?.prompt ?? "",
        rubric: challenge.challenge_data.rubric,
        provider,
      });
      accuracyScore =
        Number(judgeFeedback.overall_score ?? judgeFeedback.precision_score ?? 0) ||
        0;
      tokenScore = computeTokenScore(
        userPromptTokens,
        promptTokenBenchmarks.bug_fix,
      );
      combinedScore = computeCombinedScore({
        category: challenge.category,
        accuracyRaw: accuracyScore,
        tokenScore,
        timeScore,
      });
    } else if (challenge.category === "architecture_pick") {
      accuracyScore = scoreArchitectureRanking(
        body.user_ranking ?? [],
        challenge.challenge_data.correct_ranking,
      );
      judgeFeedback = {
        overall_score: accuracyScore,
        correct_ranking: challenge.challenge_data.correct_ranking,
        explanations: challenge.challenge_data.explanations,
      };
      tokenScore = 100;
      combinedScore = computeCombinedScore({
        category: challenge.category,
        accuracyRaw: accuracyScore,
        tokenScore,
        timeScore: 100,
      });
    } else if (challenge.category === "ui_reproduction") {
      const execution = await executeUIReproductionPrompt(prompts[0]?.prompt ?? "", provider);
      const targetPath = String(challenge.challenge_data.target_screenshot_url ?? "");
      const targetUrl = targetPath.startsWith("http")
        ? targetPath
        : `${env.FRONTEND_URL.replace(/\/$/, "")}${targetPath}`;

      const [generatedScreenshotBase64, targetScreenshotBase64] = await Promise.all([
        htmlToBase64ScreenshotSafe(execution.html),
        fetchUrlToBase64(targetUrl).catch(() =>
          htmlToBase64ScreenshotSafe(String(challenge.challenge_data.target_html_css ?? "")),
        ),
      ]);

      if (!generatedScreenshotBase64 || !targetScreenshotBase64) {
        res.status(502).json({
          error: "Could not render UI screenshots for evaluation. Please try again.",
        });
        return;
      }
      judgeFeedback = await judgeUIReproduction({
        provider,
        targetScreenshotBase64,
        generatedScreenshotBase64,
        rubric: challenge.challenge_data.rubric,
      });
      accuracyScore =
        Number(
          judgeFeedback.overall_score ??
            (Number(judgeFeedback.visual_similarity_percentage ?? 0) / 10),
        ) || 0;
      tokenScore = computeTokenScore(
        userPromptTokens,
        promptTokenBenchmarks.ui_reproduction,
      );
      combinedScore = computeCombinedScore({
        category: challenge.category,
        accuracyRaw: accuracyScore,
        tokenScore,
        timeScore,
      });
      aiResponses = [
        {
          response: execution.html,
          token_count: execution.totalTokens,
        },
      ];
      generatedScreenshotUrl = `data:image/png;base64,${generatedScreenshotBase64}`;
    } else if (
      SDE2_CATEGORIES.has(challenge.category as string) &&
      !SDE2_ENABLED
    ) {
      res.status(503).json({
        error:
          "SDE2+ challenges are coming soon. The Managed Agents eval infrastructure is not yet provisioned for this challenge category.",
      });
      return;
    } else if (
      SDE2_CATEGORIES.has(challenge.category as string) &&
      !userCanAttemptSde2(req.auth!.profile.username)
    ) {
      res.status(402).json({
        error:
          "SDE2+ challenges are part of the Pro plan. Upgrade your plan to submit, or contact us at hello@vibeforces.tech.",
        upgrade_required: true,
      });
      return;
    } else if (challenge.category === "distributed_debug") {
      const data = challenge.challenge_data as any;
      const candidatePrompt = prompts[0]?.prompt ?? "";
      const execution = await executeDistributedDebug({
        challengeData: data,
        candidatePrompt,
        candidateModel: provider === "anthropic" ? undefined : undefined,
      });
      const judged = await judgeDistributedDebug({
        scenario: data.scenario,
        hiddenRootCause: data.hidden_root_cause,
        rubric: data.rubric,
        candidatePrompt,
        signals: execution.signals,
        finalText: execution.trace.final_text,
        toolCallSummary: summarizeToolCalls(execution.trace.tool_calls),
        provider,
      });
      judgeFeedback = { ...judged, signals: execution.signals };
      accuracyScore = Number(judgeFeedback.overall_score ?? 0);
      tokenScore = budgetEfficiencyScore(execution.signals);
      combinedScore = computeCombinedScore({
        category: challenge.category,
        accuracyRaw: accuracyScore,
        tokenScore,
        timeScore,
      });
      aiResponses = [
        {
          response: execution.trace.final_text || "(agent produced no final text)",
          token_count:
            execution.trace.usage.input_tokens + execution.trace.usage.output_tokens,
        },
      ];
      agentTrace = execution.trace as unknown as Record<string, unknown>;
    } else if (challenge.category === "system_design_build") {
      const data = challenge.challenge_data as any;
      const candidatePrompt = prompts[0]?.prompt ?? "";
      const execution = await executeSystemDesignBuild({
        challengeData: data,
        candidatePrompt,
      });
      const judged = await judgeSystemDesignBuild({
        spec: data.spec,
        rubric: data.rubric,
        candidatePrompt,
        signals: execution.signals,
        finalText: execution.trace.final_text,
        toolCallSummary: summarizeToolCalls(execution.trace.tool_calls),
        provider,
      });
      judgeFeedback = { ...judged, signals: execution.signals };
      accuracyScore = Number(judgeFeedback.overall_score ?? 0);
      tokenScore = budgetEfficiencyScore(execution.signals);
      combinedScore = computeCombinedScore({
        category: challenge.category,
        accuracyRaw: accuracyScore,
        tokenScore,
        timeScore,
      });
      aiResponses = [
        {
          response: execution.trace.final_text || "(agent produced no final text)",
          token_count:
            execution.trace.usage.input_tokens + execution.trace.usage.output_tokens,
        },
      ];
      agentTrace = execution.trace as unknown as Record<string, unknown>;
    } else if (challenge.category === "agent_orchestration") {
      const data = challenge.challenge_data as any;
      const orchestration = body.orchestration_submission;
      if (!orchestration) {
        res.status(400).json({
          error:
            "agent_orchestration submissions require an `orchestration_submission` body with at minimum a system_prompt.",
        });
        return;
      }
      // The eval-fixture payload would normally come from a sealed store;
      // for now we expect challenge_data.eval_fixture_payload to be set, or
      // fall back to the goal text so the agent can at least run.
      const evalPayload =
        String(data.eval_fixture_payload ?? "") || String(data.goal ?? "");
      const expectedSubgoals = Array.isArray(data.expected_subgoals)
        ? data.expected_subgoals
        : [];

      const execution = await executeAgentOrchestration({
        challengeData: data,
        submission: orchestration,
        evalFixturePayload: evalPayload,
      });
      const judged = await judgeAgentOrchestration({
        goal: data.goal,
        rubric: data.rubric,
        passThreshold: Number(data.pass_threshold ?? 0.7),
        signals: execution.signals,
        expectedSubgoals,
        finalOutputContract: data.required_tools?.find(
          (t: any) => t.scoring_role === "final_output",
        ),
        provider,
      });
      judgeFeedback = { ...judged, signals: execution.signals };
      accuracyScore = Number(judgeFeedback.overall_score ?? 0);
      tokenScore = budgetEfficiencyScore(execution.signals);
      combinedScore = computeCombinedScore({
        category: challenge.category,
        accuracyRaw: accuracyScore,
        tokenScore,
        timeScore: 100,
      });
      aiResponses = [
        {
          response:
            JSON.stringify(execution.signals.final_output ?? null, null, 2) ||
            "(no final_output recorded)",
          token_count:
            execution.trace.usage.input_tokens + execution.trace.usage.output_tokens,
        },
      ];
      agentTrace = execution.trace as unknown as Record<string, unknown>;
    }

    let tokenPercentile: number | null = null;
    if (
      challenge.category !== "architecture_pick" &&
      !SDE2_CATEGORIES.has(challenge.category)
    ) {
      const { data: peerRows } = await supabaseAdmin
        .from("submissions")
        .select("prompts")
        .eq("challenge_id", body.challenge_id)
        .eq("context_type", "practice")
        .eq("status", "completed")
        .neq("user_id", req.auth!.userId)
        .limit(500);

      const peerTokens = (peerRows ?? [])
        .map((row: any) =>
          Array.isArray(row.prompts)
            ? row.prompts.reduce(
                (sum: number, p: any) => sum + Number(p?.token_count ?? 0),
                0,
              )
            : 0,
        )
        .filter((value: number) => value > 0);

      tokenPercentile = percentileScore(userPromptTokens, peerTokens);
      if (tokenPercentile !== null) {
        tokenScore = computePromptEfficiencyScore({
          promptTokens: userPromptTokens,
          benchmarkTokens: promptTokenBenchmarks[challenge.category] ?? 500,
          peerPromptTokens: peerTokens,
        });
        combinedScore = computeCombinedScore({
          category: challenge.category,
          accuracyRaw: accuracyScore,
          tokenScore,
          timeScore,
        });
      }
    }
    if (tokenPercentile !== null) {
      judgeFeedback = {
        ...judgeFeedback,
        token_percentile: tokenPercentile,
        prompt_tokens_used: userPromptTokens,
        prompt_token_benchmark: promptTokenBenchmarks[challenge.category] ?? null,
      } as Record<string, unknown>;
    }

    let accuracyPercentile: number | null = null;
    let combinedPercentile: number | null = null;
    {
      const { data: peerScoreRows } = await supabaseAdmin
        .from("submissions")
        .select("accuracy_score, combined_score")
        .eq("challenge_id", body.challenge_id)
        .eq("context_type", "practice")
        .eq("status", "completed")
        .neq("user_id", req.auth!.userId)
        .limit(500);

      const peerAccuracy = (peerScoreRows ?? [])
        .map((row: any) => Number(row.accuracy_score ?? 0))
        .filter((value: number) => Number.isFinite(value));
      const peerCombined = (peerScoreRows ?? [])
        .map((row: any) => Number(row.combined_score ?? 0))
        .filter((value: number) => Number.isFinite(value));

      const pct = (value: number, peers: number[]) => {
        if (peers.length === 0) return null;
        const lower = peers.filter((p) => p < value).length;
        const equal = peers.filter((p) => p === value).length;
        return Math.round(((lower + equal * 0.5) / peers.length) * 100);
      };

      accuracyPercentile = pct(accuracyScore, peerAccuracy);
      combinedPercentile = pct(combinedScore, peerCombined);
    }
    judgeFeedback = {
      ...judgeFeedback,
      accuracy_percentile: accuracyPercentile,
      combined_percentile: combinedPercentile,
    } as Record<string, unknown>;

    const { data: submission, error: submissionError } = await supabaseAdmin
      .from("submissions")
      .insert({
        user_id: req.auth!.userId,
        challenge_id: body.challenge_id,
        context_type: body.context_type,
        context_id: body.context_id ?? null,
        prompts,
        ai_responses: aiResponses,
        user_ranking: body.user_ranking ?? null,
        generated_screenshot_url: generatedScreenshotUrl,
        accuracy_score: accuracyScore,
        token_score: tokenScore,
        time_taken_seconds: body.time_taken_seconds,
        combined_score: combinedScore,
        judge_feedback: judgeFeedback,
        agent_trace: agentTrace,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (submissionError) throw submissionError;

    let ratingChange: { before: number; after: number; delta: number } | null = null;
    if (body.context_type === "practice") {
      const { count: priorCount } = await supabaseAdmin
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", req.auth!.userId)
        .eq("challenge_id", body.challenge_id)
        .eq("context_type", "practice")
        .eq("status", "completed");

      const isFirstSolve = (priorCount ?? 0) <= 1;
      ratingChange = await applyRatingChange({
        userId: req.auth!.userId,
        challenge,
        submissionId: (submission as any).id,
        combinedScore,
        isFirstSolve,
      });
    }

    if (body.context_type === "contest" && body.context_id) {
      const { data: currentContestSubmissions } = await supabaseAdmin
        .from("submissions")
        .select("combined_score, time_taken_seconds")
        .eq("context_type", "contest")
        .eq("context_id", body.context_id)
        .eq("user_id", req.auth!.userId)
        .eq("status", "completed");

      const totalScore = (currentContestSubmissions ?? []).reduce(
        (sum, entry: any) => sum + Number(entry.combined_score ?? 0),
        0,
      );
      const totalTime = (currentContestSubmissions ?? []).reduce(
        (sum, entry: any) => sum + Number(entry.time_taken_seconds ?? 0),
        0,
      );

      await supabaseAdmin.from("contest_participants").upsert(
        {
          contest_id: body.context_id,
          user_id: req.auth!.userId,
          total_score: totalScore,
          total_time_seconds: totalTime,
        },
        { onConflict: "contest_id,user_id" },
      );
    }

    if (body.context_type === "test" && body.context_id) {
      const { data: currentTestSubmissions } = await supabaseAdmin
        .from("submissions")
        .select("combined_score")
        .eq("context_type", "test")
        .eq("context_id", body.context_id)
        .eq("user_id", req.auth!.userId)
        .eq("status", "completed");

      const totalScore = (currentTestSubmissions ?? []).reduce(
        (sum, entry: any) => sum + Number(entry.combined_score ?? 0),
        0,
      );

      await supabaseAdmin
        .from("test_attempts")
        .update({ total_score: totalScore })
        .eq("test_id", body.context_id)
        .eq("user_id", req.auth!.userId);
    }

    res.status(201).json({
      submission,
      challenge: getChallengeSummary(challenge),
      rating_change: ratingChange,
    });
  }),
);

export default router;
