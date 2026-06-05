import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user?.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("senderId", "fullName avatarUrl");

    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user?.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "Notifications marked as read" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
