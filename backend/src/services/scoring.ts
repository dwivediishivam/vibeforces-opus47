import type { ChallengeCategory } from "../types";

const WEIGHTS: Record<
  ChallengeCategory,
  { accuracy: number; token: number; time: number }
> = {
  spec_to_prompt: { accuracy: 0.6, token: 0.2, time: 0.2 },
  token_golf: { accuracy: 0.4, token: 0.4, time: 0.2 },
  bug_fix: { accuracy: 0.7, token: 0.1, time: 0.2 },
  architecture_pick: { accuracy: 1, token: 0, time: 0 },
  ui_reproduction: { accuracy: 0.5, token: 0.3, time: 0.2 },
  // SDE2+ categories: token here means "task-budget efficiency", not prompt
  // tokens. Time is irrelevant for async agent runs.
  distributed_debug: { accuracy: 0.7, token: 0.2, time: 0.1 },
  system_design_build: { accuracy: 0.75, token: 0.15, time: 0.1 },
  agent_orchestration: { accuracy: 0.8, token: 0.2, time: 0 },
};

export function normalizeAccuracy(rawScore: number) {
  return Math.max(0, Math.min(100, rawScore * 10));
}

export function computeTokenScore(
  tokensUsed: number,
  maxTokensAllowed: number | undefined,
) {
  if (!maxTokensAllowed || maxTokensAllowed <= 0) return 100;
  const ratio = tokensUsed / maxTokensAllowed;
  if (ratio <= 0.5) return 100;
  if (ratio >= 1.5) return 0;
  return Math.round(100 - ((ratio - 0.5) / 1) * 100);
}

export function computePromptEfficiencyScore(params: {
  promptTokens: number;
  benchmarkTokens: number;
  peerPromptTokens?: number[];
}) {
  const benchmarkScore = computeTokenScore(
    params.promptTokens,
    params.benchmarkTokens,
  );
  const peerScore = percentileScore(
    params.promptTokens,
    params.peerPromptTokens ?? [],
  );

  if (peerScore === null) return benchmarkScore;

  // Production scoring should reward both absolute prompt discipline and
  // performance against real users, without letting a tiny peer sample dominate.
  return Math.round(benchmarkScore * 0.6 + peerScore * 0.4);
}

export function computeTimeScore(
  timeTakenSeconds: number,
  maxTimeAllowedSeconds: number,
) {
  if (!maxTimeAllowedSeconds || maxTimeAllowedSeconds <= 0) return 100;
  const ratio = timeTakenSeconds / maxTimeAllowedSeconds;
  if (ratio <= 0.3) return 100;
  if (ratio >= 1) return 25;
  return Math.round(100 - ((ratio - 0.3) / 0.7) * 75);
}

export function computeCombinedScore(params: {
  category: ChallengeCategory;
  accuracyRaw: number;
  tokenScore: number;
  timeScore: number;
}) {
  const weights = WEIGHTS[params.category];
  const accuracy = normalizeAccuracy(params.accuracyRaw);

  return Number(
    (
      accuracy * weights.accuracy +
      params.tokenScore * weights.token +
      params.timeScore * weights.time
    ).toFixed(2),
  );
}

export function percentileScore(value: number, peerValues: number[]) {
  if (peerValues.length === 0) return null;
  const lower = peerValues.filter((peer) => peer > value).length;
  const equal = peerValues.filter((peer) => peer === value).length;
  const pct = ((lower + equal * 0.5) / peerValues.length) * 100;
  return Math.round(Math.max(0, Math.min(100, pct)));
}

export function scoreArchitectureRanking(
  ranking: string[],
  correctRanking: string[],
) {
  if (ranking.join(",") === correctRanking.join(",")) return 10;

  let points = 0;
  ranking.forEach((entry, index) => {
    if (entry === correctRanking[index]) points += 3.5;
  });

  const pairwiseMatches =
    Number(ranking.indexOf(correctRanking[0]) < ranking.indexOf(correctRanking[1])) +
    Number(ranking.indexOf(correctRanking[0]) < ranking.indexOf(correctRanking[2])) +
    Number(ranking.indexOf(correctRanking[1]) < ranking.indexOf(correctRanking[2]));

  points += pairwiseMatches * 0.5;

  return Math.max(0, Math.min(10, Number(points.toFixed(2))));
}
