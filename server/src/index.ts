import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { initSocket } from "./config/socket.js";

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());

// Initialize Socket.io
initSocket(server);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
// Nested routes for comments
app.use("/api/posts/:id/comments", commentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/stories", storyRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("Cactus API is running");
});

const PORT = process.env.PORT || 5000;

// Connect to DB and start server
const startServer = async () => {
    // Only connect if MONGO_URI is set, this is to prevent the app from crashing locally if the user hasn't set it yet
    if (process.env.MONGO_URI) {
        await connectDB();
    } else {
        console.warn("WARNING: MONGO_URI is not set. Database will not be connected.");
    }
  
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
