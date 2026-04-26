import Link from "next/link";
import { Flame } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { EmptyState } from "@/components/common/empty-state";

export default async function AdminContestsPage() {
  const contests = await apiClient
    .getContests()
    .then((response) => response.contests)
    .catch(() => []);
  const orderedContests = [...contests].sort(
    (left, right) =>
      new Date(left.scheduled_at).getTime() - new Date(right.scheduled_at).getTime(),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
            Contest Management
          </div>
          <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
            Manage public arenas
          </h1>
        </div>
        <Link
          href="/admin/contests/create"
          className={cn(
            buttonVariants({ variant: "default" }),
            "bg-[#7c3aed] hover:bg-[#6d28d9]",
          )}
        >
          Create Contest
        </Link>
      </div>
      {orderedContests.length === 0 ? (
        <EmptyState
          icon={<Flame className="size-12" />}
          title="No contests yet"
          description="Create the first public arena to open registrations."
        />
      ) : (
        orderedContests.map((contest) => (
          <Link key={contest.id} href={`/admin/contests/${contest.id}`}>
            <Card className="surface-card rounded-2xl p-6 transition hover:border-[#334155]">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-mono-ui text-lg text-[#f1f5f9]">
                    {contest.title}
                  </div>
                  <div className="mt-2 text-sm text-[#94a3b8]">
                    {new Date(contest.scheduled_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    · {contest.duration_minutes} minutes
                  </div>
                </div>
                <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
                  {contest.status}
                </div>
              </div>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
