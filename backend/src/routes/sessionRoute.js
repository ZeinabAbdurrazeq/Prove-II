import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createSession,
  getActiveSession,
  getMyRecentSession,
  getSessionById,
  joinSession,
  leaveSession,
  endSession,
  updateSessionProblem,
  notifySessionStarted,
} from "../controllers/sessionController.js";

const router = express.Router();

router.post("/", protectRoute, createSession);
router.get("/active", protectRoute, getActiveSession);
router.get("/my-recent", protectRoute, getMyRecentSession);

router.get("/:id", protectRoute, getSessionById);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/leave", protectRoute, leaveSession);
router.patch("/:id/problem", protectRoute, updateSessionProblem);
router.post("/:id/start-notification", protectRoute, notifySessionStarted);
router.post("/:id/end", protectRoute, endSession);

export default router;
