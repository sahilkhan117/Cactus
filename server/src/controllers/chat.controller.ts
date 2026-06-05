import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user?.id,
    })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "fullName avatarUrl");

    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const cursor = req.query.cursor as string;

    const query: any = { conversationId: req.params.id };
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
