import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../config/supabase";
import { sanitizeChallenge } from "../utils/challenges";
import { asyncHandler } from "../utils/http";
import type { ChallengeRow } from "../types";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const querySchema = z.object({
      category: z.string().optional(),
      difficulty: z.string().optional(),
      search: z.string().optional(),
    });

    const query = querySchema.parse(req.query);

    let request = supabaseAdmin
      .from("challenges")
      .select("*")
      .order("rating", { ascending: true });

    if (query.category) request = request.eq("category", query.category);
    if (query.difficulty) request = request.eq("difficulty", query.difficulty);
    if (query.search) request = request.ilike("title", `%${query.search}%`);

    const { data, error } = await request;
    if (error) throw error;

    res.json({
      challenges: (data ?? []).map((challenge) =>
        sanitizeChallenge(challenge as ChallengeRow),
      ),
    });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from("challenges")
      .select("*")
      .eq("id", String(req.params.id))
      .single();

    if (error || !data) {
      res.status(404).json({ error: "Challenge not found." });
      return;
    }

    res.json({ challenge: sanitizeChallenge(data as ChallengeRow) });
  }),
);

export default router;
