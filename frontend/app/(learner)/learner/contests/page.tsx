import Link from "next/link";
import { ArrowRight, CalendarClock, Flame, Lock, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { CountdownTimer } from "@/components/common/countdown-timer";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContestsPage() {
  const { contests } = await apiClient.getContests();
  const upcoming = contests.filter((contest) => contest.status !== "completed");
  const past = contests.filter((contest) => contest.status === "completed");

  return (
    <div className="space-y-10">
      <div>
        <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
          Contests
        </div>
        <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9] md:text-4xl">
          Upcoming and live arenas
        </h1>
        <p className="mt-2 text-sm text-[#94a3b8]">
          Timed, proctored (soon), public — prove your rank in real conditions.
        </p>
      </div>

      <section className="space-y-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[2px] text-[#64748b]">
          <span className="inline-block size-1.5 animate-pulse rounded-full bg-[#a78bfa]" />
          Upcoming
        </div>
        {upcoming.length === 0 ? (
          <Card className="surface-card rounded-2xl p-10 text-center text-sm text-[#94a3b8]">
            No contests scheduled yet. New public arenas will appear here when they open.
          </Card>
        ) : null}
        {upcoming.map((contest) => (
          <Card
            key={contest.id}
            className="surface-card relative overflow-hidden rounded-2xl border-l-4 border-l-[#7c3aed] p-6 md:p-8"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[#7c3aed]/10 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#7c3aed]/30 bg-[#7c3aed]/10 px-3 py-1 text-xs font-mono-ui text-[#a78bfa]">
                  <Flame className="size-3.5" />
                  Public contest
                </div>
                <div className="mt-4 font-mono-ui text-2xl font-bold text-[#f1f5f9] md:text-3xl">
                  {contest.title}
                </div>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#94a3b8]">
                  {contest.description}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono-ui text-xs text-[#64748b]">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock className="size-3.5" />
                    {new Date(contest.scheduled_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                  <span>{contest.duration_minutes} min</span>
                  <span>{contest.challenge_ids.length} challenges</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="size-3.5" />
                    Proctoring: Coming Soon
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3 lg:items-end">
                <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
                  Starts in
                </div>
                <CountdownTimer
                  targetDate={contest.scheduled_at}
                  className="font-mono-ui text-3xl font-bold text-[#a78bfa]"
                />
                <Link
                  href={`/learner/contests/${contest.id}`}
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "bg-[#7c3aed] px-6 shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:bg-[#6d28d9]",
                  )}
                >
                  Register
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </section>

      {past.length > 0 ? (
        <section className="space-y-5">
          <div className="text-xs uppercase tracking-[2px] text-[#64748b]">Past</div>
          {past.map((contest) => (
            <Card
              key={contest.id}
              className="surface-card rounded-2xl p-6 opacity-70"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono-ui text-lg text-[#f1f5f9]">
                    {contest.title}
                  </div>
                  <div className="mt-1 text-xs text-[#64748b]">
                    {new Date(contest.scheduled_at).toLocaleDateString()}
                  </div>
                </div>
                <Link
                  href={`/learner/contests/${contest.id}`}
                  className="inline-flex items-center gap-1 text-xs font-mono-ui text-[#94a3b8] hover:text-[#a78bfa]"
                >
                  View Results <ArrowRight className="size-3" />
                </Link>
              </div>
            </Card>
          ))}
        </section>
      ) : (
        <section className="space-y-5">
          <div className="text-xs uppercase tracking-[2px] text-[#64748b]">Past</div>
          <Card className="surface-card flex flex-col items-center rounded-2xl p-10 text-center">
            <Users className="size-10 text-[#334155]" />
            <div className="mt-4 font-mono-ui text-sm text-[#f1f5f9]">
              No past contests yet
            </div>
            <div className="mt-2 text-xs text-[#64748b]">
              Completed contest results will appear here.
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
