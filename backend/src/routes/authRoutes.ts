import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/signup", AuthController.signUp);
router.post("/login", AuthController.login);
router.post("/google", AuthController.googleSignIn);
router.get("/profile", authMiddleware as any, AuthController.getProfile);

export default router;
