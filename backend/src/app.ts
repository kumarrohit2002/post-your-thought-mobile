import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import { requestLogger } from "./middlewares/loggingMiddleware";

const app = express();

// Enable CORS
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Request logger
app.use(requestLogger);

// Bind authentication routes
app.use("/api/auth", authRoutes);

// Bind post routes
app.use("/api/posts", postRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Authentication Backend Server is running.",
  });
});

// Global Error Handler Middleware
app.use(errorMiddleware);

export default app;
