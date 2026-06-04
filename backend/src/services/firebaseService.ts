import { auth, isConfigured } from "../config/firebase";
import { User } from "../models/userModel";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phoneNumber: string;
  createdAt?: string;
}

export class FirebaseService {
  private static checkConfiguration() {
    if (!isConfigured || !auth) {
      throw new Error(
        "Firebase Admin SDK is not initialized. Please verify backend/.env configuration."
      );
    }
  }

  static async signUp(
    email: string,
    password: string,
    name: string,
    phoneNumber: string
  ): Promise<UserProfile> {
    this.checkConfiguration();

    try {
      // Firebase auth expects phone numbers in E.164 format (e.g., +919876543210)
      let formattedPhone = phoneNumber ? phoneNumber.trim() : "";

      let userRecord;
      try {
        userRecord = await auth!.createUser({
          email,
          password,
          displayName: name,
          phoneNumber: formattedPhone.startsWith("+") ? formattedPhone : undefined,
        });
      } catch (authError: any) {
        // If phone number format fails in Firebase, retry without phone in Auth
        if (authError.code === "auth/invalid-phone-number") {
          console.warn(
            "Invalid phone number format for Firebase Auth, saving to MongoDB only"
          );
          userRecord = await auth!.createUser({
            email,
            password,
            displayName: name,
          });
        } else {
          throw authError;
        }
      }

      // Save user details to local MongoDB
      const newUser = new User({
        uid: userRecord.uid,
        email: email,
        name: name,
        phoneNumber: phoneNumber || "",
      });

      await newUser.save();

      return {
        uid: newUser.uid,
        email: newUser.email,
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
        createdAt: newUser.createdAt.toISOString(),
      };
    } catch (error: any) {
      console.error("Error in FirebaseService.signUp:", error);
      throw error;
    }
  }

  static async login(email: string, password: string) {
    const apiKey = process.env.FIREBASE_WEB_API_KEY;
    if (!apiKey || apiKey === "your_firebase_web_api_key") {
      throw new Error(
        "FIREBASE_WEB_API_KEY environment variable is not configured. Please set it in backend/.env."
      );
    }

    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const data = (await response.json()) as any;

      if (!response.ok) {
        throw new Error(
          data.error?.message || "Failed to sign in with Firebase REST API"
        );
      }

      return {
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        uid: data.localId,
      };
    } catch (error: any) {
      console.error("Error in FirebaseService.login:", error);
      throw error;
    }
  }

  static async googleLogin(googleIdToken: string) {
    const apiKey = process.env.FIREBASE_WEB_API_KEY;
    if (!apiKey || apiKey === "your_firebase_web_api_key") {
      throw new Error(
        "FIREBASE_WEB_API_KEY environment variable is not configured. Please set it in backend/.env."
      );
    }

    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postBody: `id_token=${googleIdToken}&providerId=google.com`,
            requestUri: "http://localhost",
            returnIdpCredential: true,
            returnSecureToken: true,
          }),
        }
      );

      const data = (await response.json()) as any;

      if (!response.ok) {
        throw new Error(
          data.error?.message || "Failed to sign in with Google IDP via Firebase REST API"
        );
      }

      // Check if user exists in local MongoDB
      let user = await User.findOne({ uid: data.localId });
      if (!user) {
        // Create user in local MongoDB if they don't exist
        user = new User({
          uid: data.localId,
          email: data.email,
          name: data.displayName || data.email?.split("@")[0] || "Google User",
          phoneNumber: "",
        });
        await user.save();
      }

      return {
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        uid: data.localId,
      };
    } catch (error: any) {
      console.error("Error in FirebaseService.googleLogin:", error);
      throw error;
    }
  }

  static async getProfile(uid: string): Promise<UserProfile> {
    this.checkConfiguration();

    try {
      // Fetch user profile from local MongoDB
      const user = await User.findOne({ uid });

      if (!user) {
        // Fallback to Firebase Auth metadata if MongoDB profile is missing
        const userRecord = await auth!.getUser(uid);
        return {
          uid: userRecord.uid,
          email: userRecord.email || "",
          name: userRecord.displayName || "",
          phoneNumber: userRecord.phoneNumber || "",
        };
      }

      return {
        uid: user.uid,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt.toISOString(),
      };
    } catch (error: any) {
      console.error("Error in FirebaseService.getProfile:", error);
      throw error;
    }
  }
}
