import mongoose from "mongoose"
import { User } from "../types/graphql";

const defaultPicture = "https://fifadashboard.s3.amazonaws.com/profile/default-person.png";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    min: 8,
    max: 32,
  },
  role: {
    type: String,
    required: true,
    default: "user",
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: false,
  },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
  picture: {
    type: String,
    required: true,
    default: defaultPicture,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  }
});

export default mongoose.model<User>("UserModel", userSchema);
