import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import Poll from "../models/Poll.js";

export const createPoll = async (req: AuthRequest, res: Response) => {
  try {
    const { question, options } = req.body;
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: "A question and at least 2 options are required." });
    }

    const poll = await Poll.create({
      creatorId: req.user?.id,
      question,
      options: options.map(opt => ({ text: opt, votes: [] }))
    });

    res.status(201).json(poll);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPolls = async (req: AuthRequest, res: Response) => {
  try {
    const polls = await Poll.find()
      .sort({ createdAt: -1 })
      .populate("creatorId", "fullName avatarUrl");
    res.json(polls);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const votePoll = async (req: AuthRequest, res: Response) => {
  try {
    const { optionIndex } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    if (optionIndex === undefined || typeof optionIndex !== "number") {
      return res.status(400).json({ message: "Option index is required." });
    }

    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found." });
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: "Invalid option index." });
    }

    // Remove user's vote from ALL options first (to allow changing vote)
    poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(v => v.toString() !== userId);
    });

    const option = poll.options[optionIndex];
    if (!option) {
      return res.status(400).json({ message: "Invalid option index." });
    }
    option.votes.push(userId as any);

    await poll.save();

    const updatedPoll = await Poll.findById(poll._id).populate("creatorId", "fullName avatarUrl");

    res.json(updatedPoll);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
