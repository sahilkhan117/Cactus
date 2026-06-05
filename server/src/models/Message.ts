import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  isRead: boolean;
  isInstant?: boolean;
  instantViewed?: boolean;
  instantMediaUrl?: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    isInstant: { type: Boolean, default: false },
    instantViewed: { type: Boolean, default: false },
    instantMediaUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
  }
);

export default mongoose.model<IMessage>("Message", messageSchema);
