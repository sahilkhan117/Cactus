import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPost extends Document {
  authorId: Types.ObjectId;
  content: string;
  mediaUrls: string[];
  tags: string[];
  likeCount: number;
  commentCount: number;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true, maxlength: 1000 },
    mediaUrls: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    embedding: { type: [Number], required: false }
  },
  { timestamps: true }
);

// Index for cursor pagination
postSchema.index({ createdAt: -1 });

export default mongoose.model<IPost>("Post", postSchema);
