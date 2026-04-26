import { Router } from "express";
import { asyncHandler } from "../utils/http";
import {
  getChallengeLeaderboard,
  getContestLeaderboard,
  getPracticeLeaderboard,
} from "../services/leaderboard";

const router = Router();

router.get(
  "/practice",
  asyncHandler(async (_req, res) => {
    res.json({ leaderboard: await getPracticeLeaderboard() });
  }),
);

router.get(
  "/challenge/:id",
  asyncHandler(async (req, res) => {
    res.json({
      leaderboard: await getChallengeLeaderboard(String(req.params.id)),
    });
  }),
);

router.get(
  "/contest/:id",
  asyncHandler(async (req, res) => {
    res.json({ leaderboard: await getContestLeaderboard(String(req.params.id)) });
  }),
);

export default router;
