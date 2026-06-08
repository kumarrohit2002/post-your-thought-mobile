import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  userId: string;
  title: string;
  body: string;
  postId: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  postId: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
