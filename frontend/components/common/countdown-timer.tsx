"use client";

import { useEffect, useMemo, useState } from "react";

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export function CountdownTimer({
  targetDate,
  className,
  onExpire,
}: {
  targetDate: string;
  className?: string;
  onExpire?: () => void;
}) {
  const target = useMemo(() => new Date(targetDate).getTime(), [targetDate]);
  const [remaining, setRemaining] = useState(target - Date.now());

  useEffect(() => {
    const interval = setInterval(() => setRemaining(target - Date.now()), 1000);
    return () => clearInterval(interval);
  }, [target]);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.();
    }
  }, [onExpire, remaining]);

  return (
    <div className={className}>
      <span className={remaining < 5 * 60 * 1000 ? "animate-pulse text-[#f87171]" : ""}>
        {formatRemaining(remaining)}
      </span>
    </div>
  );
}
