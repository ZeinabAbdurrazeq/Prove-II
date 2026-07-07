import { Router } from "express";
import {
  addCommunityComment,
  createCommunityPost,
  deleteCommunityComment,
  deleteMyCommunityPost,
  getPublishedPostBySlug,
  getPublishedPosts,
  getMyCommunityPosts,
  reactToCommunityPost,
  updateCommunityComment,
  updateMyCommunityPost,
} from "../controllers/blogController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = Router();

router.get("/", getPublishedPosts);
router.get("/community/me", protectRoute, getMyCommunityPosts);
router.post("/community", protectRoute, createCommunityPost);
router.put("/community/:id", protectRoute, updateMyCommunityPost);
router.delete("/community/:id", protectRoute, deleteMyCommunityPost);
router.post("/community/:id/reactions", protectRoute, reactToCommunityPost);
router.post("/community/:id/comments", protectRoute, addCommunityComment);
router.put(
  "/community/:postId/comments/:commentId",
  protectRoute,
  updateCommunityComment,
);
router.delete(
  "/community/:postId/comments/:commentId",
  protectRoute,
  deleteCommunityComment,
);
router.get("/:slug", getPublishedPostBySlug);

export default router;
