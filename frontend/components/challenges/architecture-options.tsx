"use client";

import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Option = {
  id: "A" | "B" | "C";
  title: string;
  description: string;
};

export function ArchitectureOptions({
  options,
  ranking,
  onRankChange,
}: {
  options: Option[];
  ranking: Record<string, string>;
  onRankChange: (optionId: string, rank: string) => void;
}) {
  const usedRanks = useMemo(() => Object.values(ranking), [ranking]);

  return (
    <div className="space-y-4">
      {options.map((option) => {
        const rank = ranking[option.id];
        return (
          <div
            key={option.id}
            className={cn(
              "surface-card rounded-2xl p-6 transition-all",
              rank === "1" && "border-[#166534]",
              rank === "2" && "border-[#92400e]",
              rank === "3" && "border-[#991b1b]",
            )}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-xs font-mono-ui uppercase tracking-[2px] text-[#64748b]">
                  Option {option.id}
                </div>
                <h3 className="mt-2 text-lg font-semibold font-mono-ui text-[#f1f5f9]">
                  {option.title}
                </h3>
                <p className="mt-2 max-w-3xl text-sm text-[#94a3b8]">
                  {option.description}
                </p>
              </div>
              <Select value={rank} onValueChange={(value) => value && onRankChange(option.id, value)}>
                <SelectTrigger className="w-28 border-[#1e293b] bg-[#0a0f1e] font-mono-ui">
                  <SelectValue placeholder="Rank" />
                </SelectTrigger>
                <SelectContent className="border-[#1e293b] bg-[#0a0f1e] text-[#f1f5f9]">
                  {["1", "2", "3"].map((value) => (
                    <SelectItem
                      key={value}
                      value={value}
                      disabled={usedRanks.includes(value) && ranking[option.id] !== value}
                    >
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      })}
    </div>
  );
}
