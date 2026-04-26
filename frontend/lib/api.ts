import type {
  ChallengeRecord,
  ContestRecord,
  LeaderboardEntry,
  RecruiterTestRecord,
} from "@shared/types";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
      (typeof window === "undefined"
        ? "https://vibeforces-api.onrender.com/api/v1"
        : "/api/v1")
    : "http://localhost:3001/api/v1";

type SubmissionRecord = Record<string, unknown>;

type RecruiterAttemptRecord = {
  id: string;
  user_id: string;
  total_score: number | null;
  status: string;
  started_at?: string | null;
  completed_at?: string | null;
  avg_accuracy?: number | null;
  solved_count?: number;
  total_time_seconds?: number;
  profiles?: {
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
};

type RecruiterTestStats = {
  candidates_tested: number;
  completed_attempts: number;
  avg_score: number;
};

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.text();
    let message = errorBody || `Request failed with ${response.status}`;
    try {
      const parsed = JSON.parse(errorBody) as { error?: string; message?: string };
      message = parsed.error ?? parsed.message ?? message;
    } catch {
      // Keep the plain response body when the backend did not return JSON.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

async function request<T>(
  pathname: string,
  init?: RequestInit & {
    token?: string | null;
    timeoutMs?: number;
    retries?: number;
  },
) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (init?.token) headers.set("Authorization", `Bearer ${init.token}`);

  let response: Response;
  const timeoutMs = init?.timeoutMs ?? 15000;
  const retries = init?.retries ?? (init?.method ? 0 : 1);

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      response = await fetch(`${API_BASE}${pathname}`, {
        ...init,
        headers,
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (
        response.ok ||
        ![502, 503, 504].includes(response.status) ||
        attempt === retries
      ) {
        return parseJson<T>(response);
      }
    } catch {
      clearTimeout(timeout);
      if (attempt === retries) {
        throw new Error(
          "The VibeForces API is waking up or temporarily unavailable. Please retry in a few seconds.",
        );
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 900));
  }

  throw new Error("The VibeForces API is temporarily unavailable.");
}

export const apiClient = {
  getChallenges(filters?: Record<string, string>) {
    const search = new URLSearchParams(filters).toString();
    return request<{ challenges: ChallengeRecord[] }>(
      `/challenges${search ? `?${search}` : ""}`,
    );
  },
  getChallenge(id: string) {
    return request<{ challenge: ChallengeRecord }>(`/challenges/${id}`);
  },
  getPracticeLeaderboard() {
    return request<{ leaderboard: LeaderboardEntry[] }>("/leaderboard/practice");
  },
  getChallengeLeaderboard(id: string) {
    return request<{
      leaderboard: Array<{
        rank: number;
        user_id: string;
        username: string;
        display_name: string;
        avatar_url: string | null;
        combined_score: number;
        accuracy_score: number;
        token_score: number;
        time_taken_seconds: number;
        submitted_at: string;
      }>;
    }>(`/leaderboard/challenge/${id}`);
  },
  getChallengeSubmissions(id: string, token?: string | null) {
    return request<{ submissions: SubmissionRecord[] }>(
      `/submissions/by-challenge/${id}`,
      { token },
    );
  },
  getContests(options?: { timeoutMs?: number; retries?: number }) {
    return request<{ contests: ContestRecord[] }>("/contests", options);
  },
  getContest(id: string) {
    return request<{
      contest: ContestRecord;
      challenges: ChallengeRecord[];
    }>(`/contests/${id}`);
  },
  getContestLeaderboard(id: string) {
    return request<{ leaderboard: LeaderboardEntry[] }>(
      `/contests/${id}/leaderboard`,
    );
  },
  getRecruiterTests(token?: string | null) {
    return request<{
      tests: RecruiterTestRecord[];
      stats: RecruiterTestStats;
    }>("/tests", { token });
  },
  getRecruiterTest(id: string, token?: string | null) {
    return request<{
      test: RecruiterTestRecord;
      attempts: RecruiterAttemptRecord[];
      challenges: ChallengeRecord[];
    }>(`/tests/${id}`, { token });
  },
  getTestByCode(code: string) {
    return request<{
      test: RecruiterTestRecord;
      challenges: ChallengeRecord[];
    }>(`/tests/take/${code}`);
  },
  createSubmission(payload: unknown, token?: string | null) {
    return request<{
      submission: SubmissionRecord;
      challenge: Record<string, unknown>;
    }>("/submissions", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
      timeoutMs: 180000,
    });
  },
  getMySubmissions(token?: string | null) {
    return request<{ submissions: SubmissionRecord[] }>("/submissions/my", {
      token,
    });
  },
  createTest(payload: unknown, token?: string | null) {
    return request<{ test: RecruiterTestRecord }>("/tests", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
      timeoutMs: 30000,
    });
  },
  startTest(id: string, token?: string | null) {
    return request<{ attempt: Record<string, unknown> }>(`/tests/${id}/start`, {
      method: "POST",
      token,
    });
  },
  completeTest(id: string, payload: unknown, token?: string | null) {
    return request<{ attempt: Record<string, unknown> }>(`/tests/${id}/complete`, {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    });
  },
  getMyProfile(token?: string | null) {
    return request<{
      profile: {
        id: string;
        username: string;
        display_name: string;
        role: string;
        avatar_url: string | null;
        rating: number;
        rating_peak: number;
        rating_solves: number;
        recruiter_plan?: string;
        recruiter_test_limit?: number;
        recruiter_candidate_limit?: number;
      } | null;
      rating_history: Array<{
        delta: number;
        rating_before: number;
        rating_after: number;
        reason: string | null;
        created_at: string;
        challenge_id: string;
      }>;
    }>("/profile/me", { token });
  },
  getAdminStats(token?: string | null) {
    return request<{
      stats: {
        total_users: number;
        total_submissions: number;
        active_contests: number;
      };
    }>("/admin/stats", { token });
  },
  joinContest(id: string, token?: string | null) {
    return request<{ joined: boolean }>(`/contests/${id}/join`, {
      method: "POST",
      token,
    });
  },
  createContest(payload: unknown, token?: string | null) {
    return request<{ contest: ContestRecord }>("/admin/contests", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    });
  },
  updateContest(id: string, payload: unknown, token?: string | null) {
    return request<{ contest: ContestRecord }>(`/admin/contests/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      token,
    });
  },
  createHireLead(payload: unknown) {
    return request<{ lead: { id: string } }>("/hire/leads", {
      method: "POST",
      body: JSON.stringify(payload),
      timeoutMs: 30000,
    });
  },
};
