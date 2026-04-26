"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { ChallengeWorkbench } from "@/components/challenges/challenge-workbench";
import { CountdownTimer } from "@/components/common/countdown-timer";
import { ProctoringBanner } from "@/components/common/proctoring-banner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { ChallengeRecord, RecruiterTestRecord } from "@shared/types";

type AttemptRecord = {
  id: string;
  status: "in_progress" | "completed" | "timed_out";
  started_at?: string | null;
  total_score?: number | null;
};

type SubmissionRow = {
  id: string;
  challenge_id: string;
  context_type?: string;
  context_id?: string | null;
  combined_score?: number | null;
};

function mergeSubmission(
  current: SubmissionRow[],
  next: Record<string, unknown>,
): SubmissionRow[] {
  const normalized = next as unknown as SubmissionRow;
  const existingIndex = current.findIndex((item) => item.id === normalized.id);

  if (existingIndex === -1) {
    return [normalized, ...current];
  }

  const copy = [...current];
  copy[existingIndex] = normalized;
  return copy;
}

export default function TakeTestPage() {
  const auth = useAuth();
  const params = useParams<{ code: string }>();
  const completionSentRef = useRef(false);
  const [test, setTest] = useState<RecruiterTestRecord | null>(null);
  const [attempt, setAttempt] = useState<AttemptRecord | null>(null);
  const [challenges, setChallenges] = useState<ChallengeRecord[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .getTestByCode(params.code)
      .then((response) => {
        if (cancelled) return;
        setTest(response.test);
        setChallenges(response.challenges);
        setActiveChallengeId(response.challenges[0]?.id ?? null);
        setError(null);
      })
      .catch((nextError) => {
        if (!cancelled) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Recruiter test could not be loaded.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [params.code]);

  useEffect(() => {
    if (!auth.session?.access_token || !test?.id) {
      return;
    }

    let cancelled = false;

    apiClient
      .startTest(test.id, auth.session.access_token)
      .then((response) => {
        if (!cancelled) {
          setAttempt(response.attempt as AttemptRecord);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [auth.session?.access_token, test?.id]);

  useEffect(() => {
    if (!auth.session?.access_token || !test?.id) {
      return;
    }

    let cancelled = false;

    apiClient
      .getMySubmissions(auth.session.access_token)
      .then((response) => {
        if (cancelled) return;
        setSubmissions(
          (response.submissions as SubmissionRow[]).filter(
            (submission) =>
              submission.context_type === "test" &&
              submission.context_id === test.id,
          ),
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [auth.session?.access_token, test?.id]);

  const activeChallenge =
    challenges.find((challenge) => challenge.id === activeChallengeId) ??
    challenges[0] ??
    null;

  const solvedCount = useMemo(
    () => new Set(submissions.map((submission) => submission.challenge_id)).size,
    [submissions],
  );
  const totalScore = useMemo(
    () =>
      Number(
        submissions
          .reduce(
            (sum, submission) => sum + Number(submission.combined_score ?? 0),
            0,
          )
          .toFixed(2),
      ),
    [submissions],
  );

  const attemptLocked =
    attempt?.status === "completed" || attempt?.status === "timed_out";
  const countdownTarget =
    attempt?.started_at && test
      ? new Date(
          new Date(attempt.started_at).getTime() + test.time_limit_minutes * 60_000,
        ).toISOString()
      : null;

  async function finalizeAttempt(status: "completed" | "timed_out") {
    if (!auth.session?.access_token || !test?.id || completionSentRef.current) {
      return;
    }

    completionSentRef.current = true;
    setFinalizing(true);

    try {
      const response = await apiClient.completeTest(
        test.id,
        { total_score: totalScore, status },
        auth.session.access_token,
      );
      setAttempt(response.attempt as AttemptRecord);
    } catch {
      completionSentRef.current = false;
    } finally {
      setFinalizing(false);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-10 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <EmptyState
            icon={<ClipboardCheck className="size-12" />}
            title="Test unavailable"
            description={error}
          />
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen px-4 py-10 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-8 text-center text-sm text-[#94a3b8]">
          Loading recruiter test...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="surface-card rounded-2xl p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
                Recruiter Test
              </div>
              <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
                {test.title}
              </h1>
              <p className="mt-2 text-sm text-[#94a3b8]">
                {test.challenge_ids.length} challenges · {test.time_limit_minutes} minute timer
              </p>
            </div>
            <div className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] px-5 py-4">
              <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
                Time Remaining
              </div>
              {countdownTarget ? (
                <CountdownTimer
                  targetDate={countdownTarget}
                  onExpire={() => {
                    if (!attemptLocked) {
                      void finalizeAttempt("timed_out");
                    }
                  }}
                  className="mt-2 text-2xl font-mono-ui text-[#f1f5f9]"
                />
              ) : (
                <div className="mt-2 text-sm text-[#94a3b8]">
                  Sign in to start the timer.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              {challenges.map((challenge, index) => (
                <button
                  key={challenge.id}
                  type="button"
                  onClick={() => setActiveChallengeId(challenge.id)}
                  className={`inline-flex size-14 items-center justify-center rounded-2xl border font-mono-ui ${
                    activeChallengeId === challenge.id
                      ? "border-[#7c3aed] bg-[#7c3aed] text-white"
                      : "border-[#1e293b] bg-[#0a0f1e] text-[#94a3b8]"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {activeChallenge ? (
              <ChallengeWorkbench
                challenge={activeChallenge}
                contextType="test"
                contextId={test.id}
                showProctoring
                disabled={attemptLocked}
                lockedReason={
                  attempt?.status === "timed_out"
                    ? "This recruiter test timed out. Submissions are locked."
                    : attempt?.status === "completed"
                      ? "This recruiter test has been finalized. Submissions are locked."
                      : undefined
                }
                onSubmissionComplete={(submission) => {
                  setSubmissions((current) => mergeSubmission(current, submission));
                }}
              />
            ) : null}
          </div>

          <div className="space-y-4">
            <Card className="surface-card rounded-2xl p-5">
              <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
                Test Progress
              </div>
              <div className="mt-4 space-y-3 text-sm text-[#cbd5e1]">
                <div className="flex items-center justify-between">
                  <span>Solved</span>
                  <span className="font-mono-ui text-[#f1f5f9]">
                    {solvedCount}/{challenges.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Score</span>
                  <span className="font-mono-ui text-[#a78bfa]">
                    {totalScore.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <span className="font-mono-ui uppercase text-[#f1f5f9]">
                    {attempt?.status ?? "not_started"}
                  </span>
                </div>
              </div>
              <Button
                className="mt-5 w-full bg-[#7c3aed] hover:bg-[#6d28d9]"
                disabled={
                  finalizing ||
                  attemptLocked ||
                  !auth.session?.access_token ||
                  submissions.length === 0
                }
                onClick={() => void finalizeAttempt("completed")}
              >
                {finalizing ? "Finalizing..." : "Finish Test"}
              </Button>
            </Card>

            {!auth.isAuthenticated ? (
              <Card className="rounded-2xl border border-[#7f1d1d] bg-[#450a0a]/20 p-4 text-sm text-[#fca5a5]">
                Sign in with a learner account to start and submit the test.
              </Card>
            ) : null}
          </div>
        </div>

        <ProctoringBanner />
      </div>
    </div>
  );
}
