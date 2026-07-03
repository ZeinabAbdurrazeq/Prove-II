import { Router } from "express";
import {
  getPublishedPostBySlug,
  getPublishedPosts,
} from "../controllers/blogController.js";

const router = Router();

router.get("/", getPublishedPosts);
router.get("/:slug", getPublishedPostBySlug);

export default router;
