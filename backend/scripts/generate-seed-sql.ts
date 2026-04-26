import fs from "node:fs";
import path from "node:path";
import { challengeLibrary } from "../../shared/challenge-library";
import { seedLearners } from "../../shared/seed-data";

const rootDir = process.cwd();
const seedDir = path.join(rootDir, "supabase/seed");

function escapeSql(value: string) {
  return value.replace(/'/g, "''");
}

function sqlString(value: string) {
  return `'${escapeSql(value)}'`;
}

function sqlJson(value: unknown) {
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

function writeChallengesSql() {
  const statements = challengeLibrary.map(
    (challenge) => `insert into public.challenges (
  id, code, category, difficulty, rating, title, description, challenge_data
) values (
  ${sqlString(challenge.id)},
  ${sqlString(challenge.code)},
  ${sqlString(challenge.category)},
  ${sqlString(challenge.difficulty)},
  ${challenge.rating},
  ${sqlString(challenge.title)},
  ${sqlString(challenge.description)},
  ${sqlJson(challenge.challenge_data)}
)
on conflict (id) do update set
  code = excluded.code,
  category = excluded.category,
  difficulty = excluded.difficulty,
  rating = excluded.rating,
  title = excluded.title,
  description = excluded.description,
  challenge_data = excluded.challenge_data;`,
  );

  fs.writeFileSync(
    path.join(seedDir, "challenges.sql"),
    `${statements.join("\n\n")}\n`,
    "utf8",
  );
}

function writeSampleUsersSql() {
  const content = `-- Demo auth users are created via scripts/seed-supabase.ts because profiles
-- reference auth.users and require seeded auth identities first.
--
-- Intended learner seed set:
${seedLearners
  .map(
    (learner) =>
      `-- ${learner.username} | ${learner.displayName} | ${learner.totalScore} pts | ${learner.challengesSolved} solved`,
  )
  .join("\n")}
`;

  fs.writeFileSync(path.join(seedDir, "sample_users.sql"), content, "utf8");
}

function writeSampleSubmissionsSql() {
  const content = `-- Practice submissions are seeded via scripts/seed-supabase.ts.
-- They depend on auth-generated user IDs, so SQL snapshots are not stable enough
-- to be the source of truth. The script creates leaderboard-ready demo attempts.
`;

  fs.writeFileSync(
    path.join(seedDir, "sample_submissions.sql"),
    content,
    "utf8",
  );
}

function main() {
  fs.mkdirSync(seedDir, { recursive: true });
  writeChallengesSql();
  writeSampleUsersSql();
  writeSampleSubmissionsSql();
  process.stdout.write("Generated SQL seed files.\n");
}

main();
