import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  uid: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  uid: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phoneNumber: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>("User", UserSchema);
