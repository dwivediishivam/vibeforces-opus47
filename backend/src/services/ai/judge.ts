import type { JudgeResult } from "../../types";
import { openai, JUDGE_MODEL, runPrompt } from "./openai";
import { runAnthropicVisionJudge } from "./anthropic";
import { judgeModelFor, runProviderPrompt, type Provider } from "./dispatch";
import { safeJsonParse } from "../../utils/json";

function scoringProvider(requested?: Provider): Provider {
  // Execution model can be user-selectable, but grading must stay calibrated.
  // Prefer one judge for all users; fall back only when OpenAI is unavailable.
  return openai ? "openai" : requested ?? "openai";
}

export async function judgeSpecToPrompt(params: {
  expectedBehavior: string;
  rubric: string;
  userPrompts: string[];
  aiOutputs: string[];
  provider?: Provider;
}) {
  const provider = scoringProvider(params.provider);
  const result = await runProviderPrompt(provider, {
    model: judgeModelFor(provider),
    responseFormat: "json_object",
    systemPrompt: `You are grading a prompt-engineering exercise. The primary signal is whether the AI OUTPUT matches the expected behavior. Prompt wording matters only insofar as it produced a correct output.

Calibration anchors for overall_score (0-10):
- 10: AI output fully satisfies the expected behavior and rubric.
- 8-9: AI output satisfies the core behavior; 1-2 minor rubric items missing.
- 6-7: AI output covers the main path but misses meaningful requirements.
- 4-5: AI output is partially relevant but misses the core ask.
- 1-3: AI output is off-target or empty.
- 0: No attempt or gibberish.

Be fair. A correct-enough output from a short prompt scores higher than a verbose prompt with a weak output. Do not penalize prompt style if the output is good.

Respond in this EXACT JSON format:
{
  "accuracy_score": <number 0-10>,
  "prompt_clarity_score": <number 0-10>,
  "completeness_score": <number 0-10>,
  "overall_score": <number 0-10>,
  "feedback": "<2-3 sentences focused on what the OUTPUT got right or missed>",
  "breakdown": {
    "what_worked": "<brief>",
    "what_could_improve": "<brief>"
  }
}`,
    userPrompt: `## Expected Behavior
${params.expectedBehavior}

## Rubric
${params.rubric}

## User Prompts
${params.userPrompts.map((prompt, index) => `Prompt ${index + 1}: ${prompt}`).join("\n")}

## AI Outputs
${params.aiOutputs.map((output, index) => `Output ${index + 1}: ${output}`).join("\n")}`,
    maxTokens: 900,
  });

  return safeJsonParse<JudgeResult>(result.content, {
    accuracy_score: 0,
    overall_score: 0,
    feedback: "Judge response was not parseable.",
  });
}

export async function judgeTokenGolf(params: {
  targetOutput: string;
  actualOutput: string;
  verificationPrompt: string;
  provider?: Provider;
}) {
  const provider = scoringProvider(params.provider);
  const result = await runProviderPrompt(provider, {
    model: judgeModelFor(provider),
    responseFormat: "json_object",
    systemPrompt: `You judge whether the candidate's code is FUNCTIONALLY EQUIVALENT to the target spec. You are NOT comparing text. You are NOT comparing the code line-by-line to a reference. Mentally trace what each piece of code does on representative inputs and decide whether the observable behavior is the same.

${params.verificationPrompt}

Concrete rules:
- A one-line solution that produces the same outputs as the reference is fully correct (100). Length is irrelevant.
- A trivial constant return (e.g. \`return -1\`) ONLY counts if the spec genuinely allows it for all inputs. Otherwise it fails on the inputs where it diverges.
- Different algorithms / data structures with identical behavior are correct.
- If the shortest possible implementation is a constant expression and it truly satisfies every specified input, it should score 100. If it only works for one example, it should fail.
- Stylistic differences (names, spacing, language idioms) are irrelevant.
- Compare on the INPUTS the verification prompt or target description specifies. If unspecified, use a small set of representative inputs including edge cases (empty, single-element, large, negative).

Calibration for correctness_percentage:
- 100: Equivalent behavior on every input you can think of.
- 80-95: Equivalent on common inputs; one or two edge cases differ.
- 50-79: Right on the common path but misses a clear requirement.
- 20-49: Broken for most inputs.
- 0-19: Off-target, empty, or non-code.

Respond in this EXACT JSON format:
{
  "correctness_percentage": <number 0-100>,
  "is_correct": <boolean>,
  "differences": "<brief>",
  "feedback": "<1-2 sentences>"
}`,
    userPrompt: `## Target Output
${params.targetOutput}

## Actual Output
${params.actualOutput}`,
    maxTokens: 600,
  });

  return safeJsonParse<JudgeResult>(result.content, {
    correctness_percentage: 0,
    overall_score: 0,
    feedback: "Judge response was not parseable.",
  });
}

