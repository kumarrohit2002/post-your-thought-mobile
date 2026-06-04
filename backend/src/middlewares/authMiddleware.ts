import { Request, Response, NextFunction } from "express";
import { auth, isConfigured } from "../config/firebase";

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    [key: string]: any;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message:
        "Access Denied. No token provided or invalid format (Bearer token expected).",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!isConfigured || !auth) {
    res.status(500).json({
      success: false,
      message: "Authentication service is not configured on the backend.",
    });
    return;
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    next();
  } catch (error: any) {
    console.error("Token verification error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
      error: error.message,
    });
  }
};
