"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowRight, Building2, CheckCircle2, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

const proofPoints = [
  "Candidates can use AI anywhere. VibeForces tests whether they can use it well.",
  "Prompt quality, debugging precision, architectural judgment, token discipline, and UI reproduction are measured separately.",
  "Use it alongside DSA, take-home, and interview loops. It is an add-on signal, not a replacement for your hiring process.",
];

const pricing = [
  {
    title: "Trial",
    price: "Free",
    body: "Create up to 3 tests from existing questions. Each test accepts up to 10 candidates.",
  },
  {
    title: "Existing Question Bank",
    price: "$10",
    body: "Run a test for up to 50 candidates, then $0.50 per additional candidate.",
  },
  {
    title: "Custom Questions",
    price: "$100/question",
    body: "Our experts design company-specific AI-workflow questions, plus candidate-based pricing.",
  },
  {
    title: "Enterprise",
    price: "Custom",
    body: "For 2,500+ candidates, bulk pricing, integrations, custom reporting, and procurement support.",
  },
];

export default function HirePage() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    expected_candidates: "",
    plan_interest: "trial",
    needs_custom_questions: false,
    message: "",
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.createHireLead({
        ...form,
        expected_candidates: form.expected_candidates
          ? Number(form.expected_candidates)
          : undefined,
      });
      toast.success("Request received. We will follow up.");
      setForm({
        company_name: "",
        contact_name: "",
        email: "",
        phone: "",
        expected_candidates: "",
        plan_interest: "trial",
        needs_custom_questions: false,
        message: "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#030712]">
      <header className="sticky top-0 z-50 border-b border-[#1e293b]/70 bg-[#030712]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/" className="text-sm font-mono-ui text-[#94a3b8] hover:text-white">
              Product
            </Link>
            <Link
              href="/signup?role=recruiter"
              className={cn(buttonVariants(), "bg-[#7c3aed] hover:bg-[#6d28d9]")}
            >
              Create trial
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 py-24 lg:px-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[32rem] max-w-5xl rounded-full bg-[#7c3aed]/20 blur-[160px]" />
          <div className="relative mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#334155] bg-[#0a0f1e]/70 px-4 py-1.5 text-xs font-mono-ui text-[#94a3b8]">
                <Sparkles className="size-3.5 text-[#a78bfa]" />
                Hiring signal for AI-assisted engineering
              </div>
              <h1 className="hero-gradient mt-7 text-5xl font-extrabold tracking-tight md:text-7xl">
                Stop only testing code people will ask AI to write anyway.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#cbd5e1]">
                If your team expects developers to build with AI, your hiring loop
                should test whether candidates can direct AI clearly, debug its
                output, make trade-offs, and ship reliable work.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/signup?role=recruiter"
                  className={cn(buttonVariants({ size: "lg" }), "bg-[#7c3aed] px-8 hover:bg-[#6d28d9]")}
                >
                  Create a recruiter trial
                  <ArrowRight className="ml-2 size-4" />
                </Link>
                <a
                  href="#contact"
                  className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-[#334155] bg-transparent px-8 text-white hover:bg-[#111827]")}
                >
                  Talk to us
                </a>
              </div>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {proofPoints.map((point) => (
                <Card key={point} className="surface-card rounded-2xl p-5">
                  <CheckCircle2 className="size-5 text-[#4ade80]" />
                  <p className="mt-4 text-sm leading-6 text-[#94a3b8]">{point}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-5 md:grid-cols-3">
              <Card className="surface-card rounded-2xl p-6">
                <Users className="size-6 text-[#a78bfa]" />
                <h2 className="mt-5 font-mono-ui text-xl font-bold text-white">What you measure</h2>
                <p className="mt-3 text-sm leading-7 text-[#94a3b8]">
                  Prompt clarity, output correctness, token efficiency, debugging
                  specificity, architecture judgment, speed, and candidate prompt history.
                </p>
              </Card>
              <Card className="surface-card rounded-2xl p-6">
                <ShieldCheck className="size-6 text-[#a78bfa]" />
                <h2 className="mt-5 font-mono-ui text-xl font-bold text-white">How it fits hiring</h2>
                <p className="mt-3 text-sm leading-7 text-[#94a3b8]">
                  Add VibeForces after resume screen or before final interviews.
                  It complements DSA and system design by testing AI-native workflow.
                </p>
              </Card>
              <Card className="surface-card rounded-2xl p-6">
                <Building2 className="size-6 text-[#a78bfa]" />
                <h2 className="mt-5 font-mono-ui text-xl font-bold text-white">What recruiters get</h2>
                <p className="mt-3 text-sm leading-7 text-[#94a3b8]">
                  Build a timed test, send one link, and review scores, attempts,
                  prompt behavior, and challenge-by-challenge performance.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-[3px] text-[#64748b]">Pricing</div>
              <h2 className="mt-3 font-mono-ui text-3xl font-bold text-white">
                Start small. Scale when the signal works.
              </h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {pricing.map((item) => (
                <Card key={item.title} className="surface-card rounded-2xl p-6">
                  <div className="text-sm font-mono-ui text-[#a78bfa]">{item.title}</div>
                  <div className="mt-3 font-mono-ui text-3xl font-bold text-white">{item.price}</div>
                  <p className="mt-4 text-sm leading-6 text-[#94a3b8]">{item.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="px-4 py-24 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="text-xs uppercase tracking-[3px] text-[#64748b]">Contact</div>
              <h2 className="mt-3 font-mono-ui text-3xl font-bold text-white">
                Need paid access, custom questions, or enterprise volume?
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#94a3b8]">
                Send your hiring volume and requirements. We store the request
                securely so the VibeForces team can follow up with pricing and setup.
              </p>
            </div>
            <Card className="surface-card rounded-2xl p-6">
              <form className="grid gap-4" onSubmit={submit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input required placeholder="Company name" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
                  <Input required placeholder="Your name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
                  <Input required type="email" placeholder="Work email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <Input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  <Input type="number" min="1" placeholder="Expected candidates" value={form.expected_candidates} onChange={(e) => setForm({ ...form, expected_candidates: e.target.value })} />
                  <Input placeholder="Plan interest" value={form.plan_interest} onChange={(e) => setForm({ ...form, plan_interest: e.target.value })} />
                </div>
                <label className="flex items-center gap-3 rounded-xl border border-[#1e293b] bg-[#0a0f1e] px-4 py-3 text-sm text-[#cbd5e1]">
                  <input
                    type="checkbox"
                    checked={form.needs_custom_questions}
                    onChange={(e) => setForm({ ...form, needs_custom_questions: e.target.checked })}
                    className="accent-[#7c3aed]"
                  />
                  We want custom company-specific questions.
                </label>
                <Textarea
                  placeholder="Tell us about roles, candidate volume, timeline, integrations, or custom assessment needs."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="min-h-32"
                />
                <Button disabled={submitting} className="bg-[#7c3aed] hover:bg-[#6d28d9]">
                  {submitting ? "Submitting..." : "Submit request"}
                </Button>
              </form>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
