import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NotificationService } from "../services/notificationService";

export function NotificationHandler() {
  const router = useRouter();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    // 1. Setup notification permissions and register push token
    const setupNotifications = async () => {
      try {
        const token = await NotificationService.registerForPushNotificationsAsync();
        if (token) {
          const storedToken = await AsyncStorage.getItem("push_token");
          // If token has changed or has never been registered, upload it to the backend
          if (storedToken !== token) {
            await NotificationService.savePushToken(token);
            await AsyncStorage.setItem("push_token", token);
          }
        }
      } catch (err) {
        console.error("[NotificationHandler] Notification setup failed:", err);
      }
    };

    setupNotifications();

    // 2. Listener for when notification is received in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("[NotificationHandler] Foreground notification received:", notification);
      }
    );

    // 3. Listener for when notification is tapped (deep-link routing)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        try {
          const data = response.notification.request.content.data;
          console.log("[NotificationHandler] Notification tapped with data:", data);

          if (data && data.type === "new_post" && data.postId) {
            console.log(`[NotificationHandler] Deep linking to post: /post/${data.postId}`);
            router.push(`/post/${data.postId}` as any);
          }
        } catch (err) {
          console.error("[NotificationHandler] Failed to route notification tap:", err);
        }
      }
    );

    // Clean up subscriptions on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return null;
}
