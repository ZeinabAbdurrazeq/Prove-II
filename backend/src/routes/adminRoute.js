import { Router } from "express";
import {
  adminLogin,
  getDashboardStats,
  getSessionsOverTime,
  getInterviewsPerDay,
  getAllUsers,
  createAdminUser,
  updateAdminUser,
  updateUserRole,
  deleteAdminUser,
  getAllSessions,
  getAllAiInterviews,
  getAllSubmissions,
  getTopCandidates,
  getProblemsStats,
} from "../controllers/adminController.js";
import {
  createAdminProblem,
  deleteAdminProblem,
  getAdminProblems,
  updateAdminProblem,
} from "../controllers/adminProblemController.js";
import {
  createAdminBlogPost,
  deleteAdminBlogPost,
  getAdminBlogPosts,
  updateAdminBlogPost,
} from "../controllers/blogController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = Router();

router.post("/login", adminAuth, adminLogin);

router.use(adminAuth);

router.get("/stats/dashboard", getDashboardStats);
router.get("/stats/sessions-over-time", getSessionsOverTime);
router.get("/stats/interviews-per-day", getInterviewsPerDay);
router.get("/users", getAllUsers);
router.post("/users", createAdminUser);
router.put("/users/:userId", updateAdminUser);
router.patch("/users/:userId/role", updateUserRole);
router.delete("/users/:userId", deleteAdminUser);
router.get("/sessions", getAllSessions);
router.get("/ai-interviews", getAllAiInterviews);
router.get("/submissions", getAllSubmissions);
router.get("/top-candidates", getTopCandidates);
router.get("/problems-stats", getProblemsStats);
router.get("/problems", getAdminProblems);
router.post("/problems", createAdminProblem);
router.put("/problems/:id", updateAdminProblem);
router.delete("/problems/:id", deleteAdminProblem);
router.get("/blog-posts", getAdminBlogPosts);
router.post("/blog-posts", createAdminBlogPost);
router.put("/blog-posts/:id", updateAdminBlogPost);
router.delete("/blog-posts/:id", deleteAdminBlogPost);

export default router;
