"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function AnimatedMetric({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;

    let frame = 0;
    const tick = (time: number) => {
      const progress = Math.min(1, (time - start) / duration);
      const next = value * progress;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span>
      {display.toFixed(value % 1 === 0 ? 0 : 1)}
      {suffix}
    </span>
  );
}

export function ScoreDisplay({
  accuracy,
  tokenScore,
  timeLabel,
  combinedScore,
  feedback,
  onTryAgain,
  nextHref,
  percentiles,
  ratingChange,
  showTokenEfficiency = true,
}: {
  accuracy: number;
  tokenScore: number;
  timeLabel: string;
  combinedScore: number;
  feedback: string;
  onTryAgain?: () => void;
  nextHref?: string;
  percentiles?: {
    accuracy?: number | null;
    token?: number | null;
    combined?: number | null;
  };
  ratingChange?: { before: number; after: number; delta: number } | null;
  showTokenEfficiency?: boolean;
}) {
  const cards = [
    {
      label: "Accuracy",
      value: accuracy,
      suffix: "/10",
      percentile: percentiles?.accuracy ?? null,
    },
    ...(showTokenEfficiency
      ? [
          {
            label: "Token Eff.",
            value: tokenScore,
            suffix: "%",
            percentile: percentiles?.token ?? null,
          },
        ]
      : []),
    {
      label: "Time",
      value: Number(timeLabel.replace(/[^\d.]/g, "")),
      suffix: "",
      percentile: null,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      <div className="grid gap-4 lg:grid-cols-[repeat(3,minmax(0,1fr))_1.2fr]">
        {cards.map((card) => (
          <div key={card.label} className="surface-card rounded-2xl p-5">
            <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
              {card.label}
            </div>
            <div className="mt-3 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
              <AnimatedMetric value={card.value} suffix={card.suffix} />
            </div>
            {card.percentile !== null && card.percentile !== undefined ? (
              <div className="mt-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1e293b]">
                  <div
                    className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa]"
                    style={{ width: `${Math.max(2, card.percentile)}%` }}
                  />
                </div>
                <div className="mt-1.5 text-[11px] font-mono-ui text-[#94a3b8]">
                  Better than {card.percentile}% of solvers
                </div>
              </div>
            ) : null}
          </div>
        ))}
        <div className="rounded-2xl border border-[#7c3aed]/30 bg-[#7c3aed]/10 p-5">
          <div className="text-xs uppercase tracking-[2px] text-[#c4b5fd]">
            Combined
          </div>
          <div className="mt-3 text-3xl font-bold font-mono-ui text-white">
            <AnimatedMetric value={combinedScore} suffix=" pts" />
          </div>
          {percentiles?.combined !== null && percentiles?.combined !== undefined ? (
            <div className="mt-2 text-sm text-[#cbd5e1]">
              Top <span className="font-mono-ui text-[#f1f5f9]">{100 - percentiles.combined}%</span> on this challenge
            </div>
          ) : (
            <div className="mt-2 text-sm text-[#cbd5e1]">Leaderboard-ready score</div>
          )}
        </div>
      </div>
      {ratingChange && ratingChange.delta !== 0 ? (
        <div
          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
            ratingChange.delta > 0
              ? "border-[#4ade80]/30 bg-[#4ade80]/5 text-[#bbf7d0]"
              : "border-[#f87171]/30 bg-[#f87171]/5 text-[#fecaca]"
          }`}
        >
          <span>
            Rating: <span className="font-mono-ui">{ratingChange.before}</span>
            <span className="mx-2 text-[#64748b]">→</span>
            <span className="font-mono-ui font-bold">{ratingChange.after}</span>
          </span>
          <span className="font-mono-ui font-bold">
            {ratingChange.delta > 0 ? "+" : ""}
            {ratingChange.delta}
          </span>
        </div>
      ) : null}
      <div className="surface-subtle rounded-2xl p-4 text-sm italic text-[#94a3b8]">
        {feedback}
      </div>
      {onTryAgain || nextHref ? (
        <div className="flex flex-wrap gap-3">
          {onTryAgain ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onTryAgain}
              className="border border-[#1e293b] hover:bg-[#111827]"
            >
              Try Again
            </Button>
          ) : null}
          {nextHref ? (
            <Link
              href={nextHref}
              className={cn(
                buttonVariants({ variant: "default" }),
                "bg-[#7c3aed] hover:bg-[#6d28d9]",
              )}
            >
              Next Challenge
            </Link>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  );
}
