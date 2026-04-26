import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-end gap-0 text-xl font-extrabold tracking-tight font-mono-ui",
        className,
      )}
    >
      <span className="text-[#f1f5f9]">Vibe</span>
      <span className="text-[#a78bfa] transition hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">
        Forces
      </span>
    </Link>
  );
}
