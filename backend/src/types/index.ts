export type UserRole = "learner" | "recruiter" | "admin";

export type ChallengeCategory =
  | "spec_to_prompt"
  | "token_golf"
  | "bug_fix"
  | "architecture_pick"
  | "ui_reproduction"
  | "distributed_debug"
  | "system_design_build"
  | "agent_orchestration";

export type ChallengeDifficulty = "easy" | "medium" | "hard";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  role: UserRole;
  avatar_url?: string | null;
  recruiter_plan?: "trial" | "paid" | "enterprise";
  recruiter_test_limit?: number;
  recruiter_candidate_limit?: number;
}

export interface ChallengeRow {
  id: string;
  code?: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  rating: number;
  title: string;
  description: string;
  challenge_data: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContext {
  userId: string;
  profile: Profile;
  token: string;
}

export interface JudgeResult {
  accuracy_score?: number;
  prompt_clarity_score?: number;
  completeness_score?: number;
  precision_score?: number;
  identification_accuracy?: number;
  correctness_percentage?: number;
  visual_similarity_percentage?: number;
  overall_score?: number;
  feedback?: string;
  breakdown?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PromptExecutionResult {
  responses: Array<{ content: string; tokens: number }>;
  totalTokens: number;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export {};
