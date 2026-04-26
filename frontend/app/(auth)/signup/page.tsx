"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const roles = [
  {
    value: "learner" as const,
    title: "I want to practice",
    subtitle: "Solve challenges, climb the rating leaderboard",
  },
  {
    value: "recruiter" as const,
    title: "I want to hire",
    subtitle: "Send candidates a timed AI-coding test",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const [role, setRole] = useState<"learner" | "recruiter">("learner");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("role") === "recruiter") setRole("recruiter");
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const result = await auth.signUp({
        email,
        password,
        username,
        displayName,
        role,
      });

      if (result.requiresEmailConfirmation) {
        setConfirmationEmail(result.email);
        toast.success("Check your inbox to confirm the account, then sign in.");
        return;
      }

      toast.success("Account created.");
      router.push(role === "recruiter" ? "/recruiter/dashboard" : "/learner/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create the account.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmationEmail) {
    return (
      <Card className="surface-card rounded-[24px] p-8">
        <h1 className="text-2xl font-bold font-mono-ui text-[#f1f5f9]">
          Confirm your email
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
          We sent a confirmation link to <span className="text-[#f1f5f9]">{confirmationEmail}</span>.
          Open that email, confirm the account, and then sign in here.
        </p>
        <Button
          type="button"
          className="mt-6 h-12 w-full bg-[#7c3aed] hover:bg-[#6d28d9]"
          onClick={() => router.push("/login")}
        >
          Go to Login
        </Button>
      </Card>
    );
  }

  return (
    <Card className="surface-card rounded-[24px] p-8">
      <h1 className="text-2xl font-bold font-mono-ui text-[#f1f5f9]">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-[#94a3b8]">
        Create a learner account to practice, or a recruiter trial to send
        role-ready AI-workflow tests.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {roles.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setRole(item.value)}
            className={cn(
              "rounded-2xl border p-4 text-left transition-all",
              role === item.value
                ? "border-[#7c3aed] bg-[#7c3aed]/10"
                : "border-[#1e293b] bg-[#0a0f1e]",
            )}
          >
            <div className="font-mono-ui text-sm text-[#f1f5f9]">{item.title}</div>
            <div className="mt-1 text-xs text-[#94a3b8]">{item.subtitle}</div>
          </button>
        ))}
      </div>
      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="h-12 border-[#1e293b] bg-[#0a0f1e]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="display-name">Display Name</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="h-12 border-[#1e293b] bg-[#0a0f1e]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 border-[#1e293b] bg-[#0a0f1e]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 border-[#1e293b] bg-[#0a0f1e]"
          />
        </div>
        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full bg-[#7c3aed] hover:bg-[#6d28d9]"
        >
          {submitting ? "Creating..." : "Create Account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[#94a3b8]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#a78bfa]">
          Log in
        </Link>
      </p>
    </Card>
  );
}
