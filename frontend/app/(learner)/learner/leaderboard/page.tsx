"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown, Medal, Trophy } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@shared/types";

export default function LeaderboardPage() {
  const auth = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .getPracticeLeaderboard()
      .then((response) => {
        if (cancelled) return;
        setEntries(
          response.leaderboard.map((entry) => ({
            ...entry,
            isCurrentUser: entry.user_id === auth.session?.user.id,
          })),
        );
        setError(null);
      })
      .catch((nextError) => {
        if (!cancelled) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Leaderboard could not be loaded.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [auth.session?.user.id]);

  const podium = useMemo(() => entries.slice(0, 3), [entries]);

  const podiumStyles = [
    {
      icon: Crown,
      gradient: "from-[#fbbf24]/20 via-[#111827] to-[#fbbf24]/5",
      border: "border-[#fbbf24]/40",
      iconColor: "text-[#fbbf24]",
      label: "1st",
    },
    {
      icon: Medal,
      gradient: "from-[#d1d5db]/15 via-[#111827] to-[#d1d5db]/5",
      border: "border-[#d1d5db]/30",
      iconColor: "text-[#d1d5db]",
      label: "2nd",
    },
    {
      icon: Medal,
      gradient: "from-[#b45309]/20 via-[#111827] to-[#b45309]/5",
      border: "border-[#b45309]/40",
      iconColor: "text-[#d97706]",
      label: "3rd",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
            Leaderboard
          </div>
          <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9] md:text-4xl">
            Top vibecoders ranked by combined score
          </h1>
          <p className="mt-2 text-sm text-[#94a3b8]">
            Accuracy × Token Efficiency × Speed — rated like Codeforces.
          </p>
        </div>
        <Tabs defaultValue="all-time">
          <TabsList className="border border-[#1e293b] bg-[#111827]">
            <TabsTrigger value="all-time">All Time</TabsTrigger>
            <TabsTrigger value="week" disabled>
              This Week
            </TabsTrigger>
            <TabsTrigger value="today" disabled>
              Today
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {podium.length === 3 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {podium.map((entry, idx) => {
            const style = podiumStyles[idx];
            const Icon = style.icon;
            return (
              <Card
                key={entry.user_id ?? entry.username}
                className={cn(
                  "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6",
                  style.border,
                  style.gradient,
                )}
              >
                <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/5 blur-2xl" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className={cn("inline-flex size-10 items-center justify-center rounded-xl bg-white/5", style.iconColor)}>
                      <Icon className="size-5" />
                    </div>
                    <div className="mt-4 text-xs uppercase tracking-[2px] text-[#64748b]">
                      {style.label} Place
                    </div>
                    <div className="mt-1 font-mono-ui text-xl font-bold text-[#f1f5f9]">
                      {entry.display_name}
                    </div>
                    <div className="mt-0.5 font-mono-ui text-xs text-[#64748b]">
                      @{entry.username}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-ui text-2xl font-bold text-[#a78bfa]">
                      {entry.total_score.toLocaleString()}
                    </div>
                    <div className="mt-1 font-mono-ui text-xs text-[#64748b]">
                      {entry.challenges_solved}/30 solved
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}

      {error ? (
        <EmptyState
          icon={<Trophy className="size-12" />}
          title="Leaderboard unavailable"
          description={error}
        />
      ) : entries.length === 0 ? (
        <Card className="surface-card rounded-2xl p-10 text-center text-sm text-[#94a3b8]">
          Loading leaderboard...
        </Card>
      ) : (
        <LeaderboardTable entries={entries} />
      )}
    </div>
  );
}
