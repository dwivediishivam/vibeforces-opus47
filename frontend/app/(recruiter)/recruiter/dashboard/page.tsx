"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BriefcaseBusiness } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/common/stat-card";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { RecruiterTestRecord } from "@shared/types";
import { EmptyState } from "@/components/common/empty-state";

export default function RecruiterDashboardPage() {
  const auth = useAuth();
  const [tests, setTests] = useState<RecruiterTestRecord[]>([]);
  const [stats, setStats] = useState({
    candidates_tested: 0,
    completed_attempts: 0,
    avg_score: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .getRecruiterTests(auth.session?.access_token)
      .then((response) => {
        if (!cancelled) {
          setTests(response.tests);
          setStats(response.stats);
          setError(null);
        }
      })
      .catch((nextError) => {
        if (!cancelled) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Recruiter tests could not be loaded.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [auth.session?.access_token]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
            Recruiter Dashboard
          </div>
          <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
            Assess vibe coders with role-ready test packs
          </h1>
        </div>
        <Link
          href="/recruiter/create-test"
          className={cn(
            buttonVariants({ variant: "default" }),
            "bg-[#7c3aed] hover:bg-[#6d28d9]",
          )}
        >
          + Create Test
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Tests Created" value={String(tests.length)} />
        <StatCard
          label="Candidates Tested"
          value={String(stats.candidates_tested)}
          accent="green"
        />
        <StatCard
          label="Avg Score"
          value={stats.avg_score.toFixed(1)}
          accent="amber"
        />
      </div>

      <Card className="surface-card rounded-2xl p-6">
        <div className="text-lg font-semibold font-mono-ui text-[#f1f5f9]">
          Your Tests
        </div>
        <div className="mt-4 space-y-3">
          {error ? (
            <EmptyState
              icon={<BriefcaseBusiness className="size-12" />}
              title="Recruiter dashboard unavailable"
              description={error}
            />
          ) : tests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#334155] bg-[#0a0f1e] p-6 text-sm text-[#64748b]">
              No recruiter tests yet. Create one to start collecting live candidate scores.
            </div>
          ) : (
            tests.map((test) => (
              <Link
                key={test.id}
                href={`/recruiter/tests/${test.id}`}
                className="flex items-center justify-between rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-4 transition hover:border-[#334155]"
              >
                <div>
                  <div className="font-mono-ui text-[#f1f5f9]">{test.title}</div>
                  <div className="mt-1 text-sm text-[#94a3b8]">
                    {test.challenge_ids.length} challenges · {test.time_limit_minutes} min
                  </div>
                </div>
                <div className="text-xs font-mono-ui uppercase tracking-[2px] text-[#a78bfa]">
                  Open
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
