import { Badge } from "@/components/ui/badge";

export function DifficultyBadge({
  difficulty,
}: {
  difficulty: "easy" | "medium" | "hard";
}) {
  const classes =
    difficulty === "easy"
      ? "border-[#166534] bg-[#052e16] text-[#4ade80]"
      : difficulty === "medium"
        ? "border-[#92400e] bg-[#1c1917] text-[#fbbf24]"
        : "border-[#991b1b] bg-[#1c1917] text-[#f87171]";

  return (
    <Badge className={`font-mono-ui text-xs ${classes}`}>{difficulty}</Badge>
  );
}
