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

export type SubmissionContext = "practice" | "contest" | "test";

export interface SpecToPromptData {
  voice_note_url: string;
  voice_note_script: string;
  supplementary_images: string[];
  prompt_mode: "single" | "plan_act";
  expected_behavior: string;
  rubric: string;
}

export interface TokenGolfData {
  target_description: string;
  target_output: string;
  verification_prompt: string;
  max_tokens_allowed: number;
}

export interface BugFixData {
  code: string;
  language: string;
  task: string;
  bug_description: string;
  bug_location: string;
  expected_fix: string;
  rubric: string;
}

export interface ArchitectureOption {
  id: "A" | "B" | "C";
  title: string;
  description: string;
}

export interface ArchitecturePickData {
  scenario: string;
  options: ArchitectureOption[];
  correct_ranking: Array<"A" | "B" | "C">;
  explanations: Record<"A" | "B" | "C", string>;
}

export interface UIReproductionData {
  target_screenshot_url: string;
  target_html_css: string;
  description: string;
  rubric: string;
}

export interface DistributedDebugData {
  repo_url: string;
  starter_branch: string;
  failing_test_path: string;
  scenario: string;
  hidden_root_cause: string;
  par_tool_calls: number;
  task_budget_tokens: number;
  rubric: string;
}

export interface SystemDesignBuildData {
  spec: string;
  starter_repo_url?: string;
  acceptance_tests_path: string;
  required_decision_points: string[];
  load_probe_command?: string;
  task_budget_tokens: number;
  rubric: string;
}

export interface AgentOrchestrationToolSpec {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  scoring_role: "subgoal" | "side_effect" | "final_output";
}

export interface AgentOrchestrationData {
  goal: string;
  eval_fixture_id: string;
  /** Inline fixture or URL the agent fetches at run-time (raw JSON URL is fine). */
  eval_fixture_payload?: string;
  required_tools: AgentOrchestrationToolSpec[];
  forbidden_tools?: string[];
  task_budget_tokens: number;
  perturbation_count: number;
  pass_threshold: number;
  rubric: string;
}

export type ChallengeData =
  | SpecToPromptData
  | TokenGolfData
  | BugFixData
  | ArchitecturePickData
  | UIReproductionData
  | DistributedDebugData
  | SystemDesignBuildData
  | AgentOrchestrationData;

export interface ChallengeRecord<T extends ChallengeData = ChallengeData> {
  id: string;
  code: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  rating: number;
  title: string;
  description: string;
  instructions?: string;
  challenge_data: T;
  created_at?: string;
  updated_at?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  challenges_solved: number;
  avg_accuracy: number;
  avg_token_efficiency: number;
  avg_time_seconds: number;
  avg_combined_score: number;
  total_score: number;
  isCurrentUser?: boolean;
}

export interface ContestRecord {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  challenge_ids: string[];
  share_code: string;
  status: "upcoming" | "active" | "completed";
  is_public: boolean;
}

export interface RecruiterTestRecord {
  id: string;
  title: string;
  description: string;
  challenge_ids: string[];
  time_limit_minutes: number;
  share_code: string;
  is_active: boolean;
  proctoring_enabled: boolean;
}

export interface PromptSubmission {
  prompt: string;
  token_count: number;
}

export interface AIResponse {
  content: string;
  tokens: number;
}

export interface SubmissionRecord {
  id: string;
  challenge_id: string;
  user_id: string;
  context_type: SubmissionContext;
  context_id?: string | null;
  prompts: PromptSubmission[];
  ai_responses?: AIResponse[] | null;
  user_ranking?: Array<"A" | "B" | "C"> | null;
  generated_screenshot_url?: string | null;
  accuracy_score?: number | null;
  token_score?: number | null;
  time_taken_seconds?: number | null;
  combined_score?: number | null;
  judge_feedback?: Record<string, unknown> | null;
  status: "pending" | "running" | "judging" | "completed" | "error";
  created_at?: string;
  completed_at?: string | null;
}

export interface DashboardSnapshot {
  totalScore: number;
  solved: number;
  rank: number;
  scoreChange: string;
  solvedChange: string;
  rankChange: string;
  recentSubmissionIds: string[];
  categoryProgress: Record<ChallengeCategory, number>;
}
