"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { categoryLabels } from "@/lib/data/mock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DifficultyBadge } from "@/components/common/difficulty-badge";
import { ProctoringBanner } from "@/components/common/proctoring-banner";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { ChallengeRecord } from "@shared/types";

export default function CreateTestPage() {
  const auth = useAuth();
  const [catalog, setCatalog] = useState<ChallengeRecord[]>([]);
  const [title, setTitle] = useState("Frontend Developer Assessment");
  const [description, setDescription] = useState(
    "A balanced screening set focused on prompt quality, debugging, and UI instincts.",
  );
  const [timeLimit, setTimeLimit] = useState("60");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [createdLink, setCreatedLink] = useState("");
  const [creating, setCreating] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
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
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingCatalog(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const available = useMemo(
    () =>
      catalog.filter(
        (challenge) =>
          (category === "all" || challenge.category === category) &&
          (difficulty === "all" || challenge.difficulty === difficulty),
      ),
    [catalog, category, difficulty],
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
          Create a Test
        </div>
        <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
          Build a candidate-ready challenge pack
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#94a3b8]">
          Trial recruiter accounts can create 3 tests and collect up to 10
          candidate attempts per test. Upgrade from the hire page when you need
          more volume or custom questions.
        </p>
      </div>

      <Card className="surface-card rounded-2xl p-6">
        <div className="grid gap-4 md:grid-cols-[1fr_200px]">
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
              placeholder="Short description"
            />
          </div>
          <Select value={timeLimit} onValueChange={(value) => value && setTimeLimit(value)}>
            <SelectTrigger className="h-12 border-[#1e293b] bg-[#0a0f1e] font-mono-ui">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-[#1e293b] bg-[#0a0f1e] text-[#f1f5f9]">
              {["30", "60", "90", "120"].map((value) => (
                <SelectItem key={value} value={value}>
                  {value} minutes
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div className="flex gap-3">
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
              <Select value={difficulty} onValueChange={(value) => value && setDifficulty(value)}>
                <SelectTrigger className="border-[#1e293b] bg-[#0a0f1e]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#1e293b] bg-[#0a0f1e] text-[#f1f5f9]">
                  <SelectItem value="all">All Difficulty</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Card className="surface-subtle rounded-2xl p-4">
              <div className="text-sm font-mono-ui text-[#f1f5f9]">
                Available ({available.length})
              </div>
              <div className="mt-3 space-y-2">
                {loadingCatalog ? (
                  <div className="rounded-xl border border-[#1e293b] bg-[#111827] px-3 py-6 text-sm text-[#94a3b8]">
                    Loading challenge catalog...
                  </div>
                ) : catalogError ? (
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
                      className="flex w-full items-center justify-between rounded-xl border border-[#1e293b] bg-[#111827] px-3 py-3 text-left"
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
                          {categoryLabels[challenge.category]}
                        </div>
                      </div>
                      <DifficultyBadge difficulty={challenge.difficulty} />
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>

          <Card className="surface-subtle rounded-2xl p-4">
            <div className="text-sm font-mono-ui text-[#f1f5f9]">
              Selected ({selectedIds.length})
            </div>
            <div className="mt-3 space-y-2">
              {selectedIds.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#334155] p-6 text-sm text-[#64748b]">
                  Click challenges on the left to add them here.
                </div>
              ) : (
                selectedIds.map((id) => {
                  const challenge = catalog.find((item) => item.id === id)!;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between rounded-xl border border-[#1e293b] bg-[#111827] px-3 py-3"
                    >
                      <div className="font-mono-ui text-sm text-[#f1f5f9]">
                        {challenge.title}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setSelectedIds((current) => current.filter((item) => item !== id))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <ProctoringBanner />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            disabled={creating}
            className="bg-[#7c3aed] hover:bg-[#6d28d9]"
            onClick={async () => {
              if (selectedIds.length === 0) {
                toast.error("Select at least one challenge.");
                return;
              }

              const token = auth.session?.access_token;
              if (!token) {
                toast.error("Sign in as a recruiter to create a live test.");
                return;
              }

              setCreating(true);
              try {
                const response = (await apiClient.createTest(
                  {
                    title,
                    description,
                    challenge_ids: selectedIds,
                    time_limit_minutes: Number(timeLimit),
                    proctoring_enabled: false,
                  },
                  token,
                )) as {
                  test: {
                    share_code: string;
                  };
                };

                const appUrl = window.location.origin;
                setCreatedLink(`${appUrl.replace(/\/$/, "")}/test/${response.test.share_code}`);
                toast.success("Recruiter test created.");
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Unable to create the recruiter test.",
                );
              } finally {
                setCreating(false);
              }
            }}
          >
            {creating ? "Creating..." : "Create Test & Get Link"}
          </Button>
          {createdLink ? (
            <div className="text-sm text-[#94a3b8]">{createdLink}</div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
