import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import { errorMiddleware } from "./middlewares/errorMiddleware";

const app = express();

// Enable CORS
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Bind authentication routes
app.use("/api/auth", authRoutes);

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
