import fs from "node:fs";
import path from "node:path";
import { challengeLibrary } from "../../shared/challenge-library";
import type { ChallengeDifficulty, ChallengeRecord } from "../../shared/types";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "frontend/public");

function assert(condition: unknown, message: string, errors: string[]) {
  if (!condition) {
    errors.push(message);
  }
}

function fileExistsFromPublic(relativePath: string) {
  return fs.existsSync(path.join(publicDir, relativePath.replace(/^\/+/, "")));
}

function validateRating(
  challenge: ChallengeRecord,
  difficulty: ChallengeDifficulty,
  errors: string[],
) {
  const ranges = {
    easy: [800, 1600],
    medium: [1200, 2000],
    hard: [1600, 2800],
  } as const;

  const [min, max] = ranges[difficulty];
  assert(
    challenge.rating >= min && challenge.rating <= max,
    `${challenge.code}: rating ${challenge.rating} is outside ${difficulty} range ${min}-${max}.`,
    errors,
  );
}

function validateChallenge(challenge: ChallengeRecord, errors: string[]) {
  assert(Boolean(challenge.id), `${challenge.code}: missing id.`, errors);
  assert(Boolean(challenge.code), `${challenge.id}: missing code.`, errors);
  assert(Boolean(challenge.title), `${challenge.code}: missing title.`, errors);
  assert(Boolean(challenge.description), `${challenge.code}: missing description.`, errors);
  validateRating(challenge, challenge.difficulty, errors);

  switch (challenge.category) {
    case "spec_to_prompt":
      assert(
        Boolean(challenge.challenge_data.voice_note_script),
        `${challenge.code}: missing voice_note_script.`,
        errors,
      );
      assert(
        Boolean(challenge.challenge_data.voice_note_url),
        `${challenge.code}: missing voice_note_url.`,
        errors,
      );
      assert(
        fileExistsFromPublic(challenge.challenge_data.voice_note_url),
        `${challenge.code}: voice note asset missing at ${challenge.challenge_data.voice_note_url}.`,
        errors,
      );
      if (challenge.difficulty === "easy") {
        assert(
          challenge.challenge_data.prompt_mode === "single",
          `${challenge.code}: easy spec challenge must use single prompt mode.`,
          errors,
        );
      } else {
        assert(
          challenge.challenge_data.prompt_mode === "plan_act",
          `${challenge.code}: medium/hard spec challenge must use plan_act mode.`,
          errors,
        );
        assert(
          challenge.challenge_data.supplementary_images.length > 0,
          `${challenge.code}: medium/hard spec challenge must include supplementary images.`,
          errors,
        );
      }
      for (const image of challenge.challenge_data.supplementary_images) {
        assert(
          fileExistsFromPublic(image),
          `${challenge.code}: supplementary image missing at ${image}.`,
          errors,
        );
      }
      break;
    case "token_golf":
      assert(
        Boolean(challenge.challenge_data.target_description),
        `${challenge.code}: missing target_description.`,
        errors,
      );
      assert(
        Boolean(challenge.challenge_data.target_output),
        `${challenge.code}: missing target_output.`,
        errors,
      );
      assert(
        Boolean(challenge.challenge_data.verification_prompt),
        `${challenge.code}: missing verification_prompt.`,
        errors,
      );
      assert(
        Number(challenge.challenge_data.max_tokens_allowed) > 0,
        `${challenge.code}: max_tokens_allowed must be positive.`,
        errors,
      );
      break;
    case "bug_fix":
      for (const key of [
        "code",
        "language",
        "task",
        "bug_description",
        "bug_location",
        "expected_fix",
        "rubric",
      ]) {
        assert(
          Boolean(challenge.challenge_data[key]),
          `${challenge.code}: missing ${key}.`,
          errors,
        );
      }
      break;
    case "architecture_pick":
      assert(
        challenge.challenge_data.options.length === 3,
        `${challenge.code}: architecture challenge must have exactly 3 options.`,
        errors,
      );
      assert(
        challenge.challenge_data.correct_ranking.length === 3,
        `${challenge.code}: correct_ranking must have exactly 3 entries.`,
        errors,
      );
      break;
    case "distributed_debug":
      for (const key of [
        "repo_url",
        "starter_branch",
        "failing_test_path",
        "scenario",
        "hidden_root_cause",
        "rubric",
      ]) {
        assert(
          Boolean(challenge.challenge_data[key]),
          `${challenge.code}: missing ${key}.`,
          errors,
        );
      }
      assert(
        Number(challenge.challenge_data.task_budget_tokens) >= 20000,
        `${challenge.code}: task_budget_tokens must be >= 20000 (Anthropic minimum).`,
        errors,
      );
      break;
    case "system_design_build":
      for (const key of ["spec", "acceptance_tests_path", "rubric"]) {
        assert(
          Boolean(challenge.challenge_data[key]),
          `${challenge.code}: missing ${key}.`,
          errors,
        );
      }
      assert(
        Array.isArray(challenge.challenge_data.required_decision_points) &&
          challenge.challenge_data.required_decision_points.length > 0,
        `${challenge.code}: required_decision_points must be a non-empty array.`,
        errors,
      );
      assert(
        Number(challenge.challenge_data.task_budget_tokens) >= 20000,
        `${challenge.code}: task_budget_tokens must be >= 20000.`,
        errors,
      );
      break;
    case "agent_orchestration":
      for (const key of ["goal", "eval_fixture_id", "rubric"]) {
        assert(
          Boolean(challenge.challenge_data[key]),
          `${challenge.code}: missing ${key}.`,
          errors,
        );
      }
      assert(
        Array.isArray(challenge.challenge_data.required_tools) &&
          challenge.challenge_data.required_tools.length > 0,
        `${challenge.code}: required_tools must be a non-empty array.`,
        errors,
      );
      assert(
        challenge.challenge_data.required_tools.some(
          (t: any) => t.scoring_role === "subgoal",
        ),
        `${challenge.code}: at least one required_tool must have scoring_role 'subgoal'.`,
        errors,
      );
      assert(
        Number(challenge.challenge_data.task_budget_tokens) >= 20000,
        `${challenge.code}: task_budget_tokens must be >= 20000.`,
        errors,
      );
      assert(
        Number(challenge.challenge_data.pass_threshold) > 0 &&
          Number(challenge.challenge_data.pass_threshold) <= 1,
        `${challenge.code}: pass_threshold must be in (0, 1].`,
        errors,
      );
      break;
    case "ui_reproduction":
      assert(
        Boolean(challenge.challenge_data.target_screenshot_url),
        `${challenge.code}: missing target_screenshot_url.`,
        errors,
      );
      assert(
        fileExistsFromPublic(challenge.challenge_data.target_screenshot_url),
        `${challenge.code}: target screenshot missing at ${challenge.challenge_data.target_screenshot_url}.`,
        errors,
      );
      assert(
        challenge.challenge_data.target_html_css.includes("<!DOCTYPE html>") &&
          challenge.challenge_data.target_html_css.includes("</html>"),
        `${challenge.code}: target_html_css should be a complete HTML document.`,
        errors,
      );
      break;
    default:
      errors.push(`${challenge.code}: unsupported category.`);
  }
}

