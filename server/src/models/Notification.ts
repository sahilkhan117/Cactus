import mongoose, { Schema, Document, Types } from "mongoose";

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  senderId: Types.ObjectId;
  type: "LIKE" | "COMMENT" | "MENTION" | "SYSTEM";
  entityId?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["LIKE", "COMMENT", "MENTION", "SYSTEM"], required: true },
    entityId: { type: Schema.Types.ObjectId }, // Flexible ref based on type
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }
);

export default mongoose.model<INotification>("Notification", notificationSchema);
