"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/useAuth";

export function TopNav({
  role,
}: {
  role?: "learner" | "recruiter" | "admin";
}) {
  const auth = useAuth();
  const router = useRouter();

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-[#1e293b] bg-[#030712]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          {role ? (
            <Sheet>
              <SheetTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="border border-[#1e293b] lg:hidden"
                >
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="border-[#1e293b] bg-[#0a0f1e] p-0">
                <SidebarContent role={role} mobile />
              </SheetContent>
            </Sheet>
          ) : null}
          <Logo />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="border border-transparent hover:border-[#1e293b]">
            <Bell className="size-4 text-[#94a3b8]" />
          </Button>
          {auth.loading ? (
            <div className="h-10 w-36 rounded-full border border-[#1e293b] bg-[#111827]" />
          ) : !auth.isAuthenticated ? (
            <Button
              variant="ghost"
              className="rounded-full border border-[#1e293b] bg-[#111827] px-4 text-[#cbd5e1]"
              onClick={() => router.push("/login")}
            >
              Sign in
            </Button>
          ) : (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" className="gap-2 rounded-full border border-[#1e293b] bg-[#111827] px-3">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#1e293b] font-mono-ui text-xs text-[#f1f5f9]">
                  {(auth.displayName ?? "VF").slice(0, 2).toUpperCase()}
                </span>
                <span className="hidden text-sm text-[#cbd5e1] md:inline">
                  {auth.displayName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-[#1e293b] bg-[#0a0f1e] text-[#cbd5e1]">
              <DropdownMenuItem className="gap-2" onClick={() => router.push("/")}>
                <User className="size-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 text-[#f87171]"
                onClick={() => auth.signOut().catch(() => null)}
              >
                <LogOut className="size-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