function main() {
  const errors: string[] = [];

  assert(challengeLibrary.length === 39, `Expected 39 challenges, found ${challengeLibrary.length}.`, errors);

  const ids = new Set<string>();
  const codes = new Set<string>();
  const distribution = new Map<string, number>();

  for (const challenge of challengeLibrary) {
    assert(!ids.has(challenge.id), `Duplicate challenge id ${challenge.id}.`, errors);
    assert(!codes.has(challenge.code), `Duplicate challenge code ${challenge.code}.`, errors);
    ids.add(challenge.id);
    codes.add(challenge.code);
    validateChallenge(challenge, errors);

    const key = `${challenge.category}:${challenge.difficulty}`;
    distribution.set(key, (distribution.get(key) ?? 0) + 1);
  }

  const expectedPerDifficulty: Record<string, number> = {
    spec_to_prompt: 2,
    token_golf: 2,
    bug_fix: 2,
    architecture_pick: 2,
    ui_reproduction: 2,
    distributed_debug: 1,
    system_design_build: 1,
    agent_orchestration: 1,
  };

  for (const [category, perDifficulty] of Object.entries(expectedPerDifficulty)) {
    for (const difficulty of ["easy", "medium", "hard"]) {
      const count = distribution.get(`${category}:${difficulty}`) ?? 0;
      assert(
        count === perDifficulty,
        `Expected ${perDifficulty} ${difficulty} challenge(s) in ${category}, found ${count}.`,
        errors,
      );
    }
  }

  if (errors.length > 0) {
    process.stderr.write(`Challenge validation failed with ${errors.length} issue(s):\n`);
    for (const error of errors) {
      process.stderr.write(`- ${error}\n`);
    }
    process.exit(1);
  }

  process.stdout.write(`Challenge validation passed for all ${challengeLibrary.length} challenges.\n`);
}

main();
