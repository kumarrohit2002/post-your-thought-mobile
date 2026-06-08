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

### 🔔 Asynchronous Push Notification Flow

When a user creates a new post, the notification dispatching is decoupled from the main HTTP API request to keep API response times minimal (<50ms). The background queue and delivery worker follow this sequence:

```mermaid
sequenceDiagram
    autonumber
    actor Creator as User A (Post Creator)
    participant Client as Mobile Client (Expo)
    participant API as Express API Server
    participant DB as MongoDB (Mongoose)
    participant Worker as Background Job Worker
    participant Expo as Expo Push Service
    actor Recipient as User B (Notified User)

    %% 1. Post Creation Flow
    Creator->>Client: Clicks "Post Thought"
    Client->>API: POST /api/posts (Content + Auth JWT)
    API->>DB: Save Post Document
    DB-->>API: Saved Post
    API->>DB: Job.create(send_new_post_notification)
    Note over API: Non-Blocking Queuing
    API-->>Client: HTTP 201 (Post Created Successfully)
    Client-->>Creator: Renders New Post (Feed Update)

    %% 2. Background Queue Execution Flow
    loop Every 5 Seconds (Worker Poll)
        Worker->>DB: Find and Lock Pending Job (status: pending -> processing)
        DB-->>Worker: Job Payload
        
        rect rgb(20, 20, 30)
            Note over Worker: Execute Notification Job
            Worker->>DB: Find eligible recipients (exclude author, settings.newPosts != false)
            DB-->>Worker: List of Users & Push Tokens
            Worker->>Worker: Chunk tokens into batches of 100
            
            Worker->>Expo: POST /--/api/v2/push/send (100 messages/batch)
            Expo-->>Worker: Array of Tickets (status: ok/error)
            
            Worker->>DB: InsertMany into Notification Collection (History log)
        end

        %% 3. Token Pruning & Feedback
        alt Unregistered Device Found
            Note over Worker: Ticket error: DeviceNotRegistered
            Worker->>DB: User.updateOne (pull invalid token from pushTokens)
            DB-->>Worker: Pruned Successfully
        end
        
        Expo-->>Recipient: Dispatches Push Notification (OS Tray alert)
        Recipient->>Client: Taps Notification (payload: postId)
        Client->>Client: Navigates to /post/[id]
        
        Worker->>DB: Update Job Status (status: completed)
    end
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

## 🔔 Push Notifications & Preferences (Production-Ready)

This project contains a highly scalable, non-blocking notification engine built with Expo Push Notifications:

1. **Decoupled Asynchronous Processing**:
   - Creating a post immediately queues a background job (`send_new_post_notification`) in MongoDB via a lightweight task runner ([jobQueue.ts](file:///c:/Users/rohit/OneDrive/Desktop/rn/backend/src/services/jobQueue.ts)) and returns the API response instantly (<50ms).
   - A background worker polls the `Job` collection to process pending notification tasks without blocking the main Express thread.

2. **Bulk Chunking & Delivery**:
   - The worker queries users who have `notificationSettings.newPosts` enabled (excluding the post author).
   - Push tokens are grouped into batches of **100** (enforcing Expo's Push API chunk limit).
   - Dispatches payloads containing structured routing metadata: `{ type: "new_post", postId }`.

3. **Self-Cleaning Tokens**:
   - On dispatch, the worker inspects the Expo push tickets. If a token returns `DeviceNotRegistered`, the worker automatically deletes that token from the User's `pushTokens` array in MongoDB.

4. **In-App Inbox Tracking**:
   - A history of dispatched notifications is recorded in the `Notification` collection to power a future in-app notification center.

5. **Client-Side Deep Linking**:
   - On the mobile client, [NotificationHandler.tsx](file:///c:/Users/rohit/OneDrive/Desktop/rn/mobile-app/src/components/NotificationHandler.tsx) sets up listeners. 
   - When a notification is tapped, the app inspects the payload and uses Expo Router to navigate directly to the post details page at `/post/[id]`.

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
2. **Push Notifications setup**:
   EAS (Expo Application Services) requires a unique Project ID. Inside `mobile-app` directory, run:
   ```bash
   npx eas project:init
   ```
   Follow the login prompt to link the app to your Expo dashboard. This will add the `projectId` automatically to your `app.json` configuration.
3. Launch Mobile Client:
   ```bash
   cd mobile-app
   npm install
   npx expo start -c
   ```
4. **Important**: Since Android remote push notifications were removed from the Expo Go client in SDK 53+, you need a **Development Build** to test notifications end-to-end on Android. To install a dev client locally on your device or emulator:
   ```bash
   npx expo install expo-dev-client
   npx expo run:android
   ```

---

## 🧪 Database Models Schema Details

### User Model
```typescript
User {
  _id: ObjectId;
  uid: String;               // Firebase User UID
  name: String;
  email: String;
  phoneNumber: String;
  pushTokens: String[];      // List of push tokens registered by the user
  notificationSettings: {
    newPosts: Boolean;       // Push notifications opt-in toggle (default: true)
  };
  createdAt: Date;
}
```

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

### Notification Model
```typescript
Notification {
  _id: ObjectId;
  userId: String;       // Target user recipient UID
  title: String;
  body: String;
  postId: String;       // Linked Post ID
  isRead: Boolean;      // Defaults to false
  createdAt: Date;
}
```

### Queue Job Model
```typescript
Job {
  _id: ObjectId;
  type: String;                          // e.g. "send_new_post_notification"
  data: Object;                          // Payload arguments
  status: "pending" | "processing" | "completed" | "failed";
  attempts: Number;                      // Current retry count
  maxAttempts: Number;                   // Retry limit
  error: String;                         // Error logging for debugging
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 👨‍💻 Developed By

**Rohit Kumar**  
*Full-Stack Developer*

- 📧 **Email**: [rohitranjanrrsingh@gmail.com](mailto:rohitranjanrrsingh@gmail.com)
- 💼 **LinkedIn**: [Rohit Kumar](https://www.linkedin.com/in/rohit-full-stack-dev/)

