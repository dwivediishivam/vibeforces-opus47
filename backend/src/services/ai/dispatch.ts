import { EXECUTION_MODEL, JUDGE_MODEL, runPrompt } from "./openai";
import {
  ANTHROPIC_EXECUTION_MODEL,
  ANTHROPIC_JUDGE_MODEL,
  runAnthropicPrompt,
} from "./anthropic";

export type Provider = "openai" | "anthropic";

export function normalizeProvider(input: unknown): Provider {
  const value = String(input ?? "").toLowerCase();
  if (value === "anthropic" || value === "claude") return "anthropic";
  return "openai";
}

export function executionModelFor(provider: Provider) {
  return provider === "anthropic" ? ANTHROPIC_EXECUTION_MODEL : EXECUTION_MODEL;
}

export function judgeModelFor(provider: Provider) {
  return provider === "anthropic" ? ANTHROPIC_JUDGE_MODEL : JUDGE_MODEL;
}

export async function runProviderPrompt(
  provider: Provider,
  params: Parameters<typeof runPrompt>[0],
) {
  if (provider === "anthropic") return runAnthropicPrompt(params);
  return runPrompt(params);
}
