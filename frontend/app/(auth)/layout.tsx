import Link from "next/link";
import { ArrowRight, Bug, GitBranch, Mic, Palette, Sparkles, Zap } from "lucide-react";
import { Logo } from "@/components/layout/logo";

const highlights = [
  { icon: Mic, label: "Spec-to-Prompt", tint: "text-[#a78bfa]" },
  { icon: Zap, label: "Token Golf", tint: "text-[#fbbf24]" },
  { icon: Bug, label: "Bug Fix", tint: "text-[#f87171]" },
  { icon: GitBranch, label: "Architecture Pick", tint: "text-[#60a5fa]" },
  { icon: Palette, label: "UI Reproduction", tint: "text-[#4ade80]" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.22),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.12),transparent_40%)]" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        {/* Left brand panel — hidden on small screens */}
        <div className="hidden flex-col justify-between border-r border-[#1e293b] bg-[#0a0f1e]/40 p-12 backdrop-blur-sm lg:flex">
          <div>
            <Logo />
            <p className="mt-2 text-sm text-[#64748b]">LeetCode for Vibecoders</p>
          </div>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#334155] bg-[#0a0f1e]/60 px-3 py-1 text-xs font-mono-ui text-[#94a3b8]">
              <Sparkles className="size-3.5 text-[#a78bfa]" />
              <span>
                <span className="text-[#a78bfa]">AI-workflow assessments</span> for learners and recruiters
              </span>
            </div>
            <h2 className="mt-6 font-mono-ui text-4xl font-extrabold leading-tight text-[#f1f5f9]">
              Learn to ship with AI, then prove it.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#94a3b8]">
              Practice realistic prompt-first engineering tasks, get rated, or
              build recruiter tests that measure whether candidates can actually
              work with AI.
            </p>

            <div className="mt-8 grid gap-3">
              {highlights.map((h) => (
                <div
                  key={h.label}
                  className="flex items-center gap-3 rounded-xl border border-[#1e293b] bg-[#0a0f1e]/70 px-4 py-3"
                >
                  <h.icon className={`size-4 ${h.tint}`} />
                  <span className="font-mono-ui text-sm text-[#cbd5e1]">
                    {h.label}
                  </span>
                  <ArrowRight className="ml-auto size-3.5 text-[#334155]" />
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-[#64748b]">
            © 2026 VibeForces. Built for the vibes.
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex flex-col items-center justify-center px-4 py-12 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex flex-col items-center lg:hidden">
              <Logo />
              <p className="mt-2 text-sm text-[#64748b]">LeetCode for Vibecoders</p>
            </div>
            {children}
            <div className="mt-6 text-center text-xs text-[#64748b]">
              By continuing you agree to our{" "}
              <Link href="/" className="text-[#94a3b8] hover:text-[#a78bfa]">
                terms
              </Link>{" "}
              and{" "}
              <Link href="/" className="text-[#94a3b8] hover:text-[#a78bfa]">
                privacy
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
