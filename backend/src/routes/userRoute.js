import express from "express";
import {
  getLeaderboard,
  getMyScoreSummary,
  getMySolvedProblems,
} from "../controllers/userController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/leaderboard", protectRoute, getLeaderboard);
router.get("/me/score-summary", protectRoute, getMyScoreSummary);
router.get("/me/solved-problems", protectRoute, getMySolvedProblems);

export default router;
