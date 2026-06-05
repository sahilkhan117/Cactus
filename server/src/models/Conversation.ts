import mongoose, { Schema, Document, Types } from "mongoose";

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  lastMessageAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true, index: true }],
    lastMessageAt: { type: Date, required: true, index: true },
  }
);

export default mongoose.model<IConversation>("Conversation", conversationSchema);
