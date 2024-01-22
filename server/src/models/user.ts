import { compare, hash } from "bcrypt";
import mongoose, { Model, ObjectId, Schema, model } from "mongoose";

//interface (TS)
interface UserDocument {
  name: string;
  email: string;
  password: string;
  verified?: boolean;
  active?: boolean;
  avatar?: { url: string; publicId: string };
  tokens: string[];
  favorites: ObjectId[];
  followers: ObjectId[];
  followings: ObjectId[];
}

interface Methods {
  comparePassword(token: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument, {}, Methods>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: Object,
      url: String,
      publicId: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
    },
    favorites: [{ type: mongoose.Types.ObjectId, ref: "Audio" }],
    followers: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    followings: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    tokens: [String],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  //Hash token
  if (this.isModified("password")) {
    this.password = await hash(this.password, 10);
  }

  next();
});

userSchema.methods.comparePassword = async function (password) {
  const result = await compare(password, this.password);
  return result;
};

export default model("User", userSchema) as Model<UserDocument, {}, Methods>;