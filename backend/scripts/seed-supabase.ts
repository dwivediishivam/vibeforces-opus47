import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { challengeLibrary } from "../../shared/challenge-library";
import type { ChallengeRecord } from "../../shared/types";
import {
  defaultSeedPassword,
  launchContest,
  sampleRecruiterTests,
  seedAdmin,
  seedLearners,
  seedRecruiter,
} from "../../shared/seed-data";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const rootDir = process.cwd();
const voiceNotesDir = path.join(rootDir, "frontend/public/voice-notes");
const screenshotsDir = path.join(rootDir, "frontend/public/screenshots");

const contentTypes: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function getContentType(filePath: string) {
  return contentTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

function storagePathFor(relativePath: string) {
  return relativePath.replace(/^\/+/, "");
}

async function uploadBucketDirectory(bucket: "voice-notes" | "screenshots", dir: string) {
  const urls = new Map<string, string>();
  const files = fs.readdirSync(dir);

  for (const filename of files) {
    const absolutePath = path.join(dir, filename);
    if (!fs.statSync(absolutePath).isFile()) continue;

    const objectPath = storagePathFor(filename);
    const { error } = await supabase.storage.from(bucket).upload(
      objectPath,
      fs.readFileSync(absolutePath),
      {
        upsert: true,
        contentType: getContentType(absolutePath),
      },
    );

    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    urls.set(`/${bucket}/${filename}`, data.publicUrl);
  }

  return urls;
}

function mapAssetUrl(
  source: string,
  voiceNoteUrls: Map<string, string>,
  screenshotUrls: Map<string, string>,
) {
  if (!source.startsWith("/")) return source;
  if (source.startsWith("/voice-notes/")) {
    return voiceNoteUrls.get(source) ?? source;
  }
  if (source.startsWith("/screenshots/")) {
    return screenshotUrls.get(source) ?? source;
  }
  return source;
}

function buildHostedChallenges(
  voiceNoteUrls: Map<string, string>,
  screenshotUrls: Map<string, string>,
): ChallengeRecord[] {
  return challengeLibrary.map((challenge) => {
    if (challenge.category === "spec_to_prompt") {
      return {
        ...challenge,
        challenge_data: {
          ...challenge.challenge_data,
          voice_note_url: mapAssetUrl(
            challenge.challenge_data.voice_note_url,
            voiceNoteUrls,
            screenshotUrls,
          ),
          supplementary_images: challenge.challenge_data.supplementary_images.map(
            (source) => mapAssetUrl(source, voiceNoteUrls, screenshotUrls),
          ),
        },
      };
    }

    if (challenge.category === "ui_reproduction") {
      return {
        ...challenge,
        challenge_data: {
          ...challenge.challenge_data,
          target_screenshot_url: mapAssetUrl(
            challenge.challenge_data.target_screenshot_url,
            voiceNoteUrls,
            screenshotUrls,
          ),
        },
      };
    }

    return challenge;
  });
}

async function findUserByEmail(email: string) {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (error) throw error;
  return data.users.find((user) => user.email === email) ?? null;
}

async function ensureUser(params: {
  email: string;
  password: string;
  username: string;
  displayName: string;
  role: "learner" | "recruiter" | "admin";
}) {
  let user = await findUserByEmail(params.email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: params.email,
      password: params.password,
      email_confirm: true,
      user_metadata: {
        username: params.username,
        display_name: params.displayName,
        role: params.role,
      },
    });

    if (error) throw error;
    user = data.user;
  } else {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password: params.password,
      user_metadata: {
        username: params.username,
        display_name: params.displayName,
        role: params.role,
      },
    });

    if (error) throw error;
    user = data.user;
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    username: params.username,
    display_name: params.displayName,
    role: params.role,
  });

  if (profileError) throw profileError;

  return user;
}

