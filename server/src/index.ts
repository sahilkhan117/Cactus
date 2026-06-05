import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { initSocket } from "./config/socket.js";

// Load environment variables FIRST before anything else
dotenv.config();

const app = express();
const server = http.createServer(app);

// ─────────────────────────────────────────────────────────────
// CORS must be the VERY FIRST middleware — before express.json,
// before routes, before Socket.io — so that browser OPTIONS
// preflight requests receive correct Access-Control headers.
// ─────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",          // Vite dev server
  "http://localhost:4173",          // Vite preview server
  "https://cactus-green.vercel.app", // Production frontend
  process.env.CLIENT_URL,           // Override via Render env var
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Explicitly respond 200 to all OPTIONS preflight requests
app.options("/{*path}", cors()); // Express 5: wildcard must be named

// Body parsers (after CORS, before routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.io (after CORS so HTTP upgrade inherits headers)
initSocket(server);

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import searchRoutes from "./routes/search.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import storyRoutes from "./routes/story.routes.js";

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts/:id/comments", commentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/stories", storyRoutes);

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Cactus API is running 🌵" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (process.env.MONGO_URI) {
    await connectDB();
  } else {
    console.warn("⚠️  MONGO_URI not set — database will not connect.");
  }
  server.listen(PORT, () => {
    console.log(`🌵 Server running on port ${PORT}`);
    console.log(`   Allowed origins: ${allowedOrigins.join(", ")}`);
  });
};

startServer();
