import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import User from "../models/User.js";

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  try {
    const { bio, avatarUrl } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { bio, avatarUrl },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
