"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Flame,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/common/stat-card";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { EmptyState } from "@/components/common/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const quickLinks = [
  {
    href: "/admin/contests/create",
    icon: Flame,
    tint: "bg-[#7c3aed]/10 text-[#a78bfa]",
    title: "Create Contest",
    body: "Schedule the next live arena and publish the shareable link.",
  },
  {
    href: "/admin/contests",
    icon: Trophy,
    tint: "bg-[#eab308]/10 text-[#fbbf24]",
    title: "Manage Contests",
    body: "Review upcoming, active, and completed contests and their leaderboards.",
  },
];

export default function AdminDashboardPage() {
  const auth = useAuth();
  const [stats, setStats] = useState({
    total_users: 0,
    total_submissions: 0,
    active_contests: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .getAdminStats(auth.session?.access_token)
      .then((response) => {
        if (!cancelled) {
          setStats(response.stats);
          setError(null);
        }
      })
      .catch((nextError) => {
        if (!cancelled) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Admin stats could not be loaded.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [auth.session?.access_token]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[2px] text-[#64748b]">
            <ShieldCheck className="size-3.5 text-[#a78bfa]" />
            Admin Dashboard
          </div>
          <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9] md:text-4xl">
            Platform overview
          </h1>
          <p className="mt-2 text-sm text-[#94a3b8]">
            Welcome back, {auth.displayName ?? "Admin"}. Monitor users, submissions, and contests from here.
          </p>
        </div>
        <Link
          href="/admin/contests/create"
          className={cn(
            buttonVariants({ variant: "default" }),
            "bg-[#7c3aed] px-6 shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:bg-[#6d28d9]",
          )}
        >
          <Sparkles className="mr-2 size-4" />
          New Contest
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Users" value={String(stats.total_users)} />
        <StatCard
          label="Submissions"
          value={String(stats.total_submissions)}
          accent="green"
        />
        <StatCard
          label="Active Contests"
          value={String(stats.active_contests)}
          accent="amber"
        />
      </div>

      {error ? (
        <EmptyState
          icon={<ShieldCheck className="size-12" />}
          title="Admin stats unavailable"
          description={error}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="surface-card group rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:border-[#334155]"
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "inline-flex size-11 items-center justify-center rounded-xl",
                  link.tint,
                )}
              >
                <link.icon className="size-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-mono-ui text-base font-semibold text-[#f1f5f9]">
                    {link.title}
                  </div>
                  <ArrowRight className="size-4 text-[#64748b] transition-transform group-hover:translate-x-0.5 group-hover:text-[#a78bfa]" />
                </div>
                <p className="mt-2 text-sm leading-6 text-[#94a3b8]">{link.body}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Card className="surface-card rounded-2xl p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[2px] text-[#64748b]">
          <LayoutDashboard className="size-3.5" />
          Launch Checklist
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            "Supabase seed assets prepared",
            "Voice notes & UI screenshots uploaded",
            "Launch contest scheduled",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-2 rounded-xl border border-[#1e293b] bg-[#0a0f1e] p-4 text-sm text-[#cbd5e1]"
            >
              <span className="mt-0.5 inline-flex size-4 items-center justify-center rounded-full bg-[#052e16] text-[10px] text-[#4ade80]">
                ✓
              </span>
              {item}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
