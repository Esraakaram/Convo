import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    friends: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      default: [] 
    }],
    blocked: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      default: [] 
    }],
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
