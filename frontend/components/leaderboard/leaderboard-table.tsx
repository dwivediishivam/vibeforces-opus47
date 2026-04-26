import { Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Entry = {
  rank: number;
  username: string;
  display_name: string;
  total_score: number;
  avg_accuracy: number;
  avg_token_efficiency: number;
  challenges_solved: number;
  isCurrentUser?: boolean;
};

function avatarClass(rank: number) {
  if (rank === 1) return "bg-[linear-gradient(135deg,#fbbf24,#d97706)]";
  if (rank === 2) return "bg-[linear-gradient(135deg,#d1d5db,#9ca3af)]";
  if (rank === 3) return "bg-[linear-gradient(135deg,#d97706,#92400e)]";
  return "bg-[#475569]";
}

export function LeaderboardTable({ entries }: { entries: Entry[] }) {
  return (
    <div className="surface-card overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-[#334155] hover:bg-transparent">
              <TableHead className="font-mono-ui uppercase tracking-[1px] text-[#64748b]">
                Rank
              </TableHead>
              <TableHead className="font-mono-ui uppercase tracking-[1px] text-[#64748b]">
                User
              </TableHead>
              <TableHead className="font-mono-ui uppercase tracking-[1px] text-[#64748b]">
                Score
              </TableHead>
              <TableHead className="font-mono-ui uppercase tracking-[1px] text-[#64748b]">
                Accuracy
              </TableHead>
              <TableHead className="font-mono-ui uppercase tracking-[1px] text-[#64748b]">
                Tokens
              </TableHead>
              <TableHead className="font-mono-ui uppercase tracking-[1px] text-[#64748b]">
                Solved
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow
                key={`${entry.rank}-${entry.username}`}
                className={cn(
                  "border-[#334155] hover:bg-[#1e293b]",
                  entry.isCurrentUser && "bg-[#7c3aed]/5",
                )}
              >
                <TableCell
                  className={cn(
                    "font-mono-ui font-bold",
                    entry.rank === 1 && "text-[#fbbf24]",
                    entry.rank === 2 && "text-[#d1d5db]",
                    entry.rank === 3 && "text-[#b45309]",
                    entry.rank > 3 && "text-[#94a3b8]",
                  )}
                >
                  #{entry.rank}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded-full text-xs font-semibold text-white",
                        avatarClass(entry.rank),
                      )}
                    >
                      {entry.display_name
                        .split(" ")
                        .map((word) => word[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.isCurrentUser ? (
                        <Star className="size-3.5 fill-[#a78bfa] text-[#a78bfa]" />
                      ) : null}
                      <span>{entry.display_name}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono-ui font-bold text-[#a78bfa]">
                  {entry.total_score.toLocaleString()}
                </TableCell>
                <TableCell className="font-mono-ui text-[#94a3b8]">
                  {entry.avg_accuracy.toFixed(1)}%
                </TableCell>
                <TableCell className="font-mono-ui text-[#94a3b8]">
                  {entry.avg_token_efficiency.toFixed(1)}%
                </TableCell>
                <TableCell className="font-mono-ui text-[#94a3b8]">
                  {entry.challenges_solved}/30
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
