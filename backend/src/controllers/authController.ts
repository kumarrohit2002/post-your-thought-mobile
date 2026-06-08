import { Request, Response, NextFunction } from "express";
import { FirebaseService } from "../services/firebaseService";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { User } from "../models/userModel";

export class AuthController {
  static async signUp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { name, email, password, phoneNumber } = req.body;

    // Simple validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: name, email, and password are required.",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
      return;
    }

    try {
      const user = await FirebaseService.signUp(
        email,
        password,
        name,
        phoneNumber
      );
      res.status(201).json({
        success: true,
        message: "User registered successfully.",
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create user.",
        code: error.code,
      });
    }
  }

  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
      return;
    }

    try {
      const authData = await FirebaseService.login(email, password);
      res.status(200).json({
        success: true,
        message: "Login successful.",
        data: authData,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || "Authentication failed.",
      });
    }
  }

  static async googleSignIn(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({
        success: false,
        message: "Google ID Token is required.",
      });
      return;
    }

    try {
      const authData = await FirebaseService.googleLogin(idToken);
      res.status(200).json({
        success: true,
        message: "Google sign-in successful.",
        data: authData,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || "Google authentication failed.",
      });
    }
  }

  static async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const uid = req.user?.uid;

    if (!uid) {
      res.status(401).json({
        success: false,
        message: "User not authenticated.",
      });
      return;
    }

    try {
      const profile = await FirebaseService.getProfile(uid);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve user profile.",
      });
    }
  }

  static async savePushToken(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const uid = req.user?.uid;
    const { pushToken } = req.body;

    if (!uid) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    if (!pushToken || typeof pushToken !== "string") {
      res.status(400).json({ success: false, message: "Push token is required and must be a string." });
      return;
    }

    try {
      await User.updateOne(
        { uid },
        { $addToSet: { pushTokens: pushToken } }
      );

      res.status(200).json({
        success: true,
        message: "Push token registered successfully.",
      });
    } catch (error: any) {
      console.error("Error registering push token:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to register push token.",
      });
    }
  }

  static async removePushToken(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const uid = req.user?.uid;
    const { pushToken } = req.body;

    if (!uid) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    if (!pushToken || typeof pushToken !== "string") {
      res.status(400).json({ success: false, message: "Push token is required." });
      return;
    }

    try {
      await User.updateOne(
        { uid },
        { $pull: { pushTokens: pushToken } }
      );

      res.status(200).json({
        success: true,
        message: "Push token removed successfully.",
      });
    } catch (error: any) {
      console.error("Error removing push token:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to remove push token.",
      });
    }
  }

  static async updateNotificationSettings(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const uid = req.user?.uid;
    const { newPosts } = req.body;

    if (!uid) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    if (typeof newPosts !== "boolean") {
      res.status(400).json({ success: false, message: "newPosts preference must be a boolean." });
      return;
    }

    try {
      await User.updateOne(
        { uid },
        { $set: { "notificationSettings.newPosts": newPosts } }
      );

      res.status(200).json({
        success: true,
        message: "Notification preferences updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update notification preferences.",
      });
    }
  }
}
