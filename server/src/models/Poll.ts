import mongoose, { Schema, Document } from "mongoose";

export interface IPollOption {
  text: string;
  votes: mongoose.Types.ObjectId[];
}

export interface IPoll extends Document {
  creatorId: mongoose.Types.ObjectId;
  question: string;
  options: IPollOption[];
  createdAt: Date;
}

const PollSchema: Schema = new Schema({
  creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  question: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
      votes: [{ type: Schema.Types.ObjectId, ref: "User" }]
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPoll>("Poll", PollSchema);
