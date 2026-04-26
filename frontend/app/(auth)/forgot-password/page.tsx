"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email) return;
    setSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error("Supabase auth is not configured for this environment.");
      }

      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) throw error;

      setSent(true);
      toast.success("Check your inbox for the reset link.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to send reset email.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="surface-card rounded-[24px] p-8">
      <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[#7c3aed]/10">
        <Mail className="size-5 text-[#a78bfa]" />
      </div>
      <h1 className="mt-5 text-2xl font-bold font-mono-ui text-[#f1f5f9]">
        Reset your password
      </h1>
      <p className="mt-2 text-sm text-[#94a3b8]">
        Enter the email on your account and we&apos;ll send a secure link to
        choose a new password.
      </p>

      {sent ? (
        <div className="mt-8 rounded-2xl border border-[#166534]/50 bg-[#052e16]/30 p-5">
          <div className="font-mono-ui text-sm text-[#4ade80]">
            ● Email sent
          </div>
          <p className="mt-2 text-sm leading-6 text-[#bbf7d0]/80">
            We sent a password reset link to{" "}
            <span className="font-mono-ui text-[#f1f5f9]">{email}</span>. The
            link expires in 1 hour.
          </p>
          <p className="mt-3 text-xs text-[#94a3b8]">
            Didn&apos;t receive it? Check your spam folder, or{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-[#a78bfa] hover:underline"
            >
              try a different email
            </button>
            .
          </p>
        </div>
      ) : (
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 border-[#1e293b] bg-[#0a0f1e]"
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="h-12 w-full bg-[#7c3aed] hover:bg-[#6d28d9]"
          >
            {submitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[#94a3b8] hover:text-[#a78bfa]"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
      </div>
    </Card>
  );
}
