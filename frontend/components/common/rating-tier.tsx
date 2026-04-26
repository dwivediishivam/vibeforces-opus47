// Codeforces-inspired rating color tiers.

export type Tier = {
  name: string;
  color: string;
  min: number;
};

export const tiers: Tier[] = [
  { name: "Newbie", color: "#94a3b8", min: 0 },
  { name: "Pupil", color: "#4ade80", min: 1200 },
  { name: "Specialist", color: "#22d3ee", min: 1400 },
  { name: "Expert", color: "#60a5fa", min: 1600 },
  { name: "Candidate Master", color: "#a78bfa", min: 1900 },
  { name: "Master", color: "#f59e0b", min: 2100 },
  { name: "Grandmaster", color: "#ef4444", min: 2400 },
];

export function tierFor(rating: number): Tier {
  let current = tiers[0];
  for (const tier of tiers) {
    if (rating >= tier.min) current = tier;
  }
  return current;
}

export function UserRatingBadge({
  rating,
  showName = true,
  className = "",
}: {
  rating: number;
  showName?: boolean;
  className?: string;
}) {
  const tier = tierFor(rating);
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 font-mono-ui text-xs ${className}`}
      style={{
        borderColor: `${tier.color}55`,
        backgroundColor: `${tier.color}15`,
        color: tier.color,
      }}
      title={`${tier.name} — ${rating}`}
    >
      <span className="font-bold">{rating}</span>
      {showName ? <span className="opacity-80">{tier.name}</span> : null}
    </span>
  );
}
