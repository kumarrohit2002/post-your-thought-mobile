# 🚀 expo-express-firebase-auth-starter

A production-ready full-stack authentication boilerplate pairing **React Native (Expo)** with a **Node.js (Express) backend**, integrated with **Firebase Admin SDK** (for identity verification) and **MongoDB** (for custom user database persistence).

This starter kit features a responsive design styled with **Tailwind CSS (NativeWind v4)**, global state management via **React Query**, dynamic local IP resolution for frictionless physical device testing, and a robust fallback layer allowing development inside **Expo Go** without native module crashes.

---

## 🏗️ Architecture & Auth Flow
Instead of connecting the mobile client directly to Firebase (which restricts server-side logic, custom database tables, and logging), this boilerplate uses a **Decoupled API Architecture**:

```mermaid
sequenceDiagram
    participant Mobile Client (Expo)
    participant Express API (NodeJS)
    participant Firebase Auth REST
    participant MongoDB
    
    Mobile Client (Expo)->>Express API (NodeJS): POST /api/auth/login (email, password)
    Express API (NodeJS)->>Firebase Auth REST: Sign-in request with API Key
    Firebase Auth REST-->>Express API (NodeJS): Return User & ID Token (JWT)
    Express API (NodeJS)-->>Mobile Client (Expo): Return Session ID Token (JWT)
    
    Note over Mobile Client (Expo): AsyncStorage.setItem('auth_token', token)
    
    Mobile Client (Expo)->>Express API (NodeJS): GET /api/auth/profile (Headers: Authorization Bearer JWT)
    Express API (NodeJS)->>Express API (NodeJS): Verify JWT Signature via Firebase Admin SDK
    Express API (NodeJS)->>MongoDB: Fetch custom profile data matching Firebase UID
    MongoDB-->>Express API (NodeJS): Return user database profile record
    Express API (NodeJS)-->>Mobile Client (Expo): Return Profile JSON
```

---

## 📂 Project Directory Structure

```text
├── authexpotemp/           # 📱 FRONTEND MOBILE APP (React Native / Expo)
│   ├── app/                # File-based routes (Expo Router layout, dashboard, login, signup)
│   │   ├── _layout.tsx     # Route protector guard & context provider wrappers
│   │   ├── index.tsx       # Secure Home Dashboard (User Profile & Logout actions)
│   │   ├── login.tsx       # Login screen (Email/Password & safe-bypassed Google Sign-In)
│   │   └── signup.tsx      # Sign up screen
│   ├── src/
│   │   ├── components/     # Custom premium UI components (Button, Input, ScreenWrapper)
│   │   ├── context/        # AuthContext.tsx (Session state & safe dynamic native require)
│   │   ├── hooks/          # React Query hook mutations (useLoginMutation, useUserProfileQuery)
│   │   ├── providers/      # Global client providers wrapper (React Query & Auth Context)
│   │   ├── services/       # axios client configuration (automatic JWT injection)
│   │   └── types/          # TypeScript definitions for auth and user details
│   ├── app.json            # Expo configuration (including Google Sign-In plugin)
│   ├── tailwind.config.js  # Tailwind stylesheet settings
│   └── tsconfig.json       # TypeScript configuration
│
├── backend/                # ⚡ BACKEND SERVER (Node.js / Express / TypeScript)
│   ├── src/
│   │   ├── config/         # MongoDB and Firebase Admin SDK initialization configurations
│   │   ├── controllers/    # API controllers containing core auth logic handlers
│   │   ├── middlewares/    # Custom Express middlewares (JWT verification & validation guards)
│   │   ├── models/         # Mongoose DB User schema definition (linked to Firebase UID)
│   │   ├── routes/         # Router endpoints declaration
│   │   ├── services/       # Business logic (REST requests directly to Firebase API endpoints)
│   │   ├── app.ts          # Express application initialization & middleware registration
│   │   └── server.ts       # Server launcher entry point
│   ├── package.json        # Server scripts and packages
│   └── tsconfig.json       # TypeScript configuration
```

---

## 🛠️ Step-by-Step Initial Setup Guide

### 1. Firebase Project Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Navigate to **Build** > **Authentication** and select the **Sign-in method** tab:
   * **Email/Password**: Enable it.
   * **Google**: Enable it.
3. In **Project Settings** (gear icon) > **General**:
   * Copy the **Web API Key** (this is your `FIREBASE_WEB_API_KEY`).
   * Scroll down and click **Add App** (select Android). Add your package name (e.g., `com.username.app`).
4. Go to **Service Accounts** > click **Generate new private key** (JSON).
   * Keep this JSON safe. You will copy `project_id`, `client_email`, and the `private_key` from it into the backend environment.

### 2. Backend Config & Launch (`/backend`)
1. Create a `backend/.env` file (copy contents from `backend/.env.example`):
   ```ini
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/auth_db
   
   FIREBASE_WEB_API_KEY=your_firebase_web_api_key
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
   ```
2. Run these commands:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

### 3. Mobile App Config & Launch (`/authexpotemp`)
1. Create an `authexpotemp/.env` file (copy contents from `authexpotemp/.env.example`):
   ```ini
   # Optional: Set a production domain here (e.g. https://myapi.com).
   # If left blank, it automatically resolves to your local computer's IP for development.
   EXPO_PUBLIC_API_URL=
   
   # Your Firebase Google Sign-in Web Client ID
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
   ```
