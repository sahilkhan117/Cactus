import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id: string, role: string) => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
  };
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, options);
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      passwordHash,
      fullName,
    });

    res.status(201).json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      token: generateToken(user._id.toString(), user.role),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        token: generateToken(user._id.toString(), user.role),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verify = async (req: Request, res: Response) => {
  try {
    // This route will be protected by requireAuth, so req.user will be populated
    res.status(200).json({ valid: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
