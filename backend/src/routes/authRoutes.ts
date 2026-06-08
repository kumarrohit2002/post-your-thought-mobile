import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/signup", AuthController.signUp);
router.post("/login", AuthController.login);
router.post("/google", AuthController.googleSignIn);
router.get("/profile", authMiddleware as any, AuthController.getProfile);
router.post("/push-token", authMiddleware as any, AuthController.savePushToken);
router.post("/remove-push-token", authMiddleware as any, AuthController.removePushToken);
router.patch("/notification-settings", authMiddleware as any, AuthController.updateNotificationSettings);

export default router;
