"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { UserRatingBadge } from "@/components/common/rating-tier";

function dashboardHref(role: string | null) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "recruiter") return "/recruiter/dashboard";
  return "/learner/dashboard";
}

export function HeaderAuthCta() {
  const auth = useAuth();
  if (auth.loading) return <div className="h-9 w-32" />;

  if (auth.isAuthenticated) {
    const rating = auth.profile?.rating ?? 1200;
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-xs font-mono-ui text-[#94a3b8] sm:inline">
          {auth.displayName}
        </span>
        {auth.profile?.role === "learner" ? (
          <UserRatingBadge rating={rating} showName={false} className="hidden sm:inline-flex" />
        ) : null}
        <Link
          href={dashboardHref(auth.role)}
          className={cn(
            buttonVariants({ variant: "default" }),
            "bg-[#7c3aed] hover:bg-[#6d28d9]",
          )}
        >
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "text-[#cbd5e1] hover:text-white",
        )}
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className={cn(
          buttonVariants({ variant: "default" }),
          "bg-[#7c3aed] shadow-[0_0_24px_rgba(124,58,237,0.35)] hover:bg-[#6d28d9]",
        )}
      >
        Sign up
      </Link>
    </div>
  );
}

export function HeroAuthCta() {
  const auth = useAuth();
  if (auth.isAuthenticated) {
    return (
      <Link
        href={dashboardHref(auth.role)}
        className={cn(
          "inline-flex items-center justify-center text-base h-11 px-8 rounded-md font-medium",
          "bg-[#7c3aed] shadow-[0_0_40px_rgba(124,58,237,0.35)] hover:bg-[#6d28d9] text-white",
        )}
      >
        Continue practicing
        <ArrowRight className="ml-2 size-4" />
      </Link>
    );
  }
  return (
    <Link
      href="/signup"
      className={cn(
        "inline-flex items-center justify-center text-base h-11 px-8 rounded-md font-medium",
        "bg-[#7c3aed] shadow-[0_0_40px_rgba(124,58,237,0.35)] hover:bg-[#6d28d9] text-white",
      )}
    >
      Start practicing
      <ArrowRight className="ml-2 size-4" />
    </Link>
  );
}
