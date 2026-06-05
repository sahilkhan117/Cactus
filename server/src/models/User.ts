import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  department?: string;
  batch?: number;
  bio?: string;
  avatarUrl?: string;
  role: "student" | "moderator" | "admin";
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    department: { type: String },
    batch: { type: Number },
    bio: { type: String, maxlength: 160 },
    avatarUrl: { type: String },
    role: {
      type: String,
      enum: ["student", "moderator", "admin"],
      default: "student",
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