export async function judgeBugFix(params: {
  brokenCode: string;
  aiFixedCode: string;
  actualBug: string;
  bugLocation: string;
  expectedFix: string;
  userPrompt: string;
  rubric: string;
  provider?: Provider;
}) {
  const provider = scoringProvider(params.provider);
  const result = await runProviderPrompt(provider, {
    model: judgeModelFor(provider),
    responseFormat: "json_object",
    systemPrompt: `You are judging a bug-fix prompting exercise.

Evaluate two signals:
1. Prompt precision: did the user's prompt identify the relevant area, cause, and fix direction?
2. Fix correctness: did the AI-generated fixed code actually repair the bug without unrelated damage?

Scoring is a sum: 4 points for locating the bug (line, function, or specific code), 4 points for naming the real cause, 2 points for describing the correct fix direction. Partial credit is fine. Paraphrasing the rubric counts as long as the core idea is correct.

Then adjust the overall score using the generated fix:
- If the prompt was vague but the generated fix is correct by luck, cap overall_score at 6.
- If the prompt is precise but the generated fix is incomplete, cap overall_score at 8.
- If both prompt and generated fix are correct, score 9-10.
- If the generated fix does not address the actual bug, cap overall_score at 5.

Do NOT compare code text line-by-line. Judge functional repair and minimality. Different implementations that fix the same behavior are valid.

- 10: Located, diagnosed, and directed the fix.
- 7-9: Correctly identified the real bug; fix direction may be fuzzy.
- 4-6: Found the right area but wrong cause, or right cause but wrong area.
- 1-3: Generic "fix the bug" prompt with no specific insight.
- 0: No attempt.

Respond in this EXACT JSON format:
{
  "precision_score": <number 0-10>,
  "identification_accuracy": <number 0-10>,
  "overall_score": <number 0-10>,
  "fix_correctness_score": <number 0-10>,
  "feedback": "<2-3 sentences>",
  "user_identified_location": <boolean>,
  "user_identified_cause": <boolean>,
  "user_described_fix_direction": <boolean>,
  "generated_fix_is_correct": <boolean>
}`,
    userPrompt: `## Broken Code
${params.brokenCode}

## AI Generated Fixed Code
${params.aiFixedCode}

## Actual Bug
${params.actualBug}

## Bug Location
${params.bugLocation}

## Expected Fix
${params.expectedFix}

## Rubric
${params.rubric}

## User Prompt
${params.userPrompt}`,
    maxTokens: 800,
  });

  return safeJsonParse<JudgeResult>(result.content, {
    precision_score: 0,
    overall_score: 0,
    fix_correctness_score: 0,
    feedback: "Judge response was not parseable.",
  });
}

export async function judgeUIReproduction(params: {
  targetScreenshotBase64: string;
  generatedScreenshotBase64: string;
  rubric: string;
  provider?: Provider;
}) {
  const provider = scoringProvider(params.provider);
  const systemPrompt = `You are judging visual similarity between two UI screenshots: the first is the TARGET, the second is the USER'S REPRODUCTION.

Score holistically. A recognizable reproduction of the same UI — same component structure, approximate colors, approximate layout — should score high even if pixel-level details differ. Web rendering is never pixel-perfect, and the judge should not punish expected variance.

Calibration for overall_score (0-10):
- 10: Same components, same layout, same color family, same typography hierarchy.
- 8-9: Same layout and components, minor color/spacing/typography differences.
- 6-7: Right general structure; some components missing or wrong styling.
- 4-5: Partial structure; clearly the same idea but major differences.
- 1-3: Attempt visible but mostly wrong.
- 0: Blank / unrelated.

visual_similarity_percentage must be consistent with overall_score (i.e. overall_score * 10 ± 5).

${params.rubric}

Respond in this EXACT JSON format:
{
  "visual_similarity_percentage": <number 0-100>,
  "layout_match": <number 0-10>,
  "color_match": <number 0-10>,
  "typography_match": <number 0-10>,
  "component_match": <number 0-10>,
  "overall_score": <number 0-10>,
  "feedback": "<2-3 sentences>"
}`;

  const fallback = {
    visual_similarity_percentage: 0,
    overall_score: 0,
    feedback: "Judge response was not parseable.",
  };

  if (provider === "anthropic") {
    const result = await runAnthropicVisionJudge({
      model: judgeModelFor(provider),
      systemPrompt,
      textPrompts: ["Target UI", "Generated UI"],
      images: [params.targetScreenshotBase64, params.generatedScreenshotBase64],
      maxTokens: 900,
    });
    return safeJsonParse<JudgeResult>(result.content, fallback);
  }

  if (!openai) {
    throw new Error("OpenAI is not configured.");
  }

  const response = await openai.chat.completions.create({
    model: JUDGE_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: "Target UI" },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${params.targetScreenshotBase64}`,
            },
          },
          { type: "text", text: "Generated UI" },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${params.generatedScreenshotBase64}`,
            },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 900,
  });

  return safeJsonParse<JudgeResult>(
    response.choices[0]?.message?.content ?? "",
    fallback,
  );
}
