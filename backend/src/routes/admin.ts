import type { Request } from "express";
import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../config/supabase";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/http";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [{ count: profilesCount }, { count: submissionsCount }, { count: contestsCount }] =
      await Promise.all([
        supabaseAdmin
          .from("profiles")
          .select("*", { count: "exact", head: true }),
        supabaseAdmin
          .from("submissions")
          .select("*", { count: "exact", head: true }),
        supabaseAdmin
          .from("contests")
          .select("*", { count: "exact", head: true })
          .in("status", ["upcoming", "active"]),
      ]);

    res.json({
      stats: {
        total_users: profilesCount ?? 0,
        total_submissions: submissionsCount ?? 0,
        active_contests: contestsCount ?? 0,
      },
    });
  }),
);

router.post(
  "/contests",
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

router.put(
  "/contests/:id",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        title: z.string().min(3).optional(),
        description: z.string().optional(),
        scheduled_at: z.string().optional(),
        duration_minutes: z.number().int().positive().optional(),
        challenge_ids: z.array(z.string().uuid()).optional(),
        is_public: z.boolean().optional(),
        status: z.enum(["upcoming", "active", "completed"]).optional(),
      })
      .parse(req.body);

    const { data, error } = await supabaseAdmin
      .from("contests")
      .update(body)
      .eq("id", String(req.params.id))
      .select("*")
      .single();

    if (error) throw error;

    res.json({ contest: data });
  }),
);

export default router;
