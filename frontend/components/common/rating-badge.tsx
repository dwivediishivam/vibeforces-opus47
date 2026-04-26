import { Badge } from "@/components/ui/badge";

function getRatingColor(rating: number) {
  if (rating < 1200) return "text-[#94a3b8]";
  if (rating < 1400) return "text-[#4ade80]";
  if (rating < 1600) return "text-[#60a5fa]";
  if (rating < 1900) return "text-[#a78bfa]";
  return "text-[#fbbf24]";
}

export function RatingBadge({ rating }: { rating: number }) {
  return (
    <Badge className={`border-[#1e293b] bg-[#0a0f1e] font-mono-ui ${getRatingColor(rating)}`}>
      {rating}
    </Badge>
  );
}
