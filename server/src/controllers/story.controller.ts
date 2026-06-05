import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import Story from "../models/Story.js";

export const createStory = async (req: AuthRequest, res: Response) => {
  try {
    const { mediaUrl } = req.body;
    if (!mediaUrl) {
      return res.status(400).json({ message: "Media URL is required for a story" });
    }

    const story = await Story.create({
      authorId: req.user?.id,
      mediaUrl
    });

    const populatedStory = await story.populate("authorId", "fullName avatarUrl role");

    res.status(201).json(populatedStory);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStories = async (req: AuthRequest, res: Response) => {
  try {
    // Stories are automatically expired by MongoDB TTL after 24h,
    // so we can just grab all documents in the collection!
    const stories = await Story.find()
      .sort({ createdAt: -1 })
      .populate("authorId", "fullName avatarUrl role");

    res.json(stories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
