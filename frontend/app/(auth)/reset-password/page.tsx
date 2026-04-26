"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState<"checking" | "ok" | "missing">("checking");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setReady("missing");
      return;
    }

    // Supabase recovery links land with a hash fragment; supabase-js picks it
    // up automatically and fires a PASSWORD_RECOVERY event. We also check the
    // current session — if we already have one tied to a recovery flow, we're
    // good to show the form.
    let resolved = false;

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        resolved = true;
        setReady("ok");
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        resolved = true;
        setReady("ok");
      }
    });

    const timeout = setTimeout(() => {
      if (!resolved) setReady("missing");
    }, 2500);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase auth is not configured.");

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast.success("Password updated. Redirecting...");
      await supabase.auth.signOut();
      setTimeout(() => router.push("/login"), 800);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="surface-card rounded-[24px] p-8">
      <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[#7c3aed]/10">
        <KeyRound className="size-5 text-[#a78bfa]" />
      </div>
      <h1 className="mt-5 text-2xl font-bold font-mono-ui text-[#f1f5f9]">
        Choose a new password
      </h1>
      <p className="mt-2 text-sm text-[#94a3b8]">
        Pick something at least 8 characters. You&apos;ll be signed back in
        after it updates.
      </p>

      {ready === "checking" ? (
        <div className="mt-8 rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-5 text-sm text-[#94a3b8]">
          Verifying reset link...
        </div>
      ) : ready === "missing" ? (
        <div className="mt-8 rounded-2xl border border-[#92400e]/50 bg-[#1c1917]/40 p-5">
          <div className="font-mono-ui text-sm text-[#fbbf24]">
            ● Link expired or invalid
          </div>
          <p className="mt-2 text-sm leading-6 text-[#fde68a]/80">
            Your reset link is missing or has expired. Request a fresh one to
            continue.
          </p>
          <Link
            href="/forgot-password"
            className="mt-4 inline-flex items-center text-sm text-[#a78bfa] hover:underline"
          >
            Request a new link →
          </Link>
        </div>
      ) : (
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 border-[#1e293b] bg-[#0a0f1e]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input
              id="confirm"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="h-12 border-[#1e293b] bg-[#0a0f1e]"
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="h-12 w-full bg-[#7c3aed] hover:bg-[#6d28d9]"
          >
            {submitting ? "Updating..." : "Update password"}
          </Button>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-[#94a3b8]">
        <Link href="/login" className="hover:text-[#a78bfa]">
          Back to sign in
        </Link>
      </div>
    </Card>
  );
}
