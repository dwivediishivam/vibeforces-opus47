"use client";

import { useEffect, useState } from "react";

type Line = { kind: "comment" | "prompt" | "code" | "judge" | "rank"; text: string };

const SCRIPT: Line[] = [
  { kind: "comment", text: "// spec-to-prompt" },
  { kind: "prompt", text: "> listen once. capture the real intent." },
  { kind: "code", text: "const prompt = distill(spec).tighten();" },
  { kind: "comment", text: "// token golf" },
  { kind: "code", text: "await gpt41.run(prompt, { maxTokens: 120 });" },
  { kind: "judge", text: "judge.score({ accuracy: 0.94, tokens: 98 })" },
  { kind: "comment", text: "// bug fix" },
  { kind: "code", text: "patch(offByOne).in(fetchUsers);" },
  { kind: "comment", text: "// architecture" },
  { kind: "code", text: "pick({ queue, cache, realtime }).reason();" },
  { kind: "rank", text: "rank ↑  rating +32" },
];

const TONE: Record<Line["kind"], string> = {
  comment: "text-[#475569]",
  prompt: "text-[#a78bfa]",
  code: "text-[#cbd5e1]",
  judge: "text-[#fbbf24]",
  rank: "text-[#4ade80]",
};

export function CodeAnimation() {
  const [visible, setVisible] = useState<Line[]>([]);
  const [partial, setPartial] = useState<{ line: Line; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const run = async () => {
      while (!cancelled) {
        for (let i = 0; i < SCRIPT.length; i += 1) {
          const line = SCRIPT[i];
          for (let c = 1; c <= line.text.length; c += 1) {
            if (cancelled) return;
            setPartial({ line, text: line.text.slice(0, c) });
            await new Promise<void>((resolve) => {
              timer = setTimeout(resolve, 22 + Math.random() * 40);
            });
          }
          if (cancelled) return;
          setVisible((prev) => {
            const next = [...prev, line];
            return next.length > 8 ? next.slice(next.length - 8) : next;
          });
          setPartial(null);
          await new Promise<void>((resolve) => {
            timer = setTimeout(resolve, 320);
          });
        }
        await new Promise<void>((resolve) => {
          timer = setTimeout(resolve, 1400);
        });
        if (cancelled) return;
        setVisible([]);
      }
    };

    run();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]"
    >
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 font-mono text-[11px] leading-7 opacity-[0.18] md:text-xs lg:opacity-[0.22]">
        <div className="mx-auto max-w-5xl">
          {visible.map((line, idx) => (
            <div key={idx} className={TONE[line.kind]}>
              {line.text}
            </div>
          ))}
          {partial ? (
            <div className={TONE[partial.line.kind]}>
              {partial.text}
              <span className="ml-0.5 inline-block h-3 w-[7px] translate-y-[1px] animate-pulse bg-current" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