2. Run these commands:
   ```bash
   cd authexpotemp
   npm install
   npx expo start -c
   ```
3. Open **Expo Go** on your physical phone (or emulator) and scan the QR code to run the app.

---

## 📲 Local Compilation & Google Sign-In Setup

Because `@react-native-google-signin/google-signin` contains custom native libraries, Google Sign-In is automatically bypassed/disabled inside the standard **Expo Go** client to prevent developer runtime crashes. 

To test Google Sign-in, you must compile a native **Development Build** or **Production APK**:

1. **Register SHA-1 Fingerprint in Firebase:**
   * Generate your development signature fingerprint:
     ```bash
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```
   * Copy the **SHA-1** fingerprint and paste it under **Your Apps** (Android App Settings) in your Firebase Console.
   * Download the updated `google-services.json` file and place it in the `/authexpotemp` root folder.
2. **Build and Run APK Locally:**
   * Connect your physical Android phone (ensure **USB Debugging** is turned on) or start an emulator.
   * Run the compile command:
     ```bash
     npx expo run:android
     ```
   * The APK will compile and automatically install on your device. The debug `.apk` file will be generated at:
     `authexpotemp/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🛠️ How to Customize this Template (Adding New Features)

When you are ready to build your own production application on top of this starter, follow this pattern to expand features:

### 1. How to Add a New Database Collection & Endpoint (Backend)
1. **Create the Model**: In `backend/src/models/`, create a new schema file (e.g., `postModel.ts`):
   ```typescript
   import mongoose, { Schema, Document } from "mongoose";
   
   export interface IPost extends Document {
     userId: string;
     title: string;
     content: string;
     createdAt: Date;
   }
   
   const PostSchema: Schema = new Schema({
     userId: { type: String, required: true },
     title: { type: String, required: true },
     content: { type: String, required: true },
     createdAt: { type: Date, default: Date.now }
   });
   
   export const Post = mongoose.model<IPost>("Post", PostSchema);
   ```
2. **Create the Controller**: In `backend/src/controllers/`, create a controller file (e.g., `postController.ts`):
   ```typescript
   import { Request, Response } from "express";
   import { Post } from "../models/postModel";
   
   export const createPost = async (req: Request, res: Response): Promise<void> => {
     try {
       const { title, content } = req.body;
       const userId = req.user?.uid; // Automatically populated by authMiddleware!
       
       const newPost = new Post({ userId, title, content });
       await newPost.save();
       res.status(201).json(newPost);
     } catch (error: any) {
       res.status(500).json({ message: error.message });
     }
   };
   ```
3. **Add the Route**: Create routes in `backend/src/routes/postRoutes.ts`:
   ```typescript
   import express from "express";
   import { createPost } from "../controllers/postController";
   import { verifyToken } from "../middlewares/authMiddleware";
   
   const router = express.Router();
   router.post("/", verifyToken, createPost); // Protected route!
   
   export default router;
   ```
4. **Register in `app.ts`**: Import and mount your route in `backend/src/app.ts`:
   ```typescript
   import postRoutes from "./routes/postRoutes";
   app.use("/api/posts", postRoutes);
   ```

### 2. How to Consume the New Endpoint in the Mobile App (Frontend)
1. **Define Types**: In `authexpotemp/src/types/post.ts`, add the type definition:
   ```typescript
   export interface PostData {
     _id?: string;
     title: string;
     content: string;
     createdAt?: string;
   }
   ```
2. **Add API Call**: In `authexpotemp/src/services/postService.ts`, define the HTTP method:
   ```typescript
   import api from "./api"; // Custom Axios client (attaches authorization headers automatically!)
   import { PostData } from "../types/post";
   
   export const PostService = {
     createPost: async (post: PostData): Promise<PostData> => {
       const response = await api.post("/posts", post);
       return response.data;
     }
   };
   ```
3. **Create Custom Mutation Hook**: In `authexpotemp/src/hooks/usePostMutations.ts`:
   ```typescript
   import { useMutation, useQueryClient } from "@tanstack/react-query";
   import { PostService } from "../services/postService";
   
   export const useCreatePostMutation = () => {
     const queryClient = useQueryClient();
     
     return useMutation({
       mutationFn: PostService.createPost,
       onSuccess: () => {
         // Invalidate queries to auto-update screens displaying lists of posts
         queryClient.invalidateQueries({ queryKey: ["posts"] });
       }
     });
   };
   ```
4. **Render in UI**: Create or update your router screens under `/app` to collect inputs and invoke the hook:
   ```typescript
   const createPostMutation = useCreatePostMutation();
   
   const handleSubmit = () => {
     createPostMutation.mutate({ title, content }, {
       onSuccess: () => {
         console.log("Post created successfully!");
       }
     });
   };
   ```

---

## ⚡ Key Highlights Built-in
* **Security**: Automatic Axios JWT interception using secure Bearer injection.
* **UX/UI Excellence**: Responsive design layouts using modern styling conventions and interactive UI touch-point indicators.
* **Auto IP Bindings**: Metro bundler IP addresses are dynamically matched on startup so you don't have to manually update config files on different networks.
* **Clean Logout**: Calls `GoogleSignin.signOut()` conditionally to ensure account switcher selections appear on the next Google OAuth attempts.
