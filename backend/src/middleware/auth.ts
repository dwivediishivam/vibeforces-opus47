import type { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase";
import type { UserRole } from "../types";

function getBearerToken(header?: string) {
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({ error: "Missing Authorization header." });
    return;
  }

  const { data: userData, error: userError } =
    await supabaseAdmin.auth.getUser(token);

  if (userError || !userData.user) {
    res.status(401).json({ error: "Invalid or expired session token." });
    return;
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, username, display_name, role, avatar_url, recruiter_plan, recruiter_test_limit, recruiter_candidate_limit")
    .eq("id", userData.user.id)
    .single();

  if (profileError || !profile) {
    res.status(403).json({ error: "Profile not found for authenticated user." });
    return;
  }

  req.auth = {
    userId: userData.user.id,
    token,
    profile,
  };

  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    if (!roles.includes(req.auth.profile.role)) {
      res.status(403).json({ error: "Insufficient permissions." });
      return;
    }

    next();
  };
}
