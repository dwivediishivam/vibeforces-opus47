import { challengeIds } from "./challenge-library";
import type { ContestRecord, RecruiterTestRecord } from "./types";

export const seedLearners = [
  { email: "alexkim@vibeforces.dev", username: "alexkim", displayName: "Alex Kim", totalScore: 9847, challengesSolved: 28 },
  { email: "sarah.patel@vibeforces.dev", username: "sarah_p", displayName: "Sarah Patel", totalScore: 9231, challengesSolved: 27 },
  { email: "marcus.johnson@vibeforces.dev", username: "marcusj", displayName: "Marcus Johnson", totalScore: 8654, challengesSolved: 26 },
  { email: "luna.chen@vibeforces.dev", username: "luna_c", displayName: "Luna Chen", totalScore: 7982, challengesSolved: 25 },
  { email: "raj.deshmukh@vibeforces.dev", username: "raj_d", displayName: "Raj Deshmukh", totalScore: 7445, challengesSolved: 24 },
  { email: "emily.williams@vibeforces.dev", username: "emilyw", displayName: "Emily Williams", totalScore: 6890, challengesSolved: 22 },
  { email: "tom.hernandez@vibeforces.dev", username: "tomh", displayName: "Tom Hernandez", totalScore: 6234, challengesSolved: 20 },
  { email: "priya.singh@vibeforces.dev", username: "priya_s", displayName: "Priya Singh", totalScore: 5678, challengesSolved: 19 },
  { email: "jordan.brown@vibeforces.dev", username: "jordan_b", displayName: "Jordan Brown", totalScore: 5123, challengesSolved: 17 },
  { email: "mia.zhang@vibeforces.dev", username: "mia_z", displayName: "Mia Zhang", totalScore: 4567, challengesSolved: 15 },
  { email: "david.lee@vibeforces.dev", username: "david_l", displayName: "David Lee", totalScore: 3890, challengesSolved: 14 },
  { email: "sofia.rodriguez@vibeforces.dev", username: "sofia_r", displayName: "Sofia Rodriguez", totalScore: 3234, challengesSolved: 12 },
  { email: "noah.kumar@vibeforces.dev", username: "noah_k", displayName: "Noah Kumar", totalScore: 2678, challengesSolved: 10 },
  { email: "ava.miller@vibeforces.dev", username: "ava_m", displayName: "Ava Miller", totalScore: 2012, challengesSolved: 8 },
  { email: "liam.taylor@vibeforces.dev", username: "liam_t", displayName: "Liam Taylor", totalScore: 1456, challengesSolved: 6 },
];

export const seedAdmin = {
  email: "admin@vibeforces.dev",
  username: "admin",
  displayName: "VibeForces Admin",
  role: "admin" as const,
};

export const seedRecruiter = {
  email: "techrecruiter@vibeforces.dev",
  username: "techrecruiter",
  displayName: "TechCorp Hiring",
  role: "recruiter" as const,
};

export const launchContest: ContestRecord = {
  id: "00000000-0000-4000-8000-000000010001",
  title: "VibeForces Launch Challenge",
  description:
    "The very first VibeForces contest. Test your vibe coding instincts across all five categories.",
  scheduled_at: "2026-04-18T20:00:00+05:30",
  duration_minutes: 120,
  challenge_ids: [
    challengeIds["SP-E1"],
    challengeIds["TG-M1"],
    challengeIds["BF-E2"],
    challengeIds["AP-M1"],
    challengeIds["UR-E1"],
  ],
  share_code: "launch26",
  status: "upcoming",
  is_public: true,
};

export const sampleRecruiterTests: RecruiterTestRecord[] = [
  {
    id: "00000000-0000-4000-8000-000000020001",
    title: "Frontend Developer Assessment",
    description: "A balanced screening set focused on prompt quality, debugging, and UI instincts.",
    challenge_ids: [
      challengeIds["SP-E2"],
      challengeIds["BF-M2"],
      challengeIds["UR-E2"],
      challengeIds["AP-E2"],
    ],
    time_limit_minutes: 60,
    share_code: "vf-front-60",
    is_active: true,
    proctoring_enabled: false,
  },
  {
    id: "00000000-0000-4000-8000-000000020002",
    title: "Junior Vibe Coder Test",
    description: "A wider six-question pack for entry-level candidates.",
    challenge_ids: [
      challengeIds["SP-E1"],
      challengeIds["TG-E2"],
      challengeIds["BF-E1"],
      challengeIds["AP-E1"],
      challengeIds["UR-E1"],
      challengeIds["TG-M2"],
    ],
    time_limit_minutes: 90,
    share_code: "vf-junior-90",
    is_active: true,
    proctoring_enabled: false,
  },
  {
    id: "00000000-0000-4000-8000-000000020003",
    title: "Quick Screen",
    description: "A short two-question screening pass for rapid recruiter triage.",
    challenge_ids: [challengeIds["BF-E2"], challengeIds["AP-M1"]],
    time_limit_minutes: 30,
    share_code: "vf-quick-30",
    is_active: true,
    proctoring_enabled: false,
  },
];

export const defaultSeedPassword = "VibeForces2026!";
