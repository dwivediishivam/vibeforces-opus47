import Anthropic from "@anthropic-ai/sdk";
import { env } from "../../config/env";
import { estimateTokens } from "./openai";

export const ANTHROPIC_EXECUTION_MODEL = "claude-sonnet-4-6";
export const ANTHROPIC_JUDGE_MODEL = "claude-sonnet-4-6";

export const anthropic = env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  : null;

export async function runAnthropicPrompt(params: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  responseFormat?: "text" | "json_object";
  maxTokens?: number;
}): Promise<{ content: string; inputTokens: number; outputTokens: number }> {
  if (!anthropic) {
    throw new Error("Anthropic is not configured.");
  }

  const userContent =
    params.responseFormat === "json_object"
      ? `${params.userPrompt}\n\nRespond with valid JSON only — no preamble, no code fences.`
      : params.userPrompt;

  const response = await anthropic.messages.create({
    model: params.model,
    system: params.systemPrompt,
    max_tokens: params.maxTokens ?? 2048,
    messages: [{ role: "user", content: userContent }],
  });

  const text = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");

  const cleaned =
    params.responseFormat === "json_object" ? extractJson(text) : text;

  return {
    content: cleaned,
    inputTokens: estimateTokens(`${params.systemPrompt}\n${userContent}`),
    outputTokens: estimateTokens(text),
  };
}

export async function runAnthropicVisionJudge(params: {
  model: string;
  systemPrompt: string;
  textPrompts: string[];
  images: string[];
  maxTokens?: number;
}): Promise<{ content: string }> {
  if (!anthropic) {
    throw new Error("Anthropic is not configured.");
  }

  const content: Anthropic.MessageParam["content"] = [];
  for (let i = 0; i < params.textPrompts.length; i += 1) {
    content.push({ type: "text", text: params.textPrompts[i] });
    if (params.images[i]) {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: "image/png",
          data: params.images[i],
        },
      });
    }
  }
  content.push({
    type: "text",
    text: "Respond with valid JSON only — no preamble, no code fences.",
  });

  const response = await anthropic.messages.create({
    model: params.model,
    system: params.systemPrompt,
    max_tokens: params.maxTokens ?? 1200,
    messages: [{ role: "user", content }],
  });

  const text = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");

  return { content: extractJson(text) };
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text.trim();
}
