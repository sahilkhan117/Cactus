import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import { io } from "../config/socket.js";

export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const cursor = req.query.cursor as string;
    
    const query: any = { postId: req.params.id };
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }
    
    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("authorId", "fullName avatarUrl role");
      
    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;
    
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
       return res.status(404).json({ message: "Post not found" });
    }
    
    const comment: any = await Comment.create({
      postId: postId as any,
      authorId: req.user?.id as any,
      content,
    });
    
    // Auto-increment commentCount on Post document
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    // Generate real-time notification alert if not commenting on own post
    if (post.authorId.toString() !== req.user?.id) {
      try {
        const notification = await Notification.create({
          recipientId: post.authorId as any,
          senderId: req.user?.id as any,
          type: "COMMENT",
          entityId: comment._id as any,
          isRead: false
        });

        // Populate sender info for frontend rendering
        const populated = await notification.populate("senderId", "fullName avatarUrl");

        if (io) {
          io.to(`user_${post.authorId}`).emit("new_notification", populated);
        }
      } catch (err: any) {
        console.error("Warning: Failed to create or broadcast COMMENT notification:", err.message);
      }
    }

    res.status(201).json(comment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
