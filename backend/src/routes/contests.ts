import type { Request } from "express";
import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../config/supabase";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/http";
import { sanitizeChallenge } from "../utils/challenges";
import type { ChallengeRow } from "../types";
import { getContestLeaderboard } from "../services/leaderboard";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabaseAdmin
      .from("contests")
      .select("*")
      .order("scheduled_at", { ascending: true });

    if (error) throw error;

    res.json({ contests: data ?? [] });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { data: contest, error } = await supabaseAdmin
      .from("contests")
      .select("*")
      .eq("id", String(req.params.id))
      .single();

    if (error || !contest) {
      res.status(404).json({ error: "Contest not found." });
      return;
    }

    const { data: challenges, error: challengeError } = await supabaseAdmin
      .from("challenges")
      .select("*")
      .in("id", contest.challenge_ids ?? []);

    if (challengeError) throw challengeError;

    res.json({
      contest,
      challenges: (challenges ?? []).map((challenge) =>
        sanitizeChallenge(challenge as ChallengeRow),
      ),
    });
  }),
);

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req: Request, res) => {
    const body = z
      .object({
        title: z.string().min(3),
        description: z.string().optional().default(""),
        scheduled_at: z.string(),
        duration_minutes: z.number().int().positive().default(120),
        challenge_ids: z.array(z.string().uuid()).min(1),
        is_public: z.boolean().default(true),
      })
      .parse(req.body);

    const { data, error } = await supabaseAdmin
      .from("contests")
      .insert({
        ...body,
        created_by: req.auth!.userId,
      })
      .select("*")
      .single();

    if (error) throw error;

    res.status(201).json({ contest: data });
  }),
);

router.post(
  "/:id/join",
  requireAuth,
  requireRole("learner"),
  asyncHandler(async (req: Request, res) => {
    const { error } = await supabaseAdmin.from("contest_participants").upsert(
      {
        contest_id: String(req.params.id),
        user_id: req.auth!.userId,
      },
      { onConflict: "contest_id,user_id" },
    );

    if (error) throw error;

    res.json({ joined: true });
  }),
);

router.get(
  "/:id/leaderboard",
  asyncHandler(async (req, res) => {
    res.json({ leaderboard: await getContestLeaderboard(String(req.params.id)) });
  }),
);

export default router;
