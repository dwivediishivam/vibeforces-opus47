"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { ChallengeRecord } from "@shared/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { DifficultyBadge } from "@/components/common/difficulty-badge";
import { RatingBadge } from "@/components/common/rating-badge";
import { ModelSelector } from "@/components/challenges/model-selector";
import { VoicePlayer } from "@/components/challenges/voice-player";
import { PromptEditor } from "@/components/challenges/prompt-editor";
import { AIResponseDisplay } from "@/components/challenges/ai-response-display";
import { CodeDisplay } from "@/components/challenges/code-display";
import { ArchitectureOptions } from "@/components/challenges/architecture-options";
import { ScreenshotViewer } from "@/components/challenges/screenshot-viewer";
import { ScoreDisplay } from "@/components/challenges/score-display";
import { ProctoringBanner } from "@/components/common/proctoring-banner";
import { ChallengeInsights } from "@/components/challenges/challenge-insights";

type SubmissionView = {
  accuracy: number;
  tokenScore: number;
  timeLabel: string;
  combinedScore: number;
  feedback: string;
  aiResponses: string[];
  percentiles?: {
    accuracy?: number | null;
    token?: number | null;
    combined?: number | null;
  };
  ratingChange?: { before: number; after: number; delta: number } | null;
};

export function ChallengeWorkbench({
  challenge,
  contextType = "practice",
  contextId,
  showProctoring = false,
  disabled = false,
  lockedReason,
  onSubmissionComplete,
  nextChallengeHref,
}: {
  challenge: ChallengeRecord;
  contextType?: "practice" | "contest" | "test";
  contextId?: string;
  showProctoring?: boolean;
  disabled?: boolean;
  lockedReason?: string;
  onSubmissionComplete?: (submission: Record<string, unknown>) => void;
  nextChallengeHref?: string;
}) {
  const auth = useAuth();
  const [singlePrompt, setSinglePrompt] = useState("");
  const [planPrompt, setPlanPrompt] = useState("");
  const [actPrompt, setActPrompt] = useState("");
  const [ranking, setRanking] = useState<Record<string, string>>({});
  const [sde2Prompt, setSde2Prompt] = useState("");
  const [orchestrationJson, setOrchestrationJson] = useState("");
  const [submission, setSubmission] = useState<SubmissionView | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("plan");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [resetKey, setResetKey] = useState(0);
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = useState(0);
  const [model, setModel] = useState<"openai" | "anthropic">("openai");

  function handleTryAgain() {
    setSubmission(null);
    setSinglePrompt("");
    setPlanPrompt("");
    setActPrompt("");
    setRanking({});
    setSde2Prompt("");
    setOrchestrationJson("");
    setActiveTab("plan");
    setStartedAt(Date.now());
    setResetKey((n) => n + 1);
  }

  const promptMode =
    challenge.category === "spec_to_prompt"
      ? ((challenge.challenge_data as any).prompt_mode as "single" | "plan_act")
      : "single";

  const isSde2 =
    challenge.category === "distributed_debug" ||
    challenge.category === "system_design_build" ||
    challenge.category === "agent_orchestration";

  const sde2AllowedUsernamesRaw =
    process.env.NEXT_PUBLIC_SDE2_ALLOWED_USERNAMES ?? "dwivediishivam";
  const sde2AllowedUsernames = new Set(
    sde2AllowedUsernamesRaw
      .split(",")
      .map((u) => u.trim().toLowerCase())
      .filter(Boolean),
  );
  const username = ((auth.profile as any)?.username ?? "").toLowerCase();
  const sde2Locked = isSde2 && !sde2AllowedUsernames.has(username);

  const preparedPrompts = useMemo(() => {
    if (challenge.category === "architecture_pick") return [];
    if (isSde2) return [sde2Prompt].filter(Boolean);
    if (promptMode === "plan_act") {
      return [planPrompt, actPrompt].filter(Boolean);
    }
    return [singlePrompt].filter(Boolean);
  }, [actPrompt, challenge.category, isSde2, planPrompt, promptMode, sde2Prompt, singlePrompt]);

  useEffect(() => {
    setStartedAt(Date.now());
    setSubmission(null);
  }, [challenge.id, contextId, contextType]);

  async function submitToApi(resolvedPrompts: string[] = preparedPrompts) {
    const token = auth.session?.access_token;
    const prompts =
      challenge.category === "architecture_pick"
        ? []
        : resolvedPrompts.map((prompt) => ({
            prompt,
          }));

    if (!token) {
      throw new Error("Sign in is required to submit and score a challenge.");
    }

    let orchestrationSubmission: unknown = undefined;
    if (challenge.category === "agent_orchestration") {
      const trimmed = orchestrationJson.trim();
      if (trimmed) {
        try {
          const parsed = JSON.parse(trimmed);
          orchestrationSubmission = {
            system_prompt: resolvedPrompts[0] ?? "",
            ...parsed,
          };
        } catch {
          throw new Error(
            "Orchestration submission is not valid JSON. Provide an object with optional custom_tools_extra and task_budget_override.",
          );
        }
      } else {
        orchestrationSubmission = { system_prompt: resolvedPrompts[0] ?? "" };
      }
    }

    const response = (await apiClient.createSubmission(
      {
        challenge_id: challenge.id,
        prompts,
        orchestration_submission: orchestrationSubmission,
        user_ranking:
          challenge.category === "architecture_pick"
            ? Object.entries(ranking)
                .sort((left, right) => Number(left[1]) - Number(right[1]))
                .map(([option]) => option)
            : undefined,
        context_type: contextType,
        context_id: contextId,
        time_taken_seconds: Math.max(
          1,
          Math.round((Date.now() - startedAt) / 1000),
        ),
        model,
      },
      token,
    )) as any;

    const entry = response.submission as any;
    onSubmissionComplete?.(entry);
    setAnalyticsRefreshKey((key) => key + 1);
    setSubmission({
      accuracy: Number(entry.accuracy_score ?? 0),
      tokenScore: Number(entry.token_score ?? 0),
      timeLabel: `${Math.floor((entry.time_taken_seconds ?? 0) / 60)}:${String(
        (entry.time_taken_seconds ?? 0) % 60,
      ).padStart(2, "0")}`,
      combinedScore: Number(entry.combined_score ?? 0),
      feedback:
        String(entry.judge_feedback?.feedback ?? "Submission evaluated successfully."),
      aiResponses: (entry.ai_responses ?? []).map((item: any) =>
        String(item.response ?? ""),
      ),
      percentiles: {
        accuracy: entry.judge_feedback?.accuracy_percentile ?? null,
        token: entry.judge_feedback?.token_percentile ?? null,
        combined: entry.judge_feedback?.combined_percentile ?? null,
      },
      ratingChange: response.rating_change ?? null,
    });
  }

  const data = challenge.challenge_data as any;

  async function handleSubmit(override?: { single?: string; plan?: string; act?: string }) {
    if (disabled) {
      toast.error(lockedReason ?? "This challenge is currently locked.");
      return;
    }

    if (
      challenge.category === "architecture_pick" &&
      Object.keys(ranking).length !== 3
    ) {
      toast.error("Rank all three options before submitting.");
      return;
    }

    const resolvedPrompts =
      challenge.category === "architecture_pick"
        ? []
        : isSde2
          ? [override?.single ?? sde2Prompt].map((v) => v.trim()).filter(Boolean)
          : promptMode === "plan_act"
            ? [override?.plan ?? planPrompt, override?.act ?? actPrompt]
                .map((value) => value.trim())
                .filter(Boolean)
            : [override?.single ?? singlePrompt]
                .map((value) => value.trim())
                .filter(Boolean);

    if (challenge.category !== "architecture_pick" && resolvedPrompts.length === 0) {
      toast.error("Write a prompt before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await submitToApi(resolvedPrompts);
      toast.success("Score ready.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/learner/challenges"
            className="inline-flex items-center gap-2 text-sm text-[#94a3b8] hover:text-[#f1f5f9]"
          >
            <ArrowLeft className="size-4" />
            Back to Challenges
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold font-mono-ui text-[#f1f5f9]">
              {challenge.title}
            </h1>
            <DifficultyBadge difficulty={challenge.difficulty} />
            <RatingBadge rating={challenge.rating} />
          </div>
          <p className="mt-3 max-w-3xl text-sm text-[#94a3b8]">
            {challenge.description}
          </p>
          {(challenge as any).instructions ? (
            <div className="mt-4 max-w-3xl rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-4">
              <div className="mb-2 text-[11px] uppercase tracking-[2px] text-[#a78bfa]">
                Instructions
              </div>
              <p className="text-sm leading-7 text-[#cbd5e1]">
                {String((challenge as any).instructions)}
              </p>
            </div>
          ) : null}
        </div>
        <ModelSelector
          value={model}
          onChange={setModel}
          disabled={submitting || disabled}
          fixedManagedAgents={isSde2}
        />
      </div>

      {challenge.category === "spec_to_prompt" ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Card className="surface-card rounded-2xl p-6">
              <div className="mb-4 font-mono-ui text-lg text-[#f1f5f9]">
                Voice Note
              </div>
              <VoicePlayer
                src={String(data.voice_note_url)}
                playsAllowed={promptMode === "plan_act" ? 2 : 1}
              />
            </Card>
            {Array.isArray(data.supplementary_images) &&
            data.supplementary_images.length > 0 ? (
              <div className="space-y-4">
                {data.supplementary_images.map((src: string) => (
                  <ScreenshotViewer key={src} src={String(src)} alt={challenge.title} />
                ))}
              </div>
            ) : null}
          </div>
          <div className="space-y-6">
            {promptMode === "plan_act" ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="border border-[#1e293b] bg-[#111827]">
                  <TabsTrigger value="plan">Plan</TabsTrigger>
                  <TabsTrigger value="act" disabled={!planPrompt.trim()}>
                    Act
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="plan" className="mt-4">
                  <PromptEditor
                    key={`plan-${resetKey}`}
                    label="Write Your Plan Prompt"
                    initialValue={planPrompt}
                    submitLabel="Lock Plan"
                    disabled={disabled}
                    onSubmit={(value) => {
                      setPlanPrompt(value);
                      setActiveTab("act");
                    }}
                    placeholder="Outline the execution plan first. This unlocks the Act tab."
                  />
                </TabsContent>
                <TabsContent value="act" className="mt-4">
                  <PromptEditor
                    key={`act-${resetKey}`}
                    label="Write Your Act Prompt"
                    initialValue={actPrompt}
                    submitLabel={submitting ? "Evaluating..." : "Submit Final Prompt"}
                    disabled={disabled}
                    onSubmit={(value) => {
                      setActPrompt(value);
                      void handleSubmit({ act: value });
                    }}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <PromptEditor
                key={`single-${resetKey}`}
                label="Write Your Prompt"
                initialValue={singlePrompt}
                submitLabel={submitting ? "Evaluating..." : "Submit Prompt"}
                disabled={disabled}
                onSubmit={(value) => {
                  setSinglePrompt(value);
                  void handleSubmit({ single: value });
                }}
              />
            )}

            {submission?.aiResponses[0] ? (
              <AIResponseDisplay content={submission.aiResponses.join("\n\n")} />
            ) : null}
            {submission ? (
              <ScoreDisplay
                accuracy={submission.accuracy}
                tokenScore={submission.tokenScore}
                timeLabel={submission.timeLabel}
                combinedScore={submission.combinedScore}
                feedback={submission.feedback}
                percentiles={submission.percentiles}
                ratingChange={submission.ratingChange}
                onTryAgain={handleTryAgain}
                nextHref={nextChallengeHref}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {challenge.category === "token_golf" ? (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="surface-card rounded-2xl p-6">
            <div className="mb-4 font-mono-ui text-lg text-[#f1f5f9]">
              Code to replicate
            </div>
            {data.target_output ? (
              <div>
                <CodeDisplay
                  code={String(data.target_output)}
                  language={String(data.target_output).includes("function") ? "javascript" : "python"}
                  minHeight={220}
                />
              </div>
            ) : null}
          </Card>
          <div className="space-y-6">
            <PromptEditor
              key={`golf-${resetKey}`}
              label="Write Your Prompt"
              initialValue={singlePrompt}
              submitLabel={submitting ? "Evaluating..." : "Submit"}
              placeholder={`Max Tokens: ${String(data.max_tokens_allowed)}`}
              disabled={disabled}
              onSubmit={(value) => {
                setSinglePrompt(value);
                void handleSubmit({ single: value });
              }}
            />
            {submission?.aiResponses[0] ? (
              <AIResponseDisplay title="Generated Output" content={submission.aiResponses[0]} language="python" />
            ) : null}
            {submission ? (
              <ScoreDisplay
                accuracy={submission.accuracy}
                tokenScore={submission.tokenScore}
                timeLabel={submission.timeLabel}
                combinedScore={submission.combinedScore}
                feedback={submission.feedback}
                percentiles={submission.percentiles}
                ratingChange={submission.ratingChange}
                onTryAgain={handleTryAgain}
                nextHref={nextChallengeHref}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {challenge.category === "bug_fix" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="surface-card rounded-2xl p-6">
            <div className="mb-4 font-mono-ui text-lg text-[#f1f5f9]">
              Broken Code
            </div>
            <CodeDisplay
              code={String(data.code)}
              language={String(data.language)}
              minHeight={360}
            />
            <div className="mt-4 text-sm text-[#94a3b8]">
              {String(data.task)}
            </div>
          </Card>
          <div className="space-y-6">
            <PromptEditor
              key={`bug-${resetKey}`}
              label="Describe the Fix"
              initialValue={singlePrompt}
              submitLabel={submitting ? "Evaluating..." : "Submit Fix"}
              placeholder='Be specific. "Fix this" scores zero. Tell the AI exactly what is wrong and where.'
              disabled={disabled}
              onSubmit={(value) => {
                setSinglePrompt(value);
                void handleSubmit({ single: value });
              }}
            />
            <div className="rounded-xl bg-[#1e293b] px-3 py-2 text-xs font-mono-ui text-[#94a3b8]">
              Precision matters most here. Time and token efficiency are scored live.
            </div>
            {submission ? (
              <ScoreDisplay
                accuracy={submission.accuracy}
                tokenScore={submission.tokenScore}
                timeLabel={submission.timeLabel}
                combinedScore={submission.combinedScore}
                feedback={submission.feedback}
                percentiles={submission.percentiles}
                ratingChange={submission.ratingChange}
                onTryAgain={handleTryAgain}
                nextHref={nextChallengeHref}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {challenge.category === "architecture_pick" ? (
        <div className="space-y-6">
          <Card className="surface-card rounded-2xl p-6">
            <div className="font-mono-ui text-lg text-[#f1f5f9]">Scenario</div>
            <p className="mt-4 text-sm leading-7 text-[#94a3b8]">
              {String(data.scenario)}
            </p>
          </Card>
          <ArchitectureOptions
            options={data.options as any}
            ranking={ranking}
            onRankChange={(optionId, rank) =>
              setRanking((current) => ({ ...current, [optionId]: rank }))
            }
          />
          <div className="flex justify-end">
            <Button
              className="bg-[#7c3aed] hover:bg-[#6d28d9]"
              disabled={submitting || disabled}
              onClick={() => void handleSubmit()}
            >
              {submitting ? "Evaluating..." : "Submit Ranking"}
            </Button>
          </div>
          {submission ? (
            <ScoreDisplay
              accuracy={submission.accuracy}
              tokenScore={100}
              timeLabel={submission.timeLabel}
              combinedScore={submission.combinedScore}
              feedback={submission.feedback}
              percentiles={submission.percentiles}
              ratingChange={submission.ratingChange}
              showTokenEfficiency={challenge.category !== "architecture_pick"}
              onTryAgain={handleTryAgain}
              nextHref={nextChallengeHref}
            />
          ) : null}
        </div>
      ) : null}

      {challenge.category === "ui_reproduction" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-6">
            <ScreenshotViewer
              src={String(data.target_screenshot_url)}
              alt={challenge.title}
            />
            <Card className="surface-subtle rounded-2xl p-4 text-sm text-[#94a3b8]">
              Study the screenshot and write a single prompt that guides the model to reproduce it. No reference description is provided — match layout, colors, typography, and spacing from the image alone.
            </Card>
          </div>
          <div className="space-y-6">
            <PromptEditor
              key={`ui-${resetKey}`}
              label="Write Your Prompt"
              initialValue={singlePrompt}
              submitLabel={submitting ? "Evaluating..." : "Submit Prompt"}
              disabled={disabled}
              onSubmit={(value) => {
                setSinglePrompt(value);
                void handleSubmit({ single: value });
              }}
            />
            {submission?.aiResponses[0] ? (
              <AIResponseDisplay title="Generated HTML" content={submission.aiResponses[0]} language="html" />
            ) : null}
            {submission ? (
              <ScoreDisplay
                accuracy={submission.accuracy}
                tokenScore={submission.tokenScore}
                timeLabel={submission.timeLabel}
                combinedScore={submission.combinedScore}
                feedback={submission.feedback}
                percentiles={submission.percentiles}
                ratingChange={submission.ratingChange}
                onTryAgain={handleTryAgain}
                nextHref={nextChallengeHref}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {isSde2 ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card className="surface-card rounded-2xl p-6">
            <div className="mb-4 font-mono-ui text-lg text-[#f1f5f9]">
              {challenge.category === "distributed_debug"
                ? "Scenario & failing test"
                : challenge.category === "system_design_build"
                  ? "Spec & required decisions"
                  : "Goal & registered tools"}
            </div>
            <div className="space-y-4 text-sm leading-7 text-[#cbd5e1]">
              {challenge.category === "distributed_debug" ? (
                <>
                  <p className="whitespace-pre-wrap">{String(data.scenario ?? "")}</p>
                  <div className="rounded-lg border border-[#1e293b] bg-[#0a0f1e] p-3 font-mono text-xs text-[#f59e0b]">
                    Failing test: {String(data.failing_test_path ?? "")}
                  </div>
                </>
              ) : null}
              {challenge.category === "system_design_build" ? (
                <>
                  <p className="whitespace-pre-wrap">{String(data.spec ?? "")}</p>
                  <div className="rounded-lg border border-[#1e293b] bg-[#0a0f1e] p-3 text-xs">
                    <div className="mb-1 text-[#a78bfa]">Required decision points</div>
                    <ul className="list-disc pl-5 text-[#cbd5e1]">
                      {(data.required_decision_points ?? []).map((p: string) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : null}
              {challenge.category === "agent_orchestration" ? (
                <>
                  <p className="whitespace-pre-wrap">{String(data.goal ?? "")}</p>
                  <div className="rounded-lg border border-[#1e293b] bg-[#0a0f1e] p-3 text-xs">
                    <div className="mb-1 text-[#a78bfa]">Registered tools</div>
                    <ul className="list-disc pl-5 text-[#cbd5e1]">
                      {(data.required_tools ?? []).map((t: any) => (
                        <li key={t.name}>
                          <span className="font-mono text-[#34d399]">{t.name}</span>
                          {" — "}
                          <span className="text-[#94a3b8]">{t.scoring_role}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {Array.isArray(data.forbidden_tools) && data.forbidden_tools.length > 0 ? (
                    <div className="rounded-lg border border-[#7c3aed]/40 bg-[#7c3aed]/10 p-3 text-xs text-[#ddd6fe]">
                      Forbidden: {(data.forbidden_tools as string[]).join(", ")}
                    </div>
                  ) : null}
                </>
              ) : null}
              <div className="rounded-lg border border-[#1e293b] bg-[#0a0f1e] p-3 text-xs text-[#94a3b8]">
                Task budget: {Number(data.task_budget_tokens ?? 0).toLocaleString()} tokens
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {sde2Locked ? (
              <Card className="surface-card rounded-2xl border border-[#7c3aed]/40 bg-[#7c3aed]/10 p-8 text-center">
                <div className="mx-auto mb-3 inline-flex size-10 items-center justify-center rounded-full bg-[#7c3aed]/20 font-mono-ui text-lg text-[#a78bfa]">
                  ★
                </div>
                <div className="font-mono-ui text-lg text-[#f1f5f9]">
                  Pro-tier challenge
                </div>
                <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#cbd5e1]">
                  This SDE2+ challenge runs inside an isolated Claude
                  Managed Agents sandbox — token-priced, capped per session.
                  Available to candidates on a Pro plan.
                </p>
                <div className="mt-5 inline-flex flex-col items-center gap-2 text-xs text-[#94a3b8]">
                  <span>Upgrade your plan to submit, or contact us:</span>
                  <a
                    href="mailto:hello@vibeforces.tech?subject=VibeForces%20Pro%20access"
                    className="font-mono-ui text-[#a78bfa] hover:underline"
                  >
                    hello@vibeforces.tech
                  </a>
                </div>
              </Card>
            ) : (
              <>
                <Card className="surface-card rounded-2xl p-6">
                  <label className="mb-2 block font-mono-ui text-sm text-[#f1f5f9]">
                    {challenge.category === "agent_orchestration"
                      ? "Agent system prompt"
                      : "Your prompt for the agent"}
                  </label>
                  <textarea
                    key={`sde2-${resetKey}`}
                    value={sde2Prompt}
                    onChange={(e) => setSde2Prompt(e.target.value)}
                    disabled={disabled || submitting}
                    rows={12}
                    placeholder={
                      challenge.category === "distributed_debug"
                        ? "Describe how the agent should reproduce, isolate, and patch. Hint: tell it to run the failing test first."
                        : challenge.category === "system_design_build"
                          ? "Describe what to build, in what order, and which decisions to log. The agent has bash, write, edit, read tools."
                          : "Define your agent's behavior. It will be invoked against the eval fixture and graded on subgoal-tool calls."
                    }
                    className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] p-3 font-mono text-xs leading-6 text-[#f1f5f9] focus:border-[#a78bfa] focus:outline-none"
                  />
                </Card>

                {challenge.category === "agent_orchestration" ? (
                  <Card className="surface-card rounded-2xl p-6">
                    <label className="mb-2 block font-mono-ui text-sm text-[#f1f5f9]">
                      Extra config (JSON, optional)
                    </label>
                    <p className="mb-2 text-xs text-[#94a3b8]">
                      Add <code>custom_tools_extra</code> or override <code>task_budget_override</code>.
                      Leave blank to use only the registered tools.
                    </p>
                    <textarea
                      value={orchestrationJson}
                      onChange={(e) => setOrchestrationJson(e.target.value)}
                      disabled={disabled || submitting}
                      rows={6}
                      placeholder={`{\n  "custom_tools_extra": [],\n  "task_budget_override": 80000\n}`}
                      className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] p-3 font-mono text-xs leading-6 text-[#f1f5f9] focus:border-[#a78bfa] focus:outline-none"
                    />
                  </Card>
                ) : null}

                <Button
                  onClick={() => void handleSubmit({ single: sde2Prompt })}
                  disabled={disabled || submitting || !sde2Prompt.trim()}
                  className="w-full"
                >
                  {submitting ? "Running agent..." : "Run agent & submit"}
                </Button>
              </>
            )}

            {submission?.aiResponses[0] ? (
              <AIResponseDisplay
                title="Agent final output"
                content={submission.aiResponses.join("\n\n")}
              />
            ) : null}
            {submission ? (
              <ScoreDisplay
                accuracy={submission.accuracy}
                tokenScore={submission.tokenScore}
                timeLabel={submission.timeLabel}
                combinedScore={submission.combinedScore}
                feedback={submission.feedback}
                percentiles={submission.percentiles}
                ratingChange={submission.ratingChange}
                onTryAgain={handleTryAgain}
                nextHref={nextChallengeHref}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {contextType === "practice" ? (
        <ChallengeInsights
          challengeId={challenge.id}
          category={challenge.category}
          refreshKey={resetKey + analyticsRefreshKey}
        />
      ) : null}

      {showProctoring ? <ProctoringBanner /> : null}
      {disabled && lockedReason ? (
        <Card className="rounded-2xl border border-[#7c3aed]/25 bg-[#7c3aed]/10 p-4 text-sm text-[#ddd6fe]">
          {lockedReason}
        </Card>
      ) : null}
    </div>
  );
}
