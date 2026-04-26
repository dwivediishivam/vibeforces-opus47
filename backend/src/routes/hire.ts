import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../config/supabase";
import { asyncHandler } from "../utils/http";

const router = Router();

router.post(
  "/leads",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        company_name: z.string().min(2).max(160),
        contact_name: z.string().min(2).max(120),
        email: z.string().email(),
        phone: z.string().max(40).optional().default(""),
        expected_candidates: z.coerce.number().int().positive().optional(),
        plan_interest: z.string().max(80).optional().default(""),
        needs_custom_questions: z.boolean().default(false),
        message: z.string().max(2000).optional().default(""),
      })
      .parse(req.body);

    const { data, error } = await supabaseAdmin
      .from("hire_leads")
      .insert(body)
      .select("id")
      .single();

    if (error) throw error;

    res.status(201).json({ lead: data });
  }),
);

export default router;
