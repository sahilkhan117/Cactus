import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      // Attach user id to socket socket
      (socket as any).user = { id: decoded.id };
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).user?.id;
    console.log(`Socket connected: ${socket.id} (User: ${userId})`);
    
    if (userId) {
      // Join a personal room for receiving notifications and new conversation alerts
      socket.join(`user_${userId}`);
    }
    
    // Join a specific chat room
    socket.on("join_room", (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${userId} joined room ${conversationId}`);
    });

    // Send a message
    // { conversationId, receiverId, content }
    socket.on("send_message", async (data) => {
      try {
        const senderId = userId;
        const { receiverId, content } = data;
        let conversationId = data.conversationId;

        if (!content || (!conversationId && !receiverId)) {
          console.warn("Invalid send_message payload received:", data);
          return;
        }

        // 1. Resolve or create conversation
        if (!conversationId && receiverId) {
          // Check if conversation already exists between sender and receiver
          let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
          });

          if (!conversation) {
            conversation = await Conversation.create({
              participants: [senderId, receiverId],
              lastMessageAt: new Date()
            });
          }
          conversationId = conversation._id.toString();
          
          // Make the current sender join the room
          socket.join(conversationId);
          
          // Notify the receiver in their personal room to join the new conversation room
          io.to(`user_${receiverId}`).emit("new_conversation", {
            conversationId,
            senderId,
            lastMessageAt: conversation.lastMessageAt
          });
        }

        // 2. Persist message to database
        const message = await Message.create({
          conversationId,
          senderId,
          content,
          isRead: false,
          isInstant: data.isInstant || false,
          instantMediaUrl: data.instantMediaUrl || undefined,
          instantViewed: false
        });

        // 3. Update lastMessageAt on Conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessageAt: new Date()
        });

        // 4. Broadcast the saved message to the room
        io.to(conversationId).emit("receive_message", {
          _id: message._id,
          conversationId,
          senderId,
          content: message.content,
          isRead: message.isRead,
          isInstant: message.isInstant,
          instantMediaUrl: message.instantMediaUrl,
          instantViewed: message.instantViewed,
          createdAt: message.createdAt
        });

      } catch (error) {
        console.error("Error in socket send_message event:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // View an Instant message (self-destructing Snapdragon)
    socket.on("view_instant", async (data) => {
      try {
        const { messageId, conversationId } = data;
        const message = await Message.findById(messageId);
        if (message && message.isInstant && !message.instantViewed) {
          message.instantViewed = true;
          message.instantMediaUrl = ""; // Security wipe
          await message.save();

          // Broadcast to conversation room
          io.to(conversationId).emit("instant_viewed", {
            messageId,
            conversationId
          });
        }
      } catch (error) {
        console.error("Error in socket view_instant event:", error);
      }
    });

    socket.on("typing_start", (conversationId) => {
      socket.to(conversationId).emit("typing_indicator", userId);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

