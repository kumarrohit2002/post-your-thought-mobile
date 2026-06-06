import { Router } from "express";
import { PostController } from "../controllers/postController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Apply authentication middleware to all post-related endpoints
router.use(authMiddleware as any);

// Post routing definitions
router.post("/", PostController.createPost);
router.get("/", PostController.getPosts);
router.get("/:id", PostController.getPost);
router.delete("/:id", PostController.deletePost);

// Post interaction routing
router.patch("/:id/like", PostController.toggleLike);

// Post comments routing
router.post("/:id/comment", PostController.addComment);
router.delete("/:postId/comment/:commentId", PostController.deleteComment);

export default router;
