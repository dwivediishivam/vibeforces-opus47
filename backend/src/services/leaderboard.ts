import { supabaseAdmin } from "../config/supabase";

export async function getPracticeLeaderboard() {
  const { data, error } = await supabaseAdmin
    .from("practice_leaderboard")
    .select("*")
    .order("total_score", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  const userIds = rows
    .map((r: any) => r.user_id)
    .filter(Boolean) as string[];
  if (userIds.length === 0) return rows;

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, rating, rating_peak")
    .in("id", userIds);

  const ratingByUser = new Map<string, { rating: number; rating_peak: number }>();
  for (const profile of profiles ?? []) {
    ratingByUser.set((profile as any).id, {
      rating: Number((profile as any).rating ?? 1200),
      rating_peak: Number((profile as any).rating_peak ?? 1200),
    });
  }

  return rows
    .map((row: any) => ({
      ...row,
      rating: ratingByUser.get(row.user_id)?.rating ?? 1200,
      rating_peak: ratingByUser.get(row.user_id)?.rating_peak ?? 1200,
    }))
    .sort((a, b) => b.rating - a.rating)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export async function getChallengeLeaderboard(challengeId: string, limit = 50) {
  const { data, error } = await supabaseAdmin
    .from("submissions")
    .select(
      "id, user_id, combined_score, accuracy_score, token_score, time_taken_seconds, created_at, profiles!submissions_user_id_fkey(username, display_name, avatar_url)",
    )
    .eq("challenge_id", challengeId)
    .eq("context_type", "practice")
    .eq("status", "completed")
    .order("combined_score", { ascending: false })
    .limit(limit);

  if (error) throw error;

  const seen = new Set<string>();
  const dedup: any[] = [];
  for (const entry of data ?? []) {
    if (seen.has(entry.user_id)) continue;
    seen.add(entry.user_id);
    dedup.push(entry);
  }

  return dedup.map((entry: any, index) => ({
    rank: index + 1,
    user_id: entry.user_id,
    username: entry.profiles?.username ?? "anonymous",
    display_name: entry.profiles?.display_name ?? "Anonymous",
    avatar_url: entry.profiles?.avatar_url ?? null,
    combined_score: Number(entry.combined_score ?? 0),
    accuracy_score: Number(entry.accuracy_score ?? 0),
    token_score: Number(entry.token_score ?? 0),
    time_taken_seconds: Number(entry.time_taken_seconds ?? 0),
    submitted_at: entry.created_at,
  }));
}

export async function getContestLeaderboard(contestId: string) {
  const { data, error } = await supabaseAdmin
    .from("contest_participants")
    .select(
      "id, total_score, total_time_seconds, rank, user_id, profiles!contest_participants_user_id_fkey(username, display_name, avatar_url)",
    )
    .eq("contest_id", contestId)
    .order("total_score", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((entry: any, index) => ({
    rank: index + 1,
    user_id: entry.user_id,
    username: entry.profiles?.username ?? "unknown",
    display_name: entry.profiles?.display_name ?? "Unknown",
    avatar_url: entry.profiles?.avatar_url ?? null,
    total_score: entry.total_score ?? 0,
    avg_accuracy: null,
    avg_token_efficiency: null,
    avg_time_seconds: entry.total_time_seconds ?? 0,
    avg_combined_score: entry.total_score ?? 0,
    challenges_solved: null,
  }));
}
