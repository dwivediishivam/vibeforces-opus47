import { supabaseAdmin } from "../config/supabase";
import type { ChallengeRow } from "../types";

const K_FACTOR_BY_DIFFICULTY = {
  easy: 16,
  medium: 24,
  hard: 32,
} as const;

function expectedScoreFromRatings(userRating: number, problemRating: number) {
  // Standard Elo expectation. 400-point gap = 10:1 odds.
  return 1 / (1 + Math.pow(10, (problemRating - userRating) / 400));
}

function actualScoreFromCombined(combinedScore: number) {
  // Combined score is 0-100; map to 0-1 with a soft floor so weak attempts still register.
  const clamped = Math.max(0, Math.min(100, combinedScore));
  return clamped / 100;
}

export async function applyRatingChange(params: {
  userId: string;
  challenge: ChallengeRow;
  submissionId: string;
  combinedScore: number;
  isFirstSolve: boolean;
}) {
  const { userId, challenge, submissionId, combinedScore, isFirstSolve } = params;

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("rating, rating_peak, rating_solves")
    .eq("id", userId)
    .single();

  if (profileError || !profile) return null;

  const before = Number(profile.rating ?? 1200);
  const peak = Number(profile.rating_peak ?? before);
  const solves = Number(profile.rating_solves ?? 0);

  const expected = expectedScoreFromRatings(before, challenge.rating);
  const actual = actualScoreFromCombined(combinedScore);
  const baseK = K_FACTOR_BY_DIFFICULTY[challenge.difficulty] ?? 24;

  // First solve has full effect; repeats get diminishing returns to discourage farming.
  const repeatScale = isFirstSolve ? 1 : 0.25;
  const delta = Math.round(baseK * (actual - expected) * repeatScale);
  const after = Math.max(800, before + delta);

  if (delta === 0) return { before, after, delta };

  await supabaseAdmin
    .from("profiles")
    .update({
      rating: after,
      rating_peak: Math.max(peak, after),
      rating_solves: solves + (isFirstSolve ? 1 : 0),
    })
    .eq("id", userId);

  await supabaseAdmin.from("rating_changes").insert({
    user_id: userId,
    challenge_id: challenge.id,
    submission_id: submissionId,
    delta,
    rating_before: before,
    rating_after: after,
    reason: isFirstSolve ? "first_solve" : "retry",
  });

  return { before, after, delta };
}
