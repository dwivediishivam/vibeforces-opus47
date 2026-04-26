"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  GitBranch,
  LayoutDashboard,
  Palette,
  Settings,
  Swords,
  Trophy,
  User,
  Bug,
  Mic,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

type Role = "learner" | "recruiter" | "admin";

const navByRole: Record<Role, Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }>> = {
  learner: [
    { href: "/learner/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/learner/challenges", label: "Challenges", icon: Swords },
    { href: "/learner/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/learner/contests", label: "Contests", icon: Flame },
  ],
  recruiter: [
    { href: "/recruiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/recruiter/create-test", label: "Create Test", icon: Swords },
    { href: "/recruiter/tests", label: "Tests", icon: Trophy },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/contests", label: "Contests", icon: Flame },
    { href: "/admin/contests/create", label: "Create Contest", icon: Trophy },
  ],
};

const challengeLegend = [
  { label: "Spec", icon: Mic },
  { label: "Token", icon: Zap },
  { label: "Bug", icon: Bug },
  { label: "Arch", icon: GitBranch },
  { label: "UI", icon: Palette },
];

function SidebarLink({
  href,
  label,
  icon: Icon,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl border-l-[3px] px-3 py-2.5 text-sm font-mono-ui transition-all duration-150",
        active
          ? "border-[#7c3aed] bg-[#7c3aed]/10 font-semibold text-[#a78bfa]"
          : "border-transparent text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#f1f5f9]",
      )}
    >
      <Icon className="size-4" />
      <span>{label}</span>
      {badge ? (
        <span className="ml-auto rounded-full bg-[#7c3aed] px-2 py-0.5 text-[11px] text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function SidebarContent({
  role,
  mobile = false,
}: {
  role: Role;
  mobile?: boolean;
}) {
  const auth = useAuth();
  const [challengeCount, setChallengeCount] = useState<number | null>(null);

  useEffect(() => {
    if (role !== "learner") return;
    let cancelled = false;
    apiClient
      .getChallenges()
      .then((response) => {
        if (!cancelled) setChallengeCount(response.challenges?.length ?? null);
      })
      .catch(() => {
        if (!cancelled) setChallengeCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [role]);

  const items = navByRole[role].map((item) =>
    item.href === "/learner/challenges" && challengeCount != null
      ? { ...item, badge: String(challengeCount) }
      : item,
  );

  return (
    <div className="flex h-full flex-col bg-[#0a0f1e] p-4">
      {mobile ? <Logo className="mb-6 px-2" /> : null}
      <div className="mb-3 px-3 text-[11px] uppercase tracking-[2px] text-[#64748b]">
        Main
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <SidebarLink key={item.href} {...item} />
        ))}
      </nav>

      <Separator className="my-5 bg-[#1e293b]" />

      {role === "learner" ? (
        <div className="space-y-2">
          <div className="px-3 text-[11px] uppercase tracking-[2px] text-[#64748b]">
            Categories
          </div>
          <div className="grid grid-cols-2 gap-2 px-1">
            {challengeLegend.map(({ label, icon: Icon }) => (
              <div key={label} className="surface-subtle flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#94a3b8]">
                <Icon className="size-3.5 text-[#a78bfa]" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-auto">
        <Separator className="mb-4 bg-[#1e293b]" />
        <div className="surface-card rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-[#1e293b] font-mono-ui text-sm text-[#f1f5f9]">
              {(auth.displayName ?? "VF").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm text-[#f1f5f9]">
                {auth.displayName}
              </div>
              <div className="truncate text-xs text-[#64748b]">
                {auth.session?.user.email ?? `${role}@vibeforces.dev`}
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <SidebarLink href="/" label="Profile" icon={User} />
            <SidebarLink href="/" label="Settings" icon={Settings} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 border-r border-[#1e293b] bg-[#0a0f1e] lg:block">
      <SidebarContent role={role} />
    </aside>
  );
}
