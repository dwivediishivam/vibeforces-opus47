"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BriefcaseBusiness } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { ChallengeRecord, RecruiterTestRecord } from "@shared/types";
import { EmptyState } from "@/components/common/empty-state";

type AttemptRecord = {
  id: string;
  total_score: number | null;
  status: string;
  started_at?: string | null;
  completed_at?: string | null;
  avg_accuracy?: number | null;
  solved_count?: number;
  total_time_seconds?: number;
  profiles?: {
    display_name?: string | null;
  } | null;
};

function formatDuration(seconds?: number | null) {
  if (!seconds) return "—";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
}

export default function RecruiterTestDetailPage() {
  const auth = useAuth();
  const params = useParams<{ id: string }>();
  const [test, setTest] = useState<RecruiterTestRecord | null>(null);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [challenges, setChallenges] = useState<ChallengeRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .getRecruiterTest(params.id, auth.session?.access_token)
      .then((response) => {
        if (cancelled) return;
        setTest(response.test);
        setAttempts(response.attempts as AttemptRecord[]);
        setChallenges(response.challenges);
        setError(null);
      })
      .catch((nextError) => {
        if (!cancelled) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Recruiter test detail could not be loaded.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [auth.session?.access_token, params.id]);

  const appUrl =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      : window.location.origin;

  if (error) {
    return (
      <EmptyState
        icon={<BriefcaseBusiness className="size-12" />}
        title="Recruiter test unavailable"
        description={error}
      />
    );
  }

  if (!test) {
    return (
      <div className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-8 text-center text-sm text-[#94a3b8]">
        Loading test detail...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
          Test Results
        </div>
        <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
          {test.title}
        </h1>
      </div>

      <Card className="surface-card rounded-2xl p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-sm text-[#94a3b8]">Share Link</div>
            <div className="mt-2 font-mono-ui text-[#a78bfa]">
              {appUrl.replace(/\/$/, "")}/test/{test.share_code}
            </div>
          </div>
          <Button
            className="bg-[#7c3aed] hover:bg-[#6d28d9]"
            onClick={async () => {
              await navigator.clipboard.writeText(
                `${appUrl.replace(/\/$/, "")}/test/${test.share_code}`,
              );
            }}
          >
            Copy Link
          </Button>
        </div>
      </Card>

      <Card className="surface-card rounded-2xl p-6">
        <div className="text-lg font-semibold font-mono-ui text-[#f1f5f9]">
          Candidates
        </div>
        <div className="mt-4 space-y-3">
          {attempts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#334155] bg-[#0a0f1e] p-6 text-sm text-[#64748b]">
              No candidates have opened this test yet.
            </div>
          ) : (
            attempts.map((candidate) => (
              <div
                key={candidate.id}
                className="grid gap-3 rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-4 md:grid-cols-5"
              >
                <div className="font-mono-ui text-[#f1f5f9]">
                  {candidate.profiles?.display_name ?? "Candidate"}
                </div>
                <div className="text-sm text-[#94a3b8]">
                  Score {Number(candidate.total_score ?? 0).toFixed(1)}
                </div>
                <div className="text-sm text-[#94a3b8]">
                  Accuracy{" "}
                  {candidate.avg_accuracy != null
                    ? `${candidate.avg_accuracy.toFixed(1)}/10`
                    : "Pending"}
                </div>
                <div className="text-sm text-[#94a3b8]">
                  Time {formatDuration(candidate.total_time_seconds)}
                </div>
                <div className="text-sm text-[#a78bfa]">
                  {candidate.status} · {candidate.solved_count ?? 0}/{test.challenge_ids.length} solved
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="surface-card rounded-2xl p-6">
        <div className="text-lg font-semibold font-mono-ui text-[#f1f5f9]">
          Challenge Mix
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-4">
              <div className="text-xs font-mono-ui uppercase text-[#64748b]">
                {challenge.code}
              </div>
              <div className="mt-2 font-mono-ui text-[#f1f5f9]">{challenge.title}</div>
              <div className="mt-2 text-sm text-[#94a3b8]">{challenge.description}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
