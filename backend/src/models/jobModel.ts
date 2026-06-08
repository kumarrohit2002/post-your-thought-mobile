import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
  type: string;
  data: any;
  status: "pending" | "processing" | "completed" | "failed";
  attempts: number;
  maxAttempts: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    type: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    error: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Job = mongoose.model<IJob>("Job", JobSchema);
