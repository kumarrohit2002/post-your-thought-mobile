import api from "./api";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

export class NotificationService {
  /**
   * Request notification permissions and fetch the Expo Push Token.
   * Gracefully falls back with warnings if running on an emulator or if Project ID is missing.
   */
  static async registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log("[NotificationService] Must use a physical device for push notifications.");
      return null;
    }

    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#818CF8",
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("[NotificationService] Push notification permissions denied.");
        return null;
      }

      // Retrieve Expo Project ID safely
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      if (!projectId) {
        console.warn(
          "⚠️ WARNING: Expo Project ID not found. " +
            "Please configure your app.json with extra.eas.projectId or run 'eas project:init'. " +
            "Token registration skipped."
        );
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      return tokenData.data;
    } catch (error) {
      console.error("[NotificationService] Error retrieving push token:", error);
      return null;
    }
  }

  /**
   * Register push token on the backend.
   */
  static async savePushToken(pushToken: string): Promise<void> {
    try {
      await api.post("/auth/push-token", { pushToken });
      console.log("[NotificationService] Registered push token on backend.");
    } catch (error) {
      console.error("[NotificationService] Failed to save push token on backend:", error);
    }
  }

  /**
   * De-register push token on the backend (e.g. during logout).
   */
  static async removePushToken(pushToken: string): Promise<void> {
    try {
      await api.post("/auth/remove-push-token", { pushToken });
      console.log("[NotificationService] Removed push token from backend.");
    } catch (error) {
      console.error("[NotificationService] Failed to remove push token from backend:", error);
    }
  }

  /**
   * Retrieve current user notification settings.
   */
  static async getNotificationSettings(): Promise<{ newPosts: boolean }> {
    const response = await api.get("/auth/profile");
    const profile = response.data.data;
    return {
      newPosts: profile.notificationSettings?.newPosts !== false,
    };
  }

  /**
   * Update user notification preferences.
   */
  static async updateNotificationSettings(newPosts: boolean): Promise<void> {
    await api.patch("/auth/notification-settings", { newPosts });
  }
}
