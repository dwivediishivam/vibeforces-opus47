import type { ChallengeRow } from "../types";
import { instructionsFor } from "./challenge-instructions";

const publicBugFixCopy: Record<string, { title: string; description: string }> = {
  "BF-E1": {
    title: "Binary Search Debugging",
    description: "Inspect a short Python search function and write a precise repair prompt.",
  },
  "BF-E2": {
    title: "Sequence Function Debugging",
    description: "Inspect a short JavaScript numeric function and identify the logic error.",
  },
  "BF-M1": {
    title: "Async Helper Debugging",
    description: "Review an asynchronous helper and prompt the AI toward the correct repair.",
  },
  "BF-M2": {
    title: "React Update Debugging",
    description: "Inspect a React component with incorrect update behavior and write a targeted fix prompt.",
  },
  "BF-H1": {
    title: "Event Stream Debugging",
    description: "Analyze a reconnecting stream wrapper and identify the lifecycle bug precisely.",
  },
  "BF-H2": {
    title: "Concurrent Resource Debugging",
    description: "Review concurrent resource-handling code and prompt for the safest repair.",
  },
};

function removeBugHints(code: string) {
  return code
    .replace(/\s*#\s*BUG:.*$/gm, "")
    .replace(/\s*\/\/\s*BUG:.*$/gm, "")
    .replace(/\s*\/\/\s*Returns array of promises, not users.*$/gm, "");
}

export function getChallengeSummary(challenge: ChallengeRow) {
  const publicBugCopy = publicBugFixCopy[String(challenge.code ?? "")];

  return {
    id: challenge.id,
    code: challenge.code,
    category: challenge.category,
    difficulty: challenge.difficulty,
    rating: challenge.rating,
    title: publicBugCopy?.title ?? challenge.title,
    description: publicBugCopy?.description ?? challenge.description,
    instructions: instructionsFor(String(challenge.code ?? "")),
  };
}

export function sanitizeChallenge(challenge: ChallengeRow) {
  const base = {
    ...getChallengeSummary(challenge),
    challenge_data: {} as Record<string, unknown>,
  };

  switch (challenge.category) {
    case "spec_to_prompt":
      base.challenge_data = {
        voice_note_url: challenge.challenge_data.voice_note_url,
        supplementary_images: challenge.challenge_data.supplementary_images ?? [],
        prompt_mode: challenge.challenge_data.prompt_mode,
      };
      break;
    case "token_golf":
      base.challenge_data = {
        target_output: challenge.challenge_data.target_output,
        max_tokens_allowed: challenge.challenge_data.max_tokens_allowed,
      };
      break;
    case "bug_fix":
      base.challenge_data = {
        code: removeBugHints(String(challenge.challenge_data.code ?? "")),
        language: challenge.challenge_data.language,
        task:
          "Read the code and write a prompt that tells the AI what to fix. Do not ask for a broad rewrite; identify the failing behavior, likely location, and repair direction from the code.",
      };
      break;
    case "architecture_pick":
      base.challenge_data = {
        scenario: challenge.challenge_data.scenario,
        options: challenge.challenge_data.options,
      };
      break;
    case "ui_reproduction":
      base.challenge_data = {
        target_screenshot_url: challenge.challenge_data.target_screenshot_url,
      };
      break;
    case "distributed_debug": {
      // Strip hidden_root_cause (the answer) and rubric (judge-only).
      const { hidden_root_cause, rubric, ...safe } = challenge.challenge_data ?? {};
      void hidden_root_cause;
      void rubric;
      base.challenge_data = safe;
      break;
    }
    case "system_design_build": {
      const { rubric, ...safe } = challenge.challenge_data ?? {};
      void rubric;
      base.challenge_data = safe;
      break;
    }
    case "agent_orchestration": {
      const { rubric, eval_fixture_payload, ...safe } =
        challenge.challenge_data ?? {};
      // Eval payload URL is fine to expose for transparency; rubric stays private.
      void rubric;
      base.challenge_data = { ...safe, eval_fixture_payload };
      break;
    }
    default:
      base.challenge_data = {};
  }

  return base;
}

export function maxTimeAllowedForChallenge(challenge: ChallengeRow) {
  const byDifficulty = {
    easy: 10 * 60,
    medium: 20 * 60,
    hard: 30 * 60,
  } as const;

  return byDifficulty[challenge.difficulty] ?? 15 * 60;
}
