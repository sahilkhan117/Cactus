import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import Post from "../models/Post.js";
import { getEmbedding } from "../services/embedding.js";
import Notification from "../models/Notification.js";
import { io } from "../config/socket.js";

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { content, mediaUrls, tags } = req.body;
    
    let embedding: number[] | undefined = undefined;
    
    // Fail-safe embedding generation so post creation doesn't crash if Gemini is offline
    if (process.env.GEMINI_API_KEY) {
      try {
        embedding = await getEmbedding(content);
      } catch (err: any) {
        console.error("Warning: Failed to generate post embedding:", err.message);
      }
    } else {
      console.warn("Warning: GEMINI_API_KEY is not set. Skipping embedding generation.");
    }
    
    const post = await Post.create({
      authorId: req.user?.id,
      content,
      mediaUrls,
      tags,
      embedding
    });

    res.status(201).json(post);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPosts = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const cursor = req.query.cursor as string;
    
    const query = cursor ? { createdAt: { $lt: new Date(cursor) } } : {};
    
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("authorId", "fullName avatarUrl role");
      
    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostById = async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id).populate("authorId", "fullName avatarUrl role");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Check permission
    if (post.authorId.toString() !== req.user?.id && req.user?.role !== "admin") {
       return res.status(403).json({ message: "Not authorized to delete this post" });
    }
    
    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
     const post = await Post.findByIdAndUpdate(req.params.id, {
        $inc: { likeCount: 1 }
     }, { new: true });
     
     if (!post) {
       return res.status(404).json({ message: "Post not found" });
     }
     
     // Create a real-time notification alert if not liking own post
     if (post.authorId.toString() !== req.user?.id) {
       try {
         const notification = await Notification.create({
           recipientId: post.authorId,
           senderId: req.user?.id,
           type: "LIKE",
           entityId: post._id,
           isRead: false
         });
         
         // Populate sender info for frontend rendering
         const populated = await notification.populate("senderId", "fullName avatarUrl");
         
         if (io) {
           io.to(`user_${post.authorId}`).emit("new_notification", populated);
         }
       } catch (err: any) {
         console.error("Warning: Failed to create or broadcast LIKE notification:", err.message);
       }
     }
     
     res.json(post);
  } catch (error: any) {
     res.status(500).json({ message: error.message });
  }
};
