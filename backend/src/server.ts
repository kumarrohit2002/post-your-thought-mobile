import app from "./app";
import { connectDB } from "./config/db";
import dotenv from "dotenv";
import { JobQueue } from "./services/jobQueue";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Establish connection to local MongoDB
  await connectDB();

  // Start background job queue worker
  JobQueue.startWorker();

  // Listen on PORT
  app.listen(PORT, () => {
    console.log(`🚀 Authentication server running on port ${PORT}`);
  });
};

startServer();
