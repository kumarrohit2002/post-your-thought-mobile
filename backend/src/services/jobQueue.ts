import { Job } from "../models/jobModel";
import { NotificationService } from "./notificationService";

export class JobQueue {
  private static isRunning = false;
  private static intervalId: NodeJS.Timeout | null = null;

  static async addJob(type: string, data: any, maxAttempts = 3): Promise<void> {
    try {
      const job = new Job({
        type,
        data,
        maxAttempts,
        status: "pending",
      });
      await job.save();
      console.log(`[JobQueue] Job added: ${type} (${job._id})`);

      // Trigger processing immediately in a non-blocking fashion
      this.processQueue().catch((err) =>
        console.error("[JobQueue] Error during immediate processQueue:", err)
      );
    } catch (error) {
      console.error("[JobQueue] Failed to add job:", error);
    }
  }

  static startWorker(intervalMs = 5000): void {
    if (this.intervalId) return;

    console.log("[JobQueue] Starting background worker...");
    this.intervalId = setInterval(() => {
      this.processQueue().catch((err) =>
        console.error("[JobQueue] Worker error:", err)
      );
    }, intervalMs);
  }

  static stopWorker(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("[JobQueue] Worker stopped.");
    }
  }

  private static async processQueue(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      while (true) {
        // Atomic lock of the oldest pending job
        const job = await Job.findOneAndUpdate(
          { status: "pending" },
          { status: "processing", updatedAt: new Date() },
          { returnDocument: 'after', sort: { createdAt: 1 } }
        );

        if (!job) {
          break; // No more pending jobs to process
        }

        console.log(`[JobQueue] Processing job: ${job.type} (${job._id})`);

        try {
          await this.executeJob(job.type, job.data);

          job.status = "completed";
          await job.save();
          console.log(`[JobQueue] Job completed: ${job.type} (${job._id})`);
        } catch (error: any) {
          console.error(`[JobQueue] Job failed: ${job.type} (${job._id}). Error:`, error);

          job.attempts += 1;
          job.error = error.message || String(error);

          if (job.attempts >= job.maxAttempts) {
            job.status = "failed";
          } else {
            job.status = "pending"; // Requeue for next polling tick
          }

          await job.save();
        }
      }
    } finally {
      this.isRunning = false;
    }
  }

  private static async executeJob(type: string, data: any): Promise<void> {
    switch (type) {
      case "send_new_post_notification":
        await NotificationService.processNewPostNotification(data);
        break;
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  }
}
