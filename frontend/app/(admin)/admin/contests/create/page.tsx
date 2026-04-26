"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { categoryLabels } from "@/lib/data/mock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DifficultyBadge } from "@/components/common/difficulty-badge";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { ChallengeRecord } from "@shared/types";

export default function CreateContestPage() {
  const auth = useAuth();
  const [catalog, setCatalog] = useState<ChallengeRecord[]>([]);
  const [title, setTitle] = useState("VibeForces Launch Challenge");
  const [description, setDescription] = useState(
    "The very first VibeForces contest. Test your vibe coding instincts across all five categories.",
  );
  const [scheduledAt, setScheduledAt] = useState("2026-04-18T20:00");
  const [duration, setDuration] = useState("120");
  const [category, setCategory] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .getChallenges()
      .then((response) => {
        if (!cancelled) {
          setCatalog(response.challenges);
          setCatalogError(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setCatalogError(
            error instanceof Error ? error.message : "Challenge catalog unavailable.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const available = useMemo(
    () =>
      catalog.filter(
        (challenge) => category === "all" || challenge.category === category,
      ),
    [catalog, category],
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
          Create Contest
        </div>
        <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
          Schedule a live arena
        </h1>
      </div>
      <Card className="surface-card rounded-2xl p-6">
        <div className="grid gap-4 xl:grid-cols-[1fr_220px_220px]">
          <div className="space-y-4">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-12 border-[#1e293b] bg-[#0a0f1e]"
            />
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="h-12 border-[#1e293b] bg-[#0a0f1e]"
              placeholder="Contest description"
            />
          </div>
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            className="h-12 border-[#1e293b] bg-[#0a0f1e]"
          />
          <Select value={duration} onValueChange={(value) => value && setDuration(value)}>
            <SelectTrigger className="h-12 border-[#1e293b] bg-[#0a0f1e] font-mono-ui">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-[#1e293b] bg-[#0a0f1e] text-[#f1f5f9]">
              {["60", "90", "120", "180"].map((value) => (
                <SelectItem key={value} value={value}>
                  {value} minutes
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div>
            <Select value={category} onValueChange={(value) => value && setCategory(value)}>
              <SelectTrigger className="border-[#1e293b] bg-[#0a0f1e]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#1e293b] bg-[#0a0f1e] text-[#f1f5f9]">
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-4 space-y-2">
              {catalogError ? (
                <div className="rounded-xl border border-[#7f1d1d] bg-[#450a0a]/30 px-3 py-6 text-sm text-[#fca5a5]">
                  {catalogError}
                </div>
              ) : available.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#334155] px-3 py-6 text-sm text-[#64748b]">
                  No challenges match this filter.
                </div>
              ) : (
                available.map((challenge) => (
                  <button
                    key={challenge.id}
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-[#1e293b] bg-[#0a0f1e] px-3 py-3 text-left"
                    onClick={() =>
                      setSelectedIds((current) =>
                        current.includes(challenge.id)
                          ? current.filter((id) => id !== challenge.id)
                          : [...current, challenge.id],
                      )
                    }
                  >
                    <div>
                      <div className="font-mono-ui text-sm text-[#f1f5f9]">
                        {challenge.title}
                      </div>
                      <div className="mt-1 text-xs text-[#64748b]">
                        {challenge.code}
                      </div>
                    </div>
                    <DifficultyBadge difficulty={challenge.difficulty} />
                  </button>
                ))
              )}
            </div>
          </div>
          <Card className="surface-subtle rounded-2xl p-4">
            <div className="text-sm font-mono-ui text-[#f1f5f9]">
              Selected ({selectedIds.length})
            </div>
            <div className="mt-3 space-y-2">
              {selectedIds.map((id) => {
                const challenge = catalog.find((item) => item.id === id)!;
                return (
                  <div
                    key={id}
                    className="rounded-xl border border-[#1e293b] bg-[#111827] px-3 py-3"
                  >
                    <div className="font-mono-ui text-sm text-[#f1f5f9]">
                      {challenge.title}
                    </div>
                    <div className="mt-1 text-xs text-[#64748b]">{challenge.code}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        <div className="mt-6">
          <Button
            disabled={creating}
            className="bg-[#7c3aed] hover:bg-[#6d28d9]"
            onClick={async () => {
              const token = auth.session?.access_token;

              if (!token) {
                toast.error("Sign in as an admin to create contests.");
                return;
              }

              if (selectedIds.length === 0) {
                toast.error("Select at least one challenge.");
                return;
              }

              setCreating(true);
              try {
                await apiClient.createContest(
                  {
                    title,
                    description,
                    scheduled_at: new Date(scheduledAt).toISOString(),
                    duration_minutes: Number(duration),
                    challenge_ids: selectedIds,
                    is_public: true,
                  },
                  token,
                );
                toast.success("Contest created.");
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : "Contest creation failed.",
                );
              } finally {
                setCreating(false);
              }
            }}
          >
            {creating ? "Creating..." : "Create Contest"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
