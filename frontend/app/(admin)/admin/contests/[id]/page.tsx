"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CountdownTimer } from "@/components/common/countdown-timer";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { apiClient } from "@/lib/api";
import type { ContestRecord } from "@shared/types";
import { EmptyState } from "@/components/common/empty-state";

export default function AdminContestDetailPage() {
  const params = useParams<{ id: string }>();
  const [contest, setContest] = useState<ContestRecord | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      apiClient.getContest(params.id),
      apiClient.getContestLeaderboard(params.id),
    ])
      .then(([contestResponse, leaderboardResponse]) => {
        if (cancelled) return;
        setContest(contestResponse.contest);
        setLeaderboard(leaderboardResponse.leaderboard);
        setError(null);
      })
      .catch((nextError) => {
        if (!cancelled) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Contest detail could not be loaded.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (error) {
    return (
      <EmptyState
        icon={<ShieldCheck className="size-12" />}
        title="Contest unavailable"
        description={error}
      />
    );
  }

  if (!contest) {
    return (
      <div className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-8 text-center text-sm text-[#94a3b8]">
        Loading contest detail...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
          Contest Detail
        </div>
        <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
          {contest.title}
        </h1>
      </div>

      <Card className="surface-card rounded-2xl p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
              Schedule
            </div>
            <div className="mt-2 text-[#f1f5f9]">
              {new Date(contest.scheduled_at).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
              Duration
            </div>
            <div className="mt-2 text-[#f1f5f9]">{contest.duration_minutes} minutes</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
              Countdown
            </div>
            <CountdownTimer
              targetDate={contest.scheduled_at}
              className="mt-2 font-mono-ui text-xl text-[#a78bfa]"
            />
          </div>
        </div>
      </Card>

      <LeaderboardTable entries={leaderboard} />
    </div>
  );
}
