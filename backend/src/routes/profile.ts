import { Router } from "express";
import { supabaseAdmin } from "../config/supabase";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/http";

const router = Router();
router.use(requireAuth);

router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, username, display_name, role, avatar_url, rating, rating_peak, rating_solves, recruiter_plan, recruiter_test_limit, recruiter_candidate_limit",
      )
      .eq("id", req.auth!.userId)
      .single();

    const { data: history } = await supabaseAdmin
      .from("rating_changes")
      .select("delta, rating_before, rating_after, reason, created_at, challenge_id")
      .eq("user_id", req.auth!.userId)
      .order("created_at", { ascending: false })
      .limit(50);

    res.json({ profile, rating_history: history ?? [] });
  }),
);

export default router;
