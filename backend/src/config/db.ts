import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongodbUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/auth_db";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongodbUri);
    console.log("✅ Connected to MongoDB successfully.");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};
