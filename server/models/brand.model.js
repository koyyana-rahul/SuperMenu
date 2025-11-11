import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    logoUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const brandModel = mongoose.model("brand", brandSchema);

export default brandModel;