function buildSubmissions(userId: string, scoreTarget: number, solvedCount: number) {
  const challenges = challengeLibrary.slice(0, solvedCount);
  const basePerSubmission = Math.floor(scoreTarget / solvedCount);
  let runningTotal = 0;

  return challenges.map((challenge, index) => {
    const isLast = index === challenges.length - 1;
    const combinedScore = isLast
      ? scoreTarget - runningTotal
      : basePerSubmission + (index % 3 === 0 ? 14 : index % 3 === 1 ? -9 : 5);
    runningTotal += combinedScore;

    const accuracy = Math.max(
      4.2,
      Math.min(9.7, 9.6 - index * 0.08 - scoreTarget / 40000),
    );
    const tokenScore = Math.max(48, 95 - index * 1.4);
    const timeSeconds = 75 + index * 19;

    return {
      id: randomUUID(),
      user_id: userId,
      challenge_id: challenge.id,
      context_type: "practice",
      context_id: null,
      prompts: [
        {
          prompt: `Seeded prompt for ${challenge.code}`,
          token_count: 42 + index,
        },
      ],
      ai_responses: [
        {
          response: `Seeded response for ${challenge.code}`,
          token_count: 88 + index * 2,
        },
      ],
      user_ranking: challenge.category === "architecture_pick" ? ["A", "B", "C"] : null,
      generated_screenshot_url: null,
      accuracy_score: Number(accuracy.toFixed(2)),
      token_score: Number(tokenScore.toFixed(2)),
      time_taken_seconds: timeSeconds,
      combined_score: combinedScore,
      judge_feedback: {
        seeded: true,
        feedback: "Launch seed data for leaderboard realism.",
      },
      status: "completed",
      completed_at: new Date(Date.now() - index * 3600_000).toISOString(),
    };
  });
}

async function ensureBuckets() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;

  const existing = new Set((buckets ?? []).map((bucket) => bucket.name));

  if (!existing.has("voice-notes")) {
    await supabase.storage.createBucket("voice-notes", {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
    });
  }

  if (!existing.has("screenshots")) {
    await supabase.storage.createBucket("screenshots", {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
    });
  }
}

async function main() {
  await ensureBuckets();
  const voiceNoteUrls = await uploadBucketDirectory("voice-notes", voiceNotesDir);
  const screenshotUrls = await uploadBucketDirectory("screenshots", screenshotsDir);
  const hostedChallenges = buildHostedChallenges(voiceNoteUrls, screenshotUrls);

  const adminUser = await ensureUser({
    email: seedAdmin.email,
    password: defaultSeedPassword,
    username: seedAdmin.username,
    displayName: seedAdmin.displayName,
    role: "admin",
  });

  const recruiterUser = await ensureUser({
    email: seedRecruiter.email,
    password: defaultSeedPassword,
    username: seedRecruiter.username,
    displayName: seedRecruiter.displayName,
    role: "recruiter",
  });

  const learnerUsers = await Promise.all(
    seedLearners.map(async (learner) => {
      const user = await ensureUser({
        email: learner.email,
        password: defaultSeedPassword,
        username: learner.username,
        displayName: learner.displayName,
        role: "learner",
      });

      await supabase
        .from("profiles")
        .update({
          total_score: learner.totalScore,
          challenges_solved: learner.challengesSolved,
        })
        .eq("id", user.id);

      return { learner, user };
    }),
  );

  const { error: challengeError } = await supabase
    .from("challenges")
    .upsert(hostedChallenges, { onConflict: "id" });

  if (challengeError) throw challengeError;

  const { error: contestError } = await supabase.from("contests").upsert(
    {
      ...launchContest,
      created_by: adminUser.id,
    },
    { onConflict: "id" },
  );

  if (contestError) throw contestError;

  const { error: testsError } = await supabase.from("recruiter_tests").upsert(
    sampleRecruiterTests.map((test) => ({
      ...test,
      recruiter_id: recruiterUser.id,
    })),
    { onConflict: "id" },
  );

  if (testsError) throw testsError;

  const learnerIds = learnerUsers.map(({ user }) => user.id);

  await supabase
    .from("submissions")
    .delete()
    .in("user_id", learnerIds)
    .eq("context_type", "practice");

  const seededSubmissions = learnerUsers.flatMap(({ learner, user }) =>
    buildSubmissions(user.id, learner.totalScore, learner.challengesSolved),
  );

  for (let index = 0; index < seededSubmissions.length; index += 100) {
    const batch = seededSubmissions.slice(index, index + 100);
    const { error } = await supabase.from("submissions").insert(batch);
    if (error) throw error;
  }

  const firstTest = sampleRecruiterTests[0];
  const seededAttempts = learnerUsers.slice(0, 3).map(({ user }, index) => ({
    test_id: firstTest.id,
    user_id: user.id,
    total_score: [8.2, 6.7, 5.9][index] ?? 5,
    status: index === 2 ? "in_progress" : "completed",
    started_at: new Date(Date.now() - (index + 1) * 7200_000).toISOString(),
    completed_at:
      index === 2 ? null : new Date(Date.now() - index * 5400_000).toISOString(),
  }));

  await supabase.from("test_attempts").delete().eq("test_id", firstTest.id);
  await supabase.from("test_attempts").upsert(seededAttempts, {
    onConflict: "test_id,user_id",
  });

  process.stdout.write(
    `Seed completed.\nDemo password for seeded accounts: ${defaultSeedPassword}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
