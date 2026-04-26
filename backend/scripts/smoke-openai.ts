import { challengeLibrary } from "../../shared/challenge-library";
import { executeSpecToPrompt, executeUIReproductionPrompt } from "../src/services/ai/promptRunner";
import { judgeBugFix, judgeTokenGolf, judgeUIReproduction } from "../src/services/ai/judge";
import { htmlToBase64Screenshot } from "../src/services/screenshot";

async function main() {
  const specChallenge = challengeLibrary.find((challenge) => challenge.code === "SP-E1");
  const bugFixChallenge = challengeLibrary.find((challenge) => challenge.code === "BF-E1");
  const uiChallenge = challengeLibrary.find((challenge) => challenge.code === "UR-E1");

  if (!specChallenge || !bugFixChallenge || !uiChallenge) {
    throw new Error("Required smoke-test challenges were not found.");
  }

  const specExecution = await executeSpecToPrompt({
    promptMode: "single",
    userPrompts: [
      "Write a Python function that returns the numbers 1 through 100 as strings, but replace multiples of 3 with Vibe, multiples of 5 with Code, and multiples of both with VibeCode.",
    ],
  });

  const tokenGolfJudge = await judgeTokenGolf({
    targetOutput: "def reverse_string(s):\n    return ''.join(reversed(s))",
    actualOutput: "def reverse_string(s):\n    return ''.join(reversed(s))",
    verificationPrompt:
      "Treat functionally identical Python as correct and focus on exact behavioral equivalence.",
  });

  const bugFixJudge = await judgeBugFix({
    actualBug: bugFixChallenge.challenge_data.bug_description,
    bugLocation: bugFixChallenge.challenge_data.bug_location,
    expectedFix: bugFixChallenge.challenge_data.expected_fix,
    rubric: bugFixChallenge.challenge_data.rubric,
    userPrompt:
      "The issue is in the loop boundary: the final element is never considered because the iteration stops one index too early. Update the loop range so the last element is included.",
  });

  const generatedHtml = await executeUIReproductionPrompt(
    "Create a centered white pricing card on a light gray background with a small uppercase Pro Plan label, a bold $29/mo price, four features with green checkmarks, and a dark primary button.",
  );
  const targetScreenshotBase64 = await htmlToBase64Screenshot(
    uiChallenge.challenge_data.target_html_css,
  );
  const generatedScreenshotBase64 = await htmlToBase64Screenshot(generatedHtml.html);
  const uiJudge = await judgeUIReproduction({
    targetScreenshotBase64,
    generatedScreenshotBase64,
    rubric: uiChallenge.challenge_data.rubric,
  });

  process.stdout.write(
    JSON.stringify(
      {
        prompt_calls_used: 5,
        spec_to_prompt_tokens: specExecution.totalTokens,
        spec_to_prompt_preview: specExecution.responses[0]?.content?.slice(0, 180),
        token_golf_judge: tokenGolfJudge,
        bug_fix_judge: bugFixJudge,
        ui_reproduction_similarity: uiJudge.visual_similarity_percentage,
        ui_reproduction_score: uiJudge.overall_score,
      },
      null,
      2,
    ) + "\n",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
