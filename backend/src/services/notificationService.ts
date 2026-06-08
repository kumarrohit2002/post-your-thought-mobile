import { User } from "../models/userModel";
import { Notification } from "../models/notificationModel";

export class NotificationService {
  /**
   * Process a background job to notify all users of a new post.
   */
  static async processNewPostNotification(data: {
    postId: string;
    authorId: string;
    authorName: string;
    content: string;
  }): Promise<void> {
    const { postId, authorId, authorName, content } = data;

    // 1. Fetch all users who want post notifications, excluding the author
    const users = await User.find({
      uid: { $ne: authorId },
      "notificationSettings.newPosts": { $ne: false },
      pushTokens: { $exists: true, $ne: [] },
    });

    if (!users || users.length === 0) {
      console.log("[NotificationService] No eligible users to notify.");
      return;
    }

    const tokenToUidMap: { [token: string]: string } = {};
    const allTokens: string[] = [];
    const uidsToNotify: string[] = [];

    users.forEach((u) => {
      uidsToNotify.push(u.uid);
      if (u.pushTokens) {
        u.pushTokens.forEach((token) => {
          if (token && token.trim() !== "") {
            allTokens.push(token);
            tokenToUidMap[token] = u.uid;
          }
        });
      }
    });

    if (allTokens.length === 0) {
      console.log("[NotificationService] No push tokens found for eligible users.");
      return;
    }

    console.log(
      `[NotificationService] Sending push notifications to ${allTokens.length} tokens for post ${postId}...`
    );

    const title = `New Thought by ${authorName}`;
    const body = content.length > 100 ? `${content.substring(0, 97)}...` : content;

    // 2. Chunk tokens (Expo limits batches to 100 messages)
    const chunkSize = 100;
    for (let i = 0; i < allTokens.length; i += chunkSize) {
      const chunk = allTokens.slice(i, i + chunkSize);
      await this.sendNotificationChunk(chunk, title, body, postId, tokenToUidMap);
    }

    // 3. Store notification history records in DB for in-app inbox
    try {
      const notificationRecords = uidsToNotify.map((uid) => ({
        userId: uid,
        title,
        body,
        postId,
        isRead: false,
      }));

      if (notificationRecords.length > 0) {
        await Notification.insertMany(notificationRecords);
        console.log(
          `[NotificationService] Saved ${notificationRecords.length} history records in database.`
        );
      }
    } catch (err) {
      console.error("[NotificationService] Failed to write notification history:", err);
    }
  }

  /**
   * Send a batch of up to 100 notifications to the Expo Push API.
   */
  private static async sendNotificationChunk(
    tokens: string[],
    title: string,
    body: string,
    postId: string,
    tokenToUidMap: { [token: string]: string }
  ): Promise<void> {
    const messages = tokens.map((token) => ({
      to: token,
      sound: "default",
      title,
      body,
      data: {
        type: "new_post",
        postId,
      },
    }));

    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(
          `[NotificationService] Expo API returned HTTP ${response.status}:`,
          errText
        );
        return;
      }

      const result = (await response.json()) as any;
      if (result && Array.isArray(result.data)) {
        for (let i = 0; i < result.data.length; i++) {
          const ticket = result.data[i];
          const token = tokens[i];

          if (ticket.status === "error") {
            console.error(
              `[NotificationService] Expo push ticket error for token ${token}:`,
              ticket.message
            );

            // Handle DeviceNotRegistered - remove from user's record
            if (ticket.details?.error === "DeviceNotRegistered") {
              const uid = tokenToUidMap[token];
              if (uid) {
                await this.pruneInvalidToken(uid, token);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("[NotificationService] Failed to send notification batch to Expo:", error);
    }
  }

  /**
   * Helper to remove an invalid push token from the user's database record.
   */
  private static async pruneInvalidToken(uid: string, token: string): Promise<void> {
    try {
      await User.updateOne({ uid }, { $pull: { pushTokens: token } });
      console.log(`[NotificationService] Automatically pruned unregistered token: ${token} for user: ${uid}`);
    } catch (err) {
      console.error(
        `[NotificationService] Failed to prune token ${token} for user ${uid}:`,
        err
      );
    }
  }
}
