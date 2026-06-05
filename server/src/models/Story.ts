import mongoose, { Schema, Document, Types } from "mongoose";

export interface IStory extends Document {
  authorId: Types.ObjectId;
  mediaUrl: string;
  createdAt: Date;
}

const storySchema = new Schema<IStory>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mediaUrl: { type: String, required: true },
    // Mongoose TTL index: automatically deletes the document after 24 hours (86400 seconds)
    createdAt: { type: Date, default: Date.now, expires: 86400 }
  }
);

export default mongoose.model<IStory>("Story", storySchema);
