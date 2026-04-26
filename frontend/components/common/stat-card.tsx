import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  change,
  accent = "purple",
}: {
  label: string;
  value: string;
  change?: string;
  accent?: "purple" | "green" | "amber";
}) {
  const accentClass =
    accent === "green"
      ? "bg-[#052e16]/60 text-[#4ade80]"
      : accent === "amber"
        ? "bg-[#1c1917] text-[#fbbf24]"
        : "bg-[#7c3aed]/10 text-[#a78bfa]";

  const positive = !change?.startsWith("-");

  return (
    <div className="surface-card rounded-xl p-6 transition-all duration-150 hover:-translate-y-0.5 hover:border-[#334155]">
      <div className={cn("mb-4 inline-flex rounded-lg px-3 py-1 text-xs font-mono-ui", accentClass)}>
        {label}
      </div>
      <div className="text-3xl font-bold font-mono-ui text-[#f1f5f9]">{value}</div>
      {change ? (
        <div
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-xs font-mono-ui",
            positive ? "text-[#4ade80]" : "text-[#f87171]",
          )}
        >
          {positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {change}
        </div>
      ) : null}
    </div>
  );
}
