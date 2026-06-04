import * as admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
// Handle escaped newlines in local or production environments
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/"/g, "")
  : undefined;

const isFirebaseConfigured =
  projectId &&
  clientEmail &&
  privateKey &&
  projectId !== "your_firebase_project_id" &&
  clientEmail !== "your_firebase_client_email" &&
  !privateKey.includes("your_private_key_here");

if (!isFirebaseConfigured) {
  console.warn(
    "\x1b[33m%s\x1b[0m",
    "⚠️ WARNING: Firebase credentials are not fully configured in backend/.env. Authentication features will not function correctly."
  );
} else {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log("✅ Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error);
  }
}

export const auth = admin.apps.length ? admin.auth() : null;
export const isConfigured = !!admin.apps.length;
