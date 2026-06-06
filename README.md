# 📱 PostYourThought - Full-Stack Social Media Starter

PostYourThought is a production-ready, full-stack social media application pairing a **React Native (Expo Router + TypeScript)** frontend with a **Node.js (Express) backend**, using **Firebase Admin SDK** for authentication and **MongoDB + Mongoose** for data storage.

This project was built starting from a decoupled authentication boilerplate and expanded into a full-featured micro-sharing application styled with **Tailwind CSS (NativeWind v4)**, global state management via **React Query**, dynamic local IP resolution, and **React Query optimistic UI updates** for instantaneous feedback.

---

## 🏗️ Architecture & Flow

Instead of connecting the mobile client directly to Firebase, this app uses a **Decoupled API Architecture** where Express verifies JWT tokens from Firebase Auth, queries MongoDB for custom profiles, and handles all social actions securely:

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
    
    Mobile Client (Expo)->>Express API (NodeJS): GET /api/posts (Headers: Authorization Bearer JWT)
    Express API (NodeJS)->>Express API (NodeJS): Verify JWT Signature via Firebase Admin SDK
    Express API (NodeJS)->>MongoDB: Fetch paginated feed (Latest posts first)
    MongoDB-->>Express API (NodeJS): Return paginated posts list
    Express API (NodeJS)-->>Mobile Client (Expo): Return Feed JSON
```

---

## 📂 Project Directory Structure

```text
├── mobile-app/             # 📱 FRONTEND MOBILE APP (React Native / Expo)
│   ├── app/                # File-based routes (Expo Router layouts and screens)
│   │   ├── _layout.tsx     # Route protector guard & context provider wrappers
│   │   ├── index.tsx       # 🚀 Social Feed Screen (Feed list, pull to refresh, load more, FAB)
│   │   ├── login.tsx       # Login screen (Email/Password & safe-bypassed Google Sign-In)
│   │   ├── signup.tsx      # Sign up screen
│   │   ├── profile.tsx     # Profile dashboard displaying user details & owned thoughts
│   │   ├── create-post.tsx # New post screen (multiline input, char counter, validations)
│   │   └── post/[id].tsx   # Discussion details screen (post, comments list, inline comments input)
│   ├── src/
│   │   ├── components/     # Reusable UI components (Avatar, PostCard, CommentCard, EmptyState, Loader)
│   │   ├── context/        # AuthContext.tsx (Session state & safe dynamic native require)
│   │   ├── hooks/          # React Query hook queries/mutations (usePostHooks, useAuthMutations)
│   │   ├── providers/      # Global client providers wrapper (React Query & Auth Context)
│   │   ├── services/       # postService.ts & authService.ts (attaching JWT authorization headers)
│   │   └── types/          # TypeScript definitions (post.ts & auth.ts)
│   ├── app.json            # Expo configuration
│   ├── tailwind.config.js  # Tailwind stylesheet settings
│   └── tsconfig.json       # TypeScript configuration
│
├── backend/                # ⚡ BACKEND SERVER (Node.js / Express / TypeScript)
│   ├── src/
│   │   ├── config/         # MongoDB and Firebase Admin SDK configurations
│   │   ├── controllers/    # API controllers containing core logic (authController, postController)
│   │   ├── middlewares/    # Custom Express middlewares (authMiddleware & errorMiddleware)
│   │   ├── models/         # Mongoose DB schemas (userModel & postModel)
│   │   ├── routes/         # Router endpoints declaration (authRoutes, postRoutes)
│   │   ├── services/       # Business logic (FirebaseService for signups/logins)
│   │   ├── app.ts          # Express application initialization & middleware registration
│   │   └── server.ts       # Server launcher entry point
│   ├── package.json        # Server scripts and packages
│   └── tsconfig.json       # TypeScript configuration
```

---

## 🌟 Built-in Social Media Features

### 1. Paginated Social Feed (`GET /api/posts`)
- Displays all thoughts with pull-to-refresh and a "Load More" paginated system.
- Cards show user initials in deterministically styled HSL backgrounds, timestamps, post content, and likes/comments counts.

### 2. Creation of Thoughts (`POST /api/posts`)
- A beautiful, slide-up screen.
- Restricts thoughts to **500 characters** with an active remaining count indicator.
- Disables posting if empty or exceeding limits.

### 3. Dynamic Likes Toggle (`PATCH /api/posts/:id/like`)
- One user can only like a post once. Clicking a second time unlikes it.
- Powered by **React Query Optimistic Updates** to immediately update liked status and like counters in the UI without network lag or layout flickering.

### 4. Interactive Discussion Threads (`POST /api/posts/:id/comment`)
- Clicking any card details opening a discussion view.
- Lists all comments (capped at **200 characters**) with a custom keyboard-aware input bar at the bottom.

### 5. Deletion Safeguards
- Users can delete their own posts (`DELETE /api/posts/:id`) and comments (`DELETE /api/posts/:postId/comment/:commentId`).
- Triggers alert confirmation dialogs before executing actions to prevent accidental taps.

---

## 🚀 Setup & Launch Instructions

### 1. Firebase Project Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. In **Authentication** > **Sign-in method**, enable **Email/Password**.
3. In **Project Settings** > Copy the **Web API Key** (this goes into `FIREBASE_WEB_API_KEY` in backend `.env`).
4. Go to **Service Accounts** > click **Generate new private key** (JSON). Download the credentials file.

### 2. Backend Environment Config
1. Create a `backend/.env` file:
   ```ini
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/auth_db
   
   FIREBASE_WEB_API_KEY=your_firebase_web_api_key
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
   ```
2. Launch backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

### 3. Mobile App Environment Config
1. Create a `mobile-app/.env` file:
   ```ini
   # If left blank, it automatically resolves to your local computer's IP for development.
   EXPO_PUBLIC_API_URL=
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
   ```
2. Launch Mobile Client:
   ```bash
   cd mobile-app
   npm install
   npx expo start -c
   ```
3. Open **Expo Go** on your physical phone (on the same Wi-Fi network) or emulator and scan the QR code to run the application.

---

## 🧪 Database Models Schema Details

### Post Model
```typescript
Post {
  _id: ObjectId;
  userId: String;       // Firebase User UID
  userName: String;     // User Display Name
  userAvatar: String;   // Optional Avatar URL
  content: String;      // Required, max 500 chars
  image: String;        // Optional Image URL
  likesCount: Number;   // Total likes count
  likedBy: String[];    // Array of user UIDs who liked
  comments: Comment[];  // Array of Comment subdocuments
  createdAt: Date;
  updatedAt: Date;
}
```

### Comment Sub-model
```typescript
Comment {
  _id: ObjectId;
  userId: String;       // Firebase User UID
  userName: String;     // User Display Name
  userAvatar: String;   // Optional Avatar URL
  text: String;         // Required, max 200 chars
  createdAt: Date;
}
```
