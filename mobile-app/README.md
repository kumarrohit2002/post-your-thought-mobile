# 📱 PostYourThought Mobile Client (React Native + Expo)

This directory contains the **PostYourThought** frontend mobile application built with **React Native**, **Expo Router**, **TypeScript**, and **Tailwind CSS (NativeWind v4)**.

---

## 🚀 Getting Started

### 1. Installation
Install all mobile app dependencies:
```bash
npm install
```

### 2. Configuration
Create a `.env` file in this directory and specify your backend URL (if using a hosted backend). If left blank, it automatically resolves to your local computer's IP address:
```env
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
```

### 3. Launching Development Server
Start the Expo Metro bundler:
```bash
npm start
```
Use **Expo Go** on your physical iOS/Android device to scan the QR code and interact with the application.

---

## 📂 Project Structure Details

- **`app/`** (Routing Screens):
  - **`_layout.tsx`**: Sets up global providers (`AuthProvider`, `QueryClientProvider`) and handles auth state redirects via `AuthGuard`.
  - **`index.tsx`**: Main feed view displaying scrollable thoughts, pulling to refresh, and load-more pagination.
  - **`login.tsx` / `signup.tsx`**: User login and registrations.
  - **`profile.tsx`**: Profile summary showing user profile data and their own thoughts feed.
  - **`create-post.tsx`**: Form to share a new thought with character limits.
  - **`post/[id].tsx`**: Details page displaying the full post and its comments thread.

- **`src/components/`** (Reusable UI Elements):
  - **`Avatar.tsx`**: Generates circular avatars displaying user initials using deterministic background colors.
  - **`PostCard.tsx`**: Card for thoughts displaying liking and commenting counters.
  - **`CommentCard.tsx`**: Layout row representing comments with delete options.
  - **`EmptyState.tsx`**: Reusable view for empty pages/feeds.
  - **`Loader.tsx`**: Elegant shimmering loader skeleton.
  - **`ScreenWrapper.tsx`**, **`Button.tsx`**, **`Input.tsx`**: Form controls.

- **`src/hooks/`**:
  - **`usePostHooks.ts`**: React Query hooks for fetching posts and comments. Includes **optimistic cache updates** for instant toggle like indicators.
  - **`useAuthMutations.ts`**: Queries/mutations for session logins and signups.

- **`src/services/`**:
  - **`postService.ts`** & **`authService.ts`**: API service requests built on top of the centralized axios client (`api.ts`).

---

## ⚙️ Running Target Builds (Optional)

To test Google Sign-in or compile a native standalone app:
```bash
# Android compilation
npx expo run:android

# iOS compilation
npx expo run:ios
```
