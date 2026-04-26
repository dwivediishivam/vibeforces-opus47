"use client";

const OPTIONS = [
  { value: "openai", label: "GPT-4.1", subtitle: "OpenAI" },
  { value: "anthropic", label: "Claude Sonnet 4.6", subtitle: "Anthropic" },
] as const;

export type ModelChoice = (typeof OPTIONS)[number]["value"];

export function ModelSelector({
  value,
  onChange,
  disabled = false,
  fixedManagedAgents = false,
}: {
  value: ModelChoice;
  onChange: (next: ModelChoice) => void;
  disabled?: boolean;
  /**
   * SDE2+ challenges always run inside Claude Managed Agents — no choice.
   * Renders a non-interactive badge instead of the dropdown so the user
   * doesn't see a bogus "GPT-4.1" default that has nothing to do with how
   * the challenge is actually executed.
   */
  fixedManagedAgents?: boolean;
}) {
  if (fixedManagedAgents) {
    return (
      <div className="surface-subtle inline-flex items-center gap-3 rounded-lg border border-[#7c3aed]/30 bg-[#7c3aed]/10 px-3 py-2">
        <div className="space-y-0.5">
          <div className="text-[11px] uppercase tracking-[1.5px] text-[#64748b]">
            Runtime
          </div>
          <div className="font-mono-ui text-sm font-semibold text-[#a78bfa]">
            Claude Managed Agents
            <span className="ml-2 text-[10px] uppercase tracking-[1.5px] text-[#64748b]">
              Sonnet 4.6 · Sandboxed
            </span>
          </div>
          <div className="text-[10px] text-[#64748b]">
            Per-session container. Token-budgeted. No model selection.
          </div>
        </div>
      </div>
    );
  }

  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];
  return (
    <label className="surface-subtle group inline-flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2">
      <div className="space-y-0.5">
        <div className="text-[11px] uppercase tracking-[1.5px] text-[#64748b]">
          Model
        </div>
        <div className="font-mono-ui text-sm font-semibold text-[#a78bfa]">
          {current.label}
          <span className="ml-2 text-[10px] uppercase tracking-[1.5px] text-[#64748b]">
            {current.subtitle}
          </span>
        </div>
        <div className="text-[10px] text-[#64748b]">
          Execution model only. Grading uses a calibrated judge.
        </div>
      </div>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as ModelChoice)}
        className="rounded-md border border-[#1e293b] bg-[#0a0f1e] px-2 py-1 font-mono-ui text-xs text-[#e2e8f0] focus:border-[#7c3aed] focus:outline-none"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
