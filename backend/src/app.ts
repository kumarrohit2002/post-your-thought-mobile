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
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Status | Post Your Thought</title>
      <style>
        body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
        .container { text-align: center; background: rgba(255, 255, 255, 0.1); padding: 40px 60px; border-radius: 20px; backdrop-filter: blur(10px); box-shadow: 0 15px 35px rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.2); }
        h1 { margin-bottom: 10px; font-size: 2.5rem; letter-spacing: 1px; }
        p { font-size: 1.2rem; margin-bottom: 25px; opacity: 0.9; }
        .status { display: inline-block; padding: 10px 25px; border-radius: 30px; background: rgba(46, 213, 115, 0.2); color: #2ed573; border: 1px solid #2ed573; font-weight: bold; letter-spacing: 1px; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(46, 213, 115, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(46, 213, 115, 0); } 100% { box-shadow: 0 0 0 0 rgba(46, 213, 115, 0); } }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Deployment Successful!</h1>
        <p>Post Your Thought API is Live & Running</p>
        <div class="status">● ONLINE</div>
      </div>
    </body>
    </html>
  `);
});

// Global Error Handler Middleware
app.use(errorMiddleware);

export default app;
