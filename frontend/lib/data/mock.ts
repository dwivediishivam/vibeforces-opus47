import {
  challengeLibrary,
  challengeSummaryCards,
  challengeIds,
} from "@shared/challenge-library";
import {
  defaultSeedPassword,
  launchContest,
  sampleRecruiterTests,
  seedLearners,
} from "@shared/seed-data";

export { challengeIds, challengeLibrary, challengeSummaryCards };

export const categoryLabels = {
  spec_to_prompt: "Spec-to-Prompt",
  token_golf: "Token Golf",
  bug_fix: "Bug Fix",
  architecture_pick: "Architecture Pick",
  ui_reproduction: "UI Reproduction",
  distributed_debug: "Distributed Debug",
  system_design_build: "System Build",
  agent_orchestration: "Agent Orchestration",
} as const;

export const difficultyLabels = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
} as const;

export const mockLeaderboard = seedLearners.map((learner, index) => ({
  rank: index + 1,
  user_id: `demo-user-${index + 1}`,
  username: learner.username,
  display_name: learner.displayName,
  avatar_url: null,
  challenges_solved: learner.challengesSolved,
  avg_accuracy: Number((94.2 - index * 1.9).toFixed(1)),
  avg_token_efficiency: Number((92 - index * 1.7).toFixed(1)),
  avg_time_seconds: 68 + index * 13,
  avg_combined_score: Number((351 - index * 13).toFixed(1)),
  total_score: learner.totalScore,
}));

export const mockDashboard = {
  totalScore: 5678,
  solved: 19,
  rank: 7,
  scoreChange: "+12.5%",
  solvedChange: "60%",
  rankChange: "+2",
  recentSubmissions: [
    {
      id: "recent-1",
      challengeId: challengeIds["TG-H1"],
      title: "LRU Cache",
      category: "token_golf",
      score: 8.4,
      timeAgo: "2 hours ago",
    },
    {
      id: "recent-2",
      challengeId: challengeIds["BF-M2"],
      title: "React State Mutation",
      category: "bug_fix",
      score: 7.1,
      timeAgo: "5 hours ago",
    },
    {
      id: "recent-3",
      challengeId: challengeIds["SP-E2"],
      title: "CSV Data Summarizer",
      category: "spec_to_prompt",
      score: 9.2,
      timeAgo: "Yesterday",
    },
  ],
  categoryProgress: {
    spec_to_prompt: 4,
    token_golf: 3,
    bug_fix: 2,
    architecture_pick: 4,
    ui_reproduction: 1,
  },
};

export const mockContestBanner = {
  title: launchContest.title,
  scheduled_at: launchContest.scheduled_at,
  duration_minutes: launchContest.duration_minutes,
};

export const mockRecruiterStats = {
  testsCreated: sampleRecruiterTests.length,
  candidatesTested: 12,
  avgScore: 7.2,
};

export const mockRecruiterCandidates = [
  { name: "Alice Wong", score: 8.2, accuracy: "91%", time: "42 min", status: "Completed" },
  { name: "Bob Smith", score: 6.7, accuracy: "78%", time: "58 min", status: "Completed" },
  { name: "Carol Davis", score: null, accuracy: "—", time: "—", status: "In Progress" },
];

export const demoCredentials = {
  email: "techrecruiter@vibeforces.dev",
  password: defaultSeedPassword,
};
