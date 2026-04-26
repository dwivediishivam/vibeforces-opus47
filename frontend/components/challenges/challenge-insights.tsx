"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

type LeaderboardRow = {
  rank: number;
  user_id: string;
  username: string;
  display_name: string;
  combined_score: number;
  accuracy_score: number;
  token_score: number;
  time_taken_seconds: number;
};

type SubmissionRow = {
  id: string;
  created_at: string;
  combined_score: number;
  accuracy_score: number;
  token_score: number;
  time_taken_seconds: number;
  prompts?: Array<{ prompt: string; token_count: number }>;
  ai_responses?: Array<{ response: string; token_count: number }>;
  judge_feedback?: Record<string, unknown>;
};

function CompareView({
  a,
  b,
  onClose,
}: {
  a: SubmissionRow;
  b: SubmissionRow;
  onClose: () => void;
}) {
  const renderSide = (sub: SubmissionRow) => {
    const promptText = (sub.prompts ?? []).map((p) => p.prompt).join("\n\n---\n\n");
    const aiText = (sub.ai_responses ?? []).map((r) => r.response).join("\n\n---\n\n");
    return (
      <div className="space-y-3 rounded-xl border border-[#1e293b] bg-[#030712] p-4">
        <div className="flex items-center justify-between text-xs text-[#64748b]">
          <span>{new Date(sub.created_at).toLocaleString()}</span>
          <span className="font-mono-ui text-[#a78bfa]">
            {Number(sub.combined_score).toFixed(1)} pts
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[11px] font-mono-ui text-[#94a3b8]">
          <div>Acc {Number(sub.accuracy_score).toFixed(1)}</div>
          <div>Tok {Math.round(Number(sub.token_score))}</div>
          <div>{Math.floor(Number(sub.time_taken_seconds) / 60)}m</div>
        </div>
        <div>
          <div className="mb-1 text-[10px] uppercase tracking-[1.5px] text-[#64748b]">
            Prompt
          </div>
          <pre className="max-h-44 overflow-auto whitespace-pre-wrap rounded bg-[#0a0f1e] p-2 font-mono-ui text-[11px] text-[#cbd5e1]">
            {promptText || "(no prompt)"}
          </pre>
        </div>
        <div>
          <div className="mb-1 text-[10px] uppercase tracking-[1.5px] text-[#64748b]">
            AI output
          </div>
          <pre className="max-h-44 overflow-auto whitespace-pre-wrap rounded bg-[#0a0f1e] p-2 font-mono-ui text-[11px] text-[#94a3b8]">
            {aiText || "(no output)"}
          </pre>
        </div>
      </div>
    );
  };
  const scoreDelta =
    Number(b.combined_score ?? 0) - Number(a.combined_score ?? 0);
  return (
    <div className="rounded-xl border border-[#7c3aed]/40 bg-[#7c3aed]/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-[#cbd5e1]">
          Comparing two of your submissions —{" "}
          <span
            className={`font-mono-ui ${
              scoreDelta >= 0 ? "text-[#4ade80]" : "text-[#f87171]"
            }`}
          >
            {scoreDelta >= 0 ? "+" : ""}
            {scoreDelta.toFixed(1)} pts
          </span>{" "}
          delta
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-mono-ui text-[#94a3b8] hover:text-[#f1f5f9]"
        >
          close
        </button>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {renderSide(a)}
        {renderSide(b)}
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function ChallengeInsights({
  challengeId,
  category,
  refreshKey = 0,
}: {
  challengeId: string;
  category?: string;
  refreshKey?: number;
}) {
  const auth = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      apiClient.getChallengeLeaderboard(challengeId),
      auth.session?.access_token
        ? apiClient.getChallengeSubmissions(challengeId, auth.session.access_token)
        : Promise.resolve({ submissions: [] }),
    ])
      .then(([lb, subs]) => {
        if (cancelled) return;
        setLeaderboard(lb.leaderboard as LeaderboardRow[]);
        setSubmissions((subs.submissions ?? []) as SubmissionRow[]);
        setError(null);
      })
      .catch((nextError) => {
        if (cancelled) return;
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Could not load problem analytics.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth.session?.access_token, challengeId, refreshKey]);

  const currentUserId = auth.session?.user.id;
  const myBestScore = submissions.length
    ? Math.max(...submissions.map((s) => Number(s.combined_score) || 0))
    : null;
  const peerScores = leaderboard
    .filter((row) => row.user_id !== currentUserId)
    .map((row) => row.combined_score);
  const myPercentile =
    myBestScore !== null && peerScores.length > 0
      ? Math.round(
          ((peerScores.filter((s) => s < myBestScore).length +
            peerScores.filter((s) => s === myBestScore).length * 0.5) /
            peerScores.length) *
            100,
        )
      : null;
  const buckets = [
    { label: "0-40", min: 0, max: 40 },
    { label: "40-60", min: 40, max: 60 },
    { label: "60-80", min: 60, max: 80 },
    { label: "80-90", min: 80, max: 90 },
    { label: "90+", min: 90, max: 101 },
  ].map((bucket) => ({
    ...bucket,
    count: leaderboard.filter(
      (row) => row.combined_score >= bucket.min && row.combined_score < bucket.max,
    ).length,
  }));
  const maxBucket = Math.max(1, ...buckets.map((bucket) => bucket.count));
  const showTokenEfficiency = category !== "architecture_pick";
  const leaderboardColumns = showTokenEfficiency
    ? "grid-cols-[40px_1fr_70px_70px_70px_80px]"
    : "grid-cols-[40px_1fr_70px_70px_80px]";
  const submissionColumns = showTokenEfficiency
    ? "grid-cols-[1fr_70px_70px_70px_80px]"
    : "grid-cols-[1fr_70px_70px_80px]";

  return (
    <Card className="surface-card rounded-2xl p-6">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
            Problem analytics
          </div>
          <h2 className="mt-1 font-mono-ui text-xl font-semibold text-[#f1f5f9]">
            Leaderboard, score distribution, and your attempts
          </h2>
        </div>
        <div className="text-xs text-[#64748b]">
          {showTokenEfficiency
            ? "Prompt tokens are scored against both a budget and peer attempts."
            : "Architecture-pick questions are scored on ranking correctness only."}
        </div>
      </div>
      {error ? (
        <div className="mb-4 rounded-xl border border-[#7f1d1d] bg-[#450a0a]/30 px-4 py-3 text-sm text-[#fca5a5]">
          {error}
        </div>
      ) : null}
      {myPercentile !== null ? (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-[#7c3aed]/30 bg-[#7c3aed]/5 px-4 py-3 text-sm">
          <div className="text-[#cbd5e1]">
            Your best on this challenge:{" "}
            <span className="font-mono-ui text-[#a78bfa]">
              {myBestScore?.toFixed(1)}
            </span>
          </div>
          <div className="text-xs font-mono-ui text-[#94a3b8]">
            Beats <span className="text-[#a78bfa]">{myPercentile}%</span> of solvers
          </div>
        </div>
      ) : null}
      {leaderboard.length > 0 ? (
        <div className="mb-5 rounded-xl border border-[#1e293b] bg-[#0a0f1e] p-4">
          <div className="mb-3 text-xs uppercase tracking-[2px] text-[#64748b]">
            Score distribution
          </div>
          <div className="grid grid-cols-5 items-end gap-3">
            {buckets.map((bucket) => (
              <div key={bucket.label} className="space-y-2">
                <div className="flex h-24 items-end rounded-lg bg-[#030712] p-1">
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-[#7c3aed] to-[#a78bfa]"
                    style={{
                      height: `${Math.max(6, (bucket.count / maxBucket) * 100)}%`,
                      opacity: bucket.count === 0 ? 0.25 : 1,
                    }}
                  />
                </div>
                <div className="text-center font-mono-ui text-[11px] text-[#94a3b8]">
                  {bucket.label}
                </div>
                <div className="text-center font-mono-ui text-[11px] text-[#64748b]">
                  {bucket.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <Tabs defaultValue="leaderboard">
        <TabsList className="border border-[#1e293b] bg-[#111827]">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="my">My submissions ({submissions.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="leaderboard" className="mt-4">
          {loading ? (
            <div className="py-8 text-center text-sm text-[#64748b]">Loading…</div>
          ) : leaderboard.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#64748b]">
              No solves yet. Be the first.
            </div>
          ) : (
            <div className="space-y-1">
              <div className={`grid ${leaderboardColumns} gap-3 px-3 py-2 text-[11px] uppercase tracking-[1.5px] text-[#64748b]`}>
                <div>#</div>
                <div>User</div>
                <div className="text-right">Score</div>
                <div className="text-right">Acc</div>
                {showTokenEfficiency ? <div className="text-right">Tok</div> : null}
                <div className="text-right">Time</div>
              </div>
              {leaderboard.slice(0, 25).map((row) => (
                <div
                  key={row.user_id}
                  className={`grid ${leaderboardColumns} gap-3 rounded-lg px-3 py-2 text-sm ${
                    row.user_id === currentUserId
                      ? "bg-[#7c3aed]/10 text-[#e9d5ff]"
                      : "text-[#cbd5e1]"
                  }`}
                >
                  <div className="font-mono-ui text-[#64748b]">{row.rank}</div>
                  <div className="truncate">{row.display_name}</div>
                  <div className="text-right font-mono-ui text-[#a78bfa]">
                    {row.combined_score.toFixed(1)}
                  </div>
                  <div className="text-right font-mono-ui">{row.accuracy_score.toFixed(1)}</div>
                  {showTokenEfficiency ? (
                    <div className="text-right font-mono-ui">{Math.round(row.token_score)}</div>
                  ) : null}
                  <div className="text-right font-mono-ui">{formatTime(row.time_taken_seconds)}</div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="mt-4">
          {!auth.session ? (
            <div className="py-8 text-center text-sm text-[#64748b]">
              Sign in to see your submissions.
            </div>
          ) : loading ? (
            <div className="py-8 text-center text-sm text-[#64748b]">Loading…</div>
          ) : submissions.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#64748b]">
              No prior submissions on this challenge.
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.length >= 2 ? (
                <div className="flex items-center justify-between rounded-lg border border-[#1e293b] bg-[#111827]/60 px-3 py-2 text-xs text-[#94a3b8]">
                  <div>
                    {compareMode
                      ? `Pick two submissions to compare (${compareIds.length}/2 selected)`
                      : "Click two submissions side-by-side to see what changed"}
                  </div>
                  <button
                    type="button"
                    className="rounded-md border border-[#334155] px-2 py-1 font-mono-ui text-[11px] text-[#cbd5e1] hover:bg-[#1e293b]"
                    onClick={() => {
                      setCompareMode((value) => !value);
                      setCompareIds([]);
                      setExpanded(null);
                    }}
                  >
                    {compareMode ? "Cancel compare" : "Compare submissions"}
                  </button>
                </div>
              ) : null}

              {compareMode && compareIds.length === 2 ? (
                <CompareView
                  a={submissions.find((s) => s.id === compareIds[0])!}
                  b={submissions.find((s) => s.id === compareIds[1])!}
                  onClose={() => {
                    setCompareMode(false);
                    setCompareIds([]);
                  }}
                />
              ) : null}

              {submissions.map((sub) => {
                const isOpen = expanded === sub.id;
                const promptText = (sub.prompts ?? [])
                  .map((p) => p.prompt)
                  .join("\n\n---\n\n");
                const aiText = (sub.ai_responses ?? [])
                  .map((r) => r.response)
                  .join("\n\n---\n\n");
                const feedback = (sub.judge_feedback as any)?.feedback ?? "";
                const isSelected = compareIds.includes(sub.id);
                return (
                  <div
                    key={sub.id}
                    className={`rounded-xl border bg-[#0a0f1e] ${
                      isSelected ? "border-[#7c3aed]" : "border-[#1e293b]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (compareMode) {
                          setCompareIds((current) => {
                            if (current.includes(sub.id))
                              return current.filter((id) => id !== sub.id);
                            if (current.length >= 2) return [current[1], sub.id];
                            return [...current, sub.id];
                          });
                          return;
                        }
                        setExpanded(isOpen ? null : sub.id);
                      }}
                      className={`grid w-full ${submissionColumns} items-center gap-3 px-4 py-3 text-left text-sm text-[#cbd5e1] hover:bg-[#111827]`}
                    >
                      <div className="text-xs text-[#64748b]">
                        {new Date(sub.created_at).toLocaleString()}
                      </div>
                      <div className="text-right font-mono-ui text-[#a78bfa]">
                        {Number(sub.combined_score).toFixed(1)}
                      </div>
                      <div className="text-right font-mono-ui">
                        {Number(sub.accuracy_score).toFixed(1)}
                      </div>
                      {showTokenEfficiency ? (
                        <div className="text-right font-mono-ui">
                          {Math.round(Number(sub.token_score))}
                        </div>
                      ) : null}
                      <div className="text-right font-mono-ui">
                        {formatTime(Number(sub.time_taken_seconds))}
                      </div>
                    </button>
                    {isOpen ? (
                      <div className="space-y-3 border-t border-[#1e293b] p-4 text-sm">
                        {promptText ? (
                          <div>
                            <div className="mb-1 text-xs uppercase tracking-[1.5px] text-[#64748b]">
                              Your prompt
                            </div>
                            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-[#030712] p-3 font-mono-ui text-xs text-[#cbd5e1]">
                              {promptText}
                            </pre>
                          </div>
                        ) : null}
                        {aiText ? (
                          <div>
                            <div className="mb-1 text-xs uppercase tracking-[1.5px] text-[#64748b]">
                              AI output
                            </div>
                            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-[#030712] p-3 font-mono-ui text-xs text-[#94a3b8]">
                              {aiText}
                            </pre>
                          </div>
                        ) : null}
                        {feedback ? (
                          <div className="text-xs italic text-[#94a3b8]">
                            {String(feedback)}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
