import OpenAI from "openai";
import { getEncoding } from "js-tiktoken";
import { env } from "../../config/env";

const tokenizer = getEncoding("o200k_base");

export const EXECUTION_MODEL = "gpt-4.1";
export const JUDGE_MODEL = "gpt-5.4-mini";

export const openai = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

export function estimateTokens(input: string) {
  return tokenizer.encode(input).length;
}

export async function runPrompt(params: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  responseFormat?: "text" | "json_object";
  maxTokens?: number;
}): Promise<{ content: string; inputTokens: number; outputTokens: number }> {
  if (!openai) {
    throw new Error("OpenAI is not configured.");
  }

  const response = await openai.chat.completions.create({
    model: params.model,
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.userPrompt },
    ],
    response_format:
      params.responseFormat === "json_object"
        ? { type: "json_object" }
        : undefined,
    max_completion_tokens: params.maxTokens ?? 2048,
  });

  const content = response.choices[0]?.message?.content ?? "";
  return {
    content,
    inputTokens: estimateTokens(`${params.systemPrompt}\n${params.userPrompt}`),
    outputTokens: estimateTokens(content),
  };
}
