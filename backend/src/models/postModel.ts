import mongoose, { Document, Schema } from "mongoose";

export interface IComment {
  _id: mongoose.Types.ObjectId;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: Date;
}

export interface IPost extends Document {
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  image?: string;
  likesCount: number;
  likedBy: string[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userAvatar: { type: String, default: "" },
  text: { type: String, required: true, maxlength: 200 },
  createdAt: { type: Date, default: Date.now },
});

const PostSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userAvatar: { type: String, default: "" },
    content: { type: String, required: true, maxlength: 500 },
    image: { type: String, default: "" },
    likesCount: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] },
    comments: { type: [CommentSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// Add index to fetch latest posts first
PostSchema.index({ createdAt: -1 });

export const Post = mongoose.model<IPost>("Post", PostSchema);
