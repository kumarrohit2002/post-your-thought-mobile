import app from "./app";
import { connectDB } from "./config/db";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Establish connection to local MongoDB
  await connectDB();

  // Listen on PORT
  app.listen(PORT, () => {
    console.log(`🚀 Authentication server running on port ${PORT}`);
  });
};

startServer();
