import { Request, Response, NextFunction } from "express";
import { FirebaseService } from "../services/firebaseService";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

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
}
